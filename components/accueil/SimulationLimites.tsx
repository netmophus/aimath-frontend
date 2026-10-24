"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Choix } from "@/components/labo/commun";
import { nombreFr } from "@/lib/accueil/mathsLabo";
import { FONCTIONS_LIMITE, graduations, troncons, type IdLimite } from "@/lib/accueil/mathsLaboAvance";
import { BoutonReinitialiser, CadreSimulation, chemin, Curseur, Formule, repere, TableauValeurs, Tx, Valeur } from "./commun";
import { CadreGraphe } from "./GrapheMaths";

const W = 440;
const H = 300;
const MARGE = 34;
const FRAMBOISE = "#b5366a";
const VIOLET = "#7c3aed";

/** Un seul format pour toutes les valeurs affichées : au plus 4 décimales, virgule française. */
const n4 = (v: number) => nombreFr(v, 4);
/** Même nombre pour KaTeX : la virgule est protégée de l'espace TeX (« 0{,}3679 »). */
const t4 = (v: number) => n4(v).replace(",", "{,}");

/**
 * Limites en deux temps. Étape 1 : on rapproche x de la valeur visée et l'écart |f(x) − L| fond vers 0.
 * Étape 2 (au clic) : les asymptotes se tracent, avec une table de valeurs et l'explication de la limite.
 */
