import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import API from "../api";
import BookCard from "../components/BookCard";
import { useNavigate } from "react-router-dom";

const PremiumFahimtaPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [livres, setLivres] = useState([]);
  const [exams, setExams] = useState([]);
  const [videos, setVideos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();




  const [ocrInput, setOcrInput] = useState("");          // pour texte OCR extrait
const [ocrImage, setOcrImage] = useState(null);        // image sélectionnée
const [ocrResponse, setOcrResponse] = useState("");    // réponse IA
const [ocrLoading, setOcrLoading] = useState(false);
const [ocrError, setOcrError] = useState("");





  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [booksRes, examsRes, videosRes] = await Promise.all([
          API.get("/admin/books"),
          API.get("/exams"),
          API.get("/videos"),
        ]);

        setLivres(booksRes.data.filter((b) => b.badge === "prenuim"));
        setExams(examsRes.data.filter((e) => e.badge === "prenuim"));
        setVideos(videosRes.data.filter((v) => v.badge === "prenuim"));
      } catch (err) {
        console.error("Erreur lors du chargement des données premium :", err);
      }
    };
    fetchAll();
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setMessage("");
    setResponse("");

    try {
      const res = await API.post("/ia/solve", { input });
      setResponse(res.data.response);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
      setMessage(errorMessage);

      if (err.response?.data?.redirectTo) {
        setTimeout(() => {
          window.location.href = err.response.data.redirectTo;
        }, 2500);
      }
    } finally {
      setLoading(false);
    }
  };



  const handleImageSubmit = async () => {
  if (!ocrImage) return;

  const formData = new FormData();
  formData.append("image", ocrImage);

  setOcrLoading(true);
  setOcrError("");
  setOcrResponse("");

  try {
  

   const res = await API.post("/ia/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

    setOcrResponse(res.data.response);
  } catch (err) {
    setOcrError(err.response?.data?.message || "Erreur lors du traitement de l’image");
  } finally {
    setOcrLoading(false);
  }
};


  return (
    <PageLayout>
<Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 10 }, mt: 5, background: '#fff5f8', borderRadius: 4, boxShadow: 3, mx: 'auto', maxWidth: '1200px' }}>
  <Typography variant="h3" fontWeight="bold" textAlign="center" sx={{ color: '#880e4f' }}>
    Fahimta AI - Premium
  </Typography>

  {/* Texte */}
  <Box mt={4}>
    <Typography variant="h5" gutterBottom>
      💬 Posez vos questions mathématiques
    </Typography>

    <TextField
      label="Pose ta question"
      fullWidth
      multiline
      rows={4}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      sx={{ mt: 2 }}
    />

    <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} disabled={loading}>
      Envoyer
    </Button>

    {loading && <Box mt={3}><CircularProgress /><Typography mt={1}>Analyse en cours...</Typography></Box>}
    {message && <Alert severity="error" sx={{ mt: 3 }}>{message}</Alert>}
    {response && (
      <Box mt={4}>
        <Typography variant="h6">📚 Réponse de l'IA :</Typography>
        <Typography mt={2} sx={{ whiteSpace: "pre-line" }}>{response}</Typography>
      </Box>
    )}
  </Box>

  {/* OCR */}
  <Box mt={6} display="flex" justifyContent="center">
    <Box
      sx={{
        backgroundColor: '#fff3e0',
        p: 4,
        borderRadius: 4,
        boxShadow: 3,
        width: '100%',
        maxWidth: 600,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📸 Soumettre un exercice par photo
      </Typography>

      <Button
        component="label"
        variant="outlined"
        color="primary"
        sx={{ mt: 3, mr:2 }}
      >
        Choisir une image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setOcrImage(e.target.files[0])}
        />
      </Button>

      {ocrImage && (
        <Box mt={3}>
          <Typography variant="caption">Aperçu :</Typography>
          <img
            src={URL.createObjectURL(ocrImage)}
            alt="aperçu"
            style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8 }}
          />
        </Box>
      )}

      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 3 }}
        onClick={handleImageSubmit}
        disabled={ocrLoading}
      >
        Envoyer à l’IA
      </Button>

      {ocrLoading && (
        <Box mt={3}>
          <CircularProgress />
          <Typography mt={1}>Traitement OCR...</Typography>
        </Box>
      )}

      {ocrError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {ocrError}
        </Alert>
      )}

      {ocrResponse && (
        <Box mt={4} sx={{ backgroundColor: '#f1f8e9', p: 3, borderRadius: 2 }}>
          <Typography variant="h6">🧠 Réponse IA :</Typography>
          <Typography sx={{ whiteSpace: "pre-line", mt: 1 }}>
            {ocrResponse}
          </Typography>
        </Box>
      )}
    </Box>
  </Box>
</Box>


      <Box sx={{ backgroundColor: '#fce4ec', py: 6, px: { xs: 2, md: 6 } }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>Ressources Premium</Typography>

        <Tabs value={tabIndex} onChange={handleTabChange} centered variant="fullWidth" sx={{ backgroundColor: '#c2185b', borderRadius: 2, mb: 4 }} TabIndicatorProps={{ style: { backgroundColor: '#fff' } }}>
          <Tab label="LIVRES" sx={{ color: '#fff', fontWeight: 'bold', '&.Mui-selected': { color: '#fff' } }} />
          <Tab label="SUJETS CORRIGÉS" sx={{ color: '#fff', fontWeight: 'bold', '&.Mui-selected': { color: '#fff' } }} />
          <Tab label="VIDÉOS" sx={{ color: '#fff', fontWeight: 'bold', '&.Mui-selected': { color: '#fff' } }} />
        </Tabs>

        {tabIndex === 0 && (
          <Grid container spacing={3}>{livres.map((livre, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
             <BookCard book={livre} isPremiumUser />

            </Grid>
          ))}</Grid>
        )}

        {tabIndex === 1 && (
          <Grid container spacing={3}>{exams.map((exam) => (
            <Grid item xs={12} md={6} lg={4} key={exam._id}>
              <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight="bold">{exam.title}</Typography>
                  <Typography variant="body2" color="text.secondary">Niveau : {exam.level.toUpperCase()}</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>{exam.description.substring(0, 300)}...</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
                  <Button variant="outlined" size="small" onClick={() => window.open(exam.subjectUrl, "_blank")}>📄 Sujet</Button>
                  <Button variant="contained" color="success" size="small" onClick={() => window.open(exam.correctionUrl, "_blank")}>✅ Correction</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}</Grid>
        )}

        {tabIndex === 2 && (
          <Grid container spacing={3}>{videos.map((video, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                {video.thumbnail && <img src={video.thumbnail} alt="Miniature" style={{ width: "100%", height: 180, objectFit: "cover" }} />}
                <CardContent>
                  <Typography variant="h6">{video.title}</Typography>
                  <Typography variant="body2" color="text.secondary">Niveau : {video.level?.toUpperCase()}</Typography>
                  <Typography variant="body2" mt={1}>{video.description.substring(0, 200)}...</Typography>
                </CardContent>
                <Box sx={{ px: 2, pb: 2 }}>
                  <iframe
                    src={video.videoUrl}
                    title={video.title}
                    width="100%"
                    height="300"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 0 }}
                  ></iframe>
                </Box>
              </Card>
            </Grid>
          ))}</Grid>
        )}
      </Box>
    </PageLayout>
  );
};

export default PremiumFahimtaPage;
