"use client";

import { useState } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { argument, conj, cx, enDegres, modC, mul, presqueEgal, type Cx } from "@/lib/complexes";
import { brut, quadrant, texCalculModule } from "@/lib/complexesAffichage";
import { lireComplexe, lireReel, reponseEgale, texAngle, texComplexe, texModule, texNombre, texReel } from "@/lib/complexesTex";
import { Arc, Bouton, COULEURS, Conclusion, Curseur, DefiBloc, Fleche, Intro, PlanSvg, Question, QuestionTexte, Tex, Valeur, Zone, type PointPlan } from "./ui";

const BORNES = { xmin: -6, xmax: 6, ymin: -6, ymax: 6 };
const CIBLES: Cx[] = [cx(-3, 4), cx(2, -5), cx(-4, -3)];

/** Placement du point : l'élève déplace M puis valide ; le retour dit LAQUELLE des deux coordonnées est fausse. */
function QuestionPlacement({ cible }: { cible: Cx }) {
  const [m, setM] = useState<Cx>(cx(0, 0));
  const reOk = presqueEgal(m.re, cible.re, 1e-6);
  const imOk = presqueEgal(m.im, cible.im, 1e-6);
  const pts: PointPlan[] = [{ id: "m", z: m, couleur: COULEURS.resultat, etiquette: "M", deplacable: true }];
  return (
    <Question
      numero={1}
      enonce={
        <>
          Place le point M d&apos;affixe <Tex expr={`z = ${texComplexe(cible)}`} /> (déplace-le avec la souris, le doigt ou les flèches du clavier).
        </>
      }
      indices={[
        <>
          La partie réelle <Tex expr={`a = ${texReel(cible.re)}`} /> est l&apos;<strong>abscisse</strong> : elle se lit sur l&apos;axe horizontal.
        </>,
        <>
          La partie imaginaire <Tex expr={`b = ${texReel(cible.im)}`} /> est l&apos;<strong>ordonnée</strong> : elle se lit sur l&apos;axe vertical.
        </>,
        <>
          Le point cherché a pour coordonnées <Tex expr={`(${texReel(cible.re)}\\,;\\,${texReel(cible.im)})`} />, dans le {quadrant(cible)}.
        </>,
      ]}
      correction={
        <>
          <Tex expr={`z = ${texComplexe(cible)}`} /> : <Tex expr={`a = ${texReel(cible.re)}`} /> (abscisse) et <Tex expr={`b = ${texReel(cible.im)}`} /> (ordonnée). Le point M se trouve donc en{" "}
          <Tex expr={`(${texReel(cible.re)}\\,;\\,${texReel(cible.im)})`} />, {quadrant(cible)}.
        </>
      }
      onVerifier={() => {
        if (reOk && imOk) return { ok: true, message: <>Bien placé : M({brut(m.re, 1)} ; {brut(m.im, 1)}) a pour affixe z.</> };
        const echange = presqueEgal(m.re, cible.im, 1e-6) && presqueEgal(m.im, cible.re, 1e-6);
        return {
          ok: false,
          message: (
            <>
              Ton point a pour affixe <Tex expr={texComplexe(m)} />.{" "}
              {echange
                ? "Tu as échangé les deux coordonnées : la partie réelle se lit sur l'axe horizontal, la partie imaginaire sur l'axe vertical."
                : reOk
                  ? "La partie réelle est bonne, mais la partie imaginaire (hauteur) ne convient pas."
                  : imOk
                    ? "La partie imaginaire est bonne, mais la partie réelle (position horizontale) ne convient pas."
                    : "Ni la partie réelle ni la partie imaginaire ne conviennent : relis l'affixe demandée."}
            </>
          ),
        };
      }}
      corps={<PlanSvg bornes={BORNES} points={pts} onDeplacer={(_, z) => setM(z)} etiquette="Plan pour placer le point M" aimant={1} />}
    />
  );
}

