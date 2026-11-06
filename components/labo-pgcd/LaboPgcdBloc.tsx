"use client";

import { useMemo } from "react";

import { parserBlocLaboPgcd, LaboPgcdSyntaxeError } from "@/lib/laboPgcd";
import LaboPgcd from "./LaboPgcd";

/** Pont Markdown vers rendu du Laboratoire PGCD & PPCM — même rôle que HorlogeModulaireBloc. */
export default function LaboPgcdBloc({ source }: { source: string }) {
  const resultat = useMemo(() => {
    try {
      return { ok: true as const, data: parserBlocLaboPgcd(source) };
    } catch (erreur) {
      return { ok: false as const, message: erreur instanceof LaboPgcdSyntaxeError ? erreur.message : "Syntaxe du laboratoire PGCD invalide." };
    }
  }, [source]);

  if (!resultat.ok) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <p className="font-semibold text-amber-800">Laboratoire PGCD &amp; PPCM non affichable</p>
        <p className="mt-1 text-amber-700">{resultat.message}</p>
      </div>
    );
  }
  return <LaboPgcd data={resultat.data} />;
}
