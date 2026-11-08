"use client";

import { useState } from "react";

import {
  VIRAGE_DEFAUT,
  accelerationCentripete,
  adherenceSuffisante,
  deg,
  etatVirage,
  forceCentripete,
  frottementMax,
  muMinimal,
  omegaVirage,
  periodeVirage,
  reactionVirage,
  virageRealisable,
  vitesseMaxAdherence,
  type ParamsVirage,
} from "@/lib/dynamique";
import { questionsVirage } from "@/lib/dynamiqueExercices";
import { Alerte, BarreEchelle, BarreLecture, CD, Cadre, Curseur, Interrupteur, Legende, OPTIONS_DEFAUT, Tex, Valeur, Vecteur, elargir, fmt, useHorloge, type OptionsAffichage } from "./ui";

const SCENARIOS: Array<{ id: string; libelle: string; params: Partial<ParamsVirage> }> = [
  { id: "exemple", libelle: "Exemple du cours", params: { m: 1000, v: 15, R: 50, g: 10, adherence: false } },
  { id: "double", libelle: "Vitesse doublée", params: { m: 1000, v: 30, R: 50, g: 10, adherence: false } },
  { id: "derapage", libelle: "Adhérence insuffisante", params: { m: 1000, v: 25, R: 50, g: 10, mu: 0.5, adherence: true } },
];

const W = 440;
const H = 340;
const C = { x: 220, y: 164 };
const RPX = 112;

