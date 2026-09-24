"use client";

import { extraireVideoYouTube } from "@/lib/youtube";
import { useEnLigne } from "@/lib/useEnLigne";
import type { VideoEleve } from "@/lib/eleveApi";

interface LecteurVideoProps {
  video: VideoEleve;
}

/**
 * Carte vidéo de la section "Vidéos" — remplace l'ancien simple lien.
 * Trois rendus possibles, jamais de plantage :
 *   1. hors-ligne (useEnLigne, voir BoutonTelecharger.tsx pour le même
 *      hook) : un iframe ne chargerait de toute façon rien sans réseau —
 *      plutôt qu'un cadre noir cassé, une carte "disponible en ligne" avec
 *      le lien, quelle que soit l'URL ;
 *   2. en ligne + URL YouTube reconnue (lib/youtube.ts) : lecteur intégré
 *      youtube-nocookie, 16:9 responsive, `loading="lazy"` ;
 *   3. en ligne + URL non reconnue comme YouTube : comportement d'avant,
 *      un simple lien cliquable — jamais d'iframe vide.
 */
export default function LecteurVideo({ video }: LecteurVideoProps) {
  const enLigne = useEnLigne();
  const youtube = enLigne ? extraireVideoYouTube(video.url) : null;

  return (
    <li className="rounded-xl bg-white p-3 ring-1 ring-fh-sable">
      {youtube ? (
        <p className="text-sm font-semibold text-fh-bleu">🎬 {video.titre}</p>
      ) : (
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-fh-bleu hover:underline"
        >
          🎬 {video.titre}
        </a>
      )}

      {youtube && (
        <div className="relative mt-2 w-full overflow-hidden rounded-lg bg-fh-ardoise/10" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtube.id}${
              youtube.debutSecondes ? `?start=${youtube.debutSecondes}` : ""
            }`}
            title={video.titre}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      )}

      {!enLigne && (
        <div className="mt-2 flex flex-col gap-1 rounded-lg bg-fh-creme px-3 py-2 text-xs">
          <span className="w-fit rounded-full bg-fh-sable px-2 py-0.5 font-medium text-fh-ardoise/70">
            Vidéo disponible en ligne
          </span>
          <a href={video.url} target="_blank" rel="noopener noreferrer" className="break-all text-fh-bleu underline">
            {video.url}
          </a>
        </div>
      )}

      {video.description && <p className="mt-2 text-xs text-fh-ardoise">{video.description}</p>}
    </li>
  );
}
