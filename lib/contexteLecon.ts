import type { NotionContexteEleve } from "./eleveApi";

/**
 * "Mathématiques — Terminale C" → "Mathématiques" (l'API n'expose pas le nom
 * de la matière séparément dans le contexte d'une leçon, seulement ce libellé
 * combiné — voir construire_libelle côté backend). Partagé entre la page de
 * lecture et le stockage hors-ligne (offlineStore), qui en a besoin pour
 * afficher le contexte d'une leçon téléchargée sans connexion.
 */
export function extraireMatiere(libelle: string): string {
  return libelle.split("—")[0]?.trim() || libelle;
}

export interface ContexteLecon {
  matiere: string;
  theme: string;
  chapitre: string;
}

export function construireContexteLecon(notion: NotionContexteEleve): ContexteLecon {
  return {
    matiere: extraireMatiere(notion.programme.libelle),
    theme: notion.theme.titre,
    chapitre: notion.chapitre.titre,
  };
}
