import Link from "next/link";

import { IconeChevron, IconeCoche } from "./icones";

interface AbonnementBadgeProps {
  actif: boolean;
  /** Date ISO ("2026-10-25") — abonnement_actif_jusqu_au, une DATE seule
   * (pas datetime) côté backend. */
  echeance: string | null;
}

const SEUIL_EXPIRATION_PROCHE_JOURS = 5;

/** "2026-10-25" → "25 octobre 2026" — même format que RappelAbonnement.tsx
 * (/eleve/abonnement, /eleve/mes-cartes), pas dupliqué à l'identique par
 * choix : ce badge est plus compact (une icône, pas de carte pleine
 * largeur), donc un composant séparé plutôt qu'une variante de
 * RappelAbonnement, mais le format de date reste cohérent partout. */
function formaterDateFr(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Nombre de jours PLEINS avant l'échéance (0 = expire aujourd'hui, négatif
 * = déjà expiré — ne devrait pas arriver ici puisque `actif` est calculé
 * côté backend sur ce même critère, voir User.a_un_abonnement_actif). */
function joursAvantEcheance(iso: string): number {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  const echeance = new Date(`${iso}T00:00:00`);
  return Math.round((echeance.getTime() - aujourdhui.getTime()) / 86_400_000);
}

/**
 * Badge d'état de l'abonnement, en haut du tableau de bord élève (voir
 * app/eleve/page.tsx) — réutilise les données déjà chargées par useAuth()
 * (aUnAbonnementActif/abonnementActifJusquAu, exposées par GET /api/auth/me/),
 * aucun appel réseau supplémentaire ici.
 *
 * Cliquable dans son ENTIER vers /eleve/abonnement (chevron en affordance) :
 * un seul <Link> par état, pas de bouton imbriqué à l'intérieur (un <a>
 * dans un <a> est invalide en HTML) — le bouton "Activer/Prolonger mon
 * abonnement" à côté (voir app/eleve/page.tsx) reste le seul autre chemin
 * vers cette page depuis le dashboard.
 */
export default function AbonnementBadge({ actif, echeance }: AbonnementBadgeProps) {
  if (actif && echeance) {
    const jours = joursAvantEcheance(echeance);
    const expireBientot = jours <= SEUIL_EXPIRATION_PROCHE_JOURS;

    return (
      <Link
        href="/eleve/abonnement"
        className={`flex flex-1 items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
          expireBientot
            ? "bg-fh-orange/10 text-fh-orange-fonce hover:bg-fh-orange/15"
            : "bg-green-50 text-green-800 hover:bg-green-100"
        }`}
      >
        <IconeCoche className="h-4 w-4 shrink-0" />
        <span className="flex-1">
          {expireBientot ? (
            <>
              Ton abonnement expire dans {jours} jour{jours > 1 ? "s" : ""}.
            </>
          ) : (
            <>Abonnement actif jusqu&apos;au {formaterDateFr(echeance)}</>
          )}
        </span>
        <IconeChevron className="h-4 w-4 shrink-0 opacity-60" />
      </Link>
    );
  }

  return (
    <Link
      href="/eleve/abonnement"
      className="flex flex-1 items-center justify-between gap-2 rounded-xl bg-fh-accent/40 px-3.5 py-2.5 text-sm transition-colors hover:bg-fh-accent/60"
    >
      <span className="font-medium text-fh-ardoise">Aucun abonnement actif</span>
      <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-fh-orange-fonce">
        Gérer
        <IconeChevron className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
