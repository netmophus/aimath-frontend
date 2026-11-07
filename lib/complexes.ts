/**
 * Moteur mathématique du Laboratoire des nombres complexes (Terminale C). Fonctions PURES, sans React.
 *
 * Conventions
 * - Un complexe est { re, im } (nombres flottants).
 * - Angles : RADIANS dans toutes les fonctions. L'interface peut afficher des degrés (voir `enDegres`).
 * - Argument PRINCIPAL : dans ]-π, π]. Un argument n'est défini que modulo 2π ; l'argument de 0 est INDÉFINI (null).
 * - Angle orienté (u ; v) : angle de rotation qui envoie u sur v, mesuré dans le sens direct (trigonométrique).
 *
 * Politique de précision (jamais de `===` entre flottants après un calcul trigonométrique)
 * - TOL = 1e-9 est une tolérance RELATIVE : deux grandeurs x et y sont égales si |x - y| <= TOL * max(1, |x|, |y|).
 * - Les tests géométriques (alignement, orthogonalité, cocyclicité) travaillent sur des grandeurs SANS DIMENSION
 *   (sinus ou cosinus de l'angle, partie imaginaire relative d'un quotient) : ils ne dépendent donc pas de l'échelle.
 * - cos/sin des angles « de cadran » (multiples de π/2) sont corrigés à 0, 1 ou -1 exactement (`expI`).
 * - L'interface n'affiche que des valeurs ARRONDIES, mais ne décide jamais d'une propriété sur la valeur arrondie.
 */

export interface Cx {
  re: number;
  im: number;
}

export const TOL = 1e-9;
const DEUX_PI = 2 * Math.PI;

export const cx = (re: number, im = 0): Cx => ({ re, im });
export const ZERO: Cx = { re: 0, im: 0 };
export const UN: Cx = { re: 1, im: 0 };
export const I: Cx = { re: 0, im: 1 };

/** Égalité numérique tolérante (relative, voir l'en-tête). */
export function presqueEgal(x: number, y: number, tol = TOL): boolean {
  return Math.abs(x - y) <= tol * Math.max(1, Math.abs(x), Math.abs(y));
}

export const estFini = (z: Cx): boolean => Number.isFinite(z.re) && Number.isFinite(z.im);

// --- Opérations de base -------------------------------------------------------------------------------------

export const add = (z: Cx, w: Cx): Cx => ({ re: z.re + w.re, im: z.im + w.im });
export const sub = (z: Cx, w: Cx): Cx => ({ re: z.re - w.re, im: z.im - w.im });
export const mul = (z: Cx, w: Cx): Cx => ({ re: z.re * w.re - z.im * w.im, im: z.re * w.im + z.im * w.re });
export const conj = (z: Cx): Cx => ({ re: z.re, im: z.im === 0 ? 0 : -z.im });
export const oppose = (z: Cx): Cx => ({ re: z.re === 0 ? 0 : -z.re, im: z.im === 0 ? 0 : -z.im });
export const echelle = (k: number, z: Cx): Cx => ({ re: k * z.re, im: k * z.im });
export const modC = (z: Cx): number => Math.hypot(z.re, z.im);
export const module2 = (z: Cx): number => z.re * z.re + z.im * z.im;

/** z est exactement nul (aucune tolérance : sert à interdire une division, pas à juger une propriété géométrique). */
export const estNul = (z: Cx): boolean => z.re === 0 && z.im === 0;

/**
 * Quotient z / w, ou null si w = 0 (la division par zéro ne produit JAMAIS NaN ni Infinity).
 * Calcul par le conjugué : z / w = z · w̄ / |w|².
 */
export function div(z: Cx, w: Cx): Cx | null {
  const d = module2(w);
  if (d === 0 || !Number.isFinite(d)) return null;
  const q = { re: (z.re * w.re + z.im * w.im) / d, im: (z.im * w.re - z.re * w.im) / d };
  return estFini(q) ? q : null;
}

/** i^n pour tout entier n (positif, nul ou négatif) : période 4, résultat EXACT. */
export function puissanceDeI(n: number): Cx {
  const r = ((Math.trunc(n) % 4) + 4) % 4;
  return [UN, I, { re: -1, im: 0 }, { re: 0, im: -1 }][r];
}

