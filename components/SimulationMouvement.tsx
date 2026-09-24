"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from "react";

import {
  A_MAX_DEFAUT,
  A_MIN_DEFAUT,
  LABELS_TYPE_MOUVEMENT,
  V0_MAX_DEFAUT,
  V0_MIN_DEFAUT,
  X0_MAX_DEFAUT,
  X0_MIN_DEFAUT,
  borneCurseur,
  calculerEtendueTrajectoire,
  determinerTypeMouvement,
  position,
  vitesseInstantanee,
  type EtendueTrajectoire,
  type MouvementData,
} from "@/lib/mouvement";

/**
 * Simulation de mouvement rectiligne (uniforme ou uniformément varié) —
 * scène SVG maison (axe gradué, mobile, vecteurs vitesse/accélération) +
 * animation React (requestAnimationFrame) + curseurs de réglage. Même
 * raisonnement SSR que components/HorlogeModulaire.tsx : aucune API
 * navigateur touchée pendant le rendu lui-même (state React pur, la boucle
 * requestAnimationFrame ne démarre que dans un effect, après hydratation) —
 * donc SSR-safe, PAS de `next/dynamic({ ssr: false })` nécessaire.
 */

const LARGEUR_SVG = 400;
const HAUTEUR_SVG = 160;
const MARGE_H = 26;
const AXE_Y = 88;
const LANE_VITESSE_Y = AXE_Y - 34;
const LANE_ACCEL_Y = AXE_Y + 38;

const COULEUR_AXE = "#1E2B6A"; // fh-bleu
const COULEUR_MOBILE = "#A52D0E"; // fh-orange-fonce (contraste net avec le vecteur vitesse)
const COULEUR_VITESSE = "#1F2CA2"; // fh-bleu-vif
const COULEUR_ACCEL = "#D14205"; // fh-orange

const LONGUEUR_VECTEUR_MIN = 14;
const LONGUEUR_VECTEUR_MAX = 90;
const PIXELS_PAR_MS = 6; // échelle d'affichage du vecteur vitesse (m/s -> px)
const PIXELS_PAR_MS2 = 12; // échelle d'affichage du vecteur accélération (m/s² -> px)

const COULEUR_PAR_TYPE: Record<string, string> = {
  uniforme: "#1E2B6A",
  accelere: "#0F7A3D",
  retarde: "#C0392B",
};

function formaterNombre(x: number): string {
  return x.toFixed(2);
}

/** Pas de graduation "rond" (1/2/5 × 10ⁿ) visant environ 8 graduations. */
function calculerPasGraduation(etendueMetres: number): number {
  const brut = etendueMetres / 8;
  const magnitude = Math.pow(10, Math.floor(Math.log10(brut)));
  const normalise = brut / magnitude;
  const pas = normalise < 1.5 ? 1 : normalise < 3.5 ? 2 : normalise < 7.5 ? 5 : 10;
  return pas * magnitude;
}

function metresVersPx(metres: number, etendue: EtendueTrajectoire): number {
  const ratio = (metres - etendue.min) / (etendue.max - etendue.min);
  return MARGE_H + ratio * (LARGEUR_SVG - 2 * MARGE_H);
}

function longueurVecteurPx(valeur: number, pixelsParUnite: number): number {
  if (valeur === 0) return 0;
  const brut = Math.abs(valeur) * pixelsParUnite;
  const bornee = Math.min(LONGUEUR_VECTEUR_MAX, Math.max(LONGUEUR_VECTEUR_MIN, brut));
  return valeur > 0 ? bornee : -bornee;
}

interface FlecheHorizontaleProps {
  x: number;
  y: number;
  longueur: number;
  couleur: string;
  libelle: string;
}

/** Vecteur horizontal (vitesse ou accélération), ancré sur la position
 * courante du mobile — longueur nulle affichée comme un simple repère
 * ponctuel avec son libellé, pour que "v" / "a" restent visibles même à 0. */
function FlecheHorizontale({ x, y, longueur, couleur, libelle }: FlecheHorizontaleProps) {
  if (longueur === 0) {
    return (
      <g>
        <circle cx={x} cy={y} r={2.5} fill={couleur} />
        <text x={x + 10} y={y} fontSize={12} fontWeight={700} fill={couleur} dominantBaseline="middle">
          {libelle} = 0
        </text>
      </g>
    );
  }

  const xFin = x + longueur;
  const sens = longueur > 0 ? 1 : -1;
  const tailleTete = 7;

  return (
    <g stroke={couleur} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x} y1={y} x2={xFin} y2={y} />
      <path d={`M ${xFin - sens * tailleTete} ${y - tailleTete * 0.7} L ${xFin} ${y} L ${xFin - sens * tailleTete} ${y + tailleTete * 0.7}`} />
      <text
        x={xFin + sens * 6}
        y={y}
        fontSize={13}
        fontWeight={700}
        fill={couleur}
        stroke="none"
        textAnchor={sens > 0 ? "start" : "end"}
        dominantBaseline="middle"
      >
        {libelle}
      </text>
    </g>
  );
}

