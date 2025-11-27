



// pages/LoginForm.jsx
import React, { useState, useContext } from "react";
import { TextField, Button, Typography, Box, Paper, InputAdornment, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../api";
import fahimtaImg from "../assets/logocc.png";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const LoginForm = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [provider] = useState(null);
  const [providerId] = useState(null);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("phone"); // "phone" ou "email"
  const [emailError, setEmailError] = useState(false);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const formattedPhone = phone ? `+227${phone}` : null;
  const GOOGLE_LOGIN_ENABLED = false;

  // Validation d'email simple
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const safeNavigateByRole = (u) => {
    switch (u.role) {
      case "admin":
        navigate("/admin-dashboard");
        break;
      case "partner":
        navigate("/partner/dashboard");
        break;
      case "teacher":
        navigate(u.profileCompleted ? "/teacher/dashboard" : "/teacher/profile");
        break;
      case "eleve":
      default:
        navigate(u.isSubscribed ? "/premium" : "/gratuit");
        break;
    }
  };

  const hydrateMe = async (baseUser) => {
    try {
      // ⚠️ nécessite que le token soit déjà appliqué par login() sur l'API client
      const me = await API.get("/auth/me");
      const merged = { ...baseUser, ...me.data };
      login(baseUser.token, merged); // réinjecte l’utilisateur enrichi (isSubscribed calculé serveur)
      return merged;
    } catch {
      // en cas d’échec du /me, on garde l’utilisateur de /login
      return baseUser;
    }
  };

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setMessage("");

  //   if (!formattedPhone || !password) {
  //     setMessage("Veuillez entrer un téléphone (+227) et un mot de passe valides.");
  //     return;
  //   }

  //   try {
  //     const { data: user } = await API.post("/auth/login", {
  //       phone: formattedPhone,
  //       email,
  //       password,
  //       provider,
  //       providerId,
  //     });

  //     // 1) Enregistre token + utilisateur de /login
  //     login(user.token, user);

  //     // 2) Rafraîchit via /auth/me (isSubscribed calculé dynamiquement)
  //     const enriched = await hydrateMe(user);

  //     setMessage("✅ Connexion réussie");
  //     safeNavigateByRole(enriched);
  //   } catch (err) {
  //     setMessage(err?.response?.data?.message || "❌ Erreur de connexion.");
  //   }
  // };

  const handleLogin = async (e) => {
  e.preventDefault();
  if (loading) return;            // évite les doubles clics
  setMessage("");
  setLoading(true);
  setEmailError(false);

  // Vérifier qu'au moins un identifiant est fourni
  if (loginMethod === "phone") {
    const formattedPhone = phone ? `+227${phone}` : null;
    if (!formattedPhone || !password) {
      setMessage("Veuillez entrer un téléphone (+227) et un mot de passe valides.");
      setLoading(false);
      return;
    }
  } else {
    if (!email || !validateEmail(email)) {
      setEmailError(true);
      setMessage("Veuillez entrer une adresse email valide.");
      setLoading(false);
      return;
    }
    if (!password) {
      setMessage("Veuillez entrer un mot de passe.");
      setLoading(false);
      return;
    }
  }

  try {
    const payload = {
      password,
      provider,
      providerId,
    };

    // Ajouter phone ou email selon la méthode choisie
    if (loginMethod === "phone") {
      payload.phone = phone ? `+227${phone}` : null;
    } else {
      payload.email = email.toLowerCase().trim();
    }

    const { data: user } = await API.post("/auth/login", payload);

    // 1) Token + utilisateur de /login
    login(user.token, user);

    // 2) Enrichir via /auth/me
    const enriched = await hydrateMe(user);
    setMessage("✅ Connexion réussie");
    safeNavigateByRole(enriched);
  } catch (err) {
    setMessage(err?.response?.data?.message || "❌ Erreur de connexion.");
  } finally {
    setLoading(false);
  }
};



  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const googleEmail = decoded.email;
      const googleProviderId = decoded.sub;

      const { data: user } = await API.post("/auth/login", {
        email: googleEmail,
        provider: "google",
        providerId: googleProviderId,
        fullName: decoded.name,
      });

      login(user.token, user);
      const enriched = await hydrateMe(user);

      setMessage("✅ Connexion Google réussie !");
      safeNavigateByRole(enriched);
    } catch (err) {
      setMessage(err?.response?.data?.message || "❌ Connexion Google échouée.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1.2fr" }, backgroundColor: "#fff9f0" }}>
      {/* Gauche */}
      <Box sx={{ backgroundColor: "#1976D2", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: 4, py: 6, textAlign: "center" }}>
        <img src={fahimtaImg} alt="Logo Fahimta" style={{ width: 150, marginBottom: 24, borderRadius: 12 }} />
        <Typography variant="h4" fontWeight="bold">Connexion</Typography>
        <Typography variant="body1" sx={{ mt: 2, maxWidth: 300 }}>
          Reprends ton apprentissage avec Fahimta, ton alliée mathématique.
        </Typography>
      </Box>

      {/* Droite */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: { xs: 3, sm: 6 }, marginTop: 8 }}>
        <Paper elevation={4} sx={{ borderRadius: 4, p: { xs: 3, sm: 4 }, width: "100%", maxWidth: 600, backgroundColor: "#ffffff" }}>
          
          {loading && (
            <Box sx={{ mb: 1, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={22} />
            </Box>
          )}

          
          <Typography variant="h5" textAlign="center" fontWeight="bold" sx={{ mb: 3, color: "#1976D2" }}>
            🔐 Connexion à ton espace
          </Typography>

          {/* Sélecteur de méthode de connexion */}
          <Box sx={{ mb: 2, display: "flex", gap: 1, justifyContent: "center" }}>
            <Button
              variant={loginMethod === "phone" ? "contained" : "outlined"}
              onClick={() => {
                setLoginMethod("phone");
                setEmail("");
                setPhone("");
                setEmailError(false);
              }}
              sx={{
                flex: 1,
                backgroundColor: loginMethod === "phone" ? "#1976D2" : "transparent",
                color: loginMethod === "phone" ? "#fff" : "#1976D2",
                borderColor: "#1976D2",
              }}
            >
              📱 Téléphone
            </Button>
            <Button
              variant={loginMethod === "email" ? "contained" : "outlined"}
              onClick={() => {
                setLoginMethod("email");
                setEmail("");
                setPhone("");
                setEmailError(false);
              }}
              sx={{
                flex: 1,
                backgroundColor: loginMethod === "email" ? "#1976D2" : "transparent",
                color: loginMethod === "email" ? "#fff" : "#1976D2",
                borderColor: "#1976D2",
              }}
            >
              ✉️ Email
            </Button>
          </Box>

          <Box component="form" onSubmit={handleLogin} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {loginMethod === "phone" ? (
              <TextField
                label="Téléphone"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 8) setPhone(value);
                }}
                InputProps={{ startAdornment: (<InputAdornment position="start">🇳🇪 +227</InputAdornment>) }}
                fullWidth
                sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
              />
            ) : (
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                error={emailError}
                helperText={emailError ? "Entrez une adresse email valide." : ""}
                fullWidth
                sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">✉️</InputAdornment>
                  ),
                }}
              />
            )}

            <TextField
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ flex: "1 1 100%" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ flex: "1 1 100%" }}>
              {/* <Button type="submit" variant="contained" fullWidth sx={{ mt: 2, py: 1.5, backgroundColor: "#FFB300", color: "#000", fontWeight: "bold", fontSize: "1rem", ":hover": { backgroundColor: "#FFA000" } }}>
                🔓 Se connecter
              </Button> */}

              <Button
  type="submit"
  variant="contained"
  fullWidth
  disabled={loading}
  sx={{
    mt: 2,
    py: 1.5,
    backgroundColor: "#FFB300",
    color: "#000",
    fontWeight: "bold",
    fontSize: "1rem",
    ":hover": { backgroundColor: "#FFA000" },
  }}
>
  {loading ? (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
      <CircularProgress size={20} thickness={5} sx={{ color: "#000" }} />
      Connexion en cours…
    </Box>
  ) : (
    "🔓 Se connecter"
  )}
</Button>


              <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                {GOOGLE_LOGIN_ENABLED ? (
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setMessage("❌ Connexion Google échouée.")} />
                ) : (
                  <Button variant="outlined" disabled sx={{ textTransform: "none" }}>
                    Connexion Google (désactivée)
                  </Button>
                )}
              </Box>

              {message && (
                <Typography color={message.startsWith("✅") ? "success.main" : "error"} textAlign="center" mt={2}>
                  {message}
                </Typography>
              )}

              <Typography variant="body2" sx={{ mt: 2, textAlign: "center", color: "#1976D2", cursor: "pointer" }} onClick={() => navigate("/forgot-password")}>
                🔁 Mot de passe oublié ?
              </Typography>

              <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
                Pas encore de compte ?{" "}
                <Box component="span" sx={{ color: "#1976D2", fontWeight: "bold", cursor: "pointer" }} onClick={() => navigate("/register")}>
                  Créer un compte
                </Box>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginForm;
