import { IconFileCheck, IconSchool, type TablerIcon } from "@tabler/icons-react";

import type { MatiereResolvable, ModeResolution } from "@/lib/resoudre";

/** Couleur d'identité de chaque matière (mêmes teintes que les boutons du tableau de bord). */
export const COULEUR_MATIERE_RESOLVABLE: Record<MatiereResolvable, string> = {
  maths: "#C2410C",
  physique: "#0E7490",
  chimie: "#7C3AED",
  svt: "#047857",
};

/** Identité visuelle des deux modes d'aide : couleur principale, teinte de fond sélectionnée, icône. */
export interface IdentiteMode {
  couleur: string;
  teinte: string;
  icone: TablerIcon;
}

export const IDENTITES_MODES: Record<ModeResolution, IdentiteMode> = {
  correction: { couleur: "#EA580C", teinte: "#FFF7ED", icone: IconFileCheck },
  professeur: { couleur: "#7C3AED", teinte: "#F5F3FF", icone: IconSchool },
};

/** Teinte claire d'une couleur (pourcentage de couleur, le reste en blanc) — pour bordures au repos. */
export function melangeBlanc(couleur: string, pourcentage: number): string {
  return `color-mix(in srgb, ${couleur} ${pourcentage}%, white)`;
}
