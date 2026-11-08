"use client";

import { useMemo, useState } from "react";

import {
  LIBELLES_CHRONO,
  accelerationTroisPoints,
  accelerationVitessesCentrees,
  ecartVecteurs,
  fr,
  mesuresTrace,
  mouvementChrono,
  norme,
  pointsTrajectoire,
  positionsChrono,
  vitesseCentree,
  vitesseMoyenneIntervalle,
  vecteurMM,
  type Ecart,
  type TypeChrono,
  type Vec,
} from "@/lib/cinematique";
import { BarreLecture, CI, Curseur, DeuxColonnes, Etiquette, FlechePx, Interrupteur, Panneau, Pastille, PlanPhysique, Tex, Trace, Valeur, cadreOrthonorme, useHorloge } from "./ui";

const TYPES: TypeChrono[] = ["mru", "accelere", "retarde", "mcu"];
const PAS_ETUDIES = [0.1, 0.25, 0.5, 1, 2];
const T_ETUDE = 3;

const vec = (v: Vec) => `(${fr(v.x, 2)} ; ${fr(v.y, 2)})`;

function LigneEcart({ nom, estime, theorique, ecart, unite, indispo }: { nom: string; estime: Vec | null; theorique: Vec; ecart: Ecart | null; unite: string; indispo?: string }) {
  return (
    <tr className="border-t border-[#dbe7ff] align-top">
      <th scope="row" className="py-2 pr-3 text-left text-sm font-semibold text-[#102A66]">
        {nom}
      </th>
      {estime && ecart ? (
        <>
          <td className="py-2 pr-3 text-sm">{vec(estime)} {unite}</td>
          <td className="py-2 pr-3 text-sm">{vec(theorique)} {unite}</td>
          <td className="py-2 pr-3 text-sm font-semibold">{fr(ecart.absolu, 4)} {unite}</td>
          <td className="py-2 text-sm font-semibold">{ecart.relatif === null ? "non défini" : `${fr(ecart.relatif * 100, 3)} %`}</td>
        </>
      ) : (
        <td colSpan={4} className="py-2 text-sm text-fh-ardoise/80">
          {indispo ?? "Indisponible"} · valeur théorique {vec(theorique)} {unite}
        </td>
      )}
    </tr>
  );
}

