"use client";

import { nouvelleClef } from "./clefsLocales";

export interface VideoDraft {
  clef: string;
  id?: number;
  titre: string;
  url: string;
  description: string;
}

export function nouvelleVideoVide(): VideoDraft {
  return { clef: nouvelleClef(), titre: "", url: "", description: "" };
}

interface EditeurVideosProps {
  videos: VideoDraft[];
  onChange: (videos: VideoDraft[]) => void;
}

const CLASSE_CHAMP =
  "w-full rounded-lg border border-fh-bleu-vif/20 bg-white px-3 py-2 text-sm text-fh-bleu outline-none focus:border-fh-orange";

export default function EditeurVideos({ videos, onChange }: EditeurVideosProps) {
  function modifier(index: number, patch: Partial<VideoDraft>) {
    onChange(videos.map((video, i) => (i === index ? { ...video, ...patch } : video)));
  }

  function deplacer(index: number, decalage: number) {
    const cible = index + decalage;
    if (cible < 0 || cible >= videos.length) return;
    const copie = [...videos];
    [copie[index], copie[cible]] = [copie[cible], copie[index]];
    onChange(copie);
  }

  function supprimer(index: number) {
    onChange(videos.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.length === 0 && <p className="text-sm text-fh-ardoise/70">Aucune vidéo pour l&apos;instant.</p>}

      {videos.map((video, index) => (
        <div key={video.clef} className="flex flex-col gap-2 rounded-xl bg-fh-creme p-4 ring-1 ring-fh-sable">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-fh-bleu">Vidéo {index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => deplacer(index, -1)}
                aria-label="Monter la vidéo"
                title="Monter"
                className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === videos.length - 1}
                onClick={() => deplacer(index, 1)}
                aria-label="Descendre la vidéo"
                title="Descendre"
                className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => supprimer(index)}
                aria-label="Supprimer la vidéo"
                title="Supprimer"
                className="rounded p-1 text-fh-ardoise/60 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                🗑
              </button>
            </div>
          </div>

          <input
            type="text"
            required
            placeholder="Titre"
            value={video.titre}
            onChange={(event) => modifier(index, { titre: event.target.value })}
            className={CLASSE_CHAMP}
          />
          <input
            type="url"
            required
            placeholder="URL (obligatoire) — https://…"
            value={video.url}
            onChange={(event) => modifier(index, { url: event.target.value })}
            className={CLASSE_CHAMP}
          />
          <textarea
            placeholder="Description (facultative)"
            rows={2}
            value={video.description}
            onChange={(event) => modifier(index, { description: event.target.value })}
            className={CLASSE_CHAMP}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => onChange([...videos, nouvelleVideoVide()])}
        className="self-start rounded-lg px-3 py-2 text-sm font-medium text-fh-orange transition-colors hover:bg-fh-accent/40"
      >
        + Ajouter une vidéo
      </button>
    </div>
  );
}
