/**
 * Moteur numérique du Laboratoire « Moivre, Euler et racines n-ièmes » (fonctions pures, sans React).
 * Réutilise lib/complexes.ts (radians, argument principal dans ]-π, π], tolérance relative 1e-9). Les identités exactes
 * (linéarisation, angles multiples) sont dans lib/moivreEulerSymbolique.ts ; le formatage TeX dans moivreEulerAffichage.ts.
 */

import { add, conj, depuisPolaire, distance, expI, modC, normaliserAngle, sub, type Cx } from "./complexes";

const DEUX_PI = 2 * Math.PI;

/** Tolérance RELATIVE des vérifications numériques (z_k^n ≈ Z, côtés égaux…). Les égalités exactes sont traitées à part. */
export const TOL_VERIF = 1e-9;
/** Au-delà, une puissance est refusée plutôt que d'afficher des valeurs absurdes. */
export const MODULE_MAX = 1e12;

// --- Moivre ----------------------------------------------------------------------------------------------------

export interface PuissanceMoivre {
  ok: true;
  /** z = r e^{iθ} (θ tel que saisi, éventuellement hors de ]-π, π]). */
  z: Cx;
  /** z^n par la formule de Moivre. */
  zn: Cx;
  r: number;
  theta: number;
  n: number;
  /** r^n. */
  moduleN: number;
  /** nθ : angle TOTAL (non réduit). */
  angleTotal: number;
  /** Argument principal de z^n dans ]-π, π] ; null si z^n = 0. */
  argPrincipal: number | null;
  /** Nombre de tours complets : angleTotal = argPrincipal + 2π · tours. */
  tours: number;
}
export type ResultatMoivre = PuissanceMoivre | { ok: false; erreur: string };

/** z^n = r^n e^{inθ}. Refuse 0^n pour n ≤ 0, un n non entier, un module négatif et les résultats démesurés. */
export function puissanceMoivre(r: number, theta: number, n: number): ResultatMoivre {
  if (!Number.isFinite(r) || !Number.isFinite(theta)) return { ok: false, erreur: "Valeurs invalides : le module et l'angle doivent être des nombres." };
  if (!Number.isInteger(n)) return { ok: false, erreur: "La puissance n doit être un entier." };
  if (r < 0) return { ok: false, erreur: "Le module d'un nombre complexe est positif ou nul." };
  if (r === 0 && n < 0) return { ok: false, erreur: "z = 0 n'a pas d'inverse : les puissances négatives ne sont pas définies." };
  if (r === 0 && n === 0) return { ok: false, erreur: "0^0 n'est pas défini : choisis n différent de 0 pour z = 0." };
  const moduleN = Math.pow(r, n);
  if (!Number.isFinite(moduleN) || moduleN > MODULE_MAX) return { ok: false, erreur: "La puissance est trop grande pour être représentée : réduis n ou le module." };
  const z = depuisPolaire(r, theta);
  const angleTotal = n * theta;
  const zn = r === 0 ? { re: 0, im: 0 } : depuisPolaire(moduleN, angleTotal);
  const argPrincipal = r === 0 ? null : normaliserAngle(angleTotal);
  const tours = argPrincipal === null ? 0 : Math.round((angleTotal - argPrincipal) / DEUX_PI);
  return { ok: true, z, zn, r, theta, n, moduleN, angleTotal, argPrincipal, tours };
}

/** Les points z^k pour k = 0..|n| (signe de n) : trace de l'animation « à chaque multiplication, l'angle augmente de θ ». */
export function suitePuissances(r: number, theta: number, n: number): Cx[] {
  const sortie: Cx[] = [];
  const pas = n < 0 ? -1 : 1;
  for (let k = 0; k <= Math.abs(n); k++) {
    const res = puissanceMoivre(r, theta, pas * k);
    sortie.push(res.ok ? res.zn : { re: NaN, im: NaN });
  }
  return sortie;
}

// --- Euler -----------------------------------------------------------------------------------------------------

export interface PointsEuler {
  /** e^{iθ} et e^{-iθ}. */
  ep: Cx;
  em: Cx;
  /** e^{iθ} + e^{-iθ} = 2cos θ (partie imaginaire exactement nulle). */
  somme: Cx;
  /** e^{iθ} − e^{-iθ} = 2i sin θ (partie réelle exactement nulle). */
  difference: Cx;
  cos: number;
  sin: number;
}

export function pointsEuler(theta: number): PointsEuler {
  const ep = expI(theta);
  const em = conj(ep);
  const somme = add(ep, em);
  const difference = sub(ep, em);
  return { ep, em, somme, difference, cos: ep.re, sin: ep.im };
}

// --- Racines n-ièmes -------------------------------------------------------------------------------------------

export interface RacineIndexee {
  k: number;
  z: Cx;
  /** Argument (φ + 2kπ)/n, non réduit. */
  argument: number;
}
export interface RacinesZ {
  ok: true;
  Z: Cx;
  rho: number;
  phi: number;
  n: number;
  /** Module commun des racines, ρ^{1/n}. */
  R: number;
  /** Écart angulaire entre deux racines consécutives, 2π/n. */
  delta: number;
  racines: RacineIndexee[];
}
export type ResultatRacines = RacinesZ | { ok: false; nul: boolean; erreur: string };