/** z^n pour n entier, par exponentiation rapide (exacte pour des entiers). null si 0^n avec n < 0 ou résultat non fini. */
export function puissanceEntiere(z: Cx, n: number): Cx | null {
  if (!Number.isInteger(n)) return null;
  if (n === 0) return UN;
  let base = n < 0 ? div(UN, z) : z;
  if (base === null) return null;
  let e = Math.abs(n);
  let res: Cx = UN;
  while (e > 0) {
    if (e & 1) res = mul(res, base);
    base = mul(base, base);
    e = Math.floor(e / 2);
  }
  return estFini(res) ? res : null;
}

// --- Angles, argument, formes -------------------------------------------------------------------------------

/** Ramène un angle dans ]-π, π]. */
export function normaliserAngle(t: number): number {
  let x = t % DEUX_PI;
  if (x <= -Math.PI) x += DEUX_PI;
  else if (x > Math.PI) x -= DEUX_PI;
  return x === 0 ? 0 : x;
}

export const enDegres = (rad: number): number => (rad * 180) / Math.PI;
export const enRadians = (deg: number): number => (deg * Math.PI) / 180;

/** Deux angles sont égaux modulo 2π (tolérance absolue en radians, 1e-9 par défaut). */
export function angleEgalMod2Pi(a: number, b: number, tol = TOL): boolean {
  return Math.abs(normaliserAngle(a - b)) <= tol;
}

/** Argument principal dans ]-π, π] ; null si z = 0 (argument indéfini). Corrige atan2(-0, x<0) = -π en π. */
export function argument(z: Cx): number | null {
  if (estNul(z)) return null;
  if (z.im === 0) return z.re > 0 ? 0 : Math.PI;
  return Math.atan2(z.im, z.re);
}

/** cos et sin de t, corrigés EXACTEMENT aux multiples de π/2 (évite cos(π/2) = 6.1e-17). */
export function expI(t: number): Cx {
  let c = Math.cos(t);
  let s = Math.sin(t);
  if (Math.abs(c) < 1e-15) c = 0;
  if (Math.abs(s) < 1e-15) s = 0;
  if (Math.abs(c - 1) < 1e-15) c = 1;
  if (Math.abs(c + 1) < 1e-15) c = -1;
  if (Math.abs(s - 1) < 1e-15) s = 1;
  if (Math.abs(s + 1) < 1e-15) s = -1;
  return { re: c, im: s };
}

export interface Polaire {
  r: number;
  /** Argument principal, ou null si z = 0. */
  theta: number | null;
}

export function versPolaire(z: Cx): Polaire {
  return { r: modC(z), theta: argument(z) };
}

/** r(cos θ + i sin θ), avec nettoyage des valeurs numériquement nulles. */
export function depuisPolaire(r: number, theta: number): Cx {
  const e = expI(theta);
  const nettoyer = (x: number) => (Math.abs(x) <= 1e-12 * Math.max(1, Math.abs(r)) ? 0 : x);
  return { re: nettoyer(r * e.re), im: nettoyer(r * e.im) };
}

/** z^n par la formule de Moivre : module r^n, argument n·α (brut) et sa réduction principale. */
export interface PuissancePolaire {
  module: number;
  argumentBrut: number;
  argumentPrincipal: number;
  /** Nombre de tours complets retirés de l'argument brut : argumentBrut = argumentPrincipal + 2π · tours. */
  tours: number;
}
export function moivre(z: Cx, n: number): PuissancePolaire | null {
  const alpha = argument(z);
  if (alpha === null || !Number.isInteger(n)) return null;
  const brut = n * alpha;
  const principal = normaliserAngle(brut);
  return { module: Math.pow(modC(z), n), argumentBrut: brut, argumentPrincipal: principal, tours: Math.round((brut - principal) / DEUX_PI) };
}

// --- Racines n-ièmes ----------------------------------------------------------------------------------------

export interface Racine {
  k: number;
  z: Cx;
  /** Argument de la racine : (θ + 2kπ)/n, non réduit (θ est l'argument principal de w). */
  argument: number;
}

