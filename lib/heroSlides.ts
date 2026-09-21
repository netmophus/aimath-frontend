/**
 * Contenu des diapositives du hero d'accueil. Codé en dur pour
 * l'instant ; sera remplacé par un appel API plus tard si besoin.
 */

/** Couleur du panneau logo pour cette diapositive (voir HeroCarousel). */
export type HeroPanel = "bleu" | "orange" | "orange-fonce";

export interface HeroSlide {
  badge: string;
  title: string;
  subtitle: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  panel: HeroPanel;
}

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    badge: "Programme officiel du Niger",
    title: "Réussis ton année scolaire",
    subtitle:
      "Cours rédigés, démonstrations et exercices corrigés, du collège au lycée, dans toutes les matières.",
    primaryLabel: "Commencer gratuitement",
    primaryHref: "/register",
    secondaryLabel: "Voir une leçon",
    secondaryHref: "/demo",
    panel: "bleu",
  },
  {
    badge: "Cours + IA",
    title: "Un tuteur disponible 24h/24",
    subtitle:
      "Pose ta question à tout moment et obtiens une explication claire, ancrée dans ton programme.",
    primaryLabel: "Essayer maintenant",
    primaryHref: "/register",
    secondaryLabel: "En savoir plus",
    secondaryHref: "/demo",
    panel: "orange",
  },
  {
    badge: "Aide humaine",
    title: "Un enseignant t'accompagne",
    subtitle:
      "Bloqué sur un exercice ? Demande du soutien et échange en direct avec un professeur.",
    primaryLabel: "Créer mon compte",
    primaryHref: "/register",
    secondaryLabel: "Voir comment",
    secondaryHref: "/demo",
    panel: "orange-fonce",
  },
];
