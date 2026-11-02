import { describe, expect, it } from "vitest";

import { decouperSections } from "@/lib/decouperSections";
import { scinderEnonceEtCorrige } from "@/lib/scinderExamen";

describe("decouperSections", () => {
  it("retourne [] pour un contenu vide ou blanc", () => {
    expect(decouperSections("")).toEqual([]);
    expect(decouperSections("  \n \n")).toEqual([]);
  });

  it("garde un texte sans titre en une seule section sans titre", () => {
    expect(decouperSections("Du texte simple.\n\nUn second paragraphe.")).toEqual([
      { titre: null, contenu: "Du texte simple.\n\nUn second paragraphe." },
    ]);
  });

  it("découpe sur les titres ## et ###, intro sans titre comprise", () => {
    const sections = decouperSections("Intro\n\n## A\ncontenu A\n\n### 3.1 B\ncontenu B");
    expect(sections).toEqual([
      { titre: null, contenu: "Intro" },
      { titre: "A", contenu: "contenu A" },
      { titre: "3.1 B", contenu: "contenu B" },
    ]);
  });

  it("reconnaît les titres avec des fins de ligne CRLF (BUG-CARDS-CRLF)", () => {
    const sections = decouperSections("### 1.1 Un\r\ntexte un\r\n### 1.2 Deux\r\ntexte deux");
    expect(sections.map((s) => s.titre)).toEqual(["1.1 Un", "1.2 Deux"]);
    expect(sections[0].contenu).toBe("texte un");
  });

  it("ignore un titre situé dans un bloc de code fenced", () => {
    const md = "### Courbe\n```courbe\n### pas un titre\nf(x)=x^2\n```\n### Suite\nfin";
    const sections = decouperSections(md);
    expect(sections.map((s) => s.titre)).toEqual(["Courbe", "Suite"]);
    expect(sections[0].contenu).toContain("### pas un titre");
  });

  it("n'interprète pas # (niveau 1) ni #### (niveau 4) comme des sections", () => {
    expect(decouperSections("# Un\ntexte\n#### Quatre\nsuite")).toEqual([
      { titre: null, contenu: "# Un\ntexte\n#### Quatre\nsuite" },
    ]);
  });

  it("supprime les sections dont le contenu est vide", () => {
    expect(decouperSections("## Vide\n## Plein\ntexte").map((s) => s.titre)).toEqual(["Plein"]);
  });
});

describe("scinderEnonceEtCorrige (sujet d'examen)", () => {
  it("sans titre Corrigé, tout est énoncé", () => {
    expect(scinderEnonceEtCorrige("## Exercice 1\ntexte")).toEqual({ enonce: "## Exercice 1\ntexte", corrige: null });
  });

  it("coupe à la première ligne « ## Corrigé » (accent et casse tolérés)", () => {
    const r = scinderEnonceEtCorrige("## Énoncé\nQ1\n## corrige\nR1\n### Exercice 1\nR2");
    expect(r.enonce).toBe("## Énoncé\nQ1");
    expect(r.corrige).toBe("R1\n### Exercice 1\nR2");
  });

  it("garde un corrigé dont le premier sous-titre suit immédiatement", () => {
    const r = scinderEnonceEtCorrige("Sujet\n## Corrigé\n### Exercice 1\nsolution");
    expect(r.corrige).toBe("### Exercice 1\nsolution");
  });

  it("ignore un « ## Corrigé » dans un bloc de code", () => {
    const r = scinderEnonceEtCorrige("```md\n## Corrigé\n```\nsuite");
    expect(r.corrige).toBeNull();
  });

  it("gère les fins de ligne CRLF", () => {
    const r = scinderEnonceEtCorrige("Q\r\n## Corrigé\r\nR");
    expect(r).toEqual({ enonce: "Q", corrige: "R" });
  });
});
