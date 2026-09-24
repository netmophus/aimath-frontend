"use client";

import { useMemo } from "react";

import { parserBlocMouvement, MouvementSyntaxeError } from "@/lib/mouvement";
import SimulationMouvement from "./SimulationMouvement";
import MouvementErreur from "./MouvementErreur";

interface SimulationMouvementBlocProps {
  /** Texte brut du bloc ```mouvement (voir docs/syntaxe-mouvement.md),
   * transporté tel quel depuis lib/remarkMouvement.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu — même rôle que HorlogeModulaireBloc.tsx.
 * `useMemo` sur `source` pour la même raison (RenduMarkdown se re-rend à
 * chaque frappe dans l'éditeur admin).
 */
export default function SimulationMouvementBloc({ source }: SimulationMouvementBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocMouvement(source) };
    } catch (erreur) {
      const message = erreur instanceof MouvementSyntaxeError ? erreur.message : "Syntaxe de simulation de mouvement invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <MouvementErreur message={resultat.message} />;
  }
  return <SimulationMouvement data={resultat.data} />;
}
