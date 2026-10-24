"use client";

import { useRef, useState } from "react";

import { nombreFr } from "@/lib/accueil/mathsLabo";
import { useAnimation, useBoucle } from "./animation";
import { BoutonReinitialiser, CadreSimulation, Curseur, Formule, Tx, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

const X0 = 60;
const X1 = 380;
const Y0 = 60;
const Y1 = 230;
const LARGEUR = X1 - X0;
const HAUTEUR = Y1 - Y0;
const PERIMETRE = 2 * (LARGEUR + HAUTEUR);
const NB_ELECTRONS = 20;
const U0 = 6;
const R0 = 20;
const I_MAX = 1.2; // 12 V / 10 Ω : éclat maximal de la lampe

/** Position d'abscisse curviligne s sur le circuit rectangulaire, parcouru dans le sens horaire à partir du coin haut-gauche. */
function position(s: number): [number, number] {
  const m = ((s % PERIMETRE) + PERIMETRE) % PERIMETRE;
  if (m < LARGEUR) return [X0 + m, Y0];
  if (m < LARGEUR + HAUTEUR) return [X1, Y0 + (m - LARGEUR)];
  if (m < 2 * LARGEUR + HAUTEUR) return [X1 - (m - LARGEUR - HAUTEUR), Y1];
  return [X0, Y1 - (m - 2 * LARGEUR - HAUTEUR)];
}

/** Circuit série pile / résistance / lampe : les électrons circulent (sens inverse du courant) à une vitesse proportionnelle à I. */
export default function SimulationOhm() {
  const [tension, setTension] = useState(U0);
  const [resistance, setResistance] = useState(R0);
  const racine = useRef<HTMLDivElement>(null);
  const electrons = useRef<(SVGCircleElement | null)[]>([]);
  const decalage = useRef(0);
  const anime = useAnimation(racine);

  const I = tension / resistance;
  const eclat = Math.min(1, I / I_MAX);

  useBoucle(anime, (dt) => {
    decalage.current -= dt * I * 170; // les électrons vont dans le sens inverse du courant conventionnel
    electrons.current.forEach((c, i) => {
      if (!c) return;
      const [x, y] = position(decalage.current + (i * PERIMETRE) / NB_ELECTRONS);
      c.setAttribute("cx", x.toFixed(1));
      c.setAttribute("cy", y.toFixed(1));
    });
  });

  return (
    <div ref={racine} className="flex flex-col gap-5">
      <EncartConcept
        concept="Dans un conducteur ohmique, la tension U entre les bornes et l'intensité I du courant sont proportionnelles : le coefficient de proportionnalité est la résistance R. Plus la tension est grande, plus les électrons sont poussés fort et plus le courant est intense ; plus la résistance est grande, plus le courant est freiné."
        observer="double la tension U sans toucher à R : l'intensité I double, les électrons vont deux fois plus vite et la lampe brille davantage."
      />
      <CadreSimulation
        titre="Teste la loi d'Ohm"
        description="Règle la tension de la pile et la résistance, puis observe le courant et la lampe."
        formule={<Formule tex={"U = R\\,I \\;\\Rightarrow\\; I = \\dfrac{U}{R}"} />}
        graphique={
          <svg viewBox="0 0 440 290" className="mx-auto h-auto w-full max-w-[460px]" role="img" aria-label={`Circuit : pile ${tension} volts, résistance ${resistance} ohms, intensité ${nombreFr(I, 2)} ampère`}>
            {/* fils */}
            <rect x={X0} y={Y0} width={LARGEUR} height={HAUTEUR} rx={4} fill="none" className="stroke-fh-ardoise" strokeWidth={3} />
            {/* pile (à gauche) : borne + en haut */}
            <rect x={X0 - 22} y={125} width={44} height={50} className="fill-fh-creme" />
            <line x1={X0 - 18} y1={135} x2={X0 + 18} y2={135} className="stroke-fh-orange-fonce" strokeWidth={5} />
            <line x1={X0 - 9} y1={152} x2={X0 + 9} y2={152} className="stroke-fh-bleu" strokeWidth={5} />
            <text x={X0 + 26} y={139} className="fill-fh-orange-fonce text-[13px] font-bold">+</text>
            <text x={X0 + 26} y={160} className="fill-fh-bleu text-[13px] font-bold">−</text>
            <text x={X0 - 16} y={112} className="fill-fh-ardoise text-[11px] font-semibold">U = {tension} V</text>
            {/* résistance (en haut) */}
            <rect x={185} y={Y0 - 13} width={70} height={26} rx={3} className="fill-white stroke-fh-bleu" strokeWidth={3} />
            <text x={220} y={Y0 - 22} textAnchor="middle" className="fill-fh-bleu text-[12px] font-semibold">R = {resistance} Ω</text>
            {/* lampe (à droite) */}
            <circle cx={X1} cy={145} r={42} className="fill-fh-orange" opacity={eclat * 0.55} />
            <circle cx={X1} cy={145} r={24} className="fill-white stroke-fh-ardoise" strokeWidth={3} />
            <circle cx={X1} cy={145} r={24} className="fill-fh-orange-clair" opacity={eclat} />
            <path d={`M${X1 - 12} ${145 + 12} L${X1 + 12} ${145 - 12} M${X1 - 12} ${145 - 12} L${X1 + 12} ${145 + 12}`} className="stroke-fh-ardoise" strokeWidth={2} />
            <text x={X1 - 28} y={207} textAnchor="end" className="fill-fh-ardoise text-[11px] font-semibold">lampe</text>
            {/* sens du courant conventionnel (horaire) */}
            <path d="M120 78 L134 60 L120 42" fill="none" className="stroke-fh-orange-fonce" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            <text x={140} y={92} className="fill-fh-orange-fonce text-[11px] font-semibold">I (sens conventionnel)</text>
            {/* électrons */}
            {Array.from({ length: NB_ELECTRONS }, (_, i) => {
              const [x, y] = position((i * PERIMETRE) / NB_ELECTRONS);
              return <circle key={i} ref={(el) => { electrons.current[i] = el; }} cx={x} cy={y} r={5} className="fill-fh-bleu-vif stroke-white" strokeWidth={1.2} opacity={I === 0 ? 0.5 : 1} />;
            })}
            <text x={X0} y={262} className="fill-fh-bleu text-[11px] font-semibold">électrons (sens inverse du courant)</text>
          </svg>
        }
        commandes={
          <>
            <Curseur nom={<Formule tex="U" />} valeurTexte={`U = ${tension} V`} min={0} max={12} pas={1} valeur={tension} onChange={setTension} ariaLabel="Tension U en volts" />
            <Curseur nom={<Formule tex="R" />} valeurTexte={`R = ${resistance} Ω`} min={10} max={100} pas={5} valeur={resistance} onChange={setResistance} ariaLabel="Résistance R en ohms" />
            <BoutonReinitialiser onClick={() => { setTension(U0); setResistance(R0); }} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette="Tension U">{tension} V</Valeur>
            <Valeur etiquette="Résistance R">{resistance} Ω</Valeur>
            <Valeur etiquette={<>Intensité <Formule tex={"I = \\dfrac{U}{R}"} /></>} large>{nombreFr(I, 3)} A</Valeur>
          </>
        }
        commentaire={tension === 0 ? "Sans tension, aucun courant ne circule : les électrons restent immobiles et la lampe est éteinte." : <Tx>{`Avec $U = ${tension}\\ \\mathrm{V}$ et $R = ${resistance}\\ \\Omega$, $I = \\dfrac{${tension}}{${resistance}} = ${nombreFr(I, 3).replace(",", "{,}")}\\ \\mathrm{A}$. Si $U$ double ($R$ constante), $I$ double ; si $R$ double ($U$ constante), $I$ est divisée par $2$.`}</Tx>}
      />
    </div>
  );
}
