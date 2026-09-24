import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```cercletrigo et les transforme en
 * éléments <figure data-cercletrigo-source=…>, rendus ensuite par
 * RenduMarkdown via son mapping `components.figure` — même principe que
 * remarkHorloge/remarkBinaire (voir ces fichiers pour le détail
 * hName/hProperties partagé).
 *
 * Volontairement AUCUN parsing ici du contenu du bloc (syntaxe voir
 * docs/syntaxe-cercletrigo.md) : ce plugin ne fait que repérer le bloc et
 * transporter son texte brut tel quel. Le parsing (lib/complexe.ts) et le
 * rendu (components/CercleTrigonometrique.tsx) vivent côté composant React.
 */
export function remarkCercleTrigo() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "cercletrigo" || index === undefined || !parent) return;

      const remplacement = {
        type: "cercleTrigoBloc",
        data: {
          hName: "figure",
          hProperties: { "data-cercletrigo-source": node.value },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
