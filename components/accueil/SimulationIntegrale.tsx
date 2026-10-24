"use client";

import { useId, useState } from "react";

import { Choix } from "@/components/labo/commun";
import { nombreFr } from "@/lib/accueil/mathsLabo";
import { aire, FONCTIONS_INTEGRALE, graduations, troncons, type IdIntegrale } from "@/lib/accueil/mathsLaboAvance";
import { BoutonReinitialiser, CadreSimulation, chemin, Curseur, Formule, repere, Tx, Valeur } from "./commun";
import { CadreGraphe, EncartConcept } from "./GrapheMaths";

const W = 440;
const H = 190;
const MARGE = 34;

const versPoints = (pts: [number, number][], R: ReturnType<typeof repere>): [number, number][] => pts.map(([x, y]) => [R.X(x), R.Y(y)]);

/** Aire sous f de 0 à x (en haut) et courbe de F(x) = ∫₀ˣ f (en bas) : le point de F monte avec l'aire. */
export default function SimulationIntegrale() {
  const [idF, setIdF] = useState<IdIntegrale>("carre");
  const fo = FONCTIONS_INTEGRALE.find((f) => f.id === idF) ?? FONCTIONS_INTEGRALE[0];
  const [x, setX] = useState<number>(fo.initial);
  const clip = useId();

  const xmax = fo.xmax;
  const fmax = Math.max(...troncons(fo.f, 0, xmax, -1e9, 1e9, 200).flat().map(([, y]) => y)) * 1.12;
  const Fmax = fo.F(xmax) * 1.1;
  const RH = repere(0, xmax, 0, fmax, W, H, MARGE);
  const RB = repere(0, xmax, 0, Fmax, W, H, MARGE);

  const courbeF = troncons(fo.f, 0, xmax, -1e9, 1e9, 200)[0];
  const courbeG = troncons(fo.F, 0, xmax, -1e9, 1e9, 200)[0];
  const partieF = courbeF.filter(([t]) => t <= x);
  const partieG = courbeG.filter(([t]) => t <= x);
  const air = aire(fo.f, x);
  const val = fo.F(x);
  const derivee = fo.f(x);

  const polygone = [[0, 0] as [number, number], ...partieF, [x, fo.f(x)] as [number, number], [x, 0] as [number, number]];
  const gxH = graduations(0, xmax);

  function choisir(id: IdIntegrale) {
    const f = FONCTIONS_INTEGRALE.find((v) => v.id === id) ?? FONCTIONS_INTEGRALE[0];
    setIdF(id);
    setX(f.initial);
  }

  return (
    <div className="flex flex-col gap-5">
      <EncartConcept
        concept={
          <Tx>
            {"L'intégrale de $a$ à $x$ de $f$ est l'aire entre la courbe de $f$ et l'axe des abscisses. Quand $x$ avance, l'aire s'agrandit : sa valeur définit une nouvelle fonction $F(x) = \\int_a^x f(t)\\,\\mathrm{d}t$, une primitive de $f$. Le taux auquel $F$ grandit à chaque instant est la hauteur de $f$ : $F'(x) = f(x)$."}
          </Tx>
        }
        observer={<Tx>{"le point de la courbe du bas a pour ordonnée exactement l'aire coloriée du haut. Là où $f$ est grande, $F$ monte vite ; là où $f$ est petite, $F$ monte lentement."}</Tx>}
      />
      <CadreSimulation
        titre="Vois l'aire devenir une fonction"
        description="Déplace la borne x : l'aire se remplit en haut et le point de F(x) monte en bas."
        formule={
          <Formule bloc tex={`F(x) = \\int_{0}^{x} f(t)\\,\\mathrm{d}t \\qquad F'(x) = f(x) \\qquad \\int_{0}^{x} ${fo.fTex}\\,\\mathrm{d}t = ${fo.FTex}`} />
        }
        graphique={
          <div className="flex flex-col gap-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Aire sous la courbe de f entre 0 et ${nombreFr(x, 1)} : ${nombreFr(air, 3)}`}>
              <defs>
                <clipPath id={`${clip}h`}>
                  <rect x={RH.X(0)} y={RH.Y(fmax)} width={RH.X(xmax) - RH.X(0)} height={RH.Y(0) - RH.Y(fmax)} />
                </clipPath>
              </defs>
              <CadreGraphe R={RH} largeur={W} hauteur={H} xmin={0} xmax={xmax} ymin={0} ymax={fmax} gx={gxH} gy={graduations(0, fmax, 3)} nomX="t" />
              <g clipPath={`url(#${clip}h)`}>
                <path d={`${chemin(versPoints(polygone, RH))} Z`} className="fill-fh-orange/35 stroke-fh-orange" strokeWidth={1} />
                <path d={chemin(versPoints(courbeF, RH))} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} />
              </g>
              <line x1={RH.X(x)} y1={RH.Y(0)} x2={RH.X(x)} y2={RH.Y(fo.f(x))} className="stroke-fh-orange-fonce" strokeWidth={1.8} />
              <circle cx={RH.X(x)} cy={RH.Y(fo.f(x))} r={4.5} className="fill-fh-bleu stroke-white" strokeWidth={1.2} />
              <text x={RH.X(0) + 6} y={RH.Y(fmax) + 13} className="fill-fh-bleu text-[11px] font-semibold">f(t)</text>
              <text x={Math.min(RH.X(x) + 6, W - MARGE - 70)} y={RH.Y(0) - 8} className="fill-fh-orange-fonce text-[10px] font-semibold">aire = {nombreFr(air, 2)}</text>
            </svg>
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Courbe de F : F(${nombreFr(x, 1)}) = ${nombreFr(val, 3)}`}>
              <CadreGraphe R={RB} largeur={W} hauteur={H} xmin={0} xmax={xmax} ymin={0} ymax={Fmax} gx={gxH} gy={graduations(0, Fmax, 3)} nomX="x" />
              <path d={chemin(versPoints(courbeG, RB))} fill="none" className="stroke-fh-sable" strokeWidth={2.4} />
              <path d={chemin(versPoints(partieG, RB))} fill="none" className="stroke-fh-bleu" strokeWidth={2.8} />
              <line x1={RB.X(0)} y1={RB.Y(val)} x2={RB.X(x)} y2={RB.Y(val)} className="stroke-fh-orange" strokeWidth={1.2} strokeDasharray="4 3" />
              <line x1={RB.X(x)} y1={RB.Y(0)} x2={RB.X(x)} y2={RB.Y(val)} className="stroke-fh-orange" strokeWidth={1.2} strokeDasharray="4 3" />
              <circle cx={RB.X(x)} cy={RB.Y(val)} r={5.5} className="fill-fh-orange stroke-white" strokeWidth={1.5} />
              <text x={RB.X(0) + 6} y={RB.Y(Fmax) + 13} className="fill-fh-bleu text-[11px] font-semibold">F(x)</text>
              <text x={Math.min(RB.X(x) + 9, W - MARGE - 62)} y={Math.max(RB.Y(val) + 16, 24)} className="fill-fh-orange-fonce text-[10px] font-semibold">F = {nombreFr(val, 2)}</text>
            </svg>
          </div>
        }
        commandes={
          <>
            <Choix nom="Fonction f" options={FONCTIONS_INTEGRALE.map((f) => ({ cle: f.id, libelle: <Formule tex={f.libelleTex} />, aria: f.libelle }))} valeur={idF} onChoisir={choisir} />
            <Curseur
              nom={<Formule tex="x" />}
              valeurTexte={`x = ${nombreFr(x, 1)}`}
              min={0}
              max={xmax}
              pas={0.1}
              valeur={x}
              onChange={(v) => setX(Math.round(v * 10) / 10)}
              ariaLabel="Borne supérieure x de l'intégrale"
            />
            <BoutonReinitialiser onClick={() => setX(fo.initial)} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette="Aire sous f de 0 à x (calculée)">{nombreFr(air, 4)}</Valeur>
            <Valeur etiquette="F(x) (formule)">{nombreFr(val, 4)}</Valeur>
            <Valeur etiquette="f(x), pente de F en x" large>{nombreFr(derivee, 4)}</Valeur>
          </>
        }
        commentaire={`Pour x = ${nombreFr(x, 1)}, l'aire coloriée vaut ${nombreFr(air, 3)} et F(x) = ${nombreFr(val, 3)} : les deux valeurs coïncident. À cet endroit, la courbe du bas monte avec la pente f(x) = ${nombreFr(derivee, 2)}.`}
      />
    </div>
  );
}
