/** Simulation telle que la publie le serveur (voir programme/simulations/catalogue.py). Les paramètres sont NON FIABLES jusqu'à validation. */
export interface SimulationExercice {
  modele: string;
  version: number;
  titre: string;
  parametres: unknown;
  verification: { methodes: string[]; concordance_correction: "confirmee" | "non_verifiee" | "non_applicable" };
  avertissement: string;
}
