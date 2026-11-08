"use client";

import { useState } from "react";

import {
  PLAN_DEFAUT,
  accelerationPlan,
  composanteParallele,
  composantePerpendiculaire,
  dureePlan,
  etatPlan,
  poidsPlan,
  rad,
  reactionNormalePlan,
  tempsArriveePlan,
  vitessePlan,
  vitesseApresDeplacement,
  type ParamsPlan,
} from "@/lib/dynamique";
import { questionsPlan } from "@/lib/dynamiqueExercices";
import { Alerte, BarreEchelle, BarreLecture, CD, Cadre, Curseur, Interrupteur, Legende, OPTIONS_DEFAUT, Tex, Valeur, Vecteur, elargir, fmt, useHorloge, type OptionsAffichage } from "./ui";

const SCENARIOS: Array<{ id: string; libelle: string; params: Partial<ParamsPlan> }> = [
  { id: "exemple", libelle: "Exemple du cours", params: { m: 2, alpha: 30, g: 10, v0: 0, distance: 5 } },
  { id: "masse8", libelle: "Masse × 4 (8 kg)", params: { m: 8, alpha: 30, g: 10, v0: 0, distance: 5 } },
  { id: "raide", libelle: "Pente à 60°", params: { m: 2, alpha: 60, g: 10, v0: 0, distance: 5 } },
];

const W = 440;
const H = 330;
const SOL = 262;
const BAS = { x: 412, y: SOL };
const LP = 236; // longueur de la pente à l'écran (px)

