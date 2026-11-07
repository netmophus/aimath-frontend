"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

import type { Cx } from "@/lib/complexes";

/** Éléments d'interface du Laboratoire des nombres complexes : on réutilise ceux des laboratoires PGCD et nombres premiers. */
export { Tex, Zone, Message, Bouton, Onglets, type OngletDef } from "@/components/labo-pgcd/ui";
export { Intro, Conclusion, Pastille, Stepper } from "@/components/labo-premiers/ui";

import { Bouton, Message } from "@/components/labo-pgcd/ui";

/** Couleurs des objets du plan (cohérentes entre les six simulations). */
export const COULEURS = {
  z: "#1f2ca2", // bleu : le nombre étudié
  w: "#7c3aed", // violet : second nombre / multiplicateur
  resultat: "#d14205", // orange : résultat
  conjugue: "#059669", // vert : conjugué, racines
  alerte: "#e11d48",
  gris: "#64748b",
} as const;

// --- Curseur + champ numérique synchronisés ---------------------------------------------------------------------

/** Curseur et champ numérique liés : on peut taper « -1. » ou « - » sans que la saisie soit écrasée. */
export function Curseur({
  etiquette,
  valeur,
  min,
  max,
  pas,
  onChange,
  decimales = 2,
  unite,
}: {
  etiquette: ReactNode;
  valeur: number;
  min: number;
  max: number;
  pas: number;
  onChange: (v: number) => void;
  decimales?: number;
  unite?: string;
}) {
  const id = useId();
  const [tampon, setTampon] = useState<string | null>(null);
  const formate = (v: number) => String(Number(v.toFixed(decimales))).replace(".", ",");
  const affiche = tampon ?? formate(valeur);
  const invalide = tampon !== null && !Number.isFinite(Number(tampon.replace(",", "."))) && tampon.trim() !== "";
  return (
    <div className="flex min-w-[10rem] flex-1 flex-col gap-1">
      <label htmlFor={`${id}-n`} className="flex items-center justify-between gap-2 text-xs font-semibold text-fh-ardoise/80">
        <span>{etiquette}</span>
        {unite && <span className="font-normal text-fh-ardoise/60">{unite}</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={`${id}-r`}
          type="range"
          min={min}
          max={max}
          step={pas}
          value={Math.min(max, Math.max(min, valeur))}
          onChange={(e) => {
            setTampon(null);
            onChange(Number(e.target.value));
          }}
          aria-label={typeof etiquette === "string" ? etiquette : undefined}
          aria-labelledby={typeof etiquette === "string" ? undefined : `${id}-n`}
          className="h-11 min-w-0 flex-1 accent-fh-bleu-vif"
        />
        <input
          id={`${id}-n`}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={affiche}
          aria-invalid={invalide}
          onChange={(e) => {
            const t = e.target.value;
            setTampon(t);
            const v = Number(t.replace(",", "."));
            if (t.trim() !== "" && Number.isFinite(v)) onChange(Math.min(max, Math.max(min, v)));
          }}
          onBlur={() => setTampon(null)}
          className={`min-h-11 w-20 shrink-0 rounded-lg border bg-white px-2 text-center text-base text-fh-bleu outline-none focus:border-fh-bleu-vif focus:ring-2 focus:ring-fh-bleu-vif/20 ${
            invalide ? "border-red-400" : "border-fh-sable"
          }`}
        />
      </div>
    </div>
  );
}

// --- Plan complexe SVG interactif -----------------------------------------------------------------------------

export interface PointPlan {
  id: string;
  z: Cx;
  couleur: string;
  etiquette: string;
  deplacable?: boolean;
}

export interface Bornes {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface Outils {
  X: (x: number) => number;
  Y: (y: number) => number;
  /** "x,y" en pixels pour un complexe. */
  P: (z: Cx) => string;
  /** Pixels par unité. */
  u: number;
}

const U = 38;

/** Pas de graduation « joli » pour une étendue donnée. */
export function pasGraduation(etendue: number): number {
  if (etendue <= 14) return 1;
  if (etendue <= 30) return 2;
  if (etendue <= 70) return 5;
  return 10;
}

/**
 * Repère orthonormé direct (axe réel horizontal, axe imaginaire vertical) avec quadrillage, graduations, et points
 * déplaçables à la souris, au doigt ou au clavier (flèches). `touch-action: none` n'est posé QUE sur les points : le
 * reste du dessin laisse la page défiler sur mobile. Les couches `dessous` et `dessus` reçoivent les outils de conversion.
 */
export function PlanSvg({
  bornes,
  points,
  onDeplacer,
  aimant = 0.1,
  etiquette,
  dessous,
  dessus,
  pas,
}: {
  bornes: Bornes;
  points: PointPlan[];
  onDeplacer?: (id: string, z: Cx) => void;
  /** Pas d'arrondi pendant le déplacement (les valeurs restent lisibles et les tests exacts). */
  aimant?: number;
  etiquette: string;
  dessous?: (o: Outils) => ReactNode;
  dessus?: (o: Outils) => ReactNode;
  pas?: number;
}) {
  const { xmin, xmax, ymin, ymax } = bornes;
  const W = (xmax - xmin) * U;
  const H = (ymax - ymin) * U;
  const X = (x: number) => (x - xmin) * U;
  const Y = (y: number) => (ymax - y) * U;
  const P = (z: Cx) => `${X(z.re)},${Y(z.im)}`;
  const outils: Outils = { X, Y, P, u: U };
  const g = pas ?? pasGraduation(Math.max(xmax - xmin, ymax - ymin));
  const svgRef = useRef<SVGSVGElement>(null);
  const [actif, setActif] = useState<string | null>(null);

  // Chromium ignore `touch-action` sur les enfants SVG : on bloque le défilement uniquement quand le doigt
  // commence sur une poignée (écouteur natif non passif), la page défile normalement partout ailleurs.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const bloquer = (ev: TouchEvent) => {
      if ((ev.target as Element | null)?.getAttribute?.("data-poignee") === "1" && ev.cancelable) ev.preventDefault();
    };
    svg.addEventListener("touchstart", bloquer, { passive: false });
    return () => svg.removeEventListener("touchstart", bloquer);
  }, []);

  const xs: number[] = [];
  for (let x = Math.ceil(xmin / g) * g; x <= xmax + 1e-9; x += g) xs.push(Number(x.toFixed(6)));
  const ys: number[] = [];
  for (let y = Math.ceil(ymin / g) * g; y <= ymax + 1e-9; y += g) ys.push(Number(y.toFixed(6)));
  const axeX = Math.min(Math.max(0, xmin), xmax);
  const axeY = Math.min(Math.max(0, ymin), ymax);

  function depuisEcran(ev: PointerEvent<SVGElement>): Cx | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return null;
    const px = ((ev.clientX - rect.left) * W) / rect.width;
    const py = ((ev.clientY - rect.top) * H) / rect.height;
    return arrondir({ re: xmin + px / U, im: ymax - py / U });
  }
  function arrondir(z: Cx): Cx {
    const r = (v: number, lo: number, hi: number) => {
      const borne = Math.min(hi, Math.max(lo, v));
      const v2 = aimant > 0 ? Math.round(borne / aimant) * aimant : borne;
      const sain = Number(v2.toFixed(6));
      return sain === 0 ? 0 : Math.min(hi, Math.max(lo, sain));
    };
    return { re: r(z.re, xmin, xmax), im: r(z.im, ymin, ymax) };
  }
  function clavier(ev: KeyboardEvent<SVGGElement>, p: PointPlan) {
    const d = aimant > 0 ? aimant : 0.1;
    const dep: Record<string, Cx> = { ArrowLeft: { re: -d, im: 0 }, ArrowRight: { re: d, im: 0 }, ArrowUp: { re: 0, im: d }, ArrowDown: { re: 0, im: -d } };
    const v = dep[ev.key];
    if (!v) return;
    ev.preventDefault();
    onDeplacer?.(p.id, arrondir({ re: p.z.re + v.re, im: p.z.im + v.im }));
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      role="group"
      aria-label={etiquette}
      className="mx-auto block h-auto w-full max-w-[36rem] select-none rounded-xl border border-fh-sable bg-white"
    >
      {xs.map((x) => (
        <line key={`gx${x}`} x1={X(x)} y1={0} x2={X(x)} y2={H} stroke="#e8edf5" strokeWidth={1} />
      ))}
      {ys.map((y) => (
        <line key={`gy${y}`} x1={0} y1={Y(y)} x2={W} y2={Y(y)} stroke="#e8edf5" strokeWidth={1} />
      ))}
      <line x1={0} y1={Y(axeY)} x2={W} y2={Y(axeY)} stroke="#334155" strokeWidth={1.6} />
      <line x1={X(axeX)} y1={0} x2={X(axeX)} y2={H} stroke="#334155" strokeWidth={1.6} />
      {xs.filter((x) => x !== 0).map((x) => (
        <text key={`tx${x}`} x={X(x)} y={Math.min(H - 3, Y(axeY) + 13)} textAnchor="middle" fontSize={10} fill="#64748b">
          {x}
        </text>
      ))}
      {ys.filter((y) => y !== 0).map((y) => (
        <text key={`ty${y}`} x={Math.max(10, X(axeX) - 5)} y={Y(y) + 3.5} textAnchor="end" fontSize={10} fill="#64748b">
          {y}
        </text>
      ))}
      <text x={Math.max(10, X(axeX) - 5)} y={Math.min(H - 3, Y(axeY) + 13)} textAnchor="end" fontSize={11} fontWeight={700} fill="#334155">
        O
      </text>
      <text x={W - 4} y={Math.max(12, Y(axeY) - 6)} textAnchor="end" fontSize={11} fontWeight={700} fill="#334155">
        Re
      </text>
      <text x={Math.min(W - 4, X(axeX) + 6)} y={12} fontSize={11} fontWeight={700} fill="#334155">
        Im
      </text>
      {dessous?.(outils)}
      {points.map((p) => {
        const cx0 = X(p.z.re);
        const cy0 = Y(p.z.im);
        const mobile = !!p.deplacable && !!onDeplacer;
        return (
          <g
            key={p.id}
            tabIndex={mobile ? 0 : undefined}
            role={mobile ? "button" : undefined}
            aria-label={mobile ? `${p.etiquette} : déplacer avec la souris, le doigt ou les flèches` : undefined}
            onKeyDown={mobile ? (ev) => clavier(ev, p) : undefined}
            className="outline-none focus-visible:[&>.anneau]:stroke-fh-bleu-vif"
          >
            {mobile && (
              <circle
                className="anneau"
                cx={cx0}
                cy={cy0}
                r={actif === p.id ? 17 : 14}
                fill={p.couleur}
                fillOpacity={0.12}
                stroke={p.couleur}
                strokeOpacity={0.5}
                strokeWidth={actif === p.id ? 2.5 : 1.5}
                strokeDasharray="3 3"
              />
            )}
            <circle cx={cx0} cy={cy0} r={6.5} fill={p.couleur} stroke="#fff" strokeWidth={2} />
            <text x={cx0 + 10} y={cy0 - 9} fontSize={13} fontWeight={700} fill={p.couleur} stroke="#fff" strokeWidth={3} paintOrder="stroke">
              {p.etiquette}
            </text>
            {mobile && (
              <circle
                cx={cx0}
                cy={cy0}
                r={24}
                fill="transparent"
                data-poignee="1"
                style={{ touchAction: "none", cursor: actif === p.id ? "grabbing" : "grab" }}
                onPointerDown={(ev) => {
                  ev.currentTarget.setPointerCapture(ev.pointerId);
                  setActif(p.id);
                }}
                onPointerMove={(ev) => {
                  if (actif !== p.id) return;
                  const z = depuisEcran(ev);
                  if (z) onDeplacer?.(p.id, z);
                }}
                onPointerUp={() => setActif(null)}
                onPointerCancel={() => setActif(null)}
              />
            )}
          </g>
        );
      })}
      {dessus?.(outils)}
    </svg>
  );
}

