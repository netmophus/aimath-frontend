/**
 * Extraction de l'identifiant YouTube (et d'un éventuel temps de départ) à
 * partir de l'URL saisie par l'admin pour une Video — module ISOMORPHE
 * (aucun accès à window/document), même esprit que lib/horloge.ts : une
 * fonction pure, jamais d'exception, qui renvoie `null` pour toute URL non
 * reconnue plutôt que de planter — c'est à l'appelant (components/eleve/
 * LecteurVideo.tsx) de retomber proprement sur un simple lien cliquable.
 *
 * Formats reconnus :
 *   - https://www.youtube.com/watch?v=ID(&t=…)
 *   - https://youtu.be/ID(?t=…)
 *   - https://www.youtube.com/embed/ID
 *   - https://www.youtube.com/shorts/ID
 *   - variantes m.youtube.com / youtube-nocookie.com, avec ou sans "www."
 */

export interface VideoYouTube {
  id: string;
  /** Temps de départ en secondes, si présent dans l'URL (paramètre `t=` ou
   * `start=`) — absent si l'URL n'en a pas (le lecteur démarre à 0). */
  debutSecondes?: number;
}

/** Un identifiant vidéo YouTube fait toujours exactement 11 caractères
 * (lettres, chiffres, "-", "_") — filtre simple mais efficace contre un
 * segment de chemin qui ressemblerait à un id sans en être un. */
const MOTIF_ID = /^[\w-]{11}$/;

const MOTIF_DUREE_COMPOSEE = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i;

/** "90" (secondes brutes) ou "1h2m3s" (notation composée, acceptée elle
 * aussi par le paramètre t= de YouTube) -> nombre de secondes. */
function parserDureeYouTube(brut: string): number | undefined {
  if (/^\d+$/.test(brut)) return Number(brut);

  const correspondance = brut.match(MOTIF_DUREE_COMPOSEE);
  if (!correspondance || (!correspondance[1] && !correspondance[2] && !correspondance[3])) {
    return undefined;
  }
  const [, h, m, s] = correspondance;
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0);
}

export function extraireVideoYouTube(url: string): VideoYouTube | null {
  let cible: URL;
  try {
    cible = new URL(url);
  } catch {
    return null;
  }

  const hote = cible.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;

  if (hote === "youtu.be") {
    id = cible.pathname.slice(1).split("/")[0] || null;
  } else if (hote === "youtube.com" || hote === "youtube-nocookie.com") {
    if (cible.pathname === "/watch") {
      id = cible.searchParams.get("v");
    } else if (cible.pathname.startsWith("/embed/")) {
      id = cible.pathname.slice("/embed/".length).split("/")[0] || null;
    } else if (cible.pathname.startsWith("/shorts/")) {
      id = cible.pathname.slice("/shorts/".length).split("/")[0] || null;
    }
  } else {
    return null;
  }

  if (!id || !MOTIF_ID.test(id)) return null;

  const brutTemps = cible.searchParams.get("t") ?? cible.searchParams.get("start");
  const debutSecondes = brutTemps ? parserDureeYouTube(brutTemps) : undefined;

  return debutSecondes !== undefined ? { id, debutSecondes } : { id };
}
