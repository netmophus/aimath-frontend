"use client";

import { useState } from "react";

import {
  EXEMPLES_MRUV,
  bornesMRUV,
  deplacementMRUV,
  distanceParcourueMRUV,
  distancesSuccessives,
  fr,
  instantArret,
  natureMRUV,
  positionMRUV,
  vitesseMRUV,
  type ParamsMRUV,
} from "@/lib/cinematique";
import { BarreLecture, CI, Curseur, DeuxColonnes, FlechePx, Graphique, Interrupteur, Panneau, Pastille, Tex, Valeur, echellePx, ticksNets, useHorloge } from "./ui";

const LIBELLE_NATURE = {
  repos: "Repos",
  uniforme: "Mouvement uniforme (|v| constante)",
  accelere: "Mouvement accéléré (|v| augmente)",
  retarde: "Mouvement retardé (|v| diminue)",
} as const;

interface Etat extends ParamsMRUV {
  duree: number;
}

const DEPART: Etat = { x0: EXEMPLES_MRUV[0].x0, v0: EXEMPLES_MRUV[0].v0, a: EXEMPLES_MRUV[0].a, duree: EXEMPLES_MRUV[0].duree };

/** Signe explicite pour une formule : « + 3 » ou « − 3 » (dans une somme). */
const termeTex = (x: number, corps: string) => (x < 0 ? `- ${fr(Math.abs(x), 3)}${corps}` : `+ ${fr(x, 3)}${corps}`);

/**
 * Piste horizontale graduée : position du mobile, vecteurs vitesse et accélération (longueurs proportionnelles aux valeurs,
 * sens fidèle au signe), déplacement depuis l'origine. L'axe couvre toujours l'origine et toutes les positions atteintes :
 * les abscisses négatives restent à gauche de O.
 */
