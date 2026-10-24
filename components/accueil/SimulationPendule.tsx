"use client";

import { useRef, useState } from "react";

import { nombreFr } from "@/lib/accueil/mathsLabo";
import { useAnimation, useBoucle } from "./animation";
import { BoutonReinitialiser, CadreSimulation, Curseur, Formule, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

const G = 9.81;
const PX = 130; // pixels par mètre
const PIVOT = { x: 200, y: 30 };
const L0 = 1;
const AMP0 = 25;

/** Pendule simple : θ(t) = θ₀·cos(2πt/T) avec T = 2π√(L/g) (petites oscillations). */
export default function SimulationPendule() {
  const [longueurCm, setLongueurCm] = useState(L0 * 100);
  const [amplitude, setAmplitude] = useState(AMP0);
  const racine = useRef<HTMLDivElement>(null);
  const bras = useRef<SVGGElement>(null);
  const phase = useRef(0);
  const anime = useAnimation(racine);

  const L = longueurCm / 100;
  const T = 2 * Math.PI * Math.sqrt(L / G);
  const longueurPx = L * PX;
  const angle = (ph: number) => amplitude * Math.cos(2 * Math.PI * ph);
  const rotation = (deg: number) => `rotate(${deg.toFixed(2)} ${PIVOT.x} ${PIVOT.y})`;

  useBoucle(anime, (dt) => {
    phase.current = (phase.current + dt / T) % 1;
    bras.current?.setAttribute("transform", rotation(angle(phase.current)));
  });

  const bout = PIVOT.y + longueurPx;
  const arc = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return `${(PIVOT.x - longueurPx * Math.sin(r)).toFixed(1)} ${(PIVOT.y + longueurPx * Math.cos(r)).toFixed(1)}`;
  };

  return (
    <div ref={racine} className="flex flex-col gap-5">
      <EncartConcept
        concept="Un pendule simple est une masse suspendue à un fil qui oscille de part et d'autre de sa position d'équilibre. Pour de petits angles, la durée d'un aller-retour, appelée période, ne dépend ni de la masse ni de l'amplitude : elle ne dépend que de la longueur du fil et de l'intensité de la pesanteur g."
        observer="règle l'amplitude : la période ne change pas. Multiplie la longueur par 4 : la période est multipliée par 2."
      />
      <CadreSimulation
        titre="Mesure la période d'un pendule"
        description="Change la longueur du fil et l'amplitude, puis compare la durée d'une oscillation."
        formule={<Formule tex={"T = 2\\pi\\sqrt{\\dfrac{L}{g}} \\qquad g = 9{,}81\\ \\mathrm{m\\cdot s^{-2}}"} />}
        graphique={
          <svg viewBox="0 0 400 340" className="mx-auto h-auto w-full max-w-[440px]" role="img" aria-label={`Pendule de longueur ${nombreFr(L, 2)} mètre, amplitude ${amplitude} degrés, période ${nombreFr(T, 2)} seconde`}>
            <rect x={110} y={PIVOT.y - 14} width={180} height={10} rx={3} className="fill-fh-ardoise" />
            {/* arc d'oscillation et positions extrêmes */}
            <path d={`M${arc(-amplitude)} A${longueurPx.toFixed(1)} ${longueurPx.toFixed(1)} 0 0 0 ${arc(amplitude)}`} fill="none" className="stroke-fh-sable" strokeWidth={2} strokeDasharray="5 5" />
            <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={bout + 24} className="stroke-fh-ardoise/40" strokeWidth={1} strokeDasharray="3 4" />
            <g ref={bras} transform={rotation(angle(0))}>
              <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={bout} className="stroke-fh-ardoise" strokeWidth={2} />
              <circle cx={PIVOT.x} cy={bout} r={14 + L * 3} className="fill-fh-orange stroke-fh-orange-fonce" strokeWidth={2} />
            </g>
            <circle cx={PIVOT.x} cy={PIVOT.y} r={4} className="fill-fh-bleu" />
            <text x={PIVOT.x + 10} y={PIVOT.y + longueurPx / 2} className="fill-fh-bleu text-[12px] font-semibold">L = {nombreFr(L, 2)} m</text>
          </svg>
        }
        commandes={
          <>
            <Curseur
              nom="Longueur du fil L"
              valeurTexte={`L = ${nombreFr(L, 2)} m`}
              min={25}
              max={200}
              pas={5}
              valeur={longueurCm}
              onChange={setLongueurCm}
              ariaLabel="Longueur du pendule en centimètres"
            />
            <Curseur
              nom="Amplitude θ₀"
              valeurTexte={`${amplitude}°`}
              min={5}
              max={30}
              pas={1}
              valeur={amplitude}
              onChange={setAmplitude}
              ariaLabel="Amplitude en degrés"
            />
            <BoutonReinitialiser onClick={() => { setLongueurCm(L0 * 100); setAmplitude(AMP0); }} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette="Période T">{nombreFr(T, 2)} s</Valeur>
            <Valeur etiquette={<>Fréquence <Formule tex={"\\dfrac{1}{T}"} /></>}>{nombreFr(1 / T, 2)} Hz</Valeur>
            <Valeur etiquette="Longueur L">{nombreFr(L, 2)} m</Valeur>
            <Valeur etiquette="Amplitude">{amplitude}°</Valeur>
          </>
        }
        commentaire={`Avec L = ${nombreFr(L, 2)} m, un aller-retour dure ${nombreFr(T, 2)} s. La période ne dépend pas de l'amplitude (tant que l'angle reste petit) : seule la longueur compte. Quadrupler L double T.`}
      />
    </div>
  );
}
