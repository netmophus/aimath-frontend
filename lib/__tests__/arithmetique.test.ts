import { describe, expect, it } from "vitest";

import {
  ErreurArithmetique,
  PREMIERS,
  abs,
  afficherLigneIntermediaire,
  bezout,
  divise,
  equationModP,
  equationZ2,
  euclide,
  facteursPremiers,
  gauss,
  lireEntier,
  modulo,
  pgcd,
  pgcdPpcmParFacteurs,
  ppcm,
  solutionZ2,
  systemeModP,
  type CoefficientsSysteme,
} from "../arithmetique";

const B = (n: number) => BigInt(n);

describe("lireEntier", () => {
  it("accepte les entiers relatifs et le signe moins typographique", () => {
    expect(lireEntier("252")).toEqual({ ok: true, valeur: B(252) });
    expect(lireEntier(" -7 ")).toEqual({ ok: true, valeur: B(-7) });
    expect(lireEntier("−7")).toEqual({ ok: true, valeur: B(-7) });
  });
  it("refuse vide, décimal, texte et nombre trop grand", () => {
    for (const t of ["", "  ", "1.5", "2,5", "abc", "1e3", "-", "12a"]) expect(lireEntier(t).ok).toBe(false);
    expect(lireEntier("1.5")).toMatchObject({ erreur: expect.stringContaining("décimal") });
    expect(lireEntier("1234567890123456").ok).toBe(false);
    expect(lireEntier("123456789012345").ok).toBe(true);
  });
});

describe("Euclide", () => {
  it("PGCD(252,180) = 36 avec les trois divisions du cours", () => {
    const r = euclide(B(252), B(180));
    expect(r.pgcd).toBe(B(36));
    expect(r.etapes.map((e) => [e.dividende, e.diviseur, e.quotient, e.reste])).toEqual([
      [B(252), B(180), B(1), B(72)],
      [B(180), B(72), B(2), B(36)],
      [B(72), B(36), B(2), B(0)],
    ]);
  });
  it("PGCD(4185,693) = 9", () => expect(pgcd(B(4185), B(693))).toBe(B(9)));
  it("PGCD(-15,0) = 15 sans division", () => {
    const r = euclide(B(-15), B(0));
    expect(r.pgcd).toBe(B(15));
    expect(r.etapes).toHaveLength(0);
  });
  it("PGCD(0,7) = 7 ; valeurs égales ; négatifs", () => {
    expect(pgcd(B(0), B(7))).toBe(B(7));
    expect(pgcd(B(12), B(12))).toBe(B(12));
    expect(pgcd(B(-12), B(-18))).toBe(B(6));
  });
  it("PGCD(0,0) : erreur contrôlée", () => expect(() => euclide(B(0), B(0))).toThrow(ErreurArithmetique));
  it("grands entiers exacts", () => {
    expect(pgcd(BigInt("999999999999999"), BigInt("333333333333333"))).toBe(BigInt("333333333333333"));
  });
});

describe("PGCD et PPCM par facteurs premiers", () => {
  it("60 = 2²×3×5 et 84 = 2²×3×7", () => {
    expect(facteursPremiers(60)).toEqual([{ p: 2, e: 2 }, { p: 3, e: 1 }, { p: 5, e: 1 }]);
    expect(facteursPremiers(84)).toEqual([{ p: 2, e: 2 }, { p: 3, e: 1 }, { p: 7, e: 1 }]);
    expect(facteursPremiers(1)).toEqual([]);
    expect(facteursPremiers(999999999989)).toEqual([{ p: 999999999989, e: 1 }]);
  });
  it("PGCD(60,84) = 12, PPCM = 420, produit 5040", () => {
    const r = pgcdPpcmParFacteurs(60, 84);
    expect(r.pgcd).toBe(B(12));
    expect(r.ppcm).toBe(B(420));
    expect(r.pgcd * r.ppcm).toBe(r.produit);
    expect(r.produit).toBe(B(5040));
  });
  it("PGCD × PPCM = |a × b| et accord avec Euclide", () => {
    for (let a = 1; a <= 40; a++)
      for (let b = 1; b <= 40; b++) {
        const r = pgcdPpcmParFacteurs(a, b);
        expect(r.pgcd * r.ppcm).toBe(B(a * b));
        expect(r.pgcd).toBe(pgcd(B(a), B(b)));
        expect(r.ppcm).toBe(ppcm(B(a), B(b)));
      }
  });
});

