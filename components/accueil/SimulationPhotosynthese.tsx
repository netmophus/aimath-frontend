"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { useAnimation, useBoucle } from "./animation";
import { BoutonReinitialiser, CadreSimulation, Curseur, Formule, Tx, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

const NB = 5; // molécules de chaque sorte en transit
const LUMIERE0 = 70;
const VERT = "#2a9d4a";

/** Trajet d'une molécule entre deux points, avec apparition et disparition en fondu. */
function trajet(p: number, de: [number, number], vers: [number, number]) {
  const t = p % 1;
  return { x: de[0] + (vers[0] - de[0]) * t, y: de[1] + (vers[1] - de[1]) * t, o: Math.min(1, t * 5, (1 - t) * 5) };
}

// Deux couloirs de sens contraires, du même côté de la feuille : le CO₂ arrive de l'air vers la feuille (il s'efface à
// l'arrivée : il est consommé), l'O₂ part de la feuille vers l'air (il apparaît au départ : il est produit).
const CO2: [[number, number], [number, number]] = [[404, 62], [292, 124]];
const O2: [[number, number], [number, number]] = [[300, 178], [408, 238]];
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
  const idFlecheCo2 = useId();
  const idFlecheO2 = useId();

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

  // Sans lumière, plus aucune molécule n'est visible (l'animation est à l'arrêt : on ne laisse pas de molécules figées).
  useEffect(() => {
    if (lumiere === 0) molecules.current.forEach((g) => g?.setAttribute("opacity", "0"));
  }, [lumiere]);

  const sorte = (i: number) => Math.floor(i / NB);
  const COULEUR = ["fill-fh-ardoise", "fill-fh-bleu-vif", "fill-fh-orange"];
  const ETIQ = ["CO₂", "O₂", "glucose"];
  const flechesOpacite = lumiere > 0 ? 0.85 : 0.35;

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
          <svg viewBox="0 0 440 300" className="mx-auto h-auto w-full max-w-[480px]" role="img" aria-label={`Feuille éclairée à ${lumiere} pour cent : le dioxyde de carbone entre dans la feuille, le dioxygène en sort ; photosynthèse ${lumiere === 0 ? "arrêtée" : "en cours"}`}>
            <defs>
              <marker id={idFlecheCo2} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" className="fill-fh-ardoise" />
              </marker>
              <marker id={idFlecheO2} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 Z" className="fill-fh-bleu-vif" />
              </marker>
            </defs>
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
            {/* sens des deux flux : CO₂ de l'air vers la feuille, O₂ de la feuille vers l'air */}
            <g opacity={flechesOpacite} fill="none" strokeWidth={2} strokeDasharray="6 5" strokeLinecap="round">
              <line x1={CO2[0][0]} y1={CO2[0][1]} x2={CO2[1][0] + 8} y2={CO2[1][1] - 4} className="stroke-fh-ardoise" markerEnd={`url(#${idFlecheCo2})`} />
              <line x1={O2[0][0] - 4} y1={O2[0][1] + 2} x2={O2[1][0]} y2={O2[1][1]} className="stroke-fh-bleu-vif" markerEnd={`url(#${idFlecheO2})`} />
            </g>
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
            <text x={415} y={40} textAnchor="end" className="fill-fh-ardoise text-[11px] font-semibold">CO₂ entre</text>
            <text x={415} y={52} textAnchor="end" className="fill-fh-ardoise text-[10px]">de l&apos;air vers la feuille</text>
            <text x={425} y={270} textAnchor="end" className="fill-fh-bleu-vif text-[11px] font-semibold">O₂ sort</text>
            <text x={425} y={282} textAnchor="end" className="fill-fh-bleu-vif text-[10px]">de la feuille vers l&apos;air</text>
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

      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold" style={{ color: "#1f7a38" }}>Ce que la plante prend, fabrique et rejette</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Carte titre="Elle prend" couleur="#475569">
            <Tx>{"Du dioxyde de carbone ($\\mathrm{CO_2}$), puisé dans l'air par les feuilles, et de l'eau ($\\mathrm{H_2O}$), puisée dans le sol par les racines."}</Tx>
          </Carte>
          <Carte titre="Elle fabrique" couleur="#d14205">
            <Tx>{"Du glucose ($\\mathrm{C_6H_{12}O_6}$) : sa matière organique, sa « nourriture ». Il lui sert à grandir et à stocker de l'énergie."}</Tx>
          </Carte>
          <Carte titre="Elle rejette" couleur="#1f2ca2">
            <Tx>{"Du dioxygène ($\\mathrm{O_2}$), rejeté dans l'air. C'est l'oxygène que nous respirons."}</Tx>
          </Carte>
        </div>
        <div className="rounded-xl border-l-4 bg-white/70 p-4 text-sm leading-relaxed text-fh-ardoise sm:p-5 sm:text-base" style={{ borderColor: VERT }}>
          <p>
            <span className="font-bold text-fh-bleu">Le rôle de la chlorophylle : </span>
            c&apos;est le pigment vert de la feuille. Elle capte l&apos;énergie de la lumière. Sans lumière, il n&apos;y a pas d&apos;énergie, donc la photosynthèse s&apos;arrête : le glucose ne se forme plus.
          </p>
          <p className="mt-2">
            <span className="font-bold text-fh-bleu">Pourquoi c&apos;est important : </span>
            la photosynthèse est à la base de presque toutes les chaînes alimentaires et elle produit l&apos;oxygène de l&apos;atmosphère.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Petite carte « ce que la plante… » : titre coloré et texte (les formules chimiques sont en KaTeX via Tx). */
function Carte({ titre, couleur, children }: { titre: string; couleur: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-t-4 bg-white p-3 text-sm leading-relaxed text-fh-ardoise shadow-sm sm:p-4" style={{ borderColor: couleur }}>
      <p className="font-bold" style={{ color: couleur }}>{titre}</p>
      <p className="mt-1 leading-7">{children}</p>
    </div>
  );
}
