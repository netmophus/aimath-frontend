# Syntaxe du bloc ```labo-moivre

Insère le **Laboratoire Moivre, Euler et racines n-ièmes** (Terminale C) : six simulations interactives (Moivre, Euler,
Linéariser, Angles multiples, Racines, Géométrie). Calculs locaux (aucune IA, aucun réseau), rendu KaTeX, points déplaçables
à la souris, au doigt ou au clavier. Chaque simulation a trois zones : **Découvrir** (manipuler), **Comprendre** (explications
pas à pas) et **Vérifier** (mode défi : indices progressifs, correction complète, nouveau défi). Il complète le laboratoire
des nombres complexes (bloc ```complexes), qu'il ne remplace pas.

## Exemple

````
```labo-moivre
onglet: moivre
```
````

Le bouton **« + Insérer le labo Moivre »** de l'éditeur (rubrique 10 « Simuler pour comprendre » uniquement) insère cet exemple en
fin de champ. Il refuse d'insérer un second bloc ```labo-moivre dans le même champ et ne modifie pas le reste du contenu ; la
sauvegarde reste celle du bouton « Enregistrer » existant. L'aperçu à droite de l'éditeur affiche le laboratoire.

## Directive (facultative)

| Directive | Valeurs | Défaut |
|---|---|---|
| `onglet:` | `moivre`, `euler`, `linearisation`, `angles`, `racines`, `geometrie` | `moivre` |

Un bloc vide ouvre le premier onglet. Une valeur ou une directive inconnue : un encadré d'erreur en français remplace le
laboratoire. Si le rendu d'un onglet échouait, un repli lisible s'affiche sans emporter le reste de la leçon. Le menu interne permet
ensuite de passer librement d'une simulation à l'autre.

## Ce que fait chaque onglet

- **Moivre** : z = r e^{iθ} et z^n = r^n e^{inθ} ; point z déplaçable, puissances successives z^k, angle total nθ non réduit
  (avec l'argument principal à côté), animation « Animer la puissance », n négatif, nul, angle négatif ou > 360°, z = 0
  (puissances négatives et 0⁰ refusées, aucun argument). Exemple guidé : (1 + i)⁸ = 16.
- **Euler** : e^{iθ} et e^{-iθ} symétriques, projections, « Additionner » (2cos θ), « Soustraire » (2i sin θ), explications
  successives, angles remarquables avec valeurs **exactes**.
- **Linéariser** : sin^p x cos^q x pour 1 ≤ p + q ≤ 5 par un moteur symbolique exact (coefficients rationnels, résultat réel
  vérifié), étapes Euler → substitution → développement → regroupement → résultat, courbes initiale et linéarisée superposées.
- **Angles multiples** : cos nx et sin nx (2 ≤ n ≤ 5) par le binôme de Newton de (cos x + i sin x)^n, puissances de i et coefficients
  binomiaux visibles, parties réelle et imaginaire colorées, simplification, contrôle numérique (qui n'est pas la preuve).
- **Racines** : racines n-ièmes de Z = ρ e^{iφ} (2 ≤ n ≤ 12), clic sur une racine pour son détail, liste complète, bouton « Vérifier les
  racines » (vérification numérique à tolérance documentée, sans prétendre démontrer l'exhaustivité). Z = 0 traité à part.
- **Géométrie** : polygone régulier des racines, rayon R = ρ^{1/n}, angle 2π/n, côté c = 2R sin(π/n) et périmètre pour n ≥ 3, deux points
  opposés (aucun polygone) pour n = 2, animation « Faire tourner » (chaque racine tourne de Δφ/n).

## Conventions mathématiques

- Radians pour tous les calculs ; l'interface affiche aussi les degrés. Argument principal dans ]−π, π] ; l'argument de 0 est indéfini.
- Tolérance **relative 10⁻⁹** (`lib/complexes.ts`) pour les égalités ; 10⁻⁶ pour les vérifications qui enchaînent n produits (z_k^n = Z).
- Valeurs exactes affichées quand elles sont reconnues (entiers, √m, angles multiples de π/12) ; sinon valeur approchée signalée par « ≈ ».
- Repères **orthonormés** : les cercles restent circulaires quel que soit le format d'écran.

## Code

- Moteur : `lib/moivreEuler.ts` (Moivre, Euler, racines, polygone), `lib/moivreEulerSymbolique.ts` (linéarisation et angles multiples
  exacts), `lib/moivreEulerAffichage.ts` (TeX), `lib/moivreEulerDefis.ts` (données du défi « Racines »).
- Intégration : `lib/laboMoivre.ts` (analyse du bloc), `lib/remarkLaboMoivre.ts` (plugin remark), `components/RenduMarkdown.tsx`.
- Composants : `components/labo-moivre/` (`LaboMoivreEuler`, `LaboMoivreBloc`, six onglets, `ui.tsx`). Tests : `lib/__tests__/moivreEuler.test.ts`
  et `lib/__tests__/laboMoivre.test.ts`.
