"use client";

import { useState } from "react";

import RenduMarkdown from "@/components/RenduMarkdown";
import type { ExerciceEleve } from "@/lib/eleveApi";
import BadgeDifficulte from "./BadgeDifficulte";

interface CarteExerciceProps {
  exercice: ExerciceEleve;
  numero: number;
  onTermeClick?: (slug: string) => void;
}

/**
 * Carte d'exercice : énoncé toujours visible, corrigé flouté par défaut.
 * Le flou n'est PAS une protection de sécurité (le corrigé est déjà dans le
 * DOM) — seulement pédagogique, pour éviter de le lire par réflexe avant
 * d'avoir cherché. Chaque carte gère son propre état, indépendamment des
 * autres exercices.
 */
export default function CarteExercice({ exercice, numero, onTermeClick }: CarteExerciceProps) {
  const [revele, setRevele] = useState(false);
  const aCorrige = exercice.corrige.trim().length > 0;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-fh-bleu">Exercice {numero}</p>
        <BadgeDifficulte difficulte={exercice.difficulte} />
      </div>

      <div className="mt-3">
        <RenduMarkdown contenu={exercice.enonce} onTermeClick={onTermeClick} />
      </div>

      {aCorrige && (
        <div className="mt-4 border-t border-fh-sable pt-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-fh-ardoise/60">Corrigé</p>
          <div className="relative overflow-hidden rounded-xl">
            <div
              aria-hidden={!revele}
              className={`transition-all duration-300 ${
                revele ? "" : "pointer-events-none select-none blur-md"
              }`}
            >
              <RenduMarkdown contenu={exercice.corrige} onTermeClick={onTermeClick} />
            </div>
            {!revele && (
              <button
                type="button"
                onClick={() => setRevele(true)}
                className="absolute inset-0 flex min-h-11 items-center justify-center bg-white/70"
              >
                <span className="rounded-full bg-fh-bleu px-5 py-2.5 text-sm font-semibold text-white">
                  Voir le corrigé
                </span>
              </button>
            )}
          </div>
          {revele && (
            <button
              type="button"
              onClick={() => setRevele(false)}
              className="mt-2 min-h-11 text-xs font-medium text-fh-ardoise/60 underline"
            >
              Masquer le corrigé
            </button>
          )}
        </div>
      )}
    </div>
  );
}
