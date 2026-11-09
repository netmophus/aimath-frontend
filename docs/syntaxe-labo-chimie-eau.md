# Bloc `labo-chimie-eau`

Laboratoire interactif : l'eau solvant, l'autoprotolyse, le produit ionique et le pH.

## Syntaxe

````
```labo-chimie-eau
onglet: dissolution
temperature: 25
```
````

| Clé | Valeurs | Défaut |
|---|---|---|
| `onglet` | `dissolution`, `ionisation`, `charges`, `autoprotolyse`, `ph`, `ph-metre` | `dissolution` |
| `temperature` | `0`, `25`, `60` (°C) | `25` |

Toute autre valeur affiche une erreur en français ; le reste de la leçon reste visible.

## Emplacement

À insérer **uniquement dans la rubrique « Simulation »** d'une leçon, via l'éditeur d'administration
(le contenu est en base de données : rien n'est inséré depuis le code). Les autres rubriques, le bloc
`plan-incline` et les laboratoires de cinématique et de dynamique ne sont pas concernés.

## Contenu

Six onglets (Dissolution, Ionisation, Charges, Autoprotolyse, pH, pH-mètre), chacun avec les modes
Observer, Comprendre et S'exercer (Vérifier, Indice, Expliquer, Recommencer). Le moteur
(`lib/chimieEau.ts`) est séparé de l'interface et testé ; les exercices sont générés dans
`lib/chimieEauExercices.ts`.

## Modèles et limites

- Modèle scolaire des solutions diluées : pH = −log([H₃O⁺]/c°), concentrations ≤ 1 mol/L.
- Ke tabulé : pKe = 14,95 (0 °C), 14,00 (25 °C), 13,02 (60 °C), sans interpolation.
- HCl totalement ionisé, valable pour 1·10⁻⁶ ≤ C ≤ 0,1 mol/L.
- Schémas microscopiques « non à l'échelle » ; conductivité seulement qualitative.
- pH-mètre : stabilisation de 6 s, mesure simulée = valeur nominale + écart reproductible (±0,02)
  et biais de 0,1 hors de la plage d'étalonnage (marge 1 unité pH).
- `prefers-reduced-motion` est respecté (scène figée, images clés).
