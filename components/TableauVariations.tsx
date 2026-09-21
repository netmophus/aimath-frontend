"use client";

import { useId } from "react";
import katex from "katex";

import { ressembleLatex, type ColonneVariations, type PositionValeur, type ValeurVariation, type VariationsData } from "@/lib/variations";

/**
 * Rendu SVG d'un tableau de variations (style "moderne coloré" validé) —
 * cadre bleu arrondi, colonne de gauche teintée, signes +/− en vert/rouge,
 * flèches diagonales colorées, pointillés reliant un "0" de f'(x) à
 * l'extremum correspondant.
 *
 * SSR : ce fichier porte "use client" (comme CourbeFonction.tsx) simplement
 * parce qu'il utilise le hook `useId` (identifiants uniques des clipPath/
 * defs SVG, indispensable si plusieurs tableaux apparaissent dans la même
 * leçon) — mais CONTRAIREMENT aux courbes (function-plot, qui doit attacher
 * une sélection d3 à un noeud DOM réel et ne peut donc jamais s'exécuter
 * côté serveur), ce composant ne touche NI window NI document : c'est du
 * SVG statique + `katex.renderToString` (une fonction pure qui produit du
 * HTML en chaîne, sans DOM — le même mécanisme que rehype-katex utilise déjà
 * pour le Markdown). Il se rend donc à l'identique en SSR et en hydratation,
 * SANS `next/dynamic({ ssr: false })` — voir TableauVariationsBloc.tsx pour
 * la comparaison explicite avec le pont des courbes.
 */

const LARGEUR_LABEL = 68;
const LARGEUR_INTERVALLE = 92;
const MARGE_DROITE = 8;
const HAUTEUR_LIGNE_X = 34;
const HAUTEUR_LIGNE_SIGNE = 40;
const HAUTEUR_LIGNE_F = 104;
const PADDING = 10;

const COULEUR_CADRE = "#1E2B6A"; // fh-bleu
const COULEUR_TEINTE = "rgba(30, 43, 106, 0.06)"; // fh-bleu très clair (colonne de gauche)
const COULEUR_POSITIF = "#0F7A3D";
const COULEUR_NEGATIF = "#C0392B";
const COULEUR_NEUTRE = "#8A8386"; // segment plat (signe "0" sur tout un intervalle)
const COULEUR_EXTREMUM = "#1E2B6A"; // fh-bleu : valeur de f à un extremum intérieur
const COULEUR_BORNE = "#363032"; // fh-ardoise : bornes du tableau et points de passage
const COULEUR_DIVIDER = "#E2DDD8";
const COULEUR_LABEL = "#1E2B6A";

function yPourPosition(position: PositionValeur, hautF: number, basF: number): number {
  if (position === "haut") return hautF;
  if (position === "bas") return basF;
  return (hautF + basF) / 2;
}

/** La valeur à utiliser comme extrémité d'une flèche entrant/sortant de
 * cette colonne — la moitié gauche pour l'intervalle qui se termine ici, la
 * moitié droite pour celui qui commence ici (identiques hors colonne
 * "interdit:" à notation gauche|droite — voir lib/variations.ts). */
function valeurPourCote(colonne: ColonneVariations, cote: "gauche" | "droite"): ValeurVariation {
  if (colonne.valeurs.length === 2) return cote === "gauche" ? colonne.valeurs[0] : colonne.valeurs[1];
  return colonne.valeurs[0];
}

interface TexteMathProps {
  texte: string;
  x: number;
  y: number;
  couleur: string;
  poids?: "normal" | "bold";
}

/** Rendu KaTeX (via foreignObject) si `texte` ressemble à du LaTeX (ce qui
 * couvre aussi -∞/+∞, normalisés en "-\infty"/"+\infty" par lib/variations.ts
 * — donc toujours rendus par KaTeX, jamais en texte brut), sinon <text> SVG
 * simple. */
function TexteMath({ texte, x, y, couleur, poids = "normal" }: TexteMathProps) {
  if (!ressembleLatex(texte)) {
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={poids} fill={couleur}>
        {texte}
      </text>
    );
  }

  const html = katex.renderToString(texte, { throwOnError: false, output: "html" });
  const largeur = 84;
  const hauteur = 28;
  return (
    <foreignObject x={x - largeur / 2} y={y - hauteur / 2} width={largeur} height={hauteur} style={{ overflow: "visible" }}>
      <div
        // Pas de xmlns explicite : dans un document HTML5 (notre cas —
        // jamais de XHTML strict ici), le contenu d'un <foreignObject> sans
        // espace de noms déclaré est traité comme du HTML par défaut — un
        // <div> React s'y comporte normalement, sans balise supplémentaire.
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          fontSize: 13,
          color: couleur,
          fontWeight: poids === "bold" ? 700 : 400,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </foreignObject>
  );
}

