import type { EtudeFonction } from "@/lib/etudeFonction";
import type { SimulationExercice } from "@/lib/simulations/types";
/**
 * Fonctions API pour l'espace élève (/api/eleve/...). La classe (niveau +
 * série) de l'élève est déterminée côté backend à partir du JWT — jamais
 * passée en paramètre ici.
 */

import {
  apiRequest,
  apiRequestMultipart,
  type NiveauInfo,
  type Role,
  type SerieInfo,
  type Statut,
} from "./api";

export interface MatiereInfo {
  id: number;
  nom: string;
}

// --- GET /api/eleve/mon-programme/ ---

export interface ProgrammeEleve {
  id: number;
  matiere: MatiereInfo;
  niveau: NiveauInfo;
  serie: SerieInfo | null;
  libelle: string;
  nb_lecons_publiees: number;
}

export function getMonProgramme(): Promise<ProgrammeEleve[]> {
  return apiRequest<ProgrammeEleve[]>("/api/eleve/mon-programme/");
}

// --- GET /api/eleve/programmes/{id}/ : arbre filtré ---

export interface NotionEleve {
  id: number;
  titre: string;
  ordre: number;
  a_lecon_publiee: boolean;
  lecon_id: number | null;
  /** null si a_lecon_publiee est false (rien à qualifier). */
  lecon_est_gratuite: boolean | null;
}

export interface ChapitreEleve {
  id: number;
  titre: string;
  ordre: number;
  notions: NotionEleve[];
}

export interface ThemeEleve {
  id: number;
  titre: string;
  volume_horaire: number | null;
  ordre: number;
  chapitres: ChapitreEleve[];
}

export interface ProgrammeDetailEleve {
  id: number;
  matiere: MatiereInfo;
  niveau: NiveauInfo;
  serie: SerieInfo | null;
  libelle: string;
  presentation: string;
  themes: ThemeEleve[];
}

export function getProgrammeEleve(id: number): Promise<ProgrammeDetailEleve> {
  return apiRequest<ProgrammeDetailEleve>(`/api/eleve/programmes/${id}/`);
}

// --- GET /api/eleve/lecons/{id}/ : contenu complet ---
// Préparé ici ; utilisé à partir de l'étape "lecture de leçon" (app/eleve/lecons/[id]/).

export interface NotionContexteEleve {
  id: number;
  titre: string;
  chapitre: { id: number; titre: string };
  theme: { id: number; titre: string };
  programme: { id: number; libelle: string };
}

export interface ExerciceEleve {
  id: number;
  enonce: string;
  corrige: string;
  difficulte: "facile" | "moyen" | "difficile";
  ordre: number;
}

export interface VideoEleve {
  titre: string;
  url: string;
  description: string;
  ordre: number;
}

export interface RessourceEleve {
  titre: string;
  url: string;
  ordre: number;
}

export interface LeconEleve {
  id: number;
  titre: string;
  notion: NotionContexteEleve;
  histoire: string;
  objectifs_pedagogiques: string;
  prerequis_texte: string;
  /** Tronqué aux ~500 premiers caractères si `verrouille` est true — jamais
   * le cours complet dans ce cas (voir LeconEleveSerializer côté backend). */
  cours_redige: string;
  demonstrations: string;
  a_retenir: string;
  sujet_examen: string;
  exercices: ExerciceEleve[];
  videos: VideoEleve[];
  ressources: RessourceEleve[];
  /** true = contenu premium non accessible à cet élève : seuls titre,
   * objectifs, histoire et un aperçu de cours_redige sont renseignés,
   * tout le reste ci-dessus est vide/vidé PAR LE SERVEUR (pas un simple
   * masquage d'affichage). */
  verrouille: boolean;
}

export function getLeconEleve(id: number): Promise<LeconEleve> {
  return apiRequest<LeconEleve>(`/api/eleve/lecons/${id}/`);
}

// --- GET /api/eleve/mes-lecons/ : liste plate des leçons publiées de SA classe ---
// Utilisé par le dashboard pour la section "Dernières leçons". Paginé côté
// backend (DEFAULT_PAGINATION_CLASS) — on ne lit que la 1re page, largement
// suffisante pour un aperçu de 2-3 leçons.

