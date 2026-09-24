/**
 * Parsing + physique pour le bloc ```mouvement (simulation de mouvement
 * rectiligne, voir docs/syntaxe-mouvement.md) — module ISOMORPHE (aucun
 * accès à window/document), même modèle que lib/horloge.ts : parsing "une
 * directive par ligne", jamais d'exception non typée, uniquement des calculs
 * purs (le SVG et l'animation vivent dans components/SimulationMouvement.tsx).
 */

export class MouvementSyntaxeError extends Error {}

export interface MouvementData {
  /** Position initiale, en mètres. */
  x0: number;
  /** Vitesse initiale, en m/s. */
  v0: number;
  /** Accélération, en m/s² (0 = mouvement uniforme). */
  a: number;
  /** Durée maximale de l'animation/du curseur temps, en secondes. */
  duree: number;
}

const X0_DEFAUT = 0;
const V0_DEFAUT = 2;
const A_DEFAUT = 1;
const DUREE_DEFAUT = 10;
const DUREE_MIN = 1;
const DUREE_MAX = 120;

export function parserBlocMouvement(source: string): MouvementData {
  let x0: number | null = null;
  let v0: number | null = null;
  let a: number | null = null;
  let duree: number | null = null;

  for (const ligneBrute of source.split("\n")) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new MouvementSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeurBrute = ligne.slice(indexDeuxPoints + 1).trim();
    const n = Number(valeurBrute);

    switch (cle) {
      case "x0":
        if (!Number.isFinite(n)) throw new MouvementSyntaxeError(`"x0:" doit être un nombre (reçu « ${valeurBrute} »).`);
        x0 = n;
        break;
      case "v0":
        if (!Number.isFinite(n)) throw new MouvementSyntaxeError(`"v0:" doit être un nombre (reçu « ${valeurBrute} »).`);
        v0 = n;
        break;
      case "a":
        if (!Number.isFinite(n)) throw new MouvementSyntaxeError(`"a:" doit être un nombre (reçu « ${valeurBrute} »).`);
        a = n;
        break;
      case "duree": {
        if (!Number.isFinite(n) || n <= 0) {
          throw new MouvementSyntaxeError(`"duree:" doit être un nombre strictement positif (reçu « ${valeurBrute} »).`);
        }
        if (n < DUREE_MIN || n > DUREE_MAX) {
          throw new MouvementSyntaxeError(`"duree:" doit être comprise entre ${DUREE_MIN} et ${DUREE_MAX} secondes (reçu ${n}).`);
        }
        duree = n;
        break;
      }
      default:
        throw new MouvementSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  return {
    x0: x0 ?? X0_DEFAUT,
    v0: v0 ?? V0_DEFAUT,
    a: a ?? A_DEFAUT,
    duree: duree ?? DUREE_DEFAUT,
  };
}

// ============================================================
//  Physique (pure, sans DOM) — loi horaire x(t) = x0 + v0·t + ½·a·t²
// ============================================================

export function position(x0: number, v0: number, a: number, t: number): number {
  return x0 + v0 * t + 0.5 * a * t * t;
}

export function vitesseInstantanee(v0: number, a: number, t: number): number {
  return v0 + a * t;
}

export type TypeMouvement = "uniforme" | "accelere" | "retarde";

export const LABELS_TYPE_MOUVEMENT: Record<TypeMouvement, string> = {
  uniforme: "Mouvement rectiligne uniforme",
  accelere: "Mouvement rectiligne uniformément accéléré",
  retarde: "Mouvement rectiligne uniformément retardé",
};

/**
 * uniforme si a = 0 ; sinon, compare le signe de v(t) (vitesse INSTANTANÉE,
 * pas v0) à celui de a : même signe -> le mobile accélère (|v| augmente),
 * signes opposés -> il ralentit (|v| diminue). Au passage par v(t) = 0 (le
 * mobile rebrousse chemin), on considère qu'il repart aussitôt dans le sens
 * de a, donc "accéléré" — cette fonction est appelée à chaque frame avec le
 * t courant, donc le libellé change bien en cours d'animation (ex. a<0,
 * v0>0 : "retardé" jusqu'à v(t)=0 puis "accéléré" une fois reparti en sens
 * inverse).
 */
export function determinerTypeMouvement(v0: number, a: number, t: number): TypeMouvement {
  if (a === 0) return "uniforme";
  const v = vitesseInstantanee(v0, a, t);
  if (v === 0) return "accelere";
  return v * a > 0 ? "accelere" : "retarde";
}

export interface EtendueTrajectoire {
  min: number;
  max: number;
}

const ETENDUE_PORTEE_MIN = 10; // mètres — évite un axe "collé" si le mobile ne bouge pas
const ETENDUE_MARGE_RATIO = 0.15;

/**
 * Bornes [min, max] (en mètres) balayées par x(t) sur tout [0, duree], avec
 * une marge — sert à cadrer l'axe SVG pour que toute la trajectoire tienne à
 * l'écran, quels que soient x0/v0/a (recalculé à chaque changement de
 * curseur, voir SimulationMouvement.tsx). x(t) étant une parabole en t, son
 * extremum (s'il tombe dans [0, duree]) est atteint en t = -v0/a.
 */
export function calculerEtendueTrajectoire(x0: number, v0: number, a: number, duree: number): EtendueTrajectoire {
  const candidats = [position(x0, v0, a, 0), position(x0, v0, a, duree)];
  if (a !== 0) {
    const tSommet = -v0 / a;
    if (tSommet > 0 && tSommet < duree) candidats.push(position(x0, v0, a, tSommet));
  }

  let min = Math.min(...candidats);
  let max = Math.max(...candidats);
  if (max - min < ETENDUE_PORTEE_MIN) {
    const centre = (min + max) / 2;
    min = centre - ETENDUE_PORTEE_MIN / 2;
    max = centre + ETENDUE_PORTEE_MIN / 2;
  }
  const marge = (max - min) * ETENDUE_MARGE_RATIO;
  return { min: min - marge, max: max + marge };
}

// ============================================================
//  Bornes des curseurs de réglage (élargies pour toujours inclure la valeur
//  de départ fournie par le bloc, même si elle sort de la plage "typique").
// ============================================================

export const X0_MIN_DEFAUT = -20;
export const X0_MAX_DEFAUT = 20;
export const V0_MIN_DEFAUT = -10;
export const V0_MAX_DEFAUT = 10;
export const A_MIN_DEFAUT = -5;
export const A_MAX_DEFAUT = 5;

export function borneCurseur(valeurInitiale: number, min: number, max: number): { min: number; max: number } {
  return { min: Math.min(min, valeurInitiale), max: Math.max(max, valeurInitiale) };
}
