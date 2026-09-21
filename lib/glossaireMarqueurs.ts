/**
 * Motif partagé pour les marqueurs de glossaire [[slug]] / [[slug|texte]] —
 * utilisé à la fois par le rendu Markdown (remarkGlossaire, pour les
 * transformer en éléments cliquables) et par le téléchargement hors-ligne
 * (offlineStore, pour savoir quels termes précharger avec une leçon). Un seul
 * et même motif pour éviter toute divergence entre "ce qui est rendu
 * cliquable" et "ce qui est effectivement téléchargé".
 *
 * Slug en minuscules/chiffres/tirets (mêmes règles que le SlugField Django
 * côté backend).
 */
export const MOTIF_TERME_GLOSSAIRE = /\[\[([a-z0-9][a-z0-9-]*)(?:\|([^\]]+))?\]\]/gi;

/**
 * Renvoie la liste unique (ordre d'apparition, sans doublon) des slugs
 * [[...]] présents dans un ensemble de textes Markdown. Une nouvelle instance
 * de RegExp est créée à chaque texte scanné : un motif global (`g`) garde un
 * état interne (`lastIndex`) qui ne doit jamais être partagé entre deux
 * scans indépendants.
 */
export function extraireSlugsGlossaire(textes: string[]): string[] {
  const slugs = new Set<string>();

  for (const texte of textes) {
    const motif = new RegExp(MOTIF_TERME_GLOSSAIRE.source, MOTIF_TERME_GLOSSAIRE.flags);
    let correspondance: RegExpExecArray | null;
    while ((correspondance = motif.exec(texte)) !== null) {
      slugs.add(correspondance[1].toLowerCase());
    }
  }

  return Array.from(slugs);
}
