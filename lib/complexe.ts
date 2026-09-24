/**
 * Parsing + géométrie pour les deux blocs du plan complexe (```cercletrigo
 * et ```racines, voir docs/syntaxe-cercletrigo.md et docs/syntaxe-racines.md)
 * — module ISOMORPHE (aucun accès à window/document), même esprit que
 * lib/variations.ts et lib/horloge.ts (voir ces fichiers pour le modèle
 * suivi ici) : parsing "une directive par ligne", jamais d'exception non
 * typée, uniquement des calculs purs (aucun accès DOM — le SVG lui-même est
 * dessiné côté composant React).
 */

export class ComplexeSyntaxeError extends Error {}

// ============================================================
//  ```cercletrigo — point sur le cercle unité à l'angle donné
// ============================================================

export interface CercleTrigoData {
  /** En degrés — n'importe quel réel (périodique via cos/sin), pas de borne. */
  angleDegres: number;
  montrerProjections: boolean;
  /** Nom de l'affixe affiché (ex. "z", "A") — texte libre, court. */
  label: string;
}

const ANGLE_DEFAUT = 60;
const PROJECTIONS_DEFAUT = true;
const LABEL_DEFAUT = "z";

function parserBooleen(valeurBrute: string, cle: string): boolean {
  const normalise = valeurBrute.trim().toLowerCase();
  if (normalise === "true" || normalise === "vrai") return true;
  if (normalise === "false" || normalise === "faux") return false;
  throw new ComplexeSyntaxeError(`"${cle}:" doit être "true" ou "false" (reçu « ${valeurBrute} »).`);
}

