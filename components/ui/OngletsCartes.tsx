"use client";

import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

export interface OngletCarte {
  id: string;
  label: string;
  /** Symbole texte (lettre, Unicode mathématique, formule courte) ou petit SVG inline : jamais d'émoticône. */
  icone: ReactNode;
  /** Couleur vive de l'onglet (--c) et sa version très claire (--c-soft, fond de la page de l'onglet). */
  couleur: string;
  couleurSoft: string;
}

interface OngletsCartesProps {
  onglets: OngletCarte[];
  /** Indice de l'onglet actif. */
  actif: number;
  onChoisir: (indice: number) => void;
  ariaLabel: string;
  idOnglet: (id: string) => string;
  idPanneau: (id: string) => string;
}

/**
 * Onglets en « cartes avec icônes » (labos de maths, chimie, physique et SVT) : grille adaptative, une carte par onglet
 * (pastille d'icône + libellé court). Gère la sémantique ARIA et le clavier (←/→/Home/End) ; le contenu affiché reste
 * à la charge de l'appelant.
 */
export default function OngletsCartes({ onglets, actif, onChoisir, ariaLabel, idOnglet, idPanneau }: OngletsCartesProps) {
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
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={touche}
      className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-[9px] [contain:inline-size]" // largeur intrinsèque nulle : la grille suit la largeur du parent, elle ne l'élargit jamais
      style={{ maxWidth: `${onglets.length * 176}px` }} // peu d'onglets : cartes de largeur raisonnable, pas étirées sur toute la ligne
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
            style={{ "--c": o.couleur, "--c-soft": o.couleurSoft } as CSSProperties}
            className={`group flex min-h-[88px] flex-col items-center justify-start gap-1.5 rounded-[14px] border px-2 py-2.5 text-center transition duration-150 motion-reduce:transition-none motion-reduce:hover:transform-none ${
              estActif
                ? "border-[var(--c)] bg-[var(--c-soft)] shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--c)_45%,transparent)]"
                : "border-fh-sable bg-white hover:-translate-y-0.5 hover:border-[var(--c)]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-9 w-9 items-center justify-center rounded-[10px] text-[15px] font-bold leading-none [font-variant-emoji:text] ${
                estActif ? "bg-[var(--c)] text-white" : "bg-[var(--c-soft)] text-[var(--c)]"
              }`}
            >
              {o.icone}
            </span>
            <span className={`text-[11.5px] font-bold leading-tight ${estActif ? "text-[var(--c)]" : "text-fh-ardoise"}`}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Zone de contenu sous les onglets : prend la teinte claire (--c-soft) de l'onglet actif, avec une transition douce ;
 * les titres h3 de l'onglet prennent sa couleur vive (--c).
 */
export function PanneauOnglets({ onglet, children }: { onglet: Pick<OngletCarte, "couleur" | "couleurSoft">; children: ReactNode }) {
  return (
    <div
      style={{ "--c": onglet.couleur, "--c-soft": onglet.couleurSoft } as CSSProperties}
      className="rounded-xl bg-[var(--c-soft)] p-2 transition-colors duration-300 motion-reduce:transition-none sm:p-4 [&_h3]:text-[var(--c)]!"
    >
      {children}
    </div>
  );
}
