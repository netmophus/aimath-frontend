import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```premiers et les transforme en <figure data-premiers-source=…>, rendus par
 * RenduMarkdown via `components.figure` — même principe que lib/remarkLaboPgcd.ts.
 */
export function remarkLaboPremiers() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "premiers" || index === undefined || !parent) return;
      const remplacement = {
        type: "laboPremiersBloc",
        data: { hName: "figure", hProperties: { "data-premiers-source": node.value } },
      } as unknown as RootContent;
      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