describe("Bézout", () => {
  it("35×(-1) + 18×2 = 1 avec la remontée du cours", () => {
    const r = bezout(B(35), B(18));
    expect(r.d).toBe(B(1));
    expect([r.u, r.v]).toEqual([B(-1), B(2)]);
    expect(r.remontee.map((e) => [e.k, e.alpha, e.beta])).toEqual([
      [1, B(1), B(-1)],
      [0, B(-1), B(2)],
    ]);
  });
  it("l'identité a·u + b·v = PGCD(a,b) est vérifiée pour tous les couples de [-30,30]² non nuls", () => {
    for (let a = -30; a <= 30; a++)
      for (let b = -30; b <= 30; b++) {
        if (a === 0 && b === 0) continue;
        const r = bezout(B(a), B(b));
        expect(B(a) * r.u + B(b) * r.v).toBe(r.d);
        expect(r.d).toBe(pgcd(B(a), B(b)));
      }
  });
  it("grands entiers", () => {
    const a = BigInt("123456789012345");
    const b = BigInt("-98765432109876");
    const r = bezout(a, b);
    expect(a * r.u + b * r.v).toBe(r.d);
  });
  it("(0,0) : erreur contrôlée", () => expect(() => bezout(B(0), B(0))).toThrow(ErreurArithmetique));
});

describe("Gauss", () => {
  it("(4,5,8) : les deux hypothèses sont vraies, 4 divise 8", () => {
    const r = gauss(B(4), B(5), B(8));
    expect(r).toMatchObject({ divBC: true, copremiers: true, applicable: true, aDiviseC: true });
    expect(r.produit).toBe(B(40));
  });
  it("(6,4,3) : a divise bc mais PGCD = 2, le théorème ne s'applique pas ; 6 ne divise pas 3", () => {
    const r = gauss(B(6), B(4), B(3));
    expect(r).toMatchObject({ divBC: true, copremiers: false, applicable: false, aDiviseC: false });
    expect(r.pgcdAB).toBe(B(2));
  });
  it("une hypothèse manquante ne prouve pas la négation : (6,4,6) n'applique pas Gauss mais 6 divise 6", () => {
    const r = gauss(B(6), B(4), B(6));
    expect(r.applicable).toBe(false);
    expect(r.aDiviseC).toBe(true);
  });
  it("valeurs nulles", () => {
    expect(gauss(B(0), B(0), B(5)).pgcdAB).toBeNull();
    expect(gauss(B(0), B(0), B(5)).applicable).toBe(false);
    expect(divise(B(0), B(0))).toBe(true);
    expect(divise(B(0), B(3))).toBe(false);
    expect(gauss(B(0), B(1), B(0))).toMatchObject({ divBC: true, copremiers: true, applicable: true, aDiviseC: true });
    expect(gauss(B(3), B(1), B(0)).applicable).toBe(true);
  });
  it("conclusion garantie : si les hypothèses sont vraies alors a divise c (balayage)", () => {
    for (let a = -8; a <= 8; a++)
      for (let b = -8; b <= 8; b++)
        for (let c = -8; c <= 8; c++) {
          const r = gauss(B(a), B(b), B(c));
          if (r.applicable) expect(r.aDiviseC).toBe(true);
        }
  });
});

