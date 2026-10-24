"use client";

import { useState, type ReactNode } from "react";

import { nombreFr } from "@/lib/accueil/mathsLabo";
import { BoutonReinitialiser, CadreSimulation, Curseur, Formule, TableauValeurs, Tx, Valeur } from "./commun";
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
const TURQUOISE = "#0f8a8a";

/** Nombre pour KaTeX : virgule décimale protégée de l'espace TeX (« 16{,}7 »), au plus `d` décimales. */
const tex = (v: number, d: number) => nombreFr(v, d).replace(",", "{,}");

type Cas = "infini" | "loupe" | "projecteur" | "deuxF" | "photo";

function Fleche({ x, y, pointille = false, classe }: { x: number; y: number; pointille?: boolean; classe: string }) {
  const s = y < AXE ? 1 : -1; // pointe vers le haut si y est au-dessus de l'axe
  return (
    <g className={classe} strokeDasharray={pointille ? "5 4" : undefined}>
      <line x1={x} y1={AXE} x2={x} y2={y} strokeWidth={3} />
      <path d={`M${x - 6} ${y + 9 * s} L${x} ${y} L${x + 6} ${y + 9 * s}`} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="none" />
    </g>
  );
}

/** Encadré pédagogique (bordure gauche turquoise, fond léger) : explications fixes ou dynamiques de l'onglet. */
function Encart({ titre, children }: { titre: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 bg-white/70 p-4 sm:p-5" style={{ borderColor: TURQUOISE }}>
      <p className="text-sm font-bold" style={{ color: "#0b6b6b" }}>{titre}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-fh-ardoise sm:text-base">{children}</div>
    </div>
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

  // Cas où l'on se trouve (sert au résumé, à l'encart dynamique et à la ligne surlignée du tableau).
  let cas: Cas;
  if (infini) cas = "infini";
  else if (d < F) cas = "loupe";
  else if (Math.abs(d - 2 * F) < 1e-9) cas = "deuxF";
  else if (d < 2 * F) cas = "projecteur";
  else cas = "photo";

  const taille = Math.abs(gamma);
  const valeurs = infini ? "" : `$\\overline{OA'} = ${tex(OAp, 1)}$ cm et $\\gamma = ${tex(gamma, 2)}$`;
  const position = `$d = ${tex(d, 1)}$ cm`;

  let explication: string;
  if (cas === "infini") {
    explication = `L'objet est au foyer $F$ (${position} $= f'$). Les rayons ressortent parallèles entre eux : ils ne se croisent jamais, donc il n'y a pas d'image. On dit qu'elle est rejetée à l'infini.`;
  } else if (cas === "loupe") {
    explication = `L'objet est entre le foyer $F$ et la lentille (${position} $< f'$). Les rayons ressortent en divergeant : ils ne se croisent pas, ce sont leurs prolongements (en pointillés) qui se coupent, du même côté que l'objet. Ici ${valeurs}. L'image est VIRTUELLE ($\\overline{OA'} < 0$ : on la voit à travers la lentille, on ne peut pas la recueillir sur un écran), DROITE ($\\gamma > 0$) et AGRANDIE car $|\\gamma| = ${tex(taille, 2)} > 1$. C'est la LOUPE.`;
  } else if (cas === "deuxF") {
    explication = `L'objet est à $2f'$ (${position} $= 2f'$). Les rayons se croisent de l'autre côté de la lentille, à $2f'$ aussi : ${valeurs}. L'image est RÉELLE, RENVERSÉE ($\\gamma < 0$) et de même taille que l'objet car $|\\gamma| = 1$.`;
  } else if (cas === "projecteur") {
    explication = `L'objet est entre $f'$ et $2f'$ (${position}, avec $10 < d < 20$ cm). Les rayons se croisent de l'autre côté de la lentille : ${valeurs}. L'image est RÉELLE (on peut la recueillir sur un écran), RENVERSÉE ($\\gamma < 0$) et AGRANDIE car $|\\gamma| = ${tex(taille, 2)} > 1$. C'est le principe du PROJECTEUR.`;
  } else {
    explication = `L'objet est au-delà de $2f'$ (${position}, avec $d > 20$ cm). Les rayons se croisent de l'autre côté de la lentille : ${valeurs}. L'image est RÉELLE (on peut la recueillir sur un écran), RENVERSÉE ($\\gamma < 0$) et RÉDUITE car $|\\gamma| = ${tex(taille, 2)} < 1$. C'est le principe de l'APPAREIL PHOTO.`;
  }

  const resume = infini
    ? "Pas d'image : elle est rejetée à l'infini."
    : `Image ${reelle ? "réelle" : "virtuelle"}, ${gamma < 0 ? "renversée" : "droite"}, ${taille > 1 + 1e-9 ? "agrandie" : taille < 1 - 1e-9 ? "réduite" : "de même taille"}.`;

  return (
    <div className="flex flex-col gap-5">
      <EncartConcept
        concept="Une lentille convergente fait converger les rayons lumineux vers son foyer image. Selon la distance de l'objet, l'image est réelle (on peut la recueillir sur un écran) ou virtuelle (on la voit à travers la lentille)."
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
            <Valeur etiquette={<>Grandissement <Formule tex="\gamma" /></>}>{infini ? "infini" : nombreFr(gamma, 2)}</Valeur>
            <Valeur etiquette="Nature de l'image">{nature}</Valeur>
          </>
        }
        commentaire={resume}
        bas={
          <div aria-live="polite">
            <p className="font-bold" style={{ color: "#0b6b6b" }}>Ce qui se passe ici</p>
            <p className="mt-1 leading-8 text-fh-ardoise">
              <Tx>{explication}</Tx>
            </p>
          </div>
        }
      />

      <Encart titre="La règle des deux rayons">
        <ol className="flex list-decimal flex-col gap-1.5 pl-5">
          <li className="pl-1 leading-8">
            <Tx>{"Le rayon issu de l'objet et parallèle à l'axe ressort en passant par le foyer image $F'$."}</Tx>
          </li>
          <li className="pl-1 leading-8">
            <Tx>{"Le rayon passant par le centre optique $O$ n'est pas dévié."}</Tx>
          </li>
          <li className="pl-1 leading-8">
            <Tx>{"L'intersection de ces deux rayons donne la position de l'image."}</Tx>
          </li>
        </ol>
        <p className="mt-2 leading-8">
          <Tx>{"Ces règles construisent géométriquement l'image : c'est pour cela qu'on trace ces deux rayons."}</Tx>
        </p>
      </Encart>

      <Encart titre="Nature de l'image selon la position de l'objet">
        <TableauValeurs couleur={TURQUOISE}>
          <thead>
            <tr>
              <th scope="col">Objet</th>
              <th scope="col">Image</th>
              <th scope="col">Application</th>
            </tr>
          </thead>
          <tbody>
            <tr data-actif={cas === "photo"}>
              <td><Tx>{"Au-delà de $2f'$ (loin de la lentille)"}</Tx></td>
              <td><Tx>{"RÉELLE, RENVERSÉE, RÉDUITE ($|\\gamma| < 1$)"}</Tx></td>
              <td>Appareil photo</td>
            </tr>
            <tr data-actif={cas === "projecteur" || cas === "deuxF"}>
              <td><Tx>{"Entre $f'$ et $2f'$"}</Tx></td>
              <td><Tx>{"RÉELLE, RENVERSÉE, AGRANDIE ($|\\gamma| > 1$)"}</Tx></td>
              <td>Projecteur</td>
            </tr>
            <tr data-actif={cas === "loupe"}>
              <td><Tx>{"Entre le foyer $F$ et la lentille (très près)"}</Tx></td>
              <td><Tx>{"VIRTUELLE, DROITE, AGRANDIE"}</Tx></td>
              <td>Loupe</td>
            </tr>
          </tbody>
        </TableauValeurs>
        <p className="mt-3 leading-8">
          <Tx>{"Dans les deux premiers cas, l'image est réelle : on peut la recueillir sur un écran. Dans le cas de la loupe, elle est virtuelle : on la voit à travers la lentille, mais on ne peut pas la recueillir sur un écran."}</Tx>
        </p>
      </Encart>

      <Encart titre="Que signifie le grandissement ?">
        <Formule bloc tex={"\\gamma = \\dfrac{\\overline{OA'}}{\\overline{OA}}"} />
        <ul className="mt-1 flex list-disc flex-col gap-1.5 pl-5">
          <li className="pl-1 leading-8">
            <Tx>{"$|\\gamma|$ donne la taille de l'image par rapport à l'objet : $|\\gamma| > 1$, l'image est agrandie ; $|\\gamma| < 1$, elle est réduite."}</Tx>
          </li>
          <li className="pl-1 leading-8">
            <Tx>{"Le SIGNE de $\\gamma$ donne le sens : $\\gamma < 0$, l'image est renversée ; $\\gamma > 0$, l'image est droite."}</Tx>
          </li>
        </ul>
        <p className="mt-2 leading-8">
          <span className="font-semibold text-fh-bleu">Exemple : </span>
          <Tx>{"$\\gamma = -0{,}67$ signifie que l'image fait $0{,}67$ fois la taille de l'objet (elle est réduite) et qu'elle est renversée (signe $-$)."}</Tx>
        </p>
      </Encart>
    </div>
  );
}
