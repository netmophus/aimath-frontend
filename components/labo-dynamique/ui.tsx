"use client";

import { useId, useState, type ReactNode } from "react";
import { IconBulb, IconEye, IconPencil, IconRefresh, IconCheck, IconX } from "@tabler/icons-react";

import { evaluerReponse, type Question, type Verdict } from "@/lib/dynamiqueExercices";
import { Bouton, Etiquette, FlechePx, Panneau, Pastille } from "@/components/labo-cinematique/ui";

/** Éléments d'interface du Laboratoire de dynamique : on réutilise ceux du laboratoire de cinématique (horloge, graphiques, curseurs). */
export * from "@/components/labo-cinematique/ui";

/** Couleurs des grandeurs (identiques dans les vecteurs, les légendes et les résultats). */
export const CD = {
  poids: "#F97316",
  normale: "#10B981",
  tension: "#8B5CF6",
  acceleration: "#0891B2",
  vitesse: "#2563EB",
  frottement: "#E11D48",
  alerte: "#E11D48",
  profond: "#102A66",
  gris: "#64748B",
} as const;

export const fmt = (x: number, d = 2) => (Number.isFinite(x) ? String(Number(x.toFixed(d))).replace(".", ",") : "—");

// --- Vecteurs ---------------------------------------------------------------------------------------------------

/**
 * Vecteur dessiné de (x, y) vers (x + dx, y + dy) en pixels d'écran (y vers le bas), avec son symbole. Une norme quasi nulle
 * est signalée par un point et « = 0 » : jamais de flèche fantôme.
 */
export function Vecteur({ x, y, dx, dy, couleur, symbole, pointille = false, taille = 14 }: { x: number; y: number; dx: number; dy: number; couleur: string; symbole: string; pointille?: boolean; taille?: number }) {
  const L = Math.hypot(dx, dy);
  if (L < 3) {
    return (
      <g>
        <circle cx={x} cy={y} r={3.5} fill={couleur} />
        <Etiquette x={x + 8} y={y - 8} couleur={couleur} taille={taille}>
          {symbole} = 0
        </Etiquette>
      </g>
    );
  }
  const ux = dx / L;
  const uy = dy / L;
  return (
    <g>
      <FlechePx x1={x} y1={y} x2={x + dx} y2={y + dy} couleur={couleur} pointille={pointille} />
      <Etiquette x={x + dx + ux * 12} y={y + dy + uy * 12 + 4} couleur={couleur} ancre="middle" taille={taille}>
        {symbole}
      </Etiquette>
    </g>
  );
}

/** Valeur « nette » (1, 2 ou 5 × 10^k) dont la longueur à l'échelle k (px par unité) reste entre 28 et 90 px. */
export function valeurEchelle(k: number): number {
  if (!(k > 0)) return 1;
  const cibleBrute = 55 / k;
  const p = 10 ** Math.floor(Math.log10(cibleBrute));
  const f = cibleBrute / p;
  return (f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10) * p;
}

/** Barre de légende d'échelle d'un type de vecteurs : « ├── 20 N ──┤ ». */
export function BarreEchelle({ x, y, k, unite, couleur, libelle }: { x: number; y: number; k: number; unite: string; couleur: string; libelle: string }) {
  const v = valeurEchelle(k);
  const L = v * k;
  return (
    <g>
      <line x1={x} y1={y} x2={x + L} y2={y} stroke={couleur} strokeWidth={3} />
      <line x1={x} y1={y - 5} x2={x} y2={y + 5} stroke={couleur} strokeWidth={2} />
      <line x1={x + L} y1={y - 5} x2={x + L} y2={y + 5} stroke={couleur} strokeWidth={2} />
      <text x={x + L + 7} y={y + 5} fontSize={13} fontWeight={700} fill={couleur}>
        {libelle} : {fmt(v, v < 1 ? 2 : 0)} {unite}
      </text>
    </g>
  );
}

// --- Messages ---------------------------------------------------------------------------------------------------

export function Alerte({ children, ton = "alerte" }: { children: ReactNode; ton?: "alerte" | "info" }) {
  const style = ton === "alerte" ? "border-rose-300 bg-rose-50 text-rose-900" : "border-sky-200 bg-sky-50 text-sky-900";
  return (
    <p role={ton === "alerte" ? "alert" : "status"} className={`rounded-lg border px-3 py-2 text-sm font-medium ${style}`}>
      {children}
    </p>
  );
}

