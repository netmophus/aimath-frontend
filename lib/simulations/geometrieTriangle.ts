/**
 * Modèle « geometrie_triangle » (étape 9.3) : points, triangle, distances et nature d'un triangle dans un repère
 * orthonormé. Le serveur envoie des points à coordonnées ENTIERES et des longueurs « coef·√rad » ; tout est revalidé ici
 * (carrés recalculés, nature recalculée par la réciproque de Pythagore) avant de fabriquer les commandes GeoGebra.
 */

import { COULEURS, commandeSegment, commandeTexte, commandesPoint, commandesStyle, ecrireRacine, estObjet, fenetreOrthonormee } from "./commun";

export type PresentationTriangle = "points" | "triangle" | "distances" | "nature";
const PRESENTATIONS: readonly PresentationTriangle[] = ["points", "triangle", "distances", "nature"];
const BORNE = 50;

export type TypeTriangle = "quelconque" | "isocele" | "rectangle" | "rectangle_isocele" | "equilateral";

export interface PointTriangle {
  nom: string;
  x: number;
  y: number;
}

export interface ParametresTriangle {
  points: PointTriangle[];
  presentation: PresentationTriangle;
  /** Segments demandés (« AB »…), dans l'ordre. */
  demandes: string[];
  /** Carré de chaque longueur, recalculé. */
  carres: Record<string, number>;
  longueurs: Record<string, { coef: number; rad: number }>;
  nature: { type: TypeTriangle; sommetDroit: string | null } | null;
}

const entier = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && Math.abs(v) <= BORNE;
const entierPositif = (v: unknown): v is number => typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 100000;

const carreDistance = (p: PointTriangle, q: PointTriangle) => (q.x - p.x) ** 2 + (q.y - p.y) ** 2;

/** Nature recalculée à partir des carrés des côtés. */
export function calculerNature(carres: Record<string, number>, noms: string[]): { type: TypeTriangle; sommetDroit: string | null } {
  const [a, b, c] = noms;
  const cotes: [string, number][] = [[a + b, carres[a + b]], [a + c, carres[a + c]], [b + c, carres[b + c]]];
  const valeurs = cotes.map((k) => k[1]).sort((x, y) => x - y);
  let droit: string | null = null;
  if (valeurs[0] + valeurs[1] === valeurs[2]) {
    const long = cotes.find((k) => k[1] === valeurs[2])![0];
    droit = noms.find((n) => !long.includes(n)) ?? null;
  }
  const egaux = new Set(valeurs).size < 3;
  let type: TypeTriangle;
  if (new Set(valeurs).size === 1) type = "equilateral";
  else if (droit && egaux) type = "rectangle_isocele";
  else if (droit) type = "rectangle";
  else if (egaux) type = "isocele";
  else type = "quelconque";
  return { type, sommetDroit: droit };
}

