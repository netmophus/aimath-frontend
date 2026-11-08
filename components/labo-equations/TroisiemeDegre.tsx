"use client";

import { useMemo, useState } from "react";
import { IconRefresh, IconSearch } from "@tabler/icons-react";

import { cx, type Cx } from "@/lib/complexes";
import { lireComplexe, texComplexe } from "@/lib/complexesTex";
import { chercherRacineSimple, resoudreTroisiemeDegre, type Poly } from "@/lib/equationsComplexes";
import { EXEMPLES_TROISIEME } from "@/lib/equationsComplexesExemples";
import { estApprochee, parC, texDeltaComplexe, texEquation, texPolynome, texRacine, texSubstitutionPolynome } from "@/lib/equationsComplexesAffichage";
import { Bouton, ChampComplexe, Commandes, DeuxColonnes, EQ, EtapeFormule, Intro, Message, Panneau, Pastille, PlanEquations, Tex, Verdict, etiquetteCoord, indice, type RacinePlan } from "./ui";
import BilanPolynome from "./BilanPolynome";

const DEFAUT = EXEMPLES_TROISIEME[0];
const TOTAL = 5;
const NOMS = ["a", "b", "c", "d"] as const;
type Methode = "identification" | "division";

/** Onglet 4 : factoriser un polynôme du 3e degré dont on connaît (ou cherche) une racine, puis résoudre le quotient. */
export default function TroisiemeDegre() {
  const [coefs, setCoefs] = useState<string[]>([...DEFAUT.coefs]);
  const [z0Texte, setZ0Texte] = useState(DEFAUT.z0);
  const [methode, setMethode] = useState<Methode>("identification");
  const [etape, setEtape] = useState(TOTAL);
  const [recherche, setRecherche] = useState<string | null>(null);

  const lectures = coefs.map((t) => lireComplexe(t));
  const lectureZ0 = lireComplexe(z0Texte);
  const poly: Poly | null = lectures.every((l) => l.ok) ? lectures.map((l) => (l.ok ? l.valeur : cx(0))) : null;
  const z0: Cx | null = lectureZ0.ok ? lectureZ0.valeur : null;

  const res = useMemo(() => (poly && z0 ? resoudreTroisiemeDegre(poly, z0) : null), [poly, z0]);

  function charger(i: number) {
    const e = EXEMPLES_TROISIEME[i];
    setCoefs([...e.coefs]);
    setZ0Texte(e.z0);
    setEtape(TOTAL);
    setRecherche(null);
  }
  function reinit() {
    charger(0);
    setMethode("identification");
  }
  function chercher() {
    if (!poly) return;
    const z = chercherRacineSimple(poly);
    if (z === null) {
      setRecherche("Aucune racine entière (ou de Gauss, partie réelle et imaginaire entières, |.| ≤ 10) n'a été trouvée. Cela ne prouve pas qu'il n'y en a pas : essaie une autre proposition.");
      return;
    }
    setZ0Texte(texteNombre(z));
    setEtape(TOTAL);
    setRecherche(`Racine trouvée : ${texteNombre(z)}.`);
  }

  const racines: RacinePlan[] =
    res && res.ok
      ? res.racines.map((z, i) => {
          const nom = `z${indice(i + 1)}`;
          const connue = Math.hypot(z.re - res.z0.re, z.im - res.z0.im) <= 1e-8 * Math.max(1, Math.hypot(z.re, z.im));
          return { id: `r${i}`, nom, z, couleur: connue ? EQ.violet : i % 2 === 0 ? EQ.vert : EQ.orange, etiquette: etiquetteCoord(connue ? `${nom} (connue)` : nom, z), multiplicite: res.multiplicites[i] };
        })
      : [];
  const candidat: RacinePlan[] = res && !res.ok && res.raison === "pas-racine" && z0 ? [{ id: "cand", nom: "z₀", z: z0, couleur: "#e11d48", etiquette: etiquetteCoord("z₀ (candidat)", z0) }] : [];

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-[#F97316] bg-orange-50">
        Pour <Tex expr="P(z) = az^3 + bz^2 + cz + d" />, si on connaît une racine <Tex expr="z_0" />, alors <Tex expr="P(z) = (z - z_0)\,Q(z)" /> avec <Tex expr="Q" /> du second degré : on résout <Tex expr="Q(z) = 0" /> avec la méthode de l&apos;onglet précédent.
      </Intro>
      <Message type="info">
        Cette méthode ne résout pas toutes les équations du troisième degré par une formule générale : elle suppose qu&apos;une racine est <strong>connue ou trouvée au préalable</strong> (par exemple en testant des valeurs simples).
      </Message>

      <DeuxColonnes
        gauche={
          <>
            <Panneau titre="Équation et racine proposée">
              <Tex expr={poly ? texEquation(poly) : "az^3 + bz^2 + cz + d = 0"} bloc className="text-lg" />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {NOMS.map((n, i) => (
                  <ChampComplexe
                    key={n}
                    etiquette={`Coefficient ${n}`}
                    valeur={coefs[i]}
                    erreur={lectures[i].ok ? null : lectures[i].erreur}
                    placeholder="ex. -6"
                    onChange={(t) => {
                      setCoefs((cs) => cs.map((x, j) => (j === i ? t : x)));
                      setRecherche(null);
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-[10rem] flex-1">
                  <ChampComplexe etiquette="Racine proposée z₀" valeur={z0Texte} erreur={lectureZ0.ok ? null : lectureZ0.erreur} placeholder="ex. 2 ou 1 + i" onChange={(t) => { setZ0Texte(t); setRecherche(null); }} />
                </div>
                <Bouton onClick={chercher} disabled={!poly}>
                  <IconSearch size={18} aria-hidden="true" />
                  Chercher une racine simple
                </Bouton>
              </div>
              {recherche && <Message type="info">{recherche}</Message>}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples prédéfinis">
                {EXEMPLES_TROISIEME.map((e, i) => (
                  <Pastille key={e.libelle} actif={coefs.join("|") === e.coefs.join("|") && z0Texte === e.z0} onClick={() => charger(i)}>
                    {e.libelle}
                  </Pastille>
                ))}
                <Bouton onClick={reinit}>
                  <IconRefresh size={18} aria-hidden="true" />
                  Réinitialiser
                </Bouton>
              </div>
              {poly === null && <Message type="erreur">Un coefficient est illisible : écris-le sous la forme a + bi (par exemple 2, -6, 1/2 ou 2 - 3i).</Message>}
            </Panneau>

            {poly && z0 && res && (
              <Panneau titre="Étape 1 · P(z₀) est-il nul ?">
                {(() => {
                  const b = res.ok ? res.bilan : res.bilan;
                  return (
                    <>
                      <Tex expr={texSubstitutionPolynome(poly, z0)} bloc />
                      {b && <BilanPolynome p={poly} z={z0} nomZ="z_0" />}
                      {res.ok ? <Verdict ton="ok">Racine vérifiée</Verdict> : res.raison === "pas-racine" ? <Verdict ton="non">Ce nombre n&apos;est pas une racine : modifie ta proposition.</Verdict> : <Message type="erreur">{res.erreur}</Message>}
                    </>
                  );
                })()}
              </Panneau>
            )}

            {res && res.ok && (
              <Panneau titre="Factorisation et résolution" ton="explication">
                <Commandes etape={etape} total={TOTAL} onPrecedent={() => setEtape((e) => Math.max(1, e - 1))} onSuivant={() => setEtape((e) => Math.min(TOTAL, e + 1))} onTout={() => setEtape(TOTAL)} onRecommencer={() => setEtape(1)} />
                <ol className="flex flex-col gap-2" aria-label="Étapes de la résolution du troisième degré">
                  {etape >= 2 && (
                    <EtapeFormule
                      numero={2}
                      titre="Factoriser par (z − z₀)"
                      texte="Comme P(z₀) = 0, P(z) est divisible par (z − z₀) : il existe un polynôme Q du second degré tel que P(z) = (z − z₀) Q(z)."
                      expr={`P(z) = \\left(z - ${parC(res.z0)}\\right)\\left(${texPolynome(res.quotient)}\\right)`}
                    />
                  )}
                  {etape >= 3 && (
                    <li className="flex min-w-0 flex-col gap-2 rounded-lg border border-fh-sable bg-white px-3 py-2">
                      <p className="flex items-center gap-2 text-sm font-semibold text-fh-bleu">
                        <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fh-bleu-vif text-xs font-bold text-white">3</span>
                        Trouver le quotient Q
                      </p>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Méthode de calcul du quotient">
                        <Pastille actif={methode === "identification"} onClick={() => setMethode("identification")}>
                          Identification des coefficients
                        </Pastille>
                        <Pastille actif={methode === "division"} onClick={() => setMethode("division")}>
                          Division euclidienne
                        </Pastille>
                      </div>
                      {methode === "identification" ? <Identification p={res.p} z0={res.z0} quotient={res.quotient} /> : <Division p={res.p} z0={res.z0} lignes={res.division.lignes} quotient={res.quotient} />}
                      {res.methodesConcordent ? (
                        <Message type="ok">Les deux méthodes (identification, division euclidienne) donnent le même quotient : Q(z) = {texteQuotient(res.quotient)}.</Message>
                      ) : (
                        <Message type="erreur">Les deux méthodes ne concordent pas : signale ce cas à l&apos;enseignant.</Message>
                      )}
                    </li>
                  )}
                  {etape >= 4 && (
                    <EtapeFormule
                      numero={4}
                      titre="Résoudre Q(z) = 0 (second degré)"
                      texte={res.secondDegre.double ? "Δ = 0 : Q a une racine double." : res.secondDegre.deltaReel ? "Δ est réel ; on cherche δ tel que δ² = Δ." : "Δ n'est pas réel : on cherche directement δ tel que δ² = Δ."}
                      expr={`${texDeltaComplexe(res.secondDegre.a, res.secondDegre.b, res.secondDegre.c, res.secondDegre.delta)} ;\\quad ${res.secondDegre.double ? "\\delta = 0" : `\\delta = ${texComplexe(res.secondDegre.racineDelta)}`}`}
                    />
                  )}
                  {etape >= 5 && (
                    <EtapeFormule
                      numero={5}
                      titre="Les trois racines, avec leurs multiplicités"
                      texte={res.racines.some(estApprochee) ? "Certaines valeurs sont approchées (arrondies à 3 décimales)." : undefined}
                      expr={`S = \\left\\{ ${res.racines.map((z) => texComplexe(z)).join(" \\; ; \\; ")} \\right\\}`}
                    />
                  )}
                </ol>
              </Panneau>
            )}
          </>
        }
        droite={
          <>
            <Panneau titre="Plan complexe">
              <PlanEquations
                titre="Les racines de P dans le plan complexe"
                etiquette="Plan complexe : racines de l'équation du troisième degré"
                racines={[...racines, ...candidat]}
                legende={
                  res && res.ok ? (
                    <p className="text-xs leading-relaxed text-fh-ardoise/80">
                      La racine connue est en violet. {res.multiplicites.some((m) => m > 1) ? "Une racine multiple apparaît comme un seul point, avec des anneaux et un badge ×m." : "Les trois racines sont distinctes."}
                    </p>
                  ) : undefined
                }
              />
            </Panneau>
            {res && res.ok && (
              <Panneau titre="Racines et multiplicités" ton="resultat">
                <ul className="flex flex-col gap-1.5" aria-label="Racines avec multiplicité">
                  {racines.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm">
                      <Tex expr={`${r.nom.replace("₁", "_1").replace("₂", "_2").replace("₃", "_3")} = ${texRacine(r.z)}`} />
                      <span className="rounded-full bg-[#102A66] px-2.5 py-0.5 text-xs font-bold text-white">multiplicité {r.multiplicite}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-fh-ardoise/80">Somme des multiplicités : {res.multiplicites.reduce((s, m) => s + m, 0)} (un polynôme de degré 3 a trois racines comptées avec multiplicité).</p>
              </Panneau>
            )}
          </>
        }
      />
    </div>
  );
}

function texteNombre(z: Cx): string {
  const re = Number(z.re.toFixed(6));
  const im = Number(z.im.toFixed(6));
  if (im === 0) return String(re);
  if (re === 0) return `${im === 1 ? "" : im === -1 ? "-" : im}i`;
  return `${re}${im < 0 ? "-" : "+"}${Math.abs(im) === 1 ? "" : Math.abs(im)}i`;
}

function texteQuotient(q: Poly): string {
  return texPolynome(q).replace(/\\,/g, "").replace(/\\left|\\right/g, "").replace(/\^\{2\}/g, "²").replace(/\{,\}/g, ",").replace(/ - /g, " − ");
}

/** Identification : (z − z₀)(αz² + βz + γ) = az³ + bz² + cz + d. */
function Identification({ p, z0, quotient }: { p: Poly; z0: Cx; quotient: Poly }) {
  const [al, be, ga] = quotient;
  const z = parC(z0);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Tex expr={`\\left(z - ${z}\\right)\\left(\\alpha z^2 + \\beta z + \\gamma\\right) = ${texPolynome(p)}`} bloc />
      <Tex
        bloc
        expr={`\\left\\{\\begin{aligned} \\alpha &= a = ${texComplexe(p[0])} \\\\ \\beta - z_0\\alpha &= b \\;\\Rightarrow\\; \\beta = ${parC(p[1])} + ${z}\\times ${parC(al)} = ${texComplexe(be)} \\\\ \\gamma - z_0\\beta &= c \\;\\Rightarrow\\; \\gamma = ${parC(p[2])} + ${z}\\times ${parC(be)} = ${texComplexe(ga)} \\\\ -z_0\\gamma &= d \\;\\Rightarrow\\; -${z}\\times ${parC(ga)} = ${texComplexe(p[3])} \\text{ (contrôle)} \\end{aligned}\\right.`}
      />
    </div>
  );
}

/** Division euclidienne posée de P par (z − z₀). */
function Division({ p, z0, lignes, quotient }: { p: Poly; z0: Cx; lignes: Array<{ coef: Cx; degre: number; reste: Poly }>; quotient: Poly }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Tex expr={`${texPolynome(p)} \\;\\div\\; \\left(z - ${parC(z0)}\\right)`} bloc />
      <ol className="flex flex-col gap-1 text-sm" aria-label="Lignes de la division">
        {lignes.map((l, i) => (
          <li key={i} className="rounded-md bg-slate-50 px-2 py-1">
            <Tex expr={`\\text{terme du quotient : } ${texPolynome([l.coef, ...Array(l.degre).fill(cx(0))])} \\quad\\text{reste : } ${texPolynome(l.reste)}`} />
          </li>
        ))}
      </ol>
      <Tex expr={`Q(z) = ${texPolynome(quotient)} \\quad (\\text{reste } 0)`} bloc />
    </div>
  );
}
