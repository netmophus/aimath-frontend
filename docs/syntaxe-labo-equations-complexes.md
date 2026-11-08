# Syntaxe du bloc ```labo-equations-complexes

Insère le laboratoire **Équations complexes** (Terminale C) : cinq simulations interactives pour résoudre les équations du second
degré dans ℂ et du troisième degré par factorisation. Calculs locaux (aucune IA, aucun réseau), rendu KaTeX, plan complexe
orthonormé avec zoom, points déplaçables à la souris, au doigt ou au clavier. Il complète les laboratoires « Nombres complexes »
(bloc ```complexes) et « Moivre, Euler et racines n-ièmes » (bloc ```labo-moivre), qu'il ne remplace pas.

## Exemple

````
```labo-equations-complexes
onglet: discriminant
```
````

Le bouton **« + Insérer le labo Équations complexes »** de l'éditeur (rubrique 10 « Simuler pour comprendre » uniquement) insère
cet exemple en fin de champ. Il refuse d'insérer un second bloc dans le même champ et ne modifie pas le reste du contenu ; la
sauvegarde reste celle du bouton « Enregistrer » existant. L'aperçu à droite de l'éditeur affiche le laboratoire.

## Directive (facultative)

| Directive | Valeurs | Défaut |
|---|---|---|
| `onglet:` | `discriminant`, `racines`, `resolution`, `troisieme-degre`, `verification` | `discriminant` |

Un bloc vide ouvre le premier onglet. Une valeur ou une directive inconnue : un encadré d'erreur en français remplace le
laboratoire. Si le rendu échouait, un repli lisible s'affiche sans emporter le reste de la leçon. Le menu interne permet ensuite de
passer librement d'une simulation à l'autre. Exemple pour ouvrir directement les racines carrées complexes :

````
```labo-equations-complexes
onglet: racines
```
````

## Ce que fait chaque onglet

- **Discriminant** : az² + bz + c = 0 à coefficients **réels** (a ≠ 0), curseurs et champs, Δ = b² − 4ac, les trois cas (Δ > 0, Δ = 0,
  Δ < 0) surlignés, racines dans le plan (deux points sur l'axe réel ; **un seul** point à multiplicité 2 si Δ = 0 ; deux points conjugués
  reliés en pointillés si Δ < 0), étapes affichables, exemples, zoom et recentrage.
- **Racines carrées** : δ tel que δ² = Δ = X + iY, par identification, module et signe de xy (six étapes), cas Y > 0, Y < 0, Y = 0 avec
  X > 0 ou X < 0, X = Y = 0 (une seule racine). Deux plans distincts : celui de Δ (point déplaçable) et celui de δ et −δ (diamétralement
  opposés). Bouton « Comprendre les étapes » : calcul et figure se construisent étape par étape.
- **Résolution** : second degré à coefficients **complexes** (six champs : parties réelle et imaginaire de a, b, c), Δ complexe,
  δ, solutions. Δ non réel : jamais comparé à 0. Clic sur une racine : forme algébrique, module, argument (absent pour 0), formes
  trigonométrique et exponentielle, vérification P(z) = 0.
- **Troisième degré** : P(z) = az³ + bz² + cz + d avec une racine z₀ **proposée** (ou cherchée parmi les entiers de Gauss) : P(z₀) est calculé,
  verdict « Racine vérifiée » ou « Ce nombre n'est pas une racine ». Puis factorisation P(z) = (z − z₀)Q(z), calcul de Q par
  identification **ou** division euclidienne (les deux concordent), résolution de Q, trois racines avec multiplicités (racines double et
  triple traitées). Ce n'est pas une formule générale du troisième degré.
- **Vérification** : candidat saisi ou point déplacé, P(z) avec parties réelle et imaginaire séparées, verdict honnête (égalité exacte en
  entiers, nullité à la tolérance près en flottants, ou non-nullité), relations de Viète (second degré), mode « À toi de trouver » avec
  correction progressive.

## Conventions mathématiques

- Un polynôme est donné par ses coefficients complexes en degrés décroissants.
- « P(z) = 0 » se juge sur |P(z)| ≤ 10⁻⁹ × (Σ |aₖ||z|ᵏ), tolérance **relative à la taille des termes** ; si tous les nombres sont entiers
  (module raisonnable), le calcul est exact et on parle d'égalité.
- Δ = 0 est décidé par une tolérance relative de 10⁻¹² sur |b|² et |4ac| : un reste d'arrondi ne scinde pas une racine double.
- Multiplicités du troisième degré : décidées par la structure (Δ_Q = 0, z₀ racine de Q), pas par l'écart de deux flottants proches
  (seule la comparaison finale z₀ ≈ racine de Q utilise la tolérance relative 10⁻⁸).
- Valeurs exactes affichées quand elles sont reconnues (entiers, √m) ; sinon valeurs approchées signalées par « ≈ ».
- Coefficients et nombres saisis limités à 10⁶ en module ; saisie en `a + bi` (ex. `2-3i`, `1/2`, `-4i`), sans `eval`.

## Code

- Moteur : `lib/equationsComplexes.ts` (discriminant, racines carrées, polynômes, division, second et troisième degré, Viète),
  `lib/equationsComplexesAffichage.ts` (TeX), `lib/equationsComplexesExemples.ts` (exemples et solutions attendues vérifiées par les tests).
- Intégration : `lib/laboEquations.ts` (analyse du bloc), `lib/remarkLaboEquations.ts` (plugin remark), `components/RenduMarkdown.tsx`.
- Composants : `components/labo-equations/` (`LaboEquations`, `LaboEquationsBloc`, cinq onglets, `ui.tsx`, `BilanPolynome.tsx`).
- Tests : `lib/__tests__/equationsComplexes.test.ts` (moteur) et `lib/__tests__/laboEquations.test.ts` (intégration, rendu, TeX strict).
