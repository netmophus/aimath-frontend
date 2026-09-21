import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```courbe et les transforme en éléments
 * <figure data-courbe-source=…>, que RenduMarkdown rend ensuite via son
 * mapping `components.figure` (même principe que remarkGlossaire pour
 * [[slug]] → <dfn>, voir ce fichier pour le détail de la technique
 * hName/hProperties).
 *
 * Volontairement AUCUN parsing ici du contenu du bloc (syntaxe voir
 * docs/syntaxe-courbe.md) : ce plugin ne fait que repérer le bloc et
 * transporter son texte brut tel quel. Le parsing (lib/courbe.ts) et le
 * rendu (components/CourbeFonction.tsx, client-only) vivent tous les deux
 * côté composant React, pas ici — un plugin remark tourne aussi bien côté
 * serveur, il ne doit dépendre d'aucune API navigateur.
 */
export function remarkCourbe() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "courbe" || index === undefined || !parent) return;

      const remplacement = {
        type: "courbeBloc",
        data: {
          hName: "figure",
          hProperties: { "data-courbe-source": node.value },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
