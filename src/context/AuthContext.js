

import { createContext, useState, useEffect } from "react";
import API from "../api";



export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);

  // ✅ Fonction pour récupérer les vraies infos du user
  const refreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await API.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
      console.log("🔄 User actualisé :", res.data); // ✅ log de vérification
    } catch (err) {
      console.error("Erreur lors du rafraîchissement du user :", err);
    }
  };

  // ✅ Appeler automatiquement au chargement si token présent
  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token]);



  const login = (token, userData) => {
  localStorage.setItem("token", token);
  setToken(token);
  setUser(userData); // stocker les vraies infos tout de suite
};


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
