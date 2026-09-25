"use client";

import Link from "next/link";

import type { NotionEleve } from "@/lib/eleveApi";
import { IconeCadenas } from "./icones";

interface NotionRowProps {
  notion: NotionEleve;
  /** La leçon de cette notion est-elle déjà téléchargée pour le hors-ligne ?
   * (voir lib/offlineStore.ts) — ignoré si la notion n'a pas de leçon publiée. */
  telechargee?: boolean;
  /** L'élève courant a-t-il un abonnement actif ? Pilote uniquement le
   * cadenas ci-dessous (indication visuelle) — le verrou réel se rejoue
   * toujours côté serveur à l'ouverture de la leçon, voir lib/auth.tsx. */
  abonnementActif?: boolean;
}

/** Une notion : cliquable si une leçon est publiée, grisée sinon ("à venir").
 * Un petit cadenas marque les cours premium tant que l'élève n'a pas
 * d'abonnement actif — pour qu'il sache avant de cliquer, sans empêcher le
 * clic (l'ouverture affichera un aperçu + le mur de déblocage). */
export default function NotionRow({ notion, telechargee = false, abonnementActif = false }: NotionRowProps) {
  if (notion.a_lecon_publiee && notion.lecon_id) {
    const estPremiumVerrouille = notion.lecon_est_gratuite === false && !abonnementActif;
    return (
      <Link
        href={`/eleve/lecons/${notion.lecon_id}`}
        className="flex items-center justify-between gap-3 rounded-lg bg-fh-accent/40 px-3 py-2.5 transition-colors hover:bg-fh-accent"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-medium text-fh-bleu">{notion.titre}</span>
          {estPremiumVerrouille && (
            <span className="shrink-0" aria-label="Cours premium" title="Cours premium">
              <IconeCadenas className="h-3.5 w-3.5 text-fh-orange-fonce" />
            </span>
          )}
          {telechargee && (
            <span className="shrink-0 text-xs" aria-label="Disponible hors-ligne" title="Disponible hors-ligne">
              📥
            </span>
          )}
        </span>
        <span className="shrink-0 rounded-full bg-fh-orange px-2 py-0.5 text-xs font-semibold text-white">
          Leçon disponible
        </span>
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-fh-creme px-3 py-2.5">
      <span className="text-sm text-fh-ardoise/70">{notion.titre}</span>
      <span className="shrink-0 rounded-full bg-fh-sable px-2 py-0.5 text-xs font-medium text-fh-ardoise">
        Leçon à venir
      </span>
    </div>
  );
}
