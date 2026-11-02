import { IconBook2, IconBulb, IconCertificate, IconMathFunction, IconPencil, type TablerIcon } from "@tabler/icons-react";

import type { RubriqueId } from "@/lib/lecon/rubriques";

/** Identité visuelle de chaque rubrique de la page de lecture (couleur + icône + libellé). */
export interface IdentiteRubrique {
  label: string;
  couleur: string;
  icone: TablerIcon;
}

export const NAVY = "#102A66";

export const IDENTITES_RUBRIQUES: Record<RubriqueId, IdentiteRubrique> = {
  pourquoi: { label: "Pourquoi cette notion ?", couleur: "#2563EB", icone: IconBulb },
  cours: { label: "Cours", couleur: "#7C3AED", icone: IconBook2 },
  demonstrations: { label: "Démonstrations", couleur: "#0891B2", icone: IconMathFunction },
  exercices: { label: "Exercices", couleur: "#C2410C", icone: IconPencil },
  examen: { label: "Examen", couleur: "#15803D", icone: IconCertificate },
};

/** Teinte claire d'une couleur (pourcentage de couleur, le reste en blanc) — pour fonds et bordures. */
export function melange(couleur: string, pourcentage: number): string {
  return `color-mix(in srgb, ${couleur} ${pourcentage}%, white)`;
}
