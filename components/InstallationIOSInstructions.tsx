"use client";

import Modal from "@/components/admin/Modal";

interface InstallationIOSInstructionsProps {
  onClose: () => void;
}

const ETAPES: readonly { texte: React.ReactNode }[] = [
  {
    texte: (
      <>
        Appuie sur le bouton <strong className="text-fh-bleu">Partager</strong>{" "}
        <span aria-hidden="true">📤</span> en bas de Safari.
      </>
    ),
  },
  {
    texte: (
      <>
        Fais défiler et choisis <strong className="text-fh-bleu">« Sur l&apos;écran d&apos;accueil »</strong>.
      </>
    ),
  },
  {
    texte: (
      <>
        Appuie sur <strong className="text-fh-bleu">« Ajouter »</strong> en haut à droite.
      </>
    ),
  },
];

/**
 * Instructions "Ajouter à l'écran d'accueil" pour iOS/iPadOS Safari — cette
 * plateforme n'expose aucun prompt natif d'installation (voir
 * lib/useInstallationPwa.ts) : guider pas à pas est la seule option.
 * Partagée entre la bannière landing et le bouton de l'espace élève, jamais
 * dupliquée. Pas de captures d'écran réelles (aucun asset de ce type dans
 * le projet) — une numérotation claire + le nom exact des boutons Safari
 * plutôt qu'une illustration approximative fabriquée pour l'occasion.
 * Réutilise components/admin/Modal.tsx (déjà réutilisé hors du contexte
 * admin par components/eleve/ModaleTerme.tsx) plutôt que d'en dupliquer un.
 */
export default function InstallationIOSInstructions({ onClose }: InstallationIOSInstructionsProps) {
  return (
    <Modal titre="Ajouter Fahimta à l'écran d'accueil" onClose={onClose}>
      <ol className="flex flex-col gap-4 text-sm text-fh-ardoise">
        {ETAPES.map((etape, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fh-orange text-xs font-bold text-white">
              {index + 1}
            </span>
            <span className="pt-0.5">{etape.texte}</span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={onClose}
        className="mt-6 min-h-11 w-full rounded-full bg-fh-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
      >
        Compris
      </button>
    </Modal>
  );
}
