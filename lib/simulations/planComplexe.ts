/**
 * Modèle « plan_complexe » (étape 9.3) : image M(a ; b) d'un nombre complexe z = a + bi, conjugué, module et argument.
 * Le serveur envoie des ENTIERS, un nom et une PRÉSENTATION (vocabulaire fermé) ainsi que les résultats calculés
 * (SymPy) ; les paramètres sont revalidés ici (module recalculé, argument vérifié par cos/sin) et les commandes GeoGebra
 * sont construites à partir de constantes + de ces seules valeurs validées.
 */

import {
  COULEURS,
  commandeSegment,
  commandeTexte,
  commandesPoint,
  commandesStyle,
  ecrireRacine,
  estObjet,
  fenetreOrthonormee,
  formaterNombre,
  nombre,
} from "./commun";

export type PresentationComplexe = "point" | "conjugue" | "module" | "argument";
const PRESENTATIONS: readonly PresentationComplexe[] = ["point", "conjugue", "module", "argument"];
const BORNE = 50;

export interface ParametresPlanComplexe {
  nom: string;
  a: number;
  b: number;
  presentation: PresentationComplexe;
  module: { coef: number; rad: number } | null;
  argument: { exact: string | null; radians: number } | null;
}

const entier = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && Math.abs(v) <= BORNE;
const entierPositif = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 10000;

/** Valeur numérique d'un argument exact écrit « 0 », « π », « -2π/3 » (vocabulaire fermé), sinon null. */
function valeurArgumentExact(texte: string): number | null {
  if (texte === "0") return 0;
  const m = /^(-?)(\d{1,2})?π(?:\/(\d{1,2}))?$/.exec(texte);
  if (!m) return null;
  const p = m[2] ? Number(m[2]) : 1;
  const q = m[3] ? Number(m[3]) : 1;
  if (q === 0) return null;
  return (m[1] ? -1 : 1) * ((p * Math.PI) / q);
}

export function validerParametres(brut: unknown): ParametresPlanComplexe | null {
  if (!estObjet(brut) || typeof brut.presentation !== "string" || !(PRESENTATIONS as readonly string[]).includes(brut.presentation)) return null;
  const presentation = brut.presentation as PresentationComplexe;
  const attendues = ["nom", "a", "b", "presentation", ...(presentation === "module" || presentation === "argument" ? ["module"] : []), ...(presentation === "argument" ? ["argument"] : [])];
  const cles = Object.keys(brut);
  if (cles.length !== attendues.length || !attendues.every((c) => cles.includes(c))) return null;
  if (typeof brut.nom !== "string" || !/^[zw](_\d)?$/.test(brut.nom) || !entier(brut.a) || !entier(brut.b)) return null;
  if (brut.a === 0 && brut.b === 0) return null;
  const carre = brut.a * brut.a + brut.b * brut.b;
  let mod: ParametresPlanComplexe["module"] = null;
  let argument: ParametresPlanComplexe["argument"] = null;
  if (presentation === "module" || presentation === "argument") {
    const m = brut.module;
    if (!estObjet(m) || Object.keys(m).length !== 2 || !entierPositif(m.coef) || !entierPositif(m.rad) || m.coef * m.coef * m.rad !== carre) return null;
    mod = { coef: m.coef, rad: m.rad };
  }
  if (presentation === "argument") {
    const g = brut.argument;
    if (!estObjet(g) || Object.keys(g).length !== 2 || typeof g.radians !== "number" || !Number.isFinite(g.radians)) return null;
    const r = Math.sqrt(carre);
    if (Math.abs(r * Math.cos(g.radians) - brut.a) > 1e-4 || Math.abs(r * Math.sin(g.radians) - brut.b) > 1e-4) return null;
    if (g.exact !== null) {
      if (typeof g.exact !== "string") return null;
      const v = valeurArgumentExact(g.exact);
      if (v === null || Math.abs(v - g.radians) > 1e-4) return null;
    }
    argument = { exact: g.exact as string | null, radians: g.radians };
  }
  return { nom: brut.nom, a: brut.a, b: brut.b, presentation, module: mod, argument };
}

/** « 3 + 2i », « −1 − i », « 2i » (écriture française avec vrai signe moins). */
export function ecrireComplexe(a: number, b: number): string {
  const im = Math.abs(b) === 1 ? "i" : `${Math.abs(b)}i`;
  if (a === 0) return b < 0 ? `−${im}` : im;
  return `${formaterNombre(a)} ${b < 0 ? "−" : "+"} ${im}`;
}

export const OBJETS = {
  m: "Pm", mc: "Pmc", o: "Po", pr: "Pre", pi: "Pim", vec: "vecOM", h: "projH", v: "projV", sym: "symM", arc: "argArc",
  re: "txtRe", im: "txtIm", mod: "txtMod", arg: "txtArg",
} as const;

