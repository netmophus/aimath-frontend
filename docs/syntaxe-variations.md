# Syntaxe du bloc ```variations

Insère un tableau de variations dans n'importe quel champ Markdown d'une
leçon (cours, démonstrations, énoncés/corrigés d'exercices). Rendu en SVG,
100 % hors-ligne, aucune image ni appel réseau — même modèle que les courbes
(```courbe, voir `docs/syntaxe-courbe.md`).

**Principe : les données sont EXPLICITES.** L'app ne calcule ni dérivée ni
limite — elle DESSINE exactement ce que le bloc décrit. C'est à l'auteur (ou,
plus tard, à l'IA) de fournir des signes et des valeurs mathématiquement
justes ; l'app ne les vérifie pas.

## Exemple simple (croissante → décroissante → croissante)

````
```variations
fonction: f
x: -inf, 1, 3, +inf
signe: +, -, +
f: -inf, 3, -1, +inf
```
````

Dans l'éditeur admin, le bouton **« + Insérer un tableau de variations »**
(à côté de « + Insérer une courbe » et « + Insérer un terme », sur les
sections Cours, Démonstrations et les énoncés/corrigés d'exercices) insère
cet exemple à la position du curseur.

## Pourquoi cette syntaxe (une directive par ligne, pas YAML)

Même choix que pour les courbes, pour les mêmes raisons : robustesse du
parsing (pas d'indentation à interpréter), zéro dépendance ajoutée
(`lib/variations.ts` est un module TypeScript pur, isomorphe), et facilité de
génération future par une IA (structure plate, répétitive, sans piège
d'indentation).

## Directives

| Directive | Répétable | Exemple |
|---|---|---|
| `fonction: <nom>` | non (défaut `f`) | `fonction: g` |
| `x: <v1>, <v2>, …, <vn>` | non, obligatoire | `x: -inf, 1, 3, +inf` |
| `signe: <s1>, …, <sn-1>` | non, obligatoire | `signe: +, -, +` |
| `f: <v1>, …, <vn>` | non, obligatoire | `f: -inf, 3, -1, +inf` |
| `interdit: <x>` | oui, optionnelle | `interdit: 0` |

- `x:` liste les valeurs remarquables **dans l'ordre croissant**, `n ≥ 2`.
- `signe:` liste **un signe par intervalle** entre deux valeurs de x
  consécutives — donc exactement `n - 1` signes. Chaque signe ∈ `+` / `-` / `0`
  (`0` = f' nulle sur tout l'intervalle, segment plat, rendu en gris).
- `f:` liste **une valeur de f par valeur de x** — donc exactement `n`
  valeurs, dans le même ordre que `x:`.
- `interdit: <x>` marque une valeur de x (recopiée à l'identique depuis
  `x:`) comme exclue du domaine — affiche `‖` sur la ligne f'(x) à cette
  colonne. Voir « Valeur interdite » plus bas pour l'exemple complet (1/x).
- Une ligne vide ou commençant par `#` est ignorée (commentaire). ⚠️ Comme
  pour les courbes, évite `##`/`###` en début de ligne (voir
  `docs/syntaxe-courbe.md` pour l'explication — même limitation préexistante
  de `lib/decouperSections.ts`, pas spécifique aux tableaux).

## Comment le placement (haut/bas) est déduit — PAS authored

Contrairement à une première idée (marquer chaque extremum "haut"/"bas" à la
main), le placement de chaque valeur de f est **entièrement déduit des
signes déjà fournis** — aucune redondance possible, donc aucune contradiction
possible entre un signe et un placement :

- **Valeur intérieure**, signes `+` avant et `-` après → **maximum** (haut).
- **Valeur intérieure**, signes `-` avant et `+` après → **minimum** (bas).
- **Valeur intérieure**, signes identiques des deux côtés → simple point de
  passage (milieu), ni maximum ni minimum — utile pour noter une valeur de
  référence sur une branche qui ne change pas de sens.
- **Borne gauche du tableau** (premher x) : signe sortant `+` → bas (le
  minimum d'où l'on part avant de monter) ; signe sortant `-` → haut.
- **Borne droite du tableau** (dernier x) : signe entrant `+` → haut (le
  maximum où l'on arrive après avoir monté) ; signe entrant `-` → bas.

Un « 0 » apparaît automatiquement sur la ligne f'(x), pile entre deux
intervalles de signes différents (extremum) — jamais authored non plus : il
est déduit du changement de signe. Un pointillé vertical discret relie ce
« 0 » à la valeur de f correspondante.

**Ce choix (sens déduit, pas explicite)** a été retenu car il rend
structurellement impossible d'annoncer un signe et de dessiner l'extremum
opposé — la seule source de vérité est la ligne `signe:`.

## Valeurs spéciales et rendu (texte ou KaTeX)

- `-inf` / `+inf` (ou `-infini` / `+infini`) sont reconnus et normalisés en
  `-\infty` / `+\infty`, **toujours rendus via KaTeX** (glyphe ∞ correct).
- Toute valeur contenant un antislash, un `^` ou un `_` (ex. `\dfrac{1}{e}`,
  `e^2`) est considérée comme du LaTeX et rendue via **KaTeX** (même moteur
  que le reste du Markdown — `katex.renderToString`, intégré au SVG via un
  `<foreignObject>`).
- Toute autre valeur (`3`, `-1`, `e`…) est rendue en **texte brut** SVG.
- Les valeurs ne sont **jamais évaluées** (`1/e` reste le texte affiché « 1/e »,
  pas 0.367 — pour une fraction correctement affichée, écris `\dfrac{1}{e}`).

## Valeur interdite (ex. tableau de 1/x)

Notation `gauche|droite` sur la ligne `f:`, réservée aux valeurs de x listées
dans `interdit:` — une limite à gauche et une limite à droite, disjointes :

````
```variations
fonction: f
x: -inf, 0, +inf
signe: -, -
interdit: 0
f: 0, -inf|+inf, 0
```
````

Rendu : double trait vertical `‖` sur la ligne f'(x) à x=0 ; la ligne f
affiche -∞ en bas ET +∞ en haut à cette colonne (deux valeurs superposées,
pas reliées par une flèche entre elles) — chaque branche continue de son côté
avec sa propre flèche montante/descendante.

## Exemple avec asymptote au bord du domaine (ln(x)/x)

Ici `x = 0` n'est PAS une valeur « interdite » au sens ci-dessus : c'est
juste la borne du domaine (comme `-inf`/`+inf`), pas une valeur exclue à
l'intérieur du tableau — donc pas de `interdit:` ici, un simple bord :

````
```variations
fonction: f
x: 0, e, +inf
signe: +, -
f: -inf, \dfrac{1}{e}, 0
```
````

## Ce qui est fait vs reporté

**Fait :** fonctions à signes multiples, valeurs LaTeX (KaTeX) ou texte,
infinités, valeur interdite avec limites gauche/droite disjointes, placement
haut/bas/milieu entièrement déduit, segment plat (signe `0`), cadre bleu
arrondi, colonne de gauche teintée, flèches diagonales vertes/rouges,
pointillés reliant un 0 à son extremum, défilement horizontal responsive,
bouton d'insertion dans l'éditeur.

**Reporté :** rien d'identifié à ce stade pour cette étape — contrairement
aux courbes (tangentes), la syntaxe couvre déjà l'ensemble demandé.

## Rendu SVG, SSR et hors-ligne

Contrairement aux courbes (`function-plot`, qui doit attacher une sélection
D3 à un vrai noeud DOM et ne peut donc **jamais** s'exécuter côté serveur —
d'où le `next/dynamic({ ssr: false })` dans `CourbeFonctionBloc.tsx`), le
tableau de variations est du **SVG statique** + `katex.renderToString` (une
fonction pure qui produit une chaîne HTML, sans toucher au DOM — le même
mécanisme que `rehype-katex` utilise déjà pour tout le Markdown). Il n'y a
donc **aucun risque SSR** ici : `components/TableauVariationsBloc.tsx`
importe `TableauVariations` directement, sans `next/dynamic`. Avantage
concret : le tableau apparaît immédiatement dans le HTML servi, sans
clignotement "Chargement…".

Aucune dépendance ajoutée : `katex` est déjà utilisé par le Markdown
existant, tout le reste (parsing, SVG) est du code maison, comme pour les
courbes.

Hors-ligne : le bloc ```variations vit dans le texte de la leçon
(`cours_redige`, `demonstrations`…), déjà stocké intégralement par
`lib/offlineStore.ts` lors du téléchargement — une leçon téléchargée affiche
donc ses tableaux hors-ligne sans rien de plus, exactement comme les courbes.
