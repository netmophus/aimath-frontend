"use client";

import { useId, type ReactNode } from "react";

import type { Facteurs } from "@/lib/premiers";

/** Éléments d'interface du Laboratoire des nombres premiers : on réutilise ceux du laboratoire PGCD & PPCM. */
export { Tex, Zone, TroisQuestions, Message, Bouton, Commandes, Onglets, borner, par, type OngletDef } from "@/components/labo-pgcd/ui";

/** Nombre entier en TeX avec espaces fines pour les milliers : 176400 devient 176\,400. */
export function texNombre(n: number | bigint): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
}

/** Décomposition en TeX : 2^{3} \times 3^{2} \times 5 (le nombre 1 s'écrit « 1 »). */
export function texFacteurs(f: Facteurs): string {
  if (f.length === 0) return "1";
  return f.map(({ p, e }) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join(" \\times ");
}

/** Bandeau « Ce que tu vas comprendre » en haut de chaque simulation. */
export function Intro({ couleur, children }: { couleur: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col gap-1 rounded-xl border-l-4 px-4 py-3 ${couleur}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-fh-bleu">Ce que tu vas comprendre</p>
      <div className="text-sm leading-relaxed text-fh-ardoise">{children}</div>
    </div>
  );
}

/** Petit défi pour vérifier la compréhension. */
export function Defi({ titre = "Défi", children }: { titre?: string; children: ReactNode }) {
  return (
    <section aria-label={titre} className="flex min-w-0 flex-col gap-2 rounded-xl border border-violet-300 bg-violet-50 p-4">
      <h4 className="text-sm font-bold uppercase tracking-wide text-violet-800">{titre}</h4>
      {children}
    </section>
  );
}

/** Conclusion pédagogique. */
export function Conclusion({ children }: { children: ReactNode }) {
  return (
    <section aria-label="Conclusion" className="flex min-w-0 flex-col gap-1 rounded-xl border border-emerald-300 bg-emerald-50 p-4">
      <h4 className="text-sm font-bold uppercase tracking-wide text-emerald-800">À retenir</h4>
      <div className="text-sm leading-relaxed text-fh-ardoise">{children}</div>
    </section>
  );
}

/** Bouton d'exemple prédéfini (état « choisi » visible et annoncé). */
export function Pastille({ actif, onClick, children, desactive }: { actif?: boolean; onClick: () => void; children: ReactNode; desactive?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desactive}
      aria-pressed={actif}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fh-bleu-vif ${
        actif ? "border-fh-bleu-vif bg-fh-bleu-vif text-white" : "border-fh-bleu-vif/40 bg-white text-fh-bleu-vif hover:bg-fh-bleu-vif/10"
      }`}
    >
      {children}
    </button>
  );
}

/** Champ de saisie d'un nombre : libellé associé, message d'erreur lié par aria-describedby. */
export function ChampNombre({
  etiquette,
  valeur,
  onChange,
  erreur,
  aide,
}: {
  etiquette: string;
  valeur: string;
  onChange: (texte: string) => void;
  erreur: string | null;
  aide?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-[8rem] flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-fh-ardoise/80">
        {etiquette}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={erreur !== null}
        aria-describedby={erreur ? `${id}-err` : aide ? `${id}-aide` : undefined}
        className={`min-h-11 w-full rounded-lg border bg-white px-3 text-base text-fh-bleu outline-none focus:border-fh-bleu-vif focus:ring-2 focus:ring-fh-bleu-vif/20 ${
          erreur ? "border-red-400" : "border-fh-sable"
        }`}
      />
      {erreur ? (
        <span id={`${id}-err`} className="text-xs text-red-700">
          {erreur}
        </span>
      ) : aide ? (
        <span id={`${id}-aide`} className="text-xs text-fh-ardoise/60">
          {aide}
        </span>
      ) : null}
    </div>
  );
}

/** Stepper − / valeur / + pour un exposant, avec libellé accessible. */
export function Stepper({
  etiquette,
  valeur,
  min,
  max,
  onChange,
}: {
  etiquette: string;
  valeur: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-fh-bleu-vif/40 bg-white text-lg font-bold text-fh-bleu-vif hover:bg-fh-bleu-vif/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fh-bleu-vif";
  return (
    <div className="flex items-center gap-1" role="group" aria-label={etiquette}>
      <button type="button" className={btn} onClick={() => onChange(valeur - 1)} disabled={valeur <= min} aria-label={`Diminuer : ${etiquette}`}>
        −
      </button>
      <span className="min-w-8 text-center text-base font-bold text-fh-bleu" aria-live="polite">
        {valeur}
      </span>
      <button type="button" className={btn} onClick={() => onChange(valeur + 1)} disabled={valeur >= max} aria-label={`Augmenter : ${etiquette}`}>
        +
      </button>
    </div>
  );
}
