/**
 * Parsing du bloc ```variations (voir docs/syntaxe-variations.md) — module
 * ISOMORPHE (aucun accès à window/document), même esprit que lib/courbe.ts
 * pour les courbes (voir ce fichier pour le modèle suivi ici).
 *
 * Différence de fond avec les courbes : ici les DONNÉES SONT EXPLICITES —
 * ce module ne calcule RIEN (pas de dérivée, pas d'évaluation numérique). Les
 * valeurs de x et de f sont de simples ÉTIQUETTES à afficher (texte ou LaTeX
 * simple) ; seuls les SIGNES de f'(x), déjà fournis par l'auteur, pilotent le
 * placement haut/bas des valeurs de f et la couleur des flèches — voir
 * `deriverPosition` plus bas, seule partie du module qui "déduit" quelque
 * chose, et uniquement à partir de ce que l'auteur a explicitement donné.
 *
 * Robustesse : toute anomalie lève VariationsSyntaxeError avec un message FR
 * clair ; c'est à l'appelant (TableauVariationsBloc) de l'attraper et
 * d'afficher un encadré d'erreur au lieu de planter tout le rendu Markdown.
 */

export class VariationsSyntaxeError extends Error {}

export type SigneIntervalle = "+" | "-" | "0";
export type PositionValeur = "haut" | "bas" | "milieu";

export interface ValeurVariation {
  /** Texte à afficher (rendu KaTeX si ça ressemble à du LaTeX ou si c'est
   * une infinité, sinon texte brut — voir components/TableauVariations.tsx). */
  texte: string;
  position: PositionValeur;
}

export interface ColonneVariations {
  /** Étiquette de la valeur x à cette colonne. */
  x: string;
  /** Vrai si cette colonne est listée dans "interdit:" (valeur exclue du
   * domaine — double trait vertical sur la ligne f'(x), voir TableauVariations). */
  interdit: boolean;
  /** Marqueur affiché sur la ligne f'(x) à cette colonne :
   * - "zero" : changement de signe détecté entre les deux intervalles
   *   adjacents (extremum local) — déduit, jamais authored ;
   * - "interdit" : colonne listée dans "interdit:" (valeur exclue du domaine,
   *   affiché "‖") ;
   * - null : rien (bornes du tableau sans annulation, ou pas de changement
   *   de signe). */
  marqueurSigne: "zero" | "interdit" | null;
  /** Une valeur (cas courant), ou deux si la colonne est "interdit:" avec une
   * notation "gauche|droite" (ex. 1/x en 0 : limite à gauche -∞, à droite +∞). */
  valeurs: ValeurVariation[];
}

export interface VariationsData {
  fonction: string;
  colonnes: ColonneVariations[]; // longueur n (n = nombre de valeurs de x)
  signes: SigneIntervalle[]; // longueur n-1 (un signe par intervalle)
}

const MOTS_INFINI: Record<string, string> = {
  "-inf": "-\\infty",
  "+inf": "+\\infty",
  "-infini": "-\\infty",
  "+infini": "+\\infty",
};

/** Une valeur "ressemble à du LaTeX" si elle contient un antislash ou un
 * exposant/indice — sinon rendue en texte brut (voir TableauVariations). */
export function ressembleLatex(valeur: string): boolean {
  return /\\|\^|_/.test(valeur);
}

/** Normalise un mot-clé d'infini reconnu (voir MOTS_INFINI) en LaTeX, sinon
 * renvoie la valeur telle quelle (texte brut ou LaTeX déjà écrit par l'auteur). */
function normaliserValeur(brut: string): string {
  const clef = brut.trim().toLowerCase();
  return MOTS_INFINI[clef] ?? brut.trim();
}

// ============================================================
//  Découpage "une directive par ligne" (identique en esprit à lib/courbe.ts)
// ============================================================

function decouperVirgules(s: string): string[] {
  return s.split(",").map((v) => v.trim());
}

