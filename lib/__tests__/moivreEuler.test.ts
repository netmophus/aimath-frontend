import { describe, expect, it } from "vitest";
import katex from "katex";

import { cx, enRadians, modC, puissanceEntiere, racinesNiemes, depuisPolaire } from "@/lib/complexes";
import {
  argumentsReduits,
  estPolygoneRegulier,
  polygoneRacines,
  pointsEuler,
  puissanceMoivre,
  racinesDe,
  suitePuissances,
  verifierRacines,
} from "@/lib/moivreEuler";
import {
  IdentiteNonReelleErreur,
  anglesMultiples,
  binomial,
  combinaisonsAdmissibles,
  evaluerCosMultiple,
  evaluerInitial,
  evaluerLineaire,
  evaluerSinMultiple,
  linearise,
  polyEval,
  rat,
  ratAdd,
  ratMul,
} from "@/lib/moivreEulerSymbolique";
import {
  termesBinomeBruts,
  termesBinomeEvalues,
  termesSubstitues,
  texAligne,
  texDenominateurEuler,
  texDevFacteur,
  texExp,
  texExpression,
  texLaurent,
  texLignes,
  texLineaire,
  texLineaireAligne,
  texMoivreBinome,
  texPartie,
  texPolynomeTrig,
  texRegroupement,
  texSinMultipleSimplifie,
  texSubstitution,
} from "@/lib/moivreEulerAffichage";
import { texComplexe } from "@/lib/complexesTex";

const proche = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
const XS = [0, 0.3, 1, Math.PI / 3, 2, -1.7, 3.1, 5.9, -4.4];

describe("Moivre", () => {
  it("(1+i)^8 = 16 : module 16, angle total 2π, argument principal 0 après un tour", () => {
    const r = puissanceMoivre(Math.SQRT2, Math.PI / 4, 8);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(proche(r.moduleN, 16)).toBe(true);
    expect(proche(r.angleTotal, 2 * Math.PI)).toBe(true);
    expect(proche(r.zn.re, 16)).toBe(true);
    expect(Math.abs(r.zn.im)).toBeLessThan(1e-12);
    expect(r.argPrincipal).toBe(0);
    expect(r.tours).toBe(1);
    // contrôle indépendant, exact en entiers : (1+i)^8 = 16
    expect(puissanceEntiere(cx(1, 1), 8)).toEqual({ re: 16, im: 0 });
  });
  it("n = 0 donne 1, n = 1 redonne z", () => {
    const z0 = puissanceMoivre(2, 1.2, 0);
    expect(z0.ok && z0.zn).toEqual({ re: 1, im: 0 });
    const z1 = puissanceMoivre(2, 1.2, 1);
    expect(z1.ok && proche(z1.zn.re, z1.z.re) && proche(z1.zn.im, z1.z.im)).toBe(true);
  });
  it("puissance négative : (1−i)^{-2} = i/2", () => {
    const r = puissanceMoivre(Math.SQRT2, -Math.PI / 4, -2);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Math.abs(r.zn.re)).toBeLessThan(1e-12);
    expect(proche(r.zn.im, 0.5)).toBe(true);
    const exact = puissanceEntiere(cx(1, -1), -2)!;
    expect(proche(exact.im, 0.5) && Math.abs(exact.re) < 1e-12).toBe(true);
  });
  it("angle négatif et angle supérieur à un tour : z^n identique à la forme algébrique", () => {
    for (const theta of [enRadians(-50), enRadians(400), enRadians(-725), enRadians(1000)]) {
      for (const n of [-5, -2, 1, 3, 6]) {
        const r = puissanceMoivre(1.3, theta, n);
        expect(r.ok).toBe(true);
        if (!r.ok) continue;
        const attendu = puissanceEntiere(r.z, n)!;
        expect(proche(r.zn.re, attendu.re, 1e-8)).toBe(true);
        expect(proche(r.zn.im, attendu.im, 1e-8)).toBe(true);
        expect(proche(r.angleTotal, n * theta)).toBe(true); // l'angle TOTAL n'est jamais réduit
      }
    }
  });
  it("argument principal dans ]-π, π] et tours cohérents", () => {
    const r = puissanceMoivre(1, enRadians(100), 7);
    expect(r.ok).toBe(true);
    if (!r.ok || r.argPrincipal === null) return;
    expect(r.argPrincipal).toBeGreaterThan(-Math.PI);
    expect(r.argPrincipal).toBeLessThanOrEqual(Math.PI);
    expect(proche(r.argPrincipal + 2 * Math.PI * r.tours, r.angleTotal)).toBe(true);
  });
  it("z = 0 : puissances négatives et 0^0 refusées, puissances positives donnent 0 sans argument", () => {
    for (const n of [-3, -1, 0]) expect(puissanceMoivre(0, 0, n).ok).toBe(false);
    const r = puissanceMoivre(0, 0, 4);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.zn).toEqual({ re: 0, im: 0 });
      expect(r.argPrincipal).toBeNull();
    }
  });
  it("entrées invalides ou démesurées : message d'erreur, jamais NaN", () => {
    expect(puissanceMoivre(NaN, 0, 2).ok).toBe(false);
    expect(puissanceMoivre(-1, 0, 2).ok).toBe(false);
    expect(puissanceMoivre(2, 0, 1.5).ok).toBe(false);
    expect(puissanceMoivre(1e9, 0, 5).ok).toBe(false);
  });
  it("suite des puissances z^k : l'angle augmente de θ à chaque multiplication", () => {
    const s = suitePuissances(1, enRadians(30), 12);
    expect(s).toHaveLength(13);
    expect(proche(s[12].re, 1, 1e-9)).toBe(true);
    expect(Math.abs(s[12].im)).toBeLessThan(1e-12);
    expect(suitePuissances(2, 0, -3).map((z) => z.re)).toEqual([1, 0.5, 0.25, 0.125]);
  });
});

