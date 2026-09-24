# Syntaxe du bloc ```cercletrigo

Insère un cercle trigonométrique (plan complexe) dans n'importe quel champ
Markdown d'une leçon (cours, démonstrations, sujet type examen,
énoncés/corrigés d'exercices). Rendu en SVG + React, 100 % hors-ligne, aucune
image ni appel réseau — même modèle que les tableaux de variations
(`docs/syntaxe-variations.md`) et l'horloge modulaire
(`docs/syntaxe-horloge.md`).

**Objectif pédagogique.** Visualiser un point M sur le cercle unité, son
angle θ, ses projections (cos θ, sin θ) et son affixe sous forme
exponentielle `z = e^{iθ}` — figure statique, pas d'interaction (contrairement
à l'horloge/au convertisseur binaire).

## Exemple

````
```cercletrigo
angle: 60
montrer_projections: true
label: z
```
````

Dans l'éditeur admin, le bouton **« + Insérer un cercle trigonométrique »**
(à côté des boutons d'insertion existants, sur les sections Cours,
Démonstrations, Sujet type examen et les énoncés/corrigés d'exercices) insère
cet exemple à la position du curseur.

## Directives

| Directive | Répétable | Exemple |
|---|---|---|
| `angle: <degrés>` | non, optionnelle (défaut `60`) | `angle: -45` |
| `montrer_projections: <true\|false>` | non, optionnelle (défaut `true`) | `montrer_projections: false` |
| `label: <texte>` | non, optionnelle (défaut `z`) | `label: A` |

- `angle:` est un nombre quelconque de degrés (positif, négatif, décimal, ou
  au-delà de 360° — la position de M reste correcte par périodicité de
  cos/sin ; seul le tracé de l'arc de l'angle est borné à ±360° pour rester
  lisible).
- `montrer_projections:` accepte `true`/`false` (ou `vrai`/`faux`).
- `label:` est le nom affiché de l'affixe (texte court, ex. `z`, `A`, `M`).
- Une ligne vide ou commençant par `#` est ignorée (commentaire).
- Toute autre directive, une valeur non numérique pour `angle:`, ou une ligne
  sans `:`, est une erreur de syntaxe — un encadré ambre s'affiche à la place
  du bloc, avec un message explicite ; le reste de la leçon continue de
  s'afficher normalement.

## Contenu de la figure

- Repère orthonormé (axes Re/Im, flèches, libellés).
- Cercle unité (teinte fh-bleu très légère).
- Point M sur le cercle à l'angle donné (fh-orange), segment [OM].
- Arc marquant l'angle θ depuis l'axe des réels, avec libellé « θ » (KaTeX).
- Si `montrer_projections: true` : projections pointillées de M sur les deux
  axes, avec libellés « cos θ » et « sin θ » (KaTeX, symboliques — pas de
  valeur numérique substituée).
- Sous la figure : l'affixe (`{label} = e^{iθ}`) et la valeur de l'angle
  (`θ = 60°`), en KaTeX.

## SVG, SSR et hors-ligne

Comme le tableau de variations et l'horloge modulaire, ce composant est du
**SVG statique + React** (aucun état, figure entièrement déterminée par les
props) et `katex.renderToString` (fonction pure, sans DOM) — **aucune API
navigateur** n'est requise pour le premier rendu. SSR-safe, pas de
`next/dynamic({ ssr: false })` nécessaire.

Les libellés « θ », « cos θ », « sin θ » positionnés À L'INTÉRIEUR du SVG
utilisent `<foreignObject>` pour un vrai rendu KaTeX en place (police,
exposants…) — technique standard, supportée par tous les navigateurs
modernes ; la formule de l'affixe, elle, est un `<div>` classique sous le
SVG (même approche que la congruence de l'horloge modulaire).

Aucune dépendance ajoutée : `katex` est déjà utilisé par le Markdown existant.

Hors-ligne : le bloc ```cercletrigo vit dans le texte de la leçon, déjà
stocké intégralement par `lib/offlineStore.ts` lors du téléchargement — une
leçon téléchargée affiche donc sa figure hors-ligne sans rien de plus.
