/**
 * Modèle « suite_recurrente » (étape 9.3) : premiers termes de u_{n+1} = a·u_n + b et diagramme en escalier.
 * Le serveur envoie des fractions EXACTES écrites « n » ou « n/d » ; elles sont revalidées ici (récurrence rejouée en
 * flottants, limite = b/(1 − a) seulement si |a| < 1) et les commandes GeoGebra viennent de constantes + de ces nombres.
 */

import { COULEURS, commandeSegment, commandeTexte, commandesPoint, commandesStyle, estObjet, fenetreLibre, fenetreOrthonormee, formaterNombre, nombre } from "./commun";

export type PresentationSuite = "termes" | "escalier";
const NB_MIN = 3;
const NB_MAX = 10;
const BORNE_COEFFICIENT = 100;
const BORNE_TERME = 1e6;

export interface ParametresSuite {
  nom: "u" | "v" | "w";
  n0: 0 | 1;
  a: number;
  b: number;
  aTexte: string;
  bTexte: string;
  termes: number[];
  termesTexte: string[];
  limite: number | null;
  limiteTexte: string | null;
  presentation: PresentationSuite;
  /** Nombre de termes à calculer après le premier (question de calcul) ; null sinon. */
  demande: number | null;
  /** Forme RÉDUITE du Professeur particulier : jamais de limite (réponse de l'étude du comportement). */
  reduite: boolean;
}

/** « 11/2 » → 5,5 ; null si l'écriture sort du vocabulaire fermé. */
export function lireFraction(texte: unknown): number | null {
  if (typeof texte !== "string") return null;
  const m = /^(-?\d{1,13})(?:\/(\d{1,13}))?$/.exec(texte);
  if (!m) return null;
  const den = m[2] ? Number(m[2]) : 1;
  if (den === 0) return null;
  const v = Number(m[1]) / den;
  return Number.isFinite(v) ? v : null;
}

/** Écriture française d'une fraction exacte : « 11/2 », « −3 ». */
export const afficherFraction = (texte: string) => texte.replace("-", "−");

export function validerParametres(brut: unknown): ParametresSuite | null {
  if (!estObjet(brut)) return null;
  const reduite = !("limite" in brut);
  const cles = ["nom", "n0", "a", "b", "termes", "demande", "presentation", ...(reduite ? [] : ["limite"])];
  if (Object.keys(brut).length !== cles.length || !cles.every((c) => c in brut)) return null;
  if (brut.nom !== "u" && brut.nom !== "v" && brut.nom !== "w") return null;
  if (brut.n0 !== 0 && brut.n0 !== 1) return null;
  if (brut.presentation !== "termes" && brut.presentation !== "escalier") return null;
  if (reduite && brut.presentation !== "termes") return null;
  const demande = brut.demande;
  if (demande !== null && (typeof demande !== "number" || !Number.isInteger(demande) || demande < 1 || demande > NB_MAX - 1 || brut.presentation !== "termes")) return null;
  const a = lireFraction(brut.a);
  const b = lireFraction(brut.b);
  if (a === null || b === null || a === 0 || Math.abs(a) > BORNE_COEFFICIENT || Math.abs(b) > BORNE_COEFFICIENT) return null;
  const partielle = reduite && demande !== null; // seulement les d + 1 premiers termes
  if (!Array.isArray(brut.termes) || brut.termes.length > NB_MAX || brut.termes.length < (partielle ? 2 : NB_MIN)) return null;
  if (partielle && brut.termes.length !== (demande as number) + 1) return null;
  const termes = brut.termes.map(lireFraction);
  if (termes.some((t) => t === null || Math.abs(t) > BORNE_TERME)) return null;
  const valeurs = termes as number[];
  for (let k = 1; k < valeurs.length; k++) {
    const attendu = a * valeurs[k - 1] + b;
    if (Math.abs(attendu - valeurs[k]) > 1e-9 * Math.max(1, Math.abs(attendu))) return null; // la suite ne suit pas la récurrence
  }
  // Limite : seulement pour |a| < 1 (suite affine), jamais généralisée ; jamais dans la forme réduite.
  let limite: number | null = null;
  if (!reduite) {
    if (brut.limite !== null) {
      limite = lireFraction(brut.limite);
      if (limite === null || Math.abs(a) >= 1 || Math.abs(limite - b / (1 - a)) > 1e-9 * Math.max(1, Math.abs(limite))) return null;
    } else if (Math.abs(a) < 1) {
      return null;
    }
  }
  return {
    nom: brut.nom, n0: brut.n0, a, b, aTexte: brut.a as string, bTexte: brut.b as string,
    termes: valeurs, termesTexte: brut.termes as string[], limite, limiteTexte: reduite ? null : (brut.limite as string | null),
    presentation: brut.presentation, demande: demande as number | null, reduite,
  };
}

const indice = (n: number) => String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]);

export function nomTerme(p: ParametresSuite, k: number): string {
  return `${p.nom}${indice(p.n0 + k)}`;
}

/** « uₙ₊₁ = 1/2 uₙ + 3 » en clair (coefficient 1 omis, signe de b respecté). */
export function ecrireRecurrence(p: ParametresSuite): string {
  const a = p.aTexte === "1" ? "" : p.aTexte === "-1" ? "−" : `${afficherFraction(p.aTexte)} `;
  const b = p.b === 0 ? "" : p.b < 0 ? ` − ${afficherFraction(p.bTexte.replace("-", ""))}` : ` + ${p.bTexte}`;
  return `${p.nom}ₙ₊₁ = ${a}${p.nom}ₙ${b}`;
}

