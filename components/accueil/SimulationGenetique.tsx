"use client";

import { useState, type ReactNode } from "react";

import { Choix } from "@/components/labo/commun";
import { BoutonReinitialiser, CadreSimulation, Formule, TableauValeurs, Tx, Valeur } from "./commun";
import { EncartConcept } from "./GrapheMaths";

type Genotype = "AA" | "Aa" | "aa";
const GENOTYPES: Genotype[] = ["AA", "Aa", "aa"];
const OPTIONS = GENOTYPES.map((g) => ({ cle: g, libelle: g }));
const VIOLET_ONGLET = "#6a4c93";

/** Phénotype : « A » (violet) est dominant sur « a » (blanc). */
const violet = (g: string) => g.includes("A");
/** Génotype d'un descendant : l'allèle dominant est écrit en premier. */
const croise = (a: string, b: string) => [a, b].sort().join("") as Genotype;
const gametes = (g: Genotype): [string, string] => [g[0], g[1]];

/**
 * Explication du croisement choisi (texte avec formules entre `$ … $`, rendues par `Tx`). L'ordre des parents ne change
 * pas le résultat : on regroupe les couples (AA × Aa et Aa × AA donnent la même phrase).
 */
function expliquer(p1: Genotype, p2: Genotype): string {
  const couple = [p1, p2].sort().join(" x ");
  switch (couple) {
    case "AA x AA":
      return "Les deux parents sont $\\mathrm{AA}$ : ils n'ont que l'allèle $A$ à transmettre. Tous les descendants sont donc $\\mathrm{AA}$, et tous ont des fleurs violettes.";
    case "AA x Aa":
      return "Le parent $\\mathrm{AA}$ transmet toujours $A$ ; le parent $\\mathrm{Aa}$ transmet $A$ ou $a$ au hasard. On obtient $\\dfrac{1}{2}\\,\\mathrm{AA}$ et $\\dfrac{1}{2}\\,\\mathrm{Aa}$. Tous les descendants ont au moins un $A$ : ils sont tous violets (l'allèle dominant s'exprime). La moitié d'entre eux porte pourtant l'allèle $a$ sans le montrer.";
    case "AA x aa":
      return "Tous les descendants sont $\\mathrm{Aa}$ : ils portent un $A$ et un $a$, donc ils sont tous violets ($A$ domine). Le caractère blanc disparaît en apparence à cette génération, mais l'allèle $a$ est transmis.";
    case "Aa x Aa":
      return "Chaque parent est porteur ($\\mathrm{Aa}$) : il transmet $A$ ou $a$ au hasard. On obtient $\\dfrac{1}{4}\\,\\mathrm{AA}$, $\\dfrac{1}{2}\\,\\mathrm{Aa}$ et $\\dfrac{1}{4}\\,\\mathrm{aa}$, soit $\\dfrac{3}{4}$ de fleurs violettes et $\\dfrac{1}{4}$ de blanches. Deux parents violets peuvent donc avoir un enfant blanc : c'est parce qu'ils portaient tous deux l'allèle $a$ caché.";
    case "Aa x aa":
      return "Le parent $\\mathrm{aa}$ transmet toujours $a$ ; le parent $\\mathrm{Aa}$ transmet $A$ ou $a$ au hasard. On obtient $\\dfrac{1}{2}\\,\\mathrm{Aa}$ et $\\dfrac{1}{2}\\,\\mathrm{aa}$ : la moitié des descendants est violette ($\\mathrm{Aa}$) et l'autre moitié blanche ($\\mathrm{aa}$). Le parent blanc ne peut donner que $a$ : c'est l'autre parent qui décide si la fleur est violette.";
    default:
      return "Les deux parents sont blancs ($\\mathrm{aa}$) et n'ont que l'allèle $a$ à transmettre : tous les descendants sont $\\mathrm{aa}$, donc blancs.";
  }
}