/** Les n solutions de z^n = w (w ≠ 0, n entier ≥ 1) : r^(1/n) e^{i(θ+2kπ)/n}. null si w = 0 ou n invalide. */
export function racinesNiemes(w: Cx, n: number): Racine[] | null {
  if (!Number.isInteger(n) || n < 1) return null;
  const theta = argument(w);
  if (theta === null) return null;
  const rho = Math.pow(modC(w), 1 / n);
  if (!Number.isFinite(rho)) return null;
  const sortie: Racine[] = [];
  for (let k = 0; k < n; k++) {
    const arg = (theta + DEUX_PI * k) / n;
    sortie.push({ k, z: depuisPolaire(rho, arg), argument: arg });
  }
  return sortie;
}

/** Racines n-ièmes de l'unité : z_k = e^{2ikπ/n}, k = 0..n-1 (arguments exacts 2kπ/n, sans réduction). */
export function racinesUnite(n: number): Racine[] | null {
  if (!Number.isInteger(n) || n < 1) return null;
  const sortie: Racine[] = [];
  for (let k = 0; k < n; k++) {
    const arg = (DEUX_PI * k) / n;
    sortie.push({ k, z: depuisPolaire(1, arg), argument: arg });
  }
  return sortie;
}

// --- Second degré à coefficients réels ---------------------------------------------------------------------

export type CasSecondDegre = "deux-reelles" | "double" | "complexes";
export type ResultatSecondDegre =
  | { ok: false; erreur: string }
  | { ok: true; delta: number; cas: CasSecondDegre; racines: Cx[] };

/** Plafond des coefficients saisis : au-delà, b² - 4ac perdrait sa précision (et pourrait déborder). */
export const COEF_MAX = 1e6;

/**
 * Résout az² + bz + c = 0 (a, b, c réels, a ≠ 0). Δ = b² - 4ac.
 * Δ est jugé nul s'il est négligeable devant b² et |4ac| (tolérance relative 1e-12) : évite qu'un reste d'arrondi
 * transforme une racine double en deux racines presque égales. Les racines réelles utilisent la formule stable
 * (pas de soustraction de deux nombres proches). Ordre : réelles croissantes ; complexes : partie imaginaire négative d'abord.
 */
export function resoudreSecondDegre(a: number, b: number, c: number): ResultatSecondDegre {
  if (![a, b, c].every(Number.isFinite)) return { ok: false, erreur: "Un des coefficients n'est pas un nombre fini." };
  if ([a, b, c].some((x) => Math.abs(x) > COEF_MAX)) return { ok: false, erreur: `Choisis des coefficients de valeur absolue au plus ${COEF_MAX.toLocaleString("fr-FR")}.` };
  if (a === 0) return { ok: false, erreur: "Si a = 0, l'équation n'est plus du second degré : elle devient bz + c = 0. Choisis a ≠ 0." };
  const delta = b * b - 4 * a * c;
  const reference = Math.max(b * b, Math.abs(4 * a * c));
  if (Math.abs(delta) <= 1e-12 * Math.max(reference, 1e-300)) {
    return { ok: true, delta: 0, cas: "double", racines: [{ re: -b / (2 * a) || 0, im: 0 }] };
  }
  if (delta > 0) {
    const racineDelta = Math.sqrt(delta);
    const q = -0.5 * (b + (b >= 0 ? racineDelta : -racineDelta));
    const x1 = q / a;
    const x2 = q === 0 ? 0 : c / q;
    const [p, g] = x1 <= x2 ? [x1, x2] : [x2, x1];
    return { ok: true, delta, cas: "deux-reelles", racines: [{ re: p === 0 ? 0 : p, im: 0 }, { re: g === 0 ? 0 : g, im: 0 }] };
  }
  const re = -b / (2 * a) || 0;
  const im = Math.sqrt(-delta) / (2 * Math.abs(a));
  return { ok: true, delta, cas: "complexes", racines: [{ re, im: -im }, { re, im }] };
}

// --- Géométrie : distances, angles orientés, tests ----------------------------------------------------------

export const distance = (a: Cx, b: Cx): number => modC(sub(b, a));

