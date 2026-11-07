/**
 * Bloc ```labo-moivre : Laboratoire « Formule de Moivre, formules d'Euler et racines n-ièmes » (Terminale C).
 * Une seule directive facultative : "onglet: moivre | euler | linearisation | angles | racines | geometrie"
 * (simulation affichée à l'ouverture, « moivre » par défaut). Même principe que lib/laboComplexes.ts.
 */

export class LaboMoivreSyntaxeError extends Error {}

export const ONGLETS_MOIVRE = ["moivre", "euler", "linearisation", "angles", "racines", "geometrie"] as const;
export type OngletMoivre = (typeof ONGLETS_MOIVRE)[number];

export interface LaboMoivreData {
  onglet: OngletMoivre;
}

export function parserBlocLaboMoivre(source: string): LaboMoivreData {
  let onglet: OngletMoivre = "moivre";
  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;
    const i = ligne.indexOf(":");
    if (i === -1) throw new LaboMoivreSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    const cle = ligne.slice(0, i).trim().toLowerCase();
    const valeur = ligne.slice(i + 1).trim().toLowerCase();
    if (cle !== "onglet") throw new LaboMoivreSyntaxeError(`Directive inconnue : « ${cle} » (attendu : onglet).`);
    if (!(ONGLETS_MOIVRE as readonly string[]).includes(valeur)) {
      throw new LaboMoivreSyntaxeError(`Onglet inconnu : « ${valeur} » (attendu : ${ONGLETS_MOIVRE.join(", ")}).`);
    }
    onglet = valeur as OngletMoivre;
  }
  return { onglet };
}

/** Gabarit inséré par « + Insérer le labo Moivre » (éditeur d'administration, rubrique « Simuler pour comprendre »). */
export const SQUELETTE_LABO_MOIVRE = "\n\n```labo-moivre\nonglet: moivre\n```\n\n";

/** Le champ contient-il déjà un bloc ```labo-moivre ? (évite l'insertion en double). */
export function contientLaboMoivre(valeur: string): boolean {
  return /^\s*```labo-moivre\b/m.test(valeur);
}