describe("équations ax + by = c dans Z²", () => {
  function verifier(a: number, b: number, c: number) {
    const r = equationZ2(B(a), B(b), B(c));
    if (!r.solvable) return r;
    for (let k = -12; k <= 12; k++) {
      const { x, y } = solutionZ2(r, B(k));
      expect(B(a) * x + B(b) * y).toBe(B(c));
    }
    return r;
  }
  it("6x + 4y = 2 : (x0,y0) = (1,-1), x = 1 + 2k, y = -1 - 3k", () => {
    const r = verifier(6, 4, 2);
    expect(r).toMatchObject({ solvable: true, d: B(2), x0: B(1), y0: B(-1), pasX: B(2), pasY: B(3) });
  });
  it("34x - 21y = 5 et 35x + 18y = 7 ont des solutions", () => {
    expect(verifier(34, -21, 5).solvable).toBe(true);
    expect(verifier(35, 18, 7).solvable).toBe(true);
  });
  it("sans solution entière : 6x + 4y = 3", () => expect(verifier(6, 4, 3)).toMatchObject({ solvable: false, d: B(2) }));
  it("coefficient a nul ou b nul, sans division par zéro", () => {
    expect(verifier(0, 5, 10)).toMatchObject({ solvable: true, d: B(5) });
    expect(verifier(0, 5, 7).solvable).toBe(false);
    expect(verifier(7, 0, 21).solvable).toBe(true);
    expect(verifier(0, -5, 10).solvable).toBe(true);
  });
  it("coefficients négatifs", () => {
    verifier(-6, -4, 2);
    verifier(-6, 4, -2);
    verifier(6, -4, 10);
  });
  it("balayage exhaustif : x et y entiers, toutes les solutions bornées sont de la forme annoncée", () => {
    for (let a = -6; a <= 6; a++)
      for (let b = -6; b <= 6; b++) {
        if (a === 0 && b === 0) continue;
        for (let c = -8; c <= 8; c++) {
          const r = equationZ2(B(a), B(b), B(c));
          let existe = false;
          for (let x = -40; x <= 40 && !existe; x++)
            for (let y = -40; y <= 40; y++) if (a * x + b * y === c) { existe = true; break; }
          if (!r.solvable) expect(existe).toBe(false);
          else expect(B(a) * r.x0 + B(b) * r.y0).toBe(B(c));
        }
      }
  });
  it("(0,0) : erreur contrôlée", () => expect(() => equationZ2(B(0), B(0), B(0))).toThrow(ErreurArithmetique));
});

describe("congruences modulo p", () => {
  it("3x ≡ 5 (mod 7) : inverse 5, x ≡ 4", () => {
    const r = equationModP(B(3), B(5), 7);
    expect(r).toMatchObject({ cas: "inversible", inverse: 5, produit: 25, x: 4 });
  });
  it("4x ≡ 0 (mod 7) : x ≡ 0", () => expect(equationModP(B(4), B(0), 7)).toMatchObject({ cas: "inversible", x: 0 }));
  it("coefficient nul modulo p", () => {
    expect(equationModP(B(14), B(0), 7).cas).toBe("nulle-toutes");
    expect(equationModP(B(14), B(3), 7).cas).toBe("nulle-aucune");
    expect(equationModP(B(0), B(7), 7).cas).toBe("nulle-toutes");
  });
  it("coefficients négatifs et résolution exhaustive pour tous les modulos", () => {
    expect(modulo(-7, 5)).toBe(3);
    for (const p of PREMIERS)
      for (let a = -20; a <= 20; a++)
        for (let c = -20; c <= 20; c++) {
          const r = equationModP(B(a), B(c), p);
          const attendues = [] as number[];
          for (let x = 0; x < p; x++) if (modulo(a * x - c, p) === 0) attendues.push(x);
          if (r.cas === "inversible") expect(attendues).toEqual([r.x]);
          else if (r.cas === "nulle-toutes") expect(attendues).toHaveLength(p);
          else expect(attendues).toHaveLength(0);
        }
  });
  it("modulo composé refusé", () => expect(() => equationModP(B(1), B(1), 6)).toThrow(ErreurArithmetique));
});