function Scene({ p, t, o }: { p: ParamsPlan; t: number; o: OptionsAffichage }) {
  const al = rad(p.alpha);
  const u = { x: Math.cos(al), y: Math.sin(al) }; // le long de la pente, vers le bas
  const n = { x: Math.sin(al), y: -Math.cos(al) }; // normale sortante
  const haut = { x: BAS.x - LP * u.x, y: BAS.y - LP * u.y };
  const e = etatPlan(p, t);
  const marge = 34;
  const sPx = (d: number) => marge + (Math.min(d, p.distance) / p.distance) * (LP - 2 * marge);
  const surface = (d: number) => ({ x: haut.x + u.x * sPx(d), y: haut.y + u.y * sPx(d) });
  const dessus = (d: number, h: number) => {
    const s = surface(d);
    return { x: s.x + n.x * h, y: s.y + n.y * h };
  };
  const G = dessus(e.d, 12);
  const P = poidsPlan(p);
  const a = accelerationPlan(p);
  const kF = 150 / Math.max(10 * p.g, P);
  const kA = 70 / Math.max(p.g, a, 1);
  const vFin = Math.max(Math.abs(vitessePlan(p, dureePlan(p))), Math.abs(p.v0), 1);
  const kV = 80 / vFin;
  const Px = composanteParallele(p);
  const Py = composantePerpendiculaire(p);
  const N = reactionNormalePlan(p);
  const arc = Array.from({ length: 15 }, (_, k) => {
    const f = Math.PI + (al * k) / 14;
    return `${k === 0 ? "M" : "L"} ${(BAS.x + 46 * Math.cos(f)).toFixed(1)} ${(BAS.y + 46 * Math.sin(f)).toFixed(1)}`;
  }).join(" ");
  const fm = Math.PI + al / 2;
  const depart = dessus(0, 12);
  const fin = dessus(p.distance, 12);
  const vit = e.v;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Plan incliné d'angle ${fmt(p.alpha, 1)} degrés, solide de ${fmt(p.m, 2)} kg, déplacement ${fmt(e.d)} mètres à t = ${fmt(t)} secondes`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={14} y={26} fontSize={16} fontWeight={700} fill={CD.profond}>
        t = {fmt(t)} s
      </text>
      <polygon points={`${haut.x},${haut.y} ${BAS.x},${BAS.y} ${haut.x},${SOL}`} fill="#e7eefc" stroke="#334155" strokeWidth={2} strokeLinejoin="round" />
      <line x1={14} y1={SOL} x2={W - 8} y2={SOL} stroke="#334155" strokeWidth={2.5} />
      <path d={arc} fill="none" stroke="#334155" strokeWidth={1.6} />
      <text x={BAS.x + 62 * Math.cos(fm)} y={BAS.y + 62 * Math.sin(fm) + 5} fontSize={16} fontWeight={700} fill="#334155" textAnchor="middle">
        α
      </text>
      {o.axes && (
        <g>
          <line x1={30} y1={112} x2={30 + 56 * u.x} y2={112 + 56 * u.y} stroke={CD.gris} strokeWidth={2} />
          <line x1={30} y1={112} x2={30 + 56 * n.x} y2={112 + 56 * n.y} stroke={CD.gris} strokeWidth={2} />
          <text x={30 + 66 * u.x} y={112 + 66 * u.y + 5} fontSize={14} fontWeight={700} fill={CD.gris}>
            x
          </text>
          <text x={30 + 66 * n.x - 4} y={112 + 66 * n.y} fontSize={14} fontWeight={700} fill={CD.gris}>
            y
          </text>
        </g>
      )}
      {o.trajectoire && (
        <g>
          <line x1={depart.x} y1={depart.y} x2={fin.x} y2={fin.y} stroke={CD.vitesse} strokeWidth={1.6} strokeDasharray="3 6" opacity={0.7} />
          <line x1={depart.x} y1={depart.y} x2={G.x} y2={G.y} stroke={CD.vitesse} strokeWidth={2.6} />
        </g>
      )}
      <g transform={`rotate(${p.alpha} ${G.x} ${G.y})`}>
        <rect x={G.x - 19} y={G.y - 12} width={38} height={24} rx={4} fill="#3b82f6" stroke="#fff" strokeWidth={2} />
      </g>
      <circle cx={G.x} cy={G.y} r={3} fill="#fff" />
      <text x={G.x - 4} y={G.y - 16} fontSize={13} fontWeight={700} fill="#fff" stroke={CD.profond} strokeWidth={3} paintOrder="stroke" textAnchor="end">
        G
      </text>
      {o.composantes && o.forces && (
        <g>
          <Vecteur x={G.x} y={G.y} dx={u.x * Px * kF} dy={u.y * Px * kF} couleur={CD.poids} symbole="Px" pointille />
          <Vecteur x={G.x} y={G.y} dx={n.x * Py * kF} dy={n.y * Py * kF} couleur={CD.poids} symbole="Py" pointille />
        </g>
      )}
      {o.forces && (
        <g>
          <Vecteur x={G.x} y={G.y} dx={0} dy={P * kF} couleur={CD.poids} symbole="P" />
          <Vecteur x={G.x} y={G.y} dx={n.x * N * kF} dy={n.y * N * kF} couleur={CD.normale} symbole="N" />
        </g>
      )}
      {o.acceleration && <Vecteur x={G.x + n.x * 34} y={G.y + n.y * 34} dx={u.x * a * kA} dy={u.y * a * kA} couleur={CD.acceleration} symbole="a" />}
      {o.vitesse && <Vecteur x={G.x + n.x * 56} y={G.y + n.y * 56} dx={u.x * vit * kV} dy={u.y * vit * kV} couleur={CD.vitesse} symbole="v" />}
      {o.forces && <BarreEchelle x={14} y={H - 34} k={kF} unite="N" couleur={CD.poids} libelle="Forces" />}
      {(o.acceleration || o.vitesse) && <BarreEchelle x={14} y={H - 12} k={o.acceleration ? kA : kV} unite={o.acceleration ? "m/s²" : "m/s"} couleur={o.acceleration ? CD.acceleration : CD.vitesse} libelle={o.acceleration ? "Accélération" : "Vitesse"} />}
    </svg>
  );
}

