# Syntaxe du bloc ```horloge

Insère une horloge modulaire interactive dans n'importe quel champ Markdown
d'une leçon (cours, démonstrations, énoncés/corrigés d'exercices). Rendu en
SVG + React, 100 % hors-ligne, aucune image ni appel réseau — même modèle que
les tableaux de variations (`docs/syntaxe-variations.md`) et les courbes
(`docs/syntaxe-courbe.md`).

**Objectif pédagogique.** Matérialiser la congruence modulo n — « après n, on
revient à 0 », comme les heures d'une horloge (13 h ≡ 1 h [12]). L'élève entre
un nombre, l'aiguille tourne et s'arrête sur ce nombre réduit modulo n, avec
la congruence affichée en toutes lettres.

## Exemple

````
```horloge
modulo: 12
```
````

Dans l'éditeur admin, le bouton **« + Insérer une horloge modulaire »** (à
côté des boutons d'insertion existants, sur les sections Cours,
Démonstrations et les énoncés/corrigés d'exercices) insère cet exemple à la
position du curseur.

## Directives

| Directive | Répétable | Exemple |
|---|---|---|
| `modulo: <n>` | non, optionnelle (défaut `12`) | `modulo: 7` |
| `comparaison: <b>` | non, optionnelle (absente par défaut) | `comparaison: 5` |

- `modulo:` doit être un entier compris entre 2 et 60 (au-delà, les
  graduations du cadran se chevauchent visuellement).
- `comparaison:` doit être un entier (positif, négatif ou nul — sans autre
  borne). Absente : le bloc se comporte exactement comme avant (une seule
  aiguille) — voir « Rétrocompatibilité » plus bas.
- Une ligne vide ou commençant par `#` est ignorée (commentaire).
- Toute autre directive, ou une ligne sans `:`, est une erreur de syntaxe —
  un encadré ambre s'affiche à la place du bloc, avec un message explicite ;
  le reste de la leçon continue de s'afficher normalement.

## Interaction (côté élève ET dans l'aperçu admin)

- **Cadran** : n graduations numérotées 0 à n-1, disposées en cercle comme un
  cadran d'horloge (0 en haut, sens horaire). Cliquer/toucher une graduation y
  déplace directement l'aiguille.
- **`+1`** : avance d'un pas.
- **`+n` (un tour complet)** : avance exactement d'un tour — l'aiguille
  revient au même endroit, pour illustrer concrètement « un tour complet ne
  change rien à la position ».
- **Réinitialiser** : revient à 0.
- **Curseur** : fait varier le nombre courant en continu, sur une plage fixe
  autour de 0 (de `-2×modulo` à `6×modulo`) — synchronisé avec les boutons et
  le champ ci-dessous (les trois pilotent le même nombre).
- **Champ « Ajouter un nombre »** : l'élève entre un nombre quelconque (ex.
  25, sans limite contrairement au curseur) ; l'aiguille se positionne sur ce
  nombre réduit modulo n.
- Sous le cadran, la congruence courante s'affiche en notation charte (KaTeX)
  : `a \equiv b \pmod{n}` — ex. **25 ≡ 1 (mod 12)**.
- **« ▶ Animer le comptage »** : l'aiguille avance cran par cran depuis 0
  jusqu'au nombre courant (sens inverse si négatif), avec l'égalité dynamique
  `pas = q × modulo + r` affichée en KaTeX et un compteur de tours (nombre de
  fois où l'aiguille est passée par 0). À l'arrivée, le nombre de tours
  affiché est exactement le quotient q de la division euclidienne du nombre
  par le modulo. Bouton **Pause/Reprendre** pendant l'animation. Vitesse
  adaptée à la valeur (un grand nombre avance plus vite par cran) pour que
  l'animation reste courte dans tous les cas. Toute interaction manuelle
  (boutons, curseur, champ, clic sur une graduation) interrompt et efface
  l'animation en cours.
- **Deux aiguilles + verdict** (uniquement si `comparaison:` est présente) :
  une 2e aiguille fixe (fh-bleu, plus courte que la 1re) marque la position de
  `comparaison`. Un encadré affiche le verdict — `a ≡ b (mod n)` avec ✓ (vert)
  ou ✗ (rouge) — et sa justification : `n divise a − b = …` si congruents,
  les deux restes différents sinon. Recalculé en direct à chaque changement
  du nombre courant (la 1re aiguille) ; `comparaison` reste fixe.

### Exemple avec comparaison

````
```horloge
modulo: 9
comparaison: 5
```
````

En entrant 23 (23 = 2×9 + 5), le verdict affiche **23 ≡ 5 (mod 9) ✓** — les
deux nombres ont le même reste. En entrant par exemple 10 (reste 1), le
verdict passe à **10 ≢ 5 (mod 9) ✗**.

## Rétrocompatibilité

Un bloc ```horloge écrit avant l'introduction de `comparaison:` (donc sans
cette clé) s'affiche **exactement comme avant** : `HorlogeData.comparaison`
vaut `undefined`, et le composant ne rend ni 2e aiguille ni encadré de
verdict — la condition est un `data.comparaison !== undefined` explicite côté
composant, jamais une valeur par défaut implicite. Le curseur et le bouton
d'animation, en revanche, apparaissent désormais sur TOUT bloc ```horloge,
ancien ou nouveau — ce sont des ajouts d'interaction, pas de syntaxe, donc
rien à migrer dans le contenu existant.

## SVG, SSR et hors-ligne

Comme le tableau de variations, ce composant est du **SVG statique + React**
(état local pour la valeur courante) et `katex.renderToString` pour la
congruence affichée (fonction pure, sans DOM) — **aucune API navigateur**
n'est requise pour le premier rendu. SSR-safe, pas de
`next/dynamic({ ssr: false })` nécessaire : `components/HorlogeModulaireBloc.tsx`
importe `HorlogeModulaire` directement, comme `TableauVariationsBloc.tsx`.

Aucune dépendance ajoutée : `katex` est déjà utilisé par le Markdown existant.

Hors-ligne : le bloc ```horloge vit dans le texte de la leçon, déjà stocké
intégralement par `lib/offlineStore.ts` lors du téléchargement — une leçon
téléchargée affiche donc son horloge hors-ligne sans rien de plus.
