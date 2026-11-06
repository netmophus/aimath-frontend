import { describe, expect, it } from "vitest";

import {
  analyserModulo,
  arbreTermine,
  candidatsPremiers,
  creerArbre,
  cribleEratosthene,
  decomposerNoeud,
  diviseurDepuisExposants,
  diviseursDeZero,
  diviseursPositifs,
  elimines,
  estCarreParfait,
  estInversible,
  estPremier,
  facteursDeFeuilles,
  facteursPremiers,
  fusionnerExposants,
  inverseModulaire,
  lireNaturel,
  memesFacteurs,
  multiplicateurMinimal,
  nombreDiviseurs,
  pasGuide,
  pgcdPpcmExposants,
  premiersJusqua,
  produitFacteurs,
  racineEntiere,
  racinePuissance,
  resoudreCongruence,
  tableMultiplication,
  testerDiviseur,
  verdictPrimalite,
} from "../premiers";
import { parserBlocLaboPremiers, LaboPremiersSyntaxeError } from "../laboPremiers";

const PREMIERS_200 = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163,
  167, 173, 179, 181, 191, 193, 197, 199,
];

describe("crible d'Ératosthène", () => {
  it.each([20, 30, 100, 200])("donne la liste exacte des premiers jusqu'à %i", (limite) => {
    const c = cribleEratosthene(limite);
    expect(c.premiers).toEqual(PREMIERS_200.filter((p) => p <= limite));
    expect(c.premiers).toEqual(premiersJusqua(limite));
  });
  it("exclut 1 et conserve 2", () => {
    const c = cribleEratosthene(30);
    expect(c.premiers).not.toContain(1);
    expect(c.premiers[0]).toBe(2);
    expect(elimines(c, c.etapes.length).has(2)).toBe(false);
  });
  it("ne s'arrête qu'aux premiers p tels que p² ≤ limite", () => {
    expect(cribleEratosthene(100).etapes.map((e) => e.p)).toEqual([2, 3, 5, 7]);
    expect(cribleEratosthene(30).etapes.map((e) => e.p)).toEqual([2, 3, 5]);
    expect(cribleEratosthene(49).etapes.map((e) => e.p)).toEqual([2, 3, 5, 7]);
  });
  it("ne compte jamais deux fois un multiple déjà barré", () => {
    const c = cribleEratosthene(30);
    const [e2, e3] = c.etapes;
    expect(e2.nouveaux).toEqual([4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]);
    expect(e3.examines).toEqual([6, 9, 12, 15, 18, 21, 24, 27, 30]);
    expect(e3.nouveaux).toEqual([9, 15, 21, 27]);
    expect(e3.dejaElimines).toEqual([6, 12, 18, 24, 30]);
    const tous = c.etapes.flatMap((e) => e.nouveaux);
    expect(new Set(tous).size).toBe(tous.length);
  });
});

describe("primalité", () => {
  it.each([2, 3, 37, 97, 197])("%i est premier", (n) => expect(estPremier(n)).toBe(true));
  it.each([91, 143, 221, 49, 121, 169])("%i est composé", (n) => expect(estPremier(n)).toBe(false));
  it("n'est pas premier : 0, 1, négatif", () => {
    expect(estPremier(0)).toBe(false);
    expect(estPremier(1)).toBe(false);
    expect(estPremier(-7)).toBe(false);
  });
  it("seuil de la racine carrée exacte", () => {
    expect(racineEntiere(49)).toBe(7);
    expect(racineEntiere(48)).toBe(6);
    expect(racineEntiere(50)).toBe(7);
    expect(racineEntiere(999999999)).toBe(31622);
    expect(candidatsPremiers(97)).toEqual([2, 3, 5, 7]);
    expect(candidatsPremiers(49)).toEqual([2, 3, 5, 7]);
    expect(candidatsPremiers(121)).toContain(11);
    expect(candidatsPremiers(2)).toEqual([]);
  });
  it("divisions euclidiennes exactes", () => {
    expect(testerDiviseur(97, 7)).toEqual({ p: 7, quotient: 13, reste: 6, divise: false });
    expect(testerDiviseur(143, 11)).toEqual({ p: 11, quotient: 13, reste: 0, divise: true });
  });
  it("verdict via les candidats, y compris pour les carrés de premiers", () => {
    expect(verdictPrimalite(97)).toEqual({ premier: true, plusPetitDiviseur: null });
    expect(verdictPrimalite(143)).toEqual({ premier: false, plusPetitDiviseur: 11 });
    expect(verdictPrimalite(221)).toEqual({ premier: false, plusPetitDiviseur: 13 });
    for (const q of [49, 121, 169]) expect(verdictPrimalite(q).premier).toBe(false);
    for (let n = 2; n < 2000; n++) expect(verdictPrimalite(n).premier).toBe(estPremier(n));
  });
  it("carré parfait exact", () => {
    expect(estCarreParfait(176400)).toBe(true);
    expect(estCarreParfait(176401)).toBe(false);
  });
});

