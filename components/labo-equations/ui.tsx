"use client";

import { useId, useState, type ReactNode } from "react";
import { IconFocusCentered, IconZoomIn, IconZoomOut } from "@tabler/icons-react";

import type { Cx } from "@/lib/complexes";
import { lireReel } from "@/lib/complexesTex";
import { pasNet } from "@/lib/moivreEuler";
import { borneNette, PlanSvg, type PointPlan, type Outils } from "@/components/labo-moivre/ui";

/** Éléments d'interface du Laboratoire « Équations dans ℂ » : on réutilise ceux des laboratoires Moivre-Euler et nombres complexes. */
export * from "@/components/labo-moivre/ui";

/** Palette du laboratoire (bleu profond, cyan, vert, orange, violet). */
export const EQ = {
  bleu: "#2563EB",
  profond: "#102A66",
  cyan: "#06B6D4",
  vert: "#10B981",
  orange: "#F97316",
  violet: "#8B5CF6",
  fond: "#EFF6FF",
} as const;

/** Carte blanche à angles arrondis : une zone du laboratoire (paramètres, résultat, explication…). */
export function Panneau({ titre, children, ton = "neutre", icone }: { titre: string; children: ReactNode; ton?: "neutre" | "resultat" | "explication" | "alerte"; icone?: ReactNode }) {
  const style =
    ton === "resultat"
      ? "border-emerald-300 bg-emerald-50/70"
      : ton === "explication"
        ? "border-sky-200 bg-[#EFF6FF]"
        : ton === "alerte"
          ? "border-amber-300 bg-amber-50"
          : "border-[#dbe7ff] bg-white";
  return (
    <section aria-label={titre} className={`flex min-w-0 flex-col gap-3 rounded-2xl border p-4 shadow-sm ${style}`}>
      <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#102A66]">
        {icone}
        {titre}
      </h4>
      {children}
    </section>
  );
}

/** Deux colonnes sur ordinateur (commandes à gauche, visualisation à droite), une seule colonne sur téléphone et tablette. */
export function DeuxColonnes({ gauche, droite }: { gauche: ReactNode; droite: ReactNode }) {
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">{gauche}</div>
      <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4">{droite}</div>
    </div>
  );
}

const CHAMP =
  "min-h-11 w-full rounded-lg border bg-white px-3 text-base text-[#102A66] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20";

/** Champ numérique (réel) : accepte « -2,5 », « 1/2 », « √2 ». La saisie en cours n'est jamais écrasée. */
export function ChampNombre({ etiquette, valeur, onChange }: { etiquette: ReactNode; valeur: number; onChange: (v: number) => void }) {
  const id = useId();
  const [tampon, setTampon] = useState<string | null>(null);
  const formate = (v: number) => String(Number(v.toFixed(6))).replace(".", ",");
  const lecture = tampon === null ? null : lireReel(tampon);
  const invalide = tampon !== null && tampon.trim() !== "" && lecture !== null && !lecture.ok;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-fh-ardoise/80">
        {etiquette}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={tampon ?? formate(valeur)}
        aria-invalid={invalide}
        aria-describedby={invalide ? `${id}-err` : undefined}
        onChange={(e) => {
          const t = e.target.value;
          setTampon(t);
          const l = lireReel(t);
          if (l.ok) onChange(l.valeur);
        }}
        onBlur={() => setTampon(null)}
        className={`${CHAMP} ${invalide ? "border-red-400" : "border-[#c9d8f5]"}`}
      />
      {invalide && lecture && !lecture.ok && (
        <span id={`${id}-err`} className="text-xs text-red-700">
          {lecture.erreur}
        </span>
      )}
    </div>
  );
}

/** Champ de saisie d'un nombre complexe sous forme algébrique (« 2-3i », « 1/2 + i », « -4i »). Le parent lit le texte. */
export function ChampComplexe({
  etiquette,
  valeur,
  onChange,
  erreur,
  placeholder = "ex. 2 - 3i",
}: {
  etiquette: ReactNode;
  valeur: string;
  onChange: (texte: string) => void;
  erreur?: string | null;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-fh-ardoise/80">
        {etiquette}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={valeur}
        placeholder={placeholder}
        aria-invalid={!!erreur}
        aria-describedby={erreur ? `${id}-err` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${CHAMP} ${erreur ? "border-red-400" : "border-[#c9d8f5]"}`}
      />
      {erreur && (
        <span id={`${id}-err`} className="text-xs text-red-700">
          {erreur}
        </span>
      )}
    </div>
  );
}

/** Bloc de verdict bien visible (vert : réussi ; ambre : à corriger ; rouge : refus). Annoncé aux lecteurs d'écran. */
export function Verdict({ ton, children }: { ton: "ok" | "non" | "info"; children: ReactNode }) {
  const style = ton === "ok" ? "border-emerald-400 bg-emerald-50 text-emerald-900" : ton === "non" ? "border-rose-300 bg-rose-50 text-rose-900" : "border-sky-300 bg-sky-50 text-sky-900";
  return (
    <div role="status" aria-live="polite" className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold leading-relaxed ${style}`}>
      {children}
    </div>
  );
}

// --- Plan complexe à échelle automatique, zoom et recentrage -------------------------------------------------

export interface RacinePlan {
  id: string;
  /** Nom court, sans coordonnées : « z₁ ». Sert au nom accessible. */
  nom: string;
  z: Cx;
  couleur: string;
  /** Texte tracé près du point (nom + coordonnées). */
  etiquette: string;
  multiplicite?: number;
}

