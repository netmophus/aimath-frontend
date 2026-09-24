/**
 * Fonctions API pour la génération et la vérification IA de sections de
 * leçon (/api/admin/ia/...). Voir le backend (programme/ia_views.py) : ces
 * appels ne modifient JAMAIS la leçon en base, ne renvoient que du contenu —
 * à charge de l'appelant de l'insérer dans l'état d'édition puis de
 * sauvegarder normalement (bouton "Enregistrer" existant).
 *
 * Chaque appel est FACTURÉ côté fournisseur IA : ces fonctions ne sont donc
 * jamais appelées automatiquement, uniquement sur clic explicite (voir
 * BoutonGenererSectionIA / ModaleApercuExercicesIA).
 */

import { apiRequest } from "./api";
import type { Difficulte } from "./leconApi";

/** Sections dont le contenu généré est un texte Markdown+LaTeX brut. */
export type SectionTexteIA =
  | "histoire"
  | "objectifs"
  | "prerequis"
  | "cours"
  | "demonstrations"
  | "a_retenir"
  | "sujet_examen";

/** Toute section générable, texte ou exercices. */
export type SectionIA = SectionTexteIA | "exercices";

/** Sections pour lesquelles le backend propose une vérification IA (avis) —
 * doit rester synchronisé avec programme.ia.prompts.SECTIONS (verifiable=True)
 * côté backend : cours, démonstrations, exercices, sujet_examen (les sections
 * mathématiques). */
export type SectionVerifiableIA = "cours" | "demonstrations" | "exercices" | "sujet_examen";

export function estSectionVerifiable(section: SectionIA): section is SectionVerifiableIA {
  return (
    section === "cours" || section === "demonstrations" || section === "exercices" || section === "sujet_examen"
  );
}

export interface ExerciceGenere {
  enonce: string;
  corrige: string;
  difficulte: Difficulte;
}

/**
 * `tronque` : la génération a été coupée avant la fin par la limite de
 * tokens du serveur (voir programme.ia_views.GenererSectionView côté
 * backend) — `contenu`/`exercices` reste utilisable mais est INCOMPLET.
 * `message` n'est présent que si `tronque` est vrai (texte à afficher tel
 * quel à l'admin, déjà rédigé côté backend).
 */
interface GenerationTexte {
  contenu: string;
  tronque?: boolean;
  message?: string;
}

interface GenerationExercices {
  exercices: ExerciceGenere[];
  tronque?: boolean;
  message?: string;
}

/**
 * Génère UNE section pour la notion donnée. Le type de retour dépend de
 * `section` — deux signatures (plutôt qu'un type conditionnel) pour que
 * chaque site d'appel obtienne directement le bon type sans cast :
 * `genererSection(id, "cours")` → { contenu }, `genererSection(id, "exercices")` → { exercices }.
 */
export function genererSection(notionId: number, section: SectionTexteIA): Promise<GenerationTexte>;
export function genererSection(notionId: number, section: "exercices"): Promise<GenerationExercices>;
export function genererSection(
  notionId: number,
  section: SectionIA
): Promise<GenerationTexte | GenerationExercices> {
  return apiRequest<GenerationTexte | GenerationExercices>("/api/admin/ia/generer/", {
    method: "POST",
    body: { notion_id: notionId, section },
  });
}

export interface VerificationIA {
  avis: string;
}

/**
 * Demande un second regard IA sur un contenu déjà généré (ou déjà rédigé).
 * `contenu` est toujours une chaîne : pour les exercices, sérialise la
 * liste au préalable (voir serialiserExercicesPourVerification ci-dessous).
 * L'avis est FAILLIBLE et indicatif — jamais une validation, voir AvisVerificationIA.
 */
export function verifierContenu(
  section: SectionVerifiableIA,
  contenu: string,
  notionId?: number
): Promise<VerificationIA> {
  return apiRequest<VerificationIA>("/api/admin/ia/verifier/", {
    method: "POST",
    body: { section, contenu, notion_id: notionId },
  });
}

/** Représentation texte lisible d'un lot d'exercices générés, pour le
 * soumettre tel quel à /api/admin/ia/verifier/ (qui attend une chaîne). */
export function serialiserExercicesPourVerification(exercices: ExerciceGenere[]): string {
  return exercices
    .map(
      (exercice, index) =>
        `Exercice ${index + 1} (${exercice.difficulte})\nÉnoncé :\n${exercice.enonce}\n\nCorrigé :\n${exercice.corrige}`
    )
    .join("\n\n---\n\n");
}
