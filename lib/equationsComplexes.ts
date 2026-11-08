/**
 * Moteur mathématique du Laboratoire « Équations dans ℂ » (Terminale C). Fonctions PURES, sans React, sans `eval`.
 *
 * Réutilise les opérations de lib/complexes.ts (Cx, add, mul, div, modC, argument…).
 *
 * Politique de précision
 * - Un polynôme est donné par ses coefficients COMPLEXES par degrés DÉCROISSANTS : [a, b, c] pour az² + bz + c.
 * - « P(z) = 0 » se juge sur une grandeur SANS DIMENSION : |P(z)| ≤ tol × échelle(P, z), où l'échelle est
 *   Σ |a_k|·|z|^k (taille des termes qui se compensent). Tolérance par défaut : 1e-9 (relative). On ne compare jamais
 *   P(z) à 0 avec `===` après un calcul flottant ; en revanche, si tous les coefficients et z sont de petits entiers, le
 *   calcul est EXACT (entiers < 2^40) et on peut l'affirmer (voir `calculExact`).
 * - Δ est jugé nul s'il est négligeable devant |b|² et |4ac| (tolérance relative 1e-12) : un reste d'arrondi ne transforme
 *   donc pas une racine double en deux racines presque égales.
 * - Multiplicités (3e degré) : décidées par la structure algébrique (Δ_Q = 0, z₀ racine de Q), jamais par l'écart de deux
 *   racines flottantes proches, sauf la comparaison finale z₀ ≈ racine de Q (tolérance 1e-8 relative, documentée).
 * - Valeurs exactes ou approchées : le moteur ne produit que des flottants ; c'est l'affichage (lib/equationsComplexesAffichage)
 *   qui décide, valeur par valeur, si une écriture exacte est reconnue.
 */

import { add, argument, conj, cx, div, estFini, modC, mul, oppose, sub, TOL, type Cx } from "./complexes";

export type { Cx };

/** Plafond des coefficients saisis : au-delà, b² − 4ac perdrait sa précision (ou déborderait). */
export const COEF_MAX = 1e6;
/** Tolérance (relative) pour décider qu'un nombre annule un polynôme. */
export const TOL_RACINE = TOL;
/** Tolérance (relative) de Δ = 0. */
export const TOL_DELTA = 1e-12;
/** Tolérance (relative) pour confondre z₀ et une racine du quotient (multiplicités). */
export const TOL_MULTIPLICITE = 1e-8;
/** Tolérance (relative) acceptée pour une réponse d'élève (arrondi à 3 décimales toléré). */
export const TOL_REPONSE_RACINE = 5e-3;

const reel = (x: number): Cx => ({ re: x, im: 0 });
const net = (x: number): number => (x === 0 || Object.is(x, -0) ? 0 : x);
const netC = (z: Cx): Cx => ({ re: net(z.re), im: net(z.im) });

// --- Second degré à coefficients RÉELS : discriminant ---------------------------------------------------------

export type CasDiscriminant = "deux-reelles" | "double" | "complexes";

export type ResultatDiscriminant =
  | { ok: false; erreur: string }
  | {
      ok: true;
      a: number;
      b: number;
      c: number;
      delta: number;
      cas: CasDiscriminant;
      /** Racines distinctes (UNE seule si Δ = 0). Réelles croissantes ; sinon partie imaginaire négative d'abord. */
      racines: Cx[];
      /** Multiplicité de chaque racine de `racines` (2 pour la racine double). */
      multiplicites: number[];
    };

