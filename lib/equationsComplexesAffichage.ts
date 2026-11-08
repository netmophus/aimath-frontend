/**
 * Mise en forme TeX du Laboratoire « Équations dans ℂ » : polynômes, équations, calculs de discriminant, racines carrées,
 * formes d'un complexe. Fonctions pures, sans React. Les valeurs EXACTES ne sont écrites que lorsqu'elles sont reconnues
 * (voir texReel : entiers et racines simples) ; sinon l'écriture est une valeur APPROCHÉE arrondie (`estApprochee`).
 */

import { modC, type Cx } from "./complexes";
import { estExactReconnu, texAngle, texComplexe, texModule, texNombre, texReel } from "./complexesTex";
import type { Poly, ResultatRacineCarree } from "./equationsComplexes";

export { texComplexe, texModule, texNombre, texReel };

const NUL = 5e-10;
const reelPur = (z: Cx) => Math.abs(z.im) < NUL;
const imagPur = (z: Cx) => Math.abs(z.re) < NUL;
const nulC = (z: Cx) => reelPur(z) && Math.abs(z.re) < NUL;

/**
 * x a-t-il une écriture exacte reconnue ? Corrige `estExactReconnu` pour les valeurs minuscules non nulles
 * (1,2e-5 s'écrit « 0 » après arrondi : ce n'est PAS une écriture exacte de x).
 */
export function exactVrai(x: number): boolean {
  return x === 0 || (estExactReconnu(x) && texReel(x) !== "0");
}

/** L'écriture TeX de z contient-elle une valeur approchée (au moins une partie non reconnue comme exacte) ? */
export function estApprochee(z: Cx): boolean {
  const re = Math.abs(z.re) < NUL ? 0 : z.re;
  const im = Math.abs(z.im) < NUL ? 0 : z.im;
  return !(exactVrai(re) && exactVrai(im));
}

/** z entre parenthèses quand c'est nécessaire (complexe non réel, ou réel négatif) : « (2-3i) », « (-4) », « 5 ». */
export function parC(z: Cx): string {
  const t = texComplexe(z);
  if (reelPur(z)) return z.re < -NUL ? `\\left(${t}\\right)` : t;
  return `\\left(${t}\\right)`;
}

/** Terme c·z^k d'un polynôme, avec son signe. `premier` : pas de « + » initial. */
function terme(c: Cx, k: number, premier: boolean, variable: string): string {
  if (nulC(c)) return "";
  const puiss = k === 0 ? "" : k === 1 ? variable : `${variable}^{${k}}`;
  let signe: string;
  let corps: string;
  if (reelPur(c)) {
    signe = c.re < 0 ? "-" : "+";
    const t = texReel(Math.abs(c.re));
    corps = k > 0 && t === "1" ? puiss : `${t}${puiss ? `\\,${puiss}` : ""}`;
    if (k > 0 && t === "1") corps = puiss;
  } else if (imagPur(c)) {
    signe = c.im < 0 ? "-" : "+";
    const t = texReel(Math.abs(c.im));
    corps = t === "1" ? `i${puiss ? `\\,${puiss}` : ""}` : `${t}\\,i${puiss ? `\\,${puiss}` : ""}`;
  } else {
    signe = "+";
    corps = `\\left(${texComplexe(c)}\\right)${puiss ? `\\,${puiss}` : ""}`;
  }
  if (premier) return signe === "-" ? `-${corps}` : corps;
  return ` ${signe} ${corps}`;
}

/** P(z) = a_n z^n + … en TeX (coefficients 0 omis, ±1 simplifiés, complexes entre parenthèses). */
export function texPolynome(p: Poly, variable = "z"): string {
  const n = p.length - 1;
  let s = "";
  for (let i = 0; i < p.length; i++) s += terme(p[i], n - i, s === "", variable);
  return s === "" ? "0" : s;
}

/** « az² + bz + c = 0 » avec les valeurs. */
export function texEquation(p: Poly, variable = "z"): string {
  return `${texPolynome(p, variable)} = 0`;
}

/** Racine z en TeX : « 2 - 3i », avec ≈ si approchée. */
export function texRacine(z: Cx): string {
  return `${estApprochee(z) ? "\\approx " : ""}${texComplexe(z)}`;
}

