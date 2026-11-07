"use client";

import { useMemo, useState } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { enRadians } from "@/lib/complexes";
import { lireComplexe, lireReel, reponseEgale, texComplexe } from "@/lib/complexesTex";
import {
  COULEUR_IMAG,
  COULEUR_REEL,
  termesBinomeBruts,
  termesBinomeEvalues,
  termesSubstitues,
  texLignes,
  texMoivreBinome,
  texPartie,
  texPolynomeTrig,
  texSinMultipleSimplifie,
} from "@/lib/moivreEulerAffichage";
import { anglesMultiples, binomial, evaluerCosMultiple, evaluerSinMultiple, polyEval, type AnglesMultiples as AM } from "@/lib/moivreEulerSymbolique";
import { Bouton, Carte, Conclusion, Curseur, DefiBloc, EtapeFormule, Intro, Message, Pastille, QuestionChoix, QuestionTexte, Stepper, Tex, Zone } from "./ui";

type Fonction = "cos" | "sin";
const DEFAUT = { n: 3, f: "cos" as Fonction, x: 35 };
const INSTANCES = [
  { n: 3, k: 3 },
  { n: 4, k: 5 },
  { n: 5, k: 6 },
];

const fmt = (v: number) => String(Number(v.toFixed(6))).replace(".", ",");

function polyTex(a: AM, f: Fonction): string {
  return f === "cos" ? texPolynomeTrig(a.polyCos, "cos") : texSinMultipleSimplifie(a);
}

function QuestionsAngles({ n, k }: { n: number; k: number }) {
  const a = anglesMultiples(n);
  const coefBin = binomial(n, 2);
  const [ir, ii] = ([[1, 0], [0, 1], [-1, 0], [0, -1]] as Array<[number, number]>)[k % 4];
  const bonne = polyTex(a, "cos");
  const flip = a.polyCos.map((c, i) => (i === a.polyCos.length - 1 ? -c : c));
  const fausseSigne = texPolynomeTrig(flip, "cos");
  const fausseSimple = `${n}\\cos x`;
  const val0 = (poly: number[]) => polyEval(poly, 1);
  const choix = [
    { id: "bonne", tex: bonne },
    { id: "signe", tex: fausseSigne },
    { id: "simple", tex: fausseSimple },
  ];
  const ordre = n % 3;
  const options = choix.map((_, i) => choix[(i + ordre) % 3]).map((o) => ({ id: o.id, libelle: <Tex expr={o.tex} /> }));
  return (
    <>
      <p className="text-sm text-fh-ardoise">
        On développe <Tex expr={texMoivreBinome(n)} /> avec <Tex expr={`n = ${n}`} />.
      </p>
      <QuestionTexte
        numero={1}
        enonce={<>Quelle est la valeur de <Tex expr={`i^{${k}}`} /> ?</>}
        placeholder="par exemple 1, -1, i ou -i"
        verifier={(t) => {
          const l = lireComplexe(t);
          if (!l.ok) return { ok: false, message: l.erreur };
          if (reponseEgale(l.valeur.re, ir) && reponseEgale(l.valeur.im, ii)) return { ok: true, message: <>Exact : les puissances de i se répètent par période 4, donc <Tex expr={`i^{${k}} = i^{${k % 4}} = ${texComplexe({ re: ir, im: ii })}`} />.</> };
          return { ok: false, message: <>Les puissances de i ont une période 4 : i<sup>0</sup> = 1, i<sup>1</sup> = i, i<sup>2</sup> = −1, i<sup>3</sup> = −i. Ici {k} = 4 × {Math.floor(k / 4)} + {k % 4}.</> };
        }}
        indices={[<>Divise {k} par 4 et garde le reste.</>, <>Le reste {k % 4} donne i<sup>{k % 4}</sup>.</>]}
        correction={<><Tex expr={`i^{${k}} = i^{${k % 4}} = ${texComplexe({ re: ir, im: ii })}`} />.</>}
      />
      <QuestionTexte
        numero={2}
        enonce={<>Dans le développement de <Tex expr={texMoivreBinome(n)} />, quel est le coefficient de <Tex expr={`\\cos^{${n - 2}}x\\,\\sin^2x`} /> dans la partie réelle (donc dans cos nx) ?</>}
        placeholder="par exemple -3"
        verifier={(t) => {
          const l = lireReel(t);
          if (!l.ok) return { ok: false, message: l.erreur };
          if (reponseEgale(l.valeur, -coefBin, 1e-9)) return { ok: true, message: <>Exact : <Tex expr={`\\binom{${n}}{2}\\,i^2 = ${coefBin}\\times(-1) = ${-coefBin}`} />.</> };
          if (reponseEgale(l.valeur, coefBin, 1e-9)) return { ok: false, message: "Le coefficient binomial est bien le bon, mais il faut multiplier par i² = −1 : le signe est négatif." };
          return { ok: false, message: <>Le terme est <Tex expr={`\\binom{${n}}{2}\\,i^2\\cos^{${n - 2}}x\\sin^2x`} /> : calcule C({n},2) puis multiplie par i² = −1.</> };
        }}
        indices={[<>Dans le binôme, le terme en sin<sup>2</sup> x est <Tex expr={`\\binom{${n}}{2}\\,i^2`} />.</>, <>C({n},2) = {coefBin}.</>]}
        correction={<><Tex expr={`\\binom{${n}}{2}\\,i^2 = ${coefBin}\\times(-1) = ${-coefBin}`} />.</>}
      />
      <QuestionChoix
        numero={3}
        enonce={<>Quelle est l&apos;expression de <Tex expr={`\\cos ${n}x`} /> en fonction de <Tex expr={"\\cos x"} /> ?</>}
        options={options}
        bonne="bonne"
        explications={{
          bonne: <>Oui : c&apos;est le polynôme de Tchebychev de degré {n}, obtenu en remplaçant sin<sup>2</sup> par 1 − cos<sup>2</sup>.</>,
          signe: <>Teste en <Tex expr={"x=0"} /> : <Tex expr={`\\cos 0 = 1`} />, mais cette expression vaut {val0(flip)}. Un signe est faux.</>,
          simple: <>Teste en <Tex expr={"x=0"} /> : <Tex expr={"\\cos 0 = 1"} />, mais cette expression vaut {n}. Multiplier cos x par n ne multiplie pas l&apos;angle.</>,
        }}
        indices={[<>Teste chaque proposition en x = 0 : cos(0) = 1.</>]}
        correction={<><Tex expr={`\\cos ${n}x = ${bonne}`} bloc /></>}
      />
    </>
  );
}

