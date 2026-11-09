"use client";

import { useMemo, useState } from "react";
import { IconSalt } from "@tabler/icons-react";

import {
  DUREE_DISSOLUTION,
  MASSE_MOLAIRE,
  PHASES_DISSOLUTION,
  TEX_EQUATIONS,
  aleatoireReproductible,
  concentrationMolaire,
  fr,
  niveauConductivite,
  phaseDissolution,
  porteursDeCharge,
  quantiteDepuisMasse,
  type Milieu,
} from "@/lib/chimieEau";
import { DISSOLUTION_DEFAUT, questionsDissolution, type ParamsDissolution } from "@/lib/chimieEauExercices";
import { BarreLecture, Bouton, CadreChimie, CC, Curseur, Equation, Interrupteur, Legende, NoteEchelle, Pastille, Tex, Valeur, elargir, useHorloge } from "./ui";
import { Becher, Chlorure, Eau, IonDisque, Saccharose, Sodium, douceur, melange } from "./Particules";

const W = 460;
const H = 340;
const BX = 90;
const BY = 120;
const BW = 280;
const BH = 200;
const FOND = 304;
const XC = 230;
const CHUTE = 204;

interface Particule {
  i: number;
  type: "Na" | "Cl" | "S";
  lx: number;
  ly: number;
  fx: number;
  fy: number;
  psi: number;
  surface: boolean;
  tDet: number;
}

const TAILLES_SEL = [
  { c: 4, r: 2 },
  { c: 4, r: 4 },
  { c: 6, r: 4 },
];
const TAILLES_SUCRE = [
  { c: 3, r: 2 },
  { c: 4, r: 2 },
  { c: 4, r: 3 },
];

const yEauDe = (V: number) => BY + BH - (110 + (80 * (V - 0.1)) / 0.9);

function construire(sel: boolean, fraction: number, yEau: number): { particules: Particule[]; yc: number } {
  const tailles = sel ? TAILLES_SEL : TAILLES_SUCRE;
  const { c: C, r: R } = tailles[fraction < 0.34 ? 0 : fraction < 0.67 ? 1 : 2];
  const d = sel ? 24 : 30;
  const yc = FOND - ((R - 1) * d) / 2;
  const brutes: Array<Omit<Particule, "fx" | "fy" | "tDet" | "i">> = [];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const lx = XC + (c - (C - 1) / 2) * d;
      const ly = FOND - (R - 1 - r) * d;
      brutes.push({ type: sel ? ((c + r) % 2 === 0 ? "Na" : "Cl") : "S", lx, ly, psi: Math.atan2(ly - yc, lx - XC + 1e-6), surface: c === 0 || c === C - 1 || r === 0 || r === R - 1 });
    }
  }
  const n = brutes.length;
  const ordre = brutes.map((b, k) => ({ k, dist: Math.hypot(b.lx - XC, b.ly - yc) })).sort((a, b) => b.dist - a.dist || a.k - b.k);
  const rang = new Array<number>(n);
  ordre.forEach((o, position) => (rang[o.k] = position));
  // positions finales : cellules d'une grille mélangée de façon reproductible
  const cellules: Array<{ x: number; y: number }> = [];
  const yHaut = yEau + 24;
  for (let ry = 0; ry < 4; ry++) for (let rx = 0; rx < 6; rx++) cellules.push({ x: 112 + rx * 41, y: yHaut + (ry * (FOND - yHaut)) / 3 });
  const melanges = cellules.map((cel, k) => ({ cel, cle: aleatoireReproductible(31 * k + (sel ? 7 : 11)) })).sort((a, b) => a.cle - b.cle);
  const particules = brutes.map((b, k) => {
    const cel = melanges[k].cel;
    const jx = (aleatoireReproductible(100 + k) - 0.5) * 12;
    const jy = (aleatoireReproductible(200 + k) - 0.5) * 8;
    return { ...b, i: k, fx: cel.x + jx, fy: Math.min(FOND, Math.max(yEau + 14, cel.y + jy)), tDet: 3 + (2.6 * rang[k]) / Math.max(1, n - 1) };
  });
  return { particules, yc };
}

