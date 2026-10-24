"use client";

import { useRef, useState } from "react";

import { nombreFr } from "@/lib/accueil/mathsLabo";
import { useAnimation, useBoucle } from "./animation";
import { BoutonReinitialiser, CadreSimulation, Curseur, Formule, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

const RYTHME0 = 15; // mouvements respiratoires par minute
const VOLUME_COURANT = 0.5; // litres d'air échangés à chaque mouvement (adulte au repos)
const CENTRE = { x: 220, y: 190 };
const NB_MOL = 3;

/** Amplitude du mouvement : 0 en fin d'expiration, 1 en fin d'inspiration. */
const amplitude = (ph: number) => (1 - Math.cos(2 * Math.PI * ph)) / 2;

/** Poumons qui gonflent (inspiration) et se vident (expiration), diaphragme qui s'abaisse et remonte. */
export default function SimulationRespiration() {
  const [rythme, setRythme] = useState(RYTHME0);
  const racine = useRef<HTMLDivElement>(null);
  const poumons = useRef<SVGGElement>(null);
  const diaphragme = useRef<SVGPathElement>(null);
  const molecules = useRef<(SVGGElement | null)[]>([]);
  const phase = useRef(0);
  const [inspire, setInspire] = useState(true);
  const anime = useAnimation(racine);

  const periode = 60 / rythme;

  // position des molécules dans la trachée : O₂ qui descend à l'inspiration, CO₂ qui remonte à l'expiration
  const place = (i: number, ph: number) => {
    const o2 = i < NB_MOL;
    const rang = i % NB_MOL;
    const montee = o2 ? ph < 0.5 : ph >= 0.5;
    const t = ((o2 ? ph : ph - 0.5) * 2 + rang / NB_MOL) % 1;
    const y = o2 ? 18 + t * 100 : 118 - t * 100;
    return { y, o: montee ? Math.min(1, t * 4, (1 - t) * 4) : 0 };
  };

  useBoucle(anime, (dt) => {
    phase.current = (phase.current + dt / periode) % 1;
    const a = amplitude(phase.current);
    poumons.current?.setAttribute("transform", `translate(${CENTRE.x} ${CENTRE.y}) scale(${(1 + 0.16 * a).toFixed(3)} ${(1 + 0.12 * a).toFixed(3)}) translate(${-CENTRE.x} ${-CENTRE.y})`);
    diaphragme.current?.setAttribute("transform", `translate(0 ${(16 * a).toFixed(1)})`);
    molecules.current.forEach((g, i) => {
      if (!g) return;
      const { y, o } = place(i, phase.current);
      g.setAttribute("transform", `translate(220 ${y.toFixed(1)})`);
      g.setAttribute("opacity", o.toFixed(2));
    });
    const maintenant = phase.current < 0.5;
    setInspire((v) => (v === maintenant ? v : maintenant)); // ne redessine que lorsque la phase change
  });

  const lobe = (cx: number) => `M${cx} 120 C${cx + (cx < 220 ? -70 : 70)} 120 ${cx + (cx < 220 ? -78 : 78)} 250 ${cx + (cx < 220 ? -8 : 8)} 252 C${cx + (cx < 220 ? 30 : -30)} 252 ${cx + (cx < 220 ? 30 : -30)} 140 ${cx} 120 Z`;

  return (
    <div ref={racine} className="flex flex-col gap-5">
      <EncartConcept
        concept="La respiration renouvelle l'air des poumons. À l'inspiration, le diaphragme s'abaisse et les côtes se soulèvent : le volume de la cage thoracique augmente, les poumons se gonflent et l'air riche en dioxygène y entre. À l'expiration, le diaphragme remonte et l'air chargé de dioxyde de carbone est rejeté. Le dioxygène sert ensuite aux cellules pour libérer l'énergie du glucose."
        observer="le diaphragme descend quand les poumons se gonflent, il remonte quand ils se vident. Augmente le rythme : le cycle devient plus court et le débit d'air augmente."
      />
      <CadreSimulation
        titre="Regarde les poumons respirer"
        description="Règle le rythme respiratoire et suis le va-et-vient de l'air, des poumons et du diaphragme."
        formule={<Formule bloc tex={"\\mathrm{C_6H_{12}O_6} + 6\\,\\mathrm{O_2} \\rightarrow 6\\,\\mathrm{CO_2} + 6\\,\\mathrm{H_2O} + \\text{énergie}"} />}
        graphique={
          <svg viewBox="0 0 440 300" className="mx-auto h-auto w-full max-w-[480px]" role="img" aria-label={`Poumons à ${rythme} mouvements par minute : ${inspire ? "inspiration" : "expiration"}`}>
            <rect x={0} y={0} width={440} height={300} rx={10} className="fill-rose-50" />
            {/* trachée et bronches */}
            <path d="M220 10 L220 120" className="stroke-fh-ardoise" strokeWidth={14} strokeLinecap="round" fill="none" />
            <path d="M220 120 Q180 130 160 150 M220 120 Q260 130 280 150" className="stroke-fh-ardoise" strokeWidth={8} strokeLinecap="round" fill="none" />
            {/* poumons */}
            <g ref={poumons}>
              <path d={lobe(150)} className="fill-rose-300 stroke-rose-500" strokeWidth={3} />
              <path d={lobe(290)} className="fill-rose-300 stroke-rose-500" strokeWidth={3} />
            </g>
            {/* diaphragme */}
            <path ref={diaphragme} d="M60 262 Q220 232 380 262 L380 270 Q220 240 60 270 Z" className="fill-fh-bleu stroke-fh-bleu" strokeWidth={2} />
            <text x={62} y={292} className="fill-fh-bleu text-[11px] font-semibold">diaphragme</text>
            <text x={430} y={22} textAnchor="end" className={`text-[13px] font-bold ${inspire ? "fill-fh-bleu-vif" : "fill-fh-orange-fonce"}`}>{inspire ? "Inspiration" : "Expiration"}</text>
            {/* molécules d'air dans la trachée */}
            {Array.from({ length: 2 * NB_MOL }, (_, i) => {
              const { y, o } = place(i, 0);
              const o2 = i < NB_MOL;
              return (
                <g key={i} ref={(el) => { molecules.current[i] = el; }} transform={`translate(220 ${y.toFixed(1)})`} opacity={o}>
                  <circle r={9} className={o2 ? "fill-fh-bleu-vif" : "fill-fh-ardoise"} />
                  <text y={3} textAnchor="middle" className="fill-white text-[7.5px] font-bold">{o2 ? "O₂" : "CO₂"}</text>
                </g>
              );
            })}
          </svg>
        }
        commandes={
          <>
            <Curseur nom="Rythme respiratoire" valeurTexte={`${rythme} par minute`} min={8} max={40} pas={1} valeur={rythme} onChange={setRythme} ariaLabel="Mouvements respiratoires par minute" />
            <BoutonReinitialiser onClick={() => setRythme(RYTHME0)} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette="Rythme">{rythme} min⁻¹</Valeur>
            <Valeur etiquette="Durée d'un cycle">{nombreFr(periode, 1)} s</Valeur>
            <Valeur etiquette="Débit d'air (volume courant 0,5 L)" large>{nombreFr(rythme * VOLUME_COURANT, 1)} L·min⁻¹</Valeur>
          </>
        }
        commentaire={`À ${rythme} mouvements par minute, un cycle inspiration puis expiration dure ${nombreFr(periode, 1)} s. En renouvelant environ 0,5 L d'air à chaque cycle, les poumons échangent ${nombreFr(rythme * VOLUME_COURANT, 1)} L d'air par minute. Au repos, le rythme d'un adulte est d'environ 15 par minute ; il augmente à l'effort.`}
      />
    </div>
  );
}
