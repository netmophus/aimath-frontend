"use client";

import { useMemo } from "react";
import katex from "katex";

import { calculerRacinesNiemes, pointSurCercleTrigo, rayonReelRacines, type RacinesData } from "@/lib/complexe";
import PlanComplexeAxes from "./PlanComplexeAxes";

/**
 * Polygone régulier des racines n-ièmes de a (z^n = a) — figure SVG
 * statique, même raisonnement SSR que CercleTrigonometrique.tsx (aucune API
 * navigateur, katex.renderToString est pur).
 *
 * Le rayon AFFICHÉ à l'écran est FIXE (RAYON px), indépendant du vrai rayon
 * mathématique |a|^(1/n) : sinon un module très grand ou très petit ferait
 * disparaître ou déborder la figure. Le vrai rayon est donné à part, en
 * texte/KaTeX sous la figure — voir lib/complexe.ts (rayonReelRacines).
 */

const TAILLE_SVG = 240;
const CENTRE = { x: 120, y: 120 };
const RAYON = 90;
// Écart volontairement large entre le rayon des libellés d'indice (k=0…) et
// la portée des axes : une racine peut tomber pile sur l'axe Re ou Im (ex.
// argument=0), auquel cas "k=0" et le libellé "Re"/"Im" seraient sinon au
// même endroit.
const RAYON_LABELS_INDICE = RAYON + 8;
const PORTEE_AXES = 118;

const COULEUR_BLEU = "#1E2B6A";
const COULEUR_ORANGE = "#D14205";
const COULEUR_POLYGONE_FOND = "rgba(209, 66, 5, 0.08)";

/** Arrondit à 3 décimales puis retire les zéros superflus (2.000 -> "2"). */
function formaterNombre(x: number): string {
  return String(Number(x.toFixed(3)));
}

/** Décale légèrement l'angle utilisé pour PLACER le libellé "k=…" (jamais le
 * sommet lui-même, qui reste à sa vraie position) quand ce sommet tombe pile
 * sur l'axe Re ou Im — sinon le libellé chevaucherait "Re"/"Im" (voir
 * PlanComplexeAxes.tsx, dessinés uniquement à l'est et au nord). Un cas
 * fréquent : le squelette inséré par défaut (argument: 0) place justement la
 * racine k=0 exactement sur l'axe Re. Le sens du décalage est choisi pour
 * s'écarter d'où vit chaque libellé d'axe : "Re" est au-dessus de son axe
 * (on pousse donc le libellé en dessous), "Im" est à droite du sien (on le
 * pousse vers la gauche). */
function angleLabelSansChevauchement(angleDegres: number): number {
  const normalise = ((angleDegres % 360) + 360) % 360;
  if (normalise < 8 || normalise > 352) return angleDegres - 14; // près de l'axe Re (est)
  if (Math.abs(normalise - 90) < 8) return angleDegres + 14; // près de l'axe Im (nord)
  return angleDegres;
}

interface RacinesNiemesProps {
  data: RacinesData;
}

export default function RacinesNiemes({ data }: RacinesNiemesProps) {
  const { n, module, argumentDegres } = data;

  const racines = useMemo(() => calculerRacinesNiemes(CENTRE, RAYON, data), [data]);
  const rayonReel = useMemo(() => rayonReelRacines(data), [data]);

  const pointsPolygone = racines.map((r) => `${r.point.x},${r.point.y}`).join(" ");

  const htmlDonnee = useMemo(
    () =>
      katex.renderToString(`|a| = ${formaterNombre(module)},\\ \\ \\arg(a) = ${formaterNombre(argumentDegres)}^\\circ`, {
        throwOnError: false,
        output: "html",
      }),
    [module, argumentDegres]
  );
  const htmlRayon = useMemo(
    () =>
      katex.renderToString(`r = |a|^{1/n} = ${formaterNombre(rayonReel)}`, {
        throwOnError: false,
        output: "html",
      }),
    [rayonReel]
  );
  const htmlFormuleAngle = useMemo(
    () =>
      katex.renderToString(
        `\\theta_k = \\dfrac{\\arg(a) + k \\times 360^\\circ}{n}, \\quad k \\in \\{0, \\dots, ${n - 1}\\}`,
        { throwOnError: false, output: "html" }
      ),
    [n]
  );

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-fh-sable bg-white p-4">
      <svg
        role="img"
        aria-label={`Racines ${n}-ièmes, module ${module}, argument ${argumentDegres} degrés`}
        viewBox={`0 0 ${TAILLE_SVG} ${TAILLE_SVG}`}
        className="w-full max-w-[300px]"
      >
        <circle cx={CENTRE.x} cy={CENTRE.y} r={RAYON} fill="none" stroke={COULEUR_BLEU} strokeWidth={1} opacity={0.5} />

        <PlanComplexeAxes centre={CENTRE} portee={PORTEE_AXES} couleur={COULEUR_BLEU} />

        <polygon points={pointsPolygone} fill={COULEUR_POLYGONE_FOND} stroke={COULEUR_ORANGE} strokeWidth={2} strokeLinejoin="round" />

        {racines.map(({ k, angleDegres, point }) => {
          const labelPos = pointSurCercleTrigo(CENTRE, RAYON_LABELS_INDICE, angleLabelSansChevauchement(angleDegres));
          return (
            <g key={k}>
              <circle cx={point.x} cy={point.y} r={4.5} fill={COULEUR_ORANGE} />
              <text
                x={labelPos.x}
                y={labelPos.y}
                fontSize={11}
                fontWeight={600}
                fill={COULEUR_ORANGE}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                k={k}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="max-w-xs text-center text-xs text-fh-ardoise">
        Les {n} racines {n}-ièmes de a sont régulièrement réparties sur le cercle de rayon r, aux sommets d&apos;un
        polygone régulier à {n} côtés.
      </p>
      <div className="flex flex-col items-center gap-1 text-center text-sm text-fh-bleu">
        <div dangerouslySetInnerHTML={{ __html: htmlDonnee }} />
        <div dangerouslySetInnerHTML={{ __html: htmlRayon }} />
        <div className="text-xs text-fh-ardoise" dangerouslySetInnerHTML={{ __html: htmlFormuleAngle }} />
      </div>
    </div>
  );
}
