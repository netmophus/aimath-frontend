"use client";

import { useState, type ReactNode } from "react";
import { IconRefresh } from "@tabler/icons-react";

import {
  alignes,
  angleEnSommet,
  argument,
  birapport,
  cercleCirconscrit,
  cocyclicite,
  confondus,
  cx,
  distance,
  div,
  estImaginairePur,
  modC,
  natureTriangle,
  orthogonaux,
  quotientAlignement,
  sub,
  type Cx,
} from "@/lib/complexes";
import { brut } from "@/lib/complexesAffichage";
import { lireComplexe, lireReel, reponseEgale, texAngle, texComplexe, texDegres, texNombre, texReel } from "@/lib/complexesTex";
import { Arc, Bouton, COULEURS, Conclusion, DefiBloc, Intro, Message, Pastille, PlanSvg, QuestionChoix, QuestionTexte, Tex, Valeur, Zone, type PointPlan } from "./ui";

type Mode = "distances" | "angles" | "alignement" | "orthogonalite" | "triangle" | "cocyclicite";

const MODES: Array<{ id: Mode; libelle: string }> = [
  { id: "distances", libelle: "Distances" },
  { id: "angles", libelle: "Quotients et angles" },
  { id: "alignement", libelle: "Alignement" },
  { id: "orthogonalite", libelle: "Orthogonalité" },
  { id: "triangle", libelle: "Triangle remarquable" },
  { id: "cocyclicite", libelle: "Cocyclicité" },
];

const BORNES = { xmin: -6, xmax: 6, ymin: -6, ymax: 6 };
const A0 = cx(-2, -1);
const B0 = cx(3, -1);
const C0 = cx(1, 3);
const D0 = cx(-1, 3);

const par = (z: Cx) => `(${texComplexe(z)})`;
const aff = (nom: string, z: Cx) => `z_${nom} = ${texComplexe(z)}`;
const sep = (x: number) => texNombre(x);

const PRESETS: Array<{ id: string; libelle: string; A: Cx; B: Cx; C: Cx }> = [
  { id: "iso", libelle: "Isocèle", A: cx(-2, -1), B: cx(2, -1), C: cx(0, 3) },
  { id: "rect", libelle: "Rectangle", A: cx(-2, -1), B: cx(2, -1), C: cx(-2, 2) },
  { id: "equi", libelle: "Équilatéral", A: cx(-2, -1), B: cx(2, -1), C: cx(0, -1 + 2 * Math.sqrt(3)) },
  { id: "isorect", libelle: "Rectangle isocèle", A: cx(-2, -1), B: cx(2, -1), C: cx(-2, 3) },
];

function oui(b: boolean | null): string {
  return b === null ? "indéfini" : b ? "oui" : "non";
}

const INSTANCES: Array<{ A: Cx; B: Cx; C: Cx; D: Cx }> = [
  { A: cx(0, 0), B: cx(4, 0), C: cx(0, 3), D: cx(4, 3) },
  { A: cx(1, 1), B: cx(2, 3), C: cx(4, 7), D: cx(0, 0) },
  { A: cx(-1, 0), B: cx(1, 0), C: cx(0, 1), D: cx(0, -1) },
];

