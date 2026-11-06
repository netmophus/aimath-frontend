"use client";

import { useState } from "react";
import { IconArrowRight, IconCheck, IconX } from "@tabler/icons-react";

import { Z0, gauss, lireEntier } from "@/lib/arithmetique";
import { Bouton, ChampEntier, Tex, TroisQuestions, Zone, par } from "./ui";

const EXEMPLES: Array<{ nom: string; v: [string, string, string] }> = [
  { nom: "Exemple du cours (4, 5, 8)", v: ["4", "5", "8"] },
  { nom: "Contre-exemple (6, 4, 3)", v: ["6", "4", "3"] },
  { nom: "Exemple (7, 3, 14)", v: ["7", "3", "14"] },
  { nom: "Hypothèse 1 fausse (5, 3, 2)", v: ["5", "3", "2"] },
  { nom: "Avec un zéro (3, 0, 5)", v: ["3", "0", "5"] },
];

function Carte({ ok, titre, children }: { ok: boolean; titre: string; children: React.ReactNode }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col gap-1 rounded-xl border-2 px-3 py-2 ${ok ? "border-emerald-500 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
      <div className="flex items-center gap-2 text-sm font-bold text-fh-bleu">
        <span aria-hidden="true" className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${ok ? "bg-emerald-600" : "bg-red-500"}`}>
          {ok ? <IconCheck size={16} /> : <IconX size={16} />}
        </span>
        {titre}
        <span className="sr-only">{ok ? " : vérifiée" : " : non vérifiée"}</span>
      </div>
      <div className="min-w-0 overflow-x-auto text-sm text-fh-ardoise">{children}</div>
    </div>
  );
}

export default function SimGauss() {
  const [sa, setSa] = useState("4");
  const [sb, setSb] = useState("5");
  const [sc, setSc] = useState("8");
  const [indexExemple, setIndexExemple] = useState(0);

  const la = lireEntier(sa);
  const lb = lireEntier(sb);
  const lc = lireEntier(sc);
  const r = la.ok && lb.ok && lc.ok ? gauss(la.valeur, lb.valeur, lc.valeur) : null;
  const a = la.ok ? la.valeur : Z0;
  const b = lb.ok ? lb.valeur : Z0;
  const c = lc.ok ? lc.valeur : Z0;

  function charger(i: number) {
    setIndexExemple(i);
    setSa(EXEMPLES[i].v[0]);
    setSb(EXEMPLES[i].v[1]);
    setSc(EXEMPLES[i].v[2]);
  }

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <div className="flex flex-wrap gap-3">
          <ChampEntier etiquette="Entier a" valeur={sa} onChange={setSa} lecture={la} />
          <ChampEntier etiquette="Entier b" valeur={sb} onChange={setSb} lecture={lb} />
          <ChampEntier etiquette="Entier c" valeur={sc} onChange={setSc} lecture={lc} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
          <Bouton onClick={() => charger(0)}>Exemple du cours</Bouton>
          <Bouton onClick={() => charger(1)}>Contre-exemple (6, 4, 3)</Bouton>
          <Bouton onClick={() => charger((indexExemple + 1) % EXEMPLES.length)}>Nouvel exemple</Bouton>
        </div>
        <p className="text-xs text-fh-ardoise/70">Entiers relatifs (15 chiffres au plus). Un diviseur nul ne divise que 0.</p>
      </Zone>

      {r && (
        <>
          <Zone titre="Simulation">
            <p className="text-sm text-fh-ardoise">
              <strong>Théorème de Gauss.</strong> Si a divise bc et si PGCD(a, b) = 1, alors a divise c.
            </p>
            <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center" aria-label="Raisonnement : hypothèse 1 et hypothèse 2 donnent la conclusion">
              <Carte ok={r.divBC} titre="Hypothèse 1 : a divise bc">
                <Tex expr={`${par(a)} \\mid ${par(b)} \\times ${par(c)} = ${r.produit}`} />
                <span className="block">{r.divBC ? "Oui." : "Non."}</span>
              </Carte>
              <span aria-hidden="true" className="flex shrink-0 items-center justify-center text-lg font-bold text-fh-bleu md:px-1">
                +
              </span>
              <Carte ok={r.copremiers} titre="Hypothèse 2 : PGCD(a, b) = 1">
                {r.pgcdAB === null ? (
                  <span>PGCD(0, 0) n&apos;est pas défini : l&apos;hypothèse n&apos;est pas vérifiée.</span>
                ) : (
                  <Tex expr={`\\mathrm{PGCD}(${a}, ${b}) = ${r.pgcdAB}`} />
                )}
              </Carte>
              <IconArrowRight aria-hidden="true" size={26} className="mx-auto shrink-0 rotate-90 text-fh-bleu md:rotate-0" />
              <Carte ok={r.applicable} titre="Conclusion : a divise c">
                {r.applicable ? <Tex expr={`${par(a)} \\mid ${par(c)}`} /> : <span>Le théorème ne permet pas de conclure.</span>}
              </Carte>
            </div>
          </Zone>

          <Zone titre="Explications" ton="explication">
            <TroisQuestions
              quoi={<>On vérifie, l&apos;une après l&apos;autre, les deux hypothèses du théorème de Gauss.</>}
              pourquoi={<>Le théorème ne s&apos;applique que si <strong>les deux</strong> hypothèses sont vraies. Si l&apos;une manque, il ne dit rien : la conclusion peut être vraie ou fausse.</>}
              obtenu={
                r.applicable ? (
                  <>Les deux hypothèses sont vraies : on peut conclure.</>
                ) : (
                  <>
                    {!r.divBC && <>L&apos;hypothèse 1 n&apos;est pas vérifiée (a ne divise pas bc). </>}
                    {!r.copremiers && <>L&apos;hypothèse 2 n&apos;est pas vérifiée{r.pgcdAB === null ? " (PGCD(0, 0) n'est pas défini)" : <> (<Tex expr={`\\mathrm{PGCD}(${a}, ${b}) = ${r.pgcdAB}`} />)</>}. </>}
                  </>
                )
              }
            />
            {!r.copremiers && r.divBC && r.pgcdAB !== null && !r.aDiviseC && (
              <p className="rounded-lg bg-white px-3 py-2 text-sm text-fh-ardoise">
                <strong>Pourquoi la condition PGCD(a, b) = 1 est importante :</strong> ici a divise bc, mais a et b ont le diviseur commun {String(r.pgcdAB)}, et a ne divise pas c. Sans la
                coprimalité, le raisonnement de Gauss ne marche plus.
              </p>
            )}
          </Zone>

          <Zone titre="Résultat" ton="resultat">
            {r.applicable ? (
              <>
                <p className="text-sm font-semibold text-emerald-800">Les deux hypothèses sont satisfaites : le théorème de Gauss permet de conclure.</p>
                <Tex bloc className="text-lg" expr={`${par(a)} \\text{ divise } ${par(c)}`} />
                <p className="text-sm text-fh-ardoise">
                  Vérification : <Tex expr={`${par(c)} = ${par(a)} \\times ${a === Z0 ? "0" : par(c / a)}`} />.
                </p>
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-fh-bleu">Le théorème de Gauss ne permet pas de conclure avec ces hypothèses.</p>
                <p className="text-sm text-fh-ardoise">
                  Test direct, hors théorème : a {r.aDiviseC ? "divise" : "ne divise pas"} c ici. Ce n&apos;est pas une conséquence du théorème : quand une hypothèse manque, la
                  conclusion peut être vraie ou fausse.
                </p>
              </>
            )}
          </Zone>
        </>
      )}
    </div>
  );
}
