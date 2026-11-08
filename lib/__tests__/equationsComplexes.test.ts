import { describe, expect, it } from "vitest";

import { cx, modC, mul, sub, type Cx } from "@/lib/complexes";
import {
  bilanRacine,
  calculExact,
  chercherRacineSimple,
  comparerReponses,
  discriminantReel,
  divisionEuclidienne,
  diviserParLineaire,
  evaluerPolynome,
  formesComplexe,
  polynomeDepuisRacines,
  polynomesEgaux,
  quotientParIdentification,
  racineCarree,
  racinesAvecMultiplicite,
  resoudreSecondDegre,
  resoudreTroisiemeDegre,
  verifierViete,
  type Poly,
} from "@/lib/equationsComplexes";

const proche = (z: Cx, w: Cx, tol = 1e-12) => modC(sub(z, w)) <= tol * Math.max(1, modC(w));
const memeEnsemble = (obtenu: Cx[], attendu: Cx[]) => obtenu.length === attendu.length && attendu.every((w) => obtenu.some((z) => proche(z, w)));
const P = (...c: Array<[number, number] | number>): Poly => c.map((v) => (typeof v === "number" ? cx(v) : cx(v[0], v[1])));

describe("discriminant réel", () => {
  it("Δ > 0 : deux racines réelles distinctes (z² − 5z + 6 : 2 et 3)", () => {
    const r = discriminantReel(1, -5, 6);
    expect(r.ok && r.cas).toBe("deux-reelles");
    if (r.ok) {
      expect(r.delta).toBe(1);
      expect(r.racines).toEqual([cx(2), cx(3)]);
      expect(r.multiplicites).toEqual([1, 1]);
    }
  });
  it("Δ = 0 : UNE racine double, jamais deux points (z² − 4z + 4)", () => {
    const r = discriminantReel(1, -4, 4);
    expect(r.ok && r.cas).toBe("double");
    if (r.ok) {
      expect(r.delta).toBe(0);
      expect(r.racines).toEqual([cx(2)]);
      expect(r.multiplicites).toEqual([2]);
    }
  });
  it("Δ < 0 : deux racines conjuguées non réelles (z² − 4z + 5 : 2 ± i ; z² − 4z + 13 : 2 ± 3i)", () => {
    const r = discriminantReel(1, -4, 5);
    expect(r.ok && r.cas).toBe("complexes");
    if (r.ok) {
      expect(r.delta).toBe(-4);
      expect(r.racines).toEqual([cx(2, -1), cx(2, 1)]);
    }
    const s = discriminantReel(1, -4, 13);
    if (s.ok) expect(s.racines).toEqual([cx(2, -3), cx(2, 3)]);
  });
  it("décimaux : Δ nul malgré l'arrondi flottant (0,2² − 4·0,01) reste une racine double", () => {
    const r = discriminantReel(1, 0.2, 0.01);
    expect(r.ok && r.cas).toBe("double");
    const s = discriminantReel(0.1, 0.6, 0.9);
    expect(s.ok && s.cas).toBe("double");
  });
  it("Δ proche du seuil : un Δ réellement petit mais non nul n'est pas écrasé à 0", () => {
    const r = discriminantReel(1, 2, 1 - 1e-6);
    expect(r.ok && r.cas).toBe("deux-reelles");
    const s = discriminantReel(1, 2, 1 + 1e-6);
    expect(s.ok && s.cas).toBe("complexes");
  });
  it("a = 0, valeurs non finies et valeurs géantes sont refusés avec un message", () => {
    for (const [a, b, c] of [[0, 1, 1], [NaN, 1, 1], [1, Infinity, 1], [1e9, 1, 1]]) {
      const r = discriminantReel(a, b, c);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.erreur.length).toBeGreaterThan(5);
    }
  });
  it("racines vérifiées dans P, y compris petites et grandes valeurs", () => {
    for (const [a, b, c] of [[1e-3, 2e-3, 5e-3], [1, -1e6, 1], [2, 3, -7], [-1.5, 0, 6]]) {
      const r = discriminantReel(a, b, c);
      expect(r.ok).toBe(true);
      if (r.ok) for (const z of r.racines) expect(bilanRacine(P(a, b, c), z).estRacine, `${a} ${b} ${c}`).toBe(true);
    }
  });
});

