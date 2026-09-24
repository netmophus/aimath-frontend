import type { SectionIA } from "@/lib/iaApi";

/** Libellés humains pour chaque section générable par IA — utilisés dans les
 * boutons "Générer"/"Régénérer" et les titres des modales d'aperçu. */
export const LIBELLES_SECTION_IA: Record<SectionIA, string> = {
  histoire: "Pourquoi cette notion ?",
  objectifs: "Objectifs pédagogiques",
  prerequis: "Prérequis",
  cours: "Cours",
  demonstrations: "Démonstrations",
  a_retenir: "À retenir",
  exercices: "Exercices",
  sujet_examen: "Sujet type examen",
};

/** Mention affichée dans chaque modale d'aperçu IA — rappelle qu'il s'agit
 * d'un premier jet à relire, jamais d'un contenu prêt à publier tel quel. */
export const MENTION_CONTENU_IA =
  "Contenu généré par IA : à relire et corriger avant d'insérer, comme un premier jet.";
