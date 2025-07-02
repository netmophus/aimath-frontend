import React, { useState } from "react";
import { Box, TextField, Typography, Button, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import PageLayout from "../components/PageLayout";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";


const VerifyPage = () => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const phone = location.state?.phone || "";
const { refreshUser } = useContext(AuthContext);

  const handleVerify = async () => {
    try {
      const res = await API.post("/auth/verify-otp", { phone, otp });
      setMessage("✅ Vérification réussie !");

      await refreshUser(); // <-- ici


      setTimeout(() => navigate("/gratuit"), 1000); // redirection après succès
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Échec de la vérification.");
    }
  };

  return (
    <PageLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 128px)",
          backgroundColor: "#f4f4f4",
        }}
      >
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 400 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
            🔐 Vérification de votre compte
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
            Entrez le code OTP envoyé à votre téléphone : {phone}
          </Typography>
          <TextField
            fullWidth
            label="Code OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            margin="normal"
            required
          />
          <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleVerify}>
            Vérifier
          </Button>

          {message && (
            <Typography textAlign="center" color="secondary" mt={2}>
              {message}
            </Typography>
          )}
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default VerifyPage;