describe("Euler", () => {
  it("e^{iθ} + e^{-iθ} = 2cos θ (imaginaire exactement nul) et e^{iθ} − e^{-iθ} = 2i sin θ (réel exactement nul)", () => {
    for (const deg of [0, 30, 45, 60, 90, 180, -30, -135, 270, 720]) {
      const t = enRadians(deg);
      const e = pointsEuler(t);
      expect(e.somme.im).toBe(0);
      expect(e.difference.re).toBe(0);
      expect(proche(e.somme.re, 2 * Math.cos(t))).toBe(true);
      expect(proche(e.difference.im, 2 * Math.sin(t))).toBe(true);
      expect(proche(modC(e.ep), 1)).toBe(true);
    }
  });
  it("e^{-iθ} est le symétrique de e^{iθ} par rapport à l'axe réel", () => {
    const e = pointsEuler(1.1);
    expect(e.em.re).toBe(e.ep.re);
    expect(e.em.im).toBe(-e.ep.im);
  });
  it("valeurs remarquables exactes aux angles de cadran (pas de 6e-17)", () => {
    expect(pointsEuler(Math.PI / 2).cos).toBe(0);
    expect(pointsEuler(Math.PI).sin).toBe(0);
    expect(pointsEuler(0).sin).toBe(0);
    expect(Object.is(pointsEuler(Math.PI).somme.im, -0)).toBe(false);
  });
});

