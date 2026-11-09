"use client";

import { useState } from "react";

import {
  CONCENTRATION_MAX_MODELE,
  PH_MAX_AFFICHE,
  PH_MIN_AFFICHE,
  TEMPERATURES_PRISES_EN_CHARGE,
  etatDepuisH3O,
  etatDepuisOH,
  etatDepuisPH,
  facteurH3O,
  fr,
  lireNombreChimie,
  pHNeutre,
  pKe,
  sup,
  texNombre,
  texteNombre,
  type EtatPH,
  type Temperature,
} from "@/lib/chimieEau";
import { PH_DEFAUT, questionsPH, type ParamsPH } from "@/lib/chimieEauExercices";
import { Alerte, Bouton, CadreChimie, CC, Curseur, Equation, Interrupteur, Legende, Pastille, Tex, Valeur } from "./ui";
import { Becher } from "./Particules";

type ModeSaisie = "ph" | "h3o" | "oh";
type Indicateur = "aucun" | "bbt";

/** Couleur illustrative du bleu de bromothymol (jaune en dessous de pH 6,0, bleu au-dessus de 7,6). */
function couleurBBT(valeurPH: number): string {
  const u = Math.min(1, Math.max(0, (valeurPH - 6) / 1.6));
  const jaune = [250, 204, 21];
  const vert = [34, 197, 94];
  const bleu = [37, 99, 235];
  const [a, b, v] = u < 0.5 ? [jaune, vert, u * 2] : [vert, bleu, (u - 0.5) * 2];
  return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * v)).join(",")})`;
}

function SceneEchelle({ e, T, indicateur }: { e: EtatPH; T: Temperature; indicateur: Indicateur }) {
  const X0 = 30;
  const X1 = 430;
  const xpH = (v: number) => X0 + ((v - PH_MIN_AFFICHE) / (PH_MAX_AFFICHE - PH_MIN_AFFICHE)) * (X1 - X0);
  const L0 = 176;
  const L1 = 440;
  const xc = (c: number) => L0 + ((Math.log10(Math.max(c, 1e-14)) + 14) / 14) * (L1 - L0);
  const neutre = pHNeutre(T);
  const teinte = indicateur === "bbt" ? couleurBBT(e.pH) : "#BAE6FD";
  return (
    <svg viewBox="0 0 460 230" role="img" aria-label={`Échelle de pH : pH ${fr(e.pH, 2)}, solution ${e.nature}, [H₃O⁺] = ${texteNombre(e.h3o)} mol/L, [OH⁻] = ${texteNombre(e.oh)} mol/L`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      <defs>
        <linearGradient id="echelle-ph" x1="0" x2="1">
          <stop offset="0" stopColor="#FDE68A" />
          <stop offset="0.5" stopColor="#E2E8F0" />
          <stop offset="1" stopColor="#A5B4FC" />
        </linearGradient>
      </defs>
      <text x={12} y={14} fontSize={13} fontWeight={800} fill={CC.encre}>
        Échelle de pH (dégradé illustratif)
      </text>
      <rect x={X0} y={30} width={X1 - X0} height={22} rx={6} fill="url(#echelle-ph)" stroke="#94A3B8" />
      {Array.from({ length: 15 }, (_, k) => (
        <g key={k}>
          <line x1={xpH(k)} y1={52} x2={xpH(k)} y2={57} stroke="#475569" />
          <text x={xpH(k)} y={80} textAnchor="middle" fontSize={11} fill="#475569">
            {k}
          </text>
        </g>
      ))}
      <text x={X0} y={26} fontSize={11} fontWeight={700} fill="#B45309">
        acide
      </text>
      <text x={X1} y={26} textAnchor="end" fontSize={11} fontWeight={700} fill="#4338CA">
        basique
      </text>
      <line x1={xpH(neutre)} y1={30} x2={xpH(neutre)} y2={52} stroke="#047857" strokeWidth={2} strokeDasharray="3 2" />
      <text x={xpH(neutre)} y={26} textAnchor="middle" fontSize={10} fontWeight={700} fill="#047857">
        neutre {fr(neutre, 2)}
      </text>
      <polygon points={`${xpH(e.pH)},53 ${xpH(e.pH) - 6},65 ${xpH(e.pH) + 6},65`} fill={CC.encre} />
      <Becher x={36} y={110} w={96} h={94} yEau={132} teinte={teinte} opaciteEau={indicateur === "bbt" ? 0.75 : 0.35} etiquette={`pH ${fr(e.pH, 2)}`} />
      <text x={84} y={103} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">
        {indicateur === "bbt" ? "avec bleu de bromothymol" : "solution incolore"}
      </text>
      {/* barres logarithmiques */}
      {[-14, -12, -10, -8, -6, -4, -2, 0].map((k) => (
        <g key={k}>
          <line x1={xc(10 ** k)} y1={106} x2={xc(10 ** k)} y2={190} stroke="#E2E8F0" />
          <text x={xc(10 ** k)} y={203} textAnchor="middle" fontSize={10} fill="#475569">
            10{sup(k)}
          </text>
        </g>
      ))}
      <text x={(L0 + L1) / 2} y={220} textAnchor="middle" fontSize={10} fontWeight={700} fill="#475569">
        concentration (mol/L), échelle logarithmique
      </text>
      {[
        { nom: "[H₃O⁺]", c: e.h3o, couleur: CC.plus, y: 112 },
        { nom: "[OH⁻]", c: e.oh, couleur: CC.moins, y: 152 },
      ].map((b) => (
        <g key={b.nom}>
          <text x={L0} y={b.y - 2} fontSize={11} fontWeight={800} fill={b.couleur}>
            {b.nom} = {texteNombre(b.c)}
          </text>
          <rect x={L0} y={b.y + 3} width={Math.max(2, xc(b.c) - L0)} height={20} rx={4} fill={b.couleur} opacity={0.85} />
        </g>
      ))}
    </svg>
  );
}

function Courbes({ e, T }: { e: EtatPH; T: Temperature }) {
  const X0 = 58;
  const X1 = 436;
  const Y0 = 26;
  const Y1 = 206;
  const x = (v: number) => X0 + (v / 14) * (X1 - X0);
  const y = (lg: number) => Y0 + (-lg / 14) * (Y1 - Y0);
  const pk = pKe(T);
  const pts = (f: (v: number) => number) => Array.from({ length: 15 }, (_, k) => `${x(k)},${y(f(k))}`).join(" ");
  return (
    <svg viewBox="0 0 460 262" role="img" aria-label="Graphe logarithmique des concentrations en ions oxonium et hydroxyde en fonction du pH" className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-white">
      <clipPath id="zone-graphe-ph">
        <rect x={X0} y={Y0 - 2} width={X1 - X0} height={Y1 - Y0 + 4} />
      </clipPath>
      <text x={12} y={16} fontSize={13} fontWeight={800} fill={CC.encre}>
        Concentrations en fonction du pH ({T} °C)
      </text>
      {[0, -2, -4, -6, -8, -10, -12, -14].map((k) => (
        <g key={k}>
          <line x1={X0} y1={y(k)} x2={X1} y2={y(k)} stroke="#E2E8F0" />
          <text x={X0 - 6} y={y(k) + 4} textAnchor="end" fontSize={10} fill="#475569">
            10{sup(k)}
          </text>
        </g>
      ))}
      {Array.from({ length: 8 }, (_, k) => k * 2).map((k) => (
        <text key={k} x={x(k)} y={Y1 + 15} textAnchor="middle" fontSize={11} fill="#475569">
          {k}
        </text>
      ))}
      <text x={(X0 + X1) / 2} y={Y1 + 32} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569">
        pH
      </text>
      <text x={14} y={(Y0 + Y1) / 2} textAnchor="middle" fontSize={11} fontWeight={700} fill="#475569" transform={`rotate(-90 14 ${(Y0 + Y1) / 2})`}>
        c (mol/L)
      </text>
      <line x1={x(pHNeutre(T))} y1={Y0} x2={x(pHNeutre(T))} y2={Y1} stroke="#047857" strokeDasharray="4 3" />
      <g clipPath="url(#zone-graphe-ph)">
        <polyline points={pts((v) => -v)} fill="none" stroke={CC.plus} strokeWidth={2.6} />
        <polyline points={pts((v) => v - pk)} fill="none" stroke={CC.moins} strokeWidth={2.6} />
      </g>
      <text x={x(1.2)} y={y(-1.2) - 6} fontSize={12} fontWeight={800} fill={CC.plus}>
        [H₃O⁺]
      </text>
      <text x={x(11)} y={y(11 - pk) + 18} fontSize={12} fontWeight={800} fill={CC.moins}>
        [OH⁻]
      </text>
      <circle cx={x(e.pH)} cy={y(-e.pH)} r={6} fill={CC.plus} stroke="#fff" strokeWidth={2} />
      <circle cx={x(e.pH)} cy={Math.min(Y1, Math.max(Y0, y(e.pH - pk)))} r={6} fill={CC.moins} stroke="#fff" strokeWidth={2} />
      <line x1={x(e.pH)} y1={Y0} x2={x(e.pH)} y2={Y1} stroke={CC.encre} strokeWidth={1} strokeDasharray="2 3" />
    </svg>
  );
}

function lireSaisie(mode: ModeSaisie, texte: string, T: Temperature): { ok: true; pH: number } | { ok: false; message: string } {
  const lu = lireNombreChimie(texte);
  if (!lu || lu.reste !== "" && !/^mol\/?l$/i.test(lu.reste)) return { ok: false, message: "Saisis un nombre (0,001 ; 1e-3 ou 10^-3 pour une concentration)." };
  const v = lu.valeur;
  let e: EtatPH;
  if (mode === "ph") {
    e = etatDepuisPH(v, T);
  } else {
    if (v <= 0) return { ok: false, message: "Une concentration doit être strictement positive (le logarithme n'est pas défini sinon)." };
    if (v > CONCENTRATION_MAX_MODELE) return { ok: false, message: "Au-delà de 1 mol/L, le modèle des solutions diluées n'est plus fiable." };
    e = mode === "h3o" ? etatDepuisH3O(v, T) : etatDepuisOH(v, T);
  }
  if (!Number.isFinite(e.pH) || e.pH < PH_MIN_AFFICHE - 1e-9 || e.pH > PH_MAX_AFFICHE + 1e-9) return { ok: false, message: `Cette valeur correspond à pH = ${fr(e.pH, 2)}, hors du domaine pédagogique ${PH_MIN_AFFICHE} à ${PH_MAX_AFFICHE}.` };
  return { ok: true, pH: e.pH };
}

export default function PHConcentrations({ initial = PH_DEFAUT }: { initial?: ParamsPH }) {
  const [p, setP] = useState<ParamsPH>(initial);
  const [mode, setMode] = useState<ModeSaisie>("ph");
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [indicateur, setIndicateur] = useState<Indicateur>("aucun");
  const [compare, setCompare] = useState(false);
  const [pHB, setPHB] = useState(4);
  const e = etatDepuisPH(p.pH, p.T);
  const T = p.T;
  const reprendre = () => {
    setP(initial);
    setMode("ph");
    setSaisie("");
    setErreur(null);
    setCompare(false);
    setPHB(4);
    setIndicateur("aucun");
  };
  const appliquer = () => {
    const r = lireSaisie(mode, saisie, T);
    if (!r.ok) setErreur(r.message);
    else {
      setErreur(null);
      setP((q) => ({ ...q, pH: Number(r.pH.toFixed(6)) }));
    }
  };
  const pk = fr(pKe(T), 2).replace(",", "{,}");
  const facteur = facteurH3O(p.pH, pHB);
  const ecartUnites = Math.abs(pHB - p.pH);

  const etapes =
    mode === "h3o"
      ? [
          { titre: "On connaît", contenu: <Tex bloc expr={String.raw`[\mathrm{H_3O^+}] = ${texNombre(e.h3o)}\ \text{mol/L}`} /> },
          { titre: "On utilise", contenu: <Tex bloc expr={String.raw`\mathrm{pH} = -\log[\mathrm{H_3O^+}]`} /> },
          { titre: "On remplace", contenu: <Tex bloc expr={String.raw`\mathrm{pH} = -\log\left(${texNombre(e.h3o)}\right)`} /> },
          { titre: "On applique le logarithme", contenu: <Tex bloc expr={String.raw`\log\left(${texNombre(e.h3o)}\right) = ${fr(-e.pH, 3).replace(",", "{,}")}`} /> },
          { titre: "On obtient", contenu: <Tex bloc expr={String.raw`\boxed{\mathrm{pH} = ${fr(e.pH, 2).replace(",", "{,}")}}`} /> },
          { titre: "On interprète", contenu: <p>À {T} °C, la solution est {e.nature} (pH de neutralité : {fr(pHNeutre(T), 2)}). Le pOH vaut pKe − pH = {pk.replace("{,}", ",")} − {fr(e.pH, 2)} = {fr(e.pOH, 2)} et [OH⁻] = Ke / [H₃O⁺] = {texteNombre(e.oh)} mol/L.</p> },
        ]
      : mode === "oh"
        ? [
            { titre: "On connaît", contenu: <Tex bloc expr={String.raw`[\mathrm{OH^-}] = ${texNombre(e.oh)}\ \text{mol/L}`} /> },
            { titre: "On utilise", contenu: <Tex bloc expr={String.raw`\mathrm{pOH} = -\log[\mathrm{OH^-}]\quad;\quad \mathrm{pH} = pK_e - \mathrm{pOH}`} /> },
            { titre: "On calcule le pOH", contenu: <Tex bloc expr={String.raw`\mathrm{pOH} = -\log\left(${texNombre(e.oh)}\right) = ${fr(e.pOH, 2).replace(",", "{,}")}`} /> },
            { titre: "On en déduit le pH", contenu: <Tex bloc expr={String.raw`\mathrm{pH} = ${pk} - ${fr(e.pOH, 2).replace(",", "{,}")} = ${fr(e.pH, 2).replace(",", "{,}")}`} /> },
            { titre: "On obtient [H₃O⁺]", contenu: <Tex bloc expr={String.raw`[\mathrm{H_3O^+}] = 10^{-\mathrm{pH}} = ${texNombre(e.h3o)}\ \text{mol/L}`} /> },
            { titre: "On interprète", contenu: <p>À {T} °C, la solution est {e.nature}.</p> },
          ]
        : [
            { titre: "On connaît", contenu: <Tex bloc expr={String.raw`\mathrm{pH} = ${fr(e.pH, 2).replace(",", "{,}")}`} /> },
            { titre: "On utilise", contenu: <Tex bloc expr={String.raw`[\mathrm{H_3O^+}] = 10^{-\mathrm{pH}}`} /> },
            { titre: "On remplace", contenu: <Tex bloc expr={String.raw`[\mathrm{H_3O^+}] = 10^{-${fr(e.pH, 2).replace(",", "{,}")}} = ${texNombre(e.h3o)}\ \text{mol/L}`} /> },
            { titre: "Concentration en ions hydroxyde", contenu: <Tex bloc expr={String.raw`[\mathrm{OH^-}] = \dfrac{K_e}{[\mathrm{H_3O^+}]} = \dfrac{10^{-${pk}}}{${texNombre(e.h3o)}} = ${texNombre(e.oh)}\ \text{mol/L}`} /> },
            { titre: "pOH", contenu: <Tex bloc expr={String.raw`\mathrm{pOH} = pK_e - \mathrm{pH} = ${pk} - ${fr(e.pH, 2).replace(",", "{,}")} = ${fr(e.pOH, 2).replace(",", "{,}")}`} /> },
            { titre: "On interprète", contenu: <p>À {T} °C, la solution est {e.nature}{e.nature === "acide" ? " : [H₃O⁺] > [OH⁻]" : e.nature === "basique" ? " : [OH⁻] > [H₃O⁺]" : " : [H₃O⁺] = [OH⁻]"}.</p> },
          ];

  const placeholder = mode === "ph" ? "ex. 4,5" : mode === "h3o" ? "ex. 1e-3 ou 10^-3" : "ex. 1e-2";
  const etiquette = mode === "ph" ? "pH" : mode === "h3o" ? "[H₃O⁺] (mol/L)" : "[OH⁻] (mol/L)";

  return (
    <CadreChimie
      titre="pH et concentrations ioniques"
      alerte={!e.diluee ? <Alerte>Une des concentrations dépasse 1 mol/L : le modèle des solutions suffisamment diluées n&apos;est plus fiable pour ce pH à {T} °C.</Alerte> : undefined}
      scene={
        <>
          <SceneEchelle e={e} T={T} indicateur={indicateur} />
          <Courbes e={e} T={T} />
          <Legende
            elements={[
              { symbole: "[H₃O⁺]", libelle: "ions oxonium", couleur: CC.plus },
              { symbole: "[OH⁻]", libelle: "ions hydroxyde", couleur: CC.moins },
              { symbole: "neutre", libelle: "pH de neutralité à cette température", couleur: "#047857" },
            ]}
          />
          <p className="text-xs text-fh-ardoise/80">Les calculs de ce laboratoire utilisent le modèle des solutions aqueuses suffisamment diluées (activité assimilée à la concentration).</p>
        </>
      }
      parametres={
        <>
          <Curseur etiquette="pH" valeur={p.pH} min={PH_MIN_AFFICHE} max={PH_MAX_AFFICHE} pas={0.1} decimales={1} onChange={(v) => setP((q) => ({ ...q, pH: v }))} />
          <div role="group" aria-label="Température" className="flex flex-wrap gap-2">
            {TEMPERATURES_PRISES_EN_CHARGE.map((t) => (
              <Pastille key={t} actif={T === t} onClick={() => setP((q) => ({ ...q, T: t }))}>
                {t} °C
              </Pastille>
            ))}
          </div>
          <div role="group" aria-label="Donnée connue" className="flex flex-col gap-2">
            <Pastille actif={mode === "ph"} onClick={() => { setMode("ph"); setErreur(null); }}>
              Je connais le pH
            </Pastille>
            <Pastille actif={mode === "h3o"} onClick={() => { setMode("h3o"); setErreur(null); }}>
              Je connais [H₃O⁺]
            </Pastille>
            <Pastille actif={mode === "oh"} onClick={() => { setMode("oh"); setErreur(null); }}>
              Je connais [OH⁻]
            </Pastille>
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <label htmlFor="ph-saisie" className="text-sm font-semibold text-[#102A66]">
              Valeur de {etiquette}
            </label>
            <div className="flex min-w-0 flex-wrap gap-2">
              <input
                id="ph-saisie"
                type="text"
                inputMode="text"
                autoComplete="off"
                value={saisie}
                onChange={(ev) => { setSaisie(ev.target.value); setErreur(null); }}
                onKeyDown={(ev) => ev.key === "Enter" && appliquer()}
                placeholder={placeholder}
                aria-invalid={erreur !== null}
                aria-describedby={erreur ? "ph-erreur" : undefined}
                className="min-h-11 w-full min-w-0 flex-1 rounded-lg border border-[#c9d8f5] bg-white px-3 text-base text-[#102A66] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
              <Bouton onClick={appliquer} variante="plein" disabled={saisie.trim() === ""}>
                Calculer
              </Bouton>
            </div>
            {erreur && (
              <p id="ph-erreur" role="alert" className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-900">
                {erreur}
              </p>
            )}
          </div>
        </>
      }
      options={
        <>
          <Interrupteur etiquette="Indicateur coloré (bleu de bromothymol)" coche={indicateur === "bbt"} onChange={(v) => setIndicateur(v ? "bbt" : "aucun")} />
          <Interrupteur etiquette="Comparer deux solutions" coche={compare} onChange={setCompare} />
        </>
      }
      resultats={
        <>
          <div className="grid grid-cols-2 gap-2">
            <Valeur etiquette="pH">{fr(e.pH, 2)}</Valeur>
            <Valeur etiquette="pOH = pKe − pH">{fr(e.pOH, 2)}</Valeur>
            <Valeur etiquette="[H₃O⁺]">{texteNombre(e.h3o)} mol/L</Valeur>
            <Valeur etiquette="[OH⁻]">{texteNombre(e.oh)} mol/L</Valeur>
            <Valeur etiquette="Produit ionique">{texteNombre(e.produit)}</Valeur>
            <Valeur etiquette="Nature">{e.nature}</Valeur>
          </div>
          <p className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-[#102A66]">
            {e.nature === "acide" ? "[H₃O⁺] > [OH⁻] : solution acide." : e.nature === "basique" ? "[OH⁻] > [H₃O⁺] : solution basique." : "[H₃O⁺] = [OH⁻] : solution neutre."}
          </p>
          {compare && (
            <div className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#dbe7ff] bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[#102A66]">Comparer deux solutions</p>
              <Curseur etiquette="pH de la solution B" valeur={pHB} min={PH_MIN_AFFICHE} max={PH_MAX_AFFICHE} pas={0.5} decimales={1} onChange={setPHB} />
              <Tex bloc expr={String.raw`\dfrac{[\mathrm{H_3O^+}]_A}{[\mathrm{H_3O^+}]_B} = 10^{\mathrm{pH}_B-\mathrm{pH}_A} = 10^{${fr(pHB - p.pH, 1).replace(",", "{,}")}} = ${texNombre(facteur)}`} />
              <p className="text-sm text-fh-ardoise">
                {ecartUnites === 0 ? "Même pH : mêmes concentrations." : `A (pH ${fr(p.pH, 1)}) a une concentration en ions oxonium ${facteur > 1 ? texteNombre(facteur) : texteNombre(1 / facteur)} fois ${facteur > 1 ? "plus grande" : "plus petite"} que B (pH ${fr(pHB, 1)}).`} Une unité de pH correspond à un facteur 10 (sur l&apos;activité des ions hydrogène, et approximativement sur leur concentration dans les solutions suffisamment diluées), deux unités à un facteur 100.
              </p>
            </div>
          )}
          <Equation titre="Relations (modèle dilué)" expr={String.raw`\mathrm{pH} = -\log\dfrac{[\mathrm{H_3O^+}]}{c^\circ}\ ;\ [\mathrm{H_3O^+}][\mathrm{OH^-}] = K_e\ ;\ \mathrm{pH}+\mathrm{pOH} = pK_e`} />
        </>
      }
      principe={<p className="text-sm text-fh-ardoise">Le pH mesure l&apos;acidité : plus le pH est bas, plus [H₃O⁺] est grande. À 25 °C, pH + pOH = 14 et [H₃O⁺][OH⁻] = 10⁻¹⁴. Une solution acide n&apos;est pas « rouge » : sans indicateur coloré, elle est généralement incolore.</p>}
      etapes={etapes}
      questions={questionsPH(p)}
      onReprendre={reprendre}
    />
  );
}
