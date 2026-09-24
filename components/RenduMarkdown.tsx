"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { remarkGlossaire } from "@/lib/remarkGlossaire";
import { remarkCourbe } from "@/lib/remarkCourbe";
import { remarkVariations } from "@/lib/remarkVariations";
import { remarkHorloge } from "@/lib/remarkHorloge";
import { remarkBinaire } from "@/lib/remarkBinaire";
import { remarkCercleTrigo } from "@/lib/remarkCercleTrigo";
import { remarkRacines } from "@/lib/remarkRacines";
import { remarkMouvement } from "@/lib/remarkMouvement";
import { remarkCirculaire } from "@/lib/remarkCirculaire";
import { remarkPlanIncline } from "@/lib/remarkPlanIncline";
import CourbeFonctionBloc from "@/components/CourbeFonctionBloc";
import TableauVariationsBloc from "@/components/TableauVariationsBloc";
import HorlogeModulaireBloc from "@/components/HorlogeModulaireBloc";
import ConvertisseurBinaireBloc from "@/components/ConvertisseurBinaireBloc";
import CercleTrigonometriqueBloc from "@/components/CercleTrigonometriqueBloc";
import RacinesNiemesBloc from "@/components/RacinesNiemesBloc";
import SimulationMouvementBloc from "@/components/SimulationMouvementBloc";
import SimulationCirculaireBloc from "@/components/SimulationCirculaireBloc";
import SimulationPlanInclineBloc from "@/components/SimulationPlanInclineBloc";

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
  "data-horloge-source"?: string;
  "data-binaire-source"?: string;
  "data-cercletrigo-source"?: string;
  "data-racines-source"?: string;
  "data-mouvement-source"?: string;
  "data-circulaire-source"?: string;
  "data-plan-incline-source"?: string;
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
        remarkPlugins={[remarkMath, remarkGlossaire, remarkCourbe, remarkVariations, remarkHorloge, remarkBinaire, remarkCercleTrigo, remarkRacines, remarkMouvement, remarkCirculaire, remarkPlanIncline]}
        rehypePlugins={[rehypeKatex]}
        components={{
          figure: (props) => {
            const {
              "data-courbe-source": sourceCourbe,
              "data-horloge-source": sourceHorloge,
              "data-binaire-source": sourceBinaire,
              "data-cercletrigo-source": sourceCercleTrigo,
              "data-racines-source": sourceRacines,
              "data-mouvement-source": sourceMouvement,
              "data-circulaire-source": sourceCirculaire,
              "data-plan-incline-source": sourcePlanIncline,
            } = props as PropsFigureCourbe;
            // Huit plugins remark (courbe, horloge, binaire, cercletrigo,
            // racines, mouvement, circulaire, plan-incline) réutilisent le
            // même hName `figure` (voir lib/remarkHorloge.ts pour le detail
            // de ce choix) — on distingue via l'attribut data-* présent,
            // toujours un seul à la fois (node.lang mutuellement exclusifs
            // côté plugins).
            if (sourceCourbe !== undefined) return <CourbeFonctionBloc source={sourceCourbe} />;
            if (sourceHorloge !== undefined) return <HorlogeModulaireBloc source={sourceHorloge} />;
            if (sourceBinaire !== undefined) return <ConvertisseurBinaireBloc source={sourceBinaire} />;
            if (sourceCercleTrigo !== undefined) return <CercleTrigonometriqueBloc source={sourceCercleTrigo} />;
            if (sourceRacines !== undefined) return <RacinesNiemesBloc source={sourceRacines} />;
            if (sourceMouvement !== undefined) return <SimulationMouvementBloc source={sourceMouvement} />;
            if (sourceCirculaire !== undefined) return <SimulationCirculaireBloc source={sourceCirculaire} />;
            if (sourcePlanIncline !== undefined) return <SimulationPlanInclineBloc source={sourcePlanIncline} />;
            // Aucun des huit : un <figure> qui ne vient d'aucun de ces
            // plugins (aucun cas actuel dans ce Markdown, mais on ne plante
            // jamais pour autant) — on rend ses enfants tels quels.
            return <figure>{props.children}</figure>;
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
