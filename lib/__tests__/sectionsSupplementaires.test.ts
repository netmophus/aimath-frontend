import { describe, expect, it } from "vitest";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";

import { remarkCourbe } from "@/lib/remarkCourbe";
import { remarkVariations } from "@/lib/remarkVariations";
import { remarkMouvement } from "@/lib/remarkMouvement";
import { decouperSections } from "@/lib/decouperSections";
import { textesDeLaLecon } from "@/lib/offlineStore";
import { rubriquesDisponibles } from "@/lib/lecon/rubriques";
import type { LeconEleve } from "@/lib/eleveApi";

type Noeud = { type: string; lang?: string; data?: { hName?: string }; children?: Noeud[] };

function trouver(n: Noeud, pred: (x: Noeud) => boolean, acc: Noeud[] = []): Noeud[] {
  if (pred(n)) acc.push(n);
  n.children?.forEach((c) => trouver(c, pred, acc));
  return acc;
}

const SIMULER = "Fais varier $a$ :\n\n```courbe\nf(x) = a*x^2\n```\n";
const PLUS_LOIN = [
  "## Aller plus loin",
  "",
  "$$",
  String.raw`\int_0^1 x\,dx = \tfrac12`,
  "$$",
  "",
  "| a | b |",
  "|---|---|",
  "| 1 | 2 |",
  "",
].join("\n");

describe("rendu Markdown des deux sections (même pipeline que RenduMarkdown, moteur inchangé)", () => {
  it("formules KaTeX et tableaux GFM", async () => {
    const proc = unified().use(remarkParse).use(remarkMath).use(remarkGfm).use(remarkRehype).use(rehypeKatex);
    const arbre = JSON.stringify(await proc.run(proc.parse(PLUS_LOIN)));
    expect(arbre).toContain("katex-display");
    expect(arbre).toContain('"tagName":"table"');
    expect(arbre).toContain('"value":"2"');
  });

  it("les simulations déjà prises en charge (courbe, variations, mouvement) sont reconnues dans le texte de la section", () => {
    const proc = unified().use(remarkParse).use(remarkMath).use(remarkCourbe).use(remarkVariations).use(remarkMouvement);
    const arbre = proc.runSync(proc.parse(SIMULER + "\n```mouvement\nx0 = 0\n```\n")) as unknown as Noeud;
    const blocs = trouver(arbre, (n) => n.type === "code" || n.type === "mdxJsxFlowElement" || !!n.data?.hName);
    expect(blocs.length).toBeGreaterThan(0);
    // Plus aucun bloc "courbe" brut ne subsiste : le plugin existant l'a pris en charge.
    expect(trouver(arbre, (n) => n.type === "code" && n.lang === "courbe")).toHaveLength(0);
  });

  it("la découpe en cartes (## / ###) s'applique comme pour les autres rubriques", () => {
    const sections = decouperSections(PLUS_LOIN);
    expect(sections.length).toBeGreaterThan(0);
  });
});

const base: LeconEleve = {
  id: 1, titre: "t", histoire: "", objectifs_pedagogiques: "", prerequis_texte: "", cours_redige: "Cours [[limite]]",
  demonstrations: "", a_retenir: "", sujet_examen: "", exercices: [], videos: [], ressources: [], verrouille: false,
  notion: {} as LeconEleve["notion"],
};

describe("compatibilité hors-ligne", () => {
  it("une ancienne copie sans les deux champs ne provoque aucune erreur et ne montre aucune rubrique en plus", () => {
    expect(() => textesDeLaLecon(base)).not.toThrow();
    expect(textesDeLaLecon(base).every((t) => typeof t === "string")).toBe(true);
    expect(rubriquesDisponibles(base)).toEqual(["cours"]);
  });

  it("une copie récente inclut les deux sections dans le texte scruté pour le glossaire", () => {
    const lecon = { ...base, simuler_pour_comprendre: "voir [[pente]]", pour_aller_plus_loin: "et [[aire]]" };
    const textes = textesDeLaLecon(lecon);
    expect(textes).toContain("voir [[pente]]");
    expect(textes).toContain("et [[aire]]");
    expect(rubriquesDisponibles(lecon)).toEqual(["cours", "simuler", "plus_loin"]);
  });
});
