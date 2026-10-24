import { visit } from "unist-util-visit";
import type { Root, RootContent } from "mdast";

/** Langages de fence des simulations de chimie (cours « Solutions aqueuses, ions et pH »). */
export const SIMULATIONS_CHIMIE = ["echelleph", "temperature", "calculph", "echellelog", "polarite", "hydratation", "ionisation", "autoprotolyse", "tubes", "electroneutralite", "indicateur", "phmetre", "labochimie"] as const;
export type SimulationChimie = (typeof SIMULATIONS_CHIMIE)[number];

/**
 * Détecte les blocs ```echelleph, ```temperature, ```calculph, ```echellelog, ```polarite,
 * ```hydratation, ```ionisation, ```autoprotolyse, ```tubes, ```electroneutralite,
 * ```indicateur, ```phmetre, ```labochimie et
 * les transforme en <figure data-chimie-type=…>, rendus par RenduMarkdown via
 * son mapping `components.figure` — même principe que remarkRacines. Ces
 * simulations n'ont aucun paramètre : le corps du bloc peut rester vide.
 */
export function remarkChimie() {
  const estChimie = (nom: string | null | undefined): nom is string => !!nom && (SIMULATIONS_CHIMIE as readonly string[]).includes(nom);
  const figure = (type: string) =>
    ({ type: "chimieBloc", data: { hName: "figure", hProperties: { "data-chimie-type": type } } }) as unknown as RootContent;

  return (tree: Root) => {
    // Forme tolérée : ```echelleph``` écrit sur UNE seule ligne n'est pas une fence mais du code en ligne.
    // Un paragraphe qui ne contient que ce code en ligne devient la simulation.
    visit(tree, "paragraph", (node, index, parent) => {
      if (index === undefined || !parent || node.children.length !== 1) return;
      const enfant = node.children[0];
      if (enfant.type !== "inlineCode" || !estChimie(enfant.value.trim())) return;
      (parent.children as RootContent[]).splice(index, 1, figure(enfant.value.trim()));
    });

    visit(tree, "code", (node, index, parent) => {
      if (!node.lang || !(SIMULATIONS_CHIMIE as readonly string[]).includes(node.lang) || index === undefined || !parent) return;

      const remplacement = {
        type: "chimieBloc",
        data: {
          hName: "figure",
          hProperties: { "data-chimie-type": node.lang },
        },
      } as unknown as RootContent;

      (parent.children as RootContent[]).splice(index, 1, remplacement);
    });
  };
}
