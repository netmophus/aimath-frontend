"use client";

import { useMemo, useState } from "react";

import {
  EXEMPLES_HODOGRAPHE,
  fr,
  mouvementHodographe,
  natureHodographe,
  norme,
  periodeEtFrequence,
  pointsHodographe,
  pointsTrajectoire,
  polaire,
  rayonHodographeMCU,
  type ParamsHodographe,
} from "@/lib/cinematique";
import { BarreLecture, Bouton, CI, Curseur, Etiquette, FlechePx, Graphique, Interrupteur, Mobile, Panneau, Pastille, PlanPhysique, Tex, Trace, Valeur, cadreOrthonorme, useHorloge } from "./ui";

interface Etat extends ParamsHodographe {
  duree: number;
}

const D0 = EXEMPLES_HODOGRAPHE[1];
const DEPART: Etat = { ...D0 };
const NATURES = { point: "un point", segment: "un segment de droite", cercle: "un cercle", arc: "un arc de cercle" } as const;
const deg = (r: number) => (r * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Hodographe : deux plans synchronisés. À gauche la trajectoire (évolution de la POSITION) ; à droite l'hodographe
 * (évolution du vecteur VITESSE reporté depuis un point fixe P). Une seule horloge et un seul mouvement alimentent les deux.
 */
export default function Hodographe() {
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
    const e = EXEMPLES_HODOGRAPHE.find((x) => x.id === id);
    if (!e) return;
    setP({ ...e });
    setExemple(id);
    h.arreter();
  };
  const reinit = () => {
    setP(DEPART);
    setExemple(D0.id);
    h.arreter();
  };

  const m = useMemo(() => mouvementHodographe(p), [p]);
  const trajet = useMemo(() => pointsTrajectoire(m, p.duree, 160), [m, p.duree]);
  const hodo = useMemo(() => pointsHodographe(m, p.duree, 160), [m, p.duree]);
  const nature = natureHodographe(p, p.duree);
  const pos = m.position(t);
  const v = m.vitesse(t);
  const a = m.acceleration(t);
  const n = Math.max(1, Math.round((t / p.duree) * 160));
  const bornesT = cadreOrthonorme(trajet, { marge: 0.2, minimum: 2 });
  const bornesH = cadreOrthonorme([{ x: 0, y: 0 }, ...hodo], { marge: 0.25, minimum: 2 });
  const tailleT = Math.min(bornesT.xmax - bornesT.xmin, (bornesT.ymax - bornesT.ymin) * 1.15);
  const tailleH = Math.min(bornesH.xmax - bornesH.xmin, (bornesH.ymax - bornesH.ymin) * 1.15);
  let vmax = 0;
  for (const q of hodo) vmax = Math.max(vmax, norme(q));
  const amax = norme(m.acceleration(0));
  const kvT = vmax > 1e-9 ? (0.2 * tailleT) / vmax : 1;
  const kaT = amax > 1e-9 ? (0.2 * tailleT) / amax : 1;
  const kaH = amax > 1e-9 ? (0.2 * tailleH) / amax : 1;
  const pf = p.mode === "mcu" ? periodeEtFrequence(p.omega) : null;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="grid min-w-0 gap-4 lg:grid-cols-2 lg:items-start">
        <Panneau titre="Paramètres">
          <div role="group" aria-label="Modes de mouvement" className="flex flex-wrap gap-2">
            {EXEMPLES_HODOGRAPHE.map((x) => (
              <Pastille key={x.id} actif={exemple === x.id} onClick={() => choisir(x.id)}>
                {x.libelle}
              </Pastille>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {p.mode !== "mcu" ? (
              <>
                <Curseur etiquette="Norme de la vitesse initiale" valeur={p.v} min={0} max={10} pas={0.1} onChange={(x) => modifier({ v: x })} unite="m/s" />
                <Curseur etiquette="Direction de la vitesse" valeur={Math.round(deg(p.angleV))} min={-180} max={180} pas={5} decimales={0} onChange={(x) => modifier({ angleV: rad(x) })} unite="°" />
              </>
            ) : (
              <>
                <Curseur etiquette="Rayon R" valeur={p.R} min={0.5} max={6} pas={0.1} onChange={(x) => modifier({ R: x })} unite="m" />
                <Curseur etiquette="Vitesse angulaire ω" valeur={p.omega} min={-5} max={5} pas={0.1} onChange={(x) => modifier({ omega: x })} unite="rad/s" />
              </>
            )}
            {p.mode === "mruv" && (
              <>
                <Curseur etiquette="Norme de l'accélération" valeur={p.a} min={0} max={5} pas={0.1} onChange={(x) => modifier({ a: x })} unite="m/s²" />
                <Curseur etiquette="Direction de l'accélération" valeur={Math.round(deg(p.angleA))} min={-180} max={180} pas={5} decimales={0} onChange={(x) => modifier({ angleA: rad(x) })} unite="°" />
              </>
            )}
            <Curseur etiquette="Durée de la simulation" valeur={p.duree} min={1} max={30} pas={0.5} onChange={(x) => modifier({ duree: x })} unite="s" />
            {pf && (
              <div className="flex flex-wrap items-center gap-2">
                <Bouton onClick={() => modifier({ duree: Math.min(30, Number(pf.T.toFixed(2))) })}>Une période complète (T = {fr(pf.T, 2)} s)</Bouton>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-x-5">
            <Interrupteur etiquette="Afficher les vecteurs" coche={vecteurs} onChange={setVecteurs} />
            <Interrupteur etiquette="Afficher les calculs" coche={calculs} onChange={setCalculs} />
          </div>
        </Panneau>
        <div className="flex min-w-0 flex-col gap-4">
          <Panneau titre="Commandes">
            <BarreLecture h={h} duree={p.duree} onReinitialiser={reinit} />
          </Panneau>
          <Panneau titre="À retenir" ton="explication">
            <p className="text-sm text-fh-ardoise">
              <strong className="text-[#2563EB]">Trajectoire : évolution de la position.</strong>
              <br />
              <strong className="text-[#10B981]">Hodographe : évolution de la vitesse.</strong>
            </p>
            <p className="text-sm text-fh-ardoise">
              Ici, l&apos;hodographe est {NATURES[nature]}
              {p.mode === "mcu" && nature !== "point" ? ` de rayon R|ω| = ${fr(rayonHodographeMCU(p), 3)} m/s` : ""}.
              {p.mode === "mcu" && nature === "arc" ? " Prends une durée d'au moins une période pour voir le cercle complet." : ""}
            </p>
          </Panneau>
        </div>
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Panneau titre="Plan de la trajectoire (position)">
          <PlanPhysique bornes={bornesT} etiquette={`Trajectoire du mobile à t = ${fr(t)} s : position (${fr(pos.x)} ; ${fr(pos.y)}) m`} axeX="x (m)" axeY="y (m)">
            {(o) => (
              <g>
                <Trace o={o} pts={trajet} couleur="#bfdbfe" epaisseur={2.2} pointille />
                <Trace o={o} pts={trajet.slice(0, n + 1)} couleur={CI.position} epaisseur={2.6} />
                {trajet
                  .filter((_, i) => i % 20 === 0 && i <= n)
                  .map((q, i) => (
                    <circle key={i} cx={o.X(q.x)} cy={o.Y(q.y)} r={3} fill={CI.position} fillOpacity={0.55} />
                  ))}
                {vecteurs && (
                  <g>
                    <FlechePx x1={o.X(pos.x)} y1={o.Y(pos.y)} x2={o.X(pos.x + kvT * v.x)} y2={o.Y(pos.y + kvT * v.y)} couleur={CI.vitesse} epaisseur={3.4} />
                    <Etiquette x={o.X(pos.x + kvT * v.x) + 6} y={o.Y(pos.y + kvT * v.y) + 16} couleur={CI.vitesse}>
                      v
                    </Etiquette>
                    {norme(a) > 1e-9 && (
                      <g>
                        <FlechePx x1={o.X(pos.x)} y1={o.Y(pos.y)} x2={o.X(pos.x + kaT * a.x)} y2={o.Y(pos.y + kaT * a.y)} couleur={CI.acceleration} epaisseur={3.4} />
                        <Etiquette x={o.X(pos.x + kaT * a.x) + 6} y={o.Y(pos.y + kaT * a.y) - 6} couleur={CI.acceleration}>
                          a
                        </Etiquette>
                      </g>
                    )}
                  </g>
                )}
                <Mobile o={o} p={pos} />
              </g>
            )}
          </PlanPhysique>
        </Panneau>
        <Panneau titre="Plan de l'hodographe (vitesse)">
          <PlanPhysique bornes={bornesH} etiquette={`Hodographe à t = ${fr(t)} s : extrémité du vecteur vitesse (${fr(v.x)} ; ${fr(v.y)}) m/s`} axeX="vₓ (m/s)" axeY="vᵧ (m/s)" legendeOrigine="P">
            {(o) => (
              <g>
                {p.mode === "mcu" && p.omega !== 0 && <Trace o={o} pts={Array.from({ length: 121 }, (_, i) => polaire(rayonHodographeMCU(p), (2 * Math.PI * i) / 120))} couleur="#a7f3d0" epaisseur={2} pointille />}
                <Trace o={o} pts={hodo} couleur="#a7f3d0" epaisseur={2.2} pointille />
                <Trace o={o} pts={hodo.slice(0, n + 1)} couleur={CI.vitesse} epaisseur={2.8} />
                {/* vecteur vitesse reporté depuis le point fixe P */}
                <FlechePx x1={o.X(0)} y1={o.Y(0)} x2={o.X(v.x)} y2={o.Y(v.y)} couleur={CI.vitesse} epaisseur={3} />
                <circle cx={o.X(0)} cy={o.Y(0)} r={5} fill={CI.profond} />
                {/* accélération = dv/dt : tangente à l'hodographe au point courant */}
                {vecteurs && norme(a) > 1e-9 && (
                  <g>
                    <FlechePx x1={o.X(v.x)} y1={o.Y(v.y)} x2={o.X(v.x + kaH * a.x)} y2={o.Y(v.y + kaH * a.y)} couleur={CI.acceleration} epaisseur={3.2} />
                    <Etiquette x={o.X(v.x + kaH * a.x) + 6} y={o.Y(v.y + kaH * a.y) - 6} couleur={CI.acceleration}>
                      a
                    </Etiquette>
                  </g>
                )}
                <Mobile o={o} p={v} couleur={CI.vitesse} nom="V" />
              </g>
            )}
          </PlanPhysique>
          <p className="text-xs text-fh-ardoise/70">P : origine fixe. Le point V est l&apos;extrémité du vecteur vitesse du mobile ; l&apos;accélération (orange) est tangente à l&apos;hodographe, car a = dv/dt.</p>
        </Panneau>
      </div>
      <Panneau titre="Valeurs à l'instant t" ton="resultat">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Valeur etiquette="Position (x ; y)">({fr(pos.x, 2)} ; {fr(pos.y, 2)}) m</Valeur>
          <Valeur etiquette="Vitesse (vₓ ; vᵧ)">({fr(v.x, 2)} ; {fr(v.y, 2)}) m/s</Valeur>
          <Valeur etiquette="Norme |v|">{fr(norme(v), 3)} m/s</Valeur>
          <Valeur etiquette="Accélération |a|">{fr(norme(a), 3)} m/s²</Valeur>
        </div>
      </Panneau>
      <Panneau titre="Vitesse en fonction du temps">
        <Graphique
          titre="Composantes du vecteur vitesse"
          unite="v (m/s)"
          series={[
            { f: (s) => m.vitesse(s).x, couleur: CI.position, libelle: "vₓ(t)" },
            { f: (s) => m.vitesse(s).y, couleur: CI.normale, libelle: "vᵧ(t)", pointille: true },
            { f: (s) => norme(m.vitesse(s)), couleur: CI.vitesse, libelle: "|v|(t)" },
          ]}
          duree={p.duree}
          t={t}
          onT={(s) => {
            h.pause();
            h.setT(s);
          }}
        />
      </Panneau>
      {calculs && (
        <Panneau titre="Calculs" ton="explication">
          <div className="flex min-w-0 flex-col gap-2">
            {p.mode === "mru" && <Tex bloc expr={`\\vec v = \\overrightarrow{\\text{cste}} = (${fr(v.x, 3)}\\ ;\\ ${fr(v.y, 3)})\\ \\text{m/s} \\;\\Rightarrow\\; \\text{hodographe réduit à un point}`} />}
            {p.mode === "mruv" && (
              <>
                <Tex bloc expr={`\\vec v(t) = \\vec v_0 + \\vec a\\,t = (${fr(v.x, 3)}\\ ;\\ ${fr(v.y, 3)})\\ \\text{m/s}`} />
                <p className="text-sm text-fh-ardoise">L&apos;extrémité de v se déplace suivant la direction fixe de a : l&apos;hodographe est {p.a === 0 ? "un point (a = 0)" : "un segment de droite"}.</p>
              </>
            )}
            {p.mode === "mcu" && (
              <>
                <Tex bloc expr={`\\|\\vec v\\| = R|\\omega| = ${fr(p.R, 3)}\\times ${fr(Math.abs(p.omega), 3)} = ${fr(rayonHodographeMCU(p), 3)}\\ \\text{m/s}`} />
                <p className="text-sm text-fh-ardoise">La norme de v est constante et sa direction tourne : l&apos;extrémité de v décrit un cercle de centre P, de rayon égal à la norme de la vitesse (échelle graphique en m/s).</p>
              </>
            )}
          </div>
        </Panneau>
      )}
    </div>
  );
}