/** Nombre réel entre parenthèses s'il est négatif. */
export function parReel(x: number): string {
  const t = texReel(x);
  return x < 0 ? `\\left(${t}\\right)` : t;
}

/** Δ = b² − 4ac avec les valeurs, pour des coefficients RÉELS : « Δ = (-5)² − 4×1×6 = 1 ». */
export function texDeltaReel(a: number, b: number, c: number, delta: number): string {
  return `\\Delta = b^2 - 4ac = ${parReel(b)}^2 - 4 \\times ${parReel(a)} \\times ${parReel(c)} = ${texReel(delta)}`;
}

/** Δ = b² − 4ac pour des coefficients COMPLEXES : substitution puis valeur. */
export function texDeltaComplexe(a: Cx, b: Cx, c: Cx, delta: Cx): string {
  return `\\Delta = b^2 - 4ac = ${parC(b)}^2 - 4 \\times ${parC(a)} \\times ${parC(c)} = ${texComplexe(delta)}`;
}

/** Formes trigonométrique et exponentielle de z non nul (exactes si l'angle est reconnu, sinon approchées). */
export function texFormesPolaires(z: Cx, argumentRad: number): { trig: string; exp: string; approchee: boolean } {
  const r = modC(z);
  const rt = texModule(z);
  const th = texAngle(argumentRad);
  const approchee = th.includes("{,}") || (rt.includes("{,}"));
  const facteur = rt === "1" ? "" : rt;
  const trig = `${facteur}${facteur ? "\\left(" : ""}\\cos ${th} + i\\sin ${th}${facteur ? "\\right)" : ""}`;
  const exp = `${facteur}${facteur ? "\\," : ""}e^{i${th.startsWith("-") ? "(" + th + ")" : th}}`;
  return { trig: r === 0 ? "0" : trig, exp: r === 0 ? "0" : exp, approchee };
}

/** Étapes 1 à 6 de la détermination des racines carrées de X + iY (TeX). */
export interface EtapeRacineCarree {
  titre: string;
  texte: string;
  expr: string;
}

