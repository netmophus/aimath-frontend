"use client";

import { useRef, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";

export interface OngletMaths {
  id: string;
  label: string;
  icone: ReactNode;
}

interface Props {
  onglets: OngletMaths[];
  actif: number;
  onChoisir: (indice: number) => void;
  ariaLabel: string;
  /** Titre affiché en tête de la barre. */
  titre: string;
  idOnglet: (id: string) => string;
  idPanneau: (id: string) => string;
}

const REQUETE_LATERALE = "(min-width: 1024px)";
const abonner = (rappel: () => void) => {
  const m = window.matchMedia(REQUETE_LATERALE);
  m.addEventListener("change", rappel);
  return () => m.removeEventListener("change", rappel);
};
/** Barre latérale (verticale) à partir de 1024 px ; en dessous, navigation compacte en grille. */
const useLateral = (): boolean =>
  useSyncExternalStore(
    abonner,
    () => window.matchMedia(REQUETE_LATERALE).matches,
    () => false,
  );

/**
 * Navigation du laboratoire de maths : barre latérale verticale (dégradé bleu marine → violet) sur ordinateur,
 * grille compacte (2 colonnes sur mobile, 3 sur tablette) en dessous, à partir des mêmes éléments : jamais de
 * défilement horizontal. Même sémantique ARIA (tablist / tab) et même clavier que `components/ui/OngletsCartes.tsx`
 * (qui reste inchangé pour la chimie, la physique et la SVT) : flèches, Début, Fin ; en barre verticale, ↑/↓ aussi.
 */
export default function OngletsMaths({ onglets, actif, onChoisir, ariaLabel, titre, idOnglet, idPanneau }: Props) {
  const boutons = useRef<(HTMLButtonElement | null)[]>([]);
  const lateral = useLateral();

  function aller(i: number) {
    const n = (i + onglets.length) % onglets.length;
    onChoisir(n);
    boutons.current[n]?.focus();
  }
  function touche(e: KeyboardEvent<HTMLDivElement>) {
    const courant = Math.max(0, boutons.current.indexOf(e.target as HTMLButtonElement));
    const suivant = e.key === "ArrowRight" || e.key === "ArrowDown";
    const precedent = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (suivant) { e.preventDefault(); aller(courant + 1); }
    else if (precedent) { e.preventDefault(); aller(courant - 1); }
    else if (e.key === "Home") { e.preventDefault(); aller(0); }
    else if (e.key === "End") { e.preventDefault(); aller(onglets.length - 1); }
  }

  return (
    <nav
      className="rounded-3xl bg-gradient-to-b from-fh-bleu-charbon via-indigo-900 to-violet-800 p-3 shadow-[0_14px_34px_-14px_rgba(30,27,75,0.6)] sm:p-4 lg:sticky lg:top-20"
      aria-label="Navigation des simulations mathématiques"
    >
      <p className="mb-3 px-1 text-sm font-bold tracking-wide text-violet-100">{titre}</p>
      <div
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation={lateral ? "vertical" : "horizontal"}
        onKeyDown={touche}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1"
      >
        {onglets.map((o, i) => {
          const estActif = i === actif;
          return (
            <button
              key={o.id}
              ref={(el) => { boutons.current[i] = el; }}
              type="button"
              role="tab"
              id={idOnglet(o.id)}
              aria-selected={estActif}
              aria-controls={idPanneau(o.id)}
              tabIndex={estActif ? 0 : -1}
              onClick={() => onChoisir(i)}
              className={`group relative flex min-h-14 items-center gap-2.5 rounded-2xl border py-2 pl-3.5 pr-2.5 text-left transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none ${
                estActif
                  ? "border-white/70 bg-gradient-to-r from-violet-500 to-indigo-500 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.5)]"
                  : "border-white/15 bg-white/10 hover:border-white/35 hover:bg-white/20"
              }`}
            >
              {/* indicateur de sélection */}
              <span aria-hidden="true" className={`absolute inset-y-2.5 left-1 w-1 rounded-full bg-white transition-opacity motion-reduce:transition-none ${estActif ? "opacity-100" : "opacity-0"}`} />
              <span
                aria-hidden="true"
                className={`flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl px-1.5 text-sm font-bold leading-none [font-variant-emoji:text] ${
                  estActif ? "bg-white text-indigo-700" : "bg-white/90 text-indigo-800"
                }`}
              >
                {o.icone}
              </span>
              <span className={`min-w-0 text-[13px] font-semibold leading-tight sm:text-sm ${estActif ? "text-white" : "text-white/90"}`}>{o.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