/** Découpe une valeur de la ligne "f:" sur son éventuel "|" (notation
 * gauche|droite, réservée aux colonnes "interdit:" — voir docs). */
function decouperSplit(valeurBrute: string): string[] {
  return valeurBrute.split("|").map((v) => v.trim());
}

/**
 * Déduit où placer une valeur de f (haut/bas/milieu) à partir des signes des
 * DEUX intervalles adjacents (le cas échéant) — jamais à partir de la valeur
 * elle-même, qui n'est qu'une étiquette non interprétée. Voir
 * docs/syntaxe-variations.md « Comment le placement est déduit » pour le
 * détail des quatre cas ci-dessous.
 */
function deriverPosition(signeAvant: SigneIntervalle | null, signeApres: SigneIntervalle | null): PositionValeur {
  // Un voisin "plat" (0) n'indique ni montée ni descente : on se rabat sur
  // l'autre côté s'il est décisif, sur "milieu" sinon (cas rare, tableau
  // globalement constant).
  const avant = signeAvant === "0" ? signeApres : signeAvant;
  const apres = signeApres === "0" ? signeAvant : signeApres;

  if (avant === null && apres === null) return "milieu";
  if (avant === null) return apres === "+" ? "bas" : "haut"; // borne gauche du tableau
  if (apres === null) return avant === "+" ? "haut" : "bas"; // borne droite du tableau
  if (avant === "+" && apres === "-") return "haut"; // maximum local
  if (avant === "-" && apres === "+") return "bas"; // minimum local
  return "milieu"; // signes identiques des deux côtés : simple point de passage
}

/** Variante de deriverPosition pour une colonne "interdit:" à notation
 * "gauche|droite" : chaque moitié est traitée comme une borne à part entière
 * (fin de l'intervalle précédent pour la moitié gauche, début du suivant
 * pour la moitié droite) — voir docs/syntaxe-variations.md « Valeur
 * interdite » pour l'exemple complet (1/x en 0). */
function deriverPositionsSplit(signeAvant: SigneIntervalle | null, signeApres: SigneIntervalle | null): [PositionValeur, PositionValeur] {
  return [deriverPosition(signeAvant, null), deriverPosition(null, signeApres)];
}

function construireValeur(texte: string, position: PositionValeur): ValeurVariation {
  return { texte: normaliserValeur(texte), position };
}

/**
 * Parse le contenu d'un bloc ```variations (voir docs/syntaxe-variations.md).
 * Lève VariationsSyntaxeError (message FR) au moindre souci — jamais
 * d'exception générique non-typée, pour que l'appelant sache toujours quoi
 * afficher.
 */
