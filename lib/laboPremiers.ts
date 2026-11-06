/**
 * Bloc ```premiers : Laboratoire des nombres premiers (voir docs/syntaxe-premiers.md). Une seule directive facultative :
 * "onglet: crible | facteurs | primalite | carre | modulo | diviseurs" (simulation affichée à l'ouverture).
 * Module isomorphe, même esprit que lib/laboPgcd.ts.
 */

export class LaboPremiersSyntaxeError extends Error {}

export const ONGLETS_PREMIERS = ["crible", "facteurs", "primalite", "carre", "modulo", "diviseurs"] as const;
export type OngletPremiers = (typeof ONGLETS_PREMIERS)[number];

export interface LaboPremiersData {
  onglet: OngletPremiers;
}

export function parserBlocLaboPremiers(source: string): LaboPremiersData {
  let onglet: OngletPremiers = "crible";
  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;
    const i = ligne.indexOf(":");
    if (i === -1) throw new LaboPremiersSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    const cle = ligne.slice(0, i).trim().toLowerCase();
    const valeur = ligne.slice(i + 1).trim().toLowerCase();
    if (cle !== "onglet") throw new LaboPremiersSyntaxeError(`Directive inconnue : « ${cle} » (attendu : onglet).`);
    if (!(ONGLETS_PREMIERS as readonly string[]).includes(valeur)) {
      throw new LaboPremiersSyntaxeError(`Onglet inconnu : « ${valeur} » (attendu : ${ONGLETS_PREMIERS.join(", ")}).`);
    }
    onglet = valeur as OngletPremiers;
  }
  return { onglet };
}