interface ReponsePaginee<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface NotionListeEleve {
  id: number;
  titre: string;
}

export interface LeconListeEleve {
  id: number;
  titre: string;
  notion: NotionListeEleve;
  chemin: string;
}

export async function getMesLecons(): Promise<LeconListeEleve[]> {
  const page = await apiRequest<ReponsePaginee<LeconListeEleve>>("/api/eleve/mes-lecons/");
  return page.results;
}

// --- GET /api/eleve/glossaire/{slug}/ : un terme, pour la modale de définition ---
// Chargé à la demande (au clic sur un [[slug]] dans une leçon), pas préchargé
// en lot — voir components/eleve/ModaleTerme.tsx pour le choix et le cache.

export interface LeconLieeGlossaire {
  id: number;
  titre: string;
}

export interface TermeGlossaireEleve {
  terme: string;
  slug: string;
  definition: string;
  exemple: string;
  /** Exposé par le backend seulement si la leçon est publiée ET de la classe
   * de l'élève — null sinon (leçon en brouillon, autre classe, ou pas de lien). */
  lecon_liee: LeconLieeGlossaire | null;
}

export function getTermeGlossaire(slug: string): Promise<TermeGlossaireEleve> {
  return apiRequest<TermeGlossaireEleve>(`/api/eleve/glossaire/${slug}/`);
}

// --- GET/PATCH /api/eleve/profil/ : profil enrichi de l'élève connecté ---

export type GenreEleve = "F" | "M" | "autre";

export interface ProfilEleve {
  id: number;
  telephone: string;
  email: string | null;
  prenom: string;
  nom: string;
  role: Role;
  statut: Statut;
  niveau: string | null;
  serie: string | null;
  date_inscription: string;
  date_naissance: string | null;
  ecole: string | null;
  ville: string | null;
  genre: GenreEleve | null;
  photo_url: string | null;
}

export function getProfilEleve(): Promise<ProfilEleve> {
  return apiRequest<ProfilEleve>("/api/eleve/profil/");
}

export interface MajProfilEleveInput {
  date_naissance: string;
  ecole: string;
  ville: string;
  genre: GenreEleve | "";
  /** undefined = photo inchangée ; File = nouvelle photo à envoyer. */
  photo?: File;
}

/** PATCH /api/eleve/profil/ — multipart (voir apiRequestMultipart) : seul
 * moyen d'envoyer à la fois des champs texte et un fichier en un appel. */
export function majProfilEleve(payload: MajProfilEleveInput): Promise<ProfilEleve> {
  const formData = new FormData();
  formData.append("date_naissance", payload.date_naissance);
  formData.append("ecole", payload.ecole);
  formData.append("ville", payload.ville);
  formData.append("genre", payload.genre);
  if (payload.photo) formData.append("photo", payload.photo);

  return apiRequestMultipart<ProfilEleve>("/api/eleve/profil/", formData, "PATCH");
}

// --- POST /api/eleve/activer-carte/ : activation d'une carte Fahimta ---

export interface ActivationCarteReponse {
  message: string;
  /** Date ISO ("2026-10-25") de la nouvelle échéance d'abonnement. */
  abonnement_actif_jusqu_au: string;
}

/** Le backend accepte le code avec ou sans tirets/espaces, casse
 * indifférente — aucune normalisation nécessaire ici, elle est faite
 * côté serveur (voir comptes.cartes.normaliser_code). */
export function activerCarteFahimta(code: string): Promise<ActivationCarteReponse> {
  return apiRequest<ActivationCarteReponse>("/api/eleve/activer-carte/", {
    method: "POST",
    body: { code },
  });
}

// --- GET /api/eleve/mes-cartes/ : cartes reçues d'un vendeur ET/OU activées ---

export type StatutCarteRecue = "active" | "utilisee";

