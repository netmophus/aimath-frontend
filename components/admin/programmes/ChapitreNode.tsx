"use client";

import type { ChapitreNoeud, NotionNoeud } from "@/lib/programmeApi";
import NotionNode from "@/components/admin/programmes/NotionNode";

interface ChapitreNodeProps {
  chapitre: ChapitreNoeud;
  estPremier: boolean;
  estDernier: boolean;
  actionEnCours: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMonter: () => void;
  onDescendre: () => void;
  onAjouterNotion: () => void;
  onEditNotion: (notion: NotionNoeud) => void;
  onDeleteNotion: (notion: NotionNoeud) => void;
  onMonterNotion: (notion: NotionNoeud) => void;
  onDescendreNotion: (notion: NotionNoeud) => void;
}

/** Niveau 2 de l'arbre : un chapitre, sa liste de notions. */
export default function ChapitreNode({
  chapitre,
  estPremier,
  estDernier,
  actionEnCours,
  onEdit,
  onDelete,
  onMonter,
  onDescendre,
  onAjouterNotion,
  onEditNotion,
  onDeleteNotion,
  onMonterNotion,
  onDescendreNotion,
}: ChapitreNodeProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-3 ring-1 ring-fh-sable">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-fh-bleu">{chapitre.titre}</span>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={actionEnCours || estPremier}
            onClick={onMonter}
            aria-label="Monter le chapitre"
            title="Monter"
            className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={actionEnCours || estDernier}
            onClick={onDescendre}
            aria-label="Descendre le chapitre"
            title="Descendre"
            className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={actionEnCours}
            onClick={onEdit}
            aria-label="Éditer le chapitre"
            title="Éditer"
            className="rounded p-1 text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ✎
          </button>
          <button
            type="button"
            disabled={actionEnCours}
            onClick={onDelete}
            aria-label="Supprimer le chapitre"
            title="Supprimer"
            className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            🗑
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pl-3">
        {chapitre.notions.map((notion, index) => (
          <NotionNode
            key={notion.id}
            notion={notion}
            estPremiere={index === 0}
            estDerniere={index === chapitre.notions.length - 1}
            actionEnCours={actionEnCours}
            onEdit={() => onEditNotion(notion)}
            onDelete={() => onDeleteNotion(notion)}
            onMonter={() => onMonterNotion(notion)}
            onDescendre={() => onDescendreNotion(notion)}
          />
        ))}
        <button
          type="button"
          disabled={actionEnCours}
          onClick={onAjouterNotion}
          className="self-start rounded-lg px-2 py-1 text-xs font-medium text-fh-orange transition-colors hover:bg-fh-accent/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Ajouter une notion
        </button>
      </div>
    </div>
  );
}
