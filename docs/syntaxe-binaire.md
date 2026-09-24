# Syntaxe du bloc ```binaire

Insère un convertisseur décimal ↔ binaire interactif dans n'importe quel
champ Markdown d'une leçon (cours, démonstrations, énoncés/corrigés
d'exercices). Rendu en HTML/SVG + React, 100 % hors-ligne, aucune image ni
appel réseau — même modèle que l'horloge modulaire (`docs/syntaxe-horloge.md`)
et les tableaux de variations (`docs/syntaxe-variations.md`).

**Objectif pédagogique.** Montrer comment un entier s'écrit en base 2. Deux
modes, une seule source de vérité (le nombre courant) : cliquer des cases de
bits (chacune avec sa puissance de 2 au-dessus) met à jour le nombre décimal
en direct, et inversement, taper un nombre décimal met à jour les cases.

## Exemple

````
```binaire
valeur: 13
max: 255
```
````

Dans l'éditeur admin, le bouton **« + Insérer un convertisseur binaire »** (à
côté des boutons d'insertion existants, sur les sections Cours,
Démonstrations et les énoncés/corrigés d'exercices) insère cet exemple à la
position du curseur.

## Directives

| Directive | Répétable | Exemple |
|---|---|---|
| `valeur: <n>` | non, optionnelle (défaut `0`) | `valeur: 13` |
| `max: <n>` | non, optionnelle (défaut `255`) | `max: 255` |

- `valeur:` est le nombre affiché au départ — un entier positif ou nul, qui
  ne peut pas dépasser `max:`.
- `max:` fixe le nombre de colonnes de bits affichées (la plus petite
  puissance de 2 supérieure ou égale à `max` détermine le nombre de bits —
  ex. `max: 255` → 8 colonnes, `128 64 32 16 8 4 2 1`). Doit être un entier
  positif, au maximum 4095 (12 bits — au-delà, la grille devient illisible
  sur mobile).
- Une ligne vide ou commençant par `#` est ignorée (commentaire).
- Toute autre directive, ou une ligne sans `:`, est une erreur de syntaxe —
  un encadré ambre s'affiche à la place du bloc, avec un message explicite ;
  le reste de la leçon continue de s'afficher normalement.

## Interaction (côté élève ET dans l'aperçu admin)

- **Cases de bits** : une case cliquable par puissance de 2 (cible tactile
  44×44 px minimum), affichant 0 ou 1. Cliquer bascule ce bit et met à jour
  le nombre décimal en direct.
- **Champ décimal** : taper un nombre y met directement les cases à jour.
- **Curseur** : de 0 à la valeur maximale représentable (`max` arrondi à la
  puissance de 2 supérieure, ex. 255 pour 8 bits) — synchronisé en
  permanence avec les cases de bits et le champ décimal : les trois pilotent
  la même valeur, aucun état séparé à faire correspondre.
- **Décomposition** affichée en direct, ex. « 13 = 8 + 4 + 1 ».
- **Écriture binaire** affichée en direct, ex. « 1101₂ ».

Le curseur n'ajoute aucune directive : la syntaxe du bloc (`valeur:`, `max:`)
est inchangée, c'est un ajout d'interaction pur — tout bloc ```binaire
existant, ancien ou nouveau, l'affiche désormais automatiquement.

## HTML/SVG, SSR et hors-ligne

Composant HTML + React (état local pour le nombre courant), aucune API
navigateur requise pour le premier rendu — SSR-safe, pas de
`next/dynamic({ ssr: false })` nécessaire : `components/ConvertisseurBinaireBloc.tsx`
importe `ConvertisseurBinaire` directement.

Aucune dépendance ajoutée : uniquement du TypeScript/React maison
(`lib/binaire.ts` + le composant).

Hors-ligne : le bloc ```binaire vit dans le texte de la leçon, déjà stocké
intégralement par `lib/offlineStore.ts` lors du téléchargement — une leçon
téléchargée affiche donc son convertisseur hors-ligne sans rien de plus.
