/**
 * Structure des classes proposées à l'inscription (cycle → niveau → série).
 * Codée en dur pour l'instant ; sera remplacée par un appel à l'API Django.
 */

export type CycleId = "college" | "lycee";

export interface Niveau {
  id: string;
  label: string;
  /** Séries disponibles pour ce niveau. Tableau vide = pas de série. */
  series: readonly string[];
}

export interface Cycle {
  id: CycleId;
  label: string;
  niveaux: readonly Niveau[];
}

export const CYCLES: readonly Cycle[] = [
  {
    id: "college",
    label: "Collège (6e – 3e)",
    niveaux: [
      { id: "6e", label: "6e", series: [] },
      { id: "5e", label: "5e", series: [] },
      { id: "4e", label: "4e", series: [] },
      { id: "3e", label: "3e", series: [] },
    ],
  },
  {
    id: "lycee",
    label: "Lycée (2nde – Tle)",
    niveaux: [
      { id: "2nde", label: "2nde", series: ["C", "A"] },
      { id: "1re", label: "1re", series: ["C", "D", "E", "A", "G"] },
      { id: "tle", label: "Tle", series: ["C", "D", "E", "A", "G"] },
    ],
  },
];

export function getCycle(cycleId: string): Cycle | undefined {
  return CYCLES.find((cycle) => cycle.id === cycleId);
}

export function getNiveau(cycleId: string, niveauId: string): Niveau | undefined {
  return getCycle(cycleId)?.niveaux.find((niveau) => niveau.id === niveauId);
}

/** Un niveau exige une série si sa liste de séries n'est pas vide. */
export function niveauNeedsSerie(niveau: Niveau | undefined): boolean {
  return Boolean(niveau && niveau.series.length > 0);
}
