"use client";

import { useId, useState } from "react";

import { argumentTexte, COMPLEXE, complexe, nombreFr } from "@/lib/accueil/mathsLabo";
import { BoutonReinitialiser, CadreSimulation, Curseur, Formule, grad, repere, Tx, Valeur } from "./commun";

const L = 400;
const BORNE = 5;
const R = repere(-BORNE, BORNE, -BORNE, BORNE, L, L);
const ENTIERS = [-4, -3, -2, -1, 1, 2, 3, 4];

/** z = a + bi : point M(a ; b), vecteur OM, conjugué M′(a ; −b) et symétrie par rapport à l'axe réel. */
export default function SimulationComplexes() {
  const [a, setA] = useState<number>(COMPLEXE.a);
  const [b, setB] = useState<number>(COMPLEXE.b);
  const idFleche = useId();
  const r = complexe(a, b);
  const nul = a === 0 && b === 0;

  return (
    <CadreSimulation
      titre="Découvre le plan complexe"
      description="Déplace le point M et observe son affixe, son module, son argument et son conjugué."
      formule={<Formule tex={"z = a + b\\,i"} />}
      graphique={
        <svg viewBox={`0 0 ${L} ${L}`} className="h-auto w-full" role="img" aria-label={`Plan complexe : M(${a} ; ${b}) d'affixe ${r.z} et son conjugué M′(${a} ; ${-b || 0})`}>
          <defs>
            <marker id={idFleche} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="fill-fh-bleu" />
            </marker>
          </defs>
          <rect x={R.marge} y={R.marge} width={L - 2 * R.marge} height={L - 2 * R.marge} className="fill-white stroke-fh-sable" />
          {ENTIERS.map((g) => (
            <g key={g}>
              <line x1={R.X(g)} y1={R.marge} x2={R.X(g)} y2={L - R.marge} className="stroke-fh-sable/70" strokeWidth={0.7} />
              <line x1={R.marge} y1={R.Y(g)} x2={L - R.marge} y2={R.Y(g)} className="stroke-fh-sable/70" strokeWidth={0.7} />
              <text x={R.X(g)} y={R.Y(0) + 13} textAnchor="middle" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
              <text x={R.X(0) - 5} y={R.Y(g) + 3} textAnchor="end" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
            </g>
          ))}
          <line x1={R.marge} y1={R.Y(0)} x2={L - R.marge} y2={R.Y(0)} className="stroke-fh-ardoise" strokeWidth={1.2} />
          <line x1={R.X(0)} y1={R.marge} x2={R.X(0)} y2={L - R.marge} className="stroke-fh-ardoise" strokeWidth={1.2} />
          <text x={L - R.marge - 2} y={R.Y(0) - 6} textAnchor="end" className="fill-fh-ardoise text-[10px] font-semibold">Re</text>
          <text x={R.X(0) + 6} y={R.marge + 10} className="fill-fh-ardoise text-[10px] font-semibold">Im</text>

          {/* symétrie par rapport à l'axe réel */}
          {b !== 0 && <line x1={R.X(a)} y1={R.Y(b)} x2={R.X(a)} y2={R.Y(-b)} className="stroke-fh-orange" strokeWidth={1.4} strokeDasharray="5 4" data-testid="symetrie" />}
          {/* vecteur OM */}
          {!nul && <line x1={R.X(0)} y1={R.Y(0)} x2={R.X(a)} y2={R.Y(b)} className="stroke-fh-bleu" strokeWidth={2.2} markerEnd={`url(#${idFleche})`} data-testid="vecteur-om" />}

          <circle cx={R.X(a)} cy={R.Y(-b)} r={5} className="fill-fh-orange stroke-white" strokeWidth={1.5} data-testid="point-conjugue" />
          <circle cx={R.X(a)} cy={R.Y(b)} r={5.5} className="fill-fh-bleu stroke-white" strokeWidth={1.5} data-testid="point-m" />
          <text x={R.X(a) + 9} y={R.Y(b) + (b >= 0 ? -8 : 15)} className="fill-fh-bleu text-[11px] font-bold">M</text>
          {b !== 0 && <text x={R.X(a) + 9} y={R.Y(-b) + (b >= 0 ? 15 : -8)} className="fill-fh-orange-fonce text-[11px] font-bold">M′</text>}
        </svg>
      }
      commandes={
        <>
          <Curseur
            nom="Partie réelle a"
            valeurTexte={`a = ${nombreFr(a, 0)}`}
            min={COMPLEXE.min}
            max={COMPLEXE.max}
            pas={COMPLEXE.pas}
            valeur={a}
            onChange={setA}
            ariaLabel="Partie réelle a de z"
          />
          <Curseur
            nom="Partie imaginaire b"
            valeurTexte={`b = ${nombreFr(b, 0)}`}
            min={COMPLEXE.min}
            max={COMPLEXE.max}
            pas={COMPLEXE.pas}
            valeur={b}
            onChange={setB}
            ariaLabel="Partie imaginaire b de z"
          />
          <BoutonReinitialiser
            onClick={() => {
              setA(COMPLEXE.a);
              setB(COMPLEXE.b);
            }}
          />
        </>
      }
      valeurs={
        <>
          <Valeur etiquette="Affixe z">{r.z}</Valeur>
          <Valeur etiquette="Conjugué">{r.conjugue}</Valeur>
          <Valeur etiquette={<>Module <Formule tex="|z|" /></>}>
            {r.module.exact}
            {r.module.approx !== null && ` ≈ ${r.module.approx}`}
          </Valeur>
          <Valeur etiquette="Argument principal">{argumentTexte(r)}</Valeur>
        </>
      }
      commentaire={
        nul
          ? "Pour z = 0, le point M est l'origine : le module vaut 0 et l'argument n'est pas défini."
          : <Tx>{`Le conjugué a la même partie réelle et la partie imaginaire opposée : $M'(${a || 0}\\,;\\,${-b || 0})$ est le symétrique de $M(${a || 0}\\,;\\,${b || 0})$ par rapport à l'axe réel. Le module est la longueur $OM = \\sqrt{a^2 + b^2}$.`}</Tx>
      }
    />
  );
}
