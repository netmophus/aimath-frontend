import type { ReactNode } from "react";

import Logo from "@/components/Logo";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

/**
 * Composant serveur volontairement minimal : c'est ici, et seulement ici,
 * que Logo (qui lit le système de fichiers) peut être instancié sans
 * finir embarqué dans le bundle client. Toute la logique (garde d'accès,
 * sidebar/topbar, responsive) vit dans AdminLayoutClient.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutClient logo={<Logo variant="light" />}>
      {children}
    </AdminLayoutClient>
  );
}
