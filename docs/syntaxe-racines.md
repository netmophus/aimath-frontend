# Syntaxe du bloc ```racines

Insère la figure des racines n-ièmes d'un nombre complexe (z^n = a) dans
n'importe quel champ Markdown d'une leçon. Rendu en SVG + React, 100 %
hors-ligne, aucune image ni appel réseau — même modèle que le cercle
trigonométrique (`docs/syntaxe-cercletrigo.md`).

**Objectif pédagogique.** Visualiser les n racines n-ièmes de a comme les
sommets d'un polygone régulier à n côtés, inscrit dans un cercle de rayon
|a|^(1/n), la première racine étant à l'angle arg(a)/n.

## Exemple

````
```racines
n: 5
module: 1
argument: 0
```
````

Dans l'éditeur admin, le bouton **« + Insérer des racines n-ièmes »** (à
côté des boutons d'insertion existants, sur les sections Cours,
Démonstrations, Sujet type examen et les énoncés/corrigés d'exercices) insère
cet exemple à la position du curseur.

## Directives

| Directive | Répétable | Exemple |
|---|---|---|
| `n: <entier>` | non, optionnelle (défaut `3`) | `n: 6` |
| `module: <nombre>` | non, optionnelle (défaut `1`) | `module: 8` |
| `argument: <degrés>` | non, optionnelle (défaut `0`) | `argument: 30` |

- `n:` doit être un entier compris entre 2 et 12 (au-delà, les sommets et
  leurs libellés se chevauchent visuellement).
- `module:` doit être un nombre strictement positif — c'est le module |a| du
  nombre complexe a dont on cherche les racines n-ièmes (pas le rayon de la
  figure : le rayon réel du cercle des racines, |a|^(1/n), est calculé et
  affiché sous la figure).
- `argument:` est l'argument arg(a) de a, en degrés (nombre quelconque).
- Une ligne vide ou commençant par `#` est ignorée (commentaire).
- Toute autre directive, une valeur non numérique, un `module:` négatif ou
  nul, ou un `n:` hors de [2, 12] est une erreur de syntaxe — un encadré
  ambre s'affiche à la place du bloc, avec un message explicite ; le reste
  de la leçon continue de s'afficher normalement.

## Contenu de la figure

- Repère orthonormé (axes Re/Im, flèches, libellés).
- Cercle fin (trait léger fh-bleu) de rayon fixe à l'écran — la mise à
  l'échelle visuelle est volontairement indépendante du vrai rayon
  mathématique |a|^(1/n) : un module très grand ou très petit ne doit jamais
  faire disparaître ou déborder la figure.
- Polygone régulier à n côtés (contour fh-orange, léger remplissage),
  sommets marqués.
- Libellé d'indice `k=0`, `k=1`, … près de chaque sommet.
- Sous la figure : une légende courte, puis en KaTeX le module/argument de
  a, le rayon réel `r = |a|^{1/n}`, et la formule générale
  `θ_k = (arg(a) + k×360°) / n`.

## SVG, SSR et hors-ligne

Même raisonnement que le cercle trigonométrique : **SVG statique + React**,
`katex.renderToString` pur (sans DOM) — **aucune API navigateur** requise au
premier rendu, SSR-safe, pas de `next/dynamic({ ssr: false })`.

Aucune dépendance ajoutée : `katex` est déjà utilisé par le Markdown existant.

Hors-ligne : le bloc ```racines vit dans le texte de la leçon, déjà stocké
intégralement par `lib/offlineStore.ts` lors du téléchargement — une leçon
téléchargée affiche donc sa figure hors-ligne sans rien de plus.
