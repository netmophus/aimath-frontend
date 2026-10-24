/**
 * Calculs des onglets « Suites numériques » (toile d'araignée), « Intégrale » et « Limites » du laboratoire de la page
 * d'accueil. Fonctions pures, sans dépendance : tout se passe dans le navigateur.
 */

/** Graduations « rondes » (1, 2, 5 × 10^k) couvrant [lo ; hi], au plus ~`cible` repères. */
export function graduations(lo: number, hi: number, cible = 5): number[] {
  const brut = (hi - lo) / cible;
  const puissance = Math.pow(10, Math.floor(Math.log10(brut)));
  const pas = [1, 2, 5, 10].map((m) => m * puissance).find((p) => p >= brut) ?? 10 * puissance;
  const sortie: number[] = [];
  for (let k = Math.ceil(lo / pas - 1e-9); k * pas <= hi + 1e-9; k++) sortie.push(Math.round(k * pas * 1e9) / 1e9);
  return sortie;
}

/** Échantillons (x ; f(x)) de la fonction sur [xmin ; xmax], coupés en tronçons aux valeurs non finies ou hors de [ymin ; ymax]. */
export function troncons(f: (x: number) => number, xmin: number, xmax: number, ymin: number, ymax: number, n = 400): [number, number][][] {
  const sortie: [number, number][][] = [];
  let courant: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = xmin + ((xmax - xmin) * i) / n;
    const y = f(x);
    if (Number.isFinite(y) && y >= ymin && y <= ymax) courant.push([x, y]);
    else if (courant.length) {
      sortie.push(courant);
      courant = [];
    }
  }
  if (courant.length) sortie.push(courant);
  return sortie;
}

/* ───────────────────────────── 1. Suites : toile d'araignée ───────────────────────────── */

export type IdRelation = "racine" | "affine" | "cosinus";

export interface Relation {
  id: IdRelation;
  libelle: string;
  /** Libellé du bouton de choix, en LaTeX. */
  libelleTex: string;
  /** Relation de récurrence en LaTeX. */
  tex: (q: number) => string;
  f: (u: number, q: number) => number;
  u0: { min: number; max: number; pas: number; initial: number };
  /** Fenêtre carrée [lo ; hi] affichée sur les deux axes. */
  fenetre: (q: number) => { lo: number; hi: number };
}

const nb = (v: number): string => String(v).replace(".", "{,}");

export const RELATIONS: Relation[] = [
  {
    id: "racine",
    libelle: "racine carrée de 2 plus u",
    libelleTex: "\\sqrt{2+u_n}",
    tex: () => "u_{n+1} = \\sqrt{2 + u_n}",
    f: (u) => Math.sqrt(2 + u),
    u0: { min: 0, max: 4, pas: 0.1, initial: 0.5 },
    fenetre: () => ({ lo: 0, hi: 4.4 }),
  },
  {
    id: "affine",
    libelle: "q fois u plus 3",
    libelleTex: "q\\,u_n+3",
    tex: (q) => `u_{n+1} = ${nb(q)}\\,u_n + 3`,
    f: (u, q) => q * u + 3,
    u0: { min: 0, max: 10, pas: 0.5, initial: 1 },
    fenetre: (q) => ({ lo: 0, hi: Math.max(10, 3 / (1 - q)) * 1.08 }),
  },
  {
    id: "cosinus",
    libelle: "cosinus de u",
    libelleTex: "\\cos u_n",
    tex: () => "u_{n+1} = \\cos u_n",
    f: (u) => Math.cos(u),
    u0: { min: 0, max: 3, pas: 0.1, initial: 2.5 },
    fenetre: () => ({ lo: -1.2, hi: 3.2 }),
  },
];

export const SUITE_Q = { min: 0.2, max: 0.85, pas: 0.05, initial: 0.5 } as const;
export const NB_MARCHES = 12;

/** Point fixe L = f(L) vers lequel converge la suite (formule exacte pour q·u + 3, sinon itération). */
export function pointFixe(rel: Relation, q: number): number {
  if (rel.id === "affine") return 3 / (1 - q);
  let u = 1;
  for (let i = 0; i < 400; i++) u = rel.f(u, q);
  return u;
}

/** Termes u₀ … u_n. */
export function termes(rel: Relation, q: number, u0: number, n: number): number[] {
  const t = [u0];
  for (let k = 0; k < n; k++) t.push(rel.f(t[k], q));
  return t;
}

/** Ligne brisée de la toile : (u₀ ; 0) → (u₀ ; u₁) → (u₁ ; u₁) → (u₁ ; u₂) → … après n marches. */
export function toile(rel: Relation, q: number, u0: number, n: number): [number, number][] {
  const t = termes(rel, q, u0, n);
  const pts: [number, number][] = [[u0, 0]];
  for (let k = 0; k < n; k++) {
    pts.push([t[k], t[k + 1]]);
    pts.push([t[k + 1], t[k + 1]]);
  }
  return pts;
}

/* ───────────────────────────── 2. Intégrale ───────────────────────────── */

