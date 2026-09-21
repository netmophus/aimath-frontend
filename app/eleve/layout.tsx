import type { ReactNode } from "react";

import MarqueEleve from "@/components/eleve/MarqueEleve";
import EleveLayoutClient from "@/components/eleve/EleveLayoutClient";

/**
 * Composant serveur volontairement minimal : MarqueEleve.tsx lit le système
 * de fichiers (node:fs) et ne doit jamais être importé directement depuis un
 * fichier "use client" (voir app/admin/layout.tsx pour le même motif).
 */
export default function EleveLayout({ children }: { children: ReactNode }) {
  return <EleveLayoutClient logo={<MarqueEleve />}>{children}</EleveLayoutClient>;
}
