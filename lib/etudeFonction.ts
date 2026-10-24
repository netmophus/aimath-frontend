import type { CourbeData } from "@/lib/courbe";
import { parserBlocVariations, type VariationsData } from "@/lib/variations";

/**
 * Étude d'une fonction polynomiale, calculée et contrôlée par le backend (SymPy, voir
 * programme/correction/etude_fonction.py). Le navigateur ne calcule RIEN : il met en forme
 * des données déjà vérifiées. Aucune expression venue de l'IA ou de l'élève n'arrive ici ;
 * `courbe.expr` est régénérée côté serveur depuis le polynôme, et revérifiée par
 * `expressionSure` avant d'être confiée à function-plot.
 */

export interface EtudeVerifiee {
  statut: "verifie";
  variable: string;
  fonction: { latex: string; texte: string };
  derivee: { latex: string; texte: string };
  degre: number;
  constante: boolean;
  verification: { methode: string; controles_numeriques: number };
  points_critiques: { x_latex: string; x: number; multiplicite: number }[];
  extrema: { x_latex: string; y_latex: string; x: number; y: number; nature: "maximum local" | "minimum local" }[];
  sans_extremum: { x_latex: string; y_latex: string; x: number }[];
  intervalles: { borne_inf: string; borne_sup: string; signe: "+" | "-" | "0"; sens: string; intervalle_latex: string }[];
  limites: { moins_infini: string; plus_infini: string };
  tableau: {
    x: string[];
    signes: ("+" | "-" | "0")[];
    f: string[];
    /** Indices des colonnes où f'(x) = 0 : TOUS les points critiques, même sans changement de signe (x³ en 0). */
    zeros_derivee?: number[];
  };
  courbe: {
    expr: string;
    domaine_x: [number, number];
    domaine_y: [number, number];
    points: { x: number; y: number; etiquette: string }[];
    zeros: { x_latex: string; x: number }[];
    ordonnee_origine_latex: string;
  };
  /** Ce que la question traite : « variations » → tableau, « extrema » → courbe et extrema. */
  demande?: ("variations" | "extrema")[];
  contredit_par_la_correction?: boolean;
}

export interface EtudeNonPrise {
  statut: "non_pris_en_charge";
  raison: string;
  fonction_texte?: string;
  demande?: ("variations" | "extrema")[];
}

export type EtudeFonction = EtudeVerifiee | EtudeNonPrise;

/** Une expression de tracé ne contient que chiffres, x, opérateurs et parenthèses. */
const MOTIF_EXPRESSION_SURE = /^[0-9x+\-*/^(). ]{1,200}$/;

export function expressionSure(expr: string): boolean {
  return MOTIF_EXPRESSION_SURE.test(expr);
}

const COULEUR_COURBE = "#D14205"; // fh-orange

/** CourbeData pour le composant de tracé existant ; null si l'expression n'est pas sûre. */
export function versCourbeData(etude: EtudeVerifiee): CourbeData | null {
  if (!expressionSure(etude.courbe.expr)) return null;
  return {
    fonctions: [{ expr: etude.courbe.expr, couleur: COULEUR_COURBE, nom: "f" }],
    domaineX: [...etude.courbe.domaine_x],
    domaineY: [...etude.courbe.domaine_y],
    points: etude.courbe.points.map((p) => ({ x: p.x, y: p.y, etiquette: p.etiquette || undefined })),
    asymptotes: [],
    tangentes: [],
  };
}

/** VariationsData pour le tableau existant, via le parseur du bloc ```variations (aucune déduction ici :
 * les signes et valeurs viennent du serveur). Le parseur ne marque d'un « 0 » que les colonnes où le signe change ;
 * les zéros de f' vérifiés par le serveur sont donc marqués ici, y compris sans changement de signe (x³ en 0).
 * null si les longueurs sont incohérentes. */
export function versVariationsData(etude: EtudeVerifiee): VariationsData | null {
  const { x, signes, f, zeros_derivee: zeros = [] } = etude.tableau;
  if (x.length < 2 || signes.length !== x.length - 1 || f.length !== x.length) return null;
  if ([...x, ...f].some((valeur) => /[,\n|]/.test(valeur))) return null;
  try {
    const data = parserBlocVariations(
      ["fonction: f", `x: ${x.join(", ")}`, `signe: ${signes.join(", ")}`, `f: ${f.join(", ")}`].join("\n"),
    );
    for (const i of zeros) {
      const colonne = data.colonnes[i];
      if (i > 0 && i < x.length - 1 && colonne && colonne.marqueurSigne === null) colonne.marqueurSigne = "zero";
    }
    return data;
  } catch {
    return null;
  }
}
