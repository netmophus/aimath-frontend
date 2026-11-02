import type { ReactNode } from "react";
import type { TablerIcon } from "@tabler/icons-react";

import { NAVY, melange } from "./teintesLecon";

interface EncadreLeconProps {
  titre: string;
  icone: TablerIcon;
  couleur: string;
  children: ReactNode;
}

/** Encadré coloré de l'onglet Cours (Objectifs, Prérequis, À retenir) : fond clair, bordure colorée, icône + titre. */
export default function EncadreLecon({ titre, icone: Icone, couleur, children }: EncadreLeconProps) {
  return (
    <section
      className="rounded-3xl border-2 px-4 py-4 sm:px-6 sm:py-5"
      style={{ backgroundColor: melange(couleur, 7), borderColor: melange(couleur, 40) }}
    >
      <h3 className="mb-2 flex items-center gap-3 text-lg font-extrabold sm:text-xl" style={{ color: NAVY }}>
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: couleur }}
        >
          <Icone size={22} stroke={1.9} />
        </span>
        {titre}
      </h3>
      {children}
    </section>
  );
}
