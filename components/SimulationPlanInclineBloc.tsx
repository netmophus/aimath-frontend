"use client";

import { useMemo } from "react";

import { parserBlocPlanIncline, PlanInclineSyntaxeError } from "@/lib/planIncline";
import SimulationPlanIncline from "./SimulationPlanIncline";
import PlanInclineErreur from "./PlanInclineErreur";

interface SimulationPlanInclineBlocProps {
  /** Texte brut du bloc ```plan-incline (voir docs/syntaxe-plan-incline.md),
   * transporté tel quel depuis lib/remarkPlanIncline.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu — même rôle que SimulationMouvementBloc.tsx
 * et SimulationCirculaireBloc.tsx. `useMemo` sur `source` pour la même raison
 * (RenduMarkdown se re-rend à chaque frappe dans l'éditeur admin).
 */
export default function SimulationPlanInclineBloc({ source }: SimulationPlanInclineBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocPlanIncline(source) };
    } catch (erreur) {
      const message = erreur instanceof PlanInclineSyntaxeError ? erreur.message : "Syntaxe de simulation de plan incliné invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <PlanInclineErreur message={resultat.message} />;
  }
  return <SimulationPlanIncline data={resultat.data} />;
}
