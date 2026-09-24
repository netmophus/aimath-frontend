"use client";

import { useMemo } from "react";

import { parserBlocCirculaire, CirculaireSyntaxeError } from "@/lib/circulaire";
import SimulationCirculaire from "./SimulationCirculaire";
import CirculaireErreur from "./CirculaireErreur";

interface SimulationCirculaireBlocProps {
  /** Texte brut du bloc ```circulaire (voir docs/syntaxe-circulaire.md),
   * transporté tel quel depuis lib/remarkCirculaire.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu — même rôle que SimulationMouvementBloc.tsx.
 * `useMemo` sur `source` pour la même raison (RenduMarkdown se re-rend à
 * chaque frappe dans l'éditeur admin).
 */
export default function SimulationCirculaireBloc({ source }: SimulationCirculaireBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocCirculaire(source) };
    } catch (erreur) {
      const message = erreur instanceof CirculaireSyntaxeError ? erreur.message : "Syntaxe de simulation circulaire invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <CirculaireErreur message={resultat.message} />;
  }
  return <SimulationCirculaire data={resultat.data} />;
}
