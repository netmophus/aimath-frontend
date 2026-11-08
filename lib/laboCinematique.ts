/**
 * Bloc ```labo-cinematique : Laboratoire de cinématique (Terminale C). Une seule directive facultative :
 * "onglet: mru | circulaire | frenet | hodographe | chronophoto | referentiels" (simulation affichée à l'ouverture,
 * « mru » par défaut). Même principe que lib/laboEquations.ts ; les blocs ```mouvement, ```circulaire et ```courbe
 * existants ne sont pas concernés.
 */

export class LaboCinematiqueSyntaxeError extends Error {}

export const ONGLETS_CINEMATIQUE = ["mru", "circulaire", "frenet", "hodographe", "chronophoto", "referentiels"] as const;
export type OngletCinematique = (typeof ONGLETS_CINEMATIQUE)[number];

export interface LaboCinematiqueData {
  onglet: OngletCinematique;
}

export function parserBlocLaboCinematique(source: string): LaboCinematiqueData {
  let onglet: OngletCinematique = "mru";
  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;
    const i = ligne.indexOf(":");
    if (i === -1) throw new LaboCinematiqueSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    const cle = ligne.slice(0, i).trim().toLowerCase();
    const valeur = ligne.slice(i + 1).trim().toLowerCase();
    if (cle !== "onglet") throw new LaboCinematiqueSyntaxeError(`Directive inconnue : « ${cle} » (attendu : onglet).`);
    if (!(ONGLETS_CINEMATIQUE as readonly string[]).includes(valeur)) {
      throw new LaboCinematiqueSyntaxeError(`Onglet inconnu : « ${valeur} » (attendu : ${ONGLETS_CINEMATIQUE.join(", ")}).`);
    }
    onglet = valeur as OngletCinematique;
  }
  return { onglet };
}

/** Gabarit inséré par « + Insérer le labo Cinématique » (éditeur d'administration, rubrique « Simuler pour comprendre »). */
export const SQUELETTE_LABO_CINEMATIQUE = "\n\n```labo-cinematique\nonglet: mru\n```\n\n";

/** Le champ contient-il déjà un bloc ```labo-cinematique ? (évite l'insertion en double). */
export function contientLaboCinematique(valeur: string): boolean {
  return /^\s*```labo-cinematique\b/m.test(valeur);
}
