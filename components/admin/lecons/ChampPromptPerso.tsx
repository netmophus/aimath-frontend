"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import Toast from "@/components/admin/Toast";

interface ChampPromptPersoProps {
  /** Libellé humain de la section, pour le texte d'aide (ex. "cours rédigé"). */
  libelleSection: string;
  /** Texte actuellement enregistré en base pour cette section (chaîne vide = aucun). */
  valeur: string;
  /** Précision additionnelle affichée sous le texte d'aide générique (ex. pour
   * "exercices", rappeler que le format JSON reste imposé). */
  noteSupplementaire?: string;
  /** Enregistre le nouveau texte ("" = suppression, retour au prompt par
   * défaut) — la requête réseau et la mise à jour de l'état parent sont à la
   * charge de l'appelant ; ce composant ne fait qu'attendre la promesse pour
   * son propre état de chargement/toast. */
  onEnregistrer: (nouvelleValeur: string) => Promise<void>;
}

/**
 * Bloc repliable "prompt personnalisé" pour une section de génération IA —
 * un par section dans l'éditeur de leçon (voir app/admin/lecons/[id]/page.tsx).
 * Replié par défaut pour ne pas encombrer l'éditeur ; un badge "actif"
 * apparaît dès qu'un prompt personnalisé (non vide) existe pour cette
 * section, même replié.
 *
 * Sauvegarde volontairement indépendante du gros "Enregistrer" de la leçon
 * (handleEnregistrer côté page) : les prompts personnalisés sont un réglage
 * de génération IA, pas un champ de la leçon elle-même.
 */
export default function ChampPromptPerso({
  libelleSection,
  valeur,
  noteSupplementaire,
  onEnregistrer,
}: ChampPromptPersoProps) {
  const [ouvert, setOuvert] = useState(false);
  const [brouillon, setBrouillon] = useState(valeur);
  const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
  const [toast, setToast] = useState<{ message: string; tone: "succes" | "erreur" } | null>(null);

  const actif = valeur.trim().length > 0;
  const modifie = brouillon !== valeur;

  async function handleEnregistrer() {
    setEnregistrementEnCours(true);
    try {
      await onEnregistrer(brouillon);
      setToast({
        message: brouillon.trim() ? "Prompt personnalisé enregistré." : "Prompt personnalisé supprimé — retour au prompt par défaut.",
        tone: "succes",
      });
    } catch (error) {
      setToast({ message: error instanceof ApiError ? error.message : "Échec de l'enregistrement.", tone: "erreur" });
    } finally {
      setEnregistrementEnCours(false);
    }
  }

  return (
    <div className="rounded-lg border border-dashed border-fh-bleu-vif/30 bg-fh-creme/60 px-3 py-2">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left text-xs font-medium text-fh-bleu-vif"
      >
        <span className="flex items-center gap-1.5">
          ✏️ Prompt personnalisé pour cette section
          {actif && (
            <span className="rounded-full bg-fh-bleu-vif/15 px-2 py-0.5 text-[10px] font-semibold text-fh-bleu-vif">
              actif
            </span>
          )}
        </span>
        <span aria-hidden>{ouvert ? "▲" : "▼"}</span>
      </button>

      {ouvert && (
        <div className="mt-2 flex flex-col gap-2">
          <p className="text-xs text-fh-ardoise/60">
            Remplace la consigne de génération par défaut pour « {libelleSection} », pour cette notion
            uniquement. Laisser vide = revenir au prompt par défaut. La charte de notation et le programme
            officiel de la notion restent injectés automatiquement, quel que soit ce texte.
            {noteSupplementaire && <> {noteSupplementaire}</>}
          </p>
          <textarea
            value={brouillon}
            onChange={(event) => setBrouillon(event.target.value)}
            placeholder="Laisser vide pour utiliser le prompt par défaut de cette section…"
            className="h-28 w-full resize-y rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 font-mono text-xs text-fh-bleu outline-none focus:border-fh-orange"
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled={enregistrementEnCours || !modifie}
              onClick={handleEnregistrer}
              className="rounded-full border border-fh-bleu-vif/40 px-3 py-1 text-xs font-medium text-fh-bleu-vif transition-colors hover:bg-fh-bleu-vif/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {enregistrementEnCours ? "Enregistrement…" : "Enregistrer le prompt"}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
