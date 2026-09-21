"use client";

import RenduMarkdown from "@/components/RenduMarkdown";

interface CarteSectionProps {
  titre: string;
  contenu: string;
  onTermeClick?: (slug: string) => void;
}

/** "3.1 Définition" -> numéro "3.1" + reste "Définition". Sans numéro (ex.
 * "Démonstration 1 — ..." ou un titre d'Histoire sans numérotation), le
 * titre est gardé tel quel, sans badge. */
const MOTIF_NUMERO = /^(\d+\.\d+)\s+(.*)$/;

/**
 * Une sous-section du Cours, des Démonstrations ou de l'Histoire, en carte :
 * badge numéroté si le titre en commence par un ("3.1"), reste du titre en
 * gras fh-bleu, puis le contenu Markdown (formules, glossaire [[...]],
 * listes… tout ce que RenduMarkdown gère déjà, sans rien y changer).
 *
 * Le titre lui-même passe TOUJOURS par RenduMarkdown (pas un <h3> texte
 * brut) : des titres réels embarquent de l'italique/gras Markdown (ex.
 * "Et le logarithme *népérien*, alors ?") ou une formule (ex.
 * "Démonstration 1 — ... $\ln(ab)=\ln a+\ln b$") — un texte brut les
 * afficherait cassés (astérisques/dollars littéraux). Compromis assumé :
 * pas de vrai <h3> sémantique (RenduMarkdown ne rend qu'un <div>/<p>), pour
 * ne jamais afficher de syntaxe Markdown non interprétée dans un titre.
 */
export default function CarteSection({ titre, contenu, onTermeClick }: CarteSectionProps) {
  const correspondance = titre.match(MOTIF_NUMERO);
  const numero = correspondance?.[1];
  const resteDuTitre = correspondance ? correspondance[2] : titre;

  return (
    <div className="rounded-2xl border border-fh-sable bg-white p-5 shadow-[0_4px_20px_-6px_rgba(30,43,106,0.10)] sm:p-6">
      <div className="flex items-center gap-3">
        {numero && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fh-bleu to-fh-bleu-vif text-xs font-bold text-white">
            {numero}
          </span>
        )}
        <RenduMarkdown
          contenu={resteDuTitre}
          onTermeClick={onTermeClick}
          className="!text-base !font-bold !text-fh-bleu [&_p]:!m-0"
        />
      </div>

      {/* Fine ligne de séparation entre l'en-tête (badge + titre) et le
          contenu — purement visuelle, pas de logique derrière. */}
      <div className="my-4 h-px bg-fh-sable/70" aria-hidden="true" />

      {/* Les formules en display ($$...$$) défilent horizontalement plutôt
          que de déborder sur mobile (KaTeX gère déjà ça pour lui-même via
          katex.min.css, mais on borne aussi la carte en toute robustesse). */}
      <div className="overflow-x-auto">
        <RenduMarkdown contenu={contenu} onTermeClick={onTermeClick} />
      </div>
    </div>
  );
}
