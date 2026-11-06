# Syntaxe du bloc ```premiers

Insère le **Laboratoire des nombres premiers** : six simulations interactives (Crible, Facteurs premiers, Premier ou
composé ?, Carré parfait, Modulo p, Diviseurs). Calculs exacts et locaux (entiers sûrs jusqu'à 10^9, produits en BigInt),
rendu KaTeX, aucune IA ni réseau.

## Exemple

````
```premiers
onglet: crible
```
````

Le bouton **« + Insérer le labo Nombres premiers »** de l'éditeur (rubrique 10 uniquement) insère cet exemple. Il refuse
d'insérer un second bloc ```premiers dans le même champ.

## Directive (facultative)

| Directive | Valeurs | Défaut |
|---|---|---|
| `onglet:` | `crible`, `facteurs`, `primalite`, `carre`, `modulo`, `diviseurs` | `crible` |

Valeur ou directive inconnue : un encadré d'erreur en français remplace le laboratoire.

## Limites de saisie

Crible 2 à 200 ; arbre de facteurs et carré parfait jusqu'à 1 000 000 ; primalité jusqu'à 100 000 ; diviseurs, PGCD et PPCM jusqu'à 10^9.

## Code

Fonctions pures : `lib/premiers.ts` (testées dans `lib/__tests__/premiers.test.ts`). Composants : `components/labo-premiers/`.