/** `code` EN CLAIR ici (contrairement à tous les endpoints admin/vendeur) :
 * c'est la carte de l'élève connecté, il a le droit de voir son propre code
 * pour l'activer (voir comptes.serializers.CarteRecueEleveSerializer).
 * `date_attribution` peut être null : une carte activée SANS être passée
 * par un vendeur (attribuee_a jamais renseigné) n'a pas de date d'attribution. */
export interface CarteRecueEleve {
  id: number;
  code: string;
  statut: StatutCarteRecue;
  duree_jours: number;
  date_attribution: string | null;
  date_activation: string | null;
}

export async function getMesCartes(): Promise<CarteRecueEleve[]> {
  const page = await apiRequest<ReponsePaginee<CarteRecueEleve>>("/api/eleve/mes-cartes/");
  return page.results;
}

// --- Paiement NITA : second moyen de créditer l'abonnement (avec les
// cartes Fahimta ci-dessus) — voir comptes.nita_views côté backend. ---

export interface PlanNita {
  id: string;
  label: string;
  montant: number;
  duree_jours: number;
}

/** Catalogue affiché côté front — un seul plan pour l'instant, MAIS le
 * backend (comptes.nita.PLANS_NITA) est déjà structuré pour en accueillir
 * d'autres (trimestriel, annuel…) sans changer la logique des endpoints,
 * seulement cette liste le jour venu. */
export const PLANS_NITA: readonly PlanNita[] = [
  { id: "mensuel", label: "Mensuel", montant: 2000, duree_jours: 30 },
];

export interface InitierNitaReponse {
  /** Référence à donner à l'élève — à saisir dans MYNITA ou au guichet. */
  reference: string;
  /** Identifiant de suivi Fahimta — à repasser tel quel à /nita/verifier/. */
  requestId: string;
}

/** Peut échouer (502) avec "Impossible de démarrer le paiement NITA..."
 * (ApiError.message) si NITA est injoignable — à afficher tel quel. */
export function initierPaiementNita(plan: string): Promise<InitierNitaReponse> {
  return apiRequest<InitierNitaReponse>("/api/eleve/nita/initier/", {
    method: "POST",
    body: { plan },
  });
}

export interface VerifierNitaReponse {
  confirme: boolean;
  message: string;
  /** Présent seulement si confirme === true. */
  abonnement_actif_jusqu_au?: string;
}

/** Ré-interroge activement NITA côté serveur (jamais un simple statut
 * local) et crédite l'abonnement si payé — idempotent, peut être rappelée
 * sans risque (utilisé à la fois par le polling automatique et le bouton
 * "Vérifier maintenant"). Peut échouer (502) si NITA est injoignable. */
export function verifierPaiementNita(requestId: string): Promise<VerifierNitaReponse> {
  return apiRequest<VerifierNitaReponse>("/api/eleve/nita/verifier/", {
    method: "POST",
    body: { requestId },
  });
}

// --- POST /api/eleve/resoudre/ : réception + validation d'un exercice déposé ---

export interface DepotExerciceInput {
  programme: number;
  mode: "correction" | "professeur";
  enonce: string;
  fichiers: File[];
  /** Demande la LECTURE de l'énoncé par l'IA (jamais sa résolution). Ignorée
   * par le serveur tant que la fonction n'y est pas activée. */
  analyser?: boolean;
  /** Remarque de l'élève sur une lecture précédente (« la question 2 parle de x³ »). */
  correction?: string;
}

export type ConfianceLecture = "haute" | "moyenne" | "faible";
export type MatiereLue = "mathematiques" | "physique" | "chimie" | "svt" | "autre" | "indeterminee";

/** Énoncé reconnu par l'IA — une LECTURE, pas une solution. */
export interface AnalyseEnonce {
  lisible: boolean;
  matiere: { valeur: MatiereLue; confiance: ConfianceLecture };
  niveau: { valeur: string | null; confiance: ConfianceLecture };
  enonce: string;
  donnees: { libelle: string; valeur: string }[];
  formules: string[];
  questions: { numero: string; texte: string; incertain: boolean }[];
  figures: { description: string; page: number | null; exploitable: boolean }[];
  tableaux: { description: string; page: number | null; contenu: string | null }[];
  parties_incertaines: { page: number | null; extrait: string | null; probleme: string }[];
  remarques: string[];
  concordance_programme: "concorde" | "differente" | "indeterminee";
}