export default function SimPlan() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [avecConj, setAvecConj] = useState(false);
  const z = cx(a, b);
  const r = modC(z);
  const theta = argument(z);
  const zb = conj(z);
  const produit = mul(z, zb);
  const pts: PointPlan[] = [{ id: "m", z, couleur: COULEURS.z, etiquette: "M", deplacable: true }];
  if (avecConj) pts.push({ id: "mc", z: zb, couleur: COULEURS.conjugue, etiquette: "M′" });

  function reinit() {
    setA(2);
    setB(3);
    setAvecConj(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-sky-500 bg-sky-50">
        Le nombre complexe <strong>z = a + ib</strong> est représenté par le point M de coordonnées (a ; b). Déplace M, ou change a et b : tout se met à jour. Tu vas relier la partie réelle, la partie imaginaire, le module et l&apos;argument à ce que tu vois.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
          <PlanSvg
            bornes={BORNES}
            points={pts}
            aimant={0.1}
            etiquette="Plan complexe : le point M d'affixe z est déplaçable"
            onDeplacer={(_, p) => {
              setA(p.re);
              setB(p.im);
            }}
            dessous={(o) => (
              <g>
                {/* triangle rectangle de référence : O, A(a ; 0), M */}
                <polygon points={`${o.P(cx(0, 0))} ${o.P(cx(a, 0))} ${o.P(z)}`} fill={COULEURS.z} fillOpacity={0.08} />
                <line x1={o.X(a)} y1={o.Y(0)} x2={o.X(a)} y2={o.Y(b)} stroke={COULEURS.z} strokeWidth={1.6} strokeDasharray="5 4" />
                <line x1={o.X(0)} y1={o.Y(b)} x2={o.X(a)} y2={o.Y(b)} stroke={COULEURS.z} strokeWidth={1.6} strokeDasharray="5 4" />
                <circle cx={o.X(a)} cy={o.Y(0)} r={4} fill={COULEURS.z} />
                <circle cx={o.X(0)} cy={o.Y(b)} r={4} fill={COULEURS.z} />
                <text x={o.X(a)} y={o.Y(0) + (b >= 0 ? 24 : -14)} textAnchor="middle" fontSize={12} fontWeight={700} fill={COULEURS.z}>
                  a = {brut(a, 1)}
                </text>
                <text x={o.X(0) + (a >= 0 ? -8 : 8)} y={o.Y(b) - 6} textAnchor={a >= 0 ? "end" : "start"} fontSize={12} fontWeight={700} fill={COULEURS.z}>
                  b = {brut(b, 1)}
                </text>
                <Fleche o={o} de={cx(0, 0)} vers={z} couleur={COULEURS.z} />
                {theta !== null && r > 0 && <Arc o={o} centre={cx(0, 0)} rayon={Math.min(0.9, r * 0.4)} a1={0} a2={theta} couleur={COULEURS.resultat} />}
                {avecConj && (
                  <g>
                    <line x1={o.X(a)} y1={o.Y(b)} x2={o.X(a)} y2={o.Y(-b)} stroke={COULEURS.conjugue} strokeWidth={1.8} strokeDasharray="2 4" />
                    <Fleche o={o} de={cx(0, 0)} vers={zb} couleur={COULEURS.conjugue} pointille />
                  </g>
                )}
              </g>
            )}
          />
          <div className="flex min-w-0 flex-col gap-3">
            <Curseur etiquette={<>Partie réelle <Tex expr="a" /></>} valeur={a} min={-6} max={6} pas={0.1} onChange={setA} decimales={1} />
            <Curseur etiquette={<>Partie imaginaire <Tex expr="b" /></>} valeur={b} min={-6} max={6} pas={0.1} onChange={setB} decimales={1} />
            <div className="flex flex-wrap gap-2">
              <Bouton variante={avecConj ? "plein" : "contour"} onClick={() => setAvecConj((v) => !v)}>
                {avecConj ? "Masquer le conjugué" : "Afficher le conjugué"}
              </Bouton>
              <Bouton onClick={reinit}>
                <IconRefresh size={18} aria-hidden="true" />
                Réinitialiser
              </Bouton>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-live="polite">
          <Valeur etiquette="Forme algébrique">
            <Tex expr={`z = ${texComplexe(z)}`} />
          </Valeur>
          <Valeur etiquette="Coordonnées de M">
            <Tex expr={`M\\,(${texNombre(a)}\\,;\\,${texNombre(b)})`} />
          </Valeur>
          <Valeur etiquette="Partie réelle · imaginaire">
            <Tex expr={`a = ${texNombre(a)}\\quad b = ${texNombre(b)}`} />
          </Valeur>
          <Valeur etiquette="Position">{quadrant(z)}</Valeur>
          <Valeur etiquette="Module">
            <Tex expr={`|z| = ${texModule(z)}`} />
          </Valeur>
          <Valeur etiquette="Argument">
            {theta === null ? (
              <span className="text-orange-700">Argument indéfini (z = 0)</span>
            ) : (
              <Tex expr={`\\theta = ${texAngle(theta)} \\;(\\approx ${texNombre(theta)}\\text{ rad} \\approx ${texNombre(enDegres(theta), 1)}^\\circ)`} />
            )}
          </Valeur>
        </div>
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-fh-ardoise">
          <p>
            Le point M a pour <strong>abscisse</strong> la partie réelle <Tex expr={`a = ${texNombre(a)}`} /> et pour <strong>ordonnée</strong> la partie imaginaire <Tex expr={`b = ${texNombre(b)}`} />. Le nombre{" "}
            <Tex expr={`z = ${texComplexe(z)}`} /> est l&apos;<strong>affixe</strong> de M.
          </p>
          <p>Dans le triangle rectangle formé par O, la projection de M sur l&apos;axe réel et M, le théorème de Pythagore donne la longueur OM, c&apos;est-à-dire le module :</p>
          <Tex bloc expr={texCalculModule(z)} />
          {theta === null ? (
            <p>
              Pour <Tex expr="z = 0" />, le point M est confondu avec O : le module est 0 et il n&apos;existe <strong>aucun argument</strong> (aucune direction).
            </p>
          ) : (
            <p>
              Un argument de z est l&apos;angle orienté <Tex expr="(\overrightarrow{u}\,;\overrightarrow{OM})" />. On le choisit ici dans <Tex expr="]-\pi\,;\pi]" /> ; les autres arguments s&apos;obtiennent en ajoutant <Tex expr="2k\pi" />.
            </p>
          )}
          {avecConj && (
            <div className="flex flex-col gap-1 rounded-lg border border-emerald-300 bg-emerald-50 p-3">
              <p>
                Le conjugué <Tex expr={`\\bar z = ${texComplexe(zb)}`} /> est représenté par M′, le <strong>symétrique de M par rapport à l&apos;axe des réels</strong> : même abscisse, ordonnée opposée.
              </p>
              <Tex bloc expr={`|z| = ${texNombre(r)} = |\\bar z| = ${texNombre(modC(zb))}`} />
              <Tex bloc expr={`z\\times\\bar z = a^2 + b^2 = ${texNombre(produit.re)} = |z|^2`} />
            </div>
          )}
        </div>
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={CIBLES.length}
          rendu={(i) => {
            const c = CIBLES[i];
            return (
              <>
                <QuestionPlacement cible={c} />
                <QuestionTexte
                  numero={2}
                  enonce={
                    <>
                      Quel est le module de <Tex expr={`z = ${texComplexe(c)}`} /> ?
                    </>
                  }
                  placeholder="ex. 5, √29 ou 5,385"
                  verifier={(t) => {
                    const l = lireReel(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    return reponseEgale(l.valeur, modC(c))
                      ? { ok: true, message: <>Exact : <Tex expr={`|z| = ${texModule(c)}`} />.</> }
                      : { ok: false, message: <>Ce n&apos;est pas ça. Le module est la longueur OM : <Tex expr="|z| = \sqrt{a^2+b^2}" />.</> };
                  }}
                  indices={[
                    <>
                      Utilise <Tex expr="|z| = \sqrt{a^2 + b^2}" /> avec <Tex expr={`a = ${texReel(c.re)}`} /> et <Tex expr={`b = ${texReel(c.im)}`} />.
                    </>,
                    <>
                      Calcule <Tex expr={`a^2 + b^2 = ${c.re * c.re} + ${c.im * c.im}`} />.
                    </>,
                  ]}
                  correction={<Tex bloc expr={texCalculModule(c)} />}
                />
                <QuestionTexte
                  numero={3}
                  enonce={
                    <>
                      Donne le conjugué <Tex expr="\bar z" /> de <Tex expr={`z = ${texComplexe(c)}`} />.
                    </>
                  }
                  placeholder="ex. 3 - 4i"
                  verifier={(t) => {
                    const l = lireComplexe(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    const attendu = conj(c);
                    if (reponseEgale(l.valeur.re, attendu.re) && reponseEgale(l.valeur.im, attendu.im)) {
                      return { ok: true, message: <>Exact : <Tex expr={`\\bar z = ${texComplexe(attendu)}`} /> est le symétrique de M par rapport à l&apos;axe réel.</> };
                    }
                    return { ok: false, message: <>Le conjugué garde la partie réelle et <strong>change le signe</strong> de la partie imaginaire.</> };
                  }}
                  indices={[
                    <>
                      Le conjugué de <Tex expr="a + ib" /> est <Tex expr="a - ib" />.
                    </>,
                  ]}
                  correction={
                    <>
                      <Tex expr={`\\bar z = ${texComplexe(conj(c))}`} /> : on garde <Tex expr={`a = ${texReel(c.re)}`} /> et on change le signe de <Tex expr={`b = ${texReel(c.im)}`} />.
                    </>
                  }
                />
              </>
            );
          }}
        />
      </Zone>

      <Conclusion>
        z = a + ib se lit sur le plan : a est l&apos;abscisse, b l&apos;ordonnée, |z| = √(a²+b²) la distance OM. Le conjugué est le symétrique par rapport à l&apos;axe réel, et z × z̄ = |z|². Le nombre 0 n&apos;a pas d&apos;argument.
      </Conclusion>
    </div>
  );
}
