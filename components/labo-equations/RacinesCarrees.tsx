"use client";

import { useMemo, useState } from "react";
import { IconRefresh, IconSchool, IconX } from "@tabler/icons-react";

import { cx, modC, mul, sub } from "@/lib/complexes";
import { racineCarree } from "@/lib/equationsComplexes";
import { EXEMPLES_RACINES_CARREES } from "@/lib/equationsComplexesExemples";
import { estApprochee, etapesRacineCarree } from "@/lib/equationsComplexesAffichage";
import { texComplexe } from "@/lib/complexesTex";
import { Bouton, Commandes, Curseur, DeuxColonnes, EQ, EtapeFormule, Intro, Message, Panneau, Pastille, PlanEquations, Tex, Verdict, etiquetteCoord, type RacinePlan } from "./ui";

const DEFAUT = { X: 3, Y: 4 };
const TOTAL = 6;
const arrondi = (v: number) => Number(v.toFixed(4));

const LIBELLE_CAS = {
  nul: "X = Y = 0 : Δ = 0, une seule racine carrée, 0.",
  "y-positif": "Y > 0 : x et y ont le même signe.",
  "y-negatif": "Y < 0 : x et y ont des signes contraires.",
  "reel-positif": "Y = 0 et X > 0 : δ est un réel (y = 0).",
  "reel-negatif": "Y = 0 et X < 0 : δ est un imaginaire pur (x = 0).",
} as const;

