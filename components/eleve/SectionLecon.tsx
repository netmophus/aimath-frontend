import type { ReactNode } from "react";

interface SectionLeconProps {
  titre: string;
  children: ReactNode;
}

/** Section titrée générique pour la page de lecture (Objectifs, Prérequis, Cours…). */
export default function SectionLecon({ titre, children }: SectionLeconProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/60">{titre}</h2>
      {children}
    </section>
  );
}
