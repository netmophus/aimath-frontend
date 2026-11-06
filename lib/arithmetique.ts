/**
 * Arithmétique exacte du Laboratoire PGCD & PPCM (voir docs/syntaxe-pgcd.md) — module ISOMORPHE et PUR (aucun accès à
 * window/document, aucun calcul flottant). Les entiers relatifs sont des `bigint` ; les calculs modulo p (p ≤ 17)
 * utilisent des `number` entiers, tous bornés. Les littéraux `1n` ne sont pas utilisés : le projet compile en ES2017.
 */

export const Z0 = BigInt(0);
export const Z1 = BigInt(1);

export class ErreurArithmetique extends Error {}

/** Nombre maximal de chiffres acceptés à la saisie (au-delà : message clair, aucun calcul). */
export const MAX_CHIFFRES = 15;
/** Les décompositions en facteurs premiers sont limitées à 12 chiffres (division d'essai jusqu'à 10^6). */
export const MAX_CHIFFRES_FACTEURS = 12;

export type LectureEntier = { ok: true; valeur: bigint } | { ok: false; erreur: string };

/** Lit un entier relatif saisi en texte. Refuse vide, décimaux, texte, et plus de `maxChiffres` chiffres. */
export function lireEntier(texte: string, maxChiffres: number = MAX_CHIFFRES): LectureEntier {
  const t = texte.trim().replace(/−/g, "-");
  if (t === "") return { ok: false, erreur: "Entre un entier." };
  if (/^[+-]?\d*[.,]\d*$/.test(t) && /\d/.test(t)) return { ok: false, erreur: "Entre un entier, pas un nombre décimal." };
  if (!/^[+-]?\d+$/.test(t)) return { ok: false, erreur: "Saisie non valide : entre un entier (par exemple 12 ou -7)." };
  const chiffres = t.replace(/^[+-]/, "").replace(/^0+(?=\d)/, "");
  if (chiffres.length > maxChiffres) {
    return { ok: false, erreur: `Nombre trop grand : ${maxChiffres} chiffres au maximum.` };
  }
  return { ok: true, valeur: BigInt(t.replace(/^\+/, "")) };
}

export function abs(n: bigint): bigint {
  return n < Z0 ? -n : n;
}

/** Signe utilisable comme facteur : 1 pour n ≥ 0, −1 sinon. */
export function signe(n: bigint): bigint {
  return n < Z0 ? -Z1 : Z1;
}

/** a divise n (a = 0 ne divise que 0, conformément à la définition de la divisibilité dans ℤ). */
export function divise(a: bigint, n: bigint): boolean {
  return a === Z0 ? n === Z0 : n % a === Z0;
}

/** Division euclidienne de a par b > 0 : a = b × q + r avec 0 ≤ r < b (r jamais négatif). */
export function divisionEuclidienne(a: bigint, b: bigint): { quotient: bigint; reste: bigint } {
  if (b <= Z0) throw new ErreurArithmetique("Le diviseur doit être strictement positif.");
  const reste = ((a % b) + b) % b;
  return { quotient: (a - reste) / b, reste };
}

// ---------------------------------------------------------------------------------------------------------------
// Algorithme d'Euclide
// ---------------------------------------------------------------------------------------------------------------

export interface DivisionEtape {
  dividende: bigint;
  diviseur: bigint;
  quotient: bigint;
  reste: bigint;
}

export interface ResultatEuclide {
  /** |a| et |b| : les calculs se font sur les valeurs absolues. */
  a: bigint;
  b: bigint;
  etapes: DivisionEtape[];
  pgcd: bigint;
}

/** PGCD(a, b) par divisions euclidiennes successives sur |a| et |b|. PGCD(0, 0) n'est pas défini : erreur contrôlée. */
export function euclide(aRelatif: bigint, bRelatif: bigint): ResultatEuclide {
  if (aRelatif === Z0 && bRelatif === Z0) throw new ErreurArithmetique("PGCD(0, 0) n'est pas défini.");
  const a = abs(aRelatif);
  const b = abs(bRelatif);
  const etapes: DivisionEtape[] = [];
  let x = a;
  let y = b;
  while (y !== Z0) {
    const { quotient, reste } = divisionEuclidienne(x, y);
    etapes.push({ dividende: x, diviseur: y, quotient, reste });
    x = y;
    y = reste;
  }
  return { a, b, etapes, pgcd: x };
}

