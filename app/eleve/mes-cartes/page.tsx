"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  IconArrowLeft,
  IconBooks,
  IconCards,
  IconCircleCheck,
  IconCreditCard,
  IconSchool,
  type TablerIcon,
} from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { getMesCartes, type CarteRecueEleve } from "@/lib/eleveApi";
import { ongletApresTouche } from "@/lib/lecon/rubriques";
import CarteRecueRow from "@/components/eleve/CarteRecueRow";
import StatutAbonnement from "@/components/eleve/StatutAbonnement";

type Onglet = "a_activer" | "activees";

/** Identité visuelle des deux catégories (couleur d'accent, icône, libellé). */
const CATEGORIES: Record<Onglet, { label: string; couleur: string; teinte: string; icone: TablerIcon }> = {
  a_activer: { label: "À activer", couleur: "#C2410C", teinte: "#FFF7ED", icone: IconCreditCard },
  activees: { label: "Activées", couleur: "#15803D", teinte: "#F0FDF4", icone: IconCircleCheck },
};
const ORDRE_ONGLETS: Onglet[] = ["a_activer", "activees"];

/**
 * Cartes qu'un vendeur a envoyées à l'élève connecté, ET/OU celles qu'il a
 * déjà activées (voir comptes.views.MesCartesEleveView côté backend) —
 * design carte AVEC le code en clair (voir CarteRecueRow : c'est légitime,
 * c'est SA carte).
 *
 * L'encart d'abonnement en haut (StatutAbonnement, mêmes conditions et mêmes
 * textes que RappelAbonnement) est LA vraie info de validité — le statut
 * d'une carte individuelle ("à activer"/"activée") ne dit rien de l'échéance
 * réelle une fois plusieurs cartes activées au fil du temps.
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
  const refsOnglets = useRef<Map<Onglet, HTMLButtonElement>>(new Map());

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
  const compteurs: Record<Onglet, number> = { a_activer: aActiver.length, activees: activees.length };

  function surTouche(evenement: KeyboardEvent<HTMLButtonElement>, courant: Onglet) {
    const suivant = ongletApresTouche(ORDRE_ONGLETS, courant, evenement.key);
    if (suivant === null) return;
    evenement.preventDefault();
    setOngletChoisi(suivant);
    refsOnglets.current.get(suivant)?.focus();
  }

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5">
      <Link
        href="/eleve/abonnement"
        className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-[#102A66] px-5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
      >
        <IconArrowLeft size={22} stroke={2.25} aria-hidden="true" />
        Retour à l&apos;abonnement
      </Link>

      {/* Bandeau « Mes cartes » */}
      <section
        aria-label="Mes cartes"
        className="relative overflow-hidden rounded-3xl bg-[linear-gradient(110deg,#1D4ED8_0%,#102A66_62%,#4C1D95_100%)] px-5 py-6 text-white shadow-md sm:px-8 sm:py-8"
      >
        <div className="flex items-center gap-4 sm:gap-8">
          <div aria-hidden="true" className="hidden shrink-0 text-white sm:block">
            <IconCards size={112} stroke={1.4} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-3 flex sm:hidden">
              <span
                aria-hidden="true"
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#C2410C] text-white"
              >
                <IconCards size={34} stroke={1.75} />
              </span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Mes cartes</h1>
            <p className="mt-2 max-w-2xl text-base text-white/90 sm:text-lg">
              Les cartes Fahimta reçues d&apos;un vendeur ou déjà activées.
            </p>
          </div>

          <div aria-hidden="true" className="hidden shrink-0 items-end gap-1 text-white lg:flex">
            <IconSchool size={112} stroke={1.5} />
            <IconBooks size={72} stroke={1.5} className="mb-1 text-white/80" />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-5 rounded-[32px] bg-[#F8FAFF] p-3 ring-1 ring-blue-100 sm:p-5">
        <StatutAbonnement actif={user?.aUnAbonnementActif ?? false} echeance={user?.abonnementActifJusquAu ?? null} />

        {chargement ? (
          <div className="grid gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Chargement des cartes">
            {[0, 1].map((cle) => (
              <div key={cle} className="h-56 animate-pulse rounded-3xl bg-slate-200/70" />
            ))}
          </div>
        ) : erreur ? (
          <p className="rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">{erreur}</p>
        ) : !cartes || cartes.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-orange-200 bg-gradient-to-b from-white to-[#FFF7ED] px-4 py-12 text-center">
            <span
              aria-hidden="true"
              className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FFEDD5] text-[#C2410C]"
            >
              <IconCreditCard size={48} stroke={1.5} />
            </span>
            <p className="max-w-md text-base text-slate-700 sm:text-lg">
              Aucune carte pour l&apos;instant. Procure-toi une carte Fahimta auprès d&apos;un vendeur.
            </p>
            <Link
              href="/eleve/abonnement"
              className="inline-flex min-h-12 items-center text-base font-bold text-[#C2410C] underline hover:text-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
            >
              J&apos;ai déjà un code ? Active-le ici →
            </Link>
          </div>
        ) : (
          <>
            <div role="tablist" aria-label="Catégories de cartes" className="grid grid-cols-2 gap-3 sm:gap-4">
              {ORDRE_ONGLETS.map((id) => {
                const { label, couleur, teinte, icone: Icone } = CATEGORIES[id];
                const estActif = onglet === id;
                return (
                  <button
                    key={id}
                    ref={(noeud) => {
                      if (noeud) refsOnglets.current.set(id, noeud);
                      else refsOnglets.current.delete(id);
                    }}
                    type="button"
                    role="tab"
                    id={`onglet-cartes-${id}`}
                    aria-selected={estActif}
                    aria-controls="panneau-cartes"
                    tabIndex={estActif ? 0 : -1}
                    onClick={() => setOngletChoisi(id)}
                    onKeyDown={(e) => surTouche(e, id)}
                    style={{
                      borderColor: estActif ? couleur : `color-mix(in srgb, ${couleur} 35%, white)`,
                      backgroundColor: estActif ? teinte : "#FFFFFF",
                    }}
                    className={`relative flex min-h-16 flex-col items-center gap-1.5 overflow-hidden rounded-2xl border-2 px-3 py-3 text-center transition-shadow sm:flex-row sm:gap-4 sm:px-5 sm:text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] ${
                      estActif ? "shadow-lg" : "shadow-sm hover:shadow-md"
                    }`}
                  >
                    {estActif && (
                      <span aria-hidden="true" className="absolute right-0 bottom-0 left-0 h-1.5" style={{ backgroundColor: couleur }} />
                    )}
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12"
                      style={{ backgroundColor: couleur }}
                    >
                      <Icone size={28} stroke={1.8} />
                    </span>
                    <span className="min-w-0 text-base font-extrabold text-[#102A66] sm:flex-1 sm:text-xl">{label}</span>
                    <span
                      className="shrink-0 rounded-full px-3 py-1 text-base font-extrabold sm:text-lg"
                      style={{ backgroundColor: estActif ? couleur : `color-mix(in srgb, ${couleur} 14%, white)`, color: estActif ? "#FFFFFF" : couleur }}
                    >
                      ({compteurs[id]})
                    </span>
                  </button>
                );
              })}
            </div>

            <div role="tabpanel" id="panneau-cartes" aria-labelledby={`onglet-cartes-${onglet}`}>
              {listeAffichee.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-slate-200 bg-white py-10 text-center">
                  <p className="text-base font-semibold text-slate-600 sm:text-lg">
                    {onglet === "a_activer" ? "Aucune carte à activer." : "Aucune carte activée pour l'instant."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {listeAffichee.map((carte) => (
                    <CarteRecueRow key={carte.id} carte={carte} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
