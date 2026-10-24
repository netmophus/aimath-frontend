"use client";

import { useCallback, useMemo } from "react";

import { formaterNombre } from "@/lib/simulations/commun";
import {
  argumentTexte,
  commandes,
  ecrireComplexe,
  fenetre,
  moduleTexte,
  objetsFixes,
  type ParametresPlanComplexe,
} from "@/lib/simulations/planComplexe";
import CadreGeogebra from "./CadreGeogebra";

/**
 * Modèle « plan_complexe » : le point M(a ; b) image de z, et selon la `presentation` choisie par le serveur d'après la
 * question : projections (`point`), conjugué (`conjugue`), module (`module`) ou module et argument (`argument`).
 */
export default function SimulationPlanComplexe({ parametres, titre }: { parametres: ParametresPlanComplexe; titre: string }) {
  const { nom, a, b, presentation } = parametres;
  const fen = useCallback((largeur: number, hauteur: number) => fenetre(parametres, largeur, hauteur), [parametres]);
  const liste = useMemo(() => commandes(parametres), [parametres]);
  const fixes = useMemo(() => objetsFixes(parametres), [parametres]);
  const z = ecrireComplexe(a, b);
  const moduleTxt = moduleTexte(parametres);
  const arg = argumentTexte(parametres);

  const description =
    `Plan complexe : le point M(${formaterNombre(a)} ; ${formaterNombre(b)}) est l'image de ${nom} = ${z}` +
    (presentation === "conjugue" ? `, avec le point M' (${formaterNombre(a)} ; ${formaterNombre(-b)}) image du conjugué` : "") +
    (moduleTxt ? `, module ${moduleTxt}` : "") +
    (presentation === "argument" && arg ? `, argument ${arg}` : "");

  return (
    <CadreGeogebra
      titre={titre}
      commandes={liste}
      fixes={fixes}
      fenetre={fen}
      descriptionAccessible={description}
      legende={
        <>
          <li data-testid="complexe-z">
            {nom} = {z}
          </li>
          <li data-testid="complexe-m">
            M({formaterNombre(a)} ; {formaterNombre(b)})
          </li>
          {presentation === "conjugue" && (
            <>
              <li data-testid="complexe-conjugue">
                {nom}̄ = {ecrireComplexe(a, -b)}
              </li>
              <li data-testid="complexe-mc">
                M′({formaterNombre(a)} ; {formaterNombre(-b)})
              </li>
            </>
          )}
          {moduleTxt && (
            <li data-testid="complexe-module">
              |{nom}| = √({formaterNombre(a)}² + {formaterNombre(b)}²) = {moduleTxt}
            </li>
          )}
          {presentation === "argument" && arg && (
            <li data-testid="complexe-argument">
              arg({nom}) = {arg}
            </li>
          )}
        </>
      }
    />
  );
}
