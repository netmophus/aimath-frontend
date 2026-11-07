/**
 * Formatage (TeX), valeurs exactes des angles remarquables et lecture des réponses de l'élève pour le Laboratoire des
 * nombres complexes. Fonctions pures, sans React. Les valeurs EXACTES ne sont affichées que lorsqu'elles sont reconnues
 * à 1e-9 près (angles multiples de π/12 « remarquables », racines carrées simples) ; sinon on affiche une valeur
 * APPROCHÉE arrondie, jamais présentée comme exacte.
 */

import { TOL, normaliserAngle, type Cx } from "./complexes";

const VIRGULE = "{,}";

/** Nombre arrondi à `decimales` chiffres, sans zéros inutiles, jamais « -0 ». Texte brut (virgule française). */
export function formaterNombre(x: number, decimales = 3): string {
  if (!Number.isFinite(x)) return "—";
  const arrondi = Number(x.toFixed(decimales));
  const sain = Object.is(arrondi, -0) ? 0 : arrondi;
  return String(sain).replace(".", ",");
}

/** Nombre en TeX, virgule décimale française (« 1{,}732 »). */
export function texNombre(x: number, decimales = 3): string {
  return formaterNombre(x, decimales).replace(",", VIRGULE);
}

const RACINES_RECONNUES = [2, 3, 5, 6, 7, 10];

/**
 * Écrit un réel en TeX. Exact si x est entier, ou de la forme p√m / q (m ∈ {2,3,5,6,7,10}, |p| ≤ 12, q ≤ 6) à 1e-9 près ;
 * sinon valeur approchée arrondie à 3 décimales.
 */
export function texReel(x: number): string {
  if (!Number.isFinite(x)) return "?";
  if (Math.abs(x - Math.round(x)) <= TOL * Math.max(1, Math.abs(x))) return String(Math.round(x) === 0 ? 0 : Math.round(x));
  for (const m of RACINES_RECONNUES) {
    for (let q = 1; q <= 6; q++) {
      const p = (x * q) / Math.sqrt(m);
      const pe = Math.round(p);
      if (pe !== 0 && Math.abs(pe) <= 12 && Math.abs(p - pe) <= TOL * Math.max(1, Math.abs(p))) {
        const signe = pe < 0 ? "-" : "";
        const a = Math.abs(pe);
        const racine = `${a === 1 ? "" : a}\\sqrt{${m}}`;
        return q === 1 ? `${signe}${racine}` : `${signe}\\frac{${racine}}{${q}}`;
      }
    }
  }
  return texNombre(x);
}

/** Un réel a-t-il une écriture exacte reconnue par texReel (entier ou racine simple) ? */
export function estExactReconnu(x: number): boolean {
  return !texReel(x).includes(VIRGULE);
}

/** a + ib en TeX (forme algébrique). Les coefficients 0 et ±1 sont simplifiés. */
export function texComplexe(z: Cx): string {
  const re = Math.abs(z.re) < 5e-10 ? 0 : z.re;
  const im = Math.abs(z.im) < 5e-10 ? 0 : z.im;
  const partieImag = (b: number): string => {
    const t = texReel(Math.abs(b));
    return t === "1" ? "i" : /^\d+$/.test(t) ? `${t}i` : `${t}\\,i`;
  };
  if (im === 0) return texReel(re);
  if (re === 0) return `${im < 0 ? "-" : ""}${partieImag(im)}`;
  return `${texReel(re)} ${im < 0 ? "-" : "+"} ${partieImag(im)}`;
}

/** Module en TeX : √(a²+b²) simplifié quand a et b sont entiers (ex. √20 = 2√5), valeur exacte reconnue, sinon approchée. */
export function texModule(z: Cx): string {
  const r = Math.hypot(z.re, z.im);
  if (Number.isInteger(z.re) && Number.isInteger(z.im)) {
    const n = z.re * z.re + z.im * z.im;
    return texRacineEntiere(n);
  }
  return texReel(r);
}

