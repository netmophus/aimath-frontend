"use client";

import { useState } from "react";

import {
  MONTE_DEFAUT,
  cableTendu,
  compareTension,
  dureeMonte,
  poidsMonte,
  situationMonte,
  tensionCable,
  vMonte,
  yMonte,
  type ParamsMonteCharge,
} from "@/lib/dynamique";
import { questionsMonte } from "@/lib/dynamiqueExercices";
import { Alerte, BarreEchelle, BarreLecture, CD, Cadre, Curseur, Graphique, Interrupteur, Legende, OPTIONS_DEFAUT, Tex, Valeur, Vecteur, elargir, fmt, useHorloge, type OptionsAffichage } from "./ui";

const SCENARIOS: Array<{ id: string; libelle: string; params: Partial<ParamsMonteCharge> }> = [
  { id: "exemple", libelle: "Montée accélérée", params: { m: 500, g: 10, a: 1, v0: 0, hauteur: 20 } },
  { id: "montee-ralentie", libelle: "Montée ralentie", params: { m: 500, g: 10, a: -1.5, v0: 4, hauteur: 20 } },
  { id: "descente-acc", libelle: "Descente accélérée", params: { m: 500, g: 10, a: -2, v0: 0, hauteur: 20 } },
  { id: "descente-ral", libelle: "Descente ralentie", params: { m: 500, g: 10, a: 1.5, v0: -4, hauteur: 20 } },
  { id: "constante", libelle: "Vitesse constante", params: { m: 500, g: 10, a: 0, v0: 2, hauteur: 20 } },
  { id: "immobile", libelle: "Immobile", params: { m: 500, g: 10, a: 0, v0: 0, hauteur: 20 } },
];

const W = 440;
const H = 330;
const HAUT = 20;
const BASPX = 306;
const CABINE = 46;

