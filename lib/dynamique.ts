/**
 * Moteur physique du Laboratoire de dynamique (théorème du centre d'inertie, Terminale C).
 * Fonctions pures, typées, SI uniquement (m, kg, s, N, rad). Aucun accès à window/document.
 * Les composants graphiques ne contiennent AUCUNE formule : ils appellent ces fonctions.
 */

export const rad = (deg: number) => (deg * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;

export interface Vec2 {
  x: number;
  y: number;
}
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Racine positive la plus petite de ½a t² + v0 t − d = 0 (t > 0), ou null. */
export function premierInstantDeplacement(a: number, v0: number, d: number): number | null {
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(v0) < 1e-12) return d === 0 ? 0 : null;
    const t = d / v0;
    return t >= 0 ? t : null;
  }
  const disc = v0 * v0 + 2 * a * d;
  if (disc < 0) return null;
  const s = Math.sqrt(disc);
  const racines = [(-v0 - s) / a, (-v0 + s) / a].filter((t) => t >= -1e-12).map((t) => Math.max(0, t));
  return racines.length ? Math.min(...racines) : null;
}

// ============================================================================================================
//  1. Plan incliné sans frottement
// ============================================================================================================

export interface ParamsPlan {
  m: number; // kg
  alpha: number; // degrés
  g: number; // m/s²
  v0: number; // m/s, vers le bas de la pente
  distance: number; // m, longueur de pente disponible
}
export const PLAN_DEFAUT: ParamsPlan = { m: 2, alpha: 30, g: 10, v0: 0, distance: 5 };

export function poidsPlan(p: ParamsPlan) {
  return p.m * p.g;
}
/** Composante du poids parallèle à la pente (axe x vers le bas de la pente) : Px = mg sin α. */
export function composanteParallele(p: ParamsPlan) {
  return p.m * p.g * Math.sin(rad(p.alpha));
}
/** Composante du poids perpendiculaire au plan (axe y vers l'extérieur) : Py = −mg cos α. */
export function composantePerpendiculaire(p: ParamsPlan) {
  return -p.m * p.g * Math.cos(rad(p.alpha));
}
/** Réaction normale : N = mg cos α. */
export function reactionNormalePlan(p: ParamsPlan) {
  return p.m * p.g * Math.cos(rad(p.alpha));
}
/** Accélération le long de la pente : a = g sin α (indépendante de m). */
export function accelerationPlan(p: ParamsPlan) {
  return p.g * Math.sin(rad(p.alpha));
}
export const vitessePlan = (p: ParamsPlan, t: number) => p.v0 + accelerationPlan(p) * t;
export const deplacementPlan = (p: ParamsPlan, t: number) => p.v0 * t + 0.5 * accelerationPlan(p) * t * t;
/** v² = v0² + 2 a d. */
export const vitesseApresDeplacement = (p: ParamsPlan, d: number) => Math.sqrt(Math.max(0, p.v0 * p.v0 + 2 * accelerationPlan(p) * d));
/** Instant d'arrivée en bas de la pente (null si le solide n'y arrive jamais). */
export const tempsArriveePlan = (p: ParamsPlan) => premierInstantDeplacement(accelerationPlan(p), p.v0, p.distance);
/** Durée de la simulation : arrivée en bas, ou 4 s si le solide reste immobile (α = 0, v₀ = 0). */
export const dureePlan = (p: ParamsPlan) => tempsArriveePlan(p) ?? 4;
/** État à t : déplacement plafonné à l'extrémité du plan (le solide ne traverse jamais le support). */
export function etatPlan(p: ParamsPlan, t: number) {
  const ta = tempsArriveePlan(p);
  const tt = ta === null ? t : Math.min(t, ta);
  const d = Math.min(deplacementPlan(p, tt), p.distance);
  return { d, v: vitessePlan(p, tt), arrive: ta !== null && t >= ta - 1e-9 };
}