describe("linéarisation exacte (moteur symbolique)", () => {
  it("cos⁴ x = (3 + 4cos 2x + cos 4x)/8", () => {
    const l = linearise(0, 4);
    expect(l.denominateurCommun).toBe(8);
    expect([l.numConstante, l.numCos[2], l.numCos[4]]).toEqual([3, 4, 1]);
    expect(l.numSin.every((c) => c === 0)).toBe(true);
    expect(l.numCos[1]).toBe(0);
    expect(l.numCos[3]).toBe(0);
  });
  it("sin⁴ x = (3 − 4cos 2x + cos 4x)/8", () => {
    const l = linearise(4, 0);
    expect(l.denominateurCommun).toBe(8);
    expect([l.numConstante, l.numCos[2], l.numCos[4]]).toEqual([3, -4, 1]);
  });
  it("cos⁵ x = (10cos x + 5cos 3x + cos 5x)/16", () => {
    const l = linearise(0, 5);
    expect(l.denominateurCommun).toBe(16);
    expect([l.numCos[1], l.numCos[3], l.numCos[5]]).toEqual([10, 5, 1]);
    expect(l.numConstante).toBe(0);
  });
  it("sin³ x cos² x = (2sin x + sin 3x − sin 5x)/16", () => {
    const l = linearise(3, 2);
    expect(l.denominateurCommun).toBe(16);
    expect([l.numSin[1], l.numSin[3], l.numSin[5]]).toEqual([2, 1, -1]);
    expect(l.numCos.every((c) => c === 0)).toBe(true);
    expect(texLineaire(l)).toBe("\\dfrac{2\\,\\sin\\,x + \\sin\\,3x - \\sin\\,5x}{16}");
  });
  it("le dénominateur affiché de sin³x cos²x est -32i (puissances de i exactes)", () => {
    expect(texDenominateurEuler(3, 2)).toBe("-32i");
    expect(texDenominateurEuler(0, 4)).toBe("16");
    expect(texDenominateurEuler(2, 0)).toBe("-4");
    expect(texDenominateurEuler(1, 0)).toBe("2i");
    expect(texDenominateurEuler(4, 1)).toBe("32");
    expect(texSubstitution(3, 2)).toContain("\\dfrac{(e^{ix}-e^{-ix})^{3}(e^{ix}+e^{-ix})^{2}}{-32i}");
  });
  it("TOUTES les combinaisons 1 ≤ p+q ≤ 5 : résultat réel (aucune exception), exact et numériquement cohérent", () => {
    const combos = combinaisonsAdmissibles(5);
    expect(combos).toHaveLength(20); // (p,q) avec p+q de 1 à 5 : 2+3+4+5+6
    for (const [p, q] of combos) {
      const l = linearise(p, q);
      for (const x of XS) expect(proche(evaluerLineaire(l, x), evaluerInitial(p, q, x), 1e-12), `p=${p} q=${q} x=${x}`).toBe(true);
      // sin^p cos^q est pair en x si p pair (que des cos), impair si p impair (que des sin)
      if (p % 2 === 0) expect(l.numSin.every((c) => c === 0), `sin résiduel p=${p} q=${q}`).toBe(true);
      else expect(l.numCos.every((c) => c === 0) && l.numConstante === 0, `cos résiduel p=${p} q=${q}`).toBe(true);
      // seuls des harmoniques de même parité que p+q apparaissent
      for (let k = 0; k <= l.degreMax; k++) if ((p + q - k) % 2 !== 0) expect(l.numCos[k] === 0 && l.numSin[k] === 0).toBe(true);
      expect(l.degreMax).toBe(p + q);
      // fraction commune cohérente : somme(coefficient/D) retrouve les rationnels
      expect(Number.isInteger(l.denominateurCommun)).toBe(true);
    }
  });
  it("combinaison hors domaine refusée", () => {
    expect(() => linearise(0, 0)).toThrow(RangeError);
    expect(() => linearise(-1, 2)).toThrow(RangeError);
    expect(() => linearise(1.5, 2)).toThrow(RangeError);
    expect(IdentiteNonReelleErreur.prototype).toBeInstanceOf(Error);
  });
  it("rationnels exacts", () => {
    expect(ratAdd(rat(1, 2), rat(1, 3))).toEqual({ n: 5, d: 6 });
    expect(ratMul(rat(2, 4), rat(-3, 6))).toEqual({ n: -1, d: 4 });
    expect(rat(0, -5)).toEqual({ n: 0, d: 1 });
    expect(Object.is(rat(0, -5).n, -0)).toBe(false);
  });
  it("texExpression gère les exposants 0 et 1", () => {
    expect(texExpression(3, 2)).toBe("\\sin^{3}x\\cos^{2}x");
    expect(texExpression(1, 0)).toBe("\\sin\\,x");
    expect(texExpression(0, 1)).toBe("\\cos\\,x");
  });
});

