"use client";

import { useEffect, useState } from "react";
import { IconPlayerPlay, IconRefresh } from "@tabler/icons-react";

import { COEF_MAX, add, angleEgalMod2Pi, conj, depuisPolaire, enDegres, enRadians, racinesNiemes, racinesUnite, resoudreSecondDegre, type Cx } from "@/lib/complexes";
import { brut } from "@/lib/complexesAffichage";
import { lireAngle, lireComplexe, reponseEgale, texComplexe, texDegres, texExact, texMultiplePi, texNombre, texReel, trigExacte, type Exact } from "@/lib/complexesTex";
import { Commandes } from "@/components/labo-pgcd/ui";
import { Bouton, COULEURS, Conclusion, Curseur, DefiBloc, Intro, Message, Pastille, PlanSvg, QuestionChoix, QuestionTexte, Stepper, Tex, Valeur, Zone, type PointPlan } from "./ui";

type Mode = "nieme" | "second";
type CibleRacines = "unite" | "w";

const par = (z: Cx) => `(${texComplexe(z)})`;

/** a + ib avec cos et sin EXACTS (réduits) : « -\frac{1}{2} + i\frac{\sqrt{3}}{2} ». */
function texAlgExact(c: Exact, s: Exact): string {
  const re = texExact(c);
  if (s.n === 0) return re;
  const im = texExact({ ...s, n: Math.abs(s.n) });
  const imPart = im === "1" ? "i" : `i${im.startsWith("\\frac") ? im : `\\,${im}`}`;
  if (c.n === 0) return `${s.n < 0 ? "-" : ""}${imPart}`;
  return `${re} ${s.n < 0 ? "-" : "+"} ${imPart}`;
}

/** Affixe de la racine k de z^n = 1 : exacte si n divise 24 (angle multiple de π/12 remarquable), sinon approchée. */
function texRacineUnite(k: number, n: number): { tex: string; exact: boolean } {
  if (24 % n === 0) {
    const t = trigExacte((24 * k) / n);
    if (t) return { tex: texAlgExact(t.cos, t.sin), exact: true };
  }
  const z = depuisPolaire(1, (2 * Math.PI * k) / n);
  return { tex: texComplexe(z), exact: false };
}

const EXEMPLES: Array<{ a: number; b: number; c: number; libelle: string }> = [
  { a: 1, b: -2, c: 5, libelle: "z² − 2z + 5" },
  { a: 1, b: -3, c: 2, libelle: "z² − 3z + 2" },
  { a: 1, b: -2, c: 1, libelle: "z² − 2z + 1" },
  { a: 2, b: 2, c: 5, libelle: "2z² + 2z + 5" },
];

const INSTANCES: Array<{ a: number; b: number; c: number; n: number }> = [
  { a: 1, b: -2, c: 5, n: 6 },
  { a: 1, b: -3, c: 2, n: 3 },
  { a: 1, b: -4, c: 4, n: 8 },
];

const NATURES = [
  { id: "deux-reelles", libelle: "Deux racines réelles distinctes" },
  { id: "double", libelle: "Une racine double" },
  { id: "complexes", libelle: "Deux racines complexes conjuguées" },
];

function texEquation(a: number, b: number, c: number): string {
  const terme = (coef: number, v: string, premier: boolean) => {
    if (coef === 0) return "";
    const abs = Math.abs(coef);
    const corps = v === "" ? texReel(abs) : abs === 1 ? v : `${texReel(abs)}${v}`;
    return premier ? `${coef < 0 ? "-" : ""}${corps}` : ` ${coef < 0 ? "-" : "+"} ${corps}`;
  };
  let s = terme(a, "z^2", true);
  s += terme(b, "z", s === "");
  s += terme(c, "", s === "");
  return `${s === "" ? "0" : s} = 0`;
}

