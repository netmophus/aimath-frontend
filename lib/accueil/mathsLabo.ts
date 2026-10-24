/**
 * Calculs des quatre simulations du laboratoire de la page d'accueil (components/accueil/*). Fonctions pures,
 * sans dépendance : tout se passe dans le navigateur, aucun appel au backend.
 */

const MOINS = "−"; // vrai signe moins typographique

/** Nombre en écriture française (virgule décimale, vrai signe moins), au plus `decimales` décimales utiles. */
export function nombreFr(v: number, decimales = 2): string {
  const arrondi = Number(v.toFixed(decimales));
  const propre = Object.is(arrondi, -0) ? 0 : arrondi;
  return String(propre).replace("-", MOINS).replace(".", ",");
}

/** Entier si le nombre est (à 1e-9 près) entier, sinon null. */
const entier = (v: number): number | null => (Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : null);

/** « √13 ≈ 3,61 » ou « 5 » (racine exacte) pour la racine carrée d'un nombre positif donné par son carré. */
export function racineTexte(carre: number, decimales = 2): { exact: string; approx: string | null } {
  const r = Math.sqrt(carre);
  const e = entier(r);
  if (e !== null) return { exact: String(e), approx: null };
  const c = entier(carre);
  const exact = c !== null ? `√${c}` : `√${nombreFr(carre, 3)}`;
  return { exact, approx: nombreFr(r, decimales) };
}

/* ───────────────────────────── 1. Fonction f_a(x) = x + a/x ───────────────────────────── */

export const FONCTION = { min: -4, max: 4, pas: 0.5, initial: 2 } as const;

export const f = (a: number, x: number): number => x + a / x;

export interface ExtremaFonction {
  /** x = ±√a */
  racine: number;
  /** f(√a) = 2√a (minimum local) ; le maximum local vaut −2√a en x = −√a. */
  valeur: number;
}

/** Extrema locaux de f_a pour a > 0 (f'(x) = 1 − a/x² s'annule en x = ±√a) ; aucun sinon. */
export function extremaFonction(a: number): ExtremaFonction | null {
  if (!(a > 0)) return null;
  const racine = Math.sqrt(a);
  return { racine, valeur: 2 * racine };
}

/** Commentaire pédagogique selon a. */
export function commentaireFonction(a: number): string {
  if (a === 0) {
    return "Pour $a = 0$, $f(x) = x$ pour tout $x \\neq 0$ : la courbe est la droite $y = x$ privée de l'origine (le point $(0\\,;\\,0)$ est exclu). Il n'y a plus d'asymptote verticale.";
  }
  if (a > 0) {
    return "Pour $a > 0$, les deux branches sont dans les quadrants 1 et 3. La droite $y = x$ est asymptote oblique ($f(x) - x = \\dfrac{a}{x}$ tend vers $0$ quand $|x|$ grandit) et l'axe des ordonnées est asymptote verticale. Chaque branche a un extremum : un minimum local en $x = \\sqrt{a}$ et un maximum local en $x = -\\sqrt{a}$.";
  }
  return "Pour $a < 0$, les deux branches sont de part et d'autre de l'axe des ordonnées, dans les quadrants 2 et 4 près de $x = 0$. La droite $y = x$ reste asymptote oblique et $x = 0$ asymptote verticale. Ici $f'(x) = 1 - \\dfrac{a}{x^2} > 0$ : $f$ est strictement croissante sur chaque branche, sans extremum.";
}

/** Points d'une branche (x > 0 ou x < 0), échantillonnage géométrique pour bien suivre la remontée près de 0. */
export function branche(a: number, signe: 1 | -1, xMax: number, n = 240): [number, number][] {
  const xMin = 0.02;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i += 1) {
    const x = signe * xMin * Math.pow(xMax / xMin, i / n);
    pts.push([x, f(a, x)]);
  }
  return pts;
}

