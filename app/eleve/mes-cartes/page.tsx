"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getMesCartes, type CarteRecueEleve } from "@/lib/eleveApi";
import CarteRecueRow from "@/components/eleve/CarteRecueRow";
import RappelAbonnement from "@/components/eleve/RappelAbonnement";

type Onglet = "a_activer" | "activees";

/**
 * Cartes qu'un vendeur a envoyées à l'élève connecté, ET/OU celles qu'il a
 * déjà activées (voir comptes.views.MesCartesEleveView côté backend) —
 * design carte à gratter AVEC le code en clair (voir CarteRecueRow : c'est
 * légitime, c'est SA carte).
 *
 * L'encart d'abonnement en haut (RappelAbonnement) est LA vraie info de
 * validité — le statut d'une carte individuelle ("à activer"/"activée") ne
 * dit rien de l'échéance réelle une fois plusieurs cartes activées au fil
 * du temps.
 */
export default function MesCartesPage() {
  const { user } = useAuth();

  const [cartes, setCartes] = useState<CarteRecueEleve[] | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  // null = pas encore choisi par l'élève : l'onglet par défaut se déduit
  // alors des données (voir `onglet` plus bas) plutôt que d'être figé avant
  // même que les cartes soient chargées.
  const [ongletChoisi, setOngletChoisi] = useState<Onglet | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const data = await getMesCartes();
        if (actif) setCartes(data);
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger tes cartes.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, []);

  const aActiver = cartes?.filter((c) => c.statut === "active") ?? [];
  const activees = cartes?.filter((c) => c.statut === "utilisee") ?? [];

  // Onglet par défaut : "À activer" s'il y a des cartes à activer, sinon
  // "Activées" — mais un choix explicite de l'élève (clic sur un onglet)
  // reste toujours prioritaire, même si les compteurs changent ensuite.
  const onglet: Onglet = ongletChoisi ?? (aActiver.length > 0 ? "a_activer" : "activees");

  const listeAffichee = onglet === "a_activer" ? aActiver : activees;

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-6 px-4 py-10 sm:px-0">
      <div>
        <h1 className="text-xl font-bold text-fh-bleu">Mes cartes</h1>
        <p className="mt-1 text-sm text-fh-ardoise">
          Les cartes Fahimta reçues d&apos;un vendeur ou déjà activées.
        </p>
      </div>

      <RappelAbonnement actif={user?.aUnAbonnementActif ?? false} echeance={user?.abonnementActifJusquAu ?? null} />

      {chargement ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Chargement des cartes">
          {[0, 1].map((cle) => (
            <div key={cle} className="h-40 animate-pulse rounded-2xl bg-fh-sable/50" />
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erreur}</p>
      ) : !cartes || cartes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-12 text-center ring-1 ring-fh-sable">
          <span className="text-3xl" aria-hidden="true">
            💳
          </span>
          <p className="text-sm text-fh-ardoise">
            Aucune carte pour l&apos;instant. Procure-toi une carte Fahimta auprès d&apos;un vendeur.
          </p>
          <Link
            href="/eleve/abonnement"
            className="text-sm font-medium text-fh-orange hover:text-fh-orange-fonce"
          >
            J&apos;ai déjà un code ? Active-le ici →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-2 border-b border-fh-sable">
            <button
              type="button"
              onClick={() => setOngletChoisi("a_activer")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                onglet === "a_activer"
                  ? "border-b-2 border-fh-orange text-fh-orange-fonce"
                  : "text-fh-ardoise hover:text-fh-bleu"
              }`}
            >
              À activer ({aActiver.length})
            </button>
            <button
              type="button"
              onClick={() => setOngletChoisi("activees")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                onglet === "activees"
                  ? "border-b-2 border-fh-orange text-fh-orange-fonce"
                  : "text-fh-ardoise hover:text-fh-bleu"
              }`}
            >
              Activées ({activees.length})
            </button>
          </div>

          {listeAffichee.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl bg-white py-10 text-center ring-1 ring-fh-sable">
              <p className="text-sm text-fh-ardoise">
                {onglet === "a_activer" ? "Aucune carte à activer." : "Aucune carte activée pour l'instant."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {listeAffichee.map((carte) => (
                <CarteRecueRow key={carte.id} carte={carte} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
