"use client";

import { useId, useState } from "react";

import { Choix } from "@/components/labo/commun";
import { nombreFr } from "@/lib/accueil/mathsLabo";
import { FONCTIONS_LIMITE, graduations, troncons, type IdLimite } from "@/lib/accueil/mathsLaboAvance";
import { BoutonReinitialiser, CadreSimulation, chemin, Curseur, Formule, repere, Tx, Valeur } from "./commun";
import { CadreGraphe, EncartConcept } from "./GrapheMaths";

const W = 440;
const H = 320;

/** On fait glisser x et on lit f(x) : la courbe colle à ses asymptotes (en pointillés). */
export default function SimulationLimites() {
  const [id, setId] = useState<IdLimite>("homographique");
  const fo = FONCTIONS_LIMITE.find((f) => f.id === id) ?? FONCTIONS_LIMITE[0];
  const [x, setX] = useState<number>(fo.curseur.initial);
  const clip = useId();

  const { xmin, xmax, ymin, ymax } = fo.fenetre;
  const R = repere(xmin, xmax, ymin, ymax, W, H, 34);
  const branches = troncons(fo.f, xmin, xmax, ymin - 40, ymax + 40, 800);

  const xv = fo.asymptoteV;
  const interdit = (fo.trou && Math.abs(x - fo.trou.x) < 0.05) || (xv !== null && Math.abs(x - xv) < 0.05);
  const y = fo.f(x);
  const ah = fo.asymptoteH;

  function choisir(nouveau: IdLimite) {
    const f = FONCTIONS_LIMITE.find((v) => v.id === nouveau) ?? FONCTIONS_LIMITE[0];
    setId(nouveau);
    setX(f.curseur.initial);
  }

  let commentaire: string;
  if (fo.trou && Math.abs(x - fo.trou.x) < 0.5) {
    commentaire = interdit
      ? `f n'est pas définie en x = ${nombreFr(fo.trou.x, 0)} (division par zéro), mais quand x s'en approche, f(x) se rapproche de ${nombreFr(fo.trou.limite, 0)} : la limite existe. Le point creux marque ce « trou ».`
      : `x est proche de ${nombreFr(fo.trou.x, 0)} : f(x) = ${nombreFr(y, 4)} est très proche de ${nombreFr(fo.trou.limite, 0)}, valeur de la limite en ce point.`;
  } else if (xv !== null && Math.abs(x - xv) < 0.6) {
    commentaire = interdit
      ? `f n'est pas définie en x = ${nombreFr(xv, 0)} : la courbe ne traverse jamais la droite verticale en pointillés.`
      : `x est proche de ${nombreFr(xv, 0)} : f(x) = ${nombreFr(y, 2)} est ${y > 0 ? "très grande et positive" : "très grande et négative"}. La courbe colle à l'asymptote verticale x = ${nombreFr(xv, 0)}.`;
  } else if (ah !== null) {
    commentaire = `f(x) = ${nombreFr(y, 4)}. L'écart avec l'asymptote horizontale y = ${nombreFr(ah, 0)} est ${nombreFr(Math.abs(y - ah), 4)} : ${Math.abs(y - ah) < 0.5 ? "la courbe est déjà collée à la droite en pointillés." : "approche x des bords pour voir cet écart diminuer."}`;
  } else {
    commentaire = `f(x) = ${nombreFr(y, 4)}.`;
  }

  return (
    <div className="flex flex-col gap-5">
      <EncartConcept
        concept={
          <Tx>
            {"Une limite décrit ce que devient $f(x)$ quand $x$ s'approche d'une valeur ou devient très grand. Une droite que la courbe finit par coller sans l'atteindre est une asymptote : horizontale quand $f(x)$ tend vers un nombre en l'infini, verticale quand $f(x)$ devient énorme près d'une valeur interdite."}
          </Tx>
        }
        observer={<Tx>{"fais glisser $x$ vers la valeur interdite ou vers les bords du graphique : lis $f(x)$ et compare-la à la droite en pointillés."}</Tx>}
      />
      <CadreSimulation
        titre="Glisse x et lis la limite"
        description="Choisis une fonction, déplace x et observe f(x) se rapprocher de ses asymptotes."
        formule={
          <>
            <Formule tex={fo.fTex} />
            <span className="mt-1 flex flex-col gap-0.5">
              {fo.limitesTex.map((tex) => (
                <Formule key={tex} bloc tex={tex} />
              ))}
            </span>
          </>
        }
        graphique={
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Courbe de f(x) = ${fo.libelle} avec ses asymptotes ; x = ${nombreFr(x, 1)}`}>
            <defs>
              <clipPath id={clip}>
                <rect x={R.X(xmin)} y={R.Y(ymax)} width={R.X(xmax) - R.X(xmin)} height={R.Y(ymin) - R.Y(ymax)} />
              </clipPath>
            </defs>
            <CadreGraphe R={R} largeur={W} hauteur={H} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} gx={graduations(xmin, xmax, 7)} gy={graduations(ymin, ymax, 5)} nomX="x" />
            <g clipPath={`url(#${clip})`}>
              {ah !== null && <line x1={R.X(xmin)} y1={R.Y(ah)} x2={R.X(xmax)} y2={R.Y(ah)} className="stroke-fh-orange" strokeWidth={1.8} strokeDasharray="7 5" />}
              {xv !== null && <line x1={R.X(xv)} y1={R.Y(ymin)} x2={R.X(xv)} y2={R.Y(ymax)} className="stroke-fh-orange" strokeWidth={1.8} strokeDasharray="7 5" />}
              {branches.map((b, i) => (
                <path key={i} d={chemin(b.map(([px, py]) => [R.X(px), R.Y(py)] as [number, number]))} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} />
              ))}
            </g>
            {ah !== null && <text x={R.X(xmax) - 4} y={R.Y(ah) - 6} textAnchor="end" className="fill-fh-orange-fonce text-[10px] font-semibold">y = {nombreFr(ah, 0)}</text>}
            {xv !== null && <text x={R.X(xv) + 6} y={R.Y(ymax) + 14} className="fill-fh-orange-fonce text-[10px] font-semibold">x = {nombreFr(xv, 0)}</text>}
            {fo.trou && <circle cx={R.X(fo.trou.x)} cy={R.Y(fo.trou.limite)} r={4.5} className="fill-white stroke-fh-bleu" strokeWidth={2} />}
            {/* position de x */}
            <line x1={R.X(x)} y1={R.Y(ymin)} x2={R.X(x)} y2={R.Y(ymax)} className="stroke-fh-ardoise/50" strokeWidth={1} />
            {!interdit && Number.isFinite(y) && y >= ymin && y <= ymax && (
              <>
                <line x1={R.X(xmin)} y1={R.Y(y)} x2={R.X(x)} y2={R.Y(y)} className="stroke-fh-bleu/50" strokeWidth={1} strokeDasharray="3 3" />
                <circle cx={R.X(x)} cy={R.Y(y)} r={5.5} className="fill-fh-orange stroke-white" strokeWidth={1.5} />
              </>
            )}
          </svg>
        }
        commandes={
          <>
            <Choix nom="Fonction f" options={FONCTIONS_LIMITE.map((f) => ({ cle: f.id, libelle: <Formule tex={f.libelleTex} />, aria: f.libelle }))} valeur={id} onChoisir={choisir} />
            <Curseur
              nom={<Formule tex="x" />}
              valeurTexte={`x = ${nombreFr(x, 1)}`}
              min={fo.curseur.min}
              max={fo.curseur.max}
              pas={fo.curseur.pas}
              valeur={x}
              onChange={(v) => setX(Math.round(v * 10) / 10)}
              ariaLabel="Valeur de x"
            />
            <BoutonReinitialiser onClick={() => setX(fo.curseur.initial)} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette="x">{nombreFr(x, 1)}</Valeur>
            <Valeur etiquette={<Formule tex="f(x)" />}>{interdit ? "non définie" : nombreFr(y, 4)}</Valeur>
            {ah !== null && <Valeur etiquette={<>Écart <Formule tex={`\\left|f(x) - ${ah}\\right|`} /></>}>{interdit ? "—" : nombreFr(Math.abs(y - ah), 4)}</Valeur>}
            {xv !== null && <Valeur etiquette={<>Distance <Formule tex={`\\left|x - ${xv}\\right|`} /></>}>{nombreFr(Math.abs(x - xv), 1)}</Valeur>}
          </>
        }
        commentaire={commentaire}
      />
    </div>
  );
}
