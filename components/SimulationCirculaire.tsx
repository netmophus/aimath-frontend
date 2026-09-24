"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from "react";

import {
  OMEGA_MAX_DEFAUT,
  OMEGA_MIN_DEFAUT,
  RAYON_MAX_DEFAUT,
  RAYON_MIN_DEFAUT,
  accelerationCentripete,
  angle,
  borneCurseur,
  vitesseLineaire,
  type CirculaireData,
} from "@/lib/circulaire";

/**
 * Simulation de mouvement circulaire uniforme — scène SVG maison (cercle,
 * mobile, vecteurs vitesse tangent/accélération centripète) + animation
 * React (requestAnimationFrame) + curseurs de réglage. Même raisonnement SSR
 * que components/SimulationMouvement.tsx : aucune API navigateur touchée
 * pendant le rendu lui-même (state React pur, la boucle requestAnimationFrame
 * ne démarre que dans un effect, après hydratation) — donc SSR-safe, PAS de
 * `next/dynamic({ ssr: false })` nécessaire.
 */

const TAILLE_SVG = 280;
const CENTRE = { x: 140, y: 140 };
const RAYON_PX = 95; // rayon À L'ÉCRAN, fixe — indépendant du vrai rayon (m) réglé par curseur (comme RacinesNiemes.tsx : la vraie valeur est affichée à part, en texte)

const COULEUR_CERCLE = "#1E2B6A"; // fh-bleu
const COULEUR_OM = "#1E2B6A";
const COULEUR_MOBILE = "#A52D0E"; // fh-orange-fonce
const COULEUR_VITESSE = "#1F2CA2"; // fh-bleu-vif
const COULEUR_ACCEL = "#D14205"; // fh-orange
const COULEUR_TEINTE_CERCLE = "rgba(30, 43, 106, 0.04)";

const LONGUEUR_VECTEUR_MIN = 14;
const LONGUEUR_VECTEUR_MAX = 78;
const PIXELS_PAR_V = 10;
const PIXELS_PAR_A = 4;

function formaterNombre(x: number): string {
  return x.toFixed(2);
}

/** Angle affiché normalisé dans [0°, 360°) — sinon θ grandit sans borne au
 * fil des tours et devient illisible. */
function formaterAngleDegres(thetaRad: number): string {
  const deg = ((thetaRad * 180) / Math.PI) % 360;
  const normalise = deg < 0 ? deg + 360 : deg;
  return normalise.toFixed(1);
}

function pointSurCercleEcran(thetaRad: number): { x: number; y: number } {
  return { x: CENTRE.x + RAYON_PX * Math.cos(thetaRad), y: CENTRE.y - RAYON_PX * Math.sin(thetaRad) };
}

function longueurVecteurPx(valeurAbs: number, pixelsParUnite: number): number {
  if (valeurAbs === 0) return 0;
  return Math.min(LONGUEUR_VECTEUR_MAX, Math.max(LONGUEUR_VECTEUR_MIN, valeurAbs * pixelsParUnite));
}

interface FlecheDirectionProps {
  x: number;
  y: number;
  /** Vecteur unitaire de direction — ignoré si `longueur` vaut 0. */
  dirX: number;
  dirY: number;
  longueur: number;
  couleur: string;
  libelle: string;
}

/** Vecteur dans une direction QUELCONQUE du plan (contrairement à
 * SimulationMouvement.tsx, purement horizontal) — ancré sur le mobile,
 * longueur nulle affichée comme un simple repère ponctuel avec son libellé. */
function FlecheDirection({ x, y, dirX, dirY, longueur, couleur, libelle }: FlecheDirectionProps) {
  if (longueur === 0) {
    return (
      <g>
        <circle cx={x} cy={y} r={2.5} fill={couleur} />
        <text x={x + 9} y={y - 6} fontSize={12} fontWeight={700} fill={couleur}>
          {libelle} = 0
        </text>
      </g>
    );
  }

  const xFin = x + dirX * longueur;
  const yFin = y + dirY * longueur;
  const tailleTete = 7;
  const perpX = -dirY;
  const perpY = dirX;
  const baseX = xFin - dirX * tailleTete;
  const baseY = yFin - dirY * tailleTete;
  const labelX = xFin + dirX * 15;
  const labelY = yFin + dirY * 15;

  return (
    <g stroke={couleur} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <line x1={x} y1={y} x2={xFin} y2={yFin} />
      <path
        d={`M ${baseX + perpX * 4.2} ${baseY + perpY * 4.2} L ${xFin} ${yFin} L ${baseX - perpX * 4.2} ${baseY - perpY * 4.2}`}
      />
      <text x={labelX} y={labelY} fontSize={13} fontWeight={700} fill={couleur} stroke="none" textAnchor="middle" dominantBaseline="middle">
        {libelle}
      </text>
    </g>
  );
}

interface SimulationCirculaireProps {
  data: CirculaireData;
}

