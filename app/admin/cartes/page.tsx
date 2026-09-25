"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/api";
import {
  getStatsCartes,
  listerCartes,
  listerLots,
  telechargerExportCsv,
  type CarteFahimta,
  type EtatCarte,
  type LotCartes,
  type StatsCartes,
} from "@/lib/carteApi";
import { listerVendeurs, type Vendeur } from "@/lib/vendeurApi";
import StatCard from "@/components/admin/StatCard";
import Toast from "@/components/admin/Toast";
import GenererLotModal from "@/components/admin/cartes/GenererLotModal";
import LotRow from "@/components/admin/cartes/LotRow";
import CarteRow from "@/components/admin/cartes/CarteRow";

type Vue = "lots" | "liste";

// Vocabulaire de suivi admin (voir comptes.cartes, respecté partout) — ces
// boutons remplacent l'ancien filtre `statut` (2 valeurs, moins précis :
// active/utilisee ne distinguait pas stock central/assignée/vendue).
const FILTRES_ETAT: readonly { value: EtatCarte | ""; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "stock_central", label: "Stock central" },
  { value: "assignee", label: "Assignées" },
  { value: "vendue", label: "Vendues" },
  { value: "utilisee", label: "Utilisées" },
];

/**
 * Page "Cartes" du back-office custom : générer des lots de cartes Fahimta
 * et suivre leur consommation, sans passer par l'admin Django (toujours
 * disponible en parallèle, voir comptes/admin.py — les deux s'appuient sur
 * la MÊME API/logique, jamais de double implémentation).
 *
 * Deux vues (onglets) plutôt que deux pages séparées : "Lots" pour le suivi
 * synthétique (combien de cartes consommées par lot), "Liste" pour chercher/
 * filtrer des cartes individuelles — cliquer "Voir le détail" sur un lot
 * bascule vers Liste avec ce lot déjà sélectionné en filtre.
 */
