/**
 * Moteur physique du Laboratoire de cinématique (Terminale C). Fonctions pures, sans React ni DOM : une seule source de
 * données pour les formules, les graphiques et les animations. Unités SI (m, s, rad). Conventions :
 *  - mouvement rectiligne : axe Ox orienté, grandeurs ALGÉBRIQUES (signe = sens) ;
 *  - mouvement plan : repère orthonormé direct (Ox, Oy), angles en radians, sens direct positif ;
 *  - mouvement circulaire : ω > 0 sens direct (trigonométrique), ω < 0 sens indirect.
 */

export interface Vec {
  x: number;
  y: number;
}

export const norme = (v: Vec): number => Math.hypot(v.x, v.y);
export const somme = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });
export const difference = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });
export const produit = (k: number, v: Vec): Vec => ({ x: k * v.x, y: k * v.y });
export const polaire = (r: number, angle: number): Vec => ({ x: r * Math.cos(angle), y: r * Math.sin(angle) });

/** Égalité à une tolérance relative/absolue près (tests, décisions d'affichage). */
export function presqueEgal(a: number, b: number, tol = 1e-9): boolean {
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

// ============================================================ 1. MRU / MRUV =====================================

export interface ParamsMRUV {
  /** Position initiale (m). */
  x0: number;
  /** Vitesse algébrique initiale (m/s). */
  v0: number;
  /** Accélération algébrique (m/s²). */
  a: number;
}

export const positionMRUV = (p: ParamsMRUV, t: number): number => p.x0 + p.v0 * t + 0.5 * p.a * t * t;
export const vitesseMRUV = (p: ParamsMRUV, t: number): number => p.v0 + p.a * t;

/** Instant t > 0 où la vitesse s'annule, ou null (a = 0, ou la vitesse ne s'annule jamais pour t > 0). */
export function instantArret(p: ParamsMRUV): number | null {
  if (p.a === 0) return null;
  const t = -p.v0 / p.a;
  return t > 0 ? t : null;
}

/** Déplacement algébrique x(t2) − x(t1). */
export const deplacementMRUV = (p: ParamsMRUV, t2: number, t1 = 0): number => positionMRUV(p, t2) - positionMRUV(p, t1);

/**
 * Distance totale parcourue entre t1 et t2 : ∫|v| dt. En cas de changement de sens (v s'annule strictement entre t1 et
 * t2), on additionne les deux trajets ; ce n'est PAS |x(t2) − x(t1)|, ni (xmax − xmin).
 */
export function distanceParcourueMRUV(p: ParamsMRUV, t2: number, t1 = 0): number {
  if (t2 < t1) return distanceParcourueMRUV(p, t1, t2);
  const ta = instantArret(p);
  if (ta !== null && ta > t1 && ta < t2) {
    return Math.abs(positionMRUV(p, ta) - positionMRUV(p, t1)) + Math.abs(positionMRUV(p, t2) - positionMRUV(p, ta));
  }
  return Math.abs(positionMRUV(p, t2) - positionMRUV(p, t1));
}

/** Distances parcourues pendant les `n` intervalles successifs de durée `pas` (13,5 ; 10,5 ; 7,5 pour le freinage). */
export function distancesSuccessives(p: ParamsMRUV, n: number, pas = 1): number[] {
  const res: number[] = [];
  for (let i = 0; i < n; i++) res.push(distanceParcourueMRUV(p, (i + 1) * pas, i * pas));
  return res;
}

export type NatureMRUV = "repos" | "uniforme" | "accelere" | "retarde";

/** Nature du mouvement à l'instant t : |v| croît (accéléré), décroît (retardé), constante (uniforme) ou nulle (repos). */
export function natureMRUV(p: ParamsMRUV, t: number): NatureMRUV {
  const v = vitesseMRUV(p, t);
  if (p.a === 0) return v === 0 ? "repos" : "uniforme";
  if (v === 0) return "accelere"; // à l'instant d'arrêt, le mobile repart dans le sens de a
  return v * p.a > 0 ? "accelere" : "retarde";
}

/** Bornes de l'abscisse sur [0, duree], l'origine toujours incluse (jamais de position négative ramenée du côté positif). */
export function bornesMRUV(p: ParamsMRUV, duree: number): { min: number; max: number } {
  const c = [0, positionMRUV(p, 0), positionMRUV(p, duree)];
  const ta = instantArret(p);
  if (ta !== null && ta < duree) c.push(positionMRUV(p, ta));
  return { min: Math.min(...c), max: Math.max(...c) };
}

export interface ExempleMRUV extends ParamsMRUV {
  id: string;
  libelle: string;
  duree: number;
}

export const EXEMPLES_MRUV: ExempleMRUV[] = [
  { id: "mru", libelle: "MRU", x0: 4, v0: 3, a: 0, duree: 8 },
  { id: "accelere", libelle: "MRUV accéléré", x0: 0, v0: 0, a: 2, duree: 6 },
  { id: "freinage", libelle: "Freinage", x0: 0, v0: 15, a: -3, duree: 6 },
  { id: "sens", libelle: "Changement de sens", x0: 0, v0: 2, a: -1, duree: 6 },
];

// ============================================================ 2. Circulaire uniforme ===========================

export interface ParamsMCU {
  /** Rayon (m), > 0. */
  R: number;
  /** Vitesse angulaire algébrique (rad/s). */
  omega: number;
  /** Angle initial (rad). */
  theta0: number;
}

export interface EtatMCU {
  theta: number;
  position: Vec;
  /** Vecteur vitesse Rω e_θ. */
  vitesse: Vec;
  /** Vecteur accélération −Rω² e_r. */
  acceleration: Vec;
  /** Vitesse algébrique le long de e_θ : Rω. */
  vitesseAlgebrique: number;
  /** Norme de la vitesse R|ω|. */
  v: number;
  /** Norme de l'accélération Rω². */
  a: number;
}

export function etatMCU(p: ParamsMCU, t: number): EtatMCU {
  const theta = p.theta0 + p.omega * t;
  const er: Vec = { x: Math.cos(theta), y: Math.sin(theta) };
  const et: Vec = { x: -Math.sin(theta), y: Math.cos(theta) };
  return {
    theta,
    position: produit(p.R, er),
    vitesse: produit(p.R * p.omega, et),
    acceleration: produit(-p.R * p.omega * p.omega, er),
    vitesseAlgebrique: p.R * p.omega,
    v: p.R * Math.abs(p.omega),
    a: p.R * p.omega * p.omega,
  };
}

/** Période T = 2π/|ω| et fréquence f = 1/T ; null si ω = 0 (non définies, pas de division par zéro). */
export function periodeEtFrequence(omega: number): { T: number; f: number } | null {
  if (omega === 0) return null;
  const T = (2 * Math.PI) / Math.abs(omega);
  return { T, f: 1 / T };
}

export const EXEMPLES_MCU: Array<ParamsMCU & { id: string; libelle: string; duree: number }> = [
  { id: "ex1", libelle: "R = 0,5 m ; ω = 2 rad/s", R: 0.5, omega: 2, theta0: 0, duree: 6 },
  { id: "ex2", libelle: "R = 0,5 m ; ω = 4 rad/s", R: 0.5, omega: 4, theta0: 0, duree: 6 },
  { id: "neg", libelle: "ω négative", R: 1, omega: -1.5, theta0: Math.PI / 2, duree: 8 },
];

// ============================================================ 3. Repère de Frenet ===============================

export type ModeFrenet = "tangentielle" | "normale" | "composee";

export interface ParamsFrenet {
  mode: ModeFrenet;
  /** Rayon de courbure de la trajectoire (m) ; ignoré en mode « tangentielle » (trajectoire rectiligne, rayon infini). */
  Rc: number;
  /** Vitesse algébrique initiale le long de la trajectoire (m/s). */
  v0: number;
  /** Accélération tangentielle (m/s²) ; forcée à 0 en mode « normale ». */
  aT: number;
  /** Abscisse curviligne initiale (m). */
  s0: number;
}

export interface EtatFrenet {
  /** Abscisse curviligne s(t). */
  s: number;
  /** Vitesse algébrique v = ds/dt (vecteur vitesse = v·T). */
  v: number;
  aT: number;
  /** aN = v²/Rc ≥ 0 (0 pour une trajectoire rectiligne). */
  aN: number;
  Rc: number;
  position: Vec;
  /** Tangent unitaire T (sens des s croissants). */
  T: Vec;
  /** Normale unitaire N, orientée vers le centre de courbure ; null si la trajectoire est rectiligne (courbure nulle). */
  N: Vec | null;
  vitesse: Vec;
  acceleration: Vec;
  /** Centre de courbure ; null si trajectoire rectiligne. */
  centre: Vec | null;
}

/** Paramètres effectifs : mode normale ⇒ aT = 0 ; mode tangentielle ⇒ Rc infini. */
export function effectifsFrenet(p: ParamsFrenet): { Rc: number; aT: number } {
  return { Rc: p.mode === "tangentielle" ? Infinity : p.Rc, aT: p.mode === "normale" ? 0 : p.aT };
}

/**
 * Mouvement réellement simulé : abscisse curviligne s(t) = s0 + v0·t + ½·aT·t², sur une trajectoire de rayon de courbure
 * constant Rc (cercle centré en O) ou rectiligne. Les composantes (aT, aN) du vecteur accélération sont celles de CE
 * mouvement : a⃗ = dv⃗/dt = aT·T + (v²/Rc)·N, vérifié par dérivation numérique dans les tests.
 */
export function etatFrenet(p: ParamsFrenet, t: number): EtatFrenet {
  const { Rc, aT } = effectifsFrenet(p);
  const s = p.s0 + p.v0 * t + 0.5 * aT * t * t;
  const v = p.v0 + aT * t;
  if (!Number.isFinite(Rc)) {
    const T: Vec = { x: 1, y: 0 };
    return { s, v, aT, aN: 0, Rc, position: { x: s, y: 0 }, T, N: null, vitesse: produit(v, T), acceleration: produit(aT, T), centre: null };
  }
  const phi = s / Rc;
  const er: Vec = { x: Math.cos(phi), y: Math.sin(phi) };
  const T: Vec = { x: -Math.sin(phi), y: Math.cos(phi) };
  const N: Vec = { x: -er.x, y: -er.y };
  const aN = (v * v) / Rc;
  return {
    s,
    v,
    aT,
    aN,
    Rc,
    position: produit(Rc, er),
    T,
    N,
    vitesse: produit(v, T),
    acceleration: somme(produit(aT, T), produit(aN, N)),
    centre: { x: 0, y: 0 },
  };
}

export const EXEMPLES_FRENET: Array<ParamsFrenet & { id: string; libelle: string; duree: number }> = [
  { id: "tang", libelle: "Accélération tangentielle seule", mode: "tangentielle", Rc: 4, v0: 1, aT: 1, s0: -4, duree: 6 },
  { id: "norm", libelle: "Accélération normale seule", mode: "normale", Rc: 4, v0: 2, aT: 0, s0: 0, duree: 8 },
  { id: "comp", libelle: "Accélération composée", mode: "composee", Rc: 4, v0: 1, aT: 0.8, s0: 0, duree: 6 },
];

// ============================================================ 4. Mouvement plan (hodographe, chronophoto) =======

/** Mouvement plan défini par sa position, sa vitesse et son accélération en fonction du temps. */
export interface MouvementPlan {
  id: string;
  position: (t: number) => Vec;
  vitesse: (t: number) => Vec;
  acceleration: (t: number) => Vec;
}

export interface ParamsPlanUniforme {
  P0: Vec;
  v: Vec;
}

export function mouvementMRU(P0: Vec, v: Vec): MouvementPlan {
  return { id: "mru", position: (t) => somme(P0, produit(t, v)), vitesse: () => ({ ...v }), acceleration: () => ({ x: 0, y: 0 }) };
}

export function mouvementMRUV(P0: Vec, v0: Vec, a: Vec): MouvementPlan {
  return {
    id: "mruv",
    position: (t) => somme(somme(P0, produit(t, v0)), produit(0.5 * t * t, a)),
    vitesse: (t) => somme(v0, produit(t, a)),
    acceleration: () => ({ ...a }),
  };
}

export function mouvementMCU(p: ParamsMCU): MouvementPlan {
  return {
    id: "mcu",
    position: (t) => etatMCU(p, t).position,
    vitesse: (t) => etatMCU(p, t).vitesse,
    acceleration: (t) => etatMCU(p, t).acceleration,
  };
}

export type ModeHodographe = "mru" | "mruv" | "mcu";

export interface ParamsHodographe {
  mode: ModeHodographe;
  /** Norme de la vitesse initiale (m/s) et direction (rad) pour MRU / MRUV. */
  v: number;
  angleV: number;
  /** Norme et direction (rad) de l'accélération pour MRUV. */
  a: number;
  angleA: number;
  /** MCU. */
  R: number;
  omega: number;
}

export function mouvementHodographe(p: ParamsHodographe): MouvementPlan {
  if (p.mode === "mru") return mouvementMRU({ x: 0, y: 0 }, polaire(p.v, p.angleV));
  if (p.mode === "mruv") return mouvementMRUV({ x: 0, y: 0 }, polaire(p.v, p.angleV), polaire(p.a, p.angleA));
  return mouvementMCU({ R: p.R, omega: p.omega, theta0: 0 });
}

export type NatureHodographe = "point" | "segment" | "cercle" | "arc";

/**
 * Nature géométrique de l'hodographe sur [0, duree] : point (vitesse constante), segment (accélération de direction fixe),
 * cercle (MCU sur au moins une période), arc de cercle (MCU sur moins d'une période).
 */
export function natureHodographe(p: ParamsHodographe, duree: number): NatureHodographe {
  if (p.mode === "mru") return "point";
  if (p.mode === "mruv") return p.a === 0 ? "point" : "segment";
  if (p.R === 0 || p.omega === 0) return "point";
  return Math.abs(p.omega) * duree >= 2 * Math.PI - 1e-9 ? "cercle" : "arc";
}

/** Rayon du cercle de l'hodographe d'un MCU : égal à la norme de la vitesse R|ω| (en m/s). */
export const rayonHodographeMCU = (p: ParamsHodographe): number => p.R * Math.abs(p.omega);

/** Points de l'hodographe (extrémités des vecteurs vitesse reportés depuis P) échantillonnés sur [0, duree]. */
export function pointsHodographe(m: MouvementPlan, duree: number, n = 240): Vec[] {
  const pts: Vec[] = [];
  for (let i = 0; i <= n; i++) pts.push(m.vitesse((duree * i) / n));
  return pts;
}

/** Positions successives de la trajectoire (pour tracer la trace du mobile). */
export function pointsTrajectoire(m: MouvementPlan, duree: number, n = 240): Vec[] {
  const pts: Vec[] = [];
  for (let i = 0; i <= n; i++) pts.push(m.position((duree * i) / n));
  return pts;
}

export const EXEMPLES_HODOGRAPHE: Array<ParamsHodographe & { id: string; libelle: string; duree: number }> = [
  { id: "mru", libelle: "MRU", mode: "mru", v: 3, angleV: Math.PI / 6, a: 0, angleA: 0, R: 2, omega: 1, duree: 6 },
  { id: "mruv", libelle: "MRUV", mode: "mruv", v: 2, angleV: Math.PI / 6, a: 1.5, angleA: Math.PI / 3, R: 2, omega: 1, duree: 6 },
  { id: "mcu", libelle: "MCU", mode: "mcu", v: 2, angleV: 0, a: 0, angleA: 0, R: 2, omega: 1, duree: 2 * Math.PI },
];

// ============================================================ 5. Chronophotographie =============================

export type TypeChrono = "mru" | "accelere" | "retarde" | "mcu";

export const LIBELLES_CHRONO: Record<TypeChrono, string> = {
  mru: "MRU",
  accelere: "MRUV accéléré",
  retarde: "MRUV retardé",
  mcu: "MCU",
};

const ANGLE_CHRONO = Math.PI / 9; // 20° : les vecteurs restent lisibles sans que la trajectoire soit horizontale

/** Mouvements de la chronophotographie (valeurs fixes choisies pour des figures lisibles ; τ et n sont libres). */
export function mouvementChrono(type: TypeChrono): MouvementPlan {
  const e = polaire(1, ANGLE_CHRONO);
  const P0 = { x: 0, y: 0 };
  if (type === "mru") return mouvementMRU(P0, produit(2, e));
  if (type === "accelere") return mouvementMRUV(P0, produit(0.5, e), produit(1, e));
  if (type === "retarde") return mouvementMRUV(P0, produit(6, e), produit(-1, e));
  return mouvementMCU({ R: 3, omega: 1, theta0: 0 });
}

/** Positions M0, M1, … Mn−1 enregistrées toutes les τ secondes. */
export function positionsChrono(m: MouvementPlan, tau: number, n: number): Vec[] {
  const pts: Vec[] = [];
  for (let i = 0; i < n; i++) pts.push(m.position(i * tau));
  return pts;
}

/** Vecteur déplacement M(i)M(j). */
export const vecteurMM = (P: Vec[], i: number, j: number): Vec => difference(P[j], P[i]);

/** Vitesse moyenne sur [t_i, t_i+1] : M(i)M(i+1)/τ, associée à l'instant (i+½)τ. null si l'intervalle n'existe pas. */
export function vitesseMoyenneIntervalle(P: Vec[], i: number, tau: number): Vec | null {
  if (i < 0 || i + 1 >= P.length) return null;
  return produit(1 / tau, vecteurMM(P, i, i + 1));
}

/** Vitesse approchée en Mi : M(i−1)M(i+1)/(2τ), associée à l'instant t_i = iτ. null aux bords de l'enregistrement. */
export function vitesseCentree(P: Vec[], i: number, tau: number): Vec | null {
  if (i < 1 || i + 1 >= P.length) return null;
  return produit(1 / (2 * tau), vecteurMM(P, i - 1, i + 1));
}

/** Accélération approchée en Mi : [M(i)M(i+1) − M(i−1)M(i)]/τ² (variation des vitesses moyennes), associée à t_i. */
export function accelerationTroisPoints(P: Vec[], i: number, tau: number): Vec | null {
  if (i < 1 || i + 1 >= P.length) return null;
  return produit(1 / (tau * tau), difference(vecteurMM(P, i, i + 1), vecteurMM(P, i - 1, i)));
}

/**
 * Accélération par différence centrée des vitesses approchées : [v(i+1) − v(i−1)]/(2τ), associée à t_i (utilise les
 * positions M(i−2) à M(i+2)). null si un des deux vecteurs vitesse n'est pas disponible.
 */
export function accelerationVitessesCentrees(P: Vec[], i: number, tau: number): Vec | null {
  const v1 = vitesseCentree(P, i + 1, tau);
  const v0 = vitesseCentree(P, i - 1, tau);
  if (!v1 || !v0) return null;
  return produit(1 / (2 * tau), difference(v1, v0));
}

export interface Ecart {
  absolu: number;
  /** Écart relatif |estimé − théorique| / |théorique| ; null si la valeur théorique est nulle (non défini). */
  relatif: number | null;
}

/** Écart entre un vecteur estimé et le vecteur théorique (norme de la différence). */
export function ecartVecteurs(estime: Vec, theorique: Vec): Ecart {
  const absolu = norme(difference(estime, theorique));
  const nt = norme(theorique);
  return { absolu, relatif: nt > 1e-12 ? absolu / nt : null };
}

/** Distance entre deux points, déplacement vectoriel et distance parcourue (le long de la ligne brisée M0…Mk) : trois objets distincts. */
export function mesuresTrace(P: Vec[], i: number, j: number): { deplacement: Vec; distanceDirecte: number; longueurTrace: number } {
  const [a, b] = i <= j ? [i, j] : [j, i];
  let longueur = 0;
  for (let k = a; k < b; k++) longueur += norme(vecteurMM(P, k, k + 1));
  return { deplacement: vecteurMM(P, i, j), distanceDirecte: norme(vecteurMM(P, i, j)), longueurTrace: longueur };
}

// ============================================================ 6. Référentiels ===================================

export interface ParamsReferentiels {
  /** Position de l'origine du véhicule dans le référentiel terrestre à t = 0 (m). */
  xv0: number;
  /** Vitesse du véhicule par rapport à la Terre (m/s), constante. */
  vv: number;
  /** Position du passager par rapport au véhicule à t = 0 (m). */
  xp: number;
  /** Vitesse du passager par rapport au véhicule (m/s) : 0 s'il est assis. */
  up: number;
  /** Position de l'observateur par rapport à la Terre (m), immobile. */
  xo: number;
}

export interface EtatReferentiels {
  /** Positions dans le référentiel terrestre. */
  terre: { vehicule: number; passager: number; observateur: number };
  /** Positions dans le référentiel du véhicule. */
  vehicule: { vehicule: number; passager: number; observateur: number };
  /** Vitesses par rapport à la Terre / au véhicule. */
  vitesseTerre: { vehicule: number; passager: number; observateur: number };
  vitesseVehicule: { vehicule: number; passager: number; observateur: number };
}

/**
 * Translation rectiligne uniforme : x_P/T = x_V/T + x_P/V ; v_P/T = v_V/T + v_P/V. Les positions dans le référentiel du
 * véhicule sont mesurées à partir de l'origine du véhicule : x_X/V = x_X/T − x_V/T.
 */
export function etatReferentiels(p: ParamsReferentiels, t: number): EtatReferentiels {
  const xVT = p.xv0 + p.vv * t;
  const xPV = p.xp + p.up * t;
  const xPT = xVT + xPV;
  return {
    terre: { vehicule: xVT, passager: xPT, observateur: p.xo },
    vehicule: { vehicule: 0, passager: xPV, observateur: p.xo - xVT },
    vitesseTerre: { vehicule: p.vv, passager: p.vv + p.up, observateur: 0 },
    vitesseVehicule: { vehicule: 0, passager: p.up, observateur: -p.vv },
  };
}

export const EXEMPLES_REFERENTIELS: Array<ParamsReferentiels & { id: string; libelle: string; duree: number }> = [
  { id: "assis", libelle: "Passager assis", xv0: -20, vv: 10, xp: 1, up: 0, xo: 0, duree: 4 },
  { id: "marche", libelle: "Passager qui marche vers l'avant", xv0: -20, vv: 10, xp: -1, up: 1.5, xo: 0, duree: 4 },
  { id: "arriere", libelle: "Passager qui marche vers l'arrière", xv0: -20, vv: 10, xp: 1, up: -1.5, xo: 0, duree: 4 },
];

// ============================================================ Utilitaires d'affichage ===========================

/** Nombre au format français, arrondi à `decimales` chiffres, sans « -0 ». */
export function fr(x: number, decimales = 2): string {
  if (!Number.isFinite(x)) return "—";
  const t = Number(x.toFixed(decimales));
  return (Object.is(t, -0) ? 0 : t).toString().replace(".", ",");
}
