/**
 * Contenu des diapositives du hero d'accueil (components/HeroCarousel.tsx).
 * Codé en dur pour l'instant ; sera remplacé par un appel API plus tard si
 * besoin.
 *
 * Le badge et les deux boutons sont IDENTIQUES sur toutes les diapositives
 * (voir la maquette validée) : seuls le titre et le sous-texte changent —
 * d'où leur absence de HeroSlide, HERO_BADGE étant une constante séparée.
 */

export interface HeroSlide {
  title: string;
  subtitle: string;
}

/**
 * Badge bicolore en deux segments accolés (voir le rendu dans
 * HeroCarousel.tsx) : "segment1" sur fond fh-orange plein, "segment2" sur
 * fond fh-accent clair.
 */
export const HERO_BADGE = {
  segment1: "Programme officiel",
  segment2: "1ᵉ & 2ⁿᵈ cycles du Niger",
} as const;

export const HERO_SLIDES: readonly HeroSlide[] = [
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
