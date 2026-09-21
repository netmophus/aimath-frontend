/**
 * Parsing du bloc ```courbe (voir docs/syntaxe-courbe.md pour la syntaxe
 * documentée) — module ISOMORPHE (aucun accès à window/document) : le rendu
 * effectif (function-plot) vit dans components/CourbeFonction.tsx, chargé
 * dynamiquement côté client uniquement. Ce fichier ne fait QUE :
 *   - parser le texte du bloc en une structure CourbeData typée ;
 *   - évaluer les expressions numériques scalaires (domaine, points,
 *     asymptotes) via un petit évaluateur maison (voir evaluerExpressionScalaire) —
 *     PAS de dépendance à function-plot ici, pour rester utilisable pendant
 *     un rendu serveur sans risque.
 *
 * Robustesse : toute anomalie lève CourbeSyntaxeError avec un message FR
 * clair ; c'est à l'appelant (CourbeFonctionBloc) de l'attraper et d'afficher
 * un encadré d'erreur au lieu de laisser planter tout le rendu Markdown.
 */

export class CourbeSyntaxeError extends Error {}

export interface CourbeFonctionDef {
  expr: string;
  couleur: string;
  nom?: string;
}

export interface CourbePoint {
  x: number;
  y: number;
  etiquette?: string;
}

export interface CourbeAsymptote {
  type: "verticale" | "horizontale";
  valeur: number;
}

export interface CourbeData {
  fonctions: CourbeFonctionDef[];
  domaineX: [number, number];
  domaineY?: [number, number];
  points: CourbePoint[];
  asymptotes: CourbeAsymptote[];
  /** Positions x pour une tangente — parsé mais PAS ENCORE rendu (TODO, voir
   * docs/syntaxe-courbe.md) : conservé pour ne pas perdre l'info si le bloc
   * est réenregistré, et pour brancher le rendu plus tard sans reparser. */
  tangentes: number[];
}

// ============================================================
//  Évaluateur scalaire maison (nombres, + - * / ^, parenthèses,
//  constantes e/pi, fonctions usuelles) — AUCUN lien avec function-plot.
// ============================================================

const FONCTIONS_SUPPORTEES: Record<string, (x: number) => number> = {
  sqrt: Math.sqrt,
  ln: Math.log,
  exp: Math.exp,
  log10: Math.log10,
  log2: Math.log2,
  abs: Math.abs,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
};

const CONSTANTES_SUPPORTEES: Record<string, number> = {
  e: Math.E,
  pi: Math.PI,
};

type TypeJeton = "nombre" | "ident" | "op" | "fin";

interface Jeton {
  type: TypeJeton;
  valeur: string;
}

function tokeniser(expr: string): Jeton[] {
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (/\s/.test(c)) {
      i += 1;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      const debut = i;
      while (i < expr.length && /[0-9.]/.test(expr[i])) i += 1;
      const valeur = expr.slice(debut, i);
      if (!/^\d+(\.\d+)?$|^\.\d+$/.test(valeur)) {
        throw new CourbeSyntaxeError(`Nombre invalide : « ${valeur} ».`);
      }
      jetons.push({ type: "nombre", valeur });
      continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      const debut = i;
      while (i < expr.length && /[a-zA-Z_0-9]/.test(expr[i])) i += 1;
      jetons.push({ type: "ident", valeur: expr.slice(debut, i) });
      continue;
    }
    if ("+-*/^(),".includes(c)) {
      jetons.push({ type: "op", valeur: c });
      i += 1;
      continue;
    }
    throw new CourbeSyntaxeError(`Caractère inattendu dans l'expression : « ${c} ».`);
  }
  jetons.push({ type: "fin", valeur: "" });
  return jetons;
}

/** Petit évaluateur récursif-descendant. Grammaire (du moins prioritaire au
 * plus prioritaire) : expression → terme → unaire(signe) → puissance(^, associatif
 * à droite) → atome(nombre | constante | fonction(...) | (expression)). */
class EvaluateurScalaire {
  private jetons: Jeton[];
  private position = 0;
  private variables: Record<string, number>;

  constructor(expr: string, variables: Record<string, number>) {
    this.jetons = tokeniser(expr);
    this.variables = variables;
  }

  evaluer(): number {
    const valeur = this.expression();
    if (this.actuel().type !== "fin") {
      throw new CourbeSyntaxeError(`Expression invalide près de « ${this.actuel().valeur} ».`);
    }
    return valeur;
  }

