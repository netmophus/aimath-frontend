"use client";

import { decouperSections } from "@/lib/decouperSections";
import RenduMarkdown from "@/components/RenduMarkdown";
import CarteSection from "./CarteSection";
import CarteCorrigeExamen from "./CarteCorrigeExamen";

interface SujetExamenLectureProps {
  contenu: string;
  onTermeClick?: (slug: string) => void;
}

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
 */
function scinderEnonceEtCorrige(contenu: string): { enonce: string; corrige: string | null } {
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

/**
 * Rendu du sujet type examen (énoncé + corrigé). L'énoncé se découpe en
 * cartes comme Cours/Démonstrations (decouperSections sur les titres
 * ##/###) ; le corrigé, lui, part entier dans une seule CarteCorrigeExamen
 * floutée — même mécanisme de flou que les corrigés d'exercices
 * (CarteExercice.tsx), appliqué ici à toute la partie corrigée.
 */
export default function SujetExamenLecture({ contenu, onTermeClick }: SujetExamenLectureProps) {
  const { enonce, corrige } = scinderEnonceEtCorrige(contenu);
  const sections = decouperSections(enonce);

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section, index) =>
        section.titre ? (
          <CarteSection
            key={`${index}-${section.titre}`}
            titre={section.titre}
            contenu={section.contenu}
            onTermeClick={onTermeClick}
          />
        ) : (
          <RenduMarkdown key={`${index}-intro`} contenu={section.contenu} onTermeClick={onTermeClick} />
        )
      )}

      {corrige !== null && corrige.trim() && <CarteCorrigeExamen contenu={corrige} onTermeClick={onTermeClick} />}
    </div>
  );
}
