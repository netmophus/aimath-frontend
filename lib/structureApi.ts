/**
 * Fonctions API pour la structure scolaire (/api/admin/structure/...).
 * Réservées aux admins côté backend ; ici on suppose déjà authentifié
 * (la page appelante vit sous le layout admin protégé).
 */

import { apiRequest } from "./api";

export interface Cycle {
  id: number;
  nom: string;
  ordre: number;
  nb_niveaux: number;
}

export interface NiveauCycleInfo {
  id: number;
  nom: string;
}

export interface Niveau {
  id: number;
  nom: string;
  ordre: number;
  cycle: NiveauCycleInfo;
  nb_series: number;
  nb_programmes: number;
  nb_eleves: number;
}

export interface SerieNiveauInfo {
  id: number;
  nom: string;
}

export interface Serie {
  id: number;
  nom: string;
  niveau: SerieNiveauInfo;
  nb_programmes: number;
  nb_eleves: number;
}

export interface Matiere {
  id: number;
  nom: string;
  nb_programmes: number;
}

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- Cycles ---

export interface CycleInput {
  nom: string;
  ordre: number;
}

export function listerCycles(): Promise<ReponsePaginee<Cycle>> {
  return apiRequest<ReponsePaginee<Cycle>>("/api/admin/structure/cycles/");
}

export function creerCycle(data: CycleInput): Promise<Cycle> {
  return apiRequest<Cycle>("/api/admin/structure/cycles/", { method: "POST", body: data });
}

export function modifierCycle(id: number, data: CycleInput): Promise<Cycle> {
  return apiRequest<Cycle>(`/api/admin/structure/cycles/${id}/`, { method: "PATCH", body: data });
}

export function supprimerCycle(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/structure/cycles/${id}/`, { method: "DELETE" });
}

// --- Niveaux ---

export interface NiveauInput {
  cycle: number;
  nom: string;
  ordre: number;
}

export interface ListerNiveauxParams {
  cycle?: number;
}

export function listerNiveaux(params: ListerNiveauxParams = {}): Promise<ReponsePaginee<Niveau>> {
  const query = new URLSearchParams();
  if (params.cycle) query.set("cycle", String(params.cycle));
  const qs = query.toString();
  return apiRequest<ReponsePaginee<Niveau>>(`/api/admin/structure/niveaux/${qs ? `?${qs}` : ""}`);
}

export function creerNiveau(data: NiveauInput): Promise<Niveau> {
  return apiRequest<Niveau>("/api/admin/structure/niveaux/", { method: "POST", body: data });
}

export function modifierNiveau(id: number, data: NiveauInput): Promise<Niveau> {
  return apiRequest<Niveau>(`/api/admin/structure/niveaux/${id}/`, { method: "PATCH", body: data });
}

export function supprimerNiveau(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/structure/niveaux/${id}/`, { method: "DELETE" });
}

// --- Séries ---

export interface SerieInput {
  niveau: number;
  nom: string;
}

export interface ListerSeriesParams {
  niveau?: number;
}

export function listerSeries(params: ListerSeriesParams = {}): Promise<ReponsePaginee<Serie>> {
  const query = new URLSearchParams();
  if (params.niveau) query.set("niveau", String(params.niveau));
  const qs = query.toString();
  return apiRequest<ReponsePaginee<Serie>>(`/api/admin/structure/series/${qs ? `?${qs}` : ""}`);
}

export function creerSerie(data: SerieInput): Promise<Serie> {
  return apiRequest<Serie>("/api/admin/structure/series/", { method: "POST", body: data });
}

export function modifierSerie(id: number, data: SerieInput): Promise<Serie> {
  return apiRequest<Serie>(`/api/admin/structure/series/${id}/`, { method: "PATCH", body: data });
}

export function supprimerSerie(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/structure/series/${id}/`, { method: "DELETE" });
}

// --- Matières ---

export interface MatiereInput {
  nom: string;
}

export function listerMatieres(): Promise<ReponsePaginee<Matiere>> {
  return apiRequest<ReponsePaginee<Matiere>>("/api/admin/structure/matieres/");
}

export function creerMatiere(data: MatiereInput): Promise<Matiere> {
  return apiRequest<Matiere>("/api/admin/structure/matieres/", { method: "POST", body: data });
}

export function modifierMatiere(id: number, data: MatiereInput): Promise<Matiere> {
  return apiRequest<Matiere>(`/api/admin/structure/matieres/${id}/`, { method: "PATCH", body: data });
}

export function supprimerMatiere(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/structure/matieres/${id}/`, { method: "DELETE" });
}