function Scene({ p, t, o, realisable }: { p: ParamsVirage; t: number; o: OptionsAffichage; realisable: boolean }) {
  const e = etatVirage(p, realisable ? t : 0);
  const phi = e.phi;
  const X = C.x + RPX * Math.cos(phi);
  const Y = C.y - RPX * Math.sin(phi);
  // vecteurs unitaires à l'écran (y vers le bas)
  const ut = { x: -Math.sin(phi), y: -Math.cos(phi) };
  const uc = { x: -Math.cos(phi), y: Math.sin(phi) };
  const a = accelerationCentripete(p);
  const F = forceCentripete(p);
  const kV = 70 / Math.max(30, p.v);
  const kA = 90 / Math.max(20, a);
  const kF = 90 / Math.max(p.m * 20, F);
  const cap = deg(Math.atan2(ut.y, ut.x));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Véhicule de ${fmt(p.m, 0)} kg dans un virage de rayon ${fmt(p.R, 1)} m à ${fmt(p.v, 1)} m/s : accélération centripète ${fmt(a, 2)} m/s²`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={14} y={26} fontSize={16} fontWeight={700} fill={CD.profond}>
        t = {fmt(realisable ? t : 0)} s
      </text>
      <circle cx={C.x} cy={C.y} r={RPX + 16} fill="#e2e8f0" />
      <circle cx={C.x} cy={C.y} r={RPX - 16} fill="#f4f8ff" stroke="#cbd5e1" strokeWidth={1} />
      {o.trajectoire && <circle cx={C.x} cy={C.y} r={RPX} fill="none" stroke="#ffffff" strokeWidth={2.5} strokeDasharray="10 8" />}
      <circle cx={C.x} cy={C.y} r={4} fill="#334155" />
      <text x={C.x - 9} y={C.y + 18} textAnchor="end" fontSize={14} fontWeight={700} fill="#334155">
        O
      </text>
      {o.axes && (
        <g>
          <line x1={C.x} y1={C.y} x2={X} y2={Y} stroke={CD.gris} strokeWidth={1.6} strokeDasharray="4 4" />
          <text x={(C.x + X) / 2 + 8 * -uc.y * -1} y={(C.y + Y) / 2 - 8} fontSize={14} fontWeight={700} fill={CD.gris} stroke="#fff" strokeWidth={3} paintOrder="stroke">
            R
          </text>
        </g>
      )}
      <g transform={`rotate(${cap.toFixed(2)} ${X} ${Y})`}>
        <rect x={X - 20} y={Y - 10} width={40} height={20} rx={5} fill={realisable ? "#3b82f6" : "#94a3b8"} stroke="#fff" strokeWidth={2.2} />
        <rect x={X + 4} y={Y - 7} width={11} height={14} rx={3} fill="#bfdbfe" />
      </g>
      {o.forces && realisable && <Vecteur x={X - ut.x * 0 + ut.x * 10 + 0} y={Y + ut.y * 10} dx={uc.x * F * kF} dy={uc.y * F * kF} couleur={CD.frottement} symbole="F" />}
      {o.acceleration && realisable && <Vecteur x={X - ut.x * 10} y={Y - ut.y * 10} dx={uc.x * a * kA} dy={uc.y * a * kA} couleur={CD.acceleration} symbole="a" />}
      {o.vitesse && realisable && <Vecteur x={X} y={Y} dx={ut.x * p.v * kV} dy={ut.y * p.v * kV} couleur={CD.vitesse} symbole="v" />}
      {!realisable && (
        <g>
          <rect x={60} y={H - 112} width={320} height={44} rx={10} fill="#fff1f2" stroke={CD.alerte} strokeWidth={2} />
          <text x={220} y={H - 85} textAnchor="middle" fontSize={15} fontWeight={700} fill={CD.alerte}>
            Virage impossible avec cette adhérence
          </text>
        </g>
      )}
      {o.forces && realisable && <BarreEchelle x={14} y={H - 40} k={kF} unite="N" couleur={CD.frottement} libelle="F" />}
      {o.acceleration && realisable && <BarreEchelle x={14} y={H - 16} k={kA} unite="m/s²" couleur={CD.acceleration} libelle="a" />}
    </svg>
  );
}

export default function VehiculeVirage({ initial = VIRAGE_DEFAUT }: { initial?: ParamsVirage }) {
  const [p, setP] = useState<ParamsVirage>(initial);
  const [scen, setScen] = useState<string | null>(null);
  const [o, setO] = useState<OptionsAffichage>({ ...OPTIONS_DEFAUT, composantes: false });
  const realisable = virageRealisable(p);
  const duree = Math.min(periodeVirage(p), 20);
  const h = useHorloge(duree);
  const t = realisable ? h.t : 0;
  const maj = (m: Partial<ParamsVirage>) => {
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

  const a = accelerationCentripete(p);
  const F = forceCentripete(p);
  const N = reactionVirage(p);
  const fmax = frottementMax(p);
  const vmax = vitesseMaxAdherence(p);
  const ok = adherenceSuffisante(p);

  const etapes = [
    { titre: "Système", contenu: <p>Le véhicule, assimilé à son centre d&apos;inertie G, de masse m = {fmt(p.m, 0)} kg.</p> },
    { titre: "Référentiel", contenu: <p>Référentiel terrestre, galiléen. G décrit un cercle horizontal de rayon R = {fmt(p.R, 1)} m à vitesse de norme constante v : le vecteur vitesse change de direction, donc il y a une accélération, dirigée vers le centre O.</p> },
    { titre: "Bilan des forces", contenu: <p>Le poids <b>P</b> et la réaction normale <b style={{ color: CD.normale }}>N</b> de la route (verticaux), et la force horizontale <b style={{ color: CD.frottement }}>F</b> exercée par la route : c&apos;est le frottement statique, dirigé vers le centre. Il n&apos;y a pas de « force centripète » en plus : ce nom désigne la résultante dirigée vers le centre.</p> },
    { titre: "Théorème du centre d'inertie", contenu: <Tex bloc expr={String.raw`\vec P + \vec N + \vec F = m\,\vec a_G`} /> },
    {
      titre: "Projections",
      contenu: (
        <div className="grid min-w-0 gap-2 @sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-[#EFF6FF] px-2">
            <p className="text-xs font-bold text-[#102A66]">Verticale</p>
            <Tex bloc expr={String.raw`N - mg = 0`} />
          </div>
          <div className="min-w-0 rounded-lg bg-[#EFF6FF] px-2">
            <p className="text-xs font-bold text-[#102A66]">Radiale, vers O</p>
            <Tex bloc expr={String.raw`F = m\,a_c`} />
          </div>
        </div>
      ),
    },
    {
      titre: "Résolution littérale",
      contenu: (
        <>
          <Tex bloc expr={String.raw`N = mg \qquad a_c = \dfrac{v^2}{R} \qquad F = \dfrac{m\,v^2}{R}`} />
          <Tex bloc expr={String.raw`F \le \mu_s N \;\Leftrightarrow\; \dfrac{m v^2}{R} \le \mu_s m g \;\Leftrightarrow\; v \le \sqrt{\mu_s\, g\, R}`} />
        </>
      ),
    },
    {
      titre: "Application numérique",
      contenu: (
        <>
          <Tex bloc expr={String.raw`a_c = \dfrac{${fmt(p.v, 2)}^2}{${fmt(p.R, 2)}} = ${fmt(a, 3)}\ \text{m/s}^2 \qquad F = ${fmt(p.m, 0)} \times ${fmt(a, 3)} = ${fmt(F, 1)}\ \text{N}`} />
          <Tex bloc expr={String.raw`\mu_s\,m\,g = ${fmt(p.mu, 2)} \times ${fmt(p.m, 0)} \times ${fmt(p.g, 2)} = ${fmt(fmax, 1)}\ \text{N} \quad ;\quad v_{\max} = ${fmt(vmax, 2)}\ \text{m/s}`} />
        </>
      ),
    },
    {
      titre: "Interprétation",
      contenu: (
        <p>
          Doubler v multiplie a_c par 4 ; doubler R la divise par 2 ; doubler m double la force nécessaire F mais la masse se simplifie dans la condition d&apos;adhérence v ≤ √(μₛgR). Ici, avec μₛ = {fmt(p.mu, 2)} : {ok ? `F = ${fmt(F, 1)} N ≤ ${fmt(fmax, 1)} N, l'adhérence suffit.` : `F = ${fmt(F, 1)} N > ${fmt(fmax, 1)} N, l'adhérence ne suffit pas.`}
        </p>
      ),
    },
  ];

  const bm = elargir(p.m, 500, 3000);
  const bv = elargir(p.v, 1, 40);
  const bR = elargir(p.R, 10, 200);
  const bg = elargir(p.g, 1, 20);

  return (
    <Cadre
      titre="Véhicule dans un virage"
      scene={
        <>
          <Scene p={p} t={t} o={o} realisable={realisable} />
          <Legende
            elements={[
              { symbole: "v", libelle: "vitesse (tangente)", couleur: CD.vitesse },
              { symbole: "a", libelle: "accélération (vers O)", couleur: CD.acceleration },
              { symbole: "F", libelle: "force horizontale de la route", couleur: CD.frottement },
            ]}
          />
          <p className="text-xs text-fh-ardoise/80">Vue de dessus : le poids et la réaction normale sont verticaux, donc non représentés (N = mg).</p>
        </>
      }
      commandes={<BarreLecture h={h} duree={duree} onReinitialiser={reprendre} />}
      scenarios={SCENARIOS.map(({ id, libelle }) => ({ id, libelle }))}
      scenarioActif={scen}
      onScenario={choisir}
      onReprendre={reprendre}
      alerte={
        !realisable ? (
          <Alerte>
            Adhérence insuffisante : il faudrait F = {fmt(F, 0)} N mais la route ne peut fournir que μₛmg = {fmt(fmax, 0)} N (v = {fmt(p.v, 1)} m/s &gt; v max = {fmt(vmax, 1)} m/s). Avec ce modèle, la trajectoire circulaire ne peut pas être maintenue : l&apos;animation du virage est arrêtée. Un dérapage demanderait un autre modèle (frottement de glissement), non traité ici.
          </Alerte>
        ) : undefined
      }
      principe={<p className="text-sm text-fh-ardoise">Vitesse de norme constante ne veut pas dire accélération nulle : la direction de v change, donc a = v²/R, dirigée vers le centre. La force nécessaire est F = m a.</p>}
      parametres={
        <>
          <Curseur etiquette="Masse m" valeur={p.m} min={bm.min} max={bm.max} pas={50} decimales={0} onChange={(v) => maj({ m: v })} unite="kg" />
          <Curseur etiquette="Vitesse v" valeur={p.v} min={bv.min} max={bv.max} pas={0.5} onChange={(v) => maj({ v })} unite="m/s" />
          <Curseur etiquette="Rayon R du virage" valeur={p.R} min={bR.min} max={bR.max} pas={1} decimales={0} onChange={(v) => maj({ R: v })} unite="m" />
          <Curseur etiquette="Gravité g" valeur={p.g} min={bg.min} max={bg.max} pas={0.5} onChange={(v) => maj({ g: v })} unite="m/s²" />
          <Interrupteur etiquette="Mode avancé : tester l'adhérence" coche={p.adherence} onChange={(v) => maj({ adherence: v })} />
          {p.adherence && <Curseur etiquette="Coefficient d'adhérence μₛ" valeur={p.mu} min={0.1} max={Math.max(1.2, p.mu)} pas={0.05} onChange={(v) => maj({ mu: v })} />}
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Force" coche={o.forces} onChange={bascule("forces")} />
          <Interrupteur etiquette="Vitesse" coche={o.vitesse} onChange={bascule("vitesse")} />
          <Interrupteur etiquette="Accélération" coche={o.acceleration} onChange={bascule("acceleration")} />
          <Interrupteur etiquette="Trajectoire" coche={o.trajectoire} onChange={bascule("trajectoire")} />
          <Interrupteur etiquette="Rayon" coche={o.axes} onChange={bascule("axes")} />
        </>
      }
      resultats={
        <>
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="Accélération a = v²/R">{fmt(a, 3)} m/s²</Valeur>
            <Valeur etiquette="Force F = mv²/R">{fmt(F, 1)} N</Valeur>
            <Valeur etiquette="Réaction N = mg">{fmt(N, 1)} N</Valeur>
            <Valeur etiquette="Vitesse angulaire ω">{fmt(omegaVirage(p), 3)} rad/s</Valeur>
            {p.adherence && (
              <>
                <Valeur etiquette="Force max μₛmg">{fmt(fmax, 1)} N</Valeur>
                <Valeur etiquette="Vitesse max √(μₛgR)">{fmt(vmax, 2)} m/s</Valeur>
                <Valeur etiquette="μₛ minimal v²/(gR)">{fmt(muMinimal(p), 3)}</Valeur>
                <Valeur etiquette="Adhérence">{ok ? "suffisante" : "insuffisante"}</Valeur>
              </>
            )}
          </div>
          <p className="rounded-lg bg-white px-3 py-2 text-xs text-fh-ardoise">
            Observe : à 2v, a = {fmt(accelerationCentripete({ ...p, v: 2 * p.v }), 2)} m/s² (×4) ; à 2R, a = {fmt(accelerationCentripete({ ...p, R: 2 * p.R }), 2)} m/s² (÷2) ; à 2m, F = {fmt(forceCentripete({ ...p, m: 2 * p.m }), 0)} N (×2).
          </p>
        </>
      }
      etapes={etapes}
      questions={questionsVirage(p)}
    />
  );
}