/** Segment fléché (vecteur) entre deux complexes, dans un PlanSvg. */
export function Fleche({ o, de, vers, couleur, epaisseur = 2.5, pointille = false }: { o: Outils; de: Cx; vers: Cx; couleur: string; epaisseur?: number; pointille?: boolean }) {
  const x1 = o.X(de.re);
  const y1 = o.Y(de.im);
  const x2 = o.X(vers.re);
  const y2 = o.Y(vers.im);
  const L = Math.hypot(x2 - x1, y2 - y1);
  if (L < 2) return null;
  const ux = (x2 - x1) / L;
  const uy = (y2 - y1) / L;
  const t = 9;
  const bx = x2 - ux * t;
  const by = y2 - uy * t;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={couleur} strokeWidth={epaisseur} strokeDasharray={pointille ? "5 4" : undefined} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx - uy * 4.5},${by + ux * 4.5} ${bx + uy * 4.5},${by - ux * 4.5}`} fill={couleur} />
    </g>
  );
}

/** Arc de cercle de centre `c`, de rayon (unités) `r`, du angle a1 à a2 (radians, sens direct si a2 > a1). */
export function Arc({ o, centre, rayon, a1, a2, couleur, epaisseur = 2 }: { o: Outils; centre: Cx; rayon: number; a1: number; a2: number; couleur: string; epaisseur?: number }) {
  if (!Number.isFinite(a1) || !Number.isFinite(a2) || Math.abs(a2 - a1) < 1e-9) return null;
  const n = Math.max(6, Math.ceil(Math.abs(a2 - a1) / 0.1));
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = a1 + ((a2 - a1) * i) / n;
    pts.push(`${o.X(centre.re + rayon * Math.cos(t))},${o.Y(centre.im + rayon * Math.sin(t))}`);
  }
  return <polyline points={pts.join(" ")} fill="none" stroke={couleur} strokeWidth={epaisseur} strokeLinecap="round" />;
}

// --- Mode défi : questions avec indices progressifs, correction et nouvel essai --------------------------------

export interface Resultat {
  ok: boolean;
  message: ReactNode;
}

/**
 * Cadre d'une question de défi : bouton Vérifier, indices progressifs, correction complète. Le corps de saisie est fourni
 * par l'appelant (champ texte, choix, plan…). Le parent change la `key` pour recommencer.
 */
export function Question({
  numero,
  enonce,
  corps,
  onVerifier,
  indices,
  correction,
}: {
  numero: number;
  enonce: ReactNode;
  corps: ReactNode;
  onVerifier: () => Resultat;
  indices: ReactNode[];
  correction: ReactNode;
}) {
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [nbIndices, setNbIndices] = useState(0);
  const [voirCorrection, setVoirCorrection] = useState(false);
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-violet-200 bg-white p-3">
      <p className="text-sm font-semibold text-fh-bleu">
        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{numero}</span>
        {enonce}
      </p>
      {corps}
      <div className="flex flex-wrap gap-2">
        <Bouton variante="plein" onClick={() => setResultat(onVerifier())}>
          Vérifier
        </Bouton>
        <Bouton onClick={() => setNbIndices((n) => Math.min(indices.length, n + 1))} disabled={nbIndices >= indices.length}>
          Indice {indices.length > 0 ? `(${nbIndices}/${indices.length})` : ""}
        </Bouton>
        <Bouton onClick={() => setVoirCorrection(true)} disabled={voirCorrection}>
          Voir la correction
        </Bouton>
      </div>
      {resultat && <Message type={resultat.ok ? "ok" : "erreur"}>{resultat.message}</Message>}
      {nbIndices > 0 && (
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-fh-ardoise" aria-label="Indices">
          {indices.slice(0, nbIndices).map((ind, i) => (
            <li key={i}>{ind}</li>
          ))}
        </ol>
      )}
      {voirCorrection && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm leading-relaxed text-fh-ardoise" aria-label="Correction">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-800">Correction</p>
          {correction}
        </div>
      )}
    </div>
  );
}

/** Question à réponse saisie (réel, complexe, angle…) : `verifier` reçoit le texte tapé. */
export function QuestionTexte({
  numero,
  enonce,
  placeholder,
  verifier,
  indices,
  correction,
}: {
  numero: number;
  enonce: ReactNode;
  placeholder: string;
  verifier: (texte: string) => Resultat;
  indices: ReactNode[];
  correction: ReactNode;
}) {
  const id = useId();
  const [texte, setTexte] = useState("");
  return (
    <Question
      numero={numero}
      enonce={enonce}
      indices={indices}
      correction={correction}
      onVerifier={() => (texte.trim() === "" ? { ok: false, message: "Écris d'abord ta réponse." } : verifier(texte))}
      corps={
        <div className="flex flex-col gap-1">
          <label htmlFor={id} className="sr-only">
            Ta réponse à la question {numero}
          </label>
          <input
            id={id}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={texte}
            placeholder={placeholder}
            onChange={(e) => setTexte(e.target.value)}
            className="min-h-11 w-full max-w-sm rounded-lg border border-fh-sable bg-white px-3 text-base text-fh-bleu outline-none focus:border-fh-bleu-vif focus:ring-2 focus:ring-fh-bleu-vif/20"
          />
        </div>
      }
    />
  );
}

/** Question à choix unique. `explications` donne l'explication affichée pour chaque choix (bon ou mauvais). */
export function QuestionChoix({
  numero,
  enonce,
  options,
  bonne,
  explications,
  indices,
  correction,
}: {
  numero: number;
  enonce: ReactNode;
  options: Array<{ id: string; libelle: ReactNode }>;
  bonne: string;
  explications: Record<string, ReactNode>;
  indices: ReactNode[];
  correction: ReactNode;
}) {
  const [choix, setChoix] = useState<string | null>(null);
  return (
    <Question
      numero={numero}
      enonce={enonce}
      indices={indices}
      correction={correction}
      onVerifier={() =>
        choix === null
          ? { ok: false, message: "Choisis d'abord une réponse." }
          : { ok: choix === bonne, message: <>{choix === bonne ? "Bravo ! " : "Pas tout à fait. "}{explications[choix]}</> }
      }
      corps={
        <div role="radiogroup" aria-label={`Choix de réponse de la question ${numero}`} className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={choix === o.id}
              onClick={() => setChoix(o.id)}
              className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-fh-bleu-vif ${
                choix === o.id ? "border-violet-600 bg-violet-600 text-white" : "border-violet-300 bg-white text-violet-800 hover:bg-violet-50"
              }`}
            >
              {o.libelle}
            </button>
          ))}
        </div>
      }
    />
  );
}

