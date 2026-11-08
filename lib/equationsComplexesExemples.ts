/**
 * Exemples prédéfinis du Laboratoire « Équations dans ℂ ». Chaque exemple porte ses solutions ATTENDUES (écrites à la
 * main) : les tests vérifient que le moteur (lib/equationsComplexes.ts) les retrouve, donc que l'interface n'affiche
 * jamais un exemple faux.
 */

import { cx, type Cx } from "./complexes";
import type { Poly } from "./equationsComplexes";

export interface ExempleDiscriminant {
  libelle: string;
  a: number;
  b: number;
  c: number;
  /** Racines DISTINCTES attendues. */
  attendues: Cx[];
}

export const EXEMPLES_DISCRIMINANT: ExempleDiscriminant[] = [
  { libelle: "z² − 5z + 6 = 0", a: 1, b: -5, c: 6, attendues: [cx(2), cx(3)] },
  { libelle: "z² − 4z + 4 = 0", a: 1, b: -4, c: 4, attendues: [cx(2)] },
  { libelle: "z² − 4z + 5 = 0", a: 1, b: -4, c: 5, attendues: [cx(2, -1), cx(2, 1)] },
  { libelle: "z² − 4z + 13 = 0", a: 1, b: -4, c: 13, attendues: [cx(2, -3), cx(2, 3)] },
];

export interface ExempleRacineCarree {
  libelle: string;
  X: number;
  Y: number;
  /** Racines carrées DISTINCTES attendues (δ en premier). */
  attendues: Cx[];
}

export const EXEMPLES_RACINES_CARREES: ExempleRacineCarree[] = [
  { libelle: "Δ = −4", X: -4, Y: 0, attendues: [cx(0, 2), cx(0, -2)] },
  { libelle: "Δ = 2i", X: 0, Y: 2, attendues: [cx(1, 1), cx(-1, -1)] },
  { libelle: "Δ = −2i", X: 0, Y: -2, attendues: [cx(1, -1), cx(-1, 1)] },
  { libelle: "Δ = 3 + 4i", X: 3, Y: 4, attendues: [cx(2, 1), cx(-2, -1)] },
  { libelle: "Δ = 0", X: 0, Y: 0, attendues: [cx(0)] },
  { libelle: "Δ = 9", X: 9, Y: 0, attendues: [cx(3), cx(-3)] },
];

export interface ExempleResolution {
  libelle: string;
  a: Cx;
  b: Cx;
  c: Cx;
  attendues: Cx[];
}

export const EXEMPLES_RESOLUTION: ExempleResolution[] = [
  { libelle: "z² − 4z + 13 = 0", a: cx(1), b: cx(-4), c: cx(13), attendues: [cx(2, -3), cx(2, 3)] },
  { libelle: "z² − (3+i)z + (2+2i) = 0", a: cx(1), b: cx(-3, -1), c: cx(2, 2), attendues: [cx(1, 1), cx(2)] },
  { libelle: "z² − (3+i)z + (2+i) = 0", a: cx(1), b: cx(-3, -1), c: cx(2, 1), attendues: [cx(1), cx(2, 1)] },
];

export interface ExempleTroisieme {
  libelle: string;
  /** Coefficients [a, b, c, d] sous forme de texte, tels qu'on les saisit. */
  coefs: [string, string, string, string];
  z0: string;
  p: Poly;
  racineConnue: Cx;
  /** Racines DISTINCTES attendues avec leur multiplicité. */
  attendues: Array<{ z: Cx; m: number }>;
}

