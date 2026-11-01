"use client";

import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

export interface OngletChimie {
  id: string;
  label: string;
  icone: ReactNode;
}

interface Teinte { de: string; vers: string; bordure: string }
/** Une couleur franche par onglet, visible en permanence (actif ou non). */
const TEINTES: Record<string, Teinte> = {
  titrage: { de: "#9333EA", vers: "#5B21B6", bordure: "#C4B5FD" },
  ph: { de: "#F97316", vers: "#EA580C", bordure: "#FDBA74" },
  predominance: { de: "#8B5CF6", vers: "#6D28D9", bordure: "#C4B5FD" },
  avancement: { de: "#22C55E", vers: "#15803D", bordure: "#86EFAC" },
  dilution: { de: "#06B6D4", vers: "#0284C7", bordure: "#67E8F9" },
  gaz: { de: "#A855F7", vers: "#6D28D9", bordure: "#D8B4FE" },
  conductivite: { de: "#F59E0B", vers: "#D97706", bordure: "#FCD34D" },
};
const TEINTE_DEFAUT: Teinte = TEINTES.titrage;

interface Props {
  onglets: OngletChimie[];
  actif: number;
  onChoisir: (indice: number) => void;
  ariaLabel: string;
  idOnglet: (id: string) => string;
  idPanneau: (id: string) => string;
}

/**
 * Onglets du laboratoire de chimie de l'accueil : sept cartes horizontales (3 par ligne sur mobile, 4 sur tablette,
 * 7 sur ordinateur : jamais de défilement horizontal). Toutes les cartes sont colorées en permanence ; l'onglet actif
 * se reconnaît à sa bordure blanche, son ombre renforcée et un petit triangle dessous. Même sémantique ARIA et même clavier (←/→/Début/Fin) que `components/ui/OngletsCartes.tsx`,
 * qui reste inchangé pour les cours.
 */
export default function OngletsChimie({ onglets, actif, onChoisir, ariaLabel, idOnglet, idPanneau }: Props) {
  const boutons = useRef<(HTMLButtonElement | null)[]>([]);

  function aller(i: number) {
    const n = (i + onglets.length) % onglets.length;
    onChoisir(n);
    boutons.current[n]?.focus();
  }
  function touche(e: KeyboardEvent<HTMLDivElement>) {
    const courant = Math.max(0, boutons.current.indexOf(e.target as HTMLButtonElement));
    if (e.key === "ArrowRight") { e.preventDefault(); aller(courant + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); aller(courant - 1); }
    else if (e.key === "Home") { e.preventDefault(); aller(0); }
    else if (e.key === "End") { e.preventDefault(); aller(onglets.length - 1); }
  }

  return (
    <div role="tablist" aria-label={ariaLabel} onKeyDown={touche} className="mb-5 flex flex-wrap justify-center gap-x-2 gap-y-3 sm:mb-6">
      {onglets.map((o, i) => {
        const estActif = i === actif;
        const t = TEINTES[o.id] ?? TEINTE_DEFAUT;
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
            style={{ backgroundImage: `linear-gradient(135deg, ${t.de}, ${t.vers})`, "--dg-vers": t.vers, "--dg-bord": t.bordure } as CSSProperties}
            className={`group relative flex min-h-[84px] w-[calc((100%-1rem)/3)] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-1.5 py-2.5 text-center text-white transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-6px_color-mix(in_srgb,var(--dg-vers)_70%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-800 motion-reduce:transition-none motion-reduce:hover:transform-none sm:w-[calc((100%-1.5rem)/4)] lg:w-[calc((100%-3rem)/7)] ${
              estActif
                ? "-translate-y-0.5 border-white shadow-[0_0_0_1px_var(--dg-vers),0_10px_22px_-6px_color-mix(in_srgb,var(--dg-vers)_75%,transparent)]"
                : "border-[var(--dg-bord)] shadow-[0_4px_10px_-6px_color-mix(in_srgb,var(--dg-vers)_60%,transparent)]"
            }`}
          >
            <span aria-hidden="true" className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-white/20 px-1.5 text-[15px] font-bold leading-none text-white [font-variant-emoji:text]">
              {o.icone}
            </span>
            <span className="text-[12.5px] font-bold leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">{o.label}</span>
            {/* indicateur triangulaire sous la carte active */}
            {estActif && <span aria-hidden="true" className="absolute -bottom-[11px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[10px] border-x-transparent border-t-[var(--dg-vers)]" />}
          </button>
        );
      })}
    </div>
  );
}