/**
 * Mode défi : enchaîne des instances (énoncés différents). « Nouveau défi » passe à l'instance suivante et efface les
 * réponses ; « Recommencer » efface les réponses de l'instance courante.
 */
export function DefiBloc({ nombre, rendu }: { nombre: number; rendu: (instance: number) => ReactNode }) {
  const [instance, setInstance] = useState(0);
  const [essai, setEssai] = useState(0);
  const [ouvert, setOuvert] = useState(false);
  return (
    <section aria-label="Mode défi" className="flex min-w-0 flex-col gap-3 rounded-xl border border-violet-300 bg-violet-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold uppercase tracking-wide text-violet-800">Mode défi</h4>
        {!ouvert ? (
          <Bouton variante="plein" onClick={() => setOuvert(true)}>
            Lancer un défi
          </Bouton>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Bouton onClick={() => setEssai((e) => e + 1)}>Recommencer</Bouton>
            {nombre > 1 && <Bouton onClick={() => {
                  setInstance((i) => (i + 1) % nombre);
                  setEssai(0);
                }}>Nouveau défi ({instance + 1}/{nombre})</Bouton>}
          </div>
        )}
      </div>
      {!ouvert && <p className="text-sm text-fh-ardoise">Deux ou trois questions courtes, avec indices progressifs et correction complète.</p>}
      {ouvert && (
        <div key={`${instance}-${essai}`} className="flex min-w-0 flex-col gap-3">
          {rendu(instance)}
        </div>
      )}
    </section>
  );
}

/** Ligne « étiquette : valeur » d'un tableau de résultats. */
export function Valeur({ etiquette, children }: { etiquette: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-fh-sable bg-white px-3 py-2">
      <span className="text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">{etiquette}</span>
      <span className="min-w-0 break-words text-sm font-semibold text-fh-bleu">{children}</span>
    </div>
  );
}
