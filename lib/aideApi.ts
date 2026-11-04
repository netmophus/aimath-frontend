import { apiRequest, apiRequestBlob, apiRequestMultipart } from "./api";
import type { StatutDemande, TypeDemande } from "./aide";

export interface RefNomme {
  id: number;
  nom: string;
}

export interface Demande {
  id: number;
  type: TypeDemande;
  matiere: RefNomme | null;
  lecon: RefNomme | null;
  message: string;
  a_piece_jointe: boolean;
  statut: StatutDemande;
  a_reponse: boolean;
  reponse: string;
  reponse_le: string | null;
  cree_le: string;
  traitee_le: string | null;
}

export interface EleveDemande {
  id: number;
  nom: string;
  telephone: string;
  classe: string;
}

export interface DemandeAdmin extends Demande {
  eleve: EleveDemande;
  mis_a_jour_le: string;
}

export interface NouvelleDemande {
  cle: string;
  type: TypeDemande;
  programme: number | null;
  lecon: number | null;
  message: string;
  image: File | null;
}

// --- Élève : /api/eleve/aide/demandes/ ---

export function listerMesDemandes(): Promise<Demande[]> {
  return apiRequest<Demande[]>("/api/eleve/aide/demandes/");
}

export function getMaDemande(id: number): Promise<Demande> {
  return apiRequest<Demande>(`/api/eleve/aide/demandes/${id}/`);
}

export function creerDemande(d: NouvelleDemande): Promise<Demande> {
  const corps = new FormData();
  corps.append("cle", d.cle);
  corps.append("type", d.type);
  corps.append("message", d.message);
  if (d.programme !== null) corps.append("programme", String(d.programme));
  if (d.lecon !== null) corps.append("lecon", String(d.lecon));
  if (d.image) corps.append("piece_jointe", d.image);
  // Délai maximal : sans lui, un serveur muet laisserait « Envoi… » indéfiniment.
  return apiRequestMultipart<Demande>("/api/eleve/aide/demandes/", corps, "POST", 30000);
}

/** Pièce jointe privée : récupérée avec le jeton de l'élève (jamais d'URL publique). */
export function pieceJointeEleve(id: number): Promise<Blob> {
  return apiRequestBlob(`/api/eleve/aide/demandes/${id}/piece-jointe/`);
}

// --- Administration : /api/admin/aide/demandes/ ---

export interface FiltresAdmin {
  type?: TypeDemande | "";
  statut?: StatutDemande | "";
  q?: string;
  page?: number;
}

export interface ListeAdmin {
  count: number;
  next: string | null;
  previous: string | null;
  results: DemandeAdmin[];
}

export function listerDemandesAdmin(f: FiltresAdmin): Promise<ListeAdmin> {
  const p = new URLSearchParams();
  if (f.type) p.set("type", f.type);
  if (f.statut) p.set("statut", f.statut);
  if (f.q?.trim()) p.set("q", f.q.trim());
  if (f.page && f.page > 1) p.set("page", String(f.page));
  const suite = p.toString();
  return apiRequest<ListeAdmin>(`/api/admin/aide/demandes/${suite ? `?${suite}` : ""}`);
}

export function traiterDemandeAdmin(id: number, corps: { statut?: StatutDemande; reponse?: string }): Promise<DemandeAdmin> {
  return apiRequest<DemandeAdmin>(`/api/admin/aide/demandes/${id}/`, { method: "PATCH", body: corps });
}

export function pieceJointeAdmin(id: number): Promise<Blob> {
  return apiRequestBlob(`/api/admin/aide/demandes/${id}/piece-jointe/`);
}

// --- Leçons d'une matière : API existante /api/eleve/mes-lecons/ (titre exact de la leçon, publiées, de SA classe) ---

interface PageLecons {
  next: string | null;
  results: { id: number; titre: string }[];
}

/** Lit toutes les pages (20 par page côté serveur), avec un plafond de sécurité. */
export async function leconsDeMatiere(matiereId: number): Promise<{ id: number; titre: string }[]> {
  const toutes: { id: number; titre: string }[] = [];
  for (let page = 1; page <= 25; page++) {
    const r = await apiRequest<PageLecons>(`/api/eleve/mes-lecons/?matiere=${matiereId}&page=${page}`);
    toutes.push(...r.results.map((l) => ({ id: l.id, titre: l.titre })));
    if (!r.next) break;
  }
  return toutes;
}
