import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```labo-equations-complexes et les transforme en
 * <figure data-laboequations-source=…>, rendus par RenduMarkdown via `components.figure` — même principe que
 * lib/remarkLaboMoivre.ts. La directive brute n'est jamais exposée au lecteur.
 */
export function remarkLaboEquations() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "labo-equations-complexes" || index === undefined || !parent) return;
      const remplacement = {
        type: "laboEquationsBloc",
        data: { hName: "figure", hProperties: { "data-laboequations-source": node.value } },
      } as unknown as RootContent;
      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
