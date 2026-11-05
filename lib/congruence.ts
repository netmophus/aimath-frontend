/**
 * Parsing du bloc ```congruence (voir docs/syntaxe-congruence.md) et calculs du calculateur de congruence —
 * module ISOMORPHE (aucun accès à window/document), même esprit que lib/horloge.ts.
 *
 * Trois directives facultatives : "a:", "b:", "n:" (entiers relatifs, n pour le module). Bloc vide = valeurs par
 * défaut. Clé inconnue ou valeur non entière = CongruenceSyntaxeError (message en français).
 */

export class CongruenceSyntaxeError extends Error {}

export interface CongruenceData {
  a: number;
  b: number;
  n: number;
}

export const CONGRUENCE_DEFAUT: CongruenceData = { a: 17, b: 3, n: 5 };

/** Entier relatif saisi en texte ("-7", "12"), sans exposant, décimale ni espace interne. null si invalide ou vide. */
export function lireEntier(texte: string): number | null {
  const t = texte.trim();
  if (!/^[+-]?\d+$/.test(t)) return null;
  const valeur = Number(t);
  return Number.isSafeInteger(valeur) ? valeur : null;
}

export function parserBlocCongruence(source: string): CongruenceData {
  const data: CongruenceData = { ...CONGRUENCE_DEFAUT };

  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new CongruenceSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeurBrute = ligne.slice(indexDeuxPoints + 1).trim();

    if (cle !== "a" && cle !== "b" && cle !== "n") {
      throw new CongruenceSyntaxeError(`Directive inconnue : « ${cle} » (attendu : a, b ou n).`);
    }
    const valeur = lireEntier(valeurBrute);
    if (valeur === null) {
      throw new CongruenceSyntaxeError(`"${cle}:" doit être un entier (reçu « ${valeurBrute} »).`);
    }
    data[cle] = valeur;
  }
  return data;
}

export interface DivisionCongruence {
  quotient: number;
  /** Toujours dans [0, n − 1], même pour a < 0. */
  reste: number;
}

/** Modulo euclidien : r = ((a % n) + n) % n, q = (a − r) / n. Suppose n ≥ 1 (voir moduleValide). */
export function divisionEuclidienne(a: number, n: number): DivisionCongruence {
  const reste = ((a % n) + n) % n;
  return { quotient: (a - reste) / n, reste };
}

export function moduleValide(n: number | null): n is number {
  return n !== null && n >= 1;
}

export interface TestCongruence {
  congruents: boolean;
  resteA: number;
  resteB: number;
  /** a − b */
  ecart: number;
  /** (a − b) / n quand n divise a − b, sinon null. */
  facteur: number | null;
}

export function testerCongruence(a: number, b: number, n: number): TestCongruence {
  const resteA = divisionEuclidienne(a, n).reste;
  const resteB = divisionEuclidienne(b, n).reste;
  const ecart = a - b;
  const congruents = resteA === resteB;
  return { congruents, resteA, resteB, ecart, facteur: congruents ? ecart / n : null };
}
