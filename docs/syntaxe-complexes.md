# Syntaxe du bloc ```complexes

Insère le **Laboratoire des nombres complexes** (Terminale C) : six simulations interactives (Plan complexe, Calculs,
Trois formes, Rotations, Racines, Géométrie). Calculs locaux (aucune IA, aucun réseau), rendu KaTeX, points déplaçables
à la souris, au doigt ou au clavier (flèches). Chaque simulation a trois niveaux : **Découvrir** (manipuler), **Comprendre**
(explications qui suivent les valeurs) et **Vérifier** (mode défi : indices progressifs, correction complète, nouveau défi).

## Exemple

````
```complexes
onglet: plan
```
````

Le bouton **« + Insérer le labo Nombres complexes »** de l'éditeur (rubrique 10 « Simuler pour comprendre » uniquement)
insère cet exemple en fin de champ. Il refuse d'insérer un second bloc ```complexes dans le même champ et ne modifie pas
le reste du contenu ; la sauvegarde reste celle du bouton « Enregistrer » existant.

## Directive (facultative)

| Directive | Valeurs | Défaut |
|---|---|---|
| `onglet:` | `plan`, `calculs`, `formes`, `rotations`, `racines`, `geometrie` | `plan` |

Un bloc vide ouvre le premier onglet (`plan`). Une valeur ou une directive inconnue : un encadré d'erreur en français
remplace le laboratoire. Le menu interne permet ensuite de passer d'une simulation à l'autre.

## Conventions mathématiques (code : `lib/complexes.ts`)

- Angles en **radians** dans les formules ; l'interface affiche aussi les degrés. Argument principal dans **]−π, π]**,
  défini modulo 2π ; l'argument de **0 est indéfini** (jamais affiché, aucune forme trigonométrique ni exponentielle).
- Politique numérique : tolérance **relative 10⁻⁹** (`presqueEgal`) ; les tests d'alignement, d'orthogonalité et de
  cocyclicité portent sur des grandeurs sans dimension (sinus/cosinus de l'angle, partie imaginaire relative d'un quotient).
  cos et sin des angles de cadran sont corrigés exactement. On ne décide jamais d'une propriété sur une valeur arrondie.
- Division par zéro : refusée (`div` renvoie `null`), message « Division impossible : le dénominateur est nul. »
- Second degré : a ≠ 0 exigé, coefficients finis et au plus 10⁶ en valeur absolue.
- Géométrie : les points A, B, C, D se placent sur une grille de pas 0,5 (tests exacts) ; les triangles prédéfinis
  (équilatéral) utilisent des valeurs flottantes, décidées par la tolérance relative.
- Valeurs exactes affichées uniquement quand elles sont reconnues (entiers, √m simples, angles multiples de π/12
  remarquables) ; sinon valeur approchée, indiquée comme telle.

## Code

- Moteur : `lib/complexes.ts` (calculs), `lib/complexesTex.ts` (TeX, valeurs exactes, lecture des réponses),
  `lib/complexesAffichage.ts`, analyse du bloc `lib/laboComplexes.ts`, plugin remark `lib/remarkLaboComplexes.ts`.
- Composants : `components/labo-complexes/` (`LaboComplexes`, `LaboComplexesBloc`, six `Sim*.tsx`, `ui.tsx` avec le plan SVG
  interactif et le mode défi). Tests : `lib/__tests__/complexes.test.ts` et `lib/__tests__/laboComplexes.test.ts`.
