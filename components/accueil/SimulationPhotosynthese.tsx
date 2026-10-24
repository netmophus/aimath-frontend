"use client";

import { useRef, useState } from "react";

import { useAnimation, useBoucle } from "./animation";
import { BoutonReinitialiser, CadreSimulation, Curseur, Formule, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

const NB = 5; // molécules de chaque sorte en transit
const LUMIERE0 = 70;

/** Trajet d'une molécule entre deux points, avec apparition et disparition en fondu. */
function trajet(p: number, de: [number, number], vers: [number, number]) {
  const t = p % 1;
  return { x: de[0] + (vers[0] - de[0]) * t, y: de[1] + (vers[1] - de[1]) * t, o: Math.min(1, t * 5, (1 - t) * 5) };
}

const CO2: [[number, number], [number, number]] = [[410, 70], [280, 150]];
const O2: [[number, number], [number, number]] = [[300, 175], [415, 235]];
const GLUCOSE: [[number, number], [number, number]] = [[225, 175], [225, 262]];

/** Feuille éclairée : le CO₂ entre, l'O₂ sort, le glucose est fabriqué ; tout s'arrête sans lumière. */
export default function SimulationPhotosynthese() {
  const [lumiere, setLumiere] = useState(LUMIERE0);
  const racine = useRef<HTMLDivElement>(null);
  const molecules = useRef<(SVGGElement | null)[]>([]);
  const compteur = useRef<HTMLSpanElement>(null);
  const phase = useRef(0);
  const glucose = useRef(0);
  const anime = useAnimation(racine);

  const k = lumiere / 100;
  // 3 groupes de NB molécules : CO₂ (0..NB-1), O₂ (NB..2NB-1), glucose (2NB..3NB-1)
  const trajets = [CO2, O2, GLUCOSE];
  const place = (i: number, ph: number) => {
    const [groupe, rang] = [Math.floor(i / NB), i % NB];
    const [de, vers] = trajets[groupe];
    return trajet(ph + rang / NB, de, vers);
  };

  useBoucle(anime && lumiere > 0, (dt) => {
    phase.current = (phase.current + dt * 0.45 * k) % 1;
    glucose.current += dt * 1.6 * k;
    molecules.current.forEach((g, i) => {
      if (!g) return;
      const { x, y, o } = place(i, phase.current);
      g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      g.setAttribute("opacity", o.toFixed(2));
    });
    if (compteur.current) compteur.current.textContent = String(Math.floor(glucose.current));
  });

  const sorte = (i: number) => Math.floor(i / NB);
  const COULEUR = ["fill-fh-ardoise", "fill-fh-bleu-vif", "fill-fh-orange"];
  const ETIQ = ["CO₂", "O₂", "glucose"];

  return (
    <div ref={racine} className="flex flex-col gap-5">
      <EncartConcept
        concept="Grâce à la lumière, les feuilles vertes fabriquent leur propre matière : la chlorophylle capte l'énergie lumineuse et l'utilise pour transformer le dioxyde de carbone de l'air et l'eau puisée par les racines en glucose. Du dioxygène est rejeté dans l'air. Sans lumière, la réaction s'arrête."
        observer="augmente la lumière : les molécules circulent plus vite et le glucose s'accumule plus vite. Mets la lumière à zéro : tout s'arrête."
      />
      <CadreSimulation
        titre="Éclaire une feuille"
        description="Règle l'intensité lumineuse et regarde le dioxyde de carbone entrer, le dioxygène sortir et le glucose se former."
        formule={<Formule bloc tex={"6\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O} \\xrightarrow{\\ \\text{lumière}\\ } \\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2}"} />}
        graphique={
          <svg viewBox="0 0 440 300" className="mx-auto h-auto w-full max-w-[480px]" role="img" aria-label={`Feuille éclairée à ${lumiere} pour cent : photosynthèse ${lumiere === 0 ? "arrêtée" : "en cours"}`}>
            <rect x={0} y={0} width={440} height={300} rx={10} className="fill-sky-50" />
            {/* soleil */}
            <g opacity={(0.25 + 0.75 * k).toFixed(3)}>
              {Array.from({ length: 10 }, (_, i) => {
                const a = (i / 10) * 2 * Math.PI;
                const r1 = 34;
                const r2 = 40 + 16 * k;
                return <line key={i} x1={(70 + r1 * Math.cos(a)).toFixed(1)} y1={(62 + r1 * Math.sin(a)).toFixed(1)} x2={(70 + r2 * Math.cos(a)).toFixed(1)} y2={(62 + r2 * Math.sin(a)).toFixed(1)} className="stroke-amber-400" strokeWidth={4} strokeLinecap="round" />;
              })}
              <circle cx={70} cy={62} r={26} className="fill-amber-300" />
            </g>
            {/* faisceau lumineux vers la feuille */}
            <path d="M105 90 L200 150 L190 175 L95 105 Z" className="fill-amber-300" opacity={0.5 * k} />
            {/* tige et feuille */}
            <path d="M225 290 Q228 235 225 190" fill="none" className="stroke-green-800" strokeWidth={6} strokeLinecap="round" />
            <path d="M225 195 C150 175 165 110 235 95 C315 115 310 185 225 195 Z" className={k > 0 ? "fill-green-500 stroke-green-800" : "fill-green-300 stroke-green-700"} strokeWidth={3} />
            <path d="M225 195 Q228 150 235 100" fill="none" className="stroke-green-800" strokeWidth={2} />
            <text x={240} y={150} className="fill-green-900 text-[11px] font-semibold">chlorophylle</text>
            {/* molécules */}
            {Array.from({ length: 3 * NB }, (_, i) => {
              const { x, y, o } = place(i, 0);
              const s = sorte(i);
              return (
                <g key={i} ref={(el) => { molecules.current[i] = el; }} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} opacity={k > 0 ? o : 0}>
                  <circle r={s === 2 ? 8 : 10} className={COULEUR[s]} />
                  <text y={3.5} textAnchor="middle" className="fill-white text-[8px] font-bold">{s === 2 ? "G" : ETIQ[s]}</text>
                </g>
              );
            })}
            <text x={415} y={50} textAnchor="end" className="fill-fh-ardoise text-[11px] font-semibold">CO₂ entre</text>
            <text x={425} y={262} textAnchor="end" className="fill-fh-bleu-vif text-[11px] font-semibold">O₂ sort</text>
            <text x={236} y={284} className="fill-fh-orange-fonce text-[11px] font-semibold">G : glucose</text>
          </svg>
        }
        commandes={
          <>
            <Curseur nom="Intensité lumineuse" valeurTexte={`${lumiere} %`} min={0} max={100} pas={10} valeur={lumiere} onChange={setLumiere} ariaLabel="Intensité lumineuse en pourcentage" />
            <BoutonReinitialiser onClick={() => setLumiere(LUMIERE0)} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette="Lumière">{lumiere} %</Valeur>
            <Valeur etiquette="Photosynthèse">{lumiere === 0 ? "arrêtée" : lumiere < 40 ? "lente" : lumiere < 80 ? "active" : "intense"}</Valeur>
            <Valeur etiquette="Glucose fabriqué (unités)" large>
              <span ref={compteur}>0</span>
            </Valeur>
          </>
        }
        commentaire={lumiere === 0 ? "Sans lumière, la chlorophylle ne reçoit aucune énergie : plus de glucose, plus de dioxygène rejeté. La feuille n'échange plus rien par photosynthèse." : "La lumière apporte l'énergie : la feuille absorbe du dioxyde de carbone, rejette du dioxygène et fabrique du glucose. Plus la lumière est forte, plus la production est rapide (jusqu'à une limite)."}
      />
    </div>
  );
}