export function validerParametres(brut: unknown): ParametresTriangle | null {
  if (!estObjet(brut) || typeof brut.presentation !== "string" || !(PRESENTATIONS as readonly string[]).includes(brut.presentation)) return null;
  const presentation = brut.presentation as PresentationTriangle;
  // Forme RÉDUITE de la nature (Professeur particulier) : points et nature, SANS les longueurs (réponse d'une autre question).
  const reduite = presentation === "nature" && !("demandes" in brut);
  const attendues = ["points", "presentation", ...((presentation === "distances" || presentation === "nature") && !reduite ? ["demandes", "longueurs"] : []), ...(presentation === "nature" ? ["nature"] : [])];
  const cles = Object.keys(brut);
  if (cles.length !== attendues.length || !attendues.every((c) => cles.includes(c))) return null;
  if (!Array.isArray(brut.points) || (brut.points.length !== 3 && !(brut.points.length === 2 && presentation === "distances"))) return null;
  const points: PointTriangle[] = [];
  for (const p of brut.points) {
    if (!estObjet(p) || Object.keys(p).length !== 3 || typeof p.nom !== "string" || !/^[A-Z]$/.test(p.nom) || !entier(p.x) || !entier(p.y)) return null;
    points.push({ nom: p.nom, x: p.x, y: p.y });
  }
  if (new Set(points.map((p) => p.nom)).size !== points.length) return null;
  if (new Set(points.map((p) => `${p.x},${p.y}`)).size !== points.length) return null;
  if (points.length === 3) {
    const [A, B, C] = points;
    if ((B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x) === 0) return null; // alignés
  }
  const noms = points.map((p) => p.nom);
  const possibles: string[] = [];
  for (let i = 0; i < noms.length; i++) for (let j = i + 1; j < noms.length; j++) possibles.push(noms[i] + noms[j]);
  const carres: Record<string, number> = {};
  for (const s of possibles) carres[s] = carreDistance(points[noms.indexOf(s[0])], points[noms.indexOf(s[1])]);

  let demandes: string[] = [];
  const longueurs: ParametresTriangle["longueurs"] = {};
  let nature: ParametresTriangle["nature"] = null;
  if (presentation === "distances" || (presentation === "nature" && !reduite)) {
    const d = brut.demandes;
    if (!Array.isArray(d) || d.length === 0 || new Set(d).size !== d.length || d.some((s) => typeof s !== "string" || !possibles.includes(s))) return null;
    demandes = d as string[];
    if (presentation === "nature" && demandes.length !== possibles.length) return null;
    const l = brut.longueurs;
    if (!estObjet(l) || Object.keys(l).length !== demandes.length) return null;
    for (const s of demandes) {
      const v = l[s];
      if (!estObjet(v) || Object.keys(v).length !== 2 || !entierPositif(v.coef) || !entierPositif(v.rad) || v.coef * v.coef * v.rad !== carres[s]) return null;
      longueurs[s] = { coef: v.coef, rad: v.rad };
    }
  }
  if (presentation === "nature") {
    nature = calculerNature(carres, noms);
    const n = brut.nature;
    if (!estObjet(n) || n.type !== nature.type || n.sommet_droit !== nature.sommetDroit) return null;
  }
  return { points, presentation, demandes, carres, longueurs, nature };
}

export const NATURES: Record<TypeTriangle, string> = {
  quelconque: "quelconque",
  isocele: "isocèle",
  rectangle: "rectangle",
  rectangle_isocele: "rectangle isocèle",
  equilateral: "équilatéral",
};

export function longueurTexte(p: ParametresTriangle, segment: string): string {
  const l = p.longueurs[segment];
  return ecrireRacine(l.coef, l.rad);
}

/** Justification en clair de l'angle droit : « AB² + AC² = 16 + 9 = 25 = BC² ». */
export function justificationPythagore(p: ParametresTriangle): string | null {
  const droit = p.nature?.sommetDroit;
  if (!droit) return null;
  const autres = p.points.map((q) => q.nom).filter((n) => n !== droit);
  const cote = (a: string, b: string) => (p.carres[a + b] !== undefined ? a + b : b + a);
  const s1 = cote(droit, autres[0]);
  const s2 = cote(droit, autres[1]);
  const s3 = cote(autres[0], autres[1]);
  return `${s1}² + ${s2}² = ${p.carres[s1]} + ${p.carres[s2]} = ${p.carres[s3]} = ${s3}²`;
}

export const nomObjet = (nom: string) => `Pt${nom}`;
const nomSegment = (s: string) => `sg${s}`;
const nomEtiquette = (s: string) => `lg${s}`;
const DROIT = ["angleDroit1", "angleDroit2"] as const;

const aff = (p: ParametresTriangle, nom: string) => p.points.find((q) => q.nom === nom)!;

function segmentsATracer(p: ParametresTriangle): string[] {
  if (p.presentation === "points") return [];
  if (p.presentation === "distances") return p.demandes;
  if (p.points.length === 3) {
    const [a, b, c] = p.points.map((q) => q.nom);
    return [a + b, a + c, b + c];
  }
  return [];
}

