/**
 * Logique pure (sans React) de la navigation de la page de lecture
 * /eleve/lecons/[id] : quelles rubriques existent, et comment le clavier se
 * déplace entre elles. Isolée ici pour être testable.
 *
 * Les SEPT rubriques sont toujours visibles dans toutes les leçons, dans cet
 * ordre. Ce qu'elles affichent quand elles n'ont pas de contenu (message
 * d'attente) ou quand la leçon est verrouillée (mur de déblocage, jamais de
 * contenu premium) est décidé par la page, pas ici.
 */

export type RubriqueId =
  | "pourquoi"
  | "cours"
  | "demonstrations"
  | "simuler"
  | "exercices"
  | "examen"
  | "plus_loin";

/** Ordre d'affichage des rubriques. */
export const RUBRIQUES_ORDRE: readonly RubriqueId[] = [
  "pourquoi",
  "cours",
  "demonstrations",
  "simuler",
  "exercices",
  "examen",
  "plus_loin",
];

/** Message affiché dans une rubrique facultative qui n'a pas (encore) de contenu. */
export const MESSAGE_RUBRIQUE_VIDE = "Le contenu de cette rubrique sera bientôt disponible.";

/** Vrai si le texte contient autre chose que des blancs (absent, null ou vide = faux). */
export function aDuTexte(texte: string | null | undefined): boolean {
  return typeof texte === "string" && texte.trim().length > 0;
}

/** Sous-ensemble de LeconEleve nécessaire pour décider de l'état d'une rubrique. */
export interface ContenuLecon {
  histoire: string;
  demonstrations: string;
  sujet_examen: string;
  exercices: readonly unknown[];
  /** Absents des copies hors-ligne téléchargées avant l'ajout des deux sections : traités comme vides. */
  simuler_pour_comprendre?: string | null;
  pour_aller_plus_loin?: string | null;
  /** true = leçon premium non accessible à l'élève. Absent (ancienne copie hors-ligne) = accessible. */
  verrouille?: boolean;
}

/**
 * Ce que doit afficher une rubrique :
 * - « contenu »    : du contenu à rendre ;
 * - « vide »       : message d'attente (leçon accessible, rubrique sans contenu) ;
 * - « verrouille » : mur de déblocage (leçon verrouillée) — JAMAIS de contenu premium.
 * « cours » est toujours « contenu » (elle porte aperçu, objectifs, mur, etc.) ; « pourquoi »
 * (l'accroche) reste lisible même verrouillée, elle n'est donc jamais « verrouille ».
 */
export type EtatRubrique = "contenu" | "vide" | "verrouille";

export function etatRubrique(id: RubriqueId, lecon: ContenuLecon): EtatRubrique {
  const verrouillee = lecon.verrouille === true;
  switch (id) {
    case "cours":
      return "contenu";
    case "pourquoi":
      return aDuTexte(lecon.histoire) ? "contenu" : "vide";
    case "demonstrations":
      return verrouillee ? "verrouille" : aDuTexte(lecon.demonstrations) ? "contenu" : "vide";
    case "simuler":
      return verrouillee ? "verrouille" : aDuTexte(lecon.simuler_pour_comprendre) ? "contenu" : "vide";
    case "exercices":
      return verrouillee ? "verrouille" : lecon.exercices.length > 0 ? "contenu" : "vide";
    case "examen":
      return verrouillee ? "verrouille" : aDuTexte(lecon.sujet_examen) ? "contenu" : "vide";
    case "plus_loin":
      return verrouillee ? "verrouille" : aDuTexte(lecon.pour_aller_plus_loin) ? "contenu" : "vide";
  }
}

/** Les sept rubriques, dans l'ordre d'affichage (copie : l'appelant peut la modifier). */
export function rubriquesDisponibles(): RubriqueId[] {
  return [...RUBRIQUES_ORDRE];
}

/** Touches gérées par une liste d'onglets (pattern WAI-ARIA « tabs »). */
export type ToucheOnglets = "ArrowDown" | "ArrowUp" | "ArrowRight" | "ArrowLeft" | "Home" | "End";

/**
 * Identifiant à activer après une touche de navigation, avec bouclage aux
 * extrémités ; null si la touche n'est pas gérée ou si la liste est vide.
 * Les flèches haut/bas (barre verticale) et gauche/droite (barre horizontale)
 * sont toutes deux acceptées, pour que le clavier fonctionne quelle que soit
 * la disposition responsive.
 */
export function ongletApresTouche<T extends string>(ids: readonly T[], courant: T, touche: string): T | null {
  if (ids.length === 0) return null;
  const index = Math.max(0, ids.indexOf(courant));
  switch (touche) {
    case "ArrowDown":
    case "ArrowRight":
      return ids[(index + 1) % ids.length];
    case "ArrowUp":
    case "ArrowLeft":
      return ids[(index - 1 + ids.length) % ids.length];
    case "Home":
      return ids[0];
    case "End":
      return ids[ids.length - 1];
    default:
      return null;
  }
}

/** Rubrique réellement affichée : si celle demandée n'existe pas (ex. données rechargées), repli sur « cours ». */
export function rubriqueEffective(ids: readonly RubriqueId[], demandee: RubriqueId): RubriqueId {
  return ids.includes(demandee) ? demandee : "cours";
}

/** « Mathématiques — Terminale C » → « Terminale C » ; null si le libellé n'a pas de partie classe. */
export function extraireClasseDuLibelle(libelle: string): string | null {
  const morceaux = libelle.split("—");
  if (morceaux.length < 2) return null;
  const classe = morceaux.slice(1).join("—").trim();
  return classe || null;
}
