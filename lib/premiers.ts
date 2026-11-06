/**
 * Arithmétique exacte du Laboratoire des nombres premiers (voir docs/syntaxe-premiers.md) : module ISOMORPHE et PUR
 * (aucun accès à window/document, aucune décision par calcul flottant). Les entiers courants sont des `number`
 * entiers sûrs (≤ 10^9 : les produits restent < 2^53) ; les produits susceptibles de dépasser sont en `bigint`.
 * La factorisation, le PGCD, le PPCM et la lecture d'entiers sont réutilisés depuis lib/arithmetique.ts.
 */

import { ErreurArithmetique, facteursPremiers, lireEntier, pgcd as pgcdBig, ppcm as ppcmBig, type Facteurs } from "@/lib/arithmetique";

export { ErreurArithmetique, facteursPremiers };
export type { Facteurs };

/** Plus grand entier accepté par les simulations de primalité, de facteurs et de diviseurs (10^9). */
export const MAX_NOMBRE = 1_000_000_000;
/** Plus grand entier accepté par la simulation « carré parfait » (les produits n × k sont calculés en bigint). */
export const MAX_NOMBRE_CARRE = 1_000_000;
/** Plus grande limite du crible. */
export const MAX_CRIBLE = 200;

export type LectureNaturel = { ok: true; valeur: number } | { ok: false; erreur: string };

/** Lit un entier naturel ≥ `min` et ≤ `max` à partir d'un texte (espaces, séparateurs de milliers tolérés). */
export function lireNaturel(texte: string, min: number, max: number): LectureNaturel {
  const nettoye = texte.replace(/[\s  ]/g, "");
  const l = lireEntier(nettoye, 12);
  if (!l.ok) return { ok: false, erreur: l.erreur };
  if (l.valeur < BigInt(min)) return { ok: false, erreur: `Entre un entier supérieur ou égal à ${min}.` };
  if (l.valeur > BigInt(max)) return { ok: false, erreur: `Entre un entier inférieur ou égal à ${max.toLocaleString("fr-FR")}.` };
  return { ok: true, valeur: Number(l.valeur) };
}

/** Racine carrée entière exacte : plus grand r tel que r² ≤ n (aucune décision n'est prise sur la valeur flottante). */
export function racineEntiere(n: number): number {
  if (!Number.isSafeInteger(n) || n < 0) throw new ErreurArithmetique("Entier naturel attendu.");
  let r = Math.floor(Math.sqrt(n));
  while (r * r > n) r--;
  while ((r + 1) * (r + 1) <= n) r++;
  return r;
}

export function estCarreParfait(n: number): boolean {
  const r = racineEntiere(n);
  return r * r === n;
}

// ---------------------------------------------------------------------------------------------------------------
// Primalité
// ---------------------------------------------------------------------------------------------------------------

