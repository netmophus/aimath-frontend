"use client";

import { useState } from "react";

import {
  ATWOOD_DEFAUT,
  accelerationAtwood,
  deg,
  descenteS1,
  dureeAtwood,
  rotationPoulie,
  sensAtwood,
  tensionAtwood,
  vitesseDescenteS1,
  type ParamsAtwood,
} from "@/lib/dynamique";
import { questionsAtwood } from "@/lib/dynamiqueExercices";
import { Alerte, BarreEchelle, BarreLecture, CD, Cadre, Curseur, Interrupteur, Legende, OPTIONS_DEFAUT, Tex, Valeur, Vecteur, elargir, fmt, useHorloge, type OptionsAffichage } from "./ui";

const SCENARIOS: Array<{ id: string; libelle: string; params: Partial<ParamsAtwood> }> = [
  { id: "exemple", libelle: "Exemple du cours", params: { m1: 0.5, m2: 0.3, g: 9.8 } },
  { id: "egales", libelle: "Masses égales", params: { m1: 0.4, m2: 0.4, g: 9.8 } },
  { id: "inversees", libelle: "Masses inversées", params: { m1: 0.3, m2: 0.5, g: 9.8 } },
];

const W = 440;
const H = 340;
const C = { x: 220, y: 66 };
const RP = 34; // rayon de la poulie à l'écran (px)
const L0 = 100; // longueur initiale des brins (px)
const COURSE_PX = 88; // déplacement à l'écran pour la course maximale

function Masse({ x, top, taille, nom, masse }: { x: number; top: number; taille: number; nom: string; masse: number }) {
  return (
    <g>
      <rect x={x - taille / 2} y={top} width={taille} height={taille} rx={5} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
      <text x={x} y={top + taille / 2 - 2} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
        {nom}
      </text>
      <text x={x} y={top + taille / 2 + 15} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff">
        {fmt(masse, 2)} kg
      </text>
    </g>
  );
}

