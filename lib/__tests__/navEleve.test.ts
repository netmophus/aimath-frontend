import { describe, expect, it } from "vitest";

import { rubriqueActive } from "@/lib/navEleve";

describe("rubriqueActive : barre de navigation basse de l'élève", () => {
  it("Accueil : le tableau de bord /eleve (et non la page publique)", () => {
    expect(rubriqueActive("/eleve")).toBe("accueil");
    expect(rubriqueActive("/")).toBeNull();
  });

  it("Cours : programmes, leçons et résolution d'exercice (pas le tableau de bord)", () => {
    for (const p of ["/eleve/programmes/3", "/eleve/lecons/16", "/eleve/resoudre"]) {
      expect(rubriqueActive(p)).toBe("cours");
    }
  });

  it("Abonnement : abonnement et mes cartes", () => {
    expect(rubriqueActive("/eleve/abonnement")).toBe("abonnement");
    expect(rubriqueActive("/eleve/mes-cartes")).toBe("abonnement");
  });

  it("Aide et Profil", () => {
    expect(rubriqueActive("/eleve/aide")).toBe("aide");
    expect(rubriqueActive("/eleve/profil")).toBe("profil");
  });

  it("une seule rubrique active, et aucune pour une page inconnue ou un faux préfixe", () => {
    expect(rubriqueActive("/eleve/aidexyz")).toBeNull();
    expect(rubriqueActive("/eleve/resoudre-autre")).toBeNull();
    expect(rubriqueActive("/eleve/videos")).toBeNull();
  });
});
