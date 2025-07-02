import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert } from "@mui/material";
import PageLayout from "../components/PageLayout";
import API from "../api";

const AdminRegisterPage = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await API.post("/admin/create", { phone, password });
      setMessage("✅ Administrateur créé avec succès.");
      setPhone("");
      setPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Erreur lors de la création.");
    }
  };

  return (
    <PageLayout>
      <Box maxWidth={400} mt={6} mx="auto">
        <Typography variant="h5" gutterBottom>
          🛠️ Créer un administrateur
        </Typography>
        <form onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          <Button type="submit" variant="contained" sx={{ mt: 2 }}>
            Créer l’admin
          </Button>
        </form>

        {message && (
          <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
            {message}
          </Alert>
        )}
      </Box>
    </PageLayout>
  );
};

export default AdminRegisterPage;
