/**
 * Fonctions API pour l'espace élève (/api/eleve/...). La classe (niveau +
 * série) de l'élève est déterminée côté backend à partir du JWT — jamais
 * passée en paramètre ici.
 */

import {
  apiRequest,
  apiRequestMultipart,
  type NiveauInfo,
  type Role,
  type SerieInfo,
  type Statut,
} from "./api";

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
  /** null si a_lecon_publiee est false (rien à qualifier). */
  lecon_est_gratuite: boolean | null;
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
  /** Tronqué aux ~500 premiers caractères si `verrouille` est true — jamais
   * le cours complet dans ce cas (voir LeconEleveSerializer côté backend). */
  cours_redige: string;
  demonstrations: string;
  a_retenir: string;
  sujet_examen: string;
  exercices: ExerciceEleve[];
  videos: VideoEleve[];
  ressources: RessourceEleve[];
  /** true = contenu premium non accessible à cet élève : seuls titre,
   * objectifs, histoire et un aperçu de cours_redige sont renseignés,
   * tout le reste ci-dessus est vide/vidé PAR LE SERVEUR (pas un simple
   * masquage d'affichage). */
  verrouille: boolean;
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

// --- GET/PATCH /api/eleve/profil/ : profil enrichi de l'élève connecté ---

export type GenreEleve = "F" | "M" | "autre";

export interface ProfilEleve {
  id: number;
  telephone: string;
  email: string | null;
  prenom: string;
  nom: string;
  role: Role;
  statut: Statut;
  niveau: string | null;
  serie: string | null;
  date_inscription: string;
  date_naissance: string | null;
  ecole: string | null;
  ville: string | null;
  genre: GenreEleve | null;
  photo_url: string | null;
}

export function getProfilEleve(): Promise<ProfilEleve> {
  return apiRequest<ProfilEleve>("/api/eleve/profil/");
}

export interface MajProfilEleveInput {
  date_naissance: string;
  ecole: string;
  ville: string;
  genre: GenreEleve | "";
  /** undefined = photo inchangée ; File = nouvelle photo à envoyer. */
  photo?: File;
}

/** PATCH /api/eleve/profil/ — multipart (voir apiRequestMultipart) : seul
 * moyen d'envoyer à la fois des champs texte et un fichier en un appel. */
export function majProfilEleve(payload: MajProfilEleveInput): Promise<ProfilEleve> {
  const formData = new FormData();
  formData.append("date_naissance", payload.date_naissance);
  formData.append("ecole", payload.ecole);
  formData.append("ville", payload.ville);
  formData.append("genre", payload.genre);
  if (payload.photo) formData.append("photo", payload.photo);

  return apiRequestMultipart<ProfilEleve>("/api/eleve/profil/", formData, "PATCH");
}

// --- POST /api/eleve/activer-carte/ : activation d'une carte Fahimta ---

export interface ActivationCarteReponse {
  message: string;
  /** Date ISO ("2026-10-25") de la nouvelle échéance d'abonnement. */
  abonnement_actif_jusqu_au: string;
}

/** Le backend accepte le code avec ou sans tirets/espaces, casse
 * indifférente — aucune normalisation nécessaire ici, elle est faite
 * côté serveur (voir comptes.cartes.normaliser_code). */
export function activerCarteFahimta(code: string): Promise<ActivationCarteReponse> {
  return apiRequest<ActivationCarteReponse>("/api/eleve/activer-carte/", {
    method: "POST",
    body: { code },
  });
}