export function moduleTexte(p: ParametresPlanComplexe): string | null {
  return p.module ? ecrireRacine(p.module.coef, p.module.rad) : null;
}

export function argumentTexte(p: ParametresPlanComplexe): string | null {
  if (!p.argument) return null;
  if (p.argument.exact !== null) return p.argument.exact.replace("-", "−");
  return `≈ ${formaterNombre(p.argument.radians)} rad`;
}

export function fenetre(p: ParametresPlanComplexe, largeur: number, hauteur: number) {
  const points: [number, number][] = [[0, 0], [p.a, p.b]];
  if (p.presentation === "conjugue") points.push([p.a, -p.b]);
  return fenetreOrthonormee(points, largeur, hauteur, { marge: 1.4, margeDroite: p.presentation === "point" ? 1.2 : 1.6 });
}

/** Objets créés qui doivent être verrouillés. */
export function objetsFixes(p: ParametresPlanComplexe): string[] {
  const base: string[] = [OBJETS.m];
  if (p.presentation === "point") base.push(OBJETS.h, OBJETS.v);
  if (p.presentation === "conjugue") base.push(OBJETS.mc, OBJETS.sym);
  if (p.presentation === "module" || p.presentation === "argument") base.push(OBJETS.vec, OBJETS.h, OBJETS.v);
  if (p.presentation === "argument") base.push(OBJETS.arc);
  return base;
}

/** Commandes GeoGebra : constantes + nombres validés. « Re » et « Im » sont posés près des extrémités des données (toujours dans la fenêtre). */
export function commandes(p: ParametresPlanComplexe): string[] {
  const { a, b } = p;
  const liste: string[] = [];
  liste.push(...commandesPoint(OBJETS.m, a, b, "M", COULEURS.orange));
  liste.push(`SetPointSize(${OBJETS.m}, 5)`);
  // Axes : Re (axe réel) et Im (axe imaginaire).
  liste.push(...commandeTexte(OBJETS.re, "Re", Math.max(a, 0) + 0.8, 0.25, COULEURS.gris));
  liste.push(...commandeTexte(OBJETS.im, "Im", 0.15, Math.max(b, 0) + 1, COULEURS.gris));

  if (p.presentation === "point" || p.presentation === "module" || p.presentation === "argument") {
    // Projections pointillées : la partie réelle sur l'axe des réels, la partie imaginaire sur l'axe des imaginaires.
    liste.push(commandeSegment(OBJETS.h, 0, 0, a, 0), ...commandesStyle(OBJETS.h, COULEURS.vert, 3, true));
    liste.push(commandeSegment(OBJETS.v, a, 0, a, b), ...commandesStyle(OBJETS.v, COULEURS.vert, 3, true));
  }
  if (p.presentation === "module" || p.presentation === "argument") {
    liste.push(`${OBJETS.vec} = Vector((0, 0), ${OBJETS.m})`);
    liste.push(`SetColor(${OBJETS.vec}, ${COULEURS.bleu})`, `SetLineThickness(${OBJETS.vec}, 6)`);
    liste.push(`SetCaption(${OBJETS.vec}, "|${p.nom}| = ${moduleTexte(p)}")`, `SetLabelMode(${OBJETS.vec}, 3)`, `ShowLabel(${OBJETS.vec}, true)`);
  }
  if (p.presentation === "conjugue") {
    liste.push(...commandesPoint(OBJETS.mc, a, -b, "M'", COULEURS.bleu));
    liste.push(`SetPointSize(${OBJETS.mc}, 5)`);
    liste.push(commandeSegment(OBJETS.sym, a, b, a, -b), ...commandesStyle(OBJETS.sym, COULEURS.gris, 3, true));
  }
  if (p.presentation === "argument" && p.argument) {
    const r = Math.sqrt(a * a + b * b);
    const ra = Math.max(0.5, Math.min(r * 0.38, 1.6));
    const t = p.argument.radians;
    const [t1, t2] = t >= 0 ? [0, t] : [t, 0];
    liste.push(`${OBJETS.arc} = Curve(${nombre(ra)} * cos(t), ${nombre(ra)} * sin(t), t, ${nombre(t1)}, ${nombre(t2)})`);
    liste.push(`SetColor(${OBJETS.arc}, ${COULEURS.vert})`, `SetLineThickness(${OBJETS.arc}, 5)`, `ShowLabel(${OBJETS.arc}, false)`);
    const milieu = t / 2;
    liste.push(...commandeTexte(OBJETS.arg, `θ = ${argumentTexte(p)}`, (ra + 0.35) * Math.cos(milieu) + (b < 0 ? 0.1 : 0.1), (ra + 0.35) * Math.sin(milieu) + (b < 0 ? -0.35 : 0.1), COULEURS.vert));
  }
  return liste;
}
