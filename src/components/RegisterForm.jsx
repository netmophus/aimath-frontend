
// RegisterForm.jsx
import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../api";
import fahimtaImg from "../assets/logocc.png";

import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";         // si pas déjà importé


const RegisterForm = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const [registrationMethod, setRegistrationMethod] = useState("phone"); // "phone" ou "email"
  const navigate = useNavigate();


  const [showPwd, setShowPwd] = useState(false);
const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Validation d'email simple
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setConfirmError(false);
    setPhoneError(false);
    setEmailError(false);

    // Vérifier qu'au moins un identifiant est fourni
    if (registrationMethod === "phone") {
      if (!phone || phone.length !== 8) {
        setPhoneError(true);
        setMessage("Veuillez entrer un numéro de téléphone valide (8 chiffres).");
        return;
      }
    } else {
      if (!email || !validateEmail(email)) {
        setEmailError(true);
        setMessage("Veuillez entrer une adresse email valide.");
        return;
      }
    }

    if (!password) {
      setMessage("Le mot de passe est requis.");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError(true);
      setMessage("Les deux mots de passe ne correspondent pas.");
      return;
    }

    try {
      const payload = {
        password,
        confirmPassword,
        fullName,
        schoolName,
        city,
      };

      // Ajouter phone ou email selon la méthode choisie
      if (registrationMethod === "phone") {
        payload.phone = `+227${phone}`;
      } else {
        payload.email = email.toLowerCase().trim();
      }

      const { data } = await API.post("/auth/register", payload);

      setMessage(data.message);
      setTimeout(() => {
        if (registrationMethod === "phone") {
          navigate("/verify", { state: { phone: `+227${phone}` } });
        } else {
          // Pour l'email, on peut aussi rediriger vers verify avec l'email
          navigate("/verify", { state: { email: email.toLowerCase().trim() } });
        }
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Erreur lors de l'inscription.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1.2fr" },
        backgroundColor: "#fff9f0",
      }}
    >
      {/* Colonne gauche */}
      <Box
        sx={{
          backgroundColor: "#1976D2",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
          py: 6,
          textAlign: "center",
        }}
      >
        <img
          src={fahimtaImg}
          alt="Fahimta Logo"
          style={{ width: 150, marginBottom: 24, borderRadius: 12 }}
        />
        <Typography variant="h4" fontWeight="bold">
          Les maths, c’est facile !
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, maxWidth: 300 }}>
          Rejoins des milliers d’élèves et d'étudiants qui apprennent avec Fahimta, ton alliée
          mathématique
        </Typography>
      </Box>

      {/* Formulaire */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          marginTop: 6,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            p: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: 600,
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h5"
            textAlign="center"
            fontWeight="bold"
            sx={{ mb: 3, color: "#1976D2" }}
          >
            Crée ton compte gratuitement
          </Typography>

          {/* Sélecteur de méthode d'inscription */}
          <Box sx={{ mb: 2, display: "flex", gap: 1, justifyContent: "center" }}>
            <Button
              variant={registrationMethod === "phone" ? "contained" : "outlined"}
              onClick={() => {
                setRegistrationMethod("phone");
                setEmail("");
                setPhone("");
                setEmailError(false);
                setPhoneError(false);
              }}
              sx={{
                flex: 1,
                backgroundColor: registrationMethod === "phone" ? "#1976D2" : "transparent",
                color: registrationMethod === "phone" ? "#fff" : "#1976D2",
                borderColor: "#1976D2",
              }}
            >
              📱 Téléphone
            </Button>
            <Button
              variant={registrationMethod === "email" ? "contained" : "outlined"}
              onClick={() => {
                setRegistrationMethod("email");
                setEmail("");
                setPhone("");
                setEmailError(false);
                setPhoneError(false);
              }}
              sx={{
                flex: 1,
                backgroundColor: registrationMethod === "email" ? "#1976D2" : "transparent",
                color: registrationMethod === "email" ? "#fff" : "#1976D2",
                borderColor: "#1976D2",
              }}
            >
              ✉️ Email
            </Button>
          </Box>

          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}
          >
            {registrationMethod === "phone" ? (
              <TextField
                label="Téléphone"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 8) {
                    setPhone(value);
                    setPhoneError(false);
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">🇳🇪 +227</InputAdornment>
                  ),
                }}
                required
                error={phoneError}
                helperText={phoneError ? "Entrez les 8 chiffres du numéro." : ""}
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
                required
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
  type={showPwd ? "text" : "password"}
  value={password}
  onChange={(e) => {
    setPassword(e.target.value);
    if (confirmPassword) {
      setConfirmError(e.target.value !== confirmPassword);
    }
  }}
  required
  fullWidth
  sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          onClick={() => setShowPwd((v) => !v)}
          onMouseDown={(e) => e.preventDefault()} // garde le focus
          edge="end"
        >
          {showPwd ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>


          <TextField
  label="Confirmer le mot de passe"
  type={showConfirmPwd ? "text" : "password"}
  value={confirmPassword}
  onChange={(e) => {
    setConfirmPassword(e.target.value);
    setConfirmError(password !== e.target.value);
  }}
  error={confirmError}
  helperText={confirmError ? "Les mots de passe ne correspondent pas." : ""}
  required
  fullWidth
  sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label={showConfirmPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          onClick={() => setShowConfirmPwd((v) => !v)}
          onMouseDown={(e) => e.preventDefault()}
          edge="end"
        >
          {showConfirmPwd ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>


            <TextField
              label="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              fullWidth
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
            />

            <TextField
              label="École"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              required
              fullWidth
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
            />

            <TextField
              label="Ville"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              fullWidth
              sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
            />

            <Box sx={{ flex: "1 1 100%" }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
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
                🚀 S'inscrire maintenant
              </Button>

              {message && (
                <Typography color="error" textAlign="center" mt={2}>
                  {message}
                </Typography>
              )}

              <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
                Tu as déjà un compte ?{" "}
                <Box
                  component="span"
                  sx={{ color: "#1976D2", fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => navigate("/login")}
                >
                  Se connecter
                </Box>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default RegisterForm;
