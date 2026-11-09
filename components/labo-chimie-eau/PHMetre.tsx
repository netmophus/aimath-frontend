"use client";

import { useState } from "react";

import {
  ECHANTILLONS,
  ECHANTILLONS_MYSTERE,
  ETAT_PHMETRE_INITIAL,
  INCERTITUDE_PEDAGOGIQUE,
  TAMPONS,
  TEMPS_STABILISATION,
  actionPhMetre,
  estStabilise,
  etalonne,
  etapeProcedure,
  etatDepuisPH,
  fr,
  ligneSolution,
  mesureSimulee,
  texNombre,
  texteNombre,
  valeurAffichee,
  type ActionPhMetre,
  type Cible,
  type Echantillon,
  type EtatPhMetre,
  type MessagePhMetre,
} from "@/lib/chimieEau";
import { questionsMystere, questionsPhMetre } from "@/lib/chimieEauExercices";
import { Bouton, CadreChimie, CC, Equation, Interrupteur, Legende, NoteEchelle, Pastille, Tex, Valeur, useHorloge, useMouvementReduit } from "./ui";
import { Becher } from "./Particules";

type Scenario = "libre" | "mystere";

const EMPLACEMENTS = [
  { id: "t4", x: 38, titre: "pH 4", type: "tampon" as const },
  { id: "t7", x: 100, titre: "pH 7", type: "tampon" as const },
  { id: "t10", x: 162, titre: "pH 10", type: "tampon" as const },
  { id: "rincage", x: 224, titre: "Rinçage", type: "rincage" as const },
  { id: "A", x: 286, titre: "A", type: "echantillon" as const },
  { id: "B", x: 348, titre: "B", type: "echantillon" as const },
  { id: "C", x: 410, titre: "C", type: "echantillon" as const },
];

const PROCEDURE: Array<{ id: ReturnType<typeof etapeProcedure>; titre: string }> = [
  { id: "preparer", titre: "1. Préparer" },
  { id: "etalonner", titre: "2. Étalonner (2 tampons)" },
  { id: "mesurer", titre: "3. Mesurer" },
  { id: "interpreter", titre: "4. Interpréter" },
  { id: "ranger", titre: "5. Ranger l'électrode" },
];

