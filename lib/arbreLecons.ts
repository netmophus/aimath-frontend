/**
 * Construction et filtrage, côté client, de l'arbre Matière → Programme →
 * Thème → Chapitre → Notion utilisé par la page admin des leçons
 * (app/admin/lecons/page.tsx).
 *
 * Composition côté client plutôt qu'un nouvel endpoint backend : le nombre
 * de programmes est petit (quelques unités) et listerToutesLecons() suit la
 * pagination — au total, une poignée de requêtes (1 listerProgrammes + 1
 * getProgramme par programme + 1-2 pages de leçons), jamais des dizaines.
 * Pur, sans effet de bord, testable indépendamment du rendu React.
 */

import type { LeconListe, LeconStatut } from "./leconApi";
import type { ProgrammeDetail } from "./programmeApi";

export interface NotionArbre {
  id: number;
  titre: string;
  ordre: number;
  /** null = aucune leçon rédigée pour cette notion ("notion vide"). */
  lecon: LeconListe | null;
}

export interface ChapitreArbre {
  id: number;
  titre: string;
  ordre: number;
  notions: NotionArbre[];
  /** Totaux de la TOTALITÉ du sous-arbre (jamais recalculés au filtrage : un
   * filtre ne fait que masquer des branches, il ne change pas la vraie
   * progression affichée). */
  nbNotions: number;
  nbLecons: number;
  nbLeconsPubliees: number;
}

export interface ThemeArbre {
  id: number;
  titre: string;
  ordre: number;
  volumeHoraire: number | null;
  chapitres: ChapitreArbre[];
  nbNotions: number;
  nbLecons: number;
  nbLeconsPubliees: number;
}

export interface ProgrammeArbre {
  id: number;
  libelle: string;
  themes: ThemeArbre[];
  nbNotions: number;
  nbLecons: number;
  nbLeconsPubliees: number;
}

export interface MatiereArbre {
  nom: string;
  programmes: ProgrammeArbre[];
  nbNotions: number;
  nbLecons: number;
  nbLeconsPubliees: number;
}

function compterLecons(notions: NotionArbre[]): { nbNotions: number; nbLecons: number; nbLeconsPubliees: number } {
  return {
    nbNotions: notions.length,
    nbLecons: notions.filter((n) => n.lecon !== null).length,
    nbLeconsPubliees: notions.filter((n) => n.lecon?.statut === "publie").length,
  };
}

function sommerCompteurs(items: { nbNotions: number; nbLecons: number; nbLeconsPubliees: number }[]) {
  return items.reduce(
    (acc, it) => ({
      nbNotions: acc.nbNotions + it.nbNotions,
      nbLecons: acc.nbLecons + it.nbLecons,
      nbLeconsPubliees: acc.nbLeconsPubliees + it.nbLeconsPubliees,
    }),
    { nbNotions: 0, nbLecons: 0, nbLeconsPubliees: 0 }
  );
}

/**
 * Assemble l'arbre complet à partir des détails de chaque programme (déjà
 * triés par ordre côté backend — Theme/Chapitre/Notion ont `ordering =
 * ['ordre']` en Meta — mais on trie explicitement ici aussi, par robustesse
 * et pour documenter l'exigence) et de la liste complète des leçons
 * (n'importe quel ordre, indexée par id de notion).
 */
export function construireArbre(programmesDetail: ProgrammeDetail[], toutesLecons: LeconListe[]): MatiereArbre[] {
  const leconParNotionId = new Map(toutesLecons.map((l) => [l.notion.id, l]));
  const parMatiere = new Map<string, ProgrammeArbre[]>();

  for (const detail of [...programmesDetail].sort((a, b) => a.libelle.localeCompare(b.libelle, "fr"))) {
    const themes: ThemeArbre[] = [...detail.themes]
      .sort((a, b) => a.ordre - b.ordre)
      .map((theme) => {
        const chapitres: ChapitreArbre[] = [...theme.chapitres]
          .sort((a, b) => a.ordre - b.ordre)
          .map((chapitre) => {
            const notions: NotionArbre[] = [...chapitre.notions]
              .sort((a, b) => a.ordre - b.ordre)
              .map((notion) => ({
                id: notion.id,
                titre: notion.titre,
                ordre: notion.ordre,
                lecon: leconParNotionId.get(notion.id) ?? null,
              }));
            return { id: chapitre.id, titre: chapitre.titre, ordre: chapitre.ordre, notions, ...compterLecons(notions) };
          });
        return {
          id: theme.id,
          titre: theme.titre,
          ordre: theme.ordre,
          volumeHoraire: theme.volume_horaire,
          chapitres,
          ...sommerCompteurs(chapitres),
        };
      });

    const programme: ProgrammeArbre = {
      id: detail.id,
      libelle: detail.libelle,
      themes,
      ...sommerCompteurs(themes),
    };

    const nomMatiere = detail.matiere.nom;
    const liste = parMatiere.get(nomMatiere) ?? [];
    liste.push(programme);
    parMatiere.set(nomMatiere, liste);
  }

  return Array.from(parMatiere.entries())
    .sort(([a], [b]) => a.localeCompare(b, "fr"))
    .map(([nom, programmes]) => ({ nom, programmes, ...sommerCompteurs(programmes) }));
}

