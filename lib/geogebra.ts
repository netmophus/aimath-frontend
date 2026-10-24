/**
 * Chargement de GeoGebra (prototype privé 8B.1 — licence commerciale en cours d'acquisition, aucune exposition
 * aux élèves tant qu'elle n'est pas confirmée par écrit).
 *
 * Règles de sécurité de ce module :
 * - `deployggb.js` n'est téléchargé que sur demande (`chargerGeogebra`), jamais à l'import ni au rendu serveur ;
 * - UN seul chargement du script, partagé par tous les composants (promesse mémorisée) ;
 * - le script tiers ne reçoit AUCUNE donnée de l'utilisateur : pas de cookie ni de jeton (script anonyme),
 *   `referrerPolicy: no-referrer` pour ne pas lui transmettre l'adresse de la page ;
 * - les commandes GeoGebra sont des constantes écrites ici : jamais de texte venant d'un élève ou d'une IA.
 */

export const URL_DEPLOYGGB = "https://www.geogebra.org/apps/deployggb.js";
export const DELAI_CHARGEMENT_MS = 20000;

/** Sous-ensemble de l'API JavaScript de GeoGebra utilisé par FAHIMTANA. */
export interface GgbApi {
  evalCommand(commande: string): boolean;
  setValue(objet: string, valeur: number): void;
  getValue(objet: string): number;
  setCoordSystem(xmin: number, xmax: number, ymin: number, ymax: number): void;
  setFixed(objet: string, fixe: boolean, selectionPossible: boolean): void;
  setVisible(objet: string, visible: boolean): void;
  setPerspective(perspective: string): void;
  remove(): void;
}

export interface GgbParametres {
  appName: string;
  width: number;
  height: number;
  appletOnLoad: (api: GgbApi) => void;
  [option: string]: unknown;
}

export interface GgbApplet {
  inject(idConteneur: string): void;
}

declare global {
  interface Window {
    GGBApplet?: new (parametres: GgbParametres, html5NoWebSimple?: boolean) => GgbApplet;
  }
}

let chargementEnCours: Promise<void> | null = null;

/** Charge `deployggb.js` (une seule fois). Rejette si le réseau est coupé, si le script est bloqué ou après le délai. */
export function chargerGeogebra(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("GeoGebra ne se charge que dans le navigateur."));
  if (window.GGBApplet) return Promise.resolve();
  if (chargementEnCours) return chargementEnCours;

  chargementEnCours = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = URL_DEPLOYGGB;
    script.async = true;
    script.referrerPolicy = "no-referrer";
    const minuterie = window.setTimeout(() => echec(new Error("Délai de chargement dépassé.")), DELAI_CHARGEMENT_MS);

    function echec(erreur: Error) {
      window.clearTimeout(minuterie);
      script.remove(); // permet une nouvelle tentative propre
      chargementEnCours = null;
      reject(erreur);
    }
    script.onload = () => {
      window.clearTimeout(minuterie);
      if (window.GGBApplet) resolve();
      else echec(new Error("Le script GeoGebra n'a pas fourni GGBApplet."));
    };
    script.onerror = () => echec(new Error("Le script GeoGebra est inaccessible."));
    document.head.appendChild(script);
  });
  return chargementEnCours;
}

// --- Simulation « x³ − 3ax » ------------------------------------------------------------------------------

export const CUBIQUE = {
  aMin: -3,
  aMax: 3,
  pas: 0.1,
  aInitial: 1,
  /** Fenêtre fixe : contient les extrema (±√a ; ∓2a√a, au plus ≈ 10,4 en valeur absolue) pour tout a de −3 à 3. */
  fenetre: { xmin: -4, xmax: 4, ymin: -12, ymax: 12 },
} as const;

/** Commandes prédéfinies (aucune entrée externe n'y est insérée). */
export const COMMANDES_CUBIQUE = ["a = 1", "f(x) = x^3 - 3 * a * x", "ShowLabel(f, false)"] as const;

/** Ramène une valeur de curseur au pas de 0,1 dans [−3 ; 3] (évite 0,30000000000000004). */
export function normaliserA(valeur: number): number {
  if (!Number.isFinite(valeur)) return CUBIQUE.aInitial;
  const borne = Math.min(CUBIQUE.aMax, Math.max(CUBIQUE.aMin, valeur));
  return Math.round(borne * 10) / 10;
}

export function formaterA(valeur: number): string {
  return normaliserA(valeur).toFixed(1).replace(".", ",").replace("-", "−");
}
