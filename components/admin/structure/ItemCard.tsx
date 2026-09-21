interface ItemCardProps {
  titre: string;
  sousTitre?: string;
  /** Ex. ["2 série(s)", "1 programme(s)", "3 élève(s)"] — déjà formatés. */
  compteurs?: readonly string[];
  /** false = bouton supprimer désactivé (dépendances détectées côté client). */
  peutSupprimer: boolean;
  onEdit: () => void;
  onDelete: () => void;
  /** Présents seulement pour les niveaux de la hiérarchie qui se sélectionnent (cycle, niveau). */
  selectionne?: boolean;
  onClick?: () => void;
}

export default function ItemCard({
  titre,
  sousTitre,
  compteurs = [],
  peutSupprimer,
  onEdit,
  onDelete,
  selectionne,
  onClick,
}: ItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
        selectionne ? "border-fh-orange bg-fh-accent/40" : "border-fh-sable bg-white"
      } ${onClick ? "cursor-pointer hover:border-fh-orange/50" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-fh-bleu">{titre}</p>
        {sousTitre && <p className="text-xs text-fh-ardoise">{sousTitre}</p>}
        {compteurs.length > 0 && (
          <p className="mt-1 text-xs text-fh-ardoise/70">{compteurs.join(" · ")}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          aria-label="Modifier"
          title="Modifier"
          className="flex h-8 w-8 items-center justify-center rounded-full text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          ✎
        </button>
        <button
          type="button"
          disabled={!peutSupprimer}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          aria-label="Supprimer"
          title={peutSupprimer ? "Supprimer" : "Des données dépendent de cet élément"}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            peutSupprimer
              ? "text-red-600 hover:bg-red-50"
              : "cursor-not-allowed text-fh-ardoise/30"
          }`}
        >
          {peutSupprimer ? "🗑" : "🔒"}
        </button>
      </div>
    </div>
  );
}
