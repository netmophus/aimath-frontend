"use client";

import { useId, type CSSProperties, type ReactNode } from "react";
import katex from "katex";

/** Formule KaTeX courte (chaînes fixes écrites ici, jamais de texte saisi par le visiteur). Le CSS est global (app/layout.tsx). */
export function Formule({ tex, bloc = false }: { tex: string; bloc?: boolean }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: bloc });
  return <span className={bloc ? "block overflow-x-auto" : undefined} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Texte courant avec formules : les passages entre `$ … $` sont rendus en KaTeX (en ligne), le reste reste du texte.
 * Chaînes écrites dans le code uniquement (jamais de saisie du visiteur).
 */
export function Tx({ children }: { children: string }) {
  return (
    <>
      {children.split("$").map((morceau, i) => (i % 2 === 1 ? <Formule key={i} tex={morceau} /> : <span key={i}>{morceau}</span>))}
    </>
  );
}

/** Changement de repère : coordonnées mathématiques → coordonnées du viewBox SVG (orthonormé si les échelles sont égales). */
export function repere(xmin: number, xmax: number, ymin: number, ymax: number, largeur: number, hauteur: number, marge = 28) {
  const sx = (largeur - 2 * marge) / (xmax - xmin);
  const sy = (hauteur - 2 * marge) / (ymax - ymin);
  return {
    X: (x: number) => marge + (x - xmin) * sx,
    Y: (y: number) => hauteur - marge - (y - ymin) * sy,
    sx,
    sy,
    marge,
  };
}

/** Chemin SVG « M x y L x y … » (coordonnées déjà converties). */
export const chemin = (pts: [number, number][]): string => pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");

/** « −3 » avec vrai signe moins pour les graduations. */
export const grad = (v: number): string => String(v).replace("-", "−");

interface CurseurProps {
  nom: ReactNode;
  valeurTexte: string;
  min: number;
  max: number;
  pas: number;
  valeur: number;
  onChange: (v: number) => void;
  ariaLabel: string;
}

/** Curseur natif (clavier, toucher) avec sa valeur affichée ; zone de saisie haute pour le pouce. */
export function Curseur({ nom, valeurTexte, min, max, pas, valeur, onChange, ariaLabel }: CurseurProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-semibold text-fh-bleu">
        <span>{nom}</span>
        <output htmlFor={id} className="rounded-full bg-fh-accent px-3 py-0.5 text-sm font-bold text-fh-orange-fonce">
          {valeurTexte}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-fh-orange"
      />
    </div>
  );
}

export function BoutonReinitialiser({ onClick, label = "Réinitialiser" }: { onClick: () => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-fh-bleu/40 px-5 text-sm font-semibold text-fh-bleu transition-colors hover:bg-fh-bleu/5 motion-reduce:transition-none"
    >
      {label}
    </button>
  );
}

/** Cadre commun d'un onglet : titre, description, graphique (gauche) et commandes + valeurs (droite). */
export function CadreSimulation({
  titre,
  description,
  formule,
  graphique,
  commandes,
  valeurs,
  commentaire,
  bas,
}: {
  titre: string;
  description: string;
  formule: ReactNode;
  graphique: ReactNode;
  commandes: ReactNode;
  valeurs: ReactNode;
  commentaire: ReactNode;
  /** Encadré optionnel pleine largeur sous le graphique et le panneau de droite. */
  bas?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-xl font-bold text-fh-bleu sm:text-2xl">{titre}</h3>
        <p className="mt-1 text-sm text-fh-ardoise sm:text-base">{description}</p>
        <p className="mt-2 text-fh-bleu">{formule}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        <div className="min-w-0 rounded-xl border border-fh-sable bg-white p-2 sm:p-3">{graphique}</div>
        <div className="flex min-w-0 flex-col gap-4">
          {commandes}
          <dl className="grid grid-cols-2 gap-2 text-sm">{valeurs}</dl>
          <div className="rounded-xl bg-fh-accent/60 p-3 text-sm leading-relaxed text-fh-ardoise">{commentaire}</div>
        </div>
      </div>
      {bas && <div className="rounded-xl bg-fh-accent/60 p-3 text-sm leading-relaxed text-fh-ardoise sm:p-4">{bas}</div>}
    </div>
  );
}

/**
 * Tableau de valeurs d'un laboratoire (style « lignes alternées », classes .tableau-moderne de app/globals.css).
 * `couleur` : couleur de l'onglet pour l'en-tête. Les <thead> et <tbody> sont fournis par l'appelant.
 */
export function TableauValeurs({ couleur, children }: { couleur: string; children: ReactNode }) {
  return (
    <div className="tableau-moderne-cadre" style={{ "--tableau-couleur": couleur } as CSSProperties}>
      <table className="tableau-moderne">{children}</table>
    </div>
  );
}

/** Une valeur affichée (étiquette + valeur) dans la grille de résultats. */
export function Valeur({ etiquette, children, large = false }: { etiquette: ReactNode; children: ReactNode; large?: boolean }) {
  return (
    <div className={`min-w-0 rounded-lg border border-fh-sable bg-white px-3 py-2 ${large ? "col-span-2" : ""}`}>
      <dt className="text-xs font-medium text-fh-ardoise/80">{etiquette}</dt>
      <dd className="break-words font-semibold text-fh-bleu">{children}</dd>
    </div>
  );
}
