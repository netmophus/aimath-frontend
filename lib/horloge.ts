/**
 * Parsing du bloc ```horloge (voir docs/syntaxe-horloge.md) — module
 * ISOMORPHE (aucun accès à window/document), même esprit que lib/variations.ts
 * pour les tableaux de variations (voir ce fichier pour le modèle suivi ici).
 *
 * Deux directives : "modulo: n" (obligatoire au sens pédagogique, le nombre
 * de graduations du cadran) et "comparaison: b" (optionnelle — affiche une
 * 2e aiguille fixe pour vérifier a ≡ b (mod n), voir components/HorlogeModulaire.tsx).
 * Tout le reste (valeur courante "a", animation, calcul de congruence) est de
 * l'état d'interaction géré côté composant, pas du contenu à parser.
 *
 * Rétrocompatibilité : "comparaison" est absente de tout bloc écrit avant son
 * introduction — HorlogeData.comparaison est donc `undefined` dans ce cas, et
 * le composant garde son rendu à une seule aiguille (voir la vérification
 * explicite `data.comparaison !== undefined` côté composant).
 */

export class HorlogeSyntaxeError extends Error {}

export interface HorlogeData {
  modulo: number;
  /** Absente = comportement d'avant (une seule aiguille), voir le commentaire ci-dessus. */
  comparaison?: number;
}

const MODULO_DEFAUT = 12;
const MODULO_MIN = 2;
const MODULO_MAX = 60; // au-delà, les graduations se chevauchent sur le cadran

/**
 * Parse le contenu d'un bloc ```horloge. Lève HorlogeSyntaxeError (message
 * FR) au moindre souci — jamais d'exception générique non-typée, pour que
 * l'appelant (HorlogeModulaireBloc) sache toujours quoi afficher.
 */
export function parserBlocHorloge(source: string): HorlogeData {
  let modulo: number | null = null;
  let comparaison: number | null = null;

  const lignes = source.split("\n");

  for (const ligneBrute of lignes) {
    const ligne = ligneBrute.trim();
    if (!ligne || ligne.startsWith("#")) continue;

    const indexDeuxPoints = ligne.indexOf(":");
    if (indexDeuxPoints === -1) {
      throw new HorlogeSyntaxeError(`Ligne invalide (attendu "clé: valeur") : « ${ligne} ».`);
    }
    const cle = ligne.slice(0, indexDeuxPoints).trim().toLowerCase();
    const valeurBrute = ligne.slice(indexDeuxPoints + 1).trim();

    switch (cle) {
      case "modulo": {
        const n = Number(valeurBrute);
        if (!Number.isInteger(n)) {
          throw new HorlogeSyntaxeError(`"modulo:" doit être un entier (reçu « ${valeurBrute} »).`);
        }
        modulo = n;
        break;
      }
      case "comparaison": {
        const n = Number(valeurBrute);
        if (!Number.isInteger(n)) {
          throw new HorlogeSyntaxeError(`"comparaison:" doit être un entier (reçu « ${valeurBrute} »).`);
        }
        comparaison = n;
        break;
      }
      default:
        throw new HorlogeSyntaxeError(`Directive inconnue : « ${cle} ».`);
    }
  }

  const moduloFinal = modulo ?? MODULO_DEFAUT;
  if (moduloFinal < MODULO_MIN || moduloFinal > MODULO_MAX) {
    throw new HorlogeSyntaxeError(
      `"modulo:" doit être compris entre ${MODULO_MIN} et ${MODULO_MAX} (reçu ${moduloFinal}).`
    );
  }

  return comparaison === null ? { modulo: moduloFinal } : { modulo: moduloFinal, comparaison };
}

/** Réduit `valeur` modulo `modulo`, toujours dans [0, modulo[ — contrairement
 * à l'opérateur `%` de JavaScript, qui renvoie un résultat négatif pour une
 * `valeur` négative (ex. -1 % 12 === -1, alors que la congruence attendue en
 * classe est -1 ≡ 11 (mod 12)). */
export function reduireModulo(valeur: number, modulo: number): number {
  const reste = valeur % modulo;
  return reste < 0 ? reste + modulo : reste;
}

export interface DivisionEuclidienne {
  /** Peut être négatif (ex. -4 = (-2)×2 + 0) — c'est le reste qui est
   * toujours positif, jamais le quotient. */
  quotient: number;
  /** Toujours dans [0, modulo[, voir reduireModulo. */
  reste: number;
}

/** Division euclidienne dans ℤ : valeur = quotient × modulo + reste, avec
 * 0 ⩽ reste < modulo (jamais reste négatif, y compris pour une `valeur`
 * négative — voir reduireModulo). Utilisée pour l'animation du comptage
 * (compteur de tours = quotient) et l'égalité affichée en KaTeX. */
export function diviserEuclidien(valeur: number, modulo: number): DivisionEuclidienne {
  const reste = reduireModulo(valeur, modulo);
  const quotient = (valeur - reste) / modulo;
  return { quotient, reste };
}
