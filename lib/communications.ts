/** Règles pures du module de communication (aucun appel réseau). Le serveur reste l'autorité : ces
 * calculs ne servent qu'à guider l'administrateur pendant la saisie. */

export type TypeCommunication = "sms" | "invitation_whatsapp" | "activation";
export type ModeCible = "ids" | "filtres" | "tous";
export type StatutIndicateur = "non_envoye" | "en_attente" | "envoye" | "echec" | "incertain";

export const TEXTE_MAX = 480;
export const SEGMENTS_MAX = 6;

const BASE = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const ETENDU = "^{}\\[~]|€\f";

export interface Comptage {
  caracteres: number;
  unicode: boolean;
  segments: number;
}

/** Même règle que le backend : GSM-7 (160/153) ou Unicode (70/67). */
export function compter(texte: string): Comptage {
  if (!texte) return { caracteres: 0, unicode: false, segments: 0 };
  const caracteres = Array.from(texte);
  const gsm = caracteres.every((c) => BASE.includes(c) || ETENDU.includes(c));
  if (gsm) {
    const unites = caracteres.reduce((n, c) => n + (ETENDU.includes(c) ? 2 : 1), 0);
    return { caracteres: caracteres.length, unicode: false, segments: unites <= 160 ? 1 : Math.ceil(unites / 153) };
  }
  const unites = texte.length; // unités UTF-16, comme le backend
  return { caracteres: caracteres.length, unicode: true, segments: unites <= 70 ? 1 : Math.ceil(unites / 67) };
}

/** Coût indicatif d'un message (null si le tarif est inconnu). */
export function coutEstime(segments: number, tarif: number | null): number | null {
  return tarif === null ? null : segments * tarif;
}

