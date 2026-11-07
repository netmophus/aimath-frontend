"use client";

import { useMemo } from "react";

import { parserBlocLaboComplexes, LaboComplexesSyntaxeError } from "@/lib/laboComplexes";
import LaboComplexes from "./LaboComplexes";

/** Pont Markdown vers rendu du Laboratoire des nombres complexes : même rôle que LaboPremiersBloc. */
export default function LaboComplexesBloc({ source }: { source: string }) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocLaboComplexes(source) };
    } catch (erreur) {
      return { ok: false as const, message: erreur instanceof LaboComplexesSyntaxeError ? erreur.message : "Syntaxe du laboratoire des nombres complexes invalide." };
    }
  }, [source]);

  if (!resultat.ok) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-800">Laboratoire des nombres complexes non affichable</p>
        <p className="mt-1 text-amber-700">{resultat.message}</p>
      </div>
    );
  }
  return <LaboComplexes data={resultat.data} />;
}