  private actuel(): Jeton {
    return this.jetons[this.position];
  }

  private consommer(valeurAttendue?: string): Jeton {
    const jeton = this.jetons[this.position];
    if (valeurAttendue !== undefined && jeton.valeur !== valeurAttendue) {
      throw new CourbeSyntaxeError(`« ${valeurAttendue} » attendu, trouvé « ${jeton.valeur || "fin"} ».`);
    }
    this.position += 1;
    return jeton;
  }

  private expression(): number {
    let valeur = this.terme();
    while (this.actuel().type === "op" && (this.actuel().valeur === "+" || this.actuel().valeur === "-")) {
      const op = this.consommer().valeur;
      const droite = this.terme();
      valeur = op === "+" ? valeur + droite : valeur - droite;
    }
    return valeur;
  }

  private terme(): number {
    let valeur = this.unaire();
    while (this.actuel().type === "op" && (this.actuel().valeur === "*" || this.actuel().valeur === "/")) {
      const op = this.consommer().valeur;
      const droite = this.unaire();
      valeur = op === "*" ? valeur * droite : valeur / droite;
    }
    return valeur;
  }

  private unaire(): number {
    if (this.actuel().type === "op" && (this.actuel().valeur === "-" || this.actuel().valeur === "+")) {
      const op = this.consommer().valeur;
      const valeur = this.puissance();
      return op === "-" ? -valeur : valeur;
    }
    return this.puissance();
  }

  /** Associatif à droite, et l'exposant peut porter son propre signe (x^-2). */
  private puissance(): number {
    const base = this.atome();
    if (this.actuel().type === "op" && this.actuel().valeur === "^") {
      this.consommer("^");
      const exposant = this.unaire();
      return Math.pow(base, exposant);
    }
    return base;
  }

  private atome(): number {
    const jeton = this.actuel();

    if (jeton.type === "nombre") {
      this.consommer();
      return Number(jeton.valeur);
    }

    if (jeton.type === "op" && jeton.valeur === "(") {
      this.consommer("(");
      const valeur = this.expression();
      this.consommer(")");
      return valeur;
    }

    if (jeton.type === "ident") {
      this.consommer();
      const nom = jeton.valeur;

      // Appel de fonction : ident suivi de "("
      if (this.actuel().type === "op" && this.actuel().valeur === "(") {
        const fonction = FONCTIONS_SUPPORTEES[nom.toLowerCase()];
        if (!fonction) {
          throw new CourbeSyntaxeError(`Fonction inconnue : « ${nom} ».`);
        }
        this.consommer("(");
        const argument = this.expression();
        this.consommer(")");
        return fonction(argument);
      }

      // Variable (x) ou constante (e, pi)
      if (nom in this.variables) return this.variables[nom];
      const constante = CONSTANTES_SUPPORTEES[nom.toLowerCase()];
      if (constante !== undefined) return constante;

      throw new CourbeSyntaxeError(`Symbole inconnu : « ${nom} ».`);
    }

    throw new CourbeSyntaxeError(`Expression invalide près de « ${jeton.valeur || "fin"} ».`);
  }
}

/** Évalue une expression scalaire (domaine, coordonnée de point, position
 * d'asymptote…). `variables` permet d'autoriser `x` lors de la validation
 * d'une expression de fonction (voir validerExpressionFonction). */
export function evaluerExpressionScalaire(expr: string, variables: Record<string, number> = {}): number {
  const valeur = new EvaluateurScalaire(expr, variables).evaluer();
  if (!Number.isFinite(valeur)) {
    throw new CourbeSyntaxeError(`« ${expr} » ne donne pas un nombre fini.`);
  }
  return valeur;
}

/** Valide qu'une expression de fonction (variable x) est syntaxiquement
 * correcte, sans exiger qu'elle soit définie partout (une asymptote comme
 * 1/x en x=0 est normale, ce n'est pas une erreur de syntaxe). */
function validerExpressionFonction(expr: string, pointDeControle: number): void {
  try {
    new EvaluateurScalaire(expr, { x: pointDeControle }).evaluer();
  } catch (erreur) {
    // Un résultat non fini (NaN/Infinity) au point de contrôle est TOLÉRÉ
    // (asymptote potentiellement pile sur ce point) : seule une erreur de
    // syntaxe (jetée par evaluer(), pas par le contrôle Number.isFinite d'
    // evaluerExpressionScalaire qui n'est pas utilisé ici) doit remonter.
    if (erreur instanceof CourbeSyntaxeError) {
      throw new CourbeSyntaxeError(`Fonction « ${expr} » invalide : ${erreur.message}`);
    }
    throw erreur;
  }
}

