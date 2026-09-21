/**
 * Clés React locales pour les items imbriqués (exercices/vidéos/ressources)
 * en cours d'édition, avant sauvegarde. Jamais envoyées au backend — voir
 * ModifierLeconInput dans lib/leconApi.ts (seul `id` compte pour la synchro).
 */
let compteur = 0;

export function nouvelleClef(): string {
  compteur += 1;
  return `local-${Date.now()}-${compteur}`;
}
