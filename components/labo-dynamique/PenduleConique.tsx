"use client";

import { useState } from "react";

import {
  PENDULE_DEFAUT,
  deg,
  etatPendule,
  norme3,
  produitScalaire3,
  projeter,
  rad,
  vecteursPendule,
  type ParamsPendule,
  type Vec3,
} from "@/lib/dynamique";
import { questionsPendule } from "@/lib/dynamiqueExercices";
import { Alerte, BarreEchelle, BarreLecture, CD, Cadre, Curseur, Interrupteur, Legende, OPTIONS_DEFAUT, Pastille, Tex, Valeur, Vecteur, elargir, fmt, useHorloge, type OptionsAffichage } from "./ui";

const SCENARIOS: Array<{ id: string; libelle: string; params: Partial<ParamsPendule> }> = [
  { id: "exemple", libelle: "Exemple du cours", params: { m: 0.1, l: 0.5, g: 10, theta: 30, mode: "angle" } },
  { id: "rapide", libelle: "Rotation rapide (60°)", params: { m: 0.1, l: 0.5, g: 10, theta: 60, mode: "angle" } },
];

const W = 440;
const H = 340;
const O = { x: 220, y: 40 };
const ELEV = rad(22);

function Scene({ p, t, o }: { p: ParamsPendule; t: number; o: OptionsAffichage }) {
  const e = etatPendule(p);
  const echelle = 185 / p.l;
  const ecran = (v: Vec3) => {
    const q = projeter(v, ELEV);
    return { x: O.x + q.x * echelle, y: O.y - q.y * echelle };
  };
  const dEcran = (v: Vec3, k: number) => {
    const q = projeter(v, ELEV);
    return { dx: q.x * k, dy: -q.y * k };
  };
  const vec = vecteursPendule(p, t);
  const pos: Vec3 = vec ? vec.pos : { x: 0, y: 0, z: -p.l };
  const centre: Vec3 = { x: 0, y: 0, z: pos.z };
  const M = ecran(pos);
  const I = ecran(centre);
  const th = e.valide ? rad(e.theta) : 0;
  const r = e.valide ? e.r : 0;
  const phi = vec ? vec.phi : 0;
  const ellipse = Array.from({ length: 73 }, (_, k) => {
    const f = (2 * Math.PI * k) / 72;
    const q = ecran({ x: r * Math.cos(f), y: r * Math.sin(f), z: pos.z });
    return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
  }).join(" ");
  const arc = Array.from({ length: 13 }, (_, k) => {
    const b = (th * k) / 12;
    const rho = 0.18 * p.l;
    const q = ecran({ x: rho * Math.sin(b) * Math.cos(phi), y: rho * Math.sin(b) * Math.sin(phi), z: -rho * Math.cos(b) });
    return `${k === 0 ? "M" : "L"} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  }).join(" ");
  const bMid = th / 2;
  const qLabel = ecran({ x: 0.3 * p.l * Math.sin(bMid) * Math.cos(phi), y: 0.3 * p.l * Math.sin(bMid) * Math.sin(phi), z: -0.3 * p.l * Math.cos(bMid) });
  const kF = 110 / Math.max(3, e.valide ? e.T : 0, p.m * p.g);
  const kA = e.valide ? 70 / Math.max(p.g, e.a) : 7;
  const kV = e.valide ? 70 / Math.max(e.v, 1) : 7;
  const rLabel = ecran({ x: (r / 2) * Math.cos(phi), y: (r / 2) * Math.sin(phi), z: pos.z });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={e.valide ? `Pendule conique : θ = ${fmt(e.theta, 1)} degrés, rayon ${fmt(e.r, 3)} m, vitesse angulaire ${fmt(e.omega, 3)} rad/s` : "Pendule conique : configuration non valide, le fil reste vertical"} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={14} y={26} fontSize={16} fontWeight={700} fill={CD.profond}>
        t = {fmt(t)} s
      </text>
      <rect x={O.x - 40} y={O.y - 12} width={80} height={8} rx={3} fill="#475569" />
      <line x1={O.x} y1={O.y - 4} x2={O.x} y2={I.y + 14} stroke="#94a3b8" strokeWidth={1.6} strokeDasharray="6 5" />
      {o.axes && (
        <text x={O.x - 8} y={O.y + 44} textAnchor="end" fontSize={13} fontWeight={700} fill={CD.gris}>
          verticale
        </text>
      )}
      {o.trajectoire && e.valide && <polyline points={ellipse} fill="none" stroke={CD.vitesse} strokeWidth={2} strokeDasharray="4 5" opacity={0.85} />}
      {e.valide && (
        <g>
          <line x1={I.x} y1={I.y} x2={M.x} y2={M.y} stroke="#94a3b8" strokeWidth={1.6} strokeDasharray="3 4" />
          <text x={rLabel.x} y={rLabel.y + 20} textAnchor="middle" fontSize={14} fontWeight={700} fill={CD.gris}>
            r
          </text>
        </g>
      )}
      <circle cx={I.x} cy={I.y} r={3.5} fill="#334155" />
      <text x={I.x - 9} y={I.y - 7} textAnchor="end" fontSize={14} fontWeight={700} fill="#334155" stroke="#fff" strokeWidth={3} paintOrder="stroke">
        I
      </text>
      <circle cx={O.x} cy={O.y} r={4} fill="#334155" />
      <text x={O.x - 10} y={O.y - 14} textAnchor="end" fontSize={14} fontWeight={700} fill="#334155">
        O
      </text>
      <line x1={O.x} y1={O.y} x2={M.x} y2={M.y} stroke="#1e293b" strokeWidth={2.4} />
      {e.valide && <path d={arc} fill="none" stroke="#334155" strokeWidth={1.5} />}
      {e.valide && (
        <text x={qLabel.x + 8} y={qLabel.y + 14} fontSize={15} fontWeight={700} fill="#334155" stroke="#fff" strokeWidth={3} paintOrder="stroke">
          θ
        </text>
      )}
      <circle cx={M.x} cy={M.y} r={11} fill="#3b82f6" stroke="#fff" strokeWidth={2.4} />
      {o.forces && (
        <g>
          <Vecteur x={M.x} y={M.y} dx={0} dy={p.m * p.g * kF} couleur={CD.poids} symbole="P" />
          {vec ? (() => {
            const d = dEcran(vec.tension, kF);
            return <Vecteur x={M.x} y={M.y} dx={d.dx} dy={d.dy} couleur={CD.tension} symbole="T" />;
          })() : <Vecteur x={M.x} y={M.y} dx={0} dy={-p.m * p.g * kF} couleur={CD.tension} symbole="T" />}
        </g>
      )}
      {vec && o.acceleration && (() => {
        const d = dEcran(vec.acceleration, kA);
        return <Vecteur x={M.x} y={M.y} dx={d.dx} dy={d.dy} couleur={CD.acceleration} symbole="a" />;
      })()}
      {vec && o.vitesse && (() => {
        const d = dEcran(vec.vitesse, kV);
        return <Vecteur x={M.x} y={M.y} dx={d.dx} dy={d.dy} couleur={CD.vitesse} symbole="v" />;
      })()}
      {o.forces && <BarreEchelle x={14} y={H - 40} k={kF} unite="N" couleur={CD.poids} libelle="Forces" />}
      {o.acceleration && e.valide && <BarreEchelle x={14} y={H - 16} k={kA} unite="m/s²" couleur={CD.acceleration} libelle="Accélération" />}
    </svg>
  );
}

export default function PenduleConique({ initial = PENDULE_DEFAUT }: { initial?: ParamsPendule }) {
  const [p, setP] = useState<ParamsPendule>(initial);
  const [scen, setScen] = useState<string | null>(null);
  const [o, setO] = useState<OptionsAffichage>({ ...OPTIONS_DEFAUT, composantes: false });
  const e = etatPendule(p);
  const duree = e.valide ? 2 * e.periode : 4;
  const h = useHorloge(duree);
  const t = h.t;
  const maj = (m: Partial<ParamsPendule>) => {
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
  const changerMode = (mode: "angle" | "omega") => {
    if (mode === p.mode) return;
    if (e.valide) maj({ mode, theta: Math.min(85, Math.max(1, Number(e.theta.toFixed(1)))), omega: Number(e.omega.toFixed(2)) });
    else maj({ mode });
  };

  const vec = e.valide ? vecteursPendule(p, t) : null;
  const angleVA = vec ? deg(Math.acos(Math.max(-1, Math.min(1, produitScalaire3(vec.vitesse, vec.acceleration) / (norme3(vec.vitesse) * norme3(vec.acceleration)))))) : null;

  const etapes = [
    { titre: "Système", contenu: <p>La bille, assimilée à son centre d&apos;inertie G, de masse m = {fmt(p.m, 3)} kg, au bout d&apos;un fil de longueur ℓ = {fmt(p.l, 3)} m.</p> },
    { titre: "Référentiel", contenu: <p>Référentiel terrestre, galiléen. G décrit un cercle horizontal de centre I et de rayon r à la vitesse angulaire constante ω : son accélération est horizontale, dirigée vers I, de valeur a = rω².</p> },
    { titre: "Bilan des forces", contenu: <p>Le poids <b style={{ color: CD.poids }}>P</b> (vertical vers le bas) et la tension <b style={{ color: CD.tension }}>T</b> du fil (dirigée suivant le fil vers O). θ est l&apos;angle entre le fil et la verticale.</p> },
    { titre: "Théorème du centre d'inertie", contenu: <Tex bloc expr={String.raw`\vec P + \vec T = m\,\vec a_G`} /> },
    {
      titre: "Projections",
      contenu: (
        <div className="grid min-w-0 gap-2 @sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-[#EFF6FF] px-2">
            <p className="text-xs font-bold text-[#102A66]">Verticale (a = 0)</p>
            <Tex bloc expr={String.raw`T\cos\theta - mg = 0`} />
          </div>
          <div className="min-w-0 rounded-lg bg-[#EFF6FF] px-2">
            <p className="text-xs font-bold text-[#102A66]">Horizontale, vers I</p>
            <Tex bloc expr={String.raw`T\sin\theta = m\,r\,\omega^2`} />
          </div>
        </div>
      ),
    },
    {
      titre: "Résolution littérale",
      contenu: (
        <>
          <Tex bloc expr={String.raw`T = \dfrac{mg}{\cos\theta} \qquad r = \ell\sin\theta`} />
          <Tex bloc expr={String.raw`\cos\theta = \dfrac{g}{\ell\,\omega^2} \;\Rightarrow\; \omega = \sqrt{\dfrac{g}{\ell\cos\theta}} \qquad v = r\,\omega \qquad a_G = r\,\omega^2`} />
        </>
      ),
    },
    {
      titre: "Application numérique",
      contenu: e.valide ? (
        <>
          <Tex bloc expr={String.raw`r = ${fmt(p.l, 3)} \times \sin ${fmt(e.theta, 1)}^\circ = ${fmt(e.r, 3)}\ \text{m}`} />
          <Tex bloc expr={String.raw`\omega = \sqrt{\dfrac{${fmt(p.g, 2)}}{${fmt(p.l, 3)} \times \cos ${fmt(e.theta, 1)}^\circ}} = ${fmt(e.omega, 3)}\ \text{rad/s} \qquad v = ${fmt(e.v, 3)}\ \text{m/s}`} />
          <Tex bloc expr={String.raw`T = \dfrac{${fmt(p.m, 3)} \times ${fmt(p.g, 2)}}{\cos ${fmt(e.theta, 1)}^\circ} = ${fmt(e.T, 3)}\ \text{N}`} />
        </>
      ) : (
        <p>Aucune application numérique : la configuration choisie n&apos;est pas un pendule conique.</p>
      ),
    },
    {
      titre: "Interprétation",
      contenu: (
        <p>
          La tension est toujours supérieure au poids (T = mg / cos θ &gt; mg) : sa composante verticale équilibre P, sa composante horizontale T sin θ fournit la résultante centripète m rω². Un pendule conique n&apos;existe que si ℓω² &gt; g et 0 &lt; θ &lt; 90°.
        </p>
      ),
    },
  ];

  const bm = elargir(p.m, 0.05, 1);
  const bl = elargir(p.l, 0.2, 2);
  const bg = elargir(p.g, 1, 20);
  const bt = elargir(p.theta, 5, 80);
  const bw = elargir(p.omega, 3, 15);

  return (
    <Cadre
      titre="Pendule conique"
      scene={
        <>
          <Scene p={p} t={t} o={o} />
          <Legende
            elements={[
              { symbole: "P", libelle: "poids", couleur: CD.poids },
              { symbole: "T", libelle: "tension du fil", couleur: CD.tension },
              { symbole: "a", libelle: "accélération (vers I)", couleur: CD.acceleration },
              { symbole: "v", libelle: "vitesse (tangente)", couleur: CD.vitesse },
            ]}
          />
        </>
      }
      commandes={<BarreLecture h={h} duree={duree} onReinitialiser={reprendre} instantEtiquette="Instant observé" />}
      scenarios={SCENARIOS.map(({ id, libelle }) => ({ id, libelle }))}
      scenarioActif={scen}
      onScenario={choisir}
      onReprendre={reprendre}
      alerte={!e.valide ? <Alerte>{e.raison}</Alerte> : undefined}
      principe={<p className="text-sm text-fh-ardoise">La composante horizontale de la tension fournit la résultante centripète ; sa composante verticale équilibre le poids. θ et ω sont liés : cos θ = g / (ℓω²).</p>}
      parametres={
        <>
          <div role="group" aria-label="Paramètre imposé" className="flex flex-wrap gap-2">
            <Pastille actif={p.mode === "angle"} onClick={() => changerMode("angle")}>
              Choisir l&apos;angle θ
            </Pastille>
            <Pastille actif={p.mode === "omega"} onClick={() => changerMode("omega")}>
              Choisir la vitesse angulaire ω
            </Pastille>
          </div>
          <Curseur etiquette="Masse m" valeur={p.m} min={bm.min} max={bm.max} pas={0.05} decimales={3} onChange={(v) => maj({ m: v })} unite="kg" />
          <Curseur etiquette="Longueur ℓ du fil" valeur={p.l} min={bl.min} max={bl.max} pas={0.05} decimales={2} onChange={(v) => maj({ l: v })} unite="m" />
          <Curseur etiquette="Gravité g" valeur={p.g} min={bg.min} max={bg.max} pas={0.5} onChange={(v) => maj({ g: v })} unite="m/s²" />
          {p.mode === "angle" ? (
            <Curseur etiquette="Angle θ" valeur={p.theta} min={bt.min} max={bt.max} pas={1} decimales={1} onChange={(v) => maj({ theta: v })} unite="°" />
          ) : (
            <Curseur etiquette="Vitesse angulaire ω" valeur={p.omega} min={bw.min} max={bw.max} pas={0.1} decimales={2} onChange={(v) => maj({ omega: v })} unite="rad/s" />
          )}
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Forces" coche={o.forces} onChange={bascule("forces")} />
          <Interrupteur etiquette="Vitesse" coche={o.vitesse} onChange={bascule("vitesse")} />
          <Interrupteur etiquette="Accélération" coche={o.acceleration} onChange={bascule("acceleration")} />
          <Interrupteur etiquette="Trajectoire" coche={o.trajectoire} onChange={bascule("trajectoire")} />
          <Interrupteur etiquette="Verticale" coche={o.axes} onChange={bascule("axes")} />
        </>
      }
      resultats={
        e.valide ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Valeur etiquette="Angle θ">{fmt(e.theta, 2)} °</Valeur>
              <Valeur etiquette="Rayon r = ℓ sin θ">{fmt(e.r, 3)} m</Valeur>
              <Valeur etiquette="Vitesse angulaire ω">{fmt(e.omega, 3)} rad/s</Valeur>
              <Valeur etiquette="Vitesse v = rω">{fmt(e.v, 3)} m/s</Valeur>
              <Valeur etiquette="Tension T">{fmt(e.T, 3)} N</Valeur>
              <Valeur etiquette="Poids P = mg">{fmt(e.poids, 3)} N</Valeur>
              <Valeur etiquette="Accélération a = rω²">{fmt(e.a, 3)} m/s²</Valeur>
              <Valeur etiquette="Période">{fmt(e.periode, 3)} s</Valeur>
            </div>
            <p className="text-xs text-fh-ardoise">
              Angle entre v et a : {angleVA === null ? "—" : fmt(angleVA, 1)}°. Vérification : T cos θ = {fmt(e.T * Math.cos(rad(e.theta)), 3)} N = mg ; T sin θ = {fmt(e.T * Math.sin(rad(e.theta)), 3)} N = m rω² = {fmt(p.m * e.a, 3)} N.
            </p>
          </>
        ) : (
          <p className="text-sm text-fh-ardoise">Aucun résultat : modifie ω (ou passe en mode angle).</p>
        )
      }
      etapes={etapes}
      questions={questionsPendule(p)}
    />
  );
}
