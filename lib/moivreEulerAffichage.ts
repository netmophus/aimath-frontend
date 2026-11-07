/**
 * Formatage TeX du Laboratoire « Moivre, Euler et racines n-ièmes » (fonctions pures, sans React).
 * Tous les coefficients sont entiers ou rationnels EXACTS : jamais d'approximation décimale pour une identité.
 */

import { inversePuissanceI, type AnglesMultiples, type Laurent, type Linearisation, type Poly, type TermeBinome } from "./moivreEulerSymbolique";

export const COULEUR_REEL = "#1f2ca2";
export const COULEUR_IMAG = "#d14205";

/** e^{kix} : 1 pour k = 0, e^{ix}, e^{-ix}, e^{3ix}, e^{-3ix}… */
export function texExp(k: number): string {
  if (k === 0) return "1";
  if (k === 1) return "e^{ix}";
  if (k === -1) return "e^{-ix}";
  return `e^{${k}ix}`;
}

/** cos kx, sin kx (k = 1 : cos x). */
export const texTrig = (fonction: "cos" | "sin", k: number): string => (k === 1 ? `\\${fonction}\\,x` : `\\${fonction}\\,${k}x`);

/** Puissance d'une fonction trigonométrique de x : \sin^3 x, \cos x, 1 pour un exposant nul (« vide » côté appelant). */
function texPuissTrig(fonction: "cos" | "sin", e: number): string {
  if (e === 0) return "";
  return e === 1 ? `\\${fonction}\\,x` : `\\${fonction}^{${e}}x`;
}

/** sin^p x cos^q x en TeX. */
export function texExpression(p: number, q: number): string {
  const parts = [texPuissTrig("sin", p), texPuissTrig("cos", q)].filter((s) => s !== "");
  return parts.join("") || "1";
}

/** Somme de termes entiers « coef · base » : premier terme sans « + », coefficient 1 omis, base vide = constante. */
export function texSomme(termes: Array<{ coef: number; base: string }>): string {
  let s = "";
  for (const { coef, base } of termes) {
    if (coef === 0) continue;
    const a = Math.abs(coef);
    const corps = base === "" ? String(a) : a === 1 ? base : `${a}${base.startsWith("\\") ? "\\," : ""}${base}`;
    s += s === "" ? `${coef < 0 ? "-" : ""}${corps}` : ` ${coef < 0 ? "-" : "+"} ${corps}`;
  }
  return s === "" ? "0" : s;
}

/** Dénominateur 2^{p+q} · i^p en TeX : « -32i », « 16 », « 8i »… (exact). */
export function texDenominateurEuler(p: number, q: number): string {
  const [ur, ui] = inversePuissanceI(p); // (−i)^p ; i^p est son conjugué
  const re = ur;
  const im = -ui;
  const N = Math.pow(2, p + q);
  if (im === 0) return `${re < 0 ? "-" : ""}${N}`;
  return `${im < 0 ? "-" : ""}${N}i`;
}

/** (e^{ix} − e^{-ix})^3 ou (e^{ix} + e^{-ix}) ; chaîne vide si l'exposant est nul. */
export function texFacteurEuler(m: number, s: 1 | -1): string {
  if (m === 0) return "";
  const corps = `e^{ix}${s === 1 ? "+" : "-"}e^{-ix}`;
  return m === 1 ? `(${corps})` : `(${corps})^{${m}}`;
}

/** Substitution : sin^p cos^q = (…)^p (…)^q / (2^{p+q} i^p). */
export function texSubstitution(p: number, q: number): string {
  const num = `${texFacteurEuler(p, -1)}${texFacteurEuler(q, 1)}`;
  return `${texExpression(p, q)} = \\dfrac{${num}}{${texDenominateurEuler(p, q)}}`;
}

/** Développement de (e^{ix} + s e^{-ix})^m par le binôme : Σ C(m,j) s^j e^{i(m−2j)x}. */
export function texDevFacteur(m: number, s: 1 | -1): string {
  const termes: Array<{ coef: number; base: string }> = [];
  let c = 1;
  for (let j = 0; j <= m; j++) {
    if (j > 0) c = (c * (m - j + 1)) / j;
    termes.push({ coef: Math.round(c) * (s === -1 && j % 2 === 1 ? -1 : 1), base: texExp(m - 2 * j) });
  }
  return `${texFacteurEuler(m, s)} = ${texSomme(termes)}`;
}

/** Σ P_k e^{kix}, exposants décroissants (le produit des deux facteurs, tous termes écrits). */
export function texLaurent(P: Laurent): string {
  const exps = [...P.keys()].sort((a, b) => b - a);
  return texSomme(exps.map((k) => ({ coef: P.get(k) ?? 0, base: texExp(k) })));
}