export default function PlanIncline({ initial = PLAN_DEFAUT }: { initial?: ParamsPlan }) {
  const [p, setP] = useState<ParamsPlan>(initial);
  const [scen, setScen] = useState<string | null>(null);
  const [o, setO] = useState<OptionsAffichage>(OPTIONS_DEFAUT);
  const duree = dureePlan(p);
  const h = useHorloge(duree);
  const t = h.t;
  const maj = (m: Partial<ParamsPlan>) => {
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

  const a = accelerationPlan(p);
  const P = poidsPlan(p);
  const N = reactionNormalePlan(p);
  const Px = composanteParallele(p);
  const Py = composantePerpendiculaire(p);
  const ta = tempsArriveePlan(p);
  const e = etatPlan(p, t);
  const vEnd = vitesseApresDeplacement(p, p.distance);
  const immobile = a < 1e-9 && p.v0 < 1e-9;

  const etapes = [
    { titre: "Système", contenu: <p>Le solide, assimilé à son centre d&apos;inertie G, de masse m = {fmt(p.m, 2)} kg.</p> },
    { titre: "Référentiel", contenu: <p>Référentiel terrestre, supposé galiléen. Repère (G, x, y) : x le long de la pente vers le bas, y perpendiculaire au plan vers l&apos;extérieur.</p> },
    { titre: "Bilan des forces extérieures", contenu: <p>Le poids <b style={{ color: CD.poids }}>P</b> (vertical vers le bas, norme mg) et la réaction normale <b style={{ color: CD.normale }}>N</b> du plan (perpendiculaire au plan). Pas de frottement : pas de composante tangentielle de la réaction.</p> },
    { titre: "Théorème du centre d'inertie", contenu: <Tex bloc expr={String.raw`\sum \vec F_{\mathrm{ext}} = m\,\vec a_G \;\Rightarrow\; \vec P + \vec N = m\,\vec a_G`} /> },
    {
      titre: "Projections sur les axes",
      contenu: (
        <>
          <Tex bloc expr={String.raw`\text{sur } x : \; mg\sin\alpha = m\,a_x`} />
          <Tex bloc expr={String.raw`\text{sur } y : \; N - mg\cos\alpha = m\,a_y = 0`} />
        </>
      ),
    },
    {
      titre: "Résolution littérale",
      contenu: (
        <>
          <Tex bloc expr={String.raw`a = g\sin\alpha \qquad N = mg\cos\alpha`} />
          <p>La masse m s&apos;est simplifiée dans la première équation.</p>
        </>
      ),
    },
    {
      titre: "Application numérique",
      contenu: (
        <>
          <Tex bloc expr={String.raw`a = ${fmt(p.g, 2)} \times \sin ${fmt(p.alpha, 1)}^\circ = ${fmt(a, 3)}\ \text{m/s}^2`} />
          <Tex bloc expr={String.raw`N = ${fmt(p.m, 2)} \times ${fmt(p.g, 2)} \times \cos ${fmt(p.alpha, 1)}^\circ = ${fmt(N, 3)}\ \text{N}`} />
          <Tex bloc expr={String.raw`v^2 = v_0^2 + 2\,a\,d \;\Rightarrow\; v = ${fmt(vEnd, 3)}\ \text{m/s après } ${fmt(p.distance, 1)}\ \text{m}`} />
        </>
      ),
    },
    {
      titre: "Interprétation",
      contenu: (
        <p>
          L&apos;accélération vaut {fmt(a, 2)} m/s² quelle que soit la masse : seul l&apos;angle compte. Si on multiplie m par 4, P et N sont multipliés par 4 ({fmt(P, 1)} N → {fmt(4 * P, 1)} N pour P), mais a reste {fmt(a, 2)} m/s².
          {p.alpha === 0 ? " Ici α = 0 : le plan est horizontal, a = 0 et N = P." : ""}
        </p>
      ),
    },
  ];

  const bm = elargir(p.m, 0.5, 10);
  const bg = elargir(p.g, 1, 20);
  const bd = elargir(p.distance, 1, 20);

  return (
    <Cadre
      titre="Plan incliné sans frottement"
      scene={
        <>
          <Scene p={p} t={t} o={o} />
          <Legende
            elements={[
              { symbole: "P", libelle: "poids", couleur: CD.poids },
              { symbole: "N", libelle: "réaction normale", couleur: CD.normale },
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
      alerte={immobile ? <Alerte ton="info">Plan horizontal et vitesse initiale nulle : le solide reste immobile (a = 0).</Alerte> : undefined}
      principe={
        <p className="text-sm text-fh-ardoise">
          Sans frottement, le solide est soumis à P et N. Seule la composante de P parallèle à la pente fait accélérer : <b>a = g sin α</b>, indépendante de la masse.
        </p>
      }
      parametres={
        <>
          <Curseur etiquette="Masse m" valeur={p.m} min={bm.min} max={bm.max} pas={0.5} onChange={(v) => maj({ m: v })} unite="kg" />
          <Curseur etiquette="Angle α" valeur={p.alpha} min={0} max={75} pas={1} onChange={(v) => maj({ alpha: v })} unite="°" decimales={1} />
          <Curseur etiquette="Gravité g" valeur={p.g} min={bg.min} max={bg.max} pas={0.5} onChange={(v) => maj({ g: v })} unite="m/s²" />
          <Curseur etiquette="Vitesse initiale v₀" valeur={p.v0} min={0} max={10} pas={0.5} onChange={(v) => maj({ v0: v })} unite="m/s" />
          <Curseur etiquette="Distance disponible" valeur={p.distance} min={bd.min} max={bd.max} pas={1} onChange={(v) => maj({ distance: v })} unite="m" />
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Forces" coche={o.forces} onChange={bascule("forces")} />
          <Interrupteur etiquette="Composantes du poids" coche={o.composantes} onChange={bascule("composantes")} />
          <Interrupteur etiquette="Vitesse" coche={o.vitesse} onChange={bascule("vitesse")} />
          <Interrupteur etiquette="Accélération" coche={o.acceleration} onChange={bascule("acceleration")} />
          <Interrupteur etiquette="Axes" coche={o.axes} onChange={bascule("axes")} />
          <Interrupteur etiquette="Trajectoire" coche={o.trajectoire} onChange={bascule("trajectoire")} />
        </>
      }
      resultats={
        <>
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="Poids P = mg">{fmt(P, 2)} N</Valeur>
            <Valeur etiquette="Réaction N = mg cos α">{fmt(N, 2)} N</Valeur>
            <Valeur etiquette="Pₓ = mg sin α">{fmt(Px, 2)} N</Valeur>
            <Valeur etiquette="P_y = −mg cos α">{fmt(Py, 2)} N</Valeur>
            <Valeur etiquette="Accélération a = g sin α">{fmt(a, 3)} m/s²</Valeur>
            <Valeur etiquette="Vitesse v(t)">{fmt(e.v, 2)} m/s</Valeur>
            <Valeur etiquette="Déplacement d(t)">{fmt(e.d, 2)} m</Valeur>
            <Valeur etiquette={`Vitesse après ${fmt(p.distance, 1)} m`}>{fmt(vEnd, 2)} m/s</Valeur>
          </div>
          <p className="text-xs text-fh-ardoise">
            {ta === null ? "Le solide n'atteint jamais l'extrémité du plan." : `Arrivée en bas à t = ${fmt(ta, 2)} s.`}
            {e.arrive ? " Le solide est arrivé en bas du plan : la simulation s'arrête." : ""}
          </p>
          <p className="rounded-lg bg-white px-3 py-2 text-xs text-fh-ardoise">
            Teste : passe la masse de 2 à 8 kg. P et N sont multipliés par 4 ; a ne change pas.
          </p>
        </>
      }
      etapes={etapes}
      questions={questionsPlan(p)}
    />
  );
}
