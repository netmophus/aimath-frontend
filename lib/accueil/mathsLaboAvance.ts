/**
 * Calculs des onglets « Suites numériques », « Intégrale » et « Limites » du laboratoire de la page
 * d'accueil. Fonctions pures, sans dépendance : tout se passe dans le navigateur.
 */

/** Graduations « rondes » (1, 2, 5 × 10^k) couvrant [lo ; hi], au plus ~`cible` repères. */
export function graduations(lo: number, hi: number, cible = 5): number[] {
  const brut = (hi - lo) / cible;
  const puissance = Math.pow(10, Math.floor(Math.log10(brut)));
  const pas = [1, 2, 5, 10].map((m) => m * puissance).find((p) => p >= brut) ?? 10 * puissance;
  const sortie: number[] = [];
  for (let k = Math.ceil(lo / pas - 1e-9); k * pas <= hi + 1e-9; k++) sortie.push(Math.round(k * pas * 1e9) / 1e9);
  return sortie;
}

/** Échantillons (x ; f(x)) de la fonction sur [xmin ; xmax], coupés en tronçons aux valeurs non finies ou hors de [ymin ; ymax]. */
export function troncons(f: (x: number) => number, xmin: number, xmax: number, ymin: number, ymax: number, n = 400): [number, number][][] {
  const sortie: [number, number][][] = [];
  let courant: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = xmin + ((xmax - xmin) * i) / n;
    const y = f(x);
    if (Number.isFinite(y) && y >= ymin && y <= ymax) courant.push([x, y]);
    else if (courant.length) {
      sortie.push(courant);
      courant = [];
    }
  }
  if (courant.length) sortie.push(courant);
  return sortie;
}

/* ───────────────────────────── 1. Suites : converge ou diverge ? ───────────────────────────── */

export type IdSuite = "geo-converge" | "affine" | "cosinus" | "sinus" | "arith" | "geo-diverge";

export type NatureSuite = "converge" | "diverge" | "sans-limite";

/** Une étape de démonstration : titre court et texte (les formules sont entre `$ … $`, rendues par `Tx`). */
export interface EtapeDemo {
  titre: string;
  texte: string;
}

export interface ExempleSuite {
  id: IdSuite;
  libelle: string;
  /** Libellé du bouton de choix, en LaTeX. */
  libelleTex: string;
  /** Premier terme et relation, en LaTeX. */
  definitionTex: string;
  u0: number;
  /** Terme de rang k à partir du terme de rang k − 1. */
  suivant: (precedent: number, k: number) => number;
  /** Bornes de la droite graduée. */
  lo: number;
  hi: number;
  /** Limite L si elle existe, avec son écriture (« L = 6 », « L ≈ 0,739 »). */
  limite: number | null;
  limiteTexte: string;
  nature: NatureSuite;
  /** Phrase du verdict (texte avec formules entre `$ … $`). */
  verdict: string;
  demo: { etapes: EtapeDemo[]; conclusion: string };
}

export const NB_TERMES_MAX = 18;
export const NB_TERMES_AUTO = 12;
export const NB_TERMES_VERDICT = 3;
const VALEUR_MAX = 1e6;