export default function SimulationLimites() {
  const [id, setId] = useState<IdLimite>("exponentielle");
  const fo = FONCTIONS_LIMITE.find((f) => f.id === id) ?? FONCTIONS_LIMITE[0];
  const [x, setX] = useState<number>(fo.curseur.initial);
  const [revele, setRevele] = useState(false);
  const etapeB = useRef<HTMLDivElement>(null);
  const clip = useId();

  // Au clic sur « Révéler », l'étape 2 vient dans le champ de vision.
  useEffect(() => {
    if (revele) etapeB.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [revele]);

  const { xmin, xmax, ymin, ymax } = fo.fenetre;
  const R = repere(xmin, xmax, ymin, ymax, W, H, MARGE);
  const branches = troncons(fo.f, xmin, xmax, ymin - 40, ymax + 40, 800);

  const xv = fo.asymptoteV;
  const ah = fo.asymptoteH;
  const L = fo.L;
  const interdit = (fo.trou !== null && Math.abs(x - fo.trou.x) < 0.05) || (xv !== null && Math.abs(x - xv) < 0.05);
  const y = fo.f(x);
  const ecart = Math.abs(y - L);
  const dansFenetre = !interdit && Number.isFinite(y) && y >= ymin && y <= ymax;
  const pct = interdit ? 0 : ecart === 0 ? 0 : Math.max(1.5, Math.min(100, (ecart / fo.ecartRef) * 100));
  const hauteurSegment = Math.abs(R.Y(y) - R.Y(L));

  function choisir(nouveau: IdLimite) {
    const f = FONCTIONS_LIMITE.find((v) => v.id === nouveau) ?? FONCTIONS_LIMITE[0];
    setId(nouveau);
    setX(f.curseur.initial);
  }

  const commentaire = interdit ? (
    <Tx>{`En $x = ${t4(x)}$, $f$ n'est pas définie. Mais juste à côté, $f(x)$ est déjà très proche de $L = ${t4(L)}$ : c'est cela, avoir pour limite $L$.`}</Tx>
  ) : (
    <Tx>
      {`Pour $x = ${t4(x)}$ : $f(x) = ${t4(y)}$, la limite visée est $L = ${t4(L)}$ et l'écart vaut $|f(x) - L| = ${t4(ecart)}$. Rapproche $x$ de la valeur visée ($${fo.cibleTex}$) : l'écart fond vers $0$.`}
    </Tx>
  );

  return (
    <div className="flex flex-col gap-5">
      <Encart titre="Qu'est-ce qu'une limite ?">
        <p className="leading-8">
          <Tx>{"Dire que $f(x)$ a pour limite $L$, c'est dire que l'écart $|f(x) - L|$ devient aussi petit qu'on veut (proche de $0$) quand $x$ s'approche de la valeur visée ou devient très grand."}</Tx>
        </p>
        <p className="mt-2 leading-8">
          <span className="font-bold text-fh-orange-fonce">À observer : </span>
          <Tx>{"déplace $x$ et regarde la barre : plus $x$ s'approche de la valeur visée, plus l'écart $|f(x) - L|$ rétrécit vers $0$."}</Tx>
        </p>
      </Encart>

      <CadreSimulation
        titre="Rapproche x et regarde l'écart fondre"
        description="Choisis une fonction, déplace x : le point suit la courbe et l'écart avec la limite visée diminue."
        formule={
          <>
            <Formule tex={fo.fTex} />
            <span className="mt-1 block text-sm text-fh-ardoise">
              <Tx>{`On regarde ce que devient $f(x)$ quand $${fo.cibleTex}$.`}</Tx>
            </span>
          </>
        }
        graphique={
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Courbe de la fonction ${fo.libelle} ; x = ${nombreFr(x, 1)}, écart avec la limite visée ${n4(ecart)}`}>
            <defs>
              <clipPath id={clip}>
                <rect x={R.X(xmin)} y={R.Y(ymax)} width={R.X(xmax) - R.X(xmin)} height={R.Y(ymin) - R.Y(ymax)} />
              </clipPath>
            </defs>
            <CadreGraphe R={R} largeur={W} hauteur={H} xmin={xmin} xmax={xmax} ymin={ymin} ymax={ymax} gx={graduations(xmin, xmax, 7)} gy={graduations(ymin, ymax, 5)} nomX="x" />
            {/* étape 2 : les asymptotes se tracent en douceur */}
            {revele && (
              <g clipPath={`url(#${clip})`} className="apparition-douce">
                {ah !== null && <line x1={R.X(xmin)} y1={R.Y(ah)} x2={R.X(xmax)} y2={R.Y(ah)} className="stroke-fh-orange" strokeWidth={2} strokeDasharray="7 5" />}
                {xv !== null && <line x1={R.X(xv)} y1={R.Y(ymin)} x2={R.X(xv)} y2={R.Y(ymax)} stroke={VIOLET} strokeWidth={2} strokeDasharray="7 5" />}
              </g>
            )}
            <g clipPath={`url(#${clip})`}>
              {branches.map((b, i) => (
                <path key={i} d={chemin(b.map(([px, py]) => [R.X(px), R.Y(py)] as [number, number]))} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} />
              ))}
            </g>
            {revele && ah !== null && (
              <text x={R.X(xmax) - 4} y={R.Y(ah) - 6} textAnchor="end" className="fill-fh-orange-fonce text-[12px] font-semibold apparition-douce">
                asymptote y = {nombreFr(ah, 0)}
              </text>
            )}
            {revele && xv !== null && (
              <text x={R.X(xv) + 6} y={R.Y(ymax) + 14} fill={VIOLET} className="text-[12px] font-semibold apparition-douce">
                asymptote x = {nombreFr(xv, 0)}
              </text>
            )}
            {fo.trou && <circle cx={R.X(fo.trou.x)} cy={R.Y(fo.trou.limite)} r={4.5} className="fill-white stroke-fh-bleu" strokeWidth={2} />}
            {/* limite visée L : repère sur le bord gauche (ce n'est pas une asymptote) */}
            <line x1={R.X(xmin)} y1={R.Y(L)} x2={R.X(xmin) + 12} y2={R.Y(L)} stroke={FRAMBOISE} strokeWidth={2.4} />
            <text x={R.X(xmin) + 16} y={R.Y(L) - 5} fill={FRAMBOISE} className="text-[12px] font-semibold">L = {nombreFr(L, 0)}</text>
            {/* position de x, écart avec L et point mobile */}
            <line x1={R.X(x)} y1={R.Y(ymin)} x2={R.X(x)} y2={R.Y(ymax)} className="stroke-fh-ardoise/40" strokeWidth={1} />
            {dansFenetre && (
              <>
                <line x1={R.X(x)} y1={R.Y(y)} x2={R.X(x)} y2={R.Y(L)} stroke={FRAMBOISE} strokeWidth={2.4} strokeDasharray="4 3" />
                {hauteurSegment > 22 && (
                  <text x={Math.min(R.X(x) + 7, W - MARGE - 40)} y={(R.Y(y) + R.Y(L)) / 2 + 4} fill={FRAMBOISE} className="text-[12px] font-semibold">écart</text>
                )}
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
            {!revele && (
              <button
                type="button"
                onClick={() => setRevele(true)}
                aria-expanded={false}
                className="min-h-11 w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold leading-snug text-white transition-colors hover:brightness-110 motion-reduce:transition-none"
                style={{ backgroundColor: FRAMBOISE }}
              >
                Révéler : la droite que la courbe suit (asymptote)
              </button>
            )}
          </>
        }
        valeurs={
          <>
            <Valeur etiquette={<Formule tex="x" />}>{nombreFr(x, 1)}</Valeur>
            <Valeur etiquette={<Formule tex="f(x)" />}>{interdit ? "non définie" : n4(y)}</Valeur>
            <Valeur etiquette={<Tx>{"Limite visée $L$"}</Tx>}>{n4(L)}</Valeur>
            <Valeur etiquette={<Formule tex="|f(x) - L|" />}>{interdit ? "—" : n4(ecart)}</Valeur>
            <Valeur etiquette={<Tx>{"Écart : la barre rétrécit vers $0$"}</Tx>} large>
              <div
                role="img"
                aria-label={`Écart avec la limite visée : ${interdit ? "non défini" : n4(ecart)}`}
                className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-fh-sable/50"
              >
                <div className="h-full rounded-full transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${pct}%`, backgroundColor: FRAMBOISE }} />
              </div>
            </Valeur>
          </>
        }
        commentaire={<p className="leading-8">{commentaire}</p>}
      />

      {revele && (
        <div ref={etapeB} className="apparition-etape flex flex-col gap-5">
          <Encart titre="L'asymptote">
            <p className="leading-8">
              <Tx>{"La courbe longe les droites tracées en pointillés : horizontale $y = b$ en orange, verticale $x = a$ en violet, selon la fonction. Elle s'en rapproche de plus en plus sans jamais s'en écarter."}</Tx>
            </p>
            {fo.noteAsymptotes && (
              <p className="mt-2 leading-8">
                <Tx>{fo.noteAsymptotes}</Tx>
              </p>
            )}
            <div className="mt-3 flex flex-col gap-4">
              {fo.tables.map((t) => (
                <div key={t.titre}>
                  <p className="mb-1 font-semibold text-fh-bleu">
                    <Tx>{t.titre}</Tx>
                  </p>
                  <TableauValeurs couleur={FRAMBOISE}>
                    <thead>
                      <tr>
                        <th scope="col"><Formule tex="x" /></th>
                        <th scope="col"><Formule tex="f(x)" /></th>
                        {t.ecart && <th scope="col"><Formule tex="|f(x) - L|" /></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {t.xs.map((xi) => {
                        const fi = fo.f(xi);
                        return (
                          <tr key={xi}>
                            <td>{nombreFr(xi, 2)}</td>
                            <td>{n4(fi)}</td>
                            {t.ecart && <td>{n4(Math.abs(fi - L))}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </TableauValeurs>
                </div>
              ))}
            </div>
          </Encart>

          <Encart titre="Pourquoi ?">
            <ol className="flex list-decimal flex-col gap-3 pl-5">
              {fo.pourquoi.etapes.map((e) => (
                <li key={e.titre} className="pl-1">
                  <p className="font-semibold text-fh-bleu">
                    <Tx>{e.titre}</Tx>
                  </p>
                  <p className="leading-8">
                    <Tx>{e.texte}</Tx>
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-3 border-t border-fh-orange/30 pt-3 leading-8">
              <Tx>{fo.pourquoi.conclusion}</Tx>
            </p>
            {fo.pourquoi.formules.map((tex) => (
              <Formule key={tex} bloc tex={tex} />
            ))}
          </Encart>
        </div>
      )}
    </div>
  );
}

/** Encadré pédagogique (bordure gauche orange, fond léger) : même style que « Le concept » des autres onglets. */
function Encart({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 border-fh-orange bg-fh-accent/60 p-4 sm:p-5">
      <p className="text-sm font-bold text-fh-orange-fonce">{titre}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-fh-ardoise sm:text-base">{children}</div>
    </div>
  );
}
