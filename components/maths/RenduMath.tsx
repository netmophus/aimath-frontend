import RenduMarkdown from "@/components/RenduMarkdown";
import { preparerMath } from "@/lib/mathTexte";

interface RenduMathProps {
  contenu: string;
  className?: string;
  /** Le champ est une formule seule sur sa ligne (formules, calculs, résultats) : `$$...$$` si tout est mathématique. */
  bloc?: boolean;
}

/**
 * RenduMarkdown pour les textes produits par l'IA : les expressions LaTeX dont le modèle a oublié les délimiteurs
 * sont délimitées avant le rendu KaTeX (voir lib/mathTexte.ts). Le texte ordinaire et les zones déjà balisées
 * ne sont pas modifiés.
 */
export default function RenduMath({ contenu, className, bloc = false }: RenduMathProps) {
  return <RenduMarkdown contenu={preparerMath(contenu, { bloc })} className={className} />;
}
