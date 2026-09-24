import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```binaire et les transforme en éléments
 * <figure data-binaire-source=…> — même principe que remarkCourbe et
 * remarkHorloge (voir ce dernier pour le détail du choix de `figure` comme
 * hName partagé, distingué côté RenduMarkdown par l'attribut data-* présent).
 *
 * Volontairement AUCUN parsing ici (syntaxe voir docs/syntaxe-binaire.md) :
 * transport du texte brut tel quel, parsing (lib/binaire.ts) et rendu
 * (components/ConvertisseurBinaire.tsx) côté composant React.
 */
export function remarkBinaire() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "binaire" || index === undefined || !parent) return;

      const remplacement = {
        type: "binaireBloc",
        data: {
          hName: "figure",
          hProperties: { "data-binaire-source": node.value },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
