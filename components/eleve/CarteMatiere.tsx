import Link from "next/link";

import type { ProgrammeEleve } from "@/lib/eleveApi";
import { IconeLivre } from "./icones";

interface CarteMatiereProps {
  programme: ProgrammeEleve;
}

function libelleLecons(n: number): string {
  if (n === 0) return "Programme disponible";
  return `${n} leçon${n > 1 ? "s" : ""} disponible${n > 1 ? "s" : ""}`;
}

/**
 * Carte matière — tuile verticale pour la grille "Mes matières" (2 colonnes
 * sur mobile, jusqu'à 3 sur grand écran). Cliquable même à 0 leçon publiée :
 * le programme (thèmes / chapitres / notions) reste consultable, seule la
 * lecture change selon les publications (voir NotionRow côté page programme).
 */
export default function CarteMatiere({ programme }: CarteMatiereProps) {
  return (
    <Link
      href={`/eleve/programmes/${programme.id}`}
      className="flex min-h-11 flex-col items-start gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable transition-shadow hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-fh-accent text-fh-orange-fonce" aria-hidden="true">
        <IconeLivre className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-fh-bleu">{programme.matiere.nom}</p>
        <p className="text-xs text-fh-ardoise">{libelleLecons(programme.nb_lecons_publiees)}</p>
      </div>
    </Link>
  );
}
