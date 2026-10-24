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
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-fh-accent text-fh-orange-fonce"
          aria-hidden="true"
        >
          <IconCamera size={22} stroke={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-fh-bleu">Résoudre mon exercice</h2>
          <p className="mt-0.5 text-sm text-fh-ardoise">{ACCROCHE_MATIERE_RESOLVABLE[matiere]}</p>
        </div>
      </div>

      <Link
        href={hrefResoudre(programmeId)}
        className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-fh-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
      >
        Commencer
      </Link>
    </section>
  );
}