describe("arbre de facteurs", () => {
  it.each([60, 84, 180, 360, 2520])("le guidé termine l'arbre de %i avec les bons facteurs", (n) => {
    let a = creerArbre(n);
    for (let i = 0; i < 50; i++) {
      const pas = pasGuide(a);
      if (!pas) break;
      const r = decomposerNoeud(a, pas.id, pas.a, pas.b);
      if (!r.ok) throw new Error(r.erreur);
      a = r.arbre;
    }
    expect(arbreTermine(a)).toBe(true);
    expect(facteursDeFeuilles(a)).toEqual(facteursPremiers(n));
    expect(produitFacteurs(facteursDeFeuilles(a))).toBe(BigInt(n));
  });
  it("360 = 2³ × 3² × 5", () => {
    expect(facteursPremiers(360)).toEqual([{ p: 2, e: 3 }, { p: 3, e: 2 }, { p: 5, e: 1 }]);
  });
  it("deux chemins différents donnent la même décomposition (180)", () => {
    const chemin = (coupes: Array<[string, number, number]>) => {
      let a = creerArbre(180);
      for (const [id, x, y] of coupes) {
        const r = decomposerNoeud(a, id, x, y);
        if (!r.ok) throw new Error(r.erreur);
        a = r.arbre;
      }
      return a;
    };
    // 180 = 18 × 10 ; 18 = 2 × 9 ; 9 = 3 × 3 ; 10 = 2 × 5
    const a1 = chemin([["r", 18, 10], ["r0", 2, 9], ["r01", 3, 3], ["r1", 2, 5]]);
    // 180 = 12 × 15 ; 12 = 3 × 4 ; 4 = 2 × 2 ; 15 = 3 × 5
    const a2 = chemin([["r", 12, 15], ["r0", 3, 4], ["r01", 2, 2], ["r1", 3, 5]]);
    expect(arbreTermine(a1) && arbreTermine(a2)).toBe(true);
    expect(memesFacteurs(facteursDeFeuilles(a1), facteursDeFeuilles(a2))).toBe(true);
    expect(facteursDeFeuilles(a1)).toEqual([{ p: 2, e: 2 }, { p: 3, e: 2 }, { p: 5, e: 1 }]);
  });
  it("rejette les décompositions invalides", () => {
    const a = creerArbre(360);
    expect(decomposerNoeud(a, "r", 12, 31).ok).toBe(false); // produit faux
    expect(decomposerNoeud(a, "r", 1, 360).ok).toBe(false); // facteur 1
    expect(decomposerNoeud(a, "r", 360, 1).ok).toBe(false);
    expect(decomposerNoeud(a, "r", 0, 5).ok).toBe(false);
    expect(decomposerNoeud(a, "r", 2.5, 144).ok).toBe(false);
    expect(decomposerNoeud(a, "zz", 12, 30).ok).toBe(false);
    const p = creerArbre(13);
    expect(decomposerNoeud(p, "r", 1, 13).ok).toBe(false);
    const r = decomposerNoeud(a, "r", 12, 30);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(decomposerNoeud(r.arbre, "r", 12, 30).ok).toBe(false); // déjà décomposé
      expect(arbreTermine(r.arbre)).toBe(false);
    }
  });
  it("un arbre dont une feuille est composée n'est pas terminé", () => {
    expect(arbreTermine(creerArbre(60))).toBe(false);
    expect(arbreTermine(creerArbre(61))).toBe(true);
  });
});

