import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```pgcd et les transforme en <figure data-pgcd-source=…>, rendus par RenduMarkdown
 * via `components.figure` — même principe que lib/remarkHorloge.ts (voir ce fichier). Le texte brut est transporté tel quel.
 */
export function remarkLaboPgcd() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "pgcd" || index === undefined || !parent) return;
      const remplacement = {
        type: "laboPgcdBloc",
        data: { hName: "figure", hProperties: { "data-pgcd-source": node.value } },
      } as unknown as RootContent;
      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
