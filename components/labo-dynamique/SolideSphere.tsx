"use client";

import { useMemo, useState } from "react";

import { ANGLE_LIMITE_IDEAL, SPHERE_DEFAUT, etatSphere, rad, simulerSphere, type ParamsSphere, type TrajetSphere } from "@/lib/dynamique";
import { questionsSphere } from "@/lib/dynamiqueExercices";
import { Alerte, BarreEchelle, BarreLecture, CD, Cadre, Curseur, Graphique, Interrupteur, Legende, OPTIONS_DEFAUT, Tex, Valeur, Vecteur, elargir, fmt, useHorloge, type OptionsAffichage } from "./ui";

const SCENARIOS: Array<{ id: string; libelle: string; params: Partial<ParamsSphere> }> = [
  { id: "exemple", libelle: "Départ du sommet", params: { m: 1, R: 2, g: 10, theta0: 1, v0: 0 } },
  { id: "perturbation", libelle: "Départ à 20°", params: { m: 1, R: 2, g: 10, theta0: 20, v0: 0 } },
  { id: "vitesse", libelle: "Avec vitesse initiale", params: { m: 1, R: 2, g: 10, theta0: 1, v0: 1.5 } },
];

const W = 440;
const H = 340;
const S = { x: 120, y: 180 };
const RAYON_DISQUE = 8;

