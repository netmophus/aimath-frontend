import Link from "next/link";
import { IconCamera } from "@tabler/icons-react";

import type { ProgrammeEleve } from "@/lib/eleveApi";
import {
  LIBELLE_MATIERE_RESOLVABLE,
  ORDRE_MATIERES_RESOLVABLES,
  matiereResolvable,
  type MatiereResolvable,
} from "@/lib/resoudre";

interface CarteResoudreProps {
  /** Programmes réels de l'élève (GET /api/eleve/mon-programme/). */
  programmes: ProgrammeEleve[];
}

/**
 * Carte du dashboard « Résoudre mon exercice » : un raccourci par matière
 * (Maths, Physique, Chimie, SVT) vers la page programme existante
 * /eleve/programmes/[id], où se trouve le bouton « Commencer ». Les liens
 * utilisent les identifiants des programmes déjà chargés ; une matière que
 * la classe de l'élève n'a pas n'apparaît simplement pas. Rien n'est rendu
 * si aucune des quatre matières n'est disponible.
 */
export default function CarteResoudre({ programmes }: CarteResoudreProps) {
  const parMatiere = new Map<MatiereResolvable, ProgrammeEleve>();
  for (const programme of programmes) {
    const matiere = matiereResolvable(programme.matiere.nom);
    if (matiere && !parMatiere.has(matiere)) parMatiere.set(matiere, programme);
  }

  const matieres = ORDRE_MATIERES_RESOLVABLES.filter((matiere) => parMatiere.has(matiere));
  if (matieres.length === 0) return null;

  return (
    <section
      aria-labelledby="titre-resoudre"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-fh-sable"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fh-accent text-fh-orange-fonce"
          aria-hidden="true"
        >
          <IconCamera size={22} stroke={1.75} />
        </span>
        <div className="min-w-0">
          <h2 id="titre-resoudre" className="text-base font-bold text-fh-bleu">
            Résoudre mon exercice
          </h2>
          <p className="mt-0.5 text-xs text-fh-ardoise">Choisis une matière pour commencer.</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {matieres.map((matiere) => (
          <Link
            key={matiere}
            href={`/eleve/programmes/${parMatiere.get(matiere)!.id}`}
            className="flex min-h-11 items-center justify-center rounded-xl border border-fh-bleu/20 px-3 py-2 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-accent"
          >
            {LIBELLE_MATIERE_RESOLVABLE[matiere]}
          </Link>
        ))}
      </div>
    </section>
  );
}
