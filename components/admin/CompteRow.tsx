import type { Statut } from "@/lib/api";
import type { Compte } from "@/lib/adminApi";
import RoleBadge from "./RoleBadge";
import StatutBadge from "./StatutBadge";

const STYLES_STATUT: Record<Statut, string> = {
  en_attente: "bg-fh-accent text-fh-orange-fonce",
  actif: "bg-green-100 text-green-700",
  rejete: "bg-red-100 text-red-700",
  suspendu: "bg-fh-sable text-fh-ardoise",
};

const LABELS_STATUT: Record<Statut, string> = {
  en_attente: "En attente",
  actif: "Actif",
  rejete: "Rejeté",
  suspendu: "Suspendu",
};

interface CompteRowProps {
  compte: Compte;
  /** true si une action est en cours pour CE compte (désactive ses boutons). */
  enCours: boolean;
  /** Chaque action est optionnelle : un bouton ne s'affiche que si son handler est fourni ET le statut s'y prête. */
  onApprouver?: (id: number) => void;
  onDemanderRejet?: (compte: Compte) => void;
  onSuspendre?: (id: number) => void;
  onReactiver?: (id: number) => void;
  onModifier?: (compte: Compte) => void;
}

function formatClasse(compte: Compte): string | null {
  if (!compte.niveau) return null;
  return compte.serie ? `${compte.niveau.nom} ${compte.serie.nom}` : compte.niveau.nom;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CompteRow({
  compte,
  enCours,
  onApprouver,
  onDemanderRejet,
  onSuspendre,
  onReactiver,
  onModifier,
}: CompteRowProps) {
  const classe = formatClasse(compte);

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-fh-bleu">
            {compte.prenom} {compte.nom}
          </p>
          <RoleBadge role={compte.role} />
          <StatutBadge statut={compte.statut} styles={STYLES_STATUT} labels={LABELS_STATUT} />
        </div>
        <p className="text-sm text-fh-ardoise">
          {compte.telephone}
          {classe && ` · ${classe}`}
        </p>
        <p className="text-xs text-fh-ardoise/70">Inscrit le {formatDate(compte.date_inscription)}</p>
        {compte.statut === "rejete" && compte.motif_rejet && (
          <p className="text-xs italic text-fh-ardoise/70">Motif : {compte.motif_rejet}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {compte.statut === "en_attente" && onApprouver && (
          <button
            type="button"
            disabled={enCours}
            onClick={() => onApprouver(compte.id)}
            className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Approuver
          </button>
        )}
        {compte.statut === "en_attente" && onDemanderRejet && (
          <button
            type="button"
            disabled={enCours}
            onClick={() => onDemanderRejet(compte)}
            className="rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Rejeter
          </button>
        )}

        {compte.statut === "actif" && onSuspendre && (
          <button
            type="button"
            disabled={enCours}
            onClick={() => onSuspendre(compte.id)}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Suspendre
          </button>
        )}

        {(compte.statut === "suspendu" || compte.statut === "rejete") && onReactiver && (
          <button
            type="button"
            disabled={enCours}
            onClick={() => onReactiver(compte.id)}
            className="rounded-full border border-green-600 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Réactiver
          </button>
        )}

        {(compte.statut === "actif" || compte.statut === "suspendu") && onModifier && (
          <button
            type="button"
            disabled={enCours}
            onClick={() => onModifier(compte)}
            className="rounded-full border border-fh-bleu/20 px-4 py-2 text-sm font-medium text-fh-bleu transition-colors hover:bg-fh-sable/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Modifier
          </button>
        )}
      </div>
    </div>
  );
}
