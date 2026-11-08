"use client";

import { useMemo, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { argument, cx, type Cx } from "@/lib/complexes";
import { resoudreSecondDegre } from "@/lib/equationsComplexes";
import { EXEMPLES_RESOLUTION } from "@/lib/equationsComplexesExemples";
import { estApprochee, parC, texDeltaComplexe, texEquation, texFormesPolaires, texModule, texRacine } from "@/lib/equationsComplexesAffichage";
import { texAngle, texComplexe } from "@/lib/complexesTex";
import BilanPolynome from "./BilanPolynome";
import { Bouton, ChampNombre, DeuxColonnes, EQ, EtapeFormule, Intro, Message, Panneau, Pastille, PlanEquations, Tex, Verdict, etiquetteCoord, indice, type RacinePlan } from "./ui";

const DEFAUT = { a: cx(1), b: cx(-4), c: cx(13) };
const memeC = (u: Cx, v: Cx) => u.re === v.re && u.im === v.im;

/** Onglet 3 : second degré à coefficients COMPLEXES (six champs : parties réelle et imaginaire de a, b, c). */
export default function Resolution() {
  const [a, setA] = useState<Cx>(DEFAUT.a);
  const [b, setB] = useState<Cx>(DEFAUT.b);
  const [c, setC] = useState<Cx>(DEFAUT.c);
  const [choisie, setChoisie] = useState<string | null>("r0");

  const res = useMemo(() => resoudreSecondDegre(a, b, c), [a, b, c]);
  const poly = [a, b, c];

  const racines: RacinePlan[] = res.ok
    ? res.racines.map((z, i) => {
        const nom = res.double ? "z₀" : `z${indice(i + 1)}`;
        return { id: `r${i}`, nom, z, couleur: i === 0 ? EQ.vert : EQ.orange, etiquette: etiquetteCoord(nom, z), multiplicite: res.multiplicites[i] };
      })
    : [];
  const sel = racines.find((r) => r.id === choisie) ?? racines[0] ?? null;

  function exemple(i: number) {
    const e = EXEMPLES_RESOLUTION[i];
    setA(e.a);
    setB(e.b);
    setC(e.c);
    setChoisie("r0");
  }
  function reinit() {
    setA(DEFAUT.a);
    setB(DEFAUT.b);
    setC(DEFAUT.c);
    setChoisie("r0");
  }

  const champ = (nom: string, z: Cx, set: (v: Cx) => void) => (
    <div className="grid min-w-0 grid-cols-2 gap-2 rounded-xl border border-[#dbe7ff] bg-[#EFF6FF]/60 p-2">
      <ChampNombre etiquette={`${nom}ᵣ (partie réelle)`} valeur={z.re} onChange={(v) => set({ re: v, im: z.im })} />
      <ChampNombre etiquette={`${nom}ᵢ (partie imaginaire)`} valeur={z.im} onChange={(v) => set({ re: z.re, im: v })} />
    </div>
  );

  const arg = sel ? argument(sel.z) : null;
  const formes = sel && arg !== null ? texFormesPolaires(sel.z, arg) : null;

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-[#06B6D4] bg-cyan-50">
        Pour <Tex expr="az^2 + bz + c = 0" /> avec <Tex expr="a, b, c" /> <strong>complexes</strong> (<Tex expr="a \neq 0" />), on calcule <Tex expr="\Delta = b^2 - 4ac" />, une racine carrée <Tex expr="\delta" /> de <Tex expr="\Delta" />, puis <Tex expr="z = \frac{-b \pm \delta}{2a}" />. Quand <Tex expr="\Delta" /> n&apos;est pas réel, on ne le compare pas à 0 par <Tex expr=">" /> ou <Tex expr="<" /> : on cherche directement <Tex expr="\delta" />.
      </Intro>

      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Équation">
              <Tex expr={res.ok ? texEquation(poly) : "az^2 + bz + c = 0"} bloc className="text-lg" />
              <div className="flex flex-col gap-2">
                {champ("a", a, setA)}
                {champ("b", b, setB)}
                {champ("c", c, setC)}
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples intégrés">
                {EXEMPLES_RESOLUTION.map((e, i) => (
                  <Pastille key={e.libelle} actif={memeC(a, e.a) && memeC(b, e.b) && memeC(c, e.c)} onClick={() => exemple(i)}>
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
              <Panneau titre="Résolution pas à pas" ton="explication">
                <ol className="flex flex-col gap-2" aria-label="Étapes de la résolution">
                  <EtapeFormule numero={1} titre="Discriminant (un nombre complexe)" expr={texDeltaComplexe(a, b, c, res.delta)} />
                  <EtapeFormule
                    numero={2}
                    titre="Une racine carrée de Δ"
                    texte={
                      res.double
                        ? "Δ = 0 : une seule racine carrée, 0 ; l'équation a une racine double."
                        : res.deltaReel
                          ? "Δ est un nombre réel ; on cherche δ tel que δ² = Δ."
                          : "Δ n'est pas réel : on ne parle ni de Δ > 0 ni de Δ < 0. On cherche directement δ tel que δ² = Δ (onglet « Racines carrées »)."
                    }
                    expr={res.double ? "\\delta = 0" : `\\delta = ${estApprochee(res.racineDelta) ? "\\approx " : ""}${texComplexe(res.racineDelta)} \\qquad (\\delta^2 = \\Delta)`}
                  />
                  <EtapeFormule
                    numero={3}
                    titre="Appliquer la formule"
                    expr={
                      res.double
                        ? `z_0 = \\frac{-b}{2a} = \\frac{-${parC(b)}}{2 \\times ${parC(a)}}`
                        : `z = \\frac{-b \\pm \\delta}{2a} = \\frac{-${parC(b)} \\pm ${parC(res.racineDelta)}}{2 \\times ${parC(a)}}`
                    }
                  />
                  <EtapeFormule
                    numero={4}
                    titre={res.double ? "La solution (racine double)" : "Les deux solutions"}
                    texte={res.racines.some(estApprochee) ? "Valeurs approchées (arrondies à 3 décimales) : l'écriture exacte n'est pas reconnue." : undefined}
                    expr={res.double ? `S = \\left\\{ ${texComplexe(res.racines[0])} \\right\\}` : `S = \\left\\{ ${texComplexe(res.racines[0])} \\; ; \\; ${texComplexe(res.racines[1])} \\right\\}`}
                  />
                </ol>
                <Verdict ton="ok">
                  {res.double ? (
                    <>
                      Racine double : <Tex expr={`z_0 = ${texRacine(res.racines[0])}`} />
                    </>
                  ) : (
                    <>
                      <Tex expr={`z_1 = ${texRacine(res.racines[0])}`} /> et <Tex expr={`z_2 = ${texRacine(res.racines[1])}`} />
                    </>
                  )}
                </Verdict>
              </Panneau>
            )}
          </>
        }
        droite={
          <>
            <Panneau titre="Plan complexe">
              <PlanEquations
                titre="Clique sur une racine pour l'étudier"
                etiquette="Plan complexe : solutions de l'équation du second degré"
                racines={racines}
                onChoisir={setChoisie}
                choisie={sel?.id ?? null}
                legende={res.ok && res.double ? <p className="text-xs text-fh-ardoise/80">Un seul point : la racine double (anneau et badge ×2).</p> : undefined}
              />
            </Panneau>
            {res.ok && sel && (
              <Panneau titre={`Détail de ${sel.nom}`} ton="resultat">
                <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
                  <Detail etiquette="Forme algébrique">
                    <Tex expr={`z = ${texRacine(sel.z)}`} />
                  </Detail>
                  <Detail etiquette="Module">
                    <Tex expr={`|z| = ${texModule(sel.z)}`} />
                  </Detail>
                  <Detail etiquette="Argument">
                    {arg === null ? <span>Aucun : zéro n&apos;a pas d&apos;argument.</span> : <Tex expr={`\\arg z \\equiv ${texAngle(arg).includes("{,}") ? "\\approx " : ""}${texAngle(arg)} \\;[2\\pi]`} />}
                  </Detail>
                  <Detail etiquette="Forme trigonométrique">{formes ? <Tex expr={`z ${formes.approchee ? "\\approx" : "="} ${formes.trig}`} /> : <span>Non définie pour z = 0.</span>}</Detail>
                  <Detail etiquette="Forme exponentielle">{formes ? <Tex expr={`z ${formes.approchee ? "\\approx" : "="} ${formes.exp}`} /> : <span>Non définie pour z = 0.</span>}</Detail>
                </div>
                {formes?.approchee && <p className="text-xs text-fh-ardoise/70">Écritures contenant des valeurs approchées (arrondies à 3 décimales).</p>}
                <h5 className="text-xs font-bold uppercase tracking-wide text-[#102A66]/80">Vérification : z annule-t-il le polynôme ?</h5>
                <BilanPolynome p={poly} z={sel.z} />
              </Panneau>
            )}
          </>
        }
      />
    </div>
  );
}

function Detail({ etiquette, children }: { etiquette: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-[#dbe7ff] bg-white px-3 py-2">
      <span className="text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">{etiquette}</span>
      <span className="min-w-0 break-words text-sm font-semibold text-[#102A66]">{children}</span>
    </div>
  );
}
