"use client";

import { useEffect, useId, useState } from "react";

import { Choix } from "@/components/labo/commun";
import { nombreFr } from "@/lib/accueil/mathsLabo";
import { graduations, NB_MARCHES, pointFixe, RELATIONS, SUITE_Q, termes, toile, troncons, type IdRelation } from "@/lib/accueil/mathsLaboAvance";
import { BoutonReinitialiser, CadreSimulation, chemin, Curseur, Formule, repere, Tx, Valeur } from "./commun";
import { CadreGraphe, EncartConcept } from "./GrapheMaths";

const T = 380; // dessin carré : la droite y = x est à 45 degrés
const INDICES = "₀₁₂₃₄₅₆₇₈₉";
const indice = (n: number) => String(n).replace(/\d/g, (d) => INDICES[Number(d)]);

const bouton =
  "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-50";

/** Suite récurrente uₙ₊₁ = f(uₙ) construite en « toile d'araignée » : on monte vers la courbe, on se ramène sur y = x. */
export default function SimulationSuite() {
  const [idRel, setIdRel] = useState<IdRelation>("racine");
  const rel = RELATIONS.find((r) => r.id === idRel) ?? RELATIONS[0];
  const [u0, setU0] = useState<number>(rel.u0.initial);
  const [qCent, setQCent] = useState<number>(Math.round(SUITE_Q.initial * 100));
  const [n, setN] = useState(0);
  const [auto, setAuto] = useState(false);
  const clip = useId();

  const q = qCent / 100;
  const L = pointFixe(rel, q);
  const { lo, hi } = rel.fenetre(q);
  const R = repere(lo, hi, lo, hi, T, T, 34);
  const ts = termes(rel, q, u0, n);
  const ligne = toile(rel, q, u0, n);
  const courbe = troncons((x) => rel.f(x, q), lo, hi, lo - 1, hi + 1);
  const g = graduations(lo, hi);

  // Lecture automatique : une marche toutes les 650 ms, jusqu'à NB_MARCHES (puis elle s'arrête d'elle-même).
  const enCours = auto && n < NB_MARCHES;
  useEffect(() => {
    if (!enCours) return;
    const minuteur = setInterval(() => setN((k) => Math.min(k + 1, NB_MARCHES)), 650);
    return () => clearInterval(minuteur);
  }, [enCours]);

  function remise(nouveau?: { u0?: number }) {
    setN(0);
    setAuto(false);
    if (nouveau?.u0 !== undefined) setU0(nouveau.u0);
  }
  function choisir(id: IdRelation) {
    const r = RELATIONS.find((x) => x.id === id) ?? RELATIONS[0];
    setIdRel(id);
    remise({ u0: r.u0.initial });
  }

  const un = ts[n];
  const ecart = Math.abs(un - L);
  const pt = (x: number, y: number) => `${R.X(x).toFixed(2)},${R.Y(y).toFixed(2)}`;

  let commentaire: string;
  if (n === 0) commentaire = `On part de u${indice(0)} = ${nombreFr(u0, 2)} sur l'axe. Appuie sur « Terme suivant » : on monte jusqu'à la courbe, puis on se ramène sur la droite y = x.`;
  else if (n < NB_MARCHES) commentaire = `u${indice(n)} = ${nombreFr(un, 4)}. L'écart avec L est ${nombreFr(ecart, 4)} : les marches se resserrent autour du point d'intersection de la courbe et de la droite y = x.`;
  else commentaire = `Après ${NB_MARCHES} marches, u${indice(NB_MARCHES)} = ${nombreFr(un, 5)} est à ${nombreFr(ecart, 5)} de L = ${nombreFr(L, 5)} : la suite converge vers ce point fixe.`;

  return (
    <div className="flex flex-col gap-5">
      <EncartConcept
        concept={
          <Tx>
            {"Une suite définie par $u_{n+1} = f(u_n)$ se lit sur le graphe de $f$. On part de $u_0$ sur l'axe horizontal, on monte jusqu'à la courbe pour lire $u_1$, puis on se ramène sur la droite $y = x$ pour reporter $u_1$ sur l'axe, et on recommence. Si la suite converge, sa limite est un point fixe : $L = f(L)$, à l'intersection de la courbe et de la droite $y = x$."}
          </Tx>
        }
        observer={<Tx>{"les marches se resserrent vers l'intersection de la courbe et de la droite $y = x$ : c'est la limite $L$. Change $u_0$ : le départ change, mais pas l'arrivée."}</Tx>}
      />
      <CadreSimulation
        titre="Construis la suite en toile d'araignée"
        description="Choisis une relation, règle le terme de départ et avance marche après marche."
        formule={<Formule tex={`${rel.tex(q)}, \\quad u_0 = ${nombreFr(u0, 2).replace(",", "{,}").replace("−", "-")} \\qquad L = f(L)`} />}
        graphique={
          <svg viewBox={`0 0 ${T} ${T}`} className="mx-auto h-auto w-full max-w-[440px]" role="img" aria-label={`Toile d'araignée de la suite ${rel.libelle} : u${n} = ${nombreFr(un, 4)}, limite ${nombreFr(L, 4)}`}>
            <defs>
              <clipPath id={clip}>
                <rect x={R.X(lo)} y={R.Y(hi)} width={R.X(hi) - R.X(lo)} height={R.Y(lo) - R.Y(hi)} />
              </clipPath>
            </defs>
            <CadreGraphe R={R} largeur={T} hauteur={T} xmin={lo} xmax={hi} ymin={lo} ymax={hi} gx={g} gy={g} nomX="u" />
            <g clipPath={`url(#${clip})`}>
              <line x1={R.X(lo)} y1={R.Y(lo)} x2={R.X(hi)} y2={R.Y(hi)} className="stroke-fh-ardoise" strokeWidth={1.4} strokeDasharray="5 4" />
              {courbe.map((t, i) => (
                <path key={i} d={chemin(t.map(([x, y]) => [R.X(x), R.Y(y)] as [number, number]))} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} />
              ))}
              {ligne.length > 1 && <polyline points={ligne.map(([x, y]) => pt(x, y)).join(" ")} fill="none" className="stroke-fh-orange" strokeWidth={1.8} strokeLinejoin="round" />}
            </g>
            <text x={R.X(hi) - 4} y={R.Y(hi) + 14} textAnchor="end" className="fill-fh-ardoise text-[10px]">y = x</text>
            <text x={R.X(lo) + 6} y={R.Y(hi) + 14} className="fill-fh-bleu text-[10px] font-semibold">y = f(x)</text>
            {/* point fixe L = f(L) */}
            <circle cx={R.X(L)} cy={R.Y(L)} r={5.5} className="fill-white stroke-fh-orange-fonce" strokeWidth={2} />
            <text x={R.X(L) + 9} y={R.Y(L) + 16} className="fill-fh-orange-fonce text-[10px] font-semibold">L = {nombreFr(L, 3)}</text>
            {/* départ et terme courant */}
            <circle cx={R.X(u0)} cy={R.Y(0)} r={4} className="fill-fh-bleu stroke-white" strokeWidth={1.2} />
            {n > 0 && <circle cx={R.X(un)} cy={R.Y(un)} r={4.5} className="fill-fh-orange stroke-white" strokeWidth={1.2} />}
          </svg>
        }
        commandes={
          <>
            <Choix nom="Relation de récurrence" options={RELATIONS.map((r) => ({ cle: r.id, libelle: <Formule tex={r.libelleTex} />, aria: r.libelle }))} valeur={idRel} onChoisir={choisir} />
            <Curseur
              nom={<Formule tex="u_0" />}
              valeurTexte={`u₀ = ${nombreFr(u0, 2)}`}
              min={rel.u0.min}
              max={rel.u0.max}
              pas={rel.u0.pas}
              valeur={u0}
              onChange={(v) => remise({ u0: Math.round(v * 100) / 100 })}
              ariaLabel="Terme initial u zéro"
            />
            {rel.id === "affine" && (
              <Curseur
                nom={<Formule tex="q" />}
                valeurTexte={`q = ${nombreFr(q, 2)}`}
                min={Math.round(SUITE_Q.min * 100)}
                max={Math.round(SUITE_Q.max * 100)}
                pas={Math.round(SUITE_Q.pas * 100)}
                valeur={qCent}
                onChange={(v) => { setQCent(v); remise(); }}
                ariaLabel="Coefficient q de la récurrence"
              />
            )}
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => { setAuto(false); setN((k) => Math.min(k + 1, NB_MARCHES)); }} disabled={n >= NB_MARCHES} className={`${bouton} bg-fh-orange text-white hover:bg-fh-orange-fonce`}>
                Terme suivant
              </button>
              <button
                type="button"
                onClick={() => { if (n >= NB_MARCHES) setN(0); setAuto((a) => !a || n >= NB_MARCHES); }}
                aria-pressed={enCours}
                className={`${bouton} border border-fh-bleu/40 text-fh-bleu hover:bg-fh-bleu/5`}
              >
                {enCours ? "Pause" : "Automatique"}
              </button>
              <BoutonReinitialiser onClick={() => { remise({ u0: rel.u0.initial }); setQCent(Math.round(SUITE_Q.initial * 100)); }} />
            </div>
          </>
        }
        valeurs={
          <>
            <Valeur etiquette={`Terme courant u${indice(n)}`}>{nombreFr(un, 4)}</Valeur>
            <Valeur etiquette="Point fixe L = f(L)">{nombreFr(L, 4)}</Valeur>
            <Valeur etiquette={<>Écart <Formule tex={`\\left|u_{${n}} - L\\right|`} /></>}>{nombreFr(ecart, 4)}</Valeur>
            <Valeur etiquette="Marches faites">{n}</Valeur>
          </>
        }
        commentaire={commentaire}
      />
    </div>
  );
}
