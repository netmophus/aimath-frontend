"use client";

import type { ReactNode } from "react";

/** Pictogramme de laboratoire (fiole d'Erlenmeyer), tracé en SVG. */
export function IconeFiole({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`${className} fill-none stroke-current stroke-2`} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v6l-5.2 9.1A2 2 0 0 0 6.5 21h11a2 2 0 0 0 1.7-2.9L14 9V3" />
      <path d="M7.5 15h9" />
    </svg>
  );
}

/**
 * En-tête d'une simulation de chimie (page d'accueil) : bande légèrement dégradée bleu-violet, icône de laboratoire,
 * titre et, quand il existe, sous-titre.
 */
export function EnteteChimie({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  return (
    <header className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-violet-50 to-white p-4 sm:gap-4 sm:p-5">
      <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-sm">
        <IconeFiole className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h3 className="text-xl font-bold tracking-tight text-fh-bleu sm:text-2xl">{titre}</h3>
        {sousTitre && <p className="mt-0.5 text-sm leading-relaxed text-slate-600 sm:text-base">{sousTitre}</p>}
      </div>
    </header>
  );
}

export type TonCarte = "bleu" | "violet" | "rose" | "vert" | "neutre";
const TONS: Record<TonCarte, string> = {
  bleu: "border-blue-200 bg-blue-50/70",
  violet: "border-violet-200 bg-violet-50/70",
  rose: "border-rose-200 bg-rose-50/70",
  vert: "border-emerald-200 bg-emerald-50/70",
  neutre: "border-indigo-100 bg-white",
};

/** Carte de résultat compacte (étiquette + valeur bien visible), à placer dans un `<dl>`. */
export function CarteResultat({ etiquette, ton = "neutre", children }: { etiquette: ReactNode; ton?: TonCarte; children: ReactNode }) {
  return (
    <div className={`min-w-0 rounded-xl border px-3.5 py-2.5 shadow-sm ${TONS[ton]}`}>
      <dt className="text-xs font-semibold text-slate-500">{etiquette}</dt>
      <dd className="mt-0.5 break-words text-lg font-bold leading-snug text-fh-bleu">{children}</dd>
    </div>
  );
}

type TonMessage = "ambre" | "vert" | "bleu";
const TONS_MESSAGE: Record<TonMessage, { cadre: string; icone: string }> = {
  ambre: { cadre: "border-amber-200 bg-amber-50 text-amber-950", icone: "bg-amber-500" },
  vert: { cadre: "border-emerald-200 bg-emerald-50 text-emerald-950", icone: "bg-emerald-600" },
  bleu: { cadre: "border-blue-200 bg-blue-50 text-blue-950", icone: "bg-blue-600" },
};

/** Message pédagogique coloré avec icône : la couleur suit l'état réellement calculé (avant / à / après l'équivalence). */
export function MessageChimie({ ton, children }: { ton: TonMessage; children: ReactNode }) {
  const t = TONS_MESSAGE[ton];
  return (
    <div role="status" aria-live="polite" className={`flex items-start gap-3 rounded-2xl border p-3.5 text-sm leading-relaxed sm:text-base ${t.cadre}`}>
      <span aria-hidden="true" className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.icone}`}>
        i
      </span>
      <p>{children}</p>
    </div>
  );
}