export default function CartesPage() {
  const [vue, setVue] = useState<Vue>("lots");
  const [refreshCle, setRefreshCle] = useState(0);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);
  const [modaleGeneration, setModaleGeneration] = useState(false);

  // --- En-tête : stats globales par état (voir vocabulaire ETAT_*) ---
  const [stats, setStats] = useState<StatsCartes | null>(null);

  useEffect(() => {
    let actif = true;
    getStatsCartes()
      .then((data) => {
        if (actif) setStats(data);
      })
      .catch(() => {
        // Best-effort : un échec ici n'empêche pas le reste de la page de
        // fonctionner, les cartes StatCard restent juste vides ("—").
      });
    return () => {
      actif = false;
    };
  }, [refreshCle]);

  // Vendeurs, pour le filtre de la vue "Liste" — chargés une seule fois
  // (pas de refreshCle : la liste des vendeurs ne change pas au fil des
  // générations/activations de cartes).
  const [vendeurs, setVendeurs] = useState<Vendeur[]>([]);

  useEffect(() => {
    let actif = true;
    listerVendeurs()
      .then((data) => {
        if (actif) setVendeurs(data.results);
      })
      .catch(() => {
        // Best-effort : le filtre vendeur reste juste vide si l'appel échoue.
      });
    return () => {
      actif = false;
    };
  }, []);

  // --- Vue "Lots" ---
  const [lots, setLots] = useState<LotCartes[] | null>(null);
  const [chargementLots, setChargementLots] = useState(true);
  const [erreurLots, setErreurLots] = useState<string | null>(null);
  const [lotExportEnCours, setLotExportEnCours] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargementLots(true);
      setErreurLots(null);
      try {
        const data = await listerLots();
        if (actif) setLots(data);
      } catch (error) {
        if (actif) {
          setErreurLots(error instanceof ApiError ? error.message : "Impossible de charger les lots.");
        }
      } finally {
        if (actif) setChargementLots(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [refreshCle]);

  // --- Vue "Liste" ---
  const [etatFiltre, setEtatFiltre] = useState<EtatCarte | "">("");
  const [vendeurFiltre, setVendeurFiltre] = useState<number | "">("");
  const [lotFiltre, setLotFiltre] = useState("");
  const [dureeFiltre, setDureeFiltre] = useState("");
  const [rechercheSaisie, setRechercheSaisie] = useState("");
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<{ count: number; next: string | null; previous: string | null; results: CarteFahimta[] } | null>(null);
  const [chargementListe, setChargementListe] = useState(true);
  const [erreurListe, setErreurListe] = useState<string | null>(null);

  useEffect(() => {
    if (vue !== "liste") return;
    let actif = true;

    async function charger() {
      setChargementListe(true);
      setErreurListe(null);
      try {
        const resultat = await listerCartes({
          etat: etatFiltre || undefined,
          vendeur: vendeurFiltre || undefined,
          lot: lotFiltre || undefined,
          duree_jours: dureeFiltre ? Number(dureeFiltre) : undefined,
          search: recherche || undefined,
          page,
        });
        if (actif) setData(resultat);
      } catch (error) {
        if (actif) {
          setErreurListe(error instanceof ApiError ? error.message : "Impossible de charger les cartes.");
        }
      } finally {
        if (actif) setChargementListe(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [vue, etatFiltre, vendeurFiltre, lotFiltre, dureeFiltre, recherche, page, refreshCle]);

  function reinitialiserPage() {
    setPage(1);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    reinitialiserPage();
    setRecherche(rechercheSaisie.trim());
  }

  const voirDetailLot = useCallback((lot: string) => {
    setLotFiltre(lot);
    setEtatFiltre("");
    setVendeurFiltre("");
    setDureeFiltre("");
    setPage(1);
    setVue("liste");
  }, []);

  async function exporterLot(lot: string) {
    setLotExportEnCours(lot);
    try {
      await telechargerExportCsv(lot);
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Export impossible.", tone: "erreur" });
    } finally {
      setLotExportEnCours(null);
    }
  }

  async function exporterTout() {
    try {
      await telechargerExportCsv(lotFiltre || undefined);
      setToast({ message: "Export CSV lancé.", tone: "succes" });
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Export impossible.", tone: "erreur" });
    }
  }

  function handleGenere() {
    setRefreshCle((c) => c + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fh-bleu">Cartes Fahimta</h2>
          <p className="text-sm text-fh-ardoise">
            Génère des lots de cartes prépayées et suis leur activation par les élèves.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModaleGeneration(true)}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          + Générer un lot
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Total" value={stats ? String(stats.total) : "—"} />
        <StatCard label="Stock central" value={stats ? String(stats.stock_central) : "—"} />
        <StatCard label="Assignées" value={stats ? String(stats.assignee) : "—"} />
        <StatCard label="Vendues" value={stats ? String(stats.vendue) : "—"} />
        <StatCard label="Utilisées" value={stats ? String(stats.utilisee) : "—"} />
      </div>

      <div className="flex gap-2 border-b border-fh-sable">
        <button
          type="button"
          onClick={() => setVue("lots")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            vue === "lots"
              ? "border-b-2 border-fh-orange text-fh-orange-fonce"
              : "text-fh-ardoise hover:text-fh-bleu"
          }`}
        >
          Par lots
        </button>
        <button
          type="button"
          onClick={() => setVue("liste")}
          className={`px-4 py-2 text-sm font-semibold transition-colors ${
            vue === "liste"
              ? "border-b-2 border-fh-orange text-fh-orange-fonce"
              : "text-fh-ardoise hover:text-fh-bleu"
          }`}
        >
          Liste des cartes
        </button>
      </div>

      {vue === "lots" ? (
        chargementLots ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des lots">
            {[0, 1, 2].map((cle) => (
              <div key={cle} className="h-20 animate-pulse rounded-2xl bg-fh-sable/50" />
            ))}
          </div>
        ) : erreurLots ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreurLots}</p>
        ) : !lots || lots.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
            <span className="text-3xl" aria-hidden="true">
              💳
            </span>
            <p className="text-sm text-fh-ardoise">Aucun lot généré pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lots.map((lot) => (
              <LotRow
                key={lot.lot}
                lot={lot}
                onVoir={voirDetailLot}
                onExporter={exporterLot}
                exportEnCours={lotExportEnCours === lot.lot}
              />
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTRES_ETAT.map((filtre) => (
              <button
                key={filtre.value || "toutes"}
                type="button"
                onClick={() => {
                  setEtatFiltre(filtre.value);
                  reinitialiserPage();
                }}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  etatFiltre === filtre.value
                    ? "bg-fh-orange text-white"
                    : "border border-fh-bleu/20 text-fh-bleu hover:bg-fh-sable/60"
                }`}
              >
                {filtre.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={vendeurFiltre}
              onChange={(event) => {
                setVendeurFiltre(event.target.value ? Number(event.target.value) : "");
                reinitialiserPage();
              }}
              className="rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            >
              <option value="">Tous les vendeurs</option>
              {vendeurs.map((vendeur) => (
                <option key={vendeur.id} value={vendeur.id}>
                  {vendeur.prenom} {vendeur.nom}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={lotFiltre}
              onChange={(event) => {
                setLotFiltre(event.target.value);
                reinitialiserPage();
              }}
              placeholder="Filtrer par lot"
              className="w-40 rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            />

            <input
              type="number"
              min={1}
              value={dureeFiltre}
              onChange={(event) => {
                setDureeFiltre(event.target.value);
                reinitialiserPage();
              }}
              placeholder="Durée (j)"
              className="w-28 rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
            />

            <form onSubmit={handleSearchSubmit} className="flex min-w-[220px] flex-1 gap-2">
              <input
                type="search"
                placeholder="Rechercher par code"
                value={rechercheSaisie}
                onChange={(event) => setRechercheSaisie(event.target.value)}
                className="w-full min-w-[160px] rounded-lg border border-fh-bleu-vif/20 bg-white px-4 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
              >
                Rechercher
              </button>
            </form>

            <button
              type="button"
              onClick={exporterTout}
              className="shrink-0 rounded-lg border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
            >
              Exporter CSV{lotFiltre ? ` (${lotFiltre})` : ""}
            </button>
          </div>

          {chargementListe ? (
            <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des cartes">
              {[0, 1, 2].map((cle) => (
                <div key={cle} className="h-16 animate-pulse rounded-2xl bg-fh-sable/50" />
              ))}
            </div>
          ) : erreurListe ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreurListe}</p>
          ) : !data || data.results.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
              <span className="text-3xl" aria-hidden="true">
                🔍
              </span>
              <p className="text-sm text-fh-ardoise">Aucune carte ne correspond à ces filtres.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.results.map((carte) => (
                <CarteRow key={carte.id} carte={carte} />
              ))}
            </div>
          )}

          {data && (data.next || data.previous) && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={!data.previous}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu disabled:cursor-not-allowed disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-sm text-fh-ardoise">{data.count} carte(s)</span>
              <button
                type="button"
                disabled={!data.next}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {modaleGeneration && (
        <GenererLotModal onClose={() => setModaleGeneration(false)} onGenere={handleGenere} />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
