# Syntaxe du bloc ```labo-cinematique

Insère le **Laboratoire de cinématique** (Physique, Terminale C) : six simulations interactives (MRU/MRUV, mouvement circulaire
uniforme, repère de Frenet, hodographe, chronophotographie, référentiels). Calculs locaux (aucune IA, aucun réseau), formules KaTeX,
animations vectorielles SVG, graphiques synchronisés. Il complète les blocs existants ```mouvement, ```circulaire et ```courbe, qu'il
ne remplace pas et qui continuent de fonctionner à l'identique.

## Exemple

````
```labo-cinematique
onglet: mru
```
````

Le bouton **« + Insérer le labo Cinématique »** de l'éditeur (rubrique 10 « Simuler pour comprendre » uniquement) insère cet exemple en
fin de champ, refuse un second bloc dans le même champ et ne modifie pas le reste du contenu. La sauvegarde reste celle du bouton
« Enregistrer ».

## Directive (facultative)

| Directive | Valeurs | Défaut |
|---|---|---|
| `onglet:` | `mru`, `circulaire`, `frenet`, `hodographe`, `chronophoto`, `referentiels` | `mru` |

Une valeur ou une directive inconnue : encadré d'erreur en français. Si le rendu échouait, un repli lisible s'affiche sans emporter
le reste de la leçon.

## Les six simulations

- **MRU / MRUV** : x(t) = x₀ + v₀t + ½at², vₓ(t) = v₀ + at ; piste graduée, vecteurs vitesse et accélération (longueur proportionnelle,
  sens = signe), trois graphiques synchronisés, instant d'arrêt, déplacement algébrique Δx et **distance parcourue** (calculée par
  morceaux si le mobile change de sens). Situations : MRU, MRUV accéléré, freinage, changement de sens.
- **Circulaire** : θ(t) = θ₀ + ωt, v = R|ω|, a = Rω², T = 2π/|ω| (non définie si ω = 0) ; ω positive, négative ou nulle ; vecteurs tournant avec
  le mobile ; expérience « |ω| double ⇒ v ×2, a ×4 ».
- **Frenet** : mouvement réellement simulé (abscisse curviligne s = s₀ + v₀t + ½aT t² sur une trajectoire rectiligne ou de rayon de courbure Rc)
  ; v⃗ = vT⃗, a⃗ = aT T⃗ + aN N⃗, aN = v²/Rc ; N orientée vers le centre de courbure (non définie en trajectoire rectiligne) ; cas v = 0 signalé.
- **Hodographe** : plan de la trajectoire (position) et plan de l'hodographe (vitesse) synchronisés (même horloge, mêmes données) ;
  MRU = point, MRUV = segment, MCU = cercle de rayon R|ω| ; a⃗ tangente à l'hodographe.
- **Chronophoto** : positions M₀, M₁… toutes les τ ; vitesse centrée M(i−1)M(i+1)/(2τ), accélération [M(i)M(i+1) − M(i−1)M(i)]/τ², variante par différence
  centrée des vitesses, vitesses moyennes aux instants (i+½)τ ; comparaison estimé / théorique (écarts absolu et relatif) ; effet du pas τ ;
  déplacement vectoriel, distance et longueur de trace distingués.
- **Référentiels** : route, véhicule, passager, observateur ; référentiel terrestre ou du véhicule ; x_P/T = x_V/T + x_P/V, v_P/T = v_V/T + v_P/V ;
  schéma pédagogique simplifié des référentiels terrestre, géocentrique et de Copernic (non à l'échelle, pas une simulation astronomique).

## Conventions

- SI (m, s, rad) ; repère orthonormé direct ; grandeurs algébriques pour le mouvement rectiligne.
- Une seule horloge par simulation (`useHorloge`) : animation, graphiques et calculs lisent le même temps. Lecture / Pause / Recommencer /
  Réinitialiser, vitesse ×0,25 à ×2. Aucune lecture automatique ; avec « réduire les animations » activé, la lecture avance par pas d'une demi-seconde.

## Code

- Moteur : `lib/cinematique.ts` (fonctions pures, testées). Intégration : `lib/laboCinematique.ts`, `lib/remarkLaboCinematique.ts`, `components/RenduMarkdown.tsx`.
- Composants : `components/labo-cinematique/` (`LaboCinematique`, `LaboCinematiqueBloc`, six onglets, `ui.tsx`).
- Tests : `lib/__tests__/cinematique.test.ts` (physique), `lib/__tests__/laboCinematique.test.ts` (intégration et rendu).
