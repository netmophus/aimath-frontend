import React, { useState, useRef, useEffect } from "react";
import { Box, TextField, Typography, Button, Paper } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // ✅ Récupérer le téléphone depuis location.state OU localStorage
  const [phone, setPhone] = useState(() => {
    const savedPhone = localStorage.getItem("pendingVerificationPhone");
    return location.state?.phone || savedPhone || "";
  });
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(!phone);
  const inputRefs = useRef([]);

  useEffect(() => {
    // ✅ Sauvegarder le téléphone dans localStorage quand il arrive via location.state
    if (location.state?.phone) {
      localStorage.setItem("pendingVerificationPhone", location.state.phone);
    }
  }, [location.state?.phone]);

  useEffect(() => {
    // Focus le premier input au chargement
    if (inputRefs.current[0] && phone) {
      inputRefs.current[0].focus();
    }
  }, [phone]);

  const handleChange = (index, value) => {
    // N'accepter que les chiffres
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Prendre seulement le dernier caractère
    setOtp(newOtp);

    // Passer au champ suivant si un chiffre a été saisi
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Supprimer et revenir au champ précédent
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 4; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus le dernier champ rempli ou le suivant
    const nextIndex = Math.min(pastedData.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResendOtp = async () => {
    setResending(true);
    setMessage("");

    try {
      await API.post("/auth/resend-otp", { phone });
      setMessage("✅ Un nouveau code a été envoyé par SMS !");
      setOtp(["", "", "", ""]); // Réinitialiser les champs
      inputRefs.current[0]?.focus();
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Erreur lors de l'envoi du code.");
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!phone) {
      setMessage("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length !== 4) {
      setMessage("Veuillez entrer le code OTP complet.");
      return;
    }

    try {
      const res = await API.post("/auth/verify-otp", { phone, otp: otpCode });

      // Enregistre le token et connecte
      const token = res.data.token;
      localStorage.setItem("token", token);
      
      // ✅ Supprimer le téléphone du localStorage après vérification réussie
      localStorage.removeItem("pendingVerificationPhone");
      
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f4f4f4",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          borderRadius: 3,
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 450,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
          🔐 Vérification du code OTP
        </Typography>

        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 1, mb: 3 }}>
          {phone 
            ? `Un code a été envoyé par SMS au ${formatPhoneDisplay(phone)}. Veuillez le saisir ci-dessous pour activer votre compte.`
            : "Entrez votre numéro de téléphone et le code OTP reçu par SMS."}
        </Typography>

        <Box component="form" onSubmit={handleVerify}>
          {/* Champ téléphone - visible si pas de numéro */}
          {showPhoneInput && (
            <TextField
              label="Numéro de téléphone"
              fullWidth
              margin="normal"
              value={phone.replace("+227", "")}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 8) {
                  const formattedPhone = value ? `+227${value}` : "";
                  setPhone(formattedPhone);
                  localStorage.setItem("pendingVerificationPhone", formattedPhone);
                }
              }}
              placeholder="XXXXXXXX"
              required
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: "text.secondary" }}>+227</Typography>
                ),
              }}
            />
          )}
          
          {phone && !showPhoneInput && (
            <Button
              variant="text"
              size="small"
              onClick={() => setShowPhoneInput(true)}
              sx={{ mb: 2 }}
            >
              Modifier le numéro
            </Button>
          )}

          {/* Inputs OTP séparés */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: { xs: 0.8, sm: 1.5 },
              mb: 3,
            }}
          >
            {otp.map((digit, index) => (
              <TextField
                key={index}
                inputRef={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                variant="outlined"
                inputProps={{
                  maxLength: 1,
                  style: {
                    textAlign: "center",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    padding: "12px 0",
                  },
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                }}
                sx={{
                  width: { xs: "45px", sm: "60px" },
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: "#1976D2",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#1976D2",
                      borderWidth: 2,
                    },
                  },
                }}
              />
            ))}
          </Box>

          <Button
            variant="contained"
            type="submit"
            fullWidth
            disabled={otp.join("").length !== 4}
            sx={{ mt: 2 }}
          >
            Vérifier
          </Button>

          <Button
            variant="outlined"
            fullWidth
            disabled={resending}
            onClick={handleResendOtp}
            sx={{ mt: 2 }}
          >
            {resending ? "Envoi en cours..." : "Renvoyer le code"}
          </Button>

          {message && (
            <Typography color="secondary" sx={{ mt: 2, textAlign: "center" }}>
              {message}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default VerifyOtpPage;
