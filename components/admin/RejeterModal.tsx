"use client";

import { useState } from "react";

import type { Compte } from "@/lib/adminApi";
import Modal from "./Modal";

interface RejeterModalProps {
  compte: Compte;
  enCours: boolean;
  onConfirm: (motif: string) => void;
  onClose: () => void;
}

/** Boîte de dialogue de rejet avec motif optionnel — partagée entre /admin/validations et /admin/utilisateurs. */
export default function RejeterModal({ compte, enCours, onConfirm, onClose }: RejeterModalProps) {
  const [motif, setMotif] = useState("");

  return (
    <Modal titre={`Rejeter le compte de ${compte.prenom} ${compte.nom}`} onClose={onClose}>
      <label htmlFor="motif" className="mb-1 block text-sm font-medium text-fh-ardoise">
        Motif (optionnel)
      </label>
      <textarea
        id="motif"
        rows={3}
        value={motif}
        onChange={(event) => setMotif(event.target.value)}
        placeholder="Ex. numéro non joignable pour vérification"
        className="mb-4 w-full rounded-lg border border-fh-bleu-vif/20 bg-fh-creme px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange"
      />
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
          disabled={enCours}
          onClick={() => onConfirm(motif)}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enCours ? "Rejet…" : "Confirmer le rejet"}
        </button>
      </div>
    </Modal>
  );
}
