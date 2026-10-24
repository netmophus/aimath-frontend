/**
 * Outils communs aux modèles de simulation de l'étape 9.3 (plan complexe, suites, géométrie du triangle).
 * Les commandes GeoGebra sont fabriquées ICI à partir de constantes et de NOMBRES déjà validés : aucun texte venant du
 * serveur, d'un élève ou d'une IA n'est jamais exécuté.
 */

export const estObjet = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Écriture décimale à point pour GeoGebra (nombre déjà validé). */
export const nombre = (n: number) => String(Math.round(n * 1e6) / 1e6);

/** Écriture française lisible : « 3 », « −1,5 » (virgule, vrai signe moins). */
export const formaterNombre = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",").replace("-", "−");

export const COULEURS = {
  bleu: "0.12, 0.25, 0.45",
  orange: "0.93, 0.45, 0.05",
  vert: "0.12, 0.45, 0.25",
  gris: "0.4, 0.4, 0.4",
} as const;

/** « √13 », « 2√5 », « 4 » : coef·√rad (rad sans facteur carré, coef et rad entiers déjà vérifiés). */
export function ecrireRacine(coef: number, rad: number): string {
  if (rad === 1) return String(coef);
  return `${coef === 1 ? "" : coef}√${rad}`;
}

/** Segment tracé par une courbe paramétrée (la commande `Segment` n'est pas disponible dans l'appli « graphing »). */
export function commandeSegment(nom: string, x1: number, y1: number, x2: number, y2: number): string {
  return `${nom} = Curve(${nombre(x1)} + t * ${nombre(x2 - x1)}, ${nombre(y1)} + t * ${nombre(y2 - y1)}, t, 0, 1)`;
}

/** Style d'un objet : couleur, épaisseur, pointillés, légende éventuelle (seulement des constantes et des nombres). */
export function commandesStyle(nom: string, couleur: string, epaisseur: number, pointille = false): string[] {
  return [
    `SetColor(${nom}, ${couleur})`,
    `SetLineThickness(${nom}, ${epaisseur})`,
    ...(pointille ? [`SetLineStyle(${nom}, 1)`] : []),
    `ShowLabel(${nom}, false)`,
  ];
}

export function commandesPoint(nom: string, x: number, y: number, legende: string | null, couleur: string = COULEURS.bleu): string[] {
  return [
    `${nom} = (${nombre(x)}, ${nombre(y)})`,
    ...(legende === null
      ? [`ShowLabel(${nom}, false)`]
      : [`SetCaption(${nom}, "${legende}")`, `SetLabelMode(${nom}, 3)`, `ShowLabel(${nom}, true)`]),
    `SetColor(${nom}, ${couleur})`,
  ];
}

/** Texte posé à des coordonnées (le contenu ne contient que des constantes, des lettres validées et des nombres). */
export function commandeTexte(nom: string, contenu: string, x: number, y: number, couleur: string = COULEURS.bleu): string[] {
  return [`${nom} = Text("${contenu}", (${nombre(x)}, ${nombre(y)}))`, `SetColor(${nom}, ${couleur})`];
}

/** Fenêtre ORTHONORMÉE (même échelle en x et en y) qui contient les points, adaptée au format du cadre. `margeDroite`
 * réserve de la place au bord droit pour les boutons de zoom de GeoGebra (unités du repère). */
export function fenetreOrthonormee(
  points: ReadonlyArray<readonly [number, number]>,
  largeur: number,
  hauteur: number,
  options: { marge?: number; margeDroite?: number } = {},
) {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  let xmin = Math.min(...xs);
  let xmax = Math.max(...xs);
  let ymin = Math.min(...ys);
  let ymax = Math.max(...ys);
  const marge = Math.max(options.marge ?? 1.2, 0.2 * Math.max(xmax - xmin, ymax - ymin));
  xmin -= marge;
  xmax += marge + (options.margeDroite ?? 0);
  ymin -= marge;
  ymax += marge;
  const rapport = Math.max(0.2, largeur) / Math.max(0.2, hauteur);
  const l = xmax - xmin;
  const h = ymax - ymin;
  if (l / h < rapport) {
    const cible = h * rapport;
    xmin -= (cible - l) / 2;
    xmax += (cible - l) / 2;
  } else {
    const cible = l / rapport;
    ymin -= (cible - h) / 2;
    ymax += (cible - h) / 2;
  }
  return { xmin, xmax, ymin, ymax };
}

/** Fenêtre à échelles INDÉPENDANTES (suites : indice en abscisse, valeur en ordonnée). */
export function fenetreLibre(xmin: number, xmax: number, ymin: number, ymax: number, margeDroite = 0) {
  const mx = Math.max(0.5, 0.08 * (xmax - xmin));
  const my = Math.max(0.5, 0.12 * (ymax - ymin));
  return { xmin: xmin - mx, xmax: xmax + mx + margeDroite, ymin: ymin - my, ymax: ymax + my };
}

export interface Fenetre {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}
