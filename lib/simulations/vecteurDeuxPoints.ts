/**
 * Modèle « vecteur_deux_points » (étapes 9.1 et 9.1.2) : deux points A et B et le vecteur AB dans un repère orthonormé.
 * Le serveur n'envoie que des NOMBRES, des noms de points et une PRÉSENTATION choisie dans un vocabulaire fermé
 * (« points », « vecteur », « composantes ») ; les paramètres sont revalidés ici (jamais fiés), et les commandes
 * GeoGebra sont construites à partir de constantes + de ces seules valeurs validées.
 */

export interface PointSimule {
  nom: string;
  x: number;
  y: number;
}

/** points : A et B seulement ; vecteur : A, B et AB orienté de A vers B ; composantes : AB et ses composantes Δx, Δy. */
export type Presentation = "points" | "vecteur" | "composantes";
const PRESENTATIONS: readonly Presentation[] = ["points", "vecteur", "composantes"];

/** Coordonnées du vecteur : `null` dans les formes RÉDUITES de la divulgation progressive (Professeur particulier),
 * où elles sont la réponse d'une question non encore dévoilée et ne sont donc pas transmises. */
export interface VecteurSimule {
  nom: string;
  x: number | null;
  y: number | null;
}

export interface ParametresVecteurDeuxPoints {
  points: [PointSimule, PointSimule];
  vecteur: VecteurSimule;
  presentation: Presentation;
}

const BORNE = 50;
const NOM_POINT = /^[A-Z]$/;

const estObjet = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function coordonnee(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v) || Math.abs(v) > BORNE) return null;
  return Math.abs(v * 100 - Math.round(v * 100)) < 1e-6 ? v : null; // au plus 2 décimales
}

function point(v: unknown): PointSimule | null {
  if (!estObjet(v) || typeof v.nom !== "string") return null;
  const x = coordonnee(v.x);
  const y = coordonnee(v.y);
  return x === null || y === null ? null : { nom: v.nom, x, y };
}

const estPresentation = (v: unknown): v is Presentation => typeof v === "string" && (PRESENTATIONS as readonly string[]).includes(v);

/**
 * Renvoie les paramètres s'ils sont tous conformes (noms, bornes, B − A, présentation connue), sinon null : rien n'est
 * alors affiché. Formes admises : COMPLÈTE (vecteur avec ses coordonnées, vérifiées = B − A) ou RÉDUITE (`points` sans
 * vecteur ; `vecteur` avec son seul nom). La présentation `composantes` exige toujours la forme complète.
 */
export function validerParametres(brut: unknown): ParametresVecteurDeuxPoints | null {
  if (!estObjet(brut) || !Array.isArray(brut.points) || brut.points.length !== 2 || !estPresentation(brut.presentation)) return null;
  const a = point(brut.points[0]);
  const b = point(brut.points[1]);
  if (!a || !b) return null;
  if (![a.nom, b.nom].every((n) => NOM_POINT.test(n)) || a.nom === b.nom) return null;
  const nom = a.nom + b.nom;
  const presentation = brut.presentation;

  if (brut.vecteur === undefined) {
    return presentation === "points" ? { points: [a, b], vecteur: { nom, x: null, y: null }, presentation } : null;
  }
  if (!estObjet(brut.vecteur) || brut.vecteur.nom !== nom) return null;
  if (Object.keys(brut.vecteur).length === 1) {
    return presentation === "composantes" ? null : { points: [a, b], vecteur: { nom, x: null, y: null }, presentation };
  }
  const v = point(brut.vecteur);
  if (!v) return null;
  if (Math.abs(v.x - (b.x - a.x)) > 1e-9 || Math.abs(v.y - (b.y - a.y)) > 1e-9) return null;
  return { points: [a, b], vecteur: { nom, x: v.x, y: v.y }, presentation };
}

/** Écriture décimale à point pour GeoGebra, à partir d'un nombre déjà validé (aucun texte externe). */
const nombre = (n: number) => String(Math.round(n * 100) / 100);

export const formaterNombre = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",").replace("-", "−");

// h et w : composantes horizontale (de A vers le coin) et verticale (du coin vers B), tracées comme des flèches pointillées.
export const OBJETS = { a: "Pa", b: "Pb", v: "vec", c: "Pc", h: "compH", w: "compV" } as const;

/** Objets GeoGebra réellement créés pour une présentation (le composant fixe uniquement ceux-là). */
export function objetsCrees(p: ParametresVecteurDeuxPoints): string[] {
  if (p.presentation === "points") return [OBJETS.a, OBJETS.b];
  if (p.presentation === "vecteur") return [OBJETS.a, OBJETS.b, OBJETS.v];
  return [OBJETS.a, OBJETS.b, OBJETS.v, OBJETS.c, OBJETS.h, OBJETS.w];
}