function Scene({ etat, lieu, display, statut, rincage, pretStatut }: { etat: EtatPhMetre; lieu: { slot: string; dedans: boolean }; display: string; statut: string; rincage: boolean; pretStatut: string }) {
  const reduit = useMouvementReduit();
  const em = EMPLACEMENTS.find((e) => e.id === lieu.slot) ?? EMPLACEMENTS[3];
  const yPointe = lieu.dedans ? 262 : 178;
  const points = [...new Set(etat.points)].sort((a, b) => a - b);
  return (
    <svg viewBox="0 0 460 336" role="img" aria-label={`Paillasse du pH-mètre : affichage ${display}, ${statut}. ${pretStatut}`} className="mx-auto block h-auto w-full select-none rounded-xl border border-[#dbe7ff] bg-gradient-to-b from-[#f4f8ff] to-white">
      {/* appareil */}
      <rect x={14} y={14} width={168} height={118} rx={12} fill="#1E293B" />
      <rect x={26} y={26} width={144} height={52} rx={6} fill="#CFE8D5" stroke="#0F172A" />
      <text x={150} y={64} textAnchor="end" fontSize={30} fontWeight={800} fontFamily="ui-monospace, monospace" fill="#14301C">
        {display}
      </text>
      <text x={34} y={42} fontSize={11} fontWeight={800} fill="#14301C">
        pH
      </text>
      <text x={98} y={96} textAnchor="middle" fontSize={11} fontWeight={700} fill="#E2E8F0">
        {statut}
      </text>
      <text x={98} y={112} textAnchor="middle" fontSize={10} fill="#94A3B8">
        {etat.prepare ? (points.length >= 2 ? `étalonné : pH ${points.map((p) => fr(p, 0)).join(" et ")}` : `étalonnage : ${points.length}/2 point(s)`) : "appareil éteint"} · 25 °C
      </text>
      <circle cx={170} cy={120} r={4} fill={etat.prepare ? "#22C55E" : "#475569"} />
      {/* support et électrode */}
      <rect x={196} y={20} width={8} height={150} fill="#64748B" rx={3} />
      <rect x={196} y={20} width={Math.max(14, em.x - 196 + 4)} height={7} fill="#64748B" rx={3} />
      <path d={`M ${em.x} ${yPointe - 70} C ${em.x} 150, 190 150, 182 118`} fill="none" stroke="#334155" strokeWidth={2} />
      <g transform={`translate(${em.x} ${yPointe})`}>
        <rect x={-5} y={-70} width={10} height={64} rx={4} fill="#E2E8F0" stroke="#475569" strokeWidth={1.5} />
        <circle cx={0} cy={0} r={6.5} fill="#BAE6FD" stroke="#475569" strokeWidth={1.5} />
      </g>
      {/* bancs et béchers */}
      <rect x={6} y={296} width={448} height={10} rx={4} fill="#94A3B8" />
      {EMPLACEMENTS.map((e) => (
        <Becher key={e.id} x={e.x - 22} y={214} w={44} h={80} yEau={e.type === "rincage" ? 244 : 238} teinte={e.type === "tampon" ? "#FDE68A" : e.type === "rincage" ? "#E0F2FE" : "#BAE6FD"} opaciteEau={0.55} />
      ))}
      {EMPLACEMENTS.map((e) => (
        <text key={e.id} x={e.x} y={e.type === "rincage" ? 322 : 316} textAnchor="middle" fontSize={11} fontWeight={800} fill={CC.encre}>
          {e.type === "rincage" ? (
            e.titre
          ) : (
            <>
              <tspan x={e.x}>{e.type === "echantillon" ? "Solution" : "Tampon"}</tspan>
              <tspan x={e.x} dy={13}>{e.titre}</tspan>
            </>
          )}
        </text>
      ))}
      {rincage && !reduit &&
        [-6, 0, 6].map((dx, k) => (
          <circle key={k} cx={224 + dx} cy={200} r={2.6} fill="#38BDF8">
            <animate attributeName="cy" values="190;236" dur="0.6s" repeatCount="3" begin={`${k * 0.15}s`} fill="remove" />
            <animate attributeName="opacity" values="1;0.2" dur="0.6s" repeatCount="3" begin={`${k * 0.15}s`} fill="remove" />
          </circle>
        ))}
    </svg>
  );
}

