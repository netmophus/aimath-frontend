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

import { ApiError, apiRequest, apiRequestFlux } from "./api";
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
 * Sections dont la génération est lue en flux SSE (contre le H12 Heroku : le
 * routeur coupe toute requête sans réponse après 30 s). Un appel JSON d'un
 * bloc dépasse vite ce délai (25 à 80 s observées en prod pour le cours, le
 * sujet type examen, les exercices...) : TOUTES les sections passent donc en
 * flux. Le résultat final (`contenu` / `exercices`) a la même forme qu'en bloc.
 */
const SECTIONS_EN_FLUX: ReadonlySet<SectionIA> = new Set<SectionIA>([
  "histoire",
  "objectifs",
  "prerequis",
  "cours",
  "demonstrations",
  "a_retenir",
  "sujet_examen",
  "exercices",
]);

/** Cette section est-elle lue en flux (aperçu progressif possible via `surTexte`) ? */
export function estSectionEnFlux(section: SectionIA): boolean {
  return SECTIONS_EN_FLUX.has(section);
}

/** Options facultatives : `surTexte` reçoit le texte cumulé au fil du flux (sections en flux seulement) ; `signal` permet d'annuler. */
export interface OptionsGeneration {
  surTexte?: (texteCumule: string) => void;
  signal?: AbortSignal;
}

async function genererEnFlux<T extends GenerationTexte | GenerationExercices>(
  notionId: number,
  section: SectionIA,
  options: OptionsGeneration
): Promise<T> {
  let cumule = "";
  let resultat: T | null = null;
  await apiRequestFlux(
    "/api/admin/ia/generer/",
    { notion_id: notionId, section, stream: true },
    (evenement) => {
      const e = evenement as { type?: string; texte?: string; detail?: string; status?: number };
      if (e.type === "delta" && typeof e.texte === "string") {
        cumule += e.texte;
        options.surTexte?.(cumule);
      } else if (e.type === "fin") {
        const { type: _type, ...corps } = e as Record<string, unknown>;
        void _type;
        resultat = corps as unknown as T;
      } else if (e.type === "erreur") {
        throw new ApiError(e.status ?? 502, e.detail ?? "La génération a échoué.", e);
      }
    },
    options.signal
  );
  if (resultat === null) {
    throw new ApiError(502, "La génération a été interrompue avant la fin. Réessaie.", null);
  }
  return resultat;
}

/**
 * Génère UNE section pour la notion donnée. Le type de retour dépend de
 * `section` — deux signatures (plutôt qu'un type conditionnel) pour que
 * chaque site d'appel obtienne directement le bon type sans cast :
 * `genererSection(id, "cours")` → { contenu }, `genererSection(id, "exercices")` → { exercices }.
 * Le résultat final a la même forme qu'on lise en flux ou d'un bloc.
 */
export function genererSection(notionId: number, section: SectionTexteIA, options?: OptionsGeneration): Promise<GenerationTexte>;
export function genererSection(notionId: number, section: "exercices", options?: OptionsGeneration): Promise<GenerationExercices>;
export function genererSection(
  notionId: number,
  section: SectionIA,
  options: OptionsGeneration = {}
): Promise<GenerationTexte | GenerationExercices> {
  if (SECTIONS_EN_FLUX.has(section)) {
    return genererEnFlux<GenerationTexte | GenerationExercices>(notionId, section, options);
  }
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
export async function verifierContenu(
  section: SectionVerifiableIA,
  contenu: string,
  notionId?: number,
  options: OptionsGeneration = {}
): Promise<VerificationIA> {
  // Lu en flux SSE (contre le H12 Heroku : un long contenu dépasse 30 s d'un bloc). Pas d'aperçu progressif
  // par défaut : l'indicateur de chargement des modales reste affiché ; `surTexte` permet d'en brancher un.
  let cumule = "";
  let avis: string | null = null;
  await apiRequestFlux(
    "/api/admin/ia/verifier/",
    { section, contenu, notion_id: notionId, stream: true },
    (evenement) => {
      const e = evenement as { type?: string; texte?: string; avis?: string; detail?: string; status?: number };
      if (e.type === "delta" && typeof e.texte === "string") {
        cumule += e.texte;
        options.surTexte?.(cumule);
      } else if (e.type === "fin" && typeof e.avis === "string") {
        avis = e.avis;
      } else if (e.type === "erreur") {
        throw new ApiError(e.status ?? 502, e.detail ?? "La vérification a échoué.", e);
      }
    },
    options.signal
  );
  if (avis === null) {
    throw new ApiError(502, "La vérification a été interrompue avant la fin. Réessaie.", null);
  }
  return { avis };
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
