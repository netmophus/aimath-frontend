import React, { useState } from "react";
import { Box, TextField, Typography, Button, Paper, InputAdornment, CircularProgress } from "@mui/material";
import PageLayout from "../components/PageLayout";
import API from "../api";
import { useNavigate } from "react-router-dom";



const ForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetMethod, setResetMethod] = useState("phone"); // "phone" ou "email"
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation d'email simple
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (loading) return; // Éviter les doubles clics
    setMessage("");
    setEmailError(false);
    setLoading(true);

    // Vérifier qu'au moins un identifiant est fourni
    if (resetMethod === "phone") {
      if (!phone || phone.length !== 8) {
        setMessage("Veuillez entrer un numéro de téléphone valide (8 chiffres).");
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
    }

    try {
      const payload = resetMethod === "phone" ? { phone } : { email: email.toLowerCase().trim() };
      await API.post("/auth/send-reset-code", payload);
      
      setMessage(resetMethod === "phone" 
        ? "✅ Code envoyé par SMS !"
        : "✅ Code envoyé par email !");

      // ✅ Redirection automatique après 2 secondes
      setTimeout(() => {
        navigate("/reset-password", { 
          state: resetMethod === "phone" ? { phone } : { email: email.toLowerCase().trim() } 
        });
      }, 2000);

    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <PageLayout>
      <Box sx={{ maxWidth: 420, margin: "auto", mt: 15, mb: 8 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            🔑 Mot de passe oublié
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Choisissez votre méthode de réinitialisation pour recevoir un code.
          </Typography>

          {/* Sélecteur de méthode de réinitialisation */}
          <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
            <Button
              variant={resetMethod === "phone" ? "contained" : "outlined"}
              onClick={() => {
                setResetMethod("phone");
                setEmail("");
                setPhone("");
                setEmailError(false);
              }}
              sx={{
                flex: 1,
                backgroundColor: resetMethod === "phone" ? "#1976D2" : "transparent",
                color: resetMethod === "phone" ? "#fff" : "#1976D2",
                borderColor: "#1976D2",
              }}
            >
              📱 Téléphone
            </Button>
            <Button
              variant={resetMethod === "email" ? "contained" : "outlined"}
              onClick={() => {
                setResetMethod("email");
                setEmail("");
                setPhone("");
                setEmailError(false);
              }}
              sx={{
                flex: 1,
                backgroundColor: resetMethod === "email" ? "#1976D2" : "transparent",
                color: resetMethod === "email" ? "#fff" : "#1976D2",
                borderColor: "#1976D2",
              }}
            >
              ✉️ Email
            </Button>
          </Box>

          <form onSubmit={handleSendCode}>
            {resetMethod === "phone" ? (
              <TextField
                label="Téléphone"
                fullWidth
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 8) setPhone(value);
                }}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">+227</InputAdornment>,
                }}
              />
            ) : (
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                error={emailError}
                helperText={emailError ? "Entrez une adresse email valide." : ""}
                required
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start">✉️</InputAdornment>,
                }}
              />
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                  <CircularProgress size={20} thickness={5} sx={{ color: "#fff" }} />
                  Envoi en cours...
                </Box>
              ) : (
                "Envoyer le code"
              )}
            </Button>

            {message && (
              <Typography sx={{ mt: 2 }} color="secondary">
                {message}
              </Typography>
            )}
          </form>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default ForgotPassword;
