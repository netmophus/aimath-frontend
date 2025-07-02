import React, { useState } from "react";
import { Box, TextField, Typography, Button, Alert, CircularProgress } from "@mui/material";
import API from "../api";
import { marked } from "marked";

const QuestionBox = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setMessage("");
    setResponse("");

    try {
      const res = await API.post("/ia/solve", { input: question });
      setResponse(res.data.response);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur lors de la requête IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="subtitle1" gutterBottom>
        💬 Ou tapez directement votre question mathématique :
      </Typography>

      <TextField
        fullWidth
        label="Exemple : Explique-moi le théorème de Thalès"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Écris ici ta question"
      />

      <Button
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleSend}
        disabled={loading || !question.trim()}
      >
        📤 Envoyer
      </Button>

      {loading && (
        <Box mt={2}>
          <CircularProgress />
        </Box>
      )}

      {message && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      {response && (
        <Box mt={3}>
          <Typography variant="h6">📚 Réponse de l'IA :</Typography>
          <Typography
                mt={1}
                sx={{ whiteSpace: "pre-line" }}
                dangerouslySetInnerHTML={{ __html: marked(response) }}
                />

        
        </Box>
      )}
    </Box>
  );
};

export default QuestionBox;
