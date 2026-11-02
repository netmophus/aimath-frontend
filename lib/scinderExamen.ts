/** Titre "Corrigé" (H2 ou H3, comme decouperSections) — insensible à la
 * casse et à l'accent ("Corrige" sans accent toléré). Bornes de niveau
 * identiques à MOTIF_TITRE_H2_OU_H3 (lib/decouperSections.ts) pour rester
 * cohérent avec ce que cette fonction reconnaît comme un titre. */
const MOTIF_TITRE_CORRIGE = /^#{2,3}\s*corrig[ée]/i;
const MOTIF_BORDURE_FENCE = /^(`{3,}|~{3,})/;

/**
 * Coupe le sujet type examen en (énoncé, corrigé) à la première ligne
 * "## Corrigé" rencontrée (hors bloc de code fenced — même garde que
 * decouperSections). Volontairement un découpage à part, au niveau du texte
 * BRUT, plutôt que de chercher une carte "Corrigé" dans le résultat de
 * decouperSections : cette dernière DROP silencieusement une section dont le
 * contenu est vide une fois trim — exactement le cas d'un titre "## Corrigé"
 * immédiatement suivi d'un sous-titre "### Exercice 1" (rien entre les
 * deux), ce qui ferait disparaître le repère "Corrigé" avant même de pouvoir
 * le chercher. Le corrigé n'est donc jamais lui-même redécoupé en cartes —
 * il part tel quel (sous-titres ### inclus s'il y en a) dans UNE seule
 * CarteCorrigeExamen, qui le floute comme un bloc entier.
 *
 * (Extrait tel quel de SujetExamenLecture.tsx pour pouvoir être testé.)
 */
export function scinderEnonceEtCorrige(contenu: string): { enonce: string; corrige: string | null } {
  const texte = contenu.replace(/\r\n?/g, "\n");
  const lignes = texte.split("\n");
  let dansBlocDeCode = false;

  for (let i = 0; i < lignes.length; i++) {
    const ligne = lignes[i];
    if (MOTIF_BORDURE_FENCE.test(ligne.trim())) {
      dansBlocDeCode = !dansBlocDeCode;
      continue;
    }
    if (!dansBlocDeCode && MOTIF_TITRE_CORRIGE.test(ligne.trim())) {
      return { enonce: lignes.slice(0, i).join("\n"), corrige: lignes.slice(i + 1).join("\n") };
    }
  }

  return { enonce: texte, corrige: null };
}
