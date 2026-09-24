"use client";

import { useMemo } from "react";

import { parserBlocHorloge, HorlogeSyntaxeError } from "@/lib/horloge";
import HorlogeModulaire from "./HorlogeModulaire";
import HorlogeErreur from "./HorlogeErreur";

interface HorlogeModulaireBlocProps {
  /** Texte brut du bloc ```horloge (voir docs/syntaxe-horloge.md), transporté
   * tel quel depuis lib/remarkHorloge.ts. */
  source: string;
}

/**
 * Pont entre le Markdown et le rendu — même rôle que TableauVariationsBloc.tsx.
 * `useMemo` sur `source` pour la même raison (RenduMarkdown se re-rend à
 * chaque frappe dans l'éditeur admin).
 */
export default function HorlogeModulaireBloc({ source }: HorlogeModulaireBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocHorloge(source) };
    } catch (erreur) {
      const message = erreur instanceof HorlogeSyntaxeError ? erreur.message : "Syntaxe d'horloge modulaire invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) {
    return <HorlogeErreur message={resultat.message} />;
  }
  return <HorlogeModulaire data={resultat.data} />;
}
