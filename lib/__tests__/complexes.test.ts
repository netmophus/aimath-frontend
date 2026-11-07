import { describe, expect, it } from "vitest";

import {
  I,
  add,
  alignes,
  angleEgalMod2Pi,
  angleEnSommet,
  angleOriente,
  argument,
  birapport,
  cercleCirconscrit,
  cocyclicite,
  confondus,
  conj,
  cx,
  depuisPolaire,
  distance,
  div,
  estImaginairePur,
  estReel,
  expI,
  modC,
  moivre,
  mul,
  natureTriangle,
  normaliserAngle,
  orthogonaux,
  presqueEgal,
  puissanceDeI,
  puissanceEntiere,
  quotientAlignement,
  racinesNiemes,
  racinesUnite,
  resoudreSecondDegre,
  rotation,
  sub,
  versPolaire,
  type Cx,
} from "../complexes";
import { ANGLES_REMARQUABLES, lireAngle, lireComplexe, lireReel, texAngle, texComplexe, texExact, texModule, texReel, trigExacte, valeurExact } from "../complexesTex";

const proche = (z: Cx, w: Cx, tol = 1e-9) => {
  expect(Math.abs(z.re - w.re)).toBeLessThan(tol);
  expect(Math.abs(z.im - w.im)).toBeLessThan(tol);
};

describe("zéro et argument indéfini", () => {
  it("le module de 0 est 0 et son argument est indéfini (null)", () => {
    expect(modC(cx(0, 0))).toBe(0);
    expect(argument(cx(0, 0))).toBeNull();
    expect(argument(cx(-0, -0))).toBeNull();
    expect(versPolaire(cx(0, 0))).toEqual({ r: 0, theta: null });
  });
  it("les racines et Moivre d'un nombre nul sont refusées (pas d'argument inventé)", () => {
    expect(racinesNiemes(cx(0, 0), 3)).toBeNull();
    expect(moivre(cx(0, 0), 3)).toBeNull();
  });
});

describe("conjugué, module et produit z × z̄", () => {
  it("z × z̄ = |z|² (réel positif) et |z̄| = |z|", () => {
    for (const z of [cx(-3, 4), cx(2, -5), cx(0, 7), cx(1.5, 0.25)]) {
      const p = mul(z, conj(z));
      expect(p.im).toBeCloseTo(0, 12);
      expect(p.re).toBeCloseTo(modC(z) ** 2, 12);
      expect(modC(conj(z))).toBeCloseTo(modC(z), 12);
    }
  });
  it("le conjugué est le symétrique par rapport à l'axe réel, sans -0", () => {
    expect(conj(cx(3, 0))).toEqual({ re: 3, im: 0 });
    expect(Object.is(conj(cx(3, 0)).im, -0)).toBe(false);
    expect(conj(cx(1, 2))).toEqual({ re: 1, im: -2 });
  });
  it("module de -3+4i = 5", () => {
    expect(modC(cx(-3, 4))).toBe(5);
  });
});

describe("opérations et division", () => {
  it("(2+3i)(4-i) = 11+10i", () => {
    expect(mul(cx(2, 3), cx(4, -1))).toEqual({ re: 11, im: 10 });
  });
  it("addition et soustraction", () => {
    expect(add(cx(1, 2), cx(3, -5))).toEqual({ re: 4, im: -3 });
    expect(sub(cx(1, 2), cx(3, -5))).toEqual({ re: -2, im: 7 });
  });
  it("division usuelle : (1+2i)/(3-i) = (1+7i)/10", () => {
    const q = div(cx(1, 2), cx(3, -1));
    expect(q).not.toBeNull();
    proche(q as Cx, cx(0.1, 0.7));
  });
  it("division par zéro : null, jamais NaN ni Infinity", () => {
    expect(div(cx(1, 2), cx(0, 0))).toBeNull();
    expect(div(cx(0, 0), cx(0, 0))).toBeNull();
  });
  it("|z1 / z2| = |z1| / |z2|", () => {
    const z1 = cx(3, -2);
    const z2 = cx(-1, 4);
    const q = div(z1, z2) as Cx;
    expect(modC(q)).toBeCloseTo(modC(z1) / modC(z2), 12);
  });
});

