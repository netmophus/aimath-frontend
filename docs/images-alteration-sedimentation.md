# Images de la rubrique « Pourquoi cette notion ? » : leçon « Altération et sédimentation »

Champ concerné : `histoire` de la leçon (base de données ; id **31** en production, statut brouillon). Seule cette rubrique est visée.

## Rendu

`components/RenduMarkdown.tsx` rend `![texte alternatif](url "légende")` : image responsive (`max-w-full`, `h-auto`, `object-contain`, hauteur limitée à 70 vh), chargement différé, légende visible sous l'image. Aucune animation, aucun zoom, aucun carrousel.

## Images (dossier `public/images/svt/alteration-sedimentation/`)

Sources : Wikimedia Commons, licences relevées sur les fiches des fichiers.

| Fichier WebP | Photo d'origine | Licence | Auteur | Crédit dans la légende |
|---|---|---|---|---|
| `air-massif-rocheux.webp` (1280×960) | `File:Mont Bagzane.jpg` (massif de l'Aïr, Niger) | CC BY-SA 4.0 | Faride.boureima | oui |
| `granite-altere-arene.webp` (1280×842) | `File:Weathered Granite (GeoDIL number - 2883).jpg` | CC0 | Dexter Perkins | non requis |
| `evaporites-sel-gypse.webp` (330×238) | `File:Halite-Gypsum-216511.jpg` (halite et gypse sélénite, Inowrocław, Pologne) | CC BY-SA 3.0 | Robert M. Lavinsky | oui |

Conversion JPEG → WebP sans recadrage (CC BY-SA : une adaptation doit rester sous la même licence).
Les JPEG déposés (`1280px-…jpeg`, `330px-…jpeg`) sont conservés tels quels dans le dossier ; ils n'ont pas à être publiés (les supprimer avant le commit allège le déploiement d'environ 750 Ko).

### Réserves

- **Granite** : la photo montre un seul affleurement altéré, pas la comparaison côte à côte demandée. Fichier renommé `granite-altere-arene.webp` pour ne pas annoncer une comparaison absente ; la légende demandée reste exacte.
- **Sel et gypse** : une seule photo d'un spécimen portant les deux minéraux, et seulement 330 px de large (original Commons : 600×432). Une version plus grande est préférable.
- **Rivière : non intégrée.** `The River Niger 05` (CC BY-SA 4.0, Ebere Jude Ekemezie, Ajaokuta, Nigeria) est prise depuis un pont : les glissières couvrent près de la moitié de l'image, le fleuve n'occupe qu'une bande étroite et aucun dépôt de sable ou de graviers n'est vraiment visible. Photo à remplacer : `transport-sediments-riviere.webp` reste à fournir (rivière avec dépôts de sable et de graviers, de préférence sahélienne).

## Marqueurs prêts à insérer (une ligne vide avant et après)

Après « …bien avant que la géologie ne devienne une science rigoureuse. » :

```
![Plaine caillouteuse au pied du mont Bagzane, dans le massif de l'Aïr (Niger) : des blocs de roche sombres jonchent un sol rougeâtre, devant des reliefs rocheux.](/images/svt/alteration-sedimentation/air-massif-rocheux.webp "Les massifs rocheux sont progressivement transformés par les phénomènes d'altération. Photo : Faride.boureima, CC BY-SA 4.0, via Wikimedia Commons.")
```

Après « …donner naissance à un sédiment meuble. » :

```
![Affleurement de granite altéré, désagrégé en fragments et en grains, avec un canif rouge pour l'échelle.](/images/svt/alteration-sedimentation/granite-altere-arene.webp "Le granite compact peut progressivement se transformer en matériaux friables sous l'action de l'altération.")
```

Après « …une étendue d'eau salée. » :

```
![Spécimen de halite (sel gemme) et de gypse (sélénite) : amas de cristaux transparents à orangés.](/images/svt/alteration-sedimentation/evaporites-sel-gypse.webp "Le sel gemme et le gypse sont des roches évaporitiques formées par cristallisation de substances dissoutes. Photo : Robert M. Lavinsky, CC BY-SA 3.0, via Wikimedia Commons.")
```

Après « …son granite d'origine. » (à ajouter quand la photo existera) :

```
![Rivière présentant des dépôts de sable et de graviers sur ses berges et dans son lit.](/images/svt/alteration-sedimentation/transport-sediments-riviere.webp "L'eau transporte les particules et peut les déposer lorsque les conditions du courant changent.")
```

## Ordre de mise en ligne (rien n'est fait à ce jour)

1. Valider, committer et déployer le frontend (images + rendu d'image), servis par `fahimtafrontend`.
2. Seulement ensuite, insérer les marqueurs dans le champ `histoire` de la leçon via l'administration (sauvegarde préalable). Insérer avant le déploiement des images produirait des liens cassés.
