/**
 * Fonctions API pour le glossaire admin (/api/admin/glossaire/...).
 *
 * Convention slug : optionnel en écriture — vide, il est auto-généré par le
 * backend depuis `terme` (à la création ET à la modification, si le champ
 * est envoyé vide). On l'envoie donc toujours tel quel, sans logique
 * "seulement si modifié" côté front.
 */

import { apiRequest } from "./api";
import type { LeconStatut } from "./leconApi";

export interface LeconLieeGlossaire {
  id: number;
  titre: string;
  statut: LeconStatut;
}

export interface TermeGlossaire {
  id: number;
  terme: string;
  slug: string;
  definition: string;
  exemple: string;
  lecon_liee: LeconLieeGlossaire | null;
  cree_le: string;
  modifie_le: string;
}

export interface TermeInput {
  terme: string;
  slug?: string;
  definition: string;
  exemple?: string;
  /** null pour délier explicitement ; omis = non touché (PATCH partiel). */
  lecon_liee?: number | null;
}

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListerTermesParams {
  search?: string;
  page?: number;
}

export function listerTermes(params: ListerTermesParams = {}): Promise<ReponsePaginee<TermeGlossaire>> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiRequest<ReponsePaginee<TermeGlossaire>>(`/api/admin/glossaire/${qs ? `?${qs}` : ""}`);
}

export function getTerme(id: number): Promise<TermeGlossaire> {
  return apiRequest<TermeGlossaire>(`/api/admin/glossaire/${id}/`);
}

export function creerTerme(data: TermeInput): Promise<TermeGlossaire> {
  return apiRequest<TermeGlossaire>("/api/admin/glossaire/", { method: "POST", body: data });
}

export function modifierTerme(id: number, data: TermeInput): Promise<TermeGlossaire> {
  return apiRequest<TermeGlossaire>(`/api/admin/glossaire/${id}/`, { method: "PATCH", body: data });
}

export function supprimerTerme(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/glossaire/${id}/`, { method: "DELETE" });
}
