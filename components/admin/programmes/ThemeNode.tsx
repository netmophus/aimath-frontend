"use client";

import type { ChapitreNoeud, NotionNoeud, ThemeNoeud } from "@/lib/programmeApi";
import ChapitreNode from "@/components/admin/programmes/ChapitreNode";

interface ThemeNodeProps {
  theme: ThemeNoeud;
  estPremier: boolean;
  estDernier: boolean;
  expanded: boolean;
  actionEnCours: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMonter: () => void;
  onDescendre: () => void;
  onAjouterChapitre: () => void;
  onEditChapitre: (chapitre: ChapitreNoeud) => void;
  onDeleteChapitre: (chapitre: ChapitreNoeud) => void;
  onMonterChapitre: (chapitre: ChapitreNoeud) => void;
  onDescendreChapitre: (chapitre: ChapitreNoeud) => void;
  onAjouterNotion: (chapitre: ChapitreNoeud) => void;
  onEditNotion: (notion: NotionNoeud) => void;
  onDeleteNotion: (notion: NotionNoeud) => void;
  onMonterNotion: (notion: NotionNoeud) => void;
  onDescendreNotion: (notion: NotionNoeud) => void;
}

/** Niveau 1 de l'arbre : un thème, repliable, avec ses chapitres. */
export default function ThemeNode({
  theme,
  estPremier,
  estDernier,
  expanded,
  actionEnCours,
  onToggleExpand,
  onEdit,
  onDelete,
  onMonter,
  onDescendre,
  onAjouterChapitre,
  onEditChapitre,
  onDeleteChapitre,
  onMonterChapitre,
  onDescendreChapitre,
  onAjouterNotion,
  onEditNotion,
  onDeleteNotion,
  onMonterNotion,
  onDescendreNotion,
}: ThemeNodeProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-fh-accent/20 p-4 ring-1 ring-fh-sable">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="shrink-0 text-fh-bleu" aria-hidden="true">
            {expanded ? "▾" : "▸"}
          </span>
          <span className="truncate font-bold text-fh-bleu">{theme.titre}</span>
          {theme.volume_horaire != null && (
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-fh-bleu">
              {theme.volume_horaire}h
            </span>
          )}
          <span className="shrink-0 text-xs text-fh-ardoise">
            {theme.chapitres.length} chapitre(s)
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled={actionEnCours || estPremier}
            onClick={onMonter}
            aria-label="Monter le thème"
            title="Monter"
            className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={actionEnCours || estDernier}
            onClick={onDescendre}
            aria-label="Descendre le thème"
            title="Descendre"
            className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ↓
          </button>
          <button
            type="button"
            disabled={actionEnCours}
            onClick={onEdit}
            aria-label="Éditer le thème"
            title="Éditer"
            className="rounded p-1 text-fh-bleu transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            ✎
          </button>
          <button
            type="button"
            disabled={actionEnCours}
            onClick={onDelete}
            aria-label="Supprimer le thème"
            title="Supprimer"
            className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
          >
            🗑
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-2 pl-3">
          {theme.chapitres.map((chapitre, index) => (
            <ChapitreNode
              key={chapitre.id}
              chapitre={chapitre}
              estPremier={index === 0}
              estDernier={index === theme.chapitres.length - 1}
              actionEnCours={actionEnCours}
              onEdit={() => onEditChapitre(chapitre)}
              onDelete={() => onDeleteChapitre(chapitre)}
              onMonter={() => onMonterChapitre(chapitre)}
              onDescendre={() => onDescendreChapitre(chapitre)}
              onAjouterNotion={() => onAjouterNotion(chapitre)}
              onEditNotion={onEditNotion}
              onDeleteNotion={onDeleteNotion}
              onMonterNotion={onMonterNotion}
              onDescendreNotion={onDescendreNotion}
            />
          ))}
          <button
            type="button"
            disabled={actionEnCours}
            onClick={onAjouterChapitre}
            className="self-start rounded-lg px-2 py-1 text-xs font-medium text-fh-orange transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Ajouter un chapitre
          </button>
        </div>
      )}
    </div>
  );
}
