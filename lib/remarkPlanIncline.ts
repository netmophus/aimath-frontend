import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```plan-incline et les transforme en
 * éléments <figure data-plan-incline-source=…>, rendus ensuite par
 * RenduMarkdown via son mapping `components.figure` — même principe que
 * remarkMouvement/remarkCirculaire (voir remarkHorloge.ts pour le détail
 * hName/hProperties partagé).
 *
 * Volontairement AUCUN parsing ici du contenu du bloc (syntaxe voir
 * docs/syntaxe-plan-incline.md) : ce plugin ne fait que repérer le bloc et
 * transporter son texte brut tel quel. Le parsing (lib/planIncline.ts) et le
 * rendu (components/SimulationPlanIncline.tsx) vivent côté composant React.
 */
export function remarkPlanIncline() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "plan-incline" || index === undefined || !parent) return;

      const remplacement = {
        type: "planInclineBloc",
        data: {
          hName: "figure",
          hProperties: { "data-plan-incline-source": node.value },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
