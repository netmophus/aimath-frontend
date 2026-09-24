/**
 * Fonctions API pour les leçons (/api/admin/lecons/...).
 *
 * Étape 1 (liste + création minimale + suppression + publier/dépublier) :
 * `creerLecon` n'accepte que notion + titre. L'écriture complète (contenu,
 * exercices/vidéos/ressources imbriqués) est réservée à l'éditeur, étape 2 —
 * `LeconDetail` est déjà défini ici pour que getLecon() serve dès
 * maintenant à la page détail placeholder.
 */

import { apiRequest, ApiError } from "./api";

export type LeconStatut = "brouillon" | "a_valider" | "publie";
export type Difficulte = "facile" | "moyen" | "difficile";

export interface NotionInfo {
  id: number;
  titre: string;
}

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// --- Liste (légère) ---

export interface LeconListe {
  id: number;
  titre: string;
  statut: LeconStatut;
  notion: NotionInfo;
  chemin: string;
  nb_exercices: number;
  nb_videos: number;
  cree_le: string;
  modifie_le: string;
}

export interface ListerLeconsParams {
  statut?: LeconStatut;
  notion?: number;
  chapitre?: number;
  programme?: number;
  search?: string;
  page?: number;
}

export function listerLecons(params: ListerLeconsParams = {}): Promise<ReponsePaginee<LeconListe>> {
  const query = new URLSearchParams();
  if (params.statut) query.set("statut", params.statut);
  if (params.notion) query.set("notion", String(params.notion));
  if (params.chapitre) query.set("chapitre", String(params.chapitre));
  if (params.programme) query.set("programme", String(params.programme));
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  const qs = query.toString();
  return apiRequest<ReponsePaginee<LeconListe>>(`/api/admin/lecons/${qs ? `?${qs}` : ""}`);
}

/**
 * Toutes les leçons, en suivant la pagination jusqu'au bout — pour l'arbre
 * Matière→Programme→Thème→Chapitre→Notion de app/admin/lecons/page.tsx, qui a
 * besoin de connaître la leçon de CHAQUE notion, pas d'une seule page.
 * Sans filtre `statut`/`programme` ici : ce sont l'arbre lui-même (côté
 * client, voir lib/arbreLecons.ts) qui les applique, pour pouvoir restreindre
 * les branches sans redemander les leçons à chaque changement de filtre.
 */
export async function listerToutesLecons(): Promise<LeconListe[]> {
  const toutes: LeconListe[] = [];
  let page = 1;
  for (;;) {
    const resultat = await listerLecons({ page });
    toutes.push(...resultat.results);
    if (!resultat.next) break;
    page += 1;
  }
  return toutes;
}

// --- Détail complet (servira à l'éditeur, étape 2 ; utilisé dès l'étape 1
//     par la page détail placeholder) ---

export interface NotionContexteInfo {
  id: number;
  titre: string;
  chapitre: { id: number; titre: string };
  theme: { id: number; titre: string };
  programme: { id: number; libelle: string };
}

export interface ExerciceItem {
  id: number;
  enonce: string;
  corrige: string;
  difficulte: Difficulte;
  ordre: number;
}

export interface VideoItem {
  id: number;
  titre: string;
  url: string;
  description: string;
  ordre: number;
}

export interface RessourceItem {
  id: number;
  titre: string;
  url: string;
  ordre: number;
  fichier: string | null;
}

export interface PrerequisLeconInfo {
  id: number;
  titre: string;
}

export interface LeconDetail {
  id: number;
  titre: string;
  statut: LeconStatut;
  notion: NotionContexteInfo;
  histoire: string;
  objectifs_pedagogiques: string;
  prerequis_texte: string;
  prerequis_lecons: PrerequisLeconInfo[];
  cours_redige: string;
  demonstrations: string;
  a_retenir: string;
  sujet_examen: string;
  exercices: ExerciceItem[];
  videos: VideoItem[];
  ressources: RessourceItem[];
  cree_le: string;
  modifie_le: string;
}

export function getLecon(id: number): Promise<LeconDetail> {
  return apiRequest<LeconDetail>(`/api/admin/lecons/${id}/`);
}

// --- Création minimale (étape 1) ---

export interface CreerLeconInput {
  notion: number;
  titre: string;
}

export function creerLecon(data: CreerLeconInput): Promise<LeconDetail> {
  return apiRequest<LeconDetail>("/api/admin/lecons/", { method: "POST", body: data });
}

