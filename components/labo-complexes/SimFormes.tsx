"use client";

import { useState, type ReactNode } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { angleEgalMod2Pi, argument, cx, depuisPolaire, enDegres, enRadians, modC, normaliserAngle, type Cx } from "@/lib/complexes";
import { brut } from "@/lib/complexesAffichage";
import {
  ANGLES_REMARQUABLES,
  exactFoisEntier,
  lireAngle,
  lireReel,
  reconnaitreAngleRemarquable,
  reponseEgale,
  texAngle,
  texComplexe,
  texDegres,
  texExact,
  texNombre,
  texReel,
  trigExacte,
} from "@/lib/complexesTex";
import { Arc, Bouton, COULEURS, Conclusion, Curseur, DefiBloc, Fleche, Intro, Message, Pastille, PlanSvg, QuestionChoix, QuestionTexte, Tex, Valeur, Zone, type PointPlan } from "./ui";

const BORNES = { xmin: -6, xmax: 6, ymin: -6, ymax: 6 };

/** Forme trigonométrique et exponentielle (TeX) de r et θ donnés. */
function formes(r: number, theta: number): { trig: string; exp: string } {
  const t = texAngle(theta);
  return { trig: `${texReel(r) === "1" ? "" : texReel(r)}\\left(\\cos ${t} + i\\sin ${t}\\right)`, exp: `${texReel(r) === "1" ? "" : texReel(r)}\\,e^{i${t.startsWith("-") ? `(${t})` : t}}` };
}

const INSTANCES: Array<{ r: number; u: number }> = [
  { r: 2, u: 8 }, // -1 + i√3
  { r: Math.SQRT2, u: -3 }, // 1 - i
  { r: 2, u: -10 }, // -√3 - i
];

function choixFormes(r: number, theta: number, type: "trig" | "exp"): { options: Array<{ id: string; libelle: ReactNode }>; bonne: string; explications: Record<string, ReactNode> } {
  const variantes = [
    { id: "ok", r, t: theta, why: "Le module et l'argument sont les bons." },
    { id: "m", r, t: -theta, why: "Le signe de l'argument est inversé : θ = −θ correspond au conjugué." },
    { id: "r2", r: r * r, t: theta, why: "Le coefficient devant la parenthèse doit être le module r, pas r²." },
    { id: "pi", r, t: normaliserAngle(theta + Math.PI), why: "Cet argument est décalé de π : il correspond à −z." },
  ];
  const ordre = [2, 0, 3, 1];
  const options = ordre.map((i) => {
    const v = variantes[i];
    const f = formes(v.r, v.t);
    return { id: v.id, libelle: <Tex expr={type === "trig" ? f.trig : f.exp} /> };
  });
  const explications: Record<string, ReactNode> = {};
  variantes.forEach((v) => (explications[v.id] = v.why));
  return { options, bonne: "ok", explications };
}

