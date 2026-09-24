"use client";

import { useMemo } from "react";

import { parserBlocRacines, ComplexeSyntaxeError } from "@/lib/complexe";
import RacinesNiemes from "./RacinesNiemes";
import RacinesErreur from "./RacinesErreur";

interface RacinesNiemesBlocProps {
  /** Texte brut du bloc ```racines (voir docs/syntaxe-racines.md),
   * transporté tel quel depuis lib/remarkRacines.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu — même rôle que HorlogeModulaireBloc.tsx.
 * `useMemo` sur `source` pour la même raison (RenduMarkdown se re-rend à
 * chaque frappe dans l'éditeur admin).
 */
export default function RacinesNiemesBloc({ source }: RacinesNiemesBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocRacines(source) };
    } catch (erreur) {
      const message = erreur instanceof ComplexeSyntaxeError ? erreur.message : "Syntaxe de racines n-ièmes invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <RacinesErreur message={resultat.message} />;
  }
  return <RacinesNiemes data={resultat.data} />;
}