describe("angles multiples", () => {
  it("n = 3 : cos 3x = 4cos³x − 3cos x et sin 3x = 3 sin x − 4 sin³x", () => {
    const a = anglesMultiples(3);
    expect(a.polyCos).toEqual([0, -3, 0, 4]);
    expect(a.polySin).toEqual([0, 3, 0, -4]);
    expect(a.sinAvecFacteurCos).toBe(false);
    expect(texPolynomeTrig(a.polyCos, "cos")).toBe("4\\,\\cos^{3}x - 3\\,\\cos\\,x");
    expect(texSinMultipleSimplifie(a)).toBe("3\\,\\sin\\,x - 4\\,\\sin^{3}x");
  });
  it("coefficients du binôme et puissances de i", () => {
    const a = anglesMultiples(3);
    expect(a.termes.map((t) => t.binom)).toEqual([1, 3, 3, 1]);
    expect(a.termes.map((t) => t.puissanceI)).toEqual([[1, 0], [0, 1], [-1, 0], [0, -1]]);
    expect(a.termesCos.map((t) => t.coefReel)).toEqual([1, -3]); // cos³ − 3 cos sin²
    expect(a.termesSin.map((t) => t.coefReel)).toEqual([3, -1]); // 3 cos² sin − sin³
    expect(binomial(5, 2)).toBe(10);
  });
  it("n = 2, 4, 5 : polynômes de Tchebychev et formes en sinus", () => {
    expect(anglesMultiples(2).polyCos).toEqual([-1, 0, 2]);
    expect(anglesMultiples(2).polySin).toEqual([0, 2]); // sin 2x = cos x · 2 sin x
    expect(anglesMultiples(2).sinAvecFacteurCos).toBe(true);
    expect(anglesMultiples(4).polyCos).toEqual([1, 0, -8, 0, 8]);
    expect(anglesMultiples(4).polySin).toEqual([0, 4, 0, -8]); // sin 4x = cos x (4 sin x − 8 sin³ x)
    expect(anglesMultiples(5).polyCos).toEqual([0, 5, 0, -20, 0, 16]);
    expect(anglesMultiples(5).polySin).toEqual([0, 5, 0, -20, 0, 16]);
  });
  it("égalité numérique pour n de 2 à 12 sur plusieurs angles (en complément de la preuve symbolique)", () => {
    for (let n = 2; n <= 12; n++) {
      const a = anglesMultiples(n);
      for (const x of XS) {
        const c = evaluerCosMultiple(a, x);
        const s = evaluerSinMultiple(a, x);
        expect(proche(c.polynome, c.direct, 1e-6), `cos n=${n} x=${x}`).toBe(true);
        expect(proche(s.polynome, s.direct, 1e-6), `sin n=${n} x=${x}`).toBe(true);
      }
    }
  });
  it("n hors domaine refusé", () => {
    expect(() => anglesMultiples(0)).toThrow(RangeError);
    expect(() => anglesMultiples(2.5)).toThrow(RangeError);
    expect(polyEval([1, 2, 3], 2)).toBe(17);
  });
});

