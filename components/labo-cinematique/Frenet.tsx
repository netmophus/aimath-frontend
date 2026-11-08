"use client";

import { useMemo, useState } from "react";

import { EXEMPLES_FRENET, effectifsFrenet, etatFrenet, fr, norme, polaire, produit, somme, type ParamsFrenet, type Vec } from "@/lib/cinematique";
import { BarreLecture, CI, Curseur, DeuxColonnes, Etiquette, FlechePx, Graphique, Interrupteur, Mobile, Panneau, Pastille, PlanPhysique, Tex, Trace, Valeur, cadreOrthonorme, useHorloge } from "./ui";

interface Etat extends ParamsFrenet {
  duree: number;
}

const D0 = EXEMPLES_FRENET[2];
const DEPART: Etat = { mode: D0.mode, Rc: D0.Rc, v0: D0.v0, aT: D0.aT, s0: D0.s0, duree: D0.duree };

const TITRES = { tangentielle: "Accélération tangentielle seule", normale: "Accélération normale seule", composee: "Accélération composée" } as const;
const COMMENTAIRES = {
  tangentielle: "Trajectoire rectiligne : la direction de v ne change pas (aN = 0), seule la norme varie.",
  normale: "Mouvement circulaire uniforme : la norme de v est constante (aT = 0), seule sa direction change.",
  composee: "Mouvement circulaire non uniforme : la norme ET la direction de v varient.",
} as const;

/**
 * Repère de Frenet. Le mouvement simulé est réel : abscisse curviligne s(t) = s₀ + v₀t + ½·aT·t² sur une trajectoire de
 * rayon de courbure Rc constant (cercle de centre O) ou rectiligne. Les composantes affichées sont celles de ce mouvement.
 */
