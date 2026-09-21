"use client";

import { useRouter } from "next/navigation";

import type { LeconListe } from "@/lib/leconApi";
import StatutBadge from "@/components/admin/StatutBadge";
import { LECON_STATUT_LABELS, LECON_STATUT_STYLES } from "./leconStatutStyles";

interface LeconRowProps {
  lecon: LeconListe;
  enCours: boolean;
  onPublier: (id: number) => void;
  onDepublier: (id: number) => void;
  onSupprimer: (lecon: LeconListe) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Une ligne de la liste des leçons : cliquable (→ éditeur), actions rapides à droite. */
export default function LeconRow({ lecon, enCours, onPublier, onDepublier, onSupprimer }: LeconRowProps) {
  const router = useRouter();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/admin/lecons/${lecon.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter") router.push(`/admin/lecons/${lecon.id}`);
      }}
      className="flex cursor-pointer flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-fh-bleu">{lecon.titre}</p>
          <StatutBadge statut={lecon.statut} styles={LECON_STATUT_STYLES} labels={LECON_STATUT_LABELS} />
        </div>
        <p className="truncate text-sm text-fh-ardoise">{lecon.chemin}</p>
        <p className="text-xs text-fh-ardoise/70">
          {lecon.nb_exercices} exercice(s) · {lecon.nb_videos} vidéo(s) · modifié le {formatDate(lecon.modifie_le)}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/admin/lecons/${lecon.id}`);
          }}
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          Modifier
        </button>

        {lecon.statut === "publie" ? (
          <button
            type="button"
            disabled={enCours}
            onClick={(event) => {
              event.stopPropagation();
              onDepublier(lecon.id);
            }}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Dépublier
          </button>
        ) : (
          <button
            type="button"
            disabled={enCours}
            onClick={(event) => {
              event.stopPropagation();
              onPublier(lecon.id);
            }}
            className="rounded-full border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Publier
          </button>
        )}

        <button
          type="button"
          disabled={enCours}
          onClick={(event) => {
            event.stopPropagation();
            onSupprimer(lecon);
          }}
          className="rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