/**
 * Commandes GeoGebra : constantes + nombres/lettres validés (`validerParametres` impose `[A-Z]` et des nombres finis).
 * Les légendes « Δx = … » / « Δy = … » se calculent à partir des points validés (B − A) avec `formaterNombre` (chiffres, virgule, signe moins).
 */
export function commandes(p: ParametresVecteurDeuxPoints): string[] {
  const [a, b] = p.points;
  const liste = [
    `${OBJETS.a} = (${nombre(a.x)}, ${nombre(a.y)})`,
    `${OBJETS.b} = (${nombre(b.x)}, ${nombre(b.y)})`,
    `SetCaption(${OBJETS.a}, "${a.nom}")`,
    `SetCaption(${OBJETS.b}, "${b.nom}")`,
    `SetLabelMode(${OBJETS.a}, 3)`,
    `SetLabelMode(${OBJETS.b}, 3)`,
    `ShowLabel(${OBJETS.a}, true)`,
    `ShowLabel(${OBJETS.b}, true)`,
    `SetColor(${OBJETS.a}, 0.12, 0.25, 0.45)`,
    `SetColor(${OBJETS.b}, 0.12, 0.25, 0.45)`,
  ];
  if (p.presentation === "points") return liste;

  liste.push(
    `${OBJETS.v} = Vector(${OBJETS.a}, ${OBJETS.b})`, // orienté de A (origine) vers B (extrémité)
    `SetCaption(${OBJETS.v}, "${a.nom}${b.nom}")`,
    `SetLabelMode(${OBJETS.v}, 3)`,
    `ShowLabel(${OBJETS.v}, true)`,
    `SetColor(${OBJETS.v}, 0.93, 0.45, 0.05)`,
    `SetLineThickness(${OBJETS.v}, 6)`,
  );
  if (p.presentation === "vecteur") return liste;

  liste.push(
    `${OBJETS.c} = (${nombre(b.x)}, ${nombre(a.y)})`, // coin de l'angle droit : même abscisse que B, même ordonnée que A
    `${OBJETS.h} = Vector(${OBJETS.a}, ${OBJETS.c})`,
    `${OBJETS.w} = Vector(${OBJETS.c}, ${OBJETS.b})`,
    `SetCaption(${OBJETS.h}, "Δx = ${formaterNombre(b.x - a.x)}")`,
    `SetCaption(${OBJETS.w}, "Δy = ${formaterNombre(b.y - a.y)}")`,
    `SetLabelMode(${OBJETS.h}, 3)`,
    `SetLabelMode(${OBJETS.w}, 3)`,
    `ShowLabel(${OBJETS.h}, true)`,
    `ShowLabel(${OBJETS.w}, true)`,
    `ShowLabel(${OBJETS.c}, false)`,
    `SetColor(${OBJETS.h}, 0.12, 0.45, 0.25)`,
    `SetColor(${OBJETS.w}, 0.12, 0.45, 0.25)`,
    `SetLineStyle(${OBJETS.h}, 1)`,
    `SetLineStyle(${OBJETS.w}, 1)`,
    `SetLineThickness(${OBJETS.h}, 4)`,
    `SetLineThickness(${OBJETS.w}, 4)`,
  );
  return liste;
}

/** Fenêtre ORTHONORMÉE (même échelle en x et en y) qui contient les points avec une marge, adaptée au format du cadre. */
export function fenetre(p: ParametresVecteurDeuxPoints, largeur: number, hauteur: number) {
  const [a, b] = p.points;
  // Avec les composantes, on zoome sur la figure (sans forcer l'origine dans le cadre) : Δx et Δy restent lisibles
  // et la légende « Δy = … » reste nettement séparée du point B, même sur un téléphone.
  const origine = p.presentation === "composantes" ? [] : [0];
  const xs = [a.x, b.x, ...origine];
  const ys = [a.y, b.y, ...origine];
  let xmin = Math.min(...xs);
  let xmax = Math.max(...xs);
  let ymin = Math.min(...ys);
  let ymax = Math.max(...ys);
  const marge = Math.max(p.presentation === "composantes" ? 1.1 : 1.5, 0.25 * Math.max(xmax - xmin, ymax - ymin));
  xmin -= marge;
  // Les boutons de zoom de GeoGebra occupent le bord droit du cadre : avec les composantes, on y réserve de la place
  // pour que la légende « Δy = … », placée à droite de la flèche verticale, ne passe pas dessous.
  xmax += marge + (p.presentation === "composantes" ? 1.6 : 0);
  ymin -= marge;
  ymax += marge;
  const rapport = Math.max(0.2, largeur) / Math.max(0.2, hauteur);
  let l = xmax - xmin;
  let h = ymax - ymin;
  if (l / h < rapport) {
    const cible = h * rapport;
    xmin -= (cible - l) / 2;
    xmax += (cible - l) / 2;
  } else {
    const cible = l / rapport;
    ymin -= (cible - h) / 2;
    ymax += (cible - h) / 2;
  }
  l = xmax - xmin;
  h = ymax - ymin;
  return { xmin, xmax, ymin, ymax };
}
