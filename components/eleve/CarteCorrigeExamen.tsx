"use client";

import { useState } from "react";
import { IconCircleCheck, IconEye, IconEyeOff } from "@tabler/icons-react";

import RenduMarkdown from "@/components/RenduMarkdown";
import { melange, NAVY } from "./teintesLecon";

interface CarteCorrigeExamenProps {
  contenu: string;
  onTermeClick?: (slug: string) => void;
}

const VERT = "#15803D";

/**
 * Carte "Corrigé" du sujet type examen — même habillage que CarteSection (rubrique
 * Examen, verte), avec son contenu flouté par défaut, comme le corrigé d'un
 * exercice (voir CarteExercice.tsx, même mécanisme). Pédagogique, pas une
 * protection de sécurité : le corrigé est déjà dans le DOM, juste caché
 * visuellement tant qu'on n'a pas cliqué.
 */
export default function CarteCorrigeExamen({ contenu, onTermeClick }: CarteCorrigeExamenProps) {
  const [revele, setRevele] = useState(false);

  return (
    <section
      className="overflow-hidden rounded-3xl border-2 bg-white shadow-[0_6px_24px_-10px_rgba(16,42,102,0.18)]"
      style={{ borderColor: melange(VERT, 35) }}
    >
      <div className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4" style={{ backgroundColor: melange(VERT, 9) }}>
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white sm:h-12 sm:w-12"
          style={{ backgroundColor: VERT }}
        >
          <IconCircleCheck size={26} stroke={1.9} />
        </span>
        <p className="text-lg font-extrabold sm:text-xl" style={{ color: NAVY }}>
          Corrigé
        </p>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-5">
        <div className={`relative overflow-hidden rounded-xl ${revele ? "" : "min-h-[84px]"}`}>
          <div
            aria-hidden={!revele}
            className={`transition-all duration-300 motion-reduce:transition-none ${
              revele ? "" : "pointer-events-none select-none blur-md"
            }`}
          >
            <RenduMarkdown contenu={contenu} onTermeClick={onTermeClick} />
          </div>
          {!revele && (
            <button
              type="button"
              onClick={() => setRevele(true)}
              className="absolute inset-0 flex min-h-11 items-center justify-center bg-white/70 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-[#102A66]"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-[#15803D] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#166534]">
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
    </section>
  );
}