/** Δ = b² − 4ac et ses conséquences, pour a, b, c RÉELS. a = 0 est refusé. */
export function discriminantReel(a: number, b: number, c: number): ResultatDiscriminant {
  if (![a, b, c].every(Number.isFinite)) return { ok: false, erreur: "Un des coefficients n'est pas un nombre fini." };
  if ([a, b, c].some((x) => Math.abs(x) > COEF_MAX)) return { ok: false, erreur: `Choisis des coefficients de valeur absolue au plus ${COEF_MAX.toLocaleString("fr-FR")}.` };
  if (a === 0) return { ok: false, erreur: "Il faut a ≠ 0 : si a = 0, l'équation n'est plus du second degré." };
  const delta = b * b - 4 * a * c;
  const reference = Math.max(b * b, Math.abs(4 * a * c));
  if (Math.abs(delta) <= TOL_DELTA * Math.max(reference, 1e-300)) {
    return { ok: true, a, b, c, delta: 0, cas: "double", racines: [reel(net(-b / (2 * a)))], multiplicites: [2] };
  }
  if (delta > 0) {
    const s = Math.sqrt(delta);
    const q = -0.5 * (b + (b >= 0 ? s : -s)); // formule stable : pas de soustraction de deux nombres proches
    const x1 = q / a;
    const x2 = q === 0 ? 0 : c / q;
    const [p, g] = x1 <= x2 ? [x1, x2] : [x2, x1];
    return { ok: true, a, b, c, delta, cas: "deux-reelles", racines: [reel(net(p)), reel(net(g))], multiplicites: [1, 1] };
  }
  const re = net(-b / (2 * a));
  const im = Math.sqrt(-delta) / (2 * Math.abs(a));
  return { ok: true, a, b, c, delta, cas: "complexes", racines: [{ re, im: -im }, { re, im }], multiplicites: [1, 1] };
}

// --- Racines carrées d'un complexe ----------------------------------------------------------------------------

/** Cas de la discussion sur le signe de Y (étape « choix des signes »). */
export type CasRacineCarree = "nul" | "y-positif" | "y-negatif" | "reel-positif" | "reel-negatif";

export type ResultatRacineCarree =
  | { ok: false; erreur: string }
  | {
      ok: true;
      X: number;
      Y: number;
      cas: CasRacineCarree;
      /** |Δ| = √(X² + Y²). */
      module: number;
      /** x² et y² (étape 4). */
      x2: number;
      y2: number;
      /** Racine carrée choisie δ (Re δ > 0, ou Re δ = 0 et Im δ > 0) ; −δ est l'autre. 0 si Δ = 0. */
      delta: Cx;
      /** Les racines carrées DISTINCTES : [δ, −δ] si Δ ≠ 0, [0] si Δ = 0. */
      racines: Cx[];
    };

/**
 * Racines carrées de Δ = X + iY par la méthode du programme (identification, module, signe de xy).
 * Calcul stable : pour X ≥ 0, x = √((m+X)/2) puis y = Y/(2x) ; pour X < 0, y = ±√((m−X)/2) puis x = Y/(2y) (aucune
 * soustraction de deux nombres proches). Δ = 0 donne l'UNIQUE racine 0.
 */
export function racineCarree(X: number, Y: number): ResultatRacineCarree {
  if (!Number.isFinite(X) || !Number.isFinite(Y)) return { ok: false, erreur: "X et Y doivent être des nombres finis." };
  if (Math.abs(X) > COEF_MAX || Math.abs(Y) > COEF_MAX) return { ok: false, erreur: `Choisis X et Y de valeur absolue au plus ${COEF_MAX.toLocaleString("fr-FR")}.` };
  return racineCarreeSansPlafond(X, Y);
}