// ============================================================================================================
//  2. Machine d'Atwood (poulie idéale)
// ============================================================================================================

export interface ParamsAtwood {
  m1: number;
  m2: number;
  g: number;
  course: number; // m, course disponible de chaque côté
}
export const ATWOOD_DEFAUT: ParamsAtwood = { m1: 0.5, m2: 0.3, g: 9.8, course: 0.8 };
/** Rayon (physique) de la poulie représentée : sert à la rotation φ = s / R. */
export const RAYON_POULIE = 0.1;

/** Accélération algébrique, positive quand S₁ descend : a = (m1 − m2) g / (m1 + m2). */
export const accelerationAtwood = (p: ParamsAtwood) => ((p.m1 - p.m2) * p.g) / (p.m1 + p.m2);
/** Tension (identique des deux côtés) : T = 2 m1 m2 g / (m1 + m2). */
export const tensionAtwood = (p: ParamsAtwood) => (2 * p.m1 * p.m2 * p.g) / (p.m1 + p.m2);
export type SensAtwood = "S1 descend" | "S1 monte" | "equilibre";
export function sensAtwood(p: ParamsAtwood): SensAtwood {
  const d = p.m1 - p.m2;
  if (Math.abs(d) < 1e-9) return "equilibre";
  return d > 0 ? "S1 descend" : "S1 monte";
}
/** Descente algébrique de S₁ (positive vers le bas) ; S₂ monte de la même quantité. Départ au repos. */
export const descenteS1 = (p: ParamsAtwood, t: number) => 0.5 * accelerationAtwood(p) * t * t;
export const vitesseDescenteS1 = (p: ParamsAtwood, t: number) => accelerationAtwood(p) * t;
export function dureeAtwood(p: ParamsAtwood): number {
  const a = Math.abs(accelerationAtwood(p));
  return a < 1e-9 ? 3 : Math.sqrt((2 * p.course) / a);
}
/** Rotation de la poulie (rad, sens horaire positif quand S₁ descend), sans glissement : φ = s / R. */
export const rotationPoulie = (p: ParamsAtwood, t: number, R: number = RAYON_POULIE) => descenteS1(p, t) / R;
/** Longueurs des deux brins du fil verticaux, à partir de longueurs initiales égales à `L0`. */
export const longueursBrins = (p: ParamsAtwood, t: number, L0: number) => ({ l1: L0 + descenteS1(p, t), l2: L0 - descenteS1(p, t) });

// ============================================================================================================
//  3. Pendule conique
// ============================================================================================================

export interface ParamsPendule {
  m: number;
  l: number;
  g: number;
  theta: number; // degrés (mode angle)
  omega: number; // rad/s (mode vitesse angulaire)
  mode: "angle" | "omega";
}
export const PENDULE_DEFAUT: ParamsPendule = { m: 0.1, l: 0.5, g: 10, theta: 30, omega: 4.806, mode: "angle" };

export type EtatPendule =
  | { valide: true; theta: number; r: number; omega: number; v: number; T: number; a: number; periode: number; poids: number; hauteur: number }
  | { valide: false; raison: string };