describe("puissances de i", () => {
  it("cycle de période 4, exact, y compris négatif", () => {
    expect(puissanceDeI(0)).toEqual({ re: 1, im: 0 });
    expect(puissanceDeI(1)).toEqual(I);
    expect(puissanceDeI(2)).toEqual({ re: -1, im: 0 });
    expect(puissanceDeI(3)).toEqual({ re: 0, im: -1 });
    expect(puissanceDeI(2027)).toEqual({ re: 0, im: -1 });
    expect(puissanceDeI(-1)).toEqual({ re: 0, im: -1 });
    expect(puissanceDeI(-2)).toEqual({ re: -1, im: 0 });
  });
  it("puissanceEntiere est cohérente avec puissanceDeI", () => {
    for (let n = -6; n <= 12; n++) proche(puissanceEntiere(I, n) as Cx, puissanceDeI(n));
    expect(puissanceEntiere(cx(0, 0), -1)).toBeNull();
  });
});

describe("argument : quatre quadrants et axes", () => {
  it("quadrants", () => {
    expect(argument(cx(1, 1))).toBeCloseTo(Math.PI / 4, 12);
    expect(argument(cx(-1, 1))).toBeCloseTo((3 * Math.PI) / 4, 12);
    expect(argument(cx(-1, -1))).toBeCloseTo((-3 * Math.PI) / 4, 12);
    expect(argument(cx(1, -1))).toBeCloseTo(-Math.PI / 4, 12);
  });
  it("axes : 0, π/2, π (jamais -π), -π/2", () => {
    expect(argument(cx(5, 0))).toBe(0);
    expect(argument(cx(0, 5))).toBeCloseTo(Math.PI / 2, 12);
    expect(argument(cx(-5, 0))).toBe(Math.PI);
    expect(argument(cx(-5, -0))).toBe(Math.PI);
    expect(argument(cx(0, -5))).toBeCloseTo(-Math.PI / 2, 12);
  });
  it("normaliserAngle ramène dans ]-π, π]", () => {
    expect(normaliserAngle(3 * Math.PI)).toBeCloseTo(Math.PI, 12);
    expect(normaliserAngle(-Math.PI)).toBeCloseTo(Math.PI, 12);
    expect(normaliserAngle(2 * Math.PI)).toBeCloseTo(0, 12);
    expect(normaliserAngle(-7 * Math.PI / 2)).toBeCloseTo(Math.PI / 2, 12);
  });
});

describe("conversions entre formes", () => {
  it("-1 + i√3 : r = 2, θ = 2π/3, et retour", () => {
    const z = cx(-1, Math.sqrt(3));
    const p = versPolaire(z);
    expect(p.r).toBeCloseTo(2, 12);
    expect(p.theta).toBeCloseTo((2 * Math.PI) / 3, 12);
    proche(depuisPolaire(p.r, p.theta as number), z, 1e-12);
  });
  it("aller-retour sur une grille de points dans les quatre quadrants", () => {
    for (let a = -3; a <= 3; a += 1.5)
      for (let b = -3; b <= 3; b += 1.5) {
        if (a === 0 && b === 0) continue;
        const p = versPolaire(cx(a, b));
        proche(depuisPolaire(p.r, p.theta as number), cx(a, b), 1e-12);
      }
  });
  it("angles de cadran : cos/sin exacts, pas de 6e-17", () => {
    expect(expI(Math.PI / 2)).toEqual({ re: 0, im: 1 });
    expect(expI(Math.PI)).toEqual({ re: -1, im: 0 });
    expect(depuisPolaire(3, Math.PI / 2)).toEqual({ re: 0, im: 3 });
    expect(depuisPolaire(2, -Math.PI / 2)).toEqual({ re: 0, im: -2 });
  });
  it("angleEgalMod2Pi", () => {
    expect(angleEgalMod2Pi(0.5, 0.5 + 4 * Math.PI)).toBe(true);
    expect(angleEgalMod2Pi(0.5, 0.6)).toBe(false);
  });
});

