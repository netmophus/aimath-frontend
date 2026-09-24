"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { getAdminPageTitle } from "./adminNav";

interface AdminLayoutClientProps {
  children: ReactNode;
  /**
   * Logo pré-rendu par un composant serveur (voir app/admin/layout.tsx).
   * Logo.tsx lit le système de fichiers (node:fs) : il ne doit jamais être
   * importé directement depuis un fichier "use client", sous peine
   * d'échec Turbopack ("does not support external modules node:fs").
   */
  logo: ReactNode;
}

/**
 * Garde d'accès : réservé aux utilisateurs authentifiés avec role === "admin".
 * Ceci n'est qu'un confort d'UI (éviter d'afficher l'interface admin à qui
 * n'y a pas droit) — la vraie protection des données est côté API (JWT).
 */
export default function AdminLayoutClient({ children, logo }: AdminLayoutClientProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const autorise = isAuthenticated && user?.role === "admin";

  useEffect(() => {
    if (!isLoading && !autorise) {
      router.replace("/login");
    }
  }, [isLoading, autorise, router]);

  if (isLoading || !autorise) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-fh-creme">
        <p className="text-sm text-fh-ardoise">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-fh-creme">
      {/* Sidebar fixe, écrans larges */}
      <div className="hidden lg:block">
        <Sidebar logo={logo} />
      </div>

      {/* Tiroir de navigation, petits écrans */}
      {menuOuvert && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMenuOuvert(false)}
            className="absolute inset-0 bg-fh-bleu-charbon/60"
          />
          <div className="absolute inset-y-0 left-0">
            <Sidebar logo={logo} onNavigate={() => setMenuOuvert(false)} />
          </div>
        </div>
      )}

      {/* min-w-0 indispensable : un enfant flex-1 sans min-width explicite
          garde le min-width:auto par défaut du navigateur (= la largeur
          minimale de SON contenu) — un contenu profondément imbriqué avec du
          texte long (ex. l'arbre des leçons) pouvait alors forcer toute la
          mise en page plus large que le viewport sur mobile, empêchant tout
          rétrécissement malgré flex-1 (bug latent révélé en testant l'arbre
          des leçons sur 390px, jamais déclenché avant sur les autres pages
          admin). */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar
          title={getAdminPageTitle(pathname)}
          onOpenMenu={() => setMenuOuvert(true)}
        />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
