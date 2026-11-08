# Blocs du Laboratoire de dynamique

Laboratoire de dynamique (Physique, Terminale C) : six simulations du **théorème du centre d'inertie**, avec trois modes
pédagogiques (Observer, Comprendre, S'exercer). Calculs locaux (aucune IA, aucun réseau), formules KaTeX, animations SVG.

Le moteur physique est dans `lib/dynamique.ts` (fonctions pures, testées, **unités SI**). Les composants n'y ajoutent aucune formule.

## Blocs disponibles

| Bloc | Simulation | Directives (toutes facultatives) |
|---|---|---|
| `plan-incline` | Plan incliné sans frottement | `angle` (0 à 75, °), `masse` (kg), `gravite` (1 à 20, m/s²), `vitesse` (0 à 10, m/s), `distance` (1 à 20, m) |
| `machine-atwood` | Machine d'Atwood | `masse1`, `masse2` (kg), `gravite` (m/s²), `course` (0,2 à 5, m) |
| `pendule-conique` | Pendule conique | `masse` (kg), `longueur` (0,1 à 5, m), `gravite`, puis **soit** `angle` (1 à 85, °) **soit** `omega` (rad/s) |
| `monte-charge` | Monte-charge | `masse` (kg), `gravite`, `acceleration` (m/s², algébrique, > −g), `vitesse` (m/s, algébrique), `hauteur` (5 à 200, m) |
| `vehicule-virage` | Véhicule dans un virage | `masse` (kg), `vitesse` (m/s), `rayon` (1 à 1000, m), `gravite`, `mu` (coefficient d'adhérence, active le mode adhérence) |
| `solide-sphere` | Solide glissant sur une sphère | `masse` (kg), `rayon` (0,2 à 50, m), `gravite`, `angleInitial` (0,1 à 60, °), `vitesse` (0 à 30, m/s) |
| `labo-dynamique` | Les six simulations en onglets | `onglet` : `plan`, `atwood`, `pendule`, `monte-charge`, `virage`, `sphere` (défaut `plan`) |

Chaque bloc reçoit ses valeurs par défaut s'il est vide.

````
```plan-incline
angle: 30
masse: 2
gravite: 10
distance: 5
```

```machine-atwood
masse1: 0.5
masse2: 0.3
gravite: 9.8
```

```pendule-conique
masse: 0.1
longueur: 0.5
angle: 30
gravite: 10
```

```monte-charge
masse: 500
gravite: 10
acceleration: 1
```

```vehicule-virage
masse: 1000
vitesse: 15
rayon: 50
gravite: 10
```

```solide-sphere
masse: 1
rayon: 2
gravite: 10
angleInitial: 1
```
````

## Règles de validation

- Une directive par ligne `clé: valeur` ; lignes vides et lignes commençant par `#` ignorées ; casse des clés libre ; virgule ou point décimal.
- **Unités SI uniquement, sans unité écrite** : `masse: 500 g` est refusé avec un message qui le dit. Aucune conversion implicite.
- Valeur hors bornes, directive inconnue ou répétée, ligne mal formée : encadré d'erreur en français ; le reste de la leçon s'affiche.
- `pendule-conique` : `angle` et `omega` sont liés par cos θ = g / (ℓω²), ils ne peuvent pas être fixés ensemble.
- `monte-charge` : `acceleration` ≤ −g est refusée (câble détendu, T ≤ 0).
- L'élève peut sortir de ces bornes avec les curseurs : l'interface signale alors la configuration non valide (pendule : ℓω² ≤ g ; monte-charge :
  câble détendu ; virage : adhérence insuffisante).

## Raccordement du bloc `plan-incline`

Le bloc existant `plan-incline` (angle, masse) est désormais rendu par le nouveau laboratoire (une simulation dans le cadre du laboratoire).
`remarkLaboDynamique` est placé avant `remarkPlanIncline` dans `RenduMarkdown` : il capte ce bloc, l'ancien plugin n'a plus rien à traiter. Les
anciens fichiers (`lib/planIncline.ts`, `components/SimulationPlanIncline*.tsx`, `lib/remarkPlanIncline.ts`) sont conservés intacts. Les leçons
existantes gardent leur syntaxe ; l'ancienne plage `angle: 5..75` reste acceptée (nouvelle plage 0 à 75), et les masses sont acceptées jusqu'à 1000 kg.
Les blocs `mouvement`, `circulaire`, `courbe` et `labo-cinematique` ne sont pas concernés.

## Modèles et situations limites

- **Plan incliné** : P = mg, Pₓ = mg sin α, P_y = −mg cos α, N = mg cos α, a = g sin α (indépendante de m) ; v = v₀ + at, d = v₀t + ½at² ; arrêt à
  l'extrémité du plan ; α = 0 : a = 0.
- **Atwood** : a = (m₁ − m₂) g / (m₁ + m₂) algébrique (positive quand S₁ descend), T = 2m₁m₂g / (m₁ + m₂) ; masses égales : immobile ; poulie : φ = s / R.
- **Pendule conique** : r = ℓ sin θ, T = mg / cos θ, ω = √(g / (ℓ cos θ)), v = rω, a = rω² ; configuration refusée si ℓω² ≤ g ou θ ∉ ]0°, 90°[.
- **Monte-charge** : T = m(g + a) ; câble détendu si a ≤ −g ; situations : immobile, vitesse constante, montée/descente accélérée/ralentie.
- **Virage** : a = v²/R, F = mv²/R, N = mg ; adhérence : v ≤ √(μₛgR) ; vitesse trop élevée : virage non animé et signalé (aucun dérapage simulé).
- **Sphère** : N = mg cos θ − mv²/R, v² = v₀² + 2gR(cos θ₀ − cos θ) ; détachement cos θd = (2cos θ₀ + v₀²/(gR)) / 3 ; 48,2° n'est que le cas limite idéal
  (θ₀ → 0, v₀ = 0). Intégration de θ'' = (g/R) sin θ par Runge-Kutta d'ordre 4 (pas 2 ms), puis projectile continu en position et en vitesse.

## Exercices (mode S'exercer)

Au moins trois questions par simulation, générées à partir des paramètres courants (jamais figées) et vérifiées par le moteur. Valeurs numériques :
tolérance relative de **2 %** (ou 0,005 en valeur absolue près de zéro) ; l'unité est vérifiée si elle est écrite. Retour pédagogique et nouvelle tentative.

## Code

- Moteur : `lib/dynamique.ts` ; exercices : `lib/dynamiqueExercices.ts` ; blocs : `lib/laboDynamique.ts`, `lib/remarkLaboDynamique.ts`.
- Composants : `components/labo-dynamique/` (`LaboDynamique`, `LaboDynamiqueBloc`, six simulations, `ui.tsx`).
- Tests : `lib/__tests__/dynamique.test.ts` (physique), `lib/__tests__/laboDynamique.test.ts` (blocs, plugin, rendu).
