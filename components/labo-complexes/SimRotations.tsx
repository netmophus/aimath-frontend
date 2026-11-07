"use client";

import { useState, type ReactNode } from "react";
import { IconRefresh } from "@tabler/icons-react";

import {
  I,
  add,
  angleOriente,
  argument,
  cx,
  depuisPolaire,
  distance,
  enDegres,
  enRadians,
  expI,
  moivre,
  modC,
  mul,
  presqueEgal,
  puissanceEntiere,
  rotation,
  sub,
  versPolaire,
  type Cx,
} from "@/lib/complexes";
import { lireComplexe, reponseEgale, texAngle, texComplexe, texDegres, texNombre, texReel } from "@/lib/complexesTex";
import { Arc, Bouton, COULEURS, Conclusion, Curseur, DefiBloc, Fleche, Intro, Message, Pastille, PlanSvg, QuestionTexte, Stepper, Tex, Valeur, Zone, type PointPlan } from "./ui";
import { devMul } from "./SimCalculs";

type Mode = "produit" | "puissances" | "centre";

const par = (z: Cx) => `(${texComplexe(z)})`;

/** Demi-largeur du repère : assez grande pour contenir tous les points, au moins `min`. */
function demiLargeur(points: Cx[], min: number): number {
  const m = Math.max(...points.map((p) => Math.max(Math.abs(p.re), Math.abs(p.im))), 0);
  return Math.max(min, Math.ceil(m + 0.6));
}

function verifier(t: string, attendu: Cx): { ok: boolean; message: ReactNode } {
  const l = lireComplexe(t);
  if (!l.ok) return { ok: false, message: l.erreur };
  if (reponseEgale(l.valeur.re, attendu.re) && reponseEgale(l.valeur.im, attendu.im)) return { ok: true, message: <>Exact : <Tex expr={texComplexe(attendu)} />.</> };
  return { ok: false, message: <>Ce n&apos;est pas le bon point. Compare avec la simulation : quelle rotation, quel module ?</> };
}

const INSTANCES: Array<{ z1: Cx; w: Cx; wTex: string; wNom: string; centre: Cx; m: Cx; theta: number; base: Cx; n: number }> = [
  { z1: cx(2, 1), w: I, wTex: "i", wNom: "la multiplication par i (rotation de +90°)", centre: cx(1, 0), m: cx(3, 2), theta: Math.PI / 2, base: cx(1, 1), n: 8 },
  { z1: cx(-3, 2), w: cx(-1, 0), wTex: "-1", wNom: "la multiplication par −1 (demi-tour)", centre: cx(0, 2), m: cx(3, 2), theta: Math.PI, base: cx(1, -1), n: 4 },
  { z1: cx(1, 2), w: cx(0, -1), wTex: "-i", wNom: "la multiplication par −i (rotation de −90°)", centre: cx(1, 1), m: cx(3, 1), theta: -Math.PI / 2, base: cx(Math.sqrt(3), 1), n: 6 },
];

