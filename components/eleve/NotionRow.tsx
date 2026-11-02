"use client";

import Link from "next/link";
import { IconBook2, IconChevronRight } from "@tabler/icons-react";

import type { NotionEleve } from "@/lib/eleveApi";
import { IconeCadenas } from "./icones";

/** Classes de couleur d'un chapitre, transmises par ThemeAccordion pour teinter légèrement ses lignes de leçons. */
export interface TeinteNotion {
  /** fond très léger de la ligne + survol */
  fond: string;
  /** pastille d'icône (livre) */
  pastille: string;
}

interface NotionRowProps {
  notion: NotionEleve;
  /** La leçon de cette notion est-elle déjà téléchargée pour le hors-ligne ?
   * (voir lib/offlineStore.ts) — ignoré si la notion n'a pas de leçon publiée. */
  telechargee?: boolean;
  /** L'élève courant a-t-il un abonnement actif ? Pilote uniquement le
   * cadenas ci-dessous (indication visuelle) — le verrou réel se rejoue
   * toujours côté serveur à l'ouverture de la leçon, voir lib/auth.tsx. */
  abonnementActif?: boolean;
  teinte: TeinteNotion;
}

/** Une notion : cliquable si une leçon est publiée, grisée sinon ("à venir").
 * Un petit cadenas marque les cours premium tant que l'élève n'a pas
 * d'abonnement actif — pour qu'il sache avant de cliquer, sans empêcher le
 * clic (l'ouverture affichera un aperçu + le mur de déblocage). « Leçon
 * disponible » signale seulement qu'une leçon est publiée : aucune notion de
 * leçon terminée (on ne suit pas la progression de l'élève). */
export default function NotionRow({ notion, telechargee = false, abonnementActif = false, teinte }: NotionRowProps) {
  if (notion.a_lecon_publiee && notion.lecon_id) {
    const estPremiumVerrouille = notion.lecon_est_gratuite === false && !abonnementActif;
    return (
      <Link
        href={`/eleve/lecons/${notion.lecon_id}`}
        className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#102A66] ${teinte.fond}`}
      >
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${teinte.pastille}`} aria-hidden="true">
          <IconBook2 size={20} stroke={1.75} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:gap-y-1">
          <span className="min-w-0 break-words text-sm font-semibold text-[#102A66] sm:text-base">{notion.titre}</span>
          {estPremiumVerrouille && (
            <span className="shrink-0" aria-label="Cours premium" title="Cours premium">
              <IconeCadenas className="h-4 w-4 text-[#C2410C]" />
            </span>
          )}
          {telechargee && (
            <span className="shrink-0 text-xs" aria-label="Disponible hors-ligne" title="Disponible hors-ligne">
              📥
            </span>
          )}
          {/* petit écran : la pastille passe sous le titre pour lui laisser toute la largeur */}
          <span className="w-fit rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 sm:hidden">Leçon disponible</span>
        </span>
        <span className="hidden shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 sm:inline-block">Leçon disponible</span>
        <IconChevronRight size={20} stroke={2} className="shrink-0 text-[#102A66]/60" aria-hidden="true" />
      </Link>
    );
  }

  return (
    <div className="flex min-h-12 items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-500" aria-hidden="true">
        <IconBook2 size={20} stroke={1.75} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5 sm:block">
        <span className="min-w-0 break-words text-sm text-slate-600 sm:text-base">{notion.titre}</span>
        <span className="w-fit rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 sm:hidden">Leçon à venir</span>
      </span>
      <span className="hidden shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 sm:inline-block">Leçon à venir</span>
    </div>
  );
}