export function parserBlocVariations(source: string): VariationsData {
  let fonction = "f";
  let xBrut: string[] | null = null;
  let signesBruts: string[] | null = null;
  let fBrut: string[] | null = null;
  const interditBruts: string[] = [];

  const lignes = source.split("\n");

  for (const ligneBrute of lignes) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new VariationsSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeur = ligne.slice(indexDeuxPoints + 1).trim();

    switch (cle) {
      case "fonction": {
        if (!valeur) throw new VariationsSyntaxeError('"fonction:" ne peut pas être vide.');
        fonction = valeur;
        break;
      }
      case "x": {
        xBrut = decouperVirgules(valeur);
        if (xBrut.length < 2 || xBrut.some((v) => !v)) {
          throw new VariationsSyntaxeError('"x:" doit lister au moins 2 valeurs séparées par des virgules.');
        }
        break;
      }
      case "signe": {
        signesBruts = decouperVirgules(valeur);
        break;
      }
      case "f": {
        fBrut = decouperVirgules(valeur);
        break;
      }
      case "interdit": {
        if (!valeur) throw new VariationsSyntaxeError('"interdit:" ne peut pas être vide.');
        interditBruts.push(valeur.trim());
        break;
      }
      default:
        throw new VariationsSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  if (!xBrut) throw new VariationsSyntaxeError('Ligne "x:" manquante (les valeurs remarquables de x).');
  if (!signesBruts) throw new VariationsSyntaxeError('Ligne "signe:" manquante (le signe de f\' sur chaque intervalle).');
  if (!fBrut) throw new VariationsSyntaxeError('Ligne "f:" manquante (les valeurs de f à chaque x).');

  const n = xBrut.length;

  if (signesBruts.length !== n - 1) {
    throw new VariationsSyntaxeError(
      `"signe:" a ${signesBruts.length} signe(s) mais "x:" a ${n} valeur(s) — il en faut exactement ${n - 1} ` +
        `(un par intervalle entre deux valeurs de x consécutives).`
    );
  }
  if (fBrut.length !== n) {
    throw new VariationsSyntaxeError(`"f:" a ${fBrut.length} valeur(s) mais "x:" en a ${n} — il en faut autant.`);
  }

  const signes: SigneIntervalle[] = signesBruts.map((s, i) => {
    if (s !== "+" && s !== "-" && s !== "0") {
      throw new VariationsSyntaxeError(
        `"signe:" : signe invalide « ${s} » (intervalle ${i + 1}) — attendu "+", "-" ou "0".`
      );
    }
    return s;
  });

  const indexInterdits = new Set<number>();
  for (const valeurInterdite of interditBruts) {
    const index = xBrut.findIndex((v) => v === valeurInterdite);
    if (index === -1) {
      throw new VariationsSyntaxeError(
        `"interdit: ${valeurInterdite}" ne correspond à aucune valeur de "x:" (recopie-la à l'identique).`
      );
    }
    indexInterdits.add(index);
  }

  const colonnes: ColonneVariations[] = xBrut.map((xTexte, i) => {
    const signeAvant = i > 0 ? signes[i - 1] : null;
    const signeApres = i < n - 1 ? signes[i] : null;
    const estInterdite = indexInterdits.has(i);
    const partiesValeur = decouperSplit(fBrut![i]);

    if (partiesValeur.length === 2 && !estInterdite) {
      throw new VariationsSyntaxeError(
        `"f:" : la notation "gauche|droite" (valeur ${i + 1}, « ${fBrut![i]} ») n'est permise qu'aux ` +
          `valeurs de x listées dans "interdit:".`
      );
    }
    if (partiesValeur.length > 2) {
      throw new VariationsSyntaxeError(`"f:" : au plus un seul "|" par valeur (valeur ${i + 1}, « ${fBrut![i]} »).`);
    }
    if (partiesValeur.some((p) => !p)) {
      throw new VariationsSyntaxeError(`"f:" : valeur ${i + 1} vide ou incomplète (« ${fBrut![i]} »).`);
    }

    let valeurs: ValeurVariation[];
    let marqueurSigne: ColonneVariations["marqueurSigne"];

    if (estInterdite) {
      marqueurSigne = "interdit";
      if (partiesValeur.length === 2) {
        const [posGauche, posDroite] = deriverPositionsSplit(signeAvant, signeApres);
        valeurs = [construireValeur(partiesValeur[0], posGauche), construireValeur(partiesValeur[1], posDroite)];
      } else {
        valeurs = [construireValeur(partiesValeur[0], deriverPosition(signeAvant, signeApres))];
      }
    } else {
      const changementDeSigne = signeAvant !== null && signeApres !== null && signeAvant !== signeApres && signeAvant !== "0" && signeApres !== "0";
      marqueurSigne = changementDeSigne ? "zero" : null;
      valeurs = [construireValeur(partiesValeur[0], deriverPosition(signeAvant, signeApres))];
    }

    return { x: normaliserValeur(xTexte), interdit: estInterdite, marqueurSigne, valeurs };
  });

  return { fonction, colonnes, signes };
}
