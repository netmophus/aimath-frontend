/**
 * Fonctions API réservées au dashboard admin (/api/admin/...). Toutes
 * passent par apiRequest (header Bearer + retry automatique sur 401).
 */

import { apiRequest, type NiveauInfo, type Role, type SerieInfo, type Statut } from "./api";

export interface Compte {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  email: string | null;
  role: Role;
  statut: Statut;
  date_inscription: string;
  niveau: NiveauInfo | null;
  serie: SerieInfo | null;
  motif_rejet: string | null;
  doit_changer_mdp: boolean;
}

export interface ComptePagine {
  count: number;
  next: string | null;
  previous: string | null;
  results: Compte[];
}

export interface AdminStats {
  nb_eleves: number;
  nb_enseignants: number;
  nb_en_attente: number;
  total_lecons: number;
  lecons_publiees: number;
}

export interface ListerComptesParams {
  statut?: Statut;
  role?: Role;
  search?: string;
  /** Page DRF (1-indexée). Omis si 1 (comportement par défaut de l'API). */
  page?: number;
}

export function listerComptes(params: ListerComptesParams = {}): Promise<ComptePagine> {
  const query = new URLSearchParams();
  if (params.statut) query.set("statut", params.statut);
  if (params.role) query.set("role", params.role);
  if (params.search) query.set("search", params.search);
  if (params.page && params.page > 1) query.set("page", String(params.page));

  const queryString = query.toString();
  return apiRequest<ComptePagine>(`/api/admin/comptes/${queryString ? `?${queryString}` : ""}`);
}

export function approuverCompte(id: number): Promise<Compte> {
  return apiRequest<Compte>(`/api/admin/comptes/${id}/approuver/`, { method: "POST" });
}

export function rejeterCompte(id: number, motif?: string): Promise<Compte> {
  return apiRequest<Compte>(`/api/admin/comptes/${id}/rejeter/`, {
    method: "POST",
    body: motif ? { motif } : {},
  });
}

export function suspendreCompte(id: number): Promise<Compte> {
  return apiRequest<Compte>(`/api/admin/comptes/${id}/suspendre/`, { method: "POST" });
}

export function reactiverCompte(id: number): Promise<Compte> {
  return apiRequest<Compte>(`/api/admin/comptes/${id}/reactiver/`, { method: "POST" });
}

export interface CreerCompteInput {
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  /** Restreint côté backend : eleve/partenaire sont refusés (400) sur cet endpoint. */
  role: Extract<Role, "enseignant" | "admin">;
  password: string;
}

export function creerCompte(data: CreerCompteInput): Promise<Compte> {
  return apiRequest<Compte>("/api/admin/comptes/", { method: "POST", body: data });
}

export interface ModifierCompteInput {
  prenom?: string;
  nom?: string;
  email?: string;
}

export function modifierCompte(id: number, data: ModifierCompteInput): Promise<Compte> {
  return apiRequest<Compte>(`/api/admin/comptes/${id}/`, { method: "PATCH", body: data });
}

export function getAdminStats(): Promise<AdminStats> {
  return apiRequest<AdminStats>("/api/admin/stats/");
}