function Scene({ p, t, opts, sel }: { p: ParamsDissolution; t: number; opts: { molecules: boolean; ions: boolean; hydratation: boolean }; sel: boolean }) {
  const yEau = yEauDe(p.volume);
  const fraction = sel ? (p.masse - 0.5) / 9.5 : (p.masse - 1) / 49;
  const { particules } = useMemo(() => construire(sel, fraction, yEau), [sel, fraction, yEau]);
  const decalage = t < 1.5 ? -CHUTE * (1 - douceur(t / 1.5)) : 0;
  const phase = PHASES_DISSOLUTION.findIndex((x) => x.id === phaseDissolution(t));
  const decor = useMemo(() => Array.from({ length: 14 }, (_, k) => ({ x: 112 + aleatoireReproductible(300 + k) * 236, y: yEau + 14 + aleatoireReproductible(400 + k) * (FOND - yEau - 10), r: aleatoireReproductible(500 + k) * 360 })), [yEau]);
  const pos = (q: Particule) => {
    const m = douceur((t - q.tDet) / 3.2);
    return { x: melange(q.lx, q.fx, m), y: melange(q.ly + decalage, q.fy, m) };
  };
  const premiereY = Math.min(...particules.map((q) => q.ly)) + decalage;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Dissolution du ${sel ? "chlorure de sodium" : "saccharose"} dans l'eau, étape ${phase + 1} sur 5 : ${PHASES_DISSOLUTION[phase].titre}`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={12} y={24} fontSize={15} fontWeight={800} fill={CC.encre}>
        Étape {phase + 1}/5 · {PHASES_DISSOLUTION[phase].titre}
      </text>
      <Becher x={BX} y={BY} w={BW} h={BH} yEau={yEau} />
      <g>
        {opts.molecules &&
          decor.map((d, k) => <Eau key={k} x={d.x + 3 * Math.sin(t * 1.3 + k)} y={d.y + 2 * Math.cos(t * 1.1 + k)} rot={d.r + 18 * Math.sin(t + k)} s={0.62} o={0.4} />)}
        {opts.hydratation &&
          particules.map((q) => {
            const a = douceur((t - (q.surface ? 1.5 : q.tDet - 0.3)) / 1.5);
            if (a <= 0.001) return null;
            const ip = pos(q);
            const R = q.type === "Na" ? 19 : 23;
            return [-60, 0, 60].map((dphi, k) => {
              const phi = (q.psi * 180) / Math.PI + dphi;
              const depart = { x: 110 + aleatoireReproductible(q.i * 7 + k) * 240, y: yEau + 12 + aleatoireReproductible(q.i * 13 + k) * (FOND - yEau - 14) };
              const cible = { x: ip.x + R * Math.cos((phi * Math.PI) / 180), y: ip.y + R * Math.sin((phi * Math.PI) / 180) };
              const rot = q.type === "Na" ? phi - 90 : q.type === "Cl" ? phi + 90 : phi + (k % 2 ? 90 : -90);
              return <Eau key={`${q.i}-${k}`} x={melange(depart.x, cible.x, a)} y={melange(depart.y, cible.y, a)} rot={rot * a + (1 - a) * 40} s={0.62} o={0.55 + 0.45 * a} delta={false} />;
            });
          })}
        {particules.map((q) => {
          const ip = pos(q);
          if (q.type === "S") return <Saccharose key={q.i} x={ip.x} y={ip.y} s={0.75} />;
          if (!opts.ions) return null;
          return q.type === "Na" ? <Sodium key={q.i} x={ip.x} y={ip.y} /> : <Chlorure key={q.i} x={ip.x} y={ip.y} />;
        })}
      </g>
      {t < 1.5 && (
        <text x={XC - (sel ? 78 : 72)} y={(premiereY + FOND + decalage) / 2 + 4} textAnchor="end" fontSize={13} fontWeight={800} fill={CC.encre}>
          {sel ? "Cristal de NaCl" : "Cristal de saccharose"}
        </text>
      )}
      {sel && t >= 0 && t < 3 && (
        <g fontSize={12} fontWeight={700}>
          <text x={W - 12} y={44} textAnchor="end" fill={CC.sodium}>
            Na⁺ : ion sodium (+)
          </text>
          <text x={W - 12} y={62} textAnchor="end" fill={CC.chlorure}>
            Cl⁻ : ion chlorure (−)
          </text>
        </g>
      )}
      {!sel && (
        <text x={W - 12} y={44} textAnchor="end" fontSize={12} fontWeight={700} fill={CC.sucreBord}>
          C₁₂H₂₂O₁₁ : molécule neutre
        </text>
      )}
      {phase >= 3 && (
        <text x={W - 12} y={84} textAnchor="end" fontSize={12} fontWeight={700} fill={CC.encre}>
          Hydratation · dispersion
        </text>
      )}
      {/* Légende d'une molécule d'eau polarisée */}
      <g>
        <Eau x={42} y={222} rot={0} s={1.5} delta />
        <text x={42} y={262} textAnchor="middle" fontSize={11} fontWeight={700} fill={CC.encre}>
          H₂O
        </text>
      </g>
    </svg>
  );
}