export function supprimerLecon(id: number): Promise<void> {
  return apiRequest<void>(`/api/admin/lecons/${id}/`, { method: "DELETE" });
}

export function publierLecon(id: number): Promise<LeconDetail> {
  return apiRequest<LeconDetail>(`/api/admin/lecons/${id}/publier/`, { method: "POST" });
}

export function depublierLecon(id: number): Promise<LeconDetail> {
  return apiRequest<LeconDetail>(`/api/admin/lecons/${id}/depublier/`, { method: "POST" });
}

// --- Modification complète (étape 2 : éditeur) ---
//
// Convention de synchro des collections imbriquées (exercices/videos/
// ressources), à respecter strictement à chaque PATCH :
//   - on envoie la liste COMPLÈTE voulue, jamais un delta ;
//   - un item SANS `id` est créé, un item AVEC `id` est mis à jour ;
//   - un id présent en base mais absent de la liste envoyée est supprimé ;
//   - omettre le champ entièrement = collection non touchée ; envoyer []
//     la vide explicitement.
// `id` est optionnel dans les types d'écriture ci-dessous précisément pour
// ça : JSON.stringify omet une clé `undefined`, donc un item sans id part
// bien sans le champ "id" dans le corps de la requête.

export interface ExerciceEcriture {
  id?: number;
  enonce: string;
  corrige: string;
  difficulte: Difficulte;
  ordre: number;
}

export interface VideoEcriture {
  id?: number;
  titre: string;
  url: string;
  description: string;
  ordre: number;
}

export interface RessourceEcriture {
  id?: number;
  titre: string;
  url: string;
  ordre: number;
}

export interface ModifierLeconInput {
  titre?: string;
  histoire?: string;
  objectifs_pedagogiques?: string;
  prerequis_texte?: string;
  cours_redige?: string;
  demonstrations?: string;
  a_retenir?: string;
  sujet_examen?: string;
  statut?: LeconStatut;
  exercices?: ExerciceEcriture[];
  videos?: VideoEcriture[];
  ressources?: RessourceEcriture[];
  // `notion` volontairement absent : immuable après création, ne jamais l'envoyer.
}

export function modifierLecon(id: number, data: ModifierLeconInput): Promise<LeconDetail> {
  return apiRequest<LeconDetail>(`/api/admin/lecons/${id}/`, { method: "PATCH", body: data });
}

const LIBELLE_COLLECTION: Record<string, string> = {
  exercices: "Exercice",
  videos: "Vidéo",
  ressources: "Ressource",
};

/**
 * Le corps d'erreur DRF pour `exercices`/`videos`/`ressources` (des listes
 * imbriquées, `many=True`) a la forme { "0": { "champ": ["message"] }, ... } :
 * un objet clé par index de position, pas un tableau. On la traduit en
 * messages positionnels lisibles ("Vidéo 1 : ...") plutôt que de laisser
 * remonter cette forme brute.
 */
function messagesErreursCollections(body: unknown): string[] {
  const messages: string[] = [];
  if (!body || typeof body !== "object") return messages;
  const record = body as Record<string, unknown>;

  for (const [collection, libelle] of Object.entries(LIBELLE_COLLECTION)) {
    const parIndex = record[collection];
    if (!parIndex || typeof parIndex !== "object" || Array.isArray(parIndex)) continue;

    for (const [indexTexte, erreursItem] of Object.entries(parIndex as Record<string, unknown>)) {
      if (!erreursItem || typeof erreursItem !== "object") continue;
      const position = Number(indexTexte) + 1;
      for (const valeurChamp of Object.values(erreursItem as Record<string, unknown>)) {
        if (Array.isArray(valeurChamp) && typeof valeurChamp[0] === "string") {
          messages.push(`${libelle} ${position} : ${valeurChamp[0]}`);
        }
      }
    }
  }

  return messages;
}

/**
 * Message d'erreur lisible pour un échec de modifierLecon (400 de
 * validation) : détaille quel exercice/vidéo/ressource pose problème plutôt
 * que le message générique de secours.
 */
export function messageErreurEnregistrementLecon(error: unknown): string {
  if (!(error instanceof ApiError)) return "Impossible d'enregistrer cette leçon.";

  const messages = messagesErreursCollections(error.body);
  if (messages.length === 0) return error.message;
  if (messages.length === 1) return messages[0];

  const reste = messages.length - 1;
  return `${messages[0]} (+${reste} autre${reste > 1 ? "s" : ""} erreur${reste > 1 ? "s" : ""})`;
}
