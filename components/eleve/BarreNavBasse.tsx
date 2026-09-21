"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconeAccueil, IconeAide, IconeLivre, IconeProfil } from "./icones";

interface BarreNavBasseProps {
  /** Cible de l'onglet "Cours" — calculée par app/eleve/page.tsx : 1 seule
   * matière → son programme directement ; sinon → ancre "Mes matières". */
  hrefCours: string;
}

interface Onglet {
  label: string;
  href: string;
  icone: typeof IconeAccueil;
  actif: (pathname: string) => boolean;
}

/**
 * Barre de navigation basse, fixe, propre au dashboard (le reste de l'espace
 * élève — programme, lecture de leçon — ne l'affiche pas : cf. consigne
 * "le reste ne change pas"). Colonne centrée à ~440px max, comme le reste de
 * l'espace élève, pour rester lisible sur grand écran.
 */
export default function BarreNavBasse({ hrefCours }: BarreNavBasseProps) {
  const pathname = usePathname();

  const onglets: Onglet[] = [
    { label: "Accueil", href: "/eleve", icone: IconeAccueil, actif: (p) => p === "/eleve" },
    { label: "Cours", href: hrefCours, icone: IconeLivre, actif: (p) => p.startsWith("/eleve/programmes") },
    { label: "Aide", href: "/eleve/aide", icone: IconeAide, actif: (p) => p.startsWith("/eleve/aide") },
    { label: "Profil", href: "/eleve/profil", icone: IconeProfil, actif: (p) => p.startsWith("/eleve/profil") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-fh-sable bg-white pb-[max(0.25rem,env(safe-area-inset-bottom))]"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-[440px] items-stretch justify-around">
        {onglets.map(({ label, href, icone: Icone, actif }) => {
          const estActif = actif(pathname);
          return (
            <Link
              key={label}
              href={href}
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5"
              aria-current={estActif ? "page" : undefined}
            >
              <Icone className={`h-5 w-5 ${estActif ? "text-fh-orange" : "text-fh-ardoise/50"}`} />
              <span className={`text-[11px] font-medium ${estActif ? "text-fh-orange" : "text-fh-ardoise/60"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
