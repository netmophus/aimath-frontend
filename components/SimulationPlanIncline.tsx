"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ChangeEvent } from "react";

import {
  ANGLE_MAX_DEFAUT,
  ANGLE_MIN_DEFAUT,
  LONGUEUR_PENTE_M,
  MASSE_MAX_DEFAUT,
  MASSE_MIN_DEFAUT,
  accelerationPlan,
  borneCurseur,
  poids,
  positionSurPente,
  reactionNormale,
  resultante,
  tempsArrivee,
  type PlanInclineData,
} from "@/lib/planIncline";

/**
 * Simulation d'un solide glissant sans frottement sur un plan incliné —
 * scène SVG maison (triangle, bloc, vecteurs P/N/Résultante) + animation
 * React (requestAnimationFrame) + curseurs de réglage. Même raisonnement SSR
 * que components/SimulationMouvement.tsx et SimulationCirculaire.tsx :
 * aucune API navigateur touchée pendant le rendu lui-même (state React pur,
 * la boucle requestAnimationFrame ne démarre que dans un effect, après
 * hydratation) — donc SSR-safe, PAS de `next/dynamic({ ssr: false })`
 * nécessaire.
 */

const LARGEUR_SVG = 360;
const HAUTEUR_SVG = 260;
const BAS = { x: 300, y: 210 }; // sommet de l'angle α, à la base du plan
const LONGUEUR_PENTE_PX = 220; // longueur ÉCRAN de la pente — fixe, indépendante de LONGUEUR_PENTE_M
const DEMI_TAILLE_BLOC = 9;

const COULEUR_TRAIT = "#1E2B6A"; // fh-bleu
const COULEUR_TEINTE_PLAN = "#F0D8BF"; // fh-sable
const COULEUR_BLOC = "#D14205"; // fh-orange
const COULEUR_POIDS = "#1E2B6A"; // fh-bleu
const COULEUR_NORMALE = "#0F7A3D"; // vert
const COULEUR_RESULTANTE = "#D14205"; // fh-orange

const LONGUEUR_VECTEUR_MIN = 14;
const LONGUEUR_VECTEUR_MAX = 80;
const PIXELS_PAR_N = 0.6; // échelle d'affichage des forces (newtons -> px)

const DUREE_REELLE_CIBLE = 4; // secondes réelles visées pour l'animation complète, quel que soit l'angle

function formaterNombre(x: number): string {
  return x.toFixed(2);
}

interface FlecheDirectionProps {
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  longueur: number;
  couleur: string;
  libelle: string;
}

/** Vecteur dans une direction quelconque du plan — même composant que
 * SimulationCirculaire.tsx (dupliqué à dessein : chaque simulation reste
 * autonome, voir la convention déjà suivie pour lib/circulaire.ts vs
 * lib/mouvement.ts). Longueur nulle affichée comme un simple repère
 * ponctuel avec son libellé. */
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
  const labelX = xFin + dirX * 16;
  const labelY = yFin + dirY * 16;

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

function longueurVecteurPx(valeurAbs: number): number {
  if (valeurAbs === 0) return 0;
  return Math.min(LONGUEUR_VECTEUR_MAX, Math.max(LONGUEUR_VECTEUR_MIN, valeurAbs * PIXELS_PAR_N));
}

interface SimulationPlanInclineProps {
  data: PlanInclineData;
}

