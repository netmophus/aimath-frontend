import { describe, expect, it } from "vitest";

import {
  ASSEMBLAGE_VIDE,
  ChimieEauErreur,
  ECHANTILLONS,
  EQUATIONS,
  ESPECES,
  ETAT_PHMETRE_INITIAL,
  Ke,
  MASSE_MOLAIRE,
  PHASES_DISSOLUTION,
  TAMPONS,
  TEMPS_STABILISATION,
  actionPhMetre,
  assemblageDepuisSel,
  bilanCharges,
  bilanEquation,
  concentrationEauPure,
  concentrationH3O,
  concentrationH3ODepuisOH,
  concentrationMolaire,
  concentrationOH,
  concentrationOHDepuisH3O,
  concentrationsIoniques,
  electroneutraliteSolution,
  etalonne,
  etapeProcedure,
  etatDepuisH3O,
  etatDepuisOH,
  etatDepuisPH,
  facteurH3O,
  h3oAcideFortExacte,
  lireNombreChimie,
  ligneSolution,
  mesureSimulee,
  moleculesPourUnIon,
  natureSolution,
  niveauConductivite,
  notationScientifique,
  pH,
  pHAcideFort,
  pHNeutre,
  pKe,
  pOH,
  phaseDissolution,
  quantiteDepuisMasse,
  solutionSaline,
  texNombre,
  texteNombre,
  validiteAcideFort,
  valeurAffichee,
  volumeEnLitres,
  type ActionPhMetre,
  type EtatPhMetre,
} from "@/lib/chimieEau";