function SceneConductivite({ t, C }: { t: number; C: number }) {
  const milieux: Array<{ m: Milieu; titre: string; x: number }> = [
    { m: "eau", titre: "Eau pure", x: 10 },
    { m: "sel", titre: "NaCl dissous", x: 160 },
    { m: "sucre", titre: "Saccharose dissous", x: 310 },
  ];
  const niveauPx = { "très faible": 0.05, faible: 0.3, moyenne: 0.6, élevée: 0.92 } as const;
  return (
    <svg viewBox="0 0 460 290" role="img" aria-label="Comparaison de la conductivité de l'eau pure, d'une solution de chlorure de sodium et d'une solution de saccharose" className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      {milieux.map(({ m, titre, x }) => {
        const niv = niveauConductivite(m, C);
        const f = niveauPx[niv];
        const u = (k: number, n: number) => (t * 0.3 + k / n) % 1;
        return (
          <g key={m}>
            <rect x={x + 10} y={22} width={120} height={14} rx={7} fill="#E2E8F0" />
            <rect x={x + 10} y={22} width={120 * f} height={14} rx={7} fill={m === "sel" ? "#16A34A" : "#94A3B8"} />
            <text x={x + 70} y={52} textAnchor="middle" fontSize={11} fontWeight={700} fill={CC.encre}>
              Conductivité : {niv}
            </text>
            <Becher x={x + 15} y={100} w={110} h={120} yEau={128}>
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <Eau key={k} x={x + 40 + (k % 3) * 28} y={150 + Math.floor(k / 3) * 38} rot={30 * k + 12 * Math.sin(t + k)} s={0.5} o={0.35} />
              ))}
              {m === "sel" &&
                [0, 1, 2, 3, 4, 5].map((k) => (
                  <g key={k}>
                    <Sodium x={x + 100 - u(k, 6) * 66} y={140 + (k % 3) * 22 + 6} r={7} />
                    <Chlorure x={x + 38 + u(k, 6) * 66} y={150 + (k % 3) * 22} r={9} />
                  </g>
                ))}
              {m === "sucre" && [0, 1, 2, 3, 4].map((k) => <Saccharose key={k} x={x + 38 + (k % 3) * 28 + 3 * Math.sin(t + k)} y={155 + Math.floor(k / 3) * 38} s={0.5} />)}
              {m === "eau" && (
                <g>
                  <IonDisque x={x + 98 - u(0, 1) * 62} y={168} r={6} fill={CC.oxygene} charge="+" />
                  <IonDisque x={x + 38 + u(0.5, 1) * 62} y={190} r={6} fill={CC.moins} charge="−" />
                </g>
              )}
            </Becher>
            <rect x={x + 28} y={70} width={6} height={130} fill="#334155" rx={2} />
            <rect x={x + 106} y={70} width={6} height={130} fill="#334155" rx={2} />
            <text x={x + 31} y={64} textAnchor="middle" fontSize={15} fontWeight={800} fill={CC.moins}>
              −
            </text>
            <text x={x + 109} y={64} textAnchor="middle" fontSize={15} fontWeight={800} fill={CC.plus}>
              +
            </text>
            <text x={x + 70} y={246} textAnchor="middle" fontSize={12} fontWeight={800} fill={CC.encre}>
              {titre}
            </text>
          </g>
        );
      })}
      <text x={230} y={278} textAnchor="middle" fontSize={11} fill="#475569">
        Échelle qualitative : aucune valeur numérique de conductivité n&apos;est donnée par ce modèle.
      </text>
    </svg>
  );
}

