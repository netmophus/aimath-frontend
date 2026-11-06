/**
 * Bloc ```pgcd : Laboratoire PGCD & PPCM (voir docs/syntaxe-pgcd.md). Une seule directive facultative :
 * "onglet: euclide | facteurs | bezout | gauss | equations | modulo" (simulation affichée à l'ouverture).
 * Module isomorphe, même esprit que lib/horloge.ts.
 */

export class LaboPgcdSyntaxeError extends Error {}

export const ONGLETS_LABO = ["euclide", "facteurs", "bezout", "gauss", "equations", "modulo"] as const;
export type OngletLabo = (typeof ONGLETS_LABO)[number];

export interface LaboPgcdData {
  onglet: OngletLabo;
}

export function parserBlocLaboPgcd(source: string): LaboPgcdData {
  let onglet: OngletLabo = "euclide";
  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;
    const i = ligne.indexOf(":");
    if (i === -1) throw new LaboPgcdSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    const cle = ligne.slice(0, i).trim().toLowerCase();
    const valeur = ligne.slice(i + 1).trim().toLowerCase();
    if (cle !== "onglet") throw new LaboPgcdSyntaxeError(`Directive inconnue : « ${cle} » (attendu : onglet).`);
    if (!(ONGLETS_LABO as readonly string[]).includes(valeur)) {
      throw new LaboPgcdSyntaxeError(`Onglet inconnu : « ${valeur} » (attendu : ${ONGLETS_LABO.join(", ")}).`);
    }
    onglet = valeur as OngletLabo;
  }
  return { onglet };
}
