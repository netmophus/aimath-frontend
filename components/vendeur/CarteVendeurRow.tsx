import Image from "next/image";

import { PRIX_CARTE_FCFA } from "@/lib/carteApi";
import type { CarteVendeur, EtatCarteVendeur } from "@/lib/vendeurEspaceApi";
import StatutBadge from "@/components/admin/StatutBadge";

const STYLES_ETAT: Record<EtatCarteVendeur, string> = {
  disponible: "bg-fh-accent text-fh-orange-fonce",
  distribuee: "bg-fh-bleu/10 text-fh-bleu",
  activee: "bg-green-100 text-green-700",
};

const LABELS_ETAT: Record<EtatCarteVendeur, string> = {
  disponible: "Disponible",
  distribuee: "Vendue — à activer",
  activee: "Activée",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Une carte du vendeur connecté — MÊME design visuel que l'aperçu admin
 * (components/admin/cartes/CarteRow.tsx : dégradé bleu, logo, pastille prix)
 * mais SANS AUCUNE zone code : un vendeur ne voit jamais un code, à aucun
 * état (voir lib/vendeurEspaceApi.ts — CarteVendeur n'a d'ailleurs pas de
 * champ `code`, il n'existe simplement pas dans la réponse API, rien à
 * masquer ici). À la place de la zone "à gratter", le badge d'état et,
 * pour une carte vendue, à qui et quand. Composant DÉDIÉ, ne réutilise pas
 * CarteRow (qui affiche `carte.code`).
 */
export default function CarteVendeurRow({ carte }: { carte: CarteVendeur }) {
  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E2B6A] to-[#243584] p-4 text-white shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-5">
      <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:gap-1.5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white p-1.5 sm:h-14 sm:w-14">
          <Image src="/fahimta.png" alt="" width={40} height={40} className="h-full w-full object-contain" />
        </span>
        <span className="text-xs font-bold tracking-wide text-white sm:text-sm">Fahimta</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="shrink-0 rounded-full bg-fh-orange px-3 py-1 text-xs font-bold text-white sm:text-sm">
            {PRIX_CARTE_FCFA.toLocaleString("fr-FR")} FCFA
          </span>
          <span className="text-xs text-white/70">
            {carte.duree_jours} jour{carte.duree_jours > 1 ? "s" : ""} · tous les cours
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatutBadge statut={carte.etat} styles={STYLES_ETAT} labels={LABELS_ETAT} />
          {carte.attribuee_a && (
            <span className="text-xs text-white/70">
              {carte.attribuee_a.prenom} {carte.attribuee_a.nom} · {carte.attribuee_a.telephone} ·{" "}
              {carte.etat === "activee"
                ? `activée le ${formatDate(carte.date_activation)}`
                : `vendue le ${formatDate(carte.date_attribution)}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
