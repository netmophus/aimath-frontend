import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```congruence et les transforme en éléments
 * <figure data-congruence-source=…>, rendus par RenduMarkdown via `components.figure` — même principe que
 * lib/remarkHorloge.ts (voir ce fichier). Aucun parsing ici : le texte brut est transporté tel quel, le parsing
 * (lib/congruence.ts) et le rendu (components/CalculateurCongruence.tsx) vivent côté composant.
 */
export function remarkCongruence() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "congruence" || index === undefined || !parent) return;

      const remplacement = {
        type: "congruenceBloc",
        data: {
          hName: "figure",
          hProperties: { "data-congruence-source": node.value },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
