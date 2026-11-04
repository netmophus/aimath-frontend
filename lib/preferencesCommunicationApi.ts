import { apiRequest } from "./api";

export type StatutParental = "aucun" | "demande" | "valide" | "refuse";
export type Majorite = "majeur" | "mineur" | "inconnue";

export interface MesPreferences {
  sms_facultatifs: boolean;
  /** null = jamais répondu : ce n'est PAS un consentement. */
  invitations_whatsapp: boolean | null;
  majorite: Majorite;
  parental_statut: StatutParental;
  /** Numéro du parent, masqué côté élève. */
  parental_telephone: string;
  invitation_possible: boolean;
}

export const getMesPreferences = () => apiRequest<MesPreferences>("/api/eleve/communication/preferences/");

export const majMesPreferences = (d: { sms_facultatifs?: boolean; invitations_whatsapp?: boolean; parental_telephone?: string }) =>
  apiRequest<MesPreferences>("/api/eleve/communication/preferences/", { method: "PATCH", body: d });

// ----- Administrateur : accords parentaux à vérifier
export interface DemandeParentale {
  utilisateur_id: number;
  nom: string;
  parental_telephone: string;
  demande_le: string | null;
  majorite: Majorite;
}

export type MethodeParentale = "appel" | "formulaire" | "presence";

export const demandesParentales = () => apiRequest<DemandeParentale[]>("/api/admin/communications/consentements-parentaux/");

export const deciderParental = (id: number, d: { decision: "valider" | "refuser" | "revoquer"; methode?: MethodeParentale; note?: string }) =>
  apiRequest<unknown>(`/api/admin/communications/utilisateurs/${id}/consentement-parental/`, { method: "POST", body: d });
