/**
 * Client HTTP pour les prompts IA personnalisés, par notion et par section
 * (/api/admin/ia/prompts/{notion_id}/). Séparé de lib/iaApi.ts : ce n'est
 * pas un appel de génération (rien n'est facturé côté fournisseur IA ici),
 * juste de la lecture/écriture d'un réglage en base.
 *
 * Un prompt personnalisé REMPLACE la consigne par défaut de sa section pour
 * cette notion (la charte de notation et les 3 colonnes officielles restent,
 * elles, toujours injectées automatiquement — voir programme.ia.prompts
 * côté backend). Chaîne vide = pas de prompt personnalisé pour cette section
 * (comportement de génération par défaut).
 */

import { apiRequest } from "./api";
import type { SectionIA } from "./iaApi";

export type PromptsNotion = Record<SectionIA, string>;

export function getPromptsNotion(notionId: number): Promise<PromptsNotion> {
  return apiRequest<PromptsNotion>(`/api/admin/ia/prompts/${notionId}/`);
}

export function enregistrerPromptsNotion(
  notionId: number,
  prompts: PromptsNotion
): Promise<PromptsNotion> {
  return apiRequest<PromptsNotion>(`/api/admin/ia/prompts/${notionId}/`, {
    method: "PUT",
    body: prompts,
  });
}
