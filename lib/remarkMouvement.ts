import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```mouvement et les transforme en
 * éléments <figure data-mouvement-source=…>, rendus ensuite par
 * RenduMarkdown via son mapping `components.figure` — même principe que
 * remarkHorloge/remarkBinaire/remarkCercleTrigo (voir remarkHorloge.ts pour
 * le détail hName/hProperties partagé).
 *
 * Volontairement AUCUN parsing ici du contenu du bloc (syntaxe voir
 * docs/syntaxe-mouvement.md) : ce plugin ne fait que repérer le bloc et
 * transporter son texte brut tel quel. Le parsing (lib/mouvement.ts) et le
 * rendu (components/SimulationMouvement.tsx) vivent côté composant React.
 */
export function remarkMouvement() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "mouvement" || index === undefined || !parent) return;

      const remplacement = {
        type: "mouvementBloc",
        data: {
          hName: "figure",
          hProperties: { "data-mouvement-source": node.value },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
