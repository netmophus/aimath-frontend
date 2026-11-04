import { afterEach, describe, expect, it, vi } from "vitest";

import { erreurImage, erreurMessage, etatReponse, libelleMatiere, MESSAGE_MAX, resume, typeValide } from "@/lib/aide";
import { creerDemande } from "@/lib/aideApi";

describe("règles de l'Aide", () => {
  it("type présélectionné : seuls les trois types sont acceptés", () => {
    expect(typeValide("erreur")).toBe("erreur");
    expect(typeValide("suggestion")).toBe("suggestion");
    expect(typeValide("admin")).toBeNull();
    expect(typeValide(undefined)).toBeNull();
  });

  it("message : vide, espaces seuls et trop long refusés", () => {
    expect(erreurMessage("")).not.toBeNull();
    expect(erreurMessage("   \n ")).not.toBeNull();
    expect(erreurMessage("a".repeat(MESSAGE_MAX + 1))).not.toBeNull();
    expect(erreurMessage("a".repeat(MESSAGE_MAX))).toBeNull();
  });

  it("image : JPG, PNG, WebP jusqu'à 5 Mo", () => {
    expect(erreurImage({ type: "image/png", size: 1000 })).toBeNull();
    expect(erreurImage({ type: "image/webp", size: 5 * 1024 * 1024 })).toBeNull();
    expect(erreurImage({ type: "image/gif", size: 1000 })).toMatch(/Format/);
    expect(erreurImage({ type: "application/pdf", size: 1000 })).toMatch(/Format/);
    expect(erreurImage({ type: "image/png", size: 5 * 1024 * 1024 + 1 })).toMatch(/lourde/);
  });

  it("libellés : Maths et résumé", () => {
    expect(libelleMatiere("Mathématiques")).toBe("Maths");
    expect(libelleMatiere("Physique")).toBe("Physique");
    expect(resume("a ".repeat(100)).length).toBeLessThanOrEqual(90);
    expect(resume("  court \n texte ")).toBe("court texte");
  });

  it("statut et réponse sont distincts", () => {
    expect(etatReponse({ statut: "traitee", a_reponse: false })).toBe("Traitée sans message");
    expect(etatReponse({ statut: "traitee", a_reponse: true })).toBe("Réponse reçue");
    expect(etatReponse({ statut: "recue", a_reponse: false })).toBe("Pas encore de réponse");
  });
});

describe("creerDemande", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("n'envoie que les champs renseignés (matière et leçon facultatives)", async () => {
    let corps: FormData | null = null;
    vi.stubGlobal("fetch", vi.fn(async (_u: string, init: RequestInit) => {
      corps = init.body as FormData;
      return new Response("{}", { status: 201, headers: { "Content-Type": "application/json" } });
    }));
    await creerDemande({ cle: "abcdefgh", type: "suggestion", programme: null, lecon: null, message: "Idée", image: null });
    expect([...(corps as unknown as FormData).keys()].sort()).toEqual(["cle", "message", "type"]);
    const image = new File(["x"], "a.png", { type: "image/png" });
    await creerDemande({ cle: "abcdefgh", type: "question", programme: 3, lecon: 9, message: "Q", image });
    expect([...(corps as unknown as FormData).keys()].sort()).toEqual(["cle", "lecon", "message", "piece_jointe", "programme", "type"]);
  });
});
