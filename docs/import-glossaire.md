# Import en masse du glossaire

Script : `scripts/importer-glossaire.mjs` (logique pure testée : `lib/glossaireImport.ts`).
Il passe par l'API admin existante `/api/admin/glossaire/` : mêmes droits (`IsAdminRole`), mêmes validations,
slug généré par le serveur (`TermeGlossaire._slug_unique`). Aucun accès direct à la base, aucun PATCH/PUT/DELETE.

## Utilisation

```
node scripts/importer-glossaire.mjs fahimta_glossaire_chimie.json                # validation seule, hors ligne
node scripts/importer-glossaire.mjs fahimta_glossaire_chimie.json --inventaire   # compare à la base (lecture seule)
FAHIMTA_CONFIRM_IMPORT=OUI node scripts/importer-glossaire.mjs fichier.json --apply   # importation réelle
```

Variables : `FAHIMTA_API_URL`, puis `FAHIMTA_ACCESS_TOKEN` ou `FAHIMTA_TELEPHONE` + `FAHIMTA_PASSWORD` (compte admin).
Option `--lecon-id N` ou `--lecon-titre "titre exact"` : associe les NOUVEAUX termes à une leçon (`lecon_liee`).
Les termes existants ne sont jamais modifiés ; les différences de contenu sont seulement signalées.

## Écrire les termes dans un cours

Le motif `[[…]]` n'accepte qu'un slug (`a-z`, `0-9`, `-`) avec texte affiché optionnel :
`[[autoprotolyse-de-leau|autoprotolyse de l'eau]]`. L'apostrophe est supprimée par `slugify` (`l'eau` → `leau`).
Pas de gestion des pluriels : `[[ion]]` et `[[ions]]` sont deux slugs distincts.
Le rapport du script affiche le marqueur exact de chaque terme.