/** Les points sont-ils confondus ? Tolérance relative à l'échelle des affixes (au moins 1). */
export function confondus(a: Cx, b: Cx, tol = TOL): boolean {
  return distance(a, b) <= tol * Math.max(1, modC(a), modC(b));
}

/** Angle orienté (u ; v) pour deux vecteurs non nuls, dans ]-π, π] ; null si l'un d'eux est nul. */
export function angleOriente(u: Cx, v: Cx): number | null {
  if (estNul(u) || estNul(v)) return null;
  const q = div(v, u);
  return q === null ? null : argument(q);
}

/** Angle orienté (CA ; CB) : celui de arg((zC - zB)/(zC - zA)) ; null si C = A ou C = B. */
export function angleEnSommet(a: Cx, b: Cx, c: Cx): number | null {
  if (confondus(c, a) || confondus(c, b)) return null;
  return angleOriente(sub(a, c), sub(b, c));
}

/** Sinus relatif de l'angle (AB, AC) : produit vectoriel / (AB·AC), dans [-1, 1]. null si A=B ou A=C. */
function sinusRelatif(a: Cx, b: Cx, c: Cx): number | null {
  if (confondus(a, b) || confondus(a, c)) return null;
  const u = sub(b, a);
  const v = sub(c, a);
  return (u.re * v.im - u.im * v.re) / (modC(u) * modC(v));
}
/** Cosinus relatif de l'angle (AB, AC) : produit scalaire / (AB·AC). */
function cosinusRelatif(a: Cx, b: Cx, c: Cx): number | null {
  if (confondus(a, b) || confondus(a, c)) return null;
  const u = sub(b, a);
  const v = sub(c, a);
  return (u.re * v.re + u.im * v.im) / (modC(u) * modC(v));
}

/**
 * Trois points DISTINCTS sont alignés ⇔ Q = (zC - zA)/(zB - zA) est réel ⇔ sin(AB, AC) = 0.
 * null si deux points sont confondus (la question n'a pas de sens).
 */
export function alignes(a: Cx, b: Cx, c: Cx): boolean | null {
  const s = sinusRelatif(a, b, c);
  return s === null ? null : Math.abs(s) <= TOL;
}

/** AB ⟂ AC ⇔ Q = (zC - zA)/(zB - zA) est imaginaire pur non nul ⇔ cos(AB, AC) = 0. null si points confondus. */
export function orthogonaux(a: Cx, b: Cx, c: Cx): boolean | null {
  const k = cosinusRelatif(a, b, c);
  return k === null ? null : Math.abs(k) <= TOL;
}

/** Quotient Q = (zC - zA)/(zB - zA) ; null si A = B. */
export function quotientAlignement(a: Cx, b: Cx, c: Cx): Cx | null {
  return div(sub(c, a), sub(b, a));
}

export interface NatureTriangle {
  /** Les trois points ne forment un triangle que s'ils sont distincts et non alignés. */
  valide: boolean;
  isocele: boolean;
  rectangle: boolean;
  equilateral: boolean;
  /** Sommets particuliers : isocèle en … / rectangle en … */
  sommetsIsocele: Array<"A" | "B" | "C">;
  sommetRectangle: "A" | "B" | "C" | null;
}

/** Nature du triangle ABC, par critères explicites (longueurs égales, réciproque de Pythagore) à tolérance relative. */
export function natureTriangle(a: Cx, b: Cx, c: Cx): NatureTriangle {
  const vide: NatureTriangle = { valide: false, isocele: false, rectangle: false, equilateral: false, sommetsIsocele: [], sommetRectangle: null };
  if (confondus(a, b) || confondus(b, c) || confondus(a, c)) return vide;
  if (alignes(a, b, c)) return vide;
  const ab = distance(a, b);
  const bc = distance(b, c);
  const ca = distance(c, a);
  const sommetsIsocele: Array<"A" | "B" | "C"> = [];
  if (presqueEgal(ab, ca)) sommetsIsocele.push("A");
  if (presqueEgal(ab, bc)) sommetsIsocele.push("B");
  if (presqueEgal(bc, ca)) sommetsIsocele.push("C");
  const droit = (x: number, y: number, h: number) => presqueEgal(x * x + y * y, h * h);
  let sommetRectangle: "A" | "B" | "C" | null = null;
  if (droit(ab, ca, bc)) sommetRectangle = "A";
  else if (droit(ab, bc, ca)) sommetRectangle = "B";
  else if (droit(bc, ca, ab)) sommetRectangle = "C";
  return {
    valide: true,
    isocele: sommetsIsocele.length > 0,
    rectangle: sommetRectangle !== null,
    equilateral: sommetsIsocele.length === 3,
    sommetsIsocele,
    sommetRectangle,
  };
}

