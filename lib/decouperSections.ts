/**
 * Découpe un contenu Markdown en sections sur ses titres de niveau 2 ou 3
 * ("## " / "### "), pour un rendu en cartes (voir
 * components/eleve/CarteSection.tsx). Utilisé pour Histoire ("Pourquoi
 * cette notion ?"), le Cours et les Démonstrations de la page de lecture
 * élève — chaque champ garde son propre niveau de titre habituel (Histoire
 * en ##, Cours/Démonstrations en ###), d'où les deux niveaux acceptés ici
 * plutôt qu'un seul figé.
 *
 * Deux pièges corrigés ici (voir BUG-CARDS-CRLF, diagnostiqué en
 * comparant le rendu admin — un seul RenduMarkdown sur le texte entier — au
 * rendu élève — ce découpage puis un RenduMarkdown par section) :
 *
 * 1. Fins de ligne CRLF ("\r\n", contenu saisi/collé depuis Windows) :
 *    `markdown.split("\n")` laisse un "\r" résiduel en fin de CHAQUE ligne,
 *    ce que MOTIF_TITRE_H2_OU_H3 (ancré par `$`) ne matche plus jamais —
 *    aucun titre n'est plus jamais reconnu, et tout le contenu retombe en
 *    une seule section sans titre (perte du découpage en cartes). Corrigé
 *    en normalisant les fins de ligne AVANT le split.
 * 2. Un titre ###/## À L'INTÉRIEUR d'un bloc de code fenced (```courbe,
 *    ```variations, ou un exemple de code quelconque) ne doit JAMAIS être
 *    traité comme un vrai titre de section : un bloc fenced doit toujours
 *    rester entier dans la section où il commence, jamais coupé en deux.
 *    Ce cas ne s'est pas produit dans la donnée réelle qui a révélé le bug
 *    n°1 ci-dessus (aucune ligne "###" à l'intérieur d'un bloc courbe/
 *    variations existant), mais reste un piège classique et documenté
 *    (voir docs/syntaxe-courbe.md) — corrigé par prévention.
 */

export interface SectionMarkdown {
  /** null pour le texte avant le premier titre (intro sans titre), ou quand
   * le contenu n'a aucun titre de niveau 2/3 du tout. */
  titre: string | null;
  contenu: string;
}

const MOTIF_TITRE_H2_OU_H3 = /^#{2,3}\s+(.+)$/;
/** Ligne de bordure d'un bloc de code fenced — ``` ou ~~~, au moins 3
 * caractères (peu importe le langage qui suit à l'ouverture). */
const MOTIF_BORDURE_FENCE = /^(`{3,}|~{3,})/;

/**
 * Robustesse : un contenu sans aucun titre de niveau 2/3 (mal structuré, ou
 * tout simplement un texte court) ne doit jamais casser l'affichage — il
 * revient en une seule section sans titre, avec tout le contenu intact.
 */
export function decouperSections(markdown: string): SectionMarkdown[] {
  // Normalise \r\n et \r (isolé) en \n AVANT tout split par ligne — voir le
  // point 1 du commentaire d'en-tête : sans ça, un contenu Windows perd tout
  // son découpage en cartes.
  const texte = markdown.replace(/\r\n?/g, "\n").trim();
  if (!texte) return [];

  const lignes = texte.split("\n");
  const sections: SectionMarkdown[] = [];
  let titreCourant: string | null = null;
  let tamponLignes: string[] = [];
  let dansBlocDeCode = false;

  function cloturerSectionCourante() {
    const contenu = tamponLignes.join("\n").trim();
    if (contenu) sections.push({ titre: titreCourant, contenu });
    tamponLignes = [];
  }

  for (const ligne of lignes) {
    if (MOTIF_BORDURE_FENCE.test(ligne.trim())) {
      dansBlocDeCode = !dansBlocDeCode;
      tamponLignes.push(ligne);
      continue;
    }

    // Voir le point 2 du commentaire d'en-tête : jamais de titre reconnu
    // tant qu'on est à l'intérieur d'un bloc de code fenced.
    const correspondance = !dansBlocDeCode && ligne.match(MOTIF_TITRE_H2_OU_H3);
    if (correspondance) {
      cloturerSectionCourante();
      titreCourant = correspondance[1].trim();
    } else {
      tamponLignes.push(ligne);
    }
  }
  cloturerSectionCourante();

  return sections;
}