interface TableauVariationsProps {
  data: VariationsData;
}

export default function TableauVariations({ data }: TableauVariationsProps) {
  const idClip = useId();
  const { colonnes, signes, fonction } = data;
  const n = colonnes.length;

  const largeurTotale = LARGEUR_LABEL + (n - 1) * LARGEUR_INTERVALLE + MARGE_DROITE;
  const hauteurTotale = PADDING * 2 + HAUTEUR_LIGNE_X + HAUTEUR_LIGNE_SIGNE + HAUTEUR_LIGNE_F;

  const yLigneX = PADDING + HAUTEUR_LIGNE_X / 2;
  const yFinLigneX = PADDING + HAUTEUR_LIGNE_X;
  const yLigneSigne = yFinLigneX + HAUTEUR_LIGNE_SIGNE / 2;
  const yFinLigneSigne = yFinLigneX + HAUTEUR_LIGNE_SIGNE;
  const yHautF = yFinLigneSigne + 24;
  const yBasF = yFinLigneSigne + HAUTEUR_LIGNE_F - 24;

  const xPos = (i: number) => LARGEUR_LABEL + i * LARGEUR_INTERVALLE;
  const xMilieuIntervalle = (i: number) => (xPos(i) + xPos(i + 1)) / 2;

  return (
    <div className="w-full max-w-full overflow-x-auto rounded-2xl">
      <svg
        role="img"
        aria-label={`Tableau de variations de ${fonction}`}
        width={largeurTotale}
        height={hauteurTotale}
        viewBox={`0 0 ${largeurTotale} ${hauteurTotale}`}
        className="block"
      >
        <defs>
          <clipPath id={idClip}>
            <rect x={0} y={0} width={largeurTotale} height={hauteurTotale} rx={12} ry={12} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${idClip})`}>
          {/* Fond blanc (sous la colonne teintée et le contenu) */}
          <rect x={0} y={0} width={largeurTotale} height={hauteurTotale} fill="white" />
          {/* Colonne de gauche teintée */}
          <rect x={0} y={0} width={LARGEUR_LABEL} height={hauteurTotale} fill={COULEUR_TEINTE} />

          {/* Séparateurs horizontaux entre les 3 lignes */}
          <line x1={0} y1={yFinLigneX} x2={largeurTotale} y2={yFinLigneX} stroke={COULEUR_DIVIDER} strokeWidth={1} />
          <line x1={0} y1={yFinLigneSigne} x2={largeurTotale} y2={yFinLigneSigne} stroke={COULEUR_DIVIDER} strokeWidth={1} />
          {/* Séparateur vertical entre la colonne de labels et les données */}
          <line x1={LARGEUR_LABEL} y1={0} x2={LARGEUR_LABEL} y2={hauteurTotale} stroke={COULEUR_DIVIDER} strokeWidth={1} />

          {/* Libellés de lignes */}
          <text x={LARGEUR_LABEL / 2} y={yLigneX} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={600} fill={COULEUR_LABEL}>
            x
          </text>
          <text x={LARGEUR_LABEL / 2} y={yLigneSigne} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={600} fill={COULEUR_LABEL}>
            {fonction}&apos;(x)
          </text>
          <text x={LARGEUR_LABEL / 2} y={(yFinLigneSigne + hauteurTotale - PADDING) / 2} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={600} fill={COULEUR_LABEL}>
            {fonction}
          </text>

          {/* Lignes verticales à chaque valeur de x (doublées si "interdit") */}
          {colonnes.map((colonne, i) =>
            colonne.interdit ? (
              <g key={`div-${i}`}>
                <line x1={xPos(i) - 2} y1={0} x2={xPos(i) - 2} y2={hauteurTotale} stroke={COULEUR_BORNE} strokeWidth={1.5} />
                <line x1={xPos(i) + 2} y1={0} x2={xPos(i) + 2} y2={hauteurTotale} stroke={COULEUR_BORNE} strokeWidth={1.5} />
              </g>
            ) : (
              <line key={`div-${i}`} x1={xPos(i)} y1={0} x2={xPos(i)} y2={hauteurTotale} stroke={COULEUR_DIVIDER} strokeWidth={1} />
            )
          )}

          {/* Ligne x : valeurs remarquables */}
          {colonnes.map((colonne, i) => (
            <TexteMath key={`x-${i}`} texte={colonne.x} x={xPos(i)} y={yLigneX} couleur={COULEUR_BORNE} />
          ))}

          {/* Ligne f'(x) : signe sur chaque intervalle */}
          {signes.map((signe, i) => {
            const couleur = signe === "+" ? COULEUR_POSITIF : signe === "-" ? COULEUR_NEGATIF : COULEUR_NEUTRE;
            return (
              <text
                key={`signe-${i}`}
                x={xMilieuIntervalle(i)}
                y={yLigneSigne}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={16}
                fontWeight={700}
                fill={couleur}
              >
                {signe === "0" ? "0" : signe}
              </text>
            );
          })}

          {/* Ligne f'(x) : marqueurs aux valeurs (0 d'annulation, ‖ valeur interdite) */}
          {colonnes.map((colonne, i) => {
            if (colonne.marqueurSigne === "zero") {
              return (
                <text key={`marq-${i}`} x={xPos(i)} y={yLigneSigne} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={700} fill={COULEUR_BORNE}>
                  0
                </text>
              );
            }
            if (colonne.marqueurSigne === "interdit") {
              return (
                <text key={`marq-${i}`} x={xPos(i)} y={yLigneSigne} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={700} fill={COULEUR_BORNE}>
                  ‖
                </text>
              );
            }
            return null;
          })}

          {/* Pointillés reliant un "0" de f'(x) à l'extremum correspondant de f */}
          {colonnes.map((colonne, i) => {
            if (colonne.marqueurSigne !== "zero") return null;
            const y = yPourPosition(colonne.valeurs[0].position, yHautF, yBasF);
            return (
              <line
                key={`pointille-${i}`}
                x1={xPos(i)}
                y1={yFinLigneSigne}
                x2={xPos(i)}
                y2={y}
                stroke={COULEUR_BORNE}
                strokeWidth={1}
                strokeDasharray="3,3"
                opacity={0.5}
              />
            );
          })}

          {/* Ligne f : flèches diagonales entre valeurs consécutives */}
          {signes.map((signe, i) => {
            const y1 = yPourPosition(valeurPourCote(colonnes[i], "droite").position, yHautF, yBasF);
            const y2 = yPourPosition(valeurPourCote(colonnes[i + 1], "gauche").position, yHautF, yBasF);
            const couleur = signe === "+" ? COULEUR_POSITIF : signe === "-" ? COULEUR_NEGATIF : COULEUR_NEUTRE;
            return (
              <line
                key={`fleche-${i}`}
                x1={xPos(i)}
                y1={y1}
                x2={xPos(i + 1)}
                y2={y2}
                stroke={couleur}
                strokeWidth={2}
                strokeDasharray={signe === "0" ? "4,3" : undefined}
                markerEnd={`url(#fleche-${signe === "+" ? "haut" : signe === "-" ? "bas" : "plat"}-${idClip})`}
              />
            );
          })}

          {/* Ligne f : valeurs (une ou deux — colonne "interdit:" en gauche|droite) */}
          {colonnes.map((colonne, i) =>
            colonne.valeurs.map((valeur, j) => (
              <TexteMath
                key={`f-${i}-${j}`}
                texte={valeur.texte}
                x={xPos(i)}
                y={yPourPosition(valeur.position, yHautF, yBasF)}
                couleur={i === 0 || i === n - 1 || valeur.position === "milieu" ? COULEUR_BORNE : COULEUR_EXTREMUM}
                poids={valeur.position !== "milieu" ? "bold" : "normal"}
              />
            ))
          )}
        </g>

        {/* Pointes de flèche (montante verte, descendante rouge, plate grise) */}
        <defs>
          <marker id={`fleche-haut-${idClip}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={COULEUR_POSITIF} />
          </marker>
          <marker id={`fleche-bas-${idClip}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={COULEUR_NEGATIF} />
          </marker>
          <marker id={`fleche-plat-${idClip}`} viewBox="0 0 10 10" refX={8} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={COULEUR_NEUTRE} />
          </marker>
        </defs>

        {/* Cadre bleu arrondi */}
        <rect
          x={1}
          y={1}
          width={largeurTotale - 2}
          height={hauteurTotale - 2}
          rx={11}
          ry={11}
          fill="none"
          stroke={COULEUR_CADRE}
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}
