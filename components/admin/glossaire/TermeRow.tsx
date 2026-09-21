import type { TermeGlossaire } from "@/lib/glossaireApi";
import StatutBadge from "@/components/admin/StatutBadge";
import { LECON_STATUT_LABELS, LECON_STATUT_STYLES } from "@/components/admin/lecons/leconStatutStyles";

interface TermeRowProps {
  terme: TermeGlossaire;
  onModifier: (terme: TermeGlossaire) => void;
  onSupprimer: (terme: TermeGlossaire) => void;
}

/** Extrait texte brut (pas de rendu Markdown/LaTeX ici, un aperçu suffit). */
function extrait(texte: string, longueur = 120): string {
  const aPlat = texte.trim().replace(/\s+/g, " ");
  return aPlat.length > longueur ? `${aPlat.slice(0, longueur)}…` : aPlat;
}

/** Une ligne de la liste du glossaire — cliquable (→ modale d'édition), actions à droite. */
export default function TermeRow({ terme, onModifier, onSupprimer }: TermeRowProps) {
  const lecon = terme.lecon_liee;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onModifier(terme)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onModifier(terme);
      }}
      className="flex cursor-pointer flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-fh-bleu">{terme.terme}</p>
          <code className="rounded bg-fh-creme px-1.5 py-0.5 text-xs text-fh-ardoise/70">{terme.slug}</code>
        </div>
        <p className="truncate text-sm text-fh-ardoise">{extrait(terme.definition)}</p>
        {lecon ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-fh-ardoise/80">
              → Leçon : <span className="font-medium text-fh-bleu">{lecon.titre}</span>
            </span>
            {lecon.statut !== "publie" && (
              <StatutBadge statut={lecon.statut} styles={LECON_STATUT_STYLES} labels={LECON_STATUT_LABELS} />
            )}
          </div>
        ) : (
          <p className="text-xs text-fh-ardoise/50">Aucune leçon liée</p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onModifier(terme);
          }}
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          Modifier
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSupprimer(terme);
          }}
          className="rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
