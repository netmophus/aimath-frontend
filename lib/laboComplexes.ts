/**
 * Bloc ```complexes : Laboratoire des nombres complexes (voir docs/syntaxe-complexes.md). Une seule directive
 * facultative : "onglet: plan | calculs | formes | rotations | racines | geometrie" (simulation affichée à l'ouverture,
 * « plan » par défaut). Module isomorphe, même esprit que lib/laboPremiers.ts.
 */

export class LaboComplexesSyntaxeError extends Error {}

export const ONGLETS_COMPLEXES = ["plan", "calculs", "formes", "rotations", "racines", "geometrie"] as const;
export type OngletComplexes = (typeof ONGLETS_COMPLEXES)[number];

export interface LaboComplexesData {
  onglet: OngletComplexes;
}

export function parserBlocLaboComplexes(source: string): LaboComplexesData {
  let onglet: OngletComplexes = "plan";
  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;
    const i = ligne.indexOf(":");
    if (i === -1) throw new LaboComplexesSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    const cle = ligne.slice(0, i).trim().toLowerCase();
    const valeur = ligne.slice(i + 1).trim().toLowerCase();
    if (cle !== "onglet") throw new LaboComplexesSyntaxeError(`Directive inconnue : « ${cle} » (attendu : onglet).`);
    if (!(ONGLETS_COMPLEXES as readonly string[]).includes(valeur)) {
      throw new LaboComplexesSyntaxeError(`Onglet inconnu : « ${valeur} » (attendu : ${ONGLETS_COMPLEXES.join(", ")}).`);
    }
    onglet = valeur as OngletComplexes;
  }
  return { onglet };
}

/** Gabarit inséré par « + Insérer le labo Nombres complexes » (éditeur d'administration, rubrique « Simuler pour comprendre »). */
export const SQUELETTE_LABO_COMPLEXES = "\n\n```complexes\nonglet: plan\n```\n\n";

/** Le champ contient-il déjà un bloc ```complexes ? (évite l'insertion en double). */
export function contientLaboComplexes(valeur: string): boolean {
  return /^\s*```complexes\b/m.test(valeur);
}
