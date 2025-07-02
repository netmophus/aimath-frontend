import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import API from "../api";

const ExerciceGratuitPage = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessage("");
    setResponse("");

    try {
      const res = await API.post("/ia/gratuit", { input }); // 🚨 Backend à faire ensuite
      setResponse(res.data.response);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Typography variant="h5" gutterBottom>
        📘 Exercice gratuit
      </Typography>

      <TextField
        label="Pose ta question"
        fullWidth
        multiline
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{ mt: 3 }}
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        Envoyer
      </Button>

      {loading && (
        <Box mt={3}>
          <CircularProgress />
          <Typography mt={1}>Analyse en cours...</Typography>
        </Box>
      )}

      {message && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {message}
        </Alert>
      )}

      {response && (
        <Box mt={4}>
          <Typography variant="h6">📚 Réponse de l'IA :</Typography>
          <Typography mt={2} sx={{ whiteSpace: "pre-line" }}>
            {response}
          </Typography>
        </Box>
      )}
    </PageLayout>
  );
};

export default ExerciceGratuitPage;