/** Même calcul, sans plafond sur X et Y (le discriminant d'une équation à coefficients ≤ COEF_MAX peut dépasser COEF_MAX). */
function racineCarreeSansPlafond(X: number, Y: number): ResultatRacineCarree {
  if (!Number.isFinite(X) || !Number.isFinite(Y)) return { ok: false, erreur: "X et Y doivent être des nombres finis." };
  const m = Math.hypot(X, Y);
  if (m === 0) return { ok: true, X, Y, cas: "nul", module: 0, x2: 0, y2: 0, delta: reel(0), racines: [reel(0)] };
  const x2 = X >= 0 ? (m + X) / 2 : Y * Y / (2 * (m - X));
  const y2 = X < 0 ? (m - X) / 2 : Y * Y / (2 * (m + X));
  let re: number;
  let im: number;
  if (X >= 0) {
    re = Math.sqrt((m + X) / 2);
    im = Y / (2 * re);
  } else {
    im = Math.sqrt((m - X) / 2) * (Y >= 0 ? 1 : -1);
    re = Y / (2 * im);
    if (Y === 0) re = 0; // X < 0, Y = 0 : δ = i√(−X)
  }
  // Représentant principal : Re δ > 0, ou Re δ = 0 et Im δ > 0.
  if (re < 0 || (re === 0 && im < 0)) {
    re = -re;
    im = -im;
  }
  const delta = netC({ re, im });
  const cas: CasRacineCarree = Y > 0 ? "y-positif" : Y < 0 ? "y-negatif" : X > 0 ? "reel-positif" : "reel-negatif";
  return { ok: true, X, Y, cas, module: m, x2, y2, delta, racines: [delta, oppose(delta)] };
}

/** Racine carrée principale d'un complexe (Re ≥ 0), pour les autres fonctions du moteur. */
export function racineCarreeComplexe(z: Cx): Cx | null {
  const r = racineCarree(z.re, z.im);
  return r.ok ? r.delta : null;
}

// --- Polynômes : évaluation, échelle, test de racine, division ------------------------------------------------

/** Coefficients complexes par degrés décroissants. */
export type Poly = Cx[];

/** Valeur P(z) par la méthode de Horner. */
export function evaluerPolynome(p: Poly, z: Cx): Cx {
  let r: Cx = p.length > 0 ? p[0] : cx(0);
  for (let k = 1; k < p.length; k++) r = add(mul(r, z), p[k]);
  return r;
}

/** Échelle Σ |a_k|·|z|^k : grandeur de référence pour juger si |P(z)| est négligeable. */
export function echellePolynome(p: Poly, z: Cx): number {
  const m = modC(z);
  let s = 0;
  let puissance = 1;
  for (let k = p.length - 1; k >= 0; k--) {
    s += modC(p[k]) * puissance;
    puissance *= m;
  }
  return s;
}

export interface BilanRacine {
  /** P(z) calculé. */
  valeur: Cx;
  /** |P(z)|. */
  module: number;
  /** Échelle Σ|a_k||z|^k. */
  echelle: number;
  /** Seuil de décision : tol × échelle. */
  seuil: number;
  /** z annule P (à la tolérance près). */
  estRacine: boolean;
  /** Le calcul a été fait en entiers exacts : l'égalité (ou l'inégalité) est alors une certitude, pas une approximation. */
  exact: boolean;
}

/** Tous les coefficients et z sont des entiers de taille modérée : le calcul flottant de P(z) est alors EXACT. */
export function calculExact(p: Poly, z: Cx): boolean {
  const entiers = [...p, z].every((w) => Number.isInteger(w.re) && Number.isInteger(w.im));
  if (!entiers) return false;
  return echellePolynome(p, z) * Math.max(1, modC(z)) < 2 ** 40;
}

/** z est-il racine de P ? Décision à tolérance relative, avec le détail utile à l'affichage. */
export function bilanRacine(p: Poly, z: Cx, tol = TOL_RACINE): BilanRacine {
  const valeur = evaluerPolynome(p, z);
  const echelle = echellePolynome(p, z);
  const moduleValeur = modC(valeur);
  const exact = calculExact(p, z);
  const seuil = tol * Math.max(echelle, 1e-300);
  return { valeur, module: moduleValeur, echelle, seuil, estRacine: exact ? moduleValeur === 0 : moduleValeur <= seuil, exact };
}

export const estRacine = (p: Poly, z: Cx, tol = TOL_RACINE): boolean => bilanRacine(p, z, tol).estRacine;

export interface DivisionLineaire {
  /** Quotient Q (degré n − 1), coefficients décroissants. */
  quotient: Poly;
  /** Reste P(z₀) (constante). */
  reste: Cx;
}