describe("carré parfait", () => {
  it("2520 : multiplicateur 70 et 176400 = 420²", () => {
    const { k, ajouts } = multiplicateurMinimal(2520, 2);
    expect(k).toBe(BigInt(70));
    expect(ajouts).toEqual([{ p: 2, ajout: 1 }, { p: 5, ajout: 1 }, { p: 7, ajout: 1 }]);
    const f = fusionnerExposants(facteursPremiers(2520), { 2: 1, 5: 1, 7: 1 });
    expect(produitFacteurs(f)).toBe(BigInt(176400));
    expect(racinePuissance(f, 2)).toBe(BigInt(420));
  });
  it("nombres déjà carrés : multiplicateur 1", () => {
    for (const n of [1, 4, 36, 144, 176400]) expect(multiplicateurMinimal(n, 2).k).toBe(BigInt(1));
  });
  it("plusieurs exposants impairs", () => {
    expect(multiplicateurMinimal(60, 2).k).toBe(BigInt(15));
    expect(multiplicateurMinimal(72, 2).k).toBe(BigInt(2));
    expect(multiplicateurMinimal(360, 2).k).toBe(BigInt(10));
    expect(multiplicateurMinimal(180, 2).k).toBe(BigInt(5));
  });
  it("minimalité par force brute", () => {
    for (let n = 1; n <= 400; n++) {
      let k = 1;
      while (!estCarreParfait(n * k)) k++;
      expect(multiplicateurMinimal(n, 2).k).toBe(BigInt(k));
    }
  });
  it("cube parfait", () => {
    expect(multiplicateurMinimal(2520, 3).k).toBe(BigInt(2 ** 0 * 3 * 25 * 49));
    expect(racinePuissance(facteursPremiers(216), 3)).toBe(BigInt(6));
    expect(racinePuissance(facteursPremiers(72), 3)).toBeNull();
  });
});

describe("modulo", () => {
  it("tables de multiplication modulo 5 et 7", () => {
    expect(tableMultiplication(5)[3][4]).toBe(2);
    expect(tableMultiplication(5)[2]).toEqual([0, 2, 4, 1, 3]);
    expect(tableMultiplication(7)[3][5]).toBe(1);
    expect(tableMultiplication(7)[6][6]).toBe(1);
  });
  it("inverses", () => {
    expect(inverseModulaire(3, 5)).toBe(2);
    expect(inverseModulaire(3, 7)).toBe(5);
    expect(inverseModulaire(2, 6)).toBeNull();
    expect(inverseModulaire(5, 6)).toBe(5);
  });
  it("modulo 6 : classes inversibles et diviseurs de zéro", () => {
    expect([1, 2, 3, 4, 5].filter((a) => estInversible(a, 6))).toEqual([1, 5]);
    expect(diviseursDeZero(6)).toEqual([2, 3, 4]);
    expect(analyserModulo(6).corps).toBe(false);
    expect(analyserModulo(5).corps).toBe(true);
    expect(diviseursDeZero(5)).toEqual([]);
    expect(analyserModulo(5).inversibles.map((x) => x.a)).toEqual([1, 2, 3, 4]);
  });
  it("3x ≡ 5 (mod 7) : x ≡ 4", () => {
    expect(resoudreCongruence(3, 5, 7)).toMatchObject({ cas: "unique", inverse: 5, x: 4 });
  });
  it("équations sans solution ou avec plusieurs solutions", () => {
    expect(resoudreCongruence(2, 3, 6).cas).toBe("aucune");
    expect(resoudreCongruence(4, 2, 6)).toMatchObject({ cas: "plusieurs", d: 2, solutions: [2, 5] });
    expect(resoudreCongruence(0, 0, 5)).toMatchObject({ cas: "plusieurs", solutions: [0, 1, 2, 3, 4] });
    expect(resoudreCongruence(0, 3, 5).cas).toBe("aucune");
  });
  it("cohérence avec la force brute pour tous les modules et coefficients", () => {
    for (const m of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
      for (let a = -13; a <= 13; a++) {
        for (let c = 0; c < m; c++) {
          const brute: number[] = [];
          for (let x = 0; x < m; x++) if ((((a * x - c) % m) + m) % m === 0) brute.push(x);
          const r = resoudreCongruence(a, c, m);
          const attendu = r.cas === "aucune" ? [] : r.cas === "unique" ? [r.x] : r.solutions;
          expect([...attendu].sort((p, q) => p - q)).toEqual(brute);
        }
      }
    }
  });
});