/** Découpe une somme de termes en lignes d'au plus `parLigne` termes (environnement aligned, sans formule tronquée). */
export function texAligne(termes: Array<{ coef: number; base: string }>, tete: string, parLigne = 4): string {
  const vrais = termes.filter((t) => t.coef !== 0);
  if (vrais.length <= parLigne) return `${tete} ${texSomme(vrais)}`;
  const lignes: string[] = [];
  for (let i = 0; i < vrais.length; i += parLigne) {
    const morceau = vrais.slice(i, i + parLigne);
    const s = texSomme(morceau.map((t, j) => (i > 0 && j === 0 ? { ...t } : t)));
    lignes.push(i === 0 ? `${tete} ${s}` : `& ${morceau[0].coef < 0 ? "" : "+"} ${s}`);
  }
  return `\\begin{aligned}${lignes.join("\\\\")}\\end{aligned}`;
}

/** Regroupement des exponentielles conjuguées : P_k(e^{kix} ± e^{-kix}) = 2P_k cos kx ou 2i P_k sin kx. */
export function texRegroupement(l: Linearisation): string[] {
  const lignes: string[] = [];
  const c0 = l.P.get(0) ?? 0;
  if (c0 !== 0) lignes.push(`${c0} \\quad (\\text{terme en } e^{0} = 1)`);
  for (let k = 1; k <= l.degreMax; k++) {
    const a = l.P.get(k) ?? 0;
    const b = l.P.get(-k) ?? 0;
    if (a === 0 && b === 0) continue;
    if (a === b) {
      lignes.push(`${coefOuVide(a)}\\left(e^{${k === 1 ? "" : k}ix}+e^{-${k === 1 ? "" : k}ix}\\right) = ${2 * a}\\cos ${k === 1 ? "x" : `${k}x`}`);
    } else {
      lignes.push(`${coefOuVide(a)}\\left(e^{${k === 1 ? "" : k}ix}-e^{-${k === 1 ? "" : k}ix}\\right) = ${2 * a}\\,i\\sin ${k === 1 ? "x" : `${k}x`}`);
    }
  }
  return lignes;
}

function coefOuVide(a: number): string {
  return a === 1 ? "" : a === -1 ? "-" : a < 0 ? `(${a})` : String(a);
}

/** Le résultat linéarisé : (2 sin x + sin 3x − sin 5x)/16, ou une somme sans fraction si D = 1. */
export function texLineaire(l: Linearisation): string {
  const termes: Array<{ coef: number; base: string }> = [{ coef: l.numConstante, base: "" }];
  for (let k = 1; k <= l.degreMax; k++) {
    termes.push({ coef: l.numCos[k], base: texTrig("cos", k) });
    termes.push({ coef: l.numSin[k], base: texTrig("sin", k) });
  }
  const somme = texSomme(termes);
  return l.denominateurCommun === 1 ? somme : `\\dfrac{${somme}}{${l.denominateurCommun}}`;
}

/** Même résultat sous forme de lignes (pour aligned), numérateur découpé. */
export function texLineaireAligne(l: Linearisation): string {
  const termes: Array<{ coef: number; base: string }> = [{ coef: l.numConstante, base: "" }];
  for (let k = 1; k <= l.degreMax; k++) {
    termes.push({ coef: l.numCos[k], base: texTrig("cos", k) });
    termes.push({ coef: l.numSin[k], base: texTrig("sin", k) });
  }
  return l.denominateurCommun === 1 ? texAligne(termes, "", 4) : texLineaire(l);
}

// --- Angles multiples --------------------------------------------------------------------------------------------

/** (cos x + i sin x)^n. */
export const texMoivreBinome = (n: number): string => `(\\cos x + i\\sin x)^{${n}}`;

/** Un terme du binôme, i^k déjà évalué : « -3\,\cos x\,\sin^2 x », « i\,\sin^3 x »… colorié (réel bleu, imaginaire orange). */
export function texTermeBinome(n: number, t: TermeBinome, colorie = true): string {
  const [re, im] = t.puissanceI;
  const signe = t.reel ? (re < 0 ? "-" : "+") : im < 0 ? "-" : "+";
  const coef = t.binom === 1 ? "" : `${t.binom}`;
  const iTex = t.reel ? "" : "i";
  const parts = [coef, iTex, texPuissTrig("cos", n - t.k), texPuissTrig("sin", t.k)].filter((s) => s !== "");
  const corps = parts.length ? parts.join("\\,") : "1";
  const texte = `${corps}`;
  const colore = colorie ? `\\textcolor{${t.reel ? COULEUR_REEL : COULEUR_IMAG}}{${texte}}` : texte;
  return `${signe}${colore}`;
}

/** Développement complet du binôme (binomiaux, puissances de i) : lignes pour aligned. */
export function texDevBinome(n: number, a: AnglesMultiples): string {
  const premiers = a.termes.map((t) => texTermeBinome(n, t));
  const brut = premiers.join("");
  return brut.startsWith("+") ? brut.slice(1) : brut;
}

/** Version « coefficients binomiaux et i^k visibles » : \binom{n}{k}\, i^k … (avant évaluation de i^k). */
export function texDevBinomeBrut(n: number, a: AnglesMultiples): string {
  return a.termes
    .map((t) => {
      const ik = t.k === 0 ? "" : t.k === 1 ? "\\,i" : `\\,i^{${t.k}}`;
      return `${t.k === 0 ? "" : "+"}\\textcolor{${t.reel ? COULEUR_REEL : COULEUR_IMAG}}{\\binom{${n}}{${t.k}}${ik}\\,${[texPuissTrig("cos", n - t.k), texPuissTrig("sin", t.k)].filter(Boolean).join("\\,") || "1"}}`;
    })
    .join("");
}

