import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

import { estLangageChimieEau } from "@/lib/laboChimieEau";

/**
 * Transforme les blocs ```labo-chimie-eau en <figure data-labochimieeau-source=…>, rendus par RenduMarkdown.
 * Les autres blocs (dont les simulations de chimie historiques ```labochimie, ```phmetre, etc. de remarkChimie) ne sont pas touchés.
 */
export function remarkLaboChimieEau() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (!estLangageChimieEau(node.lang) || index === undefined || !parent) return;
      const remplacement = {
        type: "laboChimieEauBloc",
        data: { hName: "figure", hProperties: { "data-labochimieeau-source": node.value } },
      } as unknown as RootContent;
      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
