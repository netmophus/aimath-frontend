# Syntaxe du bloc ```pgcd

Insère le **Laboratoire PGCD & PPCM** : six simulations interactives par onglets (Euclide, PGCD & PPCM par facteurs
premiers, Bézout, Gauss, équations dans ℤ², équations et systèmes modulo p). Calculs exacts et locaux (BigInt jusqu'à 15
chiffres, 12 pour les facteurs premiers), rendu KaTeX, aucune IA ni réseau.

## Exemple

````
```pgcd
onglet: euclide
```
````

Le bouton **« + Insérer le laboratoire PGCD & PPCM »** de l'éditeur (rubrique 10 uniquement) insère cet exemple.

## Directive (facultative)

| Directive | Valeurs | Défaut |
|---|---|---|
| `onglet:` | `euclide`, `facteurs`, `bezout`, `gauss`, `equations`, `modulo` | `euclide` |

Valeur ou directive inconnue : un encadré d'erreur en français remplace le laboratoire.

## Code

Fonctions pures : `lib/arithmetique.ts` (testées dans `lib/__tests__/arithmetique.test.ts`). Composants : `components/labo-pgcd/`.
