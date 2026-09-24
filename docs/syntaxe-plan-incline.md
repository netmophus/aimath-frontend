# Syntaxe du bloc ```plan-incline

Insère une simulation d'un solide glissant sans frottement sur un plan
incliné dans n'importe quel champ Markdown d'une leçon (cours,
démonstrations, énoncés/corrigés d'exercices). Rendu en SVG + React, 100 %
hors-ligne, aucune image ni appel réseau, aucune dépendance externe — même
modèle que les simulations de mouvement rectiligne (`docs/syntaxe-mouvement.md`)
et circulaire (`docs/syntaxe-circulaire.md`).

**Objectif pédagogique.** Montrer qu'un solide glissant sans frottement sur
un plan incliné a une accélération a_G = g·sin(α) qui dépend de l'**angle**
mais **jamais de la masse** — changer la masse fait changer le poids P (et
la réaction normale N, et la résultante), mais jamais a_G.

## Exemple

````
```plan-incline
angle: 30
masse: 2
```
````

Dans l'éditeur admin, le bouton **« + Insérer un plan incliné »** (à côté des
boutons d'insertion existants, sur les sections Cours, Démonstrations et les
énoncés/corrigés d'exercices) insère cet exemple à la position du curseur.

## Directives

| Directive | Répétable | Exemple |
|---|---|---|
| `angle: <degrés>` | non, optionnelle (défaut `30`) | `angle: 45` |
| `masse: <kg>` | non, optionnelle (défaut `2`) | `masse: 5` |

- `angle:` : nombre compris entre 5 et 75 degrés (un plan quasi plat ou
  quasi vertical n'apporte rien pédagogiquement, et rend le triangle illisible
  à l'écran).
- `masse:` : nombre strictement positif, en kg.
- `g` (intensité de la pesanteur) vaut **10 m/s²**, une constante — ce n'est
  pas une directive du bloc.
- Une ligne vide ou commençant par `#` est ignorée (commentaire).
- Toute autre directive, une valeur non numérique, ou une ligne sans `:`, est
  une erreur de syntaxe — un encadré ambre s'affiche à la place du bloc, avec
  un message explicite ; le reste de la leçon continue de s'afficher
  normalement.

## Contenu de la figure

- Un plan incliné (triangle rectangle) faisant l'angle α avec le sol,
  l'angle marqué à la base.
- Un bloc (petit carré orange), aligné avec la pente, qui glisse depuis le
  sommet vers la base pendant l'animation.
- Trois vecteurs de force, ancrés au centre du bloc :
  - **P** (poids, bleu) : vertical, vers le bas, longueur ∝ m·g.
  - **N** (réaction normale, vert) : perpendiculaire au plan, vers
    l'extérieur, longueur = P·cos α.
  - **P + N** (résultante, orange) : le long de la pente, vers le bas,
    longueur = P·sin α — c'est elle qui provoque le glissement.
- Un encadré rappelle explicitement le point pédagogique clé (la masse ne
  change jamais a_G).
- Affichage numérique en direct : α, m, a_G = g·sin(α) (avec la mention
  « indépendante de la masse »), puis P, N et la résultante.

## Interaction (côté élève ET dans l'aperçu admin)

- **▶ Lecture / ⏸ Pause / Réinitialiser** : anime le glissement en temps
  réel (`requestAnimationFrame`), selon x(t) = ½·a_G·t² le long d'une pente
  de longueur physique fixe (4 m, un choix de mise en scène — pas une
  directive du bloc). La durée réelle de l'animation vise environ 4 secondes
  quel que soit l'angle (plus l'angle est faible, plus a_G est petite et plus
  la descente serait longue en temps physique réel — la vitesse de lecture
  s'ajuste automatiquement pour rester regardable).
- **Curseur temps** : déplace manuellement l'instant t affiché (scrubbing).
- **Curseur α** : change l'angle — **remet l'animation à t = 0** (la
  trajectoire elle-même change, puisque a_G change).
- **Curseur m** (masse) : met à jour P, N et la résultante **sans** toucher
  au temps ni à l'animation en cours — la masse ne joue aucun rôle dans le
  mouvement, seulement dans l'intensité des forces affichées. C'est
  volontaire : ça illustre concrètement, en direct, que rien ne change dans
  le glissement quand on modifie la masse.
- Bornes par défaut α ∈ [5°, 75°], m ∈ [1, 10] kg — automatiquement élargies
  si la valeur du bloc dépasse ces bornes typiques.

## SVG, SSR et hors-ligne

Comme les simulations de mouvement rectiligne et circulaire, ce composant
est du **SVG statique + état React** (aucune bibliothèque d'animation
externe — `requestAnimationFrame` est une API navigateur native) — **aucune
API navigateur n'est requise pour le premier rendu**. SSR-safe, pas de
`next/dynamic({ ssr: false })` nécessaire.

Aucune dépendance ajoutée : uniquement du SVG et des API navigateur natives
(`requestAnimationFrame`).

Hors-ligne : le bloc ```plan-incline vit dans le texte de la leçon, déjà
stocké intégralement par `lib/offlineStore.ts` lors du téléchargement — une
leçon téléchargée affiche donc sa simulation hors-ligne, animation comprise,
sans rien de plus.