export function estPremier(n: number): boolean {
  if (!Number.isSafeInteger(n) || n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  const r = racineEntiere(n);
  for (let d = 3; d <= r; d += 2) if (n % d === 0) return false;
  return true;
}

/** Nombres premiers ≤ limite (crible direct, sans trace). */
export function premiersJusqua(limite: number): number[] {
  const res: number[] = [];
  for (let k = 2; k <= limite; k++) if (estPremier(k)) res.push(k);
  return res;
}

/** Nombres premiers p tels que p² ≤ n : ce sont les seuls candidats à tester pour décider si n est premier. */
export function candidatsPremiers(n: number): number[] {
  return premiersJusqua(racineEntiere(n));
}

export interface TestDivision {
  p: number;
  quotient: number;
  reste: number;
  divise: boolean;
}

/** Division euclidienne exacte de n par p : n = p × quotient + reste. */
export function testerDiviseur(n: number, p: number): TestDivision {
  const reste = n % p;
  return { p, quotient: (n - reste) / p, reste, divise: reste === 0 };
}

/** Verdict complet par division par les candidats : premier si aucun candidat ne divise n (n ≥ 2). */
export function verdictPrimalite(n: number): { premier: boolean; plusPetitDiviseur: number | null } {
  for (const p of candidatsPremiers(n)) if (n % p === 0) return { premier: false, plusPetitDiviseur: p };
  return { premier: n >= 2, plusPetitDiviseur: null };
}

// ---------------------------------------------------------------------------------------------------------------
// Crible d'Ératosthène
// ---------------------------------------------------------------------------------------------------------------

export interface EtapeCrible {
  /** Nombre premier sélectionné à cette étape. */
  p: number;
  /** Multiples examinés : 2p, 3p, … ≤ limite. */
  examines: number[];
  /** Parmi eux, ceux qui n'étaient pas encore éliminés (seules ces éliminations sont nouvelles). */
  nouveaux: number[];
  /** Ceux qui l'étaient déjà (jamais comptés deux fois). */
  dejaElimines: number[];
}

export interface ResultatCrible {
  limite: number;
  etapes: EtapeCrible[];
  /** Nombres premiers ≤ limite : tous les entiers de 2 à la limite jamais éliminés. */
  premiers: number[];
}

export function cribleEratosthene(limite: number): ResultatCrible {
  if (!Number.isSafeInteger(limite) || limite < 2) throw new ErreurArithmetique("La limite doit être un entier supérieur ou égal à 2.");
  const elimine = new Array<boolean>(limite + 1).fill(false);
  const etapes: EtapeCrible[] = [];
  const r = racineEntiere(limite);
  for (let p = 2; p <= r; p++) {
    if (elimine[p]) continue;
    const examines: number[] = [];
    const nouveaux: number[] = [];
    const dejaElimines: number[] = [];
    for (let m = 2 * p; m <= limite; m += p) {
      examines.push(m);
      if (elimine[m]) dejaElimines.push(m);
      else {
        elimine[m] = true;
        nouveaux.push(m);
      }
    }
    etapes.push({ p, examines, nouveaux, dejaElimines });
  }
  const premiers: number[] = [];
  for (let k = 2; k <= limite; k++) if (!elimine[k]) premiers.push(k);
  return { limite, etapes, premiers };
}

/** Nombres éliminés après les `n` premières étapes du crible. */
export function elimines(crible: ResultatCrible, n: number): Set<number> {
  const s = new Set<number>();
  for (const e of crible.etapes.slice(0, n)) for (const m of e.nouveaux) s.add(m);
  return s;
}

// ---------------------------------------------------------------------------------------------------------------
// Arbre de facteurs
// ---------------------------------------------------------------------------------------------------------------

export interface Noeud {
  id: string;
  valeur: number;
  enfants: [Noeud, Noeud] | null;
}

export function creerArbre(n: number): Noeud {
  if (!Number.isSafeInteger(n) || n < 2) throw new ErreurArithmetique("Il faut un entier supérieur ou égal à 2.");
  return { id: "r", valeur: n, enfants: null };
}

export function feuilles(arbre: Noeud): Noeud[] {
  return arbre.enfants ? [...feuilles(arbre.enfants[0]), ...feuilles(arbre.enfants[1])] : [arbre];
}

export function trouverNoeud(arbre: Noeud, id: string): Noeud | null {
  if (arbre.id === id) return arbre;
  if (!arbre.enfants) return null;
  return trouverNoeud(arbre.enfants[0], id) ?? trouverNoeud(arbre.enfants[1], id);
}

/** Vrai si toutes les feuilles sont des nombres premiers. */
export function arbreTermine(arbre: Noeud): boolean {
  return feuilles(arbre).every((f) => estPremier(f.valeur));
}

export type ResultatDecoupe = { ok: true; arbre: Noeud } | { ok: false; erreur: string };

/** Remplace la feuille `id` par ses deux enfants a et b si a, b ≥ 2 sont entiers et a × b = valeur exactement. */
export function decomposerNoeud(arbre: Noeud, id: string, a: number, b: number): ResultatDecoupe {
  const cible = trouverNoeud(arbre, id);
  if (!cible) return { ok: false, erreur: "Sélectionne d'abord un nombre de l'arbre." };
  if (cible.enfants) return { ok: false, erreur: `${cible.valeur} est déjà décomposé.` };
  if (estPremier(cible.valeur)) return { ok: false, erreur: `${cible.valeur} est premier : on ne le décompose pas.` };
  if (!Number.isInteger(a) || !Number.isInteger(b)) return { ok: false, erreur: "Les deux facteurs doivent être des entiers." };
  if (a < 2 || b < 2) {
    return { ok: false, erreur: `Les deux facteurs doivent être supérieurs ou égaux à 2 : multiplier par 1 ne décompose rien (${cible.valeur} = 1 × ${cible.valeur}).` };
  }
  if (a * b !== cible.valeur) {
    return { ok: false, erreur: `${a} × ${b} = ${a * b}, et non ${cible.valeur}. Le produit des deux facteurs doit être exactement ${cible.valeur}.` };
  }
  const remplacer = (n: Noeud): Noeud => {
    if (n.id === id) return { ...n, enfants: [{ id: `${id}0`, valeur: a, enfants: null }, { id: `${id}1`, valeur: b, enfants: null }] };
    return n.enfants ? { ...n, enfants: [remplacer(n.enfants[0]), remplacer(n.enfants[1])] } : n;
  };
  return { ok: true, arbre: remplacer(arbre) };
}

/** Feuilles groupées en exposants, triées par facteur croissant : à n'utiliser que sur un arbre terminé. */
export function facteursDeFeuilles(arbre: Noeud): Facteurs {
  const m = new Map<number, number>();
  for (const f of feuilles(arbre)) m.set(f.valeur, (m.get(f.valeur) ?? 0) + 1);
  return [...m.entries()].sort((x, y) => x[0] - y[0]).map(([p, e]) => ({ p, e }));
}

/** Proposition de la décomposition guidée : la première feuille composée, scindée en (plus petit facteur premier) × (reste). */
export function pasGuide(arbre: Noeud): { id: string; a: number; b: number } | null {
  const f = feuilles(arbre).find((x) => !estPremier(x.valeur));
  if (!f) return null;
  const p = facteursPremiers(f.valeur)[0].p;
  return { id: f.id, a: p, b: f.valeur / p };
}

export function memesFacteurs(a: Facteurs, b: Facteurs): boolean {
  return a.length === b.length && a.every((x, i) => x.p === b[i].p && x.e === b[i].e);
}

/** Valeur numérique d'une décomposition (bigint, pour éviter tout dépassement). */
export function produitFacteurs(f: Facteurs): bigint {
  return f.reduce((acc, { p, e }) => acc * BigInt(p) ** BigInt(e), BigInt(1));
}

// ---------------------------------------------------------------------------------------------------------------
// Carré parfait (et cube parfait)
// ---------------------------------------------------------------------------------------------------------------

/** Plus petit k ≥ 1 tel que n × k soit une puissance m-ième parfaite : chaque exposant e est complété au multiple de m suivant. */
export function multiplicateurMinimal(n: number, m: 2 | 3): { k: bigint; ajouts: Array<{ p: number; ajout: number }> } {
  const ajouts = facteursPremiers(n)
    .map(({ p, e }) => ({ p, ajout: (m - (e % m)) % m }))
    .filter((x) => x.ajout > 0);
  return { k: ajouts.reduce((acc, { p, ajout }) => acc * BigInt(p) ** BigInt(ajout), BigInt(1)), ajouts };
}

/** Racine entière exacte (m-ième) d'une décomposition dont tous les exposants sont multiples de m, sinon null. */
export function racinePuissance(f: Facteurs, m: 2 | 3): bigint | null {
  if (f.some(({ e }) => e % m !== 0)) return null;
  return f.reduce((acc, { p, e }) => acc * BigInt(p) ** BigInt(e / m), BigInt(1));
}

/** Décomposition de n × k où k = ∏ p^ajout (ajouts supplémentaires choisis par l'élève, indexés par premier). */
export function fusionnerExposants(f: Facteurs, ajouts: Record<number, number>): Facteurs {
  const m = new Map<number, number>(f.map(({ p, e }) => [p, e]));
  for (const [p, a] of Object.entries(ajouts)) if (a > 0) m.set(Number(p), (m.get(Number(p)) ?? 0) + a);
  return [...m.entries()].sort((x, y) => x[0] - y[0]).map(([p, e]) => ({ p, e }));
}

// ---------------------------------------------------------------------------------------------------------------
// Modulo n
// ---------------------------------------------------------------------------------------------------------------

export const MODULES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function reduire(a: number, m: number): number {
  return ((a % m) + m) % m;
}

export function pgcdEntiers(a: number, b: number): number {
  return Number(pgcdBig(BigInt(a), BigInt(b)));
}

/** Les classes inversibles de Z/mZ sont celles de a avec PGCD(a, m) = 1 (a non nul, m ≥ 2). */
export function estInversible(a: number, m: number): boolean {
  return a !== 0 && pgcdEntiers(a, m) === 1;
}

export function inverseModulaire(a: number, m: number): number | null {
  for (let t = 1; t < m; t++) if (reduire(a * t, m) === 1) return t;
  return null;
}

export function tableMultiplication(m: number): number[][] {
  return Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => (i * j) % m));
}

