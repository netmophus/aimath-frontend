"use client";

import { useEffect, useState, type ReactNode } from "react";

import { Choix } from "@/components/labo/commun";
import { nombreFr } from "@/lib/accueil/mathsLabo";
import { EXEMPLES_SUITE, graduations, NB_TERMES_AUTO, NB_TERMES_VERDICT, peutContinuer, termesSuite, type ExempleSuite, type IdSuite } from "@/lib/accueil/mathsLaboAvance";
import { BoutonReinitialiser, CadreSimulation, Formule, Tx, Valeur } from "./commun";

const W = 320;
const H = 168;
const MARGE = 20;
const Y_AXE = 112;
const NB_NIVEAUX = 4;
const ECART_NIVEAU = 15;
const INDICES = "₀₁₂₃₄₅₆₇₈₉";
const indice = (n: number) => String(n).replace(/\d/g, (d) => INDICES[Number(d)]);

const bouton =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50";

const VERDICTS = {
  converge: { titre: "La suite CONVERGE", classe: "border-[#2a9d4a] bg-[#eaf7ef]" },
  diverge: { titre: "La suite DIVERGE", classe: "border-fh-orange bg-white" },
  "sans-limite": { titre: "La suite NE CONVERGE PAS", classe: "border-fh-orange bg-white" },
} as const;

/** « Converge ou diverge ? » : les termes u₀, u₁, u₂… se posent un par un sur une droite graduée. */
export default function SimulationSuite() {
  const [idEx, setIdEx] = useState<IdSuite>("geo-converge");
  const ex = EXEMPLES_SUITE.find((e) => e.id === idEx) ?? EXEMPLES_SUITE[0];
  const [nb, setNb] = useState(1);
  const [auto, setAuto] = useState(false);

  const termes = termesSuite(ex, nb);
  const rang = termes.length - 1;
  const dernier = termes[rang];
  const continuer = peutContinuer(termes);

  // Lecture automatique : un terme toutes les 700 ms, jusqu'à NB_TERMES_AUTO termes (puis elle s'arrête d'elle-même).
  const enCours = auto && continuer && termes.length < NB_TERMES_AUTO;
  useEffect(() => {
    if (!enCours) return;
    const minuteur = setInterval(() => setNb((k) => k + 1), 700);
    return () => clearInterval(minuteur);
  }, [enCours]);

  function recommencer() {
    setNb(1);
    setAuto(false);
  }
  function choisir(id: IdSuite) {
    setIdEx(id);
    recommencer();
  }

  const ecartOuMax =
    ex.limite !== null
      ? { etiquette: <Formule tex={`\\left|u_{${rang}} - L\\right|`} />, valeur: nombreFr(Math.abs(dernier - ex.limite), 4) }
      : { etiquette: "Plus grand terme", valeur: nombreFr(Math.max(...termes), 4) };

  const verdict = VERDICTS[ex.nature];

  return (
    <div className="flex flex-col gap-5">
      <Encart titre="Objectif">
        <p>
          <Tx>{"Une suite est définie par son premier terme et une relation qui donne chaque terme à partir du précédent. La question est simple : quand on continue le calcul, les termes se rapprochent-ils d'un nombre (la suite converge) ou partent-ils vers l'infini (la suite diverge) ?"}</Tx>
        </p>
        <p className="mt-2">
          <span className="font-semibold text-fh-bleu">À observer : </span>
          <Tx>{"regarde les termes se poser sur la droite. S'ils se resserrent vers un point, la suite converge vers ce nombre."}</Tx>
        </p>
      </Encart>
      <CadreSimulation
        titre="Converge ou diverge ?"
        description="Choisis une suite, puis pose ses termes un par un sur la droite graduée."
        formule={<Formule tex={ex.definitionTex} />}
        graphique={<DroiteGraduee ex={ex} termes={termes} />}
        commandes={
          <>
            <Choix nom="Suite étudiée" options={EXEMPLES_SUITE.map((e) => ({ cle: e.id, libelle: <Formule tex={e.libelleTex} />, aria: e.libelle }))} valeur={idEx} onChoisir={choisir} />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuto(false);
                  setNb(termes.length + 1);
                }}
                disabled={!continuer}
                className={`${bouton} bg-fh-orange text-white hover:bg-fh-orange-fonce`}
              >
                Terme suivant
              </button>
              <button
                type="button"
                onClick={() => {
                  if (enCours) return setAuto(false);
                  if (!continuer || termes.length >= NB_TERMES_AUTO) setNb(1);
                  setAuto(true);
                }}
                aria-pressed={enCours}
                className={`${bouton} border border-fh-bleu/40 text-fh-bleu hover:bg-fh-bleu/5`}
              >
                {enCours ? "Pause" : "Automatique"}
              </button>
              <BoutonReinitialiser onClick={recommencer} label="Recommencer" />
            </div>
          </>
        }
        valeurs={
          <>
            <Valeur etiquette={<>Rang <Formule tex="n" /></>}>{rang}</Valeur>
            <Valeur etiquette={<>Dernier terme <Formule tex={`u_{${rang}}`} /></>}>{nombreFr(dernier, 4)}</Valeur>
            <Valeur etiquette="Termes posés">{termes.length}</Valeur>
            <Valeur etiquette={ecartOuMax.etiquette}>{ecartOuMax.valeur}</Valeur>
          </>
        }
        commentaire={
          termes.length >= NB_TERMES_VERDICT ? (
            <div role="status" aria-live="polite" className={`rounded-lg border-l-4 p-3 leading-8 ${verdict.classe}`}>
              <strong className="text-fh-bleu">{verdict.titre}</strong>
              <span> — </span>
              <Tx>{ex.verdict}</Tx>
            </div>
          ) : (
            <p className="leading-8">
              <Tx>{"Appuie sur « Terme suivant » : chaque terme calculé se pose sur la droite. Le verdict apparaît après quelques termes."}</Tx>
            </p>
          )
        }
      />
      <Encart titre="Démonstration">
        <ol className="flex list-decimal flex-col gap-3 pl-5">
          {ex.demo.etapes.map((e) => (
            <li key={e.titre} className="pl-1">
              <p className="font-semibold text-fh-bleu">{e.titre}</p>
              <p className="leading-8">
                <Tx>{e.texte}</Tx>
              </p>
            </li>
          ))}
        </ol>
        <p className="mt-3 border-t border-fh-orange/30 pt-3 leading-8">
          <span className="font-semibold text-fh-bleu">Conclusion : </span>
          <strong>
            <Tx>{ex.demo.conclusion}</Tx>
          </strong>
        </p>
      </Encart>
    </div>
  );
}