/** Division de P par (z − z₀) par le schéma de Horner (Ruffini). Renvoie aussi le reste P(z₀). */
export function diviserParLineaire(p: Poly, z0: Cx): DivisionLineaire {
  if (p.length < 2) return { quotient: [], reste: p[0] ?? cx(0) };
  const q: Poly = [p[0]];
  for (let k = 1; k < p.length - 1; k++) q.push(add(p[k], mul(z0, q[k - 1])));
  const reste = add(p[p.length - 1], mul(z0, q[q.length - 1]));
  return { quotient: q, reste };
}

/** Une ligne de la division euclidienne posée : terme du quotient ajouté et reste partiel obtenu. */
export interface LigneDivision {
  /** Terme ajouté au quotient (coefficient de z^degre). */
  coef: Cx;
  degre: number;
  /** Reste partiel après soustraction coef·z^degre·(z − z₀) (coefficients décroissants, sans le terme de tête annulé). */
  reste: Poly;
}

export interface ResultatDivisionEuclidienne {
  quotient: Poly;
  reste: Cx;
  lignes: LigneDivision[];
}

/**
 * Division euclidienne de P par (z − z₀), POSÉE : à chaque ligne on prend le terme de tête du reste partiel, on l'ajoute
 * au quotient, puis on soustrait terme·(z − z₀). Algorithme distinct de Horner (utile pour vérifier que les deux méthodes
 * concordent).
 */
export function divisionEuclidienne(p: Poly, z0: Cx): ResultatDivisionEuclidienne {
  let reste: Poly = p.map((w) => ({ ...w }));
  const n = p.length - 1;
  const quotient: Poly = [];
  const lignes: LigneDivision[] = [];
  for (let d = n - 1; d >= 0; d--) {
    const t = reste[0];
    quotient.push(t);
    // reste ← reste − t·z^d·(z − z₀) : le coefficient de tête s'annule, le suivant est corrigé de + t·z₀.
    const suivant: Poly = reste.slice(1).map((w) => ({ ...w }));
    if (suivant.length > 0) suivant[0] = add(suivant[0], mul(t, z0));
    reste = suivant;
    lignes.push({ coef: t, degre: d, reste: reste.map((w) => ({ ...w })) });
  }
  return { quotient, reste: reste[0] ?? cx(0), lignes };
}

/**
 * Quotient par IDENTIFICATION des coefficients : (z − z₀)(αz² + βz + γ) = az³ + bz² + cz + d donne
 * α = a, β − z₀α = b, γ − z₀β = c, −z₀γ = d (cette dernière relation exprime que z₀ est racine). Valable pour tout degré.
 * Renvoie les coefficients du quotient et le reste « d + z₀γ » (nul si z₀ est racine).
 */
export function quotientParIdentification(p: Poly, z0: Cx): DivisionLineaire {
  const n = p.length - 1;
  if (n < 1) return { quotient: [], reste: p[0] ?? cx(0) };
  const q: Poly = [p[0]];
  for (let k = 1; k < n; k++) q.push(add(p[k], mul(z0, q[k - 1])));
  const reste = add(p[n], mul(z0, q[n - 1]));
  return { quotient: q, reste };
}

/** Deux polynômes de même degré sont-ils égaux (coefficient par coefficient, tolérance relative) ? */
export function polynomesEgaux(p: Poly, q: Poly, tol = 1e-12): boolean {
  if (p.length !== q.length) return false;
  return p.every((w, k) => modC(sub(w, q[k])) <= tol * Math.max(1, modC(w), modC(q[k])));
}

/** Polynôme dont les racines sont données (monique, ou multiplié par `a`) : a(z − r₁)(z − r₂)…, par développement. */
export function polynomeDepuisRacines(racines: Cx[], a: Cx = cx(1)): Poly {
  let p: Poly = [a];
  for (const r of racines) {
    const suivant: Poly = [...p.map((w) => ({ ...w })), cx(0)];
    for (let k = 0; k < p.length; k++) suivant[k + 1] = sub(suivant[k + 1], mul(p[k], r));
    p = suivant;
  }
  return p;
}