/** Réponse 200 : l'exercice est VALIDE, mais (voir `enregistre` / `traite`) ni
 * conservé ni résolu — ne jamais l'afficher comme tel. */
export interface DepotExerciceReponse {
  valide: boolean;
  enregistre: boolean;
  traite: boolean;
  analyse_disponible?: boolean;
  correction_disponible?: boolean;
  professeur_disponible?: boolean;
  analysee?: boolean;
  analyse?: AnalyseEnonce | null;
  analyse_depuis_cache?: boolean;
  message: string;
  recapitulatif: {
    programme: { id: number; matiere: string; libelle: string };
    mode: "correction" | "professeur";
    nb_fichiers: number;
    fichiers: { nom: string; type: string; taille: number }[];
    enonce_caracteres: number;
  };
}

/** multipart/form-data : `programme`, `mode`, `enonce`, puis chaque fichier
 * sous la même clé répétée `fichiers`. Aucun Content-Type posé à la main (le
 * navigateur ajoute le boundary — voir apiRequestMultipart). */
export function deposerExercice(payload: DepotExerciceInput): Promise<DepotExerciceReponse> {
  const formData = new FormData();
  formData.append("programme", String(payload.programme));
  formData.append("mode", payload.mode);
  formData.append("enonce", payload.enonce);
  if (payload.analyser) formData.append("analyser", "true");
  if (payload.correction) formData.append("correction", payload.correction);
  for (const fichier of payload.fichiers) formData.append("fichiers", fichier);

  return apiRequestMultipart<DepotExerciceReponse>("/api/eleve/resoudre/", formData, "POST");
}

// --- POST /api/eleve/correction/ : correction complète (maths, pilote) ---

export type StatutVerification = "contradiction" | "calculs_verifies" | "partiellement_verifiee" | "non_verifiee";
export type StatutControle = "verifie" | "contradiction" | "non_verifie";
export type StatutQuestion = "verifiee" | "partiellement_verifiee" | "non_verifiee" | "contradiction";

export interface ControleCorrection {
  id: string;
  type: string;
  description: string;
  statut: StatutControle;
  /** true : une méthode confirme, l'autre contredit. */
  desaccord_methodes: boolean;
  methodes: { nom: string; statut: "ok" | "contradiction" | "indisponible"; detail: string }[];
}

/** Concordance entre la réponse RÉDIGÉE et le résultat CALCULÉ indépendamment à partir de l'énoncé (étape 9.1.1).
 * Distincte du « calcul vérifié » (contrôles SymPy / Wolfram) et indépendante de toute simulation. */
export type StatutConcordance = "verifiee" | "non_verifiee" | "contradiction";

export interface ConcordanceCorrection {
  statut: StatutConcordance;
  grandeur: string;
  /** Résultat calculé par le moteur (null s'il n'a pas pu être calculé de façon fiable). */
  attendu: string | null;
  /** Réponse rédigée telle qu'elle a été lue (null si elle n'a pas pu être interprétée). */
  annonce: string | null;
  detail: string;
  methodes: string[];
}

export interface QuestionCorrection {
  numero: string;
  enonce: string;
  etapes: { titre: string; explication: string; calcul: string }[];
  resultat: string;
  incertitudes: string[];
  statut: StatutQuestion;
  controles: ControleCorrection[];
  /** Tableau et courbe calculés par le serveur (SymPy) ; absent si la question ne traite ni variations ni extrema. */
  etude_fonction?: EtudeFonction | null;
  /** Concordance réponse rédigée / résultat calculé ; absent si la question n'est pas d'un type pris en charge. */
  concordance?: ConcordanceCorrection | null;
  /** Simulations interactives (développement local uniquement, étape 9.1) ; absent ou vide : correction seule. */
  simulations?: SimulationExercice[];
}

/** Correction structurée. `statut` ne vaut JAMAIS « démonstration vérifiée » : au mieux
 * « calculs_verifies » (seuls les calculs déclarés ont été recalculés). */
