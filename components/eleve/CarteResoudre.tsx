import Link from "next/link";
import { IconFileText, IconPencil } from "@tabler/icons-react";

import type { ProgrammeEleve } from "@/lib/eleveApi";
import {
  LIBELLE_MATIERE_RESOLVABLE,
  hrefResoudre,
  programmesParMatiere,
  type MatiereResolvable,
} from "@/lib/resoudre";

interface CarteResoudreProps {
  /** Programmes réels de l'élève (GET /api/eleve/mon-programme/). */
  programmes: ProgrammeEleve[];
}

/** Couleur du bouton par matière (nuances assez foncées pour un texte blanc lisible). */
const COULEUR_BOUTON: Record<MatiereResolvable, string> = {
  maths: "bg-[#C2410C] hover:bg-[#9A3412]",
  physique: "bg-[#0E7490] hover:bg-[#155E75]",
  chimie: "bg-[#7C3AED] hover:bg-[#6D28D9]",
  svt: "bg-[#047857] hover:bg-[#065F46]",
};

/**
 * Carte du dashboard « Résoudre mon exercice » : un raccourci par matière
 * (Maths, Physique, Chimie, SVT) qui ouvre DIRECTEMENT la page de dépôt
 * /eleve/resoudre?programme=<id>. Les identifiants sont ceux des programmes
 * réels déjà chargés (jamais codés en dur) ; une matière que la classe de
 * l'élève n'a pas n'apparaît simplement pas. Rien n'est rendu si aucune des
 * quatre matières n'est disponible.
 */
export default function CarteResoudre({ programmes }: CarteResoudreProps) {
  const matieres = programmesParMatiere(programmes);
  if (matieres.length === 0) return null;

  return (
    <section
      aria-labelledby="titre-resoudre"
      className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm sm:p-7"
    >
      <div className="flex items-center gap-4">
        <span
          className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#1D4ED8] text-white shadow-sm"
          aria-hidden="true"
        >
          <IconFileText size={38} stroke={1.5} />
          <IconPencil size={24} stroke={2} className="absolute -bottom-1.5 -right-1.5 rounded-full bg-[#F97316] p-1 text-white" />
        </span>
        <div className="min-w-0">
          <h2 id="titre-resoudre" className="text-xl font-extrabold text-[#102A66] sm:text-2xl">
            Résoudre mon exercice
          </h2>
          <p className="mt-0.5 text-sm text-slate-600 sm:text-base">Choisis une matière pour commencer.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {matieres.map(({ matiere, programme }) => (
          <Link
            key={matiere}
            href={hrefResoudre(programme.id)}
            className={`flex min-h-12 items-center justify-center rounded-xl px-3 py-2.5 text-base font-bold text-white shadow-sm transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] ${COULEUR_BOUTON[matiere]}`}
          >
            {LIBELLE_MATIERE_RESOLVABLE[matiere]}
          </Link>
        ))}
      </div>
    </section>
  );
}