export function parserBlocCercleTrigo(source: string): CercleTrigoData {
  let angle: number | null = null;
  let montrerProjections: boolean | null = null;
  let label: string | null = null;

  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new ComplexeSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeurBrute = ligne.slice(indexDeuxPoints + 1).trim();

    switch (cle) {
      case "angle": {
        const n = Number(valeurBrute);
        if (!Number.isFinite(n)) {
          throw new ComplexeSyntaxeError(`"angle:" doit être un nombre (reçu « ${valeurBrute} »).`);
        }
        angle = n;
        break;
      }
      case "montrer_projections":
        montrerProjections = parserBooleen(valeurBrute, "montrer_projections");
        break;
      case "label": {
        if (!valeurBrute) throw new ComplexeSyntaxeError('"label:" ne peut pas être vide.');
        label = valeurBrute;
        break;
      }
      default:
        throw new ComplexeSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  return {
    angleDegres: angle ?? ANGLE_DEFAUT,
    montrerProjections: montrerProjections ?? PROJECTIONS_DEFAUT,
    label: label ?? LABEL_DEFAUT,
  };
}

// ============================================================
//  ```racines — racines n-ièmes de z^n = a
// ============================================================

export interface RacinesData {
  n: number;
  /** Module de a (le rayon du cercle des racines est module^(1/n)). */
  module: number;
  /** Argument de a, en degrés. */
  argumentDegres: number;
}

const N_DEFAUT = 3;
const N_MIN = 2;
const N_MAX = 12;
const MODULE_DEFAUT = 1;
const ARGUMENT_DEFAUT = 0;

export function parserBlocRacines(source: string): RacinesData {
  let n: number | null = null;
  let moduleA: number | null = null;
  let argument: number | null = null;

  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new ComplexeSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeurBrute = ligne.slice(indexDeuxPoints + 1).trim();

    switch (cle) {
      case "n": {
        const v = Number(valeurBrute);
        if (!Number.isInteger(v)) {
          throw new ComplexeSyntaxeError(`"n:" doit être un entier (reçu « ${valeurBrute} »).`);
        }
        n = v;
        break;
      }
      case "module": {
        const v = Number(valeurBrute);
        if (!Number.isFinite(v) || v <= 0) {
          throw new ComplexeSyntaxeError(`"module:" doit être un nombre strictement positif (reçu « ${valeurBrute} »).`);
        }
        moduleA = v;
        break;
      }
      case "argument": {
        const v = Number(valeurBrute);
        if (!Number.isFinite(v)) {
          throw new ComplexeSyntaxeError(`"argument:" doit être un nombre (reçu « ${valeurBrute} »).`);
        }
        argument = v;
        break;
      }
      default:
        throw new ComplexeSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  const nFinal = n ?? N_DEFAUT;
  if (nFinal < N_MIN || nFinal > N_MAX) {
    throw new ComplexeSyntaxeError(`"n:" doit être compris entre ${N_MIN} et ${N_MAX} (reçu ${nFinal}).`);
  }

  return {
    n: nFinal,
    module: moduleA ?? MODULE_DEFAUT,
    argumentDegres: argument ?? ARGUMENT_DEFAUT,
  };
}

// ============================================================
//  Géométrie partagée (pure, sans DOM) — utilisée par les deux composants
// ============================================================

export function versRadians(degres: number): number {
  return (degres * Math.PI) / 180;
}

export interface PointEcran {
  x: number;
  y: number;
}

/** Point sur un cercle de centre `centre`, rayon `rayon` (en pixels SVG), à
 * l'angle `angleDegres` (convention mathématique standard : 0° = axe Re,
 * sens trigonométrique/anti-horaire) — l'inversion de l'axe y (SVG descend,
 * les ordonnées mathématiques montent) est faite ICI, une fois pour toutes,
 * pour que tout le reste du code dessine "comme en maths". */
export function pointSurCercleTrigo(centre: PointEcran, rayon: number, angleDegres: number): PointEcran {
  const angle = versRadians(angleDegres);
  return { x: centre.x + rayon * Math.cos(angle), y: centre.y - rayon * Math.sin(angle) };
}

/** Échantillonne l'arc allant de 0° à `angleDegres` (borné à ±360° pour
 * rester lisible, un angle au-delà représente plus d'un tour complet — le
 * point M, lui, reste positionné à l'angle exact, périodicité de cos/sin
 * oblige) en une suite de points, pour tracer l'arc comme une ligne brisée
 * plutôt qu'un arc SVG "A" — évite tout risque d'erreur de sens/flag de
 * balayage : les points utilisent exactement la même fonction que le point
 * M lui-même, donc toujours cohérents avec lui. */
export function echantillonnerArc(centre: PointEcran, rayon: number, angleDegres: number): PointEcran[] {
  const angleBorne = Math.max(-360, Math.min(360, angleDegres));
  const nbPas = Math.max(2, Math.round(Math.abs(angleBorne) / 8));
  return Array.from({ length: nbPas + 1 }, (_, i) => pointSurCercleTrigo(centre, rayon, (angleBorne * i) / nbPas));
}

export interface RacineNieme {
  k: number;
  angleDegres: number;
  point: PointEcran;
}

/** Les n racines n-ièmes de a (module, argument), positionnées sur un cercle
 * de rayon fixe `rayonEcran` (en pixels — la mise à l'échelle visuelle est
 * volontairement indépendante du vrai rayon module^(1/n), affiché à part en
 * texte, voir RacinesNiemes.tsx : un module très grand ou très petit ne doit
 * jamais faire disparaître ou déborder la figure). */
export function calculerRacinesNiemes(
  centre: PointEcran,
  rayonEcran: number,
  data: RacinesData
): RacineNieme[] {
  return Array.from({ length: data.n }, (_, k) => {
    const angleDegres = (data.argumentDegres + 360 * k) / data.n;
    return { k, angleDegres, point: pointSurCercleTrigo(centre, rayonEcran, angleDegres) };
  });
}

/** Rayon réel (non mis à l'échelle) du cercle des racines : |a|^(1/n). */
export function rayonReelRacines(data: RacinesData): number {
  return Math.pow(data.module, 1 / data.n);
}
