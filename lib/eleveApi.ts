/**
 * Fonctions API pour l'espace élève (/api/eleve/...). La classe (niveau +
 * série) de l'élève est déterminée côté backend à partir du JWT — jamais
 * passée en paramètre ici.
 */

import { apiRequest, type NiveauInfo, type SerieInfo } from "./api";

export interface MatiereInfo {
  id: number;
  nom: string;
}

// --- GET /api/eleve/mon-programme/ ---

export interface ProgrammeEleve {
  id: number;
  matiere: MatiereInfo;
  niveau: NiveauInfo;
  serie: SerieInfo | null;
  libelle: string;
  nb_lecons_publiees: number;
}

export function getMonProgramme(): Promise<ProgrammeEleve[]> {
  return apiRequest<ProgrammeEleve[]>("/api/eleve/mon-programme/");
}

// --- GET /api/eleve/programmes/{id}/ : arbre filtré ---

export interface NotionEleve {
  id: number;
  titre: string;
  ordre: number;
  a_lecon_publiee: boolean;
  lecon_id: number | null;
}

export interface ChapitreEleve {
  id: number;
  titre: string;
  ordre: number;
  notions: NotionEleve[];
}

export interface ThemeEleve {
  id: number;
  titre: string;
  volume_horaire: number | null;
  ordre: number;
  chapitres: ChapitreEleve[];
}

export interface ProgrammeDetailEleve {
  id: number;
  matiere: MatiereInfo;
  niveau: NiveauInfo;
  serie: SerieInfo | null;
  libelle: string;
  themes: ThemeEleve[];
}

export function getProgrammeEleve(id: number): Promise<ProgrammeDetailEleve> {
  return apiRequest<ProgrammeDetailEleve>(`/api/eleve/programmes/${id}/`);
}

// --- GET /api/eleve/lecons/{id}/ : contenu complet ---
// Préparé ici ; utilisé à partir de l'étape "lecture de leçon" (app/eleve/lecons/[id]/).

export interface NotionContexteEleve {
  id: number;
  titre: string;
  chapitre: { id: number; titre: string };
  theme: { id: number; titre: string };
  programme: { id: number; libelle: string };
}

export interface ExerciceEleve {
  id: number;
  enonce: string;
  corrige: string;
  difficulte: "facile" | "moyen" | "difficile";
  ordre: number;
}

export interface VideoEleve {
  titre: string;
  url: string;
  description: string;
  ordre: number;
}

export interface RessourceEleve {
  titre: string;
  url: string;
  ordre: number;
}

export interface LeconEleve {
  id: number;
  titre: string;
  notion: NotionContexteEleve;
  histoire: string;
  objectifs_pedagogiques: string;
  prerequis_texte: string;
  cours_redige: string;
  demonstrations: string;
  a_retenir: string;
  exercices: ExerciceEleve[];
  videos: VideoEleve[];
  ressources: RessourceEleve[];
}

export function getLeconEleve(id: number): Promise<LeconEleve> {
  return apiRequest<LeconEleve>(`/api/eleve/lecons/${id}/`);
}

// --- GET /api/eleve/mes-lecons/ : liste plate des leçons publiées de SA classe ---
// Utilisé par le dashboard pour la section "Dernières leçons". Paginé côté
// backend (DEFAULT_PAGINATION_CLASS) — on ne lit que la 1re page, largement
// suffisante pour un aperçu de 2-3 leçons.

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface NotionListeEleve {
  id: number;
  titre: string;
}

export interface LeconListeEleve {
  id: number;
  titre: string;
  notion: NotionListeEleve;
  chemin: string;
}

export async function getMesLecons(): Promise<LeconListeEleve[]> {
  const page = await apiRequest<ReponsePaginee<LeconListeEleve>>("/api/eleve/mes-lecons/");
  return page.results;
}

// --- GET /api/eleve/glossaire/{slug}/ : un terme, pour la modale de définition ---
// Chargé à la demande (au clic sur un [[slug]] dans une leçon), pas préchargé
// en lot — voir components/eleve/ModaleTerme.tsx pour le choix et le cache.

export interface LeconLieeGlossaire {
  id: number;
  titre: string;
}

export interface TermeGlossaireEleve {
  terme: string;
  slug: string;
  definition: string;
  exemple: string;
  /** Exposé par le backend seulement si la leçon est publiée ET de la classe
   * de l'élève — null sinon (leçon en brouillon, autre classe, ou pas de lien). */
  lecon_liee: LeconLieeGlossaire | null;
}

export function getTermeGlossaire(slug: string): Promise<TermeGlossaireEleve> {
  return apiRequest<TermeGlossaireEleve>(`/api/eleve/glossaire/${slug}/`);
}
