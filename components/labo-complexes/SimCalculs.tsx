"use client";

import { useState, type ReactNode } from "react";
import { IconRefresh } from "@tabler/icons-react";

import { add, conj, cx, div, estNul, mul, puissanceDeI, sub, type Cx } from "@/lib/complexes";
import { parTex } from "@/lib/complexesAffichage";
import { lireComplexe, reponseEgale, texComplexe, texNombre, texReel } from "@/lib/complexesTex";
import { Bouton, COULEURS, Conclusion, Curseur, DefiBloc, Fleche, Intro, Message, Pastille, PlanSvg, QuestionTexte, Stepper, Tex, Valeur, Zone, type PointPlan } from "./ui";

type Operation = "add" | "sub" | "mul" | "div" | "conj" | "puiss";

const OPERATIONS: Array<{ id: Operation; libelle: string }> = [
  { id: "add", libelle: "z₁ + z₂" },
  { id: "sub", libelle: "z₁ − z₂" },
  { id: "mul", libelle: "z₁ × z₂" },
  { id: "div", libelle: "z₁ ÷ z₂" },
  { id: "conj", libelle: "Conjugué" },
  { id: "puiss", libelle: "Puissances de i" },
];

const par = (z: Cx) => `(${texComplexe(z)})`;
const sg = (x: number) => (x < 0 ? `- ${texReel(-x)}` : `+ ${texReel(x)}`);

/** Développement de (a+ib)(c+id) avec i² = -1, étape par étape (TeX). */
export function devMul(z1: Cx, z2: Cx): string {
  const { re: a, im: b } = z1;
  const { re: c, im: d } = z2;
  const res = mul(z1, z2);
  return `${par(z1)}${par(z2)} = ${texReel(a * c)} ${sg(a * d)}\\,i ${sg(b * c)}\\,i ${sg(b * d)}\\,i^2 = ${texReel(a * c)} ${sg(a * d)}\\,i ${sg(b * c)}\\,i ${sg(-b * d)} = ${texComplexe(res)}`;
}

/** Division par multiplication du numérateur et du dénominateur par le conjugué du dénominateur (TeX), ou null si z₂ = 0. */
export function devDiv(z1: Cx, z2: Cx): string | null {
  const q = div(z1, z2);
  if (q === null) return null;
  const num = mul(z1, conj(z2));
  const den = z2.re * z2.re + z2.im * z2.im;
  return `\\frac{${texComplexe(z1)}}{${texComplexe(z2)}} = \\frac{${par(z1)}${par(conj(z2))}}{${par(z2)}${par(conj(z2))}} = \\frac{${texComplexe(num)}}{${parTex(z2.re)}^2 + ${parTex(z2.im)}^2} = \\frac{${texComplexe(num)}}{${texReel(den)}} = ${texComplexe(q)}`;
}

const INSTANCES: Array<{ z1: Cx; z2: Cx; q1: "mul" | "div"; q2: "add" | "sub" | "mul" | "div"; n: number }> = [
  { z1: cx(2, 3), z2: cx(4, -1), q1: "mul", q2: "add", n: 2027 },
  { z1: cx(1, 2), z2: cx(3, -1), q1: "div", q2: "sub", n: -3 },
  { z1: cx(3, -2), z2: cx(1, 1), q1: "mul", q2: "div", n: 43 },
];

function calcul(op: "add" | "sub" | "mul" | "div", z1: Cx, z2: Cx): Cx | null {
  return op === "add" ? add(z1, z2) : op === "sub" ? sub(z1, z2) : op === "mul" ? mul(z1, z2) : div(z1, z2);
}
const SYMBOLE = { add: "+", sub: "-", mul: "\\times", div: "\\div" } as const;

function verifierComplexe(t: string, attendu: Cx): { ok: boolean; message: ReactNode } {
  const l = lireComplexe(t);
  if (!l.ok) return { ok: false, message: l.erreur };
  if (reponseEgale(l.valeur.re, attendu.re) && reponseEgale(l.valeur.im, attendu.im)) return { ok: true, message: <>Exact : <Tex expr={texComplexe(attendu)} />.</> };
  return { ok: false, message: <>Ce n&apos;est pas le bon résultat. Vérifie la partie réelle et la partie imaginaire séparément, en pensant à <Tex expr="i^2 = -1" />.</> };
}

