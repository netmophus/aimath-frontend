"use client";

import { useId, useMemo, useState } from "react";

import { branche, commentaireFonction, extremaFonction, FONCTION, nombreFr } from "@/lib/accueil/mathsLabo";
import { BoutonReinitialiser, CadreSimulation, chemin, Curseur, Formule, grad, repere, Tx, Valeur } from "./commun";

const L = 400;
const BORNE = 6;
const R = repere(-BORNE, BORNE, -BORNE, BORNE, L, L);
const GRADUATIONS = [-6, -4, -2, 2, 4, 6];

/** « = 2 » si le nombre est entier, sinon « ≈ 1,41 » (le signe de relation est inclus). */
const egalOuApprox = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? `= ${nombreFr(v, 0)}` : `≈ ${nombreFr(v, 2)}`);

/** f_a(x) = x + a/x : les deux branches sont tracées séparément (jamais reliées à travers x = 0). */
export default function SimulationFonction() {
  const [a, setA] = useState<number>(FONCTION.initial);
  const idClip = useId();

  const cheminPositif = useMemo(() => chemin(branche(a, 1, BORNE + 1).map(([x, y]) => [R.X(x), R.Y(y)])), [a]);
  const cheminNegatif = useMemo(() => chemin(branche(a, -1, BORNE + 1).map(([x, y]) => [R.X(x), R.Y(y)])), [a]);
  const extrema = extremaFonction(a);

  return (
    <CadreSimulation
      titre="Explore les asymptotes d'une fonction"
      description="Fais varier le paramètre et observe comment évoluent les deux branches de la courbe."
      formule={<Formule tex={"f_a(x) = x + \\dfrac{a}{x}, \\quad x \\neq 0"} />}
      graphique={
        <svg viewBox={`0 0 ${L} ${L}`} className="h-auto w-full" role="img" aria-label={`Courbe de f(x) = x + ${nombreFr(a, 1)}/x avec ses asymptotes`}>
          <defs>
            <clipPath id={idClip}>
              <rect x={R.marge} y={R.marge} width={L - 2 * R.marge} height={L - 2 * R.marge} />
            </clipPath>
          </defs>
          <rect x={R.marge} y={R.marge} width={L - 2 * R.marge} height={L - 2 * R.marge} className="fill-white stroke-fh-sable" />
          {GRADUATIONS.map((g) => (
            <g key={g}>
              <line x1={R.X(g)} y1={R.marge} x2={R.X(g)} y2={L - R.marge} className="stroke-fh-sable/70" strokeWidth={0.7} />
              <line x1={R.marge} y1={R.Y(g)} x2={L - R.marge} y2={R.Y(g)} className="stroke-fh-sable/70" strokeWidth={0.7} />
              <text x={R.X(g)} y={R.Y(0) + 13} textAnchor="middle" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
              <text x={R.X(0) - 5} y={R.Y(g) + 3} textAnchor="end" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
            </g>
          ))}
          <line x1={R.marge} y1={R.Y(0)} x2={L - R.marge} y2={R.Y(0)} className="stroke-fh-ardoise" strokeWidth={1} />
          <line x1={R.X(0)} y1={R.marge} x2={R.X(0)} y2={L - R.marge} className="stroke-fh-ardoise" strokeWidth={1} />

          <g clipPath={`url(#${idClip})`}>
            {/* asymptote oblique y = x */}
            <line x1={R.X(-BORNE)} y1={R.Y(-BORNE)} x2={R.X(BORNE)} y2={R.Y(BORNE)} className="stroke-fh-orange" strokeWidth={1.4} strokeDasharray="6 4" />
            {/* asymptote verticale x = 0 (seulement si a ≠ 0) */}
            {a !== 0 && <line x1={R.X(0)} y1={R.marge} x2={R.X(0)} y2={L - R.marge} className="stroke-fh-bleu-vif" strokeWidth={1.4} strokeDasharray="6 4" />}
            <path d={cheminPositif} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} strokeLinejoin="round" />
            <path d={cheminNegatif} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} strokeLinejoin="round" />
          </g>

          {a === 0 && <circle cx={R.X(0)} cy={R.Y(0)} r={4.5} className="fill-white stroke-fh-bleu" strokeWidth={2} data-testid="point-exclu" />}
          {extrema && (
            <g data-testid="extrema">
              <circle cx={R.X(extrema.racine)} cy={R.Y(extrema.valeur)} r={4.5} className="fill-fh-orange stroke-white" strokeWidth={1.5} />
              <circle cx={R.X(-extrema.racine)} cy={R.Y(-extrema.valeur)} r={4.5} className="fill-fh-orange stroke-white" strokeWidth={1.5} />
              <text x={R.X(extrema.racine) + 6} y={R.Y(extrema.valeur) + 16} className="fill-fh-orange-fonce text-[10px] font-semibold [paint-order:stroke] stroke-white stroke-[3px]">min</text>
              <text x={R.X(-extrema.racine) - 6} y={R.Y(-extrema.valeur) - 10} textAnchor="end" className="fill-fh-orange-fonce text-[10px] font-semibold [paint-order:stroke] stroke-white stroke-[3px]">max</text>
            </g>
          )}
          <text x={R.X(BORNE) - 4} y={R.Y(BORNE) + 26} textAnchor="end" className="fill-fh-orange-fonce text-[10px] font-semibold [paint-order:stroke] stroke-white stroke-[3px]">y = x</text>
          {a !== 0 && <text x={R.X(0) - 5} y={R.marge + 28} textAnchor="end" className="fill-fh-bleu-vif text-[10px] font-semibold [paint-order:stroke] stroke-white stroke-[3px]">x = 0</text>}
        </svg>
      }
      commandes={
        <>
          <Curseur
            nom={<Formule tex="a" />}
            valeurTexte={`a = ${nombreFr(a, 1)}`}
            min={FONCTION.min}
            max={FONCTION.max}
            pas={FONCTION.pas}
            valeur={a}
            onChange={setA}
            ariaLabel="Paramètre a de la fonction"
          />
          <BoutonReinitialiser onClick={() => setA(FONCTION.initial)} />
        </>
      }
      valeurs={
        <>
          <Valeur etiquette="Fonction" large>
            <Formule tex={a === 0 ? "f(x) = x \\quad (x \\neq 0)" : `f(x) = x ${a < 0 ? "-" : "+"} \\dfrac{${nombreFr(Math.abs(a), 1).replace(",", "{,}")}}{x}`} />
          </Valeur>
          <Valeur etiquette="Asymptote oblique">y = x</Valeur>
          <Valeur etiquette="Asymptote verticale">{a !== 0 ? "x = 0" : "aucune"}</Valeur>
          <Valeur etiquette={extrema ? "Minimum local" : "Extrema"} large>
            {extrema ? `x ${egalOuApprox(extrema.racine)} ; f(x) ${egalOuApprox(extrema.valeur)}` : "aucun extremum"}
          </Valeur>
          {extrema && (
            <Valeur etiquette="Maximum local" large>
              {`x ${egalOuApprox(-extrema.racine)} ; f(x) ${egalOuApprox(-extrema.valeur)}`}
            </Valeur>
          )}
        </>
      }
      commentaire={<Tx>{commentaireFonction(a)}</Tx>}
    />
  );
}
