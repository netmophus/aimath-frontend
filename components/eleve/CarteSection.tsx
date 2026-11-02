"use client";

import { IconBookmark, type TablerIcon } from "@tabler/icons-react";

import RenduMarkdown from "@/components/RenduMarkdown";
import { melange } from "./teintesLecon";

interface CarteSectionProps {
  titre: string;
  contenu: string;
  onTermeClick?: (slug: string) => void;
  /** Couleur de la rubrique (bordure, pastille). Bleu par défaut. */
  couleur?: string;
  /** Icône de la pastille quand le titre n'a pas de numéro. */
  icone?: TablerIcon;
}

/** "3.1 Définition" -> numéro "3.1" + reste "Définition". Sans numéro (ex.
 * "Démonstration 1 — ..." ou un titre d'Histoire sans numérotation), le
 * titre est gardé tel quel, avec l'icône de la rubrique à la place du numéro. */
const MOTIF_NUMERO = /^(\d+\.\d+)\s+(.*)$/;

/**
 * Une sous-section du Cours, des Démonstrations, de l'Histoire ou de l'Examen, en carte :
 * pastille colorée (numéro "3.1" s'il existe, sinon icône de la rubrique), titre bleu marine,
 * puis le contenu Markdown (formules, glossaire [[...]], listes… tout ce que RenduMarkdown
 * gère déjà, sans rien y changer).
 *
 * Le titre lui-même passe TOUJOURS par RenduMarkdown (pas un <h3> texte
 * brut) : des titres réels embarquent de l'italique/gras Markdown (ex.
 * "Et le logarithme *népérien*, alors ?") ou une formule (ex.
 * "Démonstration 1 — ... $\ln(ab)=\ln a+\ln b$") — un texte brut les
 * afficherait cassés (astérisques/dollars littéraux). Compromis assumé :
 * pas de vrai <h3> sémantique (RenduMarkdown ne rend qu'un <div>/<p>), pour
 * ne jamais afficher de syntaxe Markdown non interprétée dans un titre.
 */
export default function CarteSection({
  titre,
  contenu,
  onTermeClick,
  couleur = "#2563EB",
  icone: Icone = IconBookmark,
}: CarteSectionProps) {
  const correspondance = titre.match(MOTIF_NUMERO);
  const numero = correspondance?.[1];
  const resteDuTitre = correspondance ? correspondance[2] : titre;

  return (
    <section
      className="overflow-hidden rounded-3xl border-2 bg-white shadow-[0_6px_24px_-10px_rgba(16,42,102,0.18)]"
      style={{ borderColor: melange(couleur, 35) }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-6 sm:py-4"
        style={{ backgroundColor: melange(couleur, 9) }}
      >
        <span
          aria-hidden="true"
          className="flex h-11 min-w-11 shrink-0 items-center justify-center rounded-2xl px-2 text-sm font-extrabold text-white sm:h-12 sm:min-w-12 sm:text-base"
          style={{ backgroundColor: couleur }}
        >
          {numero ?? <Icone size={24} stroke={1.9} />}
        </span>
        <RenduMarkdown
          contenu={resteDuTitre}
          onTermeClick={onTermeClick}
          className="!text-lg !leading-snug !font-extrabold !text-[#102A66] min-w-0 sm:!text-xl [&_p]:!m-0 [&_p]:!max-w-none [&_p]:!text-left"
        />
      </div>

      {/* Les formules en display ($$...$$) défilent horizontalement plutôt
          que de déborder sur mobile (KaTeX gère déjà ça pour lui-même via
          katex.min.css, mais on borne aussi la carte en toute robustesse). */}
      <div className="overflow-x-auto px-4 py-4 sm:px-6 sm:py-5">
        <RenduMarkdown contenu={contenu} onTermeClick={onTermeClick} />
      </div>
    </section>
  );
}