/** Droite graduée horizontale (SVG) : un point par terme, étiquettes u₀, u₁…, repère vert à la limite L si elle existe. */
function DroiteGraduee({ ex, termes }: { ex: ExempleSuite; termes: number[] }) {
  const { lo, hi } = ex;
  const X = (v: number) => MARGE + ((v - lo) / (hi - lo)) * (W - 2 * MARGE);
  const g = graduations(lo, hi);
  const dernier = termes.length - 1;
  const horsFenetre = termes.findIndex((v) => v > hi || v < lo);

  // Étiquettes réparties sur plusieurs niveaux ; une étiquette trop proche d'une autre du même niveau est omise.
  const etiquettes: { k: number; x: number; niveau: number }[] = [];
  termes.forEach((v, k) => {
    if (v > hi || v < lo) return;
    const niveau = k % NB_NIVEAUX;
    const x = X(v);
    const libre = !etiquettes.some((e) => e.niveau === niveau && Math.abs(e.x - x) < 24);
    if (k === dernier || libre) etiquettes.push({ k, x, niveau });
  });
  const aff = etiquettes.filter((e) => e.k === dernier || !etiquettes.some((f) => f.k === dernier && f.niveau === e.niveau && Math.abs(f.x - e.x) < 24));

  const description =
    `Droite graduée de ${nombreFr(lo, 1)} à ${nombreFr(hi, 1)} avec les termes u0 à u${dernier} de la suite` +
    (ex.limite !== null ? `, limite ${nombreFr(ex.limite, 3)}` : "");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[520px]" role="img" aria-label={description}>
      {/* axe et graduations */}
      <line x1={MARGE - 8} y1={Y_AXE} x2={W - MARGE + 8} y2={Y_AXE} className="stroke-fh-ardoise" strokeWidth={1.6} />
      {g.map((v) => (
        <g key={v}>
          <line x1={X(v)} y1={Y_AXE - 4} x2={X(v)} y2={Y_AXE + 4} className="stroke-fh-ardoise" strokeWidth={1.2} />
          <text x={X(v)} y={Y_AXE + 18} textAnchor="middle" className="fill-fh-ardoise text-[13px]">
            {nombreFr(v, 2)}
          </text>
        </g>
      ))}
      {/* limite L */}
      {ex.limite !== null && (
        <g>
          <line x1={X(ex.limite)} y1={22} x2={X(ex.limite)} y2={Y_AXE + 26} stroke="#2a9d4a" strokeWidth={2} strokeDasharray="5 3" />
          <text x={X(ex.limite)} y={Y_AXE + 42} textAnchor="middle" fill="#1f7a38" className="text-[13px] font-semibold">
            {ex.limiteTexte}
          </text>
        </g>
      )}
      {/* étiquettes des termes */}
      {aff.map(({ k, x, niveau }) => {
        const y = Y_AXE - 20 - niveau * ECART_NIVEAU;
        const dernierTerme = k === dernier;
        return (
          <g key={k}>
            <line x1={x} y1={y + 3} x2={x} y2={Y_AXE - 6} className={dernierTerme ? "stroke-fh-orange" : "stroke-fh-bleu/40"} strokeWidth={1} />
            <text x={x} y={y} textAnchor="middle" className={`text-[13px] ${dernierTerme ? "fill-fh-orange-fonce font-bold" : "fill-fh-bleu"}`}>
              u{indice(k)}
            </text>
          </g>
        );
      })}
      {/* points */}
      {termes.map((v, k) =>
        v > hi || v < lo ? null : (
          <circle key={k} cx={X(v)} cy={Y_AXE} r={k === dernier ? 6 : 4.5} className={k === dernier ? "fill-fh-orange stroke-white" : "fill-fh-bleu stroke-white"} strokeWidth={1.2} />
        ),
      )}
      {/* termes sortis de la fenêtre */}
      {horsFenetre >= 0 && (
        <g>
          <polygon points={`${W - MARGE + 2},${Y_AXE - 7} ${W - MARGE + 12},${Y_AXE} ${W - MARGE + 2},${Y_AXE + 7}`} className="fill-fh-orange" />
          <text x={W - 6} y={Y_AXE - 14} textAnchor="end" className="fill-fh-orange-fonce text-[13px] font-semibold">
            à partir de u{indice(horsFenetre)} →
          </text>
        </g>
      )}
    </svg>
  );
}

/** Encadré pédagogique (bordure gauche orange, fond léger) : même style que « Le concept » des autres onglets. */
function Encart({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 border-fh-orange bg-fh-accent/60 p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-fh-orange-fonce">{titre}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-fh-ardoise sm:text-base">{children}</div>
    </div>
  );
}
