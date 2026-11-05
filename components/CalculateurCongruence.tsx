"use client";

import { useId, useMemo, useState } from "react";
import katex from "katex";

import {
  divisionEuclidienne,
  lireEntier,
  moduleValide,
  testerCongruence,
  type CongruenceData,
} from "@/lib/congruence";

/**
 * Calculateur de congruence : division euclidienne (reste toujours dans [0, n − 1], même pour a < 0) et test
 * a ≡ b [n]. Notation à crochets partout. Rendu KaTeX via katex.renderToString (comme HorlogeModulaire), sans accès
 * navigateur pendant le rendu : SSR-safe.
 */

const MESSAGE_ENTREE = "Entre un entier a et un module n ≥ 1";
const COULEUR_OK = "#0F7A3D";
const COULEUR_KO = "#C0392B";

function tex(expression: string): string {
  return katex.renderToString(expression, { throwOnError: false, output: "html" });
}

function Tex({ expr, className = "" }: { expr: string; className?: string }) {
  const html = useMemo(() => tex(expr), [expr]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Entier TeX : un négatif est entouré de parenthèses quand il suit un opérateur ou un facteur. */
function entierEntreParentheses(x: number): string {
  return x < 0 ? `(${x})` : `${x}`;
}

interface ChampProps {
  id: string;
  etiquette: string;
  valeur: string;
  onChange: (v: string) => void;
  invalide: boolean;
}

function Champ({ id, etiquette, valeur, onChange, invalide }: ChampProps) {
  return (
    <div className="flex min-w-[8rem] flex-1 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-fh-ardoise/80">
        {etiquette}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalide}
        className={`min-h-11 w-full rounded-lg border bg-white px-3 text-base text-fh-bleu outline-none focus:border-fh-bleu-vif focus:ring-2 focus:ring-fh-bleu-vif/20 ${
          invalide ? "border-red-400" : "border-fh-sable"
        }`}
      />
    </div>
  );
}

function MessageEntree() {
  return (
    <p role="status" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
      {MESSAGE_ENTREE}
    </p>
  );
}

function BlocDivision({ initialA, initialN }: { initialA: number; initialN: number }) {
  const id = useId();
  const [saisieA, setSaisieA] = useState(String(initialA));
  const [saisieN, setSaisieN] = useState(String(initialN));
  const a = lireEntier(saisieA);
  const n = lireEntier(saisieN);
  const ok = a !== null && moduleValide(n);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-fh-sable bg-white p-4" aria-label="Division euclidienne">
      <h4 className="text-base font-semibold text-fh-bleu">1. Division euclidienne et classe de a</h4>
      <div className="flex flex-wrap gap-3">
        <Champ id={`${id}-a`} etiquette="Entier a (relatif)" valeur={saisieA} onChange={setSaisieA} invalide={a === null} />
        <Champ id={`${id}-n`} etiquette="Module n (≥ 1)" valeur={saisieN} onChange={setSaisieN} invalide={!moduleValide(n)} />
      </div>

      {!ok ? (
        <MessageEntree />
      ) : (
        (() => {
          const { quotient, reste } = divisionEuclidienne(a, n);
          return (
            <div className="flex flex-col gap-2 text-fh-bleu" aria-live="polite">
              <div className="overflow-x-auto text-lg">
                <Tex expr={`${a} = (${quotient}) \\times ${n} + ${reste}`} />
              </div>
              <ul className="flex flex-col gap-1 text-sm text-fh-ardoise">
                <li>
                  Quotient <Tex expr={`q = ${quotient}`} />
                </li>
                <li>
                  Reste <Tex expr={`r = ${reste}`} /> , avec <Tex expr={`0 \\leq ${reste} \\leq ${n - 1}`} />
                </li>
                <li>
                  Classe de a modulo n : <Tex expr={`${a} \\equiv ${reste} \\ [${n}]`} />
                </li>
              </ul>
              {a < 0 && (
                <p className="rounded-lg bg-fh-creme px-3 py-2 text-sm text-fh-ardoise">
                  Attention : même si a est négatif, le reste reste positif.
                </p>
              )}
            </div>
          );
        })()
      )}
    </section>
  );
}

