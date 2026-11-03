import Link from "next/link";

import type { LeconListeEleve } from "@/lib/eleveApi";

interface CarteReprendreProps {
  /** La 1re leçon publiée de la classe (proxy en l'absence de suivi de
   * progression) — null si aucune leçon n'est encore publiée. */
  lecon: LeconListeEleve | null;
  /** Cible du bouton de repli ("Voir mon programme") — null si on ne peut
   * pas désigner une matière sans ambiguïté (0 ou plusieurs matières). */
  hrefProgramme: string | null;
}

const BOUTON =
  "mt-1 inline-flex w-fit min-h-12 items-center justify-center rounded-xl bg-[#C2410C] px-7 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#9A3412] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white";

const CADRE = "relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1D4ED8] to-[#7C3AED] px-5 py-6 text-white shadow-md sm:px-8 sm:py-8";

/** "Classe · Thème N · Chapitre" → segments, pour un sous-titre plus ou moins détaillé. */
function segments(chemin: string): string[] {
  return chemin
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Carte vedette du dashboard. Pas de barre de progression : on ne suit pas
 * encore l'avancement de l'élève, donc on n'invente aucun pourcentage.
 *
 * Le champ `chemin` de GET /api/eleve/mes-lecons/ est "Classe · Thème N ·
 * Chapitre" (pas le nom de la matière) — on l'utilise tel quel plutôt que de
 * fabriquer un "matière · thème" que l'API n'expose pas ici : version courte
 * (thème · chapitre) sur petit écran, complète (avec la classe) à partir de lg.
 */
export default function CarteReprendre({ lecon, hrefProgramme }: CarteReprendreProps) {
  if (!lecon) {
    return (
      <div className={`${CADRE} flex flex-col items-start gap-3`}>
        <span className="text-3xl" aria-hidden="true">
          🌱
        </span>
        <div>
          <p className="text-xl font-bold">Tes leçons arrivent bientôt</p>
          <p className="mt-1 text-base text-white/85">Le contenu arrive bientôt. Reviens un peu plus tard.</p>
        </div>
        {hrefProgramme && (
          <Link href={hrefProgramme} className={BOUTON}>
            Voir mon programme
          </Link>
        )}
      </div>
    );
  }

  const parts = segments(lecon.chemin);
  const contexteCourt = parts.length > 1 ? parts.slice(1).join(" · ") : lecon.chemin;
  const contexteComplet = parts.length > 0 ? parts.join(" · ") : lecon.chemin;

  return (
    <div className={`${CADRE} flex flex-col gap-3`}>
      <p className="text-xs font-bold uppercase tracking-wider text-white/80 sm:text-sm">
        Reprendre là où tu t&apos;es arrêté
      </p>
      <div>
        <p className="text-2xl font-extrabold leading-snug sm:text-3xl">{lecon.titre}</p>
        <p className="mt-1.5 text-base text-white/90">
          <span className="lg:hidden">{contexteCourt}</span>
          <span className="hidden lg:inline">{contexteComplet}</span>
        </p>
      </div>
      <Link href={`/eleve/lecons/${lecon.id}`} className={BOUTON}>
        Continuer
      </Link>
    </div>
  );
}
