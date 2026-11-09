"use client";

import { useMemo, useState } from "react";

import { C_MAX_ACIDE_FORT, C_MIN_ACIDE_FORT, TEX_EQUATIONS, concentrationMolaire, fr, pHAcideFort, texNombre, validiteAcideFort } from "@/lib/chimieEau";
import { IONISATION_DEFAUT, questionsIonisation, type ParamsIonisation } from "@/lib/chimieEauExercices";
import { Alerte, BarreLecture, CadreChimie, CC, Curseur, Equation, Interrupteur, Legende, NoteEchelle, Pastille, Tex, Valeur, elargir, useHorloge } from "./ui";
import { Chlorure, Eau, Oxonium, douceur, melange } from "./Particules";

const DUREE = 9;
const CIBLE = { x: 300, y: 170 };
const CL0 = { x: 90, y: 60 };
const LIAISON = 17;

const DECOR = [
  [60, 210],
  [130, 255],
  [215, 245],
  [270, 262],
  [350, 255],
  [420, 160],
  [425, 255],
  [55, 140],
  [395, 85],
  [190, 130],
] as const;

type Opts = { ions: boolean; polarite: boolean };

function etiquetteEtape(t: number): string {
  if (t < 1.5) return "1/5 · HCl et l'eau : molécules neutres";
  if (t < 4) return "2/5 · HCl s'approche d'une molécule d'eau";
  if (t < 5.5) return "3/5 · transfert du proton H⁺ vers l'oxygène";
  if (t < 6) return "4/5 · H₃O⁺ et Cl⁻ sont formés";
  return "5/5 · hydratation et dispersion des ions";
}

