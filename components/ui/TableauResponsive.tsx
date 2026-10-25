import { Children, cloneElement, isValidElement, type CSSProperties, type ReactElement, type ReactNode } from "react";

/** Texte brut d'un contenu React (intitulé de colonne) ; la version MathML cachée de KaTeX est ignorée pour éviter les doublons. */
function texteDe(noeud: ReactNode): string {
  if (typeof noeud === "string" || typeof noeud === "number") return String(noeud);
  if (Array.isArray(noeud)) return noeud.map(texteDe).join("");
  if (isValidElement<{ children?: ReactNode; className?: string }>(noeud)) {
    if (noeud.props.className?.includes("katex-mathml")) return "";
    return texteDe(noeud.props.children);
  }
  return "";
}

const elementsDeType = (noeud: ReactNode, type: string): ReactElement<{ children?: ReactNode }>[] =>
  Children.toArray(noeud).filter((n): n is ReactElement<{ children?: ReactNode }> => isValidElement(n) && n.type === type);

/** Intitulés des colonnes : les <th> de la première ligne du <thead> (une chaîne par colonne). */
function intitules(children: ReactNode): string[] {
  const thead = elementsDeType(children, "thead")[0];
  const ligne = thead && elementsDeType(thead.props.children, "tr")[0];
  if (!ligne) return [];
  return Children.toArray(ligne.props.children)
    .filter(isValidElement)
    .map((th) => texteDe((th as ReactElement<{ children?: ReactNode }>).props.children).replace(/​/g, "").replace(/\s+/g, " ").trim());
}

/** Recopie l'intitulé de chaque colonne en data-label sur les cellules du <tbody> (le contenu des cellules n'est pas touché). */
function etiqueter(children: ReactNode, labels: string[]): ReactNode {
  return Children.map(children, (enfant) => {
    if (!isValidElement<{ children?: ReactNode }>(enfant) || enfant.type !== "tbody") return enfant;
    const lignes = Children.map(enfant.props.children, (tr) => {
      if (!isValidElement<{ children?: ReactNode }>(tr) || tr.type !== "tr") return tr;
      let colonne = 0;
      const cellules = Children.map(tr.props.children, (td) => {
        if (!isValidElement<{ colSpan?: number }>(td)) return td;
        const label = labels[colonne];
        colonne += td.props.colSpan ?? 1;
        return label ? cloneElement(td as ReactElement<Record<string, unknown>>, { "data-label": label }) : td;
      });
      return cloneElement(tr as ReactElement<{ children?: ReactNode }>, { children: cellules });
    });
    return cloneElement(enfant, { children: lignes });
  });
}

/**
 * <table> responsive : tableau normal sur écran large ; sous 640 px (voir .tableau-responsive dans app/globals.css)
 * chaque ligne devient une carte « Intitulé : valeur ». Un tableau sans en-tête ou à une seule colonne reste tel quel.
 * `couleur` : couleur d'accent des cartes (bord gauche et intitulés), bleu fh par défaut.
 */
export default function TableauResponsive({ children, className, couleur }: { children: ReactNode; className?: string; couleur?: string }) {
  const labels = intitules(children);
  const empile = labels.length > 1 && labels.some(Boolean);
  const style = couleur ? ({ "--tableau-couleur": couleur } as CSSProperties) : undefined;
  return (
    <table className={[className, empile ? "tableau-responsive" : ""].filter(Boolean).join(" ") || undefined} style={style}>
      {empile ? etiqueter(children, labels) : children}
    </table>
  );
}