export const EXEMPLES_SUITE: ExempleSuite[] = [
  {
    id: "geo-converge",
    libelle: "u indice n plus 1 égal 0,5 fois u indice n",
    libelleTex: String.raw`u_{n+1} = 0{,}5\,u_n`,
    definitionTex: String.raw`u_0 = 16, \qquad u_{n+1} = 0{,}5\,u_n`,
    u0: 16,
    suivant: (u) => 0.5 * u,
    lo: -1,
    hi: 17,
    limite: 0,
    limiteTexte: "L = 0",
    nature: "converge",
    verdict: String.raw`Chaque terme est la moitié du précédent : les termes se rapprochent de $0$. La suite converge vers $0$.`,
    demo: {
      etapes: [
        { titre: "Nature de la suite", texte: String.raw`Chaque terme est égal à $0{,}5$ fois le précédent : $(u_n)$ est une suite GÉOMÉTRIQUE de premier terme $u_0 = 16$ et de raison $q = 0{,}5$.` },
        { titre: "Terme général", texte: String.raw`$u_n = u_0\,q^n = 16 \times (0{,}5)^n$.` },
        { titre: "Limite prouvée", texte: String.raw`Comme $-1 < q = 0{,}5 < 1$, on a $(0{,}5)^n \to 0$, donc $u_n = 16 \times (0{,}5)^n \to 0$.` },
      ],
      conclusion: String.raw`La suite CONVERGE vers $0$.`,
    },
  },
  {
    id: "affine",
    libelle: "u indice n plus 1 égal 0,5 fois u indice n plus 3",
    libelleTex: String.raw`u_{n+1} = 0{,}5\,u_n + 3`,
    definitionTex: String.raw`u_0 = 0, \qquad u_{n+1} = 0{,}5\,u_n + 3`,
    u0: 0,
    suivant: (u) => 0.5 * u + 3,
    lo: -1,
    hi: 8,
    limite: 6,
    limiteTexte: "L = 6",
    nature: "converge",
    verdict: String.raw`Les termes se rapprochent de plus en plus de $6$. La suite converge vers $6$.`,
    demo: {
      etapes: [
        { titre: "Limite éventuelle", texte: String.raw`Si $u_n \to L$, en passant à la limite dans $u_{n+1} = 0{,}5\,u_n + 3$ on obtient $L = 0{,}5\,L + 3$, donc $0{,}5\,L = 3$, soit $L = 6$.` },
        { titre: "Suite auxiliaire", texte: String.raw`On pose $v_n = u_n - 6$. Alors $v_{n+1} = u_{n+1} - 6 = 0{,}5\,u_n + 3 - 6 = 0{,}5\,(u_n - 6) = 0{,}5\,v_n$.` },
        { titre: "Limite prouvée", texte: String.raw`Donc $(v_n)$ est géométrique de raison $0{,}5$, et comme $|0{,}5| < 1$, $v_n \to 0$. Puisque $u_n = v_n + 6$, on a $u_n \to 6$.` },
      ],
      conclusion: String.raw`La suite CONVERGE vers $6$.`,
    },
  },
  {
    id: "cosinus",
    libelle: "u indice n plus 1 égal cosinus de u indice n",
    libelleTex: String.raw`u_{n+1} = \cos(u_n)`,
    definitionTex: String.raw`u_0 = 1, \qquad u_{n+1} = \cos(u_n)`,
    u0: 1,
    suivant: (u) => Math.cos(u),
    lo: 0,
    hi: 1.1,
    limite: 0.7390851332151607,
    limiteTexte: "L ≈ 0,739",
    nature: "converge",
    verdict: String.raw`Les termes sautent de part et d'autre de la limite en se resserrant : la suite converge (en oscillant) vers environ $0{,}739$.`,
    demo: {
      etapes: [
        { titre: "Limite éventuelle", texte: String.raw`La fonction $f(x) = \cos x$ est continue ; si $u_n \to L$ alors $L = \cos(L)$. Cette équation a une unique solution $L \approx 0{,}739$ (pas de valeur exacte simple).` },
        { titre: "Critère du point fixe", texte: String.raw`$f'(x) = -\sin x$, donc $|f'(L)| = |\sin(0{,}739)| \approx 0{,}67$.` },
        { titre: "Point fixe attractif", texte: String.raw`Comme $0{,}67 < 1$, le point fixe est ATTRACTIF : la suite converge vers $L$. Et comme $f'(L) < 0$, les termes encadrent $L$ en oscillant (un au-dessus, un au-dessous).` },
      ],
      conclusion: String.raw`La suite CONVERGE vers $L \approx 0{,}739$, en oscillant.`,
    },
  },
  {
    id: "sinus",
    libelle: "u indice n égal sinus de n",
    libelleTex: String.raw`u_n = \sin(n)`,
    definitionTex: String.raw`u_n = \sin(n) \quad (\text{terme donné directement})`,
    u0: 0,
    suivant: (_, k) => Math.sin(k),
    lo: -1.2,
    hi: 1.2,
    limite: null,
    limiteTexte: "",
    nature: "sans-limite",
    verdict: String.raw`Les termes oscillent sans fin entre $-1$ et $1$ sans se fixer : la suite n'a pas de limite, elle ne converge pas.`,
    demo: {
      etapes: [
        { titre: "Suite bornée", texte: String.raw`Pour tout $n$, $-1 \leqslant \sin(n) \leqslant 1$.` },
        { titre: "Pas de stabilisation", texte: String.raw`Mais elle ne se stabilise pas : les entiers $1, 2, 3, \ldots$ (en radians) tournent indéfiniment autour du cercle, donc $\sin(1), \sin(2), \ldots$ balaient tout $[-1\,;\,1]$ sans se rapprocher d'aucune valeur fixe.` },
        { titre: "Raisonnement par l'absurde", texte: String.raw`Si elle convergeait vers $\ell$, à partir d'un certain rang tous les termes seraient proches de $\ell$ ; or ils continuent d'atteindre $+1$ et $-1$. Impossible.` },
      ],
      conclusion: String.raw`La suite NE CONVERGE PAS (bornée mais sans limite : une suite peut être bornée sans converger).`,
    },
  },
  {
    id: "arith",
    libelle: "u indice n plus 1 égal u indice n plus 3",
    libelleTex: String.raw`u_{n+1} = u_n + 3`,
    definitionTex: String.raw`u_0 = 2, \qquad u_{n+1} = u_n + 3`,
    u0: 2,
    suivant: (u) => u + 3,
    lo: 0,
    hi: 30,
    limite: null,
    limiteTexte: "",
    nature: "diverge",
    verdict: String.raw`On ajoute $3$ à chaque fois : les termes augmentent sans fin. La suite diverge vers $+\infty$.`,
    demo: {
      etapes: [
        { titre: "Nature de la suite", texte: String.raw`Chaque terme est égal au précédent plus $3$ : $(u_n)$ est une suite ARITHMÉTIQUE de premier terme $u_0 = 2$ et de raison $r = 3$.` },
        { titre: "Terme général", texte: String.raw`$u_n = u_0 + n\,r = 2 + 3n$.` },
        { titre: "Limite prouvée", texte: String.raw`Comme $r = 3 > 0$, $3n \to +\infty$, donc $u_n = 2 + 3n \to +\infty$.` },
      ],
      conclusion: String.raw`La suite DIVERGE vers $+\infty$.`,
    },
  },
  {
    id: "geo-diverge",
    libelle: "u indice n plus 1 égal 2 fois u indice n",
    libelleTex: String.raw`u_{n+1} = 2\,u_n`,
    definitionTex: String.raw`u_0 = 1, \qquad u_{n+1} = 2\,u_n`,
    u0: 1,
    suivant: (u) => 2 * u,
    lo: 0,
    hi: 40,
    limite: null,
    limiteTexte: "",
    nature: "diverge",
    verdict: String.raw`Chaque terme double : les termes grandissent sans fin. La suite diverge vers $+\infty$.`,
    demo: {
      etapes: [
        { titre: "Nature de la suite", texte: String.raw`Chaque terme est égal à $2$ fois le précédent : $(u_n)$ est une suite GÉOMÉTRIQUE de premier terme $u_0 = 1$ et de raison $q = 2$.` },
        { titre: "Terme général", texte: String.raw`$u_n = u_0\,q^n = 2^n$.` },
        { titre: "Limite prouvée", texte: String.raw`Comme $q = 2 > 1$, $q^n \to +\infty$, donc $u_n = 2^n \to +\infty$.` },
      ],
      conclusion: String.raw`La suite DIVERGE vers $+\infty$.`,
    },
  },
];

