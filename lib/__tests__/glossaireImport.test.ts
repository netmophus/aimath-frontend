import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";

import { cleTerme, marqueurCours, planifierImport, slugifyDjango, validerFichier, type TermeExistant } from "../glossaireImport";
import { MOTIF_TERME_GLOSSAIRE, extraireSlugsGlossaire } from "../glossaireMarqueurs";
import RenduMarkdown from "../../components/RenduMarkdown";

const ENTREES = [
  { terme: "dissolution", definition: "Mise en solution d'un solide.", exemple: "NaCl dans l'eau." },
  { terme: "autoprotolyse de l'eau", definition: "Réaction réversible.", exemple: "$2H_2O\\rightleftharpoons H_3O^++OH^-$. " },
  { terme: "hydratation des ions", definition: "**Entourage** des ions par $H_2O$.", exemple: "" },
  { terme: "pH", definition: "$pH=-\\log[H_3O^+]$", exemple: "$pH=7$" },
  { terme: "Électrolyte", definition: "d", exemple: "e" },
];

describe("slugifyDjango", () => {
  it("reproduit slugify de Django (accents, apostrophes, casse)", () => {
    expect(slugifyDjango("autoprotolyse de l'eau")).toBe("autoprotolyse-de-leau");
    expect(slugifyDjango("Électrolyte")).toBe("electrolyte");
    expect(slugifyDjango("pH")).toBe("ph");
    expect(slugifyDjango("produit ionique de l’eau")).toBe("produit-ionique-de-leau");
    expect(slugifyDjango("  hydratation   des ions ")).toBe("hydratation-des-ions");
  });
  it("les slugs respectent le motif [[…]] du rendu", () => {
    for (const e of ENTREES) {
      const m = `[[${slugifyDjango(e.terme)}]]`;
      expect(extraireSlugsGlossaire([m])).toEqual([slugifyDjango(e.terme)]);
    }
  });
  it("le terme brut avec espaces ou apostrophe n'est PAS un marqueur valide", () => {
    expect(extraireSlugsGlossaire(["[[autoprotolyse de l'eau]]"])).toEqual([]);
    expect(marqueurCours("autoprotolyse de l'eau")).toBe("[[autoprotolyse-de-leau|autoprotolyse de l'eau]]");
    expect(marqueurCours("dissolution")).toBe("[[dissolution]]");
    expect(new RegExp(MOTIF_TERME_GLOSSAIRE.source, "i").test(marqueurCours("hydratation des ions"))).toBe(true);
  });
});

describe("validerFichier", () => {
  it("accepte des entrées valides et conserve Markdown et LaTeX tels quels", () => {
    const r = validerFichier(ENTREES);
    expect(r.erreurs).toEqual([]);
    expect(r.entrees).toEqual(ENTREES);
    expect(r.entrees[1].exemple).toBe("$2H_2O\\rightleftharpoons H_3O^++OH^-$. ");
  });
  it("signale les structures invalides", () => {
    expect(validerFichier({}).erreurs).toHaveLength(1);
    const r = validerFichier([{ terme: "", definition: "x" }, { terme: "a" }, { terme: "b", definition: "x", exemple: 3 }, 5, { terme: "!!!", definition: "x" }]);
    expect(r.erreurs).toHaveLength(5);
    expect(r.entrees).toHaveLength(0);
  });
  it("exemple facultatif", () => {
    expect(validerFichier([{ terme: "a", definition: "d" }]).entrees[0].exemple).toBe("");
  });
});

describe("planifierImport", () => {
  const existant = (terme: string, definition = "d", exemple = "e", id = 1): TermeExistant => ({ id, terme, slug: slugifyDjango(terme), definition, exemple });

  it("base vide : tout est à créer", () => {
    const p = planifierImport(ENTREES, []);
    expect(p.aCreer).toHaveLength(5);
    expect(p.aCreer[1].slugPrevu).toBe("autoprotolyse-de-leau");
  });
  it("idempotent : une seconde exécution (base = résultat) ne crée rien", () => {
    const apres = ENTREES.map((e, i) => existant(e.terme, e.definition, e.exemple, i + 1));
    const p = planifierImport(ENTREES, apres);
    expect(p.aCreer).toHaveLength(0);
    expect(p.dejaPresents).toHaveLength(5);
    expect(p.differences).toHaveLength(0);
  });
  it("détecte un terme présent sous une autre casse/accent et signale la différence sans l'écraser", () => {
    const p = planifierImport(ENTREES, [existant("electrolyte", "autre définition", "e")]);
    expect(p.aCreer.map((t) => t.terme)).not.toContain("Électrolyte");
    expect(p.differences).toEqual([{ terme: "Électrolyte", champs: ["definition"] }]);
  });
  it("détecte les doublons du fichier et de la base", () => {
    const p = planifierImport([...ENTREES, { terme: "PH", definition: "x", exemple: "" }], [existant("Ion", "d", "e", 1), existant("ion", "d", "e", 2)]);
    expect(p.doublonsFichier).toHaveLength(1);
    expect(p.aCreer).toHaveLength(5);
    expect(p.doublonsBase).toHaveLength(1);
  });
  it("signale une collision de slug avec un terme différent", () => {
    const p = planifierImport([{ terme: "pH", definition: "d", exemple: "" }], [{ id: 9, terme: "Autre", slug: "ph", definition: "d", exemple: "" }]);
    expect(p.collisionsSlug).toHaveLength(1);
  });
  it("cleTerme neutralise apostrophes typographiques", () => {
    expect(cleTerme("l’eau")).toBe(cleTerme("l'eau"));
  });
});

describe("rendu d'un terme dans une leçon", () => {
  it("[[slug|texte]] produit un <dfn> cliquable avec le slug du serveur", () => {
    const html = renderToStaticMarkup(createElement(RenduMarkdown, { contenu: `On parle de [[${slugifyDjango("autoprotolyse de l'eau")}|autoprotolyse de l'eau]] et de [[dissolution]].` }));
    expect(html).toContain("autoprotolyse de l&#x27;eau");
    expect(html).toContain("dissolution");
    expect(html).not.toContain("[[");
  });
});
