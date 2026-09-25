import type { LotCartes } from "@/lib/carteApi";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

interface LotRowProps {
  lot: LotCartes;
  onVoir: (lot: string) => void;
  onExporter: (lot: string) => void;
  exportEnCours: boolean;
}

export default function LotRow({ lot, onVoir, onExporter, exportEnCours }: LotRowProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-fh-bleu">{lot.lot}</p>
        <p className="text-sm text-fh-ardoise">
          {lot.total} carte{lot.total > 1 ? "s" : ""} · {lot.duree_jours} jours · créé le{" "}
          {formatDate(lot.date_creation)}
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-fh-accent px-2.5 py-0.5 text-xs font-medium text-fh-orange-fonce">
            {lot.actives} active{lot.actives > 1 ? "s" : ""}
          </span>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            {lot.utilisees} utilisée{lot.utilisees > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onVoir(lot.lot)}
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60"
        >
          Voir le détail
        </button>
        <button
          type="button"
          disabled={exportEnCours}
          onClick={() => onExporter(lot.lot)}
          className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exportEnCours ? "Export…" : "Exporter CSV"}
        </button>
      </div>
    </div>
  );
}
