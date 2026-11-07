"use client";

import { useEffect, useMemo, useState } from "react";
import { IconPlayerPause, IconPlayerPlay, IconRefresh } from "@tabler/icons-react";

import { angleEgalMod2Pi, enRadians, modC } from "@/lib/complexes";
import { brut } from "@/lib/complexesAffichage";
import { estExactReconnu, lireAngle, lireReel, reponseEgale, texAngle, texNombre, texReel } from "@/lib/complexesTex";
import { cadreRacines, estPolygoneRegulier, pasNet, polygoneRacines } from "@/lib/moivreEuler";
import { Arc, Bouton, Carte, COULEURS, Conclusion, Curseur, DefiBloc, Intro, Message, Pastille, PlanSvg, QuestionChoix, QuestionTexte, Stepper, Tex, Valeur, Zone, type PointPlan } from "./ui";

const DEFAUT = { n: 6, rho: 64, phiDeg: 30 };
const SOUS = "₀₁₂₃₄₅₆₇₈₉";
const indice = (k: number) => String(k).split("").map((c) => SOUS[Number(c)]).join("");

const FIGURES: Record<number, string> = { 2: "deux points diamétralement opposés", 3: "triangle équilatéral", 4: "carré", 5: "pentagone régulier", 6: "hexagone régulier" };
function nomFigure(n: number): string {
  return FIGURES[n] ?? `polygone régulier à ${n} côtés`;
}

const DEFIS = [
  { nCote: 6, R: 1, nAngle: 5, nFigure: 4 },
  { nCote: 4, R: 1, nAngle: 8, nFigure: 6 },
  { nCote: 3, R: 2, nAngle: 12, nFigure: 2 },
];

function QuestionsGeometrie({ d }: { d: (typeof DEFIS)[number] }) {
  const cote = 2 * d.R * Math.sin(Math.PI / d.nCote);
  const figures = [2, 3, 4, 5, 6];
  const fauxChoix = figures.filter((f) => f !== d.nFigure).slice(0, 3);
  const props = [d.nFigure, ...fauxChoix];
  const ordre = (d.nCote + d.nFigure) % 4;
  const options = props.map((_, j) => props[(j + ordre) % 4]).map((f) => ({ id: f === d.nFigure ? "bonne" : String(f), libelle: <>{nomFigure(f)}</> }));
  return (
    <>
      <QuestionTexte
        numero={1}
        enonce={<>Les racines {d.nCote}-ièmes d&apos;un complexe forment un polygone dont les sommets sont sur un cercle de rayon <Tex expr={`R = ${d.R}`} />. Quelle est la longueur d&apos;un côté ?</>}
        placeholder="par exemple 1 ou √2"
        verifier={(t) => {
          const l = lireReel(t);
          if (!l.ok) return { ok: false, message: l.erreur };
          if (reponseEgale(l.valeur, cote)) return { ok: true, message: <>Exact : <Tex expr={`c = 2R\\sin\\dfrac{\\pi}{${d.nCote}} = ${texReel(cote)}`} />.</> };
          if (reponseEgale(l.valeur, d.R)) return { ok: false, message: <>Le côté n&apos;est égal au rayon que pour l&apos;hexagone (n = 6). Ici n = {d.nCote} : utilise <Tex expr={"c=2R\\sin\\dfrac{\\pi}{n}"} />.</> };
          return { ok: false, message: <>Utilise <Tex expr={`c = 2R\\sin\\dfrac{\\pi}{n}`} /> avec n = {d.nCote} et R = {d.R}.</> };
        }}
        indices={[<>Deux sommets consécutifs sont vus du centre sous l&apos;angle <Tex expr={"\\dfrac{2\\pi}{n}"} />.</>, <>Le triangle formé avec le centre est isocèle : la moitié du côté vaut <Tex expr={"R\\sin\\dfrac{\\pi}{n}"} />.</>]}
        correction={<><Tex expr={`c = 2R\\sin\\dfrac{\\pi}{${d.nCote}} = 2\\times ${d.R}\\times ${texReel(Math.sin(Math.PI / d.nCote))} = ${texReel(cote)}`} />.</>}
      />
      <QuestionTexte
        numero={2}
        enonce={<>Quel est l&apos;angle au centre entre deux racines consécutives pour <Tex expr={`n = ${d.nAngle}`} /> (en radians) ?</>}
        placeholder="par exemple 2π/5"
        verifier={(t) => {
          const l = lireAngle(t);
          if (!l.ok) return { ok: false, message: l.erreur };
          const att = (2 * Math.PI) / d.nAngle;
          if (angleEgalMod2Pi(l.valeur, att, 5e-3) && l.valeur > 0) return { ok: true, message: <>Exact : <Tex expr={`\\Delta\\theta = \\dfrac{2\\pi}{${d.nAngle}} = ${texAngle(att)}`} />.</> };
          return { ok: false, message: <>Les n racines se partagent un tour complet 2π en n parts égales : <Tex expr={"\\Delta\\theta = \\dfrac{2\\pi}{n}"} />.</> };
        }}
        indices={[<>Un tour complet vaut 2π.</>, <>Il y a {d.nAngle} racines : {d.nAngle} écarts égaux.</>]}
        correction={<><Tex expr={`\\Delta\\theta = \\dfrac{2\\pi}{${d.nAngle}} = ${texAngle((2 * Math.PI) / d.nAngle)}`} />.</>}
      />
      <QuestionChoix
        numero={3}
        enonce={<>Quelle figure forment les racines {d.nFigure}-ièmes d&apos;un complexe non nul ?</>}
        options={options}
        bonne="bonne"
        explications={Object.fromEntries([
          ["bonne", <>Oui : {d.nFigure} points régulièrement répartis sur un cercle{d.nFigure === 2 ? " : ce sont deux points diamétralement opposés, on ne parle pas de polygone à deux côtés." : ` forment un ${nomFigure(d.nFigure)}.`}</>],
          ...fauxChoix.map((f) => [String(f), <>Il y a {d.nFigure} racines, pas {f} : la figure a autant de sommets que de racines.</>] as [string, React.ReactNode]),
        ])}
        indices={[<>Compte les sommets : il y a n racines.</>]}
        correction={<>Les {d.nFigure} racines forment : {nomFigure(d.nFigure)}.</>}
      />
    </>
  );
}

