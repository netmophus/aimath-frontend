"use client";

import type { NotionNoeud } from "@/lib/programmeApi";

interface NotionNodeProps {
  notion: NotionNoeud;
  estPremiere: boolean;
  estDerniere: boolean;
  actionEnCours: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMonter: () => void;
  onDescendre: () => void;
}

/** Feuille de l'arbre : une notion précise, avec ses 3 colonnes officielles. */
export default function NotionNode({
  notion,
  estPremiere,
  estDerniere,
  actionEnCours,
  onEdit,
  onDelete,
  onMonter,
  onDescendre,
}: NotionNodeProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-fh-creme px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm text-fh-ardoise">{notion.titre}</span>
        {notion.a_lecon && (
          <span
            className="shrink-0 rounded-full bg-fh-bleu-vif/10 px-2 py-0.5 text-xs font-medium text-fh-bleu-vif"
            title="Une leçon a déjà été rédigée pour cette notion"
          >
            a une leçon
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          disabled={actionEnCours || estPremiere}
          onClick={onMonter}
          aria-label="Monter"
          title="Monter"
          className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={actionEnCours || estDerniere}
          onClick={onDescendre}
          aria-label="Descendre"
          title="Descendre"
          className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ↓
        </button>
        <button
          type="button"
          disabled={actionEnCours}
          onClick={onEdit}
          aria-label="Éditer la notion"
          title="Éditer"
          className="rounded p-1 text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ✎
        </button>
        <button
          type="button"
          disabled={actionEnCours}
          onClick={onDelete}
          aria-label="Supprimer la notion"
          title={notion.a_lecon ? "Contient une leçon : la suppression sera refusée" : "Supprimer"}
          className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
