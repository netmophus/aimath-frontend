/**
 * Logique pure des formulaires /login et /register, extraite telle quelle des
 * composants pour pouvoir être testée (environnement Vitest sans DOM). Aucun
 * comportement n'a changé : mêmes messages, mêmes règles, mêmes redirections.
 */

import { ApiError, type Role } from "@/lib/api";
import { TELEPHONE_RE } from "@/lib/telephone";

// Record<Role, string> (pas Partial) : TypeScript force une entrée pour CHAQUE
// valeur du type Role — un rôle ajouté côté API sans être ajouté ici casse le
// build plutôt que de planter silencieusement en production.
export const REDIRECTION_PAR_ROLE: Record<Role, string> = {
  admin: "/admin",
  enseignant: "/enseignant",
  eleve: "/eleve",
  partenaire: "/partenaire",
  // Pas encore d'espace vendeur — route réservée.
  vendeur: "/vendeur",
};

/** Destination après connexion ; "/" reste une destination sûre si le rôle est inattendu. */
export function redirectionApresConnexion(data: { role: Role; doit_changer_mdp?: boolean }): string {
  return data.doit_changer_mdp ? "/changer-mot-de-passe" : (REDIRECTION_PAR_ROLE[data.role] ?? "/");
}

/** Message affiché pour une erreur de connexion (403 : message de l'API ; 401 : identifiants). */
export function messageErreurConnexion(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return error.message;
    if (error.status === 401) return "Téléphone ou mot de passe incorrect.";
    return "Une erreur est survenue. Réessaie dans un instant.";
  }
  return "Impossible de contacter le serveur. Vérifie ta connexion.";
}

export interface ErreursInscription {
  prenom?: string;
  nom?: string;
  telephone?: string;
  cycle?: string;
  niveau?: string;
  serie?: string;
  motDePasse?: string;
  confirmation?: string;
}

export interface ValeursInscription {
  prenom: string;
  nom: string;
  /** Numéro complet déjà construit (« +227… »), ou chaîne vide. */
  telephone: string;
  cycleId: string;
  niveauId: string;
  serieId: string;
  needsSerie: boolean;
  motDePasse: string;
  confirmation: string;
}

/** Validation côté client de l'inscription (mêmes règles et mêmes messages qu'avant). */
export function validerInscription(v: ValeursInscription): ErreursInscription {
  const erreurs: ErreursInscription = {};
  if (!v.prenom.trim()) erreurs.prenom = "Indique ton prénom.";
  if (!v.nom.trim()) erreurs.nom = "Indique ton nom.";
  if (!v.telephone) {
    erreurs.telephone = "Indique ton numéro de téléphone.";
  } else if (!TELEPHONE_RE.test(v.telephone)) {
    erreurs.telephone = "Le numéro doit être au format +227 suivi de 8 chiffres (ex. +22790000000).";
  }
  if (!v.cycleId) erreurs.cycle = "Choisis ton cycle.";
  if (v.cycleId && !v.niveauId) erreurs.niveau = "Choisis ton niveau.";
  if (v.needsSerie && !v.serieId) erreurs.serie = "Choisis ta série.";
  if (!v.motDePasse) {
    erreurs.motDePasse = "Choisis un mot de passe.";
  } else if (v.motDePasse.length < 8) {
    erreurs.motDePasse = "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (!v.confirmation) {
    erreurs.confirmation = "Confirme ton mot de passe.";
  } else if (v.confirmation !== v.motDePasse) {
    erreurs.confirmation = "Les mots de passe ne correspondent pas.";
  }
  return erreurs;
}

/**
 * Traduit le corps d'erreur 400 de l'API (InscriptionEleveSerializer) en erreurs
 * par champ — une clé DRF peut porter une chaîne ou une liste de messages.
 */
export function erreursDepuisApi(body: unknown): ErreursInscription {
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;

  function premierMessage(valeur: unknown): string | undefined {
    if (typeof valeur === "string") return valeur;
    if (Array.isArray(valeur) && typeof valeur[0] === "string") return valeur[0];
    return undefined;
  }

  const resultat: ErreursInscription = {};
  const prenom = premierMessage(record.prenom);
  if (prenom) resultat.prenom = prenom;
  const nom = premierMessage(record.nom);
  if (nom) resultat.nom = nom;
  const telephone = premierMessage(record.telephone);
  if (telephone) resultat.telephone = telephone;
  const motDePasse = premierMessage(record.password);
  if (motDePasse) resultat.motDePasse = motDePasse;
  const confirmation = premierMessage(record.password2);
  if (confirmation) resultat.confirmation = confirmation;
  const niveau = premierMessage(record.niveau);
  if (niveau) resultat.niveau = niveau;
  const serie = premierMessage(record.serie);
  if (serie) resultat.serie = serie;
  return resultat;
}
