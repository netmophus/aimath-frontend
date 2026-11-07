"use client";

import { useRef, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { argument, cx, enDegres, enRadians, type Cx } from "@/lib/complexes";
import { exactFoisEntier, lireComplexe, lireReel, reponseEgale, texAngle, texComplexe, texExact, texNombre, texReel, trigExacte } from "@/lib/complexesTex";
import { pointsEuler } from "@/lib/moivreEuler";
import { Bouton, COULEURS, Commandes, Conclusion, Curseur, DefiBloc, EtapeFormule, Intro, Message, Pastille, PlanSvg, QuestionChoix, QuestionTexte, Tex, Valeur, Zone, Fleche, type PointPlan } from "./ui";

const ANGLES = [0, 30, 45, 60, 90, 180];
const DEFAUT = 60;
const B = 2.3;

type Mode = "aucun" | "somme" | "difference";

/** cos et sin de θ (degrés entiers multiples de 15 remarquables) en valeurs EXACTES, sinon null. */
function exactTrig(deg: number) {
  if (!Number.isInteger(deg) || deg % 15 !== 0) return null;
  return trigExacte(deg / 15);
}

export default function Euler() {
  const [deg, setDeg] = useState(DEFAUT);
  const [mode, setMode] = useState<Mode>("aucun");
  const [projections, setProjections] = useState(true);
  const [radians, setRadians] = useState(true);
  const [etape, setEtape] = useState(0);
  const zoneComprendre = useRef<HTMLDivElement>(null);

  const theta = enRadians(deg);
  const e = pointsEuler(theta);
  const exact = exactTrig(deg);
  const cosTex = exact ? texExact(exact.cos) : `${e.cos < 0 ? "-" : ""}${texNombre(Math.abs(e.cos))}`;
  const sinTex = exact ? texExact(exact.sin) : `${e.sin < 0 ? "-" : ""}${texNombre(Math.abs(e.sin))}`;
  const deuxCos = exact ? texExact(exactFoisEntier(exact.cos, 2)) : texNombre(2 * e.cos);
  const egal = exact ? "=" : "\\approx";
  const thetaTexte = radians ? `${deg}^\\circ = ${texAngle(theta)}` : `${deg}^\\circ`;

  function pointDepuis(z: Cx) {
    const a = argument(z);
    if (a === null) return;
    setDeg(Math.round(enDegres(a)));
  }
  function reinit() {
    setDeg(DEFAUT);
    setMode("aucun");
    setProjections(true);
    setRadians(true);
    setEtape(0);
  }

  const pts: PointPlan[] = [
    { id: "ep", z: e.ep, couleur: COULEURS.z, etiquette: "e^{iθ}", deplacable: true },
    { id: "em", z: e.em, couleur: COULEURS.conjugue, etiquette: "e^{-iθ}" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-emerald-500 bg-emerald-50">
        Les deux points <Tex expr={"e^{i\\theta}"} /> et <Tex expr={"e^{-i\\theta}"} /> sont symétriques par rapport à l&apos;axe réel : en les additionnant, les parties imaginaires s&apos;annulent (on obtient 2cos θ) ; en les soustrayant, ce sont les parties réelles (on obtient 2i sin θ).
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap items-end gap-3">
          <Curseur etiquette="Angle θ" valeur={deg} min={-360} max={360} pas={1} decimales={2} unite="degrés" onChange={setDeg} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Angles remarquables">
          {ANGLES.map((a) => (
            <Pastille key={a} actif={deg === a} onClick={() => setDeg(a)}>
              {a}°
            </Pastille>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Actions">
          <Pastille actif={mode === "somme"} onClick={() => setMode(mode === "somme" ? "aucun" : "somme")}>
            Additionner
          </Pastille>
          <Pastille actif={mode === "difference"} onClick={() => setMode(mode === "difference" ? "aucun" : "difference")}>
            Soustraire
          </Pastille>
          <Bouton
            variante="plein"
            onClick={() => {
              setEtape((x) => Math.min(4, x + 1));
              zoneComprendre.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }}
          >
            Comprendre
          </Bouton>
          <Pastille actif={projections} onClick={() => setProjections((p) => !p)}>
            Projections
          </Pastille>
          <Pastille actif={radians} onClick={() => setRadians((r) => !r)}>
            Radians
          </Pastille>
          <Bouton onClick={reinit}>
            <IconRefresh size={18} aria-hidden="true" />
            Réinitialiser
          </Bouton>
        </div>

        <figure className="flex min-w-0 flex-col gap-1">
          <figcaption className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/70">Cercle trigonométrique : déplace le point bleu</figcaption>
          <PlanSvg
            bornes={{ xmin: -B, xmax: B, ymin: -B, ymax: B }}
            unite={228 / B}
            points={pts}
            onDeplacer={(_, z) => pointDepuis(z)}
            aimant={0.01}
            pas={0.5}
            etiquette="Cercle trigonométrique : les points e^{iθ} et e^{-iθ}"
            dessous={(o) => (
              <>
                <circle cx={o.X(0)} cy={o.Y(0)} r={o.u} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
                {projections && (
                  <>
                    <line x1={o.X(e.ep.re)} y1={o.Y(e.ep.im)} x2={o.X(e.ep.re)} y2={o.Y(0)} stroke={COULEURS.z} strokeDasharray="4 3" />
                    <line x1={o.X(e.ep.re)} y1={o.Y(e.ep.im)} x2={o.X(0)} y2={o.Y(e.ep.im)} stroke={COULEURS.z} strokeDasharray="4 3" />
                    <line x1={o.X(e.em.re)} y1={o.Y(e.em.im)} x2={o.X(e.em.re)} y2={o.Y(0)} stroke={COULEURS.conjugue} strokeDasharray="4 3" />
                    <line x1={o.X(e.em.re)} y1={o.Y(e.em.im)} x2={o.X(0)} y2={o.Y(e.em.im)} stroke={COULEURS.conjugue} strokeDasharray="4 3" />
                    <circle cx={o.X(e.cos)} cy={o.Y(0)} r={4} fill={COULEURS.z} />
                    <circle cx={o.X(0)} cy={o.Y(e.sin)} r={4} fill={COULEURS.z} />
                    <circle cx={o.X(0)} cy={o.Y(-e.sin)} r={4} fill={COULEURS.conjugue} />
                  </>
                )}
                {mode === "somme" && (
                  <>
                    <line x1={o.X(e.ep.re)} y1={o.Y(e.ep.im)} x2={o.X(e.somme.re)} y2={o.Y(e.somme.im)} stroke={COULEURS.conjugue} strokeDasharray="5 4" strokeWidth={1.6} />
                    <line x1={o.X(e.em.re)} y1={o.Y(e.em.im)} x2={o.X(e.somme.re)} y2={o.Y(e.somme.im)} stroke={COULEURS.z} strokeDasharray="5 4" strokeWidth={1.6} />
                    <Fleche o={o} de={cx(0, 0)} vers={e.ep} couleur={COULEURS.z} epaisseur={2} />
                    <Fleche o={o} de={cx(0, 0)} vers={e.em} couleur={COULEURS.conjugue} epaisseur={2} />
                    <Fleche o={o} de={cx(0, 0)} vers={e.somme} couleur={COULEURS.resultat} epaisseur={3.5} />
                  </>
                )}
                {mode === "difference" && (
                  <>
                    <Fleche o={o} de={e.em} vers={e.ep} couleur={COULEURS.resultat} epaisseur={2.5} />
                    <Fleche o={o} de={cx(0, 0)} vers={e.difference} couleur={COULEURS.resultat} epaisseur={3.5} />
                    <line x1={o.X(e.ep.re)} y1={o.Y(e.ep.im)} x2={o.X(0)} y2={o.Y(e.sin * 2)} stroke="#94a3b8" strokeDasharray="3 4" />
                  </>
                )}
              </>
            )}
            dessus={(o) => (
              <>
                {mode === "somme" && <text x={o.X(e.somme.re) + (e.somme.re >= 0 ? 8 : -8)} y={o.Y(0) - 8} textAnchor={e.somme.re >= 0 ? "start" : "end"} fontSize={12} fontWeight={700} fill={COULEURS.resultat}>2cos θ</text>}
                {mode === "difference" && <text x={o.X(0) + 8} y={o.Y(e.difference.im)} fontSize={12} fontWeight={700} fill={COULEURS.resultat}>2i sin θ</text>}
              </>
            )}
          />
        </figure>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fh-ardoise" aria-label="Légende">
          <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: COULEURS.z }} />e^(iθ) : déplaçable</li>
          <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: COULEURS.conjugue }} />e^(−iθ) : symétrique par rapport à l&apos;axe réel</li>
          <li><span className="mr-1 inline-block h-2.5 w-2.5 rounded-full align-middle" style={{ background: COULEURS.resultat }} />somme ou différence</li>
        </ul>

        <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
          <Valeur etiquette="Angle">
            <Tex expr={`\\theta = ${thetaTexte}`} />
          </Valeur>
          <Valeur etiquette={exact ? "cos θ et sin θ (valeurs exactes)" : "cos θ et sin θ (valeurs approchées)"}>
            <Tex expr={`\\cos\\theta ${egal} ${cosTex}\\ ;\\ \\sin\\theta ${egal} ${sinTex}`} />
          </Valeur>
          <Valeur etiquette="Exponentielles">
            <Tex expr={`e^{i\\theta} ${egal} ${texComplexe(e.ep).replace(/^$/, "0")}\\ ;\\ e^{-i\\theta} ${egal} ${texComplexe(e.em)}`} />
          </Valeur>
          {mode === "somme" && (
            <Valeur etiquette="Somme : les parties imaginaires s'annulent">
              <Tex expr={`e^{i\\theta}+e^{-i\\theta} = 2\\cos\\theta ${egal} ${exact ? texReel(e.somme.re) : deuxCos}`} />
            </Valeur>
          )}
          {mode === "difference" && (
            <Valeur etiquette="Différence : les parties réelles s'annulent">
              <Tex expr={`e^{i\\theta}-e^{-i\\theta} = 2i\\sin\\theta ${egal} ${texComplexe(e.difference)}`} />
            </Valeur>
          )}
        </div>
        {!exact && <Message type="info">Pour cet angle, cos θ et sin θ n&apos;ont pas d&apos;écriture exacte simple : les valeurs sont approchées (≈), arrondies à 3 décimales.</Message>}
      </Zone>

      <div ref={zoneComprendre}>
        <Zone titre="2 · Comprendre" ton="explication">
          <Commandes etape={etape} total={4} onPrecedent={() => setEtape((x) => Math.max(0, x - 1))} onSuivant={() => setEtape((x) => Math.min(4, x + 1))} onTout={() => setEtape(4)} onRecommencer={() => setEtape(0)} />
          {etape === 0 && <p className="text-sm text-fh-ardoise">Clique sur « Étape suivante » (ou sur « Comprendre » plus haut) pour construire les formules d&apos;Euler pas à pas.</p>}
          <ol className="flex flex-col gap-2">
            {etape >= 1 && <EtapeFormule numero={1} titre="Écrire e^{iθ} avec cos et sin" expr={"e^{i\\theta}=\\cos\\theta+i\\sin\\theta"} texte="C'est le point du cercle trigonométrique d'angle θ : son abscisse est cos θ, son ordonnée sin θ." />}
            {etape >= 2 && <EtapeFormule numero={2} titre="Écrire e^{-iθ} : on change θ en −θ" expr={"e^{-i\\theta}=\\cos(-\\theta)+i\\sin(-\\theta)=\\cos\\theta-i\\sin\\theta"} texte="cos est pair, sin est impair : e^{-iθ} est le symétrique de e^{iθ} par rapport à l'axe réel (même abscisse, ordonnée opposée)." />}
            {etape >= 3 && <EtapeFormule numero={3} titre="Additionner : les parties imaginaires s'annulent" expr={"e^{i\\theta}+e^{-i\\theta}=2\\cos\\theta\\ \\Longrightarrow\\ \\boxed{\\cos\\theta=\\dfrac{e^{i\\theta}+e^{-i\\theta}}{2}}"} />}
            {etape >= 4 && <EtapeFormule numero={4} titre="Soustraire : les parties réelles s'annulent" expr={"e^{i\\theta}-e^{-i\\theta}=2i\\sin\\theta\\ \\Longrightarrow\\ \\boxed{\\sin\\theta=\\dfrac{e^{i\\theta}-e^{-i\\theta}}{2i}}"} />}
          </ol>
        </Zone>
      </div>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={3}
          rendu={(i) => {
            const d = [60, 90, 30][i];
            const ee = pointsEuler(enRadians(d));
            const attSomme = ee.somme.re;
            const attDiff = ee.difference;
            return (
              <>
                <p className="text-sm text-fh-ardoise">
                  Pour <Tex expr={`\\theta = ${d}^\\circ`} />.
                </p>
                <QuestionTexte
                  numero={1}
                  enonce={<>Calcule <Tex expr={"e^{i\\theta}+e^{-i\\theta}"} />.</>}
                  placeholder="par exemple 1 ou √3"
                  verifier={(t) => {
                    const l = lireReel(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    if (reponseEgale(l.valeur, attSomme)) return { ok: true, message: <>Exact : <Tex expr={`e^{i\\theta}+e^{-i\\theta}=2\\cos ${d}^\\circ = ${texReel(attSomme)}`} />.</> };
                    if (reponseEgale(l.valeur, ee.cos)) return { ok: false, message: "Tu as donné cos θ : la somme vaut 2 cos θ (les deux exponentielles contribuent chacune cos θ)." };
                    return { ok: false, message: <>La somme est <Tex expr={"2\\cos\\theta"} /> : les parties imaginaires s&apos;annulent.</> };
                  }}
                  indices={[<>Les deux points ont la même abscisse cos θ.</>, <>Leurs ordonnées sont opposées : leur somme est nulle.</>]}
                  correction={<><Tex expr={`e^{i\\theta}+e^{-i\\theta}=2\\cos ${d}^\\circ = ${texReel(attSomme)}`} />.</>}
                />
                <QuestionTexte
                  numero={2}
                  enonce={<>Calcule <Tex expr={"e^{i\\theta}-e^{-i\\theta}"} /> sous forme algébrique.</>}
                  placeholder="par exemple 2i ou √3 i"
                  verifier={(t) => {
                    const l = lireComplexe(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    if (reponseEgale(l.valeur.re, attDiff.re) && reponseEgale(l.valeur.im, attDiff.im)) return { ok: true, message: <>Exact : <Tex expr={`e^{i\\theta}-e^{-i\\theta}=2i\\sin ${d}^\\circ = ${texComplexe(attDiff)}`} />.</> };
                    if (reponseEgale(l.valeur.im, ee.sin)) return { ok: false, message: "Il manque le facteur 2 : la différence vaut 2i sin θ (chaque exponentielle apporte ± i sin θ)." };
                    return { ok: false, message: <>La différence est <Tex expr={"2i\\sin\\theta"} /> : les parties réelles s&apos;annulent, il reste un imaginaire pur.</> };
                  }}
                  indices={[<>Les deux points ont la même abscisse : la partie réelle de la différence est nulle.</>, <>Les ordonnées sont sin θ et −sin θ : leur différence est 2 sin θ.</>]}
                  correction={<><Tex expr={`e^{i\\theta}-e^{-i\\theta}=2i\\sin ${d}^\\circ = ${texComplexe(attDiff)}`} />.</>}
                />
                <QuestionChoix
                  numero={3}
                  enonce="Quelle formule donne sin θ ?"
                  options={[
                    { id: "a", libelle: <Tex expr={"\\dfrac{e^{i\\theta}-e^{-i\\theta}}{2i}"} /> },
                    { id: "b", libelle: <Tex expr={"\\dfrac{e^{i\\theta}-e^{-i\\theta}}{2}"} /> },
                    { id: "c", libelle: <Tex expr={"\\dfrac{e^{i\\theta}+e^{-i\\theta}}{2i}"} /> },
                  ]}
                  bonne="a"
                  explications={{
                    a: "Oui : la différence vaut 2i sin θ ; on divise par 2i.",
                    b: "Cette expression est imaginaire pure (elle vaut i sin θ) : il manque la division par i.",
                    c: "La somme e^{iθ}+e^{-iθ} vaut 2cos θ : on obtiendrait cos θ / i, pas sin θ.",
                  }}
                  indices={[<>La différence e^{"{iθ}"} − e^{"{−iθ}"} est un imaginaire pur.</>]}
                  correction={<><Tex expr={"e^{i\\theta}-e^{-i\\theta}=2i\\sin\\theta"} /> donc <Tex expr={"\\sin\\theta=\\dfrac{e^{i\\theta}-e^{-i\\theta}}{2i}"} />.</>}
                />
              </>
            );
          }}
        />
      </Zone>

      <Conclusion>
        <Tex expr={"\\cos\\theta=\\dfrac{e^{i\\theta}+e^{-i\\theta}}{2}"} /> et <Tex expr={"\\sin\\theta=\\dfrac{e^{i\\theta}-e^{-i\\theta}}{2i}"} />. Les valeurs exactes des angles remarquables ne sont jamais remplacées par des approximations décimales.
      </Conclusion>
    </div>
  );
}
