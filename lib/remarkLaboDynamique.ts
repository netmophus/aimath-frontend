import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

import { estLangageDynamique } from "@/lib/laboDynamique";

/**
 * Transforme les blocs ```machine-atwood, ```pendule-conique, ```monte-charge, ```vehicule-virage,
 * ```solide-sphere et ```labo-dynamique en <figure data-labodynamique-lang=… data-labodynamique-source=…>, rendus par
 * RenduMarkdown. Le bloc ```plan-incline n'est PAS concerné : il reste traité par remarkPlanIncline (ancien rendu, inchangé).
 * Les autres langages ne sont pas touchés.
 */
export function remarkLaboDynamique() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (!estLangageDynamique(node.lang) || index === undefined || !parent) return;
      const remplacement = {
        type: "laboDynamiqueBloc",
        data: { hName: "figure", hProperties: { "data-labodynamique-lang": node.lang, "data-labodynamique-source": node.value } },
      } as unknown as RootContent;
      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