export default function Frenet() {
  const [p, setP] = useState<Etat>(DEPART);
  const [exemple, setExemple] = useState<string | null>(D0.id);
  const [vecteurs, setVecteurs] = useState(true);
  const [calculs, setCalculs] = useState(true);
  const h = useHorloge(p.duree);
  const t = h.t;
  const modifier = (m: Partial<Etat>) => {
    setP((q) => ({ ...q, ...m }));
    setExemple(null);
  };
  const choisir = (id: string) => {
    const e = EXEMPLES_FRENET.find((x) => x.id === id);
    if (!e) return;
    setP({ mode: e.mode, Rc: e.Rc, v0: e.v0, aT: e.aT, s0: e.s0, duree: e.duree });
    setExemple(id);
    h.arreter();
  };
  const reinit = () => {
    setP(DEPART);
    setExemple(D0.id);
    h.arreter();
  };

  const eff = effectifsFrenet(p);
  const e = etatFrenet(p, t);
  const droite = !Number.isFinite(eff.Rc);

  // Cadre fixe pour toute la simulation : trajectoire entière (cercle complet ou segment parcouru) + marge pour les flèches.
  const { bornes, trajet, vmax, amax } = useMemo(() => {
    const echant: Vec[] = [];
    let vm = 0;
    let am = 0;
    for (let i = 0; i <= 60; i++) {
      const s = etatFrenet(p, (p.duree * i) / 60);
      echant.push(s.position);
      vm = Math.max(vm, Math.abs(s.v));
      am = Math.max(am, norme(s.acceleration));
    }
    const rc = effectifsFrenet(p).Rc;
    const pts = Number.isFinite(rc) ? [{ x: -rc, y: -rc }, { x: rc, y: rc }] : echant;
    return { bornes: cadreOrthonorme(pts, { marge: 0.3, minimum: Number.isFinite(rc) ? 1 : 6 }), trajet: Number.isFinite(rc) ? Array.from({ length: 121 }, (_, i) => polaire(rc, (2 * Math.PI * i) / 120)) : [echant[0], echant[echant.length - 1]], vmax: vm, amax: am };
  }, [p]);
  const taille = Math.min(bornes.xmax - bornes.xmin, (bornes.ymax - bornes.ymin) * 1.15);
  const kv = vmax > 1e-9 ? (0.28 * taille) / vmax : 1;
  const ka = amax > 1e-9 ? (0.28 * taille) / amax : 1;
  const unite = 0.1 * taille; // longueur des vecteurs unitaires T et N

  const M = e.position;
  const arrivee = (v: Vec): Vec => somme(M, v);
  const finT = arrivee(produit(unite, e.T));
  const Nv = e.N;
  const norm_a = norme(e.acceleration);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Paramètres">
              <div role="group" aria-label="Modes" className="flex flex-wrap gap-2">
                {EXEMPLES_FRENET.map((x) => (
                  <Pastille key={x.id} actif={exemple === x.id} onClick={() => choisir(x.id)}>
                    {TITRES[x.mode]}
                  </Pastille>
                ))}
              </div>
              <p className="text-xs text-fh-ardoise/80">{COMMENTAIRES[p.mode]}</p>
              <div className="flex flex-col gap-3">
                <Curseur etiquette="Vitesse initiale v₀ (le long de la trajectoire)" valeur={p.v0} min={-10} max={10} pas={0.1} onChange={(v) => modifier({ v0: v })} unite="m/s" />
                {p.mode !== "normale" ? (
                  <Curseur etiquette="Accélération tangentielle aT" valeur={p.aT} min={-5} max={5} pas={0.1} onChange={(v) => modifier({ aT: v })} unite="m/s²" />
                ) : (
                  <Valeur etiquette="Accélération tangentielle aT">0 (imposée par le mode normal : la norme de v reste constante)</Valeur>
                )}
                {p.mode !== "tangentielle" ? (
                  <Curseur etiquette="Rayon de courbure Rc" valeur={p.Rc} min={0.5} max={20} pas={0.5} onChange={(v) => modifier({ Rc: v })} unite="m" />
                ) : (
                  <Valeur etiquette="Rayon de courbure Rc">∞ (trajectoire rectiligne)</Valeur>
                )}
                <Curseur etiquette="Durée de la simulation" valeur={p.duree} min={1} max={30} pas={0.5} onChange={(v) => modifier({ duree: v })} unite="s" />
              </div>
              <div className="flex flex-wrap gap-x-5">
                <Interrupteur etiquette="Afficher les vecteurs" coche={vecteurs} onChange={setVecteurs} />
                <Interrupteur etiquette="Afficher les calculs" coche={calculs} onChange={setCalculs} />
              </div>
            </Panneau>
            <Panneau titre="Commandes">
              <BarreLecture h={h} duree={p.duree} onReinitialiser={reinit} instantEtiquette="Position du mobile (instant t)" />
            </Panneau>
          </>
        }
        droite={
          <>
            <Panneau titre="Simulation">
              <PlanPhysique bornes={bornes} etiquette={`Repère de Frenet au point M : vitesse ${fr(e.v)} m/s, aT = ${fr(e.aT)} m/s², aN = ${fr(e.aN)} m/s²`}>
                {(o) => (
                  <g>
                    <Trace o={o} pts={trajet} couleur="#94a3b8" epaisseur={2.2} />
                    {e.centre && (
                      <g>
                        <line x1={o.X(M.x)} y1={o.Y(M.y)} x2={o.X(e.centre.x)} y2={o.Y(e.centre.y)} stroke="#c4b5fd" strokeWidth={1.6} strokeDasharray="5 4" />
                        <circle cx={o.X(e.centre.x)} cy={o.Y(e.centre.y)} r={4.5} fill={CI.normale} />
                        <Etiquette x={o.X(e.centre.x) + 8} y={o.Y(e.centre.y) + 16} couleur={CI.normale}>
                          C
                        </Etiquette>
                      </g>
                    )}
                    {vecteurs && (
                      <g>
                        {/* repère de Frenet : vecteurs unitaires */}
                        <FlechePx x1={o.X(M.x)} y1={o.Y(M.y)} x2={o.X(finT.x)} y2={o.Y(finT.y)} couleur={CI.tangente} epaisseur={2.4} />
                        <Etiquette x={o.X(finT.x) + 5} y={o.Y(finT.y) - 5} couleur={CI.tangente}>
                          T
                        </Etiquette>
                        {Nv && (
                          <g>
                            <FlechePx x1={o.X(M.x)} y1={o.Y(M.y)} x2={o.X(M.x + unite * Nv.x)} y2={o.Y(M.y + unite * Nv.y)} couleur={CI.normale} epaisseur={2.4} />
                            <Etiquette x={o.X(M.x + unite * Nv.x) + 5} y={o.Y(M.y + unite * Nv.y) - 5} couleur={CI.normale}>
                              N
                            </Etiquette>
                          </g>
                        )}
                        {/* vitesse */}
                        <FlechePx x1={o.X(M.x)} y1={o.Y(M.y)} x2={o.X(M.x + kv * e.vitesse.x)} y2={o.Y(M.y + kv * e.vitesse.y)} couleur={CI.vitesse} epaisseur={3.4} />
                        <Etiquette x={o.X(M.x + kv * e.vitesse.x) + 6} y={o.Y(M.y + kv * e.vitesse.y) + 16} couleur={CI.vitesse}>
                          v
                        </Etiquette>
                        {/* composantes de l'accélération et résultante */}
                        {e.aT !== 0 && <FlechePx x1={o.X(M.x)} y1={o.Y(M.y)} x2={o.X(M.x + ka * e.aT * e.T.x)} y2={o.Y(M.y + ka * e.aT * e.T.y)} couleur={CI.tangente} epaisseur={2.2} pointille />}
                        {Nv && e.aN > 1e-9 && <FlechePx x1={o.X(M.x)} y1={o.Y(M.y)} x2={o.X(M.x + ka * e.aN * Nv.x)} y2={o.Y(M.y + ka * e.aN * Nv.y)} couleur={CI.normale} epaisseur={2.2} pointille />}
                        {norm_a > 1e-9 && (
                          <g>
                            <FlechePx x1={o.X(M.x)} y1={o.Y(M.y)} x2={o.X(M.x + ka * e.acceleration.x)} y2={o.Y(M.y + ka * e.acceleration.y)} couleur={CI.acceleration} epaisseur={3.4} />
                            <Etiquette x={o.X(M.x + ka * e.acceleration.x) + 6} y={o.Y(M.y + ka * e.acceleration.y) - 6} couleur={CI.acceleration}>
                              a
                            </Etiquette>
                          </g>
                        )}
                      </g>
                    )}
                    <Mobile o={o} p={M} />
                    <text x={10} y={20} fontSize={13} fontWeight={700} fill={CI.profond}>
                      t = {fr(t)} s
                    </text>
                  </g>
                )}
              </PlanPhysique>
              <p className="text-xs text-fh-ardoise/70">
                T et N : vecteurs unitaires (longueur de dessin identique). Vitesse (vert) et accélération (orange) : longueurs proportionnelles aux valeurs ; pointillés : composantes aT (cyan) et aN (violet, toujours vers le centre de courbure C).
              </p>
            </Panneau>
            <Panneau titre="Résultats au point M" ton="resultat">
              <div className="grid grid-cols-2 gap-2">
                <Valeur etiquette="Vitesse algébrique v">{fr(e.v, 3)} m/s</Valeur>
                <Valeur etiquette="Norme |v|">{fr(Math.abs(e.v), 3)} m/s</Valeur>
                <Valeur etiquette="aT = dv/dt">{fr(e.aT, 3)} m/s²</Valeur>
                <Valeur etiquette="aN = v²/Rc">{fr(e.aN, 3)} m/s²</Valeur>
                <Valeur etiquette="Norme de a">{fr(norm_a, 3)} m/s²</Valeur>
                <Valeur etiquette="Rayon de courbure Rc">{droite ? "∞ (courbure nulle)" : `${fr(eff.Rc, 2)} m`}</Valeur>
              </div>
              {e.v === 0 && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">v = 0 : le vecteur vitesse est nul et aN = 0 ; T reste défini par la trajectoire (sens des abscisses curvilignes croissantes).</p>}
              {e.v < 0 && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">v &lt; 0 : le mobile se déplace dans le sens opposé à T ; aN = v²/Rc reste positive, dirigée vers le centre.</p>}
              {droite && <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-900">Trajectoire rectiligne : la courbure est nulle, la normale N n&apos;est pas définie (aN = 0).</p>}
            </Panneau>
          </>
        }
      />
      <Panneau titre="Graphiques synchronisés">
        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
          <Graphique titre="Vitesse algébrique" unite="v (m/s)" series={[{ f: (s) => etatFrenet(p, s).v, couleur: CI.vitesse, libelle: "v(t)" }]} duree={p.duree} t={t} onT={(s) => { h.pause(); h.setT(s); }} />
          <Graphique
            titre="Composantes de l'accélération"
            unite="a (m/s²)"
            series={[
              { f: (s) => etatFrenet(p, s).aT, couleur: CI.tangente, libelle: "aT(t)" },
              { f: (s) => etatFrenet(p, s).aN, couleur: CI.normale, libelle: "aN(t)", pointille: true },
            ]}
            duree={p.duree}
            t={t}
            onT={(s) => {
              h.pause();
              h.setT(s);
            }}
          />
        </div>
      </Panneau>
      {calculs && (
        <Panneau titre="Calculs" ton="explication">
          <div className="flex min-w-0 flex-col gap-2">
            <Tex bloc expr={`\\vec v = v\\,\\vec T \\qquad v = v_0 + a_T\\,t = ${fr(p.v0, 3)} ${eff.aT < 0 ? "-" : "+"} ${fr(Math.abs(eff.aT), 3)}\\times ${fr(t, 2)} = ${fr(e.v, 3)}\\ \\text{m/s}`} />
            <Tex bloc expr={`\\vec a = a_T\\,\\vec T + a_N\\,\\vec N \\qquad a_T = \\dfrac{\\mathrm{d}v}{\\mathrm{d}t} = ${fr(e.aT, 3)}\\ \\text{m/s}^2`} />
            {droite ? <Tex bloc expr={`a_N = \\dfrac{v^2}{R_c} = 0 \\quad (R_c \\to \\infty)`} /> : <Tex bloc expr={`a_N = \\dfrac{v^2}{R_c} = \\dfrac{${fr(e.v, 3)}^2}{${fr(eff.Rc, 2)}} = ${fr(e.aN, 3)}\\ \\text{m/s}^2`} />}
            <Tex bloc expr={`\\|\\vec a\\| = \\sqrt{a_T^2 + a_N^2} = ${fr(norm_a, 3)}\\ \\text{m/s}^2`} />
            <p className="text-sm text-fh-ardoise">
              Le mouvement est calculé : s(t) = s₀ + v₀t + ½·aT·t², position = point d&apos;abscisse curviligne s sur la trajectoire. Les vecteurs affichés sont ceux de ce mouvement, vérifiés par a = dv/dt.
            </p>
          </div>
        </Panneau>
      )}
    </div>
  );
}
