import { ApiError } from "./api";

/**
 * Fonctionnalité « Résoudre mon exercice » — logique commune aux cartes du
 * dashboard, de la page matière et de la page /eleve/resoudre : quelles
 * matières sont concernées, leur libellé et leur texte d'accroche, et l'URL
 * de destination. Aucun identifiant n'est écrit en dur : les programmes
 * viennent toujours de l'API (voir getMonProgramme / getProgrammeEleve).
 */

export type MatiereResolvable = "maths" | "physique" | "chimie" | "svt";

/** Ordre d'affichage des quatre matières. */
export const ORDRE_MATIERES_RESOLVABLES: readonly MatiereResolvable[] = ["maths", "physique", "chimie", "svt"];

export const LIBELLE_MATIERE_RESOLVABLE: Record<MatiereResolvable, string> = {
  maths: "Mathématiques",
  physique: "Physique",
  chimie: "Chimie",
  svt: "SVT",
};

/** Texte d'accroche de la carte, adapté à la matière. */
export const ACCROCHE_MATIERE_RESOLVABLE: Record<MatiereResolvable, string> = {
  maths: "Bloqué sur un exercice de maths ? Photographie-le et suis la résolution pas à pas.",
  physique: "Un problème de physique t'échappe ? Envoie ton énoncé et comprends la démarche.",
  chimie: "Une réaction ou un calcul de chimie à résoudre ? Dépose ton exercice et avance avec la méthode.",
  svt: "Une question de SVT à traiter ? Envoie ton exercice et construis ta réponse étape par étape.",
};

function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Reconnaît la matière d'après son nom en base (« Mathématiques », « SVT »…) ; null si hors périmètre. */
export function matiereResolvable(nomMatiere: string): MatiereResolvable | null {
  const nom = normaliser(nomMatiere);
  if (nom.startsWith("math")) return "maths";
  if (nom.startsWith("phys")) return "physique";
  if (nom.startsWith("chim")) return "chimie";
  if (nom === "svt" || nom.startsWith("sciences de la vie")) return "svt";
  return null;
}

/** Destination du bouton « Commencer » : la page de dépôt, pour un programme donné. */
export function hrefResoudre(programmeId: number): string {
  return `/eleve/resoudre?programme=${programmeId}`;
}

// --- Dépôt d'un exercice (étape 2 : validation côté navigateur uniquement) ---

export const TYPES_IMAGE_ACCEPTES = ["image/jpeg", "image/png", "image/webp"] as const;
export const TYPE_PDF = "application/pdf";

/** Valeur de l'attribut `accept` du sélecteur de fichiers (images + PDF). */
export const ACCEPT_IMPORT = [...TYPES_IMAGE_ACCEPTES, TYPE_PDF].join(",");

export const TAILLE_MAX_FICHIER_OCTETS = 10 * 1024 * 1024; // 10 Mo par image ou PDF
/** Plafond global pour un exercice (toutes pages confondues) ; le serveur le revérifie. */
export const TAILLE_MAX_TOTAL_OCTETS = 20 * 1024 * 1024;
export const NB_MAX_IMAGES = 6; // pages photographiées ou importées
export const LONGUEUR_MAX_ENONCE = 4000;
export const LONGUEUR_MAX_CORRECTION = 1000;

/** Le service de lecture refuse une image de plus de 5 Mo : au-delà de ce seuil
 * (avec une marge), l'image est réduite avant l'envoi (voir lib/reduireImage.ts). */
export const SEUIL_REDUCTION_OCTETS = 3.5 * 1024 * 1024;
export const TAILLE_MAX_IMAGE_ENVOYEE_OCTETS = 5 * 1024 * 1024;

export type ModeResolution = "correction" | "professeur";

export const MODES_RESOLUTION: readonly { valeur: ModeResolution; titre: string; description: string }[] = [
  {
    valeur: "correction",
    titre: "Correction complète",
    description: "La résolution rédigée de l'exercice, étape par étape.",
  },
  {
    valeur: "professeur",
    titre: "Professeur particulier IA",
    description: "Un accompagnement pour comprendre et trouver la solution par toi-même.",
  },
];