const proche = (a: number, b: number, rel = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(rel * Math.abs(b));

describe("dissolution : conservation des atomes et des charges", () => {
  it("NaCl, CaCl₂ et saccharose", () => {
    for (const eq of [EQUATIONS.dissolutionNaCl, EQUATIONS.dissolutionCaCl2, EQUATIONS.dissolutionSaccharose]) {
      const b = bilanEquation(eq);
      expect(b.atomesOk).toBe(true);
      expect(b.chargesOk).toBe(true);
    }
  });
  it("NaCl se dissocie en Na⁺ et Cl⁻ ; le saccharose ne forme aucun ion", () => {
    expect(EQUATIONS.dissolutionNaCl.produits.map((t) => t.espece)).toEqual(["Na", "Cl"]);
    expect(EQUATIONS.dissolutionSaccharose.produits).toEqual([{ espece: "saccharose", coef: 1 }]);
    expect(ESPECES.saccharose.charge).toBe(0);
    expect(EQUATIONS.dissolutionSaccharose.produits.every((t) => ESPECES[t.espece].charge === 0)).toBe(true);
  });
  it("détecte une équation non équilibrée", () => {
    expect(bilanEquation({ reactifs: [{ espece: "CaCl2", coef: 1 }], produits: [{ espece: "Ca", coef: 1 }, { espece: "Cl", coef: 1 }] }).atomesOk).toBe(false);
    expect(bilanEquation({ reactifs: [{ espece: "HCl", coef: 1 }], produits: [{ espece: "H3O", coef: 1 }, { espece: "Cl", coef: 1 }] }).ok).toBe(false);
  });
  it("phases de l'animation dans l'ordre : cristal, approche, séparation, hydratation, dispersion", () => {
    expect(PHASES_DISSOLUTION.map((p) => p.id)).toEqual(["cristal", "approche", "separation", "hydratation", "dispersion"]);
    expect(phaseDissolution(0)).toBe("cristal");
    expect(phaseDissolution(2)).toBe("approche");
    expect(phaseDissolution(4)).toBe("separation");
    expect(phaseDissolution(7)).toBe("hydratation");
    expect(phaseDissolution(10)).toBe("dispersion");
  });
  it("concentration apportée : n = m/M et C = n/V", () => {
    const n = quantiteDepuisMasse(5.844, MASSE_MOLAIRE.NaCl);
    proche(n, 0.1, 1e-4);
    proche(concentrationMolaire(n, 0.5), 0.2, 1e-4);
    expect(volumeEnLitres(250, "mL")).toBeCloseTo(0.25, 12);
    expect(() => volumeEnLitres(-1, "L")).toThrow(ChimieEauErreur);
    expect(() => concentrationMolaire(1, 0)).toThrow(ChimieEauErreur);
  });
  it("conductivité qualitative : eau pure et sucre très faible, sel plus élevée", () => {
    expect(niveauConductivite("eau")).toBe("très faible");
    expect(niveauConductivite("sucre", 1)).toBe("très faible");
    expect(niveauConductivite("sel", 0.2)).toBe("élevée");
    expect(niveauConductivite("sel", 0.001)).toBe("faible");
  });
});

describe("ionisation de HCl", () => {
  it("équation, atomes et charges", () => {
    const eq = EQUATIONS.ionisationHCl;
    expect(bilanEquation(eq).ok).toBe(true);
    expect(eq.produits.map((t) => t.espece)).toEqual(["H3O", "Cl"]);
    expect(bilanEquation(eq).atomesAvant).toEqual({ H: 3, Cl: 1, O: 1 });
  });
  it("C = 0,010 mol/L donne pH = 2", () => {
    expect(pHAcideFort(0.01)).toBeCloseTo(2, 12);
    expect(pH(1e-3)).toBeCloseTo(3, 12);
  });
  it("domaine de validité du modèle dilué", () => {
    expect(validiteAcideFort(0.01)).toBe("ok");
    expect(validiteAcideFort(1e-8)).toBe("trop-dilue");
    expect(validiteAcideFort(2)).toBe("trop-concentre");
    expect(pHAcideFort(2)).toBeNull();
    expect(pHAcideFort(1e-8)).toBeNull();
    expect(() => validiteAcideFort(0)).toThrow(ChimieEauErreur);
  });
  it("l'autoprotolyse est négligeable à 0,010 mol/L mais pas à 10⁻⁸ mol/L", () => {
    proche(h3oAcideFortExacte(0.01), 0.01, 1e-9);
    expect(h3oAcideFortExacte(1e-8) / 1e-8).toBeGreaterThan(1.05);
  });
});

describe("électroneutralité", () => {
  it("NaCl : 10 + et 10 −", () => {
    const b = bilanCharges(assemblageDepuisSel("NaCl", 10));
    expect(b).toEqual({ positives: 10, negatives: 10, net: 0, neutre: true });
  });
  it("CaCl₂ : 1 Ca²⁺ et 2 Cl⁻, charges (+2) + (−1) + (−1) = 0", () => {
    const a = assemblageDepuisSel("CaCl2", 1);
    expect(a).toMatchObject({ Ca: 1, Cl: 2, Na: 0 });
    expect(bilanCharges(a).net).toBe(0);
    expect(ESPECES.Ca.charge + 2 * ESPECES.Cl.charge).toBe(0);
  });
  it("charges ±2 : SO₄²⁻ et Ca²⁺ comptent double", () => {
    expect(bilanCharges({ ...ASSEMBLAGE_VIDE, Ca: 1, SO4: 1 }).neutre).toBe(true);
    expect(bilanCharges({ ...ASSEMBLAGE_VIDE, Ca: 1, Cl: 1 })).toMatchObject({ positives: 2, negatives: 1, net: 1, neutre: false });
  });
  it("assemblage incomplet : identifié comme non neutre", () => {
    expect(bilanCharges({ ...ASSEMBLAGE_VIDE, Na: 3, Cl: 1 })).toMatchObject({ net: 2, neutre: false });
    expect(() => bilanCharges({ ...ASSEMBLAGE_VIDE, Na: 1.5 })).toThrow(ChimieEauErreur);
    expect(() => bilanCharges({ ...ASSEMBLAGE_VIDE, Na: -1 })).toThrow(ChimieEauErreur);
  });
  it("concentrations stœchiométriques : [Cl⁻] = 2 [Ca²⁺]", () => {
    expect(concentrationsIoniques("CaCl2", 0.02)).toEqual({ Ca: 0.02, Cl: 0.04 });
    expect(concentrationsIoniques("NaCl", 0.1)).toEqual({ Na: 0.1, Cl: 0.1 });
    expect(concentrationsIoniques("CaCl2", 0.015).Cl).toBeCloseTo(0.03, 12);
  });
  it("relation 2[Ca²⁺] + [H₃O⁺] = [Cl⁻] + [OH⁻], ions de l'eau compris", () => {
    const sol = solutionSaline("CaCl2", 0.02);
    expect(sol.H3O).toBeCloseTo(1e-7, 20);
    expect(sol.OH).toBeCloseTo(1e-7, 20);
    const r = electroneutraliteSolution(sol);
    expect(r.verifiee).toBe(true);
    expect(r.cations).toBeCloseTo(0.04 + 1e-7, 12);
    expect(electroneutraliteSolution({ Ca: 0.02, Cl: 0.03 }).verifiee).toBe(false);
  });
});

describe("autoprotolyse et produit ionique", () => {
  it("à 25 °C : Ke = 10⁻¹⁴, pKe = 14, [H₃O⁺] = [OH⁻] = 10⁻⁷", () => {
    expect(pKe(25)).toBe(14);
    proche(Ke(25), 1e-14);
    proche(concentrationEauPure(25), 1e-7);
    expect(pHNeutre(25)).toBe(7);
    const e = etatDepuisPH(7);
    proche(e.h3o, 1e-7);
    proche(e.oh, 1e-7);
    expect(e.nature).toBe("neutre");
  });
  it("neutralité à 0 °C et 60 °C : pH = pKe/2, [H₃O⁺] = [OH⁻]", () => {
    expect(pHNeutre(0)).toBeCloseTo(7.475, 12);
    expect(pHNeutre(60)).toBeCloseTo(6.51, 12);
    for (const T of [0, 25, 60] as const) {
      const e = etatDepuisPH(pHNeutre(T), T);
      proche(e.h3o, e.oh, 1e-9);
      expect(e.nature).toBe("neutre");
      proche(Ke(T), 10 ** -pKe(T));
    }
  });
  it("une eau à pH 6,51 à 60 °C n'est pas acide, à 25 °C elle l'est", () => {
    expect(natureSolution(6.51, 60)).toBe("neutre");
    expect(natureSolution(6.51, 25)).toBe("acide");
  });
  it("températures non prises en charge refusées (pas d'interpolation)", () => {
    expect(() => pKe(40)).toThrow(ChimieEauErreur);
    expect(() => Ke(37)).toThrow(/non prise en charge/);
  });
  it("une molécule d'eau sur ~5,5×10⁸ est ionisée à 25 °C", () => {
    expect(moleculesPourUnIon(25)).toBeGreaterThan(5e8);
    expect(moleculesPourUnIon(25)).toBeLessThan(6e8);
  });
});

describe("pH, pOH et concentrations (25 °C)", () => {
  const cas: Array<[number, number, number]> = [
    [2, 1e-2, 1e-12],
    [3, 1e-3, 1e-11],
    [5, 1e-5, 1e-9],
    [7, 1e-7, 1e-7],
    [9, 1e-9, 1e-5],
    [11, 1e-11, 1e-3],
    [12, 1e-12, 1e-2],
  ];
  for (const [ph, h, oh] of cas) {
    it(`pH ${ph} : [H₃O⁺] = ${h}, [OH⁻] = ${oh}, pH + pOH = 14`, () => {
      proche(concentrationH3O(ph), h);
      proche(concentrationOH(ph), oh);
      expect(ph + pOH(ph)).toBeCloseTo(14, 12);
      proche(concentrationOHDepuisH3O(h), oh);
      proche(concentrationH3ODepuisOH(oh), h);
      expect(pH(h)).toBeCloseTo(ph, 10);
    });
  }
  it("les trois sens de calcul se rejoignent", () => {
    expect(etatDepuisH3O(1e-4).pH).toBeCloseTo(4, 12);
    expect(etatDepuisOH(1e-2).pH).toBeCloseTo(12, 12);
    expect(etatDepuisOH(1e-2).pOH).toBeCloseTo(2, 12);
    expect(etatDepuisPH(3).pOH).toBeCloseTo(11, 12);
    proche(etatDepuisPH(3).produit, 1e-14);
  });
  it("facteur 10 par unité de pH", () => {
    proche(facteurH3O(3, 4), 10);
    proche(facteurH3O(2, 5), 1000);
    proche(facteurH3O(3, 5), 100);
  });
  it("refuse les logarithmes de valeurs nulles ou négatives et les NaN", () => {
    expect(() => pH(0)).toThrow(ChimieEauErreur);
    expect(() => pH(-1e-3)).toThrow(ChimieEauErreur);
    expect(() => concentrationH3O(Number.NaN)).toThrow(ChimieEauErreur);
    expect(() => etatDepuisOH(0)).toThrow(ChimieEauErreur);
    expect(() => concentrationOHDepuisH3O(0)).toThrow(ChimieEauErreur);
  });
  it("hors du modèle dilué : concentration > 1 mol/L signalée", () => {
    expect(etatDepuisPH(14, 60).diluee).toBe(false);
    expect(etatDepuisPH(0).diluee).toBe(true);
    expect(etatDepuisPH(-1).diluee).toBe(false);
  });
  it("trois solutions : tableau calculé par le moteur", () => {
    expect(ligneSolution(3)).toMatchObject({ nature: "acide" });
    expect(ligneSolution(7)).toMatchObject({ nature: "neutre" });
    expect(ligneSolution(11)).toMatchObject({ nature: "basique" });
    proche(ligneSolution(11).oh, 1e-3);
    proche(ligneSolution(11).h3o, 1e-11);
  });
});

describe("écriture et lecture des nombres", () => {
  it("notation scientifique", () => {
    expect(notationScientifique(1e-3)).toEqual({ mantisse: 1, exposant: -3 });
    expect(notationScientifique(2.5e-4)).toEqual({ mantisse: 2.5, exposant: -4 });
    expect(notationScientifique(9.999999999999999e-12)).toEqual({ mantisse: 1, exposant: -11 });
    expect(texNombre(1e-11)).toBe("10^{-11}");
    expect(texNombre(2.5e-4)).toBe("2{,}5\\times10^{-4}");
    expect(texteNombre(1e-7)).toBe("10⁻⁷");
    expect(texteNombre(0.02)).toBe("0,02");
  });
  it("accepte 1e-3, 0.001, 0,001, 10^-3, 10^{-3}, 2,5×10^-4, 2.5x10^-4", () => {
    for (const s of ["1e-3", "1E-3", "0.001", "0,001", "10^-3", "10^{-3}", "1×10^-3", "10⁻³", "1 x 10^-3"]) {
      const r = lireNombreChimie(s);
      expect(r, s).not.toBeNull();
      expect(r!.valeur, s).toBeCloseTo(1e-3, 15);
    }
    expect(lireNombreChimie("2,5×10^-4")!.valeur).toBeCloseTo(2.5e-4, 15);
    expect(lireNombreChimie("2.5x10^-4")!.valeur).toBeCloseTo(2.5e-4, 15);
    expect(lireNombreChimie("4,00")!.valeur).toBe(4);
    expect(lireNombreChimie("10^-3 mol/L")).toMatchObject({ reste: "mol/L" });
    expect(lireNombreChimie("abc")).toBeNull();
    expect(lireNombreChimie("")).toBeNull();
  });
});

describe("pH-mètre : procédure expérimentale", () => {
  const appliquer = (etat: EtatPhMetre, ...actions: ActionPhMetre[]) => {
    let e = etat;
    let dernier = null as ReturnType<typeof actionPhMetre>["message"];
    for (const a of actions) {
      const r = actionPhMetre(e, a);
      e = r.etat;
      dernier = r.message;
    }
    return { etat: e, message: dernier };
  };
  const tampon = (id: string) => ({ type: "tampon" as const, id });
  const ech = (id: string) => ({ type: "echantillon" as const, id });
  const prete = () => appliquer(ETAT_PHMETRE_INITIAL, { type: "preparer" }).etat;
  const etalonnee = () =>
    appliquer(prete(), { type: "immerger", cible: tampon("t4") }, { type: "valider-point", t: TEMPS_STABILISATION }, { type: "rincer" }, { type: "immerger", cible: tampon("t10") }, { type: "valider-point", t: TEMPS_STABILISATION }, { type: "rincer" }).etat;

  it("refuse l'immersion avant la préparation", () => {
    const r = actionPhMetre(ETAT_PHMETRE_INITIAL, { type: "immerger", cible: tampon("t4") });
    expect(r.message?.code).toBe("pas-prepare");
    expect(r.etat.immerge).toBeNull();
    expect(r.etat.erreurs).toBe(1);
  });
  it("refuse une mesure sans étalonnage", () => {
    const e = appliquer(prete(), { type: "immerger", cible: ech("A") }).etat;
    const r = actionPhMetre(e, { type: "relever", t: 10 });
    expect(r.message?.code).toBe("pas-etalonne");
    expect(r.message?.texte).toMatch(/étalonné avant la mesure/);
    expect(Object.keys(r.etat.releves)).toHaveLength(0);
  });
  it("refuse une nouvelle immersion sans rinçage", () => {
    const e = appliquer(prete(), { type: "immerger", cible: tampon("t4") }, { type: "retirer" }).etat;
    const r = actionPhMetre(e, { type: "immerger", cible: tampon("t7") });
    expect(r.message?.code).toBe("pas-rince");
    expect(r.message?.texte).toMatch(/Rince-la/);
  });
  it("refuse une validation ou un relevé prématurés (avant stabilisation)", () => {
    const e = appliquer(prete(), { type: "immerger", cible: tampon("t4") }).etat;
    expect(actionPhMetre(e, { type: "valider-point", t: TEMPS_STABILISATION - 0.1 }).message?.code).toBe("prematuree");
    const e2 = appliquer(etalonnee(), { type: "immerger", cible: ech("A") }).etat;
    expect(actionPhMetre(e2, { type: "relever", t: 2 }).message?.code).toBe("prematuree");
  });
  it("étalonnage à deux tampons : validation, doublon refusé", () => {
    const e = etalonnee();
    expect(etalonne(e)).toBe(true);
    expect([...e.points].sort((a, b) => a - b)).toEqual([4, 10]);
    const e1 = appliquer(prete(), { type: "immerger", cible: tampon("t7") }, { type: "valider-point", t: 7 }, { type: "rincer" }, { type: "immerger", cible: tampon("t7") }).etat;
    expect(actionPhMetre(e1, { type: "valider-point", t: 7 }).message?.code).toBe("deja-valide");
    expect(etalonne(e1)).toBe(false);
  });
  it("mesure d'un échantillon : valeur stabilisée relevée, changement d'échantillon avec rinçage", () => {
    let r = appliquer(etalonnee(), { type: "immerger", cible: ech("A") }, { type: "relever", t: TEMPS_STABILISATION });
    expect(r.message?.ton).toBe("ok");
    expect(r.etat.releves.A).toBeCloseTo(3, 1);
    r = appliquer(r.etat, { type: "rincer" }, { type: "immerger", cible: ech("B") }, { type: "relever", t: 7 });
    expect(r.etat.releves.B).toBeCloseTo(7, 1);
    expect(Object.keys(r.etat.releves)).toEqual(["A", "B"]);
  });
  it("tampons mal choisis : échantillon hors plage signalé, mesure moins fiable", () => {
    const e = appliquer(prete(), { type: "immerger", cible: tampon("t4") }, { type: "valider-point", t: 7 }, { type: "rincer" }, { type: "immerger", cible: tampon("t7") }, { type: "valider-point", t: 7 }, { type: "rincer" }, { type: "immerger", cible: ech("C") }).etat;
    const r = actionPhMetre(e, { type: "relever", t: 7 });
    expect(r.message?.code).toBe("mauvais-tampons");
    expect(r.message?.texte).toMatch(/encadrer/);
  });
  it("conservation : l'eau distillée et l'air sont refusés, la solution de conservation acceptée", () => {
    expect(actionPhMetre(prete(), { type: "ranger", milieu: "eau-distillee" }).message?.code).toBe("mauvaise-conservation");
    expect(actionPhMetre(prete(), { type: "ranger", milieu: "air" }).etat.conservation).toBe("mauvaise");
    expect(actionPhMetre(prete(), { type: "ranger", milieu: "solution-conservation" }).etat.conservation).toBe("bonne");
  });
  it("valeur affichée : montée progressive puis valeur définitive", () => {
    expect(valeurAffichee(7, 3, 0)).toBeCloseTo(7, 12);
    expect(valeurAffichee(7, 3, 1)).toBeLessThan(7);
    expect(valeurAffichee(7, 3, 1)).toBeGreaterThan(3);
    expect(valeurAffichee(7, 3, TEMPS_STABILISATION)).toBe(3);
  });
  it("mesure simulée reproductible, séparée du pH nominal, à ± 0,02 près (dans la plage d'étalonnage)", () => {
    for (const e of ECHANTILLONS) {
      const m1 = mesureSimulee(e, [4, 10]);
      expect(mesureSimulee(e, [4, 10])).toBe(m1);
      expect(Math.abs(m1 - e.phNominal)).toBeLessThanOrEqual(0.0201);
    }
    expect(Math.abs(mesureSimulee({ id: "C", nom: "C", phNominal: 11 }, [4, 10]) - 11)).toBeLessThanOrEqual(0.0201);
    expect(Math.abs(mesureSimulee({ id: "C", nom: "C", phNominal: 11 }, [4, 7]) - 11)).toBeGreaterThan(0.05);
  });
  it("étapes de la procédure", () => {
    expect(etapeProcedure(ETAT_PHMETRE_INITIAL, 3)).toBe("preparer");
    expect(etapeProcedure(prete(), 3)).toBe("etalonner");
    expect(etapeProcedure(etalonnee(), 3)).toBe("mesurer");
    expect(TAMPONS.map((t) => t.ph)).toEqual([4, 7, 10]);
  });
});