/** Termes réels (cos nx) ou imaginaires (sin nx) seuls, sans le facteur i. */
export function texPartie(n: number, a: AnglesMultiples, fonction: "cos" | "sin"): string {
  const liste = fonction === "cos" ? a.termesCos : a.termesSin;
  const termes = liste.map((t) => {
    const base = [texPuissTrig("cos", n - t.k), texPuissTrig("sin", t.k)].filter(Boolean).join("\\,");
    return { coef: t.coefReel, base: base === "" ? "" : base };
  });
  return texSomme(termes);
}

/** Polynôme en `\cos x` ou `\sin x` : « 4\cos^3 x - 3\cos x ». */
export function texPolynomeTrig(poly: Poly, fonction: "cos" | "sin", ordre: "desc" | "asc" = "desc"): string {
  const termes: Array<{ coef: number; base: string }> = [];
  if (ordre === "desc") for (let m = poly.length - 1; m >= 0; m--) termes.push({ coef: poly[m], base: texPuissTrig(fonction, m) });
  else for (let m = 0; m < poly.length; m++) termes.push({ coef: poly[m], base: texPuissTrig(fonction, m) });
  return texSomme(termes);
}

/** sin nx simplifié : n impair → polynôme en sin x ; n pair → \cos x (polynôme en sin x). */
export function texSinMultipleSimplifie(a: AnglesMultiples): string {
  const corps = texPolynomeTrig(a.polySin, "sin", "asc");
  return a.sinAvecFacteurCos ? `\\cos x\\left(${corps}\\right)` : corps;
}

// --- Mise en forme multi-lignes et substitution sin² = 1 − cos² -------------------------------------------------

/** Termes bruts du binôme, avec \binom{n}{k} et i^k encore visibles, coloriés (réel bleu, imaginaire orange). */
export function termesBinomeBruts(n: number, a: AnglesMultiples): string[] {
  return a.termes.map((t) => {
    const ik = t.k === 0 ? "" : t.k === 1 ? "\\,i" : `\\,i^{${t.k}}`;
    const trig = [texPuissTrig("cos", n - t.k), texPuissTrig("sin", t.k)].filter(Boolean).join("\\,") || "1";
    return `\\textcolor{${t.reel ? COULEUR_REEL : COULEUR_IMAG}}{\\binom{${n}}{${t.k}}${ik}\\,${trig}}`;
  });
}

/** Termes du binôme après évaluation de i^k : signes et coefficients visibles. */
export function termesBinomeEvalues(n: number, a: AnglesMultiples): string[] {
  return a.termes.map((t) => texTermeBinome(n, t));
}

/** Assemble des termes (le premier sans « + » initial) en lignes d'un environnement aligned. */
export function texLignes(termes: string[], parLigne = 2, tete = ""): string {
  const propres = termes.map((t, i) => (i === 0 && t.startsWith("+") ? t.slice(1) : t));
  const avecPlus = propres.map((t, i) => (i === 0 || t.startsWith("+") || t.startsWith("-") ? t : `+${t}`));
  const lignes: string[] = [];
  for (let i = 0; i < avecPlus.length; i += parLigne) lignes.push(`${i === 0 ? tete : "&"}${avecPlus.slice(i, i + parLigne).join("")}`);
  return `\\begin{aligned}${lignes.join("\\\\")}\\end{aligned}`;
}

/** Remplacement de sin² x par 1 − cos² x (cos nx) ou de cos² x par 1 − sin² x (sin nx) : termes avant réduction. */
export function termesSubstitues(n: number, a: AnglesMultiples, fonction: "cos" | "sin"): string[] {
  const out: string[] = [];
  const liste = fonction === "cos" ? a.termesCos : a.termesSin;
  for (const t of liste) {
    const c = t.coefReel;
    const signe = c < 0 ? "-" : "+";
    const abs = Math.abs(c);
    const coef = abs === 1 ? "" : String(abs);
    const m = n - t.k; // puissance de cos
    const parties: string[] = [];
    if (fonction === "cos") {
      if (m > 0) parties.push(texPuissTrig("cos", m));
      if (t.k > 0) parties.push(t.k / 2 === 1 ? "(1-\\cos^{2}x)" : `(1-\\cos^{2}x)^{${t.k / 2}}`);
    } else {
      if (t.k > 0) parties.push(texPuissTrig("sin", t.k));
      const e = a.sinAvecFacteurCos ? (m - 1) / 2 : m / 2;
      if (a.sinAvecFacteurCos) parties.push("\\cos x");
      if (e > 0) parties.push(e === 1 ? "(1-\\sin^{2}x)" : `(1-\\sin^{2}x)^{${e}}`);
    }
    const corps = `${coef}${coef && parties.length ? "\\," : ""}${parties.join("\\,")}` || "1";
    out.push(`${signe}${corps}`);
  }
  return out;
}