export default function PHMetre() {
  const [scenario, setScenario] = useState<Scenario>("libre");
  const [etat, setEtat] = useState<EtatPhMetre>(ETAT_PHMETRE_INITIAL);
  const [message, setMessage] = useState<MessagePhMetre | null>(null);
  const [lieu, setLieu] = useState({ slot: "rincage", dedans: false });
  const [rincage, setRincage] = useState(false);
  const [choisi, setChoisi] = useState("A");
  const [calculs, setCalculs] = useState(false);
  const h = useHorloge(TEMPS_STABILISATION);
  const liste: Echantillon[] = scenario === "mystere" ? ECHANTILLONS_MYSTERE : ECHANTILLONS;
  const mystere = scenario === "mystere";

  const dispatch = (action: ActionPhMetre) => {
    const r = actionPhMetre(etat, action, liste);
    setEtat(r.etat);
    setMessage(r.message);
    if (action.type === "immerger" && r.etat.immerge) {
      setLieu({ slot: action.cible.id, dedans: true });
      setRincage(false);
      h.recommencer();
    } else if (action.type === "rincer" && r.message?.ton === "ok") {
      setLieu({ slot: "rincage", dedans: true });
      setRincage(true);
      h.arreter();
    } else if (action.type === "retirer") {
      setLieu((l) => ({ ...l, dedans: false }));
      h.arreter();
    } else if (action.type === "ranger") {
      setLieu({ slot: "rincage", dedans: false });
      h.arreter();
    }
  };
  const recommencer = () => {
    setEtat(ETAT_PHMETRE_INITIAL);
    setMessage(null);
    setLieu({ slot: "rincage", dedans: false });
    setRincage(false);
    setCalculs(false);
    h.arreter();
  };
  const changerScenario = (s: Scenario) => {
    setScenario(s);
    recommencer();
    setChoisi("A");
  };

  const immerge: Cible | null = etat.immerge;
  const cibleValeur = (() => {
    if (!immerge) return null;
    if (immerge.type === "tampon") return TAMPONS.find((x) => x.id === immerge.id)?.ph ?? null;
    if (!etalonne(etat)) return null;
    const e = liste.find((x) => x.id === immerge.id);
    return e ? mesureSimulee(e, etat.points) : null;
  })();
  const display = immerge === null ? "––" : cibleValeur === null ? "– – –" : valeurAffichee(etat.dernier, cibleValeur, h.t).toFixed(2).replace(".", ",");
  const stabilise = estStabilise(h.t);
  const statut = immerge === null ? "électrode hors solution" : cibleValeur === null ? "étalonne d'abord" : stabilise ? "Valeur stabilisée" : "Mesure en cours...";
  const etape = etapeProcedure(etat, liste.length);
  const releves = liste.filter((e) => etat.releves[e.id] !== undefined);
  const selection = liste.find((e) => e.id === choisi) ?? liste[0];
  const pretStatut = `Étape conseillée : ${PROCEDURE.find((p) => p.id === etape)?.titre ?? "terminé"}.`;

  const etapes = [
    { titre: "Préparer le matériel", contenu: <p>Avant de mesurer, on vérifie que le pH-mètre est prêt et que l&apos;électrode est en bon état. Le thermomètre indique 25 °C : les tampons de la simulation ont leurs valeurs nominales à cette température.</p> },
    { titre: "Étalonner avec des tampons", contenu: <p>On plonge l&apos;électrode dans deux solutions tampons de pH connu (par exemple 4 et 7 ou 7 et 10) en <b>encadrant</b> la valeur à mesurer, puis on valide chaque point <b>après stabilisation</b>. L&apos;appareil relie ainsi la tension de l&apos;électrode au pH.</p> },
    { titre: "Rincer l'électrode", contenu: <p>On rince à l&apos;eau déminéralisée entre deux solutions, sans frotter la membrane : le rinçage évite de contaminer la solution suivante avec la précédente.</p> },
    { titre: "Mesurer", contenu: <p>On plonge l&apos;électrode dans la solution et on <b>attend</b> la stabilisation de l&apos;affichage (« Valeur stabilisée »). Lire trop tôt donne une valeur fausse.</p> },
    { titre: "Interpréter", contenu: (<><p>À 25 °C, pH &lt; 7 : acide ; pH = 7 : neutre ; pH &gt; 7 : basique. La concentration en ions oxonium se déduit du pH :</p><Tex bloc expr={String.raw`[\mathrm{H_3O^+}] = 10^{-\mathrm{pH}}`} />{releves[0] && <Tex bloc expr={String.raw`\mathrm{pH}=${fr(etat.releves[releves[0].id], 2).replace(",", "{,}")}\ \Rightarrow\ [\mathrm{H_3O^+}]\approx ${texNombre(etatDepuisPH(etat.releves[releves[0].id]).h3o)}\ \text{mol/L}`} />}</>) },
    { titre: "Précision et conservation", contenu: <p>La précision réelle dépend de l&apos;appareil, de l&apos;étalonnage, de la température et de l&apos;état de l&apos;électrode. Ici, la mesure simulée s&apos;écarte du pH nominal d&apos;au plus {fr(INCERTITUDE_PEDAGOGIQUE, 2)} (incertitude pédagogique reproductible), davantage si l&apos;échantillon sort de la plage des tampons. Après usage, l&apos;électrode est conservée dans la solution recommandée par le fabricant (pas à sec, pas systématiquement dans l&apos;eau distillée).</p> },
  ];

  const questions = mystere ? [...questionsPhMetre({ echantillon: selection, releve: null }).slice(0, 2), ...questionsMystere(etat.releves)] : questionsPhMetre({ echantillon: selection, releve: etat.releves[selection.id] ?? null });

  return (
    <CadreChimie
      titre="pH-mètre virtuel"
      scene={
        <>
          <Scene etat={etat} lieu={lieu} display={display} statut={statut} rincage={rincage} pretStatut={pretStatut} />
          {immerge && cibleValeur !== null && (
            <div className="flex min-w-0 flex-col gap-1">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-label="Stabilisation de la mesure" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.min(1, h.t / TEMPS_STABILISATION) * 100)}>
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(1, h.t / TEMPS_STABILISATION) * 100}%` }} />
              </div>
              <p className="text-xs font-semibold text-fh-ardoise">{stabilise ? "Valeur stabilisée : tu peux valider ou relever." : "Mesure en cours... attends la stabilisation."}</p>
            </div>
          )}
          <div aria-live="polite" className="min-h-12">
            {message && (
              <p role={message.ton === "erreur" ? "alert" : "status"} className={`rounded-lg border px-3 py-2 text-sm font-medium ${message.ton === "erreur" ? "border-rose-300 bg-rose-50 text-rose-900" : message.ton === "ok" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-sky-200 bg-sky-50 text-sky-900"}`}>
                {message.texte}
              </p>
            )}
          </div>
          <Legende elements={[{ symbole: "tampon", libelle: "solution de pH connu (jaune pâle)", couleur: "#B45309" }, { symbole: "solution", libelle: "échantillon à mesurer", couleur: "#0369A1" }]} />
          <NoteEchelle>Simulation pédagogique : la montée de l&apos;affichage et la stabilisation sont des états pédagogiques, sans modèle électrochimique de l&apos;électrode.</NoteEchelle>
        </>
      }
      commandes={
        <div className="flex min-w-0 flex-col gap-4">
          <ol aria-label="Procédure" className="flex flex-wrap gap-2 text-xs font-semibold">
            {PROCEDURE.map((p) => (
              <li key={p.id} aria-current={etape === p.id ? "step" : undefined} className={`rounded-full border px-3 py-1 ${etape === p.id ? "border-[#2563EB] bg-[#2563EB] text-white" : "border-[#c9d8f5] bg-white text-fh-ardoise"}`}>
                {p.titre}
              </li>
            ))}
          </ol>
          <fieldset className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#dbe7ff] bg-white p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-[#102A66]">1 · Appareil</legend>
            <div className="flex flex-wrap gap-2">
              <Bouton onClick={() => dispatch({ type: "preparer" })} variante="plein">
                Préparer
              </Bouton>
              <Bouton onClick={() => dispatch({ type: "rincer" })}>Rincer l&apos;électrode</Bouton>
              <Bouton onClick={() => dispatch({ type: "retirer" })}>Retirer l&apos;électrode</Bouton>
            </div>
          </fieldset>
          <fieldset className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#dbe7ff] bg-white p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-[#102A66]">2 · Étalonnage</legend>
            <div className="flex flex-wrap gap-2">
              {TAMPONS.map((tp) => (
                <Bouton key={tp.id} onClick={() => dispatch({ type: "immerger", cible: { type: "tampon", id: tp.id } })}>
                  Plonger dans le tampon pH {fr(tp.ph, 0)}
                </Bouton>
              ))}
            </div>
            <div>
              <Bouton onClick={() => dispatch({ type: "valider-point", t: h.t })} variante="plein">
                Valider le point d&apos;étalonnage
              </Bouton>
            </div>
          </fieldset>
          <fieldset className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#dbe7ff] bg-white p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-[#102A66]">3 · Mesure</legend>
            <div className="flex flex-wrap gap-2">
              {liste.map((e) => (
                <Bouton key={e.id} onClick={() => { setChoisi(e.id); dispatch({ type: "immerger", cible: { type: "echantillon", id: e.id } }); }}>
                  Plonger dans la solution {e.id}
                </Bouton>
              ))}
            </div>
            <div>
              <Bouton onClick={() => dispatch({ type: "relever", t: h.t })} variante="plein">
                Relever la mesure
              </Bouton>
            </div>
          </fieldset>
          <fieldset className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#dbe7ff] bg-white p-3">
            <legend className="px-1 text-xs font-bold uppercase tracking-wide text-[#102A66]">4 · Rangement de l&apos;électrode</legend>
            <div className="flex flex-wrap gap-2">
              <Bouton onClick={() => dispatch({ type: "ranger", milieu: "solution-conservation" })}>Solution de conservation</Bouton>
              <Bouton onClick={() => dispatch({ type: "ranger", milieu: "eau-distillee" })}>Eau distillée</Bouton>
              <Bouton onClick={() => dispatch({ type: "ranger", milieu: "air" })}>À l&apos;air libre</Bouton>
            </div>
          </fieldset>
        </div>
      }
      parametres={
        <>
          <div role="group" aria-label="Scénario" className="flex flex-col gap-2">
            <Pastille actif={scenario === "libre"} onClick={() => changerScenario("libre")}>
              Mode libre
            </Pastille>
            <Pastille actif={scenario === "mystere"} onClick={() => changerScenario("mystere")}>
              Trois solutions mystérieuses
            </Pastille>
          </div>
          {mystere ? (
            <p className="text-sm text-fh-ardoise">Les pH des solutions A, B et C ne sont pas affichés : mesure-les, classe-les, puis calcule les concentrations.</p>
          ) : (
            <p className="text-sm text-fh-ardoise">Solutions fictives de la simulation (pas des produits réels) : A, pH nominal {fr(ECHANTILLONS[0].phNominal, 2)} ; B, {fr(ECHANTILLONS[1].phNominal, 2)} ; C, {fr(ECHANTILLONS[2].phNominal, 2)}.</p>
          )}
          <p className="text-xs text-fh-ardoise/70">Tampons nominaux à 25 °C : 4, 7 et 10 (leurs valeurs exactes dépendent de la température et de la formulation).</p>
          <Valeur etiquette="Erreurs de procédure">{etat.erreurs}</Valeur>
        </>
      }
      options={<Interrupteur etiquette="Afficher les calculs" coche={calculs} onChange={setCalculs} />}
      resultats={
        <>
          {releves.length === 0 ? (
            <p className="text-sm text-fh-ardoise">Aucune mesure relevée : suis la procédure (préparer, étalonner, mesurer).</p>
          ) : (
            <div className="min-w-0 overflow-x-auto">
              <table className="w-full min-w-0 text-left text-xs text-fh-ardoise">
                <caption className="mb-1 text-left text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">Mesures relevées (25 °C)</caption>
                <thead>
                  <tr className="text-[0.7rem] uppercase text-fh-ardoise/70">
                    <th scope="col" className="px-1 py-1">Solution</th>
                    <th scope="col" className="px-1 py-1">pH lu</th>
                    {calculs && <th scope="col" className="px-1 py-1">[H₃O⁺]</th>}
                    {calculs && <th scope="col" className="px-1 py-1">[OH⁻]</th>}
                    {calculs && <th scope="col" className="px-1 py-1">Nature</th>}
                  </tr>
                </thead>
                <tbody>
                  {releves.map((e) => {
                    const l = ligneSolution(etat.releves[e.id], 25);
                    return (
                      <tr key={e.id}>
                        <th scope="row" className="px-1 py-1 font-semibold">{e.id}</th>
                        <td className="px-1 py-1">{fr(etat.releves[e.id], 2)}</td>
                        {calculs && <td className="px-1 py-1">{texteNombre(l.h3o)}</td>}
                        {calculs && <td className="px-1 py-1">{texteNombre(l.oh)}</td>}
                        {calculs && <td className="px-1 py-1">{l.nature}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {!calculs && releves.length > 0 && <p className="text-xs text-fh-ardoise/70">Tente d&apos;abord ta réponse (en mode S&apos;exercer) avant d&apos;afficher les calculs.</p>}
          {releves.length > 0 && <Equation titre="Relations" expr={String.raw`[\mathrm{H_3O^+}] = 10^{-\mathrm{pH}}\ ;\ [\mathrm{OH^-}] = \dfrac{10^{-14}}{[\mathrm{H_3O^+}]}`} />}
          {mystere && releves.length === liste.length && calculs && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900">Valeurs de référence du scénario (pH nominal) : A = 3, B = 7, C = 11. Compare-les à tes mesures (écarts dus à l&apos;incertitude pédagogique et à la plage des tampons).</p>
          )}
        </>
      }
      principe={<p className="text-sm text-fh-ardoise">Un pH-mètre doit être préparé, étalonné avec des tampons qui encadrent la valeur cherchée, rincé entre deux solutions et lu une fois la valeur stabilisée. L&apos;appareil signale les gestes contraires à la procédure.</p>}
      etapes={etapes}
      questions={questions}
      videExercices={<p className="text-sm text-fh-ardoise">Mesure d&apos;abord les solutions (onglet Observer) : les questions utilisent tes valeurs relevées.</p>}
      onReprendre={recommencer}
    />
  );
}