export function pgcd(a: bigint, b: bigint): bigint {
  return euclide(a, b).pgcd;
}

/** PPCM(a, b) ≥ 0 ; vaut 0 si l'un des deux est nul (convention usuelle). */
export function ppcm(a: bigint, b: bigint): bigint {
  if (a === Z0 || b === Z0) return Z0;
  return abs(a * b) / pgcd(a, b);
}

// ---------------------------------------------------------------------------------------------------------------
// Facteurs premiers, PGCD et PPCM
// ---------------------------------------------------------------------------------------------------------------

export type Facteurs = Array<{ p: number; e: number }>;

/** Décomposition en facteurs premiers d'un entier 1 ≤ n ≤ 10^12 (division d'essai exacte). */
export function facteursPremiers(n: number): Facteurs {
  if (!Number.isSafeInteger(n) || n < 1) throw new ErreurArithmetique("Il faut un entier naturel non nul.");
  const res: Facteurs = [];
  let reste = n;
  for (let p = 2; p * p <= reste; p += p === 2 ? 1 : 2) {
    if (reste % p !== 0) continue;
    let e = 0;
    while (reste % p === 0) {
      reste /= p;
      e++;
    }
    res.push({ p, e });
  }
  if (reste > 1) res.push({ p: reste, e: 1 });
  return res;
}

export interface LigneFacteur {
  p: number;
  ea: number;
  eb: number;
  min: number;
  max: number;
}

export interface ResultatFacteurs {
  fa: Facteurs;
  fb: Facteurs;
  lignes: LigneFacteur[];
  pgcd: bigint;
  ppcm: bigint;
  produit: bigint;
}

function puissanceProduit(lignes: LigneFacteur[], exposant: (l: LigneFacteur) => number): bigint {
  let r = Z1;
  for (const l of lignes) for (let i = 0; i < exposant(l); i++) r *= BigInt(l.p);
  return r;
}

