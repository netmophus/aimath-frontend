"use client";

import { nouvelleClef } from "./clefsLocales";

export interface RessourceDraft {
  clef: string;
  id?: number;
  titre: string;
  url: string;
}

export function nouvelleRessourceVide(): RessourceDraft {
  return { clef: nouvelleClef(), titre: "", url: "" };
}

interface EditeurRessourcesProps {
  ressources: RessourceDraft[];
  onChange: (ressources: RessourceDraft[]) => void;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange";

/** Ressources en mode "url" uniquement — l'upload de fichier viendra plus tard. */
export default function EditeurRessources({ ressources, onChange }: EditeurRessourcesProps) {
  function modifier(index: number, patch: Partial<RessourceDraft>) {
    onChange(ressources.map((ressource, i) => (i === index ? { ...ressource, ...patch } : ressource)));
  }

  function deplacer(index: number, decalage: number) {
    const cible = index + decalage;
    if (cible < 0 || cible >= ressources.length) return;
    const copie = [...ressources];
    [copie[index], copie[cible]] = [copie[cible], copie[index]];
    onChange(copie);
  }

  function supprimer(index: number) {
    onChange(ressources.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {ressources.length === 0 && <p className="text-sm text-fh-ardoise/70">Aucune ressource pour l&apos;instant.</p>}

      {ressources.map((ressource, index) => (
        <div key={ressource.clef} className="flex flex-col gap-2 rounded-xl bg-fh-creme p-4 ring-1 ring-fh-sable sm:flex-row sm:items-center">
          <input
            type="text"
            required
            placeholder="Titre"
            value={ressource.titre}
            onChange={(event) => modifier(index, { titre: event.target.value })}
            className={`${CLASSE_CHAMP} sm:w-1/3`}
          />
          <input
            type="url"
            required
            placeholder="URL (obligatoire) — https://…"
            value={ressource.url}
            onChange={(event) => modifier(index, { url: event.target.value })}
            className={`${CLASSE_CHAMP} sm:flex-1`}
          />
          <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => deplacer(index, -1)}
              aria-label="Monter la ressource"
              title="Monter"
              className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              disabled={index === ressources.length - 1}
              onClick={() => deplacer(index, 1)}
              aria-label="Descendre la ressource"
              title="Descendre"
              className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => supprimer(index)}
              aria-label="Supprimer la ressource"
              title="Supprimer"
              className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              🗑
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...ressources, nouvelleRessourceVide()])}
        className="self-start rounded-lg px-3 py-2 text-sm font-medium text-fh-orange transition-colors hover:bg-fh-accent/40"
      >
        + Ajouter une ressource
      </button>
    </div>
  );
}
