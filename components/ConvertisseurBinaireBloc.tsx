"use client";

import { useMemo } from "react";

import { parserBlocBinaire, BinaireSyntaxeError } from "@/lib/binaire";
import ConvertisseurBinaire from "./ConvertisseurBinaire";
import BinaireErreur from "./BinaireErreur";

interface ConvertisseurBinaireBlocProps {
  /** Texte brut du bloc ```binaire (voir docs/syntaxe-binaire.md), transporté
   * tel quel depuis lib/remarkBinaire.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu — même rôle que TableauVariationsBloc.tsx.
 * `useMemo` sur `source` pour la même raison (RenduMarkdown se re-rend à
 * chaque frappe dans l'éditeur admin).
 */
export default function ConvertisseurBinaireBloc({ source }: ConvertisseurBinaireBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocBinaire(source) };
    } catch (erreur) {
      const message = erreur instanceof BinaireSyntaxeError ? erreur.message : "Syntaxe de convertisseur binaire invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <BinaireErreur message={resultat.message} />;
  }
  return <ConvertisseurBinaire data={resultat.data} />;
}
