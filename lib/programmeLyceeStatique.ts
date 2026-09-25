/**
 * Données STATIQUES du programme du lycée — miroir de
 * lib/programmeCollegeStatique.ts, avec un niveau de navigation
 * supplémentaire (la SÉRIE) : niveau → série → matière → thèmes/chapitres.
 *
 * CE QUI EST RÉEL vs PLACEHOLDER : tout est PROGRAMME_PLACEHOLDER pour
 * l'instant — le vrai contenu (thèmes, chapitres, volumes horaires) sera
 * intégré dans un second temps, niveau par niveau/série par série, comme
 * cela a été fait pour le collège.
 *
 * Séries par niveau (programme nigérien réel, à respecter strictement) :
 * Seconde → A, C uniquement (PAS de D) ; Première et Terminale → A, C, D.
 * Aucune série E ni G.
 */

export type NiveauLyceeId = "seconde" | "premiere" | "terminale";
export type SerieLyceeId = "a" | "c" | "d";
export type MatiereLyceeId = "mathematiques" | "physique" | "chimie" | "svt";

export interface NiveauLycee {
  id: NiveauLyceeId;
  nom: string;
}

export interface SerieLycee {
  id: SerieLyceeId;
  nom: string;
}

export interface MatiereLycee {
  id: MatiereLyceeId;
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
  /** false = contenu réel ; true = placeholder générique en attendant les
   * vraies données (le cas de toutes les combinaisons niveau/série/matière
   * du lycée pour l'instant). */
  estPlaceholder: boolean;
  themes: readonly ThemeStatique[];
}

export const NIVEAUX_LYCEE: readonly NiveauLycee[] = [
  { id: "seconde", nom: "Seconde" },
  { id: "premiere", nom: "Première" },
  { id: "terminale", nom: "Terminale" },
];

/** Séries disponibles PAR NIVEAU — pas une liste plate : la Seconde n'a que
 * A et C, contrairement à Première/Terminale qui ont aussi D. */
export const SERIES_PAR_NIVEAU: Record<NiveauLyceeId, readonly SerieLycee[]> = {
  seconde: [
    { id: "a", nom: "A" },
    { id: "c", nom: "C" },
  ],
  premiere: [
    { id: "a", nom: "A" },
    { id: "c", nom: "C" },
    { id: "d", nom: "D" },
  ],
  terminale: [
    { id: "a", nom: "A" },
    { id: "c", nom: "C" },
    { id: "d", nom: "D" },
  ],
};

export const MATIERES_LYCEE: readonly MatiereLycee[] = [
  { id: "mathematiques", nom: "Mathématiques" },
  { id: "physique", nom: "Physique" },
  { id: "chimie", nom: "Chimie" },
  { id: "svt", nom: "SVT" },
];

/** PLACEHOLDER — même objet réutilisé partout (jamais muté, lecture
 * seule), en attendant le vrai contenu de chaque combinaison. */
const PROGRAMME_PLACEHOLDER: ProgrammeMatiereStatique = {
  estPlaceholder: true,
  themes: [],
};

function programmesPlaceholderPourMatieres(): Record<MatiereLyceeId, ProgrammeMatiereStatique> {
  return {
    mathematiques: PROGRAMME_PLACEHOLDER,
    physique: PROGRAMME_PLACEHOLDER,
    chimie: PROGRAMME_PLACEHOLDER,
    svt: PROGRAMME_PLACEHOLDER,
  };
}

/**
 * Pour chaque série de chaque niveau, un jeu de 4 matières placeholder —
 * y compris pour les séries D de Seconde (qui n'existent pas et ne sont
 * jamais liées depuis l'UI, voir SERIES_PAR_NIVEAU) : Record<SerieLyceeId, ...>
 * exige TOUTES les clés en TypeScript, cette entrée reste donc simplement
 * inaccessible depuis la navigation (trouverSerieLycee la rejette).
 */
const PROGRAMMES_PAR_NIVEAU: Record<
  NiveauLyceeId,
  Record<SerieLyceeId, Record<MatiereLyceeId, ProgrammeMatiereStatique>>
> = {
  seconde: {
    a: programmesPlaceholderPourMatieres(),
    c: programmesPlaceholderPourMatieres(),
    d: programmesPlaceholderPourMatieres(),
  },
  premiere: {
    a: programmesPlaceholderPourMatieres(),
    c: programmesPlaceholderPourMatieres(),
    d: programmesPlaceholderPourMatieres(),
  },
  terminale: {
    a: programmesPlaceholderPourMatieres(),
    c: programmesPlaceholderPourMatieres(),
    d: programmesPlaceholderPourMatieres(),
  },
};

export function trouverNiveauLycee(id: string): NiveauLycee | undefined {
  return NIVEAUX_LYCEE.find((niveau) => niveau.id === id);
}

/** La série doit exister ET appartenir au niveau donné (ex. "d" n'est
 * jamais valide pour "seconde") — d'où niveauId en paramètre plutôt qu'une
 * recherche dans une liste plate de séries. */
export function trouverSerieLycee(niveauId: NiveauLyceeId, serieId: string): SerieLycee | undefined {
  return SERIES_PAR_NIVEAU[niveauId].find((serie) => serie.id === serieId);
}

export function trouverMatiereLycee(id: string): MatiereLycee | undefined {
  return MATIERES_LYCEE.find((matiere) => matiere.id === id);
}

export function obtenirProgrammeLycee(
  niveauId: NiveauLyceeId,
  serieId: SerieLyceeId,
  matiereId: MatiereLyceeId
): ProgrammeMatiereStatique {
  return PROGRAMMES_PAR_NIVEAU[niveauId][serieId][matiereId];
}
