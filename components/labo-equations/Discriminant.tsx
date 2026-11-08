"use client";

import { useMemo, useState } from "react";
import { IconEye, IconEyeOff, IconRefresh } from "@tabler/icons-react";

import { discriminantReel } from "@/lib/equationsComplexes";
import { cx } from "@/lib/complexes";
import { EXEMPLES_DISCRIMINANT } from "@/lib/equationsComplexesExemples";
import { estApprochee, parReel, texDeltaReel, texEquation, texReelPrecis, texRacine } from "@/lib/equationsComplexesAffichage";
import { texComplexe, texReel } from "@/lib/complexesTex";
import { Bouton, Curseur, DeuxColonnes, EQ, EtapeFormule, Intro, Message, Panneau, Pastille, PlanEquations, Tex, Verdict, etiquetteCoord, indice, type RacinePlan } from "./ui";

const DEFAUT = { a: 1, b: -5, c: 6 };

const CAS = [
  { id: "deux-reelles", signe: "\\Delta > 0", titre: "Deux racines réelles distinctes", detail: "Les deux points sont sur l'axe réel." },
  { id: "double", signe: "\\Delta = 0", titre: "Une racine double", detail: "Un seul point, de multiplicité 2." },
  { id: "complexes", signe: "\\Delta < 0", titre: "Deux racines complexes conjuguées", detail: "Les deux points sont symétriques par rapport à l'axe réel." },
] as const;

const arrondi = (v: number) => Number(v.toFixed(4));

