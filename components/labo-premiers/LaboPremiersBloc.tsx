"use client";

import { useMemo } from "react";

import { parserBlocLaboPremiers, LaboPremiersSyntaxeError } from "@/lib/laboPremiers";
import LaboPremiers from "./LaboPremiers";

/** Pont Markdown vers rendu du Laboratoire des nombres premiers : même rôle que LaboPgcdBloc. */
export default function LaboPremiersBloc({ source }: { source: string }) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocLaboPremiers(source) };
    } catch (erreur) {
      return { ok: false as const, message: erreur instanceof LaboPremiersSyntaxeError ? erreur.message : "Syntaxe du laboratoire des nombres premiers invalide." };
    }
  }, [source]);

  if (!resultat.ok) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-800">Laboratoire des nombres premiers non affichable</p>
        <p className="mt-1 text-amber-700">{resultat.message}</p>
      </div>
    );
  }
  return <LaboPremiers data={resultat.data} />;
}
