import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import API from "../../api";
import PageLayout from "../../components/PageLayout";
import ReactMarkdown from "react-markdown";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import jsPDF from "jspdf";
import { useRef } from "react";
import html2canvas from "html2canvas";


const FreeAIAssistantTCPage = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
    const responseRef = useRef(null);
  const handleSubmit = async () => {
    setLoading(true);
    setResponse("");
    setError("");

    try {
      const res = await API.post("/ia/gratuit", { input });
      setResponse(res.data.response);
    } catch (err) {
      console.error("Erreur IA gratuite :", err);
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };


 const handleDownloadPDF = async () => {
  const element = responseRef.current;
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF();
  pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
  pdf.save("reponse-ia.pdf");
};

  return (
    <PageLayout>
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          🤖 Assistant IA Gratuit – Terminale C
        </Typography>
        <Typography variant="body1" gutterBottom>
          Pose ta question sur un chapitre de maths et reçois une explication ou une piste de réflexion.
        </Typography>

        <Paper sx={{ p: 3, mt: 3, backgroundColor: "#f9fbe7" }}>
          <TextField
            label="Votre question mathématique"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!input || loading}
          >
            {loading ? <CircularProgress size={24} /> : "Envoyer à l’IA"}
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}


{response && (

<>

<Paper sx={{ mt: 4, p: 3, backgroundColor: "#e3f2fd" }}>
  <Typography variant="h6" gutterBottom color="secondary">
    ✨ Réponse de l’IA :
  </Typography>

 <Box ref={responseRef} sx={{ mt: 2 }}>
       <ReactMarkdown
        children={response}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        />

  </Box>
</Paper>


<Button
  variant="outlined"
  color="secondary"
  onClick={handleDownloadPDF}
  sx={{ mt: 2 }}
>
  📄 Télécharger en PDF
</Button>


</>


)}



      </Box>
    </PageLayout>
  );
};

export default FreeAIAssistantTCPage;