describe("formule de Moivre", () => {
  it("(1+i)^8 = 16 : module (√2)^8, argument 8·π/4 = 2π réduit à 0", () => {
    const m = moivre(cx(1, 1), 8)!;
    expect(m.module).toBeCloseTo(16, 9);
    expect(m.argumentBrut).toBeCloseTo(2 * Math.PI, 12);
    expect(m.argumentPrincipal).toBeCloseTo(0, 12);
    expect(m.tours).toBe(1);
    proche(puissanceEntiere(cx(1, 1), 8) as Cx, cx(16, 0));
  });
  it("cohérence avec la multiplication répétée", () => {
    const z = depuisPolaire(1.3, 0.7);
    const m = moivre(z, 5)!;
    const p = puissanceEntiere(z, 5) as Cx;
    proche(p, depuisPolaire(m.module, m.argumentPrincipal), 1e-9);
  });
  it("distingue nα et son argument principal", () => {
    const m = moivre(depuisPolaire(1, (2 * Math.PI) / 3), 3)!;
    expect(m.argumentBrut).toBeCloseTo(2 * Math.PI, 12);
    expect(m.argumentPrincipal).toBeCloseTo(0, 12);
  });
});

describe("racines n-ièmes", () => {
  it("racines de l'unité : n points, module 1, écart 2π/n, produit z^n = 1", () => {
    for (let n = 2; n <= 12; n++) {
      const r = racinesUnite(n)!;
      expect(r).toHaveLength(n);
      r.forEach((rk, k) => {
        expect(modC(rk.z)).toBeCloseTo(1, 12);
        expect(rk.argument).toBeCloseTo((2 * Math.PI * k) / n, 12);
        proche(puissanceEntiere(rk.z, n) as Cx, cx(1, 0), 1e-9);
      });
    }
  });
  it("somme des racines de l'unité nulle (n ≥ 2)", () => {
    for (let n = 2; n <= 12; n++) {
      const s = racinesUnite(n)!.reduce((acc, r) => add(acc, r.z), cx(0, 0));
      proche(s, cx(0, 0), 1e-12);
    }
  });
  it("n = 2 : ±1 ; n = 4 : 1, i, -1, -i exacts", () => {
    expect(racinesUnite(2)!.map((r) => r.z)).toEqual([{ re: 1, im: 0 }, { re: -1, im: 0 }]);
    expect(racinesUnite(4)!.map((r) => r.z)).toEqual([{ re: 1, im: 0 }, { re: 0, im: 1 }, { re: -1, im: 0 }, { re: 0, im: -1 }]);
  });
  it("z^n = w : rayon |w|^(1/n) et chaque racine vérifie l'équation", () => {
    const w = depuisPolaire(8, Math.PI / 3);
    const r = racinesNiemes(w, 3)!;
    r.forEach((rk) => {
      expect(modC(rk.z)).toBeCloseTo(2, 12);
      proche(puissanceEntiere(rk.z, 3) as Cx, w, 1e-9);
    });
  });
  it("n invalide", () => {
    expect(racinesNiemes(cx(1, 0), 0)).toBeNull();
    expect(racinesNiemes(cx(1, 0), 2.5)).toBeNull();
    expect(racinesUnite(0)).toBeNull();
  });
});

