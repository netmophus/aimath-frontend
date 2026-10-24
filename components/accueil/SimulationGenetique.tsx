"use client";

import { useState } from "react";

import { Choix } from "@/components/labo/commun";
import { BoutonReinitialiser, CadreSimulation, Formule, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

type Genotype = "AA" | "Aa" | "aa";
const GENOTYPES: Genotype[] = ["AA", "Aa", "aa"];
const OPTIONS = GENOTYPES.map((g) => ({ cle: g, libelle: g }));

/** Phénotype : « A » (violet) est dominant sur « a » (blanc). */
const violet = (g: string) => g.includes("A");
/** Génotype d'un descendant : l'allèle dominant est écrit en premier. */
const croise = (a: string, b: string) => [a, b].sort().join("") as Genotype;
const gametes = (g: Genotype): [string, string] => [g[0], g[1]];

/** Tableau de Punnett : croisement de deux parents pour un caractère (couleur des fleurs du pois : violet dominant, blanc récessif). */
export default function SimulationGenetique() {
  const [p1, setP1] = useState<Genotype>("Aa");
  const [p2, setP2] = useState<Genotype>("Aa");
  const [choisie, setChoisie] = useState<number | null>(null);

  const g1 = gametes(p1);
  const g2 = gametes(p2);
  const cases = [croise(g1[0], g2[0]), croise(g1[1], g2[0]), croise(g1[0], g2[1]), croise(g1[1], g2[1])]; // ordre : ligne par ligne
  const nb = (g: Genotype) => cases.filter((c) => c === g).length;
  const nbViolet = cases.filter(violet).length;
  const fraction = (n: number) => (n === 4 ? "1" : n === 2 ? "\\dfrac{1}{2}" : `\\dfrac{${n}}{4}`);
  const termes = GENOTYPES.filter((g) => nb(g) > 0).map((g) => `${fraction(nb(g))}\\,\\mathrm{${g}}`).join(" + ");
  const pct = (n: number) => `${n * 25} %`;

  const commentaire =
    choisie === null
      ? `Chaque parent donne un de ses deux allèles à chaque descendant. Parmi les 4 cases, ${nbViolet} donnent des fleurs violettes${4 - nbViolet > 0 ? ` et ${4 - nbViolet} des fleurs blanches` : ""}. Clique sur une case pour la détailler.`
      : `Cette case : génotype ${cases[choisie]}, donc des fleurs ${violet(cases[choisie]) ? "violettes (l'allèle A est dominant)" : "blanches (deux allèles a : récessif exprimé)"}.`;

  function reinit() {
    setP1("Aa");
    setP2("Aa");
    setChoisie(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <EncartConcept
        concept="Un caractère héréditaire est contrôlé par deux allèles, un reçu de chaque parent. Un allèle dominant (A) s'exprime dès qu'il est présent ; un allèle récessif (a) ne s'exprime que s'il est en double (aa). Le tableau de Punnett croise les gamètes des deux parents pour prévoir les génotypes possibles des descendants et leurs proportions."
        observer="croise deux parents Aa : un quart des descendants est aa, donc blanc, alors que les deux parents sont violets. Trois quarts sont violets."
      />
      <CadreSimulation
        titre="Remplis un tableau de Punnett"
        description="Choisis le génotype de chaque parent (couleur des fleurs du pois : violet dominant, blanc récessif) et lis les descendants possibles."
        formule={<Formule bloc tex={`\\mathrm{${p1}} \\times \\mathrm{${p2}} \\;\\rightarrow\\; ${termes}`} />}
        graphique={
          <div className="mx-auto w-full max-w-[420px]">
            <div className="grid grid-cols-[3rem_1fr_1fr] gap-1.5 text-center text-sm font-semibold sm:grid-cols-[4rem_1fr_1fr]">
              <div className="flex items-center justify-center text-xs text-fh-ardoise">gamètes</div>
              {g2.map((a, j) => (
                <div key={`c${j}`} className="rounded-lg bg-fh-bleu py-2 text-white">{a}</div>
              ))}
              {[0, 1].map((i) => (
                <div key={`l${i}`} className="contents">
                  <div className="flex items-center justify-center rounded-lg bg-fh-bleu text-white">{g1[i]}</div>
                  {[0, 1].map((j) => {
                    const idx = i + 2 * j;
                    const g = cases[idx];
                    const dom = violet(g);
                    return (
                      <button
                        key={j}
                        type="button"
                        onClick={() => setChoisie(choisie === idx ? null : idx)}
                        aria-pressed={choisie === idx}
                        aria-label={`Descendant ${g}, fleurs ${dom ? "violettes" : "blanches"}`}
                        className={`flex min-h-20 flex-col items-center justify-center rounded-lg border-2 text-lg font-bold transition-colors motion-reduce:transition-none ${
                          dom ? "border-violet-700 bg-violet-600 text-white" : "border-fh-sable bg-white text-fh-bleu"
                        } ${choisie === idx ? "ring-4 ring-fh-orange" : ""}`}
                      >
                        {g}
                        <span className="text-xs font-semibold">{dom ? "violet" : "blanc"}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        }
        commandes={
          <>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-fh-bleu">Parent 1</span>
              <Choix nom="Génotype du parent 1" options={OPTIONS} valeur={p1} onChoisir={(g) => { setP1(g); setChoisie(null); }} />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-fh-bleu">Parent 2</span>
              <Choix nom="Génotype du parent 2" options={OPTIONS} valeur={p2} onChoisir={(g) => { setP2(g); setChoisie(null); }} />
            </div>
            <BoutonReinitialiser onClick={reinit} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette="AA">{pct(nb("AA"))}</Valeur>
            <Valeur etiquette="Aa">{pct(nb("Aa"))}</Valeur>
            <Valeur etiquette="aa">{pct(nb("aa"))}</Valeur>
            <Valeur etiquette="Fleurs" large>
              {pct(nbViolet)} violettes, {pct(4 - nbViolet)} blanches
            </Valeur>
          </>
        }
        commentaire={commentaire}
      />
    </div>
  );
}
