"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { IconPlayerPause, IconPlayerPlay, IconRefresh, IconRotate } from "@tabler/icons-react";

import type { Cx } from "@/lib/complexes";
import { fr, type Vec } from "@/lib/cinematique";
import { Bouton, Curseur, Fleche, type Bornes, type Outils } from "@/components/labo-equations/ui";

/** Éléments d'interface du Laboratoire de cinématique : on réutilise ceux des laboratoires Équations, Moivre et Complexes. */
export * from "@/components/labo-equations/ui";

/** Couleurs des grandeurs, identiques dans les animations, les vecteurs et les graphiques. */
export const CI = {
  position: "#2563EB",
  vitesse: "#10B981",
  acceleration: "#F97316",
  tangente: "#06B6D4",
  normale: "#8B5CF6",
  profond: "#102A66",
  alerte: "#e11d48",
  gris: "#64748b",
} as const;

export const versCx = (v: Vec): Cx => ({ re: v.x, im: v.y });

// --- Mouvement réduit (accessibilité) --------------------------------------------------------------------------------

/** Vrai si le visiteur a demandé de réduire les animations (le rendu serveur suppose faux). */
export function useMouvementReduit(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(prefers-reduced-motion: reduce)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

// --- Horloge de simulation -------------------------------------------------------------------------------------------

export interface Horloge {
  t: number;
  enLecture: boolean;
  vitesse: number;
  reduit: boolean;
  setT: (t: number) => void;
  setVitesse: (v: number) => void;
  lecture: () => void;
  pause: () => void;
  /** Revient à t = 0 et relance la lecture. */
  recommencer: () => void;
  /** Revient à t = 0 sans lancer la lecture. */
  arreter: () => void;
}

/**
 * Horloge unique d'une simulation (une seule source de temps pour l'animation, les graphiques et les calculs). La boucle
 * requestAnimationFrame ne démarre qu'à la demande (jamais au rendu serveur), plafonne le pas de temps (onglet masqué),
 * limite les mises à jour React à ~30 par seconde, et avance par pas d'une demi-seconde si le visiteur a réduit les animations.
 */
export function useHorloge(duree: number): Horloge {
  const [tEtat, setTEtat] = useState(0);
  const [enLecture, setEnLecture] = useState(false);
  const [vitesse, setVitesseEtat] = useState(1);
  const reduit = useMouvementReduit();
  const tRef = useRef(0);
  const dureeRef = useRef(duree);
  const vitesseRef = useRef(1);
  const reduitRef = useRef(false);
  useEffect(() => {
    dureeRef.current = duree;
    vitesseRef.current = vitesse;
    reduitRef.current = reduit;
  }, [duree, vitesse, reduit]);

  useEffect(() => {
    if (!enLecture) return;
    let id = 0;
    let precedent = performance.now();
    let dernierRendu = precedent;
    const frame = (maintenant: number) => {
      const dt = Math.min(0.1, (maintenant - precedent) / 1000);
      precedent = maintenant;
      const d = dureeRef.current;
      let n = tRef.current + dt * vitesseRef.current;
      const fin = n >= d;
      if (fin) n = d;
      tRef.current = n;
      const cadence = reduitRef.current ? 500 : 30;
      if (fin || maintenant - dernierRendu >= cadence) {
        dernierRendu = maintenant;
        setTEtat(n);
      }
      if (fin) {
        setEnLecture(false);
        return;
      }
      id = requestAnimationFrame(frame);
    };
    id = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(id);
  }, [enLecture]);

  const t = Math.min(tEtat, duree);
  const setT = useCallback((v: number) => {
    tRef.current = v;
    setTEtat(v);
  }, []);
  return {
    t,
    enLecture,
    vitesse,
    reduit,
    setT,
    setVitesse: setVitesseEtat,
    lecture: () => {
      if (tRef.current >= dureeRef.current - 1e-9) setT(0);
      setEnLecture(true);
    },
    pause: () => setEnLecture(false),
    recommencer: () => {
      setT(0);
      setEnLecture(true);
    },
    arreter: () => {
      setEnLecture(false);
      setT(0);
    },
  };
}

const VITESSES = [0.25, 0.5, 1, 2];

/** Barre de commandes : Lecture / Pause, Recommencer, Réinitialiser, vitesse de lecture et curseur de l'instant observé. */
export function BarreLecture({ h, duree, onReinitialiser, instantEtiquette = "Instant observé" }: { h: Horloge; duree: number; onReinitialiser: () => void; instantEtiquette?: string }) {
  const idVitesse = useId();
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div role="group" aria-label="Commandes de la simulation" className="flex flex-wrap items-center gap-2">
        {h.enLecture ? (
          <Bouton onClick={h.pause} variante="plein">
            <IconPlayerPause size={18} aria-hidden="true" />
            Pause
          </Bouton>
        ) : (
          <Bouton onClick={h.lecture} variante="plein">
            <IconPlayerPlay size={18} aria-hidden="true" />
            Lecture
          </Bouton>
        )}
        <Bouton onClick={h.recommencer}>
          <IconRotate size={18} aria-hidden="true" />
          Recommencer
        </Bouton>
        <Bouton onClick={onReinitialiser}>
          <IconRefresh size={18} aria-hidden="true" />
          Réinitialiser
        </Bouton>
        <label htmlFor={idVitesse} className="ml-auto flex items-center gap-2 text-xs font-semibold text-fh-ardoise/80">
          Vitesse
          <select
            id={idVitesse}
            value={h.vitesse}
            onChange={(e) => h.setVitesse(Number(e.target.value))}
            className="min-h-11 rounded-lg border border-[#c9d8f5] bg-white px-2 text-base text-[#102A66]"
          >
            {VITESSES.map((v) => (
              <option key={v} value={v}>
                ×{String(v).replace(".", ",")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <Curseur etiquette={instantEtiquette} valeur={h.t} min={0} max={duree} pas={Math.max(0.01, duree / 600)} onChange={(v) => { h.pause(); h.setT(v); }} decimales={2} unite="s" />
      {h.reduit && <p className="text-xs text-fh-ardoise/70">Animations réduites sur cet appareil : la lecture avance par pas d&apos;une demi-seconde ; utilise aussi le curseur de temps.</p>}
    </div>
  );
}

/** Case à cocher à grande zone tactile (afficher les vecteurs, les calculs…). */
export function Interrupteur({ etiquette, coche, onChange }: { etiquette: string; coche: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium text-[#102A66]">
      <input id={id} type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-[#2563EB]" />
      {etiquette}
    </label>
  );
}

// --- Graduations ------------------------------------------------------------------------------------------------------

/** Graduations « nettes » (pas 1, 2 ou 5 × 10^k) couvrant [min, max]. */
export function ticksNets(min: number, max: number, cible = 5): number[] {
  const etendue = max - min;
  if (!(etendue > 0)) return [min];
  const brut = etendue / cible;
  const p = 10 ** Math.floor(Math.log10(brut));
  const f = brut / p;
  const pas = (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p;
  const res: number[] = [];
  for (let v = Math.ceil(min / pas - 1e-9) * pas; v <= max + 1e-9; v += pas) res.push(Number(v.toFixed(10)));
  return res;
}

function decimalesPas(ticks: number[]): number {
  if (ticks.length < 2) return 1;
  const pas = Math.abs(ticks[1] - ticks[0]);
  return pas >= 1 ? 0 : Math.min(4, Math.ceil(-Math.log10(pas) - 1e-9));
}

// --- Graphique temporel avec curseur --------------------------------------------------------------------------------

export interface SerieGraphique {
  f: (t: number) => number;
  couleur: string;
  libelle: string;
  pointille?: boolean;
}

/**
 * Graphique d'une grandeur en fonction du temps, avec le curseur de l'instant observé (commun à tous les graphiques d'une
 * simulation). Cliquer ou faire glisser (horizontalement) déplace l'instant. Repères facultatifs (ex. instant d'arrêt).
 */
export function Graphique({
  titre,
  unite,
  series,
  duree,
  t,
  onT,
  reperes = [],
  compact = false,
}: {
  titre: string;
  unite: string;
  series: SerieGraphique[];
  duree: number;
  t: number;
  onT?: (t: number) => void;
  reperes?: Array<{ t: number; libelle: string }>;
  /** Cadre plus étroit (440 × 250) et police plus grande : lisible sur téléphone quand le graphique occupe toute la largeur. */
  compact?: boolean;
}) {
  const W = compact ? 440 : 560;
  const H = compact ? 250 : 230;
  const FS = compact ? 15 : 14;
  const ML = 56;
  const MR = 14;
  const MT = 14;
  const MB = 30;
  const N = 200;
  const echant = series.map((s) => {
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const x = (duree * i) / N;
      const y = s.f(x);
      pts.push([x, Number.isFinite(y) ? y : 0]);
    }
    return pts;
  });
  let ymin = 0;
  let ymax = 0;
  for (const pts of echant) for (const [, y] of pts) {
    ymin = Math.min(ymin, y);
    ymax = Math.max(ymax, y);
  }
  if (ymax - ymin < 1e-9) {
    ymin -= 1;
    ymax += 1;
  }
  const marge = (ymax - ymin) * 0.12;
  ymin -= marge;
  ymax += marge;
  const X = (x: number) => ML + (x / duree) * (W - ML - MR);
  const Y = (y: number) => MT + ((ymax - y) / (ymax - ymin)) * (H - MT - MB);
  const ty = ticksNets(ymin, ymax, 4);
  const tx = ticksNets(0, duree, 6);
  const dy = decimalesPas(ty);
  const dx = decimalesPas(tx);
  const [actif, setActif] = useState(false);
  function depuis(ev: PointerEvent<SVGSVGElement>) {
    const rect = ev.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const px = ((ev.clientX - rect.left) * W) / rect.width;
    const v = ((px - ML) / (W - ML - MR)) * duree;
    onT?.(Math.min(duree, Math.max(0, v)));
  }
  return (
    <figure className="m-0 flex min-w-0 flex-col gap-1">
      <figcaption className="flex flex-wrap items-center gap-x-3 text-xs font-bold text-[#102A66]">
        <span>{titre}</span>
        {series.map((s) => (
          <span key={s.libelle} className="inline-flex items-center gap-1 font-medium" style={{ color: s.couleur }}>
            <span aria-hidden="true" className="inline-block h-0.5 w-4" style={{ background: s.couleur }} />
            {s.libelle}
          </span>
        ))}
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${titre}, en fonction du temps, instant observé ${fr(t)} s`}
        className="block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-white"
        style={{ touchAction: "pan-y", cursor: onT ? "ew-resize" : undefined }}
        onPointerDown={(ev) => {
          if (!onT) return;
          ev.currentTarget.setPointerCapture(ev.pointerId);
          setActif(true);
          depuis(ev);
        }}
        onPointerMove={(ev) => actif && depuis(ev)}
        onPointerUp={() => setActif(false)}
        onPointerCancel={() => setActif(false)}
      >
        {tx.map((x) => (
          <g key={`x${x}`}>
            <line x1={X(x)} y1={MT} x2={X(x)} y2={H - MB} stroke="#e8edf5" strokeWidth={1} />
            <text x={X(x)} y={H - 11} textAnchor="middle" fontSize={FS} fill="#64748b">
              {fr(x, dx)}
            </text>
          </g>
        ))}
        {ty.map((y) => (
          <g key={`y${y}`}>
            <line x1={ML} y1={Y(y)} x2={W - MR} y2={Y(y)} stroke="#e8edf5" strokeWidth={1} />
            <text x={ML - 6} y={Y(y) + 4} textAnchor="end" fontSize={FS} fill="#64748b">
              {fr(y, dy)}
            </text>
          </g>
        ))}
        <line x1={ML} y1={Y(0)} x2={W - MR} y2={Y(0)} stroke="#334155" strokeWidth={1.4} />
        <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="#334155" strokeWidth={1.4} />
        <text x={W - MR} y={H - 1} textAnchor="end" fontSize={FS} fontWeight={700} fill="#334155">
          t (s)
        </text>
        <text x={ML + 6} y={MT + 4} fontSize={FS} fontWeight={700} fill="#334155">
          {unite}
        </text>
        {reperes.map((r) => (
          <g key={r.libelle}>
            <line x1={X(r.t)} y1={MT} x2={X(r.t)} y2={H - MB} stroke="#94a3b8" strokeWidth={1.2} strokeDasharray="4 3" />
            <text x={X(r.t) + 4} y={MT + 12} fontSize={compact ? 13 : 10.5} fill="#475569">
              {r.libelle}
            </text>
          </g>
        ))}
        {series.map((s, i) => (
          <polyline
            key={s.libelle}
            points={echant[i].map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(" ")}
            fill="none"
            stroke={s.couleur}
            strokeWidth={2.6}
            strokeDasharray={s.pointille ? "7 5" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        <line x1={X(t)} y1={MT} x2={X(t)} y2={H - MB} stroke={CI.profond} strokeWidth={1.6} />
        {series.map((s) => (
          <circle key={`p${s.libelle}`} cx={X(t)} cy={Y(s.f(t))} r={5} fill={s.couleur} stroke="#fff" strokeWidth={2} />
        ))}
      </svg>
    </figure>
  );
}

// --- Plan orthonormé physique (x, y en mètres) ----------------------------------------------------------------------

/** Cadre orthonormé (échelle identique sur les deux axes) contenant tous les points, avec marge. */
export function cadreOrthonorme(points: Vec[], { marge = 0.15, ratio = 1.15, minimum = 1 }: { marge?: number; ratio?: number; minimum?: number } = {}): Bornes {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const p of points) {
    x0 = Math.min(x0, p.x);
    x1 = Math.max(x1, p.x);
    y0 = Math.min(y0, p.y);
    y1 = Math.max(y1, p.y);
  }
  if (!Number.isFinite(x0)) {
    x0 = y0 = -minimum;
    x1 = y1 = minimum;
  }
  let w = Math.max(x1 - x0, minimum);
  let h = Math.max(y1 - y0, minimum);
  w *= 1 + 2 * marge;
  h *= 1 + 2 * marge;
  if (w / h < ratio) w = h * ratio;
  else h = w / ratio;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { xmin: cx - w / 2, xmax: cx + w / 2, ymin: cy - h / 2, ymax: cy + h / 2 };
}

/**
 * Repère orthonormé (x vers la droite, y vers le haut), quadrillage et graduations en mètres, sans notation complexe. Les
 * enfants reçoivent les fonctions de conversion mètres → pixels du dessin.
 */
export function PlanPhysique({
  bornes,
  etiquette,
  children,
  axeX = "x (m)",
  axeY = "y (m)",
  largeur = 520,
  legendeOrigine = "O",
}: {
  bornes: Bornes;
  etiquette: string;
  children: (o: Outils) => ReactNode;
  axeX?: string;
  axeY?: string;
  largeur?: number;
  legendeOrigine?: string;
}) {
  const { xmin, xmax, ymin, ymax } = bornes;
  const U = largeur / (xmax - xmin);
  const W = largeur;
  const H = (ymax - ymin) * U;
  const arrondi = (v: number) => Math.round(v * 100) / 100;
  const X = (x: number) => arrondi((x - xmin) * U);
  const Y = (y: number) => arrondi((ymax - y) * U);
  const o: Outils = { X, Y, P: (z: Cx) => `${X(z.re)},${Y(z.im)}`, u: U, L: (v: number) => arrondi(v * U) };
  const tx = ticksNets(xmin, xmax, 7);
  const ty = ticksNets(ymin, ymax, 5);
  const pas = tx.length > 1 ? tx[1] - tx[0] : 1;
  const tyPropre = ty.filter((_, i) => i % 1 === 0);
  const dx = decimalesPas(tx);
  const axeXpos = Math.min(Math.max(0, ymin), ymax);
  const axeYpos = Math.min(Math.max(0, xmin), xmax);
  void pas;
  return (
    <svg viewBox={`0 0 ${W} ${arrondi(H)}`} role="img" aria-label={etiquette} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-white">
      {tx.map((x) => (
        <line key={`gx${x}`} x1={X(x)} y1={0} x2={X(x)} y2={H} stroke="#e8edf5" strokeWidth={1} />
      ))}
      {tyPropre.map((y) => (
        <line key={`gy${y}`} x1={0} y1={Y(y)} x2={W} y2={Y(y)} stroke="#e8edf5" strokeWidth={1} />
      ))}
      <line x1={0} y1={Y(axeXpos)} x2={W} y2={Y(axeXpos)} stroke="#334155" strokeWidth={1.5} />
      <line x1={X(axeYpos)} y1={0} x2={X(axeYpos)} y2={H} stroke="#334155" strokeWidth={1.5} />
      {tx
        .filter((x) => Math.abs(x) > 1e-9)
        .map((x) => (
          <text key={`tx${x}`} x={X(x)} y={Math.min(H - 3, Y(axeXpos) + 13)} textAnchor="middle" fontSize={10} fill="#64748b">
            {fr(x, dx)}
          </text>
        ))}
      {ty
        .filter((y) => Math.abs(y) > 1e-9)
        .map((y) => (
          <text key={`ty${y}`} x={Math.max(14, X(axeYpos) - 5)} y={Y(y) + 3.5} textAnchor="end" fontSize={10} fill="#64748b">
            {fr(y, decimalesPas(ty))}
          </text>
        ))}
      <text x={Math.max(10, X(axeYpos) - 5)} y={Math.min(H - 3, Y(axeXpos) + 13)} textAnchor="end" fontSize={11} fontWeight={700} fill="#334155">
        {legendeOrigine}
      </text>
      <text x={W - 4} y={Math.max(12, Y(axeXpos) - 6)} textAnchor="end" fontSize={11} fontWeight={700} fill="#334155">
        {axeX}
      </text>
      <text x={Math.min(W - 4, X(axeYpos) + 6)} y={12} fontSize={11} fontWeight={700} fill="#334155">
        {axeY}
      </text>
      {children(o)}
    </svg>
  );
}

/** Étiquette de texte lisible sur fond blanc (contour clair), pour les noms de vecteurs et de points. */
export function Etiquette({ x, y, children, couleur, ancre = "start", taille = 13 }: { x: number; y: number; children: ReactNode; couleur: string; ancre?: "start" | "middle" | "end"; taille?: number }) {
  return (
    <text x={x} y={y} textAnchor={ancre} fontSize={taille} fontWeight={700} fill={couleur} stroke="#fff" strokeWidth={3} paintOrder="stroke">
      {children}
    </text>
  );
}

/** Mobile (disque coloré) dans un PlanPhysique. */
export function Mobile({ o, p, couleur = CI.position, nom = "M", dx = 10, dy = -10 }: { o: Outils; p: Vec; couleur?: string; nom?: string; dx?: number; dy?: number }) {
  return (
    <g>
      <circle cx={o.X(p.x)} cy={o.Y(p.y)} r={7.5} fill={couleur} stroke="#fff" strokeWidth={2.2} />
      <Etiquette x={o.X(p.x) + dx} y={o.Y(p.y) + dy} couleur={couleur}>
        {nom}
      </Etiquette>
    </g>
  );
}

/** Ligne brisée (trace) dans un PlanPhysique. */
export function Trace({ o, pts, couleur = CI.position, epaisseur = 2, pointille = false, opacite = 1 }: { o: Outils; pts: Vec[]; couleur?: string; epaisseur?: number; pointille?: boolean; opacite?: number }) {
  return (
    <polyline
      points={pts.map((p) => `${o.X(p.x)},${o.Y(p.y)}`).join(" ")}
      fill="none"
      stroke={couleur}
      strokeWidth={epaisseur}
      strokeOpacity={opacite}
      strokeDasharray={pointille ? "6 5" : undefined}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

/** Texte des échelles des vecteurs (1 unité de longueur = k m/s, etc.). */
export function Echelle({ children }: { children: ReactNode }) {
  return <p className="text-xs text-fh-ardoise/70">{children}</p>;
}

/** Outils identité : permet de réutiliser `Fleche` (coordonnées déjà en pixels) hors d'un repère à échelle. */
export const OUTILS_PX: Outils = { X: (x) => x, Y: (y) => y, P: (z: Cx) => `${z.re},${z.im}`, u: 1, L: (v) => v };

/** Flèche entre deux points en pixels. */
export function FlechePx({ x1, y1, x2, y2, couleur, epaisseur = 3.2, pointille = false }: { x1: number; y1: number; x2: number; y2: number; couleur: string; epaisseur?: number; pointille?: boolean }) {
  return <Fleche o={OUTILS_PX} de={{ re: x1, im: y1 }} vers={{ re: x2, im: y2 }} couleur={couleur} epaisseur={epaisseur} pointille={pointille} />;
}

/** Échelle « propre » : pixels par unité tels que la valeur maximale occupe `pxMax` pixels. */
export function echellePx(valeurMax: number, pxMax: number, plafond = Infinity): number {
  if (!(valeurMax > 1e-12)) return 1;
  return Math.min(plafond, pxMax / valeurMax);
}
