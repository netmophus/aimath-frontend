"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Choix } from "@/components/labo/commun";
import { nombreFr } from "@/lib/accueil/mathsLabo";
import { aire, FONCTIONS_INTEGRALE, graduations, troncons, type IdIntegrale } from "@/lib/accueil/mathsLaboAvance";
import { BoutonReinitialiser, CadreSimulation, chemin, Curseur, Formule, repere, Tx, Valeur } from "./commun";
import { CadreGraphe } from "./GrapheMaths";

const W = 440;
const H = 210;
const MARGE = 34;
const TURQUOISE = "#0f8a8a";

const versPoints = (pts: [number, number][], R: ReturnType<typeof repere>): [number, number][] => pts.map(([x, y]) => [R.X(x), R.Y(y)]);

/** Un seul format pour toutes les valeurs affichées (graphes, panneaux, encarts) : au plus 3 décimales, virgule française. */
const n3 = (v: number) => nombreFr(v, 3);
/** Même nombre pour KaTeX : la virgule est protégée de l'espace TeX (« 1{,}125 »). */
const t3 = (v: number) => n3(v).replace(",", "{,}");

/**
 * Intégrale en deux temps. Étape 1 : l'aire sous la courbe de f entre 0 et x se remplit quand x avance.
 * Étape 2 (au clic) : cette aire est vue comme une fonction F de x, dont la pente en x vaut f(x).
 */
