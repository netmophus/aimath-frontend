import { afterEach, describe, expect, it, vi } from "vitest";

import { majProfilEleve, type ProfilEleve } from "@/lib/eleveApi";
import { aDesModifications, champsModifies, classeDe, initiales } from "@/lib/profil";

const PROFIL: ProfilEleve = {
  id: 1, telephone: "+22790000001", email: null, prenom: "Aïcha", nom: "Fictive", role: "eleve", statut: "actif",
  niveau: "Terminale", serie: "D", date_inscription: "2026-01-01", date_naissance: "2008-03-12", ecole: "Lycée Kassaï",
  ville: "Niamey", genre: "F", photo_url: null,
};
const IDENTIQUES = { dateNaissance: "2008-03-12", ecole: "Lycée Kassaï", ville: "Niamey", genre: "F" as const };

describe("champs modifiés du profil", () => {
  it("rien de modifié : rien n'est envoyé", () => {
    const modifs = champsModifies(PROFIL, IDENTIQUES, null);
    expect(modifs).toEqual({});
    expect(aDesModifications(modifs)).toBe(false);
  });

  it("seuls les champs changés sont envoyés (les autres ne sont jamais écrasés)", () => {
    expect(champsModifies(PROFIL, { ...IDENTIQUES, ville: "Zinder" }, null)).toEqual({ ville: "Zinder" });
    expect(champsModifies(PROFIL, { ...IDENTIQUES, dateNaissance: "2008-04-01", genre: "M" }, null)).toEqual({ date_naissance: "2008-04-01", genre: "M" });
  });

  it("valeurs techniques du genre inchangées (F, M, autre, vide)", () => {
    expect(champsModifies(PROFIL, { ...IDENTIQUES, genre: "autre" }, null).genre).toBe("autre");
    expect(champsModifies(PROFIL, { ...IDENTIQUES, genre: "" }, null).genre).toBe("");
  });

  it("un profil sans valeurs : un champ resté vide n'est pas envoyé", () => {
    const vide = { ...PROFIL, date_naissance: null, ecole: null, ville: null, genre: null };
    expect(champsModifies(vide, { dateNaissance: "", ecole: "", ville: "", genre: "" }, null)).toEqual({});
    expect(champsModifies(vide, { dateNaissance: "", ecole: "", ville: "Niamey", genre: "" }, null)).toEqual({ ville: "Niamey" });
  });

  it("une nouvelle photo est envoyée même si rien d'autre ne change", () => {
    const photo = new File(["x"], "p.png", { type: "image/png" });
    const modifs = champsModifies(PROFIL, IDENTIQUES, photo);
    expect(modifs).toEqual({ photo });
    expect(aDesModifications(modifs)).toBe(true);
  });

  it("classe et initiales", () => {
    expect(classeDe(PROFIL)).toBe("Terminale D");
    expect(classeDe({ niveau: "3ème", serie: null })).toBe("3ème");
    expect(classeDe({ niveau: null, serie: null })).toBeNull();
    expect(initiales("Aïcha", "Fictive")).toBe("AF");
    expect(initiales("", "")).toBe("?");
  });
});

describe("majProfilEleve n'envoie que les champs fournis", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("PATCH multipart sans les champs absents", async () => {
    let corps: FormData | null = null;
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      corps = init.body as FormData;
      return new Response(JSON.stringify(PROFIL), { status: 200, headers: { "Content-Type": "application/json" } });
    }));
    await majProfilEleve({ ville: "Zinder" });
    expect([...(corps as unknown as FormData).keys()]).toEqual(["ville"]);
    expect((corps as unknown as FormData).get("ville")).toBe("Zinder");
  });
});