export default function SimRacines() {
  const [mode, setMode] = useState<Mode>("nieme");

  // Mode A
  const [n, setN] = useState(6);
  const [cible, setCible] = useState<CibleRacines>("unite");
  const [rw, setRw] = useState(2);
  const [thetaW, setThetaW] = useState(60);
  const [etape, setEtape] = useState(6);
  const [anim, setAnim] = useState(false);

  // Mode B
  const [a, setA] = useState(1);
  const [b, setB] = useState(-2);
  const [c, setC] = useState(5);

  useEffect(() => {
    if (!anim || etape >= n) return;
    const t = setTimeout(() => setEtape((e) => Math.min(n, e + 1)), 650);
    return () => clearTimeout(t);
  }, [anim, etape, n]);
  const enAnimation = anim && etape < n;

  const w = depuisPolaire(rw, enRadians(thetaW));
  const racines = cible === "unite" ? racinesUnite(n) : racinesNiemes(w, n);
  const rayon = cible === "unite" ? 1 : Math.pow(rw, 1 / n);
  const visibles = (racines ?? []).slice(0, etape);

  const sd = resoudreSecondDegre(a, b, c);

  function changerN(v: number) {
    setN(v);
    setEtape(v);
    setAnim(false);
  }
  function reinit() {
    setN(6);
    setCible("unite");
    setRw(2);
    setThetaW(60);
    setEtape(6);
    setAnim(false);
    setA(1);
    setB(-2);
    setC(5);
  }

  let points: PointPlan[] = [];
  let B = 2;
  if (mode === "nieme") {
    B = Math.max(2, Math.ceil(rayon + 0.6));
    points = visibles.map((r) => ({ id: `r${r.k}`, z: r.z, couleur: r.k === 0 ? COULEURS.resultat : COULEURS.conjugue, etiquette: `z${r.k}` }));
  } else if (sd.ok) {
    const m = Math.max(...sd.racines.map((r) => Math.max(Math.abs(r.re), Math.abs(r.im))), 0);
    B = Math.max(4, Math.ceil(m + 0.8));
    points = sd.racines.map((r, i) => ({ id: `s${i}`, z: r, couleur: i === 0 ? COULEURS.z : COULEURS.resultat, etiquette: sd.cas === "double" ? "z₁ = z₂" : `z${i + 1}` }));
  }
  const bornes = { xmin: -B, xmax: B, ymin: -B, ymax: B };

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-teal-500 bg-teal-50">
        Les solutions de z<sup>n</sup> = 1 sont réparties régulièrement sur le cercle unité et forment un polygone régulier. Les équations du second degré à coefficients réels ont toujours deux solutions complexes : si Δ &lt; 0, elles sont conjuguées.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Mode">
          <Pastille actif={mode === "nieme"} onClick={() => setMode("nieme")}>
            A · Racines n-ièmes
          </Pastille>
          <Pastille actif={mode === "second"} onClick={() => setMode("second")}>
            B · Second degré
          </Pastille>
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
          <PlanSvg
            bornes={bornes}
            points={points}
            pas={B > 6 ? undefined : 1}
            etiquette={mode === "nieme" ? "Plan des racines n-ièmes" : "Plan des solutions de l'équation du second degré"}
            dessous={(o) => (
              <g>
                {mode === "nieme" && (
                  <>
                    <circle cx={o.X(0)} cy={o.Y(0)} r={rayon * o.u} fill="none" stroke={COULEURS.gris} strokeOpacity={0.6} strokeDasharray="5 4" />
                    {n >= 3 && visibles.length >= 2 && (
                      <polygon
                        points={visibles.map((r) => o.P(r.z)).join(" ")}
                        fill={visibles.length === n ? COULEURS.conjugue : "none"}
                        fillOpacity={0.1}
                        stroke={COULEURS.conjugue}
                        strokeWidth={2}
                        strokeLinejoin="round"
                        strokeOpacity={visibles.length === n ? 1 : 0.0}
                      />
                    )}
                    {n >= 3 && visibles.length >= 2 && visibles.length < n && <polyline points={visibles.map((r) => o.P(r.z)).join(" ")} fill="none" stroke={COULEURS.conjugue} strokeWidth={2} />}
                    {visibles.map((r) => (
                      <line key={r.k} x1={o.X(0)} y1={o.Y(0)} x2={o.X(r.z.re)} y2={o.Y(r.z.im)} stroke={COULEURS.gris} strokeOpacity={0.25} />
                    ))}
                  </>
                )}
                {mode === "second" && sd.ok && sd.cas === "complexes" && (
                  <line x1={o.X(sd.racines[0].re)} y1={o.Y(sd.racines[0].im)} x2={o.X(sd.racines[1].re)} y2={o.Y(sd.racines[1].im)} stroke={COULEURS.resultat} strokeDasharray="4 4" strokeWidth={1.8} />
                )}
              </g>
            )}
          />

          <div className="flex min-w-0 flex-col gap-3">
            {mode === "nieme" ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-fh-ardoise/80">Valeur de n (2 à 12)</span>
                  <Stepper etiquette="Valeur de n" valeur={n} min={2} max={12} onChange={changerN} />
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Équation">
                  <Pastille actif={cible === "unite"} onClick={() => { setCible("unite"); setEtape(n); }}>
                    zⁿ = 1
                  </Pastille>
                  <Pastille actif={cible === "w"} onClick={() => { setCible("w"); setEtape(n); }}>
                    zⁿ = w
                  </Pastille>
                </div>
                {cible === "w" && (
                  <>
                    <Curseur etiquette={<>Module de w : <Tex expr="|w|" /></>} valeur={rw} min={0.1} max={3} pas={0.1} decimales={2} onChange={setRw} />
                    <Curseur etiquette={<>Argument de w</>} unite="degrés" valeur={thetaW} min={-180} max={180} pas={5} decimales={0} onChange={setThetaW} />
                  </>
                )}
                <Bouton
                  variante="plein"
                  onClick={() => {
                    setEtape(0);
                    setAnim(true);
                  }}
                  disabled={enAnimation}
                >
                  <IconPlayerPlay size={18} aria-hidden="true" />
                  {enAnimation ? "Apparition en cours…" : "Faire apparaître les racines"}
                </Bouton>
              </>
            ) : (
              <>
                <Curseur etiquette={<Tex expr="a" />} valeur={a} min={-20} max={20} pas={0.5} decimales={1} onChange={setA} />
                <Curseur etiquette={<Tex expr="b" />} valeur={b} min={-20} max={20} pas={0.5} decimales={1} onChange={setB} />
                <Curseur etiquette={<Tex expr="c" />} valeur={c} min={-20} max={20} pas={0.5} decimales={1} onChange={setC} />
                <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
                  {EXEMPLES.map((e) => (
                    <Pastille key={e.libelle} actif={a === e.a && b === e.b && c === e.c} onClick={() => { setA(e.a); setB(e.b); setC(e.c); }}>
                      {e.libelle}
                    </Pastille>
                  ))}
                </div>
              </>
            )}
            <Bouton onClick={reinit}>
              <IconRefresh size={18} aria-hidden="true" />
              Réinitialiser
            </Bouton>
          </div>
        </div>

        {mode === "nieme" && racines && (
          <>
            <Commandes
              etape={etape}
              total={n}
              onPrecedent={() => { setAnim(false); setEtape((e) => Math.max(0, e - 1)); }}
              onSuivant={() => { setAnim(false); setEtape((e) => Math.min(n, e + 1)); }}
              onTout={() => { setAnim(false); setEtape(n); }}
              onRecommencer={() => { setAnim(false); setEtape(0); }}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-live="polite">
              <Valeur etiquette="Nombre de racines"><Tex expr={`n = ${n}`} /></Valeur>
              <Valeur etiquette="Écart angulaire"><Tex expr={`\\dfrac{2\\pi}{${n}} = ${texMultiplePi(2, n)}\\ (${texDegres((2 * Math.PI) / n)})`} /></Valeur>
              <Valeur etiquette={cible === "unite" ? "Rayon du cercle" : "Rayon |w|^(1/n)"}><Tex expr={cible === "unite" ? "1" : `|w|^{1/n} = ${texNombre(rayon)}`} /></Valeur>
            </div>
            <ul className="grid min-w-0 gap-2 sm:grid-cols-2" aria-label="Racines affichées">
              {visibles.map((r) => {
                const ex = cible === "unite" ? texRacineUnite(r.k, n) : null;
                return (
                  <li key={r.k} className="min-w-0 rounded-lg border border-fh-sable bg-white px-3 py-2 text-sm">
                    {cible === "unite" ? (
                      <Tex
                        expr={`z_{${r.k}} = e^{i\\,${texMultiplePi(2 * r.k, n)}} = ${(ex as { tex: string }).tex}${(ex as { exact: boolean }).exact ? "" : "\\ (\\text{valeur approchée})"}`}
                      />
                    ) : (
                      <Tex expr={`z_{${r.k}} = ${texNombre(rayon)}\\,e^{i\\,${texDegres(r.argument)}} \\approx ${texComplexe(r.z)}`} />
                    )}
                  </li>
                );
              })}
              {visibles.length === 0 && <li className="text-sm text-fh-ardoise/70">Aucune racine affichée : clique sur « Étape suivante ».</li>}
            </ul>
          </>
        )}

        {mode === "second" && (
          <div className="flex flex-col gap-2" aria-live="polite">
            {!sd.ok ? (
              <Message type="erreur">{sd.erreur}</Message>
            ) : (
              <>
                <Tex bloc expr={`${texEquation(a, b, c)}`} />
                <Tex bloc expr={`\\Delta = b^2 - 4ac = ${texReel(b).startsWith("-") ? `(${texReel(b)})` : texReel(b)}^2 - 4\\times ${texReel(a).startsWith("-") ? `(${texReel(a)})` : texReel(a)}\\times ${texReel(c).startsWith("-") ? `(${texReel(c)})` : texReel(c)} = ${texReel(sd.delta)}`} />
                {sd.cas === "deux-reelles" && (
                  <Message type="ok">
                    Δ &gt; 0 : deux racines réelles distinctes, <Tex expr={`z_1 = ${texComplexe(sd.racines[0])}`} /> et <Tex expr={`z_2 = ${texComplexe(sd.racines[1])}`} />.
                  </Message>
                )}
                {sd.cas === "double" && (
                  <Message type="ok">
                    Δ = 0 : une racine double, <Tex expr={`z_0 = -\\dfrac{b}{2a} = ${texComplexe(sd.racines[0])}`} />.
                  </Message>
                )}
                {sd.cas === "complexes" && (
                  <>
                    <Message type="ok">
                      Δ &lt; 0 : deux racines complexes conjuguées, <Tex expr={`z_1 = ${texComplexe(sd.racines[0])}`} /> et <Tex expr={`z_2 = ${texComplexe(sd.racines[1])}`} />. Elles sont symétriques par rapport à l&apos;axe des réels (segment en pointillés).
                    </Message>
                    <Tex bloc expr={`z_{1,2} = \\dfrac{-b \\pm i\\sqrt{-\\Delta}}{2a} = \\dfrac{${texReel(-b)} \\pm i\\sqrt{${texReel(-sd.delta)}}}{${texReel(2 * a)}}`} />
                  </>
                )}
              </>
            )}
          </div>
        )}
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-fh-ardoise">
          {mode === "nieme" ? (
            <>
              <p>
                Écrivons <Tex expr="z = \rho\,e^{i\varphi}" />. L&apos;équation <Tex expr={cible === "unite" ? "z^n = 1" : "z^n = w"} /> impose <Tex expr={cible === "unite" ? "\\rho^n = 1" : "\\rho^n = |w|"} /> et <Tex expr={cible === "unite" ? "n\\varphi = 2k\\pi" : "n\\varphi = \\arg w + 2k\\pi"} />, donc :
              </p>
              <Tex bloc expr={cible === "unite" ? `z_k = e^{\\frac{2ik\\pi}{n}},\\quad k = 0,1,\\dots,n-1` : `z_k = |w|^{1/n}\\,e^{i\\frac{\\arg w + 2k\\pi}{n}},\\quad k = 0,1,\\dots,n-1`} />
              <p>
                Il y a exactement <strong>{n} racines</strong>, toutes de module {cible === "unite" ? "1" : texNombre(rayon).replace("{,}", ",")}, séparées par l&apos;angle <Tex expr={`\\dfrac{2\\pi}{${n}}`} />. {n >= 3 ? "En les reliant, on obtient un polygone régulier à " + n + " côtés." : "Pour n = 2, on obtient deux points diamétralement opposés (z et −z)."}
              </p>
            </>
          ) : (
            <>
              <p>
                Pour <Tex expr="az^2 + bz + c = 0" /> avec <Tex expr="a \neq 0" />, on calcule <Tex expr="\Delta = b^2 - 4ac" /> :
              </p>
              <ul className="list-disc pl-5">
                <li><Tex expr="\Delta > 0" /> : deux racines réelles <Tex expr="\dfrac{-b \pm \sqrt{\Delta}}{2a}" />.</li>
                <li><Tex expr="\Delta = 0" /> : une racine double <Tex expr="-\dfrac{b}{2a}" />.</li>
                <li><Tex expr="\Delta < 0" /> : deux racines complexes conjuguées <Tex expr="\dfrac{-b \pm i\sqrt{-\Delta}}{2a}" />.</li>
              </ul>
              <p>Comme les coefficients sont réels, si z est solution alors son conjugué aussi : les solutions non réelles sont symétriques par rapport à l&apos;axe des réels. Il faut a ≠ 0 : sinon l&apos;équation n&apos;est plus du second degré.</p>
            </>
          )}
        </div>
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={INSTANCES.length}
          rendu={(i) => {
            const it = INSTANCES[i];
            const sol = resoudreSecondDegre(it.a, it.b, it.c);
            if (!sol.ok) return null;
            const cibleRacine = sol.cas === "complexes" ? sol.racines[1] : sol.racines[sol.racines.length - 1];
            const delta = sol.delta;
            return (
              <>
                <QuestionChoix
                  numero={1}
                  enonce={
                    <>
                      Avant de calculer les racines : quelle est la nature des solutions de <Tex expr={texEquation(it.a, it.b, it.c)} /> ?
                    </>
                  }
                  options={NATURES.map((x) => ({ id: x.id, libelle: x.libelle }))}
                  bonne={sol.cas}
                  explications={{
                    "deux-reelles": <>Δ = {texNombre(delta).replace("{,}", ",")} {delta > 0 ? "> 0" : delta < 0 ? "< 0" : "= 0"} : {delta > 0 ? "deux racines réelles distinctes." : "ce n'est pas le cas de Δ > 0."}</>,
                    double: <>Δ = {texNombre(delta).replace("{,}", ",")} : {delta === 0 ? "une racine double." : "Δ n'est pas nul."}</>,
                    complexes: <>Δ = {texNombre(delta).replace("{,}", ",")} : {delta < 0 ? "deux racines complexes conjuguées." : "Δ n'est pas négatif."}</>,
                  }}
                  indices={[<>Calcule le discriminant <Tex expr="\Delta = b^2 - 4ac" />.</>, <>Regarde le signe de Δ : positif, nul ou négatif.</>]}
                  correction={
                    <>
                      <Tex expr={`\\Delta = ${texReel(it.b)}^2 - 4\\times ${texReel(it.a)}\\times ${texReel(it.c)} = ${texReel(delta)}`} /> : {sol.cas === "deux-reelles" ? "Δ > 0, deux racines réelles distinctes." : sol.cas === "double" ? "Δ = 0, une racine double." : "Δ < 0, deux racines complexes conjuguées."}
                    </>
                  }
                />
                <QuestionTexte
                  numero={2}
                  enonce={
                    <>
                      Donne {sol.cas === "complexes" ? "la solution de partie imaginaire positive" : sol.cas === "double" ? "la racine double" : "la plus grande solution"} de <Tex expr={texEquation(it.a, it.b, it.c)} />.
                    </>
                  }
                  placeholder="ex. 1 + 2i ou 2"
                  verifier={(t) => {
                    const l = lireComplexe(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    if (reponseEgale(l.valeur.re, cibleRacine.re) && reponseEgale(l.valeur.im, cibleRacine.im)) return { ok: true, message: <>Exact : <Tex expr={texComplexe(cibleRacine)} />.</> };
                    const autre = sol.cas === "complexes" && reponseEgale(l.valeur.re, cibleRacine.re) && reponseEgale(l.valeur.im, -cibleRacine.im);
                    return { ok: false, message: autre ? <>C&apos;est l&apos;autre racine, le conjugué : celle qui est demandée a une partie imaginaire positive.</> : <>Applique la formule des racines avec le Δ trouvé.</> };
                  }}
                  indices={[<>Utilise <Tex expr={sol.cas === "complexes" ? "\\dfrac{-b \\pm i\\sqrt{-\\Delta}}{2a}" : "\\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}"} />.</>]}
                  correction={
                    <>
                      <Tex expr={`z = ${texComplexe(cibleRacine)}`} />
                      {sol.cas === "complexes" && (
                        <>
                          {" "}(l&apos;autre racine est son conjugué <Tex expr={texComplexe(conj(cibleRacine))} />, et leur somme vaut <Tex expr={`${par(sol.racines[0])} + ${par(sol.racines[1])} = ${texComplexe(add(sol.racines[0], sol.racines[1]))} = -\\dfrac{b}{a}`} />).
                        </>
                      )}
                    </>
                  }
                />
                <QuestionTexte
                  numero={3}
                  enonce={
                    <>
                      Quel angle sépare deux racines consécutives de <Tex expr={`z^{${it.n}} = 1`} /> ? Donne-le en radians.
                    </>
                  }
                  placeholder="ex. π/3 ou 1,047"
                  verifier={(t) => {
                    const l = lireAngle(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    return angleEgalMod2Pi(l.valeur, (2 * Math.PI) / it.n, 5e-3) && l.valeur > 0
                      ? { ok: true, message: <>Exact : <Tex expr={`\\dfrac{2\\pi}{${it.n}} = ${texMultiplePi(2, it.n)}`} /> ({texDegres((2 * Math.PI) / it.n)}).</> }
                      : { ok: false, message: <>Les {it.n} racines sont régulièrement réparties sur un tour complet (2π).</> };
                  }}
                  indices={[<>Les {it.n} racines se partagent un tour complet de 2π.</>]}
                  correction={
                    <>
                      <Tex expr={`\\dfrac{2\\pi}{${it.n}} = ${texMultiplePi(2, it.n)}`} /> rad, soit {brut(enDegres((2 * Math.PI) / it.n), 1)}°. Les racines sont <Tex expr={`z_k = e^{\\frac{2ik\\pi}{${it.n}}}`} />, k = 0 … {it.n - 1}.
                    </>
                  }
                />
              </>
            );
          }}
        />
        <p className="text-xs text-fh-ardoise/60">Les coefficients acceptés vont jusqu&apos;à ±{COEF_MAX.toLocaleString("fr-FR")} ; ici, de −20 à 20.</p>
      </Zone>

      <Conclusion>
        L&apos;équation zⁿ = 1 a n solutions, les racines n-ièmes de l&apos;unité zₖ = e^(2ikπ/n), régulièrement réparties sur le cercle unité (polygone régulier). Pour az² + bz + c = 0 (a ≠ 0), Δ &gt; 0 donne deux racines réelles, Δ = 0 une racine double, Δ &lt; 0 deux racines complexes conjuguées.
      </Conclusion>
    </div>
  );
}

