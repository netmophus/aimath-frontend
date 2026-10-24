"use client";

import { useCallback, useMemo } from "react";

import {
  commandes,
  fenetre,
  justificationPythagore,
  longueurTexte,
  NATURES,
  objetsFixes,
  type ParametresTriangle,
} from "@/lib/simulations/geometrieTriangle";
import CadreGeogebra from "./CadreGeogebra";

/**
 * Modèle « geometrie_triangle » : points, triangle, longueurs des côtés et nature, dans un repère orthonormé.
 * Longueurs et nature sont recalculées (entiers + SymPy côté serveur, entiers ici) ; la nature repose sur la
 * réciproque de Pythagore appliquée aux carrés des côtés.
 */
export default function SimulationGeometrieTriangle({ parametres, titre }: { parametres: ParametresTriangle; titre: string }) {
  const fen = useCallback((largeur: number, hauteur: number) => fenetre(parametres, largeur, hauteur), [parametres]);
  const liste = useMemo(() => commandes(parametres), [parametres]);
  const fixes = useMemo(() => objetsFixes(parametres), [parametres]);
  const { points, demandes, nature } = parametres;
  const justification = demandes.length > 0 ? justificationPythagore(parametres) : null; // la justification montre les longueurs

  const description =
    `Repère orthonormé : ${points.map((p) => `${p.nom}(${p.x} ; ${p.y})`.replace(/-/g, "−")).join(", ")}` +
    (demandes.length ? `. Longueurs : ${demandes.map((s) => `${s} = ${longueurTexte(parametres, s)}`).join(", ")}` : "") +
    (nature ? `. Triangle ${NATURES[nature.type]}${nature.sommetDroit ? `, angle droit en ${nature.sommetDroit}` : ""}` : "");

  return (
    <CadreGeogebra
      titre={titre}
      commandes={liste}
      fixes={fixes}
      fenetre={fen}
      descriptionAccessible={description}
      legende={
        <>
          {points.map((p) => (
            <li key={p.nom} data-testid={`triangle-point-${p.nom}`}>
              {p.nom}({String(p.x).replace("-", "−")} ; {String(p.y).replace("-", "−")})
            </li>
          ))}
          {demandes.map((s) => (
            <li key={s} data-testid={`triangle-longueur-${s}`}>
              {s} = {longueurTexte(parametres, s)}
            </li>
          ))}
          {nature && (
            <li data-testid="triangle-nature">
              Triangle {NATURES[nature.type]}
              {nature.sommetDroit ? ` en ${nature.sommetDroit}` : ""}
            </li>
          )}
          {justification && <li data-testid="triangle-pythagore">{justification}</li>}
        </>
      }
    />
  );
}