describe("racines carrées complexes", () => {
  const delta = (X: number, Y: number) => {
    const r = racineCarree(X, Y);
    if (!r.ok) throw new Error(r.erreur);
    return r;
  };
  it("Δ = −4 : ±2i", () => {
    const r = delta(-4, 0);
    expect(r.delta).toEqual(cx(0, 2));
    expect(r.racines).toEqual([cx(0, 2), cx(0, -2)]);
    expect(r.cas).toBe("reel-negatif");
  });
  it("Δ = 2i : ±(1+i) ; Δ = −2i : ±(1−i)", () => {
    expect(delta(0, 2).delta).toEqual(cx(1, 1));
    expect(delta(0, -2).delta).toEqual(cx(1, -1));
    expect(delta(0, 2).cas).toBe("y-positif");
    expect(delta(0, -2).cas).toBe("y-negatif");
  });
  it("Δ = 3 + 4i : ±(2 + i)", () => {
    const r = delta(3, 4);
    expect(r.delta).toEqual(cx(2, 1));
    expect(r.racines[1]).toEqual(cx(-2, -1));
    expect(r.module).toBe(5);
    expect(r.x2).toBe(4);
    expect(r.y2).toBe(1);
  });
  it("Δ = 9 : ±3 ; Δ = 0 : une seule racine, 0", () => {
    expect(delta(9, 0).racines).toEqual([cx(3), cx(-3)]);
    const z = delta(0, 0);
    expect(z.cas).toBe("nul");
    expect(z.racines).toEqual([cx(0)]);
    expect(z.racines).toHaveLength(1);
  });
  it("δ² = Δ pour une grille de valeurs, signes de X et Y variés, grandes et petites valeurs", () => {
    const valeurs = [-1e5, -37.5, -4, -1, -1e-6, 0, 1e-6, 0.3, 1, 2, 3, 4, 25, 12345.678];
    for (const X of valeurs)
      for (const Y of valeurs) {
        const r = delta(X, Y);
        for (const d of r.racines) {
          const carre = mul(d, d);
          expect(modC(sub(carre, cx(X, Y))) <= 1e-12 * Math.max(1, Math.hypot(X, Y)), `X=${X} Y=${Y} δ=${d.re}+${d.im}i`).toBe(true);
        }
        expect(r.racines).toHaveLength(X === 0 && Y === 0 ? 1 : 2);
        if (!(X === 0 && Y === 0)) {
          // xy a le signe de Y.
          expect(Math.sign(r.delta.re * r.delta.im)).toBe(Math.sign(Y));
          expect(r.delta.re > 0 || (r.delta.re === 0 && r.delta.im > 0)).toBe(true);
        }
      }
  });
  it("refuse les valeurs non finies ou trop grandes", () => {
    expect(racineCarree(NaN, 0).ok).toBe(false);
    expect(racineCarree(0, Infinity).ok).toBe(false);
    expect(racineCarree(1e9, 0).ok).toBe(false);
  });
  it("jamais de « -0 » dans le résultat", () => {
    for (const [X, Y] of [[-4, 0], [0, 0], [4, 0], [0, 2]]) {
      const r = delta(X, Y);
      for (const d of r.racines) {
        expect(Object.is(d.re, -0)).toBe(false);
        expect(Object.is(d.im, -0)).toBe(false);
      }
    }
  });
});

