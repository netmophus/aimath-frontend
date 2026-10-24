"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ApiError } from "@/lib/api";
import { getMonProgramme, type ProgrammeEleve } from "@/lib/eleveApi";
import { LIBELLE_MATIERE_RESOLVABLE, matiereResolvable } from "@/lib/resoudre";
import DepotExercice from "@/components/eleve/DepotExercice";

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
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3" aria-busy="true" aria-label="Chargement">
        <div className="h-14 animate-pulse rounded-2xl bg-fh-sable/50" />
        <div className="h-40 animate-pulse rounded-2xl bg-fh-sable/50" />
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

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-5">
      <Link href={`/eleve/programmes/${programme.id}`} className="text-sm font-medium text-fh-bleu hover:underline">
        ← Retour
      </Link>

      <div>
        <h1 className="text-lg font-bold text-fh-bleu">Résoudre mon exercice</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-fh-ardoise">
          <span className="rounded-full bg-fh-accent px-3 py-1 text-xs font-semibold text-fh-orange-fonce">
            {LIBELLE_MATIERE_RESOLVABLE[matiere]}
          </span>
          <span>{classe}</span>
        </p>
      </div>

      <DepotExercice programmeId={programme.id} matiere={LIBELLE_MATIERE_RESOLVABLE[matiere]} />
    </div>
  );
}
