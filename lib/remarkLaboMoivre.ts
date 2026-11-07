import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```labo-moivre et les transforme en <figure data-labomoivre-source=…>, rendus par
 * RenduMarkdown via `components.figure` — même principe que lib/remarkLaboComplexes.ts. La directive brute n'est jamais
 * exposée au lecteur.
 */
export function remarkLaboMoivre() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "labo-moivre" || index === undefined || !parent) return;
      const remplacement = {
        type: "laboMoivreBloc",
        data: { hName: "figure", hProperties: { "data-labomoivre-source": node.value } },
      } as unknown as RootContent;
      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