// --- Second degré à coefficients COMPLEXES ----------------------------------------------------------------------

export type ResultatSecondDegre =
  | { ok: false; erreur: string }
  | {
      ok: true;
      a: Cx;
      b: Cx;
      c: Cx;
      /** Δ = b² − 4ac (complexe). */
      delta: Cx;
      /** Δ est (à la tolérance près) un nombre réel : alors seulement on peut parler de son signe. */
      deltaReel: boolean;
      /** Une racine carrée δ de Δ (δ² = Δ) ; 0 si Δ = 0. */
      racineDelta: Cx;
      /** Δ = 0 : racine double. */
      double: boolean;
      /** Solutions DISTINCTES : une seule si Δ = 0. Triées par partie réelle puis imaginaire. */
      racines: Cx[];
      multiplicites: number[];
    };

const estFiniNonGeant = (z: Cx): boolean => estFini(z) && modC(z) <= COEF_MAX;

/** Ordre d'affichage : partie réelle croissante, puis partie imaginaire croissante (à 1e-9 près). */
export function comparerRacines(u: Cx, v: Cx): number {
  const dr = u.re - v.re;
  if (Math.abs(dr) > 1e-9 * Math.max(1, Math.abs(u.re), Math.abs(v.re))) return dr;
  return u.im - v.im;
}

export const trierRacines = (racines: Cx[]): Cx[] => [...racines].sort(comparerRacines);

/**
 * Résout az² + bz + c = 0 pour a, b, c COMPLEXES (a ≠ 0) : Δ = b² − 4ac, δ tel que δ² = Δ, z = (−b ± δ)/(2a).
 * Δ est un complexe : on ne le compare JAMAIS à 0 par « > » ou « < » ; on teste seulement Δ = 0.
 * Les racines utilisent la formule stable q = −(b + ε δ)/2 (ε = ±1 choisi pour éviter la compensation), z₁ = q/a, z₂ = c/q.
 */
export function resoudreSecondDegre(a: Cx, b: Cx, c: Cx): ResultatSecondDegre {
  if (![a, b, c].every(estFini)) return { ok: false, erreur: "Un des coefficients n'est pas un nombre fini." };
  if (![a, b, c].every(estFiniNonGeant)) return { ok: false, erreur: `Choisis des coefficients de module au plus ${COEF_MAX.toLocaleString("fr-FR")}.` };
  if (a.re === 0 && a.im === 0) return { ok: false, erreur: "Il faut a ≠ 0 : si a = 0, l'équation n'est plus du second degré." };
  const delta = sub(mul(b, b), mul(cx(4), mul(a, c)));
  const reference = Math.max(modC(b) ** 2, 4 * modC(a) * modC(c));
  const deltaNul = modC(delta) <= TOL_DELTA * Math.max(reference, 1e-300);
  const deltaReel = deltaNul || Math.abs(delta.im) <= TOL * Math.max(1, modC(delta));
  if (deltaNul) {
    const z = netC(div(oppose(b), mul(cx(2), a)) ?? cx(0));
    return { ok: true, a, b, c, delta: cx(0), deltaReel: true, racineDelta: cx(0), double: true, racines: [z], multiplicites: [2] };
  }
  const deltaPropre = deltaReel ? cx(delta.re, 0) : delta;
  const rc = racineCarreeSansPlafond(deltaPropre.re, deltaPropre.im);
  if (!rc.ok) return { ok: false, erreur: rc.erreur };
  const d = rc.delta;
  // ε = +1 si Re(conj(b)·δ) ≥ 0 : b et δ « pointent du même côté », donc b + δ ne s'annule pas.
  const eps = mul(conj(b), d).re >= 0 ? 1 : -1;
  const q = mul(cx(-0.5), add(b, eps === 1 ? d : oppose(d)));
  const z1 = div(q, a);
  const z2 = div(c, q);
  if (z1 === null || z2 === null) return { ok: false, erreur: "Le calcul des solutions a échoué (division par zéro)." };
  const racines = trierRacines([netC(z1), netC(z2)]);
  return { ok: true, a, b, c, delta: netC(delta), deltaReel, racineDelta: d, double: false, racines, multiplicites: [1, 1] };
}

