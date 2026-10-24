"use client";

import { useCallback, useMemo } from "react";

import {
  afficherFraction,
  commandes,
  ecrireRecurrence,
  fenetre,
  nomTerme,
  objetsFixes,
  type ParametresSuite,
} from "@/lib/simulations/suiteRecurrente";
import CadreGeogebra from "./CadreGeogebra";

/**
 * Modèle « suite_recurrente » : premiers termes de u_{n+1} = a·u_n + b (nuage de points) ou diagramme en escalier.
 * La limite n'est annoncée que si |a| < 1 (vérifié côté serveur et ici).
 */
export default function SimulationSuiteRecurrente({ parametres, titre }: { parametres: ParametresSuite; titre: string }) {
  const fen = useCallback((largeur: number, hauteur: number) => fenetre(parametres, largeur, hauteur), [parametres]);
  const liste = useMemo(() => commandes(parametres), [parametres]);
  const fixes = useMemo(() => objetsFixes(parametres), [parametres]);
  const { termesTexte, limiteTexte, presentation, reduite } = parametres;
  const recurrence = ecrireRecurrence(parametres);
  const montres = Math.min(3, termesTexte.length);

  const description =
    `Suite : ${recurrence}. Premiers termes : ${termesTexte.slice(0, montres).map((t, k) => `${nomTerme(parametres, k)} = ${afficherFraction(t)}`).join(", ")}` +
    (limiteTexte !== null ? `. Limite ${afficherFraction(limiteTexte)}` : "") +
    (presentation === "escalier" ? ". Diagramme en escalier." : ".");

  return (
    <CadreGeogebra
      titre={titre}
      commandes={liste}
      fixes={fixes}
      fenetre={fen}
      descriptionAccessible={description}
      legende={
        <>
          <li data-testid="suite-recurrence">{recurrence}</li>
          {termesTexte.slice(0, montres).map((t, k) => (
            <li key={k} data-testid={`suite-terme-${k}`}>
              {nomTerme(parametres, k)} = {afficherFraction(t)}
            </li>
          ))}
          {!reduite && (
            <li data-testid="suite-limite">
              {limiteTexte !== null
                ? `Limite : ${afficherFraction(limiteTexte)} (point fixe de la récurrence)`
                : "Aucune limite n'est annoncée pour cette suite."}
            </li>
          )}
        </>
      }
    />
  );
}