/* ───────────────────────────── 2. Suite u₀ = 5, uₙ₊₁ = q·uₙ + 3 ───────────────────────────── */

export const SUITE = { minCent: 20, maxCent: 85, pasCent: 5, initialCent: 50, u0: 5, b: 3, nbTermes: 11 } as const;

export interface ResultatSuite {
  q: number;
  termes: number[]; // u0 … u10
  limite: number; // L = 3 / (1 − q)
}

/** q est géré en centièmes entiers (50 → 0,50) pour éviter les erreurs d'arrondi sur le curseur. */
export function suite(qCent: number): ResultatSuite {
  const q = qCent / 100;
  const termes = [SUITE.u0 as number];
  for (let n = 1; n < SUITE.nbTermes; n += 1) termes.push((qCent * termes[n - 1]) / 100 + SUITE.b);
  return { q, termes, limite: (SUITE.b * 100) / (100 - qCent) };
}

export function commentaireSuite(r: ResultatSuite): string {
  const L = nombreFr(r.limite, 4);
  const sens =
    Math.abs(r.limite - SUITE.u0) < 1e-9
      ? "Ici u₀ = L : la suite est constante."
      : r.limite > SUITE.u0
        ? "Comme u₀ < L, les termes augmentent vers L sans la dépasser."
        : "Comme u₀ > L, les termes diminuent vers L sans descendre en dessous.";
  return `Avec 0 < q < 1, les termes de ce modèle se rapprochent de L = 3/(1 − q) = ${L}. ${sens} Cette conclusion vaut pour cette récurrence, pas pour toutes les suites.`;
}

/* ───────────────────────────── 3. Nombres complexes ───────────────────────────── */

export const COMPLEXE = { min: -4, max: 4, pas: 1, a: 3, b: 2 } as const;

export function termeImaginaire(b: number): string {
  const absB = Math.abs(b);
  return `${absB === 1 ? "" : absB}i`;
}

/** « 3 + 2i », « −2 + 3i », « 3 − 2i », « 4 », « −i », « 0 ». */
export function ecrireComplexe(a: number, b: number): string {
  if (b === 0) return nombreFr(a, 0);
  const im = termeImaginaire(b);
  if (a === 0) return `${b < 0 ? MOINS : ""}${im}`;
  return `${nombreFr(a, 0)} ${b < 0 ? MOINS : "+"} ${im}`;
}

export interface ResultatComplexe {
  z: string;
  conjugue: string;
  module: { exact: string; approx: string | null };
  /** Argument principal en degrés dans ]−180 ; 180], ou null si z = 0. */
  argumentDeg: number | null;
}

export function complexe(a: number, b: number): ResultatComplexe {
  const aa = a || 0; // évite −0
  const bb = b || 0;
  const nul = aa === 0 && bb === 0;
  const arg = nul ? null : (Math.atan2(bb, aa) * 180) / Math.PI;
  return {
    z: ecrireComplexe(aa, bb),
    conjugue: ecrireComplexe(aa, -bb || 0),
    module: racineTexte(aa * aa + bb * bb),
    argumentDeg: arg === null ? null : Number(arg.toFixed(9)),
  };
}

export const argumentTexte = (r: ResultatComplexe): string =>
  r.argumentDeg === null ? "Argument non défini" : `${nombreFr(r.argumentDeg, 2)}°`;

/* ───────────────────────────── 4. Trigonométrie ───────────────────────────── */

export const TRIGO = { min: 0, max: 360, pas: 5, initial: 50 } as const;

export interface ValeurTrigo {
  /** Valeur numérique (null si non définie). */
  valeur: number | null;
  /** Écriture exacte pour les angles remarquables (« √3/2 »), sinon null. */
  exact: string | null;
}