describe("second degré à coefficients réels", () => {
  it("Δ < 0 : z² - 2z + 5 = 0 → Δ = -16, 1-2i et 1+2i (conjuguées)", () => {
    const r = resoudreSecondDegre(1, -2, 5);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.delta).toBe(-16);
    expect(r.cas).toBe("complexes");
    proche(r.racines[0], cx(1, -2));
    proche(r.racines[1], cx(1, 2));
    proche(r.racines[0], conj(r.racines[1]));
  });
  it("Δ > 0 : z² - 3z + 2 = 0 → 1 et 2", () => {
    const r = resoudreSecondDegre(1, -3, 2);
    expect(r.ok && r.cas).toBe("deux-reelles");
    if (r.ok) {
      expect(r.delta).toBe(1);
      proche(r.racines[0], cx(1, 0));
      proche(r.racines[1], cx(2, 0));
    }
  });
  it("Δ = 0 : z² - 2z + 1 = 0 → racine double 1", () => {
    const r = resoudreSecondDegre(1, -2, 1);
    expect(r.ok && r.cas).toBe("double");
    if (r.ok) {
      expect(r.delta).toBe(0);
      expect(r.racines).toEqual([{ re: 1, im: 0 }]);
    }
  });
  it("racine double détectée malgré les flottants : 0,1z² + 0,2z + 0,1 = 0", () => {
    const r = resoudreSecondDegre(0.1, 0.2, 0.1);
    expect(r.ok && r.cas).toBe("double");
  });
  it("a négatif et racines : -z² + 4 = 0 → -2 et 2", () => {
    const r = resoudreSecondDegre(-1, 0, 4);
    if (!r.ok) throw new Error("attendu ok");
    proche(r.racines[0], cx(-2, 0));
    proche(r.racines[1], cx(2, 0));
  });
  it("les racines vérifient l'équation (formule stable, b grand)", () => {
    const r = resoudreSecondDegre(1, 1e5, 1);
    if (!r.ok) throw new Error("attendu ok");
    for (const z of r.racines) {
      const val = add(add(mul(cx(1, 0), mul(z, z)), mul(cx(1e5, 0), z)), cx(1, 0));
      expect(Math.abs(val.re)).toBeLessThan(1e-6);
    }
  });
  it("a = 0, valeurs non finies et valeurs excessives sont refusés avec un message", () => {
    for (const [a, b, c] of [[0, 1, 2], [NaN, 1, 2], [1, Infinity, 2], [1e9, 1, 1]] as const) {
      const r = resoudreSecondDegre(a, b, c);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.erreur.length).toBeGreaterThan(10);
    }
  });
});

describe("distances, angles orientés et quotients", () => {
  const A = cx(0, 0);
  const B = cx(4, 0);
  const C = cx(0, 3);
  it("distances AB, AC, BC", () => {
    expect(distance(A, B)).toBe(4);
    expect(distance(A, C)).toBe(3);
    expect(distance(B, C)).toBe(5);
  });
  it("module d'un quotient : |Z| = BC/AC avec Z = (zC-zB)/(zC-zA)", () => {
    const Z = div(sub(C, B), sub(C, A)) as Cx;
    expect(modC(Z)).toBeCloseTo(distance(B, C) / distance(A, C), 12);
  });
  it("signe de l'angle orienté : (AB ; AC) positif si C est à gauche de AB", () => {
    expect(angleOriente(sub(B, A), sub(C, A))).toBeCloseTo(Math.PI / 2, 12);
    expect(angleOriente(sub(C, A), sub(B, A))).toBeCloseTo(-Math.PI / 2, 12);
  });
  it("arg((zC-zB)/(zC-zA)) = (CA ; CB) mod 2π", () => {
    const Z = div(sub(C, B), sub(C, A)) as Cx;
    expect(angleEgalMod2Pi(argument(Z) as number, angleEnSommet(A, B, C) as number)).toBe(true);
  });
  it("vecteur nul : pas d'angle", () => {
    expect(angleOriente(cx(0, 0), cx(1, 1))).toBeNull();
    expect(angleEnSommet(A, B, A)).toBeNull();
    expect(angleEnSommet(A, B, B)).toBeNull();
  });
  it("points confondus", () => {
    expect(confondus(cx(1, 1), cx(1, 1))).toBe(true);
    expect(confondus(cx(1, 1), cx(1, 1.0000001))).toBe(false);
  });
});

