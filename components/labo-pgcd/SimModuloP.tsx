"use client";

import { useId, useState } from "react";

import {
  PREMIERS,
  Z0,
  afficherLigneIntermediaire,
  equationModP,
  lireEntier,
  modulo,
  systemeModP,
  type CoefficientsSysteme,
} from "@/lib/arithmetique";
import { ChampEntier, Commandes, Message, Onglets, Tex, TroisQuestions, Zone, borner, par, somme } from "./ui";

function ChoixModulo({ p, onChange }: { p: number; onChange: (p: number) => void }) {
  const id = useId();
  return (
    <div className="flex min-w-[7.5rem] flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-fh-ardoise/80">
        Module p (nombre premier)
      </label>
      <select
        id={id}
        value={p}
        onChange={(ev) => onChange(Number(ev.target.value))}
        className="min-h-11 w-full rounded-lg border border-fh-sable bg-white px-3 text-base text-fh-bleu outline-none focus:border-fh-bleu-vif focus:ring-2 focus:ring-fh-bleu-vif/20"
      >
        {PREMIERS.map((q) => (
          <option key={q} value={q}>
            {q}
          </option>
        ))}
      </select>
    </div>
  );
}

const mod = (p: number) => `\\pmod{${p}}`;
const classe = (n: number) => `\\overline{${n}}`;

// ---------------------------------------------------------------------------------------------------------------
// Sous-onglet A : équation ax ≡ c (mod p)
// ---------------------------------------------------------------------------------------------------------------

const EXEMPLES_EQ: Array<[string, string, number]> = [
  ["3", "5", 7],
  ["4", "0", 7],
  ["14", "3", 7],
  ["2", "1", 5],
  ["-7", "5", 11],
  ["6", "4", 2],
];

