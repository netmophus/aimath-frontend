import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import type { Root } from "mdast";

import { remarkGlossaire } from "@/lib/remarkGlossaire";
import { remarkCourbe } from "@/lib/remarkCourbe";
import { remarkVariations } from "@/lib/remarkVariations";
import { remarkChimie } from "@/lib/remarkChimie";

type Noeud = { type: string; value?: string; data?: { hName?: string; hProperties?: Record<string, string> }; children?: Noeud[] };

/** Même ordre que RenduMarkdown : remark-math AVANT les plugins de la plateforme. */
function transformer(markdown: string, ...plugins: Array<() => (tree: Root) => void>): Noeud {
  let proc = unified().use(remarkParse).use(remarkMath) as unknown as ReturnType<typeof unified>;
  for (const p of plugins) proc = proc.use(p) as typeof proc;
  const arbre = proc.parse(markdown);
  return proc.runSync(arbre) as unknown as Noeud;
}

function trouver(n: Noeud, pred: (x: Noeud) => boolean, acc: Noeud[] = []): Noeud[] {
  if (pred(n)) acc.push(n);
  n.children?.forEach((c) => trouver(c, pred, acc));
  return acc;
}

describe("remarkGlossaire", () => {
  it("transforme [[slug]] et [[slug|texte]] en <dfn>", () => {
    const arbre = transformer("Un [[limite]] et un [[suite|suites]].", remarkGlossaire);
    const dfns = trouver(arbre, (n) => n.data?.hName === "dfn");
    expect(dfns.map((d) => d.data?.hProperties)).toEqual([
      { "data-slug": "limite", "data-texte": "limite" },
      { "data-slug": "suite", "data-texte": "suites" },
    ]);
  });

  it("ne touche pas aux formules inline", () => {
    const arbre = transformer("Soit $[[a]]$ une formule.", remarkGlossaire);
    expect(trouver(arbre, (n) => n.data?.hName === "dfn")).toHaveLength(0);
    expect(trouver(arbre, (n) => n.type === "inlineMath")).toHaveLength(1);
  });
});

describe("blocs de simulation (remarkCourbe, remarkVariations, remarkChimie)", () => {
  it("```courbe devient une figure portant la source brute", () => {
    const arbre = transformer("```courbe\nf(x)=x^2\n```", remarkCourbe);
    const figure = trouver(arbre, (n) => n.data?.hName === "figure")[0];
    expect(figure.data?.hProperties?.["data-courbe-source"]).toBe("f(x)=x^2");
  });

  it("```variations devient un noeud <table> portant la source brute", () => {
    const arbre = transformer("```variations\nx | -oo | +oo\n```", remarkVariations);
    const noeud = trouver(arbre, (n) => n.data?.hName === "table")[0];
    expect(noeud.data?.hProperties?.["data-variations-source"]).toBe("x | -oo | +oo");
  });

  it("un autre langage de code reste un bloc de code ordinaire", () => {
    const arbre = transformer("```python\nprint(1)\n```", remarkCourbe, remarkVariations);
    expect(trouver(arbre, (n) => n.data?.hName === "figure" || n.data?.hName === "table")).toHaveLength(0);
    expect(trouver(arbre, (n) => n.type === "code")).toHaveLength(1);
  });

  it("remarkChimie ne touche pas un bloc non chimique", () => {
    const arbre = transformer("```courbe\nf(x)=x\n```", remarkChimie);
    expect(trouver(arbre, (n) => n.data?.hProperties?.["data-chimie-type"] !== undefined)).toHaveLength(0);
  });
});

describe("remark-math", () => {
  it("extrait $…$ et $$…$$ avant les autres plugins", () => {
    const arbre = transformer("Texte $x^2$\n\n$$\n\\frac{a}{b}\n$$", remarkGlossaire);
    expect(trouver(arbre, (n) => n.type === "inlineMath")).toHaveLength(1);
    expect(trouver(arbre, (n) => n.type === "math")).toHaveLength(1);
  });
});