export default function Dissolution({ initial = DISSOLUTION_DEFAUT }: { initial?: ParamsDissolution }) {
  const [p, setP] = useState<ParamsDissolution>(initial);
  const [vue, setVue] = useState<"dissolution" | "conductivite">("dissolution");
  const [opts, setOpts] = useState({ molecules: true, ions: true, hydratation: true });
  const h = useHorloge(DUREE_DISSOLUTION);
  const sel = p.soluté === "sel";
  const M = sel ? MASSE_MOLAIRE.NaCl : MASSE_MOLAIRE.saccharose;
  const n = quantiteDepuisMasse(p.masse, M);
  const C = concentrationMolaire(n, p.volume);
  const reprendre = () => {
    setP(initial);
    setVue("dissolution");
    h.arreter();
  };
  const changer = (soluté: "sel" | "sucre") => {
    setP((q) => ({ ...q, soluté, masse: soluté === "sel" ? 5.844 : 34.23 }));
    h.arreter();
  };
  const bm = sel ? elargir(p.masse, 0.5, 10) : elargir(p.masse, 1, 50);

  const etapes = [
    {
      titre: sel ? "Le cristal : un réseau d'ions" : "Le cristal : un empilement de molécules",
      contenu: sel ? (
        <>
          <p>Le cristal de chlorure de sodium est un réseau régulier d&apos;ions déjà présents : <Tex expr={String.raw`\mathrm{Na^+}`} /> et <Tex expr={String.raw`\mathrm{Cl^-}`} />. Les ions ne sont pas créés par l&apos;eau.</p>
        </>
      ) : (
        <p>Le cristal de saccharose est formé de molécules <Tex expr={String.raw`\mathrm{C_{12}H_{22}O_{11}}`} /> électriquement neutres. Il n&apos;y a pas d&apos;ions dans ce cristal.</p>
      ),
    },
    {
      titre: "Les molécules d'eau s'approchent",
      contenu: (
        <p>La molécule d&apos;eau est polaire : l&apos;oxygène porte une charge partielle négative <Tex expr={String.raw`\delta^-`} />, les hydrogènes une charge partielle positive <Tex expr={String.raw`\delta^+`} />. {sel ? "Le côté oxygène se tourne vers les ions Na⁺, le côté hydrogène vers les ions Cl⁻." : "Elles se placent autour des molécules de sucre à la surface du cristal."}</p>
      ),
    },
    {
      titre: sel ? "Dissociation : les ions se séparent" : "Les molécules se détachent",
      contenu: <p>{sel ? "Les attractions eau–ion deviennent plus fortes que les attractions entre ions : les ions quittent le réseau, un par un, en commençant par la surface." : "Les molécules de saccharose se détachent progressivement du cristal, sans se casser."}</p>,
    },
    {
      titre: "Hydratation",
      contenu: <p>Chaque {sel ? "ion" : "molécule"} est entouré(e) de molécules d&apos;eau : c&apos;est l&apos;hydratation. Elle empêche {sel ? "les ions de se recombiner aussitôt" : "les molécules de se ré-agglomérer"}.</p>,
    },
    {
      titre: "Dispersion : solution homogène",
      contenu: (
        <>
          <p>{sel ? "Le sel n'a pas disparu : ses ions se sont séparés et dispersés dans l'eau." : "Le sucre n'a pas disparu : ses molécules se sont dispersées dans l'eau, toujours neutres."}</p>
          <Tex bloc expr={sel ? TEX_EQUATIONS.dissolutionNaCl : TEX_EQUATIONS.dissolutionSaccharose} />
        </>
      ),
    },
    {
      titre: "Concentration apportée",
      contenu: (
        <>
          <Tex bloc expr={String.raw`n = \dfrac{m}{M} = \dfrac{${fr(p.masse, 3).replace(",", "{,}")}\ \text{g}}{${fr(M, 2).replace(",", "{,}")}\ \text{g/mol}} = ${fr(n, 4).replace(",", "{,}")}\ \text{mol}`} />
          <Tex bloc expr={String.raw`C = \dfrac{n}{V} = \dfrac{${fr(n, 4).replace(",", "{,}")}\ \text{mol}}{${fr(p.volume, 2).replace(",", "{,}")}\ \text{L}} = ${fr(C, 3).replace(",", "{,}")}\ \text{mol/L}`} />
        </>
      ),
    },
    {
      titre: "Pourquoi ça conduit (ou non)",
      contenu: <p>{sel ? `La solution contient des ions mobiles : [Na⁺] = [Cl⁻] = ${fr(C, 3)} mol/L. Elle conduit le courant.` : "Aucun ion n'est apporté par le sucre : la solution reste très peu conductrice (seulement les traces d'ions de l'eau)."}</p>,
    },
  ];

  return (
    <CadreChimie
      titre={vue === "dissolution" ? `Dissolution ${sel ? "du sel" : "du sucre"}` : "Comparaison de conductivité"}
      scene={
        <>
          <div role="group" aria-label="Choix de l'expérience" className="flex flex-wrap gap-2">
            <Pastille actif={vue === "dissolution"} onClick={() => setVue("dissolution")}>
              Dissolution
            </Pastille>
            <Pastille actif={vue === "conductivite"} onClick={() => setVue("conductivite")}>
              Conductivité
            </Pastille>
          </div>
          {vue === "dissolution" ? <Scene p={p} t={h.t} opts={opts} sel={sel} /> : <SceneConductivite t={h.t} C={C} />}
          <Legende
            elements={
              vue === "dissolution" && !sel
                ? [
                    { symbole: "C₁₂H₂₂O₁₁", libelle: "molécule de saccharose (neutre)", couleur: CC.sucreBord },
                    { symbole: "O", libelle: "oxygène (rouge)", couleur: CC.oxygene },
                    { symbole: "H", libelle: "hydrogène (blanc)", couleur: "#64748B" },
                  ]
                : [
                    { symbole: "Na⁺", libelle: "ion sodium", couleur: CC.sodium },
                    { symbole: "Cl⁻", libelle: "ion chlorure", couleur: CC.chlorure },
                    { symbole: "O", libelle: "oxygène (rouge)", couleur: CC.oxygene },
                    { symbole: "H", libelle: "hydrogène (blanc)", couleur: "#64748B" },
                  ]
            }
          />
          <NoteEchelle>Les nombres de particules dessinés sont une représentation pédagogique, pas le comptage réel des particules d&apos;un bécher.</NoteEchelle>
        </>
      }
      commandes={
        <div className="flex min-w-0 flex-col gap-3">
          {vue === "dissolution" && (
            <div>
              <Bouton onClick={h.recommencer} variante="plein">
                <IconSalt size={18} aria-hidden="true" />
                {sel ? "Ajouter le sel" : "Ajouter le sucre"}
              </Bouton>
            </div>
          )}
          <BarreLecture h={h} duree={DUREE_DISSOLUTION} onReinitialiser={reprendre} />
        </div>
      }
      parametres={
        <>
          <div role="group" aria-label="Type de soluté" className="flex flex-wrap gap-2">
            <Pastille actif={sel} onClick={() => changer("sel")}>
              Sel (NaCl)
            </Pastille>
            <Pastille actif={!sel} onClick={() => changer("sucre")}>
              Sucre
            </Pastille>
          </div>
          <Curseur etiquette="Masse introduite" valeur={p.masse} min={bm.min} max={bm.max} pas={sel ? 0.1 : 0.5} decimales={sel ? 3 : 2} onChange={(v) => { setP((q) => ({ ...q, masse: v })); h.arreter(); }} unite="g" />
          <Curseur etiquette="Volume de la solution" valeur={p.volume} min={0.1} max={1} pas={0.05} decimales={2} onChange={(v) => { setP((q) => ({ ...q, volume: v })); h.arreter(); }} unite="L" />
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Molécules d'eau" coche={opts.molecules} onChange={(v) => setOpts((o) => ({ ...o, molecules: v }))} />
          <Interrupteur etiquette={sel ? "Ions" : "Molécules de sucre"} coche={opts.ions || !sel} onChange={(v) => setOpts((o) => ({ ...o, ions: v }))} />
          <Interrupteur etiquette="Molécules d'hydratation" coche={opts.hydratation} onChange={(v) => setOpts((o) => ({ ...o, hydratation: v }))} />
        </>
      }
      resultats={
        <>
          <Equation titre="Équation de dissolution" expr={sel ? TEX_EQUATIONS.dissolutionNaCl : TEX_EQUATIONS.dissolutionSaccharose} />
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="Quantité n = m/M">{fr(n, 4)} mol</Valeur>
            <Valeur etiquette="Concentration C = n/V">{fr(C, 3)} mol/L</Valeur>
            {sel ? (
              <>
                <Valeur etiquette="[Na⁺]">{fr(C, 3)} mol/L</Valeur>
                <Valeur etiquette="[Cl⁻]">{fr(C, 3)} mol/L</Valeur>
              </>
            ) : (
              <Valeur etiquette="Ions apportés">aucun</Valeur>
            )}
            <Valeur etiquette="Conductivité (qualitatif)">{niveauConductivite(sel ? "sel" : "sucre", C)}</Valeur>
          </div>
          <p className="rounded-lg bg-white px-3 py-2 text-sm text-fh-ardoise">
            Porteurs de charge : {porteursDeCharge(sel ? "sel" : "sucre")}.
          </p>
          <p className="text-xs text-fh-ardoise/70">Aucune solubilité ni vitesse de dissolution n&apos;est modélisée ici.</p>
        </>
      }
      principe={
        <p className="text-sm text-fh-ardoise">
          Quand un solide « disparaît » dans l&apos;eau, la matière ne disparaît pas. NaCl : les ions déjà présents se séparent (dissociation) puis s&apos;entourent d&apos;eau (hydratation). Saccharose : les molécules neutres se dispersent sans former d&apos;ions.
        </p>
      }
      etapes={etapes}
      questions={questionsDissolution(p)}
      onReprendre={reprendre}
    />
  );
}
