"use client";

import { useState } from "react";

import type { Compte } from "@/lib/adminApi";
import { TEXTE_ACTIVATION } from "@/lib/communications";
import Modal from "@/components/admin/Modal";
import ComposerModal from "./ComposerModal";

interface Props {
  /** Compte qui vient d'être activé avec succès. Rien n'est envoyé tant que l'administrateur n'a pas confirmé. */
  compte: Compte;
  onClose: () => void;
  onTermine?: () => void;
}

/** Proposition facultative après une approbation réussie : « Plus tard » ou « Préparer le SMS ». */
export default function ActivationFlow({ compte, onClose, onTermine }: Props) {
  const [prepare, setPrepare] = useState(false);

  if (prepare) {
    return <ComposerModal type="activation" destinataire={compte} texteInitial={TEXTE_ACTIVATION} onClose={onClose} onTermine={onTermine} />;
  }

  return (
    <Modal titre="Compte activé" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-fh-bleu">
          Le compte de <strong>{compte.prenom} {compte.nom}</strong> est activé.
        </p>
        <p className="text-sm text-fh-ardoise">Souhaites-tu informer cet utilisateur par SMS ? Aucun message ne part sans ta confirmation.</p>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu hover:bg-fh-sable/60">
            Plus tard
          </button>
          <button type="button" onClick={() => setPrepare(true)} className="rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700">
            Préparer le SMS
          </button>
        </div>
      </div>
    </Modal>
  );
}
