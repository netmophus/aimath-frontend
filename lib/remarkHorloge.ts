import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```horloge et les transforme en éléments
 * <figure data-horloge-source=…>, que RenduMarkdown rend ensuite via son
 * mapping `components.figure` — même principe que remarkCourbe (voir ce
 * fichier pour le détail hName/hProperties) et remarkVariations.
 *
 * `figure` comme hName est déjà utilisé par les courbes (```courbe) : les
 * deux plugins tournent sur le même arbre mais matchent des `node.lang`
 * disjoints ("courbe" vs "horloge"), donc RenduMarkdown distingue les deux
 * via `data-courbe-source` vs `data-horloge-source` sur l'élément `figure`
 * — aucune collision possible.
 *
 * Volontairement AUCUN parsing ici du contenu du bloc (syntaxe voir
 * docs/syntaxe-horloge.md) : ce plugin ne fait que repérer le bloc et
 * transporter son texte brut tel quel. Le parsing (lib/horloge.ts) et le
 * rendu (components/HorlogeModulaire.tsx) vivent côté composant React.
 */
export function remarkHorloge() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "horloge" || index === undefined || !parent) return;

      const remplacement = {
        type: "horlogeBloc",
        data: {
          hName: "figure",
          hProperties: { "data-horloge-source": node.value },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
