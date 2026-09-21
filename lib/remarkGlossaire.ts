import { visit } from "unist-util-visit";
import type { PhrasingContent, Root } from "mdast";

import { MOTIF_TERME_GLOSSAIRE } from "./glossaireMarqueurs";

/**
 * [[slug]] ou [[slug|texte affiché]] — voir lib/glossaireMarqueurs.ts pour le
 * motif partagé avec le téléchargement hors-ligne (offlineStore).
 */
const MOTIF_TERME = MOTIF_TERME_GLOSSAIRE;

/**
 * Plugin remark : transforme les marqueurs [[slug]] / [[slug|texte]] en
 * éléments <dfn data-slug=… data-texte=…>, que RenduMarkdown rend ensuite
 * via son mapping `components.dfn` (cliquable côté élève, inerte sinon).
 *
 * Ne touche qu'aux noeuds `text` du Markdown — jamais aux noeuds `inlineMath`
 * / `math` déjà créés par remark-math. Pour que cette séparation fonctionne,
 * remark-math DOIT tourner avant ce plugin dans le pipeline (voir
 * RenduMarkdown.tsx) : une fois qu'une formule $...$ est extraite dans son
 * propre noeud, ce plugin ne peut plus jamais la toucher, même sur la même
 * ligne qu'un [[terme]].
 */
export function remarkGlossaire() {
  return (tree: Root) => {
    visit(tree, "text", (node, index, parent) => {
      if (index === undefined || !parent) return;

      MOTIF_TERME.lastIndex = 0;
      if (!MOTIF_TERME.test(node.value)) return undefined;
      MOTIF_TERME.lastIndex = 0;

      const morceaux: PhrasingContent[] = [];
      let curseur = 0;
      let correspondance: RegExpExecArray | null;

      while ((correspondance = MOTIF_TERME.exec(node.value)) !== null) {
        const [texteComplet, slug, texteAffiche] = correspondance;

        if (correspondance.index > curseur) {
          morceaux.push({ type: "text", value: node.value.slice(curseur, correspondance.index) });
        }

        // Noeud mdast hors schéma standard (le glossaire n'existe pas dans
        // le vocabulaire mdast) : mdast-util-to-hast sait néanmoins le
        // convertir via data.hName/hProperties (voir sa doc "Unknown
        // nodes") — TypeScript, lui, ne connaît pas ce type sur mesure,
        // d'où le passage par `unknown` plutôt que par une union élargie.
        morceaux.push({
          type: "termeGlossaire",
          data: {
            hName: "dfn",
            hProperties: { "data-slug": slug, "data-texte": texteAffiche ?? slug },
          },
        } as unknown as PhrasingContent);

        curseur = correspondance.index + texteComplet.length;
      }

      if (curseur < node.value.length) {
        morceaux.push({ type: "text", value: node.value.slice(curseur) });
      }

      (parent.children as unknown as PhrasingContent[]).splice(index, 1, ...morceaux);
      return index + morceaux.length;
    });
  };
}
