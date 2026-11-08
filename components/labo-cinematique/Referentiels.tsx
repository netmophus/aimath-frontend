"use client";

import { useState } from "react";

import { EXEMPLES_REFERENTIELS, etatReferentiels, fr, type ParamsReferentiels } from "@/lib/cinematique";
import { BarreLecture, CI, Curseur, DeuxColonnes, FlechePx, Interrupteur, Panneau, Pastille, Tex, Valeur, ticksNets, useHorloge } from "./ui";

type Referentiel = "terre" | "vehicule";

interface Etat extends ParamsReferentiels {
  duree: number;
}

const D0 = EXEMPLES_REFERENTIELS[0];
const DEPART: Etat = { ...D0 };

/**
 * Scène : route, véhicule, passager, observateur. Les positions affichées sont celles du référentiel observé : dans le
 * référentiel du véhicule, le véhicule et son passager (assis) restent à leur place, la route et l'observateur défilent.
 */
function Scene({ p, t, ref_, vecteurs }: { p: Etat; t: number; ref_: Referentiel; vecteurs: boolean }) {
  const W = 480;
  const H = 290;
  const e = etatReferentiels(p, t);
  const pos = ref_ === "terre" ? e.terre : e.vehicule;
  const vit = ref_ === "terre" ? e.vitesseTerre : e.vitesseVehicule;
  // Cadre : dans le référentiel terrestre, la scène est fixe (elle couvre tout le trajet) ; dans celui du véhicule, elle est
  // centrée sur le véhicule (origine à 30 % de la largeur).
  const etendue = Math.max(20, Math.abs(p.vv) * p.duree + 14);
  const a0 = Math.min(p.xv0, p.xv0 + p.vv * p.duree);
  const b0 = Math.max(p.xv0, p.xv0 + p.vv * p.duree);
  const loTerre = Math.min(a0, p.xo) - 12;
  const hiTerre = Math.max(b0, p.xo) + 12;
  const lo = ref_ === "terre" ? loTerre : -etendue * 0.3;
  const largeurM = ref_ === "terre" ? Math.max(hiTerre - loTerre, 20) : etendue;
  const pxParM = (W - 80) / largeurM;
  const X = (x: number) => 40 + (x - lo) * pxParM;
  const SOL = 200;
  const ticks = ticksNets(lo, lo + largeurM, 10);
  const kv = Math.max(Math.abs(p.vv) + Math.abs(p.up), 1);
  const pxV = (v: number) => (v / kv) * 70;
  const xv = X(pos.vehicule);
  const xp = X(pos.passager);
  const xo = X(pos.observateur);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Scène vue depuis le référentiel ${ref_ === "terre" ? "terrestre" : "du véhicule"} à t = ${fr(t)} s`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#dbeafe] to-[#f0f9ff]">
      <text x={14} y={22} fontSize={15} fontWeight={700} fill={CI.profond}>
        Référentiel {ref_ === "terre" ? "terrestre" : "du véhicule"} · t = {fr(t)} s
      </text>
      <rect x={0} y={SOL} width={W} height={34} fill="#475569" />
      {ticks.map((m) => (
        <g key={m}>
          <line x1={X(m)} y1={SOL} x2={X(m)} y2={SOL + 8} stroke="#e2e8f0" strokeWidth={1.4} />
          <text x={X(m)} y={SOL + 26} textAnchor="middle" fontSize={13} fill="#e2e8f0">
            {fr(m, 0)}
          </text>
        </g>
      ))}
      <text x={W - 12} y={SOL + 50} textAnchor="end" fontSize={13} fontWeight={700} fill="#334155">
        x (m), origine liée au {ref_ === "terre" ? "sol" : "véhicule"}
      </text>
      {/* observateur immobile sur le bord de la route (dans le référentiel terrestre) */}
      <g>
        <circle cx={xo} cy={SOL - 44} r={8} fill="#f59e0b" stroke="#fff" strokeWidth={2} />
        <line x1={xo} y1={SOL - 36} x2={xo} y2={SOL - 8} stroke="#92400e" strokeWidth={4} strokeLinecap="round" />
        <line x1={xo} y1={SOL - 28} x2={xo - 9} y2={SOL - 16} stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
        <line x1={xo} y1={SOL - 28} x2={xo + 9} y2={SOL - 16} stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
        <line x1={xo} y1={SOL - 8} x2={xo - 7} y2={SOL} stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
        <line x1={xo} y1={SOL - 8} x2={xo + 7} y2={SOL} stroke="#92400e" strokeWidth={3} strokeLinecap="round" />
        <text x={xo} y={SOL - 60} textAnchor="middle" fontSize={14} fontWeight={700} fill="#92400e">
          Observateur
        </text>
      </g>
      {/* véhicule */}
      <g>
        <rect x={xv - 56} y={SOL - 44} width={112} height={32} rx={9} fill={CI.position} stroke="#fff" strokeWidth={2.2} />
        <rect x={xv - 36} y={SOL - 66} width={70} height={26} rx={8} fill="#60a5fa" stroke="#fff" strokeWidth={2.2} />
        <circle cx={xv - 30} cy={SOL - 12} r={11} fill="#1e293b" stroke="#fff" strokeWidth={2} />
        <circle cx={xv + 30} cy={SOL - 12} r={11} fill="#1e293b" stroke="#fff" strokeWidth={2} />
        <text x={xv} y={SOL - 72} textAnchor="middle" fontSize={14} fontWeight={700} fill={CI.position} stroke="#fff" strokeWidth={3} paintOrder="stroke">
          Véhicule
        </text>
      </g>
      {/* passager */}
      <g>
        <circle cx={xp} cy={SOL - 54} r={8} fill={CI.vitesse} stroke="#fff" strokeWidth={2} />
        <line x1={xp} y1={SOL - 46} x2={xp} y2={SOL - 34} stroke="#065f46" strokeWidth={5} strokeLinecap="round" />
        <text x={xp} y={SOL - 84} textAnchor="middle" fontSize={14} fontWeight={700} fill="#065f46" stroke="#fff" strokeWidth={3} paintOrder="stroke">
          Passager
        </text>
      </g>
      {vecteurs && (
        <g>
          {[
            { x: xo, y: 62, v: vit.observateur, c: "#92400e", n: "observateur" },
            { x: xv, y: 52, v: vit.vehicule, c: CI.position, n: "véhicule" },
            { x: xp, y: 108, v: vit.passager, c: CI.vitesse, n: "passager" },
          ].map((f) => (
            <g key={f.n}>
              {Math.abs(pxV(f.v)) >= 2 ? <FlechePx x1={f.x} y1={f.y} x2={f.x + pxV(f.v)} y2={f.y} couleur={f.c} epaisseur={3.4} /> : <circle cx={f.x} cy={f.y} r={4} fill={f.c} />}
              <text x={f.x + (f.v >= 0 ? 4 : -4)} y={f.y - 7} textAnchor={f.v >= 0 ? "start" : "end"} fontSize={13.5} fontWeight={700} fill={f.c} stroke="#fff" strokeWidth={3} paintOrder="stroke">
                {fr(f.v, 2)} m/s
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/** Schéma simplifié de référentiels usuels (pédagogique, non à l'échelle, aucune simulation astronomique). */
function SchemaReferentiels() {
  return (
    <svg viewBox="0 0 640 190" role="img" aria-label="Schéma simplifié des référentiels terrestre, géocentrique et de Copernic (non à l'échelle)" className="mx-auto block h-auto w-full rounded-xl border border-[#dbe7ff] bg-white select-none">
      <text x={320} y={18} textAnchor="middle" fontSize={12} fontWeight={700} fill="#475569">
        Schéma simplifié, non à l&apos;échelle
      </text>
      {/* Soleil / Copernic */}
      <circle cx={80} cy={100} r={26} fill="#fbbf24" stroke="#f59e0b" strokeWidth={2} />
      <FlechePx x1={80} y1={100} x2={150} y2={100} couleur={CI.alerte} epaisseur={2.4} />
      <FlechePx x1={80} y1={100} x2={80} y2={40} couleur={CI.alerte} epaisseur={2.4} />
      <text x={80} y={150} textAnchor="middle" fontSize={14} fontWeight={700} fill="#92400e">Copernic</text>
      <text x={80} y={166} textAnchor="middle" fontSize={10.5} fill="#475569">origine : centre du Soleil</text>
      <text x={80} y={180} textAnchor="middle" fontSize={10.5} fill="#475569">axes vers 3 étoiles lointaines</text>
      {/* orbite de la Terre */}
      <ellipse cx={80} cy={100} rx={150} ry={62} fill="none" stroke="#94a3b8" strokeDasharray="5 4" />
      {/* Terre / géocentrique */}
      <circle cx={330} cy={100} r={22} fill="#38bdf8" stroke="#0284c7" strokeWidth={2} />
      <FlechePx x1={330} y1={100} x2={400} y2={100} couleur={CI.normale} epaisseur={2.4} />
      <FlechePx x1={330} y1={100} x2={330} y2={40} couleur={CI.normale} epaisseur={2.4} />
      <text x={330} y={150} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#0369a1">Géocentrique</text>
      <text x={330} y={166} textAnchor="middle" fontSize={10.5} fill="#475569">origine : centre de la Terre</text>
      <text x={330} y={180} textAnchor="middle" fontSize={10.5} fill="#475569">axes parallèles à ceux de Copernic</text>
      {/* point à la surface / terrestre */}
      <circle cx={560} cy={110} r={34} fill="#bbf7d0" stroke="#16a34a" strokeWidth={2} />
      <circle cx={560} cy={76} r={5} fill={CI.vitesse} stroke="#fff" strokeWidth={2} />
      <FlechePx x1={560} y1={76} x2={615} y2={76} couleur={CI.vitesse} epaisseur={2.4} />
      <FlechePx x1={560} y1={76} x2={560} y2={34} couleur={CI.vitesse} epaisseur={2.4} />
      <text x={560} y={166} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#166534">Terrestre</text>
      <text x={560} y={180} textAnchor="middle" fontSize={10.5} fill="#475569">origine : un point lié au sol</text>
    </svg>
  );
}

/** Référentiels : même mobile, mouvements différents selon le référentiel d'observation. */
export default function Referentiels() {
  const [p, setP] = useState<Etat>(DEPART);
  const [exemple, setExemple] = useState<string | null>(D0.id);
  const [ref_, setRef] = useState<Referentiel>("terre");
  const [vecteurs, setVecteurs] = useState(true);
  const [calculs, setCalculs] = useState(true);
  const h = useHorloge(p.duree);
  const t = h.t;
  const modifier = (m: Partial<Etat>) => {
    setP((q) => ({ ...q, ...m }));
    setExemple(null);
  };
  const choisir = (id: string) => {
    const e = EXEMPLES_REFERENTIELS.find((x) => x.id === id);
    if (!e) return;
    setP({ ...e });
    setExemple(id);
    h.arreter();
  };
  const reinit = () => {
    setP(DEPART);
    setExemple(D0.id);
    setRef("terre");
    h.arreter();
  };
  const e = etatReferentiels(p, t);
  const pos = ref_ === "terre" ? e.terre : e.vehicule;
  const vit = ref_ === "terre" ? e.vitesseTerre : e.vitesseVehicule;
  const immobile = Math.abs(vit.passager) < 1e-12;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Paramètres">
              <div role="group" aria-label="Situations" className="flex flex-wrap gap-2">
                {EXEMPLES_REFERENTIELS.map((x) => (
                  <Pastille key={x.id} actif={exemple === x.id} onClick={() => choisir(x.id)}>
                    {x.libelle}
                  </Pastille>
                ))}
              </div>
              <div role="radiogroup" aria-label="Référentiel observé" className="flex flex-wrap gap-2">
                <Pastille actif={ref_ === "terre"} onClick={() => setRef("terre")}>
                  Référentiel terrestre
                </Pastille>
                <Pastille actif={ref_ === "vehicule"} onClick={() => setRef("vehicule")}>
                  Référentiel du véhicule
                </Pastille>
              </div>
              <div className="flex flex-col gap-3">
                <Curseur etiquette="Vitesse du véhicule (par rapport à la Terre)" valeur={p.vv} min={-30} max={30} pas={0.5} onChange={(v) => modifier({ vv: v })} unite="m/s" />
                <Curseur etiquette="Position initiale du véhicule" valeur={p.xv0} min={-60} max={20} pas={1} decimales={0} onChange={(v) => modifier({ xv0: v })} unite="m" />
                <Curseur etiquette="Vitesse du passager (par rapport au véhicule)" valeur={p.up} min={-5} max={5} pas={0.5} onChange={(v) => modifier({ up: v })} unite="m/s" />
                <Curseur etiquette="Durée de la simulation" valeur={p.duree} min={1} max={20} pas={0.5} onChange={(v) => modifier({ duree: v })} unite="s" />
              </div>
              <div className="flex flex-wrap gap-x-5">
                <Interrupteur etiquette="Afficher les vecteurs" coche={vecteurs} onChange={setVecteurs} />
                <Interrupteur etiquette="Afficher les calculs" coche={calculs} onChange={setCalculs} />
              </div>
            </Panneau>
            <Panneau titre="Commandes">
              <BarreLecture h={h} duree={p.duree} onReinitialiser={reinit} />
            </Panneau>
          </>
        }
        droite={
          <>
            <Panneau titre="Simulation">
              <Scene p={p} t={t} ref_={ref_} vecteurs={vecteurs} />
              <p className="text-xs text-fh-ardoise/70">Les flèches de vitesse ont des longueurs proportionnelles à leurs valeurs, dans le référentiel observé.</p>
            </Panneau>
            <Panneau titre={`Dans le référentiel ${ref_ === "terre" ? "terrestre" : "du véhicule"}`} ton="resultat">
              <div className="grid grid-cols-2 gap-2">
                <Valeur etiquette="Position du passager">{fr(pos.passager, 2)} m</Valeur>
                <Valeur etiquette="Vitesse du passager">{fr(vit.passager, 2)} m/s</Valeur>
                <Valeur etiquette="Position de l'observateur">{fr(pos.observateur, 2)} m</Valeur>
                <Valeur etiquette="Vitesse de l'observateur">{fr(vit.observateur, 2)} m/s</Valeur>
              </div>
              <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900">
                {immobile ? "Le passager est immobile dans ce référentiel." : "Le passager est en mouvement dans ce référentiel."} Le mouvement dépend du référentiel d&apos;observation.
              </p>
            </Panneau>
          </>
        }
      />
      {calculs && (
        <Panneau titre="Composition des mouvements" ton="explication">
          <div className="flex min-w-0 flex-col gap-2">
            <Tex bloc expr={`x_{P/T} = x_{V/T} + x_{P/V} = ${fr(e.terre.vehicule, 2)} ${e.vehicule.passager < 0 ? "-" : "+"} ${fr(Math.abs(e.vehicule.passager), 2)} = ${fr(e.terre.passager, 2)}\\ \\text{m}`} />
            <Tex bloc expr={`v_{P/T} = v_{V/T} + v_{P/V} = ${fr(p.vv, 2)} ${p.up < 0 ? "-" : "+"} ${fr(Math.abs(p.up), 2)} = ${fr(e.vitesseTerre.passager, 2)}\\ \\text{m/s}`} />
            <p className="text-sm text-fh-ardoise">
              Valable pour une translation rectiligne uniforme du véhicule par rapport à la Terre (T : Terre, V : véhicule, P : passager). Dans le référentiel du véhicule, l&apos;observateur au bord de la route a la vitesse −v<sub>V/T</sub> = {fr(-p.vv, 2)} m/s.
            </p>
          </div>
        </Panneau>
      )}
      <Panneau titre="Quelques référentiels usuels" ton="explication">
        <div className="w-0 min-w-full overflow-x-auto">
          <div className="min-w-[34rem]">
            <SchemaReferentiels />
          </div>
        </div>
        <p className="text-xs text-fh-ardoise/80">Présentation pédagogique simplifiée : ce schéma n&apos;est pas une simulation astronomique ; il situe seulement l&apos;origine et la direction des axes de chaque référentiel.</p>
      </Panneau>
    </div>
  );
}
