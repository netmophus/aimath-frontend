import type { MesPreferences } from "./preferencesCommunicationApi";

export const LIBELLE_METHODE: Record<string, string> = {
  appel: "Appel au parent",
  formulaire: "Formulaire signé",
  presence: "Parent présent",
};

/** Une demande d'accord parental est utile si l'élève n'est pas majeur (âge inconnu inclus). */
export function accordParentalRequis(p: Pick<MesPreferences, "majorite">): boolean {
  return p.majorite !== "majeur";
}

/** Texte d'état de l'invitation WhatsApp : dit toujours ce qui manque, sans jamais supposer un consentement. */
export function messageInvitation(p: MesPreferences): string {
  if (p.invitations_whatsapp !== true) {
    return p.invitations_whatsapp === false ? "Tu as refusé les invitations." : "Pas encore de réponse : aucune invitation ne te sera envoyée.";
  }
  if (!accordParentalRequis(p)) return "Tu acceptes les invitations.";
  if (p.majorite === "inconnue") return "Renseigne ta date de naissance pour savoir si l'accord d'un parent est nécessaire.";
  switch (p.parental_statut) {
    case "valide":
      return "Tu acceptes les invitations et l'accord de ton parent a été vérifié.";
    case "demande":
      return "Accord de ton parent en cours de vérification par FAHIMTA. Aucune invitation ne part avant.";
    case "refuse":
      return "L'accord de ton parent n'a pas pu être vérifié. Aucune invitation ne te sera envoyée.";
    default:
      return "Un accord de ton parent ou tuteur est nécessaire avant toute invitation.";
  }
}
