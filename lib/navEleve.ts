/**
 * Détection de la rubrique active de la barre de navigation basse de l'espace
 * élève (components/eleve/BarreNavBasse.tsx). Fonctions pures, testables.
 *
 * Correspondance par SEGMENT de chemin (et non par simple préfixe de texte) :
 * "/eleve/aide" est actif sur "/eleve/aide/..." mais pas sur "/eleve/aidexyz".
 */

export type RubriqueNav = "accueil" | "cours" | "abonnement" | "aide" | "profil";

function sousChemin(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Pages rattachées à « Cours » : programmes, chapitres/leçons, résolution d'exercice. */
const BASES_COURS = ["/eleve/programmes", "/eleve/lecons", "/eleve/resoudre"] as const;

/** Pages rattachées à « Abonnement » : abonnement/paiement et cartes reçues. */
const BASES_ABONNEMENT = ["/eleve/abonnement", "/eleve/mes-cartes"] as const;

export function rubriqueActive(pathname: string): RubriqueNav | null {
  // « Accueil » = le tableau de bord de l'espace élève (/eleve), pas la page publique.
  if (pathname === "/eleve") return "accueil";
  if (BASES_COURS.some((b) => sousChemin(pathname, b))) return "cours";
  if (BASES_ABONNEMENT.some((b) => sousChemin(pathname, b))) return "abonnement";
  if (sousChemin(pathname, "/eleve/aide")) return "aide";
  if (sousChemin(pathname, "/eleve/profil")) return "profil";
  return null;
}
