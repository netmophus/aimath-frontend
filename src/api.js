
import axios from "axios";

const API = axios.create({
baseURL: "https://fahimtabackend-647bfe306335.herokuapp.com/api",
// baseURL: "http://192.168.80.65:5000/api",
//baseURL: "http://localhost:5000/api",  // ✅ Changé en localhost pour éviter les problèmes d'IP
// baseURL: "http://10.205.124.25:5000/api",
//baseURL: "http://192.168.80.129:5000/api",
//192.168.1.221 softlink
//192.168.80.36


  withCredentials: true, // facultatif ici si pas de cookies
});

// 👉 Intercepteur pour ajouter automatiquement le token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 👉 Intercepteur de réponse pour gérer les erreurs d'auth
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ Ne déconnecter QUE si :
    // 1. C'est une vraie erreur 401 (pas annulée par l'utilisateur)
    // 2. Ce n'est pas lors du login
    // 3. Ce n'est pas une requête annulée (navigation)
    if (
      error.response?.status === 401 && 
      error.config?.url !== '/auth/login' &&
      !error.config?.__isRetryRequest && // Éviter les boucles de retry
      error.code !== 'ERR_CANCELED' // ✅ Ne pas déconnecter si la requête est annulée
    ) {
      console.log("🚪 Token expiré, déconnexion automatique");
      localStorage.removeItem("token");
      
      // ✅ Éviter les déconnexions en boucle
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
