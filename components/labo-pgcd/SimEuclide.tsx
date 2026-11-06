"use client";

import { useMemo, useState } from "react";

import { Z0, euclide, lireEntier, type ResultatEuclide } from "@/lib/arithmetique";
import { ChampEntier, Commandes, Message, Tex, TroisQuestions, Zone, borner, par } from "./ui";

const EXEMPLES: Array<[string, string]> = [
  ["252", "180"],
  ["4185", "693"],
  ["-15", "0"],
  ["84", "36"],
  ["1071", "462"],
  ["35", "18"],
  ["0", "9"],
  ["48", "48"],
];

const VERT = "\\textcolor{#0F7A3D}";

export default function SimEuclide() {
  const [saisieA, setSaisieA] = useState("252");
  const [saisieB, setSaisieB] = useState("180");
  const [etape, setEtape] = useState(0);
  const [selection, setSelection] = useState<number | null>(null);
  const [indexExemple, setIndexExemple] = useState(0);

  const lecA = lireEntier(saisieA);
  const lecB = lireEntier(saisieB);
  const aNul = lecA.ok && lecB.ok && lecA.valeur === Z0 && lecB.valeur === Z0;

  const calcul: ResultatEuclide | null = useMemo(() => {
    if (!lecA.ok || !lecB.ok || aNul) return null;
    return euclide(lecA.valeur, lecB.valeur);
  }, [lecA, lecB, aNul]);

  const total = calcul?.etapes.length ?? 0;
  const e = borner(etape, total);

  function changer(setter: (v: string) => void) {
    return (v: string) => {
      setter(v);
      setEtape(0);
      setSelection(null);
    };
  }

  function exemple() {
    const i = (indexExemple + 1) % EXEMPLES.length;
    setIndexExemple(i);
    setSaisieA(EXEMPLES[i][0]);
    setSaisieB(EXEMPLES[i][1]);
    setEtape(0);
    setSelection(null);
  }

  const a = lecA.ok ? lecA.valeur : Z0;
  const b = lecB.ok ? lecB.valeur : Z0;
  const termine = calcul !== null && e === total;
  const visibles = calcul ? calcul.etapes.slice(0, e) : [];
  const indexDetail = selection !== null && selection < e ? selection : e - 1;
  const detail = calcul && indexDetail >= 0 ? calcul.etapes[indexDetail] : null;

  // Chaîne PGCD(a,b) = PGCD(b,r1) = … construite au fil des étapes.
  let chaine = "";
  if (calcul) {
    chaine = `\\mathrm{PGCD}(${calcul.a}, ${calcul.b})`;
    for (const d of visibles) chaine += ` = \\mathrm{PGCD}(${d.diviseur}, ${d.reste})`;
    if (termine) chaine += ` = ${VERT}{\\mathbf{${calcul.pgcd}}}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <div className="flex flex-wrap gap-3">
          <ChampEntier etiquette="Entier a" valeur={saisieA} onChange={changer(setSaisieA)} lecture={lecA} />
          <ChampEntier etiquette="Entier b" valeur={saisieB} onChange={changer(setSaisieB)} lecture={lecB} />
        </div>
        <p className="text-xs text-fh-ardoise/70">Entiers relatifs acceptés (15 chiffres au plus). Le couple (0, 0) est exclu : son PGCD n&apos;est pas défini.</p>
        {aNul && <Message type="erreur">PGCD(0, 0) n&apos;est pas défini : choisis au moins un entier non nul.</Message>}
        {calcul && (a < Z0 || b < Z0) && (
          <Message>
            Le PGCD ne dépend pas du signe : on travaille avec les valeurs absolues <Tex expr={`|a| = ${calcul.a}`} /> et{" "}
            <Tex expr={`|b| = ${calcul.b}`} />.
          </Message>
        )}
        {calcul && <Commandes etape={e} total={total} onPrecedent={() => setEtape(e - 1)} onSuivant={() => setEtape(e + 1)} onTout={() => setEtape(total)} onRecommencer={() => { setEtape(0); setSelection(null); }} onExemple={exemple} />}
        {!calcul && <Commandes etape={0} total={0} onPrecedent={() => {}} onSuivant={() => {}} onTout={() => {}} onRecommencer={() => {}} onExemple={exemple} />}
      </Zone>

      {calcul && (
        <>
          <Zone titre="Simulation">
            {total === 0 ? (
              <p className="text-sm text-fh-ardoise">
                Ici <Tex expr="b = 0" /> : il n&apos;y a aucune division à faire.
              </p>
            ) : e === 0 ? (
              <p className="text-sm text-fh-ardoise">Aucune division pour l&apos;instant. Clique sur « Étape suivante » pour commencer.</p>
            ) : (
              <ol className="flex flex-col gap-2" aria-label="Divisions euclidiennes successives">
                {visibles.map((d, i) => {
                  const derniere = termine && i === total - 1;
                  const actif = i === indexDetail;
                  const expr = `${d.dividende} = ${d.diviseur} \\times ${d.quotient} + ${d.reste}`;
                  const exprFinale = derniere
                    ? `${d.dividende} = ${VERT}{\\mathbf{${d.diviseur}}} \\times ${d.quotient} + ${d.reste}`
                    : expr;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => setSelection(i)}
                        aria-pressed={actif}
                        aria-label={`Division ${i + 1} : ${expr.replace(/\\times/g, "fois")}. Afficher l'explication.`}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-1.5 text-left transition-colors ${
                          actif ? "border-fh-bleu-vif bg-fh-bleu-vif/10" : "border-fh-sable bg-white hover:bg-fh-accent"
                        }`}
                      >
                        <span className="shrink-0 rounded-full bg-fh-bleu px-2 py-0.5 text-xs font-bold text-white">{i + 1}</span>
                        <span className="min-w-0 overflow-x-auto text-base">
                          <Tex expr={exprFinale} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            <div className="rounded-lg bg-white/70 px-3 py-2">
              <p className="mb-1 text-xs font-semibold text-fh-ardoise/70">Propriété utilisée : PGCD(a, b) = PGCD(b, r) quand a = bq + r et b &gt; 0</p>
              <Tex bloc expr={chaine} />
            </div>
          </Zone>

          <Zone titre="Explications" ton="explication">
            {total === 0 ? (
              <TroisQuestions
                quoi={<>On constate que <Tex expr="b = 0" />.</>}
                pourquoi={<>Tout entier divise 0, donc les diviseurs communs de <Tex expr={`${calcul.a}`} /> et de 0 sont exactement les diviseurs de <Tex expr={`${calcul.a}`} />.</>}
                obtenu={<><Tex expr={`\\mathrm{PGCD}(${a}, 0) = |${a}| = ${calcul.pgcd}`} />.</>}
              />
            ) : detail ? (
              <>
                <p className="text-xs text-fh-ardoise/70">Division {indexDetail + 1} : clique sur une autre ligne pour changer l&apos;explication.</p>
                <TroisQuestions
                  quoi={
                    <>
                      On divise <Tex expr={`${detail.dividende}`} /> par <Tex expr={`${detail.diviseur}`} /> : on écrit{" "}
                      <Tex expr={`${detail.dividende} = ${detail.diviseur} \\times ${detail.quotient} + ${detail.reste}`} />.
                      {detail.quotient === Z0 && <> Comme {String(detail.dividende)} est plus petit que {String(detail.diviseur)}, le quotient est 0 : cette étape échange simplement les deux nombres.</>}
                    </>
                  }
                  pourquoi={
                    <>
                      Un diviseur commun de <Tex expr={`${detail.dividende}`} /> et de <Tex expr={`${detail.diviseur}`} /> divise aussi le reste{" "}
                      <Tex expr={`${detail.reste} = ${detail.dividende} - ${detail.diviseur} \\times ${detail.quotient}`} />, et réciproquement. Les deux couples ont les
                      mêmes diviseurs communs, donc{" "}
                      <Tex expr={`\\mathrm{PGCD}(${detail.dividende}, ${detail.diviseur}) = \\mathrm{PGCD}(${detail.diviseur}, ${detail.reste})`} /> : le PGCD ne change pas.
                    </>
                  }
                  obtenu={
                    detail.reste === Z0 ? (
                      <>
                        Le reste est nul : on s&apos;arrête. Le dernier reste non nul est <strong>{String(detail.diviseur)}</strong>, c&apos;est le PGCD.
                      </>
                    ) : (
                      <>
                        Le reste <Tex expr={`${detail.reste}`} /> est strictement plus petit que <Tex expr={`${detail.diviseur}`} /> : on recommence avec le couple{" "}
                        <Tex expr={`(${detail.diviseur}, ${detail.reste})`} />.
                      </>
                    )
                  }
                />
              </>
            ) : (
              <p className="text-sm text-fh-ardoise">Chaque division expliquera ce qu&apos;on fait, pourquoi, et ce qu&apos;on obtient.</p>
            )}
          </Zone>

          <Zone titre="Résultat" ton="resultat">
            {termine ? (
              <>
                <Tex bloc className="text-lg" expr={`\\mathrm{PGCD}(${a}, ${b}) = ${VERT}{\\mathbf{${calcul.pgcd}}}`} />
                <p className="text-sm text-fh-ardoise">
                  Vérification : <Tex expr={`${par(a)} = ${calcul.pgcd} \\times ${par(a / calcul.pgcd)}`} /> et{" "}
                  <Tex expr={`${par(b)} = ${calcul.pgcd} \\times ${par(b / calcul.pgcd)}`} /> : {String(calcul.pgcd)} divise bien les deux nombres.
                </p>
              </>
            ) : (
              <p className="text-sm text-fh-ardoise">Le résultat apparaîtra quand le reste deviendra nul.</p>
            )}
          </Zone>
        </>
      )}
    </div>
  );
}