/** Mode angle : 0 < θ < 90°. Mode ω : exige ℓ ω² > g (sinon pas de configuration conique). */
export function etatPendule(p: ParamsPendule): EtatPendule {
  let thetaDeg: number;
  let omega: number;
  if (p.mode === "angle") {
    if (!(p.theta > 0 && p.theta < 90)) return { valide: false, raison: "L'angle θ doit être strictement compris entre 0° et 90° pour un pendule conique." };
    thetaDeg = p.theta;
    omega = Math.sqrt(p.g / (p.l * Math.cos(rad(thetaDeg))));
  } else {
    if (!(p.omega > 0)) return { valide: false, raison: "La vitesse angulaire doit être strictement positive." };
    if (!(p.l * p.omega * p.omega > p.g * (1 + 1e-9))) {
      const omegaMin = Math.sqrt(p.g / p.l);
      return {
        valide: false,
        raison: `Avec ω = ${p.omega.toFixed(2).replace(".", ",")} rad/s, ℓω² ≤ g : le fil reste vertical, il n'y a pas de configuration conique. Il faut ω > ${omegaMin.toFixed(2).replace(".", ",")} rad/s.`,
      };
    }
    omega = p.omega;
    thetaDeg = deg(Math.acos(p.g / (p.l * omega * omega)));
  }
  const th = rad(thetaDeg);
  const r = p.l * Math.sin(th);
  return {
    valide: true,
    theta: thetaDeg,
    r,
    omega,
    v: r * omega,
    T: (p.m * p.g) / Math.cos(th),
    a: r * omega * omega,
    periode: (2 * Math.PI) / omega,
    poids: p.m * p.g,
    hauteur: p.l * Math.cos(th),
  };
}

/** Positions, vitesse, accélération, tension et poids en 3D (O à l'origine, z vers le haut), à l'instant t. */
export function vecteursPendule(p: ParamsPendule, t: number) {
  const e = etatPendule(p);
  if (!e.valide) return null;
  const phi = e.omega * t;
  const th = rad(e.theta);
  const pos: Vec3 = { x: e.r * Math.cos(phi), y: e.r * Math.sin(phi), z: -p.l * Math.cos(th) };
  const centre: Vec3 = { x: 0, y: 0, z: pos.z };
  const vitesse: Vec3 = { x: -e.v * Math.sin(phi), y: e.v * Math.cos(phi), z: 0 };
  const acceleration: Vec3 = { x: -e.a * Math.cos(phi), y: -e.a * Math.sin(phi), z: 0 };
  const poids: Vec3 = { x: 0, y: 0, z: -e.poids };
  const u = { x: -pos.x / p.l, y: -pos.y / p.l, z: -pos.z / p.l };
  const tension: Vec3 = { x: e.T * u.x, y: e.T * u.y, z: e.T * u.z };
  return { phi, pos, centre, vitesse, acceleration, poids, tension, etat: e };
}

/** Projection oblique légère : vue en élévation `elev` (rad), axe x horizontal. Retourne (x écran, y écran vers le haut). */
export function projeter(v: Vec3, elev: number): Vec2 {
  return { x: v.x, y: v.z * Math.cos(elev) + v.y * Math.sin(elev) };
}

export const produitScalaire3 = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
export const norme3 = (a: Vec3) => Math.hypot(a.x, a.y, a.z);

// ============================================================================================================
//  4. Monte-charge
// ============================================================================================================

export interface ParamsMonteCharge {
  m: number;
  g: number;
  a: number; // m/s², algébrique, axe vers le haut
  v0: number; // m/s, algébrique
  hauteur: number; // m, hauteur de la gaine ; départ à mi-hauteur
}
export const MONTE_DEFAUT: ParamsMonteCharge = { m: 500, g: 10, a: 1, v0: 0, hauteur: 20 };

/** T = m (g + a). */
export const tensionCable = (p: ParamsMonteCharge) => p.m * (p.g + p.a);
/** Câble tendu si T > 0, c'est-à-dire a > −g. */
export const cableTendu = (p: ParamsMonteCharge) => tensionCable(p) > 1e-9;
export const poidsMonte = (p: ParamsMonteCharge) => p.m * p.g;
export const yMonte = (p: ParamsMonteCharge, t: number) => p.hauteur / 2 + p.v0 * t + 0.5 * p.a * t * t;
export const vMonte = (p: ParamsMonteCharge, t: number) => p.v0 + p.a * t;

