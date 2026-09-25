import type { ReactNode } from "react";

import Logo from "@/components/Logo";
import VendeurLayoutClient from "@/components/vendeur/VendeurLayoutClient";

/**
 * Composant serveur volontairement minimal : Logo.tsx lit le système de
 * fichiers (node:fs) et ne doit jamais être importé directement depuis un
 * fichier "use client" (voir app/admin/layout.tsx, app/eleve/layout.tsx
 * pour le même motif).
 */
export default function VendeurLayout({ children }: { children: ReactNode }) {
  return <VendeurLayoutClient logo={<Logo variant="light" />}>{children}</VendeurLayoutClient>;
}
