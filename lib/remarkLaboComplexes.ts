import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```complexes et les transforme en <figure data-complexes-source=…>, rendus par
 * RenduMarkdown via `components.figure` — même principe que lib/remarkLaboPremiers.ts.
 */
export function remarkLaboComplexes() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "complexes" || index === undefined || !parent) return;
      const remplacement = {
        type: "laboComplexesBloc",
        data: { hName: "figure", hProperties: { "data-complexes-source": node.value } },
      } as unknown as RootContent;
      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