function Piste({ p, duree, t, vecteurs }: { p: Etat; duree: number; t: number; vecteurs: boolean }) {
  const W = 520;
  const H = 270;
  const PAD = 84;
  const b = bornesMRUV(p, duree);
  const span = Math.max(b.max - b.min, 10);
  const lo = b.min - (span - (b.max - b.min)) / 2;
  const pxParM = (W - 2 * PAD) / span;
  const X = (x: number) => PAD + (x - lo) * pxParM;
  const x = positionMRUV(p, t);
  const v = vitesseMRUV(p, t);
  let vmax = Math.abs(p.v0);
  vmax = Math.max(vmax, Math.abs(vitesseMRUV(p, duree)));
  const kv = echellePx(vmax, 76);
  const ka = echellePx(Math.abs(p.a), 60);
  const ticks = ticksNets(lo, lo + span, 9);
  const SOL = 180;
  const cx = X(x);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Piste graduée : mobile en x = ${fr(x)} m à t = ${fr(t)} s, vitesse ${fr(v)} m/s, accélération ${fr(p.a)} m/s²`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={14} y={26} fontSize={17} fontWeight={700} fill={CI.profond}>
        t = {fr(t)} s
      </text>
      <line x1={14} y1={SOL} x2={W - 14} y2={SOL} stroke="#334155" strokeWidth={2} />
      {ticks.map((m) => (
        <g key={m}>
          <line x1={X(m)} y1={SOL - 5} x2={X(m)} y2={SOL + 5} stroke="#334155" strokeWidth={1.4} />
          <text x={X(m)} y={SOL + 20} textAnchor="middle" fontSize={13} fill="#64748b">
            {fr(m, m % 1 === 0 ? 0 : 1)}
          </text>
        </g>
      ))}
      <text x={W - 14} y={SOL + 40} textAnchor="end" fontSize={14} fontWeight={700} fill="#334155">
        x (m)
      </text>
      <line x1={X(0)} y1={SOL - 70} x2={X(0)} y2={SOL + 8} stroke="#334155" strokeWidth={1.2} strokeDasharray="4 4" />
      <text x={X(0)} y={SOL - 74} textAnchor="middle" fontSize={15} fontWeight={700} fill="#334155">
        O
      </text>
      {/* déplacement algébrique depuis l'origine */}
      {vecteurs && Math.abs(cx - X(0)) > 2 && <FlechePx x1={X(0)} y1={SOL + 58} x2={cx} y2={SOL + 58} couleur={CI.position} epaisseur={3} />}
      {vecteurs && (
        <text x={(X(0) + cx) / 2} y={SOL + 52} textAnchor="middle" fontSize={14} fontWeight={700} fill={CI.position}>
          x = {fr(x)} m
        </text>
      )}
      {/* mobile */}
      <g>
        <rect x={cx - 28} y={SOL - 32} width={56} height={26} rx={6} fill={CI.position} stroke="#fff" strokeWidth={2} />
        <rect x={cx - 18} y={SOL - 46} width={34} height={16} rx={5} fill="#60a5fa" stroke="#fff" strokeWidth={2} />
        <circle cx={cx - 16} cy={SOL - 5} r={7.5} fill="#1e293b" stroke="#fff" strokeWidth={1.5} />
        <circle cx={cx + 16} cy={SOL - 5} r={7.5} fill="#1e293b" stroke="#fff" strokeWidth={1.5} />
      </g>
      {vecteurs && (
        <g>
          {Math.abs(v * kv) >= 2 ? (
            <FlechePx x1={cx} y1={SOL - 62} x2={cx + v * kv} y2={SOL - 62} couleur={CI.vitesse} />
          ) : (
            <circle cx={cx} cy={SOL - 62} r={3.5} fill={CI.vitesse} />
          )}
          <text x={cx + (v >= 0 ? 8 : -8)} y={SOL - 70} textAnchor={v >= 0 ? "start" : "end"} fontSize={14.5} fontWeight={700} fill={CI.vitesse} stroke="#fff" strokeWidth={3} paintOrder="stroke">
            v = {fr(v)} m/s
          </text>
          {Math.abs(p.a * ka) >= 2 ? (
            <FlechePx x1={cx} y1={SOL - 102} x2={cx + p.a * ka} y2={SOL - 102} couleur={CI.acceleration} />
          ) : (
            <circle cx={cx} cy={SOL - 102} r={3.5} fill={CI.acceleration} />
          )}
          <text x={cx + (p.a >= 0 ? 8 : -8)} y={SOL - 110} textAnchor={p.a >= 0 ? "start" : "end"} fontSize={14.5} fontWeight={700} fill={CI.acceleration} stroke="#fff" strokeWidth={3} paintOrder="stroke">
            a = {fr(p.a)} m/s²
          </text>
        </g>
      )}
    </svg>
  );
}

/** Onglet « MRU / MRUV » : piste animée, trois graphiques synchronisés, calculs détaillés. */
export default function Mru() {
  const [p, setP] = useState<Etat>(DEPART);
  const [exemple, setExemple] = useState<string | null>(EXEMPLES_MRUV[0].id);
  const [vecteurs, setVecteurs] = useState(true);
  const [calculs, setCalculs] = useState(true);
  const h = useHorloge(p.duree);
  const t = h.t;
  const modifier = (m: Partial<Etat>) => {
    setP((q) => ({ ...q, ...m }));
    setExemple(null);
  };
  const choisir = (id: string) => {
    const e = EXEMPLES_MRUV.find((x) => x.id === id);
    if (!e) return;
    setP({ x0: e.x0, v0: e.v0, a: e.a, duree: e.duree });
    setExemple(id);
    h.arreter();
  };
  const reinit = () => {
    setP(DEPART);
    setExemple(EXEMPLES_MRUV[0].id);
    h.arreter();
  };

  const x = positionMRUV(p, t);
  const v = vitesseMRUV(p, t);
  const ta = instantArret(p);
  const nature = natureMRUV(p, t);
  const dep = deplacementMRUV(p, t);
  const dist = distanceParcourueMRUV(p, t);
  const sensChange = ta !== null && ta < t;
  const succ = distancesSuccessives(p, Math.min(6, Math.floor(p.duree)));
  const avantArret = ta === null ? succ.length : succ.filter((_, i) => i + 1 <= ta + 1e-9).length;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Paramètres">
              <div role="group" aria-label="Situations prédéfinies" className="flex flex-wrap gap-2">
                {EXEMPLES_MRUV.map((e) => (
                  <Pastille key={e.id} actif={exemple === e.id} onClick={() => choisir(e.id)}>
                    {e.libelle}
                  </Pastille>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <Curseur etiquette="Position initiale x₀" valeur={p.x0} min={-50} max={50} pas={0.5} onChange={(v0) => modifier({ x0: v0 })} unite="m" />
                <Curseur etiquette="Vitesse initiale v₀ (algébrique)" valeur={p.v0} min={-30} max={30} pas={0.5} onChange={(v0) => modifier({ v0 })} unite="m/s" />
                <Curseur etiquette="Accélération a (algébrique)" valeur={p.a} min={-10} max={10} pas={0.5} onChange={(a) => modifier({ a })} unite="m/s²" />
                <Curseur etiquette="Durée de la simulation" valeur={p.duree} min={1} max={30} pas={0.5} onChange={(d) => modifier({ duree: d })} unite="s" />
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
              <Piste p={p} duree={p.duree} t={t} vecteurs={vecteurs} />
              <p className="text-xs text-fh-ardoise/70">Longueur des flèches proportionnelle à la valeur (échelle propre à la vitesse et à l&apos;accélération) ; leur sens est celui du signe.</p>
            </Panneau>
            <Panneau titre="Résultats à l'instant t" ton="resultat">
              <div className="grid grid-cols-2 gap-2">
                <Valeur etiquette="Position x(t)">{fr(x)} m</Valeur>
                <Valeur etiquette="Vitesse algébrique vₓ">{fr(v)} m/s</Valeur>
                <Valeur etiquette="Norme |vₓ|">{fr(Math.abs(v))} m/s</Valeur>
                <Valeur etiquette="Accélération aₓ">{fr(p.a)} m/s²</Valeur>
                <Valeur etiquette="Déplacement Δx = x(t) − x₀">{fr(dep)} m</Valeur>
                <Valeur etiquette="Distance parcourue d">{fr(dist)} m</Valeur>
                <Valeur etiquette="Instant d'arrêt">{ta === null ? "aucun (v ne s'annule pas)" : `${fr(ta)} s`}</Valeur>
                <Valeur etiquette="Nature">{LIBELLE_NATURE[nature]}</Valeur>
              </div>
              {sensChange && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  Le mobile a changé de sens à t = {fr(ta!)} s : la distance parcourue ({fr(dist)} m) n&apos;est pas la valeur absolue du déplacement ({fr(Math.abs(dep))} m).
                </p>
              )}
            </Panneau>
          </>
        }
      />
      <Panneau titre="Graphiques synchronisés">
        <div className="grid min-w-0 gap-3 md:grid-cols-2 [&>*:last-child:nth-child(odd)]:md:col-span-2">
          <Graphique titre="Position" unite="x (m)" series={[{ f: (s) => positionMRUV(p, s), couleur: CI.position, libelle: "x(t)" }]} duree={p.duree} t={t} onT={(s) => { h.pause(); h.setT(s); }} reperes={ta !== null && ta < p.duree ? [{ t: ta, libelle: "arrêt" }] : []} />
          <Graphique titre="Vitesse algébrique" unite="vₓ (m/s)" series={[{ f: (s) => vitesseMRUV(p, s), couleur: CI.vitesse, libelle: "vₓ(t)" }]} duree={p.duree} t={t} onT={(s) => { h.pause(); h.setT(s); }} reperes={ta !== null && ta < p.duree ? [{ t: ta, libelle: "arrêt" }] : []} />
          <Graphique titre="Accélération" unite="aₓ (m/s²)" series={[{ f: () => p.a, couleur: CI.acceleration, libelle: "aₓ(t)" }]} duree={p.duree} t={t} onT={(s) => { h.pause(); h.setT(s); }} />
        </div>
      </Panneau>
      {calculs && (
        <Panneau titre="Calculs" ton="explication">
          <div className="flex min-w-0 flex-col gap-2">
            <Tex bloc expr={`v_x(t) = v_0 + a\\,t = ${fr(p.v0, 3)} ${termeTex(p.a, "\\times " + fr(t, 2))} = ${fr(v, 3)}\\ \\text{m/s}`} />
            <Tex bloc expr={`x(t) = x_0 + v_0\\,t + \\tfrac{1}{2}\\,a\\,t^2 = ${fr(p.x0, 3)} ${termeTex(p.v0, "\\times " + fr(t, 2))} ${termeTex(p.a / 2, "\\times " + fr(t, 2) + "^2")} = ${fr(x, 3)}\\ \\text{m}`} />
            <Tex bloc expr={`\\Delta x = x(t) - x_0 = ${fr(dep, 3)}\\ \\text{m} \\qquad d = \\int_0^t |v_x|\\,\\mathrm{d}u = ${fr(dist, 3)}\\ \\text{m}`} />
            {ta !== null ? <Tex bloc expr={`v_x(t_{\\text{arrêt}}) = 0 \\;\\Rightarrow\\; t_{\\text{arrêt}} = -\\dfrac{v_0}{a} = ${fr(ta, 3)}\\ \\text{s}\\qquad x(t_{\\text{arrêt}}) = ${fr(positionMRUV(p, ta), 3)}\\ \\text{m}`} /> : <p className="text-sm text-fh-ardoise">La vitesse ne s&apos;annule pour aucun t &gt; 0 : pas d&apos;instant d&apos;arrêt.</p>}
            <div className="rounded-lg border border-[#dbe7ff] bg-white px-3 py-2 text-sm text-fh-ardoise">
              <p className="font-semibold text-[#102A66]">Distances parcourues pendant chaque seconde</p>
              <p className="mt-1">{succ.map((d) => `${fr(d)} m`).join(" ; ")}</p>
              {p.a !== 0 && avantArret >= 3 && (
                <p className="mt-1 text-xs text-fh-ardoise/80">
                  Progression arithmétique de raison a·τ² = {fr(p.a)} m tant que le mobile ne change pas de sens (τ = 1 s).
                </p>
              )}
            </div>
          </div>
        </Panneau>
      )}
    </div>
  );
}