/** Chronophotographie : positions enregistrées toutes les τ, vitesse et accélération estimées, comparées à la théorie. */
export default function Chronophoto() {
  const [type, setType] = useState<TypeChrono>("accelere");
  const [tau, setTau] = useState(0.5);
  const [n, setN] = useState(9);
  const [echelle, setEchelle] = useState(1);
  const [choix, setChoix] = useState(4);
  const [vecteurs, setVecteurs] = useState(true);
  const [calculs, setCalculs] = useState(true);
  const duree = (n - 1) * tau;
  const h = useHorloge(duree);
  const m = useMemo(() => mouvementChrono(type), [type]);
  const P = useMemo(() => positionsChrono(m, tau, n), [m, tau, n]);
  const theorie = useMemo(() => pointsTrajectoire(m, duree, 200), [m, duree]);
  const i = Math.min(choix, n - 1);
  const ti = i * tau;
  const progressif = h.enLecture || h.t > 0;
  const visibles = progressif ? Math.min(n, Math.floor(h.t / tau + 1e-9) + 1) : n;
  const posMobile = m.position(h.t);

  const vEst = vitesseCentree(P, i, tau);
  const vTh = m.vitesse(ti);
  const aEst3 = accelerationTroisPoints(P, i, tau);
  const aEstV = accelerationVitessesCentrees(P, i, tau);
  const aTh = m.acceleration(ti);
  const vMoyAv = vitesseMoyenneIntervalle(P, i - 1, tau);
  const vMoyAp = vitesseMoyenneIntervalle(P, i, tau);

  const bornes = useMemo(() => cadreOrthonorme([...theorie, ...P], { marge: 0.22, minimum: 3 }), [theorie, P]);
  const taille = Math.min(bornes.xmax - bornes.xmin, (bornes.ymax - bornes.ymin) * 1.15);
  let vmax = 0;
  let amax = 0;
  for (let k = 0; k < n; k++) {
    vmax = Math.max(vmax, norme(m.vitesse(k * tau)));
    amax = Math.max(amax, norme(m.acceleration(k * tau)));
  }
  const kv = (vmax > 1e-9 ? (0.18 * taille) / vmax : 1) * echelle;
  const ka = (amax > 1e-9 ? (0.18 * taille) / amax : 1) * echelle;
  const mt = i >= 1 && i + 1 < n ? mesuresTrace(P, i - 1, i + 1) : null;
  const Mi = P[i];

  const etude = PAS_ETUDIES.map((tp) => {
    const k = Math.max(1, Math.round(T_ETUDE / tp));
    const Q = positionsChrono(m, tp, k + 2);
    const v = vitesseCentree(Q, k, tp)!;
    const a = accelerationTroisPoints(Q, k, tp)!;
    return { tp, k, t: k * tp, ev: ecartVecteurs(v, m.vitesse(k * tp)), ea: ecartVecteurs(a, m.acceleration(k * tp)) };
  });

  const reinit = () => {
    setType("accelere");
    setTau(0.5);
    setN(9);
    setEchelle(1);
    setChoix(4);
    h.arreter();
  };

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Paramètres">
              <div role="group" aria-label="Type de mouvement" className="flex flex-wrap gap-2">
                {TYPES.map((x) => (
                  <Pastille key={x} actif={type === x} onClick={() => { setType(x); h.arreter(); }}>
                    {LIBELLES_CHRONO[x]}
                  </Pastille>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <Curseur etiquette="Intervalle de temps τ" valeur={tau} min={0.1} max={2} pas={0.05} onChange={(v) => { setTau(v); h.arreter(); }} unite="s" />
                <Curseur etiquette="Nombre de positions" valeur={n} min={5} max={15} pas={1} decimales={0} onChange={(v) => { setN(Math.round(v)); h.arreter(); }} />
                <Curseur etiquette="Échelle des vecteurs" valeur={echelle} min={0.5} max={3} pas={0.1} onChange={setEchelle} unite="×" />
                <Curseur etiquette="Point étudié Mᵢ (i)" valeur={i} min={0} max={n - 1} pas={1} decimales={0} onChange={(v) => setChoix(Math.round(v))} />
              </div>
              <div className="flex flex-wrap gap-x-5">
                <Interrupteur etiquette="Afficher les vecteurs" coche={vecteurs} onChange={setVecteurs} />
                <Interrupteur etiquette="Afficher les calculs" coche={calculs} onChange={setCalculs} />
              </div>
            </Panneau>
            <Panneau titre="Enregistrement (lecture)">
              <BarreLecture h={h} duree={duree} onReinitialiser={reinit} instantEtiquette="Instant de la prise de vue" />
              <p className="text-xs text-fh-ardoise/70">À l&apos;arrêt avec t = 0, toutes les positions sont affichées ; Lecture ou Recommencer les enregistre une à une toutes les τ.</p>
            </Panneau>
          </>
        }
        droite={
          <Panneau titre="Simulation">
            <PlanPhysique bornes={bornes} etiquette={`Chronophotographie ${LIBELLES_CHRONO[type]} : ${visibles} positions, point étudié M${i}`}>
              {(o) => (
                <g>
                  <Trace o={o} pts={theorie} couleur="#bfdbfe" epaisseur={2.2} pointille />
                  <Trace o={o} pts={P.slice(0, visibles)} couleur={CI.position} epaisseur={1.6} opacite={0.6} />
                  {vecteurs && visibles > i && i >= 1 && i + 1 < n && (
                    <g>
                      <FlechePx x1={o.X(P[i - 1].x)} y1={o.Y(P[i - 1].y)} x2={o.X(P[i + 1].x)} y2={o.Y(P[i + 1].y)} couleur={CI.gris} epaisseur={2} pointille />
                      <FlechePx x1={o.X(Mi.x)} y1={o.Y(Mi.y)} x2={o.X(Mi.x + kv * vTh.x)} y2={o.Y(Mi.y + kv * vTh.y)} couleur="#065f46" epaisseur={2.2} pointille />
                      {vEst && <FlechePx x1={o.X(Mi.x)} y1={o.Y(Mi.y)} x2={o.X(Mi.x + kv * vEst.x)} y2={o.Y(Mi.y + kv * vEst.y)} couleur={CI.vitesse} epaisseur={3.4} />}
                      {norme(aTh) > 1e-9 && <FlechePx x1={o.X(Mi.x)} y1={o.Y(Mi.y)} x2={o.X(Mi.x + ka * aTh.x)} y2={o.Y(Mi.y + ka * aTh.y)} couleur="#9a3412" epaisseur={2.2} pointille />}
                      {aEst3 && norme(aEst3) > 1e-9 && <FlechePx x1={o.X(Mi.x)} y1={o.Y(Mi.y)} x2={o.X(Mi.x + ka * aEst3.x)} y2={o.Y(Mi.y + ka * aEst3.y)} couleur={CI.acceleration} epaisseur={3.4} />}
                    </g>
                  )}
                  {P.slice(0, visibles).map((q, k) => (
                    <g key={k}>
                      <circle cx={o.X(q.x)} cy={o.Y(q.y)} r={k === i ? 7.5 : 5} fill={k === i ? CI.alerte : CI.position} stroke="#fff" strokeWidth={2} />
                      <Etiquette x={o.X(q.x) + 7} y={o.Y(q.y) - 8} couleur={k === i ? CI.alerte : CI.position} taille={11.5}>
                        M{k}
                      </Etiquette>
                      <circle cx={o.X(q.x)} cy={o.Y(q.y)} r={14} fill="transparent" style={{ cursor: "pointer" }} onClick={() => setChoix(k)} />
                    </g>
                  ))}
                  {progressif && <circle cx={o.X(posMobile.x)} cy={o.Y(posMobile.y)} r={4} fill={CI.profond} />}
                  <text x={10} y={20} fontSize={13} fontWeight={700} fill={CI.profond}>
                    τ = {fr(tau, 2)} s
                  </text>
                </g>
              )}
            </PlanPhysique>
            <p className="text-xs text-fh-ardoise/70">
              Vert : vitesse estimée M(i−1)M(i+1)/(2τ) (trait plein) et théorique (pointillés). Orange : accélération estimée (plein) et théorique (pointillés). Gris : segment M(i−1)M(i+1). Clique sur un point Mᵢ pour l&apos;étudier.
            </p>
          </Panneau>
        }
      />
      <Panneau titre={`Mesures au point M${i} (instant t = ${fr(ti, 2)} s)`} ton="resultat">
        <div className="w-0 min-w-full overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse">
            <thead>
              <tr className="text-left text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">
                <th className="pb-1 pr-3">Grandeur</th>
                <th className="pb-1 pr-3">Estimée</th>
                <th className="pb-1 pr-3">Théorique</th>
                <th className="pb-1 pr-3">Écart absolu</th>
                <th className="pb-1">Écart relatif</th>
              </tr>
            </thead>
            <tbody>
              <LigneEcart nom={`Vitesse en M${i} (centrée, à t = ${fr(ti, 2)} s)`} estime={vEst} theorique={vTh} ecart={vEst ? ecartVecteurs(vEst, vTh) : null} unite="m/s" indispo="Indisponible au bord de l'enregistrement (il faut M(i−1) et M(i+1))" />
              <LigneEcart nom={`Accélération en M${i} (trois positions, à t = ${fr(ti, 2)} s)`} estime={aEst3} theorique={aTh} ecart={aEst3 ? ecartVecteurs(aEst3, aTh) : null} unite="m/s²" indispo="Indisponible au bord de l'enregistrement" />
              <LigneEcart nom={`Accélération en M${i} (différence centrée des vitesses v(i+1) − v(i−1))`} estime={aEstV} theorique={aTh} ecart={aEstV ? ecartVecteurs(aEstV, aTh) : null} unite="m/s²" indispo="Indisponible : il faut M(i−2) à M(i+2)" />
              {vMoyAv && <LigneEcart nom={`Vitesse moyenne sur [t${i - 1} ; t${i}] (à t = ${fr((i - 0.5) * tau, 2)} s)`} estime={vMoyAv} theorique={m.vitesse((i - 0.5) * tau)} ecart={ecartVecteurs(vMoyAv, m.vitesse((i - 0.5) * tau))} unite="m/s" />}
              {vMoyAp && <LigneEcart nom={`Vitesse moyenne sur [t${i} ; t${i + 1}] (à t = ${fr((i + 0.5) * tau, 2)} s)`} estime={vMoyAp} theorique={m.vitesse((i + 0.5) * tau)} ecart={ecartVecteurs(vMoyAp, m.vitesse((i + 0.5) * tau))} unite="m/s" />}
            </tbody>
          </table>
        </div>
        {mt && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Valeur etiquette={`Déplacement vectoriel M${i - 1}M${i + 1}`}>{vec(mt.deplacement)} m</Valeur>
            <Valeur etiquette={`Distance M${i - 1}M${i + 1} (en ligne droite)`}>{fr(mt.distanceDirecte, 3)} m</Valeur>
            <Valeur etiquette={`Longueur parcourue M${i - 1} → M${i + 1} (le long de la trace)`}>{fr(mt.longueurTrace, 3)} m</Valeur>
          </div>
        )}
      </Panneau>
      <Panneau titre="Effet du pas de temps τ" ton="explication">
        <p className="text-sm text-fh-ardoise">
          Même mouvement ({LIBELLES_CHRONO[type]}), estimations faites autour de t ≈ {T_ETUDE} s avec différents pas τ.
          {type === "mcu" ? " Pour un mouvement courbe, plus τ est petit, meilleure est l'estimation." : " Pour une accélération constante, l'estimation à trois positions est exacte quel que soit τ."}
        </p>
        <div className="w-0 min-w-full overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr className="text-left text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">
                <th className="pb-1 pr-3">τ (s)</th>
                <th className="pb-1 pr-3">Instant (s)</th>
                <th className="pb-1 pr-3">Écart sur v (m/s)</th>
                <th className="pb-1">Écart sur a (m/s²)</th>
              </tr>
            </thead>
            <tbody>
              {etude.map((l) => (
                <tr key={l.tp} className="border-t border-[#dbe7ff]">
                  <td className="py-1.5 pr-3 font-semibold">{fr(l.tp, 2)}</td>
                  <td className="py-1.5 pr-3">{fr(l.t, 2)}</td>
                  <td className="py-1.5 pr-3">{fr(l.ev.absolu, 5)}</td>
                  <td className="py-1.5">{fr(l.ea.absolu, 5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panneau>
      {calculs && (
        <Panneau titre="Calculs" ton="explication">
          <div className="flex min-w-0 flex-col gap-2">
            {vEst ? (
              <Tex bloc expr={`\\vec v_{${i}} \\approx \\dfrac{\\overrightarrow{M_{${i - 1}}M_{${i + 1}}}}{2\\tau} = \\dfrac{(${fr(vecteurMM(P, i - 1, i + 1).x, 3)}\\ ;\\ ${fr(vecteurMM(P, i - 1, i + 1).y, 3)})}{${fr(2 * tau, 2)}} = (${fr(vEst.x, 3)}\\ ;\\ ${fr(vEst.y, 3)})\\ \\text{m/s}`} />
            ) : (
              <p className="text-sm text-fh-ardoise">Au bord de l&apos;enregistrement, la vitesse centrée n&apos;est pas calculable : choisis un point intérieur (1 ≤ i ≤ {n - 2}).</p>
            )}
            {aEst3 && <Tex bloc expr={`\\vec a_{${i}} \\approx \\dfrac{\\overrightarrow{M_{${i}}M_{${i + 1}}} - \\overrightarrow{M_{${i - 1}}M_{${i}}}}{\\tau^2} = (${fr(aEst3.x, 3)}\\ ;\\ ${fr(aEst3.y, 3)})\\ \\text{m/s}^2`} />}
            <p className="text-sm text-fh-ardoise">
              Les vitesses moyennes M(k)M(k+1)/τ sont associées aux instants intermédiaires (k + ½)τ ; la vitesse centrée et l&apos;accélération à trois positions sont associées à t<sub>i</sub> = iτ.
            </p>
          </div>
        </Panneau>
      )}
    </div>
  );
}
