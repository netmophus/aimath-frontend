"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Actions de la Navbar : boutons "Se connecter" / "S'enregistrer" affichés
 * en ligne à partir de sm, repliés derrière un bouton hamburger en dessous
 * (menu déroulant). Composant client pour l'état d'ouverture du menu.
 */
export default function NavbarMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Actions visibles à partir de sm */}
      <div className="hidden items-center gap-2 sm:flex sm:gap-3">
        <Link
          href="/login"
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:border-fh-bleu/40 hover:bg-fh-sable/60"
        >
          Se connecter
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-fh-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
        >
          S&apos;enregistrer
        </Link>
      </div>

      {/* Bouton hamburger, petits écrans uniquement */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="navbar-mobile-menu"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-fh-bleu/20 text-fh-bleu transition-colors hover:bg-fh-sable/60 sm:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          {open ? (
            <path d="M6 6l12 12M18 6l-12 12" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {/* Menu déroulant, petits écrans uniquement */}
      {open && (
        <div
          id="navbar-mobile-menu"
          className="absolute right-0 top-full z-50 mt-2 flex w-48 flex-col gap-2 rounded-2xl border border-fh-sable bg-fh-creme p-3 shadow-lg sm:hidden"
        >
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-center text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="rounded-full bg-fh-orange px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
          >
            S&apos;enregistrer
          </Link>
        </div>
      )}
    </div>
  );
}