const REMARQUABLES: Record<number, { sin: string; cos: string; tan: string | null; s: number; c: number; t: number | null }> = {
  0: { sin: "0", cos: "1", tan: "0", s: 0, c: 1, t: 0 },
  30: { sin: "1/2", cos: "√3/2", tan: "√3/3", s: 0.5, c: Math.sqrt(3) / 2, t: Math.sqrt(3) / 3 },
  45: { sin: "√2/2", cos: "√2/2", tan: "1", s: Math.SQRT2 / 2, c: Math.SQRT2 / 2, t: 1 },
  60: { sin: "√3/2", cos: "1/2", tan: "√3", s: Math.sqrt(3) / 2, c: 0.5, t: Math.sqrt(3) },
  90: { sin: "1", cos: "0", tan: null, s: 1, c: 0, t: null },
};

const signe = (txt: string, negatif: boolean) => (negatif && txt !== "0" ? `${MOINS}${txt}` : txt);

export interface ResultatTrigo {
  theta: number;
  sin: ValeurTrigo;
  cos: ValeurTrigo;
  tan: ValeurTrigo;
}

/** sin, cos, tan d'un angle en degrés (entier, 0…360). Les angles remarquables sont exacts (cos 90° = 0 pile). */
export function trigo(theta: number): ResultatTrigo {
  const t = ((theta % 360) + 360) % 360;
  // angle de référence dans [0 ; 90] et signes selon le quadrant
  let ref: number;
  let sSigne = 1;
  let cSigne = 1;
  if (t <= 90) ref = t;
  else if (t <= 180) { ref = 180 - t; cSigne = -1; }
  else if (t <= 270) { ref = t - 180; sSigne = -1; cSigne = -1; }
  else { ref = 360 - t; sSigne = -1; }

  const rem = REMARQUABLES[ref];
  const rad = (theta * Math.PI) / 180;
  const nz = (v: number) => (Math.abs(v) < 1e-12 ? 0 : v);

  const sinNum = rem ? sSigne * rem.s : nz(Math.sin(rad));
  const cosNum = rem ? cSigne * rem.c : nz(Math.cos(rad));
  const sinExact = rem ? signe(rem.sin, sSigne < 0) : null;
  const cosExact = rem ? signe(rem.cos, cSigne < 0) : null;

  const cosNul = cosNum === 0;
  let tanNum: number | null;
  let tanExact: string | null = null;
  if (cosNul) tanNum = null;
  else if (rem && rem.t !== null) {
    tanNum = sSigne * cSigne * rem.t;
    tanExact = signe(rem.tan as string, sSigne * cSigne < 0);
  } else tanNum = nz(sinNum / cosNum);

  return {
    theta,
    sin: { valeur: sinNum || 0, exact: sinExact },
    cos: { valeur: cosNum || 0, exact: cosExact },
    tan: { valeur: tanNum === null ? null : tanNum || 0, exact: tanExact },
  };
}

/** « √3/2 » -> `\dfrac{\sqrt{3}}{2}` : écriture exacte en LaTeX (fraction et racine en notation usuelle). */
function exactEnTex(exact: string): string {
  const m = /^(−?)(√)?(\d+)(?:\/(\d+))?$/.exec(exact);
  if (!m) return exact;
  const [, moins, racine, num, den] = m;
  const n = racine ? `\\sqrt{${num}}` : num;
  return `${moins ? "-" : ""}${den ? `\\dfrac{${n}}{${den}}` : n}`;
}

/** Valeur affichée en LaTeX : `\dfrac{\sqrt{3}}{2} \approx 0{,}866`, `0`, `\approx 0{,}643` ; null si non définie. */
export function valeurTrigoTex(v: ValeurTrigo): string | null {
  if (v.valeur === null) return null;
  const dec = nombreFr(v.valeur, 3);
  const decTex = dec.replace(",", "{,}").replace(MOINS, "-");
  if (v.exact === null) return `\\approx ${decTex}`;
  return v.exact === dec ? exactEnTex(v.exact) : `${exactEnTex(v.exact)} \\approx ${decTex}`;
}