function Scene({ p, t, o, valide, vmax }: { p: ParamsMonteCharge; t: number; o: OptionsAffichage; valide: boolean; vmax: number }) {
  const tt = valide ? t : 0;
  const y = Math.min(p.hauteur, Math.max(0, yMonte(p, tt)));
  const v = valide ? vMonte(p, tt) : p.v0;
  const bas = BASPX - (y / p.hauteur) * (BASPX - HAUT - CABINE);
  const haut = bas - CABINE;
  const cx = 215;
  const cy = haut + CABINE / 2;
  const P = poidsMonte(p);
  const T = tensionCable(p);
  const kF = 150 / Math.max(2 * P, T);
  const kA = 70 / Math.max(10, Math.abs(p.a));
  const kV = 70 / Math.max(vmax, 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Monte-charge à ${fmt(y, 1)} m de hauteur, vitesse ${fmt(v, 2)} m/s, accélération ${fmt(p.a, 2)} m/s²`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={14} y={26} fontSize={16} fontWeight={700} fill={CD.profond}>
        t = {fmt(tt)} s
      </text>
      <rect x={165} y={HAUT} width={100} height={BASPX - HAUT} fill="#eef2f9" stroke="#334155" strokeWidth={2} />
      <rect x={150} y={HAUT - 10} width={130} height={10} rx={3} fill="#475569" />
      <line x1={14} y1={BASPX} x2={W - 14} y2={BASPX} stroke="#334155" strokeWidth={2.5} />
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={265} y1={BASPX - f * (BASPX - HAUT - CABINE) - CABINE / 2 + CABINE / 2 - 0} x2={272} y2={BASPX - f * (BASPX - HAUT - CABINE)} stroke="#334155" strokeWidth={1.2} />
        </g>
      ))}
      {o.axes && (
        <g>
          <line x1={400} y1={BASPX} x2={400} y2={BASPX - 70} stroke={CD.gris} strokeWidth={2} />
          <polygon points={`400,${BASPX - 78} 395,${BASPX - 66} 405,${BASPX - 66}`} fill={CD.gris} />
          <text x={408} y={BASPX - 62} fontSize={14} fontWeight={700} fill={CD.gris}>
            z
          </text>
        </g>
      )}
      {valide && <line x1={cx} y1={HAUT} x2={cx} y2={haut} stroke="#334155" strokeWidth={3} />}
      <rect x={cx - 38} y={haut} width={76} height={CABINE} rx={5} fill={valide ? "#3b82f6" : "#94a3b8"} stroke="#fff" strokeWidth={2.4} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">
        {fmt(p.m, 0)} kg
      </text>
      {o.forces && (
        <g>
          <Vecteur x={cx + 14} y={cy} dx={0} dy={P * kF} couleur={CD.poids} symbole="P" />
          {valide && <Vecteur x={cx - 14} y={cy} dx={0} dy={-T * kF} couleur={CD.tension} symbole="T" />}
        </g>
      )}
      {o.acceleration && valide && <Vecteur x={cx - 62} y={cy} dx={0} dy={-p.a * kA} couleur={CD.acceleration} symbole="a" />}
      {o.vitesse && valide && <Vecteur x={cx + 62} y={cy} dx={0} dy={-v * kV} couleur={CD.vitesse} symbole="v" />}
      {o.forces && <BarreEchelle x={14} y={H - 40} k={kF} unite="N" couleur={CD.poids} libelle="Forces" />}
      {o.acceleration && valide && <BarreEchelle x={14} y={H - 16} k={kA} unite="m/s²" couleur={CD.acceleration} libelle="Accélération" />}
    </svg>
  );
}

export default function MonteCharge({ initial = MONTE_DEFAUT }: { initial?: ParamsMonteCharge }) {
  const [p, setP] = useState<ParamsMonteCharge>(initial);
  const [scen, setScen] = useState<string | null>(null);
  const [o, setO] = useState<OptionsAffichage>({ ...OPTIONS_DEFAUT, composantes: false });
  const valide = cableTendu(p);
  const duree = valide ? dureeMonte(p) : 4;
  const h = useHorloge(duree);
  const t = valide ? h.t : 0;
  const maj = (m: Partial<ParamsMonteCharge>) => {
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

  const P = poidsMonte(p);
  const T = tensionCable(p);
  const v = vMonte(p, t);
  const y = Math.min(p.hauteur, Math.max(0, yMonte(p, t)));
  const vmax = Math.max(Math.abs(p.v0), Math.abs(vMonte(p, duree)));
  const sit = situationMonte(v, p.a);
  const cmp = compareTension(p);

  const etapes = [
    { titre: "Système", contenu: <p>La cabine et sa charge, de masse m = {fmt(p.m, 1)} kg, assimilées à leur centre d&apos;inertie G.</p> },
    { titre: "Référentiel", contenu: <p>Référentiel terrestre, galiléen. Axe vertical Oz orienté vers le haut : v et a sont des grandeurs algébriques sur cet axe.</p> },
    { titre: "Bilan des forces", contenu: <p>Le poids <b style={{ color: CD.poids }}>P</b> (vers le bas, norme mg) et la tension <b style={{ color: CD.tension }}>T</b> du câble (vers le haut).</p> },
    { titre: "Théorème du centre d'inertie", contenu: <Tex bloc expr={String.raw`\vec P + \vec T = m\,\vec a_G`} /> },
    { titre: "Projection sur Oz", contenu: <Tex bloc expr={String.raw`T - mg = m\,a`} /> },
    { titre: "Résolution littérale", contenu: <Tex bloc expr={String.raw`T = m\,(g + a)`} /> },
    {
      titre: "Application numérique",
      contenu: valide ? <Tex bloc expr={String.raw`T = ${fmt(p.m, 1)} \times (${fmt(p.g, 2)} ${p.a < 0 ? "-" : "+"} ${fmt(Math.abs(p.a), 2)}) = ${fmt(T, 1)}\ \text{N} \quad (mg = ${fmt(P, 1)}\ \text{N})`} /> : <p>T = m(g + a) = {fmt(T, 1)} N ≤ 0 : câble détendu, pas de résultat physique.</p>,
    },
    {
      titre: "Interprétation",
      contenu: (
        <p>
          {cmp === "T > P" ? "a > 0 : l'accélération est dirigée vers le haut et T > mg." : cmp === "T = P" ? "a = 0 : la vitesse est constante (ou nulle) et T = mg." : "−g < a < 0 : l'accélération est dirigée vers le bas et 0 < T < mg."} Le signe de v dit si la cabine monte ou descend, celui de a dit où pointe l&apos;accélération : une cabine peut monter en ralentissant (v &gt; 0, a &lt; 0). Un câble ne peut que tirer : T &gt; 0 impose a &gt; −g.
        </p>
      ),
    },
  ];

  const bm = elargir(p.m, 100, 2000);
  const bg = elargir(p.g, 1, 20);
  const ba = elargir(p.a, -15, 10);
  const bh = elargir(p.hauteur, 10, 60);
  const bv = elargir(p.v0, -10, 10);

  return (
    <Cadre
      titre="Monte-charge"
      scene={
        <>
          <Scene p={p} t={t} o={o} valide={valide} vmax={vmax} />
          <Legende
            elements={[
              { symbole: "P", libelle: "poids", couleur: CD.poids },
              { symbole: "T", libelle: "tension du câble", couleur: CD.tension },
              { symbole: "a", libelle: "accélération", couleur: CD.acceleration },
              { symbole: "v", libelle: "vitesse", couleur: CD.vitesse },
            ]}
          />
          {valide && (
            <div className="grid min-w-0 gap-3">
              <Graphique compact titre="Hauteur" unite="z (m)" series={[{ f: (s) => Math.min(p.hauteur, Math.max(0, yMonte(p, s))), couleur: CD.vitesse, libelle: "z(t)" }]} duree={duree} t={t} onT={(s) => { h.pause(); h.setT(s); }} />
              <Graphique compact titre="Vitesse algébrique" unite="v (m/s)" series={[{ f: (s) => vMonte(p, s), couleur: CD.acceleration, libelle: "v(t)" }]} duree={duree} t={t} onT={(s) => { h.pause(); h.setT(s); }} />
            </div>
          )}
        </>
      }
      commandes={<BarreLecture h={h} duree={duree} onReinitialiser={reprendre} />}
      scenarios={SCENARIOS.map(({ id, libelle }) => ({ id, libelle }))}
      scenarioActif={scen}
      onScenario={choisir}
      onReprendre={reprendre}
      alerte={!valide ? <Alerte>Avec a = {fmt(p.a, 2)} m/s² ≤ −g = {fmt(-p.g, 2)} m/s², la tension T = m(g + a) = {fmt(T, 1)} N serait nulle ou négative : le câble se détend, le modèle du câble tendu ne s&apos;applique plus. Choisis a &gt; −g.</Alerte> : undefined}
      principe={<p className="text-sm text-fh-ardoise">Le sens du mouvement (signe de v) et le sens de l&apos;accélération (signe de a) sont indépendants. Le théorème donne T = m(g + a) : T dépend de a, jamais de v.</p>}
      parametres={
        <>
          <Curseur etiquette="Masse m" valeur={p.m} min={bm.min} max={bm.max} pas={50} decimales={0} onChange={(v) => maj({ m: v })} unite="kg" />
          <Curseur etiquette="Gravité g" valeur={p.g} min={bg.min} max={bg.max} pas={0.5} onChange={(v) => maj({ g: v })} unite="m/s²" />
          <Curseur etiquette="Accélération imposée a" valeur={p.a} min={ba.min} max={ba.max} pas={0.5} onChange={(v) => maj({ a: v })} unite="m/s²" />
          <Curseur etiquette="Vitesse initiale v₀ (↑ positive)" valeur={p.v0} min={bv.min} max={bv.max} pas={0.5} onChange={(v) => maj({ v0: v })} unite="m/s" />
          <Curseur etiquette="Hauteur de la gaine" valeur={p.hauteur} min={bh.min} max={bh.max} pas={1} decimales={0} onChange={(v) => maj({ hauteur: v })} unite="m" />
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Forces" coche={o.forces} onChange={bascule("forces")} />
          <Interrupteur etiquette="Vitesse" coche={o.vitesse} onChange={bascule("vitesse")} />
          <Interrupteur etiquette="Accélération" coche={o.acceleration} onChange={bascule("acceleration")} />
          <Interrupteur etiquette="Axe" coche={o.axes} onChange={bascule("axes")} />
        </>
      }
      resultats={
        valide ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Valeur etiquette="Tension T = m(g + a)">{fmt(T, 1)} N</Valeur>
              <Valeur etiquette="Poids P = mg">{fmt(P, 1)} N</Valeur>
              <Valeur etiquette="Comparaison">{cmp}</Valeur>
              <Valeur etiquette="Accélération a">{fmt(p.a, 2)} m/s²</Valeur>
              <Valeur etiquette="Vitesse v(t)">{fmt(v, 2)} m/s</Valeur>
              <Valeur etiquette="Hauteur z(t)">{fmt(y, 2)} m</Valeur>
            </div>
            <p className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#102A66]">
              À cet instant : {sit}.
            </p>
          </>
        ) : (
          <p className="text-sm text-fh-ardoise">Aucun résultat : câble détendu.</p>
        )
      }
      etapes={etapes}
      questions={valide ? questionsMonte(p) : []}
    />
  );
}