describe("racines n-ièmes", () => {
  it("z³ = 8i : √3 + i, −√3 + i, −2i", () => {
    const r = racinesDe(8, Math.PI / 2, 3);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.racines).toHaveLength(3);
    expect(proche(r.R, 2)).toBe(true);
    expect(proche(r.racines[0].z.re, Math.sqrt(3))).toBe(true);
    expect(proche(r.racines[0].z.im, 1)).toBe(true);
    expect(proche(r.racines[1].z.re, -Math.sqrt(3))).toBe(true);
    expect(proche(r.racines[1].z.im, 1)).toBe(true);
    expect(r.racines[2].z).toEqual({ re: 0, im: -2 });
    expect(texComplexe(r.racines[0].z)).toBe("\\sqrt{3} + i");
    expect(texComplexe(r.racines[1].z)).toBe("-\\sqrt{3} + i");
    expect(texComplexe(r.racines[2].z)).toBe("-2i");
  });
  it("accord avec le moteur général racinesNiemes (arguments modulo 2π)", () => {
    const w = depuisPolaire(5, 1.1);
    const mien = racinesDe(5, 1.1, 7);
    const ref = racinesNiemes(w, 7)!;
    expect(mien.ok).toBe(true);
    if (!mien.ok) return;
    mien.racines.forEach((x, k) => {
      expect(proche(x.z.re, ref[k].z.re)).toBe(true);
      expect(proche(x.z.im, ref[k].z.im)).toBe(true);
    });
  });
  it("racines de l'unité (n = 2, 3, 4, 5, 12) : module 1, somme nulle, vérification z^n = 1", () => {
    for (const n of [2, 3, 4, 5, 12]) {
      const r = racinesDe(1, 0, n);
      expect(r.ok).toBe(true);
      if (!r.ok) continue;
      expect(r.racines).toHaveLength(n);
      r.racines.forEach((x) => expect(proche(modC(x.z), 1)).toBe(true));
      const somme = r.racines.reduce((s, x) => ({ re: s.re + x.z.re, im: s.im + x.z.im }), { re: 0, im: 0 });
      expect(Math.abs(somme.re)).toBeLessThan(1e-12);
      expect(Math.abs(somme.im)).toBeLessThan(1e-12);
      const b = verifierRacines(r);
      expect(b.toutesVerifient).toBe(true);
      expect(b.distinctes).toBe(true);
    }
    const r2 = racinesDe(1, 0, 2);
    expect(r2.ok && r2.racines.map((x) => x.z)).toEqual([{ re: 1, im: 0 }, { re: -1, im: 0 }]);
  });
  it("cas particuliers : réel négatif, imaginaire pur, argument négatif, grand argument, module très petit", () => {
    for (const [rho, phi, n] of [
      [4, 0, 2],
      [16, Math.PI, 4],
      [1, Math.PI / 2, 5],
      [3, -2.2, 6],
      [3, 9.5, 6],
      [1e-6, 0.7, 3],
      [1e6, -1, 12],
    ] as Array<[number, number, number]>) {
      const r = racinesDe(rho, phi, n);
      expect(r.ok, `${rho} ${phi} ${n}`).toBe(true);
      if (!r.ok) continue;
      const b = verifierRacines(r);
      expect(b.toutesVerifient, `${rho} ${phi} ${n}`).toBe(true);
      expect(b.distinctes).toBe(true);
    }
    const neg = racinesDe(4, Math.PI, 2);
    expect(neg.ok && Math.abs(neg.racines[0].z.re) < 1e-12 && proche(neg.racines[0].z.im, 2)).toBe(true);
  });
  it("Z = 0 : explication distincte (aucune racine calculée par la formule)", () => {
    const r = racinesDe(0, 0, 4);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.nul).toBe(true);
      expect(r.erreur).toContain("0");
    }
  });
  it("entrées invalides", () => {
    for (const [rho, phi, n] of [[-1, 0, 3], [NaN, 0, 3], [2, Infinity, 3], [2, 0, 0], [2, 0, 2.5]] as Array<[number, number, number]>) {
      const r = racinesDe(rho, phi, n);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.nul).toBe(false);
    }
  });
  it("une valeur erronée est détectée par la vérification (pas de faux positif)", () => {
    const r = racinesDe(8, Math.PI / 2, 3);
    if (!r.ok) throw new Error("attendu");
    const faux = { ...r, racines: r.racines.map((x, i) => (i === 1 ? { ...x, z: { re: x.z.re + 0.01, im: x.z.im } } : x)) };
    const b = verifierRacines(faux);
    expect(b.toutesVerifient).toBe(false);
    expect(b.details[0].ok).toBe(true);
    expect(b.details[1].ok).toBe(false);
  });
});

