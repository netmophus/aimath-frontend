"use client";

import Link from "next/link";

import type { NotionEleve } from "@/lib/eleveApi";

interface NotionRowProps {
  notion: NotionEleve;
  /** La leçon de cette notion est-elle déjà téléchargée pour le hors-ligne ?
   * (voir lib/offlineStore.ts) — ignoré si la notion n'a pas de leçon publiée. */
  telechargee?: boolean;
}

/** Une notion : cliquable si une leçon est publiée, grisée sinon ("à venir"). */
export default function NotionRow({ notion, telechargee = false }: NotionRowProps) {
  if (notion.a_lecon_publiee && notion.lecon_id) {
    return (
      <Link
        href={`/eleve/lecons/${notion.lecon_id}`}
        className="flex items-center justify-between gap-3 rounded-lg bg-fh-accent/40 px-3 py-2.5 transition-colors hover:bg-fh-accent"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-sm font-medium text-fh-bleu">{notion.titre}</span>
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