export default function SimulationPlanIncline({ data }: SimulationPlanInclineProps) {
  const idAngle = useId();
  const idMasse = useId();
  const idScrub = useId();

  const [angle, setAngle] = useState(data.angle);
  const [masse, setMasse] = useState(data.masse);
  const [t, setT] = useState(0);
  const [enLecture, setEnLecture] = useState(false);

  const minuteurRef = useRef<number | null>(null);
  const dernierTimestampRef = useRef<number | null>(null);

  const tArrivee = useMemo(() => tempsArrivee(angle), [angle]);
  const facteurTemps = useMemo(() => tArrivee / DUREE_REELLE_CIBLE, [tArrivee]);

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
        if (suivant >= tArrivee) {
          setEnLecture(false);
          return tArrivee;
        }
        return suivant;
      });

      minuteurRef.current = requestAnimationFrame(frame);
    }

    minuteurRef.current = requestAnimationFrame(frame);
    return arreterMinuteur;
  }, [enLecture, tArrivee, facteurTemps, arreterMinuteur]);

  function togglerLecture() {
    if (t >= tArrivee) setT(0);
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

  // Changer l'angle change la trajectoire (a_G change) : on repart de t = 0.
  function handleChangerAngle(event: ChangeEvent<HTMLInputElement>) {
    setEnLecture(false);
    setT(0);
    setAngle(Number(event.target.value));
  }

  // Changer la MASSE ne touche ni a_G ni la trajectoire : inutile de couper
  // l'animation en cours, seules les longueurs des vecteurs de force
  // (P, N, résultante) doivent se mettre à jour — la démonstration du point
  // pédagogique clé passe justement par le fait que rien d'autre ne bouge.
  function handleChangerMasse(event: ChangeEvent<HTMLInputElement>) {
    setMasse(Number(event.target.value));
  }

  const aG = accelerationPlan(angle);
  const P = poids(masse);
  const N = reactionNormale(masse, angle);
  const R = resultante(masse, angle);

  // Géométrie de la scène : triangle rectangle, angle α à la base (BAS),
  // sommet en haut à gauche — voir docs/syntaxe-plan-incline.md.
  const angleRad = (angle * Math.PI) / 180;
  const sommet = useMemo(
    () => ({ x: BAS.x - LONGUEUR_PENTE_PX * Math.cos(angleRad), y: BAS.y - LONGUEUR_PENTE_PX * Math.sin(angleRad) }),
    [angleRad]
  );
  const coinDroit = { x: sommet.x, y: BAS.y };

  const dirX = (BAS.x - sommet.x) / LONGUEUR_PENTE_PX; // unitaire, le long de la pente, vers le bas
  const dirY = (BAS.y - sommet.y) / LONGUEUR_PENTE_PX;
  const perpX = dirY; // unitaire, perpendiculaire à la pente, vers l'extérieur (voir calcul dans le rapport)
  const perpY = -dirX;

  // Arc marquant l'angle α à la base — échantillonné en polyligne plutôt
  // qu'un arc SVG "A" (même technique que components/CercleTrigonometrique.tsx,
  // évite tout risque d'erreur de sens/flag de balayage).
  const arcPoints = useMemo(() => {
    const rayon = 28;
    let angle0 = Math.atan2(0, -1); // direction du sol (vers coinDroit), = π
    let angle1 = Math.atan2(sommet.y - BAS.y, sommet.x - BAS.x); // direction de la pente (vers sommet)
    if (angle0 < 0) angle0 += 2 * Math.PI;
    if (angle1 < 0) angle1 += 2 * Math.PI;
    const nbPas = 12;
    return Array.from({ length: nbPas + 1 }, (_, i) => {
      const a = angle0 + ((angle1 - angle0) * i) / nbPas;
      return { x: BAS.x + rayon * Math.cos(a), y: BAS.y + rayon * Math.sin(a) };
    });
  }, [sommet]);
  const cheminArc = arcPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const milieuArc = arcPoints[Math.floor(arcPoints.length / 2)];

  // Position du bloc sur la pente, à l'instant t.
  const distancePx = Math.min(1, positionSurPente(angle, t) / LONGUEUR_PENTE_M) * LONGUEUR_PENTE_PX;
  const pointSurLigne = { x: sommet.x + dirX * distancePx, y: sommet.y + dirY * distancePx };
  const decalage = DEMI_TAILLE_BLOC + 1;
  const centreBloc = { x: pointSurLigne.x + perpX * decalage, y: pointSurLigne.y + perpY * decalage };

  const longueurP = longueurVecteurPx(P);
  const longueurN = longueurVecteurPx(N);
  const longueurR = longueurVecteurPx(R);

  const bornesAngle = borneCurseur(data.angle, ANGLE_MIN_DEFAUT, ANGLE_MAX_DEFAUT);
  const bornesMasse = borneCurseur(data.masse, MASSE_MIN_DEFAUT, MASSE_MAX_DEFAUT);

  const animationTerminee = t >= tArrivee;

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-fh-sable bg-white p-4">
      <svg
        role="img"
        aria-label={`Simulation de plan incliné, angle ${formaterNombre(angle)} degrés, masse ${formaterNombre(masse)} kilogrammes`}
        viewBox={`0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}`}
        className="w-full max-w-[420px]"
      >
        {/* Sol */}
        <line x1={sommet.x - 30} y1={BAS.y} x2={BAS.x + 40} y2={BAS.y} stroke={COULEUR_TRAIT} strokeWidth={2} />

        {/* Plan incliné (triangle) */}
        <path
          d={`M ${sommet.x} ${sommet.y} L ${BAS.x} ${BAS.y} L ${coinDroit.x} ${coinDroit.y} Z`}
          fill={COULEUR_TEINTE_PLAN}
          stroke={COULEUR_TRAIT}
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Arc d'angle α */}
        <path d={cheminArc} fill="none" stroke={COULEUR_TRAIT} strokeWidth={1.5} />
        <text x={milieuArc.x} y={milieuArc.y} fontSize={12} fontWeight={700} fill={COULEUR_TRAIT} textAnchor="middle" dominantBaseline="middle">
          α
        </text>

        {/* Vecteurs de force, ancrés au centre du bloc */}
        <FlecheDirection x={centreBloc.x} y={centreBloc.y} dirX={0} dirY={1} longueur={longueurP} couleur={COULEUR_POIDS} libelle="P" />
        <FlecheDirection x={centreBloc.x} y={centreBloc.y} dirX={perpX} dirY={perpY} longueur={longueurN} couleur={COULEUR_NORMALE} libelle="N" />
        <FlecheDirection
          x={centreBloc.x}
          y={centreBloc.y}
          dirX={dirX}
          dirY={dirY}
          longueur={longueurR}
          couleur={COULEUR_RESULTANTE}
          libelle="P + N"
        />

        {/* Bloc, aligné avec la pente */}
        <rect
          x={centreBloc.x - DEMI_TAILLE_BLOC}
          y={centreBloc.y - DEMI_TAILLE_BLOC}
          width={DEMI_TAILLE_BLOC * 2}
          height={DEMI_TAILLE_BLOC * 2}
          fill={COULEUR_BLOC}
          stroke="white"
          strokeWidth={1.5}
          transform={`rotate(${angle} ${centreBloc.x} ${centreBloc.y})`}
        />
      </svg>

      <div className="w-full max-w-sm rounded-lg bg-fh-creme px-3 py-2 text-center text-xs text-fh-ardoise">
        Changer la <span className="font-semibold text-fh-bleu">masse</span> change P (et N, et la résultante) mais
        jamais <span className="font-semibold text-fh-orange-fonce">a_G</span> : a_G = g·sin(α) ne dépend que de
        l&apos;angle.
      </div>

      <p className="text-center text-sm font-semibold text-fh-orange-fonce">
        a_G = g·sin(α) = {formaterNombre(aG)} m/s² — indépendante de la masse
      </p>

      <p className="text-center font-mono text-sm text-fh-ardoise">
        α = {formaterNombre(angle)}° · m = {formaterNombre(masse)} kg
      </p>
      <p className="text-center font-mono text-sm text-fh-ardoise">
        P = {formaterNombre(P)} N · N = {formaterNombre(N)} N · Résultante = {formaterNombre(R)} N
      </p>

      <div className="flex w-full max-w-sm flex-col gap-1">
        <label htmlFor={idScrub} className="text-xs text-fh-ardoise/70">
          Temps (0 à {formaterNombre(tArrivee)} s)
        </label>
        <input
          id={idScrub}
          type="range"
          min={0}
          max={tArrivee}
          step={tArrivee / 500}
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
          <label htmlFor={idAngle} className="text-xs text-fh-ardoise/70">
            α = {formaterNombre(angle)}°
          </label>
          <input
            id={idAngle}
            type="range"
            min={bornesAngle.min}
            max={bornesAngle.max}
            step={1}
            value={angle}
            onChange={handleChangerAngle}
            className="h-11 w-full accent-fh-orange"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor={idMasse} className="text-xs text-fh-ardoise/70">
            m = {formaterNombre(masse)} kg
          </label>
          <input
            id={idMasse}
            type="range"
            min={bornesMasse.min}
            max={bornesMasse.max}
            step={0.5}
            value={masse}
            onChange={handleChangerMasse}
            className="h-11 w-full accent-fh-orange"
          />
        </div>
      </div>
    </div>
  );
}
