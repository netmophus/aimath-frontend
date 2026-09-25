"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  fetchMe,
  login as apiLogin,
  tokenStorage,
  type LoginResponse,
  type MeResponse,
  type Role,
  type Statut,
} from "./api";

const USER_CACHE_KEY = "fahimta_user_cache";

/** Dernière identité connue, pour la réhydratation hors-ligne (voir
 * rehydrater ci-dessous) — jamais utilisée pour une décision de sécurité
 * (l'API reste seule garante des droits via le JWT), seulement pour ne pas
 * déconnecter visuellement un élève dont le profil n'a pas pu être
 * reconfirmé faute de réseau. */
function cacherUser(user: AuthUser): void {
  try {
    window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  } catch {
    // Stockage indisponible (quota, navigation privée) : tant pis, juste un
    // confort hors-ligne en moins, jamais bloquant.
  }
}

function lireUserEnCache(): AuthUser | null {
  try {
    const brut = window.localStorage.getItem(USER_CACHE_KEY);
    return brut ? (JSON.parse(brut) as AuthUser) : null;
  } catch {
    return null;
  }
}

export interface AuthUser {
  telephone: string;
  prenom: string;
  nom: string;
  role: Role;
  statut: Statut;
  /** Pertinent surtout pour un élève. Simples noms (pas d'id : jamais utilisés
   * pour filtrer une requête côté client, la classe vient du JWT côté API). */
  niveau: string | null;
  serie: string | null;
  /** Absent juste après un login frais (LoginResponse ne le porte pas) —
   * seulement connu à partir de la prochaine réhydratation via /me/. */
  photoUrl: string | null;
  /** Sert uniquement à des indications visuelles côté client (ex. cadenas
   * sur les cours premium dans une liste, voir NotionRow.tsx) — jamais le
   * verrou réel, qui est TOUJOURS recalculé côté serveur à chaque requête
   * (voir programme.acces.eleve_peut_acceder). Comme photoUrl ci-dessus,
   * `false` par défaut juste après un login frais (LoginResponse ne le
   * porte pas non plus) : se corrige à la prochaine réhydratation via /me/. */
  aUnAbonnementActif: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** true tant que la réhydratation initiale (lecture du jeton + /me/) n'est pas terminée. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (telephone: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  /** Met à jour localement l'identité en cache (ex. photoUrl après un
   * enregistrement de profil réussi) sans réappeler /me/ — pour que l'avatar
   * de l'en-tête reflète le changement immédiatement, dans la même session,
   * sans attendre un rechargement de page. */
  updateUser: (changements: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function meToUser(me: MeResponse): AuthUser {
  return {
    telephone: me.telephone,
    prenom: me.prenom,
    nom: me.nom,
    role: me.role,
    statut: me.statut,
    niveau: me.niveau,
    serie: me.serie,
    photoUrl: me.photo_url,
    aUnAbonnementActif: me.a_un_abonnement_actif,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Réhydratation au montage : si un jeton existe déjà (session précédente),
  // on récupère le profil courant plutôt que de partir d'un état déconnecté.
  useEffect(() => {
    let actif = true;

    async function rehydrater() {
      if (!tokenStorage.getAccess()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        const utilisateur = meToUser(me);
        if (actif) setUser(utilisateur);
        cacherUser(utilisateur);
      } catch (error) {
        // Backend injoignable — hors-ligne, ou (voir app/api/[...chemin]/
        // route.ts) un relais qui répond lui-même en 500 quand IL ne peut
        // pas joindre Django — ne doit JAMAIS déconnecter l'élève : ses
        // jetons restent valides, seul le profil n'a pas pu être reconfirmé,
        // on retombe sur la dernière identité connue en cache (nécessaire
        // pour la lecture hors-ligne des leçons téléchargées, COUCHE 2 du
        // PWA). Seul un vrai 401 (jeton invalide/expiré ET refresh
        // lui-même en échec, voir apiRequest) signifie une session
        // réellement terminée et efface la session.
        if (error instanceof ApiError && error.status === 401) {
          tokenStorage.clear();
          if (actif) setUser(null);
        } else if (actif) {
          setUser(lireUserEnCache());
        }
      } finally {
        if (actif) setIsLoading(false);
      }
    }

    rehydrater();
    return () => {
      actif = false;
    };
  }, []);

  const login = useCallback(async (telephone: string, password: string) => {
    const data = await apiLogin(telephone, password);
    tokenStorage.set(data.access, data.refresh);
    const utilisateur: AuthUser = {
      telephone,
      prenom: data.prenom,
      nom: data.nom,
      role: data.role,
      statut: data.statut,
      niveau: data.niveau?.nom ?? null,
      serie: data.serie?.nom ?? null,
      // LoginResponse ne porte pas la photo (voir AuthUser.photoUrl) —
      // connue dès la prochaine réhydratation (rechargement de page, /me/).
      photoUrl: null,
      // Idem pour l'abonnement (voir AuthUser.aUnAbonnementActif) : purement
      // cosmétique, sans conséquence sur le verrou réel (server-side).
      aUnAbonnementActif: false,
    };
    setUser(utilisateur);
    cacherUser(utilisateur);
    return data;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    try {
      window.localStorage.removeItem(USER_CACHE_KEY);
    } catch {
      // Sans conséquence : le prochain login réécrit ce cache de toute façon.
    }
    setUser(null);
  }, []);

  const updateUser = useCallback((changements: Partial<AuthUser>) => {
    setUser((actuel) => {
      if (!actuel) return actuel;
      const suivant = { ...actuel, ...changements };
      cacherUser(suivant);
      return suivant;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: user !== null, login, logout, updateUser }),
    [user, isLoading, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth() doit être appelé à l'intérieur d'un <AuthProvider>.");
  }
  return context;
}
