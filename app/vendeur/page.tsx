"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/lib/api";
import {
  getMoiVendeur,
  listerMesCartes,
  type CarteVendeur,
  type EtatCarteVendeur,
  type MoiVendeur,
} from "@/lib/vendeurEspaceApi";
import StatCard from "@/components/admin/StatCard";
import CarteVendeurRow from "@/components/vendeur/CarteVendeurRow";
import VendreCarteModal from "@/components/vendeur/VendreCarteModal";

interface ReponsePagineeCartes {
  count: number;
  next: string | null;
  previous: string | null;
  results: CarteVendeur[];
}

/**
 * Dashboard vendeur : compteurs (voir /api/vendeur/moi/) + bouton "Vendre
 * une carte" (transfert à un élève, voir VendreCarteModal) + la liste
 * complète de SES cartes (disponibles/vendues/activées), filtrable par état.
 * Les compteurs des boutons de filtre viennent de `moi` (même source que les
 * StatCard du haut) : jamais recalculés depuis la liste elle-même, pour
 * rester cohérents même si la page courante n'affiche qu'un sous-ensemble.
 *
 * `!moi` (pas seulement chargementMoi) dans la garde ci-dessous : même motif
 * qu'app/admin/vendeurs/[id]/page.tsx — un rafraîchissement silencieux après
 * une vente ne doit jamais démonter toute la page (et donc la modale
 * ouverte par-dessus). La liste des cartes, elle, n'a pas besoin de ce
 * garde : sa propre recharge ne démonte jamais la modale, qui vit à côté
 * d'elle dans l'arbre, pas au-dessus.
 */
export default function VendeurDashboardPage() {
  const [moi, setMoi] = useState<MoiVendeur | null>(null);
  const [chargementMoi, setChargementMoi] = useState(true);
  const [erreurMoi, setErreurMoi] = useState<string | null>(null);

  const [dataCartes, setDataCartes] = useState<ReponsePagineeCartes | null>(null);
  const [chargementCartes, setChargementCartes] = useState(true);
  const [erreurCartes, setErreurCartes] = useState<string | null>(null);

  const [etatFiltre, setEtatFiltre] = useState<EtatCarteVendeur | "">("");
  const [page, setPage] = useState(1);
  const [refreshCle, setRefreshCle] = useState(0);
  const [modaleVente, setModaleVente] = useState(false);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargementMoi(true);
      setErreurMoi(null);
      try {
        const data = await getMoiVendeur();
        if (actif) setMoi(data);
      } catch (error) {
        if (actif) {
          setErreurMoi(error instanceof ApiError ? error.message : "Impossible de charger ton profil.");
        }
      } finally {
        if (actif) setChargementMoi(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [refreshCle]);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargementCartes(true);
      setErreurCartes(null);
      try {
        const data = await listerMesCartes({ etat: etatFiltre || undefined, page });
        if (actif) setDataCartes(data);
      } catch (error) {
        if (actif) {
          setErreurCartes(error instanceof ApiError ? error.message : "Impossible de charger tes cartes.");
        }
      } finally {
        if (actif) setChargementCartes(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [refreshCle, etatFiltre, page]);

  function handleVendue() {
    setPage(1);
    setRefreshCle((c) => c + 1);
  }

  function choisirFiltre(etat: EtatCarteVendeur | "") {
    setEtatFiltre(etat);
    setPage(1);
  }

  if (chargementMoi && !moi) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement">
        <div className="h-24 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-24 animate-pulse rounded-2xl bg-fh-sable/50" />
      </div>
    );
  }

  if (erreurMoi || !moi) {
    return <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreurMoi ?? "Profil introuvable."}</p>;
  }

  const peutVendre = moi.cartes_disponibles > 0;
  const totalCartes = moi.cartes_disponibles + moi.cartes_distribuees + moi.cartes_activees;

  const filtres: { value: EtatCarteVendeur | ""; label: string; total: number }[] = [
    { value: "", label: "Toutes", total: totalCartes },
    { value: "disponible", label: "Disponible", total: moi.cartes_disponibles },
    { value: "distribuee", label: "Vendue — à activer", total: moi.cartes_distribuees },
    { value: "activee", label: "Activée", total: moi.cartes_activees },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-fh-bleu">
            Bonjour {moi.prenom} {moi.nom}
          </h1>
          <p className="text-sm text-fh-ardoise">{moi.telephone}</p>
        </div>
        <button
          type="button"
          onClick={() => setModaleVente(true)}
          disabled={!peutVendre}
          title={peutVendre ? undefined : "Aucune carte disponible pour l'instant."}
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Vendre une carte
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Disponibles" value={String(moi.cartes_disponibles)} />
        <StatCard label="À activer" value={String(moi.cartes_distribuees)} />
        <StatCard label="Activées" value={String(moi.cartes_activees)} />
        <StatCard label="Commission" value={`${moi.commission_fcfa.toLocaleString("fr-FR")} FCFA/carte`} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-fh-bleu">Mes cartes</h2>

        <div className="flex flex-wrap gap-2">
          {filtres.map((filtre) => (
            <button
              key={filtre.value || "toutes"}
              type="button"
              onClick={() => choisirFiltre(filtre.value)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                etatFiltre === filtre.value
                  ? "bg-fh-orange text-white"
                  : "border border-fh-bleu/20 text-fh-bleu hover:bg-fh-sable/60"
              }`}
            >
              {filtre.label} ({filtre.total})
            </button>
          ))}
        </div>

        {chargementCartes ? (
          <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des cartes">
            {[0, 1, 2].map((cle) => (
              <div key={cle} className="h-16 animate-pulse rounded-2xl bg-fh-sable/50" />
            ))}
          </div>
        ) : erreurCartes ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreurCartes}</p>
        ) : !dataCartes || dataCartes.results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
            <span className="text-3xl" aria-hidden="true">
              🧾
            </span>
            <p className="text-sm text-fh-ardoise">Aucune carte pour ce filtre.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dataCartes.results.map((carte) => (
              <CarteVendeurRow key={carte.id} carte={carte} />
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

      {modaleVente && (
        <VendreCarteModal
          commissionFcfa={moi.commission_fcfa}
          onClose={() => setModaleVente(false)}
          onVendue={handleVendue}
        />
      )}
    </div>
  );
}