export default function SimulationIntegrale() {
  const [idF, setIdF] = useState<IdIntegrale>("carre");
  const fo = FONCTIONS_INTEGRALE.find((f) => f.id === idF) ?? FONCTIONS_INTEGRALE[0];
  const [x, setX] = useState<number>(fo.initial);
  const [revele, setRevele] = useState(false);
  const etapeB = useRef<HTMLDivElement>(null);
  const clip = useId();

  // Au clic sur « Révéler », l'étape 2 apparaît et vient dans le champ de vision.
  useEffect(() => {
    if (revele) etapeB.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [revele]);

  const xmax = fo.xmax;
  const fmax = Math.max(...troncons(fo.f, 0, xmax, -1e9, 1e9, 200).flat().map(([, y]) => y)) * 1.12;
  const Fmax = fo.F(xmax) * 1.12;
  const RH = repere(0, xmax, 0, fmax, W, H, MARGE);
  const RB = repere(0, xmax, 0, Fmax, W, H, MARGE);

  const courbeF = troncons(fo.f, 0, xmax, -1e9, 1e9, 200)[0];
  const courbeG = troncons(fo.F, 0, xmax, -1e9, 1e9, 200)[0];
  const partieF = courbeF.filter(([t]) => t <= x);
  const partieG = courbeG.filter(([t]) => t <= x);
  const air = aire(fo.f, x);
  const val = fo.F(x);
  const pente = fo.f(x);

  const polygone = [[0, 0] as [number, number], ...partieF, [x, fo.f(x)] as [number, number], [x, 0] as [number, number]];
  const gxH = graduations(0, xmax);

  // Tangente à la courbe de F au point (x ; F(x)) : pente f(x), tracée sur ±0,7 autour de x.
  const demi = 0.7;
  const tangente: [number, number][] = [
    [x - demi, val - pente * demi],
    [x + demi, val + pente * demi],
  ];

  function choisir(id: IdIntegrale) {
    const f = FONCTIONS_INTEGRALE.find((v) => v.id === id) ?? FONCTIONS_INTEGRALE[0];
    setIdF(id);
    setX(f.initial);
  }

  const curseur = (
    <Curseur
      nom={<Formule tex="x" />}
      valeurTexte={`x = ${nombreFr(x, 1)}`}
      min={0}
      max={xmax}
      pas={0.1}
      valeur={x}
      onChange={(v) => setX(Math.round(v * 10) / 10)}
      ariaLabel="Borne supérieure x de l'intégrale"
    />
  );

  return (
    <div className="flex flex-col gap-5">
      <Encart titre="Étape 1">
        <Tx>
          {"Intégrer $f$ de $0$ à $x$, noté $\\int_0^x f(t)\\,\\mathrm{d}t$, c'est mesurer l'AIRE entre la courbe de $f$, l'axe horizontal et la verticale en $x$. Plus $x$ avance, plus l'aire grandit."}
        </Tx>
      </Encart>

      <CadreSimulation
        titre="L'intégrale, c'est une aire"
        description="Déplace la borne avec le curseur : l'aire sous la courbe se remplit depuis 0 jusqu'à cette borne."
        formule={<Formule bloc tex={`\\int_0^x ${fo.fTex}\\,\\mathrm{d}t = ${fo.FTex}`} />}
        graphique={
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Aire sous la courbe de f entre 0 et ${nombreFr(x, 1)} : ${n3(air)}`}>
            <defs>
              <clipPath id={`${clip}h`}>
                <rect x={RH.X(0)} y={RH.Y(fmax)} width={RH.X(xmax) - RH.X(0)} height={RH.Y(0) - RH.Y(fmax)} />
              </clipPath>
            </defs>
            <CadreGraphe R={RH} largeur={W} hauteur={H} xmin={0} xmax={xmax} ymin={0} ymax={fmax} gx={gxH} gy={graduations(0, fmax, 3)} nomX="t" />
            <g clipPath={`url(#${clip}h)`}>
              <path d={`${chemin(versPoints(polygone, RH))} Z`} fill={TURQUOISE} fillOpacity={0.3} stroke={TURQUOISE} strokeWidth={1} />
              <path d={chemin(versPoints(courbeF, RH))} fill="none" className="stroke-fh-bleu" strokeWidth={2.4} />
            </g>
            <line x1={RH.X(x)} y1={RH.Y(0)} x2={RH.X(x)} y2={RH.Y(fo.f(x))} stroke={TURQUOISE} strokeWidth={2} />
            <circle cx={RH.X(x)} cy={RH.Y(fo.f(x))} r={4.5} className="fill-fh-bleu stroke-white" strokeWidth={1.2} />
            <text x={RH.X(0) + 6} y={RH.Y(fmax) + 14} className="fill-fh-bleu text-[12px] font-semibold">courbe de f</text>
            <text x={Math.min(RH.X(x) + 8, W - MARGE - 92)} y={RH.Y(0) - 10} fill="#0b6b6b" className="text-[12px] font-semibold">aire = {n3(air)}</text>
          </svg>
        }
        commandes={
          <>
            <Choix nom="Fonction f" options={FONCTIONS_INTEGRALE.map((f) => ({ cle: f.id, libelle: <Formule tex={f.libelleTex} />, aria: f.libelle }))} valeur={idF} onChoisir={choisir} />
            {curseur}
            <BoutonReinitialiser onClick={() => setX(fo.initial)} />
          </>
        }
        valeurs={
          <>
            <Valeur etiquette={<>Borne <Formule tex="x" /></>}>{nombreFr(x, 1)}</Valeur>
            <Valeur etiquette={<Tx>{"Aire sous $f$ de $0$ à $x$"}</Tx>}>{n3(air)}</Valeur>
          </>
        }
        commentaire={
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-fh-bleu">Calcul de l&apos;aire</p>
            <Formule bloc tex={`\\int_0^{${t3(x)}} ${fo.fTex}\\,\\mathrm{d}t = ${fo.FValeurTex(t3(x))} = ${t3(air)}`} />
          </div>
        }
      />

      {!revele && (
        <button
          type="button"
          onClick={() => setRevele(true)}
          aria-expanded={false}
          className="min-h-11 w-full rounded-2xl px-5 py-3 text-center text-sm font-semibold leading-snug text-white transition-colors hover:brightness-110 motion-reduce:transition-none sm:text-base"
          style={{ backgroundColor: "#0b6b6b" }}
        >
          <Tx>{"Révéler : et si on regardait cette aire comme une fonction de $x$ ?"}</Tx>
        </button>
      )}

      {revele && (
        <div ref={etapeB} className="apparition-etape flex flex-col gap-5">
          <CadreSimulation
            titre="L'aire devient une fonction F"
            description="L'aire dépend de la borne : c'est donc une fonction de cette borne. Voici sa courbe, avec sa tangente au point courant."
            formule={<Formule bloc tex={`F(x) = \\int_0^x f(t)\\,\\mathrm{d}t = ${fo.FTex}`} />}
            graphique={
              <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Courbe de F : F(${nombreFr(x, 1)}) = ${n3(val)}, pente de la tangente ${n3(pente)}`}>
                <defs>
                  <clipPath id={`${clip}b`}>
                    <rect x={RB.X(0)} y={RB.Y(Fmax)} width={RB.X(xmax) - RB.X(0)} height={RB.Y(0) - RB.Y(Fmax)} />
                  </clipPath>
                </defs>
                <CadreGraphe R={RB} largeur={W} hauteur={H} xmin={0} xmax={xmax} ymin={0} ymax={Fmax} gx={gxH} gy={graduations(0, Fmax, 3)} nomX="x" />
                <g clipPath={`url(#${clip}b)`}>
                  <path d={chemin(versPoints(courbeG, RB))} fill="none" className="stroke-fh-sable" strokeWidth={2.4} />
                  <path d={chemin(versPoints(partieG, RB))} fill="none" className="stroke-fh-bleu" strokeWidth={2.8} />
                  <path d={chemin(versPoints(tangente, RB))} fill="none" className="stroke-fh-orange" strokeWidth={2} />
                </g>
                <line x1={RB.X(0)} y1={RB.Y(val)} x2={RB.X(x)} y2={RB.Y(val)} stroke={TURQUOISE} strokeWidth={1.2} strokeDasharray="4 3" />
                <line x1={RB.X(x)} y1={RB.Y(0)} x2={RB.X(x)} y2={RB.Y(val)} stroke={TURQUOISE} strokeWidth={1.2} strokeDasharray="4 3" />
                <circle cx={RB.X(x)} cy={RB.Y(val)} r={5.5} className="fill-fh-orange stroke-white" strokeWidth={1.5} />
                <text x={RB.X(0) + 6} y={RB.Y(Fmax) + 14} className="fill-fh-bleu text-[12px] font-semibold">courbe de F</text>
                <text x={Math.min(RB.X(x) + 9, W - MARGE - 92)} y={Math.max(RB.Y(val) + 18, 26)} className="fill-fh-orange-fonce text-[12px] font-semibold">F = {n3(val)}</text>
                <text x={Math.min(RB.X(x) + 9, W - MARGE - 92)} y={Math.max(RB.Y(val) + 34, 42)} className="fill-fh-orange-fonce text-[12px]">pente = {n3(pente)}</text>
              </svg>
            }
            commandes={
              <>
                {curseur}
                <BoutonReinitialiser onClick={() => setX(fo.initial)} />
              </>
            }
            valeurs={
              <>
                <Valeur etiquette={<Tx>{"Aire sous $f$ de $0$ à $x$"}</Tx>}>{n3(air)}</Valeur>
                <Valeur etiquette={<Formule tex="F(x)" />}>{n3(val)}</Valeur>
                <Valeur etiquette={<>Pente de la tangente <Formule tex="= f(x)" /></>} large>{n3(pente)}</Valeur>
              </>
            }
            commentaire={
              <p className="leading-8">
                <Tx>{`À $x = ${t3(x)}$ : aire $= ${t3(air)} = F(${t3(x)}) = ${t3(val)}$. C'est le MÊME nombre : l'aire, vue comme une fonction de $x$, est $F(x)$.`}</Tx>
              </p>
            }
          />

          <Encart titre={<Tx>{"Pourquoi $F$ est une primitive de $f$ ($F' = f$)"}</Tx>}>
            <p className="leading-8">
              <Tx>
                {"Quand $x$ augmente d'un tout petit pas $\\mathrm{d}x$, l'aire gagne une fine bande : largeur $\\mathrm{d}x$, hauteur $f(x)$. L'aire ajoutée vaut donc à peu près $f(x) \\times \\mathrm{d}x$. Autrement dit, la vitesse à laquelle l'aire grandit est $f(x)$. Or cette vitesse de croissance, c'est la dérivée de $F$. D'où la relation fondamentale :"}
              </Tx>
            </p>
            <Formule bloc tex="F'(x) = f(x)" />
            <p className="mt-2 leading-8">
              <Tx>{`Ici, la pente de $F$ en $x = ${t3(x)}$ vaut $f(x) = ${fo.fxTex} = ${t3(pente)}$ : c'est exactement la hauteur de $f$ en $x$. C'est la relation $F'(x) = f(x)$.`}</Tx>
            </p>
            <p className="mt-2 font-semibold text-fh-bleu">
              <Tx>{"Là où $f$ est grande, $F$ monte vite ; là où $f$ est petite, $F$ monte lentement."}</Tx>
            </p>
          </Encart>
        </div>
      )}
    </div>
  );
}

/** Encadré pédagogique (bordure gauche orange, fond léger) : même style que « Le concept » des autres onglets. */
function Encart({ titre, children }: { titre: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border-l-4 border-fh-orange bg-fh-accent/60 p-4 sm:p-5">
      <p className="text-sm font-bold text-fh-orange-fonce">{titre}</p>
      <div className="mt-1.5 text-sm leading-relaxed text-fh-ardoise sm:text-base">{children}</div>
    </div>
  );
}
