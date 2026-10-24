"use client";

import { useState } from "react";

import { nombreFr } from "@/lib/accueil/mathsLabo";
import { BoutonReinitialiser, CadreSimulation, Curseur, Formule, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

const W = 480;
const H = 280;
const AXE = 140;
const LENTILLE = 240;
const SX = 5.5; // pixels par centimètre (horizontal)
const SY = 9; // pixels par centimètre (vertical, échelle distincte comme sur un schéma d'optique)
const F = 10; // distance focale image f' (cm)
const HAUTEUR_OBJET = 3; // cm
const D0 = 25;

function Fleche({ x, y, pointille = false, classe }: { x: number; y: number; pointille?: boolean; classe: string }) {
  const s = y < AXE ? 1 : -1; // pointe vers le haut si y est au-dessus de l'axe
  return (
    <g className={classe} strokeDasharray={pointille ? "5 4" : undefined}>
      <line x1={x} y1={AXE} x2={x} y2={y} strokeWidth={3} />
      <path d={`M${x - 6} ${y + 9 * s} L${x} ${y} L${x + 6} ${y + 9 * s}`} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="none" />
    </g>
  );
}

/** Lentille convergente (f' = 10 cm) : relation de conjugaison et tracé de deux rayons. */
export default function SimulationLentille() {
  const [d, setD] = useState(D0);

  const OA = -d;
  const infini = Math.abs(d - F) < 1e-9;
  const OAp = infini ? Infinity : (OA * F) / (OA + F); // 1/OA' = 1/OA + 1/f'
  const gamma = infini ? Infinity : OAp / OA;
  const reelle = !infini && OAp > 0;

  const xo = LENTILLE - d * SX;
  const yt = AXE - HAUTEUR_OBJET * SY; // sommet de l'objet
  const pente1 = (AXE - yt) / (SX * F); // rayon parallèle à l'axe, puis passant par le foyer image F'
  const pente2 = (AXE - yt) / (LENTILLE - xo); // rayon passant par le centre optique O
  const yFin1 = yt + pente1 * (W - LENTILLE);
  const yFin2 = AXE + pente2 * (W - LENTILLE);
  const xi = LENTILLE + OAp * SX;
  const yi = AXE - gamma * HAUTEUR_OBJET * SY;
  const imageVisible = !infini && xi > 10 && xi < W - 10;

  let nature: string;
  if (infini) nature = "à l'infini";
  else if (reelle) nature = gamma < 0 ? "réelle, renversée" : "réelle";
  else nature = "virtuelle, droite";

  let commentaire: string;
  if (infini) commentaire = "L'objet est au foyer : les rayons ressortent parallèles et ne se coupent jamais. Il n'y a pas d'image, ou plutôt elle est rejetée à l'infini.";
  else if (Math.abs(d - 2 * F) < 1e-9) commentaire = "L'objet est à 2f' : l'image est réelle, renversée, de même taille et à 2f' de l'autre côté. Elle est la symétrique de l'objet par rapport au centre O.";
  else if (d < F) commentaire = `L'objet est plus près que le foyer (d = ${nombreFr(d, 1)} cm < f'). Les rayons ressortent en divergeant : on voit une image virtuelle, droite et agrandie (γ = ${nombreFr(gamma, 2)}) : c'est l'effet de loupe.`;
  else commentaire = `L'objet est au-delà du foyer : l'image est réelle et renversée, à ${nombreFr(OAp, 1)} cm de la lentille, avec un grandissement γ = ${nombreFr(gamma, 2)}${Math.abs(gamma) > 1 ? " (agrandie)" : " (réduite)"}.`;

  return (
    <div className="flex flex-col gap-5">
      <EncartConcept
        concept="Une lentille convergente fait converger les rayons lumineux vers son foyer image. Un rayon parallèle à l'axe ressort en passant par le foyer F' ; un rayon passant par le centre optique O n'est pas dévié. Leur intersection donne la position de l'image de l'objet. Selon la distance de l'objet, l'image est réelle (on peut la recueillir sur un écran) ou virtuelle (on la voit à travers la lentille)."
        observer="place l'objet à 2f' : l'image est de même taille et renversée. Rapproche-le du foyer, puis entre le foyer et la lentille : l'image devient virtuelle et agrandie, c'est une loupe."
      />
      <CadreSimulation
        titre="Forme une image avec une lentille"
        description="Déplace l'objet le long de l'axe optique et observe où se forme son image (f' = 10 cm)."
        formule={<Formule bloc tex={"\\dfrac{1}{\\overline{OA'}} - \\dfrac{1}{\\overline{OA}} = \\dfrac{1}{f'} \\qquad \\gamma = \\dfrac{\\overline{OA'}}{\\overline{OA}}"} />}
        graphique={
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Lentille convergente : objet à ${nombreFr(d, 1)} centimètres, image ${nature}`}>
            <rect x={0} y={0} width={W} height={H} className="fill-white" />
            <line x1={0} y1={AXE} x2={W} y2={AXE} className="stroke-fh-ardoise" strokeWidth={1.4} />
            {/* foyers */}
            {[-F, F].map((v) => (
              <g key={v}>
                <circle cx={LENTILLE + v * SX} cy={AXE} r={3.5} className="fill-fh-ardoise" />
                <text x={LENTILLE + v * SX} y={AXE + 18} textAnchor="middle" className="fill-fh-ardoise text-[11px] font-semibold">{v < 0 ? "F" : "F′"}</text>
              </g>
            ))}
            {/* lentille */}
            <path d={`M${LENTILLE} 52 Q${LENTILLE + 18} ${AXE} ${LENTILLE} 228 Q${LENTILLE - 18} ${AXE} ${LENTILLE} 52 Z`} className="fill-fh-bleu/15 stroke-fh-bleu" strokeWidth={2} />
            <text x={LENTILLE} y={44} textAnchor="middle" className="fill-fh-bleu text-[11px] font-semibold">O</text>
            {/* rayons */}
            <g fill="none" strokeWidth={1.8} className="stroke-fh-orange">
              <polyline points={`${xo},${yt} ${LENTILLE},${yt} ${W},${yFin1}`} />
              <polyline points={`${xo},${yt} ${LENTILLE},${AXE} ${W},${yFin2}`} />
            </g>
            {/* prolongements des rayons quand l'image est virtuelle */}
            {!reelle && !infini && (
              <g fill="none" strokeWidth={1.4} strokeDasharray="5 4" className="stroke-fh-orange-fonce/70">
                <line x1={LENTILLE} y1={yt} x2={xi} y2={yi} />
                <line x1={LENTILLE} y1={AXE} x2={xi} y2={yi} />
              </g>
            )}
            {/* objet et image */}
            <Fleche x={xo} y={yt} classe="stroke-fh-bleu" />
            <text x={xo} y={AXE + 18} textAnchor="middle" className="fill-fh-bleu text-[11px] font-semibold">A</text>
            {imageVisible && <Fleche x={xi} y={yi} pointille={!reelle} classe="stroke-fh-orange-fonce" />}
            {imageVisible && <text x={xi} y={yi < AXE ? yi - 8 : yi + 18} textAnchor="middle" className="fill-fh-orange-fonce text-[11px] font-semibold">A′</text>}
            {!imageVisible && !infini && <text x={W - 8} y={22} textAnchor="end" className="fill-fh-orange-fonce text-[11px] font-semibold">l&apos;image se forme hors du cadre</text>}
          </svg>
        }
        commandes={
          <>
            <Curseur
              nom="Distance objet - lentille d"
              valeurTexte={`d = ${nombreFr(d, 1)} cm`}
              min={4}
              max={40}
              pas={0.5}
              valeur={d}
              onChange={setD}
              ariaLabel="Distance de l'objet à la lentille en centimètres"
            />
            <BoutonReinitialiser onClick={() => setD(D0)} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette={<>Objet <Formule tex={"\\overline{OA}"} /></>}>{nombreFr(OA, 1)} cm</Valeur>
            <Valeur etiquette={<>Image <Formule tex={"\\overline{OA'}"} /></>}>{infini ? "infini" : `${nombreFr(OAp, 1)} cm`}</Valeur>
            <Valeur etiquette="Grandissement γ">{infini ? "infini" : nombreFr(gamma, 2)}</Valeur>
            <Valeur etiquette="Nature de l'image">{nature}</Valeur>
          </>
        }
        commentaire={commentaire}
      />
    </div>
  );
}