export type IdIntegrale = "carre" | "droite" | "sinus";

export interface FonctionIntegrale {
  id: IdIntegrale;
  libelle: string;
  /** Libellé du bouton de choix, en LaTeX. */
  libelleTex: string;
  fTex: string;
  FTex: string;
  f: (x: number) => number;
  /** Primitive F(x) = ∫₀ˣ f(t) dt (borne inférieure a = 0). */
  F: (x: number) => number;
  xmax: number;
  initial: number;
}

export const FONCTIONS_INTEGRALE: FonctionIntegrale[] = [
  { id: "carre", libelle: "x au carré", libelleTex: "x^2", fTex: "t^2", FTex: "\\dfrac{x^3}{3}", f: (x) => x * x, F: (x) => (x * x * x) / 3, xmax: 3, initial: 1.5 },
  { id: "droite", libelle: "x", libelleTex: "x", fTex: "t", FTex: "\\dfrac{x^2}{2}", f: (x) => x, F: (x) => (x * x) / 2, xmax: 3, initial: 2 },
  { id: "sinus", libelle: "1 plus sinus de x", libelleTex: "1+\\sin x", fTex: "1 + \\sin t", FTex: "x + 1 - \\cos x", f: (x) => 1 + Math.sin(x), F: (x) => x + 1 - Math.cos(x), xmax: 6.3, initial: 2 },
];

/** Aire sous f entre 0 et x (méthode de Simpson, 200 intervalles) : sert à vérifier que l'aire vaut F(x). */
export function aire(f: (x: number) => number, x: number, n = 200): number {
  if (x <= 0) return 0;
  const h = x / n;
  let s = f(0) + f(x);
  for (let i = 1; i < n; i++) s += f(i * h) * (i % 2 === 1 ? 4 : 2);
  return (s * h) / 3;
}

/* ───────────────────────────── 3. Limites ───────────────────────────── */

export type IdLimite = "homographique" | "exponentielle" | "sinuscardinal";

export interface FonctionLimite {
  id: IdLimite;
  libelle: string;
  /** Libellé du bouton de choix, en LaTeX. */
  libelleTex: string;
  fTex: string;
  /** Limites affichées (LaTeX). */
  limitesTex: string[];
  f: (x: number) => number;
  fenetre: { xmin: number; xmax: number; ymin: number; ymax: number };
  curseur: { min: number; max: number; pas: number; initial: number };
  asymptoteH: number | null;
  asymptoteV: number | null;
  /** Valeur interdite où f n'est pas définie, avec la limite en ce point. */
  trou: { x: number; limite: number } | null;
}

export const FONCTIONS_LIMITE: FonctionLimite[] = [
  {
    id: "homographique",
    libelle: "2x plus 1 sur x moins 1",
    libelleTex: "\\dfrac{2x+1}{x-1}",
    fTex: "f(x) = \\dfrac{2x+1}{x-1}",
    limitesTex: ["\\lim_{x\\to+\\infty}\\dfrac{2x+1}{x-1} = 2", "\\lim_{x\\to1^{+}}\\dfrac{2x+1}{x-1} = +\\infty", "\\lim_{x\\to1^{-}}\\dfrac{2x+1}{x-1} = -\\infty"],
    f: (x) => (2 * x + 1) / (x - 1),
    fenetre: { xmin: -6, xmax: 8, ymin: -6, ymax: 10 },
    curseur: { min: -6, max: 8, pas: 0.1, initial: 4 },
    asymptoteH: 2,
    asymptoteV: 1,
    trou: null,
  },
  {
    id: "exponentielle",
    libelle: "exponentielle de moins x",
    libelleTex: "\\mathrm{e}^{-x}",
    fTex: "f(x) = \\mathrm{e}^{-x}",
    limitesTex: ["\\lim_{x\\to+\\infty}\\mathrm{e}^{-x} = 0", "\\lim_{x\\to-\\infty}\\mathrm{e}^{-x} = +\\infty"],
    f: (x) => Math.exp(-x),
    fenetre: { xmin: -2, xmax: 8, ymin: -0.5, ymax: 5 },
    curseur: { min: -2, max: 8, pas: 0.1, initial: 1 },
    asymptoteH: 0,
    asymptoteV: null,
    trou: null,
  },
  {
    id: "sinuscardinal",
    libelle: "sinus de x sur x",
    libelleTex: "\\dfrac{\\sin x}{x}",
    fTex: "f(x) = \\dfrac{\\sin x}{x}",
    limitesTex: ["\\lim_{x\\to0}\\dfrac{\\sin x}{x} = 1", "\\lim_{x\\to+\\infty}\\dfrac{\\sin x}{x} = 0"],
    f: (x) => Math.sin(x) / x,
    fenetre: { xmin: -14, xmax: 14, ymin: -0.5, ymax: 1.25 },
    curseur: { min: -14, max: 14, pas: 0.1, initial: 6 },
    asymptoteH: 0,
    asymptoteV: null,
    trou: { x: 0, limite: 1 },
  },
];
