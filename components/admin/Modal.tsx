"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  titre: string;
  onClose: () => void;
  children: ReactNode;
  /** "md" (défaut, 28rem) convient à la plupart des formulaires ; "lg" (42rem)
   * pour un contenu plus riche (ex. un éditeur Markdown côte à côte). */
  taille?: "md" | "lg";
}

/** Petite boîte de dialogue générique, sans dépendance externe. */
export default function Modal({ titre, onClose, children, taille = "md" }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-fh-bleu-charbon/60"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-titre"
        className={`relative w-full ${taille === "lg" ? "max-w-2xl" : "max-w-md"} rounded-2xl bg-white p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="modal-titre" className="text-lg font-bold text-fh-bleu">
            {titre}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-fh-ardoise transition-colors hover:bg-fh-sable/60"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
