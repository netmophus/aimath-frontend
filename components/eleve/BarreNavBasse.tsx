"use client";

import { IconBook, IconCreditCard, IconHelp, IconHome, IconUser, type TablerIcon } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { rubriqueActive, type RubriqueNav } from "@/lib/navEleve";

interface Onglet {
  cle: RubriqueNav;
  label: string;
  /** Libellé abrégé pour les très petits écrans (< sm:) — seul « Abonnement » est assez long pour en avoir besoin. */
  labelCourt?: string;
  href: string;
  icone: TablerIcon;
}

/**
 * Barre de navigation basse, fixe, commune à tout l'espace élève (rendue une
 * seule fois par EleveLayoutClient) — persiste du dashboard aux pages
 * programme/leçon/profil. Barre bleu marine arrondie et flottante, rubrique
 * active en capsule orange (visible en permanence, indépendante du survol).
 *
 * Routes : « Accueil » → /eleve (tableau de bord de l'espace élève, actif
 * uniquement dessus) ; « Cours » → /eleve#mes-matieres (seule page qui liste
 * les matières), actif sur programmes/leçons/résolution ; « Abonnement » → /eleve/abonnement (actif aussi sur
 * /eleve/mes-cartes). La détection de la rubrique active est dans
 * lib/navEleve.ts (par segment de chemin, sous-pages incluses).
 */
const ONGLETS: Onglet[] = [
  { cle: "accueil", label: "Accueil", href: "/eleve", icone: IconHome },
  { cle: "cours", label: "Cours", href: "/eleve#mes-matieres", icone: IconBook },
  { cle: "abonnement", label: "Abonnement", labelCourt: "Abo", href: "/eleve/abonnement", icone: IconCreditCard },
  { cle: "aide", label: "Aide", href: "/eleve/aide", icone: IconHelp },
  { cle: "profil", label: "Profil", href: "/eleve/profil", icone: IconUser },
];

export default function BarreNavBasse() {
  const pathname = usePathname();
  const active = rubriqueActive(pathname);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-4">
      <nav
        className="pointer-events-auto mx-auto flex max-w-[1100px] items-stretch gap-1 rounded-[26px] bg-gradient-to-b from-[#1E3382] to-[#172B70] p-1.5 shadow-[0_10px_30px_rgba(23,43,112,0.35)] ring-1 ring-white/10 sm:gap-2 sm:rounded-[32px] sm:p-2.5"
        aria-label="Navigation principale"
      >
        {ONGLETS.map(({ cle, label, labelCourt, href, icone: Icone }) => {
          const estActif = cle === active;
          return (
            <Link
              key={cle}
              href={href}
              aria-current={estActif ? "page" : undefined}
              className={`flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[20px] px-1 py-2 transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none sm:min-h-[64px] sm:rounded-3xl ${
                estActif
                  ? "bg-gradient-to-br from-[#FB923C] to-[#F4511E] text-white shadow-[0_4px_12px_rgba(244,81,30,0.45)]"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icone className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" stroke={estActif ? 2.25 : 1.75} aria-hidden="true" />
              <span className={`text-[11px] leading-tight sm:text-sm ${estActif ? "font-bold" : "font-medium"}`}>
                {labelCourt ? (
                  <>
                    <span className="sm:hidden">{labelCourt}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </>
                ) : (
                  label
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