describe("polynômes : évaluation, division, identification", () => {
  it("Horner : P(2+i) pour z² − 4z + 5 vaut 0 exactement (entiers)", () => {
    const p = P(1, -4, 5);
    expect(evaluerPolynome(p, cx(2, 1))).toEqual(cx(0, 0));
    expect(calculExact(p, cx(2, 1))).toBe(true);
    expect(calculExact(p, cx(0.5, 1))).toBe(false);
  });
  it("division par z − z₀ : Horner, division posée et identification concordent", () => {
    const p = P(1, -6, 13, -10);
    const z0 = cx(2);
    const h = diviserParLineaire(p, z0);
    const d = divisionEuclidienne(p, z0);
    const i = quotientParIdentification(p, z0);
    expect(h.quotient).toEqual(P(1, -4, 5));
    expect(polynomesEgaux(h.quotient, d.quotient)).toBe(true);
    expect(polynomesEgaux(h.quotient, i.quotient)).toBe(true);
    expect(h.reste).toEqual(cx(0));
    expect(d.reste).toEqual(cx(0));
    expect(d.lignes).toHaveLength(3);
  });
  it("reste = P(z₀) quand z₀ n'est pas racine", () => {
    const p = P(1, -6, 13, -10);
    const z0 = cx(1);
    expect(diviserParLineaire(p, z0).reste).toEqual(evaluerPolynome(p, z0));
    expect(divisionEuclidienne(p, z0).reste).toEqual(evaluerPolynome(p, z0));
  });
  it("coefficients complexes : (z − i)(z² + (1+i)z + 2) retrouvé par division", () => {
    const q = P(1, [1, 1], 2);
    const p = polynomeDepuisRacines([cx(0, 1)], cx(1));
    expect(p).toEqual([cx(1), cx(0, -1)]);
    const produit: Poly = [cx(1), add2(q[1], cx(0, -1)), add2(q[2], mul(cx(0, -1), q[1])), mul(cx(0, -1), q[2])];
    const r = diviserParLineaire(produit, cx(0, 1));
    expect(polynomesEgaux(r.quotient, q)).toBe(true);
    expect(modC(r.reste)).toBeLessThan(1e-12);
  });
  it("polynomeDepuisRacines développe a(z − r₁)(z − r₂)(z − r₃)", () => {
    expect(polynomeDepuisRacines([cx(2), cx(2, -1), cx(2, 1)])).toEqual(P(1, -6, 13, -10));
  });
});

function add2(u: Cx, v: Cx): Cx {
  return { re: u.re + v.re, im: u.im + v.im };
}

describe("second degré à coefficients complexes", () => {
  const R = (a: Cx, b: Cx, c: Cx) => {
    const r = resoudreSecondDegre(a, b, c);
    if (!r.ok) throw new Error(r.erreur);
    return r;
  };
  it("z² − 4z + 13 = 0 : S = {2 − 3i ; 2 + 3i}", () => {
    const r = R(cx(1), cx(-4), cx(13));
    expect(r.racines).toEqual([cx(2, -3), cx(2, 3)]);
    expect(r.delta).toEqual(cx(-36));
    expect(r.deltaReel).toBe(true);
  });
  it("z² − (3+i)z + (2+2i) = 0 : S = {1+i ; 2}, Δ = −2i non réel", () => {
    const r = R(cx(1), cx(-3, -1), cx(2, 2));
    expect(memeEnsemble(r.racines, [cx(1, 1), cx(2)])).toBe(true);
    expect(r.racines).toHaveLength(2);
    expect(proche(r.delta, cx(0, -2))).toBe(true);
    expect(r.deltaReel).toBe(false);
  });
  it("z² − (3+i)z + (2+i) = 0 : S = {1 ; 2+i}", () => {
    const r = R(cx(1), cx(-3, -1), cx(2, 1));
    expect(memeEnsemble(r.racines, [cx(1), cx(2, 1)])).toBe(true);
  });
  it("Δ = 0 : une seule solution (racine double), multiplicité 2", () => {
    const r = R(cx(1), cx(-4), cx(4));
    expect(r.double).toBe(true);
    expect(r.racines).toEqual([cx(2)]);
    expect(r.multiplicites).toEqual([2]);
    expect(racinesAvecMultiplicite(r)).toHaveLength(2);
    const s = R(cx(1), cx(-2, -2), cx(0, 2)); // (z − (1+i))² = z² − (2+2i)z + 2i
    expect(s.double).toBe(true);
    expect(s.racines).toEqual([cx(1, 1)]);
  });
  it("coefficient dominant complexe ou non entier", () => {
    const r = R(cx(2, 1), cx(0), cx(-5, 0)); // (2+i)z² = 5  ⇒  z² = 2 − i
    for (const z of r.racines) expect(bilanRacine([cx(2, 1), cx(0), cx(-5)], z).estRacine).toBe(true);
    const s = R(cx(0.5), cx(0), cx(8)); // z² = −16
    expect(memeEnsemble(s.racines, [cx(0, 4), cx(0, -4)])).toBe(true);
  });
  it("a = 0 refusé ; valeurs non finies et géantes refusées", () => {
    expect(resoudreSecondDegre(cx(0), cx(1), cx(1)).ok).toBe(false);
    expect(resoudreSecondDegre(cx(1), cx(NaN), cx(1)).ok).toBe(false);
    expect(resoudreSecondDegre(cx(1), cx(1e9), cx(1)).ok).toBe(false);
  });
  it("solutions vérifiées dans P pour une grille de coefficients (dont très petits et très grands)", () => {
    const valeurs = [cx(1), cx(-3, 2), cx(0, 1), cx(1e-4, -2e-4), cx(1e4, 3e3), cx(0), cx(-7, 0)];
    for (const a of valeurs)
      for (const b of valeurs)
        for (const c of valeurs) {
          if (a.re === 0 && a.im === 0) continue;
          const r = resoudreSecondDegre(a, b, c);
          expect(r.ok).toBe(true);
          if (r.ok) for (const z of r.racines) expect(bilanRacine([a, b, c], z, 1e-9).estRacine, `a=${a.re},${a.im} b=${b.re},${b.im} c=${c.re},${c.im} z=${z.re},${z.im}`).toBe(true);
        }
  });
  it("Viète : somme −b/a et produit c/a", () => {
    const r = R(cx(1), cx(-3, -1), cx(2, 2));
    const v = verifierViete(r.a, r.b, r.c, r.racines[0], r.racines[1]);
    expect(v?.sommeOk && v.produitOk).toBe(true);
    expect(v?.sommeAttendue).toEqual(cx(3, 1));
    expect(v?.produitAttendu).toEqual(cx(2, 2));
    const faux = verifierViete(r.a, r.b, r.c, cx(1), cx(2));
    expect(faux?.sommeOk).toBe(false);
  });
});

