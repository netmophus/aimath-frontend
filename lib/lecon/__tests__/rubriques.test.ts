import { describe, expect, it } from "vitest";

import {
  extraireClasseDuLibelle,
  ongletApresTouche,
  rubriqueEffective,
  rubriquesDisponibles,
  type ContenuLecon,
  type RubriqueId,
} from "@/lib/lecon/rubriques";

const vide: ContenuLecon = { histoire: "", demonstrations: "", sujet_examen: "", exercices: [] };

describe("rubriquesDisponibles (rubriques conditionnelles)", () => {
  it("« cours » est toujours présent, même sans aucun contenu", () => {
    expect(rubriquesDisponibles(vide)).toEqual(["cours"]);
  });

  it("n'affiche que les rubriques qui ont du contenu, dans l'ordre", () => {
    const tout: ContenuLecon = { histoire: "h", demonstrations: "d", sujet_examen: "e", exercices: [{}] };
    expect(rubriquesDisponibles(tout)).toEqual(["pourquoi", "cours", "demonstrations", "exercices", "examen"]);
  });

  it("un champ blanc compte comme vide", () => {
    expect(rubriquesDisponibles({ ...vide, histoire: "  \n ", demonstrations: "\t" })).toEqual(["cours"]);
  });

  it("une leçon verrouillée (champs vidés par le serveur) ne montre que Pourquoi et Cours", () => {
    expect(rubriquesDisponibles({ ...vide, histoire: "Pourquoi…" })).toEqual(["pourquoi", "cours"]);
  });

  it("exercices seuls", () => {
    expect(rubriquesDisponibles({ ...vide, exercices: [{}, {}] })).toEqual(["cours", "exercices"]);
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