function Scene({ p, tr, t, o }: { p: ParamsSphere; tr: TrajetSphere; t: number; o: OptionsAffichage }) {
  const e = etatSphere(p, tr, t);
  const xLand = tr.position.x + tr.vitesse.x * tr.tVol;
  const k = Math.min(100 / p.R, (W - S.x - 18) / Math.max(xLand, 1.15 * p.R));
  const Rpx = p.R * k;
  const sol = S.y + Rpx;
  const X = (m: number) => S.x + m * k;
  const Y = (m: number) => S.y - m * k;
  const pos = e.pos;
  const th = e.enContact && e.theta !== null ? rad(e.theta) : rad(tr.thetaD);
  const vol = Array.from({ length: 41 }, (_, i) => {
    const s = (tr.tVol * i) / 40;
    return `${X(tr.position.x + tr.vitesse.x * s).toFixed(1)},${Y(tr.position.y + tr.vitesse.y * s - 0.5 * p.g * s * s).toFixed(1)}`;
  }).join(" ");
  const contactPts = Array.from({ length: 31 }, (_, i) => {
    const a = rad(p.theta0 + ((tr.thetaD - p.theta0) * i) / 30);
    return `${X(p.R * Math.sin(a)).toFixed(1)},${Y(p.R * Math.cos(a)).toFixed(1)}`;
  }).join(" ");
  const m = p.m;
  const P = m * p.g;
  const kF = 90 / P;
  const Nvec = e.N;
  const nx = Math.sin(th); // normale sortante, repère maths
  const ny = Math.cos(th);
  // accélération (P + N)/m : poids (0, −g) + N/m · normale sortante
  const ax = (Nvec / m) * nx;
  const ay = -p.g + (Nvec / m) * ny;
  const kA = 60 / Math.max(p.g, 1);
  const vFinal = Math.hypot(tr.vitesse.x, tr.vitesse.y - p.g * tr.tVol);
  const kV = 60 / Math.max(vFinal, 3);
  const px = X(pos.x);
  const py = Y(pos.y);
  const arc = Array.from({ length: 13 }, (_, i) => {
    const a = (th * i) / 12;
    return `${i === 0 ? "M" : "L"} ${(S.x + 0.42 * Rpx * Math.sin(a)).toFixed(1)} ${(S.y - 0.42 * Rpx * Math.cos(a)).toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={e.enContact ? `Solide en contact avec la sphère à θ = ${fmt(e.theta ?? 0, 1)} degrés, réaction normale ${fmt(e.N, 2)} newtons` : "Solide en vol libre après avoir quitté la sphère, réaction normale nulle"} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={14} y={26} fontSize={16} fontWeight={700} fill={CD.profond}>
        t = {fmt(t)} s
      </text>
      <line x1={10} y1={sol} x2={W - 10} y2={sol} stroke="#334155" strokeWidth={2.5} />
      <circle cx={S.x} cy={S.y} r={Rpx - RAYON_DISQUE} fill="#dbe7ff" stroke="#334155" strokeWidth={2} />
      <circle cx={S.x} cy={S.y} r={3.5} fill="#334155" />
      <text x={S.x - 8} y={S.y + 16} textAnchor="end" fontSize={14} fontWeight={700} fill="#334155">
        C
      </text>
      {o.axes && (
        <g>
          <line x1={S.x} y1={S.y} x2={S.x} y2={S.y - Rpx - 14} stroke="#94a3b8" strokeWidth={1.4} strokeDasharray="5 4" />
          <line x1={S.x} y1={S.y} x2={px} y2={py} stroke={CD.gris} strokeWidth={1.4} strokeDasharray="3 4" />
          {e.enContact && <path d={arc} fill="none" stroke="#334155" strokeWidth={1.5} />}
          <text x={S.x + 0.62 * Rpx * Math.sin(th / 2) - 4} y={S.y - 0.62 * Rpx * Math.cos(th / 2) + 4} fontSize={14} fontWeight={700} fill="#334155" textAnchor="middle">
            θ
          </text>
          <text x={(S.x + px) / 2 - 10} y={(S.y + py) / 2 + 14} fontSize={13} fontWeight={700} fill={CD.gris} stroke="#fff" strokeWidth={3} paintOrder="stroke">
            R
          </text>
        </g>
      )}
      {o.trajectoire && (
        <g>
          <polyline points={contactPts} fill="none" stroke={CD.vitesse} strokeWidth={1.5} strokeDasharray="3 5" opacity={0.6} />
          <polyline points={vol} fill="none" stroke={CD.vitesse} strokeWidth={1.8} strokeDasharray="4 5" opacity={0.8} />
        </g>
      )}
      <circle cx={px} cy={py} r={RAYON_DISQUE} fill={e.enContact ? "#3b82f6" : "#1d4ed8"} stroke="#fff" strokeWidth={2.2} />
      {o.forces && (
        <g>
          <Vecteur x={px} y={py} dx={0} dy={P * kF} couleur={CD.poids} symbole="P" />
          {e.enContact && Nvec * kF >= 3 && <Vecteur x={px} y={py} dx={nx * Nvec * kF} dy={-ny * Nvec * kF} couleur={CD.normale} symbole="N" />}
        </g>
      )}
      {o.acceleration && <Vecteur x={px} y={py} dx={ax * kA} dy={-ay * kA} couleur={CD.acceleration} symbole="a" />}
      {o.vitesse && <Vecteur x={px} y={py} dx={e.vitesse.x * kV} dy={-e.vitesse.y * kV} couleur={CD.vitesse} symbole="v" />}
      {o.forces && <BarreEchelle x={14} y={H - 40} k={kF} unite="N" couleur={CD.poids} libelle="Forces" />}
      {o.acceleration && <BarreEchelle x={14} y={H - 16} k={kA} unite="m/s²" couleur={CD.acceleration} libelle="Accél." />}
      {!e.enContact && (
        <text x={W - 14} y={26} textAnchor="end" fontSize={14} fontWeight={700} fill={CD.alerte}>
          Contact perdu : N = 0
        </text>
      )}
    </svg>
  );
}

export default function SolideSphere({ initial = SPHERE_DEFAUT }: { initial?: ParamsSphere }) {
  const [p, setP] = useState<ParamsSphere>(initial);
  const [scen, setScen] = useState<string | null>(null);
  const [o, setO] = useState<OptionsAffichage>({ ...OPTIONS_DEFAUT, composantes: false });
  const tr = useMemo(() => simulerSphere(p), [p]);
  const duree = Math.max(tr.duree, 0.5);
  const h = useHorloge(duree);
  const t = h.t;
  const maj = (m: Partial<ParamsSphere>) => {
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

  const e = etatSphere(p, tr, t);
  const c0 = Math.cos(rad(p.theta0));
  const speed = Math.hypot(e.vitesse.x, e.vitesse.y);

  const etapes = [
    { titre: "Système", contenu: <p>Le petit solide, assimilé à un point matériel G de masse m = {fmt(p.m, 2)} kg, qui glisse sans frottement sur la sphère fixe de rayon R = {fmt(p.R, 2)} m.</p> },
    { titre: "Référentiel", contenu: <p>Référentiel terrestre, galiléen. θ est l&apos;angle entre la verticale du sommet et le rayon CG. Tant que le solide reste sur la sphère, il décrit un cercle de rayon R ; la base de projection a un axe radial dirigé vers le centre C et un axe tangent.</p> },
    { titre: "Bilan des forces", contenu: <p>Le poids <b style={{ color: CD.poids }}>P</b> et la réaction normale <b style={{ color: CD.normale }}>N</b> de la sphère (radiale, vers l&apos;extérieur). Sans frottement, N est la seule action du support.</p> },
    { titre: "Théorème du centre d'inertie", contenu: <Tex bloc expr={String.raw`\vec P + \vec N = m\,\vec a_G`} /> },
    { titre: "Projection radiale (vers C)", contenu: <Tex bloc expr={String.raw`mg\cos\theta - N = m\,\dfrac{v^2}{R}`} /> },
    {
      titre: "Résolution littérale",
      contenu: (
        <>
          <p>Énergie mécanique conservée (N ne travaille pas) :</p>
          <Tex bloc expr={String.raw`v^2 = v_0^2 + 2gR\,(\cos\theta_0 - \cos\theta)`} />
          <Tex bloc expr={String.raw`N = mg\,(3\cos\theta - 2\cos\theta_0) - \dfrac{m\,v_0^2}{R}`} />
          <Tex bloc expr={String.raw`N = 0 \;\Rightarrow\; \cos\theta_d = \dfrac{2\cos\theta_0 + v_0^2/(gR)}{3}`} />
        </>
      ),
    },
    {
      titre: "Application numérique",
      contenu: (
        <>
          <Tex bloc expr={String.raw`\cos\theta_d = \dfrac{2 \times ${fmt(c0, 4)} + ${fmt((p.v0 * p.v0) / (p.g * p.R), 4)}}{3} \;\Rightarrow\; \theta_d = ${fmt(tr.thetaD, 2)}^\circ`} />
          <Tex bloc expr={String.raw`v_d = ${fmt(tr.vD, 3)}\ \text{m/s} \qquad t_d = ${fmt(tr.tD, 2)}\ \text{s}`} />
        </>
      ),
    },
    {
      titre: "Interprétation",
      contenu: (
        <p>
          N = mg cos θ − mv²/R diminue pendant la descente : le poids pèse de moins en moins « sur » la sphère tandis que la vitesse augmente. Quand N s&apos;annule, la sphère ne retient plus le solide : il quitte la sphère avec la vitesse v_d, puis suit une parabole sous le seul poids (a = g). Pour un départ du sommet sans vitesse (θ₀ → 0, v₀ = 0), on obtient cos θ_d = 2/3, soit {fmt(ANGLE_LIMITE_IDEAL, 1)}° ; ici le départ à θ₀ = {fmt(p.theta0, 1)}° donne {fmt(tr.thetaD, 2)}°.
        </p>
      ),
    },
  ];

  const bm = elargir(p.m, 0.2, 5);
  const bR = elargir(p.R, 0.5, 5);
  const bg = elargir(p.g, 1, 20);
  const bt = elargir(p.theta0, 0.1, 30);
  const bv = elargir(p.v0, 0, 5);

  return (
    <Cadre
      titre="Solide glissant sur une sphère"
      scene={
        <>
          <Scene p={p} tr={tr} t={t} o={o} />
          <Legende
            elements={[
              { symbole: "P", libelle: "poids", couleur: CD.poids },
              { symbole: "N", libelle: "réaction normale", couleur: CD.normale },
              { symbole: "a", libelle: "accélération", couleur: CD.acceleration },
              { symbole: "v", libelle: "vitesse", couleur: CD.vitesse },
            ]}
          />
          <Graphique compact titre="Réaction normale" unite="N (N)" series={[{ f: (s) => etatSphere(p, tr, s).N, couleur: CD.normale, libelle: "N(t)" }]} duree={duree} t={t} onT={(s) => { h.pause(); h.setT(s); }} reperes={tr.tD > 0 ? [{ t: tr.tD, libelle: "détachement" }] : []} />
        </>
      }
      commandes={<BarreLecture h={h} duree={duree} onReinitialiser={reprendre} />}
      scenarios={SCENARIOS.map(({ id, libelle }) => ({ id, libelle }))}
      scenarioActif={scen}
      onScenario={choisir}
      onReprendre={reprendre}
      alerte={tr.immediat ? <Alerte>Avec v₀ = {fmt(p.v0, 2)} m/s à θ₀ = {fmt(p.theta0, 1)}°, N(θ₀) serait négative : le solide quitte la sphère dès le départ et suit directement une parabole.</Alerte> : undefined}
      principe={<p className="text-sm text-fh-ardoise">Départ près du sommet avec une petite perturbation (θ₀ &gt; 0) : un équilibre parfaitement symétrique ne démarrerait pas. N = mg cos θ − mv²/R diminue ; quand N = 0, le solide quitte la sphère et devient un projectile.</p>}
      parametres={
        <>
          <Curseur etiquette="Masse m" valeur={p.m} min={bm.min} max={bm.max} pas={0.1} onChange={(v) => maj({ m: v })} unite="kg" />
          <Curseur etiquette="Rayon R de la sphère" valeur={p.R} min={bR.min} max={bR.max} pas={0.1} onChange={(v) => maj({ R: v })} unite="m" />
          <Curseur etiquette="Gravité g" valeur={p.g} min={bg.min} max={bg.max} pas={0.5} onChange={(v) => maj({ g: v })} unite="m/s²" />
          <Curseur etiquette="Angle initial θ₀ (perturbation)" valeur={p.theta0} min={bt.min} max={bt.max} pas={0.1} decimales={1} onChange={(v) => maj({ theta0: v })} unite="°" />
          <Curseur etiquette="Vitesse tangentielle initiale v₀" valeur={p.v0} min={bv.min} max={bv.max} pas={0.1} onChange={(v) => maj({ v0: v })} unite="m/s" />
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Forces" coche={o.forces} onChange={bascule("forces")} />
          <Interrupteur etiquette="Vitesse" coche={o.vitesse} onChange={bascule("vitesse")} />
          <Interrupteur etiquette="Accélération" coche={o.acceleration} onChange={bascule("acceleration")} />
          <Interrupteur etiquette="Trajectoire" coche={o.trajectoire} onChange={bascule("trajectoire")} />
          <Interrupteur etiquette="Rayon et angle" coche={o.axes} onChange={bascule("axes")} />
        </>
      }
      resultats={
        <>
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="Phase">{e.enContact ? "contact avec la sphère" : "vol libre (projectile)"}</Valeur>
            <Valeur etiquette="Angle θ">{e.theta === null ? "—" : `${fmt(e.theta, 2)} °`}</Valeur>
            <Valeur etiquette="Vitesse v">{fmt(speed, 3)} m/s</Valeur>
            <Valeur etiquette="Réaction N">{fmt(e.N, 3)} N</Valeur>
            <Valeur etiquette="Détachement θd">{fmt(tr.thetaD, 2)} °</Valeur>
            <Valeur etiquette="Instant td ; vitesse vd">{fmt(tr.tD, 2)} s ; {fmt(tr.vD, 2)} m/s</Valeur>
          </div>
          <p className="rounded-lg bg-white px-3 py-2 text-xs text-fh-ardoise">
            Cas limite idéal (départ du sommet sans vitesse) : cos θ = 2/3, soit {fmt(ANGLE_LIMITE_IDEAL, 1)}°. Ici θd = {fmt(tr.thetaD, 2)}° : il dépend de θ₀ et de v₀, ce n&apos;est pas toujours 48,2°.
            {e.au_sol ? " Le solide a touché le sol." : ""}
          </p>
        </>
      }
      etapes={etapes}
      questions={questionsSphere(p)}
    />
  );
}
