"use client";

import { useId, useState, type ReactNode } from "react";

import { Formule } from "./commun";

/** Pictogrammes des six onglets (partagés par la barre d'onglets et l'en-tête de chaque simulation). */
export const ICONES_MATHS = {
  fonctions: "ƒ",
  suites: "uₙ",
  complexes: "ℂ",
  trigo: "△",
  integrale: "∫",
  limites: "∞",
} as const;

/** Pastille d'icône mathématique (bleu-violet). */
export function PastilleIcone({ children, grande = false }: { children: ReactNode; grande?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-bold leading-none text-white shadow-sm [font-variant-emoji:text] ${grande ? "h-12 w-12 text-xl" : "h-10 w-10 text-lg"}`}
    >
      {children}
    </span>
  );
}

/**
 * Cadre moderne des six simulations de mathématiques de l'accueil. Il remplace `CadreSimulation` UNIQUEMENT pour ces
 * six onglets : `CadreSimulation` (commun.tsx) reste tel quel pour les laboratoires de physique et de SVT.
 *
 * Un seul grand conteneur blanc : en-tête (icône, titre, explication, formule, action « Réinitialiser »), puis sur
 * ordinateur le graphique à gauche (≈ 65 %) et paramètres + résultats à droite (≈ 35 %), puis les explications en
 * dessous. Sur mobile : graphique, paramètres, résultats, explications.
 */
export function CadreSimulationMaths({
  icone,
  titre,
  description,
  formule,
  action,
  graphique,
  commandes,
  valeurs,
  commentaire,
  bas,
}: {
  icone: ReactNode;
  titre: string;
  description: string;
  formule: ReactNode;
  /** Bouton de réinitialisation (ou équivalent) affiché à droite de l'en-tête. */
  action?: ReactNode;
  graphique: ReactNode;
  commandes: ReactNode;
  valeurs: ReactNode;
  commentaire: ReactNode;
  /** Contenu pleine largeur sous le graphique et le panneau (étude, démonstration…). */
  bas?: ReactNode;
}) {
  return (
    <article className="@container overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/40 shadow-[0_10px_30px_-12px_rgba(30,43,106,0.18)]">
      <header className="flex flex-col gap-3 border-b border-indigo-100/70 p-4 @2xl:flex-row @2xl:items-start @2xl:justify-between sm:p-6">
        <div className="flex min-w-0 gap-3 sm:gap-4">
          <PastilleIcone grande>{icone}</PastilleIcone>
          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight text-fh-bleu sm:text-2xl">{titre}</h3>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>
            <div className="mt-2.5 inline-block max-w-full overflow-x-auto rounded-xl bg-indigo-50 px-4 py-2 text-fh-bleu">{formule}</div>
          </div>
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </header>

      <div className="grid gap-4 p-3 sm:gap-6 sm:p-6 @3xl:grid-cols-[minmax(0,13fr)_minmax(0,7fr)] @3xl:items-start">
        <div className="min-w-0 rounded-2xl bg-slate-50/70 p-1 sm:p-3">{graphique}</div>

        <aside className="flex min-w-0 flex-col gap-3" aria-label="Paramètres et résultats">
          <div className="flex flex-col gap-3">{commandes}</div>
          <dl className="grid grid-cols-2 gap-2.5 text-sm">{valeurs}</dl>
        </aside>
      </div>

      <section className="border-t border-indigo-100/70 bg-indigo-50/30 p-3 sm:p-6" aria-label="Explications">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-indigo-100 bg-white p-4 text-sm leading-relaxed text-slate-700 sm:p-5 sm:text-base">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">À retenir</p>
            {commentaire}
          </div>
          {bas}
        </div>
      </section>
    </article>
  );
}

type Ton = "neutre" | "bleu" | "violet" | "orange";
const TONS: Record<Ton, string> = {
  neutre: "border-slate-200 bg-white",
  bleu: "border-blue-200 bg-blue-50/60",
  violet: "border-violet-200 bg-violet-50/60",
  orange: "border-orange-200 bg-orange-50/70",
};
const TONS_TEXTE: Record<Ton, string> = {
  neutre: "text-fh-bleu",
  bleu: "text-blue-900",
  violet: "text-violet-900",
  orange: "text-orange-900",
};

/** Carte de résultat : bleu = fonction, violet = paramètres, orange = éléments remarquables, neutre sinon. */
export function ValeurMaths({ etiquette, children, large = false, ton = "neutre" }: { etiquette: ReactNode; children: ReactNode; large?: boolean; ton?: Ton }) {
  return (
    <div className={`min-w-0 rounded-xl border px-3.5 py-2.5 shadow-sm ${TONS[ton]} ${large ? "col-span-2" : ""}`}>
      <dt className="text-xs font-semibold text-slate-500">{etiquette}</dt>
      <dd className={`mt-0.5 break-words text-base font-semibold ${TONS_TEXTE[ton]}`}>{children}</dd>
    </div>
  );
}

/** Carte de paramètre (violet) : regroupe un contrôle (curseur, choix, boutons) avec son titre. */
export function CarteParam({ titre, children }: { titre?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5 rounded-2xl border border-violet-200 bg-violet-50/50 p-3.5 shadow-sm">
      {titre && <h4 className="text-xs font-bold uppercase tracking-wider text-violet-800">{titre}</h4>}
      {children}
    </section>
  );
}

/** Curseur natif (clavier, toucher) avec sa valeur bien visible, dans une carte « paramètre ». */
export function CurseurMaths({
  nom,
  valeurTexte,
  min,
  max,
  pas,
  valeur,
  onChange,
  ariaLabel,
}: {
  nom: ReactNode;
  valeurTexte: string;
  min: number;
  max: number;
  pas: number;
  valeur: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}) {
  const id = useId();
  return (
    <CarteParam>
      <label htmlFor={id} className="flex items-center justify-between gap-3 text-sm font-semibold text-fh-bleu">
        <span>{nom}</span>
        <output htmlFor={id} className="rounded-full bg-violet-600 px-3.5 py-1 text-sm font-bold text-white">
          {valeurTexte}
        </output>
      </label>
      <input id={id} type="range" min={min} max={max} step={pas} value={valeur} aria-label={ariaLabel} onChange={(e) => onChange(Number(e.target.value))} className="h-11 w-full cursor-pointer accent-violet-600" />
    </CarteParam>
  );
}

interface CurseurNumeriqueProps {
  nom: ReactNode;
  min: number;
  max: number;
  pas: number;
  valeur: number;
  onChange: (v: number) => void;
  ariaLabel: string;
  /** Nom court de la grandeur, pour l'étiquette du champ (« a »). */
  symbole: string;
}

const fr = (v: number) => String(v).replace(".", ",");
const decimales = (pas: number) => (String(pas).split(".")[1] ?? "").length;
/** Ramène v dans [min ; max] et sur la grille des multiples de `pas` à partir de `min`. */
export function caler(v: number, min: number, max: number, pas: number): number {
  const borne = Math.min(max, Math.max(min, v));
  const k = Math.round((borne - min) / pas);
  return Number((min + k * pas).toFixed(decimales(pas) + 6)) + 0; // « + 0 » : évite −0
}
const surLaGrille = (v: number, min: number, max: number, pas: number) => v >= min && v <= max && Math.abs(caler(v, min, max, pas) - v) < 1e-9;

/**
 * Curseur + saisie numérique synchronisés (carte « paramètre »). La saisie accepte la virgule ; une valeur valide
 * (dans [min ; max] et sur la grille du pas) est appliquée immédiatement, toute autre valeur est ramenée à la valeur
 * permise la plus proche quand on quitte le champ (ou avec Entrée). Échap annule la saisie en cours.
 */
export function CurseurNumerique({ nom, min, max, pas, valeur, onChange, ariaLabel, symbole }: CurseurNumeriqueProps) {
  const idCurseur = useId();
  const idChamp = useId();
  const idAide = useId();
  // Saisie en cours, liée à la valeur qui était affichée quand elle a commencé : si la valeur change ailleurs
  // (curseur, bouton Réinitialiser), la saisie périmée est abandonnée et le champ reflète à nouveau la valeur.
  const [saisieBrute, setSaisieBrute] = useState<{ texte: string; pour: number } | null>(null);
  const brouillon = saisieBrute && saisieBrute.pour === valeur ? saisieBrute.texte : null;
  const setBrouillon = (t: string | null) => setSaisieBrute(t === null ? null : { texte: t, pour: valeur });
  const [invalideBrut, setInvalide] = useState(false);
  const invalide = invalideBrut && brouillon !== null;

  const lire = (txt: string): number => Number(txt.trim().replace(",", ".").replace("−", "-"));

  function saisie(txt: string) {
    setBrouillon(txt);
    const n = lire(txt);
    const ok = txt.trim() !== "" && Number.isFinite(n);
    setInvalide(!ok || !surLaGrille(n, min, max, pas));
    if (ok && surLaGrille(n, min, max, pas)) {
      const v = caler(n, min, max, pas);
      setSaisieBrute({ texte: txt, pour: v });
      onChange(v);
    }
  }
  function valider() {
    const n = lire(brouillon ?? "");
    if (brouillon !== null && brouillon.trim() !== "" && Number.isFinite(n)) onChange(caler(n, min, max, pas));
    setBrouillon(null);
    setInvalide(false);
  }

  return (
    <CarteParam titre="Paramètre">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={idCurseur} className="text-base font-semibold text-fh-bleu">
          {nom}
        </label>
        <div className="flex items-center gap-1.5">
          <label htmlFor={idChamp} className="sr-only">
            Valeur de {symbole} (entre {fr(min)} et {fr(max)}, par pas de {fr(pas)})
          </label>
          <input
            id={idChamp}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={brouillon ?? fr(valeur).replace("-", "−")}
            onChange={(e) => saisie(e.target.value)}
            onBlur={valider}
            onKeyDown={(e) => {
              if (e.key === "Enter") valider();
              if (e.key === "Escape") {
                setBrouillon(null);
                setInvalide(false);
              }
            }}
            aria-invalid={invalide}
            aria-describedby={idAide}
            className={`h-11 w-24 rounded-xl border-2 px-2 text-center text-lg font-bold tabular-nums text-violet-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-violet-500 ${
              invalide ? "border-red-500 bg-red-50" : "border-violet-300 bg-white"
            }`}
          />
        </div>
      </div>
      <input
        id={idCurseur}
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-violet-600"
      />
      <p id={idAide} className={`text-xs ${invalide ? "font-semibold text-red-700" : "text-slate-500"}`} aria-live="polite">
        Valeurs permises : de {fr(min).replace("-", "−")} à {fr(max)}, par pas de {fr(pas)}.
        {invalide && " Valeur non permise : elle sera ramenée à la plus proche."}
      </p>
    </CarteParam>
  );
}

/** Bouton secondaire discret (« Réinitialiser », « Tout ouvrir »…). */
export function BoutonDiscret({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-indigo-200 bg-white px-5 text-sm font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 motion-reduce:transition-none"
    >
      {children}
    </button>
  );
}

export { Formule };