export function fenetre(p: ParametresTriangle, largeur: number, hauteur: number) {
  return fenetreOrthonormee(p.points.map((q) => [q.x, q.y] as [number, number]), largeur, hauteur, { marge: 1.7, margeDroite: 1.0 });
}

export function objetsFixes(p: ParametresTriangle): string[] {
  const noms = p.points.map((q) => nomObjet(q.nom));
  noms.push(...segmentsATracer(p).map(nomSegment));
  if (p.nature?.sommetDroit) noms.push(...DROIT);
  return noms;
}

/** Commandes GeoGebra : constantes + nombres validés (lettres A–Z, entiers, longueurs coef·√rad). */
export function commandes(p: ParametresTriangle): string[] {
  const liste: string[] = [];
  const xs = p.points.map((q) => q.x);
  const ys = p.points.map((q) => q.y);
  const etendue = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 1);
  const decalage = 0.5 + 0.03 * etendue;
  const cx = xs.reduce((s, v) => s + v, 0) / xs.length;
  const cy = ys.reduce((s, v) => s + v, 0) / ys.length;

  for (const s of segmentsATracer(p)) {
    const P = aff(p, s[0]);
    const Q = aff(p, s[1]);
    liste.push(commandeSegment(nomSegment(s), P.x, P.y, Q.x, Q.y), ...commandesStyle(nomSegment(s), COULEURS.bleu, 5));
    if (p.longueurs[s]) {
      // Étiquette : au milieu, repoussée du côté opposé au centre de la figure ; le texte est ancré en bas à gauche, on
      // le décale donc de sa largeur (≈ 0,075 unité par caractère) et de sa hauteur (≈ 0,4) selon le côté choisi.
      const mx = (P.x + Q.x) / 2;
      const my = (P.y + Q.y) / 2;
      let nx = -(Q.y - P.y);
      let ny = Q.x - P.x;
      const norme = Math.hypot(nx, ny) || 1;
      nx /= norme;
      ny /= norme;
      if (nx * (mx - cx) + ny * (my - cy) < 0) {
        nx = -nx;
        ny = -ny;
      }
      const contenu = `${s} = ${longueurTexte(p, s)}`;
      const largeur = 0.075 * contenu.length;
      liste.push(...commandeTexte(nomEtiquette(s), contenu, mx + nx * decalage - largeur * (0.5 - 0.5 * nx), my + ny * decalage - 0.4 * (0.5 - 0.5 * ny), COULEURS.vert));
    }
  }
  for (const q of p.points) {
    liste.push(...commandesPoint(nomObjet(q.nom), q.x, q.y, q.nom, COULEURS.orange));
    liste.push(`SetPointSize(${nomObjet(q.nom)}, 5)`);
  }
  const droit = p.nature?.sommetDroit;
  if (droit) {
    const V = aff(p, droit);
    const [P, Q] = p.points.filter((q) => q.nom !== droit);
    const lp = Math.hypot(P.x - V.x, P.y - V.y);
    const lq = Math.hypot(Q.x - V.x, Q.y - V.y);
    const t = Math.min(0.5, 0.22 * Math.min(lp, lq));
    const u = [((P.x - V.x) / lp) * t, ((P.y - V.y) / lp) * t];
    const v = [((Q.x - V.x) / lq) * t, ((Q.y - V.y) / lq) * t];
    liste.push(commandeSegment(DROIT[0], V.x + u[0], V.y + u[1], V.x + u[0] + v[0], V.y + u[1] + v[1]), ...commandesStyle(DROIT[0], COULEURS.orange, 4));
    liste.push(commandeSegment(DROIT[1], V.x + v[0], V.y + v[1], V.x + u[0] + v[0], V.y + u[1] + v[1]), ...commandesStyle(DROIT[1], COULEURS.orange, 4));
  }
  return liste;
}