describe("géométrie des racines", () => {
  it("n sommets, écart 2π/n, rayon ρ^{1/n}, polygone régulier pour n = 3..12", () => {
    for (let n = 3; n <= 12; n++) {
      const p = polygoneRacines(5, 0.8, n);
      expect(p.ok).toBe(true);
      if (!p.ok) continue;
      expect(p.sommets).toHaveLength(n);
      expect(proche(p.delta, (2 * Math.PI) / n)).toBe(true);
      expect(proche(p.R, Math.pow(5, 1 / n))).toBe(true);
      expect(estPolygoneRegulier(p)).toBe(true);
      expect(proche(p.cote!, 2 * p.R * Math.sin(Math.PI / n))).toBe(true);
      expect(proche(p.perimetre!, n * p.cote!)).toBe(true);
      p.cotes.forEach((c) => expect(proche(c, p.cote!, 1e-9)).toBe(true));
    }
  });
  it("triangle équilatéral, carré, pentagone, hexagone : côtés et angles attendus", () => {
    const tri = polygoneRacines(1, 0, 3);
    expect(tri.ok && proche(tri.cote!, Math.sqrt(3))).toBe(true);
    const car = polygoneRacines(1, 0, 4);
    expect(car.ok && proche(car.cote!, Math.SQRT2)).toBe(true);
    const hex = polygoneRacines(1, 0, 6);
    expect(hex.ok && proche(hex.cote!, 1)).toBe(true); // côté de l'hexagone = rayon
    const pent = polygoneRacines(1, 0, 5);
    expect(pent.ok && proche(pent.cote!, 2 * Math.sin(Math.PI / 5))).toBe(true);
  });
  it("n = 2 : deux points diamétralement opposés, AUCUN polygone, pas de côté ni de périmètre", () => {
    const p = polygoneRacines(9, 0.4, 2);
    expect(p.ok).toBe(true);
    if (!p.ok) return;
    expect(p.aPolygone).toBe(false);
    expect(p.cote).toBeNull();
    expect(p.perimetre).toBeNull();
    expect(p.cotes).toEqual([]);
    expect(estPolygoneRegulier(p)).toBe(false);
    expect(proche(p.sommets[0].re, -p.sommets[1].re)).toBe(true);
    expect(proche(p.sommets[0].im, -p.sommets[1].im)).toBe(true);
    expect(proche(p.R, 3)).toBe(true);
  });
  it("Z = 0 : pas de polygone", () => {
    expect(polygoneRacines(0, 0, 5).ok).toBe(false);
  });
  it("invariance du cercle : le rayon ne dépend pas de l'argument de Z, et la rotation vaut Δφ/n", () => {
    const n = 5;
    const base = polygoneRacines(3, 0.2, n);
    if (!base.ok) throw new Error("attendu");
    for (const dphi of [0.5, 1, 2.9, -1.3, 7]) {
      const p = polygoneRacines(3, 0.2 + dphi, n);
      if (!p.ok) throw new Error("attendu");
      expect(proche(p.R, base.R)).toBe(true);
      p.sommets.forEach((s) => expect(proche(modC(s), base.R, 1e-9)).toBe(true));
      // chaque sommet k a tourné de Δφ/n (même indexation k)
      p.sommets.forEach((s, k) => {
        const a0 = Math.atan2(base.sommets[k].im, base.sommets[k].re);
        const a1 = Math.atan2(s.im, s.re);
        const ecart = Math.atan2(Math.sin(a1 - a0 - dphi / n), Math.cos(a1 - a0 - dphi / n));
        expect(Math.abs(ecart)).toBeLessThan(1e-9);
      });
      expect(estPolygoneRegulier(p)).toBe(true);
    }
  });
  it("arguments réduits dans ]-π, π]", () => {
    const p = polygoneRacines(1, 5, 7);
    if (!p.ok) throw new Error("attendu");
    argumentsReduits(p).forEach((a) => {
      expect(a).toBeGreaterThan(-Math.PI - 1e-12);
      expect(a).toBeLessThanOrEqual(Math.PI + 1e-12);
    });
  });
});