export function formatFcfa(valeur: number | string | null | undefined): string {
  if (valeur === null || valeur === undefined || valeur === "") return "inconnu";
  const n = Number(valeur);
  if (Number.isNaN(n)) return "inconnu";
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(n)} FCFA`;
}

export const LIBELLE_TYPE: Record<TypeCommunication, string> = {
  sms: "SMS",
  invitation_whatsapp: "Invitation WhatsApp",
  activation: "Activation de compte",
};

export const LIBELLE_STATUT_CAMPAGNE: Record<string, string> = {
  apercu: "Aperçu",
  en_cours: "En cours",
  terminee: "Terminée",
  arretee: "Arrêtée",
};

export type ReglagesValides = { ok: true; plafond: number; tarif: number | null } | { ok: false; erreur: string };

/**
 * Valide les réglages saisis : plafond entier >= 0 (0 bloque les envois), tarif strictement positif ou vide (inconnu).
 * Une saisie invalide n'est jamais convertie en silence en 0 ou en « tarif inconnu ».
 */
export function validerReglages(plafond: string, tarif: string): ReglagesValides {
  const p = plafond.trim();
  if (!/^\d+$/.test(p)) return { ok: false, erreur: "Le plafond mensuel doit être un nombre entier de FCFA, 0 ou plus." };
  const t = tarif.trim().replace(",", ".");
  if (t === "") return { ok: true, plafond: Number(p), tarif: null };
  if (!/^\d+(\.\d{1,2})?$/.test(t) || Number(t) <= 0) {
    return { ok: false, erreur: "Le tarif d'un segment doit être strictement positif (deux décimales au plus)." };
  }
  return { ok: true, plafond: Number(p), tarif: Number(t) };
}

export type EtatCampagne = "apercu" | "en_attente" | "en_cours" | "terminee" | "arretee";

export interface EtatAffiche {
  code: EtatCampagne;
  libelle: string;
  /** Phrase d'explication : une campagne confirmée n'est JAMAIS présentée comme envoyée. */
  aide: string;
}

/**
 * État affiché d'une campagne, déduit du statut serveur ET des statuts détaillés des messages.
 * « En attente » = confirmée mais aucun message n'est encore parti (aucun worker n'a tourné).
 * « Terminée » = plus rien à traiter, pas « tout a été envoyé » : le détail (acceptés, échecs, incertains) reste affiché.
 */
export function etatCampagne(c: { statut: string; messages: Record<string, number> }): EtatAffiche {
  const m = c.messages;
  const traites = (m.accepte ?? 0) + (m.echec ?? 0) + (m.incertain ?? 0) + (m.ignore ?? 0) + (m.annule ?? 0);
  switch (c.statut) {
    case "apercu":
      return { code: "apercu", libelle: "Aperçu", aide: "Rien n'est parti : l'envoi n'a pas été confirmé." };
    case "arretee":
      return { code: "arretee", libelle: "Arrêtée", aide: "Arrêtée par un administrateur. Les messages non traités ne partiront pas." };
    case "terminee":
      return { code: "terminee", libelle: "Terminée", aide: "Plus aucun message à traiter. Consulte le détail : acceptés, échecs, incertains." };
    default:
      if ((m.en_cours ?? 0) === 0 && traites === 0) {
        return { code: "en_attente", libelle: "En attente", aide: "Confirmée, mais aucun message n'est encore parti. Ils partent quand le worker est démarré." };
      }
      return { code: "en_cours", libelle: "En cours", aide: "Le traitement a commencé. Certains messages sont encore en attente." };
  }
}

export const LIBELLE_STATUT_MESSAGE: Record<string, string> = {
  en_attente: "En attente",
  en_cours: "Envoi en cours",
  accepte: "Accepté par le fournisseur",
  echec: "Échec",
  incertain: "Résultat incertain",
  ignore: "Ignoré",
  annule: "Annulé",
};

export const LIBELLE_EXCLUSION: Record<string, string> = {
  statut_non_actif: "Compte non actif",
  numero_invalide: "Numéro invalide",
  opposition: "Opposés aux messages facultatifs",
  consentement_requis: "Sans consentement explicite aux invitations",
  consentement_parental_requis: "Mineurs sans accord parental vérifié",
  doublon: "Doublons (même numéro)",
};

export const LIBELLE_INDICATEUR: Record<StatutIndicateur, string> = {
  non_envoye: "SMS non envoyé",
  en_attente: "SMS en attente",
  envoye: "SMS envoyé",
  echec: "SMS en échec",
  incertain: "SMS à vérifier",
};

export const TEXTE_ACTIVATION =
  "Bonjour, votre compte FAHIMTA est activé. Connectez-vous sur myfahimta.com pour accéder à votre espace.";

/** Variables reconnues par le serveur : toute autre est refusée. */
export function variablesInconnues(texte: string): string[] {
  const noms = [...texte.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]);
  return noms.filter((n) => n !== "prenom" && n !== "lien");
}

/** Erreur de saisie évidente, avant l'appel serveur (qui refait toujours le contrôle). */
export function erreurTexte(texte: string, type: TypeCommunication): string | null {
  const t = texte.trim();
  if (!t) return "Écris le message.";
  if (t.length > TEXTE_MAX) return `${TEXTE_MAX} caractères maximum.`;
  const inconnues = variablesInconnues(t);
  if (inconnues.length) return `Variable inconnue : {${inconnues[0]}}. Seules {prenom} et {lien} existent.`;
  if (type === "invitation_whatsapp" && !t.includes("{lien}")) return "L'invitation doit contenir {lien}.";
  if (type !== "invitation_whatsapp" && t.includes("{lien}")) return "{lien} est réservé à l'invitation WhatsApp.";
  return null;
}

export function nouvelleCleCommunication(): string {
  const c = globalThis.crypto;
  return c?.randomUUID ? c.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Regroupe l'état de sélection de la page Utilisateurs. */
export interface Selection {
  ids: number[];
  /** true = « tous les résultats filtrés » (le serveur recalcule les comptes à partir des filtres). */
  tousLesFiltres: boolean;
}

export function nombreSelectionne(selection: Selection, totalFiltre: number): number {
  return selection.tousLesFiltres ? totalFiltre : selection.ids.length;
}

export function basculerId(ids: readonly number[], id: number): number[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
}

/** Ajoute (ou retire) tous les identifiants de la page, sans toucher aux sélections des autres pages. */
export function basculerPage(ids: readonly number[], idsPage: readonly number[]): number[] {
  const toutes = idsPage.length > 0 && idsPage.every((id) => ids.includes(id));
  return toutes ? ids.filter((id) => !idsPage.includes(id)) : [...new Set([...ids, ...idsPage])];
}