export const OBJETS = { f: "fRec", d: "diag", lim: "limY", pl: "PtLim", pt: "Pt", esc: "esc", axe: "axe", nom: "nom" } as const;

/** Nombre de marches du diagramme en escalier. */
export function nbMarches(p: ParametresSuite): number {
  return Math.min(p.termes.length - 1, 8);
}

/** Intervalle (même pour x et y) qui contient les termes montrés et la limite : le diagramme est ZOOMÉ sur la zone utile. */
function bornesEscalier(p: ParametresSuite): { lo: number; hi: number; r: number } {
  const vals = [...p.termes.slice(0, nbMarches(p) + 1), ...(p.limite !== null ? [p.limite] : [])];
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  return { lo, hi, r: Math.max(hi - lo, 1) };
}

export function fenetre(p: ParametresSuite, largeur: number, hauteur: number) {
  if (p.presentation === "termes") {
    const ys = [...p.termes, ...(p.limite !== null ? [p.limite] : [])];
    return fenetreLibre(p.n0 - 0.5, p.n0 + p.termes.length - 0.5, Math.min(0, ...ys), Math.max(0, ...ys), 0.9);
  }
  const { lo, hi, r } = bornesEscalier(p);
  return fenetreOrthonormee([[lo, lo], [hi, hi]], largeur, hauteur, { marge: 0.4 * r, margeDroite: 0.35 * r });
}

export function objetsFixes(p: ParametresSuite): string[] {
  const noms: string[] = [];
  const n = p.presentation === "termes" ? p.termes.length : nbMarches(p) + 1;
  for (let k = 0; k < n; k++) noms.push(`${OBJETS.pt}${k}`);
  if (p.presentation === "escalier") {
    noms.push(OBJETS.f, OBJETS.d);
    for (let k = 0; k < nbMarches(p) * 2; k++) noms.push(`${OBJETS.esc}${k}`);
    if (p.limite !== null) noms.push(OBJETS.pl);
  } else if (p.limite !== null) noms.push(OBJETS.lim);
  return noms;
}

/** Commandes GeoGebra : constantes + nombres validés. */
export function commandes(p: ParametresSuite): string[] {
  const liste: string[] = [];
  if (p.presentation === "termes") {
    p.termes.forEach((t, k) => {
      const nommer = k < 3 || k === p.termes.length - 1;
      liste.push(...commandesPoint(`${OBJETS.pt}${k}`, p.n0 + k, t, nommer ? nomTerme(p, k) : null, COULEURS.orange));
      liste.push(`SetPointSize(${OBJETS.pt}${k}, 4)`);
    });
    if (p.limite !== null) {
      liste.push(`${OBJETS.lim} = Curve(${nombre(p.n0 - 0.5)} + t * ${nombre(p.termes.length)}, ${nombre(p.limite)}, t, 0, 1)`);
      liste.push(...commandesStyle(OBJETS.lim, COULEURS.vert, 3, true));
    }
    return liste;
  }
  // Diagramme en escalier (zoomé) : y = a·x + b, y = x, puis la ligne brisée (u_k ; u_k) → (u_k ; u_{k+1}) → (u_{k+1} ; u_{k+1}) …
  const { lo, hi, r } = bornesEscalier(p);
  liste.push(`${OBJETS.f}(x) = ${nombre(p.a)} * x + ${nombre(p.b)}`, `SetColor(${OBJETS.f}, ${COULEURS.bleu})`, `SetLineThickness(${OBJETS.f}, 4)`, `ShowLabel(${OBJETS.f}, false)`);
  liste.push(`${OBJETS.d}(x) = x`, `SetColor(${OBJETS.d}, ${COULEURS.gris})`, `SetLineThickness(${OBJETS.d}, 3)`, `ShowLabel(${OBJETS.d}, false)`);
  const formule = p.b === 0 ? `y = ${afficherFraction(p.aTexte)} x` : `y = ${afficherFraction(p.aTexte)} x ${p.b < 0 ? "−" : "+"} ${afficherFraction(p.bTexte.replace("-", ""))}`;
  liste.push(...commandeTexte("txtF", formule, lo - 0.3 * r, hi + 0.15 * r, COULEURS.bleu));
  const m = nbMarches(p);
  const sommets: [number, number][] = [[p.termes[0], p.termes[0]]];
  for (let k = 0; k < m; k++) {
    sommets.push([p.termes[k], p.termes[k + 1]]);
    sommets.push([p.termes[k + 1], p.termes[k + 1]]);
  }
  for (let k = 0; k < sommets.length - 1; k++) {
    const [x1, y1] = sommets[k];
    const [x2, y2] = sommets[k + 1];
    liste.push(commandeSegment(`${OBJETS.esc}${k}`, x1, y1, x2, y2), ...commandesStyle(`${OBJETS.esc}${k}`, COULEURS.orange, 4));
  }
  for (let k = 0; k <= m; k++) {
    liste.push(...commandesPoint(`${OBJETS.pt}${k}`, p.termes[k], p.termes[k], k < 2 ? nomTerme(p, k) : null, COULEURS.orange));
    liste.push(`SetPointSize(${OBJETS.pt}${k}, 4)`);
  }
  if (p.limite !== null) {
    liste.push(...commandesPoint(OBJETS.pl, p.limite, p.limite, `L = ${formaterNombre(p.limite)}`, COULEURS.vert));
    liste.push(`SetPointSize(${OBJETS.pl}, 5)`);
  }
  return liste;
}
