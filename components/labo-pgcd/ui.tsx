"use client";

import { useId, useMemo, type ReactNode } from "react";
import katex from "katex";
import { IconEye, IconPlayerTrackNext, IconPlayerTrackPrev, IconRefresh, IconDice5 } from "@tabler/icons-react";

import { lireEntier, type LectureEntier } from "@/lib/arithmetique";

/** Éléments d'interface partagés par les six simulations du Laboratoire PGCD & PPCM. */

/** Entier TeX entre parenthèses s'il est négatif. */
export function par(n: bigint | number): string {
  return n < 0 ? `(${n})` : `${n}`;
}

/** Formule KaTeX (même rendu que HorlogeModulaire : katex.renderToString, sans CDN). Les formules longues défilent dans leur boîte. */
export function Tex({ expr, bloc = false, className = "" }: { expr: string; bloc?: boolean; className?: string }) {
  const html = useMemo(() => katex.renderToString(expr, { throwOnError: false, output: "html", displayMode: false }), [expr]);
  if (bloc) {
    return <div className={`max-w-full overflow-x-auto py-1 ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Zone nommée d'une simulation : Paramètres, Simulation, Explications ou Résultat. */
export function Zone({ titre, children, ton = "neutre" }: { titre: string; children: ReactNode; ton?: "neutre" | "resultat" | "explication" }) {
  const fond = ton === "resultat" ? "border-emerald-300 bg-emerald-50" : ton === "explication" ? "border-fh-sable bg-fh-creme" : "border-fh-sable bg-white";
  return (
    <section className={`flex min-w-0 flex-col gap-3 rounded-xl border p-4 ${fond}`} aria-label={titre}>
      <h4 className="text-sm font-bold uppercase tracking-wide text-fh-bleu">{titre}</h4>
      {children}
    </section>
  );
}

/** Explication en trois temps : Que faisons-nous ? Pourquoi ? Qu'obtenons-nous ? */
export function TroisQuestions({ quoi, pourquoi, obtenu }: { quoi: ReactNode; pourquoi: ReactNode; obtenu: ReactNode }) {
  const ligne = (etiquette: string, couleur: string, contenu: ReactNode) => (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className={`shrink-0 text-xs font-bold uppercase tracking-wide sm:w-28 sm:pt-0.5 ${couleur}`}>{etiquette}</span>
      <div className="min-w-0 flex-1 text-sm leading-relaxed text-fh-ardoise">{contenu}</div>
    </div>
  );
  return (
    <div className="flex flex-col gap-2.5">
      {ligne("Que faisons-nous ?", "text-fh-bleu-vif", quoi)}
      {ligne("Pourquoi ?", "text-fh-orange", pourquoi)}
      {ligne("Qu'obtenons-nous ?", "text-emerald-700", obtenu)}
    </div>
  );
}

export function Message({ type = "info", children }: { type?: "info" | "erreur" | "ok"; children: ReactNode }) {
  const style =
    type === "erreur"
      ? "bg-red-50 text-red-800 border-red-200"
      : type === "ok"
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-amber-50 text-amber-900 border-amber-200";
  return (
    <p role={type === "erreur" ? "alert" : "status"} className={`rounded-lg border px-3 py-2 text-sm ${style}`}>
      {children}
    </p>
  );
}

interface ChampEntierProps {
  etiquette: string;
  valeur: string;
  onChange: (texte: string) => void;
  /** Résultat de lireEntier sur `valeur` (le parent le calcule déjà, on évite de le refaire). */
  lecture: LectureEntier;
  maxChiffres?: number;
  /** Texte d'aide additionnel sous le champ. */
  aide?: string;
}

/** Champ de saisie d'un entier : libellé associé, message d'erreur lié par aria-describedby. */
export function ChampEntier({ etiquette, valeur, onChange, lecture, aide }: ChampEntierProps) {
  const id = useId();
  const erreur = lecture.ok ? null : lecture.erreur;
  return (
    <div className="flex min-w-[7.5rem] flex-1 flex-col gap-1">
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

/** Lit un entier ou null (sans message), pour les champs facultatifs. */
export function entierOuNull(texte: string): bigint | null {
  const l = lireEntier(texte);
  return l.ok ? l.valeur : null;
}

const BOUTON =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fh-bleu-vif";

export function Bouton({
  onClick,
  children,
  disabled,
  variante = "contour",
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  variante?: "contour" | "plein";
}) {
  const style =
    variante === "plein"
      ? "border-fh-bleu-vif bg-fh-bleu-vif text-white hover:bg-fh-bleu"
      : "border-fh-bleu-vif/40 text-fh-bleu-vif hover:bg-fh-bleu-vif/10";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${BOUTON} ${style}`}>
      {children}
    </button>
  );
}