describe("systèmes modulo p", () => {
  const s = (a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): CoefficientsSysteme => ({ a1, b1, c1, a2, b2, c2 });

  it("2x + 3y ≡ 1 et x + y ≡ 4 (mod 7) : (4, 0), avec la substitution du cours", () => {
    const r = systemeModP(7, s(2, 3, 1, 1, 1, 4));
    expect(r.kind).toBe("unique");
    expect(r.solutions).toEqual([[4, 0]]);
    expect(r.substitution).toMatchObject({
      eqIsolee: 2,
      isolee: "x",
      alpha: 4,
      m: 1,
      constante: 8,
      coefAutre: 1,
      K: 1,
      A: 1,
      D: 0,
      valeurAutre: 0,
      valeurIsolee: 4,
    });
  });
  it("système incompatible : x + y ≡ 1 et x + y ≡ 2 (mod 5)", () => {
    const r = systemeModP(5, s(1, 1, 1, 1, 1, 2));
    expect(r.kind).toBe("aucune");
    expect(r.substitution?.issue).toBe("aucune");
  });
  it("plusieurs solutions : x + y ≡ 1 et 2x + 2y ≡ 2 (mod 5) -> 5 couples", () => {
    const r = systemeModP(5, s(1, 1, 1, 2, 2, 2));
    expect(r.kind).toBe("plusieurs");
    expect(r.solutions).toHaveLength(5);
    expect(r.substitution?.issue).toBe("plusieurs");
  });
  it("déterminant nul modulo p sans jamais inverser 0 ; coefficients tous nuls", () => {
    expect(() => systemeModP(7, s(1, 2, 3, 2, 4, 6))).not.toThrow();
    const r0 = systemeModP(3, s(0, 0, 0, 3, 6, 0));
    expect(r0.substitution).toBeNull();
    expect(r0.kind).toBe("plusieurs");
    expect(r0.solutions).toHaveLength(9);
    expect(systemeModP(3, s(0, 0, 1, 0, 0, 0)).kind).toBe("aucune");
  });
  it("la méthode et l'énumération exhaustive concordent (p = 2, 3, 5 exhaustif ; p = 7, 11 échantillon)", () => {
    const verifier = (p: number, c: CoefficientsSysteme) => {
      const r = systemeModP(p, c);
      const sub = r.substitution;
      if (sub) {
        expect(sub.issue).toBe(r.kind);
        if (sub.issue === "unique") {
          const y = sub.isolee === "x" ? sub.valeurAutre! : sub.valeurIsolee!;
          const x = sub.isolee === "x" ? sub.valeurIsolee! : sub.valeurAutre!;
          expect(r.solutions).toEqual([[x, y]]);
        }
      }
    };
    for (const p of [2, 3, 5]) {
      for (let a1 = 0; a1 < p; a1++) for (let b1 = 0; b1 < p; b1++) for (let c1 = 0; c1 < p; c1++)
        for (let a2 = 0; a2 < p; a2++) for (let b2 = 0; b2 < p; b2++) for (let c2 = 0; c2 < p; c2++)
          verifier(p, s(a1, b1, c1, a2, b2, c2));
    }
    let graine = 12345;
    const alea = (n: number) => ((graine = (graine * 1103515245 + 12345) % 2147483648), graine % n);
    for (let i = 0; i < 4000; i++) {
      const p = i % 2 ? 7 : 11;
      verifier(p, s(alea(p), alea(p), alea(p), alea(p), alea(p), alea(p)));
    }
  });
  it("non-régression : pas de doublon « y ≡ 0 » quand le coefficient vaut 1 (exemple du cours)", () => {
    const sub = systemeModP(7, s(2, 3, 1, 1, 1, 4)).substitution!;
    expect(sub).toMatchObject({ A: 1, D: 0, valeurAutre: 0, issue: "unique" });
    expect(afficherLigneIntermediaire(sub)).toBe(false);
  });
  it("la ligne intermédiaire reste affichée quand A ≠ 1 ou quand il n'y a pas de solution unique", () => {
    const sub = systemeModP(7, s(1, 1, 3, 2, 5, 1)).substitution!;
    expect(sub.A).not.toBe(1);
    expect(afficherLigneIntermediaire(sub)).toBe(true);
    expect(afficherLigneIntermediaire(systemeModP(5, s(1, 1, 1, 2, 2, 2)).substitution!)).toBe(true);
    expect(afficherLigneIntermediaire(systemeModP(5, s(1, 1, 1, 1, 1, 2)).substitution!)).toBe(true);
  });
  it("valeurs négatives réduites", () => {
    const r = systemeModP(7, s(-5, 3, 1, 1, -6, 4));
    expect(r.reduit).toEqual({ a1: 2, b1: 3, c1: 1, a2: 1, b2: 1, c2: 4 });
    expect(abs(B(-5))).toBe(B(5));
  });
});

describe("bloc ```pgcd", () => {
  it("parse l'onglet d'ouverture, défaut euclide", async () => {
    const { parserBlocLaboPgcd, LaboPgcdSyntaxeError } = await import("../laboPgcd");
    expect(parserBlocLaboPgcd("")).toEqual({ onglet: "euclide" });
    expect(parserBlocLaboPgcd("onglet: Modulo")).toEqual({ onglet: "modulo" });
    expect(() => parserBlocLaboPgcd("onglet: truc")).toThrow(LaboPgcdSyntaxeError);
    expect(() => parserBlocLaboPgcd("x: 1")).toThrow(LaboPgcdSyntaxeError);
    expect(() => parserBlocLaboPgcd("onglet")).toThrow(LaboPgcdSyntaxeError);
  });
});
