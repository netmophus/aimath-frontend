"use client";

import type { CSSProperties, ReactNode } from "react";

import { Formule } from "@/components/accueil/commun";

/** Pseudo-aléatoire déterministe (même résultat côté serveur et navigateur) : position stable d'une particule i. */
export const alea = (i: number, k: number): number => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Variables CSS (--ax, --duree…) passées en style à une particule animée (voir app/globals.css). */
export const variables = (o: Record<string, string>): CSSProperties => o as CSSProperties;

export const virgule = (x: number, d = 1): string => x.toFixed(d).replace(".", ",");

/**
 * Mise en page commune d'un onglet du laboratoire : encart « Le concept », formules (KaTeX), puis la simulation.
 * Les formules sont écrites en LaTeX (\mathrm pour les espèces chimiques et les unités) et rendues par KaTeX.
 */
export function OngletLabo({ concept, formules, children }: { concept: ReactNode; formules: string[]; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border-l-4 border-fh-orange bg-fh-accent/60 p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-fh-orange-fonce">Le concept</p>
        <p className="mt-1.5 text-sm leading-relaxed text-fh-ardoise sm:text-base">{concept}</p>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-xl border border-fh-sable bg-white px-4 py-2 text-fh-bleu sm:text-lg [&_.katex-display]:!my-1.5">
        {formules.map((tex) => (
          <div key={tex} className="max-w-full">
            <Formule tex={tex} bloc />
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}

/** Zone blanche encadrée qui porte un schéma. */
export function Planche({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-xl border border-fh-sable bg-white p-2 sm:p-3 ${className}`}>{children}</div>;
}

/** Bouton d'action (même gabarit que la vitrine d'accueil). */
export function Bouton({ onClick, children, principal = false }: { onClick: () => void; children: ReactNode; principal?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors motion-reduce:transition-none ${
        principal ? "bg-fh-orange text-white hover:bg-fh-orange-fonce" : "border border-fh-bleu/40 text-fh-bleu hover:bg-fh-bleu/5"
      }`}
    >
      {children}
    </button>
  );
}

/** Choix exclusif (boutons radio visuels). */
export function Choix<K extends string>({ nom, options, valeur, onChoisir }: { nom: string; options: Array<{ cle: K; libelle: ReactNode; aria?: string }>; valeur: K; onChoisir: (k: K) => void }) {
  return (
    <div role="radiogroup" aria-label={nom} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.cle}
          type="button"
          role="radio"
          aria-checked={o.cle === valeur}
          aria-label={o.aria}
          onClick={() => onChoisir(o.cle)}
          className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none [&_.katex]:text-[1.1em] ${
            o.cle === valeur ? "border-fh-orange bg-fh-orange text-white" : "border-fh-bleu/30 bg-white text-fh-bleu hover:bg-fh-bleu/5"
          }`}
        >
          {o.libelle}
        </button>
      ))}
    </div>
  );
}

/** Couleurs vives et nettes réutilisées par plusieurs simulations. */
export const COULEURS = {
  oxonium: "#d14205", // H₃O⁺, cations : orange fh
  hydroxyde: "#1f2ca2", // OH⁻, anions : bleu vif fh
  eau: "#38bdf8",
  acide: "#dc2626",
  base: "#2563eb",
  neutre: "#16a34a",
  gris: "#64748b",
} as const;