function Scene({ t, opts, compact = false }: { t: number; opts: Opts; compact?: boolean }) {
  const a = Math.atan2(CIBLE.y - CL0.y, CIBLE.x - CL0.x);
  const ua = douceur((t - 1.5) / 2.5);
  const alpha = melange(a, Math.PI / 2, ua);
  const cl = { x: melange(CL0.x, CIBLE.x, ua), y: melange(CL0.y, 128, ua) };
  const ut = douceur((t - 4) / 1.5);
  const dispersion = douceur((t - 6) / 3);
  const avantTransfert = t < 4;
  const Hfin = { x: 300, y: 157 };
  const H0 = { x: cl.x + LIAISON * Math.cos(alpha), y: cl.y + LIAISON * Math.sin(alpha) };
  const H = t < 4 ? H0 : { x: melange(H0.x, Hfin.x, ut), y: melange(H0.y, Hfin.y, ut) };
  const clFinal = { x: melange(300, 120, dispersion), y: melange(128, 85, dispersion) };
  const oxFinal = { x: melange(300, 375, dispersion), y: melange(170, 215, dispersion) };
  const ions = t >= 5.5;
  const bulk = useMemo(() => DECOR, []);
  const hydrate = douceur((t - 6) / 2);
  const shellCl = [0, 72, 144, 216, 288].map((phi, k) => ({ phi: phi + 20, k }));
  const shellOx = [60, 180, 300].map((phi, k) => ({ phi, k }));

  return (
    <svg viewBox="0 0 460 300" role="img" aria-label={`Ionisation de HCl dans l'eau, étape ${etiquetteEtape(t)}`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      {!compact && (
        <text x={12} y={22} fontSize={14} fontWeight={800} fill={CC.encre}>
          {etiquetteEtape(t)}
        </text>
      )}
      {bulk.map(([x, y], k) => (
        <Eau key={k} x={x + 3 * Math.sin(t * 1.2 + k)} y={y + 2 * Math.cos(t + k)} rot={40 * k + 15 * Math.sin(t + k)} s={0.9} o={0.5} />
      ))}
      {/* molécule d'eau cible, puis ion oxonium */}
      {!ions ? (
        <g>
          <Eau x={CIBLE.x} y={CIBLE.y} rot={0} s={1.15} delta={opts.polarite && t < 4} />
          {t >= 4 && (
            <line x1={CIBLE.x} y1={CIBLE.y} x2={Hfin.x} y2={Hfin.y} stroke="#94A3B8" strokeWidth={2.4} opacity={ut} />
          )}
        </g>
      ) : (
        opts.ions && (
          <Oxonium x={oxFinal.x} y={oxFinal.y} s={1.15} />
        )
      )}
      {/* HCl : Cl, H et liaison */}
      {!ions && (
        <g aria-hidden="true">
          {avantTransfert || ut < 1 ? <line x1={cl.x} y1={cl.y} x2={H.x} y2={H.y} stroke="#94A3B8" strokeWidth={2.4} opacity={t < 4 ? 1 : 1 - ut} strokeDasharray={t >= 4 ? "4 3" : undefined} /> : null}
          <circle cx={cl.x} cy={cl.y} r={13} fill={CC.chlorure} stroke="#14532D" strokeWidth={1} />
          <circle cx={H.x} cy={H.y} r={5.4} fill={CC.hydrogene} stroke={CC.hydrogeneBord} strokeWidth={1.2} />
          {opts.polarite && t < 4 && (
            <g fontSize={11} fontWeight={800}>
              <text x={cl.x - 14} y={cl.y - 16} fill={CC.chlorure}>
                δ−
              </text>
              <text x={H.x + 8} y={H.y - 8} fill="#475569">
                δ+
              </text>
            </g>
          )}
          {t < 4 && (
            <text x={cl.x} y={cl.y + 32} textAnchor="middle" fontSize={11} fontWeight={800} fill={CC.encre}>
              HCl
            </text>
          )}
          {t >= 4 && ut < 1 && (
            <text x={H.x + 14} y={H.y} fontSize={11} fontWeight={800} fill={CC.plus}>
              H⁺ transféré
            </text>
          )}
        </g>
      )}
      {ions && opts.ions && (
        <g>
          <Chlorure x={clFinal.x} y={clFinal.y} />
          <text x={clFinal.x} y={clFinal.y + 46} textAnchor="middle" fontSize={12} fontWeight={800} fill={CC.chlorure}>
            Cl⁻
          </text>
          <text x={oxFinal.x} y={oxFinal.y + 50} textAnchor="middle" fontSize={12} fontWeight={800} fill={CC.plus}>
            H₃O⁺
          </text>
        </g>
      )}
      {/* hydratation des deux ions */}
      {ions && hydrate > 0.01 && (
        <g>
          {shellCl.map(({ phi, k }) => {
            const R = 25;
            const cx = clFinal.x + R * Math.cos((phi * Math.PI) / 180);
            const cy = clFinal.y + R * Math.sin((phi * Math.PI) / 180);
            const [bx, by] = bulk[(k + 2) % bulk.length];
            return <Eau key={`c${k}`} x={melange(bx, cx, hydrate)} y={melange(by, cy, hydrate)} rot={phi + 90} s={0.65} o={hydrate} />;
          })}
          {shellOx.map(({ phi, k }) => {
            const R = 30;
            const cx = oxFinal.x + R * Math.cos((phi * Math.PI) / 180);
            const cy = oxFinal.y + R * Math.sin((phi * Math.PI) / 180);
            const [bx, by] = bulk[(k + 5) % bulk.length];
            return <Eau key={`o${k}`} x={melange(bx, cx, hydrate)} y={melange(by, cy, hydrate)} rot={phi - 90} s={0.65} o={hydrate} />;
          })}
        </g>
      )}
      <text x={230} y={290} textAnchor="middle" fontSize={11} fill="#475569">
        Schéma pédagogique simplifié (aucun proton libre durable dans l&apos;eau).
      </text>
    </svg>
  );
}

const IMAGES_CLES = [
  { t: 0.5, legende: "1. Avant" },
  { t: 3.4, legende: "2. Approche" },
  { t: 4.8, legende: "3. Transfert" },
  { t: 8.8, legende: "4. Après" },
];

export default function Ionisation({ initial = IONISATION_DEFAUT }: { initial?: ParamsIonisation }) {
  const [p, setP] = useState<ParamsIonisation>(initial);
  const [opts, setOpts] = useState<Opts>({ ions: true, polarite: true });
  const [mode, setMode] = useState<"animation" | "images">("animation");
  const h = useHorloge(DUREE);
  const C = concentrationMolaire(p.n, p.V);
  const validite = validiteAcideFort(C);
  const ph = pHAcideFort(C);
  const reprendre = () => {
    setP(initial);
    setMode("animation");
    h.arreter();
  };
  const bn = elargir(p.n, 0.001, 1);
  const bV = elargir(p.V, 0.1, 2);
  const cTex = texNombre(C);

  const etapes = [
    { titre: "HCl : molécule neutre, liaison polarisée", contenu: (<><p>La molécule HCl est électriquement neutre, mais sa liaison est polarisée : le chlore, plus électronégatif, porte une charge partielle négative.</p><Tex bloc expr={String.raw`\mathrm{H}^{\delta+}\!-\!\mathrm{Cl}^{\delta-}`} /></>) },
    { titre: "Approche d'une molécule d'eau", contenu: <p>L&apos;atome d&apos;hydrogène de HCl (δ+) est attiré par l&apos;oxygène (δ−) d&apos;une molécule d&apos;eau.</p> },
    { titre: "Transfert du proton", contenu: <p>HCl cède un proton H⁺ à l&apos;oxygène de l&apos;eau : l&apos;eau devient l&apos;ion oxonium <Tex expr={String.raw`\mathrm{H_3O^+}`} />, et HCl devient l&apos;ion chlorure <Tex expr={String.raw`\mathrm{Cl^-}`} />.</p> },
    { titre: "Équation de la réaction", contenu: (<><Tex bloc expr={TEX_EQUATIONS.ionisationHCl} /><p>Atomes : H (1 + 2 = 3), O (1), Cl (1). Charges : 0 = (+1) + (−1).</p></>) },
    { titre: "Hydratation et dispersion", contenu: <p>Les ions formés sont entourés de molécules d&apos;eau (hydratation) et se dispersent : la solution contient maintenant des ions mobiles.</p> },
    {
      titre: "Calcul du pH (modèle dilué)",
      contenu: validite === "ok" && ph !== null ? (
        <>
          <Tex bloc expr={String.raw`C = \dfrac{n}{V} = \dfrac{${fr(p.n, 4).replace(",", "{,}")}\ \text{mol}}{${fr(p.V, 2).replace(",", "{,}")}\ \text{L}} = ${cTex}\ \text{mol/L}`} />
          <Tex bloc expr={String.raw`[\mathrm{H_3O^+}] \approx C = ${cTex}\ \text{mol/L}`} />
          <Tex bloc expr={String.raw`\mathrm{pH} = -\log C = ${fr(ph, 2).replace(",", "{,}")}`} />
          <p>Cette égalité suppose HCl pratiquement totalement transformé et une solution assez diluée pour que l&apos;autoprotolyse de l&apos;eau soit négligeable. Elle ne se généralise pas à tous les acides.</p>
        </>
      ) : (
        <p>Avec C = {fr(C, 3)} mol/L, la concentration sort du domaine de validité du calcul simplifié ({fr(C_MIN_ACIDE_FORT, 6)} à {fr(C_MAX_ACIDE_FORT, 1)} mol/L) : on ne calcule pas de pH ici.</p>
      ),
    },
  ];

  return (
    <CadreChimie
      titre="Ionisation de HCl dans l'eau"
      alerte={validite !== "ok" ? <Alerte>{validite === "trop-concentre" ? `Avec C = ${fr(C, 2)} mol/L, la solution est trop concentrée : le calcul simplifié du pH (pH = −log C) n'est plus suffisamment fiable (domaine : jusqu'à ${fr(C_MAX_ACIDE_FORT, 1)} mol/L).` : `Avec C = ${texNombre(C)} mol/L, la solution est trop diluée : l'autoprotolyse de l'eau n'est plus négligeable, le calcul simplifié n'est plus fiable.`}</Alerte> : undefined}
      scene={
        <>
          <div role="group" aria-label="Mode de visualisation du transfert" className="flex flex-wrap gap-2">
            <Pastille actif={mode === "animation"} onClick={() => setMode("animation")}>
              Animation
            </Pastille>
            <Pastille actif={mode === "images"} onClick={() => { setMode("images"); h.pause(); }}>
              Images clés
            </Pastille>
          </div>
          {mode === "animation" ? (
            <Scene t={h.t} opts={opts} />
          ) : (
            <ol className="grid min-w-0 grid-cols-1 gap-3 @lg:grid-cols-2">
              {IMAGES_CLES.map((k) => (
                <li key={k.t} className="min-w-0">
                  <p className="mb-1 text-xs font-bold text-[#102A66]">{k.legende}</p>
                  <Scene t={k.t} opts={opts} compact />
                </li>
              ))}
            </ol>
          )}
          <Legende
            elements={[
              { symbole: "Cl", libelle: "chlore / ion Cl⁻ (vert)", couleur: CC.chlorure },
              { symbole: "O", libelle: "oxygène (rouge)", couleur: CC.oxygene },
              { symbole: "H", libelle: "hydrogène (blanc)", couleur: "#64748B" },
              { symbole: "+ / −", libelle: "charge de l'ion (badge)", couleur: CC.encre },
            ]}
          />
          <NoteEchelle>Modèle simplifié : le transfert de proton est schématisé en quelques images clairement identifiées comme un modèle.</NoteEchelle>
        </>
      }
      commandes={mode === "animation" ? <BarreLecture h={h} duree={DUREE} onReinitialiser={reprendre} /> : undefined}
      parametres={
        <>
          <Curseur etiquette="Quantité de HCl n" valeur={p.n} min={bn.min} max={bn.max} pas={0.001} decimales={3} onChange={(v) => setP((q) => ({ ...q, n: v }))} unite="mol" />
          <Curseur etiquette="Volume final V" valeur={p.V} min={bV.min} max={bV.max} pas={0.1} decimales={1} onChange={(v) => setP((q) => ({ ...q, V: v }))} unite="L" />
          <Valeur etiquette="Concentration apportée C = n/V">{fr(C, 4)} mol/L</Valeur>
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Ions" coche={opts.ions} onChange={(v) => setOpts((o) => ({ ...o, ions: v }))} />
          <Interrupteur etiquette="Liaisons polarisées" coche={opts.polarite} onChange={(v) => setOpts((o) => ({ ...o, polarite: v }))} />
        </>
      }
      resultats={
        <>
          <Equation titre="HCl avec l'eau" expr={TEX_EQUATIONS.ionisationHClEtats} />
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="C = n/V">{fr(C, 4)} mol/L</Valeur>
            <Valeur etiquette="[H₃O⁺] ≈ C">{validite === "ok" ? `${fr(C, 4)} mol/L` : "non calculée"}</Valeur>
            <Valeur etiquette="pH ≈ −log C">{ph !== null ? fr(ph, 2) : "non calculé"}</Valeur>
            <Valeur etiquette="Charge de la solution">0 (neutre)</Valeur>
          </div>
          <div className="grid min-w-0 gap-2">
            <Equation titre="NaCl : les ions existent déjà dans le cristal" expr={TEX_EQUATIONS.dissolutionNaCl} />
            <Equation titre="HCl : une réaction avec l'eau forme les ions" expr={TEX_EQUATIONS.ionisationHClEtats} />
          </div>
        </>
      }
      principe={<p className="text-sm text-fh-ardoise">Un composé ionique comme NaCl libère des ions qui existaient déjà. Une molécule neutre comme HCl réagit avec l&apos;eau : le transfert d&apos;un proton crée des ions hydratés.</p>}
      etapes={etapes}
      questions={questionsIonisation(p)}
      onReprendre={reprendre}
    />
  );
}
