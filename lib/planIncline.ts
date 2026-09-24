/**
 * Parsing + physique pour le bloc ```plan-incline (simulation d'un solide
 * glissant sans frottement sur un plan incliné, voir
 * docs/syntaxe-plan-incline.md) — module ISOMORPHE (aucun accès à window/
 * document), même modèle que lib/mouvement.ts et lib/circulaire.ts :
 * parsing "une directive par ligne", jamais d'exception non typée,
 * uniquement des calculs purs (le SVG et l'animation vivent dans
 * components/SimulationPlanIncline.tsx).
 */

export class PlanInclineSyntaxeError extends Error {}

export interface PlanInclineData {
  /** Angle α du plan avec l'horizontale, en degrés. */
  angle: number;
  /** Masse m du solide, en kg. */
  masse: number;
}

/** Intensité de la pesanteur — constante, non réglable (pas une directive du bloc). */
export const G = 10;

const ANGLE_DEFAUT = 30;
const MASSE_DEFAUT = 2;
const ANGLE_MIN = 5;
const ANGLE_MAX = 75;

export function parserBlocPlanIncline(source: string): PlanInclineData {
  let angle: number | null = null;
  let masse: number | null = null;

  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new PlanInclineSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeurBrute = ligne.slice(indexDeuxPoints + 1).trim();
    const n = Number(valeurBrute);

    switch (cle) {
      case "angle": {
        if (!Number.isFinite(n)) throw new PlanInclineSyntaxeError(`"angle:" doit être un nombre (reçu « ${valeurBrute} »).`);
        if (n < ANGLE_MIN || n > ANGLE_MAX) {
          throw new PlanInclineSyntaxeError(`"angle:" doit être compris entre ${ANGLE_MIN} et ${ANGLE_MAX} degrés (reçu ${n}).`);
        }
        angle = n;
        break;
      }
      case "masse":
        if (!Number.isFinite(n) || n <= 0) {
          throw new PlanInclineSyntaxeError(`"masse:" doit être un nombre strictement positif (reçu « ${valeurBrute} »).`);
        }
        masse = n;
        break;
      default:
        throw new PlanInclineSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  return {
    angle: angle ?? ANGLE_DEFAUT,
    masse: masse ?? MASSE_DEFAUT,
  };
}

// ============================================================
//  Physique (pure, sans DOM) — glissement sans frottement sur un plan
//  incliné : le point pédagogique est que a_G ne dépend QUE de l'angle.
// ============================================================

function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

/** a_G = g·sin(α) — INDÉPENDANTE de la masse (c'est tout le point du bloc). */
export function accelerationPlan(angleDegres: number): number {
  return G * Math.sin(versRadians(angleDegres));
}

/** P = m·g — le poids, seule grandeur qui dépend de la masse ici. */
export function poids(masse: number): number {
  return masse * G;
}

/** N = P·cos(α) — réaction normale du plan. */
export function reactionNormale(masse: number, angleDegres: number): number {
  return poids(masse) * Math.cos(versRadians(angleDegres));
}

/** Résultante (P+N), le long de la pente = P·sin(α) = m·a_G. */
export function resultante(masse: number, angleDegres: number): number {
  return poids(masse) * Math.sin(versRadians(angleDegres));
}

/** Distance parcourue le long de la pente depuis le sommet : x = ½·a_G·t². */
export function positionSurPente(angleDegres: number, t: number): number {
  return 0.5 * accelerationPlan(angleDegres) * t * t;
}

/** Longueur physique (m) de la pente affichée à l'écran — choix de mise en
 * scène fixe (pas une directive du bloc) : assez court pour qu'un t_arrivée
 * calculé (voir ci-dessous) reste dans un ordre de grandeur raisonnable pour
 * toute la plage d'angles acceptée. */
export const LONGUEUR_PENTE_M = 4;

/** Instant où le solide atteint le bas de la pente (x = LONGUEUR_PENTE_M),
 * déduit de x = ½·a_G·t² : t_arrivée = √(2·L / a_G). */
export function tempsArrivee(angleDegres: number): number {
  return Math.sqrt((2 * LONGUEUR_PENTE_M) / accelerationPlan(angleDegres));
}

// ============================================================
//  Bornes des curseurs de réglage (élargies pour toujours inclure la valeur
//  de départ fournie par le bloc, même si elle sort de la plage "typique").
// ============================================================

export const ANGLE_MIN_DEFAUT = 5;
export const ANGLE_MAX_DEFAUT = 75;
export const MASSE_MIN_DEFAUT = 1;
export const MASSE_MAX_DEFAUT = 10;

export function borneCurseur(valeurInitiale: number, min: number, max: number): { min: number; max: number } {
  return { min: Math.min(min, valeurInitiale), max: Math.max(max, valeurInitiale) };
}
