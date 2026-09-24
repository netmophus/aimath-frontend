/**
 * Parsing du bloc ```binaire (voir docs/syntaxe-binaire.md) — module
 * ISOMORPHE (aucun accès à window/document), même esprit que lib/variations.ts.
 *
 * Deux directives, toutes deux optionnelles : "valeur:" (le nombre affiché
 * au départ) et "max:" (la borne haute, qui fixe le nombre de colonnes de
 * bits du convertisseur — voir puissancesDeDeux ci-dessous).
 */

export class BinaireSyntaxeError extends Error {}

export interface BinaireData {
  valeurInitiale: number;
  max: number;
}

const VALEUR_DEFAUT = 0;
const MAX_DEFAUT = 255; // 8 bits, la taille la plus parlante pour un premier exemple
const MAX_MIN = 1;
const MAX_PLAFOND = 4095; // 12 bits : au-delà, la grille de cases devient illisible sur mobile

/**
 * Parse le contenu d'un bloc ```binaire. Lève BinaireSyntaxeError (message
 * FR) au moindre souci — jamais d'exception générique non-typée.
 */
export function parserBlocBinaire(source: string): BinaireData {
  let valeur: number | null = null;
  let max: number | null = null;

  const lignes = source.split("\n");

  for (const ligneBrute of lignes) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new BinaireSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeurBrute = ligne.slice(indexDeuxPoints + 1).trim();

    switch (cle) {
      case "valeur": {
        const n = Number(valeurBrute);
        if (!Number.isInteger(n) || n < 0) {
          throw new BinaireSyntaxeError(`"valeur:" doit être un entier positif ou nul (reçu « ${valeurBrute} »).`);
        }
        valeur = n;
        break;
      }
      case "max": {
        const n = Number(valeurBrute);
        if (!Number.isInteger(n) || n < MAX_MIN) {
          throw new BinaireSyntaxeError(`"max:" doit être un entier positif (reçu « ${valeurBrute} »).`);
        }
        max = n;
        break;
      }
      default:
        throw new BinaireSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  const maxFinal = max ?? MAX_DEFAUT;
  if (maxFinal > MAX_PLAFOND) {
    throw new BinaireSyntaxeError(`"max:" ne peut pas dépasser ${MAX_PLAFOND} (grille de cases trop grande).`);
  }

  const valeurFinale = valeur ?? VALEUR_DEFAUT;
  if (valeurFinale > maxFinal) {
    throw new BinaireSyntaxeError(`"valeur: ${valeurFinale}" dépasse "max: ${maxFinal}".`);
  }

  return { valeurInitiale: valeurFinale, max: maxFinal };
}

/** Puissances de 2 nécessaires pour représenter jusqu'à `max`, en ordre
 * décroissant (ex. max=255 -> [128, 64, 32, 16, 8, 4, 2, 1]) — fixe le
 * nombre de colonnes de bits affichées par le convertisseur. */
export function puissancesDeDeux(max: number): number[] {
  const nbBits = Math.max(1, Math.floor(Math.log2(max)) + 1);
  return Array.from({ length: nbBits }, (_, i) => 2 ** (nbBits - 1 - i));
}

/** Sous-ensemble de `puissances` dont le bit est actif dans `valeur` (ex.
 * 13 avec [8,4,2,1] -> [8,4,1]) — ordre décroissant conservé. */
export function decomposerEnPuissances(valeur: number, puissances: number[]): number[] {
  return puissances.filter((p) => (valeur & p) !== 0);
}

/** Écriture binaire de `valeur` sur `nbBits` chiffres (zéros de tête inclus). */
export function versBinaire(valeur: number, nbBits: number): string {
  return valeur.toString(2).padStart(nbBits, "0");
}
