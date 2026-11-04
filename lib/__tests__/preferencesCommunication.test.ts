import { describe, expect, it } from "vitest";

import { accordParentalRequis, messageInvitation } from "../preferencesCommunication";
import type { MesPreferences } from "../preferencesCommunicationApi";

const base: MesPreferences = {
  sms_facultatifs: true,
  invitations_whatsapp: null,
  majorite: "majeur",
  parental_statut: "aucun",
  parental_telephone: "",
  invitation_possible: false,
};

describe("messageInvitation", () => {
  it("l'absence de réponse n'est jamais un consentement", () => {
    expect(messageInvitation(base)).toMatch(/aucune invitation/);
    expect(messageInvitation({ ...base, invitations_whatsapp: false })).toMatch(/refusé/);
  });

  it("un majeur qui accepte est invitable", () => {
    expect(messageInvitation({ ...base, invitations_whatsapp: true })).toBe("Tu acceptes les invitations.");
  });

  it("un mineur doit passer par la vérification parentale", () => {
    const m = { ...base, invitations_whatsapp: true, majorite: "mineur" as const };
    expect(messageInvitation(m)).toMatch(/nécessaire/);
    expect(messageInvitation({ ...m, parental_statut: "demande" })).toMatch(/en cours de vérification/);
    expect(messageInvitation({ ...m, parental_statut: "valide" })).toMatch(/a été vérifié/);
    expect(messageInvitation({ ...m, parental_statut: "refuse" })).toMatch(/pas pu être vérifié/);
  });

  it("âge inconnu : demande de renseigner la date de naissance", () => {
    expect(messageInvitation({ ...base, invitations_whatsapp: true, majorite: "inconnue" })).toMatch(/date de naissance/);
    expect(accordParentalRequis({ majorite: "inconnue" })).toBe(true);
    expect(accordParentalRequis({ majorite: "majeur" })).toBe(false);
  });
});
