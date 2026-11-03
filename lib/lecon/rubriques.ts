/**
 * Logique pure (sans React) de la navigation de la page de lecture
 * /eleve/lecons/[id] : quelles rubriques existent pour une leçon donnée, et
 * comment le clavier se déplace entre elles. Isolée ici pour être testable.
 *
 * Les cinq rubriques historiques (pourquoi, cours, démonstrations, exercices,
 * examen) sont toujours régies par les mêmes règles. Deux rubriques facultatives
 * s'y ajoutent — « Simuler pour comprendre » et « Pour aller plus loin » — et
 * n'apparaissent que si leur champ est renseigné. « Cours » est toujours
 * présente : elle porte aussi objectifs, prérequis, à retenir, vidéos et ressources.
 */

export type RubriqueId =
  | "pourquoi"
  | "cours"
  | "demonstrations"
  | "simuler"
  | "exercices"
  | "examen"
  | "plus_loin";

/** Sous-ensemble de LeconEleve nécessaire pour décider des rubriques. */
export interface ContenuLecon {
  histoire: string;
  demonstrations: string;
  sujet_examen: string;
  exercices: readonly unknown[];
  /** Absents des copies hors-ligne téléchargées avant l'ajout des deux sections : traités comme vides. */
  simuler_pour_comprendre?: string | null;
  pour_aller_plus_loin?: string | null;
}

function aDuTexte(texte: string | null | undefined): boolean {
  return typeof texte === "string" && texte.trim().length > 0;
}

/** Rubriques disponibles, dans l'ordre d'affichage. Une rubrique sans contenu n'apparaît pas ; « cours » reste toujours. */
export function rubriquesDisponibles(lecon: ContenuLecon): RubriqueId[] {
  const ids: RubriqueId[] = [];
  if (aDuTexte(lecon.histoire)) ids.push("pourquoi");
  ids.push("cours");
  if (aDuTexte(lecon.demonstrations)) ids.push("demonstrations");
  if (aDuTexte(lecon.simuler_pour_comprendre)) ids.push("simuler");
  if (lecon.exercices.length > 0) ids.push("exercices");
  if (aDuTexte(lecon.sujet_examen)) ids.push("examen");
  if (aDuTexte(lecon.pour_aller_plus_loin)) ids.push("plus_loin");
  return ids;
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