describe("alignement et orthogonalité", () => {
  it("points alignés ⇔ Q réel", () => {
    const A = cx(1, 1);
    const B = cx(2, 3);
    const C = cx(4, 7);
    expect(alignes(A, B, C)).toBe(true);
    const Q = quotientAlignement(A, B, C) as Cx;
    expect(estReel(Q)).toBe(true);
    expect(Q.re).toBeCloseTo(3, 12);
  });
  it("points non alignés ⇒ Q non réel", () => {
    const A = cx(0, 0);
    const B = cx(1, 0);
    const C = cx(1, 1);
    expect(alignes(A, B, C)).toBe(false);
    expect(estReel(quotientAlignement(A, B, C) as Cx)).toBe(false);
  });
  it("alignement indépendant de l'échelle (très grand et très petit)", () => {
    expect(alignes(cx(0, 0), cx(1e6, 2e6), cx(3e6, 6e6))).toBe(true);
    expect(alignes(cx(0, 0), cx(1e-6, 2e-6), cx(3e-6, 6e-6))).toBe(true);
    expect(alignes(cx(0, 0), cx(1e-6, 2e-6), cx(3e-6, 6.1e-6))).toBe(false);
  });
  it("orthogonalité ⇔ Q imaginaire pur non nul", () => {
    const A = cx(0, 0);
    const B = cx(4, 0);
    const C = cx(0, 3);
    expect(orthogonaux(A, B, C)).toBe(true);
    const Q = quotientAlignement(A, B, C) as Cx;
    expect(estImaginairePur(Q)).toBe(true);
    expect(orthogonaux(A, B, cx(1, 1))).toBe(false);
  });
  it("points confondus : question sans réponse (null), pas de faux positif", () => {
    expect(alignes(cx(1, 1), cx(1, 1), cx(5, 5))).toBeNull();
    expect(orthogonaux(cx(1, 1), cx(1, 1), cx(5, 5))).toBeNull();
    expect(quotientAlignement(cx(1, 1), cx(1, 1), cx(5, 5))).toBeNull();
  });
});

describe("nature du triangle", () => {
  it("rectangle 3-4-5", () => {
    const n = natureTriangle(cx(0, 0), cx(4, 0), cx(0, 3));
    expect(n).toMatchObject({ valide: true, rectangle: true, sommetRectangle: "A", isocele: false, equilateral: false });
  });
  it("isocèle rectangle", () => {
    const n = natureTriangle(cx(0, 0), cx(2, 0), cx(0, 2));
    expect(n).toMatchObject({ rectangle: true, isocele: true, sommetRectangle: "A", equilateral: false });
    expect(n.sommetsIsocele).toEqual(["A"]);
  });
  it("équilatéral (à la tolérance numérique près)", () => {
    const n = natureTriangle(cx(0, 0), cx(2, 0), cx(1, Math.sqrt(3)));
    expect(n).toMatchObject({ valide: true, equilateral: true, isocele: true, rectangle: false });
  });
  it("quelconque, et dégénérés (alignés, confondus) : pas un triangle", () => {
    expect(natureTriangle(cx(0, 0), cx(3, 1), cx(1, 4))).toMatchObject({ valide: true, isocele: false, rectangle: false, equilateral: false });
    expect(natureTriangle(cx(0, 0), cx(1, 1), cx(2, 2)).valide).toBe(false);
    expect(natureTriangle(cx(0, 0), cx(0, 0), cx(2, 2)).valide).toBe(false);
  });
  it("un arrondi d'affichage ne suffit pas : 1,0001 n'est pas 1", () => {
    expect(natureTriangle(cx(0, 0), cx(1, 0), cx(0, 1.0001)).isocele).toBe(false);
  });
});

