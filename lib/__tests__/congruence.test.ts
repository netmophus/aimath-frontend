import { describe, expect, it } from "vitest";

import {
  CONGRUENCE_DEFAUT,
  CongruenceSyntaxeError,
  divisionEuclidienne,
  lireEntier,
  parserBlocCongruence,
  testerCongruence,
} from "../congruence";

describe("divisionEuclidienne : le reste est toujours dans [0, n-1]", () => {
  it.each([
    [17, 5, 2],
    [-7, 5, 3],
    [-3, 5, 2],
    [100, 7, 2],
    [-1, 3, 2],
    [0, 4, 0],
  ])("%i mod %i = %i", (a, n, r) => {
    const d = divisionEuclidienne(a, n);
    expect(d.reste).toBe(r);
    expect(d.reste).toBeGreaterThanOrEqual(0);
    expect(d.reste).toBeLessThan(n);
    expect(d.quotient * n + d.reste).toBe(a);
  });

  it("-7 = (-2) x 5 + 3", () => {
    expect(divisionEuclidienne(-7, 5)).toEqual({ quotient: -2, reste: 3 });
  });
});

describe("testerCongruence", () => {
  it("17 ≡ 2 [5] : oui", () => {
    const t = testerCongruence(17, 2, 5);
    expect(t.congruents).toBe(true);
    expect(t.facteur).toBe(3);
  });
  it("-7 ≡ 3 [5] : oui", () => {
    const t = testerCongruence(-7, 3, 5);
    expect(t.congruents).toBe(true);
    expect(t.facteur).toBe(-2);
  });
  it("17 ≡ 3 [5] : non, restes 2 et 3", () => {
    const t = testerCongruence(17, 3, 5);
    expect(t).toMatchObject({ congruents: false, resteA: 2, resteB: 3, ecart: 14, facteur: null });
  });
});

describe("lireEntier", () => {
  it("accepte les entiers relatifs", () => {
    expect(lireEntier("-7")).toBe(-7);
    expect(lireEntier(" 12 ")).toBe(12);
  });
  it("refuse vide, décimaux et texte", () => {
    for (const t of ["", " ", "-", "1.5", "abc", "1e3"]) expect(lireEntier(t)).toBeNull();
  });
});

describe("parserBlocCongruence", () => {
  it("bloc vide = valeurs par défaut", () => {
    expect(parserBlocCongruence("")).toEqual(CONGRUENCE_DEFAUT);
    expect(CONGRUENCE_DEFAUT).toEqual({ a: 17, b: 3, n: 5 });
  });
  it("lit a, b, n (négatifs acceptés)", () => {
    expect(parserBlocCongruence("a: -7\nb: 3\nn: 5")).toEqual({ a: -7, b: 3, n: 5 });
  });
  it("clé inconnue : erreur typée", () => {
    expect(() => parserBlocCongruence("x: 1")).toThrow(CongruenceSyntaxeError);
  });
  it("valeur non entière : erreur typée", () => {
    expect(() => parserBlocCongruence("a: 1.5")).toThrow(CongruenceSyntaxeError);
    expect(() => parserBlocCongruence("n: abc")).toThrow(CongruenceSyntaxeError);
  });
  it("ligne sans deux-points : erreur typée", () => {
    expect(() => parserBlocCongruence("a 5")).toThrow(CongruenceSyntaxeError);
  });
});
