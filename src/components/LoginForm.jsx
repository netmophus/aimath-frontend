
import React, { useState, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import fahimtaImg from "../assets/logonoire.jpg";

const LoginForm = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));



  const handleLogin = async (e) => {
  e.preventDefault();
  setMessage("");

  try {

     const formatPhone = (input) => {
  const digits = input.replace(/\D/g, "");
  return digits.startsWith("227") ? `+${digits}` : `+227${digits}`;
};

const formattedPhone = formatPhone(phone);



  const res = await API.post("/auth/login", { phone: formattedPhone, password });

    const { token, role, isSubscribed } = res.data;

   

    localStorage.setItem("token", token);
    login(token, res.data);
    setMessage("✅ Connexion réussie !");

    setTimeout(() => {
      if (role === "admin") {
        navigate("/admin-dashboard");
      } else if (role === "eleve") {
        navigate(isSubscribed ? "/premium" : "/gratuit");
      } else {
        navigate("/");
      }
    }, 1000);
  } catch (err) {
    setMessage(err.response?.data?.message || "❌ Erreur de connexion.");
  }
};

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 128px)", // sous navbar + footer
        backgroundColor: "#D27C19",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "6fr 4fr" },
          margin: 0, // ✅ Empêche tout margin externe
    padding: 0, // ✅ Pas de padding inutile
      }}
    >
      {/* Partie gauche */}
      <Box
        sx={{
          px: 4,
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          marginTop:10
        }}
      >
        <img
          src={fahimtaImg}
          alt="Logo Fahimta"
          style={{ width: 200, height: "auto", marginTop:10, marginBottom: 16 }}
        />
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#fff">
           Votre assistant intelligent en Mathématiques
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={300} color="#fff">
         Une plateforme conçue pour les élèves et étudiants.
Résolvez vos exercices, comprenez vos leçons et progressez efficacement avec l’aide de l’intelligence artificielle.
        </Typography>
      </Box>

      {/* Partie droite - formulaire */}
      <Box
        sx={{
          px: 2,
          py: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#263238",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
          <Typography variant="h5" fontWeight="bold" align="center" gutterBottom>
            🔐 Connexion
          </Typography>

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Téléphone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
            />
            <Button fullWidth variant="contained" type="submit" sx={{ mt: 2 }}>
              Se connecter
            </Button>
            {message && (
              <Typography color="secondary" sx={{ mt: 2 }} align="center">
                {message}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginForm;