function Scene({ p, t, o, duree }: { p: ParamsAtwood; t: number; o: OptionsAffichage; duree: number }) {
  const a = accelerationAtwood(p);
  const T = tensionAtwood(p);
  const pxParM = COURSE_PX / p.course;
  const d = descenteS1(p, t) * pxParM; // px, positif quand S1 descend
  const Rm = p.course * (RP / COURSE_PX); // rayon physique cohérent avec le dessin
  const phi = rotationPoulie(p, t, Rm);
  const mmax = Math.max(p.m1, p.m2);
  const taille = (m: number) => 50 + 16 * (m / mmax);
  const x1 = C.x - RP;
  const x2 = C.x + RP;
  const top1 = C.y + L0 + d;
  const top2 = C.y + L0 - d;
  const s1 = taille(p.m1);
  const s2 = taille(p.m2);
  const c1 = top1 + s1 / 2;
  const c2 = top2 + s2 / 2;
  const kF = 120 / (p.g * Math.max(2, p.m1, p.m2));
  const kA = 60 / p.g;
  const vFin = Math.max(Math.abs(vitesseDescenteS1(p, duree)), 0.5);
  const kV = 60 / vFin;
  const v = vitesseDescenteS1(p, t); // algébrique, positive si S1 descend
  const P1 = p.m1 * p.g;
  const P2 = p.m2 * p.g;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Machine d'Atwood : S1 de ${fmt(p.m1, 3)} kg, S2 de ${fmt(p.m2, 3)} kg, accélération algébrique ${fmt(a, 2)} m/s², à t = ${fmt(t)} s`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={14} y={26} fontSize={16} fontWeight={700} fill={CD.profond}>
        t = {fmt(t)} s
      </text>
      <line x1={C.x - 20} y1={14} x2={C.x - 20} y2={C.y - RP - 4} stroke="#334155" strokeWidth={0} />
      <rect x={C.x - 36} y={8} width={72} height={8} rx={3} fill="#475569" />
      <line x1={C.x} y1={16} x2={C.x} y2={C.y} stroke="#475569" strokeWidth={4} />
      <line x1={14} y1={H - 12} x2={W - 14} y2={H - 12} stroke="#334155" strokeWidth={2.5} />
      {/* fil : deux brins verticaux + arc sur la poulie */}
      <line x1={x1} y1={C.y} x2={x1} y2={top1} stroke="#334155" strokeWidth={2.2} />
      <line x1={x2} y1={C.y} x2={x2} y2={top2} stroke="#334155" strokeWidth={2.2} />
      {/* poulie */}
      <g transform={`rotate(${(-deg(phi)).toFixed(2)} ${C.x} ${C.y})`}>
        <circle cx={C.x} cy={C.y} r={RP} fill="#e2e8f0" stroke="#334155" strokeWidth={2.5} />
        <line x1={C.x - RP + 5} y1={C.y} x2={C.x + RP - 5} y2={C.y} stroke="#64748b" strokeWidth={2} />
        <line x1={C.x} y1={C.y - RP + 5} x2={C.x} y2={C.y + RP - 5} stroke="#64748b" strokeWidth={2} />
        <circle data-repere-poulie cx={C.x + RP - 7} cy={C.y} r={4.5} fill={CD.alerte} />
      </g>
      <path d={`M ${x1} ${C.y} A ${RP} ${RP} 0 0 1 ${x2} ${C.y}`} fill="none" stroke="#334155" strokeWidth={2.2} />
      <circle cx={C.x} cy={C.y} r={4} fill="#334155" />
      <Masse x={x1} top={top1} taille={s1} nom="S₁" masse={p.m1} />
      <Masse x={x2} top={top2} taille={s2} nom="S₂" masse={p.m2} />
      {o.forces && (
        <g>
          <Vecteur x={x1 + 12} y={c1} dx={0} dy={P1 * kF} couleur={CD.poids} symbole="P₁" />
          <Vecteur x={x1 - 12} y={c1} dx={0} dy={-T * kF} couleur={CD.tension} symbole="T₁" />
          <Vecteur x={x2 + 12} y={c2} dx={0} dy={P2 * kF} couleur={CD.poids} symbole="P₂" />
          <Vecteur x={x2 - 12} y={c2} dx={0} dy={-T * kF} couleur={CD.tension} symbole="T₂" />
        </g>
      )}
      {o.acceleration && (
        <g>
          <Vecteur x={x1 - s1 / 2 - 34} y={c1} dx={0} dy={a * kA} couleur={CD.acceleration} symbole="a₁" />
          <Vecteur x={x2 + s2 / 2 + 34} y={c2} dx={0} dy={-a * kA} couleur={CD.acceleration} symbole="a₂" />
        </g>
      )}
      {o.vitesse && (
        <g>
          <Vecteur x={x1 - s1 / 2 - 62} y={c1} dx={0} dy={v * kV} couleur={CD.vitesse} symbole="v₁" />
          <Vecteur x={x2 + s2 / 2 + 62} y={c2} dx={0} dy={-v * kV} couleur={CD.vitesse} symbole="v₂" />
        </g>
      )}
      {o.forces && <BarreEchelle x={120} y={H - 38} k={kF} unite="N" couleur={CD.poids} libelle="Forces" />}
      {o.acceleration && <BarreEchelle x={120} y={H - 16} k={kA} unite="m/s²" couleur={CD.acceleration} libelle="Accél." />}
    </svg>
  );
}

