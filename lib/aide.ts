/** Règles pures de la rubrique Aide (aucun appel réseau) : types, statuts, validations et libellés. */

export type TypeDemande = "question" | "erreur" | "suggestion";
export type StatutDemande = "recue" | "en_cours" | "traitee";

export const MESSAGE_MAX = 1000;
export const IMAGE_MAX_OCTETS = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export const TYPES: readonly TypeDemande[] = ["question", "erreur", "suggestion"];

export const LIBELLE_TYPE: Record<TypeDemande, string> = {
  question: "Question",
  erreur: "Erreur",
  suggestion: "Suggestion",
};

export const LIBELLE_STATUT: Record<StatutDemande, string> = {
  recue: "Reçue",
  en_cours: "En cours",
  traitee: "Traitée",
};

export function typeValide(valeur: string | null | undefined): TypeDemande | null {
  return TYPES.find((t) => t === valeur) ?? null;
}

/** « Mathématiques » s'affiche « Maths » dans toute l'interface ; la valeur technique n'est jamais modifiée. */
export function libelleMatiere(nom: string): string {
  return nom.replace(/\bMath[ée]matiques\b/gi, "Maths");
}

export function messageNettoye(message: string): string {
  return message.trim();
}

export function erreurMessage(message: string): string | null {
  if (!message.trim()) return "Écris ton message.";
  if (message.length > MESSAGE_MAX) return `${MESSAGE_MAX} caractères maximum.`;
  return null;
}

/** Contrôle côté navigateur seulement pour guider l'élève : le serveur refait toujours la vérification complète. */
export function erreurImage(fichier: { size: number; type: string }): string | null {
  if (!(IMAGE_TYPES as readonly string[]).includes(fichier.type)) return "Format refusé. Utilise JPG, PNG ou WebP.";
  if (fichier.size > IMAGE_MAX_OCTETS) return "Image trop lourde (5 Mo max).";
  if (fichier.size === 0) return "Image vide.";
  return null;
}

export function resume(message: string, max = 90): string {
  const plat = message.replace(/\s+/g, " ").trim();
  return plat.length <= max ? plat : `${plat.slice(0, max - 1).trimEnd()}…`;
}

export function dateFr(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function nouvelleCle(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Une demande « Traitée » n'a pas forcément de réponse écrite : le statut et la réponse sont distincts. */
export function etatReponse(d: { statut: StatutDemande; a_reponse: boolean }): string {
  if (d.a_reponse) return "Réponse reçue";
  if (d.statut === "traitee") return "Traitée sans message";
  return "Pas encore de réponse";
}