describe("troisième degré avec racine connue", () => {
  const T = (p: Poly, z0: Cx) => {
    const r = resoudreTroisiemeDegre(p, z0);
    if (!r.ok) throw new Error(r.erreur);
    return r;
  };
  it("z³ − 6z² + 13z − 10 = 0, z₀ = 2 : S = {2 ; 2−i ; 2+i}", () => {
    const r = T(P(1, -6, 13, -10), cx(2));
    expect(r.quotient).toEqual(P(1, -4, 5));
    expect(memeEnsemble(r.racines, [cx(2), cx(2, -1), cx(2, 1)])).toBe(true);
    expect(r.multiplicites).toEqual([1, 1, 1]);
    expect(r.methodesConcordent).toBe(true);
  });
  it("z³ − 4z² + 6z − 4 = 0, z₀ = 2 : S = {2 ; 1−i ; 1+i}", () => {
    const r = T(P(1, -4, 6, -4), cx(2));
    expect(r.quotient).toEqual(P(1, -2, 2));
    expect(memeEnsemble(r.racines, [cx(2), cx(1, -1), cx(1, 1)])).toBe(true);
  });
  it("z³ − 3z² + 4z − 12 = 0, z₀ = 3 : S = {3 ; −2i ; 2i}", () => {
    const r = T(P(1, -3, 4, -12), cx(3));
    expect(r.quotient).toEqual(P(1, 0, 4));
    expect(memeEnsemble(r.racines, [cx(3), cx(0, -2), cx(0, 2)])).toBe(true);
  });
  it("racine double : z³ − 5z² + 8z − 4 = (z−1)(z−2)², z₀ = 2 → 2 (×2) et 1", () => {
    const r = T(P(1, -5, 8, -4), cx(2));
    expect(r.racines).toHaveLength(2);
    expect(r.racines[0]).toEqual(cx(1));
    expect(r.racines[1]).toEqual(cx(2));
    expect(r.multiplicites).toEqual([1, 2]);
    expect(r.multiplicites.reduce((s, m) => s + m, 0)).toBe(3);
  });
  it("racine double portée par le quotient : z₀ = 1 → 1 (×1) et 2 (×2)", () => {
    const r = T(P(1, -5, 8, -4), cx(1));
    expect(r.secondDegre.double).toBe(true);
    expect(r.racines).toEqual([cx(1), cx(2)]);
    expect(r.multiplicites).toEqual([1, 2]);
  });
  it("racine triple : (z − 1)³ = z³ − 3z² + 3z − 1", () => {
    const r = T(P(1, -3, 3, -1), cx(1));
    expect(r.racines).toEqual([cx(1)]);
    expect(r.multiplicites).toEqual([3]);
  });
  it("racine complexe multiple : (z − i)²(z + 2)", () => {
    const p = polynomeDepuisRacines([cx(0, 1), cx(0, 1), cx(-2)]);
    const r = T(p, cx(0, 1));
    expect(r.racines).toHaveLength(2);
    expect(r.multiplicites.slice().sort()).toEqual([1, 2]);
    const double = r.racines[r.multiplicites.indexOf(2)];
    expect(proche(double, cx(0, 1), 1e-9)).toBe(true);
  });
  it("coefficients complexes : (z − (1+i))(z − 2i)(z + 3)", () => {
    const racines = [cx(1, 1), cx(0, 2), cx(-3)];
    const p = polynomeDepuisRacines(racines);
    const r = T(p, cx(-3));
    expect(memeEnsemble(r.racines, racines)).toBe(true);
  });
  it("racine candidate incorrecte : refusée, avec P(z₀) ≠ 0", () => {
    const r = resoudreTroisiemeDegre(P(1, -6, 13, -10), cx(3));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.raison).toBe("pas-racine");
      expect(r.erreur).toBe("Ce nombre n'est pas une racine.");
      expect(r.bilan?.valeur).toEqual(cx(2));
    }
  });
  it("valeur proche d'une racine : refusée si l'écart dépasse le seuil, acceptée sous le seuil", () => {
    const p = P(1, -6, 13, -10);
    expect(resoudreTroisiemeDegre(p, cx(2 + 1e-6)).ok).toBe(false);
    expect(resoudreTroisiemeDegre(p, cx(2 + 1e-13)).ok).toBe(true);
  });
  it("coefficient dominant nul refusé", () => {
    const r = resoudreTroisiemeDegre(P(0, 1, -3, 2), cx(1));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.raison).toBe("coefficient");
  });
  it("grandes et petites valeurs : (z − 200)(z − 1e-3)(z + 300)", () => {
    const racines = [cx(200), cx(1e-3), cx(-300)];
    const r = T(polynomeDepuisRacines(racines), cx(200));
    expect(r.racines.length).toBe(3);
    for (const z of racines) expect(r.racines.some((w) => modC(sub(w, z)) <= 1e-8 * Math.max(1, modC(z)))).toBe(true);
  });
  it("la somme des multiplicités vaut toujours 3 ; les trois racines annulent P", () => {
    const cas: Array<[Poly, Cx]> = [
      [P(1, -6, 13, -10), cx(2)],
      [P(2, -10, 16, -8), cx(2)],
      [P(1, -3, 3, -1), cx(1)],
      [P(1, 0, 0, -1), cx(1)],
    ];
    for (const [p, z0] of cas) {
      const r = T(p, z0);
      expect(r.multiplicites.reduce((s, m) => s + m, 0)).toBe(3);
      for (const z of r.racines) expect(bilanRacine(p, z).estRacine).toBe(true);
    }
  });
});

