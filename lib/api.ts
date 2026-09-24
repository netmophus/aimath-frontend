/**
 * Client HTTP typé pour l'API backend FAHIMTA (Django + JWT).
 *
 * Stockage des jetons : localStorage (clés ci-dessous). C'est le choix le
 * plus simple pour ce socle — des cookies httpOnly seraient plus sûrs
 * (protection XSS) mais demandent de la plomberie côté serveur Next.js/
 * Django (endpoint de set-cookie, CSRF, middleware). On garde localStorage
 * pour l'instant et on durcira plus tard si besoin.
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001"
).replace(/\/$/, "");

const ACCESS_TOKEN_KEY = "fahimta_access_token";
const REFRESH_TOKEN_KEY = "fahimta_refresh_token";

export const tokenStorage = {
  getAccess(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  set(access: string, refresh: string): void {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  setAccess(access: string): void {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  },
  clear(): void {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

/** Erreur levée pour toute réponse HTTP non-2xx, avec le statut et le corps bruts. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Cherche récursivement le premier message exploitable dans un corps
 * d'erreur DRF. Nécessaire car la forme varie : simple {"detail": "..."},
 * validation de champ {"champ": ["message"]}, ou une structure imbriquée
 * pour les listes d'items (ex. écriture d'une leçon avec ses exercices :
 * {"videos": {"0": {"url": ["Ce champ ne peut être vide."]}}}).
 */
function extractErrorMessage(data: unknown): string | null {
  if (typeof data === "string") return data;

  if (Array.isArray(data)) {
    for (const item of data) {
      const trouve = extractErrorMessage(item);
      if (trouve) return trouve;
    }
    return null;
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    if (typeof record.detail === "string") return record.detail;
    if (typeof record.message === "string") return record.message;

    for (const value of Object.values(record)) {
      const trouve = extractErrorMessage(value);
      if (trouve) return trouve;
    }
  }

  return null;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Ajoute le header Authorization: Bearer si un jeton existe. Défaut true. */
  auth?: boolean;
}

async function rawRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const access = tokenStorage.getAccess();
    if (access) headers.Authorization = `Bearer ${access}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = extractErrorMessage(data) ?? "Une erreur est survenue.";
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

let refreshPromise: Promise<string> | null = null;

/** Rafraîchit le jeton d'accès ; dédoublonne les appels concurrents. */
async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = tokenStorage.getRefresh();
    if (!refresh) {
      throw new ApiError(401, "Session expirée.", null);
    }

    const data = await rawRequest<{ access: string }>("/api/auth/refresh/", {
      method: "POST",
      body: { refresh },
      auth: false,
    });
    tokenStorage.setAccess(data.access);
    return data.access;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/**
 * Requête authentifiée avec retry automatique : si l'access token est
 * expiré (401), tente un refresh puis rejoue la requête une fois. Si le
 * refresh échoue, efface les jetons et propage l'erreur (à charge de
 * l'appelant, ex. useAuth, de déconnecter l'utilisateur).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    const shouldRetry = error instanceof ApiError && error.status === 401 && options.auth !== false;
    if (!shouldRetry) throw error;

    try {
      await refreshAccessToken();
    } catch {
      tokenStorage.clear();
      throw error;
    }
    return rawRequest<T>(path, options);
  }
}

/**
 * Variante multipart/form-data de rawRequest (upload de fichier, ex. photo
 * de profil) : pas de Content-Type fixé à la main, le navigateur pose
 * lui-même l'en-tête avec le bon "boundary" — le définir ici l'aurait cassé.
 */
async function rawRequestMultipart<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" | "PUT" = "PATCH"
): Promise<T> {
  const headers: Record<string, string> = {};
  const access = tokenStorage.getAccess();
  if (access) headers.Authorization = `Bearer ${access}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: formData });

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = extractErrorMessage(data) ?? "Une erreur est survenue.";
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

/** Équivalent multipart de apiRequest : même retry automatique sur un access token expiré. */
export async function apiRequestMultipart<T>(
  path: string,
  formData: FormData,
  method: "POST" | "PATCH" | "PUT" = "PATCH"
): Promise<T> {
  try {
    return await rawRequestMultipart<T>(path, formData, method);
  } catch (error) {
    const shouldRetry = error instanceof ApiError && error.status === 401;
    if (!shouldRetry) throw error;

    try {
      await refreshAccessToken();
    } catch {
      tokenStorage.clear();
      throw error;
    }
    return rawRequestMultipart<T>(path, formData, method);
  }
}

// --- Types du domaine ---

export type Role = "eleve" | "enseignant" | "admin" | "partenaire";
export type Statut = "en_attente" | "actif" | "rejete" | "suspendu";

export interface NiveauInfo {
  id: number;
  nom: string;
}

export interface SerieInfo {
  id: number;
  nom: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  role: Role;
  prenom: string;
  nom: string;
  statut: Statut;
  niveau: NiveauInfo | null;
  serie: SerieInfo | null;
}

export interface MeResponse {
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
  photo_url: string | null;
}

// --- Cascade Cycle → Niveau → Série (formulaire d'inscription, public) ---

export interface ClasseNiveau {
  id: number;
  nom: string;
  series: SerieInfo[];
}

export interface ClasseCycle {
  id: number;
  nom: string;
  niveaux: ClasseNiveau[];
}

// --- Inscription élève (formulaire /register, public) ---

export interface InscriptionInput {
  prenom: string;
  nom: string;
  telephone: string;
  email?: string;
  password: string;
  password2: string;
  /** ID de Niveau (PK entière — voir getClasses()). */
  niveau: number;
  /** ID de Serie — omis si le niveau choisi n'a pas de série. */
  serie?: number;
}

export interface InscriptionUtilisateur {
  prenom: string;
  nom: string;
  telephone: string;
  classe: string | null;
  statut: Statut;
}

export interface InscriptionResponse {
  message: string;
  utilisateur: InscriptionUtilisateur;
}

// --- Endpoints ---

export function login(telephone: string, password: string): Promise<LoginResponse> {
  return rawRequest<LoginResponse>("/api/auth/login/", {
    method: "POST",
    body: { telephone, password },
    auth: false,
  });
}

export function fetchMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>("/api/auth/me/");
}

/** GET /api/auth/classes/ — hiérarchie Cycle→Niveau→Série, publique (aucune
 * authentification requise : sert le formulaire d'inscription lui-même). */
export function getClasses(): Promise<ClasseCycle[]> {
  return rawRequest<ClasseCycle[]>("/api/auth/classes/", { auth: false });
}

/** POST /api/auth/register/ — inscription élève, compte en_attente. Public. */
export function inscrireEleve(payload: InscriptionInput): Promise<InscriptionResponse> {
  return rawRequest<InscriptionResponse>("/api/auth/register/", {
    method: "POST",
    body: payload,
    auth: false,
  });
}
