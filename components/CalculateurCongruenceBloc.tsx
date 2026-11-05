"use client";

import { useMemo } from "react";

import { parserBlocCongruence, CongruenceSyntaxeError } from "@/lib/congruence";
import CalculateurCongruence from "./CalculateurCongruence";
import CongruenceErreur from "./CongruenceErreur";

interface CalculateurCongruenceBlocProps {
  /** Texte brut du bloc ```congruence (voir docs/syntaxe-congruence.md), transporté par lib/remarkCongruence.ts. */
  source: string;
}

/** Pont Markdown vers rendu — même rôle que HorlogeModulaireBloc. */
export default function CalculateurCongruenceBloc({ source }: CalculateurCongruenceBlocProps) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocCongruence(source) };
    } catch (erreur) {
      const message = erreur instanceof CongruenceSyntaxeError ? erreur.message : "Syntaxe de calculateur de congruence invalide.";
      return { ok: false as const, message };
    }
  }, [source]);

  if (!resultat.ok) return <CongruenceErreur message={resultat.message} />;
  return <CalculateurCongruence data={resultat.data} />;
}
