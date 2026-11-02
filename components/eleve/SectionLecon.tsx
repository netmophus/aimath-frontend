import type { ReactNode } from "react";
import type { TablerIcon } from "@tabler/icons-react";

import { NAVY, melange } from "./teintesLecon";

interface SectionLeconProps {
  titre: string;
  children: ReactNode;
  /** Pastille d'icône devant le titre (facultative). */
  icone?: TablerIcon;
  couleur?: string;
}

/** Section titrée générique pour la page de lecture (Cours, Vidéos, Ressources…). */
export default function SectionLecon({ titre, children, icone: Icone, couleur = "#7C3AED" }: SectionLeconProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-3 text-xl font-extrabold sm:text-2xl" style={{ color: NAVY }}>
        {Icone ? (
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: melange(couleur, 14), color: couleur }}
          >
            <Icone size={24} stroke={1.9} />
          </span>
        ) : (
          <span aria-hidden="true" className="h-6 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: couleur }} />
        )}
        {titre}
      </h2>
      {children}
    </section>
  );
}