export default function SimulationCirculaire({ data }: SimulationCirculaireProps) {
  const idRayon = useId();
  const idOmega = useId();
  const idScrub = useId();

  const [rayon, setRayon] = useState(data.rayon);
  const [omega, setOmega] = useState(data.omega);
  const [t, setT] = useState(0);
  const [enLecture, setEnLecture] = useState(false);

  const minuteurRef = useRef<number | null>(null);
  const dernierTimestampRef = useRef<number | null>(null);

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

  function handleChangerRayon(event: ChangeEvent<HTMLInputElement>) {
    setEnLecture(false);
    setT(0);
    setRayon(Number(event.target.value));
  }
  function handleChangerOmega(event: ChangeEvent<HTMLInputElement>) {
    setEnLecture(false);
    setT(0);
    setOmega(Number(event.target.value));
  }

  const theta = angle(omega, t);
  const v = vitesseLineaire(rayon, omega);
  const a = accelerationCentripete(rayon, omega);

  const mobile = pointSurCercleEcran(theta);

  // Direction tangente (vitesse) : point voisin sur le cercle, un peu plus
  // loin dans le sens de rotation — même technique que l'échantillonnage
  // d'arc de CercleTrigonometrique.tsx (dérivée par différence finie plutôt
  // que par une formule à signe à mémoriser, donc toujours cohérente avec le
  // tracé du mobile lui-même).
  const pointVoisin = pointSurCercleEcran(theta + Math.sign(omega || 1) * 0.01);
  const dirVXBrut = pointVoisin.x - mobile.x;
  const dirVYBrut = pointVoisin.y - mobile.y;
  const normeV = Math.hypot(dirVXBrut, dirVYBrut) || 1;
  const dirVX = dirVXBrut / normeV;
  const dirVY = dirVYBrut / normeV;

  // Direction centripète (accélération) : exactement du mobile vers O — un
  // vecteur radial, aucune approximation nécessaire.
  const dirAX = (CENTRE.x - mobile.x) / RAYON_PX;
  const dirAY = (CENTRE.y - mobile.y) / RAYON_PX;

  const longueurV = omega === 0 ? 0 : longueurVecteurPx(v, PIXELS_PAR_V);
  const longueurA = omega === 0 ? 0 : longueurVecteurPx(a, PIXELS_PAR_A);

  const bornesRayon = borneCurseur(data.rayon, RAYON_MIN_DEFAUT, RAYON_MAX_DEFAUT);
  const bornesOmega = borneCurseur(data.omega, OMEGA_MIN_DEFAUT, OMEGA_MAX_DEFAUT);

  const animationTerminee = t >= data.duree;
  const sens = omega > 0 ? "sens trigonométrique (antihoraire)" : omega < 0 ? "sens horaire" : "immobile";

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-fh-sable bg-white p-4">
      <svg
        role="img"
        aria-label={`Simulation de mouvement circulaire uniforme, angle ${formaterAngleDegres(theta)} degrés à l'instant ${formaterNombre(t)} secondes`}
        viewBox={`0 0 ${TAILLE_SVG} ${TAILLE_SVG}`}
        className="w-full max-w-[360px]"
      >
        <circle cx={CENTRE.x} cy={CENTRE.y} r={RAYON_PX} fill={COULEUR_TEINTE_CERCLE} stroke={COULEUR_CERCLE} strokeWidth={2} />

        {/* Rayon OM (pointillé) : montre que a est porté par OM, vers O */}
        <line x1={CENTRE.x} y1={CENTRE.y} x2={mobile.x} y2={mobile.y} stroke={COULEUR_OM} strokeWidth={1.25} strokeDasharray="4 3" opacity={0.6} />

        <circle cx={CENTRE.x} cy={CENTRE.y} r={3} fill={COULEUR_CERCLE} />
        <text x={CENTRE.x + 8} y={CENTRE.y - 8} fontSize={12} fontWeight={700} fill={COULEUR_CERCLE}>
          O
        </text>

        <FlecheDirection x={mobile.x} y={mobile.y} dirX={dirAX} dirY={dirAY} longueur={longueurA} couleur={COULEUR_ACCEL} libelle="a" />
        <FlecheDirection x={mobile.x} y={mobile.y} dirX={dirVX} dirY={dirVY} longueur={longueurV} couleur={COULEUR_VITESSE} libelle="v" />

        <circle cx={mobile.x} cy={mobile.y} r={7} fill={COULEUR_MOBILE} stroke="white" strokeWidth={1.5} />
      </svg>

      <div className="w-full max-w-sm rounded-lg bg-fh-creme px-3 py-2 text-center text-xs text-fh-ardoise">
        <span className="font-semibold text-fh-bleu-vif">v</span> garde une valeur constante (v = Rω) mais sa direction
        tourne ; <span className="font-semibold text-fh-orange-fonce">a</span> est toujours dirigée vers O
        (accélération centripète).
      </div>

      <p className="text-center text-sm font-semibold text-fh-bleu">
        Mouvement circulaire uniforme — {sens}
      </p>

      <p className="text-center font-mono text-sm text-fh-ardoise">
        t = {formaterNombre(t)} s · θ = {formaterAngleDegres(theta)}° · v = {formaterNombre(v)} m/s (constante) · a ={" "}
        {formaterNombre(a)} m/s² (constante)
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

      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={idRayon} className="text-xs text-fh-ardoise/70">
            R = {formaterNombre(rayon)} m
          </label>
          <input
            id={idRayon}
            type="range"
            min={bornesRayon.min}
            max={bornesRayon.max}
            step={0.1}
            value={rayon}
            onChange={handleChangerRayon}
            className="h-11 w-full accent-fh-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={idOmega} className="text-xs text-fh-ardoise/70">
            ω = {formaterNombre(omega)} rad/s
          </label>
          <input
            id={idOmega}
            type="range"
            min={bornesOmega.min}
            max={bornesOmega.max}
            step={0.1}
            value={omega}
            onChange={handleChangerOmega}
            className="h-11 w-full accent-fh-orange"
          />
        </div>
      </div>
    </div>
  );
}
