import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";
import {
  attenteDemandee,
  codeComplet,
  detailsMotDePasse,
  extraireCode,
  formaterDelai,
  messageErreurRecuperation,
  validerNouveauMotDePasse,
} from "@/lib/motDePasse";

describe("code de vérification", () => {
  it("garde 6 chiffres au plus, ignore le reste", () => {
    expect(extraireCode("123456")).toBe("123456");
    expect(extraireCode("123 456")).toBe("123456");
    expect(extraireCode("12-34-56")).toBe("123456");
    expect(extraireCode("abc12")).toBe("12");
    expect(extraireCode("12345678")).toBe("123456");
    expect(extraireCode("")).toBe("");
  });

  it("code complet seulement à 6 chiffres", () => {
    expect(codeComplet("123456")).toBe(true);
    expect(codeComplet("12345")).toBe(false);
    expect(codeComplet("12345a")).toBe(false);
  });
});

describe("délai de renvoi", () => {
  it("formate les secondes", () => {
    expect(formaterDelai(45)).toBe("45 s");
    expect(formaterDelai(60)).toBe("1 min");
    expect(formaterDelai(65)).toBe("1 min 05 s");
    expect(formaterDelai(-3)).toBe("0 s");
  });
});

describe("messages d'erreur", () => {
  it("429 avec attente", () => {
    const e = new ApiError(429, "x", { retry_after: 125 });
    expect(attenteDemandee(e)).toBe(125);
    expect(messageErreurRecuperation(e)).toBe("Trop de tentatives. Réessaie dans 2 min 05 s.");
  });

  it("429 sans attente et 503", () => {
    expect(messageErreurRecuperation(new ApiError(429, "x", {}))).toContain("quelques minutes");
    expect(messageErreurRecuperation(new ApiError(503, "x", {}))).toBe(
      "Le service d'envoi du code est temporairement indisponible. Réessaie dans quelques minutes.",
    );
  });

  it("détails de validation du mot de passe", () => {
    const e = new ApiError(400, "Mot de passe refusé.", { details: ["Trop courant."] });
    expect(detailsMotDePasse(e)).toEqual(["Trop courant."]);
    expect(messageErreurRecuperation(e)).toBe("Trop courant.");
  });

  it("erreur réseau", () => {
    expect(messageErreurRecuperation(new Error("boom"))).toContain("connexion");
  });

  it("message serveur conservé sinon", () => {
    expect(messageErreurRecuperation(new ApiError(400, "Code invalide ou expiré.", {}))).toBe("Code invalide ou expiré.");
  });
});

describe("nouveau mot de passe", () => {
  it("valide longueur et confirmation", () => {
    expect(validerNouveauMotDePasse("", "")).not.toBeNull();
    expect(validerNouveauMotDePasse("court", "court")).toContain("8 caractères");
    expect(validerNouveauMotDePasse("Assez-long-1", "Autre-long-1")).toContain("ne correspondent pas");
    expect(validerNouveauMotDePasse("Assez-long-1", "Assez-long-1")).toBeNull();
  });
});
