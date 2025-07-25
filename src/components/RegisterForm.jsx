
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

const RegisterForm = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    if (phone.length !== 8) {
      setPhoneError(true);
      return;
    }

    try {
      const response = await API.post("/auth/register", {
        phone: `+227${phone}`,
        email,
        password,
        fullName,
        schoolName,
        city,
      });

      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/verify", { state: { phone } });
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
      {/* 🎓 Partie gauche colorée */}
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
          Rejoins des milliers d’élèves et d'étudiants qui apprennent avec Fahimta, ton alliée mathématique 
        </Typography>
      </Box>

      {/* 📄 Partie droite formulaire */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
          marginTop:6,
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

       <Box component="form" onSubmit={handleRegister} sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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
      startAdornment: <InputAdornment position="start">🇳🇪 +227</InputAdornment>,
    }}
    required
    error={phoneError}
    helperText={phoneError ? "Entrez les 8 chiffres du numéro." : ""}
    fullWidth
    sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
  />

  <TextField
    label="Email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    fullWidth
    sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
  />

  <TextField
    label="Mot de passe"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    fullWidth
    sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
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
        ":hover": {
          backgroundColor: "#FFA000",
        },
      }}
    >
      🚀 S'inscrire maintenant
    </Button>

    {message && (
      <Typography color="error" textAlign="center" mt={2}>
        {message}
      </Typography>
    )}


    {message && (
  <Typography color="error" textAlign="center" mt={2}>
    {message}
  </Typography>
)}

<Typography
  variant="body2"
  sx={{ mt: 2, textAlign: "center" }}
>
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