export type SituationMonte = "immobile" | "vitesse constante" | "montée accélérée" | "montée ralentie" | "descente accélérée" | "descente ralentie" | "arrêt instantané, repart vers le haut" | "arrêt instantané, repart vers le bas";
/** Situation à un instant : tient compte des signes de v ET de a (v et a sont indépendants). */
export function situationMonte(v: number, a: number): SituationMonte {
  const eps = 1e-9;
  const vz = Math.abs(v) < eps;
  const az = Math.abs(a) < eps;
  if (vz && az) return "immobile";
  if (az) return "vitesse constante";
  if (vz) return a > 0 ? "arrêt instantané, repart vers le haut" : "arrêt instantané, repart vers le bas";
  if (v > 0) return a > 0 ? "montée accélérée" : "montée ralentie";
  return a < 0 ? "descente accélérée" : "descente ralentie";
}
/** Comparaison T / (mg) en mots. */
export function compareTension(p: ParamsMonteCharge): "T > P" | "T = P" | "T < P" {
  const d = tensionCable(p) - poidsMonte(p);
  if (Math.abs(d) < 1e-9) return "T = P";
  return d > 0 ? "T > P" : "T < P";
}
/** Durée : jusqu'à ce que la cabine atteigne le haut ou le bas de la gaine ; 8 s si elle reste dans la gaine. */
export function dureeMonte(p: ParamsMonteCharge): number {
  const h = p.hauteur;
  const haut = premierInstantDeplacement(p.a, p.v0, h / 2);
  const bas = premierInstantDeplacement(p.a, p.v0, -h / 2);
  const c = [haut, bas].filter((x): x is number => x !== null && x > 1e-9);
  return c.length ? Math.min(...c) : 8;
}

// ============================================================================================================
//  5. Véhicule dans un virage
// ============================================================================================================

export interface ParamsVirage {
  m: number;
  v: number;
  R: number;
  g: number;
  mu: number;
  adherence: boolean; // mode avancé : tester l'adhérence
}
export const VIRAGE_DEFAUT: ParamsVirage = { m: 1000, v: 15, R: 50, g: 10, mu: 0.7, adherence: false };

export const accelerationCentripete = (p: ParamsVirage) => (p.v * p.v) / p.R;
export const forceCentripete = (p: ParamsVirage) => (p.m * p.v * p.v) / p.R;
export const reactionVirage = (p: ParamsVirage) => p.m * p.g;
export const frottementMax = (p: ParamsVirage) => p.mu * p.m * p.g;
export const vitesseMaxAdherence = (p: ParamsVirage) => Math.sqrt(p.mu * p.g * p.R);
/** Condition d'adhérence : m v²/R ≤ μ m g, c'est-à-dire v ≤ √(μ g R). */
export const adherenceSuffisante = (p: ParamsVirage) => forceCentripete(p) <= frottementMax(p) + 1e-9;
/** Coefficient d'adhérence minimal : μ ≥ v² / (g R). */
export const muMinimal = (p: ParamsVirage) => (p.v * p.v) / (p.g * p.R);
/** Le mouvement circulaire est-il réalisable avec ces paramètres ? (toujours vrai si l'adhérence n'est pas testée) */
export const virageRealisable = (p: ParamsVirage) => !p.adherence || adherenceSuffisante(p);
export const omegaVirage = (p: ParamsVirage) => p.v / p.R;
export const periodeVirage = (p: ParamsVirage) => (2 * Math.PI * p.R) / p.v;
/** Position, vitesse et accélération du véhicule à l'instant t (cercle de centre O, départ à droite, sens trigonométrique). */
export function etatVirage(p: ParamsVirage, t: number) {
  const w = omegaVirage(p);
  const phi = w * t;
  return {
    phi,
    pos: { x: p.R * Math.cos(phi), y: p.R * Math.sin(phi) } as Vec2,
    vitesse: { x: -p.v * Math.sin(phi), y: p.v * Math.cos(phi) } as Vec2,
    acceleration: { x: -accelerationCentripete(p) * Math.cos(phi), y: -accelerationCentripete(p) * Math.sin(phi) } as Vec2,
  };
}

