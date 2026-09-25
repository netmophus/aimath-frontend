import type { CSSProperties } from "react";
import Image from "next/image";

import { PRIX_CARTE_FCFA, type CarteFahimta, type EtatCarte } from "@/lib/carteApi";
import StatutBadge from "@/components/admin/StatutBadge";

const STYLES_ETAT: Record<EtatCarte, string> = {
  stock_central: "bg-fh-sable text-fh-ardoise",
  assignee: "bg-fh-bleu/15 text-white",
  vendue: "bg-fh-accent text-fh-orange-fonce",
  utilisee: "bg-green-100 text-green-700",
};

const LABELS_ETAT: Record<EtatCarte, string> = {
  stock_central: "Stock central",
  assignee: "Assignée",
  vendue: "Vendue",
  utilisee: "Utilisée",
};

/** Date seule ("25 sept. 2026") — pour l'assignation à un vendeur, la
 * consigne ne demande pas l'heure (contrairement à vente/activation). */
function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Date ET heure ("25 sept. 2026 à 14:32") — vente et activation d'une
 * carte doivent afficher l'heure (consigne de suivi admin). */
function formatDateHeure(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Hachures grises en CSS pur (pas d'image) pour la bande "à gratter" —
 * assez discrètes pour ne pas nuire à la lisibilité du code par-dessus. */
const TEXTURE_GRATTAGE: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(45deg, rgba(255,255,255,0.14) 0px, rgba(255,255,255,0.14) 2px, transparent 2px, transparent 9px)",
};

/**
 * Aperçu façon "carte à gratter" Fahimta — PUREMENT COSMÉTIQUE (voir
 * app/admin/cartes/page.tsx : la donnée réelle, les filtres, la pagination
 * et l'export ne changent pas). Le code affiché est EXACTEMENT `carte.code`
 * tel que renvoyé par l'API — masqué pour une carte active, en clair pour
 * une carte utilisée — jamais recalculé ni deviné ici : la seule source de
 * vérité sur ce qui doit apparaître reste comptes.cartes.code_masque côté
 * backend.
 *
 * Le badge et la ligne de traçabilité sous le code suivent `carte.etat`
 * (voir comptes.cartes.etat_carte, MÊME calcul serveur, jamais recalculé
 * ici) : stock central (rien de plus), assignée (chez quel vendeur, depuis
 * quand), vendue (à quel élève, quand, via quel vendeur), utilisée (activée
 * par qui, quand, vendeur d'origine). Réutilisé tel quel par la page
 * /admin/cartes ET la page de détail d'un vendeur.
 */
export default function CarteRow({ carte }: { carte: CarteFahimta }) {
  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E2B6A] to-[#243584] p-4 text-white shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      {/* Logo, à gauche */}
      <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:gap-1.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white p-1.5 sm:h-14 sm:w-14">
          <Image src="/fahimta.png" alt="" width={40} height={40} className="h-full w-full object-contain" />
        </span>
        <span className="text-xs font-bold tracking-wide text-white sm:text-sm">Fahimta</span>
      </div>

      {/* Contenu, à droite */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 rounded-full bg-fh-orange px-3 py-1 text-xs font-bold text-white sm:text-sm">
            {PRIX_CARTE_FCFA.toLocaleString("fr-FR")} FCFA
          </span>
          <span className="text-xs text-white/70">
            {carte.duree_jours} jour{carte.duree_jours > 1 ? "s" : ""} · tous les cours
          </span>
        </div>

        {/* Zone "à gratter" : code EXACTEMENT tel que fourni par l'API. */}
        <div
          style={TEXTURE_GRATTAGE}
          className="flex items-center justify-center rounded-lg bg-fh-bleu-charbon/60 px-3 py-2.5"
        >
          <span className="break-all text-center font-mono text-sm font-semibold tracking-wide text-white sm:text-base">
            {carte.code}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatutBadge statut={carte.etat} styles={STYLES_ETAT} labels={LABELS_ETAT} />

          {carte.etat === "assignee" && carte.vendeur && (
            <span className="text-xs text-white/70">
              Chez {carte.vendeur.prenom} {carte.vendeur.nom} depuis le {formatDate(carte.date_assignation)}
            </span>
          )}

          {carte.etat === "vendue" && carte.attribuee_a && (
            <span className="text-xs text-white/70">
              Vendue à {carte.attribuee_a.prenom} {carte.attribuee_a.nom} ({carte.attribuee_a.telephone}) le{" "}
              {formatDateHeure(carte.date_attribution)}
              {carte.vendeur && ` · via ${carte.vendeur.prenom} ${carte.vendeur.nom}`}
            </span>
          )}

          {carte.etat === "utilisee" && carte.utilisee_par && (
            <span className="text-xs text-white/70">
              Activée par {carte.utilisee_par.prenom} {carte.utilisee_par.nom} le{" "}
              {formatDateHeure(carte.date_activation)}
              {carte.vendeur && ` · vendeur d'origine : ${carte.vendeur.prenom} ${carte.vendeur.nom}`}
            </span>
          )}
        </div>

        <p className="text-[11px] text-white/50">myfahimta.com › Mon abonnement</p>
      </div>
    </div>
  );
}