function Equation() {
  const [sa, setSa] = useState("3");
  const [sc, setSc] = useState("5");
  const [p, setP] = useState(7);
  const [etape, setEtape] = useState(0);
  const [indexExemple, setIndexExemple] = useState(0);

  const la = lireEntier(sa);
  const lc = lireEntier(sc);
  const r = la.ok && lc.ok ? equationModP(la.valeur, lc.valeur, p) : null;
  const a = la.ok ? la.valeur : Z0;
  const c = lc.ok ? lc.valeur : Z0;
  const total = r ? (r.cas === "inversible" ? 5 : 2) : 0;
  const e = borner(etape, total);

  const changer = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setEtape(0);
  };
  function exemple() {
    const i = (indexExemple + 1) % EXEMPLES_EQ.length;
    setIndexExemple(i);
    setSa(EXEMPLES_EQ[i][0]);
    setSc(EXEMPLES_EQ[i][1]);
    setP(EXEMPLES_EQ[i][2]);
    setEtape(0);
  }

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <div className="flex flex-wrap gap-3">
          <ChampEntier etiquette="Coefficient a" valeur={sa} onChange={changer(setSa)} lecture={la} />
          <ChampEntier etiquette="Second membre c" valeur={sc} onChange={changer(setSc)} lecture={lc} />
          <ChoixModulo p={p} onChange={changer(setP)} />
        </div>
        <Tex bloc className="text-lg" expr={`${somme([[a, "x"]])} \\equiv ${c} ${mod(p)}`} />
        <Commandes etape={e} total={total} onPrecedent={() => setEtape(e - 1)} onSuivant={() => setEtape(e + 1)} onTout={() => setEtape(total)} onRecommencer={() => setEtape(0)} onExemple={exemple} />
      </Zone>

      {r && (
        <>
          <Zone titre="Simulation">
            {e === 0 && <p className="text-sm text-fh-ardoise">Clique sur « Étape suivante » pour résoudre l&apos;équation.</p>}
            {e >= 1 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">1. Classes de a et de c modulo {p}</p>
                <Tex expr={`${par(a)} \\equiv ${r.ar} ${mod(p)}, \\qquad ${par(c)} \\equiv ${r.cr} ${mod(p)}`} />
                <Tex expr={`${somme([[r.ar, "x"]])} \\equiv ${r.cr} ${mod(p)}`} />
              </div>
            )}
            {r.cas === "inversible" && e >= 2 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">2. Le coefficient est-il inversible ?</p>
                <Tex expr={`${p} \\text{ est premier et ne divise pas } ${r.ar} \\;\\Rightarrow\\; \\mathrm{PGCD}(${r.ar}, ${p}) = 1`} />
              </div>
            )}
            {r.cas === "inversible" && e >= 3 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-fh-ardoise/70">3. Recherche de l&apos;inverse de {r.ar} modulo {p}</p>
                <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4" aria-label="Produits de a par 1, 2, 3, …">
                  {r.table.map((l) => (
                    <li key={l.t} className={`overflow-x-auto rounded-lg border px-2 py-1 text-sm ${l.reste === 1 ? "border-emerald-500 bg-emerald-50" : "border-fh-sable bg-white"}`}>
                      <Tex expr={`${r.ar} \\times ${l.t} = ${l.produit} \\equiv ${l.reste}`} />
                      {l.reste === 1 && <span className="sr-only"> : c&apos;est l&apos;inverse</span>}
                    </li>
                  ))}
                </ul>
                <Tex expr={`${r.ar} \\times ${r.inverse} = ${r.ar * r.inverse} \\equiv 1 ${mod(p)}`} />
                <p className="text-sm font-semibold text-emerald-800">L&apos;inverse de {r.ar} modulo {p} est {r.inverse}.</p>
              </div>
            )}
            {r.cas === "inversible" && e >= 4 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">4. Multiplication par l&apos;inverse</p>
                <Tex expr={`x \\equiv ${r.inverse} \\times ${r.cr} ${mod(p)}`} />
                <Tex expr={`x \\equiv ${r.produit} \\equiv ${r.x} ${mod(p)}`} />
              </div>
            )}
            {r.cas !== "inversible" && e >= 2 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">2. Cas particulier : a ≡ 0</p>
                <Tex expr={`0 \\times x \\equiv ${r.cr} ${mod(p)}`} />
              </div>
            )}
          </Zone>

          <Zone titre="Explications" ton="explication">
            {e === 0 && <p className="text-sm text-fh-ardoise">Chaque étape expliquera ce qu&apos;on fait, pourquoi, et ce qu&apos;on obtient.</p>}
            {e === 1 && (
              <TroisQuestions
                quoi={<>On remplace a et c par leur reste dans la division par {p}.</>}
                pourquoi={<>Deux entiers congrus modulo {p} se comportent de la même façon dans les calculs : on peut donc travailler avec des nombres de 0 à {p - 1}.</>}
                obtenu={<>L&apos;équation équivalente <Tex expr={`${somme([[r.ar, "x"]])} \\equiv ${r.cr} ${mod(p)}`} />.</>}
              />
            )}
            {r.cas === "inversible" && e === 2 && (
              <TroisQuestions
                quoi={<>On regarde si a possède un inverse modulo {p}.</>}
                pourquoi={<>Comme {p} est premier et ne divise pas {r.ar}, les seuls diviseurs communs de {r.ar} et {p} sont ±1 : PGCD = 1. D&apos;après Bézout, il existe u tel que <Tex expr={`${r.ar} u \\equiv 1`} />, c&apos;est l&apos;inverse.</>}
                obtenu={<>Le coefficient {r.ar} est inversible modulo {p}.</>}
              />
            )}
            {r.cas === "inversible" && e === 3 && (
              <TroisQuestions
                quoi={<>On essaie les multiples {r.ar} × 1, {r.ar} × 2, … et on regarde leur reste modulo {p}.</>}
                pourquoi={<>On cherche un nombre t tel que <Tex expr={`${r.ar} t \\equiv 1 ${mod(p)}`} />. Il y en a exactement un entre 1 et {p - 1}.</>}
                obtenu={<>L&apos;inverse est {r.inverse} (ligne en vert).</>}
              />
            )}
            {r.cas === "inversible" && e === 4 && (
              <TroisQuestions
                quoi={<>On multiplie les deux membres de l&apos;équation par l&apos;inverse {r.inverse}.</>}
                pourquoi={<>Comme <Tex expr={`${r.inverse} \\times ${r.ar} \\equiv 1`} />, le membre de gauche devient simplement x. Les deux membres restent égaux modulo {p}.</>}
                obtenu={<>x ≡ {r.produit} ≡ {r.x} modulo {p}.</>}
              />
            )}
            {r.cas === "inversible" && e === 5 && (
              <TroisQuestions
                quoi={<>On remplace x par {r.x} dans l&apos;équation de départ.</>}
                pourquoi={<>Pour être sûr que la solution trouvée convient vraiment.</>}
                obtenu={<><Tex expr={`${r.ar} \\times ${r.x} = ${r.ar * r.x} \\equiv ${r.cr} ${mod(p)}`} /> : c&apos;est correct.</>}
              />
            )}
            {r.cas !== "inversible" && e === 2 && (
              <TroisQuestions
                quoi={<>On constate que a est un multiple de {p} : a ≡ 0.</>}
                pourquoi={<>Le coefficient 0 n&apos;a pas d&apos;inverse : on ne peut pas diviser. Le membre de gauche vaut 0 pour toute valeur de x.</>}
                obtenu={r.cas === "nulle-toutes" ? <>L&apos;équation devient 0 ≡ 0 : elle est vraie pour toutes les classes.</> : <>L&apos;équation devient 0 ≡ {r.cr}, ce qui est faux : aucune classe ne convient.</>}
              />
            )}
          </Zone>

          <Zone titre="Résultat" ton="resultat">
            {r.cas === "inversible" && e >= 4 ? (
              <>
                <Tex bloc className="text-lg" expr={`x \\equiv ${r.x} ${mod(p)} \\qquad (x = ${classe(r.x)})`} />
                <p className="text-sm text-fh-ardoise">
                  La solution est la classe de {r.x} (la barre sur le nombre désigne sa classe de congruence modulo {p}).
                </p>
                {e >= 5 && <Tex bloc expr={`${r.ar} \\times ${r.x} = ${r.ar * r.x} \\equiv ${r.cr} ${mod(p)}`} />}
              </>
            ) : r.cas === "nulle-toutes" && e >= 2 ? (
              <p className="text-base font-semibold text-emerald-800">Toutes les classes modulo {p} sont solutions ({p} solutions).</p>
            ) : r.cas === "nulle-aucune" && e >= 2 ? (
              <p className="text-base font-semibold text-red-800">Aucune classe n&apos;est solution : l&apos;équation est impossible.</p>
            ) : (
              <p className="text-sm text-fh-ardoise">La solution apparaîtra à la fin.</p>
            )}
          </Zone>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Sous-onglet B : système de deux équations à deux inconnues
