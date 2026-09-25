"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { ApiError } from "@/lib/api";
import { listerCartes, type CarteFahimta, type EtatCarte } from "@/lib/carteApi";
import { getVendeur, type Vendeur } from "@/lib/vendeurApi";
import StatCard from "@/components/admin/StatCard";
import CarteRow from "@/components/admin/cartes/CarteRow";
import AssignerCartesModal from "@/components/admin/vendeurs/AssignerCartesModal";

const FILTRES_ETAT: readonly { value: EtatCarte | ""; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "assignee", label: "Disponibles" },
  { value: "vendue", label: "Vendues" },
  { value: "utilisee", label: "Activées" },
];

interface ReponsePagineeCartes {
  count: number;
  next: string | null;
  previous: string | null;
  results: CarteFahimta[];
}

/**
 * Détail d'un vendeur : ses compteurs + la liste de SES cartes, réutilisant
 * telle quelle CarteRow (l'aperçu "carte à gratter", voir components/admin/
 * cartes/CarteRow.tsx) via GET /api/admin/cartes/?vendeur=<id> — jamais de
 * code en clair pour une carte encore active, même ici (le back-office ne
 * connaît le code en clair qu'au moment de générer pour le stock central).
 */
export default function VendeurDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const vendeurId = Number(params.id);

  const [vendeur, setVendeur] = useState<Vendeur | null>(null);
  const [chargementVendeur, setChargementVendeur] = useState(true);
  const [erreurVendeur, setErreurVendeur] = useState<string | null>(null);
  const [refreshCle, setRefreshCle] = useState(0);

  const [dataCartes, setDataCartes] = useState<ReponsePagineeCartes | null>(null);
  const [chargementCartes, setChargementCartes] = useState(true);
  const [erreurCartes, setErreurCartes] = useState<string | null>(null);
  const [etatFiltre, setEtatFiltre] = useState<EtatCarte | "">("");
  const [page, setPage] = useState(1);

  const [modaleAssignation, setModaleAssignation] = useState(false);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargementVendeur(true);
      setErreurVendeur(null);
      try {
        const data = await getVendeur(vendeurId);
        if (actif) setVendeur(data);
      } catch (error) {
        if (actif) {
          setErreurVendeur(
            error instanceof ApiError && error.status === 404
              ? "Vendeur introuvable."
              : "Impossible de charger ce vendeur."
          );
        }
      } finally {
        if (actif) setChargementVendeur(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [vendeurId, refreshCle]);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargementCartes(true);
      setErreurCartes(null);
      try {
        const data = await listerCartes({ vendeur: vendeurId, etat: etatFiltre || undefined, page });
        if (actif) setDataCartes(data);
      } catch (error) {
        if (actif) {
          setErreurCartes(error instanceof ApiError ? error.message : "Impossible de charger les cartes.");
        }
      } finally {
        if (actif) setChargementCartes(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [vendeurId, etatFiltre, page, refreshCle]);

  function choisirFiltreEtat(etat: EtatCarte | "") {
    setEtatFiltre(etat);
    setPage(1);
  }

  function handleAssigne() {
    setPage(1);
    setRefreshCle((c) => c + 1);
  }

  // `!vendeur` (pas seulement `chargementVendeur`) : le rafraîchissement
  // silencieux déclenché après une assignation (voir handleAssigne) repasse
  // chargementVendeur à true SANS jamais vider `vendeur` — sans ce garde
  // supplémentaire, la page entière (donc la modale d'assignation ouverte
  // par-dessus) serait démontée puis remontée à chaque assignation
  // réussie, réinitialisant la modale à son état initial ("choix") et
  // faisant disparaître l'écran de résultat juste affiché à l'admin.
  if (chargementVendeur && !vendeur) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement du vendeur">
        <div className="h-16 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-24 animate-pulse rounded-2xl bg-fh-sable/50" />
      </div>
    );
  }

  if (erreurVendeur || !vendeur) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/vendeurs")}
          className="self-start text-sm font-medium text-fh-bleu hover:underline"
        >
          ← Retour aux vendeurs
        </button>
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreurVendeur ?? "Vendeur introuvable."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => router.push("/admin/vendeurs")}
        className="self-start text-sm font-medium text-fh-bleu hover:underline"
      >
        ← Retour aux vendeurs
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-fh-bleu">
            {vendeur.prenom} {vendeur.nom}
          </h2>
          <p className="text-sm text-fh-ardoise">
            {vendeur.telephone} · Commission {vendeur.commission_fcfa.toLocaleString("fr-FR")} FCFA/carte
          </p>
          {(vendeur.ville || vendeur.quartier || vendeur.ecole_ou_point_vente) && (
            <p className="text-sm text-fh-ardoise">
              {[vendeur.ville, vendeur.quartier, vendeur.ecole_ou_point_vente].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setModaleAssignation(true)}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          + Assigner des cartes
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Assignées (total)" value={String(vendeur.cartes_assignees)} />
        <StatCard label="Disponibles" value={String(vendeur.cartes_disponibles)} />
        <StatCard label="Vendues" value={String(vendeur.cartes_vendues)} />
        <StatCard label="Activées" value={String(vendeur.cartes_activees)} />
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-base font-bold text-fh-bleu">Ses cartes</h3>

        <div className="flex flex-wrap gap-2">
          {FILTRES_ETAT.map((filtre) => (
            <button
              key={filtre.value || "toutes"}
              type="button"
              onClick={() => choisirFiltreEtat(filtre.value)}
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

        {chargementCartes ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des cartes">
            {[0, 1].map((cle) => (
              <div key={cle} className="h-28 animate-pulse rounded-2xl bg-fh-sable/50" />
            ))}
          </div>
        ) : erreurCartes ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreurCartes}</p>
        ) : !dataCartes || dataCartes.results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
            <span className="text-3xl" aria-hidden="true">
              💳
            </span>
            <p className="text-sm text-fh-ardoise">Aucune carte assignée à ce vendeur pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dataCartes.results.map((carte) => (
              <CarteRow key={carte.id} carte={carte} />
            ))}
          </div>
        )}

        {dataCartes && (dataCartes.next || dataCartes.previous) && (
          <div className="flex items-center justify-between">
            <button
              type="button"
              disabled={!dataCartes.previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu disabled:cursor-not-allowed disabled:opacity-40"
            >
              Précédent
            </button>
            <span className="text-sm text-fh-ardoise">{dataCartes.count} carte(s)</span>
            <button
              type="button"
              disabled={!dataCartes.next}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {modaleAssignation && (
        <AssignerCartesModal
          vendeur={vendeur}
          onClose={() => setModaleAssignation(false)}
          onAssigne={handleAssigne}
        />
      )}
    </div>
  );
}
