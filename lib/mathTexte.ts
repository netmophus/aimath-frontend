/**
 * Réparation CIBLÉE des expressions LaTeX sans délimiteurs dans les textes produits par l'IA (énoncé reconnu,
 * données, formules, correction, Professeur particulier). Le prompt demande `$...$` / `$$...$$`, mais le modèle
 * oublie parfois les délimiteurs (« u_{n+1} = \frac{1}{2}u_n + 3 », « \text{Suite géométrique} ») : KaTeX ne les
 * voit alors pas et la commande s'affiche telle quelle.
 *
 * Principes :
 * - on ne touche JAMAIS aux zones déjà balisées ($...$, $$...$$, \(...\), \[...\]) ni au code (``` et `...`) ;
 * - du texte ordinaire n'est jamais enveloppé : une expression n'est délimitée que si elle contient un marqueur
 *   LaTeX sans ambiguïté (commande `\frac`, `\text`…, indice ou exposant `u_n`, `q^n`) ;
 * - seule la suite d'éléments mathématiques autour du marqueur est délimitée (« Si $u_{n+1} = 2u_n$, alors »),
 *   jamais la phrase entière ;
 * - AUCUN remplacement d'antislash : le contenu LaTeX est repris tel quel (\neq, \nu, \frac, \sqrt, \infty…).
 */

