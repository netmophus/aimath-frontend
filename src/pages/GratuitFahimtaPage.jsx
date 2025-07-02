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

import API from "../api"; // Assure-toi que le chemin est correct
import BookCard from "../components/BookCard"; // ajuste le chemin si besoin
import { useNavigate } from "react-router-dom"; // tout en haut


const GratuitPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
const [livres, setLivres] = useState([]);
const [exams, setExams] = useState([]);
const navigate = useNavigate();
const [videos, setVideos] = useState([]);
const [question, setQuestion] = useState("");


  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };



useEffect(() => {
  const fetchLivres = async () => {
    try {
      const res = await API.get("/admin/books");
      setLivres(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des livres :", err.message);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await API.get("/exams");
      setExams(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des sujets :", err.message);
    }
  };

   const fetchVideos = async () => {
    try {
      const res = await API.get("/videos");
      setVideos(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des vidéos :", err.message);
    }
  };

  fetchLivres();
  fetchExams();
  fetchVideos();
}, []);



const handleSubmit = async () => {
  if (!input.trim()) return;

  setLoading(true);
  setMessage("");
  setResponse("");

  try {
    const res = await API.post("/ia/gratuit", { input });

    setResponse(res.data.response);
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
    setMessage(errorMessage);

    // 🚨 Rediriger si limite atteinte
    if (err.response?.data?.redirectTo) {
      setTimeout(() => {
        window.location.href = err.response.data.redirectTo;
      }, 2500); // petite pause avant la redirection
    }
  } finally {
    setLoading(false);
  }
};


  return (
<PageLayout>
  {/* ➤ Bloc IA en haut */}
<Box
  sx={{
    py: { xs: 6, md: 8 },
    px: { xs: 2, sm: 4, md: 10 },
    mt: 5,
    background: 'linear-gradient(90deg, #e3f2fd 0%, #f8fbff 100%)',
    borderRadius: 4,
    boxShadow: 3,
    mx: 'auto',
    maxWidth: '1200px',
  }}
>
  <Typography
    variant="h3"
    fontWeight="bold"
    textAlign="center"
    sx={{ color: '#0f172a' }}
  >
    Tester Fahimta AI
  </Typography>

  

 <Typography variant="h5" gutterBottom>
        Vous pouvez poser vos questions en mathematiques 
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

      {/* ✅ Exemple en bas, petit et centré */}
<Typography
  variant="caption"
  textAlign="center"
  display="block" 
  color="text.secondary"
  mt={1}
>
  Exemple : "Expliquez-moi les limites en Terminale C" ou "C’est quoi une fonction dérivable ?"
</Typography>

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



</Box>


  {/* ➤ Bloc Ressources Mathématiques */}
  <Box sx={{ backgroundColor: '#f5f7fa', py: 6, px: { xs: 2, md: 6 } }}>
    <Typography variant="h2" fontWeight="bold" textAlign="center" mb={4}>
      Ressources Mathématiques
    </Typography>

    <Tabs
      value={tabIndex}
      onChange={handleTabChange}
      centered
      variant="fullWidth"
      sx={{
        backgroundColor: '#1976D2',
        borderRadius: 2,
        mb: 4,
      }}
      TabIndicatorProps={{ style: { backgroundColor: '#fff' } }}
    >
      <Tab
        label="LIVRES"
        sx={{
          color: '#fff',
          fontWeight: 'bold',
          '&.Mui-selected': { color: '#fff' },
        }}
      />
      <Tab
        label="SUJETS CORRIGÉS"
        sx={{
          color: '#fff',
          fontWeight: 'bold',
          '&.Mui-selected': { color: '#fff' },
        }}
      />
      <Tab
        label="VIDÉOS DE FORMATION"
        sx={{
          color: '#fff',
          fontWeight: 'bold',
          '&.Mui-selected': { color: '#fff' },
        }}
      />
    </Tabs>

    {/* ➤ Section de contenu dynamique selon l’onglet */}
    {tabIndex === 0 && (
      <Grid container spacing={3}>
        {livres.map((livre, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <BookCard book={livre} />
          </Grid>
        ))}
      </Grid>
    )}

    {tabIndex === 1 && (
      <Grid container spacing={3}>
        {exams.map((exam) => (
          <Grid item xs={12} sm={6} md={4} key={exam._id}>
            {/* moderniser la card avec elevation douce, contenu centré */}

            
{tabIndex === 1 && (
  <Grid container spacing={2}>
    {exams.map((exam) => (
      <Grid item xs={12} md={6} lg={4} key={exam._id}>
        <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {exam.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Niveau : {exam.level.toUpperCase()}
            </Typography>

            <Typography variant="body2" sx={{ mt: 1 }}>
              {exam.description.length > 400
                ? exam.description.substring(0, 400) + "..."
                : exam.description}
            </Typography>

            <Box mt={1}>
              <Typography variant="caption" color="text.secondary">
                📅 Publié le : {new Date(exam.createdAt).toLocaleDateString("fr-FR")}
              </Typography>
              <br />
              <Typography variant="caption" color="text.secondary">
                🏷️ Accès :{" "}
                <span style={{ color: exam.badge === "gratuit" ? "green" : "orange", fontWeight: "bold" }}>
                  {exam.badge === "gratuit" ? "Gratuit" : "Prenuim"}
                </span>
              </Typography>
            </Box>
          </CardContent>

          <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                exam.badge === "prenuim"
                  ? navigate("/pricing")
                  : window.open(exam.subjectUrl, "_blank");
              }}
            >
              📄 Sujet
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={() => {
                exam.badge === "prenuim"
                  ? navigate("/pricing")
                  : window.open(exam.correctionUrl, "_blank");
              }}
            >
              ✅ Correction
            </Button>
          </CardActions>
        </Card>
      </Grid>
    ))}
  </Grid>
)}
            
          </Grid>
        ))}
      </Grid>
    )}

    {tabIndex === 2 && (
      <Grid container spacing={3}>
        {videos.map((video, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            {/* moderniser carte vidéo */}
            
{tabIndex === 2 && (
  <Grid container spacing={2}>
    {videos.map((video, index) => (
      <Grid item xs={12} md={6} lg={4} key={index}>
        <Card>
          {video.thumbnail && (
            <img
              src={video.thumbnail}
              alt="Miniature"
              style={{ width: "100%", height: 180, objectFit: "cover" }}
            />
          )}
          <CardContent>
            <Typography variant="h6">{video.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Niveau : {video.level?.toUpperCase()}
            </Typography>
            <Typography variant="body2" mt={1}>
              {video.description.length > 200
                ? video.description.substring(0, 200) + "..."
                : video.description}
            </Typography>
            <Typography variant="caption" display="block" mt={1}>
              Accès : {video.badge === "gratuit" ? "🎁 Gratuit" : "🔒 Prenuim"}
            </Typography>
          </CardContent>

          <Box sx={{ px: 2, pb: 2 }}>
            <iframe
              src={video.videoUrl}
              title={video.title}
              width="60%"
              height="400"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 0 }}
            ></iframe>
          </Box>
        </Card>
      </Grid>
    ))}
  </Grid>
)} 

          
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
</PageLayout>


  );
};

export default GratuitPage;
