"use client";

import { useState } from "react";

import RenduMarkdown from "@/components/RenduMarkdown";

interface CarteCorrigeExamenProps {
  contenu: string;
  onTermeClick?: (slug: string) => void;
}

/**
 * Carte "Corrigé" du sujet type examen — même carte que CarteSection
 * (habillage identique), mais avec son contenu flouté par défaut, comme le
 * corrigé d'un exercice (voir CarteExercice.tsx, même mécanisme copié tel
 * quel). Pédagogique, pas une protection de sécurité : le corrigé est déjà
 * dans le DOM, juste caché visuellement tant qu'on n'a pas cliqué.
 */
export default function CarteCorrigeExamen({ contenu, onTermeClick }: CarteCorrigeExamenProps) {
  const [revele, setRevele] = useState(false);

  return (
    <div className="rounded-2xl border border-fh-sable bg-white p-5 shadow-[0_4px_20px_-6px_rgba(30,43,106,0.10)] sm:p-6">
      <p className="text-base font-bold text-fh-bleu">Corrigé</p>

      <div className="my-4 h-px bg-fh-sable/70" aria-hidden="true" />

      <div className="relative overflow-hidden rounded-xl">
        <div
          aria-hidden={!revele}
          className={`transition-all duration-300 ${revele ? "" : "pointer-events-none select-none blur-md"}`}
        >
          <RenduMarkdown contenu={contenu} onTermeClick={onTermeClick} />
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
  );
}
