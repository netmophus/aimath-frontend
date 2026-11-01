import { describe, expect, it } from "vitest";

import { variationsFonction } from "../variationsFonction";

describe("variationsFonction (a > 0)", () => {
  it("cinq colonnes : −∞, −√a, 0 interdit, √a, +∞", () => {
    const v = variationsFonction(2);
    expect(v.fonction).toBe("f");
    expect(v.colonnes).toHaveLength(5);
    expect(v.colonnes.map((c) => c.interdit)).toEqual([false, false, true, false, false]);
    expect(v.signes).toEqual(["+", "-", "-", "+"]);
  });
  it("a non carré parfait : radicaux", () => {
    const v = variationsFonction(2);
    expect(v.colonnes[1].x).toBe(String.raw`-\sqrt{2}`);
    expect(v.colonnes[3].x).toBe(String.raw`\sqrt{2}`);
    expect(v.colonnes[3].valeurs[0].texte).toBe(String.raw`2\sqrt{2}`);
    expect(v.colonnes[1].valeurs[0].texte).toBe(String.raw`-2\sqrt{2}`);
  });
  it("a carré parfait : entiers (a = 4 → 2 et 4)", () => {
    const v = variationsFonction(4);
    expect(v.colonnes[3].x).toBe("2");
    expect(v.colonnes[3].valeurs[0].texte).toBe("4");
    expect(v.colonnes[1].x).toBe("-2");
    expect(v.colonnes[1].valeurs[0].texte).toBe("-4");
  });
  it("virgule décimale protégée pour KaTeX (a = 2,5)", () => {
    expect(variationsFonction(2.5).colonnes[3].x).toBe(String.raw`\sqrt{2{,}5}`);
  });
  it("colonne interdite : −∞ en bas, +∞ en haut", () => {
    const c = variationsFonction(1).colonnes[2];
    expect(c.x).toBe("0");
    expect(c.valeurs).toEqual([
      { texte: String.raw`-\infty`, position: "bas" },
      { texte: String.raw`+\infty`, position: "haut" },
    ]);
  });
});