export default function SimFormes() {
  const [z, setZ] = useState<Cx>(cx(-1, Math.sqrt(3)));
  const [thetaMem, setThetaMem] = useState<number>((2 * Math.PI) / 3);

  const r = modC(z);
  const argZ = argument(z);
  const theta = argZ ?? thetaMem;
  const nul = argZ === null;
  const u = nul ? null : reconnaitreAngleRemarquable(theta);
  const exact = u === null ? null : trigExacte(u);
  const pts: PointPlan[] = [{ id: "m", z, couleur: COULEURS.z, etiquette: "M", deplacable: true }];

  function poser(nouveau: Cx) {
    setZ(nouveau);
    const t = argument(nouveau);
    if (t !== null) setThetaMem(t);
  }
  function changerR(v: number) {
    setZ(v === 0 ? cx(0, 0) : depuisPolaire(v, thetaMem));
  }
  function changerTheta(rad: number) {
    const t = normaliserAngle(rad);
    setThetaMem(t);
    if (r > 0) setZ(depuisPolaire(r, t));
  }
  function reinit() {
    setZ(cx(-1, Math.sqrt(3)));
    setThetaMem((2 * Math.PI) / 3);
  }

  const f = nul ? null : formes(r, theta);
  const rTex = texReel(r);
  const approx = u === null ? "\\approx " : "";

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-violet-500 bg-violet-50">
        Un même nombre complexe s&apos;écrit de <strong>trois façons</strong> : algébrique a + ib, trigonométrique r(cos θ + i sin θ) et exponentielle r e<sup>iθ</sup>. Déplace le point, ou change (a, b), ou (r, θ) : les trois écritures désignent toujours le même point.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
          <PlanSvg
            bornes={BORNES}
            points={pts}
            aimant={0.1}
            etiquette="Plan : le point M d'affixe z, déplaçable"
            onDeplacer={(_, p) => poser(p)}
            dessous={(o) => (
              <g>
                {r > 0 && <circle cx={o.X(0)} cy={o.Y(0)} r={r * o.u} fill="none" stroke={COULEURS.resultat} strokeOpacity={0.45} strokeDasharray="4 4" />}
                <line x1={o.X(z.re)} y1={o.Y(0)} x2={o.X(z.re)} y2={o.Y(z.im)} stroke={COULEURS.z} strokeDasharray="5 4" strokeWidth={1.5} />
                <line x1={o.X(0)} y1={o.Y(z.im)} x2={o.X(z.re)} y2={o.Y(z.im)} stroke={COULEURS.z} strokeDasharray="5 4" strokeWidth={1.5} />
                <Fleche o={o} de={cx(0, 0)} vers={z} couleur={COULEURS.z} />
                {!nul && <Arc o={o} centre={cx(0, 0)} rayon={Math.min(1, r * 0.45)} a1={0} a2={theta} couleur={COULEURS.resultat} epaisseur={2.5} />}
                {!nul && (
                  <text x={o.X(z.re / 2)} y={o.Y(z.im / 2)} dx={z.re >= 0 ? -6 : 6} dy={z.im >= 0 ? -6 : 14} textAnchor={z.re >= 0 ? "end" : "start"} fontSize={12} fontWeight={700} fill={COULEURS.z}>
                    r = {brut(r, 2)}
                  </text>
                )}
              </g>
            )}
          />
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/60">Coordonnées (a, b)</p>
            <Curseur etiquette={<Tex expr="a" />} valeur={z.re} min={-5} max={5} pas={0.1} decimales={1} onChange={(v) => poser(cx(v, z.im))} />
            <Curseur etiquette={<Tex expr="b" />} valeur={z.im} min={-5} max={5} pas={0.1} decimales={1} onChange={(v) => poser(cx(z.re, v))} />
            <p className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/60">Forme polaire (r, θ)</p>
            <Curseur etiquette={<Tex expr="r" />} valeur={Number(r.toFixed(3))} min={0} max={6} pas={0.1} decimales={2} onChange={changerR} />
            <Curseur etiquette={<Tex expr="\theta" />} unite="en degrés" valeur={Number(enDegres(theta).toFixed(3))} min={-180} max={180} pas={5} decimales={1} onChange={(d) => changerTheta(enRadians(d))} />
            <Bouton onClick={reinit}>
              <IconRefresh size={18} aria-hidden="true" />
              Réinitialiser
            </Bouton>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-fh-ardoise/60">Angles remarquables (θ en radians et en degrés)</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Angles remarquables">
            {ANGLES_REMARQUABLES.map((a) => (
              <Pastille
                key={a.u}
                actif={!nul && u !== null && ((u % 24) + 24) % 24 === ((a.u % 24) + 24) % 24}
                onClick={() => {
                  if (r === 0) setZ(depuisPolaire(1, a.rad));
                  else setZ(depuisPolaire(r, a.rad));
                  setThetaMem(normaliserAngle(a.rad));
                }}
              >
                <Tex expr={a.tex} />
                <span className="ml-1 text-xs opacity-80">({a.degres}°)</span>
              </Pastille>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2" aria-live="polite">
          <Valeur etiquette="Forme algébrique">
            <Tex expr={`z = ${texComplexe(z)}`} />
          </Valeur>
          {nul || f === null ? (
            <Message type="info">
              z = 0 : forme algébrique <strong>0</strong>, module 0, <strong>argument indéfini</strong>. Il n&apos;y a donc ni forme trigonométrique ni forme exponentielle canoniques (aucun angle n&apos;est inventé).
            </Message>
          ) : (
            <>
              <Valeur etiquette="Forme trigonométrique">
                <Tex expr={`z = ${f.trig}`} />
              </Valeur>
              <Valeur etiquette="Forme exponentielle">
                <Tex expr={`z = ${f.exp}`} />
              </Valeur>
              <div className="grid gap-2 sm:grid-cols-2">
                <Valeur etiquette="Module">
                  <Tex expr={`r = \\sqrt{a^2+b^2} = ${rTex}${rTex.includes("{,}") ? "" : ""}`} />
                </Valeur>
                <Valeur etiquette="Argument (rad · degrés)">
                  <Tex expr={`\\theta ${approx}= ${texAngle(theta)}\\ ;\\ ${texDegres(theta)}`} />
                </Valeur>
                <Valeur etiquette="Cosinus">
                  <Tex expr={`\\cos\\theta = \\dfrac{a}{r} = ${exact ? texExact(exact.cos) : texNombre(z.re / r)}`} />
                </Valeur>
                <Valeur etiquette="Sinus">
                  <Tex expr={`\\sin\\theta = \\dfrac{b}{r} = ${exact ? texExact(exact.sin) : texNombre(z.im / r)}`} />
                </Valeur>
              </div>
            </>
          )}
        </div>
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-fh-ardoise">
          {nul || f === null ? (
            <p>
              Le point est en O : sa distance à l&apos;origine est 0 mais il n&apos;a aucune direction, donc <strong>pas d&apos;argument</strong>. Écarte M de l&apos;origine pour voir apparaître les trois formes.
            </p>
          ) : (
            <>
              <p>
                Le module <Tex expr="r" /> est la distance OM ; l&apos;argument <Tex expr="\theta" /> est l&apos;angle entre l&apos;axe des réels et OM. On passe de (r ; θ) à (a ; b) par <Tex expr="a = r\cos\theta" /> et <Tex expr="b = r\sin\theta" />, et de (a ; b) à (r ; θ) par <Tex expr="r = \sqrt{a^2+b^2}" />, <Tex expr="\cos\theta = a/r" />, <Tex expr="\sin\theta = b/r" />.
              </p>
              {exact && Number.isInteger(r) ? (
                <Tex
                  bloc
                  expr={`z = ${f.trig} = ${rTex === "1" ? "" : rTex}\\left(${texExact(exact.cos)} + i\\,${texExact(exact.sin)}\\right) = ${texExact(exactFoisEntier(exact.cos, r))} + i\\,${texExact(exactFoisEntier(exact.sin, r))}`}
                />
              ) : (
                <Tex bloc expr={`a = r\\cos\\theta \\approx ${texNombre(r * Math.cos(theta))}\\qquad b = r\\sin\\theta \\approx ${texNombre(r * Math.sin(theta))}`} />
              )}
              <p>
                La notation <Tex expr="e^{i\theta}" /> est une écriture commode de <Tex expr="\cos\theta + i\sin\theta" /> : elle fait apparaître que multiplier les nombres revient à multiplier les modules et additionner les arguments.
              </p>
              <p className="text-xs text-fh-ardoise/70">
                L&apos;argument est défini à 2kπ près ; ici on affiche l&apos;argument principal dans ]−π ; π]. {u === null && "Les valeurs trigonométriques de cet angle ne sont pas remarquables : elles sont affichées en valeurs approchées."}
              </p>
            </>
          )}
        </div>
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={INSTANCES.length}
          rendu={(i) => {
            const it = INSTANCES[i];
            const ang = (it.u * Math.PI) / 12;
            const zz = depuisPolaire(it.r, ang);
            const ft = formes(it.r, ang);
            const trig = choixFormes(it.r, ang, "trig");
            const ex = choixFormes(it.r, ang, "exp");
            const exactD = trigExacte(it.u);
            return (
              <>
                <Message type="info">
                  Soit <Tex expr={`z = ${texComplexe(zz)}`} />. <Bouton onClick={() => poser(zz)}>Placer z dans le plan ci-dessus</Bouton>
                </Message>
                <QuestionTexte
                  numero={1}
                  enonce={
                    <>
                      Quel est le module <Tex expr="r = |z|" /> ?
                    </>
                  }
                  placeholder="ex. 2, √2 ou 1,414"
                  verifier={(t) => {
                    const l = lireReel(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    return reponseEgale(l.valeur, it.r) ? { ok: true, message: <>Exact : <Tex expr={`r = ${texReel(it.r)}`} />.</> } : { ok: false, message: <>Utilise <Tex expr="r = \sqrt{a^2+b^2}" />.</> };
                  }}
                  indices={[<>Calcule <Tex expr="a^2 + b^2" />, puis prends la racine carrée.</>]}
                  correction={
                    <>
                      <Tex expr={`r = \\sqrt{${texReel(zz.re)}^2 + ${texReel(zz.im)}^2} = ${texReel(it.r)}`} />.
                    </>
                  }
                />
                <QuestionTexte
                  numero={2}
                  enonce={<>Donne un argument θ de z (en radians, par exemple 2π/3 ou une valeur décimale).</>}
                  placeholder="ex. 2π/3, -pi/4 ou 2,094"
                  verifier={(t) => {
                    const l = lireAngle(t);
                    if (!l.ok) return { ok: false, message: l.erreur };
                    return angleEgalMod2Pi(l.valeur, ang, 5e-3)
                      ? { ok: true, message: <>Exact (à 2kπ près) : <Tex expr={`\\theta = ${texAngle(ang)}`} />.</> }
                      : { ok: false, message: <>Cet angle ne convient pas. Cherche θ tel que <Tex expr="\cos\theta = a/r" /> et <Tex expr="\sin\theta = b/r" />.</> };
                  }}
                  indices={[
                    <>
                      Calcule <Tex expr={`\\cos\\theta = a/r = ${exactD ? texExact(exactD.cos) : texNombre(zz.re / it.r)}`} /> et <Tex expr={`\\sin\\theta = b/r = ${exactD ? texExact(exactD.sin) : texNombre(zz.im / it.r)}`} />.
                    </>,
                    <>Cherche l&apos;angle remarquable qui a ce cosinus et ce sinus.</>,
                  ]}
                  correction={
                    <>
                      <Tex expr={`\\cos\\theta = ${exactD ? texExact(exactD.cos) : ""}`} /> et <Tex expr={`\\sin\\theta = ${exactD ? texExact(exactD.sin) : ""}`} /> donnent <Tex expr={`\\theta = ${texAngle(ang)}`} /> (mod 2π).
                    </>
                  }
                />
                <QuestionChoix
                  numero={3}
                  enonce={<>Quelle est la forme trigonométrique de z ?</>}
                  options={trig.options}
                  bonne={trig.bonne}
                  explications={trig.explications}
                  indices={[<>La forme trigonométrique est <Tex expr="r(\cos\theta + i\sin\theta)" /> avec r et θ trouvés plus haut.</>]}
                  correction={<Tex bloc expr={`z = ${ft.trig}`} />}
                />
                <QuestionChoix
                  numero={4}
                  enonce={<>Quelle est la forme exponentielle de z ?</>}
                  options={ex.options}
                  bonne={ex.bonne}
                  explications={ex.explications}
                  indices={[<>La forme exponentielle est <Tex expr="r\,e^{i\theta}" />.</>]}
                  correction={<Tex bloc expr={`z = ${ft.exp}`} />}
                />
              </>
            );
          }}
        />
      </Zone>

      <Conclusion>
        Un nombre complexe non nul s&apos;écrit a + ib = r(cos θ + i sin θ) = r e<sup>iθ</sup> avec r = √(a²+b²) et cos θ = a/r, sin θ = b/r. L&apos;argument est défini modulo 2π ; le nombre 0 a un module nul mais pas d&apos;argument.
      </Conclusion>
    </div>
  );
}
