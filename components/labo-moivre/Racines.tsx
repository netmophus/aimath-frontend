"use client";

import { useMemo, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { angleEgalMod2Pi, enDegres, enRadians } from "@/lib/complexes";
import { brut } from "@/lib/complexesAffichage";
import { estExactReconnu, lireAngle, lireReel, reponseEgale, texAngle, texComplexe, texNombre, texReel } from "@/lib/complexesTex";
import { INSTANCES_DEFI_RACINES } from "@/lib/moivreEulerDefis";
import { cadreRacines, pasNet, racinesDe, verifierRacines, TOL_VERIF } from "@/lib/moivreEuler";
import { Bouton, Carte, COULEURS, Commandes, Conclusion, Curseur, DefiBloc, EtapeFormule, Intro, Message, Pastille, PlanSvg, QuestionChoix, QuestionTexte, Stepper, Tex, Valeur, Zone, type PointPlan } from "./ui";

const DEFAUT = { rho: 8, phiDeg: 90, n: 3 };
const EXEMPLES: Array<{ rho: number; phiDeg: number; n: number; libelle: string }> = [
  { rho: 8, phiDeg: 90, n: 3, libelle: "Z = 8i, n = 3" },
  { rho: 1, phiDeg: 0, n: 5, libelle: "Z = 1, n = 5 (racines de l'unité)" },
  { rho: 8, phiDeg: 180, n: 3, libelle: "Z = −8, n = 3" },
  { rho: 4, phiDeg: 0, n: 2, libelle: "Z = 4, n = 2" },
];

const SOUS = "₀₁₂₃₄₅₆₇₈₉";
const indice = (k: number) => String(k).split("").map((c) => SOUS[Number(c)]).join("");

const texAlgApprox = (z: { re: number; im: number }) => `${z.re < 0 ? "-" : ""}${texNombre(Math.abs(z.re), 4)} ${z.im < 0 ? "-" : "+"} ${texNombre(Math.abs(z.im), 4)}\\,i`;

export default function Racines() {
  const [rho, setRho] = useState(DEFAUT.rho);
  const [phiDeg, setPhiDeg] = useState(DEFAUT.phiDeg);
  const [n, setN] = useState(DEFAUT.n);
  const [choisie, setChoisie] = useState<number | null>(null);
  const [verifie, setVerifie] = useState(false);
  const [etape, setEtape] = useState(0);

  const phi = enRadians(phiDeg);
  const res = useMemo(() => racinesDe(rho, phi, n), [rho, phi, n]);
  const bilan = useMemo(() => (res.ok ? verifierRacines(res) : null), [res]);

  function changer(fn: () => void) {
    fn();
    setChoisie(null);
    setVerifie(false);
  }
  function reinit() {
    setRho(DEFAUT.rho);
    setPhiDeg(DEFAUT.phiDeg);
    setN(DEFAUT.n);
    setChoisie(null);
    setVerifie(false);
    setEtape(0);
  }

  const R = res.ok ? res.R : 1;
  const B = cadreRacines(R);
  const pts: PointPlan[] = res.ok ? res.racines.map((r) => ({ id: `r${r.k}`, z: r.z, couleur: choisie === r.k ? COULEURS.resultat : r.k === 0 ? COULEURS.z : COULEURS.conjugue, etiquette: `z${indice(r.k)}` })) : [];
  const sel = res.ok && choisie !== null ? res.racines[choisie] : null;
  const phiTex = texAngle(phi);
  const rhoTex = texReel(rho);

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-teal-500 bg-teal-50">
        Un nombre complexe non nul <Tex expr={"Z=\\rho e^{i\\varphi}"} /> possède exactement <strong>n racines n-ièmes</strong> : elles ont toutes le même module <Tex expr={"\\rho^{1/n}"} /> et leurs arguments augmentent de <Tex expr={"2\\pi/n"} />. Clique sur une racine pour l&apos;étudier.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap items-end gap-3">
          <Curseur etiquette="Module ρ de Z" valeur={rho} min={0} max={20} pas={0.1} decimales={4} onChange={(v) => changer(() => setRho(v))} />
          <Curseur etiquette="Argument φ de Z" valeur={phiDeg} min={-720} max={720} pas={1} decimales={2} unite="degrés" onChange={(v) => changer(() => setPhiDeg(v))} />
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-fh-ardoise/80">Ordre n (2 à 12)</span>
            <Stepper etiquette="Ordre n" valeur={n} min={2} max={12} onChange={(v) => changer(() => setN(v))} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
          {EXEMPLES.map((e) => (
            <Pastille key={e.libelle} actif={rho === e.rho && phiDeg === e.phiDeg && n === e.n} onClick={() => changer(() => { setRho(e.rho); setPhiDeg(e.phiDeg); setN(e.n); })}>
              {e.libelle}
            </Pastille>
          ))}
          <Bouton onClick={reinit}>
            <IconRefresh size={18} aria-hidden="true" />
            Réinitialiser
          </Bouton>
        </div>

        {!res.ok && <Message type={res.nul ? "info" : "erreur"}>{res.erreur}{res.nul && " Pour Z ≠ 0 il y a exactement n racines distinctes, toutes de module ρ^{1/n}."}</Message>}

        {res.ok && (
          <>
            <figure className="flex min-w-0 flex-col gap-1">
              <figcaption className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/70">Les {n} racines n-ièmes de Z dans le plan complexe (clique sur l&apos;une d&apos;elles)</figcaption>
              <PlanSvg
                bornes={{ xmin: -B, xmax: B, ymin: -B, ymax: B }}
                unite={228 / B}
                points={pts}
                aimant={0}
                pas={pasNet(B)}
                etiquette={`Plan complexe : les ${n} racines n-ièmes de Z`}
                dessous={(o) => (
                  <>
                    <circle cx={o.X(0)} cy={o.Y(0)} r={o.L(R)} fill="none" stroke="#94a3b8" strokeDasharray="5 4" strokeWidth={1.5} />
                    {res.racines.map((r) => (
                      <line key={r.k} x1={o.X(0)} y1={o.Y(0)} x2={o.X(r.z.re)} y2={o.Y(r.z.im)} stroke={COULEURS.conjugue} strokeOpacity={0.25} />
                    ))}
                  </>
                )}
                dessus={(o) => (
                  <>
                    {res.racines.map((r) => (
                      <g
                        key={r.k}
                        role="button"
                        tabIndex={0}
                        aria-label={`Racine z${r.k} : afficher le détail`}
                        aria-pressed={choisie === r.k}
                        onClick={() => setChoisie(r.k)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            setChoisie(r.k);
                          }
                        }}
                        className="cursor-pointer outline-none focus-visible:[&>circle]:stroke-fh-bleu-vif"
                      >
                        <circle cx={o.X(r.z.re)} cy={o.Y(r.z.im)} r={16} fill="transparent" stroke={choisie === r.k ? COULEURS.resultat : "transparent"} strokeWidth={2.5} />
                      </g>
                    ))}
                  </>
                )}
              />
            </figure>

            <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
              <Valeur etiquette="Le nombre Z">
                <Tex expr={`Z = ${texComplexe(res.Z)}`} />
              </Valeur>
              <Valeur etiquette="Formes trigonométrique et exponentielle">
                <Tex expr={`Z = ${rhoTex}\\left(\\cos ${phiTex} + i\\sin ${phiTex}\\right) = ${rhoTex}\\,e^{i\\,${phiTex}}`} />
              </Valeur>
              <Valeur etiquette="Nombre de racines">
                <Tex expr={`n = ${n}`} /> racines distinctes
              </Valeur>
              <Valeur etiquette="Module commun des racines">
                <Tex expr={`R = \\rho^{1/${n}} ${estExactReconnu(res.R) ? "=" : "\\approx"} ${texReel(res.R)}`} />
              </Valeur>
              <Valeur etiquette="Arguments des racines">
                <Tex expr={`\\dfrac{\\varphi+2k\\pi}{${n}},\\ k=0,\\dots,${n - 1}\\ ;\\ \\text{écart } \\dfrac{2\\pi}{${n}} = ${texAngle(res.delta)}`} />
              </Valeur>
            </div>

            <Carte titre="Formule principale">
              <Tex bloc expr={"\\boxed{z_k=\\rho^{1/n}e^{i(\\varphi+2k\\pi)/n},\\quad k=0,\\ldots,n-1}"} />
            </Carte>

            {sel ? (
              <Carte titre={`Détail de la racine z${indice(sel.k)} (k = ${sel.k})`} couleur="border-orange-300 bg-orange-50">
                <ul className="flex flex-col gap-1.5" aria-live="polite">
                  <li>Indice : <strong>k = {sel.k}</strong></li>
                  <li>Module : <Tex expr={`R ${estExactReconnu(res.R) ? "=" : "\\approx"} ${texReel(res.R)}`} /></li>
                  <li>Argument : <Tex expr={`\\dfrac{\\varphi + 2\\cdot ${sel.k}\\pi}{${n}} = ${texAngle(sel.argument)}\\ (${brut(enDegres(sel.argument), 2)}^\\circ)`} /></li>
                  <li>Forme trigonométrique : <Tex expr={`z_{${sel.k}} = ${texReel(res.R)}\\left(\\cos ${texAngle(sel.argument)} + i\\sin ${texAngle(sel.argument)}\\right)`} /></li>
                  <li>Forme exponentielle : <Tex expr={`z_{${sel.k}} = ${texReel(res.R)}\\,e^{i\\,${texAngle(sel.argument)}}`} /></li>
                  <li>
                    Forme algébrique {estExactReconnu(sel.z.re) && estExactReconnu(sel.z.im) ? "exacte" : "(pas d'écriture exacte simple)"} :{" "}
                    {estExactReconnu(sel.z.re) && estExactReconnu(sel.z.im) ? <Tex expr={`z_{${sel.k}} = ${texComplexe(sel.z)}`} /> : <span className="text-fh-ardoise/70">aucune valeur exacte reconnue</span>}
                  </li>
                  <li>Forme algébrique approchée : <Tex expr={`z_{${sel.k}} \\approx ${texAlgApprox(sel.z)}`} /></li>
                </ul>
              </Carte>
            ) : (
              <p className="text-sm text-fh-ardoise/80">Aucune racine sélectionnée : clique sur un point du graphique, ou dans la liste ci-dessous.</p>
            )}

            <Carte titre={`Liste complète des ${n} solutions`}>
              <ol className="grid gap-x-4 gap-y-1 sm:grid-cols-2" aria-label="Solutions">
                {res.racines.map((r) => (
                  <li key={r.k}>
                    <button type="button" onClick={() => setChoisie(r.k)} className={`min-h-9 rounded px-1 text-left focus-visible:outline-3 focus-visible:outline-fh-bleu-vif ${choisie === r.k ? "bg-orange-100" : "hover:bg-fh-accent"}`}>
                      <Tex expr={`z_{${r.k}} ${estExactReconnu(r.z.re) && estExactReconnu(r.z.im) ? "=" : "\\approx"} ${texComplexe(r.z)}`} />
                    </button>
                  </li>
                ))}
              </ol>
            </Carte>

            <div className="flex flex-col gap-2">
              <div>
                <Bouton variante="plein" onClick={() => setVerifie(true)}>
                  Vérifier les racines
                </Bouton>
              </div>
              {verifie && bilan && (
                <div className="flex flex-col gap-2" aria-live="polite">
                  <Message type={bilan.toutesVerifient && bilan.distinctes ? "ok" : "erreur"}>
                    {bilan.toutesVerifient ? <>Pour chaque racine, <Tex expr={"z_k^n"} /> est égal à Z (écart relatif ≤ {TOL_VERIF * 1e3} : tolérance numérique, car les calculs en décimaux cumulent des arrondis).</> : "Au moins une racine ne vérifie pas z^n = Z dans la tolérance."} {bilan.distinctes ? "Les n racines sont deux à deux distinctes." : "Deux racines sont confondues."}
                  </Message>
                  <ul className="grid gap-1 text-sm sm:grid-cols-2" aria-label="Détail de la vérification">
                    {bilan.details.map((d) => (
                      <li key={d.k} className="rounded border border-fh-sable bg-white px-2 py-1">
                        <Tex expr={`z_{${d.k}}^{${n}} \\approx ${texAlgApprox(d.puissance)}`} /> {d.ok ? "✓" : "✗"}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-fh-ardoise/80">Cette vérification numérique confirme que chaque z<sub>k</sub> est une solution ; elle ne démontre pas qu&apos;il n&apos;y en a pas d&apos;autres. L&apos;exhaustivité vient de la formule générale (une équation z<sup>n</sup> = Z a au plus n solutions).</p>
                </div>
              )}
            </div>
          </>
        )}
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <Commandes etape={etape} total={4} onPrecedent={() => setEtape((e) => Math.max(0, e - 1))} onSuivant={() => setEtape((e) => Math.min(4, e + 1))} onTout={() => setEtape(4)} onRecommencer={() => setEtape(0)} />
        {etape === 0 && <p className="text-sm text-fh-ardoise">Clique sur « Étape suivante » pour construire les racines avec les valeurs choisies ci-dessus.</p>}
        {res.ok && (
          <ol className="flex flex-col gap-2">
            {etape >= 1 && <EtapeFormule numero={1} titre="Écrire Z sous forme exponentielle" expr={`Z = ${rhoTex}\\,e^{i\\,${phiTex}}`} texte="On cherche z = r e^{iθ} tel que zⁿ = Z." />}
            {etape >= 2 && <EtapeFormule numero={2} titre="Égaler module et argument" expr={`r^{${n}} e^{i${n}\\theta} = ${rhoTex}\\,e^{i\\,${phiTex}}\\ \\Longleftrightarrow\\ r^{${n}}=${rhoTex}\\ \\text{et}\\ ${n}\\theta=${phiTex}+2k\\pi`} texte="Deux complexes sont égaux si leurs modules sont égaux et leurs arguments égaux à 2π près (k entier)." />}
            {etape >= 3 && <EtapeFormule numero={3} titre="Résoudre" expr={`r = ${rhoTex}^{1/${n}} ${estExactReconnu(res.R) ? "=" : "\\approx"} ${texReel(res.R)}\\qquad \\theta_k = \\dfrac{${phiTex}+2k\\pi}{${n}}`} />}
            {etape >= 4 && <EtapeFormule numero={4} titre={`Pourquoi n valeurs seulement ?`} expr={`k=0,\\dots,${n - 1}\\ ;\\ k=${n}\\ \\text{donne}\\ \\theta_{${n}} = \\theta_0 + 2\\pi\\ \\text{: la même racine que}\\ z_0`} texte="Après n pas de 2π/n, on a fait un tour complet : les valeurs se répètent. Il y a donc exactement n racines distinctes." />}
          </ol>
        )}
        {!res.ok && <Message type="info">{res.erreur}</Message>}
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={INSTANCES_DEFI_RACINES.length}
          rendu={(i) => {
            const d = INSTANCES_DEFI_RACINES[i];
            const ordre = (i + 1) % 4;
            const props = [d.correcte, ...d.fausses];
            const options = props.map((_, j) => props[(j + ordre) % 4]).map((p) => ({ id: p === d.correcte ? "bonne" : p.tex, libelle: <Tex expr={p.tex} /> }));
            return (
              <>
                <p className="text-sm text-fh-ardoise">
                  On cherche les racines {d.n === 3 ? "cubiques" : `${d.n}-ièmes`} de <Tex expr={`Z = ${d.texZ}`} />.
                </p>
                <QuestionTexte
                  numero={1}
                  enonce="Quel est le module commun de ces racines ?"
                  placeholder="par exemple 2"
                  verifier={(t) => {
                    const l = lireReel(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    if (reponseEgale(l.valeur, d.R)) return { ok: true, message: <>Exact : <Tex expr={`R = \\rho^{1/${d.n}} = ${d.rho}^{1/${d.n}} = ${texReel(d.R)}`} />.</> };
                    if (reponseEgale(l.valeur, d.rho)) return { ok: false, message: "Tu as donné le module de Z : le module des racines est ρ^{1/n}, la racine n-ième de ρ." };
                    return { ok: false, message: <>Le module des racines est <Tex expr={`\\rho^{1/${d.n}}`} /> avec ρ = |Z| = {d.rho}.</> };
                  }}
                  indices={[<>Le module de Z est ρ = {d.rho}.</>, <>On prend la racine {d.n}-ième de ρ.</>]}
                  correction={<><Tex expr={`R = ${d.rho}^{1/${d.n}} = ${texReel(d.R)}`} />.</>}
                />
                <QuestionTexte
                  numero={2}
                  enonce={<>Quel est l&apos;argument de la racine <Tex expr={"z_0"} /> (en radians, k = 0) ?</>}
                  placeholder="par exemple π/6 ou 0"
                  verifier={(t) => {
                    const l = lireAngle(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    if (angleEgalMod2Pi(l.valeur, d.arg0, 5e-3)) return { ok: true, message: <>Exact : <Tex expr={`\\theta_0 = \\dfrac{\\varphi}{${d.n}} = ${texAngle(d.arg0)}`} />.</> };
                    return { ok: false, message: <>Pour k = 0, l&apos;argument est <Tex expr={`\\dfrac{\\varphi}{n}`} /> : divise l&apos;argument de Z par {d.n}.</> };
                  }}
                  indices={[<>L&apos;argument de Z est φ = <Tex expr={texAngle(enRadians(d.phiDeg))} />.</>, <>Pour k = 0 : θ<sub>0</sub> = φ / n.</>]}
                  correction={<><Tex expr={`\\theta_0 = \\dfrac{${texAngle(enRadians(d.phiDeg))}}{${d.n}} = ${texAngle(d.arg0)}`} />.</>}
                />
                <QuestionChoix
                  numero={3}
                  enonce="Sélectionne une racine de cette équation."
                  options={options}
                  bonne="bonne"
                  explications={Object.fromEntries([
                    ["bonne", <>Oui : en l&apos;élevant à la puissance {d.n}, on retrouve <Tex expr={`Z = ${d.texZ}`} />.</>],
                    ...d.fausses.map((f) => [f.tex, <>Calcule <Tex expr={`\\left(${f.tex}\\right)^{${d.n}}`} /> : tu ne trouves pas <Tex expr={d.texZ} />, ce n&apos;est pas une racine.</>] as [string, React.ReactNode]),
                  ])}
                  indices={[<>Élève chaque proposition à la puissance {d.n}.</>]}
                  correction={<><Tex expr={`\\left(${d.correcte.tex}\\right)^{${d.n}} = ${d.texZ}`} />.</>}
                />
              </>
            );
          }}
        />
      </Zone>

      <Conclusion>
        <Tex expr={"z^n=Z\\ \\Longleftrightarrow\\ z=\\rho^{1/n}e^{i(\\varphi+2k\\pi)/n},\\ k=0,\\ldots,n-1"} /> : n racines distinctes, toutes sur le cercle de rayon <Tex expr={"\\rho^{1/n}"} />. Pour Z = 0, l&apos;unique racine est 0.
      </Conclusion>
    </div>
  );
}

