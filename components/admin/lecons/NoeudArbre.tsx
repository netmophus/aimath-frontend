"use client";

import type { ReactNode } from "react";

export type NiveauArbre = "matiere" | "programme" | "theme" | "chapitre";

interface NoeudArbreProps {
  titre: ReactNode;
  /** Ex. "38h" pour un thème — omis pour les autres niveaux. */
  sousTitre?: ReactNode;
  /** Déjà formaté, ex. "5/7 leçons (3 publiées)" (voir lib/arbreLecons.ts). */
  progres: string;
  ouvert: boolean;
  onToggle: () => void;
  niveau: NiveauArbre;
  children: ReactNode;
}

/**
 * En-tête repliable générique pour les 4 niveaux de groupe de l'arbre des
 * leçons (Matière/Programme/Thème/Chapitre) — même chevron ▸/▾ et même
 * imbrication visuelle en cartes que components/admin/programmes/ThemeNode.tsx
 * + ChapitreNode.tsx (dont on s'inspire ici plutôt que de dupliquer 4 fichiers
 * quasi identiques), poussée à un niveau de plus (Matière, Programme).
 */
const STYLES_CONTENEUR: Record<NiveauArbre, string> = {
  matiere: "flex flex-col gap-3",
  programme: "flex flex-col gap-3 rounded-2xl bg-fh-accent/20 p-4 ring-1 ring-fh-sable",
  theme: "flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-fh-sable",
  chapitre: "flex flex-col gap-2 rounded-lg bg-fh-creme/70 p-3 ring-1 ring-fh-sable/70",
};

// `min-w-0` sur le titre lui-même (pas seulement sur ses parents) : un span
// flex enfant a par défaut `min-width: auto` (= la largeur de son contenu),
// ce qui empêche `truncate` d'agir et pousse toute la chaîne de conteneurs
// flex — jusqu'à la mise en page entière — plus large que le viewport dès
// qu'un titre est long (bug réel trouvé en testant le rendu mobile).
const STYLES_TITRE: Record<NiveauArbre, string> = {
  matiere: "min-w-0 truncate text-lg font-bold text-fh-bleu",
  programme: "min-w-0 truncate text-base font-bold text-fh-bleu",
  theme: "min-w-0 truncate font-bold text-fh-bleu",
  chapitre: "min-w-0 truncate text-sm font-semibold text-fh-bleu",
};

export default function NoeudArbre({ titre, sousTitre, progres, ouvert, onToggle, niveau, children }: NoeudArbreProps) {
  return (
    <div className={STYLES_CONTENEUR[niveau]}>
      <button type="button" onClick={onToggle} className="flex w-full min-w-0 flex-wrap items-center justify-between gap-2 text-left">
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-fh-bleu" aria-hidden="true">
            {ouvert ? "▾" : "▸"}
          </span>
          <span className={STYLES_TITRE[niveau]}>{titre}</span>
          {sousTitre && (
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-fh-bleu">{sousTitre}</span>
          )}
        </span>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-fh-ardoise/70">{progres}</span>
      </button>

      {ouvert && <div className="flex flex-col gap-2 pl-3">{children}</div>}
    </div>
  );
}
