/**
 * Données STATIQUES du programme du collège, en dur ici pour valider le
 * parcours de navigation (/programme/college/[niveau]/[matiere]) avant de
 * brancher ces pages sur la vraie API (mêmes routes /api/... que l'espace
 * élève, une fois un endpoint public équivalent créé côté backend).
 *
 * CE QUI EST RÉEL vs PLACEHOLDER : seul le programme de Mathématiques 6e
 * (PROGRAMME_MATHS_6E) est un vrai contenu. Tout le reste (Physique/SVT 6e,
 * et les 3 matières de 5e/4e/3e) est PROGRAMME_PLACEHOLDER — un texte
 * générique "Programme bientôt disponible", juste pour que le parcours de
 * navigation reste cliquable partout sans lien mort.
 */

export type NiveauCollegeId = "6e" | "5e" | "4e" | "3e";
export type MatiereCollegeId = "mathematiques" | "physique" | "svt";

export interface NiveauCollege {
  id: NiveauCollegeId;
  nom: string;
}

export interface MatiereCollege {
  id: MatiereCollegeId;
  nom: string;
}

export interface ChapitreStatique {
  titre: string;
  description: string;
}

export interface ThemeStatique {
  titre: string;
  /** Volume horaire en heures. */
  volumeHoraire: number;
  chapitres: readonly ChapitreStatique[];
}

export interface ProgrammeMatiereStatique {
  /** false = contenu réel (seulement Maths 6e pour l'instant) ; true =
   * placeholder générique en attendant les vraies données. */
  estPlaceholder: boolean;
  themes: readonly ThemeStatique[];
}

export const NIVEAUX_COLLEGE: readonly NiveauCollege[] = [
  { id: "6e", nom: "6e" },
  { id: "5e", nom: "5e" },
  { id: "4e", nom: "4e" },
  { id: "3e", nom: "3e" },
];

export const MATIERES_COLLEGE: readonly MatiereCollege[] = [
  { id: "mathematiques", nom: "Mathématiques" },
  { id: "physique", nom: "Physique" },
  { id: "svt", nom: "SVT" },
];

const DESCRIPTION_PLACEHOLDER_CHAPITRE = "Contenus et objectifs du chapitre.";

/** RÉEL — fourni telle quelle par la personne à l'origine de cette tâche. */
const PROGRAMME_MATHS_6E: ProgrammeMatiereStatique = {
  estPlaceholder: false,
  themes: [
    {
      titre: "Configurations de l'espace",
      volumeHoraire: 11,
      chapitres: [
        { titre: "Cube et pavé droit", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Cylindre droit", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
      ],
    },
    {
      titre: "Configurations du plan",
      volumeHoraire: 55,
      chapitres: [
        { titre: "Droites dans le plan", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Segments", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Angles", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Triangles", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Cercles", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
      ],
    },
    {
      titre: "Applications du plan",
      volumeHoraire: 10,
      chapitres: [
        {
          titre: "Figures symétriques par rapport à une droite",
          description: DESCRIPTION_PLACEHOLDER_CHAPITRE,
        },
        {
          titre: "Figures symétriques par rapport à un point",
          description: DESCRIPTION_PLACEHOLDER_CHAPITRE,
        },
      ],
    },
    {
      titre: "Outil vectoriel — Géométrie analytique",
      volumeHoraire: 3,
      chapitres: [
        { titre: "Repérage d'un point sur une droite", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
      ],
    },
    {
      titre: "Organisation de calculs — Calculs numériques",
      volumeHoraire: 86,
      chapitres: [
        { titre: "Les entiers naturels", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Fractions", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Nombres décimaux arithmétiques", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Nombres décimaux relatifs", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
      ],
    },
    {
      titre: "Organisation des calculs — Calcul littéral",
      volumeHoraire: 7,
      chapitres: [
        { titre: "Organisation des calculs", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Initiation au calcul littéral", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
      ],
    },
    {
      titre: "Organisation des données",
      volumeHoraire: 10,
      chapitres: [
        { titre: "Situation de proportionnalité", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
        { titre: "Statistiques", description: DESCRIPTION_PLACEHOLDER_CHAPITRE },
      ],
    },
  ],
};

/** PLACEHOLDER — même objet réutilisé partout où le vrai contenu manque
 * encore (jamais muté, lecture seule). */
const PROGRAMME_PLACEHOLDER: ProgrammeMatiereStatique = {
  estPlaceholder: true,
  themes: [],
};

const PROGRAMMES_PAR_NIVEAU: Record<
  NiveauCollegeId,
  Record<MatiereCollegeId, ProgrammeMatiereStatique>
> = {
  "6e": {
    mathematiques: PROGRAMME_MATHS_6E,
    physique: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  },
  "5e": {
    mathematiques: PROGRAMME_PLACEHOLDER,
    physique: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  },
  "4e": {
    mathematiques: PROGRAMME_PLACEHOLDER,
    physique: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  },
  "3e": {
    mathematiques: PROGRAMME_PLACEHOLDER,
    physique: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  },
};

export function trouverNiveauCollege(id: string): NiveauCollege | undefined {
  return NIVEAUX_COLLEGE.find((niveau) => niveau.id === id);
}

export function trouverMatiereCollege(id: string): MatiereCollege | undefined {
  return MATIERES_COLLEGE.find((matiere) => matiere.id === id);
}

export function obtenirProgrammeCollege(
  niveauId: NiveauCollegeId,
  matiereId: MatiereCollegeId
): ProgrammeMatiereStatique {
  return PROGRAMMES_PAR_NIVEAU[niveauId][matiereId];
}
