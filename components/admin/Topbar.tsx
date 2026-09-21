"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";

interface TopbarProps {
  title: string;
  /** Fourni uniquement sur mobile, pour ouvrir le tiroir de navigation. */
  onOpenMenu?: () => void;
}

export default function Topbar({ title, onOpenMenu }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-fh-sable bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        {onOpenMenu && (
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Ouvrir le menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fh-bleu/20 text-fh-bleu transition-colors hover:bg-fh-sable/60 lg:hidden"
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
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold text-fh-bleu sm:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="hidden text-sm text-fh-ardoise sm:inline">
            {user.prenom} {user.nom}
          </span>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
}