/** Les deux solutions comptées avec leur multiplicité (une racine double apparaît deux fois). */
export function racinesAvecMultiplicite(r: Extract<ResultatSecondDegre, { ok: true }>): Cx[] {
  return r.double ? [r.racines[0], r.racines[0]] : r.racines;
}

// --- Relations de Viète (second degré) -------------------------------------------------------------------------

export interface BilanViete {
  somme: Cx;
  produit: Cx;
  sommeAttendue: Cx;
  produitAttendu: Cx;
  sommeOk: boolean;
  produitOk: boolean;
}

/** z₁ + z₂ = −b/a et z₁z₂ = c/a, vérifiés à tolérance relative. Pour une racine double, passer deux fois la même. */
export function verifierViete(a: Cx, b: Cx, c: Cx, z1: Cx, z2: Cx, tol = 1e-9): BilanViete | null {
  const sommeAttendue = div(oppose(b), a);
  const produitAttendu = div(c, a);
  if (sommeAttendue === null || produitAttendu === null) return null;
  const somme = add(z1, z2);
  const produit = mul(z1, z2);
  const proche = (u: Cx, v: Cx) => modC(sub(u, v)) <= tol * Math.max(1, modC(u), modC(v));
  return { somme: netC(somme), produit: netC(produit), sommeAttendue: netC(sommeAttendue), produitAttendu: netC(produitAttendu), sommeOk: proche(somme, sommeAttendue), produitOk: proche(produit, produitAttendu) };
}

// --- Troisième degré avec racine connue --------------------------------------------------------------------------

export type ResultatTroisiemeDegre =
  | { ok: false; raison: "coefficient" | "pas-racine" | "invalide"; erreur: string; bilan?: BilanRacine }
  | {
      ok: true;
      p: Poly;
      z0: Cx;
      bilan: BilanRacine;
      /** Quotient Q(z) = αz² + βz + γ tel que P(z) = (z − z₀)Q(z). */
      quotient: Poly;
      /** Quotient obtenu par identification ET par division posée : concordance des deux méthodes. */
      methodesConcordent: boolean;
      division: ResultatDivisionEuclidienne;
      secondDegre: Extract<ResultatSecondDegre, { ok: true }>;
      /** Racines DISTINCTES de P avec leur multiplicité (somme = 3), triées. */
      racines: Cx[];
      multiplicites: number[];
    };

/**
 * Résout P(z) = az³ + bz² + cz + d = 0 À PARTIR d'une racine z₀ fournie (connue ou trouvée). Ce n'est PAS une formule
 * générale du troisième degré : si z₀ n'annule pas P, le calcul est refusé.
 */
