"use client";

import { useContext, type CSSProperties, type ReactNode } from "react";

import { Formule } from "@/components/accueil/commun";
import { StyleLaboModerne } from "./styleLabo";

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
  const moderne = useContext(StyleLaboModerne);
  if (moderne) {
    // Habillage bleu-violet (page d'accueil) : encart « Le concept » violet très clair, équations en bande horizontale.
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 rounded-2xl border border-violet-200 bg-violet-50/70 p-4 sm:gap-4 sm:p-5">
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-violet-900 sm:text-base">Le concept</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700 sm:text-base">{concept}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-0 rounded-2xl border border-indigo-100 bg-white px-4 py-2 text-fh-bleu shadow-sm sm:text-lg [&_.katex-display]:!my-1.5">
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
  const moderne = useContext(StyleLaboModerne);
  if (moderne) return <div className={`min-w-0 rounded-2xl border border-indigo-100 bg-white p-2 shadow-sm sm:p-3 ${className}`}>{children}</div>;
  return <div className={`min-w-0 rounded-xl border border-fh-sable bg-white p-2 sm:p-3 ${className}`}>{children}</div>;
}

/** Bouton d'action (même gabarit que la vitrine d'accueil). */
export function Bouton({ onClick, children, principal = false }: { onClick: () => void; children: ReactNode; principal?: boolean }) {
  const moderne = useContext(StyleLaboModerne);
  if (moderne) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500 motion-reduce:transition-none ${
          principal ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700" : "border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50"
        }`}
      >
        {children}
      </button>
    );
  }
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
  const moderne = useContext(StyleLaboModerne);
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
            moderne
              ? o.cle === valeur
                ? "border-violet-600 bg-violet-600 text-white shadow-sm"
                : "border-indigo-200 bg-white text-indigo-800 hover:bg-indigo-50"
              : o.cle === valeur
                ? "border-fh-orange bg-fh-orange text-white"
                : "border-fh-bleu/30 bg-white text-fh-bleu hover:bg-fh-bleu/5"
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