export default function AnglesMultiples() {
  const [n, setN] = useState(DEFAUT.n);
  const [f, setF] = useState<Fonction>(DEFAUT.f);
  const [etape, setEtape] = useState(0);
  const [xDeg, setXDeg] = useState(DEFAUT.x);

  const a = useMemo(() => anglesMultiples(n), [n]);
  const x = enRadians(xDeg);
  const verif = f === "cos" ? evaluerCosMultiple(a, x) : evaluerSinMultiple(a, x);
  const ecart = Math.abs(verif.direct - verif.polynome);
  const nomF = f === "cos" ? "cos" : "sin";

  function reinit() {
    setN(DEFAUT.n);
    setF(DEFAUT.f);
    setEtape(0);
    setXDeg(DEFAUT.x);
  }

  const brutes = termesBinomeBruts(n, a);
  const evalues = termesBinomeEvalues(n, a);
  const substitues = termesSubstitues(n, a, f);

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-orange-500 bg-orange-50">
        La formule de Moivre donne <Tex expr={"(\\cos x+i\\sin x)^n=\\cos nx+i\\sin nx"} />. En développant le membre de gauche avec le binôme de Newton, la <strong style={{ color: COULEUR_REEL }}>partie réelle</strong> donne cos nx et la <strong style={{ color: COULEUR_IMAG }}>partie imaginaire</strong> donne sin nx, comme polynômes en cos x et sin x.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-fh-ardoise/80">Multiple n</span>
            <Stepper etiquette="Multiple n" valeur={n} min={2} max={5} onChange={(v) => { setN(v); setEtape(0); }} />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Fonction étudiée">
            <Pastille actif={f === "cos"} onClick={() => { setF("cos"); setEtape(0); }}>
              Cosinus
            </Pastille>
            <Pastille actif={f === "sin"} onClick={() => { setF("sin"); setEtape(0); }}>
              Sinus
            </Pastille>
          </div>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Commandes">
          <Bouton variante="plein" onClick={() => setEtape((e) => Math.max(e, 1))}>
            Développer
          </Bouton>
          <Bouton onClick={() => setEtape((e) => Math.max(e, 2))} disabled={etape < 1}>
            Identifier
          </Bouton>
          <Bouton onClick={() => setEtape((e) => Math.max(e, 3))} disabled={etape < 2}>
            Simplifier
          </Bouton>
          <Bouton onClick={reinit}>
            <IconRefresh size={18} aria-hidden="true" />
            Réinitialiser
          </Bouton>
        </div>
        <Carte titre="Formule de Moivre">
          <Tex bloc expr={`${texMoivreBinome(n)} = \\cos ${n}x + i\\sin ${n}x`} />
        </Carte>

        <div className="flex flex-col gap-2">
          <Curseur etiquette="Vérification numérique : x =" valeur={xDeg} min={-360} max={360} pas={1} decimales={1} unite="degrés" onChange={setXDeg} />
          <div className="grid gap-2 sm:grid-cols-2" aria-live="polite">
            <Carte titre={`Membre de gauche : ${nomF}(${n}x)`}>
              <Tex expr={`\\${nomF}(${n}x) = ${fmt(verif.direct)}`} />
            </Carte>
            <Carte titre="Membre de droite : le polynôme">
              <Tex expr={`${f === "cos" ? texPolynomeTrig(a.polyCos, "cos") : texSinMultipleSimplifie(a)} = ${fmt(verif.polynome)}`} />
            </Carte>
          </div>
          <Message type={ecart < 1e-9 ? "ok" : "erreur"}>
            {ecart < 1e-9 ? "Les deux membres sont égaux (écart de l'ordre des arrondis de l'ordinateur)." : `Écart observé : ${ecart.toExponential(2)}`} <strong>Ce contrôle numérique n&apos;est pas une preuve</strong> : la démonstration est le calcul symbolique de la zone « Comprendre ».
          </Message>
        </div>
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <p className="text-sm text-fh-ardoise" aria-live="polite">
          Étape {Math.min(etape, 3)} sur 3 — « Développer », « Identifier », « Simplifier » dans la zone « Découvrir » (ou les boutons ci-dessous).
        </p>
        <div className="flex flex-wrap gap-2">
          <Bouton onClick={() => setEtape((e) => Math.max(0, e - 1))} disabled={etape <= 0}>
            Étape précédente
          </Bouton>
          <Bouton variante="plein" onClick={() => setEtape((e) => Math.min(3, e + 1))} disabled={etape >= 3}>
            Étape suivante
          </Bouton>
        </div>
        {etape === 0 && <p className="text-sm text-fh-ardoise">Aucune étape affichée : clique sur « Développer ».</p>}
        <ol className="flex flex-col gap-2">
          {etape >= 1 && (
            <EtapeFormule
              numero={1}
              titre="Développer avec le binôme de Newton"
              texte={
                <>
                  <p>
                    Les coefficients binomiaux <Tex expr={"\\binom{n}{k}"} /> et les puissances de i sont visibles. Les termes <span style={{ color: COULEUR_REEL, fontWeight: 700 }}>réels</span> (k pair) et <span style={{ color: COULEUR_IMAG, fontWeight: 700 }}>imaginaires</span> (k impair) sont colorés.
                  </p>
                  <Tex bloc expr={texLignes(brutes, 2, `${texMoivreBinome(n)} =&`)} />
                  <p>On calcule les puissances de i (i² = −1, i³ = −i, i⁴ = 1…) :</p>
                  <Tex bloc expr={texLignes(evalues, 2, "=&")} />
                </>
              }
            />
          )}
          {etape >= 2 && (
            <EtapeFormule
              numero={2}
              titre="Identifier les parties réelle et imaginaire"
              texte={
                <>
                  <p>Comme cos nx + i sin nx est de la forme (réel) + i (réel), on identifie les parties :</p>
                  <Tex bloc expr={`\\cos ${n}x = ${texPartie(n, a, "cos")}`} />
                  <Tex bloc expr={`\\sin ${n}x = ${texPartie(n, a, "sin")}`} />
                </>
              }
            />
          )}
          {etape >= 3 && (
            <EtapeFormule
              numero={3}
              titre={`Simplifier ${nomF} ${n}x avec ${f === "cos" ? "sin² x = 1 − cos² x" : "cos² x = 1 − sin² x"}`}
              texte={
                <>
                  <Tex bloc expr={`\\${nomF}\\,${n}x = ${texLignes(substitues, 2)}`} />
                  <p>On développe et on regroupe les puissances :</p>
                  <Tex bloc expr={`\\boxed{\\${nomF}\\,${n}x = ${polyTex(a, f)}}`} />
                </>
              }
            />
          )}
        </ol>
        {etape >= 3 && n === 3 && (
          <Carte titre="Les deux résultats pour n = 3">
            <Tex bloc expr={"\\boxed{\\cos3x=4\\cos^3x-3\\cos x}\\qquad \\boxed{\\sin3x=3\\sin x-4\\sin^3x}"} />
          </Carte>
        )}
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc nombre={INSTANCES.length} rendu={(i) => <QuestionsAngles n={INSTANCES[i].n} k={INSTANCES[i].k} />} />
      </Zone>

      <Conclusion>
        Pour exprimer cos nx et sin nx en fonction de cos x et sin x : on développe <Tex expr={"(\\cos x+i\\sin x)^n"} />, on identifie parties réelle et imaginaire, puis on remplace sin<sup>2</sup> par 1 − cos<sup>2</sup> (ou l&apos;inverse).
      </Conclusion>
    </div>
  );
}
