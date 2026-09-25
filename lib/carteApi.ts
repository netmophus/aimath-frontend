/**
 * Fonctions API pour les cartes Fahimta (back-office custom,
 * /api/admin/cartes/...) — réservées admin (IsAdminRole côté backend).
 *
 * `code` dans CarteFahimta est MASQUÉ par le backend tant que la carte est
 * active ("FH-••••-••••-XXXX") — jamais recalculé côté client, le masquage
 * est une garantie serveur (voir comptes.cartes.code_masque). Les codes en
 * clair n'apparaissent QUE dans GenererLotReponse (juste après génération)
 * et dans le fichier exporté par telechargerExportCsv.
 */

import { apiRequest, apiRequestBlob } from "./api";

/** Prix affiché pour une carte — en dur, aucun champ backend pour l'instant :
 * centralisé ici (pas dans un composant) pour rester importable aussi bien
 * par l'aperçu "carte à gratter" admin (components/admin/cartes/CarteRow.tsx)
 * que par l'espace vendeur (components/vendeur/CarteVendeurRow.tsx), sans
 * dupliquer la constante. Un seul endroit à changer le jour où un vrai prix
 * par carte existera côté API. */
export const PRIX_CARTE_FCFA = 2000;

export type StatutCarte = "active" | "utilisee";

/** État de suivi admin (voir comptes.cartes, vocabulaire respecté partout —
 * calculé côté serveur, jamais recalculé ici) :
 * - stock_central : active, pas de vendeur, pas d'élève.
 * - assignee : active, chez un vendeur, pas encore donnée à un élève.
 * - vendue : donnée à un élève (attribuee_a), pas encore activée.
 * - utilisee : l'élève a activé son abonnement. */
export type EtatCarte = "stock_central" | "assignee" | "vendue" | "utilisee";

export interface UtiliseeParInfo {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
}

/** Sous-objet minimal (voir comptes.admin_cartes_serializers.VendeurInfoSerializer). */
export interface VendeurInfo {
  id: number;
  nom: string;
  prenom: string;
}

export interface CarteFahimta {
  id: number;
  code: string;
  statut: StatutCarte;
  etat: EtatCarte;
  duree_jours: number;
  lot: string;
  utilisee_par: UtiliseeParInfo | null;
  date_activation: string | null;
  date_creation: string;
  /** null = carte au stock central, non assignée à un vendeur. */
  vendeur: VendeurInfo | null;
  /** Commission du vendeur au moment de l'assignation — jamais recalculée
   * ensuite (voir comptes.models.CarteFahimta.commission_figee). null si
   * jamais assignée. */
  commission_figee: number | null;
  date_assignation: string | null;
  /** Élève à qui un vendeur a donné cette carte (même forme que
   * utilisee_par) — null tant qu'elle n'a pas été vendue. */
  attribuee_a: UtiliseeParInfo | null;
  date_attribution: string | null;
}

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ListerCartesParams {
  statut?: StatutCarte;
  /** État de suivi (voir EtatCarte) — plus précis que `statut` ci-dessus
   * (qui ne distingue pas stock central/assignée/vendue, toutes "active").
   * Les deux filtres coexistent côté backend, indépendamment. */
  etat?: EtatCarte;
  lot?: string;
  duree_jours?: number;
  search?: string;
  page?: number;
  /** Id d'un vendeur (cartes qui lui sont assignées) — ou "none" pour le
   * STOCK CENTRAL (cartes non assignées). Réutilisé par la page vendeur,
   * voir lib/vendeurApi.ts et comptes.admin_cartes_views (?vendeur=). */
  vendeur?: number | "none";
  /** Id d'un élève — cartes qui lui ont été vendues ET/OU qu'il a activées
   * (voir comptes.admin_cartes_views, ?eleve=). */
  eleve?: number;
}

export function listerCartes(params: ListerCartesParams = {}): Promise<ReponsePaginee<CarteFahimta>> {
  const query = new URLSearchParams();
  if (params.statut) query.set("statut", params.statut);
  if (params.etat) query.set("etat", params.etat);
  if (params.lot) query.set("lot", params.lot);
  if (params.duree_jours) query.set("duree_jours", String(params.duree_jours));
  if (params.search) query.set("search", params.search);
  if (params.page && params.page > 1) query.set("page", String(params.page));
  if (params.vendeur !== undefined) query.set("vendeur", String(params.vendeur));
  if (params.eleve !== undefined) query.set("eleve", String(params.eleve));
  const qs = query.toString();
  return apiRequest<ReponsePaginee<CarteFahimta>>(`/api/admin/cartes/${qs ? `?${qs}` : ""}`);
}

// --- Statistiques globales par état (en-tête de /admin/cartes) ---

export interface StatsCartes {
  total: number;
  stock_central: number;
  assignee: number;
  vendue: number;
  utilisee: number;
}

export function getStatsCartes(): Promise<StatsCartes> {
  return apiRequest<StatsCartes>("/api/admin/cartes/stats/");
}

// --- Vue synthétique par lot ---

export interface LotCartes {
  lot: string;
  total: number;
  actives: number;
  utilisees: number;
  duree_jours: number;
  date_creation: string;
}

export function listerLots(): Promise<LotCartes[]> {
  return apiRequest<LotCartes[]>("/api/admin/cartes/lots/");
}

// --- Génération d'un lot ---

/** Code EN CLAIR (pas de masquage ici, contrairement à CarteFahimta) : voir
 * comptes.admin_cartes_serializers.CarteFahimtaGenereeSerializer côté backend. */
export interface CarteGeneree {
  id: number;
  code: string;
  duree_jours: number;
  lot: string;
  date_creation: string;
}

export interface GenererLotInput {
  quantite: number;
  duree_jours: number;
}

export interface GenererLotReponse {
  lot: string;
  duree_jours: number;
  cartes: CarteGeneree[];
}

export function genererLot(data: GenererLotInput): Promise<GenererLotReponse> {
  return apiRequest<GenererLotReponse>("/api/admin/cartes/generer/", { method: "POST", body: data });
}

// --- Export CSV ---

/** Déclenche le téléchargement du CSV (tout, ou restreint à un lot si
 * fourni) — récupère le fichier en Blob authentifié (voir
 * lib/api.ts, apiRequestBlob) puis simule un clic sur un <a download>
 * éphémère, seul moyen fiable de nommer/enregistrer le fichier côté
 * navigateur pour une réponse obtenue via fetch (pas une navigation directe). */
export async function telechargerExportCsv(lot?: string): Promise<void> {
  const qs = lot ? `?lot=${encodeURIComponent(lot)}` : "";
  const blob = await apiRequestBlob(`/api/admin/cartes/export/${qs}`);
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = lot ? `cartes_fahimta_${lot}.csv` : "cartes_fahimta.csv";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}
