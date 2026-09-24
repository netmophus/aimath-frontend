"use client";

import { useState } from "react";
import { IconChevronDown, IconClock } from "@tabler/icons-react";
import type { ThemeStatique } from "@/lib/programmeCollegeStatique";

interface AccordeonThemesProps {
  themes: readonly ThemeStatique[];
}

/**
 * Liste hiérarchique dépliable : un thème (titre + volume horaire) révèle
 * ses chapitres au clic. Premier thème ouvert par défaut (le plus probable
 * à intéresser un visiteur qui découvre juste la page), les autres fermés
 * pour ne pas noyer la page sous 7 thèmes développés d'un coup.
 */
export default function AccordeonThemes({ themes }: AccordeonThemesProps) {
  const [themeOuvert, setThemeOuvert] = useState<number | null>(0);

  return (
    <ol className="flex flex-col gap-3">
      {themes.map((theme, index) => {
        const estOuvert = themeOuvert === index;

        return (
          <li key={theme.titre} className="overflow-hidden rounded-2xl bg-white ring-1 ring-fh-sable">
            <button
              type="button"
              onClick={() => setThemeOuvert(estOuvert ? null : index)}
              aria-expanded={estOuvert}
              aria-controls={`theme-panel-${index}`}
              className="flex w-full min-w-0 items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-fh-sable/30"
            >
              <span className="flex min-w-0 flex-1 items-baseline gap-2">
                <span className="shrink-0 text-sm font-semibold text-fh-orange">{index + 1}.</span>
                <span className="min-w-0 flex-1 truncate font-semibold text-fh-bleu">{theme.titre}</span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-fh-ardoise/70">
                  <IconClock size={14} stroke={1.75} aria-hidden="true" />
                  {theme.volumeHoraire} h
                </span>
                <IconChevronDown
                  size={18}
                  stroke={1.75}
                  aria-hidden="true"
                  className={`text-fh-bleu transition-transform duration-200 ${estOuvert ? "rotate-180" : ""}`}
                />
              </span>
            </button>

            {estOuvert && (
              <div id={`theme-panel-${index}`} className="border-t border-fh-sable px-5 py-4">
                <ul className="flex flex-col gap-3">
                  {theme.chapitres.map((chapitre) => (
                    <li key={chapitre.titre} className="rounded-xl bg-fh-creme px-4 py-3">
                      <p className="text-sm font-semibold text-fh-bleu">{chapitre.titre}</p>
                      <p className="mt-0.5 text-sm text-fh-ardoise">{chapitre.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
