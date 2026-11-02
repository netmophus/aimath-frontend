import Link from "next/link";
import { IconAtom, IconBook2, IconCalculator, IconFlask, IconLeaf, type TablerIcon } from "@tabler/icons-react";

import type { ProgrammeEleve } from "@/lib/eleveApi";
import { matiereResolvable, type MatiereResolvable } from "@/lib/resoudre";

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

interface Teinte {
  icone: TablerIcon;
  /** Fond clair + bordure de la carte, et pastille d'icône : couleurs franches visibles au repos. */
  carte: string;
  pastille: string;
}

const TEINTES: Record<MatiereResolvable, Teinte> = {
  maths: { icone: IconCalculator, carte: "border-orange-200 bg-orange-50 hover:border-[#F97316]", pastille: "bg-[#F97316]" },
  physique: { icone: IconAtom, carte: "border-cyan-200 bg-cyan-50 hover:border-[#06B6D4]", pastille: "bg-[#0891B2]" },
  chimie: { icone: IconFlask, carte: "border-violet-200 bg-violet-50 hover:border-[#7C3AED]", pastille: "bg-[#7C3AED]" },
  svt: { icone: IconLeaf, carte: "border-emerald-200 bg-emerald-50 hover:border-[#10B981]", pastille: "bg-[#10B981]" },
};

const TEINTE_DEFAUT: Teinte = { icone: IconBook2, carte: "border-blue-200 bg-blue-50 hover:border-[#1D4ED8]", pastille: "bg-[#1D4ED8]" };

/**
 * Carte matière du dashboard : grande carte colorée en permanence (une couleur par matière), grande icône, nom en
 * gras et nombre réel de leçons publiées. Cliquable même à 0 leçon publiée : le programme (thèmes / chapitres /
 * notions) reste consultable. `w-full` + `break-words` : un nom ou un sous-texte long passe à la ligne au lieu de
 * déborder de la carte.
 */
export default function CarteMatiere({ programme }: CarteMatiereProps) {
  const cle = matiereResolvable(programme.matiere.nom);
  const t = cle ? TEINTES[cle] : TEINTE_DEFAUT;
  const Icone = t.icone;
  return (
    <Link
      href={`/eleve/programmes/${programme.id}`}
      className={`flex min-h-[148px] flex-col items-start gap-3 rounded-3xl border-2 p-4 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] motion-reduce:transition-none motion-reduce:hover:transform-none sm:p-5 ${t.carte}`}
    >
      <span className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-sm ${t.pastille}`} aria-hidden="true">
        <Icone size={40} stroke={1.6} />
      </span>
      <div className="w-full min-w-0">
        <p className="break-words text-lg font-extrabold text-[#102A66] sm:text-xl">
          <span className="sm:hidden">{libelleCourt(programme.matiere.nom)}</span>
          <span className="hidden sm:inline">{programme.matiere.nom}</span>
        </p>
        <p className="break-words text-sm font-medium text-slate-600">{libelleLecons(programme.nb_lecons_publiees)}</p>
      </div>
    </Link>
  );
}