export function etapesRacineCarree(r: Extract<ResultatRacineCarree, { ok: true }>): EtapeRacineCarree[] {
  const X = texReel(r.X);
  const Y = texReel(r.Y);
  const m = texModule({ re: r.X, im: r.Y });
  const exactM = exactVrai(r.module) || m !== texNombre(r.module);
  const Mtex = exactM ? m : texNombre(r.module, 4);
  const texVal = (v: number) => (exactVrai(v) ? texReel(v) : texReelPrecis(v));
  const dtex = r.cas === "nul" ? "0" : texComplexe(r.delta);
  const dopp = r.cas === "nul" ? "0" : texComplexe({ re: r.delta.re === 0 ? 0 : -r.delta.re, im: r.delta.im === 0 ? 0 : -r.delta.im });
  const approx = r.cas !== "nul" && (estApprochee(r.delta) || !exactM);
  const signeTexte: Record<typeof r.cas, string> = {
    nul: "Y = 0 et X = 0 : Δ = 0, donc δ² = 0 impose δ = 0.",
    "y-positif": "Y > 0 : le produit 2xy est positif, donc x et y sont de même signe.",
    "y-negatif": "Y < 0 : le produit 2xy est négatif, donc x et y sont de signes contraires.",
    "reel-positif": "Y = 0 et X > 0 : 2xy = 0 avec x² = X > 0 donne y = 0, donc δ est un réel.",
    "reel-negatif": "Y = 0 et X < 0 : 2xy = 0 avec y² = −X > 0 donne x = 0, donc δ est imaginaire pur.",
  };
  return [
    {
      titre: "Développer (x + iy)²",
      texte: "On cherche δ = x + iy (x et y réels) tel que δ² = Δ. On développe le carré, avec i² = −1.",
      expr: "(x+iy)^2 = x^2 - y^2 + 2ixy",
    },
    {
      titre: "Identifier les parties réelle et imaginaire",
      texte: "Deux nombres complexes sont égaux si et seulement si leurs parties réelles sont égales et leurs parties imaginaires aussi.",
      expr: `\\left\\{\\begin{aligned} x^2 - y^2 &= ${X} \\\\ 2xy &= ${Y} \\end{aligned}\\right.`,
    },
    {
      titre: "Utiliser le module",
      texte: "Le module d'un carré est le carré du module : |δ|² = |Δ|, c'est-à-dire x² + y² = |Δ|.",
      expr: `x^2 + y^2 = |\\Delta| = \\sqrt{X^2 + Y^2} = \\sqrt{${r.X < 0 ? `\\left(${X}\\right)` : X}^2 + ${r.Y < 0 ? `\\left(${Y}\\right)` : Y}^2} = ${Mtex}`,
    },
    {
      titre: "Déterminer x² et y²",
      texte: "On ajoute puis on soustrait la première équation à x² + y² = |Δ|.",
      expr: `x^2 = \\frac{|\\Delta| + X}{2} = ${texVal(r.x2)} \\qquad y^2 = \\frac{|\\Delta| - X}{2} = ${texVal(r.y2)}`,
    },
    {
      titre: "Choisir les signes",
      texte: `${signeTexte[r.cas]} Le signe de 2xy = Y décide si x et y ont le même signe ; cela ne laisse que deux couples (x ; y), opposés l'un de l'autre.`,
      expr: r.cas === "nul" ? "\\delta = 0" : `x = \\pm ${texReel(Math.abs(r.delta.re))}, \\quad y = \\pm ${texReel(Math.abs(r.delta.im))}`,
    },
    {
      titre: r.cas === "nul" ? "Résultat : une seule racine" : "Résultat : deux racines opposées",
      texte: r.cas === "nul" ? "Δ = 0 n'a qu'une seule racine carrée : 0." : `Les racines carrées de Δ sont δ et −δ${approx ? " (valeurs approchées : les écritures exactes ne sont pas toutes reconnues)" : ""}.`,
      expr: r.cas === "nul" ? "\\delta = 0" : `\\delta = ${approx ? "\\approx " : ""}${dtex} \\quad\\text{ou}\\quad -\\delta = ${approx ? "\\approx " : ""}${dopp}`,
    },
  ];
}

/** Ligne « P(z) = Re + i·Im » : parties réelle et imaginaire séparées (valeurs arrondies, jamais « -0 »). */
export function texValeurPolynome(v: Cx, decimales = 6): string {
  const arrondi = (x: number) => {
    const t = Number(x.toFixed(decimales));
    return Object.is(t, -0) ? 0 : t;
  };
  const re = arrondi(v.re);
  const im = arrondi(v.im);
  return `${texNombre(re, decimales)} ${im < 0 ? "-" : "+"} ${texNombre(Math.abs(im), decimales)}\\,i`;
}

/** Notation scientifique TeX d'un petit réel : 3{,}2\times 10^{-16}. */
export function texScientifique(x: number): string {
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / 10 ** e;
  return `${texNombre(m, 2)} \\times 10^{${e}}`;
}

/**
 * Réel en TeX avec assez de décimales pour ne jamais afficher « 0 » pour un nombre non nul : exact si reconnu,
 * sinon 4 chiffres significatifs au moins (ex. 0,0000123 reste lisible). Évite « Δ = 0 » alors que Δ ≠ 0.
 */
export function texReelPrecis(x: number): string {
  if (exactVrai(x)) return texReel(x);
  const e = Math.floor(Math.log10(Math.abs(x)));
  const decimales = Math.min(12, Math.max(3, 3 - e));
  return texNombre(x, decimales);
}

/** P(z₀) avec les valeurs substituées, terme à terme : « P(2) = 1 × 2³ + (−6) × 2² + 13 × 2 + (−10) ». */
export function texSubstitutionPolynome(p: Poly, z0: Cx): string {
  const n = p.length - 1;
  const morceaux = p.map((coef, i) => {
    const k = n - i;
    const puiss = k === 0 ? "" : k === 1 ? `\\times ${parC(z0)}` : `\\times ${parC(z0)}^{${k}}`;
    return `${parC(coef)}${puiss}`;
  });
  return `P(${texComplexe(z0)}) = ${morceaux.join(" + ")}`;
}