// ============================================================================================================
//  6. Solide glissant sur une sphère
// ============================================================================================================

export interface ParamsSphere {
  m: number;
  R: number;
  g: number;
  theta0: number; // degrés
  v0: number; // m/s, vitesse tangentielle initiale ≥ 0
}
export const SPHERE_DEFAUT: ParamsSphere = { m: 1, R: 2, g: 10, theta0: 1, v0: 0 };
export const ANGLE_LIMITE_IDEAL = deg(Math.acos(2 / 3));

/** v² en contact (conservation de l'énergie mécanique) : v² = v0² + 2 g R (cos θ0 − cos θ). */
export const vitesse2Sphere = (p: ParamsSphere, thetaDeg: number) => p.v0 * p.v0 + 2 * p.g * p.R * (Math.cos(rad(p.theta0)) - Math.cos(rad(thetaDeg)));
/** N = m g cos θ − m v² / R. */
export const reactionSphere = (p: ParamsSphere, thetaDeg: number) => p.m * p.g * Math.cos(rad(thetaDeg)) - (p.m * vitesse2Sphere(p, thetaDeg)) / p.R;
/** cos θ_d = (2 cos θ0 + v0²/(g R)) / 3 ; null si le solide quitte la sphère dès le départ (N(θ0) < 0). */
export function angleDetachement(p: ParamsSphere): number | null {
  if (reactionSphere(p, p.theta0) < -1e-9) return null;
  const c = (2 * Math.cos(rad(p.theta0)) + (p.v0 * p.v0) / (p.g * p.R)) / 3;
  if (c >= 1) return null;
  return deg(Math.acos(Math.min(1, Math.max(-1, c))));
}

export interface TrajetSphere {
  /** vrai si le solide ne touche jamais vraiment la sphère (décollage immédiat). */
  immediat: boolean;
  thetaD: number; // degrés, angle de détachement (θ0 si immédiat)
  tD: number; // instant du détachement
  vD: number; // vitesse au détachement
  contact: Array<{ t: number; theta: number }>; // échantillons RK4, θ en degrés
  position: Vec2; // détachement, repère centré sur la sphère (x droite, y haut)
  vitesse: Vec2;
  tVol: number; // durée du vol jusqu'au sol (y = −R)
  duree: number;
}

const DT_RK = 0.002;
/**
 * Mouvement sans frottement sur la sphère : θ'' = (g/R) sin θ, intégré par Runge-Kutta d'ordre 4 (pas 2 ms), arrêté à
 * l'angle de détachement calculé par l'énergie (N = 0). Au-delà : projectile (pesanteur seule), continu en position et vitesse.
 */
export function simulerSphere(p: ParamsSphere): TrajetSphere {
  const th0 = rad(p.theta0);
  const thD = angleDetachement(p);
  const k = p.g / p.R;
  const contact: Array<{ t: number; theta: number }> = [{ t: 0, theta: p.theta0 }];
  let th = th0;
  let w = p.v0 / p.R;
  let t = 0;
  let thetaD: number;
  let tD: number;
  if (thD === null) {
    thetaD = p.theta0;
    tD = 0;
  } else {
    const cible = rad(thD);
    const acc = (x: number) => k * Math.sin(x);
    while (th < cible && t < 60) {
      const k1t = w;
      const k1w = acc(th);
      const k2t = w + 0.5 * DT_RK * k1w;
      const k2w = acc(th + 0.5 * DT_RK * k1t);
      const k3t = w + 0.5 * DT_RK * k2w;
      const k3w = acc(th + 0.5 * DT_RK * k2t);
      const k4t = w + DT_RK * k3w;
      const k4w = acc(th + DT_RK * k3t);
      const thN = th + (DT_RK / 6) * (k1t + 2 * k2t + 2 * k3t + k4t);
      const wN = w + (DT_RK / 6) * (k1w + 2 * k2w + 2 * k3w + k4w);
      if (thN >= cible) {
        const f = (cible - th) / (thN - th);
        t += f * DT_RK;
        th = cible;
        w = w + f * (wN - w);
        contact.push({ t, theta: deg(th) });
        break;
      }
      th = thN;
      w = wN;
      t += DT_RK;
      contact.push({ t, theta: deg(th) });
    }
    thetaD = thD;
    tD = t;
  }
  const thR = rad(thetaD);
  const vD = thD === null ? p.v0 : Math.sqrt(Math.max(0, vitesse2Sphere(p, thetaD)));
  const position: Vec2 = { x: p.R * Math.sin(thR), y: p.R * Math.cos(thR) };
  const vitesse: Vec2 = { x: vD * Math.cos(thR), y: -vD * Math.sin(thR) };
  const tVol = premierInstantDeplacement(-p.g, vitesse.y, -p.R - position.y) ?? 0;
  return { immediat: thD === null, thetaD, tD, vD, contact, position, vitesse, tVol, duree: tD + tVol };
}

