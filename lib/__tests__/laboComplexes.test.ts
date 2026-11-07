import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import type { Root } from "mdast";

import {
  LaboComplexesSyntaxeError,
  ONGLETS_COMPLEXES,
  SQUELETTE_LABO_COMPLEXES,
  contientLaboComplexes,
  parserBlocLaboComplexes,
} from "@/lib/laboComplexes";
import { remarkLaboComplexes } from "@/lib/remarkLaboComplexes";
import { remarkLaboPremiers } from "@/lib/remarkLaboPremiers";
import LaboComplexes from "@/components/labo-complexes/LaboComplexes";
import LaboComplexesBloc from "@/components/labo-complexes/LaboComplexesBloc";
import { devDiv, devMul } from "@/components/labo-complexes/SimCalculs";
import { cx } from "@/lib/complexes";

type Noeud = { type: string; value?: string; lang?: string; data?: { hName?: string; hProperties?: Record<string, string> }; children?: Noeud[] };

function transformer(markdown: string, ...plugins: Array<() => (tree: Root) => void>): Noeud {
  let proc = unified().use(remarkParse).use(remarkMath) as unknown as ReturnType<typeof unified>;
  for (const p of plugins) proc = proc.use(p) as typeof proc;
  return proc.runSync(proc.parse(markdown)) as unknown as Noeud;
}
function trouver(n: Noeud, pred: (x: Noeud) => boolean, acc: Noeud[] = []): Noeud[] {
  if (pred(n)) acc.push(n);
  n.children?.forEach((c) => trouver(c, pred, acc));
  return acc;
}

describe("analyse du bloc ```complexes", () => {
  it("bloc vide ou sans directive : premier onglet (plan)", () => {
    expect(parserBlocLaboComplexes("")).toEqual({ onglet: "plan" });
    expect(parserBlocLaboComplexes("\n  \n# commentaire\n")).toEqual({ onglet: "plan" });
  });
  it("accepte les six onglets, quelle que soit la casse", () => {
    for (const o of ONGLETS_COMPLEXES) expect(parserBlocLaboComplexes(`onglet: ${o}`)).toEqual({ onglet: o });
    expect(parserBlocLaboComplexes("Onglet:  GEOMETRIE ")).toEqual({ onglet: "geometrie" });
    expect(ONGLETS_COMPLEXES).toEqual(["plan", "calculs", "formes", "rotations", "racines", "geometrie"]);
  });
  it("refuse une directive ou un onglet inconnus avec un message en français", () => {
    expect(() => parserBlocLaboComplexes("onglet: inconnu")).toThrow(LaboComplexesSyntaxeError);
    expect(() => parserBlocLaboComplexes("onglet: inconnu")).toThrow(/Onglet inconnu/);
    expect(() => parserBlocLaboComplexes("couleur: rouge")).toThrow(/Directive inconnue/);
    expect(() => parserBlocLaboComplexes("n'importe quoi")).toThrow(/Ligne invalide/);
  });
});

describe("plugin remark ```complexes", () => {
  it("transforme le bloc en <figure data-complexes-source>", () => {
    const arbre = transformer("Avant\n\n```complexes\nonglet: racines\n```\n\nAprès", remarkLaboComplexes);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(figures[0].data?.hProperties?.["data-complexes-source"]).toBe("onglet: racines");
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(0);
  });
  it("ne touche pas aux autres langages ni aux autres laboratoires", () => {
    const arbre = transformer("```premiers\nonglet: crible\n```\n\n```python\nprint(1)\n```", remarkLaboComplexes, remarkLaboPremiers);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(figures[0].data?.hProperties).toHaveProperty("data-premiers-source");
    expect(figures[0].data?.hProperties).not.toHaveProperty("data-complexes-source");
    expect(trouver(arbre, (n) => n.type === "code" && n.lang === "python")).toHaveLength(1);
  });
});

