import { describe, expect, it } from "vitest";

import {
  aDuTexte,
  etatRubrique,
  extraireClasseDuLibelle,
  MESSAGE_RUBRIQUE_VIDE,
  ongletApresTouche,
  RUBRIQUES_ORDRE,
  rubriqueEffective,
  rubriquesDisponibles,
  type ContenuLecon,
  type RubriqueId,
} from "@/lib/lecon/rubriques";

const SEPT: RubriqueId[] = ["pourquoi", "cours", "demonstrations", "simuler", "exercices", "examen", "plus_loin"];
const vide: ContenuLecon = { histoire: "", demonstrations: "", sujet_examen: "", exercices: [] };
const verrouillee: ContenuLecon = { ...vide, verrouille: true };
const remplie: ContenuLecon = {
  histoire: "h", demonstrations: "d", sujet_examen: "e", exercices: [{}],
  simuler_pour_comprendre: "s", pour_aller_plus_loin: "p",
};

describe("rubriquesDisponibles : les sept rubriques toujours visibles, dans l'ordre", () => {
  it("renvoie les sept rubriques dans l'ordre demandé", () => {
    expect(rubriquesDisponibles()).toEqual(SEPT);
    expect([...RUBRIQUES_ORDRE]).toEqual(SEPT);
  });

  it("renvoie une copie : la modifier ne change pas l'ordre de référence", () => {
    rubriquesDisponibles().pop();
    expect(rubriquesDisponibles()).toHaveLength(7);
  });
});

describe("etatRubrique : contenu / vide (message d'attente) / verrouille (mur, jamais de contenu premium)", () => {
  it("leçon accessible et vide : « cours » reste du contenu, les six autres sont « vide »", () => {
    expect(SEPT.map((id) => etatRubrique(id, vide))).toEqual(["vide", "contenu", "vide", "vide", "vide", "vide", "vide"]);
  });

  it("leçon accessible et remplie : tout est « contenu »", () => {
    expect(SEPT.map((id) => etatRubrique(id, remplie))).toEqual(Array(7).fill("contenu"));
  });

  it("un champ blanc, null ou absent compte comme vide", () => {
    for (const valeur of ["", "   ", " \n\t", null, undefined]) {
      expect(etatRubrique("simuler", { ...vide, simuler_pour_comprendre: valeur })).toBe("vide");
      expect(etatRubrique("plus_loin", { ...vide, pour_aller_plus_loin: valeur })).toBe("vide");
    }
  });

  it("chaque nouvelle section dépend uniquement de son propre champ", () => {
    expect(etatRubrique("simuler", { ...vide, simuler_pour_comprendre: "x" })).toBe("contenu");
    expect(etatRubrique("plus_loin", { ...vide, simuler_pour_comprendre: "x" })).toBe("vide");
    expect(etatRubrique("simuler", { ...vide, pour_aller_plus_loin: "y" })).toBe("vide");
    expect(etatRubrique("plus_loin", { ...vide, pour_aller_plus_loin: "y" })).toBe("contenu");
  });

  it("leçon verrouillée : démonstrations, simuler, exercices, examen et plus loin sont « verrouille »", () => {
    expect(SEPT.map((id) => etatRubrique(id, verrouillee))).toEqual(
      ["vide", "contenu", "verrouille", "verrouille", "verrouille", "verrouille", "verrouille"]
    );
  });

  it("leçon verrouillée : même si un champ contenait du texte, il n'est jamais présenté comme contenu", () => {
    const piegee: ContenuLecon = { ...remplie, verrouille: true };
    for (const id of ["demonstrations", "simuler", "exercices", "examen", "plus_loin"] as const) {
      expect(etatRubrique(id, piegee)).toBe("verrouille");
    }
  });

  it("leçon verrouillée : l'accroche « pourquoi » reste lisible (le serveur la laisse en clair)", () => {
    expect(etatRubrique("pourquoi", { ...verrouillee, histoire: "Accroche" })).toBe("contenu");
  });

  it("ancienne copie hors-ligne sans champ « verrouille » ni nouvelles sections : accessible, rubriques vides", () => {
    expect(etatRubrique("simuler", { ...vide, verrouille: undefined })).toBe("vide");
    expect(etatRubrique("plus_loin", { ...vide, verrouille: undefined })).toBe("vide");
  });

  it("message d'attente exact et aDuTexte", () => {
    expect(MESSAGE_RUBRIQUE_VIDE).toBe("Le contenu de cette rubrique sera bientôt disponible.");
    expect(aDuTexte("")).toBe(false);
    expect(aDuTexte("  \n")).toBe(false);
    expect(aDuTexte(null)).toBe(false);
    expect(aDuTexte(undefined)).toBe(false);
    expect(aDuTexte("## Titre")).toBe(true);
  });

  it("rubriqueEffective : toute rubrique est sélectionnable, repli sur « cours » seulement si inconnue", () => {
    expect(rubriqueEffective(rubriquesDisponibles(), "simuler")).toBe("simuler");
    expect(rubriqueEffective(rubriquesDisponibles(), "plus_loin")).toBe("plus_loin");
    expect(rubriqueEffective(["cours"], "examen")).toBe("cours");
  });
});

describe("ongletApresTouche (navigation clavier)", () => {
  const ids: RubriqueId[] = ["pourquoi", "cours", "exercices"];

  it("flèches bas/droite : suivant, avec bouclage", () => {
    expect(ongletApresTouche(ids, "pourquoi", "ArrowDown")).toBe("cours");
    expect(ongletApresTouche(ids, "exercices", "ArrowRight")).toBe("pourquoi");
  });

  it("flèches haut/gauche : précédent, avec bouclage", () => {
    expect(ongletApresTouche(ids, "cours", "ArrowUp")).toBe("pourquoi");
    expect(ongletApresTouche(ids, "pourquoi", "ArrowLeft")).toBe("exercices");
  });

  it("Home et End", () => {
    expect(ongletApresTouche(ids, "cours", "Home")).toBe("pourquoi");
    expect(ongletApresTouche(ids, "cours", "End")).toBe("exercices");
  });

  it("ignore les autres touches et les listes vides", () => {
    expect(ongletApresTouche(ids, "cours", "Enter")).toBeNull();
    expect(ongletApresTouche([], "cours" as RubriqueId, "ArrowDown")).toBeNull();
  });

  it("un seul onglet : reste dessus", () => {
    expect(ongletApresTouche(["cours"], "cours", "ArrowDown")).toBe("cours");
  });
});

describe("rubriqueEffective", () => {
  it("garde la rubrique demandée si elle existe", () => {
    expect(rubriqueEffective(["cours", "examen"], "examen")).toBe("examen");
  });
  it("replie sur « cours » sinon", () => {
    expect(rubriqueEffective(["cours"], "examen")).toBe("cours");
  });
});

describe("extraireClasseDuLibelle", () => {
  it("extrait la partie après le tiret cadratin", () => {
    expect(extraireClasseDuLibelle("Mathématiques — Terminale C")).toBe("Terminale C");
  });
  it("retourne null sans classe", () => {
    expect(extraireClasseDuLibelle("Mathématiques")).toBeNull();
    expect(extraireClasseDuLibelle("Maths — ")).toBeNull();
  });
});
