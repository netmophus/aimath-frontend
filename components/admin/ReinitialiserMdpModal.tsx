"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api";
import type { Compte } from "@/lib/adminApi";
import Modal from "@/components/admin/Modal";

interface ReinitialiserMdpModalProps {
  compte: Compte;
  /** Lance la réinitialisation ; en cas de succès l'appelant ferme la modale. */
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

/** Confirmation de réinitialisation de mot de passe (le nouveau part par SMS, jamais affiché). */
export default function ReinitialiserMdpModal({ compte, onConfirm, onClose }: ReinitialiserMdpModalProps) {
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function handleConfirm() {
    setErreur(null);
    setEnvoiEnCours(true);
    try {
      await onConfirm();
    } catch (error) {
      setErreur(error instanceof ApiError ? error.message : "Réinitialisation impossible.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <Modal titre="Réinitialiser le mot de passe" onClose={onClose}>
      <p className="mb-2 text-sm text-fh-ardoise">
        Un nouveau mot de passe sera généré et envoyé par SMS à{" "}
        <strong className="text-fh-bleu">
          {compte.prenom} {compte.nom}
        </strong>{" "}
        ({compte.telephone}).
      </p>
      <p className="mb-4 text-sm text-fh-ardoise">
        L&apos;ancien mot de passe ne fonctionnera plus, et il devra en choisir un nouveau à sa prochaine connexion.
      </p>

      {erreur && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>}

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
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce disabled:cursor-not-allowed disabled:opacity-60"
        >
          {envoiEnCours ? "Envoi…" : "Réinitialiser et envoyer par SMS"}
        </button>
      </div>
    </Modal>
  );
}