export function pgcdPpcmParFacteurs(a: number, b: number): ResultatFacteurs {
  const fa = facteursPremiers(a);
  const fb = facteursPremiers(b);
  const premiers = Array.from(new Set([...fa.map((f) => f.p), ...fb.map((f) => f.p)])).sort((x, y) => x - y);
  const exp = (f: Facteurs, p: number) => f.find((x) => x.p === p)?.e ?? 0;
  const lignes = premiers.map((p) => {
    const ea = exp(fa, p);
    const eb = exp(fb, p);
    return { p, ea, eb, min: Math.min(ea, eb), max: Math.max(ea, eb) };
  });
  return {
    fa,
    fb,
    lignes,
    pgcd: puissanceProduit(lignes, (l) => l.min),
    ppcm: puissanceProduit(lignes, (l) => l.max),
    produit: BigInt(a) * BigInt(b),
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Bézout
// ---------------------------------------------------------------------------------------------------------------

/** Étape de la remontée : d = alpha × R[k] + beta × R[k+1] (R = suite des restes, R[0] = |a|, R[1] = |b|). */
export interface EtapeRemontee {
  k: number;
  alpha: bigint;
  beta: bigint;
}

export interface ResultatBezout {
  d: bigint;
  u: bigint;
  v: bigint;
  /** Suite des restes R[0] = |a|, R[1] = |b|, R[2], … jusqu'au dernier reste non nul (le PGCD). */
  restes: bigint[];
  /** quotients[i] = quotient de R[i-1] par R[i] (quotients[0] inutilisé). */
  quotients: bigint[];
  divisions: DivisionEtape[];
  remontee: EtapeRemontee[];
}

/** Coefficients de Bézout : a × u + b × v = PGCD(a, b), pour tous entiers relatifs non tous deux nuls. */
export function bezout(a: bigint, b: bigint): ResultatBezout {
  if (a === Z0 && b === Z0) throw new ErreurArithmetique("PGCD(0, 0) n'est pas défini.");
  const A = abs(a);
  const B = abs(b);
  const R: bigint[] = [A, B];
  const Q: bigint[] = [Z0];
  const divisions: DivisionEtape[] = [];
  let i = 1;
  while (R[i] !== Z0) {
    const { quotient, reste } = divisionEuclidienne(R[i - 1], R[i]);
    Q[i] = quotient;
    R[i + 1] = reste;
    divisions.push({ dividende: R[i - 1], diviseur: R[i], quotient, reste });
    i++;
  }
  const m = i - 1; // indice du dernier reste non nul
  const d = R[m];

  const remontee: EtapeRemontee[] = [];
  let alpha: bigint;
  let beta: bigint;
  if (m === 0) {
    alpha = Z1; // B = 0 : d = A = 1 × A + 0 × B
    beta = Z0;
  } else if (m === 1) {
    alpha = Z0; // B divise A : d = B = 0 × A + 1 × B
    beta = Z1;
  } else {
    let k = m - 2;
    alpha = Z1; // d = R[m] = R[m-2] − Q[m-1] × R[m-1]
    beta = -Q[m - 1];
    remontee.push({ k, alpha, beta });
    while (k > 0) {
      const nouvelAlpha = beta; // on remplace R[k+1] = R[k-1] − Q[k] × R[k]
      const nouveauBeta = alpha - beta * Q[k];
      alpha = nouvelAlpha;
      beta = nouveauBeta;
      k--;
      remontee.push({ k, alpha, beta });
    }
  }
  return { d, u: alpha * signe(a), v: beta * signe(b), restes: R.slice(0, m + 1), quotients: Q, divisions, remontee };
}

// ---------------------------------------------------------------------------------------------------------------
// Gauss
// ---------------------------------------------------------------------------------------------------------------

export interface ResultatGauss {
  produit: bigint;
  /** Hypothèse 1 : a divise bc. */
  divBC: boolean;
  /** PGCD(a, b), ou null s'il n'est pas défini (a = b = 0). */
  pgcdAB: bigint | null;
  /** Hypothèse 2 : PGCD(a, b) = 1 (jamais vraie quand a = b = 0). */
  copremiers: boolean;
  /** Le théorème s'applique : les deux hypothèses sont vraies. */
  applicable: boolean;
  /** Vérification numérique directe « a divise c » (information, jamais déduite de l'absence d'hypothèse). */
  aDiviseC: boolean;
}

export function gauss(a: bigint, b: bigint, c: bigint): ResultatGauss {
  const produit = b * c;
  const divBC = divise(a, produit);
  const pgcdAB = a === Z0 && b === Z0 ? null : pgcd(a, b);
  const copremiers = pgcdAB === Z1;
  return { produit, divBC, pgcdAB, copremiers, applicable: divBC && copremiers, aDiviseC: divise(a, c) };
}

// ---------------------------------------------------------------------------------------------------------------
// Équations ax + by = c dans ℤ²
// ---------------------------------------------------------------------------------------------------------------

export type ResultatEquationZ2 =
  | { solvable: false; d: bigint }
  | {
      solvable: true;
      d: bigint;
      u: bigint;
      v: bigint;
      /** c / d */
      facteur: bigint;
      x0: bigint;
      y0: bigint;
      /** x = x0 + pasX × k, y = y0 − pasY × k */
      pasX: bigint;
      pasY: bigint;
    };

export function equationZ2(a: bigint, b: bigint, c: bigint): ResultatEquationZ2 {
  if (a === Z0 && b === Z0) throw new ErreurArithmetique("a et b ne peuvent pas être tous les deux nuls.");
  const { d, u, v } = bezout(a, b);
  if (!divise(d, c)) return { solvable: false, d };
  const facteur = c / d;
  return { solvable: true, d, u, v, facteur, x0: u * facteur, y0: v * facteur, pasX: b / d, pasY: a / d };
}

/** Solution (x, y) correspondant à k. */
export function solutionZ2(r: Extract<ResultatEquationZ2, { solvable: true }>, k: bigint): { x: bigint; y: bigint } {
  return { x: r.x0 + r.pasX * k, y: r.y0 - r.pasY * k };
}

// ---------------------------------------------------------------------------------------------------------------
// Congruences modulo un nombre premier p
// ---------------------------------------------------------------------------------------------------------------

export const PREMIERS = [2, 3, 5, 7, 11, 13, 17] as const;

/** Réduit n modulo p dans [0, p[, y compris pour n négatif. */
export function modulo(n: number | bigint, p: number): number {
  const P = BigInt(p);
  return Number(((BigInt(n) % P) + P) % P);
}

export interface LigneInverse {
  t: number;
  produit: number;
  reste: number;
}

export type ResultatEquationModP =
  | { cas: "nulle-toutes"; ar: number; cr: number; p: number }
  | { cas: "nulle-aucune"; ar: number; cr: number; p: number }
  | {
      cas: "inversible";
      ar: number;
      cr: number;
      p: number;
      table: LigneInverse[];
      inverse: number;
      produit: number;
      x: number;
    };

/** Résout a·x ≡ c (mod p), p premier. Jamais d'inversion de 0. */
export function equationModP(a: bigint, c: bigint, p: number): ResultatEquationModP {
  if (!(PREMIERS as readonly number[]).includes(p)) throw new ErreurArithmetique("Le module doit être un nombre premier de la liste.");
  const ar = modulo(a, p);
  const cr = modulo(c, p);
  if (ar === 0) return cr === 0 ? { cas: "nulle-toutes", ar, cr, p } : { cas: "nulle-aucune", ar, cr, p };
  const table: LigneInverse[] = [];
  for (let t = 1; t < p; t++) table.push({ t, produit: ar * t, reste: (ar * t) % p });
  const inverse = table.find((l) => l.reste === 1)!.t; // existe car p premier et p ne divise pas a
  const produit = inverse * cr;
  return { cas: "inversible", ar, cr, p, table, inverse, produit, x: produit % p };
}

export interface CoefficientsSysteme {
  a1: number;
  b1: number;
  c1: number;
  a2: number;
  b2: number;
  c2: number;
}

export interface SubstitutionSysteme {
  /** Équation (1 ou 2) dans laquelle on isole une inconnue. */
  eqIsolee: 1 | 2;
  /** Inconnue isolée et inconnue restante. */
  isolee: "x" | "y";
  autre: "x" | "y";
  /** Coefficient de l'inconnue isolée (réduit, non nul) et son inverse. */
  coef: number;
  inverse: number;
  /** isolee ≡ alpha − m × autre  (mod p), avec alpha, m dans [0, p[. */
  alpha: number;
  m: number;
  /** Autre équation : gV × isolee + gW × autre ≡ gc. */
  gV: number;
  gW: number;
  gc: number;
  /** Développement : gV × alpha + (gW − gV × m) × autre ≡ gc, non réduit. */
  constante: number;
  coefAutre: number;
  /** Après réduction : K + A × autre ≡ gc, puis A × autre ≡ D. */
  K: number;
  A: number;
  D: number;
  issue: "unique" | "aucune" | "plusieurs";
  invA: number | null;
  valeurAutre: number | null;
  valeurIsolee: number | null;
}

export interface ResultatSystemeModP {
  p: number;
  reduit: CoefficientsSysteme;
  substitution: SubstitutionSysteme | null;
  /** Énumération exhaustive des couples (x, y) de classes, indépendante de la méthode : sert de vérification. */
  solutions: Array<[number, number]>;
  kind: "unique" | "aucune" | "plusieurs";
}

/**
 * Étape « résoudre pour l'autre inconnue » : faut-il afficher la ligne intermédiaire A·W ≡ D ? Non quand A = 1 et que la
 * solution est unique, car cette ligne est déjà la solution W ≡ D (la répéter faisait doublon, par ex. « y ≡ 0 » deux fois).
 */
export function afficherLigneIntermediaire(s: Pick<SubstitutionSysteme, "A" | "issue">): boolean {
  return !(s.A === 1 && s.issue === "unique");
}

function inverseModP(a: number, p: number): number {
  for (let t = 1; t < p; t++) if ((a * t) % p === 1) return t;
  throw new ErreurArithmetique("Aucun inverse : l'élément est nul modulo p.");
}

/** Résout le système a1 x + b1 y ≡ c1, a2 x + b2 y ≡ c2 (mod p) par substitution, et le vérifie par énumération. */
export function systemeModP(p: number, brut: CoefficientsSysteme): ResultatSystemeModP {
  if (!(PREMIERS as readonly number[]).includes(p)) throw new ErreurArithmetique("Le module doit être un nombre premier de la liste.");
  const r: CoefficientsSysteme = {
    a1: modulo(brut.a1, p),
    b1: modulo(brut.b1, p),
    c1: modulo(brut.c1, p),
    a2: modulo(brut.a2, p),
    b2: modulo(brut.b2, p),
    c2: modulo(brut.c2, p),
  };

  const solutions: Array<[number, number]> = [];
  for (let x = 0; x < p; x++)
    for (let y = 0; y < p; y++)
      if ((r.a1 * x + r.b1 * y) % p === r.c1 && (r.a2 * x + r.b2 * y) % p === r.c2) solutions.push([x, y]);
  const kind = solutions.length === 0 ? "aucune" : solutions.length === 1 ? "unique" : "plusieurs";

  // Choix de l'inconnue à isoler : coefficient égal à 1 en priorité, sinon premier coefficient non nul.
  const candidats: Array<{ eq: 1 | 2; v: "x" | "y"; coef: number }> = [
    { eq: 1, v: "x", coef: r.a1 },
    { eq: 1, v: "y", coef: r.b1 },
    { eq: 2, v: "x", coef: r.a2 },
    { eq: 2, v: "y", coef: r.b2 },
  ];
  const choix = candidats.find((c) => c.coef === 1) ?? candidats.find((c) => c.coef !== 0);
  if (!choix) return { p, reduit: r, substitution: null, solutions, kind };

  const { eq, v: isolee, coef } = choix;
  const autre = isolee === "x" ? "y" : "x";
  const inverse = inverseModP(coef, p);
  const [, cW, cc] = eq === 1 ? [isolee === "x" ? r.a1 : r.b1, isolee === "x" ? r.b1 : r.a1, r.c1] : [isolee === "x" ? r.a2 : r.b2, isolee === "x" ? r.b2 : r.a2, r.c2];
  const alpha = (inverse * cc) % p;
  const m = (inverse * cW) % p;
  const [gV, gW, gc] = eq === 1 ? [isolee === "x" ? r.a2 : r.b2, isolee === "x" ? r.b2 : r.a2, r.c2] : [isolee === "x" ? r.a1 : r.b1, isolee === "x" ? r.b1 : r.a1, r.c1];
  const constante = gV * alpha;
  const coefAutre = gW - gV * m;
  const K = modulo(constante, p);
  const A = modulo(coefAutre, p);
  const D = modulo(gc - K, p);

  let issue: SubstitutionSysteme["issue"];
  let invA: number | null = null;
  let valeurAutre: number | null = null;
  let valeurIsolee: number | null = null;
  if (A !== 0) {
    issue = "unique";
    invA = inverseModP(A, p);
    valeurAutre = (invA * D) % p;
    valeurIsolee = modulo(alpha - m * valeurAutre, p);
  } else {
    issue = D === 0 ? "plusieurs" : "aucune";
  }
  return {
    p,
    reduit: r,
    substitution: { eqIsolee: eq, isolee, autre, coef, inverse, alpha, m, gV, gW, gc, constante, coefAutre, K, A, D, issue, invA, valeurAutre, valeurIsolee },
    solutions,
    kind,
  };
}