export default function SimCalculs() {
  const [z1, setZ1] = useState<Cx>(cx(2, 3));
  const [z2, setZ2] = useState<Cx>(cx(4, -1));
  const [op, setOp] = useState<Operation>("mul");
  const [n, setN] = useState(7);

  const res = op === "add" || op === "sub" || op === "mul" || op === "div" ? calcul(op, z1, z2) : op === "conj" ? conj(z1) : puissanceDeI(n);
  const divisionImpossible = op === "div" && estNul(z2);

  const etendue = Math.max(6, Math.ceil(Math.max(Math.abs(z1.re), Math.abs(z1.im), Math.abs(z2.re), Math.abs(z2.im), res ? Math.abs(res.re) : 0, res ? Math.abs(res.im) : 0) + 1));
  const B = op === "puiss" ? 2 : etendue;
  const bornes = { xmin: -B, xmax: B, ymin: -B, ymax: B };

  const pts: PointPlan[] = [];
  if (op === "puiss") {
    [puissanceDeI(0), puissanceDeI(1), puissanceDeI(2), puissanceDeI(3)].forEach((p, k) => pts.push({ id: `p${k}`, z: p, couleur: COULEURS.gris, etiquette: ["1", "i", "−1", "−i"][k] }));
    if (res) pts.push({ id: "res", z: res, couleur: COULEURS.resultat, etiquette: `i^${n}` });
  } else {
    pts.push({ id: "z1", z: z1, couleur: COULEURS.z, etiquette: "z₁", deplacable: true });
    if (op !== "conj") pts.push({ id: "z2", z: z2, couleur: COULEURS.w, etiquette: "z₂", deplacable: true });
    if (res && !divisionImpossible) pts.push({ id: "res", z: res, couleur: COULEURS.resultat, etiquette: op === "conj" ? "z̄₁" : "résultat" });
  }
  const borne5 = (v: number) => Math.max(-5, Math.min(5, v));

  function deplacer(id: string, z: Cx) {
    const p = cx(borne5(z.re), borne5(z.im));
    if (id === "z1") setZ1(p);
    else if (id === "z2") setZ2(p);
  }
  function reinit() {
    setZ1(cx(2, 3));
    setZ2(cx(4, -1));
    setOp("mul");
    setN(7);
  }

  const explication: ReactNode = (() => {
    if (op === "add") {
      const r = add(z1, z2);
      return (
        <>
          <p>On additionne séparément les parties réelles et les parties imaginaires. Géométriquement, c&apos;est la <strong>règle du parallélogramme</strong> : le vecteur somme est la diagonale issue de O.</p>
          <Tex bloc expr={`${par(z1)} + ${par(z2)} = (${texReel(z1.re)} ${sg(z2.re)}) + (${texReel(z1.im)} ${sg(z2.im)})\\,i = ${texComplexe(r)}`} />
        </>
      );
    }
    if (op === "sub") {
      const r = sub(z1, z2);
      return (
        <>
          <p>On soustrait les parties réelles, puis les parties imaginaires. Le vecteur <Tex expr="z_1 - z_2" /> est celui qui va de M₂ à M₁ (tracé en pointillé), ramené à l&apos;origine.</p>
          <Tex bloc expr={`${par(z1)} - ${par(z2)} = (${texReel(z1.re)} - ${parTex(z2.re)}) + (${texReel(z1.im)} - ${parTex(z2.im)})\\,i =${texComplexe(r)}`} />
        </>
      );
    }
    if (op === "mul") {
      return (
        <>
          <p>On développe comme avec des lettres, puis on remplace <Tex expr="i^2" /> par <Tex expr="-1" /> :</p>
          <Tex bloc expr={devMul(z1, z2)} />
          <p>Forme générale : <Tex expr="(a+ib)(c+id) = (ac - bd) + i\,(ad + bc)" />.</p>
        </>
      );
    }
    if (op === "div") {
      const d = devDiv(z1, z2);
      return d === null ? (
        <p>Diviser par 0 n&apos;a aucun sens : <strong>Division impossible : le dénominateur est nul.</strong> Choisis z₂ ≠ 0.</p>
      ) : (
        <>
          <p>On multiplie le numérateur <em>et</em> le dénominateur par le <strong>conjugué du dénominateur</strong> : le dénominateur devient le réel <Tex expr="c^2 + d^2" />.</p>
          <Tex bloc expr={d} />
        </>
      );
    }
    if (op === "conj") {
      return (
        <>
          <p>Le conjugué change le signe de la partie imaginaire : c&apos;est le symétrique par rapport à l&apos;axe des réels.</p>
          <Tex bloc expr={`\\overline{${texComplexe(z1)}} = ${texComplexe(conj(z1))}`} />
          <Tex bloc expr={`z_1\\,\\overline{z_1} = ${texNombre(mul(z1, conj(z1)).re)} = |z_1|^2`} />
        </>
      );
    }
    const r = ((n % 4) + 4) % 4;
    return (
      <>
        <p>Les puissances de i se répètent par <strong>cycle de longueur 4</strong> : <Tex expr="i^0 = 1,\; i^1 = i,\; i^2 = -1,\; i^3 = -i,\; i^4 = 1\ldots" /></p>
        <Tex bloc expr={`i^{${n}} : \\; ${n} = 4\\times ${Math.floor(n / 4)} + ${r} \\;\\Rightarrow\\; i^{${n}} = (i^4)^{${Math.floor(n / 4)}}\\, i^{${r}} = i^{${r}} = ${texComplexe(puissanceDeI(n))}`} />
      </>
    );
  })();

  return (
    <div className="flex flex-col gap-4">
      <Intro couleur="border-emerald-500 bg-emerald-50">
        Additionner, soustraire, multiplier, diviser : choisis deux nombres complexes z₁ = a + ib et z₂ = c + id, puis une opération. Le résultat apparaît sur le plan et le calcul est détaillé étape par étape.
      </Intro>

      <Zone titre="1 · Découvrir">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Opération">
          {OPERATIONS.map((o) => (
            <Pastille key={o.id} actif={op === o.id} onClick={() => setOp(o.id)}>
              {o.libelle}
            </Pastille>
          ))}
        </div>
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
          <PlanSvg
            bornes={bornes}
            points={pts}
            aimant={0.5}
            etiquette="Plan complexe des calculs : z1 et z2 sont déplaçables"
            onDeplacer={deplacer}
            dessous={(o) => (
              <g>
                {op === "puiss" && <circle cx={o.X(0)} cy={o.Y(0)} r={o.u} fill="none" stroke="#94a3b8" strokeDasharray="4 4" />}
                {op === "add" && res && (
                  <>
                    <line x1={o.X(z1.re)} y1={o.Y(z1.im)} x2={o.X(res.re)} y2={o.Y(res.im)} stroke={COULEURS.w} strokeDasharray="5 4" strokeWidth={1.8} />
                    <line x1={o.X(z2.re)} y1={o.Y(z2.im)} x2={o.X(res.re)} y2={o.Y(res.im)} stroke={COULEURS.z} strokeDasharray="5 4" strokeWidth={1.8} />
                  </>
                )}
                {op === "sub" && (
                  <Fleche o={o} de={z2} vers={z1} couleur={COULEURS.resultat} pointille epaisseur={2} />
                )}
                {op === "conj" && res && <line x1={o.X(z1.re)} y1={o.Y(z1.im)} x2={o.X(res.re)} y2={o.Y(res.im)} stroke={COULEURS.conjugue} strokeDasharray="2 4" strokeWidth={1.8} />}
                {op !== "puiss" && <Fleche o={o} de={cx(0, 0)} vers={z1} couleur={COULEURS.z} epaisseur={2} />}
                {op !== "puiss" && op !== "conj" && <Fleche o={o} de={cx(0, 0)} vers={z2} couleur={COULEURS.w} epaisseur={2} />}
                {res && !divisionImpossible && <Fleche o={o} de={cx(0, 0)} vers={res} couleur={COULEURS.resultat} epaisseur={3} />}
              </g>
            )}
          />
          <div className="flex min-w-0 flex-col gap-3">
            <Curseur etiquette={<><Tex expr="a" /> (partie réelle de z₁)</>} valeur={z1.re} min={-5} max={5} pas={0.5} decimales={1} onChange={(v) => setZ1({ ...z1, re: v })} />
            <Curseur etiquette={<><Tex expr="b" /> (partie imaginaire de z₁)</>} valeur={z1.im} min={-5} max={5} pas={0.5} decimales={1} onChange={(v) => setZ1({ ...z1, im: v })} />
            {op !== "conj" && op !== "puiss" && (
              <>
                <Curseur etiquette={<><Tex expr="c" /> (partie réelle de z₂)</>} valeur={z2.re} min={-5} max={5} pas={0.5} decimales={1} onChange={(v) => setZ2({ ...z2, re: v })} />
                <Curseur etiquette={<><Tex expr="d" /> (partie imaginaire de z₂)</>} valeur={z2.im} min={-5} max={5} pas={0.5} decimales={1} onChange={(v) => setZ2({ ...z2, im: v })} />
              </>
            )}
            {op === "puiss" && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-fh-ardoise/80">Exposant n</span>
                <Stepper etiquette="Exposant n de i" valeur={n} min={-12} max={40} onChange={setN} />
              </div>
            )}
            <Bouton onClick={reinit}>
              <IconRefresh size={18} aria-hidden="true" />
              Réinitialiser
            </Bouton>
          </div>
        </div>
        {divisionImpossible ? (
          <Message type="erreur">Division impossible : le dénominateur est nul.</Message>
        ) : (
          res && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-live="polite">
              {op !== "puiss" && (
                <Valeur etiquette="z₁">
                  <Tex expr={texComplexe(z1)} />
                </Valeur>
              )}
              {op !== "puiss" && op !== "conj" && (
                <Valeur etiquette="z₂">
                  <Tex expr={texComplexe(z2)} />
                </Valeur>
              )}
              <Valeur etiquette="Résultat">
                <Tex expr={op === "puiss" ? `i^{${n}} = ${texComplexe(res)}` : texComplexe(res)} />
              </Valeur>
            </div>
          )
        )}
      </Zone>

      <Zone titre="2 · Comprendre" ton="explication">
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-fh-ardoise">{explication}</div>
      </Zone>

      <Zone titre="3 · Vérifier">
        <DefiBloc
          nombre={INSTANCES.length}
          rendu={(i) => {
            const it = INSTANCES[i];
            const r1 = calcul(it.q1, it.z1, it.z2) as Cx;
            const r2 = calcul(it.q2, it.z1, it.z2) as Cx;
            const ri = puissanceDeI(it.n);
            const detail = (op2: "add" | "sub" | "mul" | "div", z: Cx, w: Cx): ReactNode =>
              op2 === "mul" ? <Tex bloc expr={devMul(z, w)} /> : op2 === "div" ? <Tex bloc expr={devDiv(z, w) ?? ""} /> : <Tex bloc expr={`${par(z)} ${SYMBOLE[op2]} ${par(w)} = ${texComplexe(calcul(op2, z, w) as Cx)}`} />;
            const rappel = (o: string) =>
              o === "mul" ? <>Développe en utilisant <Tex expr="i^2 = -1" />.</> : o === "div" ? <>Multiplie le numérateur et le dénominateur par le conjugué du dénominateur.</> : <>Calcule séparément les parties réelles et imaginaires.</>;
            return (
              <>
                <QuestionTexte
                  numero={1}
                  enonce={<>Calcule <Tex expr={`${par(it.z1)} ${SYMBOLE[it.q1]} ${par(it.z2)}`} /> sous forme algébrique.</>}
                  placeholder="ex. 11 + 10i"
                  verifier={(t) => verifierComplexe(t, r1)}
                  indices={[rappel(it.q1), <>Regroupe ensuite les termes en <Tex expr="i" /> et les termes réels.</>]}
                  correction={detail(it.q1, it.z1, it.z2)}
                />
                <QuestionTexte
                  numero={2}
                  enonce={<>Calcule <Tex expr={`${par(it.z1)} ${SYMBOLE[it.q2]} ${par(it.z2)}`} />.</>}
                  placeholder="ex. 6 + 2i (fractions acceptées : 1/2 - 5/2 i)"
                  verifier={(t) => verifierComplexe(t, r2)}
                  indices={[rappel(it.q2)]}
                  correction={detail(it.q2, it.z1, it.z2)}
                />
                <QuestionTexte
                  numero={3}
                  enonce={<>Donne <Tex expr={`i^{${it.n}}`} /> sous forme algébrique.</>}
                  placeholder="1, i, -1 ou -i"
                  verifier={(t) => verifierComplexe(t, ri)}
                  indices={[<>Les puissances de i se répètent tous les 4 crans.</>, <>Cherche le reste de la division de {it.n} par 4.</>]}
                  correction={
                    <>
                      <Tex expr={`${it.n} = 4\\times ${Math.floor(it.n / 4)} + ${((it.n % 4) + 4) % 4}`} />, donc <Tex expr={`i^{${it.n}} = i^{${((it.n % 4) + 4) % 4}} = ${texComplexe(ri)}`} />.
                    </>
                  }
                />
              </>
            );
          }}
        />
      </Zone>

      <Conclusion>
        On additionne et on soustrait partie réelle avec partie réelle, partie imaginaire avec partie imaginaire. Pour multiplier, on développe et on utilise i² = −1. Pour diviser, on multiplie par le conjugué du dénominateur ; la division par 0 est impossible. Les puissances de i ont une période de 4.
      </Conclusion>
    </div>
  );
}
