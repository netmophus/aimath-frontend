/**
 * Données du défi « Racines » du Laboratoire Moivre-Euler : chaque instance fournit un complexe Z, un ordre n, UNE racine
 * n-ième correcte et trois propositions fausses. Les valeurs sont vérifiées par les tests (z^n = Z pour la bonne, ≠ Z pour
 * les fausses), jamais saisies « de tête ».
 */

import type { Cx } from "./complexes";

export interface PropositionRacine {
  tex: string;
  z: Cx;
}
export interface InstanceDefiRacines {
  rho: number;
  phiDeg: number;
  n: number;
  /** Texte TeX de Z. */
  texZ: string;
  /** Module R = ρ^{1/n} attendu. */
  R: number;
  /** Argument de z_0 attendu (radians) : φ/n. */
  arg0: number;
  correcte: PropositionRacine;
  fausses: PropositionRacine[];
}

export const INSTANCES_DEFI_RACINES: InstanceDefiRacines[] = [
  {
    rho: 8,
    phiDeg: 90,
    n: 3,
    texZ: "8i",
    R: 2,
    arg0: Math.PI / 6,
    correcte: { tex: "-2i", z: { re: 0, im: -2 } },
    fausses: [
      { tex: "2i", z: { re: 0, im: 2 } },
      { tex: "2", z: { re: 2, im: 0 } },
      { tex: "-2", z: { re: -2, im: 0 } },
    ],
  },
  {
    rho: 16,
    phiDeg: 180,
    n: 4,
    texZ: "-16",
    R: 2,
    arg0: Math.PI / 4,
    correcte: { tex: "\sqrt{2}+\sqrt{2}\,i", z: { re: Math.SQRT2, im: Math.SQRT2 } },
    fausses: [
      { tex: "2", z: { re: 2, im: 0 } },
      { tex: "1+i", z: { re: 1, im: 1 } },
      { tex: "2i", z: { re: 0, im: 2 } },
    ],
  },
  {
    rho: 1,
    phiDeg: 0,
    n: 4,
    texZ: "1",
    R: 1,
    arg0: 0,
    correcte: { tex: "i", z: { re: 0, im: 1 } },
    fausses: [
      { tex: "1+i", z: { re: 1, im: 1 } },
      { tex: "2", z: { re: 2, im: 0 } },
      { tex: "\dfrac{1}{2}", z: { re: 0.5, im: 0 } },
    ],
  },
];