const ZONE_PROTEGEE = /```[\s\S]*?```|`[^`\n]*`|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]/g;

type Genre = "S" | "O" | "A" | "P"; // fort (marqueur LaTeX), opérateur, atome (nombre, lettre seule), prose

interface Jeton {
  texte: string;
  separateur: string; // espaces qui PRÉCÈDENT le jeton dans le texte d'origine
  genre: Genre;
  queue: string; // ponctuation finale (« . » « , »…) laissée hors de la formule
  noyau: string; // texte sans la ponctuation finale
}

const MARQUEUR_COMMANDE = /\\[A-Za-z]{2,}|\\[{}|,;!]/;
const MARQUEUR_INDICE = /(?:^|[^A-Za-z])(?:[A-Za-z]|(?:[A-Z][a-z]?[0-9]*){2,6})_[A-Za-z0-9{\\(]|[0-9)\]}]_[A-Za-z0-9{\\(]|\}_[A-Za-z0-9{\\(]/;
/** Formule chimique sans ambiguïté : au moins deux éléments (H_2O, CO_2, Fe_2O_3) ou un ion (Fe^{3+}) → police droite. */
const CHIMIE = /^(?:(?:[0-9]*(?:[A-Z][a-z]?(?:_\{?[0-9]+\}?|[0-9]+)?){2,6})|(?:[0-9]*[A-Z][a-z]?(?:_\{?[0-9]+\}?)?\^\{?[0-9]*[+\-−]\}?))$/;
const MARQUEUR_EXPOSANT = /[A-Za-z0-9)\]}]\^[A-Za-z0-9{\\(−-]/;
const OPERATEUR = /^[=+\-−*/<>≤≥≠±×÷·∈∉⊂∪∩→⇒⇔|]+$/;
const ATOME = /^(?:[0-9]+(?:[.,]|\{,\})?[0-9]*[A-Za-z]?[²³]?|[A-Za-zΑ-Ωα-ω]['′]*[²³]?|[A-Za-z]\([^()]*\))$/;
const PONCTUATION_FINALE = /[.,;:!?]+$/;

function estForte(noyau: string): boolean {
  return MARQUEUR_COMMANDE.test(noyau) || MARQUEUR_INDICE.test(noyau) || MARQUEUR_EXPOSANT.test(noyau);
}

/** Découpe sur les espaces, sans couper à l'intérieur de {...}, (...) ou [...]. */
function decouper(texte: string): Jeton[] {
  const jetons: Jeton[] = [];
  let profondeur = 0;
  let environnement = 0; // \begin{pmatrix} 3 \\ 1 \end{pmatrix} reste un seul jeton (les espaces et « \\ » ne le coupent pas)
  let debut = -1;
  let separateur = "";
  let espaces = "";

  const fermer = (fin: number) => {
    const brut = texte.slice(debut, fin);
    const queue = brut.length > 1 ? (brut.match(PONCTUATION_FINALE)?.[0] ?? "") : "";
    const noyau = queue ? brut.slice(0, brut.length - queue.length) : brut;
    const genre: Genre = estForte(noyau) ? "S" : OPERATEUR.test(noyau) ? "O" : ATOME.test(noyau) ? "A" : "P";
    jetons.push({ texte: brut, separateur, genre, queue, noyau });
    debut = -1;
    separateur = "";
  };

  for (let i = 0; i < texte.length; i += 1) {
    const c = texte[i];
    if (c === "\n") {
      if (debut >= 0) fermer(i);
      profondeur = 0;
      environnement = 0;
      // un retour à la ligne interrompt toute suite : jeton « mur » (prose vide)
      jetons.push({ texte: "\n", separateur: espaces, genre: "P", queue: "", noyau: "\n" });
      espaces = "";
      continue;
    }
    if ((c === " " || c === "\t") && profondeur <= 0 && environnement <= 0) {
      if (debut >= 0) fermer(i);
      espaces += c;
      continue;
    }
    if (debut < 0) {
      debut = i;
      separateur = espaces;
      espaces = "";
    }
    if (c === "\\") {
      if (texte.startsWith("\\begin{", i)) environnement += 1;
      else if (texte.startsWith("\\end{", i) && environnement > 0) environnement -= 1;
    }
    if (c === "{" || c === "(" || c === "[") profondeur += 1;
    else if ((c === "}" || c === ")" || c === "]") && profondeur > 0) profondeur -= 1;
  }
  if (debut >= 0) fermer(texte.length);
  return jetons;
}

/** Commandes qui jouent le rôle d'un opérateur ou d'une relation (« x \neq 0 », « a \times b »). */
const COMMANDE_OPERATEUR = /^\\(?:neq|ne|approx|equiv|sim|simeq|leq|le|geq|ge|ll|gg|in|notin|subset|subseteq|supset|cup|cap|to|rightarrow|leftarrow|Rightarrow|Leftrightarrow|implies|iff|times|cdot|pm|mp|div|circ|perp|parallel|mid)$/;

const estOperateur = (j: Jeton) => j.genre === "O" || COMMANDE_OPERATEUR.test(j.noyau);

/** Délimite les suites mathématiques d'un fragment SANS zone balisée. */
function delimiterFragment(fragment: string, bloc: boolean): string {
  if (!/[\\_^]/.test(fragment)) return fragment; // aucun marqueur possible : texte ordinaire, intact
  const jetons = decouper(fragment);
  if (!jetons.some((j) => j.genre === "S")) return fragment;

  // 1. Suites de jetons « mathématiques » consécutifs (la prose, un retour à la ligne ou une ponctuation finale
  //    interrompent la suite).
  const garde: boolean[] = jetons.map((j) => j.genre !== "P");
  // 2. Un atome (nombre, lettre seule) n'est retenu que s'il touche un opérateur ou un élément fort : « a » ou
  //    « y » isolés dans une phrase restent du texte.
  let change = true;
  while (change) {
    change = false;
    jetons.forEach((j, i) => {
      if (!garde[i]) return;
      const gauche = i > 0 && garde[i - 1] && !jetons[i - 1].queue ? jetons[i - 1] : null;
      const droite = i + 1 < jetons.length && garde[i + 1] && !j.queue ? jetons[i + 1] : null;
      let retire = false;
      if (j.genre === "A") {
        // une lettre seule (« a », « y ») ne se rattache qu'à un opérateur ; un nombre peut aussi précéder un
        // élément fort (« 2\sqrt{3} »)
        const nombre = /^[0-9]/.test(j.noyau);
        const relie = (v: Jeton | null) => v !== null && (estOperateur(v) || (nombre && v.genre === "S"));
        retire = !(relie(gauche) || relie(droite));
      }
      if (j.genre === "O") retire = !gauche || !droite; // un opérateur ne termine ni ne commence une formule
      if (retire) {
        garde[i] = false;
        change = true;
      }
    });
  }

  const toutEnMath = jetons.every((j, i) => garde[i]);
  let sortie = "";
  let i = 0;
  while (i < jetons.length) {
    // début d'une suite retenue
    if (!garde[i]) {
      sortie += jetons[i].separateur + jetons[i].texte;
      i += 1;
      continue;
    }
    let fin = i;
    while (fin + 1 < jetons.length && garde[fin + 1] && !jetons[fin].queue) fin += 1;
    const morceau = jetons.slice(i, fin + 1);
    if (!morceau.some((j) => j.genre === "S")) {
      // suite sans marqueur LaTeX (« a = b + c ») : texte ordinaire, laissé tel quel
      sortie += morceau.map((j) => j.separateur + j.texte).join("");
    } else {
      const droit = (t: string) => (CHIMIE.test(t) ? `\\mathrm{${t}}` : t);
      const interieur = morceau
        .map((j, n) => (n === 0 ? "" : j.separateur) + droit(n === morceau.length - 1 ? j.noyau : j.texte))
        .join("");
      const delimiteur = bloc && toutEnMath && !fragment.includes("\n") ? "$$" : "$";
      sortie += jetons[i].separateur + delimiteur + interieur + delimiteur + morceau[morceau.length - 1].queue;
    }
    i = fin + 1;
  }
  return sortie;
}

/**
 * Texte prêt pour RenduMarkdown : les expressions LaTeX sans délimiteurs sont délimitées, tout le reste est
 * inchangé. `bloc` : le champ est destiné à une formule seule sur sa ligne (formules, calculs, résultats).
 */
export function preparerMath(texte: string, options: { bloc?: boolean } = {}): string {
  if (!texte || !/[\\_^]/.test(texte)) return texte;
  const bloc = options.bloc === true;
  let resultat = "";
  let curseur = 0;
  ZONE_PROTEGEE.lastIndex = 0;
  const morceaux: { texte: string; protege: boolean }[] = [];
  for (const m of texte.matchAll(ZONE_PROTEGEE)) {
    if (m.index > curseur) morceaux.push({ texte: texte.slice(curseur, m.index), protege: false });
    morceaux.push({ texte: m[0], protege: true });
    curseur = m.index + m[0].length;
  }
  if (curseur < texte.length) morceaux.push({ texte: texte.slice(curseur), protege: false });
  const seulBloc = morceaux.length === 1 && !morceaux[0].protege;
  for (const morceau of morceaux) {
    resultat += morceau.protege ? morceau.texte : delimiterFragment(morceau.texte, bloc && seulBloc);
  }
  return resultat;
}