export interface CorrectionComplete {
  statut: StatutVerification;
  libelle_statut: string;
  resume_verification: { controles: number; verifies: number; contradictions: number; non_verifies: number; requetes_wolfram: number };
  donnees: { libelle: string; valeur: string }[];
  formules: string[];
  questions: QuestionCorrection[];
  conclusion: string;
  avertissements: string[];
}

export interface CorrectionReponse {
  correction: CorrectionComplete;
  correction_depuis_cache: boolean;
}

/** Envoie l'énoncé CONFIRMÉ (texte) : les documents ne sont pas relus. */
export function demanderCorrection(programme: number, analyse: AnalyseEnonce): Promise<CorrectionReponse> {
  return apiRequest<CorrectionReponse>("/api/eleve/correction/", { method: "POST", body: { programme, analyse } });
}

// --- Professeur particulier IA (étape 7) : séance gérée côté serveur ---

export type VerificationMessage = "verifiee" | "non_verifiable" | "incertaine" | "illisible";

export interface MessageProfesseur {
  id: number;
  role: "prof" | "eleve";
  texte: string;
  type: string;
  verification: VerificationMessage | null;
  niveau: number | null;
}

/** État PUBLIC d'une séance : jamais le plan ni la réponse attendue. Le client ne
 * renvoie que `version` + son action ; l'historique reste côté serveur. */
export interface SeanceProfesseur {
  seance: string;
  version: number;
  expire_a: number | null;
  termine: boolean;
  etape_terminee: boolean;
  /** Courbe et tableau de la séance : fournis SEULEMENT une fois l'exercice terminé (ils donneraient les réponses). */
  etudes?: { question: string; etude: EtudeFonction }[];
  /** Simulations GeoGebra des questions TERMINÉES seulement, en version réduite (étape 9.2) : jamais la réponse d'une question non dévoilée. */
  simulations?: { question: string; simulation: SimulationExercice }[];
  progression: {
    question: number;
    nb_questions: number;
    etape: number;
    nb_etapes_question: number;
    etapes_terminees: number;
    nb_etapes_total: number;
    pourcentage: number;
  };
  question: { numero: string; enonce: string; objectif: string };
  etape: {
    consigne: string;
    indices_donnes: number;
    indices_max: number;
    tentatives: number;
    solution_disponible: boolean;
    conditions_solution: string;
    verifiable: boolean;
  };
  actions: { repondre: boolean; indice: boolean; explication: boolean; solution: boolean; suivante: boolean };
  messages: MessageProfesseur[];
  echanges_restants: number;
}

export interface SeanceReponse {
  seance: SeanceProfesseur;
  reprise?: boolean;
  meta_dev?: { tokens_entree: number; tokens_sortie: number; appels_ia: number };
}

export type TypeDemandeExplication = "incomprehension" | "autre_explication" | "exemple" | "pourquoi" | "question";

const BASE_PROFESSEUR = "/api/eleve/professeur/seances/";

export function demarrerSeanceProfesseur(programme: number, analyse: AnalyseEnonce): Promise<SeanceReponse> {
  return apiRequest<SeanceReponse>(BASE_PROFESSEUR, { method: "POST", body: { programme, analyse } });
}

function actionSeance(id: string, action: string, corps: Record<string, unknown>): Promise<SeanceReponse> {
  return apiRequest<SeanceReponse>(`${BASE_PROFESSEUR}${encodeURIComponent(id)}/${action}/`, { method: "POST", body: corps });
}

export const envoyerReponseProfesseur = (id: string, version: number, texte: string) =>
  actionSeance(id, "reponse", { version, texte });
export const demanderIndiceProfesseur = (id: string, version: number) => actionSeance(id, "indice", { version });
export const demanderExplicationProfesseur = (id: string, version: number, type: TypeDemandeExplication, texte = "") =>
  actionSeance(id, "explication", { version, type, texte });
export const voirSolutionProfesseur = (id: string, version: number) => actionSeance(id, "solution", { version });
export const etapeSuivanteProfesseur = (id: string, version: number) => actionSeance(id, "suivante", { version });
