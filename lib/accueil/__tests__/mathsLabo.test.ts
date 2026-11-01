import { describe, expect, it } from "vitest";

import { branche, commentaireFonction, complexe, ecrireComplexe, extremaFonction, f, FONCTION, nombreFr, racineTexte, trigo, valeurTrigoTex } from "../mathsLabo";

describe("nombreFr", () => {
  it("utilise la virgule et le vrai signe moins", () => {
    expect(nombreFr(1.5, 1)).toBe("1,5");
    expect(nombreFr(-2.25, 2)).toBe("−2,25");
  });
  it("évite −0 et les décimales inutiles", () => {
    expect(nombreFr(-0.001, 1)).toBe("0");
    expect(nombreFr(3, 2)).toBe("3");
  });
});

describe("racineTexte", () => {
  it("racine exacte pour un carré parfait", () => {
    expect(racineTexte(25)).toEqual({ exact: "5", approx: null });
  });
  it("forme √n et valeur approchée sinon", () => {
    expect(racineTexte(13)).toEqual({ exact: "√13", approx: "3,61" });
  });
});

describe("fonction f_a(x) = x + a/x", () => {
  it("curseur : bornes, pas et valeur initiale", () => {
    expect(FONCTION).toEqual({ min: -4, max: 4, pas: 0.5, initial: 2 });
  });
  it("calcule f(a, x)", () => {
    expect(f(2, 1)).toBe(3);
    expect(f(-2, 1)).toBe(-1);
    expect(f(0, 3)).toBe(3);
  });

  describe("a > 0", () => {
    it("extrema en ±√a de valeurs ±2√a", () => {
      const e = extremaFonction(4);
      expect(e).toEqual({ racine: 2, valeur: 4 });
      expect(f(4, 2)).toBeCloseTo(4, 12);
      expect(f(4, -2)).toBeCloseTo(-4, 12);
    });
    it("a non carré parfait", () => {
      const e = extremaFonction(2)!;
      expect(e.racine).toBeCloseTo(Math.SQRT2, 12);
      expect(e.valeur).toBeCloseTo(2 * Math.SQRT2, 12);
    });
    it("√a est bien un minimum local sur x > 0", () => {
      const e = extremaFonction(3)!;
      expect(f(3, e.racine - 0.1)).toBeGreaterThan(e.valeur);
      expect(f(3, e.racine + 0.1)).toBeGreaterThan(e.valeur);
    });
    it("commentaire pour a > 0", () => {
      expect(commentaireFonction(2)).toContain("Pour $a > 0$");
    });
  });

  describe("a < 0", () => {
    it("aucun extremum", () => {
      expect(extremaFonction(-1)).toBeNull();
      expect(extremaFonction(-4)).toBeNull();
    });
    it("strictement croissante sur chaque branche", () => {
      const pos = branche(-2, 1, 7);
      for (let i = 1; i < pos.length; i++) expect(pos[i][1]).toBeGreaterThan(pos[i - 1][1]);
      const neg = branche(-2, -1, 7);
      for (let i = 1; i < neg.length; i++) expect(neg[i][1]).toBeLessThan(neg[i - 1][1]); // x décroît ⇒ f décroît
    });
    it("commentaire pour a < 0", () => {
      expect(commentaireFonction(-1)).toContain("Pour $a < 0$");
    });
  });

  describe("a = 0", () => {
    it("aucun extremum et f(x) = x", () => {
      expect(extremaFonction(0)).toBeNull();
      for (const [x, y] of branche(0, 1, 7)) expect(y).toBeCloseTo(x, 12);
      for (const [x, y] of branche(0, -1, 7)) expect(y).toBeCloseTo(x, 12);
    });
    it("commentaire : point exclu, plus d'asymptote verticale", () => {
      const c = commentaireFonction(0);
      expect(c).toContain("Pour $a = 0$");
      expect(c).toContain("exclu");
    });
  });

  describe("branche", () => {
    it("ne traverse jamais x = 0 et reste du bon côté", () => {
      expect(branche(2, 1, 7).every(([x]) => x > 0)).toBe(true);
      expect(branche(2, -1, 7).every(([x]) => x < 0)).toBe(true);
    });
    it("va de 0,02 à xMax avec n + 1 points", () => {
      const b = branche(2, 1, 7, 240);
      expect(b).toHaveLength(241);
      expect(b[0][0]).toBeCloseTo(0.02, 12);
      expect(b[240][0]).toBeCloseTo(7, 9);
    });
  });
});

describe("nombres complexes", () => {
  it("écriture de z", () => {
    expect(ecrireComplexe(3, 2)).toBe("3 + 2i");
    expect(ecrireComplexe(3, -2)).toBe("3 − 2i");
    expect(ecrireComplexe(-2, 1)).toBe("−2 + i");
    expect(ecrireComplexe(4, 0)).toBe("4");
    expect(ecrireComplexe(0, -1)).toBe("−i");
    expect(ecrireComplexe(0, 0)).toBe("0");
  });
  it("module, conjugué et argument de 3 + 4i", () => {
    const r = complexe(3, 4);
    expect(r.conjugue).toBe("3 − 4i");
    expect(r.module).toEqual({ exact: "5", approx: null });
    expect(r.argumentDeg).toBeCloseTo(53.130102354, 6);
  });
  it("argument principal dans ]−180 ; 180]", () => {
    expect(complexe(-1, 0).argumentDeg).toBe(180);
    expect(complexe(0, -2).argumentDeg).toBe(-90);
  });
  it("z = 0 : argument non défini", () => {
    expect(complexe(0, 0).argumentDeg).toBeNull();
  });
});

describe("trigonométrie", () => {
  it("angles remarquables exacts", () => {
    const r = trigo(30);
    expect(r.sin.exact).toBe("1/2");
    expect(r.cos.exact).toBe("√3/2");
    expect(r.tan.exact).toBe("√3/3");
  });
  it("cos 90° = 0 exactement, tan non définie", () => {
    const r = trigo(90);
    expect(r.cos.valeur).toBe(0);
    expect(r.tan.valeur).toBeNull();
    expect(trigo(270).tan.valeur).toBeNull();
  });
  it("signes selon le quadrant", () => {
    expect(trigo(120).cos.valeur!).toBeLessThan(0);
    expect(trigo(210).sin.valeur!).toBeLessThan(0);
    expect(trigo(210).tan.valeur!).toBeGreaterThan(0);
    expect(trigo(300).cos.valeur!).toBeGreaterThan(0);
  });
  it("angle non remarquable : valeur approchée", () => {
    const r = trigo(50);
    expect(r.sin.exact).toBeNull();
    expect(r.sin.valeur).toBeCloseTo(Math.sin((50 * Math.PI) / 180), 12);
  });
  it("0° et 360° : sin = 0", () => {
    expect(trigo(0).sin.valeur).toBe(0);
    expect(Math.abs(trigo(360).sin.valeur!)).toBeLessThan(1e-12);
  });
  it("valeurTrigoTex", () => {
    expect(valeurTrigoTex(trigo(30).cos)).toContain(String.raw`\dfrac{\sqrt{3}}{2}`);
    expect(valeurTrigoTex(trigo(90).tan)).toBeNull();
  });
});
