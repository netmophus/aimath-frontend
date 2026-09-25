"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import type { Role } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface VendeurLayoutClientProps {
  children: ReactNode;
  /** Logo pré-rendu par un composant serveur — voir app/vendeur/layout.tsx
   * (Logo.tsx lit node:fs, ne doit jamais être importé depuis un fichier
   * "use client", même motif qu'EleveLayoutClient/AdminLayoutClient). */
  logo: ReactNode;
}

const REDIRECTION_AUTRE_ROLE: Partial<Record<Role, string>> = {
  admin: "/admin",
  eleve: "/eleve",
  enseignant: "/enseignant",
  partenaire: "/partenaire",
};

/**
 * Garde d'accès vendeur, même esprit qu'EleveLayoutClient/AdminLayoutClient :
 * un confort d'UI, la vraie protection reste côté API (JWT + IsVendeurActif).
 * Espace volontairement simple (pas de sidebar, une seule page dashboard) :
 * le vendeur n'a que 2 actions (vendre une carte, consulter son historique).
 */
export default function VendeurLayoutClient({ children, logo }: VendeurLayoutClientProps) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const estVendeur = isAuthenticated && user?.role === "vendeur";

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== "vendeur") {
      router.replace(REDIRECTION_AUTRE_ROLE[user.role] ?? "/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (isLoading || !estVendeur || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fh-creme">
        <p className="text-sm text-fh-ardoise">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-fh-creme">
      <header className="bg-fh-bleu px-4 py-4 text-white sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {logo}
          <div className="flex items-center gap-3">
            <p className="hidden text-sm font-medium text-white sm:block">
              {user.prenom} {user.nom}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-9 shrink-0 rounded-full border border-white/40 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
