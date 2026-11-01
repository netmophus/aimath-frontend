import { describe, expect, it } from "vitest";

import {
  aire,
  EXEMPLES_SUITE,
  FONCTIONS_INTEGRALE,
  FONCTIONS_LIMITE,
  graduations,
  NB_TERMES_MAX,
  peutContinuer,
  termesSuite,
  troncons,
} from "../mathsLaboAvance";

describe("graduations", () => {
  it("repères ronds couvrant l'intervalle", () => {
    // graduations() renvoie -0 pour 0 (comportement existant, sans effet à l'affichage) : on normalise avec « + 0 ».
    expect(graduations(0, 10, 5).map((v) => v + 0)).toEqual([0, 2, 4, 6, 8, 10]);
    const g = graduations(-2, 8, 5);
    expect(g[0]).toBeGreaterThanOrEqual(-2);
    expect(g[g.length - 1]).toBeLessThanOrEqual(8);
  });
});

describe("troncons", () => {
  it("coupe aux valeurs non finies", () => {
    const t = troncons((x) => 1 / x, -1, 1, -50, 50, 100);
    expect(t.length).toBeGreaterThanOrEqual(2);
    t.flat().forEach(([, y]) => expect(Number.isFinite(y)).toBe(true));
  });
  it("coupe aux valeurs hors fenêtre", () => {
    const t = troncons((x) => x, 0, 10, 2, 5, 100);
    t.flat().forEach(([, y]) => expect(y >= 2 && y <= 5).toBe(true));
  });
});

describe("suites", () => {
  it("six exemples aux identifiants distincts", () => {
    expect(EXEMPLES_SUITE).toHaveLength(6);
    expect(new Set(EXEMPLES_SUITE.map((e) => e.id)).size).toBe(6);
  });
  it("termesSuite démarre en u0 et applique la relation", () => {
    const geo = EXEMPLES_SUITE.find((e) => e.id === "geo-converge")!;
    expect(termesSuite(geo, 4)).toEqual([16, 8, 4, 2]);
    const affine = EXEMPLES_SUITE.find((e) => e.id === "affine")!;
    expect(termesSuite(affine, 3)).toEqual([0, 3, 4.5]);
  });
  it("suites convergentes : les termes se rapprochent de la limite déclarée", () => {
    for (const ex of EXEMPLES_SUITE.filter((e) => e.nature === "converge")) {
      const t = termesSuite(ex, NB_TERMES_MAX);
      expect(ex.limite).not.toBeNull();
      expect(Math.abs(t[t.length - 1] - (ex.limite as number))).toBeLessThan(Math.abs(t[0] - (ex.limite as number)) + 1e-9);
    }
  });
  it("garde-fou : le calcul s'arrête au-delà de 10⁶ et peutContinuer devient faux", () => {
    const div = EXEMPLES_SUITE.find((e) => e.id === "geo-diverge")!;
    const t = termesSuite(div, 1000);
    expect(t.length).toBeLessThan(1000);
    expect(peutContinuer(t)).toBe(false);
  });
  it("peutContinuer est faux au nombre maximal de termes", () => {
    expect(peutContinuer(Array(NB_TERMES_MAX).fill(0))).toBe(false);
    expect(peutContinuer([1])).toBe(true);
  });
});

describe("intégrale", () => {
  it("aire = F(x) (Simpson) pour chaque fonction", () => {
    for (const fo of FONCTIONS_INTEGRALE) {
      for (const x of [0.5, 1.5, fo.xmax]) expect(aire(fo.f, x)).toBeCloseTo(fo.F(x), 8);
    }
  });
  it("aire nulle pour x ≤ 0", () => {
    expect(aire((x) => x * x, 0)).toBe(0);
    expect(aire((x) => x * x, -1)).toBe(0);
  });
  it("F(0) = 0 et valeur initiale dans [0 ; xmax]", () => {
    for (const fo of FONCTIONS_INTEGRALE) {
      expect(fo.F(0)).toBe(0);
      expect(fo.initial).toBeGreaterThanOrEqual(0);
      expect(fo.initial).toBeLessThanOrEqual(fo.xmax);
    }
  });
});

describe("limites", () => {
  it("trois fonctions", () => {
    expect(FONCTIONS_LIMITE.map((f) => f.id).sort()).toEqual(["exponentielle", "homographique", "sinuscardinal"]);
  });
  it("l'écart |f(x) − L| diminue dans la table « x grandit / x tend vers la cible »", () => {
    for (const fo of FONCTIONS_LIMITE) {
      for (const t of fo.tables.filter((tb) => tb.ecart)) {
        const ecarts = t.xs.map((x) => Math.abs(fo.f(x) - fo.L));
        expect(ecarts[ecarts.length - 1]).toBeLessThan(ecarts[0]);
      }
    }
  });
  it("la valeur initiale du curseur est dans la plage", () => {
    for (const fo of FONCTIONS_LIMITE) {
      expect(fo.curseur.initial).toBeGreaterThanOrEqual(fo.curseur.min);
      expect(fo.curseur.initial).toBeLessThanOrEqual(fo.curseur.max);
    }
  });
  it("exponentielle e^(−x) : limite 0 et f(0) = 1", () => {
    const e = FONCTIONS_LIMITE.find((f) => f.id === "exponentielle")!;
    expect(e.L).toBe(0);
    expect(e.f(0)).toBe(1);
  });
});
