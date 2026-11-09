"use client";

import { useId, useState, type ReactNode } from "react";
import { IconBulb, IconCheck, IconEye, IconPencil, IconRefresh, IconX, IconZoomQuestion } from "@tabler/icons-react";

import { evaluerReponse, type Question, type Verdict } from "@/lib/chimieEauExercices";
import { Bouton, Etapes, Pastille, Panneau, Tex, type Etape } from "@/components/labo-dynamique/ui";

/** Éléments d'interface du Laboratoire de chimie de l'eau : on réutilise ceux du laboratoire de dynamique (horloge, curseurs, onglets, panneaux). */
export * from "@/components/labo-dynamique/ui";

/** Couleurs conventionnelles des particules (convention graphique pédagogique, pas une propriété physique). */
export const CC = {
  oxygene: "#DC2626",
  hydrogene: "#F1F5F9",
  hydrogeneBord: "#94A3B8",
  sodium: "#7C3AED",
  chlorure: "#16A34A",
  calcium: "#4C1D95",
  sulfate: "#B45309",
  sucre: "#FDE68A",
  sucreBord: "#B45309",
  eau: "#BAE6FD",
  encre: "#102A66",
  plus: "#DC2626",
  moins: "#2563EB",
} as const;

/** Texte avec formules entre `$...$` rendues en KaTeX. */
export function Riche({ texte }: { texte: string }) {
  return (
    <>
      {texte.split("$").map((morceau, i) => (i % 2 === 1 ? <Tex key={i} expr={morceau} /> : <span key={i}>{morceau}</span>))}
    </>
  );
}

// --- Exercices ----------------------------------------------------------------------------------------------------------

const NIVEAUX: Record<1 | 2 | 3, string> = { 1: "Niveau 1 · comprendre", 2: "Niveau 2 · appliquer", 3: "Niveau 3 · raisonner" };

