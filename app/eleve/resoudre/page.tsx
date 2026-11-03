"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconArrowLeft, IconBooks, IconFileText, IconPencil } from "@tabler/icons-react";

import { ApiError } from "@/lib/api";
import { getMonProgramme, type ProgrammeEleve } from "@/lib/eleveApi";
import { LIBELLE_MATIERE_RESOLVABLE, matiereResolvable } from "@/lib/resoudre";
import DepotExercice from "@/components/eleve/DepotExercice";
import { COULEUR_MATIERE_RESOLVABLE } from "@/components/eleve/teintesResoudre";

/**
 * Destination du bouton « Commencer » (voir components/eleve/CarteResoudreMatiere.tsx) :
 * /eleve/resoudre?programme=<id>. Identifie la matière et la classe de
 * l'élève à partir de SES programmes (GET /api/eleve/mon-programme/, donc un
 * identifiant étranger à sa classe n'est jamais reconnu), puis affiche
 * l'interface de dépôt (DepotExercice), qui envoie à POST /api/eleve/resoudre/.
 */
export default function ResoudrePage() {
  return (
    <Suspense fallback={null}>
      <ResoudreContenu />
    </Suspense>
  );
}

function ResoudreContenu() {
  const searchParams = useSearchParams();
  const programmeId = Number(searchParams.get("programme"));

  const [programme, setProgramme] = useState<ProgrammeEleve | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const programmes = await getMonProgramme();
        if (actif) setProgramme(programmes.find((p) => p.id === programmeId) ?? null);
      } catch (error) {
        if (actif) {
          setErreur(error instanceof ApiError ? error.message : "Impossible de charger ton programme.");
        }
      } finally {
        if (actif) setChargement(false);
      }
    }

    charger();
    return () => {
      actif = false;
    };
  }, [programmeId]);

  if (chargement) {
    return (
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-3" aria-busy="true" aria-label="Chargement">
        <div className="h-12 w-56 animate-pulse rounded-xl bg-fh-sable/50" />
        <div className="h-36 animate-pulse rounded-3xl bg-fh-sable/50" />
        <div className="h-64 animate-pulse rounded-3xl bg-fh-sable/50" />
      </div>
    );
  }

  const matiere = programme ? matiereResolvable(programme.matiere.nom) : null;

  if (erreur || !programme || !matiere) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-fh-ardoise">
          {erreur ?? "Choisis d'abord une matière pour résoudre un exercice."}
        </p>
        <Link
          href="/eleve"
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          ← Retour
        </Link>
      </div>
    );
  }

  const classe = programme.serie ? `${programme.niveau.nom} ${programme.serie.nom}` : programme.niveau.nom;

  const couleurMatiere = COULEUR_MATIERE_RESOLVABLE[matiere];

  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-5">
      <Link
        href="/eleve"
        className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-[#102A66] px-5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
      >
        <IconArrowLeft size={22} stroke={2.25} aria-hidden="true" />
        Retour
      </Link>

      {/* Bandeau principal */}
      <header className="relative overflow-hidden rounded-3xl bg-[linear-gradient(110deg,#1D4ED8_0%,#2563EB_45%,#7C3AED_100%)] px-5 py-6 text-white shadow-md sm:px-8 sm:py-8">
        <div className="flex items-center gap-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Résoudre mon exercice</h1>
            <p className="mt-2 max-w-2xl text-base text-white/90 sm:text-lg">
              Dépose ton exercice et choisis comment FAHIMTA peut t&apos;aider.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-2">
              <span
                style={{ backgroundColor: couleurMatiere }}
                className="rounded-full border-2 border-white/80 px-4 py-1.5 text-sm font-extrabold text-white sm:text-base"
              >
                {LIBELLE_MATIERE_RESOLVABLE[matiere]}
              </span>
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white sm:text-base">{classe}</span>
            </p>
          </div>

          {/* Illustration vectorielle : document, crayon et livres (masquée sur mobile) */}
          <div aria-hidden="true" className="hidden shrink-0 items-end gap-2 text-white sm:flex">
            <span className="relative">
              <IconFileText size={120} stroke={1.3} />
              <IconPencil
                size={54}
                stroke={1.8}
                className="absolute -bottom-1 -right-3 rounded-full bg-[#F97316] p-2.5 text-white shadow-lg"
              />
            </span>
            <IconBooks size={84} stroke={1.4} className="mb-1 ml-3 text-white/85" />
          </div>
        </div>
      </header>

      <div className="rounded-[32px] bg-[#F8FAFF] p-3 ring-1 ring-blue-100 sm:p-5">
        <DepotExercice programmeId={programme.id} matiere={LIBELLE_MATIERE_RESOLVABLE[matiere]} />
      </div>
    </div>
  );
}
