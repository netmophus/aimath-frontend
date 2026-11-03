import { ApiError, apiRequest } from "@/lib/api";

/**
 * Traitements IA longs : le serveur répond 202 `{ tache: { id, statut } }` au lieu de faire attendre la requête
 * (le routeur Heroku coupe à 30 s). On consulte ensuite `/api/eleve/taches/<id>/` jusqu'au résultat, qui reprend
 * EXACTEMENT le statut HTTP et le corps de la réponse synchrone : les erreurs (429, 503...) arrivent donc comme avant,
 * sous forme d'ApiError. Jamais d'attente infinie : délai maximal, nombre d'échecs réseau consécutifs borné.
 */

export interface TacheAcceptee {
  tache: { id: string; statut: string };
}

interface EtatTache {
  id: string;
  statut: "en_attente" | "en_cours" | "terminee" | "echouee" | "expiree";
  http?: number | null;
  corps?: unknown;
}

export interface OptionsAttente {
  /** Pauses successives entre deux consultations ; la dernière se répète. */
  intervallesMs?: number[];
  /** Au-delà, l'attente est abandonnée (DOMException TimeoutError). */
  delaiMaxMs?: number;
  /** Échecs réseau consécutifs tolérés avant d'abandonner. */
  echecsTolerables?: number;
  signal?: AbortSignal;
  /** Délai d'affichage avant de marquer le résultat comme consulté (0 : immédiat). */
  delaiVueMs?: number;
  /** Injectables pour les tests. */
  lire?: (id: string) => Promise<EtatTache>;
  attendre?: (ms: number) => Promise<void>;
  maintenant?: () => number;
}

export interface TacheListee extends EtatTache {
  type: string;
  cree_le: string;
  programme?: number | string | null;
}

const CLE_VUES = "fahimta:taches-vues";

function lireVues(): string[] {
  try {
    return JSON.parse(localStorage.getItem(CLE_VUES) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Mémorise (dans ce navigateur seulement) qu'un résultat a déjà été présenté : on ne le ressort pas à chaque visite. */
export function marquerTacheVue(id: string): void {
  try {
    localStorage.setItem(CLE_VUES, JSON.stringify([id, ...lireVues().filter((v) => v !== id)].slice(0, 30)));
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}

/** Un résultat n'est tenu pour « consulté » qu'après être resté affiché ce délai : un rechargement immédiat (service worker,
 * actualisation) le ressort au lieu de le perdre. */
export const DELAI_VUE_MS = 4000;

export function planifierVue(id: string, delaiMs: number = DELAI_VUE_MS): void {
  if (delaiMs <= 0) marquerTacheVue(id);
  else setTimeout(() => marquerTacheVue(id), delaiMs);
}

/** Vrai si ce résultat a déjà été présenté dans CE navigateur : on ne le ressort jamais deux fois automatiquement. */
export function tacheVue(id: string): boolean {
  return lireVues().includes(id);
}

export const MESSAGE_RESULTAT_EXPIRE = "Ton résultat a expiré (il reste disponible 2 heures). Relance l'analyse.";

export const INTERVALLES_PAR_DEFAUT_MS = [600, 900, 1200, 1500, 2000, 2500];
/** Un peu plus que le bail d'une tâche (reprise après interruption d'un worker). */
export const DELAI_MAX_ATTENTE_MS = 10 * 60_000;

export function estTacheAcceptee(valeur: unknown): valeur is TacheAcceptee {
  const t = (valeur as { tache?: { id?: unknown } } | null)?.tache;
  return typeof t === "object" && t !== null && typeof t.id === "string";
}

const pause = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Annulé", "AbortError"));
    const minuterie = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(minuterie);
        reject(new DOMException("Annulé", "AbortError"));
      },
      { once: true },
    );
  });

function messageDe(corps: unknown): string {
  const detail = (corps as { detail?: unknown } | null)?.detail;
  return typeof detail === "string" && detail.trim() ? detail : "Service temporairement indisponible. Réessaie plus tard.";
}

export async function attendreTache<T>(id: string, options: OptionsAttente = {}): Promise<T> {
  const intervalles = options.intervallesMs ?? INTERVALLES_PAR_DEFAUT_MS;
  const delaiMax = options.delaiMaxMs ?? DELAI_MAX_ATTENTE_MS;
  const toleres = options.echecsTolerables ?? 3;
  const lire = options.lire ?? ((tacheId: string) => apiRequest<EtatTache>(`/api/eleve/taches/${encodeURIComponent(tacheId)}/`));
  const attendre = options.attendre ?? ((ms: number) => pause(ms, options.signal));
  const maintenant = options.maintenant ?? Date.now;
  const debut = maintenant();

  let echecs = 0;
  for (let essai = 0; ; essai++) {
    if (options.signal?.aborted) throw new DOMException("Annulé", "AbortError");
    if (maintenant() - debut > delaiMax) throw new DOMException("Délai d'attente dépassé", "TimeoutError");
    try {
      const etat = await lire(id);
      echecs = 0;
      if (etat.statut === "expiree") {
        planifierVue(id, options.delaiVueMs);
        throw new ApiError(410, MESSAGE_RESULTAT_EXPIRE, { detail: MESSAGE_RESULTAT_EXPIRE, code: "resultat_expire" });
      }
      if (etat.statut === "terminee" || etat.statut === "echouee") {
        planifierVue(id, options.delaiVueMs);
        const http = etat.http ?? 500;
        if (http >= 400) throw new ApiError(http, messageDe(etat.corps), etat.corps);
        return etat.corps as T;
      }
    } catch (erreur) {
      // Une erreur de la TÂCHE (ApiError levée ci-dessus) ou une session expirée est définitive ; seul un échec
      // réseau passager est toléré, quelques fois de suite.
      if (erreur instanceof ApiError || erreur instanceof DOMException) throw erreur;
      echecs += 1;
      if (echecs > toleres) throw erreur;
    }
    await attendre(intervalles[Math.min(essai, intervalles.length - 1)]);
  }
}

/** Réponse synchrone inchangée, ou suivi de la tâche si le serveur en a créé une (202). */
export async function suivreSiTache<T>(reponse: T | TacheAcceptee, options?: OptionsAttente): Promise<T> {
  return estTacheAcceptee(reponse) ? attendreTache<T>(reponse.tache.id, options) : reponse;
}
