# Syntaxe du bloc ```congruence

Insère un calculateur de congruence interactif dans un champ Markdown de leçon (rubrique « 10. Simuler pour
comprendre »). Deux blocs : division euclidienne de `a` par `n` (reste toujours dans `[0, n-1]`, même si `a < 0`) et test
`a ≡ b [n]` avec verdict Oui/Non justifié. Rendu React + KaTeX local, sans réseau. Notation à crochets partout.

## Exemple

````
```congruence
a: 17
b: 3
n: 5
```
````

Le bouton **« + Insérer un calculateur de congruence »** de l'éditeur (rubrique 10 uniquement) insère cet exemple.

## Directives (toutes facultatives)

| Directive | Rôle | Défaut |
|---|---|---|
| `a:` | entier relatif de départ | 17 |
| `b:` | second entier du test de congruence | 3 |
| `n:` | module (≥ 1) | 5 |

Bloc vide = valeurs par défaut. Clé inconnue, ligne sans `:` ou valeur non entière : un encadré d'erreur en français
remplace le calculateur (le reste du cours s'affiche normalement). L'élève peut ensuite modifier lui-même les champs ; un
champ vide ou un module `n < 1` affiche « Entre un entier a et un module n ≥ 1 » sans planter.