export default function MachineAtwood({ initial = ATWOOD_DEFAUT }: { initial?: ParamsAtwood }) {
  const [p, setP] = useState<ParamsAtwood>(initial);
  const [scen, setScen] = useState<string | null>(null);
  const [o, setO] = useState<OptionsAffichage>({ ...OPTIONS_DEFAUT, composantes: false });
  const duree = dureeAtwood(p);
  const h = useHorloge(duree);
  const t = h.t;
  const maj = (m: Partial<ParamsAtwood>) => {
    setP((q) => ({ ...q, ...m }));
    setScen(null);
    h.arreter();
  };
  const choisir = (id: string) => {
    const s = SCENARIOS.find((x) => x.id === id);
    if (!s) return;
    setP((q) => ({ ...q, ...s.params }));
    setScen(id);
    h.arreter();
  };
  const reprendre = () => {
    setP(initial);
    setScen(null);
    h.arreter();
  };
  const bascule = (k: keyof OptionsAffichage) => (v: boolean) => setO((x) => ({ ...x, [k]: v }));

  const a = accelerationAtwood(p);
  const T = tensionAtwood(p);
  const sens = sensAtwood(p);
  const Rm = p.course * (34 / 88);
  const phi = rotationPoulie(p, t, Rm);
  const descente = descenteS1(p, t);
  const v = vitesseDescenteS1(p, t);
  const P1 = p.m1 * p.g;
  const P2 = p.m2 * p.g;
  const texteSens = sens === "equilibre" ? "Masses égales : le système reste immobile." : sens === "S1 descend" ? "S₁ descend, S₂ monte." : "S₁ monte, S₂ descend.";

  const etapes = [
    { titre: "Système", contenu: <p>On étudie séparément chaque masse : S₁ (m₁ = {fmt(p.m1, 3)} kg) puis S₂ (m₂ = {fmt(p.m2, 3)} kg). Le fil est inextensible et de masse négligeable, la poulie sans inertie ni frottement.</p> },
    { titre: "Référentiel", contenu: <p>Référentiel terrestre, galiléen. Axe vertical commun orienté vers le bas pour S₁ ; fil inextensible : S₁ et S₂ ont des accélérations de même valeur et de sens opposés. On note a l&apos;accélération algébrique de S₁ (a &gt; 0 quand S₁ descend).</p> },
    { titre: "Bilan des forces", contenu: <p>Sur chaque masse : le poids <b style={{ color: CD.poids }}>P</b> (vers le bas) et la tension <b style={{ color: CD.tension }}>T</b> du fil (vers le haut). Même tension des deux côtés (poulie idéale).</p> },
    { titre: "Théorème du centre d'inertie", contenu: <Tex bloc expr={String.raw`\vec P_i + \vec T_i = m_i\,\vec a_i \quad (i = 1, 2)`} /> },
    {
      titre: "Projections (deux équations côte à côte)",
      contenu: (
        <div className="grid min-w-0 gap-2 @sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-[#EFF6FF] px-2">
            <p className="text-xs font-bold text-[#102A66]">S₁ (axe vers le bas)</p>
            <Tex bloc expr={String.raw`m_1 g - T = m_1\,a`} />
          </div>
          <div className="min-w-0 rounded-lg bg-[#EFF6FF] px-2">
            <p className="text-xs font-bold text-[#102A66]">S₂ (axe vers le haut)</p>
            <Tex bloc expr={String.raw`T - m_2 g = m_2\,a`} />
          </div>
        </div>
      ),
    },
    {
      titre: "Résolution littérale",
      contenu: (
        <>
          <p>On additionne les deux équations : T disparaît.</p>
          <Tex bloc expr={String.raw`(m_1 - m_2)\,g = (m_1 + m_2)\,a \;\Rightarrow\; a = \dfrac{(m_1 - m_2)\,g}{m_1 + m_2}`} />
          <Tex bloc expr={String.raw`T = m_1 (g - a) = \dfrac{2\,m_1 m_2\,g}{m_1 + m_2}`} />
        </>
      ),
    },
    {
      titre: "Application numérique",
      contenu: (
        <>
          <Tex bloc expr={String.raw`a = \dfrac{(${fmt(p.m1, 3)} - ${fmt(p.m2, 3)}) \times ${fmt(p.g, 2)}}{${fmt(p.m1, 3)} + ${fmt(p.m2, 3)}} = ${fmt(a, 3)}\ \text{m/s}^2`} />
          <Tex bloc expr={String.raw`T = \dfrac{2 \times ${fmt(p.m1, 3)} \times ${fmt(p.m2, 3)} \times ${fmt(p.g, 2)}}{${fmt(p.m1, 3)} + ${fmt(p.m2, 3)}} = ${fmt(T, 3)}\ \text{N}`} />
        </>
      ),
    },
    {
      titre: "Interprétation",
      contenu: (
        <p>
          {texteSens} Le signe de a donne le sens : a {a > 0 ? "> 0" : a < 0 ? "< 0" : "= 0"}. La tension ({fmt(T, 3)} N) est comprise entre P₂ = {fmt(P2, 3)} N et P₁ = {fmt(P1, 3)} N (elle est inférieure au poids de la masse qui descend).
        </p>
      ),
    },
  ];

  const b1 = elargir(p.m1, 0.05, 2);
  const b2 = elargir(p.m2, 0.05, 2);
  const bg = elargir(p.g, 1, 20);
  const bc = elargir(p.course, 0.2, 1.5);

  return (
    <Cadre
      titre="Machine d'Atwood"
      scene={
        <>
          <Scene p={p} t={t} o={o} duree={duree} />
          <Legende
            elements={[
              { symbole: "P", libelle: "poids", couleur: CD.poids },
              { symbole: "T", libelle: "tension du fil", couleur: CD.tension },
              { symbole: "a", libelle: "accélération", couleur: CD.acceleration },
              { symbole: "v", libelle: "vitesse", couleur: CD.vitesse },
            ]}
          />
        </>
      }
      commandes={<BarreLecture h={h} duree={duree} onReinitialiser={reprendre} />}
      scenarios={SCENARIOS.map(({ id, libelle }) => ({ id, libelle }))}
      scenarioActif={scen}
      onScenario={choisir}
      onReprendre={reprendre}
      alerte={sens === "equilibre" ? <Alerte ton="info">m₁ = m₂ : la résultante motrice est nulle, les masses restent immobiles (a = 0, T = mg).</Alerte> : undefined}
      principe={<p className="text-sm text-fh-ardoise">La différence des poids met le système en mouvement. Quand S₁ descend de 10 cm, S₂ monte de 10 cm et la poulie tourne d&apos;autant de fil. La tension est la même des deux côtés.</p>}
      parametres={
        <>
          <Curseur etiquette="Masse m₁ (S₁)" valeur={p.m1} min={b1.min} max={b1.max} pas={0.05} decimales={3} onChange={(v) => maj({ m1: v })} unite="kg" />
          <Curseur etiquette="Masse m₂ (S₂)" valeur={p.m2} min={b2.min} max={b2.max} pas={0.05} decimales={3} onChange={(v) => maj({ m2: v })} unite="kg" />
          <Curseur etiquette="Gravité g" valeur={p.g} min={bg.min} max={bg.max} pas={0.1} onChange={(v) => maj({ g: v })} unite="m/s²" />
          <Curseur etiquette="Course disponible" valeur={p.course} min={bc.min} max={bc.max} pas={0.1} onChange={(v) => maj({ course: v })} unite="m" />
          <p className="text-xs text-fh-ardoise/80">Vitesse initiale : nulle (le système part du repos).</p>
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Forces" coche={o.forces} onChange={bascule("forces")} />
          <Interrupteur etiquette="Vitesses" coche={o.vitesse} onChange={bascule("vitesse")} />
          <Interrupteur etiquette="Accélérations" coche={o.acceleration} onChange={bascule("acceleration")} />
        </>
      }
      resultats={
        <>
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="Accélération algébrique a">{fmt(a, 3)} m/s²</Valeur>
            <Valeur etiquette="Norme |a|">{fmt(Math.abs(a), 3)} m/s²</Valeur>
            <Valeur etiquette="Tension T">{fmt(T, 3)} N</Valeur>
            <Valeur etiquette="Poids P₁ ; P₂">{fmt(P1, 3)} N ; {fmt(P2, 3)} N</Valeur>
            <Valeur etiquette="Vitesse de S₁ (↓ positive)">{fmt(v, 3)} m/s</Valeur>
            <Valeur etiquette="Déplacement de S₁ (↓)">{fmt(descente, 3)} m</Valeur>
            <Valeur etiquette="Déplacement de S₂ (↑)">{fmt(descente, 3)} m</Valeur>
            <Valeur etiquette="Rotation de la poulie">{fmt(phi, 2)} rad</Valeur>
          </div>
          <p className="text-xs text-fh-ardoise">{texteSens}</p>
        </>
      }
      etapes={etapes}
      questions={questionsAtwood(p)}
    />
  );
}