/** Termes u₀ … u_{nb-1} ; le calcul s'arrête si une valeur dépasse 10⁶ (garde-fou). */
export function termesSuite(ex: ExempleSuite, nb: number): number[] {
  const t = [ex.u0];
  while (t.length < nb && Math.abs(t[t.length - 1]) <= VALEUR_MAX) t.push(ex.suivant(t[t.length - 1], t.length));
  return t;
}

/** Peut-on poser un terme de plus ? (au plus NB_TERMES_MAX termes, valeurs bornées par 10⁶). */
export function peutContinuer(termes: number[]): boolean {
  return termes.length < NB_TERMES_MAX && Math.abs(termes[termes.length - 1]) <= VALEUR_MAX;
}

/* ───────────────────────────── 2. Intégrale ───────────────────────────── */

export type IdIntegrale = "carre" | "droite";

export interface FonctionIntegrale {
  id: IdIntegrale;
  libelle: string;
  /** Libellé du bouton de choix, en LaTeX. */
  libelleTex: string;
  /** f(t) en LaTeX, variable t (sous l'intégrale). */
  fTex: string;
  /** f(x) en LaTeX, variable x (hauteur de la courbe de f en x). */
  fxTex: string;
  /** F(x) en LaTeX. */
  FTex: string;
  /** Expression de F(x) avec la valeur de x remplacée : « \dfrac{(1{,}5)^3}{3} ». */
  FValeurTex: (x: string) => string;
  f: (x: number) => number;
  /** Primitive F(x) = ∫₀ˣ f(t) dt (borne inférieure a = 0). */
  F: (x: number) => number;
  xmax: number;
  initial: number;
}