export interface EtatSphere {
  enContact: boolean;
  theta: number | null; // degrés, seulement en contact
  pos: Vec2;
  vitesse: Vec2;
  N: number; // 0 après détachement
  au_sol: boolean;
}
export function etatSphere(p: ParamsSphere, tr: TrajetSphere, t: number): EtatSphere {
  if (t < tr.tD && !tr.immediat) {
    const c = tr.contact;
    // recherche dichotomique de l'échantillon
    let lo = 0;
    let hi = c.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (c[mid].t <= t) lo = mid;
      else hi = mid;
    }
    const f = c[hi].t > c[lo].t ? (t - c[lo].t) / (c[hi].t - c[lo].t) : 0;
    const theta = c[lo].theta + f * (c[hi].theta - c[lo].theta);
    const v = Math.sqrt(Math.max(0, vitesse2Sphere(p, theta)));
    const r = rad(theta);
    return {
      enContact: true,
      theta,
      pos: { x: p.R * Math.sin(r), y: p.R * Math.cos(r) },
      vitesse: { x: v * Math.cos(r), y: -v * Math.sin(r) },
      N: Math.max(0, reactionSphere(p, theta)),
      au_sol: false,
    };
  }
  const s = Math.min(Math.max(0, t - tr.tD), tr.tVol);
  return {
    enContact: false,
    theta: null,
    pos: { x: tr.position.x + tr.vitesse.x * s, y: tr.position.y + tr.vitesse.y * s - 0.5 * p.g * s * s },
    vitesse: { x: tr.vitesse.x, y: tr.vitesse.y - p.g * s },
    N: 0,
    au_sol: s >= tr.tVol - 1e-9 && tr.tVol > 0,
  };
}

// ============================================================================================================
//  Réponses d'exercice (tolérance explicite)
// ============================================================================================================

/** Lit un nombre saisi (virgule ou point décimal, espaces, unité éventuelle ignorée). */
export function lireNombre(saisie: string): number | null {
  const m = saisie.trim().replace(/\s+/g, "").replace(",", ".").match(/^[-+−]?\d*\.?\d+(?:e[-+]?\d+)?/i);
  if (!m) return null;
  const n = Number(m[0].replace("−", "-"));
  return Number.isFinite(n) ? n : null;
}

/** Tolérance relative par défaut : 2 % (ou écart absolu inférieur à 0,005 pour les valeurs proches de 0). */
export const TOLERANCE_RELATIVE = 0.02;
export function verifierNombre(saisie: string, attendu: number, tol = TOLERANCE_RELATIVE): { ok: boolean; lu: number | null; ecart: number | null } {
  const lu = lireNombre(saisie);
  if (lu === null) return { ok: false, lu: null, ecart: null };
  const ecart = Math.abs(lu - attendu);
  const ok = ecart <= Math.max(tol * Math.abs(attendu), 0.005);
  return { ok, lu, ecart };
}