/** Onglet 2 : racines carrées d'un complexe quelconque (méthode du programme : identification, module, signe de xy). */
export default function RacinesCarrees() {
  const [X, setX] = useState(DEFAUT.X);
  const [Y, setY] = useState(DEFAUT.Y);
  const [cadre, setCadre] = useState(4);
  const [guide, setGuide] = useState(false);
  const [etape, setEtape] = useState(1);

  const res = useMemo(() => racineCarree(X, Y), [X, Y]);
  // En mode guidé, la figure se construit avec les étapes ; sinon tout est affiché.
  const niveau = guide ? etape : TOTAL;

  /** Changement venant d'un curseur, d'un exemple ou d'une saisie : le repère de Δ s'adapte (il ne bouge PAS pendant un glisser-déposer). */
  function definir(x: number, y: number) {
    setX(arrondi(x));
    setY(arrondi(y));
    setCadre(Math.max(4, Math.abs(x), Math.abs(y)));
  }
  function reinit() {
    definir(DEFAUT.X, DEFAUT.Y);
    setGuide(false);
    setEtape(1);
  }

  const Delta = cx(X, Y);
  const racines: RacinePlan[] =
    res.ok && niveau >= 6
      ? res.racines.map((z, i) => {
          const nom = res.cas === "nul" ? "δ = 0" : i === 0 ? "δ" : "−δ";
          return { id: `d${i}`, nom, z, couleur: i === 0 ? EQ.vert : EQ.orange, etiquette: etiquetteCoord(nom, z) };
        })
      : [];
  const modDelta = res.ok ? Math.sqrt(res.module) : 0;
  const etapes = res.ok ? etapesRacineCarree(res) : [];
  const verification = res.ok && res.cas !== "nul" ? mul(res.delta, res.delta) : null;
  const verifOk = verification !== null && modC(sub(verification, Delta)) <= 1e-9 * Math.max(1, modC(Delta));

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-[#8B5CF6] bg-violet-50">
        Tout nombre complexe <Tex expr="\Delta = X + iY" /> non nul possède exactement <strong>deux racines carrées opposées</strong> : les nombres <Tex expr="\delta = x + iy" /> tels que <Tex expr="\delta^2 = \Delta" />. Déplace <Tex expr="\Delta" /> et regarde les deux racines se placer de part et d&apos;autre de l&apos;origine.
      </Intro>

      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Paramètres">
              <Tex expr={`\\Delta = ${texComplexe(Delta)}`} bloc className="text-lg" />
              <div className="flex flex-wrap gap-3">
                <Curseur etiquette="X : partie réelle de Δ" valeur={X} min={-20} max={20} pas={0.5} decimales={4} onChange={(v) => definir(v, Y)} />
                <Curseur etiquette="Y : partie imaginaire de Δ" valeur={Y} min={-20} max={20} pas={0.5} decimales={4} onChange={(v) => definir(X, v)} />
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples prédéfinis">
                {EXEMPLES_RACINES_CARREES.map((e) => (
                  <Pastille key={e.libelle} actif={X === e.X && Y === e.Y} onClick={() => definir(e.X, e.Y)}>
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
                  {res.cas === "nul" ? (
                    <Verdict ton="ok">
                      <Tex expr="\Delta = 0" /> : une <strong>seule</strong> racine carrée, <Tex expr="\delta = 0" />.
                    </Verdict>
                  ) : (
                    <Verdict ton="ok">
                      Les racines carrées de <Tex expr={`\\Delta = ${texComplexe(Delta)}`} /> sont{" "}
                      <Tex expr={`\\delta = ${estApprochee(res.delta) ? "\\approx " : ""}${texComplexe(res.delta)}`} /> et{" "}
                      <Tex expr={`-\\delta = ${estApprochee(res.delta) ? "\\approx " : ""}${texComplexe(cx(-res.delta.re, -res.delta.im))}`} />.
                    </Verdict>
                  )}
                  <p className="text-sm text-fh-ardoise">{LIBELLE_CAS[res.cas]}</p>
                  {verification && (
                    <p className="text-sm text-fh-ardoise">
                      Contrôle : <Tex expr={`\\delta^2 = ${texComplexe(verification)}`} /> {verifOk ? "= Δ ✓" : "≠ Δ"}
                      {estApprochee(res.delta) && " (valeur approchée : égalité vérifiée à la tolérance 10⁻⁹ près)"}
                    </p>
                  )}
                </div>
                <div>
                  <Bouton
                    variante={guide ? "contour" : "plein"}
                    onClick={() => {
                      setGuide((g) => !g);
                      setEtape(1);
                    }}
                  >
                    {guide ? <IconX size={18} aria-hidden="true" /> : <IconSchool size={18} aria-hidden="true" />}
                    {guide ? "Quitter les étapes" : "Comprendre les étapes"}
                  </Bouton>
                </div>
              </Panneau>
            )}

            {res.ok && guide && (
              <Panneau titre="Les étapes, une à une" ton="explication">
                <Commandes etape={etape} total={TOTAL} onPrecedent={() => setEtape((e) => Math.max(1, e - 1))} onSuivant={() => setEtape((e) => Math.min(TOTAL, e + 1))} onTout={() => setEtape(TOTAL)} onRecommencer={() => setEtape(1)} />
                <ol className="flex flex-col gap-2" aria-label="Étapes de la détermination des racines carrées">
                  {etapes.slice(0, etape).map((e, i) => (
                    <EtapeFormule key={i} numero={i + 1} titre={e.titre} texte={e.texte} expr={e.expr} />
                  ))}
                </ol>
              </Panneau>
            )}
          </>
        }
        droite={
          <>
            <Panneau titre="Plan de Δ (la valeur dont on cherche les racines)">
              <PlanEquations
                titre="Plan de Δ : déplace le point bleu"
                etiquette="Plan complexe de Δ : point déplaçable"
                racines={[]}
                cadre={cadre}
                aimant={0.5}
                points={[{ id: "delta", z: Delta, couleur: EQ.bleu, etiquette: etiquetteCoord("Δ", Delta), deplacable: true }]}
                onDeplacer={(_, z) => {
                  setX(z.re);
                  setY(z.im);
                }}
                dessous={(o) => <line x1={o.X(0)} y1={o.Y(0)} x2={o.X(X)} y2={o.Y(Y)} stroke={EQ.bleu} strokeOpacity={0.35} strokeWidth={1.6} strokeDasharray="4 4" />}
              />
            </Panneau>
            <Panneau titre="Plan des racines carrées δ et −δ">
              <PlanEquations
                titre="Plan des racines carrées : δ et −δ sont opposés"
                etiquette="Plan complexe des deux racines carrées de Δ"
                racines={racines}
                dessous={(o) =>
                  res.ok && res.cas !== "nul" ? (
                    <>
                      {niveau >= 3 && <circle cx={o.X(0)} cy={o.Y(0)} r={o.L(modDelta)} fill="none" stroke={EQ.cyan} strokeWidth={1.5} strokeDasharray="5 4" strokeOpacity={0.8} />}
                      {niveau >= 5 && (
                        <line
                          x1={o.X(-res.delta.re * 1e3)}
                          y1={o.Y(-res.delta.im * 1e3)}
                          x2={o.X(res.delta.re * 1e3)}
                          y2={o.Y(res.delta.im * 1e3)}
                          stroke={EQ.violet}
                          strokeWidth={1.5}
                          strokeDasharray="6 4"
                          strokeOpacity={0.75}
                        />
                      )}
                    </>
                  ) : null
                }
                legende={
                  res.ok && (
                    <p className="text-xs leading-relaxed text-fh-ardoise/80">
                      {res.cas === "nul"
                        ? "Δ = 0 : une seule racine carrée, l'origine."
                        : niveau >= 6
                          ? "δ et −δ sont diamétralement opposés (la droite passe par l'origine) et ont le même module √|Δ| (cercle en pointillés) : δ² = (−δ)² = Δ."
                          : niveau >= 5
                            ? "Étape 5 : seules deux directions opposées sont possibles ; le signe de Y les départage."
                            : niveau >= 3
                              ? "Étape 3 : δ est sur le cercle de rayon √|Δ| (|δ|² = |Δ|)."
                              : "La figure se construit au fil des étapes."}
                    </p>
                  )
                }
              />
            </Panneau>
          </>
        }
      />
    </div>
  );
}
