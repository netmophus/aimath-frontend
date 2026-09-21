"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import type { Difficulte } from "@/lib/leconApi";
import { serialiserExercicesPourVerification, verifierContenu, type ExerciceGenere } from "@/lib/iaApi";
import Modal from "@/components/admin/Modal";
import RenduMarkdown from "@/components/RenduMarkdown";
import AvisVerificationIA from "./AvisVerificationIA";
import { MENTION_CONTENU_IA } from "./sectionsIA";

interface ModaleApercuExercicesIAProps {
  notionId: number;
  /** Exercices générés à afficher au départ (le premier appel a déjà eu
   * lieu — cette modale ne s'ouvre qu'au succès, voir EditeurExercices). */
  exercices: ExerciceGenere[];
  /** Nombre d'exercices déjà présents dans l'éditeur : détermine si on
   * propose "Ajouter" seul, ou le choix Ajouter/Remplacer. */
  nombreExercicesExistants: number;
  onRegenerer: () => Promise<ExerciceGenere[]>;
  onAjouter: (exercices: ExerciceGenere[]) => void;
  onRemplacer: (exercices: ExerciceGenere[]) => void;
  onClose: () => void;
}

const STYLES_DIFFICULTE: Record<Difficulte, string> = {
  facile: "bg-green-100 text-green-700",
  moyen: "bg-amber-100 text-amber-700",
  difficile: "bg-red-100 text-red-700",
};

const LABELS_DIFFICULTE: Record<Difficulte, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
};

/**
 * Modale d'aperçu pour un lot d'exercices générés par IA. Comportement
 * d'insertion retenu (voir décisions produit) : "Ajouter à la suite" est
 * l'action recommandée et non destructive — toujours proposée ; "Remplacer"
 * n'apparaît que s'il existe déjà des exercices, et demande confirmation
 * (destructif). N'écrit rien en base : les deux actions passent par
 * onAjouter/onRemplacer, qui mettent seulement à jour l'état d'édition —
 * la sauvegarde reste le bouton "Enregistrer" existant.
 */
export default function ModaleApercuExercicesIA({
  notionId,
  exercices,
  nombreExercicesExistants,
  onRegenerer,
  onAjouter,
  onRemplacer,
  onClose,
}: ModaleApercuExercicesIAProps) {
  const [exercicesAffiches, setExercicesAffiches] = useState(exercices);
  const [regenerationEnCours, setRegenerationEnCours] = useState(false);
  const [erreurGeneration, setErreurGeneration] = useState<string | null>(null);

  const [avis, setAvis] = useState<string | null>(null);
  const [verificationEnCours, setVerificationEnCours] = useState(false);
  const [erreurVerification, setErreurVerification] = useState<string | null>(null);

  async function handleRegenerer() {
    setRegenerationEnCours(true);
    setErreurGeneration(null);
    setAvis(null);
    try {
      setExercicesAffiches(await onRegenerer());
    } catch (error) {
      setErreurGeneration(error instanceof ApiError ? error.message : "La génération a échoué.");
    } finally {
      setRegenerationEnCours(false);
    }
  }

  async function handleVerifier() {
    setVerificationEnCours(true);
    setErreurVerification(null);
    try {
      const { avis: texteAvis } = await verifierContenu(
        "exercices",
        serialiserExercicesPourVerification(exercicesAffiches),
        notionId
      );
      setAvis(texteAvis);
    } catch (error) {
      setErreurVerification(error instanceof ApiError ? error.message : "La vérification a échoué.");
    } finally {
      setVerificationEnCours(false);
    }
  }

  function handleRemplacer() {
    if (!window.confirm(`Les ${nombreExercicesExistants} exercice(s) existant(s) seront supprimés et remplacés par ces ${exercicesAffiches.length} nouveaux. Continuer ?`)) {
      return;
    }
    onRemplacer(exercicesAffiches);
  }

  const actionEnCours = regenerationEnCours || verificationEnCours;

  return (
    <Modal titre={`Aperçu IA — Exercices (${exercicesAffiches.length})`} onClose={onClose} taille="lg">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-fh-ardoise/60">{MENTION_CONTENU_IA}</p>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={actionEnCours}
            onClick={handleVerifier}
            className="inline-flex items-center gap-1.5 rounded-full border border-fh-bleu/30 px-3 py-1 text-xs font-medium text-fh-bleu transition-colors hover:bg-fh-sable/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verificationEnCours ? "Vérification en cours…" : "🔍 Vérifier avec l'IA"}
          </button>
        </div>

        <div className="flex max-h-96 flex-col gap-3 overflow-auto">
          {exercicesAffiches.map((exercice, index) => (
            <div key={index} className="flex flex-col gap-2 rounded-lg border border-fh-sable bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-fh-bleu">Exercice {index + 1}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES_DIFFICULTE[exercice.difficulte]}`}>
                  {LABELS_DIFFICULTE[exercice.difficulte]}
                </span>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fh-ardoise/60">Énoncé</p>
                <RenduMarkdown contenu={exercice.enonce} />
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-fh-ardoise/60">Corrigé</p>
                <RenduMarkdown contenu={exercice.corrige} />
              </div>
            </div>
          ))}
        </div>

        {erreurGeneration && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurGeneration}</p>}
        {erreurVerification && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreurVerification}</p>
        )}
        {avis && <AvisVerificationIA avis={avis} />}

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={actionEnCours}
            onClick={handleRegenerer}
            className="rounded-full border border-fh-bleu-vif/40 px-4 py-2 text-sm font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {regenerationEnCours ? "Régénération…" : "Régénérer"}
          </button>
          {nombreExercicesExistants > 0 && (
            <button
              type="button"
              disabled={regenerationEnCours}
              onClick={handleRemplacer}
              className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remplacer les exercices existants
            </button>
          )}
          <button
            type="button"
            disabled={regenerationEnCours}
            onClick={() => onAjouter(exercicesAffiches)}
            className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            Ajouter à la suite
          </button>
        </div>
      </div>
    </Modal>
  );
}
