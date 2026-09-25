"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconeAccueil, IconeAide, IconeCartes, IconeLivre, IconeProfil } from "./icones";

interface Onglet {
  label: string;
  /** Libellé abrégé pour les très petits écrans (< sm:) — voir l'onglet
   * "Abonnement" ci-dessous, seul assez long pour en avoir besoin. Absent =
   * `label` sert aussi de libellé court (cas des 4 autres onglets, déjà courts). */
  labelCourt?: string;
  href: string;
  icone: typeof IconeAccueil;
  actif: (pathname: string) => boolean;
}

/**
 * Barre de navigation basse, fixe, commune à tout l'espace élève (rendue une
 * seule fois par EleveLayoutClient, pas par chaque page) — persiste donc du
 * dashboard aux pages programme/leçon/profil. Colonne centrée à ~440px max,
 * comme le reste de l'espace élève, pour rester lisible sur grand écran.
 *
 * "Accueil" sort volontairement de l'espace élève vers la landing publique
 * ("/"). "Cours" pointe vers /eleve#mes-matieres : la seule page qui liste
 * les matières/programmes de l'élève (app/eleve/page.tsx, section "Mes
 * matières") — il n'existe pas de route /eleve/programmes dédiée (seulement
 * /eleve/programmes/[id], une fiche par matière), donc pas de cible plus
 * précise possible. Actif aussi sur ces fiches individuelles.
 *
 * "Abonnement" mène à /eleve/abonnement (carte Fahimta + paiement NITA) —
 * PAS /eleve/mes-cartes : cette dernière reste accessible via son URL et le
 * lien "Voir mes cartes reçues →" en haut de la page abonnement, mais n'a
 * plus son propre onglet (l'abonnement, plus général, est la vraie
 * destination attendue depuis la barre basse). `labelCourt="Abo"` : seul
 * des 5 libellés assez long pour déborder sur un très petit écran (< sm:,
 * même technique que components/eleve/CarteMatiere.tsx pour "Mathématiques").
 */
export default function BarreNavBasse() {
  const pathname = usePathname();

  const onglets: Onglet[] = [
    { label: "Accueil", href: "/", icone: IconeAccueil, actif: (p) => p === "/" },
    {
      label: "Cours",
      href: "/eleve#mes-matieres",
      icone: IconeLivre,
      actif: (p) => p === "/eleve" || p.startsWith("/eleve/programmes"),
    },
    {
      label: "Abonnement",
      labelCourt: "Abo",
      href: "/eleve/abonnement",
      icone: IconeCartes,
      actif: (p) => p.startsWith("/eleve/abonnement"),
    },
    { label: "Aide", href: "/eleve/aide", icone: IconeAide, actif: (p) => p.startsWith("/eleve/aide") },
    { label: "Profil", href: "/eleve/profil", icone: IconeProfil, actif: (p) => p.startsWith("/eleve/profil") },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-fh-bleu pb-[max(0.25rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgba(0,0,0,0.15)]"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-[440px] items-stretch justify-around">
        {onglets.map(({ label, labelCourt, href, icone: Icone, actif }) => {
          const estActif = actif(pathname);
          return (
            <Link
              key={label}
              href={href}
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5"
              aria-current={estActif ? "page" : undefined}
            >
              <Icone className={`h-5 w-5 ${estActif ? "text-fh-orange" : "text-white/60"}`} />
              <span className={`text-[11px] font-medium ${estActif ? "text-fh-orange" : "text-white/60"}`}>
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
      </div>
    </nav>
  );
}