export interface FiltresArbreLecons {
  statut: LeconStatut | "";
  programmeId: string; // "" = tous les programmes
  recherche: string; // déjà trimé ; "" = pas de recherche texte
}

export function filtreArbreActif(f: FiltresArbreLecons): boolean {
  return Boolean(f.statut || f.programmeId || f.recherche);
}

function notionCorrespond(notion: NotionArbre, f: FiltresArbreLecons, termeRecherche: string): boolean {
  if (f.statut && notion.lecon?.statut !== f.statut) return false;
  if (termeRecherche) {
    const matchLecon = notion.lecon ? notion.lecon.titre.toLowerCase().includes(termeRecherche) : false;
    const matchNotion = notion.titre.toLowerCase().includes(termeRecherche);
    if (!matchLecon && !matchNotion) return false;
  }
  return true;
}

/**
 * Restreint l'arbre aux branches correspondant aux filtres actifs (statut,
 * programme, recherche texte sur le titre de la notion OU de sa leçon) — ne
 * touche jamais aux compteurs (nbNotions/nbLecons restent ceux du sous-arbre
 * COMPLET, pas de la vue filtrée : la progression affichée reste honnête).
 * Sans aucun filtre actif, renvoie l'arbre tel quel (aucune copie).
 */
export function filtrerArbre(arbre: MatiereArbre[], f: FiltresArbreLecons): MatiereArbre[] {
  if (!filtreArbreActif(f)) return arbre;
  const termeRecherche = f.recherche.trim().toLowerCase();

  const resultat: MatiereArbre[] = [];
  for (const matiere of arbre) {
    const programmes: ProgrammeArbre[] = [];
    for (const programme of matiere.programmes) {
      if (f.programmeId && String(programme.id) !== f.programmeId) continue;

      const themes: ThemeArbre[] = [];
      for (const theme of programme.themes) {
        const chapitres: ChapitreArbre[] = [];
        for (const chapitre of theme.chapitres) {
          const notions = chapitre.notions.filter((n) => notionCorrespond(n, f, termeRecherche));
          if (notions.length > 0) chapitres.push({ ...chapitre, notions });
        }
        if (chapitres.length > 0) themes.push({ ...theme, chapitres });
      }
      if (themes.length > 0) programmes.push({ ...programme, themes });
    }
    if (programmes.length > 0) resultat.push({ ...matiere, programmes });
  }
  return resultat;
}

/**
 * Clés ("matiere-Physique", "programme-3", "theme-12", "chapitre-45") de
 * toutes les branches survivant à un arbre déjà filtré — utilisées pour les
 * déplier automatiquement (un filtre actif sans rien à dérouler ne sert à
 * rien). Fusionnées avec les clés dépliées manuellement par l'utilisateur,
 * jamais à la place.
 */
export function collecterClesADeplier(arbreFiltre: MatiereArbre[]): Set<string> {
  const cles = new Set<string>();
  for (const matiere of arbreFiltre) {
    cles.add(`matiere-${matiere.nom}`);
    for (const programme of matiere.programmes) {
      cles.add(`programme-${programme.id}`);
      for (const theme of programme.themes) {
        cles.add(`theme-${theme.id}`);
        for (const chapitre of theme.chapitres) {
          cles.add(`chapitre-${chapitre.id}`);
        }
      }
    }
  }
  return cles;
}

/**
 * Remplace, IMMUABLEMENT, les champs de la leçon `leconId` par `patch`
 * partout où elle apparaît dans l'arbre (une seule fois en pratique — une
 * notion a au plus une leçon) — pour la mise à jour optimiste de la bascule
 * gratuit/premium (voir NotionLigne.tsx) : pas de refetch réseau, l'UI
 * change instantanément, avec un rollback trivial (même fonction, patch
 * inverse) si l'appel API échoue ensuite.
 */
export function remplacerLeconDansArbre(
  arbre: MatiereArbre[],
  leconId: number,
  patch: Partial<LeconListe>
): MatiereArbre[] {
  return arbre.map((matiere) => ({
    ...matiere,
    programmes: matiere.programmes.map((programme) => ({
      ...programme,
      themes: programme.themes.map((theme) => ({
        ...theme,
        chapitres: theme.chapitres.map((chapitre) => ({
          ...chapitre,
          notions: chapitre.notions.map((notion) =>
            notion.lecon && notion.lecon.id === leconId
              ? { ...notion, lecon: { ...notion.lecon, ...patch } }
              : notion
          ),
        })),
      })),
    })),
  }));
}

/** "5/7 leçons" (+ " (3 publiées)" si au moins une leçon publiée). */
export function formaterProgres(nbLecons: number, nbNotions: number, nbLeconsPubliees: number): string {
  const base = `${nbLecons}/${nbNotions} leçon${nbNotions > 1 ? "s" : ""}`;
  return nbLeconsPubliees > 0 ? `${base} (${nbLeconsPubliees} publiée${nbLeconsPubliees > 1 ? "s" : ""})` : base;
}
