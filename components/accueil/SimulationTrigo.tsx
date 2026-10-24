"use client";

import { useMemo, useState } from "react";

import { nombreFr, TRIGO, trigo, valeurTrigoTex, type ValeurTrigo } from "@/lib/accueil/mathsLabo";
import { BoutonReinitialiser, CadreSimulation, chemin, Curseur, Formule, grad, repere, Tx, Valeur } from "./commun";

/** Valeur exacte et approchée en notation usuelle (fraction, racine), ou « non définie ». */
const valeur = (v: ValeurTrigo) => {
  const tex = valeurTrigoTex(v);
  return tex === null ? "non définie" : <Formule tex={tex} />;
};

const C = 300; // cercle : carré de côté 300, repère orthonormé de −1,4 à 1,4
const RC = repere(-1.4, 1.4, -1.4, 1.4, C, C, 8);
const WC = 440; // courbes
const HC = 220;
const RK = repere(0, 360, -1.15, 1.15, WC, HC, 30);
const DEGRES = [0, 90, 180, 270, 360];

const rad = (d: number) => (d * Math.PI) / 180;

/** Cercle trigonométrique : M(cos θ ; sin θ), projections et courbes sinus / cosinus sur [0° ; 360°]. */
export default function SimulationTrigo() {
  const [theta, setTheta] = useState<number>(TRIGO.initial);
  const r = trigo(theta);
  const cos = r.cos.valeur as number;
  const sin = r.sin.valeur as number;

  const courbeSin = useMemo(() => chemin(Array.from({ length: 73 }, (_, k): [number, number] => [RK.X(k * 5), RK.Y(Math.sin(rad(k * 5)))])), []);
  const courbeCos = useMemo(() => chemin(Array.from({ length: 73 }, (_, k): [number, number] => [RK.X(k * 5), RK.Y(Math.cos(rad(k * 5)))])), []);

  const ox = RC.X(0);
  const oy = RC.Y(0);
  const rayon = RC.sx; // 1 unité
  const arcR = 0.28 * rayon;
  const arc =
    theta === 0
      ? null
      : theta >= 360
        ? null
        : `M${ox + arcR} ${oy} A${arcR} ${arcR} 0 ${theta > 180 ? 1 : 0} 0 ${ox + arcR * Math.cos(rad(theta))} ${oy - arcR * Math.sin(rad(theta))}`;

  return (
    <CadreSimulation
      titre="Explore le cercle trigonométrique"
      description="Tourne le rayon et observe simultanément le sinus, le cosinus et leurs courbes."
      formule={<Formule tex={"M(\\cos\\theta\\,;\\,\\sin\\theta), \\quad \\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}"} />}
      graphique={
        <div className="flex flex-col gap-3">
          <svg viewBox={`0 0 ${C} ${C}`} className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label={`Cercle trigonométrique, angle ${theta} degrés : cosinus ${nombreFr(cos, 3)}, sinus ${nombreFr(sin, 3)}`}>
            <rect x={0} y={0} width={C} height={C} className="fill-white" />
            <line x1={RC.X(-1.3)} y1={oy} x2={RC.X(1.3)} y2={oy} className="stroke-fh-ardoise" strokeWidth={1} />
            <line x1={ox} y1={RC.Y(-1.3)} x2={ox} y2={RC.Y(1.3)} className="stroke-fh-ardoise" strokeWidth={1} />
            <circle cx={ox} cy={oy} r={rayon} fill="none" className="stroke-fh-bleu/50" strokeWidth={1.5} />
            {[-1, 1].map((g) => (
              <g key={g}>
                <text x={RC.X(g)} y={oy + 13} textAnchor="middle" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
                <text x={ox - 5} y={RC.Y(g) + 3} textAnchor="end" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
              </g>
            ))}
            {arc && <path d={arc} fill="none" className="stroke-fh-orange" strokeWidth={1.8} />}
            {theta >= 360 && <circle cx={ox} cy={oy} r={arcR} fill="none" className="stroke-fh-orange" strokeWidth={1.8} />}
            {/* projections : cos θ sur l'axe horizontal, sin θ en vertical */}
            <line x1={ox} y1={oy} x2={RC.X(cos)} y2={oy} className="stroke-fh-orange" strokeWidth={3.2} data-testid="proj-cos" />
            <line x1={RC.X(cos)} y1={oy} x2={RC.X(cos)} y2={RC.Y(sin)} className="stroke-fh-bleu-vif" strokeWidth={3.2} data-testid="proj-sin" />
            <line x1={ox} y1={oy} x2={RC.X(cos)} y2={RC.Y(sin)} className="stroke-fh-bleu" strokeWidth={2} data-testid="rayon" />
            <circle cx={RC.X(cos)} cy={RC.Y(sin)} r={5.5} className="fill-fh-bleu stroke-white" strokeWidth={1.5} data-testid="point-m" />
            <text x={RC.X(cos) + (cos >= 0 ? 8 : -8)} y={RC.Y(sin) + (sin >= 0 ? -8 : 15)} textAnchor={cos >= 0 ? "start" : "end"} className="fill-fh-bleu text-[11px] font-bold">M</text>
          </svg>

          <svg viewBox={`0 0 ${WC} ${HC}`} className="h-auto w-full" role="img" aria-label="Courbes du sinus et du cosinus sur une période, avec un repère à l'angle choisi">
            <rect x={RK.marge} y={RK.marge - 10} width={WC - 2 * RK.marge} height={HC - 2 * RK.marge + 20} className="fill-white stroke-fh-sable" />
            {DEGRES.map((d) => (
              <g key={d}>
                <line x1={RK.X(d)} y1={RK.marge - 10} x2={RK.X(d)} y2={HC - RK.marge + 10} className="stroke-fh-sable/70" strokeWidth={0.7} />
                <text x={RK.X(d)} y={HC - 8} textAnchor="middle" className="fill-fh-ardoise text-[9px]">{d}°</text>
              </g>
            ))}
            {[-1, 0, 1].map((g) => (
              <g key={g}>
                <line x1={RK.marge} y1={RK.Y(g)} x2={WC - RK.marge} y2={RK.Y(g)} className={g === 0 ? "stroke-fh-ardoise" : "stroke-fh-sable/70"} strokeWidth={g === 0 ? 1 : 0.7} />
                <text x={RK.marge - 5} y={RK.Y(g) + 3} textAnchor="end" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
              </g>
            ))}
            <path d={courbeCos} fill="none" className="stroke-fh-orange" strokeWidth={2} />
            <path d={courbeSin} fill="none" className="stroke-fh-bleu-vif" strokeWidth={2} />
            <line x1={RK.X(theta)} y1={RK.marge - 10} x2={RK.X(theta)} y2={HC - RK.marge + 10} className="stroke-fh-bleu" strokeWidth={1.4} strokeDasharray="4 3" data-testid="repere-angle" />
            <circle cx={RK.X(theta)} cy={RK.Y(cos)} r={4.5} className="fill-fh-orange stroke-white" strokeWidth={1.4} />
            <circle cx={RK.X(theta)} cy={RK.Y(sin)} r={4.5} className="fill-fh-bleu-vif stroke-white" strokeWidth={1.4} />
            <text x={RK.marge + 6} y={RK.marge - 14} className="fill-fh-orange-fonce text-[10px] font-semibold">cos</text>
            <text x={RK.marge + 34} y={RK.marge - 14} className="fill-fh-bleu-vif text-[10px] font-semibold">sin</text>
          </svg>
        </div>
      }
      commandes={
        <>
          <Curseur
            nom={<Formule tex="\theta" />}
            valeurTexte={`θ = ${theta}°`}
            min={TRIGO.min}
            max={TRIGO.max}
            pas={TRIGO.pas}
            valeur={theta}
            onChange={setTheta}
            ariaLabel="Angle thêta en degrés"
          />
          <BoutonReinitialiser onClick={() => setTheta(TRIGO.initial)} />
        </>
      }
      valeurs={
        <>
          <Valeur etiquette={<Formule tex="\cos\theta" />} large>{valeur(r.cos)}</Valeur>
          <Valeur etiquette={<Formule tex="\sin\theta" />} large>{valeur(r.sin)}</Valeur>
          <Valeur etiquette={<Formule tex="\tan\theta" />} large>{valeur(r.tan)}</Valeur>
        </>
      }
      commentaire={
        r.tan.valeur === null
          ? <Tx>{"Ici $\\cos\\theta = 0$ : le point $M$ est sur l'axe des ordonnées et $\\tan\\theta = \\dfrac{\\sin\\theta}{\\cos\\theta}$ n'est pas défini (division par $0$)."}</Tx>
          : <Tx>{"L'abscisse de $M$ est $\\cos\\theta$ (segment orange), son ordonnée est $\\sin\\theta$ (segment bleu). Les points colorés des courbes ont exactement ces deux valeurs pour l'angle choisi."}</Tx>
      }
    />
  );
}
