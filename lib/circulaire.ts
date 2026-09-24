/**
 * Parsing + physique pour le bloc ```circulaire (simulation de mouvement
 * circulaire uniforme, voir docs/syntaxe-circulaire.md) — module ISOMORPHE
 * (aucun accès à window/document), même modèle que lib/mouvement.ts :
 * parsing "une directive par ligne", jamais d'exception non typée,
 * uniquement des calculs purs (le SVG et l'animation vivent dans
 * components/SimulationCirculaire.tsx).
 */

export class CirculaireSyntaxeError extends Error {}

export interface CirculaireData {
  /** Rayon R du cercle, en mètres — strictement positif. */
  rayon: number;
  /** Vitesse angulaire ω, en rad/s — constante (mouvement UNIFORME). */
  omega: number;
  /** Durée maximale de l'animation/du curseur temps, en secondes. */
  duree: number;
}

const RAYON_DEFAUT = 1;
const OMEGA_DEFAUT = 2;
const DUREE_DEFAUT = 10;
const DUREE_MIN = 1;
const DUREE_MAX = 120;

export function parserBlocCirculaire(source: string): CirculaireData {
  let rayon: number | null = null;
  let omega: number | null = null;
  let duree: number | null = null;

  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new CirculaireSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeurBrute = ligne.slice(indexDeuxPoints + 1).trim();
    const n = Number(valeurBrute);

    switch (cle) {
      case "rayon":
        if (!Number.isFinite(n) || n <= 0) {
          throw new CirculaireSyntaxeError(`"rayon:" doit être un nombre strictement positif (reçu « ${valeurBrute} »).`);
        }
        rayon = n;
        break;
      case "omega":
        if (!Number.isFinite(n)) throw new CirculaireSyntaxeError(`"omega:" doit être un nombre (reçu « ${valeurBrute} »).`);
        omega = n;
        break;
      case "duree": {
        if (!Number.isFinite(n) || n <= 0) {
          throw new CirculaireSyntaxeError(`"duree:" doit être un nombre strictement positif (reçu « ${valeurBrute} »).`);
        }
        if (n < DUREE_MIN || n > DUREE_MAX) {
          throw new CirculaireSyntaxeError(`"duree:" doit être comprise entre ${DUREE_MIN} et ${DUREE_MAX} secondes (reçu ${n}).`);
        }
        duree = n;
        break;
      }
      default:
        throw new CirculaireSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  return {
    rayon: rayon ?? RAYON_DEFAUT,
    omega: omega ?? OMEGA_DEFAUT,
    duree: duree ?? DUREE_DEFAUT,
  };
}

// ============================================================
//  Physique (pure, sans DOM) — mouvement circulaire UNIFORME : θ(t) = ω·t,
//  v et a constantes en VALEUR (leur direction, elle, tourne avec le mobile
//  — c'est le point pédagogique du bloc, voir docs/syntaxe-circulaire.md).
// ============================================================

export function angle(omega: number, t: number): number {
  return omega * t;
}

/** v = R·|ω| — constante, indépendante de t. */
export function vitesseLineaire(rayon: number, omega: number): number {
  return rayon * Math.abs(omega);
}

/** a = R·ω² = v²/R — constante, indépendante de t (accélération centripète). */
export function accelerationCentripete(rayon: number, omega: number): number {
  return rayon * omega * omega;
}

// ============================================================
//  Bornes des curseurs de réglage (élargies pour toujours inclure la valeur
//  de départ fournie par le bloc, même si elle sort de la plage "typique").
// ============================================================

export const RAYON_MIN_DEFAUT = 0.5;
export const RAYON_MAX_DEFAUT = 3;
export const OMEGA_MIN_DEFAUT = 0.5;
export const OMEGA_MAX_DEFAUT = 5;

export function borneCurseur(valeurInitiale: number, min: number, max: number): { min: number; max: number } {
  return { min: Math.min(min, valeurInitiale), max: Math.max(max, valeurInitiale) };
}