export interface Cercle {
  centre: Cx;
  rayon: number;
}

/** Cercle passant par A, B, C ; null si les points sont confondus ou alignés (pas de cercle circonscrit). */
export function cercleCirconscrit(a: Cx, b: Cx, c: Cx): Cercle | null {
  if (alignes(a, b, c) !== false) return null;
  const d = 2 * (a.re * (b.im - c.im) + b.re * (c.im - a.im) + c.re * (a.im - b.im));
  if (d === 0) return null;
  const a2 = module2(a);
  const b2 = module2(b);
  const c2 = module2(c);
  const centre = {
    re: (a2 * (b.im - c.im) + b2 * (c.im - a.im) + c2 * (a.im - b.im)) / d,
    im: (a2 * (c.re - b.re) + b2 * (a.re - c.re) + c2 * (b.re - a.re)) / d,
  };
  const r = distance(centre, a);
  return Number.isFinite(r) && estFini(centre) ? { centre, rayon: r } : null;
}

/** Birapport Q = ((zB - zC)(zA - zD)) / ((zA - zC)(zB - zD)) ; null si un dénominateur est nul (D = B ou C = A). */
export function birapport(a: Cx, b: Cx, c: Cx, d: Cx): Cx | null {
  const num = mul(sub(b, c), sub(a, d));
  const den = mul(sub(a, c), sub(b, d));
  return div(num, den);
}

/** Q est-il réel ? Partie imaginaire relative |Im Q| <= TOL · |Q| (sans dimension). */
export function estReel(q: Cx, tol = TOL): boolean {
  return Math.abs(q.im) <= tol * Math.max(modC(q), 1e-300);
}
/** Q est-il imaginaire pur NON nul ? */
export function estImaginairePur(q: Cx, tol = TOL): boolean {
  return Math.abs(q.re) <= tol * Math.max(modC(q), 1e-300) && modC(q) > 0;
}

export type NatureCocyclicite =
  | { type: "points-confondus" }
  | { type: "abc-alignes"; dSurLaDroite: boolean }
  | { type: "cocycliques"; cercle: Cercle; birapport: Cx | null }
  | { type: "non-cocycliques"; cercle: Cercle; birapport: Cx | null };

/**
 * Cocyclicité de A, B, C, D.
 * - A, B, C alignés : pas de cercle circonscrit ; on indique seulement si D est sur la même droite.
 * - Sinon D est sur le cercle ABC ⇔ le birapport est réel (D distinct de A, B, C) ; D confondu avec l'un d'eux appartient au cercle.
 * Le critère « Q réel » est cohérent avec la distance au centre (vérifiée en test) ; on décide par le birapport quand il existe.
 */
export function cocyclicite(a: Cx, b: Cx, c: Cx, d: Cx): NatureCocyclicite {
  if (confondus(a, b) || confondus(b, c) || confondus(a, c)) return { type: "points-confondus" };
  const cercle = cercleCirconscrit(a, b, c);
  if (cercle === null) return { type: "abc-alignes", dSurLaDroite: alignes(a, b, d) === true || confondus(d, a) };
  const q = confondus(d, a) || confondus(d, b) || confondus(d, c) ? null : birapport(a, b, c, d);
  const surCercle = q === null ? true : estReel(q);
  return surCercle ? { type: "cocycliques", cercle, birapport: q } : { type: "non-cocycliques", cercle, birapport: q };
}

/** z' = a + e^{iθ}(z - a) : rotation de centre a et d'angle θ. */
export function rotation(centre: Cx, theta: number, z: Cx): Cx {
  return add(centre, mul(expI(theta), sub(z, centre)));
}