// ---------------------------------------------------------------------------------------------------------------

type Champs = [string, string, string, string, string, string];
const EXEMPLES_SYS: Array<{ p: number; v: Champs }> = [
  { p: 7, v: ["2", "3", "1", "1", "1", "4"] },
  { p: 5, v: ["1", "1", "1", "1", "1", "2"] },
  { p: 5, v: ["1", "1", "1", "2", "2", "2"] },
  { p: 11, v: ["3", "4", "5", "2", "7", "1"] },
  { p: 7, v: ["1", "2", "3", "2", "4", "6"] },
  { p: 3, v: ["2", "-1", "1", "1", "1", "0"] },
];

function eq(a: number, b: number, c: number, p: number): string {
  return `${somme([[a, "x"], [b, "y"]])} \\equiv ${c} ${mod(p)}`;
}

function Systeme() {
  const [champs, setChamps] = useState<Champs>(EXEMPLES_SYS[0].v);
  const [p, setP] = useState(7);
  const [etape, setEtape] = useState(0);
  const [indexExemple, setIndexExemple] = useState(0);

  const lec = champs.map((t) => lireEntier(t));
  const valide = lec.every((l) => l.ok);
  const nombres = lec.map((l) => (l.ok ? l.valeur : Z0));
  const brut: CoefficientsSysteme | null = valide
    ? { a1: Number(nombres[0]), b1: Number(nombres[1]), c1: Number(nombres[2]), a2: Number(nombres[3]), b2: Number(nombres[4]), c2: Number(nombres[5]) }
    : null;
  const r = brut ? systemeModP(p, brut) : null;
  const s = r?.substitution ?? null;
  const total = !r ? 0 : !s ? 1 : s.issue === "unique" ? 6 : 5;
  const e = borner(etape, total);

  function modifier(i: number, v: string) {
    setChamps((anc) => anc.map((x, j) => (i === j ? v : x)) as Champs);
    setEtape(0);
  }
  function exemple() {
    const i = (indexExemple + 1) % EXEMPLES_SYS.length;
    setIndexExemple(i);
    setChamps(EXEMPLES_SYS[i].v);
    setP(EXEMPLES_SYS[i].p);
    setEtape(0);
  }

  const noms = ["a₁ (coefficient de x)", "b₁ (coefficient de y)", "c₁ (second membre)", "a₂ (coefficient de x)", "b₂ (coefficient de y)", "c₂ (second membre)"];
  const q = brut ? brut : { a1: 0, b1: 0, c1: 0, a2: 0, b2: 0, c2: 0 };
  const W = s ? s.autre : "y";
  const V = s ? s.isolee : "x";
  const exprIsolee = s ? (s.m === 0 ? `${s.alpha}` : somme([[s.alpha, ""], [-s.m, W]])) : "";

  return (
    <div className="flex flex-col gap-4">
      <Zone titre="Paramètres">
        <div className="flex flex-wrap gap-3">
          <ChoixModulo p={p} onChange={(v) => { setP(v); setEtape(0); }} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <fieldset className="flex flex-col gap-2 rounded-lg border border-fh-sable p-3">
            <legend className="px-1 text-xs font-bold text-fh-bleu">Équation 1</legend>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2].map((i) => (
                <ChampEntier key={i} etiquette={noms[i]} valeur={champs[i]} onChange={(v) => modifier(i, v)} lecture={lec[i]} />
              ))}
            </div>
          </fieldset>
          <fieldset className="flex flex-col gap-2 rounded-lg border border-fh-sable p-3">
            <legend className="px-1 text-xs font-bold text-fh-bleu">Équation 2</legend>
            <div className="flex flex-wrap gap-2">
              {[3, 4, 5].map((i) => (
                <ChampEntier key={i} etiquette={noms[i]} valeur={champs[i]} onChange={(v) => modifier(i, v)} lecture={lec[i]} />
              ))}
            </div>
          </fieldset>
        </div>
        {r && <Tex bloc className="text-base" expr={`\\begin{cases} ${eq(q.a1, q.b1, q.c1, p)} \\\\ ${eq(q.a2, q.b2, q.c2, p)} \\end{cases}`} />}
        <Commandes etape={e} total={total} onPrecedent={() => setEtape(e - 1)} onSuivant={() => setEtape(e + 1)} onTout={() => setEtape(total)} onRecommencer={() => setEtape(0)} onExemple={exemple} />
      </Zone>

      {r && (
        <>
          <Zone titre="Simulation">
            {e === 0 && <p className="text-sm text-fh-ardoise">Clique sur « Étape suivante » : on résout par substitution.</p>}
            {e >= 1 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">1. Coefficients réduits modulo {p}</p>
                <Tex bloc expr={`\\begin{cases} ${eq(r.reduit.a1, r.reduit.b1, r.reduit.c1, p)} \\\\ ${eq(r.reduit.a2, r.reduit.b2, r.reduit.c2, p)} \\end{cases}`} />
              </div>
            )}
            {s && e >= 2 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">2. On isole {V} dans l&apos;équation {s.eqIsolee}</p>
                {s.coef !== 1 && (
                  <>
                    <Tex expr={`${V} \\equiv ${s.inverse} \\times (${somme([[s.eqIsolee === 1 ? r.reduit.c1 : r.reduit.c2, ""], [-(V === "x" ? (s.eqIsolee === 1 ? r.reduit.b1 : r.reduit.b2) : (s.eqIsolee === 1 ? r.reduit.a1 : r.reduit.a2)), W]])}) ${mod(p)}`} />
                  </>
                )}
                <Tex expr={`${V} \\equiv ${exprIsolee} ${mod(p)}`} />
              </div>
            )}
            {s && e >= 3 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">3. On remplace {V} dans l&apos;autre équation</p>
                <Tex
                  expr={`${s.gV === 0 ? "" : `${s.gV === 1 ? "" : s.gV}(${exprIsolee})`}${s.gV !== 0 && s.gW !== 0 ? " + " : ""}${s.gW === 0 ? "" : `${s.gW === 1 ? "" : s.gW}${W}`}${s.gV === 0 && s.gW === 0 ? "0" : ""} \\equiv ${s.gc} ${mod(p)}`}
                />
              </div>
            )}
            {s && e >= 4 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">4. On développe, puis on réduit modulo {p}</p>
                <Tex expr={`${somme([[s.constante, ""], [s.coefAutre, W]])} \\equiv ${s.gc} ${mod(p)}`} />
                <Tex expr={`${somme([[s.K, ""], [s.A, W]])} \\equiv ${s.gc} ${mod(p)}`} />
              </div>
            )}
            {s && e >= 5 && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">5. On résout pour {W}</p>
                {/* Quand A vaut 1, l'équation A·W ≡ D est déjà la solution W ≡ D : l'afficher deux fois faisait doublon. */}
                {afficherLigneIntermediaire(s) && <Tex expr={`${somme([[s.A, W]])} \\equiv ${s.D} ${mod(p)}`} />}
                {s.issue === "unique" && s.invA !== null && s.valeurAutre !== null && (
                  <>
                    {s.A !== 1 && <Tex expr={`${s.A} \\times ${s.invA} \\equiv 1 \\;\\Rightarrow\\; ${W} \\equiv ${s.invA} \\times ${s.D} ${mod(p)}`} />}
                    <Tex expr={`${W} \\equiv ${s.valeurAutre} ${mod(p)}`} />
                  </>
                )}
                {s.issue === "plusieurs" && <Tex expr={`0 \\equiv 0 \\;\\Rightarrow\\; ${W} \\text{ peut être n'importe quelle classe}`} />}
                {s.issue === "aucune" && <Tex expr={`0 \\equiv ${s.D} ${mod(p)} \\text{ est faux}`} />}
              </div>
            )}
            {s && s.issue === "unique" && e >= 6 && s.valeurAutre !== null && s.valeurIsolee !== null && (
              <div className="flex flex-col">
                <p className="text-xs font-semibold text-fh-ardoise/70">6. On revient à {V}</p>
                <Tex expr={`${V} \\equiv ${exprIsolee.replace(W, `${s.valeurAutre}`)} \\equiv ${s.valeurIsolee} ${mod(p)}`} />
              </div>
            )}
          </Zone>

          <Zone titre="Explications" ton="explication">
            {e === 0 && <p className="text-sm text-fh-ardoise">Chaque étape expliquera ce qu&apos;on fait, pourquoi, et ce qu&apos;on obtient.</p>}
            {e === 1 && (
              <TroisQuestions
                quoi={<>On remplace chaque coefficient par son reste dans la division par {p}.</>}
                pourquoi={<>Les calculs modulo {p} ne changent pas si on remplace un entier par un entier congru : les nombres restent entre 0 et {p - 1}.</>}
                obtenu={<>Un système équivalent, avec des petits coefficients.</>}
              />
            )}
            {s && e === 2 && (
              <TroisQuestions
                quoi={<>On choisit une équation et une inconnue dont le coefficient n&apos;est pas nul (de préférence égal à 1), et on exprime {V} en fonction de {W}.</>}
                pourquoi={<>Un coefficient non nul modulo {p} est inversible (p est premier) : on peut donc « diviser » par lui, c&apos;est-à-dire multiplier par son inverse{s.coef !== 1 ? ` (${s.inverse}, car ${s.coef} × ${s.inverse} ≡ 1)` : ""}.</>}
                obtenu={<><Tex expr={`${V} \\equiv ${exprIsolee} ${mod(p)}`} />.</>}
              />
            )}
            {s && e === 3 && (
              <TroisQuestions
                quoi={<>On remplace {V} par son expression dans l&apos;autre équation.</>}
                pourquoi={<>Il ne reste alors qu&apos;une seule inconnue, {W}, comme dans une équation simple.</>}
                obtenu={<>Une équation en {W} seulement, à simplifier.</>}
              />
            )}
            {s && e === 4 && (
              <TroisQuestions
                quoi={<>On développe, on regroupe les termes en {W}, puis on réduit les nombres modulo {p}.</>}
                pourquoi={<>Pour ramener l&apos;équation à la forme <Tex expr={`A\\,${W} \\equiv D`} />.</>}
                obtenu={<><Tex expr={`${somme([[s.K, ""], [s.A, W]])} \\equiv ${s.gc} ${mod(p)}`} />.</>}
              />
            )}
            {s && e === 5 && (
              <TroisQuestions
                quoi={<>On résout <Tex expr={`${somme([[s.A, W]])} \\equiv ${s.D}`} /> pour {W}.</>}
                pourquoi={
                  s.A !== 0 ? (
                    <>Le coefficient {s.A} est non nul modulo {p}, donc inversible : on peut le « diviser ». Le système a alors une seule solution.</>
                  ) : (
                    <>Le coefficient de {W} est nul modulo {p} : on <strong>ne peut pas</strong> l&apos;inverser (le déterminant du système est nul). Il reste seulement la condition <Tex expr={`0 \\equiv ${s.D}`} />.</>
                  )
                }
                obtenu={s.issue === "unique" ? <><Tex expr={`${W} \\equiv ${s.valeurAutre}`} />.</> : s.issue === "plusieurs" ? <>La condition est toujours vraie : {W} est libre, le système a plusieurs solutions.</> : <>La condition est fausse : le système est incompatible.</>}
              />
            )}
            {s && e === 6 && s.valeurAutre !== null && (
              <TroisQuestions
                quoi={<>On remplace {W} par {s.valeurAutre} dans l&apos;expression de {V}.</>}
                pourquoi={<>L&apos;expression donne {V} dès que {W} est connue.</>}
                obtenu={<>{V} ≡ {s.valeurIsolee} modulo {p}.</>}
              />
            )}
            {!s && e === 1 && <p className="text-sm text-fh-ardoise">Tous les coefficients de x et de y sont nuls modulo {p} : il n&apos;y a plus d&apos;inconnue, il reste seulement des conditions sur les seconds membres.</p>}
          </Zone>

          <Zone titre="Résultat" ton="resultat">
            {e < total ? (
              <p className="text-sm text-fh-ardoise">La conclusion apparaîtra à la dernière étape.</p>
            ) : r.kind === "unique" ? (
              <>
                <Tex bloc className="text-lg" expr={`(x, y) = (${classe(r.solutions[0][0])},\\ ${classe(r.solutions[0][1])})`} />
                <p className="text-sm text-fh-ardoise">Une seule solution : x ≡ {r.solutions[0][0]} et y ≡ {r.solutions[0][1]} modulo {p}.</p>
                <div className="flex flex-col">
                  <p className="text-xs font-semibold text-fh-ardoise/70">Vérification dans les deux équations</p>
                  <Tex expr={`${r.reduit.a1} \\times ${r.solutions[0][0]} + ${r.reduit.b1} \\times ${r.solutions[0][1]} = ${r.reduit.a1 * r.solutions[0][0] + r.reduit.b1 * r.solutions[0][1]} \\equiv ${modulo(r.reduit.a1 * r.solutions[0][0] + r.reduit.b1 * r.solutions[0][1], p)} \\equiv ${r.reduit.c1} ${mod(p)}`} />
                  <Tex expr={`${r.reduit.a2} \\times ${r.solutions[0][0]} + ${r.reduit.b2} \\times ${r.solutions[0][1]} = ${r.reduit.a2 * r.solutions[0][0] + r.reduit.b2 * r.solutions[0][1]} \\equiv ${modulo(r.reduit.a2 * r.solutions[0][0] + r.reduit.b2 * r.solutions[0][1], p)} \\equiv ${r.reduit.c2} ${mod(p)}`} />
                </div>
              </>
            ) : r.kind === "aucune" ? (
              <p className="text-base font-semibold text-red-800">Le système est incompatible : il n&apos;a aucune solution modulo {p}.</p>
            ) : (
              <>
                <p className="text-base font-semibold text-emerald-800">Le système a {r.solutions.length} solutions modulo {p}.</p>
                {s && s.issue === "plusieurs" && <Tex bloc expr={`${s.autre} = t, \\quad ${s.isolee} \\equiv ${s.m === 0 ? s.alpha : somme([[s.alpha, ""], [-s.m, "t"]])} ${mod(p)} \\quad (t \\text{ quelconque})`} />}
              </>
            )}
            {e >= total && (
              <details className="rounded-lg border border-fh-sable bg-white px-3 py-2">
                <summary className="min-h-8 cursor-pointer text-sm font-semibold text-fh-bleu">Vérifier par énumération (facultatif)</summary>
                <p className="mt-2 text-sm text-fh-ardoise">
                  On teste les {p * p} couples de classes (x, y) possibles : {r.solutions.length === 0 ? "aucun ne convient" : `${r.solutions.length} couple${r.solutions.length > 1 ? "s conviennent" : " convient"}`}, ce qui confirme la conclusion.
                </p>
                {r.solutions.length > 0 && (
                  <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Couples solutions">
                    {r.solutions.map(([x, y]) => (
                      <li key={`${x}-${y}`} className="rounded-full border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-900">
                        ({x}, {y})
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            )}
            {!s && e >= 1 && <Message>Cas particulier : aucun coefficient non nul.</Message>}
          </Zone>
        </>
      )}
    </div>
  );
}

export default function SimModuloP() {
  const [sous, setSous] = useState("equation");
  return (
    <div className="flex flex-col gap-4">
      <Onglets
        onglets={[
          { id: "equation", libelle: "Équation" },
          { id: "systeme", libelle: "Système" },
        ]}
        actif={sous}
        onChoisir={setSous}
        prefixe="modp"
        etiquette="Équation ou système modulo p"
        grille="grid-cols-2 max-w-sm"
      />
      <div role="tabpanel" id={`modp-panneau-${sous}`} aria-labelledby={`modp-onglet-${sous}`} className="min-w-0">
        {sous === "equation" ? <Equation /> : <Systeme />}
      </div>
    </div>
  );
}