export default function SimGeometrie() {
  const [mode, setMode] = useState<Mode>("distances");
  const [A, setA] = useState<Cx>(A0);
  const [B, setB] = useState<Cx>(B0);
  const [C, setC] = useState<Cx>(C0);
  const [D, setD] = useState<Cx>(D0);

  const AB = distance(A, B);
  const AC = distance(A, C);
  const BC = distance(B, C);

  const points: PointPlan[] = [
    { id: "A", z: A, couleur: COULEURS.z, etiquette: "A", deplacable: true },
    { id: "B", z: B, couleur: COULEURS.w, etiquette: "B", deplacable: true },
    { id: "C", z: C, couleur: COULEURS.resultat, etiquette: "C", deplacable: true },
  ];
  if (mode === "cocyclicite") points.push({ id: "D", z: D, couleur: COULEURS.conjugue, etiquette: "D", deplacable: true });

  function deplacer(id: string, p: Cx) {
    if (id === "A") setA(p);
    else if (id === "B") setB(p);
    else if (id === "C") setC(p);
    else if (id === "D") setD(p);
  }
  function reinit() {
    setA(A0);
    setB(B0);
    setC(C0);
    setD(D0);
  }

  const Z = confondus(C, A) || confondus(C, B) ? null : div(sub(C, B), sub(C, A));
  const angleC = angleEnSommet(A, B, C);
  const Q = quotientAlignement(A, B, C);
  const al = alignes(A, B, C);
  const orth = orthogonaux(A, B, C);
  const nat = natureTriangle(A, B, C);
  const coc = cocyclicite(A, B, C, D);
  const cercle = cercleCirconscrit(A, B, C);
  const bir = birapport(A, B, C, D);

  const explication: ReactNode = (() => {
    if (mode === "distances") {
      const d = (nom: string, P: Cx, R: Cx) => {
        const v = sub(R, P);
        return `${nom} = |z_${nom[1]} - z_${nom[0]}| = |${texComplexe(v)}| = \\sqrt{${texReel(v.re)}^2 + ${texReel(v.im)}^2} = ${texNombre(distance(P, R))}`;
      };
      return (
        <>
          <p>La distance entre deux points est le <strong>module de la différence de leurs affixes</strong> : <Tex expr="AB = |z_B - z_A|" />.</p>
          <Tex bloc expr={d("AB", A, B)} />
          <Tex bloc expr={d("AC", A, C)} />
          <Tex bloc expr={d("BC", B, C)} />
        </>
      );
    }
    if (mode === "angles") {
      if (Z === null) return <Message type="erreur">Quotient impossible : C est confondu avec A ou avec B, donc un des vecteurs CA ou CB est nul et l&apos;angle en C n&apos;existe pas.</Message>;
      return (
        <>
          <p>
            Posons <Tex expr="Z = \dfrac{z_C - z_B}{z_C - z_A}" />. Alors <Tex expr="|Z| = \dfrac{BC}{AC}" /> et <Tex expr="\arg Z = (\overrightarrow{CA}\,;\overrightarrow{CB}) \pmod{2\pi}" /> (angle orienté de CA vers CB, mis en évidence en C).
          </p>
          <Tex bloc expr={`Z = \\dfrac{${par(sub(C, B))}}{${par(sub(C, A))}} = ${texComplexe(Z)}`} />
          <Tex bloc expr={`|Z| = \\dfrac{BC}{AC} = \\dfrac{${sep(BC)}}{${sep(AC)}} = ${sep(modC(Z))}`} />
          <Tex bloc expr={`\\arg Z = (\\overrightarrow{CA}\\,;\\overrightarrow{CB}) = ${texAngle(argument(Z) as number)} \\approx ${texNombre(argument(Z) as number)}\\text{ rad} = ${texDegres(argument(Z) as number)}`} />
          <p className="text-xs text-fh-ardoise/70">Un angle orienté est positif si l&apos;on tourne dans le sens direct (anti-horaire) de CA vers CB.</p>
        </>
      );
    }
    if (mode === "alignement") {
      if (Q === null) return <Message type="erreur">Quotient impossible : A et B sont confondus (zB − zA = 0).</Message>;
      return (
        <>
          <p>
            Trois points distincts A, B, C sont alignés si et seulement si <Tex expr="Q = \dfrac{z_C - z_A}{z_B - z_A}" /> est un <strong>nombre réel</strong> (les vecteurs AB et AC sont colinéaires).
          </p>
          <Tex bloc expr={`Q = \\dfrac{${par(sub(C, A))}}{${par(sub(B, A))}} = ${texComplexe(Q)}`} />
          <Message type={al ? "ok" : "info"}>{al ? "Q est réel (partie imaginaire nulle à la tolérance numérique 10⁻⁹ près) : A, B, C sont alignés." : "Q n'est pas réel : A, B, C ne sont pas alignés."}</Message>
        </>
      );
    }
    if (mode === "orthogonalite") {
      if (Q === null) return <Message type="erreur">Quotient impossible : A et B sont confondus (zB − zA = 0).</Message>;
      if (confondus(A, C)) return <Message type="erreur">A et C sont confondus : le vecteur AC est nul, la question n&apos;a pas de sens.</Message>;
      return (
        <>
          <p>
            Pour A, B, C distincts, <Tex expr="AB \perp AC" /> si et seulement si <Tex expr="Q = \dfrac{z_C - z_A}{z_B - z_A}" /> est un <strong>imaginaire pur non nul</strong> (argument ±π/2).
          </p>
          <Tex bloc expr={`Q = ${texComplexe(Q)}`} />
          <Message type={orth ? "ok" : "info"}>{orth && estImaginairePur(Q) ? "Q est imaginaire pur non nul : AB ⟂ AC (angle droit en A)." : "Q n'est pas un imaginaire pur : l'angle en A n'est pas droit."}</Message>
        </>
      );
    }
    if (mode === "triangle") {
      const cote = (a: number) => texNombre(a);
      return (
        <>
          <p>Les critères sont des égalités de longueurs, vérifiées à la <strong>tolérance relative 10⁻⁹</strong> (jamais sur des valeurs arrondies à l&apos;écran) :</p>
          <ul className="list-disc pl-5">
            <li>
              isocèle : deux côtés égaux (<Tex expr={`AB = ${cote(AB)},\\ AC = ${cote(AC)},\\ BC = ${cote(BC)}`} />) ;
            </li>
            <li>
              rectangle : réciproque de Pythagore (<Tex expr={`AB^2 + AC^2 = ${cote(AB * AB + AC * AC)}`} /> à comparer à <Tex expr={`BC^2 = ${cote(BC * BC)}`} />, et les deux autres cas) ;
            </li>
            <li>équilatéral : les trois côtés sont égaux.</li>
          </ul>
        </>
      );
    }
    // cocyclicité
    return (
      <>
        <p>
          Pour A, B, C non alignés, D est sur leur cercle circonscrit si et seulement si le <strong>birapport</strong> <Tex expr="Q = \dfrac{(z_B - z_C)(z_A - z_D)}{(z_A - z_C)(z_B - z_D)}" /> est <strong>réel</strong>.
        </p>
        {coc.type === "points-confondus" && <Message type="erreur">Deux des points A, B, C sont confondus : il n&apos;y a pas de cercle circonscrit.</Message>}
        {coc.type === "abc-alignes" && (
          <Message type="info">
            A, B, C sont alignés : ils n&apos;ont <strong>pas de cercle circonscrit</strong>, donc on ne le construit pas. {coc.dSurLaDroite ? "Les quatre points sont alignés : le birapport est réel, mais cela ne signifie pas qu'ils sont cocycliques (ils sont simplement sur une même droite)." : "D n'est pas sur la droite (AB)."}
          </Message>
        )}
        {(coc.type === "cocycliques" || coc.type === "non-cocycliques") && (
          <>
            {bir ? <Tex bloc expr={`Q = ${texComplexe(bir)}`} /> : <p className="text-sm">D est confondu avec A, B ou C : il est évidemment sur le cercle (le birapport n&apos;est alors pas utilisé).</p>}
            <Message type={coc.type === "cocycliques" ? "ok" : "info"}>
              {coc.type === "cocycliques" ? "Q est réel (à la tolérance 10⁻⁹) : D est sur le cercle ABC, les quatre points sont cocycliques." : "Q n'est pas réel : D n'est pas sur le cercle circonscrit à ABC."}
            </Message>
            <p className="text-xs text-fh-ardoise/70">
              Centre Ω ≈ ({sep(coc.cercle.centre.re)} ; {sep(coc.cercle.centre.im)}), rayon R ≈ {sep(coc.cercle.rayon)}.
            </p>
          </>
        )}
      </>
    );
  })();

  const natLibelle = (() => {
    if (!nat.valide) return "ABC n'est pas un triangle (points confondus ou alignés)";
    const parts: string[] = [];
    if (nat.equilateral) parts.push("équilatéral");
    else if (nat.isocele) parts.push(`isocèle en ${nat.sommetsIsocele.join(", ")}`);
    if (nat.rectangle) parts.push(`rectangle en ${nat.sommetRectangle}`);
    return parts.length ? parts.join(" et ") : "quelconque";
  })();

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-rose-500 bg-rose-50">
        Les nombres complexes traduisent la géométrie : distances, angles, alignement, perpendicularité, cocyclicité. Déplace les points A, B, C (et D) : les points se placent sur une grille de pas 0,5, ce qui permet des tests exacts.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Mode">
          {MODES.map((m) => (
            <Pastille key={m.id} actif={mode === m.id} onClick={() => setMode(m.id)}>
              {m.libelle}
            </Pastille>
          ))}
        </div>
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
          <PlanSvg
            bornes={BORNES}
            points={points}
            aimant={0.5}
            etiquette="Plan de la géométrie complexe : A, B, C et D sont déplaçables"
            onDeplacer={deplacer}
            dessous={(o) => (
              <g>
                {mode === "alignement" && !confondus(A, B) && (
                  <line
                    x1={o.X(A.re - (B.re - A.re) * 20)}
                    y1={o.Y(A.im - (B.im - A.im) * 20)}
                    x2={o.X(A.re + (B.re - A.re) * 20)}
                    y2={o.Y(A.im + (B.im - A.im) * 20)}
                    stroke={al ? COULEURS.conjugue : COULEURS.gris}
                    strokeDasharray="6 4"
                    strokeWidth={1.6}
                  />
                )}
                {(mode === "distances" || mode === "angles" || mode === "triangle" || mode === "orthogonalite") && (
                  <polygon points={`${o.P(A)} ${o.P(B)} ${o.P(C)}`} fill={nat.valide ? COULEURS.z : "none"} fillOpacity={0.07} stroke={COULEURS.gris} strokeWidth={1.8} />
                )}
                {(mode === "alignement" || mode === "cocyclicite") && (
                  <>
                    <line x1={o.X(A.re)} y1={o.Y(A.im)} x2={o.X(B.re)} y2={o.Y(B.im)} stroke={COULEURS.gris} strokeWidth={1.8} />
                    <line x1={o.X(A.re)} y1={o.Y(A.im)} x2={o.X(C.re)} y2={o.Y(C.im)} stroke={COULEURS.gris} strokeWidth={1.8} />
                  </>
                )}
                {mode === "distances" &&
                  ([
                    ["AB", A, B],
                    ["AC", A, C],
                    ["BC", B, C],
                  ] as Array<[string, Cx, Cx]>).map(([nom, P, R]) => (
                    <text key={nom} x={o.X((P.re + R.re) / 2)} y={o.Y((P.im + R.im) / 2) - 6} textAnchor="middle" fontSize={12} fontWeight={700} fill={COULEURS.resultat} stroke="#fff" strokeWidth={3} paintOrder="stroke">
                      {nom} = {brut(distance(P, R), 2)}
                    </text>
                  ))}
                {mode === "angles" && angleC !== null && !confondus(C, A) && (
                  <Arc o={o} centre={C} rayon={0.9} a1={argument(sub(A, C)) as number} a2={(argument(sub(A, C)) as number) + angleC} couleur={COULEURS.resultat} epaisseur={3.5} />
                )}
                {mode === "orthogonalite" && orth && !confondus(A, B) && !confondus(A, C) && (() => {
                  const u = sub(B, A);
                  const v = sub(C, A);
                  const lu = modC(u);
                  const lv = modC(v);
                  const e = 0.6;
                  const p1 = cx(A.re + (u.re / lu) * e, A.im + (u.im / lu) * e);
                  const p3 = cx(A.re + (v.re / lv) * e, A.im + (v.im / lv) * e);
                  const p2 = cx(p1.re + (v.re / lv) * e, p1.im + (v.im / lv) * e);
                  return <polyline points={`${o.P(p1)} ${o.P(p2)} ${o.P(p3)}`} fill="none" stroke={COULEURS.conjugue} strokeWidth={2.5} />;
                })()}
                {mode === "cocyclicite" && cercle && (
                  <>
                    <circle cx={o.X(cercle.centre.re)} cy={o.Y(cercle.centre.im)} r={cercle.rayon * o.u} fill={coc.type === "cocycliques" ? COULEURS.conjugue : "none"} fillOpacity={0.06} stroke={coc.type === "cocycliques" ? COULEURS.conjugue : COULEURS.gris} strokeWidth={2} />
                    <circle cx={o.X(cercle.centre.re)} cy={o.Y(cercle.centre.im)} r={3} fill={COULEURS.gris} />
                    <text x={o.X(cercle.centre.re) + 6} y={o.Y(cercle.centre.im) + 14} fontSize={11} fill={COULEURS.gris}>
                      Ω
                    </text>
                  </>
                )}
              </g>
            )}
          />
          <div className="flex min-w-0 flex-col gap-2">
            <Valeur etiquette="Affixes">
              <Tex expr={`${aff("A", A)}\\ ;\\ ${aff("B", B)}\\ ;\\ ${aff("C", C)}${mode === "cocyclicite" ? `\\ ;\\ ${aff("D", D)}` : ""}`} />
            </Valeur>
            <Valeur etiquette="Longueurs">
              <Tex expr={`AB = ${sep(AB)}\\ ;\\ AC = ${sep(AC)}\\ ;\\ BC = ${sep(BC)}`} />
            </Valeur>
            {mode === "triangle" && (
              <>
                <Valeur etiquette="Nature de ABC">{natLibelle}</Valeur>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Triangles prédéfinis">
                  {PRESETS.map((p) => (
                    <Pastille key={p.id} onClick={() => { setA(p.A); setB(p.B); setC(p.C); }}>
                      {p.libelle}
                    </Pastille>
                  ))}
                </div>
              </>
            )}
            {mode === "alignement" && <Valeur etiquette="Alignés ?">{oui(al)}</Valeur>}
            {mode === "orthogonalite" && <Valeur etiquette="AB ⟂ AC ?">{oui(orth)}</Valeur>}
            {mode === "cocyclicite" && (
              <>
                <Valeur etiquette="D sur le cercle ABC ?">{coc.type === "cocycliques" ? "oui" : coc.type === "non-cocycliques" ? "non" : "pas de cercle"}</Valeur>
                {cercle && (
                  <Bouton
                    onClick={() => {
                      const t = Math.atan2(A.im - cercle.centre.im, A.re - cercle.centre.re) + Math.PI * 0.75;
                      setD(cx(cercle.centre.re + cercle.rayon * Math.cos(t), cercle.centre.im + cercle.rayon * Math.sin(t)));
                    }}
                  >
                    Placer D sur le cercle
                  </Bouton>
                )}
              </>
            )}
            <Bouton onClick={reinit}>
              <IconRefresh size={18} aria-hidden="true" />
              Réinitialiser
            </Bouton>
          </div>
        </div>
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-fh-ardoise" aria-live="polite">
          {explication}
        </div>
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={INSTANCES.length}
          rendu={(i) => {
            const it = INSTANCES[i];
            const nt = natureTriangle(it.A, it.B, it.C);
            const q = quotientAlignement(it.A, it.B, it.C) as Cx;
            const zz = div(sub(it.C, it.B), sub(it.C, it.A)) as Cx;
            const alig = alignes(it.A, it.B, it.C);
            const sur = cocyclicite(it.A, it.B, it.C, it.D).type === "cocycliques";
            const ouiNon = (bonne: boolean, pourquoi: ReactNode) => ({
              options: [
                { id: "oui", libelle: "Oui" },
                { id: "non", libelle: "Non" },
              ],
              bonne: bonne ? "oui" : "non",
              explications: { oui: pourquoi, non: pourquoi } as Record<string, ReactNode>,
            });
            const enonceDonnees = (
              <Message type="info">
                <Tex expr={`${aff("A", it.A)}\\ ;\\ ${aff("B", it.B)}\\ ;\\ ${aff("C", it.C)}${i === 2 ? `\\ ;\\ ${aff("D", it.D)}` : ""}`} />
              </Message>
            );
            if (i === 0) {
              const c1 = ouiNon(nt.rectangle, <>Compare <Tex expr={`AB^2 + AC^2 = ${sep(distance(it.A, it.B) ** 2 + distance(it.A, it.C) ** 2)}`} /> et <Tex expr={`BC^2 = ${sep(distance(it.B, it.C) ** 2)}`} /> : réciproque de Pythagore.</>);
              const c2 = ouiNon(alig === true, <>Q = (zC − zA)/(zB − zA) = <Tex expr={texComplexe(q)} /> n&apos;est pas réel : les points ne sont pas alignés.</>);
              return (
                <>
                  {enonceDonnees}
                  <QuestionTexte
                    numero={1}
                    enonce={<>Calcule la longueur <Tex expr="BC = |z_C - z_B|" />.</>}
                    placeholder="ex. 5 ou √13"
                    verifier={(t) => {
                      const l = lireReel(t);
                      if (!l.ok) return { ok: false, message: l.erreur };
                      return reponseEgale(l.valeur, distance(it.B, it.C)) ? { ok: true, message: <>Exact : BC = {sep(distance(it.B, it.C))}.</> } : { ok: false, message: <>Calcule <Tex expr="|z_C - z_B|" /> = module de la différence.</> };
                    }}
                    indices={[<>zC − zB = <Tex expr={texComplexe(sub(it.C, it.B))} />.</>]}
                    correction={<Tex bloc expr={`BC = |${texComplexe(sub(it.C, it.B))}| = \\sqrt{${texReel(sub(it.C, it.B).re)}^2 + ${texReel(sub(it.C, it.B).im)}^2} = ${sep(distance(it.B, it.C))}`} />}
                  />
                  <QuestionChoix numero={2} enonce={<>Le triangle ABC est-il rectangle ?</>} {...c1} indices={[<>Utilise la réciproque du théorème de Pythagore, ou le quotient Q.</>]} correction={<>Oui : <Tex expr={`AB^2 + AC^2 = BC^2`} /> ({sep(distance(it.A, it.B) ** 2)} + {sep(distance(it.A, it.C) ** 2)} = {sep(distance(it.B, it.C) ** 2)}) : angle droit en A.</>} />
                  <QuestionChoix numero={3} enonce={<>Les points A, B, C sont-ils alignés ?</>} {...c2} indices={[<>Calcule Q = (zC − zA)/(zB − zA) et regarde s&apos;il est réel.</>]} correction={<>Q = <Tex expr={texComplexe(q)} /> n&apos;est pas réel : non alignés.</>} />
                </>
              );
            }
            if (i === 1) {
              const c = ouiNon(alig === true, <>Q = <Tex expr={texComplexe(q)} /> est réel : les vecteurs AB et AC sont colinéaires, les points sont alignés.</>);
              return (
                <>
                  {enonceDonnees}
                  <QuestionTexte
                    numero={1}
                    enonce={<>Calcule <Tex expr="Q = \dfrac{z_C - z_A}{z_B - z_A}" />.</>}
                    placeholder="ex. 3 ou 1 + 2i"
                    verifier={(t) => {
                      const l = lireComplexe(t);
                      if (!l.ok) return { ok: false, message: l.erreur };
                      return reponseEgale(l.valeur.re, q.re) && reponseEgale(l.valeur.im, q.im) ? { ok: true, message: <>Exact : <Tex expr={`Q = ${texComplexe(q)}`} />.</> } : { ok: false, message: <>Divise (zC − zA) par (zB − zA) en multipliant par le conjugué.</> };
                    }}
                    indices={[<>zC − zA = <Tex expr={texComplexe(sub(it.C, it.A))} /> et zB − zA = <Tex expr={texComplexe(sub(it.B, it.A))} />.</>]}
                    correction={<Tex bloc expr={`Q = \\dfrac{${texComplexe(sub(it.C, it.A))}}{${texComplexe(sub(it.B, it.A))}} = ${texComplexe(q)}`} />}
                  />
                  <QuestionChoix numero={2} enonce={<>A, B, C sont-ils alignés ?</>} {...c} indices={[<>Q réel ⇔ points alignés.</>]} correction={<>Q = {texNombre(q.re).replace("{,}", ",")} est réel : alignés.</>} />
                  <QuestionTexte
                    numero={3}
                    enonce={<>Quelle est la longueur AB ?</>}
                    placeholder="ex. √5 ou 2,236"
                    verifier={(t) => {
                      const l = lireReel(t);
                      if (!l.ok) return { ok: false, message: l.erreur };
                      return reponseEgale(l.valeur, distance(it.A, it.B)) ? { ok: true, message: <>Exact : AB = {sep(distance(it.A, it.B))}.</> } : { ok: false, message: <>AB = |zB − zA|.</> };
                    }}
                    indices={[<>zB − zA = <Tex expr={texComplexe(sub(it.B, it.A))} />.</>]}
                    correction={<Tex bloc expr={`AB = |${texComplexe(sub(it.B, it.A))}| = ${texReel(distance(it.A, it.B))}`} />}
                  />
                </>
              );
            }
            const c = ouiNon(sur, <>Les points A, B, C sont sur le cercle de centre O et de rayon 1, et D(0 ; −1) aussi : le birapport est réel, D est sur le cercle.</>);
            return (
              <>
                {enonceDonnees}
                <QuestionTexte
                  numero={1}
                  enonce={<>Calcule <Tex expr="Z = \dfrac{z_C - z_B}{z_C - z_A}" />.</>}
                  placeholder="ex. i ou 1 + i"
                  verifier={(t) => {
                    const l = lireComplexe(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    return reponseEgale(l.valeur.re, zz.re) && reponseEgale(l.valeur.im, zz.im) ? { ok: true, message: <>Exact : <Tex expr={`Z = ${texComplexe(zz)}`} />.</> } : { ok: false, message: <>Calcule zC − zB et zC − zA, puis divise.</> };
                  }}
                  indices={[<>zC − zB = <Tex expr={texComplexe(sub(it.C, it.B))} />, zC − zA = <Tex expr={texComplexe(sub(it.C, it.A))} />.</>]}
                  correction={<Tex bloc expr={`Z = \\dfrac{${texComplexe(sub(it.C, it.B))}}{${texComplexe(sub(it.C, it.A))}} = ${texComplexe(zz)}`} />}
                />
                <QuestionChoix
                  numero={2}
                  enonce={<>Le triangle ABC est-il rectangle ?</>}
                  {...ouiNon(nt.rectangle, <>Z = <Tex expr={texComplexe(zz)} /> est imaginaire pur, de module {sep(modC(zz))} : l&apos;angle (CA ; CB) vaut {texDegres(argument(zz) as number).replace("^\\circ", "°")} et CA = CB.</>)}
                  indices={[<>Si Z est imaginaire pur, l&apos;angle en C est droit.</>]}
                  correction={<>Oui : rectangle (et isocèle) en C, car <Tex expr={`|Z| = 1`} /> et <Tex expr={`\\arg Z = \\dfrac{\\pi}{2}`} />.</>}
                />
                <QuestionChoix numero={3} enonce={<>Le point D est-il sur le cercle circonscrit à ABC ?</>} {...c} indices={[<>Cherche le centre et le rayon du cercle passant par A, B, C : ici, tous les trois sont à distance 1 de O.</>]} correction={<>Oui : OD = 1 = R.</>} />
              </>
            );
          }}
        />
      </Zone>

      <Conclusion>
        AB = |z_B − z_A|. Pour Z = (z_C − z_B)/(z_C − z_A) : |Z| = BC/AC et arg Z = (CA ; CB). Trois points distincts sont alignés ⇔ Q = (z_C − z_A)/(z_B − z_A) est réel ; AB ⟂ AC ⇔ Q est imaginaire pur non nul. Quatre points A, B, C, D non alignés trois à trois sont cocycliques ⇔ leur birapport est réel.
      </Conclusion>
    </div>
  );
}

