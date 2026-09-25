/**
 * Fonctions API pour le module vendeur (back-office custom,
 * /api/admin/vendeurs/...) — réservées admin (IsAdminRole côté backend).
 *
 * La liste des cartes d'UN vendeur ne passe PAS par une fonction dédiée ici :
 * elle réutilise listerCartes({ vendeur: id }) de lib/carteApi.ts (même
 * endpoint que la page /admin/cartes, déjà masqué/paginé) — voir
 * app/admin/vendeurs/[id]/page.tsx.
 */

import { apiRequest } from "./api";
import type { CarteFahimta } from "./carteApi";

export interface Vendeur {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  commission_fcfa: number;
  /** Adresse, tous facultatifs. `ville` est un champ partagé avec le profil
   * élève côté backend (comptes.models.User.ville), pas dupliqué. */
  ville: string | null;
  quartier: string | null;
  ecole_ou_point_vente: string | null;
  date_inscription: string;
  /** TOTAL de cartes jamais assignées à ce vendeur — se décompose en
   * cartes_disponibles + cartes_vendues + cartes_activees ci-dessous (voir
   * comptes.cartes, vocabulaire respecté partout). */
  cartes_assignees: number;
  /** Encore chez le vendeur, pas données à un élève. */
  cartes_disponibles: number;
  /** Données à un élève (attribuee_a), pas encore activées par lui. */
  cartes_vendues: number;
  /** L'élève a activé son abonnement avec cette carte. */
  cartes_activees: number;
}

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function listerVendeurs(): Promise<ReponsePaginee<Vendeur>> {
  return apiRequest<ReponsePaginee<Vendeur>>("/api/admin/vendeurs/");
}

export function getVendeur(id: number): Promise<Vendeur> {
  return apiRequest<Vendeur>(`/api/admin/vendeurs/${id}/`);
}

export interface CreerVendeurInput {
  prenom: string;
  nom: string;
  telephone: string;
  mot_de_passe: string;
  commission_fcfa: number;
  ville?: string;
  quartier?: string;
  ecole_ou_point_vente?: string;
}

export function creerVendeur(data: CreerVendeurInput): Promise<Vendeur> {
  return apiRequest<Vendeur>("/api/admin/vendeurs/", { method: "POST", body: data });
}

export interface ModifierVendeurInput {
  prenom?: string;
  nom?: string;
  /** Modifier ce champ ne change JAMAIS commission_figee des cartes déjà
   * assignées — voir comptes.models.CarteFahimta.commission_figee. */
  commission_fcfa?: number;
  ville?: string;
  quartier?: string;
  ecole_ou_point_vente?: string;
}

export function modifierVendeur(id: number, data: ModifierVendeurInput): Promise<Vendeur> {
  return apiRequest<Vendeur>(`/api/admin/vendeurs/${id}/`, { method: "PATCH", body: data });
}

// --- Assignation de cartes (deux voies) ---

export interface AssignationReponse {
  /** Présent seulement pour genererPourVendeur (identifiant du lot créé). */
  lot?: string;
  quantite: number;
  /** Codes MASQUÉS (même règle que partout ailleurs) : voir
   * comptes.admin_vendeurs_views, qui réutilise CarteFahimtaAdminSerializer. */
  cartes: CarteFahimta[];
}

export interface GenererPourVendeurInput {
  vendeur_id: number;
  quantite: number;
  duree_jours: number;
}

export function genererPourVendeur(data: GenererPourVendeurInput): Promise<AssignationReponse> {
  return apiRequest<AssignationReponse>("/api/admin/vendeurs/generer-pour-vendeur/", {
    method: "POST",
    body: data,
  });
}

export interface AssignerExistantesInput {
  vendeur_id: number;
  quantite: number;
}

/** Peut échouer avec un message "Stock central insuffisant (X disponible(s))."
 * (400) — à afficher tel quel, voir ApiError.message. */
export function assignerExistantes(data: AssignerExistantesInput): Promise<AssignationReponse> {
  return apiRequest<AssignationReponse>("/api/admin/vendeurs/assigner-existantes/", {
    method: "POST",
    body: data,
  });
}