interface SimulationMouvementProps {
  data: MouvementData;
}

export default function SimulationMouvement({ data }: SimulationMouvementProps) {
  const idX0 = useId();
  const idV0 = useId();
  const idA = useId();
  const idScrub = useId();

  const [x0, setX0] = useState(data.x0);
  const [v0, setV0] = useState(data.v0);
  const [a, setA] = useState(data.a);
  const [t, setT] = useState(0);
  const [enLecture, setEnLecture] = useState(false);

  const minuteurRef = useRef<number | null>(null);
  const dernierTimestampRef = useRef<number | null>(null);

  // Vitesse de lecture : la durée réelle de l'animation vise ~10 s quel que
  // soit `duree` (un `duree: 120` ne doit pas obliger l'élève à attendre
  // deux minutes) — jamais plus lent que le temps réel (facteur >= 1).
  const facteurTemps = useMemo(() => Math.max(1, data.duree / 10), [data.duree]);

  const arreterMinuteur = useCallback(() => {
    if (minuteurRef.current !== null) {
      cancelAnimationFrame(minuteurRef.current);
      minuteurRef.current = null;
    }
    dernierTimestampRef.current = null;
  }, []);

  useEffect(() => arreterMinuteur, [arreterMinuteur]);

  useEffect(() => {
    if (!enLecture) return;

    function frame(timestamp: number) {
      if (dernierTimestampRef.current === null) dernierTimestampRef.current = timestamp;
      const deltaSecondes = (timestamp - dernierTimestampRef.current) / 1000;
      dernierTimestampRef.current = timestamp;

      setT((precedent) => {
        const suivant = precedent + deltaSecondes * facteurTemps;
        if (suivant >= data.duree) {
          setEnLecture(false);
          return data.duree;
        }
        return suivant;
      });

      minuteurRef.current = requestAnimationFrame(frame);
    }

    minuteurRef.current = requestAnimationFrame(frame);
    return arreterMinuteur;
  }, [enLecture, data.duree, facteurTemps, arreterMinuteur]);

  function togglerLecture() {
    if (t >= data.duree) setT(0);
    setEnLecture((v) => !v);
  }

  function reinitialiser() {
    setEnLecture(false);
    setT(0);
  }

  function handleScrub(event: ChangeEvent<HTMLInputElement>) {
    setEnLecture(false);
    setT(Number(event.target.value));
  }

  // Modifier un réglage repart proprement de t = 0 plutôt que de sauter en
  // cours d'animation vers une trajectoire différente.
  function handleChangerX0(event: ChangeEvent<HTMLInputElement>) {
    setEnLecture(false);
    setT(0);
    setX0(Number(event.target.value));
  }
  function handleChangerV0(event: ChangeEvent<HTMLInputElement>) {
    setEnLecture(false);
    setT(0);
    setV0(Number(event.target.value));
  }
  function handleChangerA(event: ChangeEvent<HTMLInputElement>) {
    setEnLecture(false);
    setT(0);
    setA(Number(event.target.value));
  }

  const xActuel = position(x0, v0, a, t);
  const vActuel = vitesseInstantanee(v0, a, t);
  const type = determinerTypeMouvement(v0, a, t);

  const etendue = useMemo(() => calculerEtendueTrajectoire(x0, v0, a, data.duree), [x0, v0, a, data.duree]);
  const pasGraduation = useMemo(() => calculerPasGraduation(etendue.max - etendue.min), [etendue]);

  const graduations = useMemo(() => {
    const valeurs: number[] = [];
    const depart = Math.ceil(etendue.min / pasGraduation) * pasGraduation;
    for (let v = depart; v <= etendue.max; v += pasGraduation) {
      valeurs.push(Math.round(v * 1000) / 1000);
    }
    return valeurs;
  }, [etendue, pasGraduation]);

  const mobileXPx = metresVersPx(xActuel, etendue);
  const longueurVitessePx = longueurVecteurPx(vActuel, PIXELS_PAR_MS);
  const longueurAccelPx = longueurVecteurPx(a, PIXELS_PAR_MS2);

  const bornesX0 = borneCurseur(data.x0, X0_MIN_DEFAUT, X0_MAX_DEFAUT);
  const bornesV0 = borneCurseur(data.v0, V0_MIN_DEFAUT, V0_MAX_DEFAUT);
  const bornesA = borneCurseur(data.a, A_MIN_DEFAUT, A_MAX_DEFAUT);

  const animationTerminee = t >= data.duree;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-fh-sable bg-white p-4">
      <svg
        role="img"
        aria-label={`Simulation de mouvement rectiligne, position ${formaterNombre(xActuel)} mètres à l'instant ${formaterNombre(t)} secondes`}
        viewBox={`0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}`}
        className="w-full max-w-[480px]"
      >
        {/* Axe gradué */}
        <line x1={MARGE_H} y1={AXE_Y} x2={LARGEUR_SVG - MARGE_H} y2={AXE_Y} stroke={COULEUR_AXE} strokeWidth={2} />
        <path
          d={`M ${LARGEUR_SVG - MARGE_H - 7} ${AXE_Y - 5} L ${LARGEUR_SVG - MARGE_H} ${AXE_Y} L ${LARGEUR_SVG - MARGE_H - 7} ${AXE_Y + 5}`}
          stroke={COULEUR_AXE}
          strokeWidth={2}
          fill="none"
        />
        <text x={LARGEUR_SVG - MARGE_H} y={AXE_Y - 10} fontSize={11} fill={COULEUR_AXE} textAnchor="end">
          x (m)
        </text>

        {graduations.map((valeur) => {
          const xPx = metresVersPx(valeur, etendue);
          return (
            <g key={valeur}>
              <line x1={xPx} y1={AXE_Y - 4} x2={xPx} y2={AXE_Y + 4} stroke={COULEUR_AXE} strokeWidth={1.5} />
              <text x={xPx} y={AXE_Y + 16} fontSize={9} fill={COULEUR_AXE} textAnchor="middle">
                {valeur}
              </text>
            </g>
          );
        })}

        {/* Vecteur accélération (sous l'axe, constant) */}
        <FlecheHorizontale x={mobileXPx} y={LANE_ACCEL_Y} longueur={longueurAccelPx} couleur={COULEUR_ACCEL} libelle="a" />

        {/* Vecteur vitesse (au-dessus de l'axe, varie avec t) */}
        <FlecheHorizontale x={mobileXPx} y={LANE_VITESSE_Y} longueur={longueurVitessePx} couleur={COULEUR_VITESSE} libelle="v" />

        {/* Mobile */}
        <circle cx={mobileXPx} cy={AXE_Y} r={7} fill={COULEUR_MOBILE} stroke="white" strokeWidth={1.5} />
      </svg>

      <p className="text-center text-sm font-semibold" style={{ color: COULEUR_PAR_TYPE[type] }}>
        {LABELS_TYPE_MOUVEMENT[type]}
      </p>

      <p className="text-center font-mono text-sm text-fh-ardoise">
        t = {formaterNombre(t)} s · x(t) = {formaterNombre(xActuel)} m · v(t) = {formaterNombre(vActuel)} m/s · a ={" "}
        {formaterNombre(a)} m/s²
      </p>

      <div className="flex w-full max-w-sm flex-col gap-1">
        <label htmlFor={idScrub} className="text-xs text-fh-ardoise/70">
          Temps (0 à {data.duree} s)
        </label>
        <input
          id={idScrub}
          type="range"
          min={0}
          max={data.duree}
          step={data.duree / 500}
          value={t}
          onChange={handleScrub}
          className="h-11 w-full accent-fh-bleu-vif"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={togglerLecture}
          className="min-h-11 min-w-24 rounded-full bg-fh-orange px-4 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          {enLecture ? "⏸ Pause" : animationTerminee ? "▶ Rejouer" : "▶ Lecture"}
        </button>
        <button
          type="button"
          onClick={reinitialiser}
          className="min-h-11 rounded-full px-4 text-sm font-medium text-fh-ardoise/70 transition-colors hover:bg-fh-sable/60"
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={idX0} className="text-xs text-fh-ardoise/70">
            x₀ = {formaterNombre(x0)} m
          </label>
          <input
            id={idX0}
            type="range"
            min={bornesX0.min}
            max={bornesX0.max}
            step={0.5}
            value={x0}
            onChange={handleChangerX0}
            className="h-11 w-full accent-fh-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={idV0} className="text-xs text-fh-ardoise/70">
            v₀ = {formaterNombre(v0)} m/s
          </label>
          <input
            id={idV0}
            type="range"
            min={bornesV0.min}
            max={bornesV0.max}
            step={0.5}
            value={v0}
            onChange={handleChangerV0}
            className="h-11 w-full accent-fh-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={idA} className="text-xs text-fh-ardoise/70">
            a = {formaterNombre(a)} m/s²
          </label>
          <input
            id={idA}
            type="range"
            min={bornesA.min}
            max={bornesA.max}
            step={0.25}
            value={a}
            onChange={handleChangerA}
            className="h-11 w-full accent-fh-orange"
          />
        </div>
      </div>
    </div>
  );
}
