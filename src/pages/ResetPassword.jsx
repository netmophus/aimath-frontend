import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Paper,
  InputAdornment,
} from "@mui/material";
import API from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";

const ResetPassword = () => {
  const { state } = useLocation();
  const [phone, setPhone] = useState(
    state?.phone?.replace("+227", "") || ""
  );
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await API.post("/auth/reset-password", {
        phone: `+227${phone.replace(/\D/g, "")}`,
        otp,
        newPassword,
        confirmPassword,
      });
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
          <form onSubmit={handleReset}>
            <TextField
              label="Téléphone"
              fullWidth
              required
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">+227</InputAdornment>
                ),
              }}
            />
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
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Confirmer le mot de passe"
              type="password"
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              margin="normal"
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