export const FONCTIONS_INTEGRALE: FonctionIntegrale[] = [
  { id: "carre", libelle: "f de t égal t au carré", libelleTex: "f(t) = t^2", fTex: "t^2", fxTex: "x^2", FTex: String.raw`\dfrac{x^3}{3}`, FValeurTex: (x) => String.raw`\dfrac{(${x})^3}{3}`, f: (x) => x * x, F: (x) => (x * x * x) / 3, xmax: 3, initial: 1.5 },
  { id: "droite", libelle: "f de t égal t", libelleTex: "f(t) = t", fTex: "t", fxTex: "x", FTex: String.raw`\dfrac{x^2}{2}`, FValeurTex: (x) => String.raw`\dfrac{(${x})^2}{2}`, f: (x) => x, F: (x) => (x * x) / 2, xmax: 3, initial: 1.5 },
];

/** Aire sous f entre 0 et x (méthode de Simpson, 200 intervalles) : sert à vérifier que l'aire vaut F(x). */
export function aire(f: (x: number) => number, x: number, n = 200): number {
  if (x <= 0) return 0;
  const h = x / n;
  let s = f(0) + f(x);
  for (let i = 1; i < n; i++) s += f(i * h) * (i % 2 === 1 ? 4 : 2);
  return (s * h) / 3;
}

/* ───────────────────────────── 3. Limites ───────────────────────────── */

export type IdLimite = "homographique" | "exponentielle" | "sinuscardinal";

/** Table de valeurs de l'étape 2 : les x choisis, et l'écart |f(x) − L| en troisième colonne si `ecart`. */
export interface TableLimite {
  /** Titre (texte avec formules entre `$ … $`). */
  titre: string;
  xs: number[];
  ecart: boolean;
}

export interface EtapePourquoi {
  titre: string;
  /** Texte avec formules entre `$ … $`, rendues par `Tx`. */
  texte: string;
}

export interface FonctionLimite {
  id: IdLimite;
  /** Nom en toutes lettres (lecteurs d'écran). */
  libelle: string;
  /** Libellé du bouton de choix, en LaTeX. */
  libelleTex: string;
  fTex: string;
  /** Ce vers quoi x tend, en LaTeX (« x \to +\infty »). */
  cibleTex: string;
  /** Limite visée L quand x tend vers la cible. */
  L: number;
  /** Écart de référence : la barre de l'écart est pleine quand |f(x) − L| atteint cette valeur. */
  ecartRef: number;
  f: (x: number) => number;
  fenetre: { xmin: number; xmax: number; ymin: number; ymax: number };
  curseur: { min: number; max: number; pas: number; initial: number };
  asymptoteH: number | null;
  asymptoteV: number | null;
  /** Valeur interdite où f n'est pas définie, avec la limite en ce point. */
  trou: { x: number; limite: number } | null;
  tables: TableLimite[];
  pourquoi: { etapes: EtapePourquoi[]; conclusion: string; formules: string[] };
  /** Remarque affichée avec les asymptotes (texte avec formules), ou null. */
  noteAsymptotes: string | null;
}

