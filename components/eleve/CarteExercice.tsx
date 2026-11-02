"use client";

import { useState } from "react";
import { IconCircleCheck, IconEye, IconEyeOff } from "@tabler/icons-react";

import RenduMarkdown from "@/components/RenduMarkdown";
import type { ExerciceEleve } from "@/lib/eleveApi";
import BadgeDifficulte from "./BadgeDifficulte";
import { melange, NAVY } from "./teintesLecon";

interface CarteExerciceProps {
  exercice: ExerciceEleve;
  numero: number;
  onTermeClick?: (slug: string) => void;
}

const ORANGE = "#C2410C";
const VERT = "#15803D";

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
    <section
      className="overflow-hidden rounded-3xl border-2 bg-white shadow-[0_6px_24px_-10px_rgba(16,42,102,0.18)]"
      style={{ borderColor: melange(ORANGE, 35) }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4"
        style={{ backgroundColor: melange(ORANGE, 9) }}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold text-white sm:h-12 sm:w-12 sm:text-xl"
            style={{ backgroundColor: ORANGE }}
          >
            {numero}
          </span>
          <p className="text-lg font-extrabold sm:text-xl" style={{ color: NAVY }}>
            Exercice {numero}
          </p>
        </div>
        <BadgeDifficulte difficulte={exercice.difficulte} />
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <RenduMarkdown contenu={exercice.enonce} onTermeClick={onTermeClick} />

        {aCorrige && (
          <div
            className="mt-5 rounded-2xl border-2 p-3 sm:p-4"
            style={{ backgroundColor: melange(VERT, 6), borderColor: melange(VERT, 35) }}
          >
            <p className="mb-2 flex items-center gap-2 text-base font-extrabold" style={{ color: NAVY }}>
              <IconCircleCheck size={22} stroke={2} aria-hidden="true" style={{ color: VERT }} />
              Corrigé
            </p>
            <div className={`relative overflow-hidden rounded-xl ${revele ? "" : "min-h-[84px]"}`}>
              <div
                aria-hidden={!revele}
                className={`transition-all duration-300 motion-reduce:transition-none ${
                  revele ? "" : "pointer-events-none select-none blur-md"
                }`}
              >
                <RenduMarkdown contenu={exercice.corrige} onTermeClick={onTermeClick} />
              </div>
              {!revele && (
                <button
                  type="button"
                  onClick={() => setRevele(true)}
                  className="absolute inset-0 flex min-h-11 items-center justify-center bg-white/70 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-[#102A66]"
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#C2410C] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#9A3412]">
                    <IconEye size={20} stroke={2} aria-hidden="true" />
                    Voir le corrigé
                  </span>
                </button>
              )}
            </div>
            {revele && (
              <button
                type="button"
                onClick={() => setRevele(false)}
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-slate-700 underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66]"
              >
                <IconEyeOff size={18} stroke={2} aria-hidden="true" />
                Masquer le corrigé
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
