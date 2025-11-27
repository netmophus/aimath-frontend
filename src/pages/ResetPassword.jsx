import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import API from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";

const ResetPassword = () => {
  const { state } = useLocation();
  const [phone, setPhone] = useState(
    state?.phone?.replace("+227", "") || ""
  );
  const [email, setEmail] = useState(state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const payload = {
        otp,
        newPassword,
        confirmPassword,
      };

      // Ajouter phone ou email selon ce qui est disponible
      if (phone) {
        payload.phone = `+227${phone.replace(/\D/g, "")}`;
      } else if (email) {
        payload.email = email.toLowerCase().trim();
      } else {
        setMessage("❌ Téléphone ou email requis.");
        return;
      }

      await API.post("/auth/reset-password", payload);
      setMessage("✅ Mot de passe modifié.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur.");
    }
  };

  return (
    <PageLayout>
      <Box sx={{ maxWidth: 420, margin: "auto", mt: 15, mb: 8 }}>
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h5" gutterBottom>
            🔄 Réinitialiser le mot de passe
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {phone 
              ? `Code envoyé à : +227${phone}`
              : email
              ? `Code envoyé à : ${email}`
              : "Entrez votre téléphone ou email et le code reçu"}
          </Typography>
          <form onSubmit={handleReset}>
            {phone ? (
              <TextField
                label="Téléphone"
                fullWidth
                required
                margin="normal"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 8) setPhone(value);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">+227</InputAdornment>
                  ),
                }}
              />
            ) : email ? (
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">✉️</InputAdornment>
                  ),
                }}
              />
            ) : (
              <>
                <TextField
                  label="Téléphone (optionnel)"
                  fullWidth
                  margin="normal"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 8) {
                      setPhone(value);
                      setEmail("");
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">+227</InputAdornment>
                    ),
                  }}
                />
                <Typography sx={{ textAlign: "center", my: 1 }}>OU</Typography>
                <TextField
                  label="Email (optionnel)"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (e.target.value) setPhone("");
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">✉️</InputAdornment>
                    ),
                  }}
                />
              </>
            )}
            <TextField
              label="Code OTP"
              fullWidth
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Nouveau mot de passe"
              type={showPassword ? "text" : "password"}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
              Réinitialiser
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

export default ResetPassword;
