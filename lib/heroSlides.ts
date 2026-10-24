/**
 * Textes du bandeau d'accueil (components/accueil/HeroAccueil.tsx) et des avantages de FAHIMTA
 * (components/accueil/AvantagesFahimta.tsx). Codé en dur.
 *
 * Les anciennes diapositives du carrousel (« Apprends même sans connexion », etc.) sont conservées ici, comme
 * avantages : le bandeau d'accueil ne porte plus qu'un seul message, sur les simulations interactives.
 */

export interface Avantage {
  title: string;
  subtitle: string;
}

/**
 * Badge bicolore en deux segments accolés : "segment1" sur fond fh-orange plein, "segment2" sur fond fh-accent
 * clair.
 */
export const HERO_BADGE = {
  segment1: "Programme officiel",
  segment2: "1ᵉ & 2ⁿᵈ cycles du Niger",
} as const;

export const AVANTAGES: readonly Avantage[] = [
  {
    title: "Des élèves qui progressent",
    subtitle:
      "Cours rédigés, démonstrations, exercices corrigés et simulations — du collège au lycée, dans toutes les matières.",
  },
  {
    title: "Apprends même sans connexion",
    subtitle:
      "Télécharge tes leçons et révise hors-ligne, où que tu sois. L'application fonctionne sans internet une fois tes cours enregistrés.",
  },
  {
    title: "Comprends en manipulant",
    subtitle:
      "Des simulations interactives (mouvement, plan incliné, courbes…) pour voir la physique et les maths en action, pas seulement les lire.",
  },
  {
    title: "Entraîne-toi sur de vrais sujets",
    subtitle:
      "Exercices gradués et sujets d'examen entièrement corrigés, conformes au programme officiel du Niger.",
  },
  {
    title: "Du collège au lycée",
    subtitle:
      "Mathématiques, physique, chimie, SVT… le programme officiel des deux cycles, expliqué clairement.",
  },
];
