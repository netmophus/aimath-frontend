/**
 * Aides pures (testées) des parcours « mot de passe oublié » et « modifier mon mot de passe ».
 * Aucun mot de passe, code ni autorisation n'est jamais écrit dans l'URL, le stockage du navigateur ou la console.
 */

import { ApiError } from "@/lib/api";

export const LONGUEUR_CODE = 6;

/** Garde uniquement les chiffres, au plus 6 : sert à la saisie, au collage (« 123 456 », « 123-456 ») et à l'autoremplissage SMS. */
export function extraireCode(saisie: string): string {
  return saisie.replace(/\D/g, "").slice(0, LONGUEUR_CODE);
}

export function codeComplet(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/** « 1 min 05 s » / « 45 s » pour le compte à rebours du renvoi. */
export function formaterDelai(secondes: number): string {
  const s = Math.max(0, Math.ceil(secondes));
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const reste = s % 60;
  return reste ? `${m} min ${String(reste).padStart(2, "0")} s` : `${m} min`;
}

function corps(error: unknown): Record<string, unknown> {
  if (error instanceof ApiError && error.body && typeof error.body === "object") {
    return error.body as Record<string, unknown>;
  }
  return {};
}

/** Secondes à attendre indiquées par le serveur (429), sinon null. */
export function attenteDemandee(error: unknown): number | null {
  const valeur = corps(error).retry_after;
  return typeof valeur === "number" && valeur > 0 ? valeur : null;
}

/** Détails de validation du mot de passe (validateurs Django), tels que renvoyés par le serveur. */
export function detailsMotDePasse(error: unknown): string[] {
  const c = corps(error);
  const liste = c.details ?? c.nouveau_mot_de_passe;
  return Array.isArray(liste) ? liste.filter((x): x is string => typeof x === "string") : [];
}

/** Message affiché à la place du texte brut du serveur : jamais d'information sur l'existence d'un compte. */
export function messageErreurRecuperation(error: unknown): string {
  if (!(error instanceof ApiError)) return "Impossible de joindre le serveur. Vérifie ta connexion et réessaie.";
  if (error.status === 429) {
    const attente = attenteDemandee(error);
    return attente
      ? `Trop de tentatives. Réessaie dans ${formaterDelai(attente)}.`
      : "Trop de tentatives. Réessaie dans quelques minutes.";
  }
  if (error.status === 503) return "Le service d'envoi du code est temporairement indisponible. Réessaie dans quelques minutes.";
  const details = detailsMotDePasse(error);
  if (details.length > 0) return details.join(" ");
  return error.message;
}

export function validerNouveauMotDePasse(nouveau: string, confirmation: string): string | null {
  if (!nouveau) return "Choisis un nouveau mot de passe.";
  if (nouveau.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (nouveau !== confirmation) return "Les deux mots de passe ne correspondent pas.";
  return null;
}