export const EXEMPLES_TROISIEME: ExempleTroisieme[] = [
  {
    libelle: "z³ − 6z² + 13z − 10 = 0",
    coefs: ["1", "-6", "13", "-10"],
    z0: "2",
    p: [cx(1), cx(-6), cx(13), cx(-10)],
    racineConnue: cx(2),
    attendues: [{ z: cx(2), m: 1 }, { z: cx(2, -1), m: 1 }, { z: cx(2, 1), m: 1 }],
  },
  {
    libelle: "z³ − 4z² + 6z − 4 = 0",
    coefs: ["1", "-4", "6", "-4"],
    z0: "2",
    p: [cx(1), cx(-4), cx(6), cx(-4)],
    racineConnue: cx(2),
    attendues: [{ z: cx(2), m: 1 }, { z: cx(1, -1), m: 1 }, { z: cx(1, 1), m: 1 }],
  },
  {
    libelle: "z³ − 3z² + 4z − 12 = 0",
    coefs: ["1", "-3", "4", "-12"],
    z0: "3",
    p: [cx(1), cx(-3), cx(4), cx(-12)],
    racineConnue: cx(3),
    attendues: [{ z: cx(3), m: 1 }, { z: cx(0, -2), m: 1 }, { z: cx(0, 2), m: 1 }],
  },
  {
    libelle: "z³ − 5z² + 8z − 4 = 0 (racine double)",
    coefs: ["1", "-5", "8", "-4"],
    z0: "2",
    p: [cx(1), cx(-5), cx(8), cx(-4)],
    racineConnue: cx(2),
    attendues: [{ z: cx(1), m: 1 }, { z: cx(2), m: 2 }],
  },
  {
    libelle: "z³ − 3z² + 3z − 1 = 0 (racine triple)",
    coefs: ["1", "-3", "3", "-1"],
    z0: "1",
    p: [cx(1), cx(-3), cx(3), cx(-1)],
    racineConnue: cx(1),
    attendues: [{ z: cx(1), m: 3 }],
  },
];

export interface ExempleVerification {
  libelle: string;
  p: Poly;
  /** Racine connue (degré 3 uniquement). */
  racineConnue?: Cx;
  /** Racines attendues AVEC multiplicité. */
  attendues: Cx[];
}

export const EXEMPLES_VERIFICATION: ExempleVerification[] = [
  { libelle: "z² − 5z + 6 = 0", p: [cx(1), cx(-5), cx(6)], attendues: [cx(2), cx(3)] },
  { libelle: "z² − 4z + 13 = 0", p: [cx(1), cx(-4), cx(13)], attendues: [cx(2, -3), cx(2, 3)] },
  { libelle: "z² − (3+i)z + (2+2i) = 0", p: [cx(1), cx(-3, -1), cx(2, 2)], attendues: [cx(1, 1), cx(2)] },
  { libelle: "z³ − 6z² + 13z − 10 = 0", p: [cx(1), cx(-6), cx(13), cx(-10)], racineConnue: cx(2), attendues: [cx(2), cx(2, -1), cx(2, 1)] },
  { libelle: "z³ − 3z² + 4z − 12 = 0", p: [cx(1), cx(-3), cx(4), cx(-12)], racineConnue: cx(3), attendues: [cx(3), cx(0, -2), cx(0, 2)] },
];

/** Équations du mode « À toi de trouver » (racines attendues avec multiplicité). */
export const INSTANCES_ENTRAINEMENT: ExempleVerification[] = [
  { libelle: "z² − 2z + 5 = 0", p: [cx(1), cx(-2), cx(5)], attendues: [cx(1, -2), cx(1, 2)] },
  { libelle: "z² + 4 = 0", p: [cx(1), cx(0), cx(4)], attendues: [cx(0, -2), cx(0, 2)] },
  { libelle: "z² − 6z + 9 = 0", p: [cx(1), cx(-6), cx(9)], attendues: [cx(3), cx(3)] },
  { libelle: "z² − (1+i)z + i = 0", p: [cx(1), cx(-1, -1), cx(0, 1)], attendues: [cx(1), cx(0, 1)] },
  { libelle: "z³ − z² + z − 1 = 0", p: [cx(1), cx(-1), cx(1), cx(-1)], racineConnue: cx(1), attendues: [cx(1), cx(0, -1), cx(0, 1)] },
  { libelle: "z³ − 4z² + 9z − 36 = 0", p: [cx(1), cx(-4), cx(9), cx(-36)], racineConnue: cx(4), attendues: [cx(4), cx(0, -3), cx(0, 3)] },
  { libelle: "z³ − 3z² + 3z − 1 = 0", p: [cx(1), cx(-3), cx(3), cx(-1)], racineConnue: cx(1), attendues: [cx(1), cx(1), cx(1)] },
];
