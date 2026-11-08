"use client";

import { useState } from "react";

import { EXEMPLES_MCU, etatMCU, fr, periodeEtFrequence, polaire, produit, somme, type ParamsMCU } from "@/lib/cinematique";
import { Bouton, BarreLecture, CI, Curseur, DeuxColonnes, Etiquette, FlechePx, Graphique, Interrupteur, Mobile, Panneau, PlanPhysique, Pastille, Tex, Trace, Valeur, useHorloge } from "./ui";

interface Etat extends ParamsMCU {
  duree: number;
}

const DEPART: Etat = { R: EXEMPLES_MCU[0].R, omega: EXEMPLES_MCU[0].omega, theta0: EXEMPLES_MCU[0].theta0, duree: EXEMPLES_MCU[0].duree };

/** Échelles fixes (m de dessin par m/s et par m/s²) : doubler ω double la flèche vitesse et quadruple la flèche accélération. */
const K_VITESSE = 0.4;
const K_ACCEL = 0.1;
const PLAFOND = 1.6; // longueur maximale d'une flèche, en rayons (le cadre ne dépend que de R : les flèches gardent la même échelle à l'écran)

const deg = (rad: number) => (rad * 180) / Math.PI;
const rad = (d: number) => (d * Math.PI) / 180;

/** Mouvement circulaire uniforme : cercle gradué, rayon OM, vitesse tangente, accélération centripète, sens de rotation. */
export default function Circulaire() {
  const [p, setP] = useState<Etat>(DEPART);
  const [exemple, setExemple] = useState<string | null>(EXEMPLES_MCU[0].id);
  const [vecteurs, setVecteurs] = useState(true);
  const [calculs, setCalculs] = useState(true);
  const h = useHorloge(p.duree);
  const t = h.t;
  const modifier = (m: Partial<Etat>) => {
    setP((q) => ({ ...q, ...m }));
    setExemple(null);
  };
  const choisir = (id: string) => {
    const e = EXEMPLES_MCU.find((x) => x.id === id);
    if (!e) return;
    setP({ R: e.R, omega: e.omega, theta0: e.theta0, duree: e.duree });
    setExemple(id);
    h.arreter();
  };
  const reinit = () => {
    setP(DEPART);
    setExemple(EXEMPLES_MCU[0].id);
    h.arreter();
  };

  const e = etatMCU(p, t);
  const pf = periodeEtFrequence(p.omega);
  const tours = Math.abs(p.omega) * t / (2 * Math.PI);
  const double = etatMCU({ ...p, omega: 2 * p.omega }, 0);
  const R = p.R;
  const lenV = Math.min(K_VITESSE * e.v, PLAFOND * R);
  const lenA = Math.min(K_ACCEL * e.a, PLAFOND * R);
  const tronque = K_VITESSE * e.v > PLAFOND * R + 1e-9 || K_ACCEL * e.a > PLAFOND * R + 1e-9;
  const demi = R * (1 + PLAFOND + 0.2);
  const bornes = { xmin: -demi, xmax: demi, ymin: -demi, ymax: demi };
  const er = { x: Math.cos(e.theta), y: Math.sin(e.theta) };
  const et = { x: -Math.sin(e.theta), y: Math.cos(e.theta) };
  const sens = Math.sign(p.omega);
  const cercle = Array.from({ length: 121 }, (_, i) => polaire(R, (2 * Math.PI * i) / 120));

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Paramètres">
              <div role="group" aria-label="Exemples" className="flex flex-wrap gap-2">
                {EXEMPLES_MCU.map((x) => (
                  <Pastille key={x.id} actif={exemple === x.id} onClick={() => choisir(x.id)}>
                    {x.libelle}
                  </Pastille>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <Curseur etiquette="Rayon R" valeur={p.R} min={0.1} max={5} pas={0.1} onChange={(v) => modifier({ R: v })} unite="m" />
                <Curseur etiquette="Vitesse angulaire ω (algébrique)" valeur={p.omega} min={-10} max={10} pas={0.1} onChange={(v) => modifier({ omega: v })} unite="rad/s" />
                <Curseur etiquette="Angle initial θ₀" valeur={Math.round(deg(p.theta0))} min={-180} max={180} pas={5} decimales={0} onChange={(v) => modifier({ theta0: rad(v) })} unite="°" />
                <Curseur etiquette="Durée de la simulation" valeur={p.duree} min={1} max={30} pas={0.5} onChange={(v) => modifier({ duree: v })} unite="s" />
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
              <PlanPhysique bornes={bornes} etiquette={`Mouvement circulaire : mobile M à θ = ${fr(deg(e.theta), 0)} degrés`} axeX="x (m)" axeY="y (m)">
                {(o) => (
                  <g>
                    <Trace o={o} pts={cercle} couleur="#94a3b8" epaisseur={2} />
                    {[0, 90, 180, 270].map((a) => {
                      const u = polaire(1, rad(a));
                      return (
                        <g key={a}>
                          <line x1={o.X(1.0 * R * u.x)} y1={o.Y(1.0 * R * u.y)} x2={o.X(1.07 * R * u.x)} y2={o.Y(1.07 * R * u.y)} stroke="#475569" strokeWidth={1.6} />
                          <Etiquette x={o.X(1.2 * R * u.x)} y={o.Y(1.2 * R * u.y) + 4} couleur="#475569" ancre="middle" taille={11}>
                            {a}°
                          </Etiquette>
                        </g>
                      );
                    })}
                    {sens !== 0 && (
                      <g>
                        <Trace o={o} pts={Array.from({ length: 12 }, (_, i) => polaire(0.45 * R, e.theta + sens * (0.25 + (i * 0.9) / 11)))} couleur={CI.gris} epaisseur={2} pointille />
                        <FlechePx
                          x1={o.X(0.45 * R * Math.cos(e.theta + sens * 1.0))}
                          y1={o.Y(0.45 * R * Math.sin(e.theta + sens * 1.0))}
                          x2={o.X(0.45 * R * Math.cos(e.theta + sens * 1.2))}
                          y2={o.Y(0.45 * R * Math.sin(e.theta + sens * 1.2))}
                          couleur={CI.gris}
                          epaisseur={2}
                        />
                      </g>
                    )}
                    <line x1={o.X(0)} y1={o.Y(0)} x2={o.X(e.position.x)} y2={o.Y(e.position.y)} stroke={CI.position} strokeWidth={2.4} strokeDasharray="6 4" />
                    <circle cx={o.X(0)} cy={o.Y(0)} r={4.5} fill={CI.profond} />
                    {vecteurs && p.omega !== 0 && (
                      <g>
                        <FlechePx
                          x1={o.X(e.position.x)}
                          y1={o.Y(e.position.y)}
                          x2={o.X(e.position.x + Math.sign(p.omega) * lenV * et.x)}
                          y2={o.Y(e.position.y + Math.sign(p.omega) * lenV * et.y)}
                          couleur={CI.vitesse}
                        />
                        <Etiquette x={o.X(e.position.x + Math.sign(p.omega) * lenV * et.x) + 6} y={o.Y(e.position.y + Math.sign(p.omega) * lenV * et.y) - 6} couleur={CI.vitesse}>
                          v
                        </Etiquette>
                        <FlechePx
                          x1={o.X(e.position.x)}
                          y1={o.Y(e.position.y)}
                          x2={o.X(e.position.x - lenA * er.x)}
                          y2={o.Y(e.position.y - lenA * er.y)}
                          couleur={CI.acceleration}
                        />
                        <Etiquette x={o.X(somme(e.position, produit(-lenA, er)).x) + 6} y={o.Y(somme(e.position, produit(-lenA, er)).y) + 14} couleur={CI.acceleration}>
                          a
                        </Etiquette>
                      </g>
                    )}
                    <Mobile o={o} p={e.position} />
                    <text x={10} y={20} fontSize={13} fontWeight={700} fill={CI.profond}>
                      t = {fr(t)} s
                    </text>
                  </g>
                )}
              </PlanPhysique>
              <p className="text-xs text-fh-ardoise/70">
                Échelles fixes : la flèche verte (vitesse) mesure {fr(K_VITESSE, 2)} m de dessin par m/s, la flèche orange (accélération, vers O) {fr(K_ACCEL, 3)} m par m/s².
                {tronque ? " Une flèche est tronquée à 1,6 rayon : ses valeurs restent affichées ci-dessous." : ""}
              </p>
            </Panneau>
            <Panneau titre="Résultats à l'instant t" ton="resultat">
              <div className="grid grid-cols-2 gap-2">
                <Valeur etiquette="Angle θ(t)">{fr(e.theta, 3)} rad ({fr(deg(e.theta), 1)}°)</Valeur>
                <Valeur etiquette="Position (x ; y)">({fr(e.position.x, 3)} ; {fr(e.position.y, 3)}) m</Valeur>
                <Valeur etiquette="Vitesse v = R|ω|">{fr(e.v, 3)} m/s</Valeur>
                <Valeur etiquette="Accélération a = Rω²">{fr(e.a, 3)} m/s²</Valeur>
                <Valeur etiquette="Période T">{pf ? `${fr(pf.T, 3)} s` : "non définie (ω = 0)"}</Valeur>
                <Valeur etiquette="Fréquence f">{pf ? `${fr(pf.f, 3)} Hz` : "non définie (ω = 0)"}</Valeur>
              </div>
              {p.omega === 0 && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">ω = 0 : le mobile est immobile ; la période n&apos;est pas définie et les vecteurs vitesse et accélération sont nuls.</p>}
            </Panneau>
          </>
        }
      />
      <Panneau titre="Graphiques synchronisés">
        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
          <Graphique
            titre="Coordonnées"
            unite="x, y (m)"
            series={[
              { f: (s) => etatMCU(p, s).position.x, couleur: CI.position, libelle: "x(t) = R cos θ" },
              { f: (s) => etatMCU(p, s).position.y, couleur: CI.normale, libelle: "y(t) = R sin θ", pointille: true },
            ]}
            duree={p.duree}
            t={t}
            onT={(s) => {
              h.pause();
              h.setT(s);
            }}
          />
          <Graphique titre="Angle" unite="θ (rad)" series={[{ f: (s) => p.theta0 + p.omega * s, couleur: CI.tangente, libelle: "θ(t) = θ₀ + ωt" }]} duree={p.duree} t={t} onT={(s) => { h.pause(); h.setT(s); }} />
        </div>
      </Panneau>
      <Panneau titre="Expérience : que se passe-t-il si |ω| double ?" ton="explication">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Valeur etiquette="ω → 2ω">{fr(2 * p.omega, 2)} rad/s</Valeur>
          <Valeur etiquette="Vitesse v">
            {fr(e.v, 3)} → {fr(double.v, 3)} m/s {e.v > 0 ? `(×${fr(double.v / e.v, 0)})` : ""}
          </Valeur>
          <Valeur etiquette="Accélération a">
            {fr(e.a, 3)} → {fr(double.a, 3)} m/s² {e.a > 0 ? `(×${fr(double.a / e.a, 0)})` : ""}
          </Valeur>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Bouton onClick={() => modifier({ omega: Math.max(-10, Math.min(10, 2 * p.omega)) })} disabled={p.omega === 0 || Math.abs(2 * p.omega) > 10}>
            Appliquer ω × 2
          </Bouton>
          <Bouton onClick={() => modifier({ omega: p.omega / 2 })} disabled={p.omega === 0}>
            Appliquer ω ÷ 2
          </Bouton>
          <span className="text-xs text-fh-ardoise/80">Observe la flèche verte (×2) et la flèche orange (×4) dans la simulation.</span>
        </div>
      </Panneau>
      {calculs && (
        <Panneau titre="Calculs" ton="explication">
          <div className="flex min-w-0 flex-col gap-2">
            <Tex bloc expr={`\\theta(t) = \\theta_0 + \\omega t = ${fr(p.theta0, 3)} + ${p.omega < 0 ? "(" + fr(p.omega, 3) + ")" : fr(p.omega, 3)}\\times ${fr(t, 2)} = ${fr(e.theta, 3)}\\ \\text{rad}`} />
            <Tex bloc expr={`x = R\\cos\\theta = ${fr(e.position.x, 3)}\\ \\text{m}\\qquad y = R\\sin\\theta = ${fr(e.position.y, 3)}\\ \\text{m}`} />
            <Tex bloc expr={`\\vec v = R\\omega\\,\\vec e_\\theta \\;:\\; v = R|\\omega| = ${fr(p.R, 3)}\\times ${fr(Math.abs(p.omega), 3)} = ${fr(e.v, 3)}\\ \\text{m/s}`} />
            <Tex bloc expr={`\\vec a = -R\\omega^2\\,\\vec e_r \\;:\\; a = R\\omega^2 = ${fr(p.R, 3)}\\times ${fr(Math.abs(p.omega), 3)}^2 = ${fr(e.a, 3)}\\ \\text{m/s}^2`} />
            {pf ? <Tex bloc expr={`T = \\dfrac{2\\pi}{|\\omega|} = ${fr(pf.T, 3)}\\ \\text{s}\\qquad f = \\dfrac{1}{T} = ${fr(pf.f, 3)}\\ \\text{Hz}\\qquad \\text{tours} = ${fr(tours, 2)}`} /> : <p className="text-sm text-fh-ardoise">ω = 0 : T = 2π/|ω| n&apos;est pas défini (le mobile ne tourne pas).</p>}
          </div>
        </Panneau>
      )}
    </div>
  );
}