export default function Geometrie() {
  const [n, setN] = useState(DEFAUT.n);
  const [rho, setRho] = useState(DEFAUT.rho);
  const [phiDeg, setPhiDeg] = useState(DEFAUT.phiDeg);
  const [cercle, setCercle] = useState(true);
  const [angles, setAngles] = useState(true);
  const [cotes, setCotes] = useState(true);
  const [coord, setCoord] = useState(false);
  const [choisi, setChoisi] = useState<number | null>(null);
  const [anim, setAnim] = useState(false);
  const [cumul, setCumul] = useState(0);

  useEffect(() => {
    if (!anim) return;
    const t = setInterval(() => {
      setPhiDeg((p) => (p + 2 > 720 ? -720 : p + 2));
      setCumul((c) => c + 2);
    }, 50);
    return () => clearInterval(t);
  }, [anim]);

  const phi = enRadians(phiDeg);
  const poly = useMemo(() => polygoneRacines(rho, phi, n), [rho, phi, n]);

  function reinit() {
    setN(DEFAUT.n);
    setRho(DEFAUT.rho);
    setPhiDeg(DEFAUT.phiDeg);
    setCercle(true);
    setAngles(true);
    setCotes(true);
    setCoord(false);
    setChoisi(null);
    setAnim(false);
    setCumul(0);
  }

  const R = poly.ok ? poly.R : 1;
  const B = cadreRacines(R);
  const pts: PointPlan[] = poly.ok ? poly.sommets.map((s, k) => ({ id: `s${k}`, z: s, couleur: choisi === k ? COULEURS.resultat : k === 0 ? COULEURS.z : COULEURS.conjugue, etiquette: `z${indice(k)}` })) : [];
  const nomSommet = (k: number) => `z${indice(k)}`;
  const regulier = poly.ok && estPolygoneRegulier(poly);

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-rose-500 bg-rose-50">
        Les n racines n-ièmes d&apos;un complexe non nul sont sur un même cercle de rayon <Tex expr={"R=\\rho^{1/n}"} />, séparées par le même angle <Tex expr={"2\\pi/n"} /> : elles forment un <strong>polygone régulier</strong> (deux points opposés pour n = 2). Fais tourner l&apos;argument de Z : les racines tournent ensemble, mais n fois moins vite.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-fh-ardoise/80">Ordre n (2 à 12)</span>
            <Stepper etiquette="Ordre n" valeur={n} min={2} max={12} onChange={(v) => { setN(v); setChoisi(null); }} />
          </div>
          <Curseur etiquette="Module ρ de Z" valeur={rho} min={0} max={200} pas={0.5} decimales={3} onChange={(v) => { setRho(v); setChoisi(null); }} />
          <Curseur etiquette="Argument φ de Z" valeur={phiDeg} min={-720} max={720} pas={1} decimales={2} unite="degrés" onChange={(v) => { setPhiDeg(v); setAnim(false); }} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Affichage">
          <Pastille actif={cercle} onClick={() => setCercle((v) => !v)}>
            Cercle
          </Pastille>
          <Pastille actif={angles} onClick={() => setAngles((v) => !v)}>
            Angles au centre
          </Pastille>
          <Pastille actif={cotes} onClick={() => setCotes((v) => !v)}>
            Côtés
          </Pastille>
          <Pastille actif={coord} onClick={() => setCoord((v) => !v)}>
            Coordonnées
          </Pastille>
          <Bouton variante="plein" onClick={() => { if (anim) setAnim(false); else { setCumul(0); setAnim(true); } }}>
            {anim ? <IconPlayerPause size={18} aria-hidden="true" /> : <IconPlayerPlay size={18} aria-hidden="true" />}
            {anim ? "Arrêter" : "Faire tourner"}
          </Bouton>
          <Bouton onClick={reinit}>
            <IconRefresh size={18} aria-hidden="true" />
            Réinitialiser
          </Bouton>
        </div>

        {!poly.ok && <Message type="info">{poly.erreur} Il n&apos;y a donc aucun polygone à dessiner.</Message>}

        {poly.ok && (
          <>
            <figure className="flex min-w-0 flex-col gap-1">
              <figcaption className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/70">{nomFigure(n)} (clique sur un sommet pour lire ses coordonnées)</figcaption>
              <PlanSvg
                bornes={{ xmin: -B, xmax: B, ymin: -B, ymax: B }}
                unite={228 / B}
                points={pts}
                aimant={0}
                pas={pasNet(B)}
                etiquette={`Plan complexe : les ${n} racines n-ièmes de Z${n === 2 ? ", deux points diamétralement opposés" : ` et le polygone régulier à ${n} côtés`}`}
                dessous={(o) => (
                  <>
                    {cercle && <circle cx={o.X(0)} cy={o.Y(0)} r={o.L(R)} fill="none" stroke="#94a3b8" strokeDasharray="5 4" strokeWidth={1.5} />}
                    {poly.aPolygone && (
                      <polygon data-figure="polygone" points={poly.sommets.map((s) => `${o.X(s.re)},${o.Y(s.im)}`).join(" ")} fill={COULEURS.conjugue} fillOpacity={0.08} stroke={cotes ? COULEURS.conjugue : "transparent"} strokeWidth={2.2} strokeLinejoin="round" />
                    )}
                    {poly.sommets.map((s, k) => (
                      <line key={k} x1={o.X(0)} y1={o.Y(0)} x2={o.X(s.re)} y2={o.Y(s.im)} stroke={COULEURS.gris} strokeOpacity={0.45} strokeDasharray="3 3" />
                    ))}
                    {angles && poly.sommets.length > 0 && (() => {
                      // Un seul secteur (de z₀ à z₁) : les n angles sont égaux, les dessiner tous ferait un cercle illisible.
                      const a1 = Math.atan2(poly.sommets[0].im, poly.sommets[0].re);
                      const r = Math.max(R * 0.3, 0.001);
                      const nb = 24;
                      const pts = [`${o.X(0)},${o.Y(0)}`];
                      for (let i = 0; i <= nb; i++) {
                        const t = a1 + (poly.delta * i) / nb;
                        pts.push(`${o.X(r * Math.cos(t))},${o.Y(r * Math.sin(t))}`);
                      }
                      return (
                        <>
                          <polygon points={pts.join(" ")} fill={COULEURS.resultat} fillOpacity={0.15} stroke="none" />
                          <Arc o={o} centre={{ re: 0, im: 0 }} rayon={r} a1={a1} a2={a1 + poly.delta} couleur={COULEURS.resultat} epaisseur={2.4} />
                        </>
                      );
                    })()}
                  </>
                )}
                dessus={(o) => (
                  <>
                    {angles && poly.sommets.length > 0 && (() => {
                      const a1 = Math.atan2(poly.sommets[0].im, poly.sommets[0].re);
                      const am = a1 + poly.delta / 2;
                      const rr = R * 0.3 + 14 / o.u;
                      return <text x={o.X(rr * Math.cos(am))} y={o.Y(rr * Math.sin(am))} fontSize={11} fontWeight={700} fill={COULEURS.resultat} textAnchor="middle">{`2π/${n}`}</text>;
                    })()}
                    {cotes && poly.aPolygone && n <= 8 &&
                      poly.sommets.map((s, k) => {
                        const t = poly.sommets[(k + 1) % n];
                        const mx = (s.re + t.re) / 2;
                        const my = (s.im + t.im) / 2;
                        const norme = Math.hypot(mx, my) || 1;
                        return (
                          <text key={k} x={o.X(mx + (mx / norme) * (14 / o.u))} y={o.Y(my + (my / norme) * (14 / o.u)) + 4} fontSize={10} fill="#334155" textAnchor="middle" stroke="#fff" strokeWidth={3} paintOrder="stroke">
                            {brut(poly.cotes[k], 2)}
                          </text>
                        );
                      })}
                    {coord && n <= 8 &&
                      poly.sommets.map((s, k) => (
                        <text key={k} x={o.X(s.re) + (s.re >= 0 ? 8 : -8)} y={o.Y(s.im) + 16} fontSize={10} fill={COULEURS.z} textAnchor={s.re >= 0 ? "start" : "end"} stroke="#fff" strokeWidth={3} paintOrder="stroke">
                          {`(${brut(s.re, 2)} ; ${brut(s.im, 2)})`}
                        </text>
                      ))}
                    {poly.sommets.map((s, k) => (
                      <g
                        key={k}
                        role="button"
                        tabIndex={0}
                        aria-label={`Sommet ${nomSommet(k)} : afficher les coordonnées`}
                        aria-pressed={choisi === k}
                        onClick={() => setChoisi(k)}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            ev.preventDefault();
                            setChoisi(k);
                          }
                        }}
                        className="cursor-pointer outline-none"
                      >
                        <circle cx={o.X(s.re)} cy={o.Y(s.im)} r={16} fill="transparent" stroke={choisi === k ? COULEURS.resultat : "transparent"} strokeWidth={2.5} />
                      </g>
                    ))}
                  </>
                )}
              />
            </figure>
            {n >= 9 && (coord || cotes) && <p className="text-xs text-fh-ardoise/70">Pour n ≥ 9, les étiquettes sont retirées pour rester lisibles : clique sur un sommet pour lire ses coordonnées.</p>}

            {anim && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" aria-live="polite">
                L&apos;argument de Z a augmenté de <strong>{cumul}°</strong> : chaque racine a tourné de <strong>{brut(cumul / n, 2)}°</strong> (soit {cumul}° ÷ {n}), à suivi continu des branches près.
              </p>
            )}

            {choisi !== null && (
              <Carte titre={`Sommet ${nomSommet(choisi)}`} couleur="border-orange-300 bg-orange-50">
                <p aria-live="polite">
                  <Tex expr={`z_{${choisi}} = \\left(${texNombre(poly.sommets[choisi].re, 3)}\\ ;\\ ${texNombre(poly.sommets[choisi].im, 3)}\\right)`} /> — distance à l&apos;origine : {brut(modC(poly.sommets[choisi]), 4)}.
                </p>
              </Carte>
            )}

            <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
              <Valeur etiquette="Rayon du cercle">
                <Tex expr={`R = \\rho^{1/n} ${estExactReconnu(poly.R) ? "=" : "\\approx"} ${texReel(poly.R)}`} />
              </Valeur>
              <Valeur etiquette="Angle au centre">
                <Tex expr={`\\Delta\\theta = \\dfrac{2\\pi}{${n}} = ${texAngle(poly.delta)}\\ (${brut((360) / n, 2)}^\\circ)`} />
              </Valeur>
              {poly.aPolygone && poly.cote !== null && poly.perimetre !== null ? (
                <>
                  <Valeur etiquette="Longueur d'un côté">
                    <Tex expr={`c = 2R\\sin\\dfrac{\\pi}{${n}} ${estExactReconnu(poly.cote) ? "=" : "\\approx"} ${texReel(poly.cote)}`} />
                  </Valeur>
                  <Valeur etiquette="Périmètre">
                    <Tex expr={`P = nc ${estExactReconnu(poly.perimetre) ? "=" : "\\approx"} ${texReel(poly.perimetre)}`} />
                  </Valeur>
                </>
              ) : (
                <Valeur etiquette="Figure">
                  Deux points diamétralement opposés : <strong>aucun polygone</strong> (pas de côté, pas de périmètre).
                </Valeur>
              )}
            </div>
            {poly.aPolygone && (
              <Message type={regulier ? "ok" : "erreur"}>
                {regulier ? `Polygone régulier : ${n} sommets à la même distance de l'origine et ${n} côtés de même longueur (contrôle numérique à 10⁻⁶ près).` : "Le contrôle de régularité a échoué."}
              </Message>
            )}
            <p className="text-xs text-fh-ardoise/80">La longueur du côté et le périmètre sont un enrichissement géométrique : ils ne sont pas exigés pour l&apos;évaluation de la leçon.</p>
          </>
        )}
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-fh-ardoise">
          <li>
            Les racines sont <Tex expr={"z_k=Re^{i\\theta_k}"} /> avec <Tex expr={"\\theta_k=\\dfrac{\\varphi+2k\\pi}{n}"} /> : <strong>même module R</strong>, donc même distance à O : elles sont sur un cercle de centre O.
          </li>
          <li>
            De <Tex expr={"z_k"} /> à <Tex expr={"z_{k+1}"} />, l&apos;argument augmente toujours de <Tex expr={"\\dfrac{2\\pi}{n}"} /> : les points sont <strong>régulièrement espacés</strong>.
          </li>
          <li>
            Chaque côté est la base d&apos;un triangle isocèle de sommet O, d&apos;angle <Tex expr={"\\dfrac{2\\pi}{n}"} /> : sa longueur est <Tex expr={"c=2R\\sin\\dfrac{\\pi}{n}"} /> (pour n ≥ 3).
          </li>
          <li>
            Si φ augmente de α, chaque argument augmente de <Tex expr={"\\alpha/n"} /> : <strong>le polygone tourne n fois moins vite</strong> que l&apos;argument de Z (sans changer de forme ni de taille).
          </li>
          <li>Pour n = 2 on n&apos;a que deux points, opposés par rapport à O : aucun polygone.</li>
        </ol>
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc nombre={DEFIS.length} rendu={(i) => <QuestionsGeometrie d={DEFIS[i]} />} />
      </Zone>

      <Conclusion>
        Les racines n-ièmes de Z sont les sommets d&apos;un polygone régulier à n côtés inscrit dans le cercle de centre O et de rayon <Tex expr={"\\rho^{1/n}"} /> ; côté <Tex expr={"c=2R\\sin\\dfrac{\\pi}{n}"} /> pour n ≥ 3.
      </Conclusion>
    </div>
  );
}
