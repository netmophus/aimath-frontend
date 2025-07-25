import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
 
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import PageLayout from "../components/PageLayout";

import API from "../api"; // Assure-toi que le chemin est correct

import { useNavigate } from "react-router-dom"; // tout en haut
import BookCardGratuit from "../components/gratuit/BookCardGratuit";
import ExamCardGratuit from "../components/gratuit/ExamCardGratuit";
import VideoCardGratuit from "../components/gratuit/VideoCardGratuit";
import LockIcon from "@mui/icons-material/Lock";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const GratuitPage = () => {
  const [tabIndex, setTabIndex] = useState(0);
const [livres, setLivres] = useState([]);
const [exams, setExams] = useState([]);
const navigate = useNavigate();
const [videos, setVideos] = useState([]);



  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
const [messages, setMessages] = useState([]);

  const [typedResponse, setTypedResponse] = useState("");


 useEffect(() => {
  const last = messages[messages.length - 1];

  if (!last || last.role !== "ia") return;

  let index = 0;
  setTypedResponse("");

  const interval = setInterval(() => {
    setTypedResponse((prev) => prev + last.text.charAt(index));
    index++;
    if (index >= last.text.length) clearInterval(interval);
  }, 15);

  return () => clearInterval(interval);
}, [messages]);


  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };



useEffect(() => {
  const fetchLivres = async () => {
    try {
      const res = await API.get("/ia/gratuit");
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

  setMessages((prev) => [...prev, { role: "user", text: input }]);
  setLoading(true);
  setMessage("");
  setResponse("");
  setInput("");

  try {
    const res = await API.post("/ia/gratuit", { input });

    setMessages((prev) => [...prev, { role: "ia", text: res.data.response }]);
  } catch (err) {
    const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
    setMessage(errorMessage);

    setMessages((prev) => [
      ...prev,
      { role: "ia", text: "❌ Une erreur est survenue. Essaie plus tard." },
    ]);

    if (err.response?.data?.redirectTo) {
      setTimeout(() => {
        window.location.href = err.response.data.redirectTo;
      }, 2500);
    }
  } finally {
    setLoading(false);
  }
};


  return (
<PageLayout>



<Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    justifyContent: "center",
    gap: 3,
    mt: 11,
    px: 2,
  }}
>
  {/* Carte 1 */}
  <Box
    sx={{
      flex: 1,
      background: "#FFD54F",
      p: 3,
      borderRadius: 3,
      boxShadow: 3,
      textAlign: "center",
    }}
  >
    <LockIcon sx={{ fontSize: 50, color: "#000" }} />
    <Typography variant="h6" fontWeight="bold" color="text.primary" mt={1} gutterBottom>
      Assistance complète
    </Typography>
    <Typography variant="body1" color="text.primary" mb={2}>
      Soumettez vos exercices, posez vos questions en texte, audio ou visio et recevez une assistance personnalisée.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={() => navigate("/pricing")} // Ou "#pricing" si c'est une ancre dans la même page
    >
      Abonnez-vous
    </Button>
  </Box>

  {/* Carte 2 */}
  <Box
    sx={{
      flex: 1,
      background: "#4FC3F7",
      p: 3,
      borderRadius: 3,
      boxShadow: 3,
      textAlign: "center",
    }}
  >
    <SupportAgentIcon sx={{ fontSize: 50, color: "#fff" }} />
    <Typography variant="h6" fontWeight="bold" color="white" mt={1} gutterBottom>
      Accompagnement 24h/24
    </Typography>
    <Typography variant="body1" color="white" mb={2}>
      Accédez à l’IA et aux enseignants qualifiés à toute heure, pour un soutien continu dans votre apprentissage en mathematiques.
    </Typography>
    <Button
      variant="contained"
      sx={{ backgroundColor: "#1565C0" }}
      onClick={() => navigate("/pricing")}
    >
      Abonnez-vous
    </Button>
  </Box>
</Box>









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
  label="💬 Pose ta question ici..."
  fullWidth
  multiline
  rows={4}
  variant="outlined"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  sx={{
    mt: 3,
    backgroundColor: "#ffffff",
    borderRadius: 2,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: "#90caf9",
        borderWidth: "2px",
      },
      '&:hover fieldset': {
        borderColor: "#1976d2",
      },
      '&.Mui-focused fieldset': {
        borderColor: "#1565c0",
      },
    },
    '& .MuiInputLabel-root': {
      color: '#1565c0',
      fontWeight: 'bold',
    },
  }}
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

{messages.length > 0 && (
  <Box mt={4}>
    {messages.map((msg, index) => (
      <Box
        key={index}
        sx={{
          backgroundColor: msg.role === "user" ? "#e3f2fd" : "#0d47a1",
          color: msg.role === "user" ? "#000" : "#fff",
          p: 2,
          borderRadius: 2,
          mb: 2,
          fontFamily: "Courier New, monospace",
          boxShadow: 2,
          whiteSpace: "pre-line",
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          {msg.role === "user" ? "🙋‍♂️ Toi :" : "Fahimta AI :"}
        </Typography>
        <Typography>
  {msg.role === "ia" && index === messages.length - 1
    ? typedResponse
    : msg.text}
</Typography>

      </Box>
    ))}
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
        <BookCardGratuit book={livre} />
      </Grid>
    ))}
  </Grid>
)}


{tabIndex === 1 && (
  <Grid container spacing={3}>
    {exams.map((exam) => (
      <Grid item xs={12} sm={6} md={4} key={exam._id}>
        <ExamCardGratuit exam={exam} />
      </Grid>
    ))}
  </Grid>
)}

{tabIndex === 2 && (
  <Box display="flex" justifyContent="center" px={2}>
    <Box
      width="100%"
      maxWidth="1400px"
      sx={{
        px: { xs: 1, sm: 2, md: 4 },
        mt: 2,
      }}
    >
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {videos.map((video, index) => (
          <Grid
            item
            xs={12}         // ✅ 1 carte par ligne sur mobile
            sm={6}          // ✅ 2 cartes par ligne en small
            md={4}          // ✅ 3 cartes par ligne en medium+
            key={index}
          >
            <VideoCardGratuit video={video} />
          </Grid>
        ))}
      </Grid>
    </Box>
  </Box>
)}







  </Box>
</PageLayout>


  );
};

export default GratuitPage;