/** Onglet 1 : le discriminant d'un trinôme à coefficients RÉELS décide du nombre et de la nature des racines. */
export default function Discriminant() {
  const [a, setA] = useState(DEFAUT.a);
  const [b, setB] = useState(DEFAUT.b);
  const [c, setC] = useState(DEFAUT.c);
  const [etapes, setEtapes] = useState(false);

  const res = useMemo(() => discriminantReel(a, b, c), [a, b, c]);

  const racines: RacinePlan[] = res.ok
    ? res.racines.map((z, i) => {
        const nom = res.cas === "double" ? "z₀" : `z${indice(i + 1)}`;
        return { id: `r${i}`, nom, z, couleur: i === 0 ? EQ.vert : EQ.orange, etiquette: etiquetteCoord(nom, z), multiplicite: res.multiplicites[i] };
      })
    : [];

  function exemple(i: number) {
    const e = EXEMPLES_DISCRIMINANT[i];
    setA(e.a);
    setB(e.b);
    setC(e.c);
  }
  function reinit() {
    setA(DEFAUT.a);
    setB(DEFAUT.b);
    setC(DEFAUT.c);
    setEtapes(false);
  }

  const eqTex = res.ok ? texEquation([cx(a), cx(b), cx(c)]) : "az^2 + bz + c = 0";

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-[#2563EB] bg-[#EFF6FF]">
        Pour <Tex expr="az^2 + bz + c = 0" /> avec <Tex expr="a, b, c" /> réels et <Tex expr="a \neq 0" />, le nombre <Tex expr="\Delta = b^2 - 4ac" /> décide : deux racines réelles, une racine double, ou deux racines complexes conjuguées. Fais varier les coefficients et regarde les points bouger.
      </Intro>

      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Paramètres">
              <Tex expr={`${eqTex}`} bloc className="text-lg" />
              <div className="flex flex-wrap gap-3">
                <Curseur etiquette="Coefficient a (a ≠ 0)" valeur={a} min={-5} max={5} pas={0.1} decimales={4} onChange={(v) => setA(arrondi(v))} />
                <Curseur etiquette="Coefficient b" valeur={b} min={-10} max={10} pas={0.1} decimales={4} onChange={(v) => setB(arrondi(v))} />
                <Curseur etiquette="Coefficient c" valeur={c} min={-10} max={10} pas={0.1} decimales={4} onChange={(v) => setC(arrondi(v))} />
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples prédéfinis">
                {EXEMPLES_DISCRIMINANT.map((e, i) => (
                  <Pastille key={e.libelle} actif={a === e.a && b === e.b && c === e.c} onClick={() => exemple(i)}>
                    {e.libelle}
                  </Pastille>
                ))}
                <Bouton onClick={reinit}>
                  <IconRefresh size={18} aria-hidden="true" />
                  Réinitialiser
                </Bouton>
              </div>
              {!res.ok && <Message type="erreur">{res.erreur}</Message>}
            </Panneau>

            {res.ok && (
              <Panneau titre="Résultat" ton="resultat">
                <div aria-live="polite" className="flex flex-col gap-2">
                  <Tex expr={`\\Delta = ${texReelPrecis(res.delta)}`} bloc className="text-xl font-bold" />
                  <div role="list" aria-label="Les trois cas du discriminant" className="grid gap-2">
                    {CAS.map((k) => {
                      const actif = res.cas === k.id;
                      return (
                        <div
                          key={k.id}
                          role="listitem"
                          aria-current={actif ? "true" : undefined}
                          className={`flex min-w-0 items-start gap-3 rounded-xl border-2 px-3 py-2 text-sm transition-colors ${actif ? "border-[#2563EB] bg-white shadow-md" : "border-transparent bg-white/50 text-fh-ardoise/60"}`}
                        >
                          <span className={`shrink-0 rounded-md px-2 py-0.5 ${actif ? "bg-[#2563EB] text-white" : "bg-slate-200 text-slate-600"}`}>
                            <Tex expr={k.signe} />
                          </span>
                          <span className="min-w-0">
                            <strong className="block text-[#102A66]">{k.titre}</strong>
                            {actif && <span className="text-fh-ardoise">{k.detail}</span>}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <Verdict ton="ok">
                    {res.cas === "double" ? (
                      <>
                        Une seule solution (racine double) : <Tex expr={`z_0 = ${texRacine(res.racines[0])}`} />
                      </>
                    ) : (
                      <>
                        Deux solutions distinctes : <Tex expr={`z_1 = ${texRacine(res.racines[0])}`} /> et <Tex expr={`z_2 = ${texRacine(res.racines[1])}`} />
                        {res.cas === "complexes" && <> (conjuguées l&apos;une de l&apos;autre)</>}
                      </>
                    )}
                  </Verdict>
                </div>
                <div>
                  <Bouton onClick={() => setEtapes((v) => !v)}>
                    {etapes ? <IconEyeOff size={18} aria-hidden="true" /> : <IconEye size={18} aria-hidden="true" />}
                    {etapes ? "Masquer les étapes" : "Afficher les étapes"}
                  </Bouton>
                </div>
                {etapes && (
                  <ol className="flex flex-col gap-2" aria-label="Étapes du calcul">
                    <EtapeFormule numero={1} titre="Calculer le discriminant" expr={texDeltaReel(a, b, c, res.delta)} />
                    <EtapeFormule
                      numero={2}
                      titre="Comparer Δ à 0 (Δ est un réel : on peut le comparer)"
                      expr={res.cas === "deux-reelles" ? "\\Delta > 0" : res.cas === "double" ? "\\Delta = 0" : "\\Delta < 0"}
                      texte={CAS.find((k) => k.id === res.cas)?.titre}
                    />
                    <EtapeFormule
                      numero={3}
                      titre="Appliquer la formule"
                      expr={
                        res.cas === "deux-reelles"
                          ? `z_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} = \\frac{-${parReel(b)} \\pm \\sqrt{${texReelPrecis(res.delta)}}}{2 \\times ${parReel(a)}}`
                          : res.cas === "double"
                            ? `z_0 = \\frac{-b}{2a} = \\frac{-${parReel(b)}}{2 \\times ${parReel(a)}} = ${texReel(res.racines[0].re)}`
                            : `z_{1,2} = \\frac{-b \\pm i\\sqrt{-\\Delta}}{2a} = \\frac{-${parReel(b)} \\pm i\\sqrt{${texReelPrecis(-res.delta)}}}{2 \\times ${parReel(a)}}`
                      }
                    />
                    <EtapeFormule
                      numero={4}
                      titre="Écrire les solutions"
                      texte={res.racines.some(estApprochee) ? "Valeurs approchées (arrondies à 3 décimales)." : undefined}
                      expr={res.cas === "double" ? `S = \\left\\{ ${texComplexe(res.racines[0])} \\right\\}` : `S = \\left\\{ ${texComplexe(res.racines[0])} \\; ; \\; ${texComplexe(res.racines[1])} \\right\\}`}
                    />
                  </ol>
                )}
              </Panneau>
            )}
          </>
        }
        droite={
          <Panneau titre="Plan complexe">
            <PlanEquations
              titre="Axe horizontal : Re(z) · axe vertical : Im(z)"
              etiquette="Plan complexe : racines de l'équation du second degré"
              racines={racines}
              dessous={(o) =>
                res.ok && res.cas === "complexes" ? (
                  <>
                    <line x1={o.X(res.racines[0].re)} y1={o.Y(res.racines[0].im)} x2={o.X(res.racines[1].re)} y2={o.Y(res.racines[1].im)} stroke={EQ.violet} strokeWidth={1.6} strokeDasharray="5 4" strokeOpacity={0.8} />
                    <circle cx={o.X(res.racines[0].re)} cy={o.Y(0)} r={3.5} fill={EQ.violet} />
                  </>
                ) : null
              }
              legende={
                res.ok && (
                  <p className="text-xs leading-relaxed text-fh-ardoise/80">
                    {res.cas === "deux-reelles" && "Deux points distincts sur l'axe réel (Im = 0)."}
                    {res.cas === "double" && "Un seul point : la racine double. Les anneaux et le badge ×2 rappellent sa multiplicité."}
                    {res.cas === "complexes" && "z₁ et z₂ sont symétriques par rapport à l'axe réel : la droite en pointillés est perpendiculaire à cet axe et le coupe en leur milieu."}
                  </p>
                )
              }
            />
          </Panneau>
        }
      />
    </div>
  );
}
