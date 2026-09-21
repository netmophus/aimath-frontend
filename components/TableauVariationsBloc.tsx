"use client";

import { useMemo } from "react";

import { parserBlocVariations, VariationsSyntaxeError } from "@/lib/variations";
import TableauVariations from "./TableauVariations";
import VariationsErreur from "./VariationsErreur";

interface TableauVariationsBlocProps {
  /** Texte brut du bloc ```variations (voir docs/syntaxe-variations.md),
   * transporté tel quel depuis lib/remarkVariations.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu — même rôle que CourbeFonctionBloc.tsx
 * pour les courbes, MAIS sans `next/dynamic({ ssr: false })` : TableauVariations
 * n'a besoin d'aucune API navigateur (SVG statique + katex.renderToString,
 * une fonction pure — voir ce fichier), donc rien n'empêche de le rendre
 * pendant le SSR, contrairement à function-plot qui doit attacher une
 * sélection d3 à un noeud DOM réel. Import direct, plus simple, et le
 * tableau apparaît dans le HTML initial (meilleur pour un premier rendu
 * sans clignotement de chargement).
 *
 * `useMemo` sur `source` : RenduMarkdown se re-rend à chaque frappe dans
 * l'éditeur admin (ChampMarkdown) — sans ce memo, un nouveau parsing (et un
 * nouvel id `useId` côté enfant) serait déclenché à chaque frappe ailleurs
 * dans le document, sans nécessité.
 */
export default function TableauVariationsBloc({ source }: TableauVariationsBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocVariations(source) };
    } catch (erreur) {
      const message = erreur instanceof VariationsSyntaxeError ? erreur.message : "Syntaxe de tableau de variations invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <VariationsErreur message={resultat.message} />;
  }
  return <TableauVariations data={resultat.data} />;
}
