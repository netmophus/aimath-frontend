"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import { genererSection, type ExerciceGenere } from "@/lib/iaApi";
import type { Difficulte } from "@/lib/leconApi";
import Toast from "@/components/admin/Toast";
import ChampMarkdown from "./ChampMarkdown";
import ModaleApercuExercicesIA from "./ModaleApercuExercicesIA";
import { nouvelleClef } from "./clefsLocales";

export interface ExerciceDraft {
  /** Clé locale stable pour React, jamais envoyée au backend. */
  clef: string;
  id?: number;
  enonce: string;
  corrige: string;
  difficulte: Difficulte;
}

export function nouvelExerciceVide(): ExerciceDraft {
  return { clef: nouvelleClef(), enonce: "", corrige: "", difficulte: "moyen" };
}

/** Convertit un exercice généré par l'IA (voir lib/iaApi.ts) en brouillon
 * d'édition — sans id : il sera créé en base à l'enregistrement, comme un
 * exercice saisi à la main (voir la convention de synchro dans lib/leconApi.ts). */
function depuisExerciceGenere(exercice: ExerciceGenere): ExerciceDraft {
  return { clef: nouvelleClef(), enonce: exercice.enonce, corrige: exercice.corrige, difficulte: exercice.difficulte };
}

const OPTIONS_DIFFICULTE: readonly { value: Difficulte; label: string }[] = [
  { value: "facile", label: "Facile" },
  { value: "moyen", label: "Moyen" },
  { value: "difficile", label: "Difficile" },
];

interface EditeurExercicesProps {
  exercices: ExerciceDraft[];
  onChange: (exercices: ExerciceDraft[]) => void;
  notionId: number;
}

export default function EditeurExercices({ exercices, onChange, notionId }: EditeurExercicesProps) {
  const [genereEnCours, setGenereEnCours] = useState(false);
  const [exercicesGeneres, setExercicesGeneres] = useState<ExerciceGenere[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  function modifier(index: number, patch: Partial<ExerciceDraft>) {
    onChange(exercices.map((exercice, i) => (i === index ? { ...exercice, ...patch } : exercice)));
  }

  function deplacer(index: number, decalage: number) {
    const cible = index + decalage;
    if (cible < 0 || cible >= exercices.length) return;
    const copie = [...exercices];
    [copie[index], copie[cible]] = [copie[cible], copie[index]];
    onChange(copie);
  }

  function supprimer(index: number) {
    onChange(exercices.filter((_, i) => i !== index));
  }

  async function lancerGeneration() {
    setGenereEnCours(true);
    try {
      const { exercices: generes } = await genererSection(notionId, "exercices");
      setExercicesGeneres(generes);
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "La génération a échoué.");
    } finally {
      setGenereEnCours(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          disabled={genereEnCours}
          onClick={lancerGeneration}
          title="Génère 3 exercices gradués avec l'IA — peut prendre quelques secondes"
          className="inline-flex items-center gap-1.5 rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {genereEnCours ? (
            <>
              <span
                aria-hidden
                className="h-3 w-3 animate-spin rounded-full border-2 border-fh-bleu-vif/30 border-t-fh-bleu-vif"
              />
              Génération en cours…
            </>
          ) : (
            "✨ Générer des exercices avec l'IA"
          )}
        </button>
      </div>

      {exercices.length === 0 && <p className="text-sm text-fh-ardoise/70">Aucun exercice pour l&apos;instant.</p>}

      {exercices.map((exercice, index) => (
        <div key={exercice.clef} className="flex flex-col gap-3 rounded-xl bg-fh-creme p-4 ring-1 ring-fh-sable">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-fh-bleu">Exercice {index + 1}</span>
            <div className="flex items-center gap-1">
              <select
                value={exercice.difficulte}
                onChange={(event) => modifier(index, { difficulte: event.target.value as Difficulte })}
                className="rounded-lg border border-fh-bleu-vif/20 bg-white px-2 py-1 text-sm text-fh-bleu outline-none focus:border-fh-orange"
              >
                {OPTIONS_DIFFICULTE.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => deplacer(index, -1)}
                aria-label="Monter l'exercice"
                title="Monter"
                className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === exercices.length - 1}
                onClick={() => deplacer(index, 1)}
                aria-label="Descendre l'exercice"
                title="Descendre"
                className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => supprimer(index)}
                aria-label="Supprimer l'exercice"
                title="Supprimer"
                className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                🗑
              </button>
            </div>
          </div>

          <ChampMarkdown
            label="Énoncé"
            valeur={exercice.enonce}
            onChange={(valeur) => modifier(index, { enonce: valeur })}
            hauteur={140}
            avecInsertionTerme
            avecInsertionCourbe
            avecInsertionVariations
          />
          <ChampMarkdown
            label="Corrigé"
            valeur={exercice.corrige}
            onChange={(valeur) => modifier(index, { corrige: valeur })}
            hauteur={140}
            avecInsertionTerme
            avecInsertionCourbe
            avecInsertionVariations
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...exercices, nouvelExerciceVide()])}
        className="self-start rounded-lg px-3 py-2 text-sm font-medium text-fh-orange transition-colors hover:bg-fh-accent/40"
      >
        + Ajouter un exercice
      </button>

      {exercicesGeneres && (
        <ModaleApercuExercicesIA
          notionId={notionId}
          exercices={exercicesGeneres}
          nombreExercicesExistants={exercices.length}
          onRegenerer={() => genererSection(notionId, "exercices").then((reponse) => reponse.exercices)}
          onAjouter={(generes) => {
            onChange([...exercices, ...generes.map(depuisExerciceGenere)]);
            setExercicesGeneres(null);
          }}
          onRemplacer={(generes) => {
            onChange(generes.map(depuisExerciceGenere));
            setExercicesGeneres(null);
          }}
          onClose={() => setExercicesGeneres(null)}
        />
      )}

      {erreur && <Toast message={erreur} tone="erreur" onClose={() => setErreur(null)} />}
    </div>
  );
}