describe("tout le TeX généré est valide pour KaTeX (mode strict : une erreur de syntaxe fait échouer le test)", () => {
  const strict = (expr: string) => katex.renderToString(expr, { throwOnError: true, output: "html" });

  it("linéarisation : toutes les combinaisons 1 ≤ p+q ≤ 5, toutes les étapes", () => {
    for (const [p, q] of combinaisonsAdmissibles(5)) {
      const l = linearise(p, q);
      const termes = [...l.P.keys()].sort((a, b) => b - a).map((k) => ({ coef: l.P.get(k) ?? 0, base: texExp(k) }));
      const exprs = [
        texExpression(p, q),
        texSubstitution(p, q),
        texDenominateurEuler(p, q),
        texAligne(termes, "N =", 4),
        texLaurent(l.P),
        texLineaire(l),
        texLineaireAligne(l),
        `\\boxed{${texExpression(p, q)} = ${texLineaireAligne(l)}}`,
        ...(p > 0 ? [texDevFacteur(p, -1)] : []),
        ...(q > 0 ? [texDevFacteur(q, 1)] : []),
        ...texRegroupement(l).map((s) => `\\begin{aligned}${s}\\end{aligned}`),
      ];
      for (const e of exprs) expect(() => strict(e), `p=${p} q=${q} : ${e}`).not.toThrow();
    }
  });

  it("angles multiples : n de 2 à 12, cosinus et sinus, toutes les étapes", () => {
    for (let n = 2; n <= 12; n++) {
      const a = anglesMultiples(n);
      const exprs = [
        texMoivreBinome(n),
        texLignes(termesBinomeBruts(n, a), 2, `${texMoivreBinome(n)} =&`),
        texLignes(termesBinomeEvalues(n, a), 2, "=&"),
        `\\cos ${n}x = ${texPartie(n, a, "cos")}`,
        `\\sin ${n}x = ${texPartie(n, a, "sin")}`,
        `\\cos\\,${n}x = ${texLignes(termesSubstitues(n, a, "cos"), 2)}`,
        `\\sin\\,${n}x = ${texLignes(termesSubstitues(n, a, "sin"), 2)}`,
        `\\boxed{\\cos\\,${n}x = ${texPolynomeTrig(a.polyCos, "cos")}}`,
        `\\boxed{\\sin\\,${n}x = ${texSinMultipleSimplifie(a)}}`,
      ];
      for (const e of exprs) expect(() => strict(e), `n=${n} : ${e}`).not.toThrow();
    }
  });

  it("aucun caractère de contrôle (backspace, tabulation…) dans le TeX : signe d'un antislash mal échappé", () => {
    const controle = /[\u0000-\u0008\u000b-\u001f]/;
    for (const [p, q] of combinaisonsAdmissibles(5)) {
      const l = linearise(p, q);
      for (const e of [texSubstitution(p, q), texLineaire(l), texLineaireAligne(l), ...texRegroupement(l)]) expect(controle.test(e)).toBe(false);
    }
    for (let n = 2; n <= 12; n++) {
      const a = anglesMultiples(n);
      for (const e of [...termesBinomeBruts(n, a), ...termesBinomeEvalues(n, a), ...termesSubstitues(n, a, "cos"), ...termesSubstitues(n, a, "sin"), texLignes(termesBinomeBruts(n, a), 2)]) expect(controle.test(e)).toBe(false);
    }
  });
});
