"use client";

import { useMemo } from "react";
import katex from "katex";

import { echantillonnerArc, pointSurCercleTrigo, type CercleTrigoData } from "@/lib/complexe";
import PlanComplexeAxes from "./PlanComplexeAxes";

/**
 * Cercle trigonométrique — figure SVG statique (pas d'état, contrairement à
 * HorlogeModulaire) : un point M sur le cercle unité à l'angle donné, ses
 * projections optionnelles, et l'affixe e^{iθ}. Même raisonnement SSR que
 * components/TableauVariations.tsx / HorlogeModulaire.tsx : aucune API
 * navigateur (katex.renderToString est pur, pas de DOM) — SSR-safe, pas de
 * next/dynamic({ ssr: false }).
 */

const TAILLE_SVG = 240;
const CENTRE = { x: 120, y: 120 };
const RAYON = 90;
const RAYON_ARC = 26;
const PORTEE_AXES = 104;

const COULEUR_BLEU = "#1E2B6A";
const COULEUR_ORANGE = "#D14205";
const COULEUR_TEINTE = "rgba(30, 43, 106, 0.05)";

// Libellés symboliques (θ, cos θ, sin θ) : constants quel que soit l'angle,
// donc calculés une seule fois au chargement du module plutôt qu'à chaque
// rendu — katex.renderToString est pur (pas de DOM), donc sûr à exécuter
// aussi bien côté serveur (SSR) que client.
const HTML_THETA = katex.renderToString("\\theta", { throwOnError: false, output: "html" });
const HTML_COS_THETA = katex.renderToString("\\cos\\theta", { throwOnError: false, output: "html" });
const HTML_SIN_THETA = katex.renderToString("\\sin\\theta", { throwOnError: false, output: "html" });

interface CercleTrigonometriqueProps {
  data: CercleTrigoData;
}

/** Petit libellé KaTeX positionné dans le SVG via <foreignObject> — seule
 * façon d'obtenir un vrai rendu KaTeX (police, exposants…) à l'intérieur
 * d'une figure SVG ; supporté par tous les navigateurs modernes. */
function EtiquetteKatex({ x, y, html, couleur, ancrage = "middle" }: { x: number; y: number; html: string; couleur: string; ancrage?: "start" | "middle" | "end" }) {
  const decalageX = ancrage === "start" ? 0 : ancrage === "end" ? -56 : -28;
  return (
    <foreignObject x={x + decalageX} y={y - 10} width={56} height={20} style={{ overflow: "visible" }}>
      <div
        style={{ fontSize: "13px", color: couleur, textAlign: ancrage === "middle" ? "center" : ancrage, lineHeight: 1 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </foreignObject>
  );
}

export default function CercleTrigonometrique({ data }: CercleTrigonometriqueProps) {
  const { angleDegres, montrerProjections, label } = data;

  const M = useMemo(() => pointSurCercleTrigo(CENTRE, RAYON, angleDegres), [angleDegres]);
  const piedRe = { x: M.x, y: CENTRE.y };
  const piedIm = { x: CENTRE.x, y: M.y };
  const auDessusAxe = M.y < CENTRE.y; // sin θ > 0
  const aDroiteAxe = M.x >= CENTRE.x; // cos θ >= 0

  const pointsArc = useMemo(() => echantillonnerArc(CENTRE, RAYON_ARC, angleDegres), [angleDegres]);
  const cheminArc = pointsArc.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const milieuArc = pointSurCercleTrigo(CENTRE, RAYON_ARC + 14, angleDegres / 2);

  const htmlAffixe = useMemo(
    () => katex.renderToString(`${label} = e^{i\\theta}`, { throwOnError: false, output: "html" }),
    [label]
  );
  const htmlAngle = useMemo(
    () => katex.renderToString(`\\theta = ${angleDegres}^\\circ`, { throwOnError: false, output: "html" }),
    [angleDegres]
  );

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-fh-sable bg-white p-4">
      <svg
        role="img"
        aria-label={`Cercle trigonométrique, point ${label} à l'angle ${angleDegres} degrés`}
        viewBox={`0 0 ${TAILLE_SVG} ${TAILLE_SVG}`}
        className="w-full max-w-[280px]"
      >
        <circle cx={CENTRE.x} cy={CENTRE.y} r={RAYON} fill={COULEUR_TEINTE} stroke={COULEUR_BLEU} strokeWidth={2} />

        <PlanComplexeAxes centre={CENTRE} portee={PORTEE_AXES} couleur={COULEUR_BLEU} />

        {montrerProjections && (
          <g stroke={COULEUR_BLEU} strokeWidth={1.25} strokeDasharray="4 3">
            <line x1={M.x} y1={M.y} x2={piedRe.x} y2={piedRe.y} />
            <line x1={M.x} y1={M.y} x2={piedIm.x} y2={piedIm.y} />
          </g>
        )}
        {montrerProjections && (
          <>
            <EtiquetteKatex x={piedRe.x} y={CENTRE.y + (auDessusAxe ? 20 : -16)} html={HTML_COS_THETA} couleur={COULEUR_BLEU} />
            <EtiquetteKatex
              x={CENTRE.x}
              y={piedIm.y}
              html={HTML_SIN_THETA}
              couleur={COULEUR_BLEU}
              ancrage={aDroiteAxe ? "end" : "start"}
            />
          </>
        )}

        <path d={cheminArc} fill="none" stroke={COULEUR_ORANGE} strokeWidth={1.5} />
        <EtiquetteKatex x={milieuArc.x} y={milieuArc.y} html={HTML_THETA} couleur={COULEUR_ORANGE} />

        <line x1={CENTRE.x} y1={CENTRE.y} x2={M.x} y2={M.y} stroke={COULEUR_ORANGE} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={M.x} cy={M.y} r={5} fill={COULEUR_ORANGE} />
        <text x={M.x + (aDroiteAxe ? 10 : -10)} y={M.y - 8} fontSize={13} fontWeight={700} fill={COULEUR_ORANGE} textAnchor={aDroiteAxe ? "start" : "end"}>
          M
        </text>
      </svg>

      <div className="flex flex-col items-center gap-1 text-center text-sm">
        <div className="flex items-center gap-1 font-semibold text-fh-bleu">
          <span>Point M, affixe</span>
          <span dangerouslySetInnerHTML={{ __html: htmlAffixe }} />
        </div>
        <div className="text-fh-ardoise" dangerouslySetInnerHTML={{ __html: htmlAngle }} />
      </div>
    </div>
  );
}
