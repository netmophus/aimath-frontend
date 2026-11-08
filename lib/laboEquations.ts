/**
 * Bloc ```labo-equations-complexes : Laboratoire « Équations dans ℂ » (Terminale C).
 * Une seule directive facultative : "onglet: discriminant | racines | resolution | troisieme-degre | verification"
 * (simulation affichée à l'ouverture, « discriminant » par défaut). Même principe que lib/laboMoivre.ts.
 */

export class LaboEquationsSyntaxeError extends Error {}

export const ONGLETS_EQUATIONS = ["discriminant", "racines", "resolution", "troisieme-degre", "verification"] as const;
export type OngletEquations = (typeof ONGLETS_EQUATIONS)[number];

export interface LaboEquationsData {
  onglet: OngletEquations;
}

export function parserBlocLaboEquations(source: string): LaboEquationsData {
  let onglet: OngletEquations = "discriminant";
  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;
    const i = ligne.indexOf(":");
    if (i === -1) throw new LaboEquationsSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    const cle = ligne.slice(0, i).trim().toLowerCase();
    const valeur = ligne.slice(i + 1).trim().toLowerCase();
    if (cle !== "onglet") throw new LaboEquationsSyntaxeError(`Directive inconnue : « ${cle} » (attendu : onglet).`);
    if (!(ONGLETS_EQUATIONS as readonly string[]).includes(valeur)) {
      throw new LaboEquationsSyntaxeError(`Onglet inconnu : « ${valeur} » (attendu : ${ONGLETS_EQUATIONS.join(", ")}).`);
    }
    onglet = valeur as OngletEquations;
  }
  return { onglet };
}

/** Gabarit inséré par « + Insérer le labo Équations complexes » (éditeur d'administration, rubrique « Simuler pour comprendre »). */
export const SQUELETTE_LABO_EQUATIONS = "\n\n```labo-equations-complexes\nonglet: discriminant\n```\n\n";

/** Le champ contient-il déjà un bloc ```labo-equations-complexes ? (évite l'insertion en double). */
export function contientLaboEquations(valeur: string): boolean {
  return /^\s*```labo-equations-complexes\b/m.test(valeur);
}
