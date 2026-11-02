import Link from "next/link";
import { IconCamera } from "@tabler/icons-react";

import { ACCROCHE_MATIERE_RESOLVABLE, hrefResoudre, matiereResolvable } from "@/lib/resoudre";

interface CarteResoudreMatiereProps {
  programmeId: number;
  matiereNom: string;
}

/**
 * Carte « Résoudre mon exercice » de la page matière (/eleve/programmes/[id]),
 * identique pour Maths, Physique, Chimie et SVT : seul le texte d'accroche
 * change (voir lib/resoudre.ts). Le bouton « Commencer » ouvre
 * /eleve/resoudre en transmettant l'identifiant du programme. Rien n'est
 * rendu pour une matière hors de ces quatre.
 */
export default function CarteResoudreMatiere({ programmeId, matiereNom }: CarteResoudreMatiereProps) {
  const matiere = matiereResolvable(matiereNom);
  if (!matiere) return null;

  return (
    <section
      aria-label="Résoudre mon exercice"
      className="flex flex-col gap-4 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex items-center gap-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#7C3AED] text-white shadow-sm sm:h-[72px] sm:w-[72px]"
          aria-hidden="true"
        >
          <IconCamera size={40} stroke={1.6} />
        </span>
        <div className="min-w-0">
          <h2 className="text-xl font-extrabold text-[#102A66] sm:text-2xl">Résoudre mon exercice</h2>
          <p className="mt-0.5 text-sm text-slate-600 sm:text-base">{ACCROCHE_MATIERE_RESOLVABLE[matiere]}</p>
        </div>
      </div>

      <Link
        href={hrefResoudre(programmeId)}
        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-[#C2410C] px-8 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
      >
        Commencer
      </Link>
    </section>
  );
}
