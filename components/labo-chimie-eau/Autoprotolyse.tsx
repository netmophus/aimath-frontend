"use client";

import { useMemo, useState } from "react";

import { Ke, PKE, TEMPERATURES_PRISES_EN_CHARGE, TEX_EQUATIONS, concentrationEauPure, fr, moleculesPourUnIon, pHNeutre, pKe, sup, texNombre, texteNombre, type Temperature } from "@/lib/chimieEau";
import { AUTOPROTOLYSE_DEFAUT, questionsAutoprotolyse, type ParamsAutoprotolyse } from "@/lib/chimieEauExercices";
import { Alerte, BarreLecture, CadreChimie, CC, Equation, Legende, NoteEchelle, Pastille, Tex, Valeur, useHorloge } from "./ui";
import { Eau, douceur, melange } from "./Particules";

const DUREE = 12;
const PERIODE = 6;
const PAIRES = [
  { x: 120, y: 112, decalage: 0 },
  { x: 335, y: 175, decalage: 3 },
] as const;
const ESPACE = 46;

/** Avancement u ∈ [0,1] du transfert de proton pour une paire (0 : 2 H₂O, 1 : H₃O⁺ + OH⁻), cyclique de période 6 s. */
export function avancementTransfert(t: number, decalage: number): number {
  if (t < decalage) return 0;
  const tau = (t - decalage) % PERIODE;
  if (tau < 1) return 0;
  if (tau < 2) return douceur(tau - 1);
  if (tau < 3.5) return 1;
  if (tau < 4.5) return 1 - douceur(tau - 3.5);
  return 0;
}

function Paire({ x, y, u, t }: { x: number; y: number; u: number; t: number }) {
  const D = { x, y };
  const A = { x, y: y + ESPACE };
  const depart = { x: D.x, y: D.y + 12.5 };
  const arrivee = { x: A.x, y: A.y - 12 };
  const H = { x: melange(depart.x, arrivee.x, u), y: melange(depart.y, arrivee.y, u) };
  const hD = { x: D.x + 12.5 * Math.cos((194.5 * Math.PI) / 180), y: D.y + 12.5 * Math.sin((194.5 * Math.PI) / 180) };
  const hs = [30, 150].map((a) => ({ x: A.x + 12 * Math.cos((a * Math.PI) / 180), y: A.y + 12 * Math.sin((a * Math.PI) / 180) }));
  const ions = Math.max(0, (u - 0.5) * 2);
  return (
    <g aria-hidden="true">
      {u < 0.05 && <line x1={H.x} y1={H.y} x2={arrivee.x} y2={arrivee.y} stroke="#38BDF8" strokeWidth={1.8} strokeDasharray="3 3" opacity={0.6 + 0.4 * Math.sin(t * 4) ** 2} />}
      {/* donneur : O + H restant (+ H qui part) */}
      <line x1={D.x} y1={D.y} x2={hD.x} y2={hD.y} stroke="#94A3B8" strokeWidth={2.2} />
      <circle cx={hD.x} cy={hD.y} r={4.6} fill={CC.hydrogene} stroke={CC.hydrogeneBord} strokeWidth={1.2} />
      {u < 0.5 && <line x1={D.x} y1={D.y} x2={H.x} y2={H.y} stroke="#94A3B8" strokeWidth={2.2} opacity={1 - 2 * u} />}
      <circle cx={D.x} cy={D.y} r={8.2} fill={CC.oxygene} stroke="#7F1D1D" strokeWidth={1} />
      {/* accepteur : O + 2 H (+ H reçu) */}
      {hs.map((h, k) => (
        <g key={k}>
          <line x1={A.x} y1={A.y} x2={h.x} y2={h.y} stroke="#94A3B8" strokeWidth={2.2} />
          <circle cx={h.x} cy={h.y} r={4.6} fill={CC.hydrogene} stroke={CC.hydrogeneBord} strokeWidth={1.2} />
        </g>
      ))}
      {u >= 0.5 && <line x1={A.x} y1={A.y} x2={H.x} y2={H.y} stroke="#94A3B8" strokeWidth={2.2} opacity={ions} />}
      <circle cx={A.x} cy={A.y} r={8.2} fill={CC.oxygene} stroke="#7F1D1D" strokeWidth={1} />
      <circle cx={H.x} cy={H.y} r={4.8} fill={CC.hydrogene} stroke={u > 0.02 && u < 0.98 ? CC.plus : CC.hydrogeneBord} strokeWidth={u > 0.02 && u < 0.98 ? 2 : 1.2} />
      {/* badges de charge et formules */}
      <g opacity={ions}>
        <circle cx={D.x - 12} cy={D.y - 11} r={6} fill="#fff" stroke={CC.moins} strokeWidth={1.4} />
        <text x={D.x - 12} y={D.y - 7} textAnchor="middle" fontSize={11} fontWeight={800} fill={CC.moins}>
          −
        </text>
        <text x={D.x - 22} y={D.y + 4} textAnchor="end" fontSize={11} fontWeight={800} fill={CC.moins}>
          OH⁻
        </text>
        <circle cx={A.x + 12} cy={A.y + 12} r={6} fill="#fff" stroke={CC.plus} strokeWidth={1.4} />
        <text x={A.x + 12} y={A.y + 16} textAnchor="middle" fontSize={11} fontWeight={800} fill={CC.plus}>
          +
        </text>
        <text x={A.x + 22} y={A.y + 26} fontSize={11} fontWeight={800} fill={CC.plus}>
          H₃O⁺
        </text>
      </g>
      {u < 0.05 && (
        <text x={A.x + 22} y={A.y + 4} fontSize={10} fontWeight={700} fill="#475569">
          2 H₂O
        </text>
      )}
    </g>
  );
}

