# Syntaxe du bloc ```circulaire

Insère une simulation de mouvement circulaire uniforme dans n'importe quel
champ Markdown d'une leçon (cours, démonstrations, énoncés/corrigés
d'exercices). Rendu en SVG + React, 100 % hors-ligne, aucune image ni appel
réseau, aucune dépendance externe — même modèle que la simulation de
mouvement rectiligne (`docs/syntaxe-mouvement.md`).

**Objectif pédagogique.** Montrer que même à vitesse de VALEUR constante, un
mobile en mouvement circulaire uniforme possède une accélération : le vecteur
vitesse tourne (sa direction change en permanence même si sa longueur ne
change pas) et le vecteur accélération — centripète — pointe en permanence
vers le centre du cercle.

## Exemple

````
```circulaire
rayon: 1
omega: 2
duree: 10
```
````

Dans l'éditeur admin, le bouton **« + Insérer une simulation de mouvement
circulaire »** (à côté des boutons d'insertion existants, sur les sections
Cours, Démonstrations et les énoncés/corrigés d'exercices) insère cet exemple
à la position du curseur.

## Directives

| Directive | Répétable | Exemple |
|---|---|---|
| `rayon: <mètres>` | non, optionnelle (défaut `1`) | `rayon: 2.5` |
| `omega: <rad/s>` | non, optionnelle (défaut `2`) | `omega: -3` |
| `duree: <secondes>` | non, optionnelle (défaut `10`) | `duree: 15` |

- `rayon:` : nombre strictement positif (un rayon nul ou négatif n'a pas de
  sens géométrique).
- `omega:` : n'importe quel nombre (positif = sens trigonométrique/antihoraire,
  négatif = sens horaire, 0 = mobile immobile — un cas limite valide, pas une
  erreur).
- `duree:` : nombre strictement positif, compris entre 1 et 120 secondes —
  borne le curseur temps et la durée de l'animation.
- Une ligne vide ou commençant par `#` est ignorée (commentaire).
- Toute autre directive, une valeur non numérique, ou une ligne sans `:`, est
  une erreur de syntaxe — un encadré ambre s'affiche à la place du bloc, avec
  un message explicite ; le reste de la leçon continue de s'afficher
  normalement.

## Contenu de la figure

- Cercle de rayon R (centre O marqué), à l'échelle fixe à l'écran (comme
  `docs/syntaxe-racines.md` : la vraie valeur de R, elle, est affichée en
  texte — un réglage de R ne redimensionne pas le cercle affiché, seulement
  les grandeurs calculées).
- Le mobile (point orange) tourne sur le cercle selon θ(t) = ω·t.
- Segment OM pointillé : montre que l'accélération est portée par le rayon,
  vers O.
- Vecteur **vitesse** v (flèche bleue), **tangent** au cercle (perpendiculaire
  à OM), longueur constante (v = R·|ω|) — seule sa direction tourne avec le
  mobile.
- Vecteur **accélération** a (flèche orange), **centripète** (toujours dirigé
  du mobile vers O), longueur constante (a = R·ω²) — même principe : direction
  qui tourne, longueur qui ne change jamais.
- Un encadré rappelle explicitement le point pédagogique clé (v constante en
  valeur mais tourne ; a toujours dirigée vers O).
- Affichage numérique en direct : t, θ (en degrés, normalisé sur [0°, 360°)),
  v et a — avec la mention « (constante) » à côté de v et a, pour bien
  distinguer ce qui varie (t, θ, les directions des vecteurs) de ce qui ne
  varie pas (les valeurs de v et a).
- Indication du sens de rotation (trigonométrique/antihoraire, horaire, ou
  immobile si ω = 0).

## Interaction (côté élève ET dans l'aperçu admin)

- **▶ Lecture / ⏸ Pause / Réinitialiser** : anime le mobile en temps réel
  (`requestAnimationFrame`). Comme pour ```mouvement, la durée réelle de
  l'animation vise environ 10 secondes quel que soit `duree`. Arrivée à la
  fin, le bouton devient « ▶ Rejouer ».
- **Curseur temps** : déplace manuellement l'instant t affiché (scrubbing),
  de 0 à `duree`. Interrompt l'animation en cours.
- **Curseurs R, ω** : rejouent immédiatement la scène avec les nouvelles
  valeurs (l'animation repart de t = 0). Bornes par défaut R ∈ [0.5, 3],
  ω ∈ [0.5, 5] — automatiquement élargies si la valeur du bloc dépasse ces
  bornes typiques, pour ne jamais contredire la configuration initiale.

## SVG, SSR et hors-ligne

Comme la simulation de mouvement rectiligne, ce composant est du **SVG
statique + état React** (aucune bibliothèque d'animation externe —
`requestAnimationFrame` est une API navigateur native) — **aucune API
navigateur n'est requise pour le premier rendu** : le state initial et le
calcul de la scène sont de purs calculs JavaScript, la boucle d'animation ne
démarre que dans un `useEffect`, après hydratation. SSR-safe, pas de
`next/dynamic({ ssr: false })` nécessaire.

Aucune dépendance ajoutée : uniquement du SVG et des API navigateur natives
(`requestAnimationFrame`).

Hors-ligne : le bloc ```circulaire vit dans le texte de la leçon, déjà
stocké intégralement par `lib/offlineStore.ts` lors du téléchargement — une
leçon téléchargée affiche donc sa simulation hors-ligne, animation comprise,
sans rien de plus.
