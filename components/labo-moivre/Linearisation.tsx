"use client";

import { useMemo, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { lireReel, reponseEgale } from "@/lib/complexesTex";
import {
  COULEUR_IMAG,
  texAligne,
  texDenominateurEuler,
  texDevFacteur,
  texExpression,
  texExp,
  texLineaire,
  texLineaireAligne,
  texRegroupement,
  texSubstitution,
} from "@/lib/moivreEulerAffichage";
import { evaluerInitial, evaluerLineaire, linearise, ratVal, type Linearisation } from "@/lib/moivreEulerSymbolique";
import { Bouton, Carte, COULEURS, Conclusion, Courbes, Curseur, DefiBloc, EtapeFormule, Intro, Message, Pastille, QuestionChoix, QuestionTexte, Stepper, Tex, Zone } from "./ui";

const DEFAUT = { p: 3, q: 2 };
const EXEMPLES: Array<{ p: number; q: number; libelle: string }> = [
  { p: 3, q: 2, libelle: "sin³x cos²x" },
  { p: 0, q: 4, libelle: "cos⁴x" },
  { p: 4, q: 0, libelle: "sin⁴x" },
  { p: 0, q: 5, libelle: "cos⁵x" },
];
const TOTAL = 5;

/** Valeur numérique d'un résultat « (n₀ + Σ …)/D » : sert à confronter les mauvaises propositions du défi. */
function valeurNumerateurs(l: Linearisation, x: number): number {
  let v = l.numConstante;
  for (let k = 1; k <= l.degreMax; k++) v += l.numCos[k] * Math.cos(k * x) + l.numSin[k] * Math.sin(k * x);
  return v / l.denominateurCommun;
}

const INSTANCES: Array<{ p: number; q: number }> = [
  { p: 0, q: 4 },
  { p: 4, q: 0 },
  { p: 2, q: 3 },
];

function QuestionsLinearisation({ p, q }: { p: number; q: number }) {
  const l = linearise(p, q);
  const parite = p % 2 === 0 ? "cos" : "sin";
  const coefMax = ratVal(parite === "cos" ? l.cos[l.degreMax] : l.sin[l.degreMax]);
  const x0 = Math.PI / 4;
  const initial = evaluerInitial(p, q, x0);

  // Deux mauvaises propositions fabriquées à partir du bon résultat (signe du plus haut terme, dénominateur).
  const signeFaux: Linearisation = { ...l, numCos: l.numCos.map((c, k) => (k === l.degreMax && parite === "cos" ? -c : c)), numSin: l.numSin.map((c, k) => (k === l.degreMax && parite === "sin" ? -c : c)) };
  const denFaux: Linearisation = { ...l, denominateurCommun: l.denominateurCommun * 2 };
  const propositions = [
    { id: "bonne", tex: texLineaire(l), lin: l },
    { id: "signe", tex: texLineaire(signeFaux), lin: signeFaux },
    { id: "den", tex: texLineaire(denFaux), lin: denFaux },
  ];
  const ordre = (p + 2 * q) % 3; // fait tourner la place de la bonne réponse
  const options = propositions.map((_, i) => propositions[(i + ordre) % 3]).map((o) => ({ id: o.id, libelle: <Tex expr={o.tex} /> }));
  const fmt = (v: number) => String(Number(v.toFixed(4))).replace(".", ",");
  const explications: Record<string, React.ReactNode> = {
    bonne: <>Oui : c&apos;est le résultat du calcul exact par les formules d&apos;Euler.</>,
    signe: (
      <>
        Teste en <Tex expr={"x=\\dfrac{\\pi}{4}"} /> : l&apos;expression initiale vaut {fmt(initial)}, cette formule donne {fmt(valeurNumerateurs(signeFaux, x0))}. Le signe d&apos;un terme est faux.
      </>
    ),
    den: (
      <>
        Teste en <Tex expr={"x=\\dfrac{\\pi}{4}"} /> : l&apos;expression initiale vaut {fmt(initial)}, cette formule donne {fmt(valeurNumerateurs(denFaux, x0))}. Le dénominateur est faux : il vient de 2<sup>p+q</sup> = {l.puissance2}.
      </>
    ),
  };
  return (
    <>
      <p className="text-sm text-fh-ardoise">
        On linéarise <Tex expr={texExpression(p, q)} />.
      </p>
      <QuestionTexte
        numero={1}
        enonce="Quel est le terme constant de la linéarisation (0 s'il n'y en a pas) ?"
        placeholder="par exemple 3/8 ou 0"
        verifier={(t) => {
          const r = lireReel(t);
          if (!r.ok) return { ok: false, message: r.erreur };
          const att = ratVal(l.constante);
          if (reponseEgale(r.valeur, att, 1e-9)) return { ok: true, message: <>Exact : le terme constant est <Tex expr={l.constante.d === 1 ? String(l.constante.n) : `\\dfrac{${l.constante.n}}{${l.constante.d}}`} />.</> };
          return { ok: false, message: <>Le terme constant est celui de l&apos;exponentielle e<sup>0</sup> = 1 : il vient du coefficient central du développement, divisé par {l.puissance2}.</> };
        }}
        indices={[<>Seul le terme en e<sup>0ix</sup> = 1 donne une constante.</>, <>Regarde le coefficient de e<sup>0</sup> dans le développement du numérateur.</>]}
        correction={<>Le terme constant vaut <Tex expr={l.constante.d === 1 ? String(l.constante.n) : `\\dfrac{${l.constante.n}}{${l.constante.d}}`} />.</>}
      />
      <QuestionTexte
        numero={2}
        enonce={<>Quel est le coefficient de <Tex expr={`\\${parite}\\,${l.degreMax}x`} /> ?</>}
        placeholder="par exemple 1/8 ou -1/16"
        verifier={(t) => {
          const r = lireReel(t);
          if (!r.ok) return { ok: false, message: r.erreur };
          if (reponseEgale(r.valeur, coefMax, 1e-9)) return { ok: true, message: <>Exact : le coefficient vaut {l.numCos.concat(l.numSin).length ? <Tex expr={`\\dfrac{${(parite === "cos" ? l.numCos[l.degreMax] : l.numSin[l.degreMax])}}{${l.denominateurCommun}}`} /> : null}, après simplification de la fraction.</> };
          if (reponseEgale(r.valeur, coefMax * l.denominateurCommun, 1e-9)) return { ok: false, message: "Tu as donné le numérateur : divise-le par le dénominateur commun." };
          return { ok: false, message: <>Le terme de plus haut degré vient de e<sup>±{l.degreMax}ix</sup> : son coefficient est ±2/{l.puissance2}, au signe et à la puissance de i près.</> };
        }}
        indices={[<>Le plus haut degré vient du produit des termes e<sup>ix</sup> (ou e<sup>−ix</sup>).</>, <>Divise par 2<sup>p+q</sup> = {l.puissance2}, puis regroupe les deux conjuguées (facteur 2).</>]}
        correction={<>Le coefficient de <Tex expr={`\\${parite}\\,${l.degreMax}x`} /> est <Tex expr={`\\dfrac{${parite === "cos" ? l.numCos[l.degreMax] : l.numSin[l.degreMax]}}{${l.denominateurCommun}}`} /> (fraction éventuellement réductible).</>}
      />
      <QuestionChoix
        numero={3}
        enonce="Quelle est la bonne linéarisation ?"
        options={options}
        bonne="bonne"
        explications={explications}
        indices={[<>Teste chaque proposition en <Tex expr={"x=\\dfrac{\\pi}{4}"} />.</>]}
        correction={<><Tex expr={`${texExpression(p, q)} = ${texLineaire(l)}`} bloc /></>}
      />
    </>
  );
}

export default function Linearisation() {
  const [p, setP] = useState(DEFAUT.p);
  const [q, setQ] = useState(DEFAUT.q);
  const [etape, setEtape] = useState(0);
  const [L, setL] = useState(2);
  const [voirInitial, setVoirInitial] = useState(true);
  const [voirLinearise, setVoirLinearise] = useState(true);

  const lin = useMemo(() => linearise(p, q), [p, q]);
  const ecartMax = useMemo(() => {
    let m = 0;
    for (let i = 0; i <= 400; i++) {
      const x = -L * Math.PI + (2 * L * Math.PI * i) / 400;
      m = Math.max(m, Math.abs(evaluerInitial(p, q, x) - evaluerLineaire(lin, x)));
    }
    return m;
  }, [p, q, L, lin]);

  function choisir(np: number, nq: number) {
    setP(np);
    setQ(nq);
    setEtape(0);
  }
  function reinit() {
    choisir(DEFAUT.p, DEFAUT.q);
    setL(2);
    setVoirInitial(true);
    setVoirLinearise(true);
  }

  // Étape 3 : développements des deux facteurs puis produit complet (tous les termes écrits).
  const termesProduit = [...lin.P.keys()].sort((a, b) => b - a).map((k) => ({ coef: lin.P.get(k) ?? 0, base: texExp(k) }));
  const regroupements = texRegroupement(lin);

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-violet-500 bg-violet-50">
        <strong>Linéariser</strong>, c&apos;est transformer un produit de puissances de sin x et de cos x en une <em>somme</em> de cos kx et de sin kx. Les formules d&apos;Euler le font à coup sûr : on développe, on regroupe les exponentielles conjuguées, et le résultat est exact (coefficients rationnels).
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-fh-ardoise/80">Exposant p de sin x</span>
            <Stepper etiquette="Exposant p de sin x" valeur={p} min={q === 0 ? 1 : 0} max={5 - q} onChange={(v) => choisir(v, q)} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-fh-ardoise/80">Exposant q de cos x</span>
            <Stepper etiquette="Exposant q de cos x" valeur={q} min={p === 0 ? 1 : 0} max={5 - p} onChange={(v) => choisir(p, v)} />
          </div>
          <p className="text-base font-bold text-fh-bleu" aria-live="polite">
            <Tex expr={`${texExpression(p, q)}`} />
          </p>
        </div>
        <p className="text-xs text-fh-ardoise/70">Contrainte : 1 ≤ p + q ≤ 5 (les cas p = 0 ou q = 0 sont permis).</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Exemples">
          {EXEMPLES.map((e) => (
            <Pastille key={e.libelle} actif={p === e.p && q === e.q} onClick={() => choisir(e.p, e.q)}>
              {e.libelle}
            </Pastille>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Commandes de développement">
          <Bouton variante="plein" onClick={() => setEtape((e) => Math.max(e, 1))}>
            Développer
          </Bouton>
          <Bouton onClick={() => setEtape((e) => Math.min(TOTAL, e + 1))} disabled={etape >= TOTAL}>
            Étape suivante
          </Bouton>
          <Bouton onClick={() => setEtape(TOTAL)} disabled={etape >= TOTAL}>
            Tout afficher
          </Bouton>
          <Bouton onClick={reinit}>
            <IconRefresh size={18} aria-hidden="true" />
            Réinitialiser
          </Bouton>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Courbes affichées">
          <Pastille actif={voirInitial} onClick={() => setVoirInitial((v) => !v)}>
            Courbe initiale
          </Pastille>
          <Pastille actif={voirLinearise} onClick={() => setVoirLinearise((v) => !v)}>
            Courbe linéarisée
          </Pastille>
          <Curseur etiquette="Intervalle observé : [−Lπ, Lπ], L =" valeur={L} min={0.5} max={4} pas={0.5} decimales={1} onChange={setL} />
        </div>
        <Courbes
          xmin={-L * Math.PI}
          xmax={L * Math.PI}
          etiquette={`Courbes de ${p === 0 ? "" : `sin^${p}`} ${q === 0 ? "" : `cos^${q}`} et de sa forme linéarisée`}
          courbes={[
            { id: "initiale", libelle: "initiale", f: (x) => evaluerInitial(p, q, x), couleur: COULEURS.z, epaisseur: 5, visible: voirInitial },
            { id: "lineaire", libelle: "linéarisée", f: (x) => evaluerLineaire(lin, x), couleur: COULEURS.resultat, epaisseur: 2.2, pointille: true, visible: voirLinearise },
          ]}
        />
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fh-ardoise" aria-label="Légende">
          <li><span className="mr-1 inline-block h-1.5 w-5 rounded align-middle" style={{ background: COULEURS.z }} />expression initiale <Tex expr={texExpression(p, q)} /></li>
          <li><span className="mr-1 inline-block h-1.5 w-5 rounded align-middle" style={{ background: COULEURS.resultat }} />forme linéarisée (pointillés)</li>
        </ul>
        <Message type="ok">
          Les deux expressions sont <strong>mathématiquement identiques</strong> : c&apos;est le calcul exact des étapes ci-dessous qui le démontre. Les courbes se superposent (écart maximal observé : {ecartMax < 1e-9 ? "inférieur à 10⁻⁹, pur arrondi de l'ordinateur" : ecartMax.toExponential(2)}).
        </Message>
        <Carte titre="Résultat exact">
          <Tex bloc expr={`${texExpression(p, q)} = ${texLineaire(lin)}`} />
        </Carte>
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <p className="text-sm text-fh-ardoise" aria-live="polite">
          Étape {etape} sur {TOTAL}. Utilise « Développer » et « Étape suivante » dans la zone « Découvrir » pour avancer.
        </p>
        <div className="flex flex-wrap gap-2">
          <Bouton onClick={() => setEtape((e) => Math.max(0, e - 1))} disabled={etape <= 0}>
            Étape précédente
          </Bouton>
          <Bouton variante="plein" onClick={() => setEtape((e) => Math.min(TOTAL, e + 1))} disabled={etape >= TOTAL}>
            Étape suivante
          </Bouton>
        </div>
        <ol className="flex flex-col gap-2">
          {etape >= 1 && (
            <EtapeFormule
              numero={1}
              titre="Formules d'Euler"
              expr={"\\sin x=\\dfrac{e^{ix}-e^{-ix}}{2i}\\qquad \\cos x=\\dfrac{e^{ix}+e^{-ix}}{2}"}
              texte="Elles expriment sin et cos à l'aide de e^{ix} et e^{-ix}, ce qui transforme des produits de sin et cos en produits d'exponentielles."
            />
          )}
          {etape >= 2 && <EtapeFormule numero={2} titre="Substitution" expr={texSubstitution(p, q)} texte={<>Le dénominateur est 2<sup>p+q</sup> · i<sup>p</sup> = <Tex expr={texDenominateurEuler(p, q)} /> (i<sup>{p}</sup> est calculé exactement, sans erreur de signe).</>} />}
          {etape >= 3 && (
            <EtapeFormule
              numero={3}
              titre="Développement (binôme de Newton)"
              texte={
                <>
                  <p>On développe chaque facteur avec les coefficients binomiaux, puis on multiplie : voici tous les termes du numérateur N.</p>
                  {p > 0 && <Tex bloc expr={texDevFacteur(p, -1)} />}
                  {q > 0 && <Tex bloc expr={texDevFacteur(q, 1)} />}
                  <Tex bloc expr={texAligne(termesProduit, "N =", 4)} />
                </>
              }
            />
          )}
          {etape >= 4 && (
            <EtapeFormule
              numero={4}
              titre="Regroupement des exponentielles conjuguées"
              texte={
                <>
                  <Tex expr={"e^{ikx}+e^{-ikx}=2\\cos kx"} /> et <Tex expr={"e^{ikx}-e^{-ikx}=2i\\sin kx"} /> : on regroupe e<sup>ikx</sup> avec e<sup>−ikx</sup>, puis on divise par <Tex expr={texDenominateurEuler(p, q)} /> : le facteur <span style={{ color: COULEUR_IMAG }}>i</span> disparaît, le résultat est réel.
                </>
              }
              expr={regroupements.length ? `\\begin{aligned}${regroupements.join("\\\\")}\\end{aligned}` : undefined}
            />
          )}
          {etape >= 5 && <EtapeFormule numero={5} titre="Résultat" expr={`\\boxed{${texExpression(p, q)} = ${texLineaireAligne(lin)}}`} texte="Coefficients rationnels exacts, aucune approximation décimale." />}
        </ol>
        {etape === 0 && <p className="text-sm text-fh-ardoise">Aucune étape affichée : essaie d&apos;abord de prévoir le résultat, puis clique sur « Développer ».</p>}
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc nombre={INSTANCES.length} rendu={(i) => <QuestionsLinearisation p={INSTANCES[i].p} q={INSTANCES[i].q} />} />
      </Zone>

      <Conclusion>
        On linéarise en trois temps : <strong>Euler</strong> (sin et cos en exponentielles), <strong>développement</strong> (binôme), <strong>regroupement</strong> des conjuguées. Par exemple <Tex expr={"\\sin^3x\\cos^2x=\\dfrac{2\\sin x+\\sin3x-\\sin5x}{16}"} />.
      </Conclusion>
    </div>
  );
}
