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
  "mt-1 inline-flex w-fit min-h-11 items-center justify-center rounded-full bg-fh-orange px-5 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce";

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
      <div className="flex flex-col items-start gap-3 rounded-2xl bg-fh-bleu px-5 py-6 text-white sm:px-7 sm:py-8">
        <span className="text-2xl" aria-hidden="true">
          🌱
        </span>
        <div>
          <p className="text-lg font-bold">Tes leçons arrivent bientôt</p>
          <p className="mt-1 text-sm text-white/80">Ton professeur prépare le contenu — reviens un peu plus tard.</p>
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
    <div className="flex flex-col gap-3 rounded-2xl bg-fh-bleu px-5 py-6 text-white sm:px-7 sm:py-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
        Reprendre là où tu t&apos;es arrêté
      </p>
      <div>
        <p className="text-xl font-bold leading-snug">{lecon.titre}</p>
        <p className="mt-1 text-sm text-white/80">
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
