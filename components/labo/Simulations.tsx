"use client";

import { useId, useState } from "react";

import { Curseur, Formule, Valeur } from "@/components/accueil/commun";
import { Sci } from "@/components/EchellePh";
import { couleurPapier } from "@/components/ExperiencesChimie";
import { concentrationH3O, concentrationOH, natureSolution } from "@/lib/chimiePh";
import { alea, Bouton, Choix, COULEURS, Planche, variables, virgule } from "./commun";

const T = "transition-all duration-[900ms] ease-in-out motion-reduce:transition-none";
const COULEUR_NATURE = { Acide: "text-red-700", Neutre: "text-green-700", Basique: "text-blue-800" } as const;

/* ============================================================================================ 2. Échelle de pH */

/** Nombre d'ions dessinés (constant, lisible) : on ne représente pas les vraies concentrations, seulement le bon rapport. */
const NB_PARTICULES_PH = 20;
const COLONNES_PH = 5;
const LIGNES_PH = 4;

/** Part d'ions H₃O⁺ (rouges) : 50 % à pH 7, 90 % à pH 1 et moins, 10 % à pH 13 et plus, variation linéaire et symétrique. */
export const partOxonium = (ph: number): number => Math.min(0.9, Math.max(0.1, 0.5 + ((7 - ph) / 6) * 0.4));

/**
 * Case de la grille (5 × 4) occupée par l'ion i. L'ordre « i × 7 modulo 20 » éparpille les ions successifs : les rouges
 * et les bleus sont mélangés dans tout le bécher, sans se chevaucher, et un ion garde sa place quand le pH change
 * (seule sa couleur bascule).
 */
const caseIon = (i: number) => (i * 7) % NB_PARTICULES_PH;