describe("cercle circonscrit et cocyclicité", () => {
  const A = cx(1, 0);
  const B = cx(0, 1);
  const C = cx(-1, 0);
  it("cercle unité par 1, i, -1", () => {
    const c = cercleCirconscrit(A, B, C)!;
    proche(c.centre, cx(0, 0), 1e-12);
    expect(c.rayon).toBeCloseTo(1, 12);
  });
  it("pas de cercle si alignés ou confondus", () => {
    expect(cercleCirconscrit(cx(0, 0), cx(1, 1), cx(2, 2))).toBeNull();
    expect(cercleCirconscrit(cx(0, 0), cx(0, 0), cx(2, 2))).toBeNull();
  });
  it("D = -i est sur le cercle : birapport réel", () => {
    const D = cx(0, -1);
    expect(estReel(birapport(A, B, C, D) as Cx)).toBe(true);
    expect(cocyclicite(A, B, C, D).type).toBe("cocycliques");
  });
  it("D hors cercle : birapport non réel", () => {
    const D = cx(0, -2);
    expect(estReel(birapport(A, B, C, D) as Cx)).toBe(false);
    expect(cocyclicite(A, B, C, D).type).toBe("non-cocycliques");
  });
  it("accord entre birapport réel et distance au centre", () => {
    const c = cercleCirconscrit(A, B, C)!;
    for (const D of [cx(0, -1), cx(0.6, 0.8), cx(2, 0), cx(0.5, 0.5), cx(-0.6, -0.8)]) {
      const sur = Math.abs(distance(c.centre, D) - c.rayon) < 1e-9;
      expect(cocyclicite(A, B, C, D).type === "cocycliques").toBe(sur);
    }
  });
  it("D confondu avec A, B ou C : appartient au cercle, birapport non défini ou non utilisé", () => {
    expect(cocyclicite(A, B, C, cx(1, 0)).type).toBe("cocycliques");
    expect(cocyclicite(A, B, C, cx(0, 1)).type).toBe("cocycliques");
    expect(birapport(A, B, C, B)).toBeNull();
  });
  it("A, B, C alignés : aucun cercle, et un birapport réel ne prouve pas la cocyclicité", () => {
    const a = cx(0, 0);
    const b = cx(1, 0);
    const c = cx(3, 0);
    const d = cx(5, 0);
    const n = cocyclicite(a, b, c, d);
    expect(n).toEqual({ type: "abc-alignes", dSurLaDroite: true });
    expect(estReel(birapport(a, b, c, d) as Cx)).toBe(true); // réel, pourtant pas cocycliques
    expect(cocyclicite(a, b, c, cx(2, 1))).toEqual({ type: "abc-alignes", dSurLaDroite: false });
  });
  it("points confondus parmi A, B, C", () => {
    expect(cocyclicite(A, A, C, cx(0, 1)).type).toBe("points-confondus");
  });
});

describe("rotation de centre quelconque", () => {
  it("z' = a + e^{iθ}(z-a) : conserve AM et tourne de θ", () => {
    const a = cx(1, 1);
    const m = cx(3, 1);
    const m2 = rotation(a, Math.PI / 2, m);
    proche(m2, cx(1, 3));
    expect(distance(a, m2)).toBeCloseTo(distance(a, m), 12);
  });
  it("demi-tour et multiplication par i", () => {
    proche(rotation(cx(0, 0), Math.PI, cx(2, 3)), cx(-2, -3));
    proche(rotation(cx(0, 0), Math.PI / 2, cx(2, 1)), mul(I, cx(2, 1)));
  });
});

describe("tolérance relative", () => {
  it("presqueEgal tient compte de l'échelle", () => {
    expect(presqueEgal(1e9, 1e9 + 0.5)).toBe(true);
    expect(presqueEgal(1, 1 + 1e-6)).toBe(false);
  });
});