/**
 * Repère orthonormé : l'échelle s'adapte aux racines (par paliers « nets » : le repère ne saute pas à chaque millième),
 * zoom + / − et « Recentrer ». Les racines multiples reçoivent des anneaux concentriques et un badge « ×m » ; elles
 * peuvent être cliquables (détail). `cadre` fixe l'amplitude du repère (utile quand un point se déplace : le repère ne
 * bouge pas sous le doigt).
 */
export function PlanEquations({
  titre,
  etiquette,
  racines,
  points = [],
  onDeplacer,
  aimant = 0.1,
  cadre,
  dessous,
  dessus,
  onChoisir,
  choisie,
  legende,
}: {
  titre: string;
  etiquette: string;
  racines: RacinePlan[];
  points?: PointPlan[];
  onDeplacer?: (id: string, z: Cx) => void;
  aimant?: number;
  cadre?: number;
  dessous?: (o: Outils) => ReactNode;
  dessus?: (o: Outils) => ReactNode;
  onChoisir?: (id: string) => void;
  choisie?: string | null;
  legende?: ReactNode;
}) {
  const [zoom, setZoom] = useState(0);
  const sources: Cx[] = cadre !== undefined ? [] : [...racines.map((r) => r.z), ...points.map((p) => p.z)];
  const amplitude = cadre ?? Math.max(1, ...sources.map((z) => Math.max(Math.abs(z.re), Math.abs(z.im))));
  const B0 = borneNette(amplitude);
  const B = Math.min(1000, Math.max(0.4, B0 / 1.6 ** zoom));
  const tous: PointPlan[] = [
    ...racines.map((r) => ({ id: r.id, z: r.z, couleur: r.couleur, etiquette: r.etiquette })),
    ...points,
  ];
  const bouton =
    "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#2563EB]/40 bg-white text-[#2563EB] hover:bg-[#2563EB]/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]";
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[#102A66]/80">{titre}</span>
        <span className="flex items-center gap-1" role="group" aria-label="Zoom du repère">
          <button type="button" className={bouton} onClick={() => setZoom((z) => Math.min(4, z + 1))} disabled={zoom >= 4} aria-label="Zoom avant">
            <IconZoomIn size={20} aria-hidden="true" />
          </button>
          <button type="button" className={bouton} onClick={() => setZoom((z) => Math.max(-3, z - 1))} disabled={zoom <= -3} aria-label="Zoom arrière">
            <IconZoomOut size={20} aria-hidden="true" />
          </button>
          <button type="button" className={bouton} onClick={() => setZoom(0)} disabled={zoom === 0} aria-label="Recentrer le repère">
            <IconFocusCentered size={20} aria-hidden="true" />
          </button>
        </span>
      </figcaption>
      <PlanSvg
        bornes={{ xmin: -B, xmax: B, ymin: -B, ymax: B }}
        unite={228 / B}
        pas={pasNet(B)}
        aimant={aimant}
        etiquettesIntelligentes
        points={tous}
        onDeplacer={onDeplacer}
        etiquette={etiquette}
        dessous={(o) => (
          <>
            {dessous?.(o)}
            {racines
              .filter((r) => (r.multiplicite ?? 1) > 1)
              .map((r) =>
                Array.from({ length: (r.multiplicite ?? 1) - 1 }, (_, i) => (
                  <circle key={`${r.id}-a${i}`} cx={o.X(r.z.re)} cy={o.Y(r.z.im)} r={11 + 6 * i} fill="none" stroke={r.couleur} strokeWidth={1.8} strokeOpacity={0.7} />
                )),
              )}
          </>
        )}
        dessus={(o) => (
          <>
            {dessus?.(o)}
            {racines
              .filter((r) => (r.multiplicite ?? 1) > 1)
              .map((r) => (
                <g key={`${r.id}-b`} pointerEvents="none">
                  <rect x={o.X(r.z.re) + 8} y={o.Y(r.z.im) + 6} width={28} height={16} rx={8} fill={EQ.orange} />
                  <text x={o.X(r.z.re) + 22} y={o.Y(r.z.im) + 18} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
                    ×{r.multiplicite}
                  </text>
                </g>
              ))}
            {onChoisir &&
              racines.map((r) => (
                <g
                  key={`${r.id}-c`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Racine ${r.nom} : afficher le détail`}
                  aria-pressed={choisie === r.id}
                  onClick={() => onChoisir(r.id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      onChoisir(r.id);
                    }
                  }}
                  className="cursor-pointer outline-none focus-visible:[&>circle]:stroke-[#2563EB]"
                >
                  <circle cx={o.X(r.z.re)} cy={o.Y(r.z.im)} r={17} fill="transparent" stroke={choisie === r.id ? EQ.orange : "transparent"} strokeWidth={2.5} />
                </g>
              ))}
          </>
        )}
      />
      {legende}
    </figure>
  );
}

/** Étiquette de point « z₁ (2 ; −3) » : coordonnées arrondies à 2 décimales, virgule française, jamais « −0 ». */
export function etiquetteCoord(nom: string, z: Cx): string {
  const f = (x: number) => {
    const t = Number(x.toFixed(2));
    return String(Object.is(t, -0) ? 0 : t).replace(".", ",").replace("-", "−");
  };
  return `${nom} (${f(z.re)} ; ${f(z.im)})`;
}

const SOUS = "₀₁₂₃₄₅₆₇₈₉";
/** Indice en caractères Unicode : indice(1) = « ₁ ». */
export function indice(k: number): string {
  return String(k)
    .split("")
    .map((c) => SOUS[Number(c)] ?? c)
    .join("");
}
