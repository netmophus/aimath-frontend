/**
 * Moteur SYMBOLIQUE EXACT du Laboratoire « Moivre, Euler et racines n-ièmes » (fonctions pures, sans React).
 *
 * Linéarisation de sin^p x · cos^q x (p + q ≤ 5, ou davantage : le calcul est général) par les formules d'Euler :
 *   sin x = (u − u⁻¹)/(2i),  cos x = (u + u⁻¹)/2   avec u = e^{ix}
 *   sin^p cos^q = (u − u⁻¹)^p (u + u⁻¹)^q / (2^{p+q} i^p)
 * Le numérateur P(u) est un polynôme de Laurent à coefficients ENTIERS (calcul exact, aucun flottant). Les coefficients
 * finaux sont des rationnels exacts (numérateur et dénominateur entiers). La réalité du résultat est VÉRIFIÉE (c_{-k} = conj c_k).
 *
 * Angles multiples : (cos x + i sin x)^n développé par le binôme de Newton, puis réduit à un polynôme en cos x (pour cos nx)
 * ou en sin x (pour sin nx), à coefficients entiers.
 */

// --- Rationnels exacts -------------------------------------------------------------------------------------------

export interface Rat {
  n: number;
  d: number;
}

export function pgcdEntier(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

export function rat(n: number, d = 1): Rat {
  if (d === 0) throw new Error("Dénominateur nul");
  const g = pgcdEntier(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g === 0 ? 0 : (s * n) / g, d: (s * d) / g };
}
export const ratAdd = (a: Rat, b: Rat): Rat => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const ratMul = (a: Rat, b: Rat): Rat => rat(a.n * b.n, a.d * b.d);
export const ratEgal = (a: Rat, b: Rat): boolean => a.n === b.n && a.d === b.d;
export const ratNul = (a: Rat): boolean => a.n === 0;
export const ratVal = (a: Rat): number => a.n / a.d;

function ppcm(a: number, b: number): number {
  return (a / pgcdEntier(a, b)) * b;
}

// --- Polynômes de Laurent en u = e^{ix} : exposant → coefficient entier ------------------------------------------

export type Laurent = Map<number, number>;

function laurentProduit(a: Laurent, b: Laurent): Laurent {
  const res: Laurent = new Map();
  for (const [ea, ca] of a) for (const [eb, cb] of b) res.set(ea + eb, (res.get(ea + eb) ?? 0) + ca * cb);
  for (const [e, c] of [...res]) if (c === 0) res.delete(e);
  return res;
}

/** (u + s·u⁻¹)^m, s = ±1, par exponentiation de polynômes de Laurent (exact). */
export function binomeEuler(m: number, s: 1 | -1): Laurent {
  let res: Laurent = new Map([[0, 1]]);
  const base: Laurent = new Map([[1, 1], [-1, s]]);
  for (let i = 0; i < m; i++) res = laurentProduit(res, base);
  return res;
}

/** P(u) = (u − u⁻¹)^p (u + u⁻¹)^q, entier. */
export function numerateurEuler(p: number, q: number): Laurent {
  return laurentProduit(binomeEuler(p, -1), binomeEuler(q, 1));
}

// --- Linéarisation ----------------------------------------------------------------------------------------------

export interface Linearisation {
  p: number;
  q: number;
  /** Numérateur P(u) (coefficients entiers, exposants de u = e^{ix}). */
  P: Laurent;
  /** 2^{p+q}. */
  puissance2: number;
  /** Terme constant a₀. */
  constante: Rat;
  /** Coefficient de cos kx (index k ≥ 1). */
  cos: Rat[];
  /** Coefficient de sin kx (index k ≥ 1). */
  sin: Rat[];
  /** Plus grand k intervenant. */
  degreMax: number;
  /** Dénominateur commun D (ppcm) et numérateurs entiers : résultat = (n₀ + Σ nc_k cos kx + Σ ns_k sin kx) / D. */
  denominateurCommun: number;
  numConstante: number;
  numCos: number[];
  numSin: number[];
}

/** (−i)^p = 1/i^p, exact : [partie réelle, partie imaginaire] entières. */
export function inversePuissanceI(p: number): [number, number] {
  return ([[1, 0], [0, -1], [-1, 0], [0, 1]] as Array<[number, number]>)[((p % 4) + 4) % 4];
}

export class IdentiteNonReelleErreur extends Error {}

/**
 * sin^p x cos^q x = a₀ + Σ_{k≥1} (α_k cos kx + β_k sin kx), coefficients rationnels exacts.
 * c_k = P_k (−i)^p / 2^{p+q} ; a₀ = c₀ ; α_k = 2 Re c_k ; β_k = −2 Im c_k. Lève IdentiteNonReelleErreur si le résultat
 * n'était pas réel (ce qui trahirait une erreur de signe sur les puissances de i).
 */
export function linearise(p: number, q: number): Linearisation {
  if (!Number.isInteger(p) || !Number.isInteger(q) || p < 0 || q < 0 || p + q < 1) throw new RangeError("Exposants invalides (p, q entiers positifs, p + q ≥ 1).");
  const P = numerateurEuler(p, q);
  const [ur, ui] = inversePuissanceI(p);
  const puissance2 = Math.pow(2, p + q);
  const coef = (k: number): { re: Rat; im: Rat } => {
    const pk = P.get(k) ?? 0;
    return { re: rat(pk * ur, puissance2), im: rat(pk * ui, puissance2) };
  };
  let degreMax = 0;
  for (const k of P.keys()) degreMax = Math.max(degreMax, Math.abs(k));
  const c0 = coef(0);
  if (!ratNul(c0.im)) throw new IdentiteNonReelleErreur("Terme constant non réel.");
  const cos: Rat[] = [rat(0)];
  const sin: Rat[] = [rat(0)];
  for (let k = 1; k <= degreMax; k++) {
    const ck = coef(k);
    const cmk = coef(-k);
    if (!ratEgal(ck.re, cmk.re) || !ratEgal(ck.im, ratMul(rat(-1), cmk.im))) throw new IdentiteNonReelleErreur(`c_{-${k}} n'est pas le conjugué de c_${k}.`);
    cos.push(ratMul(rat(2), ck.re));
    sin.push(ratMul(rat(-2), ck.im));
  }
  let D = c0.re.d;
  for (let k = 1; k <= degreMax; k++) D = ppcm(ppcm(D, cos[k].d), sin[k].d);
  const num = (r: Rat) => (r.n * D) / r.d;
  return {
    p,
    q,
    P,
    puissance2,
    constante: c0.re,
    cos,
    sin,
    degreMax,
    denominateurCommun: D,
    numConstante: num(c0.re),
    numCos: cos.map(num),
    numSin: sin.map(num),
  };
}

/** Valeur numérique de la forme linéarisée en x (radians). */
export function evaluerLineaire(l: Linearisation, x: number): number {
  let v = ratVal(l.constante);
  for (let k = 1; k <= l.degreMax; k++) v += ratVal(l.cos[k]) * Math.cos(k * x) + ratVal(l.sin[k]) * Math.sin(k * x);
  return v;
}

/** sin^p x cos^q x, évalué directement. */
export function evaluerInitial(p: number, q: number, x: number): number {
  return Math.pow(Math.sin(x), p) * Math.pow(Math.cos(x), q);
}

/** Toutes les combinaisons admissibles (p, q) avec 1 ≤ p + q ≤ max. */
export function combinaisonsAdmissibles(max = 5): Array<[number, number]> {
  const res: Array<[number, number]> = [];
  for (let p = 0; p <= max; p++) for (let q = 0; q <= max - p; q++) if (p + q >= 1) res.push([p, q]);
  return res;
}

// --- Coefficients binomiaux --------------------------------------------------------------------------------------

export function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

// --- Polynômes ordinaires à coefficients entiers (index = puissance) ---------------------------------------------

export type Poly = number[];

export function polyAdd(a: Poly, b: Poly): Poly {
  const r: Poly = Array(Math.max(a.length, b.length)).fill(0);
  a.forEach((c, i) => (r[i] += c));
  b.forEach((c, i) => (r[i] += c));
  return polyNettoyer(r);
}
export function polyMul(a: Poly, b: Poly): Poly {
  const r: Poly = Array(a.length + b.length - 1).fill(0);
  a.forEach((ca, i) => b.forEach((cb, j) => (r[i + j] += ca * cb)));
  return polyNettoyer(r);
}
export const polyScale = (a: Poly, k: number): Poly => polyNettoyer(a.map((c) => c * k));
export function polyPow(a: Poly, m: number): Poly {
  let r: Poly = [1];
  for (let i = 0; i < m; i++) r = polyMul(r, a);
  return r;
}
function polyNettoyer(a: Poly): Poly {
  const r = a.map((c) => (c === 0 ? 0 : c)); // jamais -0
  while (r.length > 1 && r[r.length - 1] === 0) r.pop();
  return r;
}
export const polyEval = (a: Poly, x: number): number => a.reduceRight((acc, c) => acc * x + c, 0);

// --- Angles multiples --------------------------------------------------------------------------------------------

/** Terme k du binôme de (cos x + i sin x)^n : C(n,k) · i^k · cos^{n−k} x · sin^k x. */
export interface TermeBinome {
  k: number;
  binom: number;
  /** i^k, exact : 1, i, −1 ou −i. */
  puissanceI: [number, number];
  /** Terme réel (k pair) ou imaginaire pur (k impair). */
  reel: boolean;
  /** Coefficient réel signé (±C(n,k)) du terme une fois i^k absorbé : cos nx pour k pair, sin nx pour k impair. */
  coefReel: number;
}

export interface AnglesMultiples {
  n: number;
  termes: TermeBinome[];
  /** cos nx = Σ_{k pair} coefReel · cos^{n−k} x sin^k x. */
  termesCos: TermeBinome[];
  /** sin nx = Σ_{k impair} coefReel · cos^{n−k} x sin^k x. */
  termesSin: TermeBinome[];
  /** cos nx = polyCos(cos x) : polynôme de Tchebychev T_n. */
  polyCos: Poly;
  /** sin nx : si n impair, polynôme en sin x ; si n pair, cos x × polynôme en sin x. */
  polySin: Poly;
  sinAvecFacteurCos: boolean;
}

export function anglesMultiples(n: number): AnglesMultiples {
  if (!Number.isInteger(n) || n < 1 || n > 12) throw new RangeError("n doit être un entier entre 1 et 12.");
  const termes: TermeBinome[] = [];
  for (let k = 0; k <= n; k++) {
    const [re, im] = ([[1, 0], [0, 1], [-1, 0], [0, -1]] as Array<[number, number]>)[k % 4];
    const b = binomial(n, k);
    termes.push({ k, binom: b, puissanceI: [re, im], reel: k % 2 === 0, coefReel: b * (k % 2 === 0 ? re : im) });
  }
  // cos x = c (variable du polynôme), sin² = 1 − c².
  let polyCos: Poly = [0];
  for (const t of termes) if (t.reel) polyCos = polyAdd(polyCos, polyScale(polyMul(polyPow([0, 1], n - t.k), polyPow([1, 0, -1], t.k / 2)), t.coefReel));
  // sin x = s (variable), cos² = 1 − s². n impair : n−k pair ; n pair : n−k impair → facteur cos x en évidence.
  const sinAvecFacteurCos = n % 2 === 0;
  let polySin: Poly = [0];
  for (const t of termes) {
    if (t.reel) continue;
    const m = n - t.k; // puissance de cos
    const facteur = sinAvecFacteurCos ? polyPow([1, 0, -1], (m - 1) / 2) : polyPow([1, 0, -1], m / 2);
    polySin = polyAdd(polySin, polyScale(polyMul(polyPow([0, 1], t.k), facteur), t.coefReel));
  }
  return { n, termes, termesCos: termes.filter((t) => t.reel), termesSin: termes.filter((t) => !t.reel), polyCos, polySin, sinAvecFacteurCos };
}

export function evaluerCosMultiple(a: AnglesMultiples, x: number): { direct: number; polynome: number } {
  return { direct: Math.cos(a.n * x), polynome: polyEval(a.polyCos, Math.cos(x)) };
}
export function evaluerSinMultiple(a: AnglesMultiples, x: number): { direct: number; polynome: number } {
  const p = polyEval(a.polySin, Math.sin(x));
  return { direct: Math.sin(a.n * x), polynome: a.sinAvecFacteurCos ? Math.cos(x) * p : p };
}
