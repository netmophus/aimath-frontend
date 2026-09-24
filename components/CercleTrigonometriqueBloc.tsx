"use client";

import { useMemo } from "react";

import { parserBlocCercleTrigo, ComplexeSyntaxeError } from "@/lib/complexe";
import CercleTrigonometrique from "./CercleTrigonometrique";
import CercleTrigoErreur from "./CercleTrigoErreur";

interface CercleTrigonometriqueBlocProps {
  /** Texte brut du bloc ```cercletrigo (voir docs/syntaxe-cercletrigo.md),
   * transporté tel quel depuis lib/remarkCercleTrigo.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu — même rôle que HorlogeModulaireBloc.tsx.
 * `useMemo` sur `source` pour la même raison (RenduMarkdown se re-rend à
 * chaque frappe dans l'éditeur admin).
 */
export default function CercleTrigonometriqueBloc({ source }: CercleTrigonometriqueBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocCercleTrigo(source) };
    } catch (erreur) {
      const message = erreur instanceof ComplexeSyntaxeError ? erreur.message : "Syntaxe de cercle trigonométrique invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <CercleTrigoErreur message={resultat.message} />;
  }
  return <CercleTrigonometrique data={resultat.data} />;
}