export function resoudreTroisiemeDegre(p: Poly, z0: Cx): ResultatTroisiemeDegre {
  if (p.length !== 4 || ![...p, z0].every(estFini)) return { ok: false, raison: "invalide", erreur: "Les coefficients et la racine proposée doivent être des nombres finis." };
  if (![...p, z0].every(estFiniNonGeant)) return { ok: false, raison: "invalide", erreur: `Choisis des nombres de module au plus ${COEF_MAX.toLocaleString("fr-FR")}.` };
  if (p[0].re === 0 && p[0].im === 0) return { ok: false, raison: "coefficient", erreur: "Il faut a ≠ 0 : si a = 0, l'équation n'est plus du troisième degré." };
  const bilan = bilanRacine(p, z0);
  if (!bilan.estRacine) return { ok: false, raison: "pas-racine", erreur: "Ce nombre n'est pas une racine.", bilan };
  const ident = quotientParIdentification(p, z0);
  const division = divisionEuclidienne(p, z0);
  const quotient = ident.quotient;
  const methodesConcordent = polynomesEgaux(quotient, division.quotient) && polynomesEgaux(quotient, diviserParLineaire(p, z0).quotient);
  const sd = resoudreSecondDegre(quotient[0], quotient[1], quotient[2]);
  if (!sd.ok) return { ok: false, raison: "invalide", erreur: sd.erreur };
  const seuilM = (z: Cx) => TOL_MULTIPLICITE * Math.max(1, modC(z0), modC(z));
  let racines: Cx[];
  let multiplicites: number[];
  if (sd.double) {
    const r = sd.racines[0];
    if (modC(sub(r, z0)) <= seuilM(r)) {
      racines = [z0];
      multiplicites = [3];
    } else {
      racines = [z0, r];
      multiplicites = [1, 2];
    }
  } else {
    const [r1, r2] = sd.racines;
    if (modC(sub(r1, z0)) <= seuilM(r1)) {
      racines = [z0, r2];
      multiplicites = [2, 1];
    } else if (modC(sub(r2, z0)) <= seuilM(r2)) {
      racines = [z0, r1];
      multiplicites = [2, 1];
    } else {
      racines = [z0, r1, r2];
      multiplicites = [1, 1, 1];
    }
  }
  // Tri par partie réelle puis imaginaire, en gardant les multiplicités associées.
  const ordre = racines.map((_, i) => i).sort((i, j) => comparerRacines(racines[i], racines[j]));
  return { ok: true, p, z0, bilan, quotient, methodesConcordent, division, secondDegre: sd, racines: ordre.map((i) => netC(racines[i])), multiplicites: ordre.map((i) => multiplicites[i]) };
}

/**
 * Cherche une racine « de Gauss » (partie réelle et imaginaire entières, |.| ≤ borne) d'un polynôme à coefficients
 * quelconques, parmi des candidats simples classés par module croissant. Sert d'aide à la recherche d'une racine
 * préalable ; null si aucune n'est trouvée (cela ne prouve pas qu'il n'y en a pas).
 */
export function chercherRacineSimple(p: Poly, borne = 10): Cx | null {
  const candidats: Cx[] = [];
  for (let x = -borne; x <= borne; x++) for (let y = -borne; y <= borne; y++) candidats.push(cx(x, y));
  candidats.sort((u, v) => modC(u) - modC(v) || Math.abs(v.re) - Math.abs(u.re) || u.im - v.im);
  for (const z of candidats) if (estRacine(p, z)) return z;
  return null;
}

// --- Module, argument, formes ------------------------------------------------------------------------------------

export interface FormesComplexe {
  module: number;
  /** Argument principal dans ]−π, π], ou null pour z = 0 (jamais d'argument pour zéro). */
  argument: number | null;
}

export function formesComplexe(z: Cx): FormesComplexe {
  return { module: modC(z), argument: argument(z) };
}

// --- Comparaison d'un ensemble de réponses à l'ensemble des racines (mode entraînement) ----------------------------

export interface BilanReponses {
  /** Toutes les racines (avec multiplicité) sont données, et rien d'autre. */
  correct: boolean;
  /** Réponses qui ne sont pas racines. */
  intrus: Cx[];
  /** Racines (avec multiplicité) non trouvées. */
  manquantes: Cx[];
}

/**
 * Compare les réponses de l'élève aux racines attendues (liste AVEC multiplicité). L'ordre ne compte pas ; chaque
 * racine attendue ne peut être « consommée » qu'une fois. Tolérance relative `tol` (arrondi à 3 décimales accepté).
 */
export function comparerReponses(attendues: Cx[], saisies: Cx[], tol = TOL_REPONSE_RACINE): BilanReponses {
  const restantes = attendues.map((z) => ({ z, prise: false }));
  const intrus: Cx[] = [];
  for (const s of saisies) {
    const cible = restantes.find((r) => !r.prise && modC(sub(r.z, s)) <= tol * Math.max(1, modC(r.z)));
    if (cible) cible.prise = true;
    else intrus.push(s);
  }
  const manquantes = restantes.filter((r) => !r.prise).map((r) => r.z);
  return { correct: intrus.length === 0 && manquantes.length === 0, intrus, manquantes };
}