export function SimulationPh() {
  const [ph, setPh] = useState(7);
  const dix = Math.round(ph * 10);
  const nature = natureSolution(dix);
  const nH = Math.round(NB_PARTICULES_PH * partOxonium(ph)); // représentation qualitative : pH 7 → autant de rouges que de bleus
  const nOH = NB_PARTICULES_PH - nH;
  const liquide = couleurPapier(ph);

  return (
    <div className="grid gap-6 min-[760px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[760px]:items-start">
      <Planche>
        <svg viewBox="0 0 260 260" className="mx-auto h-auto w-full max-w-[320px]" role="img" aria-label={`Bécher de pH ${virgule(ph)} contenant ${nH} ions oxonium et ${nOH} ions hydroxyde, représentation qualitative`}>
          <defs>
            <clipPath id="clip-ph">
              <path d="M40 40 V225 a12 12 0 0 0 12 12 H208 a12 12 0 0 0 12 -12 V40 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#clip-ph)">
            <rect x={40} y={78} width={180} height={170} className={T} fill={liquide} opacity={0.88} />
            {Array.from({ length: NB_PARTICULES_PH }, (_, i) => {
              const oxonium = i < nH;
              const c = caseIon(i);
              const x = 56 + ((c % COLONNES_PH) + 0.5) * (148 / COLONNES_PH) + (alea(i, 1) - 0.5) * 8;
              const y = 98 + (Math.floor(c / COLONNES_PH) + 0.5) * (122 / LIGNES_PH) + (alea(i, 2) - 0.5) * 8;
              return (
                <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                  <circle r={9} className={`${T} particule`} style={variables({ "--duree": `${3.2 + alea(i, 3) * 2}s`, "--ax": `${(alea(i, 4) - 0.5) * 14}px`, "--ay": `${(alea(i, 5) - 0.5) * 14}px`, "--bx": `${(alea(i, 6) - 0.5) * 14}px`, "--by": `${(alea(i, 7) - 0.5) * 14}px`, "--cx": `${(alea(i, 8) - 0.5) * 14}px`, "--cy": `${(alea(i, 9) - 0.5) * 14}px` })} fill={oxonium ? "#fdd0b1" : "#c3cbf5"} stroke={oxonium ? COULEURS.oxonium : COULEURS.hydroxyde} strokeWidth={2.2} />
                </g>
              );
            })}
          </g>
          <path d="M40 30 V225 a12 12 0 0 0 12 12 H208 a12 12 0 0 0 12 -12 V30" fill="none" stroke="#0f172a" strokeWidth={3} />
          <text x={130} y={20} textAnchor="middle" fontSize={13} fontWeight={700} fill={COULEURS.oxonium}>
            ● H₃O⁺ <tspan fill={COULEURS.hydroxyde}> ● OH⁻</tspan>
          </text>
          <text x={130} y={256} textAnchor="middle" fontSize={10} className="fill-fh-ardoise">
            Représentation qualitative
          </text>
        </svg>
      </Planche>

      <div className="flex min-w-0 flex-col gap-4">
        <Planche>
          <div className="relative px-1 pb-1 pt-6">
            <div className={`absolute top-0 -translate-x-1/2 text-sm font-bold text-fh-bleu ${T}`} style={{ left: `calc(${(ph / 14) * 100}% )` }} aria-hidden>
              ▼
            </div>
            <div className="h-6 w-full rounded-full" style={{ background: `linear-gradient(to right, ${[0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((p) => `${couleurPapier(p)} ${(p / 14) * 100}%`).join(", ")})` }} aria-hidden />
            <div className="relative mt-1 h-4 text-xs text-fh-ardoise" aria-hidden>
              {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((p) => (
                <span key={p} className="absolute -translate-x-1/2" style={{ left: `${(p / 14) * 100}%` }}>
                  {p}
                </span>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs font-semibold" aria-hidden>
              <span className="text-red-700">Acide</span>
              <span className="text-green-700">Neutre</span>
              <span className="text-blue-800">Basique</span>
            </div>
          </div>
        </Planche>

        <Curseur nom="pH de la solution" valeurTexte={`pH = ${virgule(ph)}`} min={0} max={14} pas={0.1} valeur={ph} onChange={setPh} ariaLabel="pH de la solution" />

        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Valeur etiquette="Concentration en ions oxonium">
            <Sci x={concentrationH3O(dix)} /> mol/L
          </Valeur>
          <Valeur etiquette="Concentration en ions hydroxyde">
            <Sci x={concentrationOH(dix)} /> mol/L
          </Valeur>
          <Valeur etiquette="Nature" large>
            <span className={COULEUR_NATURE[nature]}>{nature}</span>
            <span className="ml-2 text-xs font-normal text-fh-ardoise">à 25 °C</span>
          </Valeur>
        </dl>
      </div>
    </div>
  );
}

/* ============================================================================================ 3. Prédominance */

const COUPLES = {
  ethanoique: { libelle: "Acide éthanoïque", AH: "CH₃COOH", A: "CH₃COO⁻", tex: "\\mathrm{CH_3COOH\\,/\\,CH_3COO^-}", pKa: 4.8 },
  methanoique: { libelle: "Acide méthanoïque", AH: "HCOOH", A: "HCOO⁻", tex: "\\mathrm{HCOOH\\,/\\,HCOO^-}", pKa: 3.8 },
  ammonium: { libelle: "Ion ammonium", AH: "NH₄⁺", A: "NH₃", tex: "\\mathrm{NH_4^+\\,/\\,NH_3}", pKa: 9.2 },
} as const;
type CleCouple = keyof typeof COUPLES;

export function SimulationPredominance() {
  const [cle, setCle] = useState<CleCouple>("ethanoique");
  const [ph, setPh] = useState(4.8);
  const c = COUPLES[cle];
  const rapport = Math.pow(10, ph - c.pKa); // [A⁻] / [AH]
  const fracA = rapport / (1 + rapport);
  const nA = Math.round(20 * fracA);
  const pct = (x: number) => `${virgule(x * 100, x * 100 < 10 || x * 100 > 90 ? 1 : 0)} %`;
  const dominante = Math.abs(ph - c.pKa) < 0.05 ? "Les deux formes en quantités égales" : ph < c.pKa ? `${c.AH} prédomine (forme acide)` : `${c.A} prédomine (forme basique)`;

  return (
    <div className="flex flex-col gap-5">
      <Choix<CleCouple>
        nom="Couple acide-base"
        valeur={cle}
        onChoisir={(k) => {
          setCle(k);
          setPh(COUPLES[k].pKa);
        }}
        options={(Object.keys(COUPLES) as CleCouple[]).map((k) => ({ cle: k, libelle: <Formule tex={COUPLES[k].tex} />, aria: `${COUPLES[k].AH} / ${COUPLES[k].A}` }))}
      />

      <Planche>
        <svg viewBox="0 14 460 170" className="mx-auto h-auto w-full max-w-[640px]" role="img" aria-label={`Diagramme de prédominance du couple ${c.AH} ${c.A}, pKa ${c.pKa}, pH ${virgule(ph)}`}>
          <rect x={20} y={70} width={(c.pKa / 14) * 420} height={34} rx={8} fill={COULEURS.oxonium} opacity={0.9} />
          <rect x={20 + (c.pKa / 14) * 420} y={70} width={420 - (c.pKa / 14) * 420} height={34} rx={8} fill={COULEURS.hydroxyde} opacity={0.9} />
          <text x={20 + (c.pKa / 28) * 420} y={92} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">
            {c.AH}
          </text>
          <text x={20 + (c.pKa / 14) * 420 + (420 - (c.pKa / 14) * 420) / 2} y={92} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">
            {c.A}
          </text>
          {[0, 2, 4, 6, 8, 10, 12, 14].map((g) => (
            <g key={g}>
              <line x1={20 + (g / 14) * 420} y1={106} x2={20 + (g / 14) * 420} y2={112} stroke="#0f172a" />
              <text x={20 + (g / 14) * 420} y={126} textAnchor="middle" fontSize={11} className="fill-fh-ardoise">
                {g}
              </text>
            </g>
          ))}
          <text x={240} y={150} textAnchor="middle" fontSize={11} className="fill-fh-ardoise">
            pH
          </text>
          {/* pKa */}
          <line x1={20 + (c.pKa / 14) * 420} y1={38} x2={20 + (c.pKa / 14) * 420} y2={112} stroke="#fff" strokeWidth={3} />
          <text x={20 + (c.pKa / 14) * 420} y={32} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-fh-orange-fonce">
            pKa = {virgule(c.pKa)}
          </text>
          {/* pH courant */}
          <g className={T} style={{ transform: `translateX(${(ph / 14) * 420}px)` }}>
            <path d="M20 66 l-8 -14 h16 Z" className="fill-fh-bleu" />
            <line x1={20} y1={66} x2={20} y2={112} className="stroke-fh-bleu" strokeWidth={2} strokeDasharray="3 3" />
          </g>
          <text x={20} y={172} fontSize={11} className="fill-fh-ardoise">
            Acide : pH &lt; pKa
          </text>
          <text x={440} y={172} textAnchor="end" fontSize={11} className="fill-fh-ardoise">
            Base : pH &gt; pKa
          </text>
        </svg>
      </Planche>

      <div className="grid gap-6 min-[760px]:grid-cols-2 min-[760px]:items-start">
        <Planche>
          <p className="mb-2 text-sm font-semibold text-fh-bleu">Vingt entités du couple</p>
          <div className="grid grid-cols-10 gap-1.5" aria-hidden>
            {Array.from({ length: 20 }, (_, i) => (
              <span key={i} className={`h-6 rounded-full border-2 ${T}`} style={{ borderColor: i < 20 - nA ? COULEURS.oxonium : COULEURS.hydroxyde, background: i < 20 - nA ? "#ffedd5" : "#e0e7ff" }} />
            ))}
          </div>
          <div className="mt-3 flex h-5 overflow-hidden rounded-full border border-fh-sable" aria-hidden>
            <div className={T} style={{ width: `${(1 - fracA) * 100}%`, background: COULEURS.oxonium }} />
            <div className={T} style={{ width: `${fracA * 100}%`, background: COULEURS.hydroxyde }} />
          </div>
          <div className="mt-1 flex justify-between text-xs font-semibold">
            <span style={{ color: COULEURS.oxonium }}>
              {c.AH} : {pct(1 - fracA)}
            </span>
            <span style={{ color: COULEURS.hydroxyde }}>
              {c.A} : {pct(fracA)}
            </span>
          </div>
        </Planche>

        <div className="flex min-w-0 flex-col gap-4">
          <Curseur nom="pH de la solution" valeurTexte={`pH = ${virgule(ph)}`} min={0} max={14} pas={0.1} valeur={ph} onChange={setPh} ariaLabel="pH de la solution" />
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Valeur etiquette={<Formule tex={"\\dfrac{[\\mathrm{A^-}]}{[\\mathrm{AH}]}"} />}>{rapport >= 1000 || rapport < 0.01 ? <Sci x={rapport} /> : virgule(rapport, rapport < 1 ? 2 : 1)}</Valeur>
            <Valeur etiquette={<Formule tex={"\\mathrm{pH} - \\mathrm{p}K_a"} />}>{virgule(ph - c.pKa)}</Valeur>
            <Valeur etiquette="Espèce prédominante" large>
              {dominante}
            </Valeur>
          </dl>
          <Bouton onClick={() => setPh(c.pKa)}>Placer le pH sur le pKa</Bouton>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================================ 4. Avancement */

export function SimulationAvancement() {
  const [nH2, setNH2] = useState(4);
  const [nO2, setNO2] = useState(3);
  const [x, setX] = useState(0);
  const xH2 = nH2 / 2;
  const xO2 = nO2 / 1;
  const xmax = Math.min(xH2, xO2);
  const xe = Math.min(x, xmax);
  const limitant = xH2 < xO2 ? "le dihydrogène" : xO2 < xH2 ? "le dioxygène" : "aucun : mélange stœchiométrique";
  const rest = { H2: nH2 - 2 * xe, O2: nO2 - xe, H2O: 2 * xe };
  const echelle = Math.max(nH2, nO2, 2 * xmax, 1);
  const lignes = [
    { nom: "H₂", init: nH2, val: rest.H2, couleur: COULEURS.hydroxyde },
    { nom: "O₂", init: nO2, val: rest.O2, couleur: COULEURS.oxonium },
    { nom: "H₂O", init: 0, val: rest.H2O, couleur: "#0ea5e9" },
  ];
  const fini = xe >= xmax - 1e-9 && xmax > 0;

  return (
    <div className="grid gap-6 min-[760px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[760px]:items-start">
      <Planche>
        <p className="mb-3 text-sm font-semibold text-fh-bleu">
          Quantités de matière (mol) {fini ? <span className="text-green-700">: état final atteint</span> : null}
        </p>
        <div className="flex flex-col gap-4">
          {lignes.map((l) => (
            <div key={l.nom}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-bold" style={{ color: l.couleur }}>
                  {l.nom}
                </span>
                <span className="font-semibold text-fh-bleu">{virgule(l.val, 2)} mol</span>
              </div>
              <div className="relative h-7 overflow-hidden rounded-lg bg-fh-creme">
                <div className={`h-full rounded-lg ${T}`} style={{ width: `${(l.val / echelle) * 100}%`, background: l.couleur }} />
                {l.init > 0 && <div className="absolute inset-y-0 border-r-2 border-dashed border-fh-ardoise/50" style={{ left: `${(l.init / echelle) * 100}%` }} title="quantité initiale" />}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-fh-ardoise">Le trait pointillé marque la quantité initiale du réactif.</p>
      </Planche>

      <div className="flex min-w-0 flex-col gap-4">
        <Curseur nom="Dihydrogène au départ" valeurTexte={`${virgule(nH2, 1)} mol`} min={0.5} max={8} pas={0.5} valeur={nH2} onChange={setNH2} ariaLabel="Quantité initiale de dihydrogène en moles" />
        <Curseur nom="Dioxygène au départ" valeurTexte={`${virgule(nO2, 1)} mol`} min={0.5} max={8} pas={0.5} valeur={nO2} onChange={setNO2} ariaLabel="Quantité initiale de dioxygène en moles" />
        <Curseur nom="Avancement x" valeurTexte={`${virgule(xe, 2)} mol`} min={0} max={xmax} pas={0.05} valeur={xe} onChange={setX} ariaLabel="Avancement de la réaction en moles" />
        <div className="flex flex-wrap gap-2">
          <Bouton principal onClick={() => setX(xmax)}>
            Faire réagir
          </Bouton>
          <Bouton onClick={() => setX(0)}>Réinitialiser</Bouton>
        </div>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Valeur etiquette="Avancement maximal">{virgule(xmax, 2)} mol</Valeur>
          <Valeur etiquette="Réactif limitant">{limitant}</Valeur>
        </dl>
      </div>
    </div>
  );
}

/* ============================================================================================ 5. Dilution */

export function SimulationDilution() {
  const idMere = useId();
  const idFiole = useId();
  const [c1, setC1] = useState(0.5);
  const [v1, setV1] = useState(20);
  const [v2, setV2] = useState(200);
  const v2eff = Math.max(v2, v1 + 10);
  const c2 = (c1 * v1) / v2eff;
  const facteur = v2eff / v1;
  const eau = v2eff - v1;
  const teinte = (c: number) => `rgba(37, 99, 235, ${Math.min(0.95, 0.1 + 0.9 * (c / 1))})`; // sulfate de cuivre / solution colorée : plus concentrée, plus foncée
  const N = Math.max(8, Math.min(36, Math.round((c1 * v1) / 0.6))); // la même quantité de matière avant et après : N entités dans les deux schémas
  const hautMere = 232 - (v1 / 50) * 110;
  const hautFiole = 232 - (v2eff / 500) * 150;

  return (
    <div className="grid gap-6 min-[760px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[760px]:items-start">
      <Planche>
        <svg viewBox="0 0 470 292" className="h-auto w-full" role="img" aria-label={`Dilution : ${virgule(v1, 0)} mL de solution à ${virgule(c1, 2)} mol/L complétés avec de l'eau jusqu'à ${virgule(v2eff, 0)} mL, concentration finale ${virgule(c2, 3)} mol/L`}>
          <defs>
            <clipPath id={idMere}>
              <path d="M40 100 V225 a10 10 0 0 0 10 10 H150 a10 10 0 0 0 10 -10 V100 Z" />
            </clipPath>
            <clipPath id={idFiole}>
              <path d="M342 28 V76 C300 90 292 116 292 156 V208 a28 28 0 0 0 28 28 H384 a28 28 0 0 0 28 -28 V156 C412 116 404 90 362 76 V28 Z" />
            </clipPath>
          </defs>
          {/* solution mère */}
          <g clipPath={`url(#${idMere})`}>
            <rect x={36} y={60} width={128} height={190} className={T} fill={teinte(c1)} style={{ transform: `translateY(${hautMere - 60}px)` }} />
            {Array.from({ length: N }, (_, i) => (
              <circle key={i} cx={52 + alea(i, 11) * 96} cy={hautMere + 12 + alea(i, 12) * (232 - hautMere - 22)} r={4.5} fill="#1e3a8a" className={`${T} particule`} style={variables({ "--duree": `${3 + alea(i, 3) * 2}s`, "--ax": "4px", "--ay": "-3px", "--bx": "-3px", "--by": "4px", "--cx": "3px", "--cy": "3px" })} />
            ))}
          </g>
          <path d="M40 90 V225 a10 10 0 0 0 10 10 H150 a10 10 0 0 0 10 -10 V90" fill="none" stroke="#0f172a" strokeWidth={3} />
          <text x={100} y={262} textAnchor="middle" fontSize={17} fontWeight={700} className="fill-fh-bleu">
            Solution mère
          </text>
          <text x={100} y={276} textAnchor="middle" fontSize={15} className="fill-fh-ardoise">
            {virgule(c1, 2)} mol/L · {virgule(v1, 0)} mL
          </text>
          {/* flèche : on prélève V1 puis on complète avec de l'eau */}
          <path d="M172 150 H274" stroke={COULEURS.oxonium} strokeWidth={4} fill="none" />
          <path d="M270 140 l16 10 l-16 10 Z" fill={COULEURS.oxonium} />
          <text x={226} y={134} textAnchor="middle" fontSize={15} fontWeight={700} className="fill-fh-orange-fonce">
            on prélève {virgule(v1, 0)} mL
          </text>
          <text x={226} y={174} textAnchor="middle" fontSize={15} fontWeight={700} fill="#0284c7">
            + {virgule(eau, 0)} mL d&apos;eau
          </text>
          {/* fiole jaugée */}
          <g clipPath={`url(#${idFiole})`}>
            <rect x={286} y={20} width={132} height={230} className={T} fill={teinte(c2)} style={{ transform: `translateY(${hautFiole - 20}px)` }} />
            {Array.from({ length: N }, (_, i) => (
              <circle key={i} cx={304 + alea(i, 21) * 92} cy={hautFiole + 12 + alea(i, 22) * (232 - hautFiole - 22)} r={4.5} fill="#1e3a8a" className={`${T} particule`} style={variables({ "--duree": `${3 + alea(i, 3) * 2}s`, "--ax": "5px", "--ay": "-4px", "--bx": "-4px", "--by": "5px", "--cx": "4px", "--cy": "3px" })} />
            ))}
          </g>
          <path d="M342 20 V76 C300 90 292 116 292 156 V208 a28 28 0 0 0 28 28 H384 a28 28 0 0 0 28 -28 V156 C412 116 404 90 362 76 V20" fill="none" stroke="#0f172a" strokeWidth={3} />
          <line x1={338} y1={44} x2={366} y2={44} stroke="#0f172a" strokeWidth={2} />
          <text x={352} y={262} textAnchor="middle" fontSize={17} fontWeight={700} className="fill-fh-bleu">
            Solution fille
          </text>
          <text x={352} y={276} textAnchor="middle" fontSize={15} className="fill-fh-ardoise">
            {virgule(c2, 3)} mol/L · {virgule(v2eff, 0)} mL
          </text>
        </svg>
        <p className="px-2 pb-1 text-center text-xs text-fh-ardoise">Les points représentent le soluté : sa quantité ne change pas, il est seulement réparti dans un plus grand volume.</p>
      </Planche>

      <div className="flex min-w-0 flex-col gap-4">
        <Curseur nom="Concentration de la solution mère" valeurTexte={`${virgule(c1, 2)} mol/L`} min={0.1} max={1} pas={0.05} valeur={c1} onChange={setC1} ariaLabel="Concentration de la solution mère en moles par litre" />
        <Curseur nom="Volume prélevé" valeurTexte={`${virgule(v1, 0)} mL`} min={5} max={50} pas={5} valeur={v1} onChange={setV1} ariaLabel="Volume prélevé de solution mère en millilitres" />
        <Curseur nom="Volume de la fiole" valeurTexte={`${virgule(v2eff, 0)} mL`} min={50} max={500} pas={10} valeur={v2eff} onChange={setV2} ariaLabel="Volume de la fiole jaugée en millilitres" />
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Valeur etiquette="Concentration finale">{virgule(c2, 3)} mol/L</Valeur>
          <Valeur etiquette="Facteur de dilution">{virgule(facteur, 1)}</Valeur>
          <Valeur etiquette="Eau à ajouter">{virgule(eau, 0)} mL</Valeur>
          <Valeur etiquette="Quantité de soluté">{virgule(c1 * v1, 1)} mmol</Valeur>
        </dl>
      </div>
    </div>
  );
}

/* ============================================================================================ 6. Gaz parfaits */

const R = 8.314; // J·mol⁻¹·K⁻¹

export function SimulationGaz() {
  const [n, setN] = useState(1);
  const [temp, setTemp] = useState(300);
  const [vol, setVol] = useState(25);
  const p = (n * R * temp) / (vol / 1000); // Pa
  const kpa = p / 1000;
  const nb = Math.round(n * 9);
  const hauteur = 40 + (vol / 50) * 150;
  const piston = 250 - hauteur;
  const duree = 4.5 * Math.sqrt(300 / temp);
  const chaud = Math.max(0, Math.min(1, (temp - 200) / 400));
  const frac = Math.max(0, Math.min(1, (Math.log10(kpa) - 1) / (Math.log10(3000) - 1)));
  const angle = -90 + 180 * frac;

  return (
    <div className="grid gap-6 min-[760px]:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] min-[760px]:items-start">
      <Planche>
        <svg viewBox="0 0 360 290" className="mx-auto h-auto w-full max-w-[420px]" role="img" aria-label={`Gaz de ${virgule(n, 1)} mol à ${virgule(temp, 0)} kelvins dans ${virgule(vol, 0)} litres : pression ${virgule(kpa, 0)} kilopascals`}>
          <defs>
            <clipPath id="clip-gaz">
              <rect x={70} y={20} width={180} height={230} />
            </clipPath>
          </defs>
          {/* gaz */}
          <g clipPath="url(#clip-gaz)">
            <rect x={70} y={piston} width={180} height={250 - piston} className={T} fill="#fecaca" opacity={0.25 + chaud * 0.55} style={{ transition: "all 900ms" }} />
            {Array.from({ length: nb }, (_, i) => (
              <g key={i} className={T} style={{ transform: `translate(${82 + alea(i, 31) * 156}px, ${piston + 24 + alea(i, 32) * (hauteur - 40)}px)` }}>
                <circle r={6.5} fill={COULEURS.hydroxyde} stroke="#fff" strokeWidth={1.5} className="particule" style={variables({ "--duree": `${duree * (0.8 + alea(i, 5) * 0.5)}s`, "--ax": `${(alea(i, 4) - 0.5) * 36}px`, "--ay": `${(alea(i, 6) - 0.5) * 24}px`, "--bx": `${(alea(i, 7) - 0.5) * 36}px`, "--by": `${(alea(i, 8) - 0.5) * 24}px`, "--cx": `${(alea(i, 9) - 0.5) * 36}px`, "--cy": `${(alea(i, 10) - 0.5) * 24}px` })} />
              </g>
            ))}
          </g>
          {/* cylindre */}
          <path d="M66 20 V250 H254 V20" fill="none" stroke="#0f172a" strokeWidth={5} strokeLinejoin="round" />
          {/* piston */}
          <g className={T} style={{ transform: `translateY(${piston - 26}px)` }}>
            <rect x={72} y={14} width={176} height={14} rx={4} fill="#475569" />
            <rect x={152} y={-26} width={16} height={42} fill="#94a3b8" />
            <rect x={132} y={-34} width={56} height={10} rx={4} fill="#64748b" />
          </g>
          {/* source de chaleur */}
          <rect x={70} y={254} width={180} height={10} rx={4} className={T} style={{ fill: `rgb(${Math.round(100 + 155 * chaud)}, ${Math.round(116 - 70 * chaud)}, ${Math.round(139 - 100 * chaud)})` }} />
          {/* manomètre */}
          <g transform="translate(305 118)">
            <path d="M-40 0 A40 40 0 0 1 40 0" fill="#fff" stroke="#0f172a" strokeWidth={3} />
            <path d="M-40 0 A40 40 0 0 1 0 -40" fill="none" stroke="#16a34a" strokeWidth={5} opacity={0.7} />
            <path d="M0 -40 A40 40 0 0 1 28 -28" fill="none" stroke="#facc15" strokeWidth={5} opacity={0.8} />
            <path d="M28 -28 A40 40 0 0 1 40 0" fill="none" stroke="#dc2626" strokeWidth={5} opacity={0.8} />
            <g className={T} style={{ transform: `rotate(${angle}deg)` }}>
              <line x1={0} y1={0} x2={0} y2={-34} stroke="#0f172a" strokeWidth={3} strokeLinecap="round" />
            </g>
            <circle r={5} fill="#0f172a" />
            <text y={-52} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-fh-bleu">
              {virgule(kpa, 0)} kPa
            </text>
            <text y={-64} textAnchor="middle" fontSize={10} className="fill-fh-ardoise">
              Pression
            </text>
          </g>
          <path d="M254 176 H305 V120" fill="none" stroke="#0f172a" strokeWidth={3} />
        </svg>
      </Planche>

      <div className="flex min-w-0 flex-col gap-4">
        <Curseur nom="Quantité de gaz" valeurTexte={`${virgule(n, 1)} mol`} min={0.5} max={3} pas={0.5} valeur={n} onChange={setN} ariaLabel="Quantité de matière de gaz en moles" />
        <Curseur nom="Température" valeurTexte={`${virgule(temp, 0)} K`} min={200} max={600} pas={10} valeur={temp} onChange={setTemp} ariaLabel="Température en kelvins" />
        <Curseur nom="Volume" valeurTexte={`${virgule(vol, 0)} L`} min={5} max={50} pas={1} valeur={vol} onChange={setVol} ariaLabel="Volume en litres" />
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Valeur etiquette="Pression">{virgule(kpa, 1)} kPa</Valeur>
          <Valeur etiquette="En bar">{virgule(kpa / 100, 2)} bar</Valeur>
          <Valeur etiquette="Température" large>
            {virgule(temp, 0)} K soit {virgule(temp - 273.15, 0)} °C
          </Valeur>
        </dl>
        <p className="rounded-xl bg-fh-accent/60 p-3 text-sm leading-relaxed text-fh-ardoise">
          {temp > 450 ? "Chauffé, le gaz s'agite plus vite : les chocs sur les parois sont plus violents, la pression augmente." : vol < 12 ? "Le volume est réduit : les chocs sur les parois sont plus fréquents, la pression augmente." : "Plus de gaz, plus de chaleur ou moins de volume : la pression monte. Fais varier un paramètre à la fois."}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================================ 7. Conductivité */

const SOLUTES = {
  eau: { libelle: "Eau pure", ions: [], molecule: false },
  sucre: { libelle: "Sucre (saccharose)", ions: [], molecule: true },
  nacl: { libelle: "Chlorure de sodium", ions: [{ nom: "Na⁺", lambda: 5.01, signe: "+" as const }, { nom: "Cl⁻", lambda: 7.63, signe: "−" as const }], molecule: false },
  hcl: { libelle: "Acide chlorhydrique", ions: [{ nom: "H₃O⁺", lambda: 34.96, signe: "+" as const }, { nom: "Cl⁻", lambda: 7.63, signe: "−" as const }], molecule: false },
} as const;
type CleSoluté = keyof typeof SOLUTES;

export function SimulationConductivite() {
  const [cle, setCle] = useState<CleSoluté>("nacl");
  const [c, setC] = useState(0.1);
  const s = SOLUTES[cle];
  const actif = cle !== "eau";
  const parIon = s.ions.map((ion) => ({ ...ion, sigma: ion.lambda * c * 1000 })); // mS/m = (mS·m²/mol) × (mol/m³)
  const sigma = parIon.reduce((t, i) => t + i.sigma, 0);
  const lampe = Math.min(1, Math.sqrt(sigma / 4500));
  const nPart = actif ? Math.max(4, Math.round(c * 90)) : 0;

  return (
    <div className="flex flex-col gap-5">
      <Choix<CleSoluté> nom="Soluté dissous" valeur={cle} onChoisir={setCle} options={(Object.keys(SOLUTES) as CleSoluté[]).map((k) => ({ cle: k, libelle: SOLUTES[k].libelle }))} />
      <div className="grid gap-6 min-[760px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[760px]:items-start">
        <Planche>
          <svg viewBox="0 0 440 284" className="h-auto w-full" role="img" aria-label={`Conductivité de la solution de ${s.libelle.toLowerCase()} : ${virgule(sigma, 0)} millisiemens par mètre`}>
            <defs>
              <clipPath id="clip-cond">
                <path d="M120 120 V222 a12 12 0 0 0 12 12 H268 a12 12 0 0 0 12 -12 V120 Z" />
              </clipPath>
            </defs>
            {/* circuit : pile → électrode → solution → électrode → lampe */}
            <path d="M36 70 V30 H170 V190" fill="none" stroke={lampe > 0.05 ? COULEURS.oxonium : COULEURS.gris} strokeWidth={3.5} className={T} />
            <path d="M230 190 V30 H360 V64" fill="none" stroke={lampe > 0.05 ? COULEURS.oxonium : COULEURS.gris} strokeWidth={3.5} className={T} />
            <path d="M360 116 V272 H36 V100" fill="none" stroke={lampe > 0.05 ? COULEURS.oxonium : COULEURS.gris} strokeWidth={3.5} className={T} />
            <line x1={24} y1={70} x2={48} y2={70} stroke="#0f172a" strokeWidth={4} />
            <line x1={30} y1={85} x2={42} y2={85} stroke="#0f172a" strokeWidth={4} />
            <line x1={24} y1={100} x2={48} y2={100} stroke="#0f172a" strokeWidth={4} />
            {/* lampe */}
            <circle cx={360} cy={90} r={50} fill="#fde047" className={T} style={{ opacity: 0.32 * lampe }} />
            <circle cx={360} cy={90} r={26} fill="#fde047" className={T} style={{ opacity: 0.12 + 0.88 * lampe }} />
            <circle cx={360} cy={90} r={26} fill="none" stroke="#0f172a" strokeWidth={2.5} />
            <path d="M348 102 L360 84 L372 102" fill="none" stroke="#0f172a" strokeWidth={2} />
            {/* bécher + particules */}
            <g clipPath="url(#clip-cond)">
              <rect x={120} y={140} width={160} height={100} fill="#bae6fd" opacity={0.85} />
              {Array.from({ length: nPart }, (_, i) => {
                const x = 132 + alea(i, 41) * 136;
                const y = 154 + alea(i, 42) * 70;
                const anim = variables({ "--duree": `${2.6 + alea(i, 3) * 2}s`, "--ax": `${(alea(i, 4) - 0.5) * 22}px`, "--ay": `${(alea(i, 5) - 0.5) * 14}px`, "--bx": `${(alea(i, 6) - 0.5) * 22}px`, "--by": `${(alea(i, 7) - 0.5) * 14}px`, "--cx": `${(alea(i, 8) - 0.5) * 22}px`, "--cy": `${(alea(i, 9) - 0.5) * 14}px` });
                if (s.molecule) {
                  return (
                    <g key={i} transform={`translate(${x} ${y})`}>
                      <g className="particule" style={anim}>
                        <circle r={6} fill="#e2e8f0" stroke={COULEURS.gris} strokeWidth={1.6} />
                        <circle cx={7} cy={-5} r={4} fill="#e2e8f0" stroke={COULEURS.gris} strokeWidth={1.3} />
                      </g>
                    </g>
                  );
                }
                const ion = s.ions[i % 2];
                const positif = ion.signe === "+";
                return (
                  <g key={i} transform={`translate(${x} ${y})`}>
                    <g className="particule" style={anim}>
                      <circle r={7.5} fill={positif ? "#ffedd5" : "#e0e7ff"} stroke={positif ? COULEURS.oxonium : COULEURS.hydroxyde} strokeWidth={2} />
                      <text textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={700} fill={positif ? COULEURS.oxonium : COULEURS.hydroxyde}>
                        {ion.signe}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
            <path d="M120 112 V222 a12 12 0 0 0 12 12 H268 a12 12 0 0 0 12 -12 V112" fill="none" stroke="#0f172a" strokeWidth={3} />
            <rect x={164} y={150} width={12} height={74} rx={3} fill="#475569" />
            <rect x={224} y={150} width={12} height={74} rx={3} fill="#475569" />
            <text x={200} y={254} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-fh-bleu">
              {actif ? `${s.libelle}, ${virgule(c, 2)} mol/L` : s.libelle}
            </text>
          </svg>
        </Planche>

        <div className="flex min-w-0 flex-col gap-4">
          {actif ? (
            <Curseur nom="Concentration en soluté" valeurTexte={`${virgule(c, 2)} mol/L`} min={0.01} max={0.2} pas={0.01} valeur={c} onChange={setC} ariaLabel="Concentration en soluté en moles par litre" />
          ) : (
            <p className="rounded-xl bg-fh-accent/60 p-3 text-sm text-fh-ardoise">L&apos;eau pure contient très peu d&apos;ions : sa conductivité est presque nulle.</p>
          )}
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Valeur etiquette="Conductivité" large>
              {s.ions.length ? `${virgule(sigma, 0)} mS/m` : cle === "eau" ? "≈ 0 mS/m" : "0 mS/m"}
            </Valeur>
            <Valeur etiquette="Lampe">{lampe > 0.5 ? "très lumineuse" : lampe > 0.15 ? "lumineuse" : lampe > 0.02 ? "faible" : "éteinte"}</Valeur>
            <Valeur etiquette="Porteurs de charge">{s.ions.length ? "des ions" : "aucun ion"}</Valeur>
          </dl>
          {parIon.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border border-fh-sable bg-white p-3 text-sm">
              <p className="font-semibold text-fh-bleu">Contribution de chaque ion</p>
              {parIon.map((ion) => (
                <div key={ion.nom}>
                  <div className="mb-0.5 flex justify-between text-xs">
                    <span className="font-bold" style={{ color: ion.signe === "+" ? COULEURS.oxonium : COULEURS.hydroxyde }}>
                      {ion.nom}
                    </span>
                    <span className="text-fh-ardoise">{virgule(ion.sigma, 0)} mS/m</span>
                  </div>
                  <div className="h-3 rounded bg-fh-creme">
                    <div className={`h-3 rounded ${T}`} style={{ width: `${(ion.sigma / 4500) * 100}%`, background: ion.signe === "+" ? COULEURS.oxonium : COULEURS.hydroxyde }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="rounded-xl bg-fh-accent/60 p-3 text-sm leading-relaxed text-fh-ardoise">
            {cle === "sucre" ? "Le sucre se dissout en molécules entières : aucun ion, donc aucun courant." : cle === "eau" ? "Sans soluté, il n'y a presque pas de porteurs de charge." : cle === "hcl" ? "L'ion oxonium est très mobile : cette solution conduit mieux que le sel, à concentration égale." : "Le sel se dissocie en ions Na⁺ et Cl⁻, qui transportent le courant dans la solution."}
          </p>
        </div>
      </div>
    </div>
  );
}
