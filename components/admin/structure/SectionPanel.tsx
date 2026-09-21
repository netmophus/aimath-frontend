import type { ReactNode } from "react";

interface SectionPanelProps {
  titre: string;
  /** Absent = pas de bouton d'ajout affiché (ex. tant qu'aucun parent n'est sélectionné). */
  onAjouter?: () => void;
  chargement: boolean;
  erreur: string | null;
  vide: boolean;
  messageVide: string;
  children: ReactNode;
}

/** Panneau générique : titre + bouton d'ajout + gestion chargement/erreur/vide. */
export default function SectionPanel({
  titre,
  onAjouter,
  chargement,
  erreur,
  vide,
  messageVide,
  children,
}: SectionPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-fh-sable">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-fh-bleu">{titre}</h3>
        {onAjouter && (
          <button
            type="button"
            onClick={onAjouter}
            className="rounded-full bg-fh-orange px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-fh-orange-fonce"
          >
            + Ajouter
          </button>
        )}
      </div>

      {chargement ? (
        <div className="flex flex-col gap-2">
          {[0, 1].map((cle) => (
            <div key={cle} className="h-14 animate-pulse rounded-xl bg-fh-sable/50" />
          ))}
        </div>
      ) : erreur ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
      ) : vide ? (
        <p className="rounded-lg bg-fh-creme px-3 py-6 text-center text-sm text-fh-ardoise">
          {messageVide}
        </p>
      ) : (
        children
      )}
    </div>
  );
}