describe("formatage et valeurs exactes", () => {
  it("angles remarquables : cos/sin exacts cohérents avec Math.cos/Math.sin", () => {
    for (const a of ANGLES_REMARQUABLES) {
      expect(valeurExact(a.cos)).toBeCloseTo(Math.cos(a.rad), 12);
      expect(valeurExact(a.sin)).toBeCloseTo(Math.sin(a.rad), 12);
    }
  });
  it("tous les multiples remarquables de π/12 sur le cercle sont cohérents", () => {
    for (let u = -24; u <= 24; u++) {
      const t = trigExacte(u);
      if (!t) continue;
      expect(valeurExact(t.cos)).toBeCloseTo(Math.cos((u * Math.PI) / 12), 12);
      expect(valeurExact(t.sin)).toBeCloseTo(Math.sin((u * Math.PI) / 12), 12);
    }
  });
  it("écritures TeX", () => {
    expect(texExact(trigExacte(8)!.cos)).toBe("-\\frac{1}{2}");
    expect(texExact(trigExacte(8)!.sin)).toBe("\\frac{\\sqrt{3}}{2}");
    expect(texAngle((2 * Math.PI) / 3)).toBe("\\frac{2\\pi}{3}");
    expect(texAngle(Math.PI)).toBe("\\pi");
    expect(texAngle(-Math.PI / 2)).toBe("-\\frac{\\pi}{2}");
    expect(texAngle(0)).toBe("0");
    expect(texReel(Math.sqrt(3))).toBe("\\sqrt{3}");
    expect(texReel(-1.5)).toBe("-1{,}5");
    expect(texComplexe(cx(-1, Math.sqrt(3)))).toBe("-1 + \\sqrt{3}\\,i");
    expect(texComplexe(cx(0, 0))).toBe("0");
    expect(texComplexe(cx(0, -1))).toBe("-i");
    expect(texComplexe(cx(2, -3))).toBe("2 - 3i");
    expect(texModule(cx(2, 4))).toBe("2\\sqrt{5}");
    expect(texModule(cx(-3, 4))).toBe("5");
  });
  it("jamais -0 ni NaN dans l'affichage", () => {
    expect(texComplexe(cx(-0, 0))).toBe("0");
    expect(texReel(-0)).toBe("0");
    expect(texComplexe(cx(1e-12, 1))).toBe("i");
  });
});

describe("lecture des réponses de l'élève", () => {
  it("réels", () => {
    expect(lireReel("5")).toEqual({ ok: true, valeur: 5 });
    expect(lireReel("-2,5")).toEqual({ ok: true, valeur: -2.5 });
    expect(lireReel("1/2")).toEqual({ ok: true, valeur: 0.5 });
    const r = lireReel("2√3");
    expect(r.ok && r.valeur).toBeCloseTo(2 * Math.sqrt(3), 12);
    const s = lireReel("-sqrt(3)/2");
    expect(s.ok && s.valeur).toBeCloseTo(-Math.sqrt(3) / 2, 12);
    expect(lireReel("abc").ok).toBe(false);
    expect(lireReel("1/0").ok).toBe(false);
    expect(lireReel("").ok).toBe(false);
  });
  it("complexes", () => {
    expect(lireComplexe("11+10i")).toEqual({ ok: true, valeur: { re: 11, im: 10 } });
    expect(lireComplexe("-3 - 4 i")).toEqual({ ok: true, valeur: { re: -3, im: -4 } });
    expect(lireComplexe("i")).toEqual({ ok: true, valeur: { re: 0, im: 1 } });
    expect(lireComplexe("-i")).toEqual({ ok: true, valeur: { re: 0, im: -1 } });
    expect(lireComplexe("7")).toEqual({ ok: true, valeur: { re: 7, im: 0 } });
    expect(lireComplexe("1/10+7/10i")).toEqual({ ok: true, valeur: { re: 0.1, im: 0.7 } });
    expect(lireComplexe("0,1+0,7i")).toEqual({ ok: true, valeur: { re: 0.1, im: 0.7 } });
    expect(lireComplexe("2+*i").ok).toBe(false);
    expect(lireComplexe("").ok).toBe(false);
  });
  it("angles", () => {
    const a = lireAngle("2π/3");
    expect(a.ok && a.valeur).toBeCloseTo((2 * Math.PI) / 3, 12);
    const b = lireAngle("-pi/2");
    expect(b.ok && b.valeur).toBeCloseTo(-Math.PI / 2, 12);
    const c = lireAngle("pi");
    expect(c.ok && c.valeur).toBeCloseTo(Math.PI, 12);
    const d = lireAngle("2,094");
    expect(d.ok && d.valeur).toBeCloseTo(2.094, 12);
    expect(lireAngle("xyz").ok).toBe(false);
  });
});
