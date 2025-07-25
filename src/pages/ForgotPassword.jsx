import React, { useState } from "react";
import { Box, TextField, Typography, Button, Paper } from "@mui/material";
import PageLayout from "../components/PageLayout";
import API from "../api";
import { useNavigate } from "react-router-dom"; // ➕ ajoute ça en haut
import { InputAdornment } from "@mui/material"; // ➕ à ajouter en haut



const ForgotPassword = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
const navigate = useNavigate(); // ➕ ajoute ça dans ton composant

const handleSendCode = async (e) => {
  e.preventDefault();
  setMessage("");

  try {
    await API.post("/auth/send-reset-code", { phone });
    setMessage("✅ Code envoyé par SMS !");

    // ✅ Redirection automatique après 2 secondes
    setTimeout(() => {
      navigate("/reset-password", { state: { phone } });
    }, 2000);

  } catch (err) {
    setMessage(err.response?.data?.message || "❌ Erreur lors de l'envoi.");
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
            Entrez votre numéro de téléphone pour recevoir un code par SMS.
          </Typography>

          <form onSubmit={handleSendCode}>
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              Envoyer le code
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