/** Encadré pédagogique (bordure gauche violette, fond léger) : explications fixes ou dynamiques de l'onglet. */
function Encart({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 bg-white/70 p-4 sm:p-5" style={{ borderColor: VIOLET_ONGLET }}>
      <p className="text-sm font-bold" style={{ color: VIOLET_ONGLET }}>{titre}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-fh-ardoise sm:text-base">{children}</div>
    </div>
  );
}

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
            <p className="mt-2 text-center text-xs text-fh-ardoise">
              <Tx>{"Les gamètes du parent 1 sont à gauche (lignes), ceux du parent 2 en haut (colonnes)."}</Tx>
            </p>
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
        bas={
          <div aria-live="polite">
            <p className="font-bold" style={{ color: VIOLET_ONGLET }}>Ce que donne ce croisement</p>
            <p className="mt-1 leading-8 text-fh-ardoise">
              <Tx>{expliquer(p1, p2)}</Tx>
            </p>
          </div>
        }
      />

      <Encart titre="Génotype et phénotype">
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li className="pl-1 leading-8">
            <Tx>{"Le GÉNOTYPE est la paire d'allèles portée par l'individu : $\\mathrm{AA}$, $\\mathrm{Aa}$ ou $\\mathrm{aa}$."}</Tx>
          </li>
          <li className="pl-1 leading-8">
            <Tx>{"Le PHÉNOTYPE est le caractère visible : ici, la couleur de la fleur (violette ou blanche)."}</Tx>
          </li>
        </ul>
        <div className="my-3">
          <TableauValeurs couleur={VIOLET_ONGLET}>
            <thead>
              <tr>
                <th scope="col">Génotype</th>
                <th scope="col">Phénotype</th>
                <th scope="col">Pourquoi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Formule tex="\mathrm{AA}" /></td>
                <td>violet</td>
                <td><Tx>{"$A$ est dominant : il s'exprime."}</Tx></td>
              </tr>
              <tr>
                <td><Formule tex="\mathrm{Aa}" /></td>
                <td>violet</td>
                <td><Tx>{"$A$ s'exprime dès qu'il est présent ; $a$ reste caché."}</Tx></td>
              </tr>
              <tr>
                <td><Formule tex="\mathrm{aa}" /></td>
                <td>blanc</td>
                <td><Tx>{"$a$ est récessif : il ne s'exprime qu'en double."}</Tx></td>
              </tr>
            </tbody>
          </TableauValeurs>
        </div>
        <p className="leading-8">
          <Tx>{"$\\mathrm{AA}$ et $\\mathrm{Aa}$ donnent donc le MÊME phénotype (violet), car l'allèle dominant $A$ s'exprime dès qu'il est présent. Seul $\\mathrm{aa}$ donne le phénotype récessif (blanc), car l'allèle récessif ne s'exprime que lorsqu'il est en double."}</Tx>
        </p>
      </Encart>

      <Encart titre="D'où viennent les gamètes ?">
        <p className="leading-8">
          <Tx>{"Chaque parent produit des gamètes qui portent UN SEUL de ses deux allèles : les deux allèles se séparent lors de la formation des gamètes."}</Tx>
        </p>
        <p className="mt-2 leading-8">
          <Tx>{"Un parent $\\mathrm{Aa}$ produit donc deux sortes de gamètes : la moitié portent $A$, l'autre moitié portent $a$. Un parent $\\mathrm{AA}$ ne produit que des gamètes $A$, un parent $\\mathrm{aa}$ que des gamètes $a$."}</Tx>
        </p>
        <p className="mt-2 leading-8">
          <Tx>{"C'est pour cela que les allèles $A$ et $a$ figurent en en-tête des lignes et des colonnes du tableau."}</Tx>
        </p>
      </Encart>

      <Encart titre="Comment le tableau se remplit">
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          <li className="pl-1 leading-8">
            <Tx>{"Chaque case est un descendant possible : on y combine un gamète du parent 1 (à gauche, sur la ligne) et un gamète du parent 2 (en haut, sur la colonne)."}</Tx>
          </li>
          <li className="pl-1 leading-8">
            <Tx>{"Les $4$ cases sont équiprobables : chacune représente $\\dfrac{1}{4}$ des descendants."}</Tx>
          </li>
          <li className="pl-1 leading-8">
            <Tx>{"Pour les proportions, on compte les cases de chaque génotype : deux cases identiques valent $\\dfrac{2}{4} = \\dfrac{1}{2}$ des descendants."}</Tx>
          </li>
        </ul>
      </Encart>
    </div>
  );
}