interface CommandesProps {
  etape: number;
  total: number;
  onPrecedent: () => void;
  onSuivant: () => void;
  onTout: () => void;
  onRecommencer: () => void;
  onExemple?: () => void;
}

/** Commandes pas à pas : précédent, suivant, tout afficher, recommencer, nouvel exemple. */
export function Commandes({ etape, total, onPrecedent, onSuivant, onTout, onRecommencer, onExemple }: CommandesProps) {
  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label="Commandes pas à pas" className="flex flex-wrap items-center gap-2">
        <Bouton onClick={onPrecedent} disabled={etape <= 0}>
          <IconPlayerTrackPrev size={18} aria-hidden="true" />
          Étape précédente
        </Bouton>
        <Bouton variante="plein" onClick={onSuivant} disabled={etape >= total}>
          Étape suivante
          <IconPlayerTrackNext size={18} aria-hidden="true" />
        </Bouton>
        <Bouton onClick={onTout} disabled={etape >= total}>
          <IconEye size={18} aria-hidden="true" />
          Tout afficher
        </Bouton>
        <Bouton onClick={onRecommencer} disabled={etape === 0}>
          <IconRefresh size={18} aria-hidden="true" />
          Recommencer
        </Bouton>
        {onExemple && (
          <Bouton onClick={onExemple}>
            <IconDice5 size={18} aria-hidden="true" />
            Nouvel exemple
          </Bouton>
        )}
      </div>
      <p className="text-xs text-fh-ardoise/70" aria-live="polite">
        Étape {etape} sur {total}
      </p>
    </div>
  );
}

/** Étape courante bornée dans [0, total]. */
export function borner(etape: number, total: number): number {
  return Math.max(0, Math.min(total, etape));
}

/** Écriture TeX d'une combinaison linéaire : somme([[2,"x"],[3,"y"]]) = « 2x + 3y ». Une variable vide ("") désigne un terme constant. Les coefficients nuls disparaissent. */
export function somme(termes: Array<[bigint | number, string]>): string {
  let s = "";
  for (const [coef, v] of termes) {
    const c = BigInt(coef);
    if (c === BigInt(0)) continue;
    const negatif = c < BigInt(0);
    const absolu = negatif ? -c : c;
    const nombre = v !== "" && absolu === BigInt(1) ? "" : `${absolu}`;
    const corps = `${nombre}${v}`;
    s += s === "" ? `${negatif ? "-" : ""}${corps}` : ` ${negatif ? "-" : "+"} ${corps}`;
  }
  return s === "" ? "0" : s;
}

export interface OngletDef {
  id: string;
  libelle: string;
  icone?: ReactNode;
}

/** Barre d'onglets accessible (rôle tablist, flèches gauche/droite, Début/Fin). Le panneau associé est rendu par l'appelant avec id `panneau-${id}`. */
export function Onglets({
  onglets,
  actif,
  onChoisir,
  prefixe,
  etiquette,
  grille,
}: {
  onglets: OngletDef[];
  actif: string;
  onChoisir: (id: string) => void;
  prefixe: string;
  etiquette: string;
  grille: string;
}) {
  function touche(ev: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let cible = -1;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") cible = (index + 1) % onglets.length;
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") cible = (index - 1 + onglets.length) % onglets.length;
    else if (ev.key === "Home") cible = 0;
    else if (ev.key === "End") cible = onglets.length - 1;
    if (cible < 0) return;
    ev.preventDefault();
    onChoisir(onglets[cible].id);
    document.getElementById(`${prefixe}-onglet-${onglets[cible].id}`)?.focus();
  }
  return (
    <div role="tablist" aria-label={etiquette} className={`grid gap-2 ${grille}`}>
      {onglets.map((o, i) => {
        const selectionne = o.id === actif;
        return (
          <button
            key={o.id}
            id={`${prefixe}-onglet-${o.id}`}
            role="tab"
            type="button"
            aria-selected={selectionne}
            aria-controls={`${prefixe}-panneau-${o.id}`}
            tabIndex={selectionne ? 0 : -1}
            onClick={() => onChoisir(o.id)}
            onKeyDown={(ev) => touche(ev, i)}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-xl border-2 px-2 py-1.5 text-center text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fh-bleu-vif ${
              selectionne ? "border-fh-bleu-vif bg-fh-bleu-vif text-white shadow-md" : "border-fh-sable bg-white text-fh-bleu hover:bg-fh-accent"
            }`}
          >
            {o.icone}
            <span className="leading-tight">{o.libelle}</span>
          </button>
        );
      })}
    </div>
  );
}