/** Pastille de légende d'un vecteur : couleur + symbole (la couleur ne porte jamais seule l'information). */
export function Legende({ elements }: { elements: Array<{ symbole: string; libelle: string; couleur: string }> }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fh-ardoise" aria-label="Légende des vecteurs">
      {elements.map((e) => (
        <li key={e.symbole + e.libelle} className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="inline-block h-1 w-5 rounded" style={{ background: e.couleur }} />
          <span className="font-bold" style={{ color: e.couleur }}>
            {e.symbole}
          </span>
          {e.libelle}
        </li>
      ))}
    </ul>
  );
}

// --- Pas à pas « Comprendre les calculs » ----------------------------------------------------------------------------

export interface Etape {
  titre: string;
  contenu: ReactNode;
}

/** Affichage progressif des huit étapes de la résolution (système, référentiel, bilan, théorème, projections, littéral, numérique, interprétation). */
export function Etapes({ etapes }: { etapes: Etape[] }) {
  const [n, setN] = useState(1);
  const total = etapes.length;
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ol className="flex min-w-0 flex-col gap-2">
        {etapes.slice(0, n).map((e, i) => (
          <li key={e.titre} className="min-w-0 rounded-xl border border-[#dbe7ff] bg-white px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-[#2563EB]">
              Étape {i + 1} sur {total}
            </p>
            <p className="text-sm font-bold text-[#102A66]">{e.titre}</p>
            <div className="mt-1 flex min-w-0 flex-col gap-1 text-sm text-fh-ardoise">{e.contenu}</div>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2">
        <Bouton onClick={() => setN((v) => Math.min(total, v + 1))} disabled={n >= total} variante="plein">
          Étape suivante
        </Bouton>
        <Bouton onClick={() => setN(total)} disabled={n >= total}>
          Tout afficher
        </Bouton>
        <Bouton onClick={() => setN(1)} disabled={n <= 1}>
          Recommencer
        </Bouton>
      </div>
    </div>
  );
}

// --- Exercices --------------------------------------------------------------------------------------------------------

function CarteQuestion({ q, numero }: { q: Question; numero: number }) {
  const id = useId();
  const [saisie, setSaisie] = useState("");
  const [choisi, setChoisi] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const valider = () => setVerdict(evaluerReponse(q, q.type === "choix" ? (choisi ?? -1) : saisie));
  const refaire = () => {
    setVerdict(null);
    setSaisie("");
    setChoisi(null);
  };
  return (
    <li className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#dbe7ff] bg-white p-3">
      <p className="text-sm font-semibold text-[#102A66]">
        <span className="mr-1 text-[#2563EB]">Question {numero}.</span>
        {q.enonce}
      </p>
      {q.type === "nombre" ? (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`${id}-rep`} className="sr-only">
            Ta réponse en {q.unite}
          </label>
          <input
            id={`${id}-rep`}
            inputMode="decimal"
            autoComplete="off"
            value={saisie}
            onChange={(e) => {
              setSaisie(e.target.value);
              setVerdict(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && valider()}
            placeholder="Ta réponse"
            className="min-h-11 w-40 rounded-lg border border-[#c9d8f5] bg-white px-3 text-base text-[#102A66] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
          />
          <span className="text-sm font-semibold text-[#102A66]">{q.unite}</span>
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
                className="h-5 w-5 accent-[#2563EB]"
              />
              {o}
            </label>
          ))}
        </fieldset>
      )}
      <div className="flex flex-wrap gap-2">
        <Bouton onClick={valider} variante="plein" disabled={q.type === "choix" ? choisi === null : saisie.trim() === ""}>
          <IconCheck size={18} aria-hidden="true" />
          Vérifier
        </Bouton>
        {verdict && (
          <Bouton onClick={refaire}>
            <IconRefresh size={18} aria-hidden="true" />
            Nouvelle tentative
          </Bouton>
        )}
      </div>
      {verdict && (
        <p role="status" className={`flex gap-2 rounded-lg px-3 py-2 text-sm ${verdict.ok ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
          {verdict.ok ? <IconCheck size={20} aria-hidden="true" className="mt-0.5 shrink-0" /> : <IconX size={20} aria-hidden="true" className="mt-0.5 shrink-0" />}
          <span className="min-w-0">{verdict.message}</span>
        </p>
      )}
    </li>
  );
}

export function Exercices({ questions }: { questions: Question[] }) {
  if (questions.length === 0) return <Alerte ton="info">Choisis d&apos;abord des paramètres qui décrivent un mouvement valide : les questions sont générées à partir de la situation affichée.</Alerte>;
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="text-xs text-fh-ardoise/80">Les questions portent sur la situation affichée à gauche et changent avec les paramètres. Tolérance : 2 % sur les valeurs numériques.</p>
      <ol className="flex min-w-0 flex-col gap-3">
        {questions.map((q, i) => (
          <CarteQuestion key={`${q.id}-${q.enonce}`} q={q} numero={i + 1} />
        ))}
      </ol>
    </div>
  );
}

// --- Cadre commun des six simulations -------------------------------------------------------------------------------

export type ModePedagogique = "observer" | "comprendre" | "exercer";

export interface CadreProps {
  titre: string;
  scene: ReactNode;
  commandes: ReactNode;
  parametres: ReactNode;
  options?: ReactNode;
  resultats: ReactNode;
  etapes: Etape[];
  questions: Question[];
  scenarios: Array<{ id: string; libelle: string }>;
  scenarioActif: string | null;
  onScenario: (id: string) => void;
  onReprendre: () => void;
  alerte?: ReactNode;
  /** Texte du principe physique, affiché en tête du mode Observer. */
  principe?: ReactNode;
}

const MODES: Array<{ id: ModePedagogique; libelle: string; icone: ReactNode }> = [
  { id: "observer", libelle: "Observer", icone: <IconEye size={18} aria-hidden="true" /> },
  { id: "comprendre", libelle: "Comprendre", icone: <IconBulb size={18} aria-hidden="true" /> },
  { id: "exercer", libelle: "S'exercer", icone: <IconPencil size={18} aria-hidden="true" /> },
];

/**
 * Cadre commun : trois zones sur ordinateur (paramètres à gauche, simulation au centre, résultats à droite), empilées sur
 * téléphone dans l'ordre simulation, paramètres, résultats. La zone de droite change avec le mode pédagogique.
 */
export function Cadre(c: CadreProps) {
  const [mode, setMode] = useState<ModePedagogique>("observer");
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
        <span className="text-xs text-fh-ardoise/70">{mode === "observer" ? "Regarde le phénomène et les vecteurs." : mode === "comprendre" ? "Le raisonnement, étape par étape." : "Calcule et vérifie ta réponse."}</span>
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
            <div role="group" aria-label="Situations du cours" className="flex flex-wrap items-center gap-2">
              {c.scenarios.map((s) => (
                <Pastille key={s.id} actif={c.scenarioActif === s.id} onClick={() => c.onScenario(s.id)}>
                  {s.libelle}
                </Pastille>
              ))}
              <Bouton onClick={c.onReprendre}>
                <IconRefresh size={18} aria-hidden="true" />
                Reprendre l&apos;exemple
              </Bouton>
            </div>
            <div className="flex min-w-0 flex-col gap-3">{c.parametres}</div>
            {c.options && (
              <div role="group" aria-label="Affichage" className="flex flex-wrap gap-x-4">
                {c.options}
              </div>
            )}
          </Panneau>
        </div>
        <div className={`flex min-w-0 flex-col gap-3 ${observer ? "@[54rem]:col-start-3 @[54rem]:row-start-1" : "@2xl:col-span-2 @[54rem]:row-start-2 @[72rem]:col-span-1 @[72rem]:col-start-3 @[72rem]:row-start-1"}`}>
          {mode === "observer" && (
            <>
              {c.principe && <Panneau titre="Principe" ton="explication">{c.principe}</Panneau>}
              <Panneau titre="Résultats" ton="resultat">
                {c.resultats}
              </Panneau>
            </>
          )}
          {mode === "comprendre" && (
            <Panneau titre="Comprendre les calculs" ton="explication">
              <Etapes etapes={c.etapes} />
            </Panneau>
          )}
          {mode === "exercer" && (
            <Panneau titre="S'exercer" ton="explication">
              <Exercices questions={c.questions} />
            </Panneau>
          )}
        </div>
      </div>
    </div>
  );
}

/** Bornes d'un curseur, élargies pour toujours contenir la valeur initiale du bloc. */
export const elargir = (valeur: number, min: number, max: number) => ({ min: Math.min(min, valeur), max: Math.max(max, valeur) });

/** Interrupteurs d'affichage communs (chaque simulation n'affiche que ceux qui la concernent). */
export interface OptionsAffichage {
  forces: boolean;
  composantes: boolean;
  vitesse: boolean;
  acceleration: boolean;
  axes: boolean;
  trajectoire: boolean;
}
export const OPTIONS_DEFAUT: OptionsAffichage = { forces: true, composantes: true, vitesse: true, acceleration: true, axes: true, trajectoire: true };

/** Carte « étiquette / valeur » : étiquette en casse normale (les majuscules CSS transformeraient α en « A » et mg en « MG »). */
export function Valeur({ etiquette, children }: { etiquette: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg border border-fh-sable bg-white px-3 py-2">
      <span data-valeur-etiquette="" className="text-xs font-semibold text-fh-ardoise/70">
        {etiquette}
      </span>
      <span className="min-w-0 break-words text-sm font-semibold text-fh-bleu">{children}</span>
    </div>
  );
}