function BlocTest({ initialA, initialB, initialN }: { initialA: number; initialB: number; initialN: number }) {
  const id = useId();
  const [saisieA, setSaisieA] = useState(String(initialA));
  const [saisieB, setSaisieB] = useState(String(initialB));
  const [saisieN, setSaisieN] = useState(String(initialN));
  const a = lireEntier(saisieA);
  const b = lireEntier(saisieB);
  const n = lireEntier(saisieN);
  const ok = a !== null && b !== null && moduleValide(n);

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-fh-sable bg-white p-4" aria-label="Test de congruence">
      <h4 className="text-base font-semibold text-fh-bleu">
        2. Test de congruence <Tex expr="a \equiv b \ [n]" />
      </h4>
      <div className="flex flex-wrap gap-3">
        <Champ id={`${id}-a`} etiquette="Entier a" valeur={saisieA} onChange={setSaisieA} invalide={a === null} />
        <Champ id={`${id}-b`} etiquette="Entier b" valeur={saisieB} onChange={setSaisieB} invalide={b === null} />
        <Champ id={`${id}-n`} etiquette="Module n (≥ 1)" valeur={saisieN} onChange={setSaisieN} invalide={!moduleValide(n)} />
      </div>

      {!ok ? (
        <MessageEntree />
      ) : (
        (() => {
          const t = testerCongruence(a, b, n);
          const couleur = t.congruents ? COULEUR_OK : COULEUR_KO;
          return (
            <div className="flex flex-col gap-2 rounded-xl bg-fh-creme px-4 py-3" aria-live="polite">
              <div className="flex flex-wrap items-center gap-2 text-base font-semibold" style={{ color: couleur }}>
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: couleur }}
                  aria-hidden="true"
                >
                  {t.congruents ? "✓" : "✗"}
                </span>
                <span>{t.congruents ? "Oui" : "Non"}</span>
                <Tex expr={`${a} ${t.congruents ? "\\equiv" : "\\not\\equiv"} ${b} \\ [${n}]`} />
              </div>
              <div className="flex flex-col gap-1 text-sm text-fh-ardoise">
                {t.congruents ? (
                  <>
                    <p>
                      Même reste dans la division par {n} : <Tex expr={`${a} \\equiv ${t.resteA} \\ [${n}]`} /> et{" "}
                      <Tex expr={`${b} \\equiv ${t.resteB} \\ [${n}]`} /> (reste commun {t.resteA}).
                    </p>
                    <p>
                      Et {n} divise <Tex expr={`${a} - ${entierEntreParentheses(b)}`} /> :{" "}
                      <Tex expr={`${a} - ${entierEntreParentheses(b)} = ${t.ecart} = ${entierEntreParentheses(t.facteur ?? 0)} \\times ${n}`} />.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Restes différents : <Tex expr={`${a} \\equiv ${t.resteA} \\ [${n}]`} /> et{" "}
                      <Tex expr={`${b} \\equiv ${t.resteB} \\ [${n}]`} />, avec <Tex expr={`${t.resteA} \\neq ${t.resteB}`} />.
                    </p>
                    <p>
                      Et {n} ne divise pas <Tex expr={`${a} - ${entierEntreParentheses(b)} = ${t.ecart}`} />.
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })()
      )}
    </section>
  );
}

export default function CalculateurCongruence({ data }: { data: CongruenceData }) {
  return (
    <div className="my-4 flex flex-col gap-4 rounded-2xl border border-fh-sable bg-white p-4">
      <h3 className="text-lg font-bold text-fh-bleu">Calculateur de congruence</h3>

      <aside className="rounded-xl border-l-4 border-fh-orange bg-fh-creme px-4 py-3 text-sm leading-relaxed text-fh-ardoise">
        Faire la division euclidienne de <Tex expr="a" /> par <Tex expr="n > 0" />, c&apos;est écrire{" "}
        <Tex expr="a = q \cdot n + r" /> avec <Tex expr="0 \leq r < n" />. Le reste <Tex expr="r" /> est toujours positif, même
        si <Tex expr="a" /> est négatif. Deux entiers <Tex expr="a" /> et <Tex expr="b" /> sont congrus modulo <Tex expr="n" />, noté{" "}
        <Tex expr="a \equiv b \ [n]" />, lorsqu&apos;ils ont le même reste dans la division par <Tex expr="n" /> (de façon équivalente,
        lorsque <Tex expr="n" /> divise <Tex expr="a - b" />).
      </aside>

      <BlocDivision initialA={data.a} initialN={data.n} />
      <BlocTest initialA={data.a} initialB={data.b} initialN={data.n} />
    </div>
  );
}
