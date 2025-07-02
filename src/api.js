
import axios from "axios";

const API = axios.create({
  baseURL: "https://fahimtabackend-647bfe306335.herokuapp.com/api",
  // baseURL: "http://192.168.80.36:5000/api",
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

export default API;