/** Classes non nulles a pour lesquelles il existe b non nul avec a × b ≡ 0 (mod m). */
export function diviseursDeZero(m: number): number[] {
  const res: number[] = [];
  for (let a = 1; a < m; a++) for (let b = 1; b < m; b++) if ((a * b) % m === 0) { res.push(a); break; }
  return res;
}

export interface AnalyseModulo {
  m: number;
  inversibles: Array<{ a: number; inverse: number }>;
  diviseursDeZero: number[];
  /** Z/mZ est un corps si et seulement si m est premier : résultat admis dans le cours, illustré ici. */
  corps: boolean;
}

export function analyserModulo(m: number): AnalyseModulo {
  const inversibles: Array<{ a: number; inverse: number }> = [];
  for (let a = 1; a < m; a++) {
    const inv = inverseModulaire(a, m);
    if (inv !== null) inversibles.push({ a, inverse: inv });
  }
  return { m, inversibles, diviseursDeZero: diviseursDeZero(m), corps: estPremier(m) };
}

export type ResolutionCongruence =
  | { cas: "aucune"; d: number }
  | { cas: "unique"; d: 1; inverse: number; x: number }
  | { cas: "plusieurs"; d: number; m2: number; inverse: number; x0: number; solutions: number[] };

/**
 * Résout a·x ≡ c (mod m). d = PGCD(a, m). Si d ne divise pas c : aucune solution. Si d = 1 : a est inversible, une classe.
 * Sinon on divise par d (a' x ≡ c' (mod m'), avec a' inversible modulo m'), ce qui donne d classes modulo m.
 * Aucune division modulaire n'est faite sans avoir vérifié que le coefficient est inversible.
 */
