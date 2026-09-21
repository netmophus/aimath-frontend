"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ADMIN_NAV_ITEMS, isAdminNavItemActive } from "./adminNav";

interface SidebarProps {
  /**
   * Logo pré-rendu, fourni par un composant serveur (voir
   * app/admin/layout.tsx) — Logo.tsx utilise node:fs et ne doit jamais
   * être importé directement depuis ce fichier "use client".
   */
  logo: ReactNode;
  /** Appelé après un clic sur un lien (utilisé pour refermer le tiroir mobile). */
  onNavigate?: () => void;
}

export default function Sidebar({ logo, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-64 shrink-0 flex-col gap-1 overflow-y-auto bg-fh-bleu px-3 py-6">
      <div className="mb-6 px-3">{logo}</div>

      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isAdminNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-fh-orange text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
