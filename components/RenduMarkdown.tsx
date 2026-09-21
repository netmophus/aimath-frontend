"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { remarkGlossaire } from "@/lib/remarkGlossaire";
import { remarkCourbe } from "@/lib/remarkCourbe";
import { remarkVariations } from "@/lib/remarkVariations";
import CourbeFonctionBloc from "@/components/CourbeFonctionBloc";
import TableauVariationsBloc from "@/components/TableauVariationsBloc";

interface RenduMarkdownProps {
  contenu: string;
  className?: string;
  /**
   * Si fourni, les marqueurs [[slug]] / [[slug|texte]] du contenu deviennent
   * cliquables (bouton, pas un lien qui navigue) et appellent
   * onTermeClick(slug) au clic — c'est l'appelant (la page de lecture élève)
   * qui décide quoi en faire, typiquement ouvrir une modale de définition.
   *
   * Sans cette prop — cas de l'éditeur admin (ChampMarkdown) — les mêmes
   * marqueurs restent visibles (texte souligné en pointillé) mais INERTES :
   * l'aperçu ne doit ni planter ni suggérer une interactivité qui n'existe
   * pas dans l'éditeur.
   */
  onTermeClick?: (slug: string) => void;
}

interface PropsDfnTerme {
  "data-slug"?: string;
  "data-texte"?: string;
}

interface PropsFigureCourbe {
  "data-courbe-source"?: string;
}

interface PropsTableVariations {
  "data-variations-source"?: string;
}

/**
 * Rendu Markdown + LaTeX autonome et réutilisable : sert d'aperçu en direct
 * dans l'éditeur admin (ChampMarkdown) et à la lecture côté élève.
 * Formules : `$...$` en ligne, `$$...$$` centrée (convention remark-math).
 * Termes de glossaire : `[[slug]]` / `[[slug|texte]]` (voir remarkGlossaire).
 * Le CSS de KaTeX est importé une seule fois, globalement (app/layout.tsx).
 */
export default function RenduMarkdown({ contenu, className = "", onTermeClick }: RenduMarkdownProps) {
  if (!contenu.trim()) {
    return <p className={`text-sm italic text-fh-ardoise/50 ${className}`}>Aperçu…</p>;
  }

  return (
    <div className={`rendu-markdown text-sm text-fh-ardoise ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGlossaire, remarkCourbe, remarkVariations]}
        rehypePlugins={[rehypeKatex]}
        components={{
          figure: (props) => {
            const { "data-courbe-source": source } = props as PropsFigureCourbe;
            // `source` absent : un <figure> qui ne vient pas de remarkCourbe
            // (aucun cas actuel dans ce Markdown, mais on ne plante jamais
            // pour autant) — on rend ses enfants tels quels.
            if (source === undefined) return <figure>{props.children}</figure>;
            return <CourbeFonctionBloc source={source} />;
          },
          table: (props) => {
            const { "data-variations-source": source } = props as PropsTableVariations;
            // `source` absent : un vrai tableau Markdown standard (syntaxe
            // | a | b |) — aucun cas actuel dans ces leçons, mais on ne
            // plante jamais pour autant : rendu HTML <table> normal.
            if (source === undefined) return <table>{props.children}</table>;
            return <TableauVariationsBloc source={source} />;
          },
          dfn: (props) => {
            const { "data-slug": slug, "data-texte": texte } = props as PropsDfnTerme;
            const libelle = texte ?? slug ?? "";

            if (!onTermeClick || !slug) {
              // Admin (aperçu, inerte) : même couleur que côté élève pour
              // repérer ses marqueurs, mais aucun signal d'interactivité
              // (pas de curseur pointer, pas de survol "bouton").
              return (
                <span className="font-medium text-fh-orange underline decoration-fh-orange decoration-dotted underline-offset-2">
                  {libelle}
                </span>
              );
            }

            return (
              <button
                type="button"
                onClick={() => onTermeClick(slug)}
                aria-label={`Définition de ${libelle}`}
                className="-mx-0.5 cursor-pointer rounded px-0.5 py-0.5 font-medium text-fh-orange underline decoration-fh-orange decoration-dotted underline-offset-2 transition-colors hover:bg-fh-accent hover:text-fh-orange-fonce hover:decoration-fh-orange-fonce focus-visible:bg-fh-accent focus-visible:text-fh-orange-fonce focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-orange"
              >
                {libelle}
              </button>
            );
          },
        }}
      >
        {contenu}
      </ReactMarkdown>
    </div>
  );
}
