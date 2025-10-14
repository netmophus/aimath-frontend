
import { createContext, useState, useEffect } from "react";
import API from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  // ✅ Récupère les vraies infos du user sans écraser les champs existants
  const refreshUser = async () => {
    const stored = localStorage.getItem("token");
    if (!stored) return;
    try {
      const res = await API.get("/auth/me");
      // 🔁 MERGE (on n'écrase pas isSubscribed si /me ne le renvoie pas)
      setUser((prev) => ({ ...prev, ...res.data }));
      console.log("🔄 User actualisé :", res.data);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement du user :", err);
      // ❌ Ne pas déconnecter automatiquement sur erreur réseau
      // Le token peut être valide mais le serveur temporairement indisponible
    }
  };

  // ✅ Synchronise l’en-tête Authorization et hydrate au changement de token
  useEffect(() => {
    if (token) {
      API.defaults.headers.common.Authorization = `Bearer ${token}`;
      refreshUser();
    } else {
      delete API.defaults.headers.common.Authorization;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = (tk, userData) => {
    localStorage.setItem("token", tk);
    setToken(tk);
    setUser(userData);                                  // on stocke les infos immédiates de /login
    API.defaults.headers.common.Authorization = `Bearer ${tk}`;
    refreshUser();                                      // 🔁 hydrate tout de suite via /auth/me
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete API.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
