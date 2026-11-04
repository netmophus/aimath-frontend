import { apiRequest } from "./api";
import type { ModeCible, StatutIndicateur, TypeCommunication } from "./communications";

export interface Budget {
  plafond_mensuel_fcfa: number;
  cout_segment_fcfa: string | null;
  tarif_connu: boolean;
  depense_mois_fcfa: string | number;
  restant_fcfa: string | number;
}

export interface Parametres extends Budget {
  lien_whatsapp: string;
  envois_actifs: boolean;
  fournisseur: string;
  /** Toujours false tant que le fournisseur ne remonte pas d'accusé de livraison. */
  livraison_confirmee: boolean;
  file_attente?: { en_attente: number; en_cours: number; incertains: number };
}

export interface Modele {
  code: string;
  libelle: string;
  type: TypeCommunication;
  texte: string;
}

export interface Filtres {
  role?: string;
  statut?: string;
  search?: string;
  niveau?: number;
  serie?: number;
}

export interface Campagne {
  id: number;
  type: TypeCommunication;
  categorie: "service" | "facultatif";
  statut: "apercu" | "en_cours" | "terminee" | "arretee";
  texte: string;
  mode: ModeCible;
  auteur: string | null;
  cree_le: string;
  confirmee_le: string | null;
  terminee_le: string | null;
  nb_comptes: number;
  exclusions: Record<string, number>;
  nb_destinataires: number;
  segments_total: number;
  cout_segment: string | null;
  cout_estime: string | null;
  messages: Record<string, number>;
  livres: null;
  texte_exemple?: string;
  budget?: Budget;
  envois_actifs?: boolean;
  deja_confirmee?: boolean;
}

export interface MessageHistorique {
  id: number;
  campagne: number;
  utilisateur_id: number | null;
  nom: string | null;
  telephone: string;
  statut: string;
  segments: number;
  tentatives: number;
  code: string;
  mis_a_jour_le: string;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const BASE = "/api/admin/communications";

export interface DemandeApercu {
  cle: string;
  type: TypeCommunication;
  texte: string;
  mode: ModeCible;
  ids: number[];
  filtres: Filtres;
}

export const parametres = () => apiRequest<Parametres>(`${BASE}/parametres/`);
export const modeles = () => apiRequest<Modele[]>(`${BASE}/modeles/`);

export const modifierParametres = (d: { lien_whatsapp?: string; plafond_mensuel_fcfa?: number; cout_segment_fcfa?: number | null }) =>
  apiRequest<Parametres>(`${BASE}/parametres/`, { method: "PATCH", body: d });

export const apercu = (d: DemandeApercu) => apiRequest<Campagne>(`${BASE}/campagnes/apercu/`, { method: "POST", body: d });

export const confirmer = (id: number, attestation: boolean) =>
  apiRequest<Campagne>(`${BASE}/campagnes/${id}/confirmer/`, { method: "POST", body: { attestation_consentement: attestation } });

export const arreter = (id: number) => apiRequest<Campagne>(`${BASE}/campagnes/${id}/arreter/`, { method: "POST" });
export const relancerEchecs = (id: number) => apiRequest<Campagne>(`${BASE}/campagnes/${id}/relancer-echecs/`, { method: "POST" });
export const campagne = (id: number) => apiRequest<Campagne>(`${BASE}/campagnes/${id}/`);

export const campagnes = (page = 1) =>
  apiRequest<Page<Campagne>>(`${BASE}/campagnes/${page > 1 ? `?page=${page}` : ""}`);

export function messages(p: { campagne?: number; utilisateur?: number; page?: number }) {
  const q = new URLSearchParams();
  if (p.campagne) q.set("campagne", String(p.campagne));
  if (p.utilisateur) q.set("utilisateur", String(p.utilisateur));
  if (p.page && p.page > 1) q.set("page", String(p.page));
  const qs = q.toString();
  return apiRequest<Page<MessageHistorique>>(`${BASE}/messages/${qs ? `?${qs}` : ""}`);
}

export const statutsActivation = (ids: number[]) =>
  apiRequest<Record<string, StatutIndicateur>>(`${BASE}/statut-activation/?ids=${ids.join(",")}`);