describe("recherche d'une racine simple, formes, comparaison de réponses", () => {
  it("trouve 2 pour z³ − 6z² + 13z − 10 et i-racines quand il y en a", () => {
    const z = chercherRacineSimple(P(1, -6, 13, -10));
    expect(z).not.toBeNull();
    expect(bilanRacine(P(1, -6, 13, -10), z as Cx).estRacine).toBe(true);
    expect(chercherRacineSimple(P(1, 0, 4))).not.toBeNull();
    expect(chercherRacineSimple(P(1, 0, -2))).toBeNull(); // racines irrationnelles : aucune racine de Gauss
  });
  it("zéro n'a pas d'argument", () => {
    expect(formesComplexe(cx(0)).argument).toBeNull();
    expect(formesComplexe(cx(0, 3)).argument).toBeCloseTo(Math.PI / 2, 12);
    expect(formesComplexe(cx(-2, 0)).argument).toBeCloseTo(Math.PI, 12);
  });
  it("comparerReponses : ordre indifférent, multiplicité comptée, intrus et manquantes", () => {
    const att = [cx(2), cx(2, 1), cx(2, -1)];
    expect(comparerReponses(att, [cx(2, -1), cx(2), cx(2, 1)]).correct).toBe(true);
    expect(comparerReponses(att, [cx(2), cx(2, 1)]).manquantes).toEqual([cx(2, -1)]);
    expect(comparerReponses(att, [cx(2), cx(2, 1), cx(3)]).intrus).toEqual([cx(3)]);
    expect(comparerReponses([cx(2), cx(2)], [cx(2)]).correct).toBe(false); // racine double comptée deux fois
    expect(comparerReponses([cx(2), cx(2)], [cx(2), cx(2)]).correct).toBe(true);
    expect(comparerReponses([cx(Math.SQRT2)], [cx(1.414)]).correct).toBe(true); // arrondi à 3 décimales toléré
    expect(comparerReponses([cx(Math.SQRT2)], [cx(1.4)]).correct).toBe(false);
  });
});
