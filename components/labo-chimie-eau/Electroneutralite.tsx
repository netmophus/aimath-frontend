"use client";

import { useMemo, useState } from "react";

import {
  ASSEMBLAGE_VIDE,
  ESPECES,
  IONS,
  TEX_EQUATIONS,
  aleatoireReproductible,
  assemblageDepuisSel,
  bilanCharges,
  chargeIon,
  concentrationEauPure,
  concentrationsIoniques,
  electroneutraliteSolution,
  fr,
  solutionSaline,
  texNombre,
  type Assemblage,
  type CleIon,
  type SelModele,
} from "@/lib/chimieEau";
import { CHARGES_DEFAUT, questionsCharges, type ParamsCharges } from "@/lib/chimieEauExercices";
import { Alerte, BarreLecture, Bouton, CadreChimie, CC, Curseur, Equation, Legende, NoteEchelle, Pastille, Tex, Valeur, elargir, useHorloge } from "./ui";
import { Calcium, Chlorure, Hydroxyde, Oxonium, Sodium, Sulfate } from "./Particules";

const DUREE = 8;
const MAX_PAR_ION = 8;
const UNITES = { NaCl: 10, CaCl2: 5 } as const;

function Balance({ pos, neg }: { pos: number; neg: number }) {
  const total = Math.max(pos, neg, 1);
  const net = pos - neg;
  const angle = -Math.max(-14, Math.min(14, (net / total) * 28));
  const L = 64;
  const cx = 340;
  const cy = 215;
  const rad = (angle * Math.PI) / 180;
  const gauche = { x: cx - L * Math.cos(rad), y: cy - L * Math.sin(rad) };
  const droite = { x: cx + L * Math.cos(rad), y: cy + L * Math.sin(rad) };
  const pile = (n: number, couleur: string, signe: string, bord: { x: number; y: number }) => {
    const cols = 5;
    return Array.from({ length: Math.min(n, 40) }, (_, k) => (
      <g key={k}>
        <rect x={bord.x - 32 + (k % cols) * 13} y={bord.y - 14 - Math.floor(k / cols) * 14} width={12} height={12} rx={2} fill={couleur} />
        <text x={bord.x - 32 + (k % cols) * 13 + 6} y={bord.y - 14 - Math.floor(k / cols) * 14 + 10} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">
          {signe}
        </text>
      </g>
    ));
  };
  return (
    <g>
      <polygon points={`${cx},${cy + 4} ${cx - 16},${cy + 50} ${cx + 16},${cy + 50}`} fill="#64748B" />
      <rect x={cx - 34} y={cy + 50} width={68} height={7} rx={3} fill="#475569" />
      <line x1={gauche.x} y1={gauche.y} x2={droite.x} y2={droite.y} stroke="#334155" strokeWidth={5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={6} fill="#334155" />
      <line x1={gauche.x} y1={gauche.y} x2={gauche.x} y2={gauche.y + 6} stroke="#334155" strokeWidth={2} />
      <line x1={droite.x} y1={droite.y} x2={droite.x} y2={droite.y + 6} stroke="#334155" strokeWidth={2} />
      <rect x={gauche.x - 34} y={gauche.y + 6} width={68} height={5} rx={2} fill="#94A3B8" />
      <rect x={droite.x - 34} y={droite.y + 6} width={68} height={5} rx={2} fill="#94A3B8" />
      {pile(pos, CC.plus, "+", { x: gauche.x, y: gauche.y + 6 })}
      {pile(neg, CC.moins, "−", { x: droite.x, y: droite.y + 6 })}
      <text x={gauche.x} y={cy + 82} textAnchor="middle" fontSize={11} fontWeight={800} fill={CC.plus}>
        Charges +
      </text>
      <text x={droite.x} y={cy + 82} textAnchor="middle" fontSize={11} fontWeight={800} fill={CC.moins}>
        Charges −
      </text>
      <text x={gauche.x} y={cy + 97} textAnchor="middle" fontSize={13} fontWeight={800} fill={CC.plus}>
        {pos}
      </text>
      <text x={droite.x} y={cy + 97} textAnchor="middle" fontSize={13} fontWeight={800} fill={CC.moins}>
        {neg}
      </text>
    </g>
  );
}

function IonVue({ ion, x, y, formule }: { ion: CleIon; x: number; y: number; formule?: string }) {
  switch (ion) {
    case "Na":
      return <Sodium x={x} y={y} r={7.5} formule={formule} />;
    case "Cl":
      return <Chlorure x={x} y={y} r={9.5} formule={formule} />;
    case "Ca":
      return <Calcium x={x} y={y} formule={formule} />;
    case "SO4":
      return <Sulfate x={x} y={y} formule={formule} />;
    case "H3O":
      return <Oxonium x={x} y={y} s={0.75} formule={formule} />;
    default:
      return <Hydroxyde x={x} y={y} s={0.75} formule={formule} />;
  }
}

function Scene({ a, t }: { a: Assemblage; t: number }) {
  const b = bilanCharges(a);
  const liste = useMemo(() => IONS.flatMap((ion) => Array.from({ length: a[ion] }, (_, k) => ({ ion, k }))), [a]);
  const cellules = useMemo(() => {
    const cols = 6;
    const rows = Math.max(4, Math.ceil(liste.length / cols));
    const out: Array<{ x: number; y: number }> = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push({ x: 36 + c * 34, y: 138 + (r * 150) / Math.max(1, rows - 1) });
    return out.map((cel, i) => ({ cel, cle: aleatoireReproductible(7 * i + 3) })).sort((u, v) => u.cle - v.cle).map((o) => o.cel);
  }, [liste.length]);
  return (
    <svg viewBox="0 0 460 330" role="img" aria-label={`Bilan des charges : ${b.positives} charges positives, ${b.negatives} charges négatives, charge nette ${b.net}`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <rect x={10} y={95} width={206} height={215} rx={12} fill="#BAE6FD" opacity={0.3} stroke="#475569" strokeWidth={3} />
      <text x={113} y={86} textAnchor="middle" fontSize={12} fontWeight={800} fill={CC.encre}>
        Solution (modèle)
      </text>
      {liste.map((q, i) => {
        const c = cellules[i] ?? { x: 130, y: 200 };
        const dx = 4 * Math.sin(t * 1.1 + i);
        const dy = 3 * Math.cos(t * 0.9 + i * 1.7);
        return <IonVue key={`${q.ion}-${q.k}`} ion={q.ion} x={c.x + dx} y={c.y + dy} />;
      })}
      {liste.length === 0 && (
        <text x={113} y={200} textAnchor="middle" fontSize={12} fill="#64748B">
          Aucun ion : ajoutes-en avec les boutons +
        </text>
      )}
      <Balance pos={b.positives} neg={b.negatives} />
      <text x={340} y={40} textAnchor="middle" fontSize={14} fontWeight={800} fill={b.neutre ? "#047857" : "#B45309"}>
        {b.neutre ? "Électriquement neutre" : `Charge nette : ${b.net > 0 ? "+" : ""}${b.net}`}
      </text>
    </svg>
  );
}

function CompteurIon({ ion, n, onChange }: { ion: CleIon; n: number; onChange: (v: number) => void }) {
  const e = ESPECES[ion];
  const z = chargeIon(ion);
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-14 shrink-0 text-sm font-bold text-[#102A66]">
        <Tex expr={e.tex} />
      </span>
      <span className="w-12 shrink-0 text-xs text-fh-ardoise/70">{z > 0 ? `+${z}` : z} e</span>
      <Bouton onClick={() => onChange(Math.max(0, n - 1))} disabled={n <= 0}>
        −
      </Bouton>
      <span aria-live="polite" className="w-6 text-center text-sm font-bold text-[#102A66]">
        {n}
      </span>
      <Bouton onClick={() => onChange(Math.min(MAX_PAR_ION, n + 1))} disabled={n >= MAX_PAR_ION}>
        +
      </Bouton>
    </div>
  );
}

export default function Electroneutralite({ initial = CHARGES_DEFAUT }: { initial?: ParamsCharges }) {
  const [p, setP] = useState<ParamsCharges>(initial);
  const h = useHorloge(DUREE);
  const libre = p.mode === "libre";
  const a: Assemblage = libre ? p.libre : assemblageDepuisSel(p.mode as SelModele, UNITES[p.mode as SelModele]);
  const b = bilanCharges(a);
  const reprendre = () => {
    setP(initial);
    h.arreter();
  };
  const changerMode = (mode: ParamsCharges["mode"]) => setP((q) => ({ ...q, mode }));
  const maj = (ion: CleIon, v: number) => setP((q) => ({ ...q, libre: { ...q.libre, [ion]: v } }));
  const sel = libre ? null : (p.mode as SelModele);
  const conc = sel ? concentrationsIoniques(sel, p.C) : null;
  const sol = sel ? solutionSaline(sel, p.C) : null;
  const verif = sol ? electroneutraliteSolution(sol) : null;
  const eau = concentrationEauPure(25);
  const bC = elargir(p.C, 0.005, 0.1);

  const relationTex =
    sel === "CaCl2"
      ? String.raw`2[\mathrm{Ca^{2+}}] + [\mathrm{H_3O^+}] = [\mathrm{Cl^-}] + [\mathrm{OH^-}]`
      : String.raw`[\mathrm{Na^+}] + [\mathrm{H_3O^+}] = [\mathrm{Cl^-}] + [\mathrm{OH^-}]`;
  const numTex = conc
    ? sel === "CaCl2"
      ? String.raw`2\times${texNombre(conc.Ca!)} + ${texNombre(eau)} = ${texNombre(conc.Cl!)} + ${texNombre(eau)}`
      : String.raw`${texNombre(conc.Na!)} + ${texNombre(eau)} = ${texNombre(conc.Cl!)} + ${texNombre(eau)}`
    : "";

  const etapes = [
    { titre: "La charge de chaque ion", contenu: <p>Chaque ion porte un nombre entier de charges élémentaires : <Tex expr={String.raw`\mathrm{Na^+}`} /> : +1, <Tex expr={String.raw`\mathrm{Cl^-}`} /> : −1, <Tex expr={String.raw`\mathrm{Ca^{2+}}`} /> : +2, <Tex expr={String.raw`\mathrm{SO_4^{2-}}`} /> : −2.</p> },
    { titre: "On compte les charges, pas les particules", contenu: <p>Le bilan additionne les charges élémentaires. Avoir autant de cations que d&apos;anions ne suffit pas toujours : un ion Ca²⁺ compte pour deux charges.</p> },
    { titre: "Chlorure de sodium", contenu: (<><Tex bloc expr={TEX_EQUATIONS.dissolutionNaCl} /><p>10 ions Na⁺ (+10) et 10 ions Cl⁻ (−10) : le bilan est nul. Les dix paires dessinées sont un modèle visuel, pas le nombre réel d&apos;ions d&apos;un bécher.</p></>) },
    { titre: "Chlorure de calcium", contenu: (<><Tex bloc expr={TEX_EQUATIONS.dissolutionCaCl2} /><Tex bloc expr={String.raw`(+2) + (-1) + (-1) = 0`} /><p>Un cation pour deux anions, et pourtant les charges se compensent.</p></>) },
    {
      titre: "Concentrations et relation d'électroneutralité",
      contenu: sel ? (
        <>
          <Tex bloc expr={relationTex} />
          <Tex bloc expr={numTex} />
          <p>Les ions de l&apos;eau ({texNombre(eau)} mol/L chacun à 25 °C) se compensent : il reste {sel === "CaCl2" ? `2 × ${fr(conc!.Ca!, 4)} = ${fr(conc!.Cl!, 4)}` : `${fr(conc!.Na!, 4)} = ${fr(conc!.Cl!, 4)}`} mol/L.</p>
        </>
      ) : (
        <p>Dans le mode « libre », compare la somme des charges positives et celle des charges négatives : la balance penche tant que le bilan n&apos;est pas nul.</p>
      ),
    },
    { titre: "Conclusion", contenu: <p>{b.neutre ? "Les charges positives et négatives se compensent : l'assemblage est électriquement neutre, comme toute solution aqueuse ordinaire." : `Il reste ${b.net > 0 ? b.net + " charge(s) positive(s)" : -b.net + " charge(s) négative(s)"} non compensée(s) : ce n'est pas une solution ordinaire, il manque des contre-ions.`}</p> },
  ];

  return (
    <CadreChimie
      titre="Électroneutralité"
      alerte={!b.neutre ? <Alerte>Ce bilan de charges n&apos;est pas équilibré. Une solution aqueuse ordinaire, électriquement neutre, doit présenter une compensation globale des charges. Vérifie les ions ou les contre-ions manquants.</Alerte> : undefined}
      scene={
        <>
          <Scene a={a} t={h.t} />
          <Legende
            elements={[
              { symbole: "Na⁺", libelle: "sodium", couleur: CC.sodium },
              { symbole: "Cl⁻", libelle: "chlorure", couleur: CC.chlorure },
              { symbole: "Ca²⁺", libelle: "calcium", couleur: CC.calcium },
              { symbole: "SO₄²⁻", libelle: "sulfate", couleur: CC.sulfate },
              { symbole: "H₃O⁺", libelle: "oxonium", couleur: CC.plus },
              { symbole: "OH⁻", libelle: "hydroxyde", couleur: CC.moins },
            ]}
          />
          <NoteEchelle>Modèle visuel : les particules dessinées ne correspondent pas au nombre réel d&apos;ions dans un bécher.</NoteEchelle>
        </>
      }
      commandes={<BarreLecture h={h} duree={DUREE} onReinitialiser={reprendre} />}
      parametres={
        <>
          <div role="group" aria-label="Expérience" className="flex flex-wrap gap-2">
            <Pastille actif={p.mode === "NaCl"} onClick={() => changerMode("NaCl")}>
              NaCl
            </Pastille>
            <Pastille actif={p.mode === "CaCl2"} onClick={() => changerMode("CaCl2")}>
              CaCl₂
            </Pastille>
            <Pastille actif={libre} onClick={() => changerMode("libre")}>
              Libre
            </Pastille>
          </div>
          {libre ? (
            <div className="flex min-w-0 flex-col gap-2">
              {IONS.map((ion) => (
                <CompteurIon key={ion} ion={ion} n={p.libre[ion]} onChange={(v) => maj(ion, v)} />
              ))}
              <Bouton onClick={() => setP((q) => ({ ...q, libre: { ...ASSEMBLAGE_VIDE } }))}>Vider la solution</Bouton>
            </div>
          ) : (
            <Curseur etiquette="Concentration apportée C" valeur={p.C} min={bC.min} max={bC.max} pas={0.005} decimales={3} onChange={(v) => setP((q) => ({ ...q, C: v }))} unite="mol/L" />
          )}
        </>
      }
      resultats={
        <>
          {sel && <Equation titre="Dissolution" expr={sel === "NaCl" ? TEX_EQUATIONS.dissolutionNaCl : TEX_EQUATIONS.dissolutionCaCl2} />}
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="Charges positives">+{b.positives} e</Valeur>
            <Valeur etiquette="Charges négatives">−{b.negatives} e</Valeur>
            <Valeur etiquette="Charge nette">{b.net > 0 ? "+" : b.net < 0 ? "−" : ""}{Math.abs(b.net)} e</Valeur>
            <Valeur etiquette="Bilan">{b.neutre ? "neutre" : "non équilibré"}</Valeur>
          </div>
          {sel && conc && verif && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {sel === "CaCl2" ? <Valeur etiquette="[Ca²⁺]">{fr(conc.Ca!, 4)} mol/L</Valeur> : <Valeur etiquette="[Na⁺]">{fr(conc.Na!, 4)} mol/L</Valeur>}
                <Valeur etiquette="[Cl⁻]">{fr(conc.Cl!, 4)} mol/L</Valeur>
              </div>
              <Equation titre="Relation d'électroneutralité (ions de l'eau compris)" expr={relationTex} />
              <Equation expr={numTex} />
              <p className={`rounded-lg px-3 py-2 text-sm font-semibold ${verif.verifiee ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
                {verif.verifiee ? `Vérifié : ${fr(verif.cations, 4)} = ${fr(verif.anions, 4)} mol/L.` : "Relation non vérifiée."}
              </p>
            </>
          )}
        </>
      }
      principe={<p className="text-sm text-fh-ardoise">Une solution ionique reste globalement neutre : la somme des charges positives est égale à celle des charges négatives. On compte les charges élémentaires, pas seulement les ions.</p>}
      etapes={etapes}
      questions={questionsCharges(p)}
      onReprendre={reprendre}
    />
  );
}