// ============================================================
//  Normalisation pour function-plot (voir components/CourbeFonction.tsx)
// ============================================================

/** function-plot (son évaluateur interne à base d'arithmétique d'intervalles)
 * n'accepte que E/PI en MAJUSCULES pour les constantes — jamais e/pi en
 * minuscules (symbole non défini). On normalise ici, uniquement pour la
 * chaîne transmise à function-plot ; l'évaluateur scalaire ci-dessus, lui,
 * accepte déjà les deux casses nativement. */
function normaliserCasseConstantes(expr: string): string {
  return expr.replace(/\be\b/g, "E").replace(/\bpi\b/gi, "PI");
}

/** Contourne un bug connu de l'arithmétique d'intervalles de function-plot :
 * `E^(expression composée)` renvoie systématiquement un intervalle vide
 * (courbe blanche, sans le moindre message) dès que l'exposant résulte d'un
 * calcul (ex. E^(2*x)) — seul un exposant littéral ou une variable seule
 * (E^x) fonctionne. Réécrit E^(...) en exp(...), mathématiquement
 * équivalent et non affecté par ce bug (voir docs/syntaxe-courbe.md). */
function reecrireExponentiellesBaseE(expr: string): string {
  let resultat = "";
  let curseur = 0;
  const motif = /E\^\(/g;
  let correspondance: RegExpExecArray | null;

  while ((correspondance = motif.exec(expr)) !== null) {
    const debutParenthese = correspondance.index + correspondance[0].length - 1;
    let profondeur = 1;
    let fin = -1;
    for (let i = debutParenthese + 1; i < expr.length; i += 1) {
      if (expr[i] === "(") profondeur += 1;
      else if (expr[i] === ")") {
        profondeur -= 1;
        if (profondeur === 0) {
          fin = i;
          break;
        }
      }
    }
    if (fin === -1) break; // parenthèse non refermée : laissé tel quel, la validation l'aura déjà signalé

    resultat += expr.slice(curseur, correspondance.index) + "exp(" + expr.slice(debutParenthese + 1, fin) + ")";
    curseur = fin + 1;
    motif.lastIndex = curseur;
  }
  resultat += expr.slice(curseur);
  return resultat;
}

/** Prépare une expression de fonction pour function-plot : à appeler UNIQUEMENT
 * côté client, juste avant de la transmettre à la lib de tracé. */
export function normaliserExpressionPourFunctionPlot(expr: string): string {
  return reecrireExponentiellesBaseE(normaliserCasseConstantes(expr));
}

// ============================================================
//  Palette de couleurs (charte fh-*)
// ============================================================

const PALETTE_NOMMEE: Record<string, string> = {
  orange: "#D14205", // fh-orange
  bleu: "#1F2CA2", // fh-bleu-vif : plus lisible qu'un bleu marine sur fond blanc
  vert: "#16A34A",
  rouge: "#DC2626",
  violet: "#7C3AED",
  gris: "#363032", // fh-ardoise
};

const ROTATION_COULEURS = Object.values(PALETTE_NOMMEE);

function resoudreCouleur(nom: string | undefined, index: number): string {
  if (!nom || !nom.trim()) return ROTATION_COULEURS[index % ROTATION_COULEURS.length];
  const clef = nom.trim().toLowerCase();
  // Couleur CSS non reconnue (hex, nom CSS standard…) : transmise telle
  // quelle, function-plot/le SVG l'interprètera directement (dégradation
  // silencieuse et non bloquante si elle est malgré tout invalide).
  return PALETTE_NOMMEE[clef] ?? nom.trim();
}

// ============================================================
//  Parsing du bloc — syntaxe "une directive par ligne" (voir
//  docs/syntaxe-courbe.md pour la justification de ce choix).
// ============================================================

/** Découpe sur les virgules de premier niveau (hors parenthèses), jusqu'à
 * `maxParts` morceaux — le dernier morceau conserve tel quel le reste de la
 * chaîne (utile pour l'étiquette libre d'un point, qui peut contenir des
 * virgules). */
function decouperNiveauZero(s: string, maxParts: number): string[] {
  const parties: string[] = [];
  let profondeur = 0;
  let debut = 0;
  for (let i = 0; i < s.length && parties.length < maxParts - 1; i += 1) {
    const c = s[i];
    if (c === "(") profondeur += 1;
    else if (c === ")") profondeur -= 1;
    else if (c === "," && profondeur === 0) {
      parties.push(s.slice(debut, i));
      debut = i + 1;
    }
  }
  parties.push(s.slice(debut));
  return parties.map((p) => p.trim());
}

function parserPaire(valeur: string, contexte: string): [number, number] {
  const parties = decouperNiveauZero(valeur, 2);
  if (parties.length !== 2 || !parties[0] || !parties[1]) {
    throw new CourbeSyntaxeError(`« ${contexte}: ${valeur} » doit avoir la forme "min, max".`);
  }
  const min = evaluerExpressionScalaire(parties[0]);
  const max = evaluerExpressionScalaire(parties[1]);
  if (min >= max) {
    throw new CourbeSyntaxeError(`« ${contexte}: ${valeur} » : le premier nombre doit être strictement inférieur au second.`);
  }
  return [min, max];
}

/**
 * Parse le contenu d'un bloc ```courbe (voir docs/syntaxe-courbe.md).
 * Lève CourbeSyntaxeError (message FR) au moindre souci — jamais d'exception
 * générique non-typée, pour que l'appelant sache toujours quoi afficher.
 */
export function parserBlocCourbe(source: string): CourbeData {
  const fonctions: CourbeFonctionDef[] = [];
  const points: CourbePoint[] = [];
  const asymptotes: CourbeAsymptote[] = [];
  const tangentes: number[] = [];
  let domaineX: [number, number] | null = null;
  let domaineY: [number, number] | undefined;

  const lignes = source.split("\n");

  for (const ligneBrute of lignes) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new CourbeSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeur = ligne.slice(indexDeuxPoints + 1).trim();

    switch (cle) {
      case "fonction": {
        if (!valeur) throw new CourbeSyntaxeError('"fonction:" ne peut pas être vide.');
        fonctions.push({ expr: valeur, couleur: "" });
        break;
      }
      case "couleur": {
        const derniere = fonctions[fonctions.length - 1];
        if (!derniere) throw new CourbeSyntaxeError('"couleur:" doit suivre une ligne "fonction:".');
        derniere.couleur = valeur;
        break;
      }
      case "nom": {
        const derniere = fonctions[fonctions.length - 1];
        if (!derniere) throw new CourbeSyntaxeError('"nom:" doit suivre une ligne "fonction:".');
        derniere.nom = valeur;
        break;
      }
      case "domaine": {
        domaineX = parserPaire(valeur, "domaine");
        break;
      }
      case "domaine-y": {
        domaineY = parserPaire(valeur, "domaine-y");
        break;
      }
      case "point": {
        const parties = decouperNiveauZero(valeur, 3);
        if (parties.length < 2 || !parties[0] || !parties[1]) {
          throw new CourbeSyntaxeError(`"point: ${valeur}" doit avoir la forme "x, y" ou "x, y, étiquette".`);
        }
        points.push({
          x: evaluerExpressionScalaire(parties[0]),
          y: evaluerExpressionScalaire(parties[1]),
          etiquette: parties[2] || undefined,
        });
        break;
      }
      case "asymptote-verticale": {
        asymptotes.push({ type: "verticale", valeur: evaluerExpressionScalaire(valeur) });
        break;
      }
      case "asymptote-horizontale": {
        asymptotes.push({ type: "horizontale", valeur: evaluerExpressionScalaire(valeur) });
        break;
      }
      case "tangente": {
        // TODO (reporté, voir docs/syntaxe-courbe.md) : accepté et conservé,
        // mais pas encore rendu par CourbeFonction.
        tangentes.push(evaluerExpressionScalaire(valeur));
        break;
      }
      default:
        throw new CourbeSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  if (fonctions.length === 0) {
    throw new CourbeSyntaxeError('Aucune fonction définie (ajoutez une ligne "fonction: ...").');
  }

  const domaineXFinal: [number, number] = domaineX ?? [-10, 10];

  fonctions.forEach((fonction, index) => {
    validerExpressionFonction(fonction.expr, (domaineXFinal[0] + domaineXFinal[1]) / 2);
    fonction.couleur = resoudreCouleur(fonction.couleur, index);
  });

  return { fonctions, domaineX: domaineXFinal, domaineY, points, asymptotes, tangentes };
}
