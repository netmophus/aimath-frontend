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

/** Libellé court pour l'affichage sur petit écran — seul le NOM AFFICHÉ est
 * abrégé, jamais la donnée (programme.matiere.nom reste "Mathématiques" tel
 * que renseigné en base). Chimie/Physique/SVT sont déjà courts : pas
 * d'entrée nécessaire, `libelleCourt` retombe alors sur le nom complet. */
const LIBELLES_COURTS: Record<string, string> = {
  Mathématiques: "Maths",
};

function libelleCourt(nom: string): string {
  return LIBELLES_COURTS[nom] ?? nom;
}

/**
 * Carte matière — tuile verticale pour la grille "Mes matières" (2 colonnes
 * sur mobile, jusqu'à 3 sur grand écran). Cliquable même à 0 leçon publiée :
 * le programme (thèmes / chapitres / notions) reste consultable, seule la
 * lecture change selon les publications (voir NotionRow côté page programme).
 *
 * `w-full` sur le bloc de texte (pas juste `min-w-0`) : sans ça, comme le
 * <Link> parent est `items-start` (alignement "hug" sur l'axe transversal
 * d'un flex-col), ce bloc ne prenait que la largeur de son contenu — un nom
 * de matière long ("Mathématiques") ou un sous-texte long débordait alors
 * de la carte au lieu de passer à la ligne. `break-words` en garde-fou pour
 * un mot isolé plus large que la carte (nom de matière imprévu).
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
      <div className="w-full min-w-0">
        <p className="break-words font-semibold text-fh-bleu">
          <span className="sm:hidden">{libelleCourt(programme.matiere.nom)}</span>
          <span className="hidden sm:inline">{programme.matiere.nom}</span>
        </p>
        <p className="break-words text-xs text-fh-ardoise">{libelleLecons(programme.nb_lecons_publiees)}</p>
      </div>
    </Link>
  );
}
