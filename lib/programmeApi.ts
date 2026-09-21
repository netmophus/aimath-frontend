/**
 * Fonctions API pour la hiérarchie du programme officiel
 * (/api/admin/programmes|themes|chapitres|notions/...).
 *
 * Deux formes coexistent pour Theme/Chapitre/Notion, reflétant les deux
 * serializers du backend :
 *  - "Item" : réponse plate des endpoints CRUD (list/create/update/
 *    monter/descendre), avec l'id du parent et des compteurs.
 *  - "Noeud" : forme imbriquée utilisée UNIQUEMENT dans l'arbre de
 *    ProgrammeDetail (pas d'id parent, pas de compteurs, mais les enfants).
 */

import { apiRequest, type NiveauInfo, type SerieInfo } from "./api";

export interface MatiereInfo {
  id: number;
  nom: string;
}

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- Programme ---

export interface ProgrammeListe {
  id: number;
  matiere: MatiereInfo;
  niveau: NiveauInfo;
  serie: SerieInfo | null;
  libelle: string;
  nb_themes: number;
  nb_chapitres: number;
  nb_notions: number;
  nb_lecons: number;
}

export interface NotionNoeud {
  id: number;
  titre: string;
  ordre: number;
  contenus_officiels: string;
  objectifs_officiels: string;
  commentaires_officiels: string;
  a_lecon: boolean;
}

export interface ChapitreNoeud {
  id: number;
  titre: string;
  ordre: number;
  notions: NotionNoeud[];
}

export interface ThemeNoeud {
  id: number;
  titre: string;
  volume_horaire: number | null;
  ordre: number;
  chapitres: ChapitreNoeud[];
}

export interface ProgrammeDetail {
  id: number;
  matiere: MatiereInfo;
  niveau: NiveauInfo;
  serie: SerieInfo | null;
  libelle: string;
  themes: ThemeNoeud[];
}

export interface ProgrammeInput {
  matiere: number;
  niveau: number;
  serie?: number | null;
}

export function listerProgrammes(): Promise<ReponsePaginee<ProgrammeListe>> {
  return apiRequest<ReponsePaginee<ProgrammeListe>>("/api/admin/programmes/");
}

export function getProgramme(id: number): Promise<ProgrammeDetail> {
  return apiRequest<ProgrammeDetail>(`/api/admin/programmes/${id}/`);
}

export function creerProgramme(data: ProgrammeInput): Promise<ProgrammeListe> {
  return apiRequest<ProgrammeListe>("/api/admin/programmes/", { method: "POST", body: data });
}

export function supprimerProgramme(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/programmes/${id}/`, { method: "DELETE" });
}

// --- Theme ---

export interface ThemeItem {
  id: number;
  titre: string;
  volume_horaire: number | null;
  ordre: number;
  programme: number;
  nb_chapitres: number;
  nb_notions: number;
}

export interface ThemeInput {
  programme: number;
  titre: string;
  volume_horaire: number | null;
  ordre: number;
}

export function creerTheme(data: ThemeInput): Promise<ThemeItem> {
  return apiRequest<ThemeItem>("/api/admin/themes/", { method: "POST", body: data });
}

export function modifierTheme(id: number, data: ThemeInput): Promise<ThemeItem> {
  return apiRequest<ThemeItem>(`/api/admin/themes/${id}/`, { method: "PATCH", body: data });
}

export function supprimerTheme(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/themes/${id}/`, { method: "DELETE" });
}

export function monterTheme(id: number): Promise<ThemeItem> {
  return apiRequest<ThemeItem>(`/api/admin/themes/${id}/monter/`, { method: "POST" });
}

export function descendreTheme(id: number): Promise<ThemeItem> {
  return apiRequest<ThemeItem>(`/api/admin/themes/${id}/descendre/`, { method: "POST" });
}

// --- Chapitre ---

export interface ChapitreItem {
  id: number;
  titre: string;
  ordre: number;
  theme: number;
  nb_notions: number;
}

export interface ChapitreInput {
  theme: number;
  titre: string;
  ordre: number;
}

export function creerChapitre(data: ChapitreInput): Promise<ChapitreItem> {
  return apiRequest<ChapitreItem>("/api/admin/chapitres/", { method: "POST", body: data });
}

export function modifierChapitre(id: number, data: ChapitreInput): Promise<ChapitreItem> {
  return apiRequest<ChapitreItem>(`/api/admin/chapitres/${id}/`, { method: "PATCH", body: data });
}

export function supprimerChapitre(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/chapitres/${id}/`, { method: "DELETE" });
}

export function monterChapitre(id: number): Promise<ChapitreItem> {
  return apiRequest<ChapitreItem>(`/api/admin/chapitres/${id}/monter/`, { method: "POST" });
}

export function descendreChapitre(id: number): Promise<ChapitreItem> {
  return apiRequest<ChapitreItem>(`/api/admin/chapitres/${id}/descendre/`, { method: "POST" });
}

// --- Notion ---

export interface NotionItem {
  id: number;
  titre: string;
  ordre: number;
  chapitre: number;
  contenus_officiels: string;
  objectifs_officiels: string;
  commentaires_officiels: string;
  a_lecon: boolean;
}

export interface NotionInput {
  chapitre: number;
  titre: string;
  ordre: number;
  contenus_officiels: string;
  objectifs_officiels: string;
  commentaires_officiels: string;
}

export function creerNotion(data: NotionInput): Promise<NotionItem> {
  return apiRequest<NotionItem>("/api/admin/notions/", { method: "POST", body: data });
}

export function modifierNotion(id: number, data: NotionInput): Promise<NotionItem> {
  return apiRequest<NotionItem>(`/api/admin/notions/${id}/`, { method: "PATCH", body: data });
}

export function supprimerNotion(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/notions/${id}/`, { method: "DELETE" });
}

export function monterNotion(id: number): Promise<NotionItem> {
  return apiRequest<NotionItem>(`/api/admin/notions/${id}/monter/`, { method: "POST" });
}

export function descendreNotion(id: number): Promise<NotionItem> {
  return apiRequest<NotionItem>(`/api/admin/notions/${id}/descendre/`, { method: "POST" });
}
