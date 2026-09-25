"use client";

import { useRouter } from "next/navigation";

import type { LeconListe } from "@/lib/leconApi";
import type { NotionArbre } from "@/lib/arbreLecons";
import StatutBadge from "@/components/admin/StatutBadge";
import { ACCES_LECON_LABELS, ACCES_LECON_STYLES, LECON_STATUT_LABELS, LECON_STATUT_STYLES, accesLecon } from "./leconStatutStyles";

interface NotionLigneProps {
  notion: NotionArbre;
  /** "" = pas de recherche active, aucun surlignage. */
  termeRecherche: string;
  enCours: boolean;
  onPublier: (id: number) => void;
  onDepublier: (id: number) => void;
  onSupprimer: (lecon: LeconListe) => void;
  onCreerPourNotion: () => void;
  onBasculerAcces: (id: number, estGratuit: boolean) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Découpe `texte` autour des occurrences (insensibles à la casse) de
 * `terme`, pour un surlignage — comparaison littérale (indexOf), jamais de
 * RegExp construite depuis une saisie utilisateur non échappée. */
function segmenterSurlignage(texte: string, terme: string): { morceau: string; surligne: boolean }[] {
  if (!terme) return [{ morceau: texte, surligne: false }];
  const texteMin = texte.toLowerCase();
  const termeMin = terme.toLowerCase();
  const segments: { morceau: string; surligne: boolean }[] = [];
  let i = 0;
  while (i < texte.length) {
    const pos = texteMin.indexOf(termeMin, i);
    if (pos === -1) {
      segments.push({ morceau: texte.slice(i), surligne: false });
      break;
    }
    if (pos > i) segments.push({ morceau: texte.slice(i, pos), surligne: false });
    segments.push({ morceau: texte.slice(pos, pos + terme.length), surligne: true });
    i = pos + terme.length;
  }
  return segments;
}

function TexteSurligne({ texte, terme }: { texte: string; terme: string }) {
  const segments = segmenterSurlignage(texte, terme);
  if (segments.length === 1 && !segments[0].surligne) return <>{texte}</>;
  return (
    <>
      {segments.map((s, i) =>
        s.surligne ? (
          <mark key={i} className="rounded bg-fh-orange/30 text-inherit">
            {s.morceau}
          </mark>
        ) : (
          <span key={i}>{s.morceau}</span>
        )
      )}
    </>
  );
}

/**
 * Feuille de l'arbre des leçons : soit la leçon existante de cette notion
 * (titre, badge, compteurs, date, actions — la même chose qu'avant dans
 * l'ancienne liste plate, mais plus compacte pour s'imbriquer proprement à
 * 5 niveaux de profondeur), soit un état "vide" avec un bouton pour créer
 * la leçon manquante.
 */
export default function NotionLigne({
  notion,
  termeRecherche,
  enCours,
  onPublier,
  onDepublier,
  onSupprimer,
  onCreerPourNotion,
  onBasculerAcces,
}: NotionLigneProps) {
  const router = useRouter();
  const lecon = notion.lecon;

  if (!lecon) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-fh-sable/30 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-sm text-fh-ardoise/60">
            <TexteSurligne texte={notion.titre} terme={termeRecherche} />
          </span>
          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-medium text-fh-ardoise/50">
            Aucune leçon
          </span>
        </div>
        <button
          type="button"
          onClick={onCreerPourNotion}
          className="shrink-0 rounded-full border border-fh-orange/40 px-3 py-1.5 text-xs font-medium text-fh-orange-fonce transition-colors hover:bg-fh-accent/40"
        >
          + Créer la leçon
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/admin/lecons/${lecon.id}`)}
      onKeyDown={(event) => {
        if (event.key === "Enter") router.push(`/admin/lecons/${lecon.id}`);
      }}
      className="flex cursor-pointer flex-col gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-fh-sable/60 transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="min-w-0 truncate text-sm font-semibold text-fh-bleu">
            <TexteSurligne texte={lecon.titre} terme={termeRecherche} />
          </p>
          <StatutBadge statut={lecon.statut} styles={LECON_STATUT_STYLES} labels={LECON_STATUT_LABELS} />
          <StatutBadge statut={accesLecon(lecon.est_gratuit)} styles={ACCES_LECON_STYLES} labels={ACCES_LECON_LABELS} />
        </div>
        <p className="text-xs text-fh-ardoise/70">
          {lecon.nb_exercices} exercice(s) · {lecon.nb_videos} vidéo(s) · modifié le {formatDate(lecon.modifie_le)}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-1.5">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/admin/lecons/${lecon.id}`);
          }}
          className="rounded-full border border-fh-bleu/20 px-3 py-1.5 text-xs font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          Modifier
        </button>

        <button
          type="button"
          disabled={enCours}
          onClick={(event) => {
            event.stopPropagation();
            onBasculerAcces(lecon.id, !lecon.est_gratuit);
          }}
          className="rounded-full border border-fh-orange/40 px-3 py-1.5 text-xs font-medium text-fh-orange-fonce transition-colors hover:bg-fh-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {lecon.est_gratuit ? "Rendre premium" : "Rendre gratuit"}
        </button>

        {lecon.statut === "publie" ? (
          <button
            type="button"
            disabled={enCours}
            onClick={(event) => {
              event.stopPropagation();
              onDepublier(lecon.id);
            }}
            className="rounded-full border border-fh-bleu/20 px-3 py-1.5 text-xs font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-60"
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
            className="rounded-full border border-green-600 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
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
          className="rounded-full border border-red-600 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