function Carte({ q, numero }: { q: Question; numero: number }) {
  const id = useId();
  const [saisie, setSaisie] = useState("");
  const [choisi, setChoisi] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [indice, setIndice] = useState(false);
  const [explique, setExplique] = useState(false);
  const valider = () => setVerdict(evaluerReponse(q, q.type === "choix" ? (choisi ?? -1) : saisie));
  const refaire = () => {
    setVerdict(null);
    setSaisie("");
    setChoisi(null);
    setIndice(false);
    setExplique(false);
  };
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#dbe7ff] bg-white p-3">
      <p className="text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">{NIVEAUX[q.niveau]}</p>
      <p className="min-w-0 text-sm font-semibold text-[#102A66]">
        <span className="mr-1 text-[#2563EB]">Question {numero}.</span>
        <Riche texte={q.enonce} />
      </p>
      {q.type === "nombre" ? (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`${id}-rep`} className="sr-only">
            Ta réponse{q.unite ? ` en ${q.unite}` : ""}
          </label>
          <input
            id={`${id}-rep`}
            type="text"
            inputMode="text"
            autoComplete="off"
            value={saisie}
            onChange={(e) => {
              setSaisie(e.target.value);
              setVerdict(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && saisie.trim() !== "" && valider()}
            placeholder="Ex. 4 ou 1e-3 ou 10^-3"
            className="min-h-11 w-full min-w-0 max-w-56 rounded-lg border border-[#c9d8f5] bg-white px-3 text-base text-[#102A66] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
          {q.unite && <span className="text-sm font-semibold text-[#102A66]">{q.unite}</span>}
        </div>
      ) : (
        <fieldset className="flex min-w-0 flex-col gap-1">
          <legend className="sr-only">Réponses possibles</legend>
          {q.options.map((o, i) => (
            <label key={o} className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-[#102A66]">
              <input
                type="radio"
                name={`${id}-choix`}
                checked={choisi === i}
                onChange={() => {
                  setChoisi(i);
                  setVerdict(null);
                }}
                className="h-5 w-5 shrink-0 accent-[#2563EB]"
              />
              <span className="min-w-0">{o}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="flex flex-wrap gap-2">
        <Bouton onClick={valider} variante="plein" disabled={q.type === "choix" ? choisi === null : saisie.trim() === ""}>
          <IconCheck size={18} aria-hidden="true" />
          Vérifier
        </Bouton>
        <Bouton onClick={() => setIndice(true)} disabled={indice}>
          <IconBulb size={18} aria-hidden="true" />
          Indice
        </Bouton>
        <Bouton onClick={() => setExplique(true)} disabled={verdict === null || explique || verdict.ok}>
          <IconZoomQuestion size={18} aria-hidden="true" />
          Expliquer
        </Bouton>
        <Bouton onClick={refaire} disabled={verdict === null && !indice && !explique && saisie === "" && choisi === null}>
          <IconRefresh size={18} aria-hidden="true" />
          Recommencer
        </Bouton>
      </div>
      {indice && (
        <p className="rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-900">
          <span className="font-bold">Indice : </span>
          <Riche texte={q.indice} />
        </p>
      )}
      {verdict && (
        <p role="status" className={`flex gap-2 rounded-lg px-3 py-2 text-sm ${verdict.ok ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
          {verdict.ok ? <IconCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0" /> : <IconX size={20} aria-hidden="true" className="mt-0.5 shrink-0" />}
          <span className="min-w-0">{verdict.message}</span>
        </p>
      )}
      {(explique || verdict?.ok) && (
        <p className="rounded-lg border border-[#dbe7ff] bg-[#EFF6FF] px-3 py-2 text-sm text-fh-ardoise">
          <span className="font-bold text-[#102A66]">Explication : </span>
          <Riche texte={q.explication} />
        </p>
      )}
    </li>
  );
}

export function ExercicesChimie({ questions, vide }: { questions: Question[]; vide?: ReactNode }) {
  if (questions.length === 0) return <>{vide ?? <p className="text-sm text-fh-ardoise">Pas de question disponible pour ces paramètres.</p>}</>;
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="text-xs text-fh-ardoise/80">Les questions dépendent des paramètres choisis. Tolérance sur les valeurs numériques : 2 % (ou 0,05 unité de pH). Notation scientifique acceptée : 1e-3, 10^-3, 2,5×10^-4.</p>
      <ol className="flex min-w-0 flex-col gap-3">
        {questions.map((q, i) => (
          <Carte key={`${q.id}-${q.enonce}`} q={q} numero={i + 1} />
        ))}
      </ol>
    </div>
  );
}

// --- Cadre commun : trois modes pédagogiques -----------------------------------------------------------------------------

type Mode = "observer" | "comprendre" | "exercer";
const MODES: Array<{ id: Mode; libelle: string; icone: ReactNode }> = [
  { id: "observer", libelle: "Observer", icone: <IconEye size={18} aria-hidden="true" /> },
  { id: "comprendre", libelle: "Comprendre", icone: <IconBulb size={18} aria-hidden="true" /> },
  { id: "exercer", libelle: "S'exercer", icone: <IconPencil size={18} aria-hidden="true" /> },
];

export interface CadreChimieProps {
  titre: string;
  scene: ReactNode;
  commandes?: ReactNode;
  parametres: ReactNode;
  options?: ReactNode;
  resultats: ReactNode;
  principe?: ReactNode;
  etapes: Etape[];
  questions: Question[];
  alerte?: ReactNode;
  onReprendre: () => void;
  videExercices?: ReactNode;
}

/**
 * Trois zones sur ordinateur (paramètres à gauche, simulation au centre, résultats à droite) ; sur téléphone : simulation,
 * paramètres, résultats puis explications. La zone de droite dépend du mode pédagogique.
 */
export function CadreChimie(c: CadreChimieProps) {
  const [mode, setMode] = useState<Mode>("observer");
  const observer = mode === "observer";
  return (
    <div className="@container flex min-w-0 flex-col gap-4">
      <div role="group" aria-label="Mode pédagogique" className="flex flex-wrap items-center gap-2">
        {MODES.map((m) => (
          <Pastille key={m.id} actif={mode === m.id} onClick={() => setMode(m.id)}>
            <span className="inline-flex items-center gap-1.5">
              {m.icone}
              {m.libelle}
            </span>
          </Pastille>
        ))}
        <span className="text-xs text-fh-ardoise/70">{observer ? "Regarde le phénomène." : mode === "comprendre" ? "Le raisonnement, étape par étape." : "Calcule, vérifie, corrige."}</span>
      </div>
      {c.alerte}
      <div className={`grid min-w-0 grid-cols-1 gap-4 @2xl:grid-cols-2 @[54rem]:items-start ${observer ? "@[54rem]:grid-cols-[14rem_minmax(0,1fr)_16rem]" : "@[54rem]:grid-cols-[14rem_minmax(0,1fr)] @[72rem]:grid-cols-[14rem_minmax(0,1fr)_24rem]"}`}>
        <div className="flex min-w-0 flex-col gap-3 @2xl:col-span-2 @[54rem]:col-span-1 @[54rem]:col-start-2 @[54rem]:row-start-1">
          <Panneau titre={c.titre}>
            {c.scene}
            {c.commandes}
          </Panneau>
        </div>
        <div className="flex min-w-0 flex-col gap-3 @[54rem]:col-start-1 @[54rem]:row-start-1">
          <Panneau titre="Paramètres">
            <div className="flex min-w-0 flex-col gap-3">{c.parametres}</div>
            <Bouton onClick={c.onReprendre}>
              <IconRefresh size={18} aria-hidden="true" />
              Reprendre l&apos;exemple
            </Bouton>
            {c.options && (
              <div role="group" aria-label="Affichage" className="flex flex-wrap gap-x-4">
                {c.options}
              </div>
            )}
          </Panneau>
        </div>
        <div className={`flex min-w-0 flex-col gap-3 ${observer ? "@[54rem]:col-start-3 @[54rem]:row-start-1" : "@2xl:col-span-2 @[54rem]:row-start-2 @[72rem]:col-span-1 @[72rem]:col-start-3 @[72rem]:row-start-1"}`}>
          {observer && (
            <>
              <Panneau titre="Résultats" ton="resultat">
                {c.resultats}
              </Panneau>
              {c.principe && (
                <Panneau titre="Principe" ton="explication">
                  {c.principe}
                </Panneau>
              )}
            </>
          )}
          {mode === "comprendre" && (
            <Panneau titre="Comprendre les calculs" ton="explication">
              <Etapes etapes={c.etapes} />
            </Panneau>
          )}
          {mode === "exercer" && (
            <Panneau titre="S'exercer" ton="explication">
              <ExercicesChimie questions={c.questions} vide={c.videExercices} />
            </Panneau>
          )}
        </div>
      </div>
    </div>
  );
}

/** Équation chimique ou formule dans une carte lisible (défilement horizontal interne si besoin, jamais de débordement de page). */
export function Equation({ expr, titre }: { expr: string; titre?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-fh-sable bg-white px-3 py-1">
      {titre && <p className="text-[0.7rem] font-bold uppercase tracking-wide text-fh-ardoise/60">{titre}</p>}
      <Tex bloc expr={expr} />
    </div>
  );
}

/** Mention d'échelle : les schémas microscopiques ne respectent jamais les proportions réelles. */
export function NoteEchelle({ children }: { children?: ReactNode }) {
  return <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">{children ?? "Modèle simplifié : le nombre de particules dessinées et leurs tailles ne sont pas à l'échelle réelle."}</p>;
}

export const frc = (x: number, d = 2) => (Number.isFinite(x) ? String(Number(x.toFixed(d))).replace(".", ",") : "—");
