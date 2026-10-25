"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

import { variationsFonction } from "@/lib/accueil/variationsFonction";
import TableauVariations from "@/components/TableauVariations";
import { branche, commentaireFonction, extremaFonction, FONCTION, nombreFr } from "@/lib/accueil/mathsLabo";
import { BoutonReinitialiser, CadreSimulation, chemin, Curseur, Formule, grad, repere, Tx, Valeur } from "./commun";

const L = 400;
const BORNE = 6;
const R = repere(-BORNE, BORNE, -BORNE, BORNE, L, L);
const GRADUATIONS = [-6, -4, -2, 2, 4, 6];

/** « = 2 » si le nombre est entier, sinon « ≈ 1,41 » (le signe de relation est inclus). */
const egalOuApprox = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? `= ${nombreFr(v, 0)}` : `≈ ${nombreFr(v, 2)}`);

/** f_a(x) = x + a/x : les deux branches sont tracées séparément (jamais reliées à travers x = 0). */
export default function SimulationFonction() {
  const [a, setA] = useState<number>(FONCTION.initial);
  const idClip = useId();

  const cheminPositif = useMemo(() => chemin(branche(a, 1, BORNE + 1).map(([x, y]) => [R.X(x), R.Y(y)])), [a]);
  const cheminNegatif = useMemo(() => chemin(branche(a, -1, BORNE + 1).map(([x, y]) => [R.X(x), R.Y(y)])), [a]);
  const extrema = extremaFonction(a);

  return (
    <CadreSimulation
      titre="Explore les asymptotes d'une fonction"
      description="Fais varier le paramètre et observe comment évoluent les deux branches de la courbe."
      formule={<Formule tex={"f_a(x) = x + \\dfrac{a}{x}, \\quad x \\neq 0"} />}
      graphique={
        <svg viewBox={`0 0 ${L} ${L}`} className="h-auto w-full" role="img" aria-label={`Courbe de f(x) = x + ${nombreFr(a, 1)}/x avec ses asymptotes`}>
          <defs>
            <clipPath id={idClip}>
              <rect x={R.marge} y={R.marge} width={L - 2 * R.marge} height={L - 2 * R.marge} />
            </clipPath>
          </defs>
          <rect x={R.marge} y={R.marge} width={L - 2 * R.marge} height={L - 2 * R.marge} className="fill-white stroke-fh-sable" />
          {GRADUATIONS.map((g) => (
            <g key={g}>
              <line x1={R.X(g)} y1={R.marge} x2={R.X(g)} y2={L - R.marge} className="stroke-fh-sable/70" strokeWidth={0.7} />
              <line x1={R.marge} y1={R.Y(g)} x2={L - R.marge} y2={R.Y(g)} className="stroke-fh-sable/70" strokeWidth={0.7} />
              <text x={R.X(g)} y={R.Y(0) + 13} textAnchor="middle" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
              <text x={R.X(0) - 5} y={R.Y(g) + 3} textAnchor="end" className="fill-fh-ardoise text-[9px]">{grad(g)}</text>
            </g>
          ))}
          <line x1={R.marge} y1={R.Y(0)} x2={L - R.marge} y2={R.Y(0)} className="stroke-fh-ardoise" strokeWidth={1} />
          <line x1={R.X(0)} y1={R.marge} x2={R.X(0)} y2={L - R.marge} className="stroke-fh-ardoise" strokeWidth={1} />

          <g clipPath={`url(#${idClip})`}>
            {/* asymptote oblique y = x */}
            <line x1={R.X(-BORNE)} y1={R.Y(-BORNE)} x2={R.X(BORNE)} y2={R.Y(BORNE)} className="stroke-fh-orange" strokeWidth={1.4} strokeDasharray="6 4" />
            {/* asymptote verticale x = 0 (seulement si a ≠ 0) */}
            {a !== 0 && <line x1={R.X(0)} y1={R.marge} x2={R.X(0)} y2={L - R.marge} className="stroke-fh-bleu-vif" strokeWidth={1.4} strokeDasharray="6 4" />}
            <path d={cheminPositif} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} strokeLinejoin="round" />
            <path d={cheminNegatif} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} strokeLinejoin="round" />
          </g>

          {a === 0 && <circle cx={R.X(0)} cy={R.Y(0)} r={4.5} className="fill-white stroke-fh-bleu" strokeWidth={2} data-testid="point-exclu" />}
          {extrema && (
            <g data-testid="extrema">
              <circle cx={R.X(extrema.racine)} cy={R.Y(extrema.valeur)} r={4.5} className="fill-fh-orange stroke-white" strokeWidth={1.5} />
              <circle cx={R.X(-extrema.racine)} cy={R.Y(-extrema.valeur)} r={4.5} className="fill-fh-orange stroke-white" strokeWidth={1.5} />
              <text x={R.X(extrema.racine) + 6} y={R.Y(extrema.valeur) + 16} className="fill-fh-orange-fonce text-[10px] font-semibold [paint-order:stroke] stroke-white stroke-[3px]">min</text>
              <text x={R.X(-extrema.racine) - 6} y={R.Y(-extrema.valeur) - 10} textAnchor="end" className="fill-fh-orange-fonce text-[10px] font-semibold [paint-order:stroke] stroke-white stroke-[3px]">max</text>
            </g>
          )}
          <text x={R.X(BORNE) - 4} y={R.Y(BORNE) + 26} textAnchor="end" className="fill-fh-orange-fonce text-[10px] font-semibold [paint-order:stroke] stroke-white stroke-[3px]">y = x</text>
          {a !== 0 && <text x={R.X(0) - 5} y={R.marge + 28} textAnchor="end" className="fill-fh-bleu-vif text-[10px] font-semibold [paint-order:stroke] stroke-white stroke-[3px]">x = 0</text>}
        </svg>
      }
      commandes={
        <>
          <Curseur
            nom={<Formule tex="a" />}
            valeurTexte={`a = ${nombreFr(a, 1)}`}
            min={FONCTION.min}
            max={FONCTION.max}
            pas={FONCTION.pas}
            valeur={a}
            onChange={setA}
            ariaLabel="Paramètre a de la fonction"
          />
          <BoutonReinitialiser onClick={() => setA(FONCTION.initial)} />
        </>
      }
      valeurs={
        <>
          <Valeur etiquette="Fonction" large>
            <Formule tex={a === 0 ? "f(x) = x \\quad (x \\neq 0)" : `f(x) = x ${a < 0 ? "-" : "+"} \\dfrac{${nombreFr(Math.abs(a), 1).replace(",", "{,}")}}{x}`} />
          </Valeur>
          <Valeur etiquette="Asymptote oblique">y = x</Valeur>
          <Valeur etiquette="Asymptote verticale">{a !== 0 ? "x = 0" : "aucune"}</Valeur>
          <Valeur etiquette={extrema ? "Minimum sur ]0 ; +∞[" : "Minimum et maximum"} large>
            {extrema ? `x ${egalOuApprox(extrema.racine)} ; f(x) ${egalOuApprox(extrema.valeur)}` : "aucun minimum ni maximum"}
          </Valeur>
          {extrema && (
            <Valeur etiquette="Maximum sur ]−∞ ; 0[" large>
              {`x ${egalOuApprox(-extrema.racine)} ; f(x) ${egalOuApprox(-extrema.valeur)}`}
            </Valeur>
          )}
        </>
      }
      commentaire={a > 0 ? <ResumeBranches /> : <Tx>{commentaireFonction(a)}</Tx>}
      bas={a > 0 ? <EtudeFonction a={a} /> : <NoteEtude />}
    />
  );
}