/** √n simplifié pour un entier n ≥ 0 : 20 → 2\sqrt{5}, 25 → 5, 7 → \sqrt{7}. */
export function texRacineEntiere(n: number): string {
  if (n === 0) return "0";
  let sortie = 1;
  let reste = n;
  for (let f = 2; f * f <= reste; f++) {
    while (reste % (f * f) === 0) {
      reste /= f * f;
      sortie *= f;
    }
  }
  if (reste === 1) return String(sortie);
  return `${sortie === 1 ? "" : sortie}\\sqrt{${reste}}`;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/**
 * Angle en TeX. Si t est un multiple rationnel de π de dénominateur 1, 2, 3, 4, 6, 8, 12 (à 1e-9 près), on écrit
 * « \frac{2\pi}{3} » ; sinon valeur décimale « 1{,}107 ». (Pas de réduction : t est affiché tel quel.)
 */
export function texAngle(t: number): string {
  for (const d of [1, 2, 3, 4, 6, 8, 12]) {
    const k = (t * d) / Math.PI;
    const ke = Math.round(k);
    if (Math.abs(k - ke) <= TOL * Math.max(1, Math.abs(k))) return texMultiplePi(ke, d);
  }
  return `${texNombre(t)}`;
}

/** (k/d)·π en TeX : 0, \pi, -\pi, \frac{\pi}{2}, \frac{2\pi}{3}… */
export function texMultiplePi(k: number, d: number): string {
  if (k === 0) return "0";
  const g = pgcd(k, d);
  const n = k / g;
  const q = d / g;
  const signe = n < 0 ? "-" : "";
  const a = Math.abs(n);
  const num = a === 1 ? "\\pi" : `${a}\\pi`;
  return q === 1 ? `${signe}${num}` : `${signe}\\frac{${num}}{${q}}`;
}

/** Angle en degrés : « 120° ». */
export function texDegres(t: number): string {
  const deg = (t * 180) / Math.PI;
  return `${texNombre(Math.abs(deg - Math.round(deg)) < 1e-7 ? Math.round(deg) : deg, 1)}^\\circ`;
}

// --- Angles remarquables : valeurs exactes de cos et sin --------------------------------------------------------

/** Valeur exacte (signe)·(n/d)·√m, avec m ∈ {1, 2, 3}. */
export interface Exact {
  n: number;
  d: number;
  m: 1 | 2 | 3;
}

export function texExact(e: Exact): string {
  if (e.n === 0) return "0";
  const signe = e.n < 0 ? "-" : "";
  const a = Math.abs(e.n);
  const racine = e.m === 1 ? "" : `\\sqrt{${e.m}}`;
  const num = e.m === 1 ? `${a}` : a === 1 ? racine : `${a}${racine}`;
  return e.d === 1 ? `${signe}${num}` : `${signe}\\frac{${num}}{${e.d}}`;
}

export function valeurExact(e: Exact): number {
  return (e.n / e.d) * Math.sqrt(e.m);
}

/** Produit d'un exact par un entier (réduit la fraction). */
export function exactFoisEntier(e: Exact, k: number): Exact {
  const n = e.n * k;
  const g = n === 0 ? e.d : pgcd(n, e.d);
  return { n: n / g, d: e.d / g, m: e.m };
}

export interface AngleRemarquable {
  /** Angle = u · π/12, u entier. */
  u: number;
  rad: number;
  tex: string;
  degres: number;
  cos: Exact;
  sin: Exact;
}

const COS_SIN: Record<number, [Exact, Exact]> = {
  0: [{ n: 1, d: 1, m: 1 }, { n: 0, d: 1, m: 1 }],
  2: [{ n: 1, d: 2, m: 3 }, { n: 1, d: 2, m: 1 }],
  3: [{ n: 1, d: 2, m: 2 }, { n: 1, d: 2, m: 2 }],
  4: [{ n: 1, d: 2, m: 1 }, { n: 1, d: 2, m: 3 }],
  6: [{ n: 0, d: 1, m: 1 }, { n: 1, d: 1, m: 1 }],
};

/** cos et sin EXACTS de u·π/12 pour les angles remarquables (u multiple de 2 ou de 3), ou null. */
export function trigExacte(u: number): { cos: Exact; sin: Exact } | null {
  if (!Number.isInteger(u)) return null;
  const v = ((u % 24) + 24) % 24; // angle dans [0, 2π[
  if (v % 2 !== 0 && v % 3 !== 0) return null;
  // Réduction au premier quadrant : angle de référence ref (0..6) et signes selon le quadrant.
  const quadrant = Math.floor(v / 6);
  const reste = v % 6;
  // Premier quadrant : (cos, sin) de reste ; autres quadrants par rotations de π/2.
  const base = reste === 0 ? COS_SIN[0] : COS_SIN[reste];
  if (!base) return null;
  let [c, s] = base;
  for (let i = 0; i < quadrant; i++) {
    // rotation de +π/2 : (c, s) -> (-s, c)
    const nc = { ...s, n: s.n === 0 ? 0 : -s.n };
    [c, s] = [nc, c];
  }
  return { cos: c, sin: s };
}

export function angleRemarquable(u: number): AngleRemarquable {
  const t = trigExacte(u);
  if (t === null) throw new Error(`Angle non remarquable : ${u}·π/12`);
  return { u, rad: (u * Math.PI) / 12, tex: texMultiplePi(u, 12), degres: u * 15, cos: t.cos, sin: t.sin };
}

/** Angles proposés dans l'interface (voir cahier des charges). */
export const ANGLES_REMARQUABLES: AngleRemarquable[] = [0, 2, 3, 4, 6, 8, 9, 12, -6].map(angleRemarquable);

/** Si t est (à 1e-9 près, modulo 2π) un angle remarquable, renvoie u (multiple de π/12) ; sinon null. */
export function reconnaitreAngleRemarquable(t: number): number | null {
  const u = (normaliserAngle(t) * 12) / Math.PI;
  const ue = Math.round(u);
  if (Math.abs(u - ue) > 1e-8) return null;
  if (trigExacte(ue) === null) return null;
  return ue === -12 ? 12 : ue;
}

// --- Lecture des réponses de l'élève ---------------------------------------------------------------------------

export type Lecture = { ok: true; valeur: number } | { ok: false; erreur: string };

function nombreBrut(s: string): number | null {
  if (!/^\d+(\.\d+)?$|^\.\d+$/.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

/**
 * Lit un réel : « 3 », « -2,5 », « 1/2 », « √3 », « 2√3 », « -√3/2 », « sqrt(3) ». Virgule ou point décimal.
 * Renvoie un message d'erreur en français sinon.
 */
export function lireReel(texte: string): Lecture {
  let s = texte.trim().replace(/\s+/g, "").replace(/,/g, ".").replace(/−/g, "-").replace(/sqrt\(?(\d+(?:\.\d+)?)\)?/gi, "√$1").replace(/[×*·]/g, "");
  if (s === "") return { ok: false, erreur: "Réponse vide." };
  let signe = 1;
  if (s.startsWith("-")) {
    signe = -1;
    s = s.slice(1);
  } else if (s.startsWith("+")) s = s.slice(1);
  const [haut, bas, trop] = s.split("/");
  if (trop !== undefined) return { ok: false, erreur: "Une seule barre de fraction est acceptée." };
  const lireTerme = (t: string): number | null => {
    if (t === "") return null;
    const idx = t.indexOf("√");
    if (idx === -1) return nombreBrut(t);
    const coef = idx === 0 ? 1 : nombreBrut(t.slice(0, idx));
    const rad = nombreBrut(t.slice(idx + 1));
    if (coef === null || rad === null || rad < 0) return null;
    return coef * Math.sqrt(rad);
  };
  const num = lireTerme(haut);
  if (num === null) return { ok: false, erreur: "Écris un nombre, par exemple 3, -2,5, 1/2 ou 2√3." };
  if (bas === undefined) return { ok: true, valeur: signe * num };
  const den = lireTerme(bas);
  if (den === null || den === 0) return { ok: false, erreur: "Le dénominateur doit être un nombre non nul." };
  return { ok: true, valeur: (signe * num) / den };
}

/** Lit un nombre complexe sous forme algébrique : « 11+10i », « -3i », « 1/2 - 3/2 i », « i ». */
export function lireComplexe(texte: string): { ok: true; valeur: Cx } | { ok: false; erreur: string } {
  const s = texte.trim().replace(/\s+/g, "").replace(/−/g, "-").replace(/,/g, ".");
  if (s === "") return { ok: false, erreur: "Réponse vide." };
  const termes = s.match(/[+-]?[^+-]+/g);
  if (!termes || termes.join("") !== s) return { ok: false, erreur: "Écris le nombre sous la forme a + bi, par exemple 11 + 10i." };
  let re = 0;
  let im = 0;
  for (const t of termes) {
    const signe = t.startsWith("-") ? -1 : 1;
    const corps = t.replace(/^[+-]/, "");
    if (/i$/.test(corps)) {
      const coefTexte = corps.slice(0, -1);
      let coef: number;
      if (coefTexte === "") coef = 1;
      else {
        const l = lireReel(coefTexte);
        if (!l.ok) return { ok: false, erreur: "Coefficient de i illisible. Écris par exemple 10i ou 3/2 i." };
        coef = l.valeur;
      }
      im += signe * coef;
    } else {
      const l = lireReel(corps);
      if (!l.ok) return { ok: false, erreur: "Partie réelle illisible. Écris par exemple 11 ou 1/2." };
      re += signe * l.valeur;
    }
  }
  return { ok: true, valeur: { re, im } };
}

/**
 * Lit un angle en radians : « pi/3 », « 2π/3 », « -π/2 », « π », « 1,047 ». Un nombre seul est lu en radians.
 * Renvoie la valeur en radians.
 */
export function lireAngle(texte: string): Lecture {
  const s = texte.trim().toLowerCase().replace(/\s+/g, "").replace(/−/g, "-").replace(/,/g, ".").replace(/pi/g, "π").replace(/[×*·]/g, "");
  if (s === "") return { ok: false, erreur: "Réponse vide." };
  if (!s.includes("π")) {
    const l = lireReel(s);
    return l.ok ? l : { ok: false, erreur: "Écris un angle en radians, par exemple 2π/3, -π/2 ou 1,047." };
  }
  let signe = 1;
  let r = s;
  if (r.startsWith("-")) {
    signe = -1;
    r = r.slice(1);
  } else if (r.startsWith("+")) r = r.slice(1);
  const m = r.match(/^(\d+(?:\.\d+)?)?π(?:\/(\d+(?:\.\d+)?))?$/);
  const m2 = r.match(/^(\d+(?:\.\d+)?)?\/(\d+(?:\.\d+)?)π$/); // « 2/3π » toléré
  const mm = m ?? m2;
  if (!mm) return { ok: false, erreur: "Écris un angle en radians, par exemple 2π/3, -π/2 ou π." };
  const num = m ? (mm[1] === undefined ? 1 : Number(mm[1])) : Number(mm[1] ?? 1);
  const den = m ? (mm[2] === undefined ? 1 : Number(mm[2])) : Number(mm[2]);
  if (!(den > 0) || !Number.isFinite(num) || !Number.isFinite(den)) return { ok: false, erreur: "Dénominateur invalide." };
  return { ok: true, valeur: (signe * num * Math.PI) / den };
}

/** Tolérance de correction d'une réponse numérique de l'élève (arrondi à 3 décimales accepté). */
export const TOL_REPONSE = 5e-3;

export function reponseEgale(lu: number, attendu: number, tol = TOL_REPONSE): boolean {
  return Math.abs(lu - attendu) <= tol * Math.max(1, Math.abs(attendu));
}