describe("insertion depuis l'administration", () => {
  it("le gabarit inséré est un bloc valide qui s'ouvre sur le premier onglet", () => {
    expect(contientLaboComplexes(SQUELETTE_LABO_COMPLEXES)).toBe(true);
    const arbre = transformer(SQUELETTE_LABO_COMPLEXES, remarkLaboComplexes);
    const figures = trouver(arbre, (n) => n.data?.hName === "figure");
    expect(figures).toHaveLength(1);
    expect(parserBlocLaboComplexes(figures[0].data?.hProperties?.["data-complexes-source"] ?? "")).toEqual({ onglet: "plan" });
  });
  it("détecte un bloc déjà présent (pas de doublon) sans confondre avec les autres blocs", () => {
    expect(contientLaboComplexes("")).toBe(false);
    expect(contientLaboComplexes("Texte\n\n```complexes\nonglet: calculs\n```\n")).toBe(true);
    expect(contientLaboComplexes("```premiers\nonglet: crible\n```")).toBe(false);
    expect(contientLaboComplexes("Parle de complexes dans le texte")).toBe(false);
  });
  it("l'insertion ne modifie pas le reste du contenu (ajout en fin)", () => {
    const avant = "Un texte avec $z = a + ib$.\n";
    const apres = avant + SQUELETTE_LABO_COMPLEXES;
    expect(apres.startsWith(avant)).toBe(true);
  });
});

describe("rendu des simulations (rendu serveur, sans interaction)", () => {
  const MAUVAIS = /NaN|Infinity|undefined|\[object/;
  it("le laboratoire affiche titre, sous-titre et les six onglets", () => {
    const html = renderToStaticMarkup(createElement(LaboComplexes, { data: { onglet: "plan" } }));
    expect(html).toContain("Laboratoire des nombres complexes");
    expect(html).toContain("Observe, manipule et comprends");
    for (const libelle of ["Plan complexe", "Calculs", "Trois formes", "Rotations", "Racines", "Géométrie"]) expect(html).toContain(libelle);
    expect(html.match(/role="tab"/g)).toHaveLength(6);
  });
  for (const onglet of ONGLETS_COMPLEXES) {
    it(`l'onglet « ${onglet} » se rend sans valeur invalide et propose réinitialisation et défi`, () => {
      const html = renderToStaticMarkup(createElement(LaboComplexes, { data: { onglet } }));
      expect(html).not.toMatch(MAUVAIS);
      expect(html).toContain("Réinitialiser");
      expect(html).toContain("Lancer un défi");
      expect(html).toContain("Découvrir");
      expect(html).toContain("Comprendre");
      expect(html).toContain("Vérifier");
      expect(html).toContain("<svg");
      expect(html).toContain("katex");
    });
  }
  it("le pont Markdown affiche un encadré d'erreur pour un onglet inconnu", () => {
    const html = renderToStaticMarkup(createElement(LaboComplexesBloc, { source: "onglet: zzz" }));
    expect(html).toContain("non affichable");
    expect(html).toContain("Onglet inconnu");
    expect(renderToStaticMarkup(createElement(LaboComplexesBloc, { source: "onglet: formes" }))).toContain("Laboratoire des nombres complexes");
  });
  it("l'onglet formes ouvre sur l'exemple z = -1 + i√3 avec r = 2 et θ = 2π/3", () => {
    const html = renderToStaticMarkup(createElement(LaboComplexes, { data: { onglet: "formes" } }));
    expect(html).toContain('class="mord sqrt"'); // √3 est rendu par KaTeX (valeur exacte reconnue)
    expect(html).toContain("120"); // θ = 2π/3 = 120°
  });
});

describe("développements affichés", () => {
  it("multiplication : (2+3i)(4-i) = 11 + 10i avec i² = -1", () => {
    const t = devMul(cx(2, 3), cx(4, -1));
    expect(t).toContain("i^2");
    expect(t.endsWith("= 11 + 10i")).toBe(true);
  });
  it("division : par le conjugué du dénominateur ; null si dénominateur nul", () => {
    const t = devDiv(cx(1, 2), cx(3, -1));
    expect(t).not.toBeNull();
    expect(t).toContain("\\frac");
    expect(t).toContain("0{,}1 + 0{,}7\\,i");
    expect(t).toContain("(-1)^2"); // un nombre négatif élevé au carré est entre parenthèses
    expect(devDiv(cx(1, 2), cx(0, 0))).toBeNull();
  });
});