describe("diviseurs, PGCD et PPCM", () => {
  it("360 a 24 diviseurs, 2310 en a 32", () => {
    expect(nombreDiviseurs(facteursPremiers(360))).toBe(24);
    expect(diviseursPositifs(360)).toHaveLength(24);
    expect(nombreDiviseurs(facteursPremiers(2310))).toBe(32);
    expect(diviseursPositifs(2310)).toHaveLength(32);
  });
  it("liste complète, croissante, sans doublon", () => {
    for (let n = 1; n <= 500; n++) {
      const brute: number[] = [];
      for (let d = 1; d <= n; d++) if (n % d === 0) brute.push(d);
      expect(diviseursPositifs(n)).toEqual(brute);
    }
  });
  it("12 = 2² × 3¹ × 5⁰ divise 360", () => {
    const f = facteursPremiers(360);
    const d = diviseurDepuisExposants(f, [2, 1, 0]);
    expect(d).toBe(12);
    expect(360 % d).toBe(0);
    expect(360 / d).toBe(30);
  });
  it("PGCD et PPCM de 360 et 150, de 2310 et 1050", () => {
    const r = pgcdPpcmExposants(360, 150);
    expect(r.pgcd).toBe(BigInt(30));
    expect(r.ppcm).toBe(BigInt(1800));
    expect(r.verifie).toBe(true);
    const s = pgcdPpcmExposants(2310, 1050);
    expect(s.pgcd).toBe(BigInt(210));
    expect(s.ppcm).toBe(BigInt(11550));
    expect(s.verifie).toBe(true);
    expect(s.pgcd * s.ppcm).toBe(s.produit);
  });
});

describe("lecture des saisies et bloc Markdown", () => {
  it("lireNaturel", () => {
    expect(lireNaturel("2 520", 1, 1000000)).toEqual({ ok: true, valeur: 2520 });
    expect(lireNaturel("", 2, 10).ok).toBe(false);
    expect(lireNaturel("1,5", 2, 10).ok).toBe(false);
    expect(lireNaturel("abc", 2, 10).ok).toBe(false);
    expect(lireNaturel("1", 2, 10).ok).toBe(false);
    expect(lireNaturel("11", 2, 10).ok).toBe(false);
    expect(lireNaturel("12345678901234567890", 2, 10).ok).toBe(false);
  });
  it("parser du bloc premiers", () => {
    expect(parserBlocLaboPremiers("")).toEqual({ onglet: "crible" });
    expect(parserBlocLaboPremiers("onglet: diviseurs")).toEqual({ onglet: "diviseurs" });
    expect(parserBlocLaboPremiers("# commentaire\nonglet: Modulo")).toEqual({ onglet: "modulo" });
    expect(() => parserBlocLaboPremiers("onglet: inconnu")).toThrow(LaboPremiersSyntaxeError);
    expect(() => parserBlocLaboPremiers("couleur: rouge")).toThrow(LaboPremiersSyntaxeError);
    expect(() => parserBlocLaboPremiers("n'importe quoi")).toThrow(LaboPremiersSyntaxeError);
  });
});
