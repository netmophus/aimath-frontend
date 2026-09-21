"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import Modal from "@/components/admin/Modal";

interface DeleteConfirmModalProps {
  titre: string;
  question: string;
  /**
   * Doit lancer la suppression ET, en cas de succès, fermer la modale côté
   * appelant (ex. mettre l'état "élément à supprimer" à null). Si l'appel
   * échoue (409/400...), l'erreur remonte et s'affiche ICI, dans la modale,
   * sans rien fermer — l'admin comprend pourquoi c'est bloqué.
   */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Confirmation de suppression générique — partagée entre structure, programmes, etc. */
export default function DeleteConfirmModal({
  titre,
  question,
  onConfirm,
  onClose,
}: DeleteConfirmModalProps) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function handleConfirm() {
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      await onConfirm();
    } catch (error) {
      setErreur(
        error instanceof ApiError ? error.message : "Impossible de supprimer cet élément."
      );
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Modal titre={titre} onClose={onClose}>
      <p className="mb-4 text-sm text-fh-ardoise">{question}</p>

      {erreur && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2 text-sm font-medium text-fh-ardoise transition-colors hover:bg-fh-sable/60"
        >
          Annuler
        </button>
        <button
          type="button"
          disabled={envoiEnCours}
          onClick={handleConfirm}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {envoiEnCours ? "Suppression…" : "Supprimer"}
        </button>
      </div>
    </Modal>
  );
}