export function formaterTaille(octets: number): string {
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

/** Message d'erreur (français) si le fichier n'est pas accepté, sinon null. */
export function erreurFichier(fichier: File): string | null {
  const estImage = (TYPES_IMAGE_ACCEPTES as readonly string[]).includes(fichier.type);
  if (!estImage && fichier.type !== TYPE_PDF) {
    return `« ${fichier.name} » n'est pas accepté : choisis une image (JPG, PNG, WebP) ou un PDF.`;
  }
  if (fichier.size > TAILLE_MAX_FICHIER_OCTETS) {
    return `« ${fichier.name} » est trop volumineux (${formaterTaille(fichier.size)}) : 10 Mo maximum.`;
  }
  if (fichier.size === 0) {
    return `« ${fichier.name} » est vide.`;
  }
  return null;
}

// --- Envoi à l'API (étape 4) : lecture des erreurs ---

export const MESSAGE_DEPOT_VALIDE =
  "Ton exercice a été reçu et validé. La correction automatique sera disponible prochainement.";

export interface ErreurDepot {
  messages: string[];
  /** true → proposer de se reconnecter (le brouillon ne survit pas à la navigation). */
  sessionExpiree: boolean;
}

/** Toutes les chaînes d'un corps d'erreur DRF ({"fichiers": ["…", "…"]}, {"detail": "…"}), sans doublon. */
export function messagesErreurDjango(corps: unknown): string[] {
  const trouves: string[] = [];
  const parcourir = (valeur: unknown) => {
    if (typeof valeur === "string") {
      if (valeur.trim()) trouves.push(valeur.trim());
    } else if (Array.isArray(valeur)) {
      valeur.forEach(parcourir);
    } else if (valeur && typeof valeur === "object") {
      Object.values(valeur).forEach(parcourir);
    }
  };
  parcourir(corps);
  return [...new Set(trouves)].slice(0, 6);
}

/** Traduit n'importe quelle erreur d'envoi en messages français affichables. */
export function decrireErreurDepot(error: unknown): ErreurDepot {
  if (error instanceof ApiError) {
    switch (true) {
      case error.status === 401:
        return { messages: ["Ta session a expiré. Reconnecte-toi pour envoyer ton exercice."], sessionExpiree: true };
      case error.status === 400: {
        const messages = messagesErreurDjango(error.body);
        return { messages: messages.length > 0 ? messages : [error.message], sessionExpiree: false };
      }
      case error.status === 403:
        return { messages: ["Ton compte n'est pas autorisé à envoyer un exercice."], sessionExpiree: false };
      case error.status === 404:
        return { messages: ["Ce programme n'est pas accessible avec ton compte."], sessionExpiree: false };
      case error.status === 413:
        return {
          messages: ["Tes fichiers sont trop volumineux pour être envoyés en une fois : retire une page ou réduis leur taille."],
          sessionExpiree: false,
        };
      case error.status === 409: {
        const messages = messagesErreurDjango(error.body);
        return {
          messages: messages.length > 0 ? messages : ["Ton exercice est déjà en cours d'analyse. Patiente quelques secondes puis réessaie."],
          sessionExpiree: false,
        };
      }
      case error.status === 502 || error.status === 503 || error.status === 504: {
        // Le serveur renvoie ici un message français sans détail technique.
        const messages = messagesErreurDjango(error.body);
        if (messages.length > 0) return { messages, sessionExpiree: false };
        return {
          messages: ["La lecture de ton exercice n'a pas abouti. Réessaie dans un instant."],
          sessionExpiree: false,
        };
      }
      case error.status >= 500:
        return {
          messages: ["Le serveur ne répond pas correctement pour le moment. Réessaie dans un instant."],
          sessionExpiree: false,
        };
      default:
        return { messages: [error.message], sessionExpiree: false };
    }
  }
  // fetch() qui échoue (hors-ligne, serveur coupé) ou corps de réponse illisible.
  return {
    messages: ["Impossible de contacter le serveur. Vérifie ta connexion internet puis réessaie."],
    sessionExpiree: false,
  };
}

// --- Professeur particulier IA (étape 7) ---

export interface ErreurProfesseur {
  message: string;
  /** La séance n'existe plus (expirée) ou n'est plus autorisée : il faut en démarrer une nouvelle. */
  seanceExpiree: boolean;
  sessionExpiree: boolean;
}

/** Message français pour une erreur d'appel au Professeur ; jamais de détail technique. */
export function decrireErreurProfesseur(error: unknown): ErreurProfesseur {
  const neutre = { seanceExpiree: false, sessionExpiree: false };
  if (!(error instanceof ApiError)) {
    return { ...neutre, message: "Impossible de contacter le serveur. Vérifie ta connexion internet puis réessaie." };
  }
  const premier = messagesErreurDjango(error.body)[0];
  const code = (error.body as { code?: string } | null)?.code;
  if (error.status === 401) return { ...neutre, sessionExpiree: true, message: "Ta session a expiré. Reconnecte-toi pour continuer." };
  if (error.status === 404) return { ...neutre, seanceExpiree: true, message: "Cette séance a expiré. Relance le Professeur pour recommencer." };
  if (error.status === 503 && code === "professeur_desactive") {
    return { ...neutre, message: "Le Professeur particulier n'est pas encore disponible." };
  }
  if (error.status === 409 && code === "etat_obsolete") {
    return { ...neutre, message: "La séance s'est mise à jour (autre onglet ou double envoi). Vérifie l'écran puis réessaie." };
  }
  if (error.status === 409) return { ...neutre, message: "Une action est déjà en cours. Patiente un instant puis réessaie." };
  if (error.status === 429) {
    return { ...neutre, message: premier ?? "Tu as atteint la limite d'échanges pour le moment. Réessaie plus tard." };
  }
  if (error.status === 400 && premier) return { ...neutre, message: premier };
  if (error.status === 502 || error.status === 503 || error.status === 504) {
    return { ...neutre, message: premier ?? "Le professeur n'a pas pu répondre. Réessaie dans un instant." };
  }
  return { ...neutre, message: "Le serveur ne répond pas correctement pour le moment. Réessaie dans un instant." };
}
