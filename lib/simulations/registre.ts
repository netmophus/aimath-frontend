import type { ComponentType } from "react";

import SimulationGeometrieTriangle from "@/components/simulations/SimulationGeometrieTriangle";
import SimulationPlanComplexe from "@/components/simulations/SimulationPlanComplexe";
import SimulationSuiteRecurrente from "@/components/simulations/SimulationSuiteRecurrente";
import SimulationVecteurDeuxPoints from "@/components/simulations/SimulationVecteurDeuxPoints";
import { validerParametres as validerGeometrieTriangle, type ParametresTriangle } from "./geometrieTriangle";
import { validerParametres as validerPlanComplexe, type ParametresPlanComplexe } from "./planComplexe";
import { validerParametres as validerSuiteRecurrente, type ParametresSuite } from "./suiteRecurrente";
import type { SimulationExercice } from "./types";
import { validerParametres as validerVecteurDeuxPoints, type ParametresVecteurDeuxPoints } from "./vecteurDeuxPoints";

interface ModeleFront<P> {
  version: number;
  valider: (brut: unknown) => P | null;
  Composant: ComponentType<{ parametres: P; titre: string }>;
}

/**
 * Registre extensible : identifiant de modèle → validation des paramètres + composant React.
 * Ajouter un modèle = ajouter une ligne ici (un identifiant inconnu n'affiche rien ; la correction reste normale).
 */
const REGISTRE: Record<string, ModeleFront<never>> = {
  vecteur_deux_points: {
    version: 2,
    valider: validerVecteurDeuxPoints,
    Composant: SimulationVecteurDeuxPoints,
  } satisfies ModeleFront<ParametresVecteurDeuxPoints> as unknown as ModeleFront<never>,
  plan_complexe: {
    version: 1,
    valider: validerPlanComplexe,
    Composant: SimulationPlanComplexe,
  } satisfies ModeleFront<ParametresPlanComplexe> as unknown as ModeleFront<never>,
  suite_recurrente: {
    version: 1,
    valider: validerSuiteRecurrente,
    Composant: SimulationSuiteRecurrente,
  } satisfies ModeleFront<ParametresSuite> as unknown as ModeleFront<never>,
  geometrie_triangle: {
    version: 1,
    valider: validerGeometrieTriangle,
    Composant: SimulationGeometrieTriangle,
  } satisfies ModeleFront<ParametresTriangle> as unknown as ModeleFront<never>,
};

/** Résolution sûre : modèle connu + version courante + paramètres valides, sinon null. */
export function resoudreSimulation(
  simulation: SimulationExercice,
): { Composant: ComponentType<{ parametres: unknown; titre: string }>; parametres: unknown } | null {
  const modele = Object.hasOwn(REGISTRE, simulation.modele) ? (REGISTRE[simulation.modele] as unknown as ModeleFront<unknown>) : null;
  if (!modele || simulation.version !== modele.version) return null;
  const parametres = modele.valider(simulation.parametres);
  if (parametres === null) return null;
  return { Composant: modele.Composant as ComponentType<{ parametres: unknown; titre: string }>, parametres };
}