export default function SimRotations() {
  const [mode, setMode] = useState<Mode>("produit");

  // Produit : z = r e^{iα}, w = ρ e^{iβ}
  const [r, setR] = useState(2);
  const [alphaDeg, setAlphaDeg] = useState(30);
  const [rho, setRho] = useState(1);
  const [betaDeg, setBetaDeg] = useState(90);
  // Puissances
  const [rp, setRp] = useState(1.2);
  const [alphaP, setAlphaP] = useState(40);
  const [n, setN] = useState(5);
  // Rotation de centre A
  const [A, setA] = useState<Cx>(cx(1, 1));
  const [M, setM] = useState<Cx>(cx(3, 1));
  const [thetaDeg, setThetaDeg] = useState(90);

  const alpha = enRadians(alphaDeg);
  const beta = enRadians(betaDeg);
  const z = depuisPolaire(r, alpha);
  const w = depuisPolaire(rho, beta);
  const zw = mul(z, w);

  const zp = depuisPolaire(rp, enRadians(alphaP));
  const suite: Cx[] = [];
  for (let k = 0; k <= n; k++) suite.push(depuisPolaire(Math.pow(rp, k), k * enRadians(alphaP)));
  const mo = moivre(zp, n);

  const theta = enRadians(thetaDeg);
  const Mi = rotation(A, theta, M);

  function reinit() {
    setR(2);
    setAlphaDeg(30);
    setRho(1);
    setBetaDeg(90);
    setRp(1.2);
    setAlphaP(40);
    setN(5);
    setA(cx(1, 1));
    setM(cx(3, 1));
    setThetaDeg(90);
  }

  // Cas particuliers du multiplicateur
  const estI = presqueEgal(rho, 1) && presqueEgal(betaDeg, 90);
  const estMoinsUn = presqueEgal(rho, 1) && presqueEgal(Math.abs(betaDeg), 180);
  const estHomothetie = presqueEgal(betaDeg, 0) && rho > 0;

  let points: PointPlan[] = [];
  let B = 6;
  if (mode === "produit") {
    B = demiLargeur([z, w, zw], 4);
    points = [
      { id: "z", z, couleur: COULEURS.z, etiquette: "z", deplacable: true },
      { id: "w", z: w, couleur: COULEURS.w, etiquette: "w", deplacable: true },
      { id: "zw", z: zw, couleur: COULEURS.resultat, etiquette: "zw" },
    ];
  } else if (mode === "puissances") {
    B = demiLargeur(suite, 2);
    points = [
      { id: "zp", z: zp, couleur: COULEURS.z, etiquette: "z", deplacable: true },
      { id: "zn", z: suite[n], couleur: COULEURS.resultat, etiquette: `z^${n}` },
    ];
  } else {
    B = demiLargeur([A, M, Mi], 5);
    points = [
      { id: "A", z: A, couleur: COULEURS.gris, etiquette: "A", deplacable: true },
      { id: "M", z: M, couleur: COULEURS.z, etiquette: "M", deplacable: true },
      { id: "Mi", z: Mi, couleur: COULEURS.resultat, etiquette: "M′" },
    ];
  }
  const bornes = { xmin: -B, xmax: B, ymin: -B, ymax: B };
  const bornePoint = (p: Cx, lim: number) => cx(Math.max(-lim, Math.min(lim, p.re)), Math.max(-lim, Math.min(lim, p.im)));

  function deplacer(id: string, p: Cx) {
    if (id === "z") {
      const pl = versPolaire(p);
      setR(Math.max(0.3, Math.min(3, Number(pl.r.toFixed(2)))));
      if (pl.theta !== null) setAlphaDeg(Math.round(enDegres(pl.theta)));
    } else if (id === "w") {
      const pl = versPolaire(p);
      setRho(Math.max(0.2, Math.min(3, Number(pl.r.toFixed(2)))));
      if (pl.theta !== null) setBetaDeg(Math.round(enDegres(pl.theta)));
    } else if (id === "zp") {
      const pl = versPolaire(p);
      setRp(Math.max(0.5, Math.min(1.5, Number(pl.r.toFixed(2)))));
      if (pl.theta !== null) setAlphaP(Math.round(enDegres(pl.theta)));
    } else if (id === "A") setA(bornePoint(p, 5));
    else if (id === "M") setM(bornePoint(p, 5));
  }

  const rayonAM = distance(A, M);
  const thetaAM = angleOriente(cx(1, 0), sub(M, A));

  const explication: ReactNode =
    mode === "produit" ? (
      <>
        <p>
          En forme exponentielle <Tex expr="z = r\,e^{i\alpha}" /> et <Tex expr="w = \rho\,e^{i\beta}" />, le produit se calcule en <strong>multipliant les modules</strong> et en <strong>additionnant les arguments</strong> :
        </p>
        <Tex bloc expr={`zw = r\\rho\\, e^{i(\\alpha+\\beta)} = ${texNombre(r * rho)}\\,e^{i(${texDegres(alpha)} + ${texDegres(beta)})} = ${texNombre(r * rho)}\\,e^{i\\,${texDegres(alpha + beta)}}`} />
        <p>
          Multiplier z par w, c&apos;est donc tourner OM d&apos;un angle <Tex expr={`\\beta = ${texDegres(beta)}`} /> et multiplier sa longueur par <Tex expr={`\\rho = ${texNombre(rho)}`} /> (rapport des longueurs <Tex expr={`|zw|/|z| = ${texNombre(rho)}`} />).
        </p>
        {estI && <Message type="ok">Multiplication par i : rotation de +90° autour de l&apos;origine, les longueurs sont conservées (z′ = iz).</Message>}
        {estMoinsUn && <Message type="ok">Multiplication par −1 : demi-tour (rotation de 180°) autour de l&apos;origine (z′ = −z).</Message>}
        {estHomothetie && !presqueEgal(rho, 1) && <Message type="ok">Multiplication par le réel positif {texNombre(rho).replace("{,}", ",")} : même direction, distances à l&apos;origine multipliées par {texNombre(rho).replace("{,}", ",")}.</Message>}
      </>
    ) : mode === "puissances" ? (
      <>
        <p>
          Formule de Moivre : si <Tex expr="z = r\,e^{i\alpha}" />, alors <Tex expr="z^n = r^n\,e^{in\alpha}" />. À chaque multiplication par z, le point tourne de α et sa distance à O est multipliée par r.
        </p>
        {mo && (
          <>
            <Tex bloc expr={`z^{${n}} = ${texNombre(rp)}^{${n}}\\,e^{i\\cdot ${n}\\cdot ${texDegres(enRadians(alphaP))}} = ${texNombre(mo.module)}\\,e^{i\\,${texDegres(mo.argumentBrut)}}`} />
            {mo.tours !== 0 && (
              <p>
                L&apos;angle <Tex expr={`n\\alpha = ${texDegres(mo.argumentBrut)}`} /> n&apos;est pas l&apos;argument principal : on lui retire {Math.abs(mo.tours)} tour{Math.abs(mo.tours) > 1 ? "s" : ""} complet{Math.abs(mo.tours) > 1 ? "s" : ""} (2π chacun) pour obtenir <Tex expr={`${texDegres(mo.argumentPrincipal)}`} /> dans ]−180° ; 180°].
              </p>
            )}
          </>
        )}
      </>
    ) : (
      <>
        <p>
          La rotation de centre A (affixe a) et d&apos;angle θ s&apos;écrit <Tex expr="z' = a + e^{i\theta}(z - a)" /> : on tourne le vecteur AM de θ, puis on repart de A.
        </p>
        <Tex bloc expr={`z' = ${par(A)} + e^{i\\,${texDegres(theta)}}\\left(${par(M)} - ${par(A)}\\right) = ${texComplexe(Mi)}`} />
        {rayonAM === 0 ? (
          <Message type="info">M est confondu avec le centre A : M′ = M, le centre d&apos;une rotation est invariant.</Message>
        ) : (
          <p>
            La rotation conserve les distances au centre : <Tex expr={`AM = ${texNombre(rayonAM)} = AM' = ${texNombre(distance(A, Mi))}`} />. Le sens est {thetaDeg > 0 ? "direct (anti-horaire)" : thetaDeg < 0 ? "indirect (horaire)" : "nul (aucune rotation)"} et l&apos;amplitude vaut {Math.abs(thetaDeg)}°.
          </p>
        )}
      </>
    );

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-orange-500 bg-orange-50">
        Multiplier par un nombre complexe, c&apos;est <strong>tourner et agrandir</strong> : les modules se multiplient, les arguments s&apos;additionnent. Observe les rotations, les puissances (formule de Moivre) et les rotations de centre quelconque.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Mode">
          <Pastille actif={mode === "produit"} onClick={() => setMode("produit")}>
            Produit zw
          </Pastille>
          <Pastille actif={mode === "puissances"} onClick={() => setMode("puissances")}>
            Puissances zⁿ
          </Pastille>
          <Pastille actif={mode === "centre"} onClick={() => setMode("centre")}>
            Rotation de centre A
          </Pastille>
        </div>
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
          <PlanSvg
            bornes={bornes}
            points={points}
            aimant={mode === "centre" ? 0.5 : 0.1}
            etiquette="Plan des multiplications, puissances et rotations"
            onDeplacer={deplacer}
            dessous={(o) => (
              <g>
                {mode === "produit" && (
                  <>
                    <Fleche o={o} de={cx(0, 0)} vers={z} couleur={COULEURS.z} epaisseur={2.5} />
                    <Fleche o={o} de={cx(0, 0)} vers={w} couleur={COULEURS.w} epaisseur={2} />
                    <Fleche o={o} de={cx(0, 0)} vers={zw} couleur={COULEURS.resultat} epaisseur={3} />
                    <Arc o={o} centre={cx(0, 0)} rayon={Math.max(0.5, Math.min(r, modC(zw)) * 0.55)} a1={alpha} a2={alpha + beta} couleur={COULEURS.resultat} epaisseur={2.5} />
                    <Arc o={o} centre={cx(0, 0)} rayon={0.45} a1={0} a2={alpha} couleur={COULEURS.z} />
                    <circle cx={o.X(0)} cy={o.Y(0)} r={r * o.u} fill="none" stroke={COULEURS.z} strokeOpacity={0.3} strokeDasharray="3 4" />
                    <circle cx={o.X(0)} cy={o.Y(0)} r={modC(zw) * o.u} fill="none" stroke={COULEURS.resultat} strokeOpacity={0.3} strokeDasharray="3 4" />
                  </>
                )}
                {mode === "puissances" && (
                  <>
                    <circle cx={o.X(0)} cy={o.Y(0)} r={o.u} fill="none" stroke="#94a3b8" strokeDasharray="4 4" />
                    <polyline points={suite.map((p) => o.P(p)).join(" ")} fill="none" stroke={COULEURS.resultat} strokeOpacity={0.6} strokeWidth={1.8} />
                    {suite.map((p, k) => (
                      <circle key={k} cx={o.X(p.re)} cy={o.Y(p.im)} r={3.5} fill={k === 0 ? COULEURS.gris : COULEURS.resultat} />
                    ))}
                    <Fleche o={o} de={cx(0, 0)} vers={zp} couleur={COULEURS.z} epaisseur={2} />
                  </>
                )}
                {mode === "centre" && (
                  <>
                    {rayonAM > 0 && <circle cx={o.X(A.re)} cy={o.Y(A.im)} r={rayonAM * o.u} fill="none" stroke={COULEURS.gris} strokeOpacity={0.4} strokeDasharray="4 4" />}
                    <line x1={o.X(A.re)} y1={o.Y(A.im)} x2={o.X(M.re)} y2={o.Y(M.im)} stroke={COULEURS.z} strokeWidth={2} />
                    <line x1={o.X(A.re)} y1={o.Y(A.im)} x2={o.X(Mi.re)} y2={o.Y(Mi.im)} stroke={COULEURS.resultat} strokeWidth={2} />
                    {rayonAM > 0 && thetaAM !== null && <Arc o={o} centre={A} rayon={Math.min(rayonAM * 0.5, 1.2)} a1={thetaAM} a2={thetaAM + theta} couleur={COULEURS.resultat} epaisseur={2.5} />}
                  </>
                )}
              </g>
            )}
          />
          <div className="flex min-w-0 flex-col gap-3">
            {mode === "produit" && (
              <>
                <Curseur etiquette={<>Module de z : <Tex expr="r" /></>} valeur={r} min={0.3} max={3} pas={0.1} decimales={2} onChange={setR} />
                <Curseur etiquette={<>Argument de z : <Tex expr="\alpha" /></>} unite="degrés" valeur={alphaDeg} min={-180} max={180} pas={5} decimales={0} onChange={setAlphaDeg} />
                <Curseur etiquette={<>Module de w : <Tex expr="\rho" /></>} valeur={rho} min={0.2} max={3} pas={0.1} decimales={2} onChange={setRho} />
                <Curseur etiquette={<>Argument de w : <Tex expr="\beta" /></>} unite="degrés" valeur={betaDeg} min={-180} max={180} pas={5} decimales={0} onChange={setBetaDeg} />
                <div className="flex flex-wrap gap-2" role="group" aria-label="Multiplicateurs classiques">
                  <Pastille actif={estI} onClick={() => { setRho(1); setBetaDeg(90); }}>× i</Pastille>
                  <Pastille actif={estMoinsUn} onClick={() => { setRho(1); setBetaDeg(180); }}>× (−1)</Pastille>
                  <Pastille actif={estHomothetie && presqueEgal(rho, 2)} onClick={() => { setRho(2); setBetaDeg(0); }}>× 2</Pastille>
                  <Pastille actif={presqueEgal(rho, 1) && presqueEgal(betaDeg, 60)} onClick={() => { setRho(1); setBetaDeg(60); }}>× e^(iπ/3)</Pastille>
                </div>
              </>
            )}
            {mode === "puissances" && (
              <>
                <Curseur etiquette={<>Module de z : <Tex expr="r" /></>} valeur={rp} min={0.5} max={1.5} pas={0.05} decimales={2} onChange={setRp} />
                <Curseur etiquette={<>Argument de z : <Tex expr="\alpha" /></>} unite="degrés" valeur={alphaP} min={-180} max={180} pas={5} decimales={0} onChange={setAlphaP} />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-fh-ardoise/80">Exposant n</span>
                  <Stepper etiquette="Exposant n" valeur={n} min={1} max={10} onChange={setN} />
                </div>
              </>
            )}
            {mode === "centre" && (
              <>
                <Curseur etiquette={<>Angle <Tex expr="\theta" /></>} unite="degrés" valeur={thetaDeg} min={-180} max={180} pas={15} decimales={0} onChange={setThetaDeg} />
                <div className="flex flex-wrap gap-2" role="group" aria-label="Angles classiques">
                  {[90, 180, -90, 60].map((d) => (
                    <Pastille key={d} actif={thetaDeg === d} onClick={() => setThetaDeg(d)}>
                      {d}°
                    </Pastille>
                  ))}
                </div>
                <p className="text-xs text-fh-ardoise/70">Déplace A (le centre) et M, ou règle θ.</p>
              </>
            )}
            <Bouton onClick={reinit}>
              <IconRefresh size={18} aria-hidden="true" />
              Réinitialiser
            </Bouton>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-live="polite">
          {mode === "produit" && (
            <>
              <Valeur etiquette="z"><Tex expr={`z = ${texNombre(r)}\\,e^{i\\,${texDegres(alpha)}} = ${texComplexe(z)}`} /></Valeur>
              <Valeur etiquette="w"><Tex expr={`w = ${texNombre(rho)}\\,e^{i\\,${texDegres(beta)}} = ${texComplexe(w)}`} /></Valeur>
              <Valeur etiquette="zw"><Tex expr={`zw = ${texComplexe(zw)}`} /></Valeur>
              <Valeur etiquette="Module et rotation"><Tex expr={`|zw| = ${texNombre(r * rho)}\\ ;\\ \\text{rotation de }${texDegres(beta)}`} /></Valeur>
              <Valeur etiquette="Argument de zw (principal)">
                {argument(zw) === null ? "indéfini" : <Tex expr={`${texDegres(argument(zw) as number)}\\ (\\alpha+\\beta = ${texDegres(alpha + beta)})`} />}
              </Valeur>
              <Valeur etiquette="Rapport des longueurs"><Tex expr={`\\dfrac{|zw|}{|z|} = ${texNombre(rho)}`} /></Valeur>
            </>
          )}
          {mode === "puissances" && mo && (
            <>
              <Valeur etiquette={`Module de z^${n}`}><Tex expr={`r^{${n}} = ${texNombre(mo.module)}`} /></Valeur>
              <Valeur etiquette="Argument brut nα"><Tex expr={`${n}\\alpha = ${texDegres(mo.argumentBrut)}`} /></Valeur>
              <Valeur etiquette="Argument principal"><Tex expr={`${texDegres(mo.argumentPrincipal)}\\ (\\text{modulo }360^\\circ)`} /></Valeur>
              <Valeur etiquette={`z^${n}`}><Tex expr={texComplexe(suite[n])} /></Valeur>
            </>
          )}
          {mode === "centre" && (
            <>
              <Valeur etiquette="Centre A"><Tex expr={`a = ${texComplexe(A)}`} /></Valeur>
              <Valeur etiquette="M → M′"><Tex expr={`${texComplexe(M)} \\to ${texComplexe(Mi)}`} /></Valeur>
              <Valeur etiquette="Conservation de la distance"><Tex expr={`AM = ${texNombre(rayonAM)}\\ ;\\ AM' = ${texNombre(distance(A, Mi))}`} /></Valeur>
              <Valeur etiquette="Sens et amplitude">{thetaDeg === 0 ? "aucune rotation" : `${thetaDeg > 0 ? "direct" : "indirect"}, ${Math.abs(thetaDeg)}°`}</Valeur>
            </>
          )}
        </div>
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-fh-ardoise">{explication}</div>
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={INSTANCES.length}
          rendu={(i) => {
            const it = INSTANCES[i];
            const r1 = mul(it.w, it.z1);
            const r2 = rotation(it.centre, it.theta, it.m);
            const m3 = moivre(it.base, it.n);
            const r3 = puissanceEntiere(it.base, it.n) as Cx;
            return (
              <>
                <QuestionTexte
                  numero={1}
                  enonce={
                    <>
                      Prévois l&apos;image de <Tex expr={`z = ${texComplexe(it.z1)}`} /> par {it.wNom} : <Tex expr={`z' = ${it.wTex}\\,z`} />. Essaie d&apos;abord de la placer mentalement, puis compare avec le mode « Produit zw ».
                    </>
                  }
                  placeholder="ex. -1 + 2i"
                  verifier={(t) => verifier(t, r1)}
                  indices={[<>Une rotation de ±90° échange les rôles de la partie réelle et de la partie imaginaire ; un demi-tour change les deux signes.</>, <>Calcule <Tex expr={`${it.wTex}\\times ${par(it.z1)}`} /> en développant.</>]}
                  correction={<Tex bloc expr={devMul(it.w, it.z1)} />}
                />
                <QuestionTexte
                  numero={2}
                  enonce={
                    <>
                      Quelle est l&apos;image de <Tex expr={`M\\,(${texComplexe(it.m)})`} /> par la rotation de centre <Tex expr={`A\\,(${texComplexe(it.centre)})`} /> et d&apos;angle <Tex expr={`${texAngle(it.theta)}`} /> ({texDegres(it.theta).replace("^\\circ", "°")}) ?
                    </>
                  }
                  placeholder="ex. 1 + 2i"
                  verifier={(t) => verifier(t, r2)}
                  indices={[<>Utilise <Tex expr="z' = a + e^{i\theta}(z - a)" />.</>, <>Calcule d&apos;abord <Tex expr={`z - a = ${texComplexe(sub(it.m, it.centre))}`} />, puis multiplie par <Tex expr={`e^{i\\theta} = ${texComplexe(expI(it.theta))}`} />.</>]}
                  correction={
                    <>
                      <Tex bloc expr={`z' = ${par(it.centre)} + ${par(expI(it.theta))}${par(sub(it.m, it.centre))} = ${par(it.centre)} + ${par(mul(expI(it.theta), sub(it.m, it.centre)))} = ${texComplexe(add(it.centre, mul(expI(it.theta), sub(it.m, it.centre))))}`} />
                    </>
                  }
                />
                <QuestionTexte
                  numero={3}
                  enonce={
                    <>
                      Calcule <Tex expr={`\\left(${texComplexe(it.base)}\\right)^{${it.n}}`} /> avec la formule de Moivre.
                    </>
                  }
                  placeholder="ex. 16 ou -64"
                  verifier={(t) => verifier(t, r3)}
                  indices={[<>Écris d&apos;abord z sous forme exponentielle : cherche son module et son argument.</>, <>Élève le module à la puissance {it.n} et multiplie l&apos;argument par {it.n}.</>]}
                  correction={
                    m3 ? (
                      <>
                        <Tex bloc expr={`|z| = ${texReel(modC(it.base))},\\ \\arg z = ${texAngle(argument(it.base) as number)} \\Rightarrow |z|^{${it.n}} = ${texReel(m3.module)},\\ ${it.n}\\arg z = ${texAngle(m3.argumentBrut)}`} />
                        <Tex bloc expr={`z^{${it.n}} = ${texReel(m3.module)}\\,e^{i${texAngle(m3.argumentBrut)}} = ${texComplexe(r3)}`} />
                      </>
                    ) : null
                  }
                />
              </>
            );
          }}
        />
      </Zone>

      <Conclusion>
        zw = rρ e<sup>i(α+β)</sup> : on multiplie les modules et on additionne les arguments. Multiplier par i tourne de +90°, par −1 d&apos;un demi-tour, par un réel positif k agrandit de k. zⁿ = rⁿ e<sup>inα</sup> (Moivre). La rotation de centre A et d&apos;angle θ est z′ = a + e<sup>iθ</sup>(z − a) et conserve AM.
      </Conclusion>
    </div>
  );
}
