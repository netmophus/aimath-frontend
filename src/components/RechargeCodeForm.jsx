import React, { useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";
import API from "../api";

const RechargeCodeForm = () => {
  const [code, setCode] = useState("");
  const [value, setValue] = useState(500);
  const [type, setType] = useState("credit");
  const [message, setMessage] = useState("");

  const handleCreateCode = async () => {
    try {
      const res = await API.post("/admin/recharge-code", {
        code,
        value,
        type,
      });
      setMessage("✅ Code créé avec succès.");
      setCode("");
    } catch (err) {
      setMessage(
        err.response?.data?.message || "❌ Erreur lors de la création."
      );
    }
  };

  return (
    <Box mt={2} maxWidth={400}>
      <Typography variant="h6">🎫 Générer un code de recharge</Typography>

      <TextField
        fullWidth
        label="Code (ex: ABC123)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        sx={{ mt: 2 }}
      />
      <TextField
        fullWidth
        label="Valeur (ex: 500 crédits)"
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        sx={{ mt: 2 }}
      />
      <TextField
        fullWidth
        select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        sx={{ mt: 2 }}
      >
        <MenuItem value="credit">Crédit</MenuItem>
        <MenuItem value="abonnement">Abonnement (1 mois)</MenuItem>
      </TextField>

      <Button variant="contained" sx={{ mt: 3 }} onClick={handleCreateCode}>
        Générer le code
      </Button>

      {message && (
        <Alert
          severity={message.startsWith("✅") ? "success" : "error"}
          sx={{ mt: 2 }}
        >
          {message}
        </Alert>
      )}
    </Box>
  );
};

export default RechargeCodeForm;
