/**
 * Fonctions API pour l'espace VENDEUR lui-même (/api/vendeur/...) — réservées
 * au rôle vendeur (IsVendeurActif côté backend). Distinct de lib/vendeurApi.ts
 * (back-office ADMIN qui gère les vendeurs) : ici, le vendeur agit pour
 * lui-même, jamais avec un id de vendeur en paramètre.
 *
 * AUCUNE fonction ici n'expose un champ `code` de carte — le vendeur ne voit
 * jamais un code, à aucun moment (voir comptes.vendeur_serializers côté
 * backend, qui garantit la même chose serveur).
 */

import { apiRequest } from "./api";

export interface MoiVendeur {
  id: number;
  prenom: string;
  nom: string;
  telephone: string;
  commission_fcfa: number;
  cartes_disponibles: number;
  cartes_distribuees: number;
  cartes_activees: number;
}

export function getMoiVendeur(): Promise<MoiVendeur> {
  return apiRequest<MoiVendeur>("/api/vendeur/moi/");
}

export type EtatCarteVendeur = "disponible" | "distribuee" | "activee";

export interface EleveInfoCarte {
  prenom: string;
  nom: string;
  telephone: string;
}

/** Jamais de champ `code` ici (voir docstring de module). */
export interface CarteVendeur {
  id: number;
  duree_jours: number;
  date_assignation: string | null;
  attribuee_a: EleveInfoCarte | null;
  date_attribution: string | null;
  date_activation: string | null;
  etat: EtatCarteVendeur;
}

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListerMesCartesParams {
  etat?: EtatCarteVendeur;
  page?: number;
}

export function listerMesCartes(
  params: ListerMesCartesParams = {}
): Promise<ReponsePaginee<CarteVendeur>> {
  const query = new URLSearchParams();
  if (params.etat) query.set("etat", params.etat);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  const qs = query.toString();
  return apiRequest<ReponsePaginee<CarteVendeur>>(`/api/vendeur/cartes/${qs ? `?${qs}` : ""}`);
}

/** Récupère TOUTES les cartes "disponible" du vendeur connecté (pas juste la
 * 1re page) — utilisé par VendreCarteModal pour proposer la sélection
 * complète à cocher, pas seulement les 20 premières. Plafonné à 20 pages
 * (~400 cartes avec PAGE_SIZE=20) : un garde-fou, pas une limite attendue en
 * usage normal. */
export async function listerCartesDisponibles(): Promise<CarteVendeur[]> {
  const toutes: CarteVendeur[] = [];
  let page = 1;
  for (let i = 0; i < 20; i++) {
    const data = await listerMesCartes({ etat: "disponible", page });
    toutes.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return toutes;
}

// --- Vente (transfert) d'une ou plusieurs cartes à un élève ---

export interface EleveTrouve {
  prenom: string;
  nom: string;
}

/** 404 (ApiError.status === 404) si aucun élève avec ce téléphone —
 * message déjà en français côté backend, à afficher tel quel. */
export function verifierEleve(telephone: string): Promise<EleveTrouve> {
  const qs = new URLSearchParams({ telephone });
  return apiRequest<EleveTrouve>(`/api/vendeur/verifier-eleve/?${qs.toString()}`);
}

export interface VendreCarteInput {
  telephone_eleve: string;
  /** Une ou plusieurs cartes cochées par le vendeur (voir VendreCarteModal.tsx) —
   * jamais une simple quantité : le backend vérifie chacune individuellement. */
  carte_ids: number[];
}

export interface VendreCarteReponse {
  message: string;
  quantite: number;
  eleve: EleveTrouve;
}

/** Peut échouer (400) avec "Aucun élève trouvé..." ou "Une ou plusieurs
 * cartes sélectionnées ne sont plus disponibles..." (ApiError.message) — à
 * afficher tel quel. Tout ou rien : voir comptes.vendeur_views.VendreCarteView. */
export function vendreCarte(data: VendreCarteInput): Promise<VendreCarteReponse> {
  return apiRequest<VendreCarteReponse>("/api/vendeur/vendre-carte/", {
    method: "POST",
    body: data,
  });
}
