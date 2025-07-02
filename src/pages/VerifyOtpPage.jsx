import React, { useState } from "react";
import { Box, TextField, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [phone, setPhone] = useState(location.state?.phone || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.post("/auth/verify-otp", { phone, otp });

      // Enregistre le token et connecte
      const token = res.data.token;
      localStorage.setItem("token", token);
      login(token);

      setMessage("✅ Vérification réussie !");
      setTimeout(() => navigate("/complete-profile"), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Code incorrect.");
    }
  };

  const formatPhoneDisplay = (phone) => {
    const digits = phone.replace(/\D/g, "");
    const clean = digits.startsWith("227") ? digits.slice(3) : digits;
    return `+227 ${clean.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4")}`;
  };
  

  return (
    <Box sx={{ maxWidth: 400, margin: "auto", mt: 6 }}>
      <Typography variant="h5" gutterBottom>
  🔐 Vérification du code OTP
</Typography>

<Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
  Un code a été envoyé par SMS au <strong>{formatPhoneDisplay(phone)}</strong>. Veuillez le saisir ci-dessous pour activer votre compte.
</Typography>

      <form onSubmit={handleVerify}>
        <TextField
          label="Téléphone"
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <TextField
          label="Code OTP"
          fullWidth
          margin="normal"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <Button variant="contained" type="submit" sx={{ mt: 2 }}>
          Vérifier
        </Button>
        {message && (
          <Typography color="secondary" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </form>
    </Box>
  );
};

export default VerifyOtpPage;
