# Syntaxe du bloc ```mouvement

Insère une simulation de mouvement rectiligne (uniforme ou uniformément
varié) dans n'importe quel champ Markdown d'une leçon (cours, démonstrations,
énoncés/corrigés d'exercices). Rendu en SVG + React, 100 % hors-ligne, aucune
image ni appel réseau, aucune dépendance externe — même modèle que l'horloge
modulaire (`docs/syntaxe-horloge.md`) et le cercle trigonométrique
(`docs/syntaxe-cercletrigo.md`).

**Objectif pédagogique.** Rendre manipulable la loi horaire d'un mouvement
rectiligne x(t) = x₀ + v₀·t + ½·a·t² : l'élève voit le mobile avancer sur un
axe gradué (animation), avec les vecteurs vitesse et accélération qui
évoluent, ET peut régler x₀, v₀, a pour observer un mouvement uniforme,
uniformément accéléré ou uniformément retardé.

## Exemple

````
```mouvement
x0: 0
v0: 2
a: 1
duree: 10
```
````

Dans l'éditeur admin, le bouton **« + Insérer une simulation de mouvement »**
(à côté des boutons d'insertion existants, sur les sections Cours,
Démonstrations et les énoncés/corrigés d'exercices) insère cet exemple à la
position du curseur.

## Directives

| Directive | Répétable | Exemple |
|---|---|---|
| `x0: <mètres>` | non, optionnelle (défaut `0`) | `x0: -5` |
| `v0: <m/s>` | non, optionnelle (défaut `2`) | `v0: -3` |
| `a: <m/s²>` | non, optionnelle (défaut `1`) | `a: 0` |
| `duree: <secondes>` | non, optionnelle (défaut `10`) | `duree: 20` |

- `x0:`, `v0:`, `a:` : n'importe quel nombre (positif, négatif, décimal).
- `duree:` : nombre strictement positif, compris entre 1 et 120 secondes —
  borne le curseur temps et la durée de l'animation.
- Une ligne vide ou commençant par `#` est ignorée (commentaire).
- Toute autre directive, une valeur non numérique, ou une ligne sans `:`, est
  une erreur de syntaxe — un encadré ambre s'affiche à la place du bloc, avec
  un message explicite ; le reste de la leçon continue de s'afficher
  normalement.

## Contenu de la figure

- Axe horizontal gradué en mètres, dont la portée s'ajuste automatiquement
  pour que toute la trajectoire (sur toute la durée) reste visible, y compris
  après un réglage de curseur qui change x₀/v₀/a.
- Le mobile (point orange) se déplace sur l'axe selon x(t).
- Vecteur **vitesse** v(t) (flèche bleue, au-dessus de l'axe), longueur
  proportionnelle à |v(t)|, orientée selon son signe — recalculé à chaque
  instant.
- Vecteur **accélération** a (flèche orange, sous l'axe), constant tant que
  le curseur `a` n'est pas changé.
- Indication du type de mouvement, recalculée à chaque instant t :
  **uniforme** (a = 0), **uniformément accéléré** (v(t) et a de même signe —
  |v| augmente) ou **uniformément retardé** (signes opposés — |v| diminue).
  Avec une accélération de signe opposé à v₀, l'indication passe donc de
  « retardé » à « accéléré » en cours d'animation, au moment où le mobile
  rebrousse chemin.
- Affichage numérique en direct : t, x(t), v(t), a.

## Interaction (côté élève ET dans l'aperçu admin)

- **▶ Lecture / ⏸ Pause / Réinitialiser** : anime le mobile en temps réel
  (`requestAnimationFrame`). La durée réelle de l'animation vise environ
  10 secondes quel que soit `duree` (un `duree: 120` ne fait pas attendre
  deux minutes à l'élève — vitesse de lecture accélérée en conséquence).
  Arrivée à la fin, le bouton devient « ▶ Rejouer ».
- **Curseur temps** : déplace manuellement l'instant t affiché (scrubbing),
  de 0 à `duree`. Interrompt l'animation en cours.
- **Curseurs x₀, v₀, a** : rejouent immédiatement la scène avec les
  nouvelles valeurs (l'animation repart de t = 0). Bornes par défaut
  x₀ ∈ [-20, 20], v₀ ∈ [-10, 10], a ∈ [-5, 5] — automatiquement élargies si
  la valeur du bloc dépasse ces bornes typiques, pour ne jamais contredire
  la configuration initiale.

## SVG, SSR et hors-ligne

Comme l'horloge modulaire, ce composant est du **SVG statique + état React**
(aucune bibliothèque d'animation externe — `requestAnimationFrame` est une
API navigateur native) — **aucune API navigateur n'est requise pour le
premier rendu** : le state initial et le calcul de la scène sont de purs
calculs JavaScript, la boucle d'animation ne démarre que dans un
`useEffect`, après hydratation. SSR-safe, pas de
`next/dynamic({ ssr: false })` nécessaire : `components/SimulationMouvementBloc.tsx`
importe `SimulationMouvement` directement, comme `TableauVariationsBloc.tsx`
et `HorlogeModulaireBloc.tsx` (contrairement aux courbes, qui elles dépendent
de `function-plot`, une bibliothèque qui touche le DOM dès son initialisation).

Aucune dépendance ajoutée : uniquement du SVG et des API navigateur natives
(`requestAnimationFrame`).

Hors-ligne : le bloc ```mouvement vit dans le texte de la leçon, déjà stocké
intégralement par `lib/offlineStore.ts` lors du téléchargement — une leçon
téléchargée affiche donc sa simulation hors-ligne, animation comprise, sans
rien de plus.