export const FONCTIONS_LIMITE: FonctionLimite[] = [
  {
    id: "exponentielle",
    libelle: "exponentielle de moins x",
    libelleTex: String.raw`\mathrm{e}^{-x}`,
    fTex: String.raw`f(x) = \mathrm{e}^{-x}`,
    cibleTex: String.raw`x \to +\infty`,
    L: 0,
    ecartRef: 3,
    f: (x) => Math.exp(-x),
    fenetre: { xmin: -2, xmax: 8, ymin: -0.5, ymax: 5 },
    curseur: { min: -2, max: 8, pas: 0.1, initial: 1 },
    asymptoteH: 0,
    asymptoteV: null,
    trou: null,
    tables: [{ titre: String.raw`Quand $x$ grandit`, xs: [1, 3, 5, 8], ecart: true }],
    pourquoi: {
      etapes: [
        { titre: "Réécrire", texte: String.raw`$\mathrm{e}^{-x} = \dfrac{1}{\mathrm{e}^{x}}$. Quand $x$ devient très grand, $\mathrm{e}^{x}$ devient immense.` },
        { titre: "Diviser par un grand nombre", texte: String.raw`Diviser $1$ par un nombre de plus en plus grand donne un résultat proche de $0$. Donc $\mathrm{e}^{-x} \to 0$.` },
      ],
      conclusion: String.raw`Conclusion : la droite $y = 0$ est asymptote horizontale.`,
      formules: [String.raw`\lim_{x \to +\infty} \mathrm{e}^{-x} = 0`],
    },
    noteAsymptotes: null,
  },
  {
    id: "homographique",
    libelle: "deux x plus un sur x moins un",
    libelleTex: String.raw`\dfrac{2x+1}{x-1}`,
    fTex: String.raw`f(x) = \dfrac{2x+1}{x-1}`,
    cibleTex: String.raw`x \to +\infty`,
    L: 2,
    ecartRef: 3,
    f: (x) => (2 * x + 1) / (x - 1),
    fenetre: { xmin: -4, xmax: 20, ymin: -6, ymax: 10 },
    curseur: { min: -4, max: 20, pas: 0.1, initial: 6 },
    asymptoteH: 2,
    asymptoteV: 1,
    trou: null,
    tables: [
      { titre: String.raw`Quand $x$ grandit`, xs: [10, 100, 1000], ecart: true },
      { titre: String.raw`Près de $x = 1$`, xs: [1.5, 1.1, 1.01, 0.99, 0.9], ecart: false },
    ],
    pourquoi: {
      etapes: [
        { titre: "Asymptote horizontale", texte: String.raw`Pour $x$ très grand, les $+1$ et $-1$ sont négligeables devant $2x$ et $x$, donc $f(x) \approx \dfrac{2x}{x} = 2$. Donc $f(x) \to 2$ : la droite $y = 2$ est asymptote horizontale.` },
        { titre: "Asymptote verticale", texte: String.raw`En $x = 1$, le dénominateur $x - 1$ s'annule alors que le numérateur vaut $3 \neq 0$ ; on divise un nombre non nul par quelque chose de minuscule, donc $|f(x)|$ devient immense : la droite $x = 1$ est asymptote verticale.` },
      ],
      conclusion: String.raw`Conclusion : la courbe longe la droite $y = 2$ en l'infini et la droite $x = 1$ près de $1$.`,
      formules: [String.raw`\lim_{x \to +\infty} \dfrac{2x+1}{x-1} = 2`, String.raw`\lim_{x \to 1^{+}} \dfrac{2x+1}{x-1} = +\infty \qquad \lim_{x \to 1^{-}} \dfrac{2x+1}{x-1} = -\infty`],
    },
    noteAsymptotes: null,
  },
  {
    id: "sinuscardinal",
    libelle: "sinus de x sur x",
    libelleTex: String.raw`\dfrac{\sin x}{x}`,
    fTex: String.raw`f(x) = \dfrac{\sin x}{x}`,
    cibleTex: String.raw`x \to 0`,
    L: 1,
    ecartRef: 1,
    f: (x) => Math.sin(x) / x,
    fenetre: { xmin: -12, xmax: 12, ymin: -0.5, ymax: 1.25 },
    curseur: { min: -12, max: 12, pas: 0.1, initial: 6 },
    asymptoteH: 0,
    asymptoteV: null,
    trou: { x: 0, limite: 1 },
    tables: [{ titre: String.raw`Quand $x$ se rapproche de $0$`, xs: [2, 1, 0.5, 0.1], ecart: true }],
    pourquoi: {
      etapes: [
        { titre: "Forme indéterminée", texte: String.raw`En $x = 0$, $\dfrac{\sin 0}{0} = \dfrac{0}{0}$ est une forme indéterminée : il faut regarder autour de $0$.` },
        { titre: "Pour $x$ petit", texte: String.raw`Pour $x$ petit (en radians), $\sin x \approx x$, donc $\dfrac{\sin x}{x} \approx \dfrac{x}{x} = 1$.` },
      ],
      conclusion: String.raw`Conclusion : c'est une limite remarquable.`,
      formules: [String.raw`\lim_{x \to 0} \dfrac{\sin x}{x} = 1`],
    },
    noteAsymptotes: String.raw`La courbe n'est pas définie en $0$ (point creux), mais elle s'en approche en visant $1$. Elle longe aussi la droite $y = 0$ quand $x$ est grand.`,
  },
];
