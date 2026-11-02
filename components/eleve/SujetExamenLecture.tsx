"use client";

import { decouperSections } from "@/lib/decouperSections";
import { scinderEnonceEtCorrige } from "@/lib/scinderExamen";
import RenduMarkdown from "@/components/RenduMarkdown";
import CarteSection from "./CarteSection";
import CarteCorrigeExamen from "./CarteCorrigeExamen";
import { IDENTITES_RUBRIQUES } from "./teintesLecon";

interface SujetExamenLectureProps {
  contenu: string;
  onTermeClick?: (slug: string) => void;
}

/**
 * Rendu du sujet type examen (énoncé + corrigé). L'énoncé se découpe en
 * cartes comme Cours/Démonstrations (decouperSections sur les titres
 * ##/###) ; le corrigé, lui, part entier dans une seule CarteCorrigeExamen
 * floutée — même mécanisme de flou que les corrigés d'exercices
 * (CarteExercice.tsx), appliqué ici à toute la partie corrigée. Le découpage
 * énoncé/corrigé vit dans lib/scinderExamen.ts (testé).
 */
export default function SujetExamenLecture({ contenu, onTermeClick }: SujetExamenLectureProps) {
  const { enonce, corrige } = scinderEnonceEtCorrige(contenu);
  const sections = decouperSections(enonce);
  const { couleur, icone } = IDENTITES_RUBRIQUES.examen;

  return (
    <div className="flex flex-col gap-5">
      {sections.map((section, index) =>
        section.titre ? (
          <CarteSection
            key={`${index}-${section.titre}`}
            titre={section.titre}
            contenu={section.contenu}
            onTermeClick={onTermeClick}
            couleur={couleur}
            icone={icone}
          />
        ) : (
          <RenduMarkdown key={`${index}-intro`} contenu={section.contenu} onTermeClick={onTermeClick} />
        )
      )}

      {corrige !== null && corrige.trim() && <CarteCorrigeExamen contenu={corrige} onTermeClick={onTermeClick} />}
    </div>
  );
}
