# Syntaxe du bloc ```courbe

Insère une courbe de fonction interactive dans n'importe quel champ Markdown
d'une leçon (histoire, cours, démonstrations, à retenir, énoncés/corrigés
d'exercices). Rendu calculé côté client, 100 % hors-ligne, aucune image ni
appel réseau.

## Exemple complet

````
```courbe
fonction: ln(x)
couleur: orange
nom: y = ln(x)
domaine: 0.1, 5
point: 1, 0
point: e, 1, (e ; 1)
asymptote-verticale: 0
```
````

Dans l'éditeur admin, le bouton **« + Insérer une courbe »** (à côté de
« + Insérer un terme », sur les sections Cours, Démonstrations et les
énoncés/corrigés d'exercices) insère cet exemple à la position du curseur —
il ne reste qu'à l'adapter.

## Pourquoi cette syntaxe (une directive par ligne)

Trois formats étaient envisageables : YAML imbriqué, JSON, ou une syntaxe
compacte « une directive par ligne ». Choix retenu : **la syntaxe compacte**,
pour trois raisons :

1. **Robustesse du parsing.** Un parseur YAML correct doit gérer
   l'indentation, les listes imbriquées sous une clé, les guillemets
   optionnels… Une syntaxe plate `clé: valeur` s'analyse ligne par ligne,
   sans arbre de récursion — beaucoup moins de cas limites, donc moins de
   bugs de parsing, et des messages d'erreur précis (numéro de ligne
   implicite : c'est toujours LA ligne fautive).
2. **Aucune dépendance ajoutée.** Pas besoin d'une lib YAML (`js-yaml` etc.) :
   le parseur (`lib/courbe.ts`) est ~150 lignes de TypeScript pur, isomorphe
   (aucun accès à `window`/`document`), donc sûr à utiliser pendant un rendu
   serveur.
3. **Facile à générer par une IA.** Une structure plate et répétitive
   (`fonction:`, `point:`, `asymptote-verticale:`…) est plus fiable à
   produire par un LLM qu'une indentation YAML exacte — pertinent pour
   l'étape suivante (génération IA des tracés).

## Directives supportées

| Directive | Répétable | Rattachement | Exemple |
|---|---|---|---|
| `fonction: <expression>` | oui | démarre un nouveau groupe | `fonction: x^2 - 3` |
| `couleur: <nom ou couleur CSS>` | non | s'applique à la dernière `fonction:` | `couleur: bleu` |
| `nom: <texte>` | non | s'applique à la dernière `fonction:` | `nom: parabole` |
| `domaine: <min>, <max>` | non | global | `domaine: -5, 5` |
| `domaine-y: <min>, <max>` | non | global, optionnel (auto sinon) | `domaine-y: -2, 8` |
| `point: <x>, <y>[, <étiquette>]` | oui | global | `point: e, 1, (e ; 1)` |
| `asymptote-verticale: <x>` | oui | global | `asymptote-verticale: 0` |
| `asymptote-horizontale: <y>` | oui | global | `asymptote-horizontale: 1` |
| `tangente: <x>` | oui | global | *(acceptée mais pas encore rendue, voir TODO)* |

- Une ligne vide ou commençant par `#` est ignorée (commentaire). ⚠️ Évite
  cependant `##`/`###` en début de ligne de commentaire : la page de lecture
  élève découpe le Cours/les Démonstrations sur ces motifs (`lib/decouperSections.ts`,
  limitation préexistante commune à tout bloc de code fenced, pas spécifique
  aux courbes) — une telle ligne À L'INTÉRIEUR d'un bloc ```courbe couperait
  le bloc en deux au rendu.
- Une directive répétée sans rattachement (`couleur:`, `nom:`) doit suivre
  immédiatement sa `fonction:` — sinon erreur claire.
- `domaine:` par défaut : `[-10, 10]` si omis.
- Couleurs nommées reconnues (charte fh-*) : `orange`, `bleu`, `vert`,
  `rouge`, `violet`, `gris`. Toute autre valeur est transmise telle quelle
  (hex `#rrggbb`, nom CSS standard…) — dégradation silencieuse si invalide,
  jamais une erreur bloquante pour une simple couleur.
- Sans `couleur:`, les fonctions successives tournent automatiquement dans
  cette même palette.

## Expressions mathématiques

Variable : `x` (fonctions à une seule variable, écrites en fonction de `x`).

Constantes : `e`, `pi` (minuscules ou `E`, `PI` — les deux fonctionnent).

Opérateurs : `+ - * / ^` (puissance, associative à droite), parenthèses,
signe unaire (`-x^2` = `-(x^2)`, convention mathématique standard).

