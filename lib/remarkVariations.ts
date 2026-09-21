import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/**
 * Détecte les blocs de code fenced ```variations et les transforme en
 * éléments <table data-variations-source=…>, que RenduMarkdown rend ensuite
 * via son mapping `components.table` — même principe que remarkCourbe pour
 * ```courbe → <figure> (voir ce fichier pour le détail hName/hProperties) et
 * remarkGlossaire pour [[slug]] → <dfn>.
 *
 * `table` comme hName (plutôt que `figure`, déjà pris par les courbes) :
 * sémantiquement pertinent (c'est bien un tableau) et, comme `figure`,
 * jamais produit par ailleurs dans ce Markdown (pas de syntaxe de tableau
 * Markdown standard utilisée dans les leçons) — aucun risque de collision.
 *
 * Volontairement AUCUN parsing ici du contenu du bloc (syntaxe voir
 * docs/syntaxe-variations.md) : ce plugin ne fait que repérer le bloc et
 * transporter son texte brut tel quel. Le parsing (lib/variations.ts) et le
 * rendu (components/TableauVariations.tsx) vivent côté composant React, pas
 * ici — un plugin remark tourne aussi bien côté serveur, il ne doit dépendre
 * d'aucune API navigateur.
 */
export function remarkVariations() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "variations" || index === undefined || !parent) return;

      const remplacement = {
        type: "variationsBloc",
        data: {
          hName: "table",
          hProperties: { "data-variations-source": node.value },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