/** z_k = ρ^{1/n} e^{i(φ+2kπ)/n}, k = 0..n-1. Pour ρ = 0 la formule ne s'applique pas (argument indéfini). */
export function racinesDe(rho: number, phi: number, n: number): ResultatRacines {
  if (!Number.isFinite(rho) || !Number.isFinite(phi)) return { ok: false, nul: false, erreur: "Valeurs invalides : le module et l'argument doivent être des nombres." };
  if (!Number.isInteger(n) || n < 1) return { ok: false, nul: false, erreur: "L'ordre n doit être un entier supérieur ou égal à 1." };
  if (rho < 0) return { ok: false, nul: false, erreur: "Le module ρ est positif ou nul." };
  if (rho === 0) return { ok: false, nul: true, erreur: "Z = 0 : l'unique racine n-ième est 0 ; la formule avec l'argument de Z ne s'applique pas." };
  const R = Math.pow(rho, 1 / n);
  if (!Number.isFinite(R)) return { ok: false, nul: false, erreur: "Module trop grand pour être représenté." };
  const racines: RacineIndexee[] = [];
  for (let k = 0; k < n; k++) {
    const argument = (phi + DEUX_PI * k) / n;
    racines.push({ k, z: depuisPolaire(R, argument), argument });
  }
  return { ok: true, Z: depuisPolaire(rho, phi), rho, phi, n, R, delta: DEUX_PI / n, racines };
}

export interface VerificationRacine {
  k: number;
  /** z_k^n calculé numériquement (produits répétés, indépendants de la formule). */
  puissance: Cx;
  /** |z_k^n − Z| / max(1, |Z|). */
  ecartRelatif: number;
  ok: boolean;
}
export interface BilanVerification {
  details: VerificationRacine[];
  toutesVerifient: boolean;
  /** Plus petite distance entre deux racines, relativement à R : toutes distinctes si > tolérance. */
  distinctes: boolean;
}

/** z^n par produits répétés (exact pour des entiers, sinon flottant) : indépendant de la formule de Moivre. */
export function puissanceParProduits(z: Cx, n: number): Cx {
  let res: Cx = { re: 1, im: 0 };
  for (let i = 0; i < n; i++) res = { re: res.re * z.re - res.im * z.im, im: res.re * z.im + res.im * z.re };
  return res;
}

/** Vérifie z_k^n = Z pour chaque racine (tolérance relative TOL_VERIF·1e3 : n produits cumulent n erreurs d'arrondi). */
export function verifierRacines(res: RacinesZ, tol = TOL_VERIF * 1e3): BilanVerification {
  const echelle = Math.max(1, modC(res.Z));
  const details = res.racines.map((r) => {
    const p = puissanceParProduits(r.z, res.n);
    const ecartRelatif = distance(p, res.Z) / echelle;
    return { k: r.k, puissance: p, ecartRelatif, ok: ecartRelatif <= tol };
  });
  let minDist = Infinity;
  for (let i = 0; i < res.racines.length; i++) for (let j = i + 1; j < res.racines.length; j++) minDist = Math.min(minDist, distance(res.racines[i].z, res.racines[j].z));
  return { details, toutesVerifient: details.every((d) => d.ok), distinctes: res.n === 1 || minDist > tol * Math.max(1, res.R) };
}

// --- Géométrie des racines -------------------------------------------------------------------------------------

export interface PolygoneRacines {
  ok: true;
  n: number;
  R: number;
  delta: number;
  sommets: Cx[];
  /** Un polygone n'existe qu'à partir de 3 sommets : n = 2 donne deux points diamétralement opposés. */
  aPolygone: boolean;
  /** c = 2R sin(π/n) (n ≥ 3), sinon null. */
  cote: number | null;
  /** P = n c (n ≥ 3), sinon null. */
  perimetre: number | null;
  /** Distances entre sommets consécutifs (n ≥ 3). */
  cotes: number[];
}

export function polygoneRacines(rho: number, phi: number, n: number): PolygoneRacines | { ok: false; erreur: string } {
  const r = racinesDe(rho, phi, n);
  if (!r.ok) return { ok: false, erreur: r.erreur };
  const sommets = r.racines.map((x) => x.z);
  const aPolygone = n >= 3;
  const cotes = aPolygone ? sommets.map((s, i) => distance(s, sommets[(i + 1) % n])) : [];
  const cote = aPolygone ? 2 * r.R * Math.sin(Math.PI / n) : null;
  return { ok: true, n, R: r.R, delta: r.delta, sommets, aPolygone, cote, perimetre: cote === null ? null : n * cote, cotes };
}

/** Le polygone est-il régulier ? Mêmes distances au centre ET mêmes côtés, à la tolérance relative près. */
export function estPolygoneRegulier(p: PolygoneRacines, tol = TOL_VERIF * 1e3): boolean {
  if (!p.aPolygone) return false;
  const rayonsOk = p.sommets.every((s) => Math.abs(modC(s) - p.R) <= tol * Math.max(p.R, 1e-300));
  const c0 = p.cotes[0];
  const cotesOk = p.cotes.every((c) => Math.abs(c - c0) <= tol * Math.max(c0, 1e-300));
  return rayonsOk && cotesOk;
}

/** Arguments des sommets réduits dans ]-π, π] (pour l'affichage). */
export const argumentsReduits = (p: PolygoneRacines): number[] => p.sommets.map((s) => Math.atan2(s.im, s.re)).map((a) => normaliserAngle(a));

// --- Cadre et graduation d'un plan de racines -----------------------------------------------------------------------

/** Plus petit cadre « net » (demi-largeur) contenant le rayon R avec une marge de 30 %. */
export function cadreRacines(R: number): number {
  const base = [0.05, 0.1, 0.2, 0.5, 1, 2, 3, 5, 8, 12, 20, 50, 100, 1000];
  return base.find((b) => b >= R * 1.3) ?? Math.ceil(R * 1.3);
}

/** Pas de graduation 1, 2 ou 5 × 10^k donnant quelques graduations de part et d'autre de l'origine. */
export function pasNet(B: number): number {
  const brutPas = B / 2.5;
  const p10 = Math.pow(10, Math.floor(Math.log10(brutPas)));
  const m = brutPas / p10;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : 5) * p10;
}