export function resoudreCongruence(a: number, c: number, m: number): ResolutionCongruence {
  const ar = reduire(a, m);
  const cr = reduire(c, m);
  const d = ar === 0 ? m : pgcdEntiers(ar, m);
  if (cr % d !== 0) return { cas: "aucune", d };
  const m2 = m / d;
  const a2 = ar / d;
  if (d === 1) {
    const inverse = inverseModulaire(ar, m)!;
    return { cas: "unique", d: 1, inverse, x: reduire(inverse * cr, m) };
  }
  const inverse = m2 === 1 ? 0 : inverseModulaire(reduire(a2, m2), m2)!;
  const x0 = m2 === 1 ? 0 : reduire(inverse * (cr / d), m2);
  const solutions: number[] = [];
  for (let t = 0; t < d; t++) solutions.push(x0 + t * m2);
  return { cas: "plusieurs", d, m2, inverse, x0, solutions };
}

// ---------------------------------------------------------------------------------------------------------------
// Diviseurs, PGCD, PPCM
// ---------------------------------------------------------------------------------------------------------------

/** Tous les diviseurs positifs de n, triés dans l'ordre croissant, sans doublon, construits à partir des exposants. */
export function diviseursPositifs(n: number): number[] {
  let divs = [1];
  for (const { p, e } of facteursPremiers(n)) {
    const nouveaux: number[] = [];
    for (const d of divs) for (let k = 0, pk = 1; k <= e; k++, pk *= p) nouveaux.push(d * pk);
    divs = nouveaux;
  }
  return divs.sort((x, y) => x - y);
}

export function nombreDiviseurs(f: Facteurs): number {
  return f.reduce((acc, { e }) => acc * (e + 1), 1);
}

/** Diviseur ∏ p^choix[i] de n pour les exposants choisis (choix[i] ∈ [0, e_i]). */
export function diviseurDepuisExposants(f: Facteurs, choix: number[]): number {
  return f.reduce((acc, { p }, i) => acc * p ** (choix[i] ?? 0), 1);
}

export interface LigneExposants {
  p: number;
  ea: number;
  eb: number;
  min: number;
  max: number;
}

export interface ResultatPgcdPpcmDiviseurs {
  lignes: LigneExposants[];
  pgcd: bigint;
  ppcm: bigint;
  produit: bigint;
  verifie: boolean;
}

/** PGCD et PPCM par exposants (min et max), recoupés avec le calcul direct par l'algorithme d'Euclide. */
export function pgcdPpcmExposants(a: number, b: number): ResultatPgcdPpcmDiviseurs {
  const fa = facteursPremiers(a);
  const fb = facteursPremiers(b);
  const premiers = [...new Set([...fa.map((x) => x.p), ...fb.map((x) => x.p)])].sort((x, y) => x - y);
  const exp = (f: Facteurs, p: number) => f.find((x) => x.p === p)?.e ?? 0;
  const lignes = premiers.map((p) => {
    const ea = exp(fa, p);
    const eb = exp(fb, p);
    return { p, ea, eb, min: Math.min(ea, eb), max: Math.max(ea, eb) };
  });
  const g = lignes.reduce((acc, l) => acc * BigInt(l.p) ** BigInt(l.min), BigInt(1));
  const mm = lignes.reduce((acc, l) => acc * BigInt(l.p) ** BigInt(l.max), BigInt(1));
  const produit = BigInt(a) * BigInt(b);
  const verifie = g === pgcdBig(BigInt(a), BigInt(b)) && mm === ppcmBig(BigInt(a), BigInt(b)) && g * mm === produit;
  return { lignes, pgcd: g, ppcm: mm, produit, verifie };
}