function SceneMicro({ t }: { t: number }) {
  const autres = useMemo(() => {
    const pts: Array<{ x: number; y: number }> = [];
    for (let j = 0; j < 4; j++) for (let i = 0; i < 7; i++) pts.push({ x: 38 + i * 64, y: 62 + j * 66 });
    return pts.filter((p) => PAIRES.every((q) => Math.hypot(p.x - q.x, p.y - (q.y + ESPACE / 2)) > 58));
  }, []);
  const etape = (t % PERIODE) < 1 ? "approche" : (t % PERIODE) < 2 ? "transfert" : (t % PERIODE) < 3.5 ? "ions formés" : (t % PERIODE) < 4.5 ? "réaction inverse" : "retour à 2 H₂O";
  return (
    <svg viewBox="0 0 460 300" role="img" aria-label={`Autoprotolyse de l'eau, vue microscopique illustrative : ${etape}`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <text x={12} y={22} fontSize={14} fontWeight={800} fill={CC.encre}>
        Vue microscopique illustrative · {etape}
      </text>
      {autres.map((p, k) => (
        <Eau key={k} x={p.x + 4 * Math.sin(t * 1.1 + k)} y={p.y + 3 * Math.cos(t * 0.9 + k * 1.3)} rot={50 * k + 25 * Math.sin(t * 0.8 + k)} s={0.95} o={0.8} />
      ))}
      {PAIRES.map((p, k) => (
        <Paire key={k} x={p.x} y={p.y} u={avancementTransfert(t, p.decalage)} t={t} />
      ))}
      <text x={230} y={279} textAnchor="middle" fontSize={11} fill="#475569">
        Schéma NON à l&apos;échelle : ici 2 ions pour ~40 molécules ;
      </text>
      <text x={230} y={294} textAnchor="middle" fontSize={11} fill="#475569">
        en réalité, 1 molécule sur ~5,5 × 10⁸ est ionisée à 25 °C.
      </text>
    </svg>
  );
}

function GrapheLog({ T }: { T: Temperature }) {
  const h = concentrationEauPure(T);
  const X0 = 96;
  const X1 = 436;
  const x = (c: number) => X0 + ((Math.log10(Math.max(c, 1e-14)) + 14) / 14) * (X1 - X0);
  const barres = [
    { nom: "[H₃O⁺]", c: h, couleur: CC.plus, y: 62 },
    { nom: "[OH⁻]", c: h, couleur: CC.moins, y: 108 },
    { nom: "[H₂O]", c: 55.5, couleur: CC.eau, y: 154 },
  ];
  return (
    <svg viewBox="0 0 460 250" role="img" aria-label={`Concentrations de l'eau pure à ${T} °C sur une échelle logarithmique : H₃O⁺ et OH⁻ valent ${texteNombre(h)} mol/L`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-white">
      <text x={12} y={22} fontSize={14} fontWeight={800} fill={CC.encre}>
        Vue quantitative · échelle logarithmique ({T} °C)
      </text>
      {[-14, -12, -10, -8, -6, -4, -2, 0].map((k) => (
        <g key={k}>
          <line x1={x(10 ** k)} y1={42} x2={x(10 ** k)} y2={196} stroke="#E2E8F0" strokeWidth={1} />
          <text x={x(10 ** k)} y={212} textAnchor="middle" fontSize={11} fill="#475569">
            10{sup(k)}
          </text>
        </g>
      ))}
      <text x={(X0 + X1) / 2} y={236} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">
        concentration (mol/L), échelle logarithmique
      </text>
      {barres.map((b) => (
        <g key={b.nom}>
          <text x={X0 - 8} y={b.y + 5} textAnchor="end" fontSize={13} fontWeight={800} fill={CC.encre}>
            {b.nom}
          </text>
          <rect x={X0} y={b.y - 14} width={Math.max(2, x(b.c) - X0)} height={28} rx={4} fill={b.couleur} opacity={0.85} />
          <text x={Math.min(x(b.c) + 6, X1 - 70)} y={b.y + 5} fontSize={12} fontWeight={800} fill={x(b.c) + 6 > X1 - 76 ? "#fff" : CC.encre}>
            {texteNombre(b.c)}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function Autoprotolyse({ initial = AUTOPROTOLYSE_DEFAUT }: { initial?: ParamsAutoprotolyse }) {
  const [p, setP] = useState<ParamsAutoprotolyse>(initial);
  const [vue, setVue] = useState<"micro" | "quanti">("micro");
  const h = useHorloge(DUREE);
  const T = p.T;
  const hh = concentrationEauPure(T);
  const reprendre = () => {
    setP(initial);
    setVue("micro");
    h.arreter();
  };
  const pk = pKe(T);
  const pkTex = fr(pk, 2).replace(",", "{,}");

  const etapes = [
    { titre: "La réaction d'autoprotolyse", contenu: (<><Tex bloc expr={TEX_EQUATIONS.autoprotolyse} /><p>Une molécule d&apos;eau cède un proton à une autre : elle devient <Tex expr={String.raw`\mathrm{OH^-}`} />, l&apos;autre devient <Tex expr={String.raw`\mathrm{H_3O^+}`} />.</p></>) },
    { titre: "Un équilibre dynamique", contenu: <p>La réaction inverse existe aussi : à l&apos;équilibre, des ions continuent à se former et à disparaître, mais leurs concentrations moyennes restent constantes. (Les instants des événements dessinés sont qualitatifs : aucune cinétique n&apos;est modélisée.)</p> },
    { titre: "Le produit ionique", contenu: <Tex bloc expr={String.raw`K_e = [\mathrm{H_3O^+}]\,[\mathrm{OH^-}] = 10^{-pK_e}`} /> },
    { titre: `Eau pure à ${T} °C`, contenu: (<><p>Dans l&apos;eau pure, <Tex expr={String.raw`[\mathrm{H_3O^+}] = [\mathrm{OH^-}]`} />, donc :</p><Tex bloc expr={String.raw`[\mathrm{H_3O^+}]^2 = K_e = 10^{-${pkTex}}`} /><Tex bloc expr={String.raw`[\mathrm{H_3O^+}] = [\mathrm{OH^-}] = \sqrt{K_e} = ${texNombre(hh)}\ \text{mol/L}`} /></>) },
    { titre: "Le pH de neutralité", contenu: (<><Tex bloc expr={String.raw`\mathrm{pH}_{\text{neutre}} = \dfrac{pK_e}{2} = \dfrac{${pkTex}}{2} = ${fr(pHNeutre(T), 3).replace(",", "{,}")}`} />{T === 25 ? <p>À 25 °C : pH = 7.</p> : <p>À {T} °C, le pH de neutralité n&apos;est pas 7 : l&apos;eau pure reste neutre ([H₃O⁺] = [OH⁻]) même si son pH diffère de 7.</p>}</>) },
    { titre: "Très peu d'ions", contenu: <p>Dans 55,5 mol/L de molécules d&apos;eau, il y a {texteNombre(hh)} mol/L d&apos;ions de chaque sorte : environ 1 molécule sur {texteNombre(moleculesPourUnIon(T), 2)} est ionisée. L&apos;eau est très peu ionisée.</p> },
  ];

  return (
    <CadreChimie
      titre="Autoprotolyse de l'eau"
      alerte={T !== 25 ? <Alerte ton="info">À {T} °C, pKe ≈ {fr(pk, 2)} : le pH de neutralité vaut ≈ {fr(pHNeutre(T), 2)}. Une eau pure à ce pH est neutre, pas acide.</Alerte> : undefined}
      scene={
        <>
          <div role="group" aria-label="Vue" className="flex flex-wrap gap-2">
            <Pastille actif={vue === "micro"} onClick={() => setVue("micro")}>
              Vue microscopique
            </Pastille>
            <Pastille actif={vue === "quanti"} onClick={() => setVue("quanti")}>
              Vue quantitative
            </Pastille>
          </div>
          {vue === "micro" ? <SceneMicro t={h.t} /> : <GrapheLog T={T} />}
          <Legende
            elements={[
              { symbole: "H₂O", libelle: "eau (O rouge, H blanc)", couleur: CC.oxygene },
              { symbole: "H₃O⁺", libelle: "ion oxonium (badge +)", couleur: CC.plus },
              { symbole: "OH⁻", libelle: "ion hydroxyde (badge −)", couleur: CC.moins },
            ]}
          />
          <NoteEchelle>Le schéma microscopique n&apos;est pas à l&apos;échelle des concentrations : seule la vue quantitative donne les valeurs.</NoteEchelle>
        </>
      }
      commandes={vue === "micro" ? <BarreLecture h={h} duree={DUREE} onReinitialiser={reprendre} /> : undefined}
      parametres={
        <>
          <div role="group" aria-label="Température" className="flex flex-wrap gap-2">
            {TEMPERATURES_PRISES_EN_CHARGE.map((t) => (
              <Pastille key={t} actif={T === t} onClick={() => setP({ T: t })}>
                {t} °C
              </Pastille>
            ))}
          </div>
          <p className="text-xs text-fh-ardoise/70">Trois températures de référence (valeurs de pKe arrondies, donc approximatives) ; aucune interpolation entre elles.</p>
        </>
      }
      resultats={
        <>
          <Equation titre="Autoprotolyse" expr={TEX_EQUATIONS.autoprotolyse} />
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="pKe (approximatif)">{fr(pk, 2)}</Valeur>
            <Valeur etiquette="Ke = 10^(−pKe)">{texteNombre(Ke(T))}</Valeur>
            <Valeur etiquette="[H₃O⁺] = [OH⁻]">{texteNombre(hh)} mol/L</Valeur>
            <Valeur etiquette="pH de neutralité">≈ {fr(pHNeutre(T), 2)}</Valeur>
          </div>
          <table className="w-full min-w-0 text-left text-xs text-fh-ardoise">
            <caption className="mb-1 text-left text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">pKe de référence</caption>
            <tbody>
              {TEMPERATURES_PRISES_EN_CHARGE.map((t) => (
                <tr key={t} className={t === T ? "bg-sky-100 font-bold" : ""}>
                  <th scope="row" className="px-2 py-1 font-semibold">{t} °C</th>
                  <td className="px-2 py-1">≈ {fr(PKE[t], 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      }
      principe={<p className="text-sm text-fh-ardoise">L&apos;eau pure contient naturellement quelques ions, formés par autoprotolyse. C&apos;est un équilibre : la réaction a lieu dans les deux sens, et {`[H₃O⁺][OH⁻] = Ke`}.</p>}
      etapes={etapes}
      questions={questionsAutoprotolyse(p)}
      onReprendre={reprendre}
    />
  );
}
