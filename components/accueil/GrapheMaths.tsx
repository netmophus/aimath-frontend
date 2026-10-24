import type { ReactNode } from "react";

import { nombreFr } from "@/lib/accueil/mathsLabo";
import type { repere } from "./commun";

/** Encart « Le concept » d'un onglet du laboratoire : explication, puis ligne « À observer » en orange. */
export function EncartConcept({ concept, observer }: { concept: ReactNode; observer: ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 border-fh-orange bg-fh-accent/60 p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-fh-orange-fonce">Le concept</p>
      <p className="mt-1.5 text-sm leading-relaxed text-fh-ardoise sm:text-base">{concept}</p>
      <p className="mt-2 text-sm leading-relaxed text-fh-ardoise sm:text-base">
        <span className="font-bold text-fh-orange-fonce">À observer : </span>
        {observer}
      </p>
    </div>
  );
}

interface CadreProps {
  R: ReturnType<typeof repere>;
  largeur: number;
  hauteur: number;
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  gx: number[];
  gy: number[];
  /** Nom de l'axe horizontal (à droite, sous le cadre). */
  nomX?: string;
}

/** Cadre blanc, quadrillage, graduations et axes passant par 0 (quand 0 est dans la fenêtre). */
export function CadreGraphe({ R, largeur, hauteur, xmin, xmax, ymin, ymax, gx, gy, nomX }: CadreProps) {
  const g = R.marge;
  return (
    <>
      <rect x={g} y={R.Y(ymax)} width={largeur - 2 * g} height={R.Y(ymin) - R.Y(ymax)} className="fill-white stroke-fh-sable" />
      {gx.map((v) => (
        <g key={`x${v}`}>
          <line x1={R.X(v)} y1={R.Y(ymax)} x2={R.X(v)} y2={R.Y(ymin)} className="stroke-fh-sable/70" strokeWidth={0.7} />
          <text x={R.X(v)} y={R.Y(ymin) + 13} textAnchor="middle" className="fill-fh-ardoise text-[9px]">{nombreFr(v, 2)}</text>
        </g>
      ))}
      {gy.map((v) => (
        <g key={`y${v}`}>
          <line x1={R.X(xmin)} y1={R.Y(v)} x2={R.X(xmax)} y2={R.Y(v)} className="stroke-fh-sable/70" strokeWidth={0.7} />
          <text x={g - 5} y={R.Y(v) + 3} textAnchor="end" className="fill-fh-ardoise text-[9px]">{nombreFr(v, 2)}</text>
        </g>
      ))}
      {ymin < 0 && ymax > 0 && <line x1={R.X(xmin)} y1={R.Y(0)} x2={R.X(xmax)} y2={R.Y(0)} className="stroke-fh-ardoise" strokeWidth={1.1} />}
      {xmin < 0 && xmax > 0 && <line x1={R.X(0)} y1={R.Y(ymax)} x2={R.X(0)} y2={R.Y(ymin)} className="stroke-fh-ardoise" strokeWidth={1.1} />}
      {nomX && <text x={largeur - g} y={hauteur - 3} textAnchor="end" className="fill-fh-ardoise text-[10px] italic">{nomX}</text>}
    </>
  );
}