Fonctions : `sqrt`, `ln` (népérien), `exp`, `log10`, `log2`, `abs`, `sin`,
`cos`, `tan`, `asin`, `acos`, `atan`.

Ces mêmes expressions sont utilisables partout : dans `fonction:` (variable
`x` autorisée), et dans `domaine:`, `point:`, `asymptote-*:` (constantes
uniquement, pas de `x` — un point ne peut pas dépendre de lui-même).

### ⚠️ Piège connu : puissance à exposant composé

`e^(2*x)`, `2^(x-1)`… — une puissance dont l'exposant est calculé (pas un
simple nombre ou une simple variable) **peut afficher une courbe vide** avec
la base `e`/`E`, à cause d'une limitation de l'arithmétique d'intervalles de
la librairie de tracé. **Corrigé automatiquement pour la base `e`** (le bloc
`fonction:` est réécrit en interne : `e^(2*x)` → `exp(2*x)`, mathématiquement
équivalent) — mais reste un piège pour toute AUTRE base avec exposant composé
(rare dans ce programme). Dans le doute, préférez toujours `exp(...)` à
`e^(...)`/`E^(...)` pour un exposant qui n'est pas un simple nombre ou `x` seul.

## Ce qui est fait vs reporté (étape 1)

**Fait :**
- Fonctions multiples (couleur + nom optionnels).
- Domaine X (+ domaine Y optionnel).
- Points remarquables, étiquetés.
- Asymptotes verticales/horizontales (annotation en pointillé + étiquette).
- Gestion propre des valeurs interdites (ex. `1/x` en `x=0`) : la courbe ne
  relie pas les branches (arithmétique d'intervalles de function-plot).
- Interactivité : survol (coordonnées), zoom (Ctrl/Cmd+molette, pincement
  tactile, boutons +/−/Réinitialiser — jamais la molette seule, pour ne pas
  bloquer le défilement de la page).
- Hors-ligne : calcul 100 % client, aucune dépendance réseau.
- Bouton d'insertion du squelette dans l'éditeur admin.

**Reporté (TODO explicite) :**
- **Tangentes** (`tangente: <x>`) : la directive est acceptée et conservée
  par le parseur (pour ne rien perdre si le bloc est réenregistré tel quel),
  mais **pas encore rendue**. Nécessite de calculer une dérivée numérique
  fiable (ou d'exiger une expression de dérivée explicite) — jugé trop
  risqué pour cette première itération sans plus de recul.
- **Tableaux de variations** et **génération IA des tracés** : hors périmètre
  de cette étape (voir la demande initiale).

## Bibliothèque de tracé retenue : function-plot

**Pourquoi function-plot** (plutôt que mathjs + une lib de tracé générique,
ou plotly/recharts) :
- Spécialisée dans le tracé de fonctions mathématiques à partir de leur
  expression (pas juste des séries de points) : c'est exactement le besoin.
- Échantillonnage par **arithmétique d'intervalles** par défaut : détecte
  nativement les valeurs interdites/discontinuités (ex. `1/x`, `ln(x)` pour
  x ≤ 0) et NE RELIE PAS les branches — exactement l'exigence « rendu exact »,
  sans code maison pour ça.
- Zoom (molette/glisser/tactile) et survol (tooltip de coordonnées)
  **intégrés** — pas de code d'interactivité à écrire/maintenir.
- 100 % client, bundlé par npm (aucun CDN au runtime) → hors-ligne par nature.
- Basée sur des sous-modules D3 ciblés (`d3-scale`, `d3-shape`, `d3-zoom`…),
  pas tout D3 : poids ajouté raisonnable (voir ci-dessous).
- Embarque son propre évaluateur d'expressions (aucune dépendance
  supplémentaire type mathjs nécessaire pour le tracé lui-même — voir
  `lib/courbe.ts` pour l'évaluateur maison, séparé, utilisé uniquement pour
  les nombres scalaires du bloc).

**Poids ajouté :** `function-plot` + ses dépendances d3 ciblées (`d3-axis`,
`d3-color`, `d3-format`, `d3-interpolate`, `d3-scale`, `d3-selection`,
`d3-shape`, `d3-zoom` + leurs propres sous-dépendances) : environ 700 Ko
non compressés pour le paquet lui-même, chargé **uniquement** sur les pages
qui affichent effectivement un bloc `courbe` (import dynamique côté client,
`ssr: false` — voir `components/CourbeFonctionBloc.tsx`), donc sans impact
sur le poids des leçons qui n'en contiennent pas.
