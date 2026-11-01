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
  /** Optionnel : carte entièrement colorée en permanence (dégradé de → vers, bordure claire). Absent : style clair par défaut. */
  degrade?: { de: string; vers: string; bordure: string };
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
        const dg = o.degrade;
        if (dg) {
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
              style={{ "--c": o.couleur, "--c-soft": o.couleurSoft, "--dg-de": dg.de, "--dg-vers": dg.vers, "--dg-bord": dg.bordure, backgroundImage: `linear-gradient(135deg, ${dg.de}, ${dg.vers})` } as CSSProperties}
              className={`relative flex min-h-[88px] flex-col items-center justify-start gap-1.5 rounded-[14px] border-2 px-2 py-2.5 text-center text-white transition duration-150 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-6px_color-mix(in_srgb,var(--dg-vers)_70%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fh-bleu motion-reduce:transition-none motion-reduce:hover:transform-none ${
                estActif
                  ? "-translate-y-0.5 border-white shadow-[0_0_0_1px_var(--dg-vers),0_10px_22px_-6px_color-mix(in_srgb,var(--dg-vers)_75%,transparent)]"
                  : "border-[var(--dg-bord)] shadow-[0_4px_10px_-6px_color-mix(in_srgb,var(--dg-vers)_60%,transparent)]"
              }`}
            >
              <span aria-hidden="true" className="flex h-9 min-w-9 items-center justify-center rounded-[10px] bg-white/20 px-1.5 text-[17px] font-bold leading-none text-white [font-variant-emoji:text]">
                {o.icone}
              </span>
              <span className="text-sm font-bold leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">{o.label}</span>
              {estActif && (
                <span aria-hidden="true" className="absolute -bottom-[11px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[10px] border-t-[10px] border-x-transparent border-t-[var(--dg-vers)]" />
              )}
            </button>
          );
        }
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
