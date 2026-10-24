"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface DrawerLateralProps {
  ouvert: boolean;
  onFermer: () => void;
  titre: string;
  children: ReactNode;
}

/**
 * Panneau latéral droit (~80 % de la largeur) avec voile sombre. Fermeture :
 * croix, clic sur le voile, Échap. Bloque le scroll de la page tant qu'il est
 * ouvert, déplace le focus dans le panneau puis le rend au bouton déclencheur.
 * Toujours monté (pour la transition) mais inerte et masqué quand fermé.
 */
export default function DrawerLateral({ ouvert, onFermer, titre, children }: DrawerLateralProps) {
  const titreId = useId();
  const boutonFermerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ouvert) return;

    const declencheur = document.activeElement as HTMLElement | null;
    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    boutonFermerRef.current?.focus();

    function surTouche(event: KeyboardEvent) {
      if (event.key === "Escape") onFermer();
    }
    document.addEventListener("keydown", surTouche);

    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = overflowInitial;
      declencheur?.focus?.();
    };
  }, [ouvert, onFermer]);

  return (
    <div
      className={`fixed inset-0 z-50 ${ouvert ? "" : "pointer-events-none"}`}
      aria-hidden={!ouvert}
      inert={!ouvert}
    >
      <div
        onClick={onFermer}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
          ouvert ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        className={`absolute inset-y-0 right-0 flex w-[95%] max-w-3xl flex-col bg-white shadow-xl transition-transform duration-300 sm:w-[80%] ${
          ouvert ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-fh-sable px-5 py-4">
          <h2 id={titreId} className="text-base font-bold text-fh-bleu">
            {titre}
          </h2>
          <button
            ref={boutonFermerRef}
            type="button"
            onClick={onFermer}
            aria-label="Fermer"
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl leading-none text-fh-bleu transition-colors hover:bg-fh-sable/60"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">{ouvert && children}</div>
      </aside>
    </div>
  );
}
