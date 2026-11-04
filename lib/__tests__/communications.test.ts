import { describe, expect, it } from "vitest";

import {
  basculerId,
  basculerPage,
  compter,
  coutEstime,
  erreurTexte,
  etatCampagne,
  formatFcfa,
  nombreSelectionne,
  nouvelleCleCommunication,
  validerReglages,
  TEXTE_ACTIVATION,
  variablesInconnues,
} from "../communications";

describe("compter (segmentation SMS)", () => {
  it("GSM-7 : 160 caractères = 1 segment, 161 = 2", () => {
    expect(compter("a".repeat(160)).segments).toBe(1);
    expect(compter("a".repeat(161)).segments).toBe(2);
    expect(compter("é".repeat(160)).unicode).toBe(false);
  });

  it("un caractère hors GSM-7 passe tout le message en Unicode", () => {
    const c = compter("Bonjour ê");
    expect(c.unicode).toBe(true);
    expect(compter("ê".repeat(71)).segments).toBe(2);
  });

  it("les caractères étendus comptent double", () => {
    expect(compter("{".repeat(81)).segments).toBe(2);
  });

  it("un texte vide n'a aucun segment", () => {
    expect(compter("")).toEqual({ caracteres: 0, unicode: false, segments: 0 });
  });
});

describe("coût et format", () => {
  it("coût inconnu si le tarif est inconnu", () => {
    expect(coutEstime(3, null)).toBeNull();
    expect(coutEstime(3, 10)).toBe(30);
    expect(formatFcfa(null)).toBe("inconnu");
    expect(formatFcfa("20.00")).toContain("FCFA");
  });
});

describe("validation du texte", () => {
  it("refuse les variables inconnues", () => {
    expect(variablesInconnues("Bonjour {prenom} {nom} {lien}")).toEqual(["nom"]);
    expect(erreurTexte("Salut {nom}", "sms")).toMatch(/inconnue/);
  });

  it("{lien} réservé à l'invitation, et obligatoire dedans", () => {
    expect(erreurTexte("Rejoins {lien}", "sms")).toMatch(/réservé/);
    expect(erreurTexte("Rejoins-nous", "invitation_whatsapp")).toMatch(/doit contenir/);
    expect(erreurTexte("Rejoins {lien}", "invitation_whatsapp")).toBeNull();
  });

  it("texte vide ou trop long refusé, modèle d'activation accepté", () => {
    expect(erreurTexte("   ", "sms")).not.toBeNull();
    expect(erreurTexte("x".repeat(481), "sms")).not.toBeNull();
    expect(erreurTexte(TEXTE_ACTIVATION, "activation")).toBeNull();
  });
});

describe("sélection par identifiants réels", () => {
  it("bascule un identifiant sans dépendre de la position", () => {
    expect(basculerId([5, 9], 7)).toEqual([5, 9, 7]);
    expect(basculerId([5, 9, 7], 9)).toEqual([5, 7]);
  });

  it("sélectionner la page conserve les autres pages, la rebasculer ne retire que la page", () => {
    const apres = basculerPage([1, 2], [10, 11, 12]);
    expect(apres).toEqual([1, 2, 10, 11, 12]);
    expect(basculerPage(apres, [10, 11, 12])).toEqual([1, 2]);
    expect(basculerPage([], [])).toEqual([]);
  });

  it("le compteur distingue la page cochée et « tous les résultats filtrés »", () => {
    expect(nombreSelectionne({ ids: [1, 2, 3], tousLesFiltres: false }, 250)).toBe(3);
    expect(nombreSelectionne({ ids: [1, 2, 3], tousLesFiltres: true }, 250)).toBe(250);
  });
});

describe("clé d'idempotence", () => {
  it("est unique et assez longue pour le serveur", () => {
    const a = nouvelleCleCommunication();
    expect(a.length).toBeGreaterThanOrEqual(8);
    expect(a).not.toBe(nouvelleCleCommunication());
  });
});

describe("etatCampagne : une campagne confirmée n'est jamais « envoyée »", () => {
  const vide = { en_attente: 0, en_cours: 0, accepte: 0, echec: 0, incertain: 0, ignore: 0, annule: 0 };

  it("confirmée sans aucun message traité : En attente (le worker n'a pas tourné)", () => {
    const e = etatCampagne({ statut: "en_cours", messages: { ...vide, en_attente: 5 } });
    expect(e.libelle).toBe("En attente");
    expect(e.aide).toMatch(/pas encore parti|aucun message n'est encore parti/);
  });

  it("dès qu'un message est traité ou en vol : En cours", () => {
    expect(etatCampagne({ statut: "en_cours", messages: { ...vide, en_attente: 4, accepte: 1 } }).libelle).toBe("En cours");
    expect(etatCampagne({ statut: "en_cours", messages: { ...vide, en_attente: 4, en_cours: 1 } }).libelle).toBe("En cours");
  });

  it("Terminée ne dit pas que tout est envoyé", () => {
    const e = etatCampagne({ statut: "terminee", messages: { ...vide, echec: 3 } });
    expect(e.libelle).toBe("Terminée");
    expect(e.aide).not.toMatch(/envoy/i);
  });

  it("aperçu et arrêtée gardent leur sens", () => {
    expect(etatCampagne({ statut: "apercu", messages: vide }).aide).toMatch(/Rien n'est parti/);
    expect(etatCampagne({ statut: "arretee", messages: vide }).libelle).toBe("Arrêtée");
  });
});

describe("validerReglages", () => {
  it("accepte 15 FCFA et 15 000 FCFA", () => {
    expect(validerReglages("15000", "15")).toEqual({ ok: true, plafond: 15000, tarif: 15 });
    expect(validerReglages("15000", "12,5")).toEqual({ ok: true, plafond: 15000, tarif: 12.5 });
  });

  it("le plafond nul est valide (il bloque les envois), négatif ou non numérique refusé", () => {
    expect(validerReglages("0", "15")).toEqual({ ok: true, plafond: 0, tarif: 15 });
    expect(validerReglages("-1", "15").ok).toBe(false);
    expect(validerReglages("abc", "15").ok).toBe(false);
    expect(validerReglages("", "15").ok).toBe(false);
  });

  it("le tarif doit être strictement positif ; vide = inconnu", () => {
    expect(validerReglages("100", "0").ok).toBe(false);
    expect(validerReglages("100", "-3").ok).toBe(false);
    expect(validerReglages("100", "abc").ok).toBe(false);
    expect(validerReglages("100", "1.234").ok).toBe(false);
    expect(validerReglages("100", "")).toEqual({ ok: true, plafond: 100, tarif: null });
  });
});
