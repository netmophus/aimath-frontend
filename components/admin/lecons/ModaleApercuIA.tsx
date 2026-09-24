"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import { estSectionVerifiable, verifierContenu, type SectionTexteIA } from "@/lib/iaApi";
import Modal from "@/components/admin/Modal";
import RenduMarkdown from "@/components/RenduMarkdown";
import AvisVerificationIA from "./AvisVerificationIA";
import { LIBELLES_SECTION_IA, MENTION_CONTENU_IA } from "./sectionsIA";

type Onglet = "apercu" | "brut";

interface ModaleApercuIAProps {
  section: SectionTexteIA;
  notionId: number;
  /** Contenu généré à afficher au départ (le premier appel a déjà eu lieu
   * dans BoutonGenererSectionIA — cette modale ne s'ouvre qu'au succès). */
  contenu: string;
  /** Contenu ACTUEL du champ dans l'éditeur — sert uniquement à décider si
   * "Insérer" doit demander confirmation (champ non vide = remplacement). */
  valeurActuelle: string;
  /** Le contenu initial (voir `contenu`) a-t-il été coupé par la limite de
   * tokens côté serveur ? Affiche un avertissement — n'empêche pas l'insertion. */
  tronque?: boolean;
  onRegenerer: () => Promise<{ contenu: string; tronque?: boolean }>;
  onInsere: (contenu: string) => void;
  onClose: () => void;
}

const ONGLET_ACTIF = "rounded-full bg-white px-3 py-1 text-xs font-semibold text-fh-bleu shadow-sm";
const ONGLET_INACTIF = "rounded-full px-3 py-1 text-xs font-medium text-fh-ardoise/70 transition-colors hover:text-fh-bleu";

/**
 * Modale d'aperçu d'un contenu de section généré par IA : bascule
 * Aperçu / Markdown brut, vérification IA optionnelle (avis indicatif),
 * puis Régénérer / Insérer / Annuler.
 *
 * N'écrit RIEN en base : "Insérer" ne fait que remplacer le contenu dans
 * l'état d'édition de la page (EditeurState) — la sauvegarde reste le bouton
 * "Enregistrer" existant, comme si l'admin avait tapé ce texte lui-même.
 */
export default function ModaleApercuIA({
  section,
  notionId,
  contenu,
  valeurActuelle,
  tronque,
  onRegenerer,
  onInsere,
  onClose,
}: ModaleApercuIAProps) {
  const [contenuAffiche, setContenuAffiche] = useState(contenu);
  const [tronqueAffiche, setTronqueAffiche] = useState(!!tronque);
  const [onglet, setOnglet] = useState<Onglet>("apercu");
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
      const { contenu: nouveauContenu, tronque: nouveauTronque } = await onRegenerer();
      setContenuAffiche(nouveauContenu);
      setTronqueAffiche(!!nouveauTronque);
    } catch (error) {
      setErreurGeneration(error instanceof ApiError ? error.message : "La génération a échoué.");
    } finally {
      setRegenerationEnCours(false);
    }
  }

  async function handleVerifier() {
    // Garde redondante avec l'affichage conditionnel du bouton ci-dessous :
    // ne change rien à l'exécution (le bouton n'existe pas sinon), mais
    // permet à TS de restreindre `section` au type attendu par verifierContenu.
    if (!estSectionVerifiable(section)) return;

    setVerificationEnCours(true);
    setErreurVerification(null);
    try {
      const { avis: texteAvis } = await verifierContenu(section, contenuAffiche, notionId);
      setAvis(texteAvis);
    } catch (error) {
      setErreurVerification(error instanceof ApiError ? error.message : "La vérification a échoué.");
    } finally {
      setVerificationEnCours(false);
    }
  }

  function handleInserer() {
    if (
      valeurActuelle.trim() &&
      !window.confirm("Le contenu actuel de ce champ sera remplacé par le texte généré. Continuer ?")
    ) {
      return;
    }
    onInsere(contenuAffiche);
  }

  const actionEnCours = regenerationEnCours || verificationEnCours;

  return (
    <Modal titre={`Aperçu IA — ${LIBELLES_SECTION_IA[section]}`} onClose={onClose} taille="lg">
      <div className="flex flex-col gap-4">
        <p className="text-xs text-fh-ardoise/60">{MENTION_CONTENU_IA}</p>

        {tronqueAffiche && (
          <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            ⚠️ Génération incomplète — le contenu a été coupé (limite atteinte). Régénère ou complète à la main avant d&apos;insérer.
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1 rounded-full bg-fh-creme p-1">
            <button
              type="button"
              onClick={() => setOnglet("apercu")}
              className={onglet === "apercu" ? ONGLET_ACTIF : ONGLET_INACTIF}
            >
              Aperçu
            </button>
            <button
              type="button"
              onClick={() => setOnglet("brut")}
              className={onglet === "brut" ? ONGLET_ACTIF : ONGLET_INACTIF}
            >
              Markdown brut
            </button>
          </div>

          {estSectionVerifiable(section) && (
            <button
              type="button"
              disabled={actionEnCours}
              onClick={handleVerifier}
              className="inline-flex items-center gap-1.5 rounded-full border border-fh-bleu/30 px-3 py-1 text-xs font-medium text-fh-bleu transition-colors hover:bg-fh-sable/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verificationEnCours ? "Vérification en cours…" : "🔍 Vérifier avec l'IA"}
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-auto rounded-lg border border-fh-sable bg-white px-4 py-3">
          {onglet === "apercu" ? (
            <RenduMarkdown contenu={contenuAffiche} />
          ) : (
            <pre className="whitespace-pre-wrap break-words font-mono text-xs text-fh-bleu">{contenuAffiche}</pre>
          )}
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
          <button
            type="button"
            disabled={regenerationEnCours}
            onClick={handleInserer}
            className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
          >
            Insérer
          </button>
        </div>
      </div>
    </Modal>
  );
}