/** Résumé court pour a > 0 (encadré à côté du graphique). */
function ResumeBranches() {
  return (
    <>
      <p>
        <Tx>{"Pour $a > 0$, $f$ n'est pas définie en $x = 0$ : deux branches séparées."}</Tx>
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>
          <Tx>{"Asymptote verticale : $x = 0$"}</Tx>
        </li>
        <li>
          <Tx>{"Asymptote oblique : $y = x$ (écart $= \\dfrac{a}{x} \\to 0$)"}</Tx>
        </li>
        <li>
          <Tx>{"Minimum sur $]0\\,;+\\infty[$ : en $x = \\sqrt{a}$, valeur $2\\sqrt{a}$"}</Tx>
        </li>
        <li>
          <Tx>{"Maximum sur $]-\\infty\\,;0[$ : en $x = -\\sqrt{a}$, valeur $-2\\sqrt{a}$"}</Tx>
        </li>
        <li>
          <Tx>{"Fonction impaire : $f(-x) = -f(x)$"}</Tx>
        </li>
      </ul>
    </>
  );
}

/** Étape de l'étude en accordéon : titre cliquable (numéro en pastille, chevron) et contenu masqué tant qu'elle est fermée. */
function Etape({ numero, titre, ouverte, onBascule, children }: { numero: number; titre: string; ouverte: boolean; onBascule: () => void; children: ReactNode }) {
  const idContenu = useId();
  return (
    <section className="overflow-hidden rounded-lg bg-white/70">
      <h4>
        <button
          type="button"
          onClick={onBascule}
          aria-expanded={ouverte}
          aria-controls={idContenu}
          className="flex w-full items-center gap-3 p-3 text-left font-bold text-fh-bleu transition-colors hover:bg-fh-accent/60 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-fh-orange sm:px-4"
        >
          <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fh-bleu text-sm text-white">
            {numero}
          </span>
          <span className="sr-only">{numero}. </span>
          <span className="flex-1">{titre}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-5 w-5 shrink-0 fill-none stroke-fh-orange stroke-2 transition-transform ${ouverte ? "rotate-180" : ""}`}>
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h4>
      {ouverte && (
        <div id={idContenu} className="px-3 pb-4 pt-1 leading-8 sm:px-4 sm:pl-14">
          {children}
        </div>
      )}
    </section>
  );
}

/** « = 2 » si le nombre est entier, sinon « ≈ 1,41 » (pour la note au-dessus du tableau, en KaTeX). */
const egalOuApproxTex = (v: number) => (Math.abs(v - Math.round(v)) < 1e-9 ? `= ${nombreFr(v, 0)}` : `\\approx ${nombreFr(v, 2).replace(",", "{,}")}`);

/** Étude complète de f(x) = x + a/x pour a > 0, en 6 étapes dépliables, avec le tableau de variations (encadré pleine largeur). */
function EtudeFonction({ a }: { a: number }) {
  const [ouvertes, setOuvertes] = useState<number[]>([]);
  const bascule = (n: number) => setOuvertes((o) => (o.includes(n) ? o.filter((k) => k !== n) : [...o, n]));
  const etape = (numero: number, titre: string, contenu: ReactNode) => (
    <Etape numero={numero} titre={titre} ouverte={ouvertes.includes(numero)} onBascule={() => bascule(numero)}>
      {contenu}
    </Etape>
  );
  const r = Math.sqrt(a);
  const aTex = nombreFr(a, 1).replace(",", "{,}");
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-bold text-fh-bleu">
        <Tx>{"Étude de la fonction $f(x) = x + \\dfrac{a}{x}$ pour $a > 0$"}</Tx>
      </p>
      <p className="mb-1 text-sm text-fh-ardoise">Clique sur une étape pour l&apos;ouvrir ou la fermer.</p>

      {etape(
        1,
        "Ensemble de définition",
        <>
          <Tx>{"La fonction $f(x) = x + \\dfrac{a}{x}$ n'est pas définie en $x = 0$ (on ne peut pas diviser par zéro). Donc :"}</Tx>
          <Formule bloc tex={"D_f = \\mathbb{R}^{*} = \\,]-\\infty\\,;0[\\, \\cup \\,]0\\,;+\\infty["} />
        </>,
      )}

      {etape(
        2,
        "Parité",
        <>
          <Tx>{"Pour tout $x$ de $D_f$, le nombre $-x$ est aussi dans $D_f$ et :"}</Tx>
          <Formule bloc tex={"f(-x) = -x + \\dfrac{a}{-x} = -\\left(x + \\dfrac{a}{x}\\right) = -f(x)"} />
          <Tx>{"$f$ est IMPAIRE : sa courbe est symétrique par rapport à l'origine $O$. On peut donc étudier $f$ sur $]0\\,;+\\infty[$, puis compléter par symétrie."}</Tx>
        </>,
      )}

      {etape(
        3,
        "Dérivée et signe",
        <>
          <Tx>{"$f$ est dérivable sur $D_f$ et :"}</Tx>
          <Formule bloc tex={"f'(x) = 1 - \\dfrac{a}{x^2} = \\dfrac{x^2 - a}{x^2}"} />
          <Tx>{"Comme $x^2 > 0$, le signe de $f'(x)$ est celui de $x^2 - a$. Pour $a > 0$ :"}</Tx>
          <Formule bloc tex={"f'(x) > 0 \\iff |x| > \\sqrt{a} \\qquad f'(x) < 0 \\iff |x| < \\sqrt{a}"} />
          <Tx>{"La dérivée s'annule en $x = -\\sqrt{a}$ et en $x = \\sqrt{a}$."}</Tx>
        </>,
      )}

      {etape(
        4,
        "Limites et asymptotes",
        <>
          <Tx>{"En $0$ :"}</Tx>
          <Formule bloc tex={"\\lim_{x \\to 0^{+}} f(x) = +\\infty \\qquad \\lim_{x \\to 0^{-}} f(x) = -\\infty"} />
          <Tx>{"La droite $x = 0$ est donc asymptote verticale."}</Tx>
          <p className="mt-2">
            <Tx>{"En $+\\infty$ et en $-\\infty$ :"}</Tx>
          </p>
          <Formule bloc tex={"f(x) - x = \\dfrac{a}{x} \\longrightarrow 0 \\quad (x \\to \\pm\\infty)"} />
          <Tx>{"La droite $y = x$ est donc asymptote oblique."}</Tx>
        </>,
      )}

      {etape(
        5,
        "Minimum et maximum",
        <>
          <Tx>{"D'après le signe de $f'$ :"}</Tx>
          <ul className="mt-1 flex list-disc flex-col gap-2 pl-5">
            <li className="pl-1">
              <Tx>{"sur $]0\\,;+\\infty[$, $f$ décroît sur $]0\\,;\\sqrt{a}[$ puis croît sur $]\\sqrt{a}\\,;+\\infty[$ : $f$ admet un MINIMUM sur $]0\\,;+\\infty[$, atteint en $x = \\sqrt{a}$, de valeur"}</Tx>
              <Formule bloc tex={"f(\\sqrt{a}) = \\sqrt{a} + \\dfrac{a}{\\sqrt{a}} = 2\\sqrt{a}"} />
            </li>
            <li className="pl-1">
              <Tx>{"sur $]-\\infty\\,;0[$, $f$ croît sur $]-\\infty\\,;-\\sqrt{a}[$ puis décroît sur $]-\\sqrt{a}\\,;0[$ : $f$ admet un MAXIMUM sur $]-\\infty\\,;0[$, atteint en $x = -\\sqrt{a}$, de valeur"}</Tx>
              <Formule bloc tex={"f(-\\sqrt{a}) = -f(\\sqrt{a}) = -2\\sqrt{a}"} />
            </li>
          </ul>
          <div className="mt-2 rounded-lg border-l-4 border-fh-orange bg-fh-accent p-3" role="note">
            <p className="font-bold text-fh-orange-fonce">À noter</p>
            <p className="mt-1">
              <Tx>{"Sur l'intervalle $]0\\,;+\\infty[$, $f$ admet un minimum égal à $2\\sqrt{a}$. Sur l'intervalle $]-\\infty\\,;0[$, $f$ admet un maximum égal à $-2\\sqrt{a}$. Sur l'ensemble de définition tout entier, $f$ n'admet ni maximum ni minimum, car $\\lim_{x \\to +\\infty} f(x) = +\\infty$ et $\\lim_{x \\to -\\infty} f(x) = -\\infty$."}</Tx>
            </p>
          </div>
        </>,
      )}

      {etape(
        6,
        "Tableau de variations",
        <>
          <p className="mb-2 text-sm">
            <Tx>{`Avec $a = ${aTex}$ : $\\sqrt{a} ${egalOuApproxTex(r)}$ et $2\\sqrt{a} ${egalOuApproxTex(2 * r)}$. Le tableau suit le curseur $a$.`}</Tx>
          </p>
          <TableauVariations data={variationsFonction(a)} espace />
        </>,
      )}
    </div>
  );
}

/** Note affichée quand l'étude détaillée ne s'applique pas (a ≤ 0). */
function NoteEtude() {
  return (
    <p className="leading-8">
      <span className="font-bold text-fh-bleu">Étude détaillée pour a &gt; 0. </span>
      <Tx>{"Choisis une valeur de $a$ strictement positive avec le curseur pour afficher l'étude de fonction en 6 étapes et son tableau de variations."}</Tx>
    </p>
  );
}
