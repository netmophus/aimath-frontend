// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Tabs,
//   Tab,
//   Typography,
//   Card,
//   Paper,
//   Button,
//   TextField,
//   CircularProgress,
//   Alert,
//   Grid,
// } from "@mui/material";
// import PageLayout from "../components/PageLayout";
// import API from "../api";
// import BookCard from "../components/premuim/BookCard";
// import ExamCard from "../components/premuim/ExamCard";
// import { useContext } from "react";
// import { AuthContext } from "../context/AuthContext";

// import { useNavigate } from "react-router-dom";
// import VideoCardPremium from "../components/premuim/VideoCardPremium";
// import LockIcon from "@mui/icons-material/Lock";
// import SupportAgentIcon from "@mui/icons-material/SupportAgent";

// const PremiumFahimtaPage = () => {
//   const [tabIndex, setTabIndex] = useState(0);
//   const [livres, setLivres] = useState([]);
//   const [exams, setExams] = useState([]);
//   const [videos, setVideos] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState("");
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

 
// const [ocrImage, setOcrImage] = useState(null);        // image sélectionnée
// const [ocrResponse, setOcrResponse] = useState("");    // réponse IA
// const [ocrLoading, setOcrLoading] = useState(false);
// const [ocrError, setOcrError] = useState("");
// const { user } = useContext(AuthContext);
// const isPremiumUser = user?.isSubscribed === true;

// const [quotas, setQuotas] = useState(null);

// const [typedText, setTypedText] = useState("");
// const [typedOCR, setTypedOCR] = useState("");
 
// useEffect(() => {
//   if (!response) return;

//   let index = 0;
//   const interval = setInterval(() => {
//     setTypedText((prev) => prev + response.charAt(index));
//     index++;
//     if (index >= response.length) clearInterval(interval);
//   }, 15); // 15ms par caractère (tu peux ajuster)

//   return () => clearInterval(interval);
// }, [response]);



// useEffect(() => {
//   if (!ocrResponse) return;

//   let index = 0;
//   setTypedOCR(""); // reset avant chaque réponse
//   const interval = setInterval(() => {
//     setTypedOCR((prev) => prev + ocrResponse.charAt(index));
//     index++;
//     if (index >= ocrResponse.length) clearInterval(interval);
//   }, 15); // Ajuste la vitesse ici

//   return () => clearInterval(interval);
// }, [ocrResponse]);


//   const handleTabChange = (event, newValue) => {
//     setTabIndex(newValue);
//   };

//   const handleSubmit = async () => {
//     if (!input.trim()) return;

//     setLoading(true);
//     setMessage("");
//     setResponse("");

//     try {
//       const res = await API.post("/ia/solve", { input });
//       setResponse(res.data.response);
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
//       setMessage(errorMessage);

//       if (err.response?.data?.redirectTo) {
//         setTimeout(() => {
//           window.location.href = err.response.data.redirectTo;
//         }, 2500);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };



//   const handleImageSubmit = async () => {
//   if (!ocrImage) return;

//   const formData = new FormData();
//   formData.append("image", ocrImage);

//   setOcrLoading(true);
//   setOcrError("");
//   setOcrResponse("");

//   try {
  
// const res = await API.post("/ia/mathpix", formData, {
//   headers: {
//     "Content-Type": "multipart/form-data",
//   },
// });



// setOcrResponse(res.data.response);


//   } catch (err) {
//     setOcrError(err.response?.data?.message || "Erreur lors du traitement de l’image");
//   } finally {
//     setOcrLoading(false);
//   }
// };


// useEffect(() => {
//   const fetchAll = async () => {
//     try {
//       const [booksRes, examsRes, videosRes, quotasRes] = await Promise.all([
//         API.get("/premium"),
//         API.get("/exams"),
//         API.get("/videos"),
//         API.get("/usage/me"),
//       ]);

//       setLivres(booksRes.data);         // ✅ PAS DE FILTRE
//       setExams(examsRes.data);          // ✅ PAS DE FILTRE
//       setVideos(videosRes.data);        // ✅ PAS DE FILTRE
//       setQuotas(quotasRes.data);
//     } catch (err) {
//       console.error("Erreur lors du chargement des données premium :", err);
//     }
//   };
//   fetchAll();
// }, []);




// const handleDownloadSubject = async (examId) => {
//   try {
//     const res = await API.get(`/exams/${examId}/download-subject`);
//     const { downloadUrl } = res.data;
//     window.open(downloadUrl, "_blank");
//   } catch (err) {
//     console.error("Erreur téléchargement sujet :", err);
//     alert(err.response?.data?.message || "Erreur lors du téléchargement");
//   }
// };

// const handleDownloadCorrection = async (examId) => {
//   try {
//     const res = await API.get(`/exams/${examId}/download-correction`);
//     const { downloadUrl } = res.data;
//     window.open(downloadUrl, "_blank");
//   } catch (err) {
//     console.error("Erreur téléchargement correction :", err);
//     alert(err.response?.data?.message || "Erreur lors du téléchargement");
//   }
// };




//   return (
//     <PageLayout>
// <Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 10 }, mt: 5, background: '#fff5f8', borderRadius: 4, boxShadow: 3, mx: 'auto', maxWidth: '1200px' }}>
  
//   <Box
//   sx={{
//     display: "flex",
//     flexDirection: { xs: "column", md: "row" },
//     justifyContent: "center",
//     gap: 3,
//    mb:6,
//     px: 2,
//   }}
// >
//   {/* Carte 1 */}
//   <Box
//     sx={{
//       flex: 1,
//       background: "#FFD54F",
//       p: 3,
//       borderRadius: 3,
//       boxShadow: 3,
//       textAlign: "center",
//     }}
//   >
//     <LockIcon sx={{ fontSize: 60, color: "#000" }} />
//     <Typography variant="h6" fontWeight="bold" color="text.primary" mt={1} gutterBottom>
//       Posez une question à un enseignant
//     </Typography>
//     <Typography variant="body1" color="text.primary" mb={2}>
//        Un enseignant vous recontactera via la messagerie intégrée pour vous aider.
//     </Typography>
//     <Button
//       variant="contained"
//       color="primary"
//       onClick={() => navigate("/student/support-request")}
//     >
//       cliquez sur Soutien+
//     </Button>
//   </Box>

//   {/* Carte 2 */}
//   <Box
//     sx={{
//       flex: 1,
//       background: "#4FC3F7",
//       p: 3,
//       borderRadius: 3,
//       boxShadow: 3,
//       textAlign: "center",
//     }}
//   >
//     <SupportAgentIcon sx={{ fontSize: 60, color: "#fff" }} />
//     <Typography variant="h6" fontWeight="bold" color="white" mt={1} gutterBottom>
//       Accompagnement 24h/24
//     </Typography>
//     <Typography variant="body1" color="white" mb={2}>
//      Échangez avec un enseignant expérimenté,  recevez des explications claires et détaillées sur vos exercices et vos difficultés.
//     </Typography>
//     <Button
//       variant="contained"
//       sx={{ backgroundColor: "#1565C0" }}
//       onClick={() => navigate("/student/support-request")}
//     >
//       Cliquez sur Soutien+
//     </Button>
//   </Box>
// </Box>
  
  
  
  
//   <Typography variant="h3" fontWeight="bold" textAlign="center" sx={{ color: '#880e4f' }}>
//     Fahimta AI - Premium
//   </Typography>

//   {/* Texte */}
//   <Box mt={4}>
//     <Typography variant="h5" gutterBottom>
//       💬 Posez vos questions mathématiques
//     </Typography>

//   <TextField
//   label="Pose ta question"
//   fullWidth
//   multiline
//   rows={4}
//   value={input}
//   onChange={(e) => setInput(e.target.value)}
//   variant="outlined"
//   sx={{
//     mt: 2,
//     backgroundColor: "#f9f9f9",
//     borderRadius: 2,
//     boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 2,
//       '& fieldset': {
//         borderColor: '#c2185b',
//       },
//       '&:hover fieldset': {
//         borderColor: '#ad1457',
//       },
//       '&.Mui-focused fieldset': {
//         borderColor: '#880e4f',
//         borderWidth: 2,
//       },
//     },
//     '& .MuiInputLabel-root': {
//       color: '#880e4f',
//       fontWeight: 'bold',
//     },
//     '& .MuiInputBase-input': {
//       fontFamily: 'Courier New, Courier, monospace',
//     },
//   }}
// />


//     <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} disabled={loading}>
//       Envoyer
//     </Button>

//     {loading && <Box mt={3}><CircularProgress /><Typography mt={1}>Analyse en cours...</Typography></Box>}
//     {message && <Alert severity="error" sx={{ mt: 3 }}>{message}</Alert>}

// {response && (
//   <Box mt={4}>
//     <Typography variant="h6" gutterBottom>
//       Réponse de l'IA :
//     </Typography>
//     <Box
//       sx={{
//         mt: 2,
//         backgroundColor: "#1e3a8a",
//         color: "#fff",
//         p: 3,
//         borderRadius: 2,
//         fontFamily: "Courier New, monospace",
//         whiteSpace: "pre-line",
//         minHeight: 100,
//       }}
//     >
//       {typedText}
//     </Box>
//   </Box>
// )}


//   </Box>

//   {/* OCR */}
//   <Box mt={6} display="flex" justifyContent="center">
//     <Box
//       sx={{
//         backgroundColor: '#fff3e0',
//         p: 4,
//         borderRadius: 4,
//         boxShadow: 3,
//         width: '100%',
//         maxWidth: 600,
//         textAlign: 'center',
//       }}
//     >
//       <Typography variant="h5" fontWeight="bold" gutterBottom>
//         📸 Soumettre un exercice par photo
//       </Typography>

//      <Button
//   component="label"
//   variant="outlined"
//   color="primary"
//   sx={{ mt: 3, mr: 2 }}
// >
//   Choisir une image
//   <input
//     type="file"
//     accept="image/*"
//     hidden
//     onChange={(e) => setOcrImage(e.target.files[0])}
//   />
// </Button>

// {ocrImage && (
//   <Box mt={3}>
//     <Typography variant="caption">Aperçu :</Typography>
//     <img
//       src={URL.createObjectURL(ocrImage)}
//       alt="aperçu"
//       style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8 }}
//     />
//   </Box>
// )}


//       <Button
//         variant="contained"
//         color="secondary"
//         sx={{ mt: 3 }}
//         onClick={handleImageSubmit}
//         disabled={ocrLoading}
//       >
//         Envoyer à l’IA
//       </Button>

//       {ocrLoading && (
//         <Box mt={3}>
//           <CircularProgress />
//          <Typography mt={1}>Traitement Mathpix OCR...</Typography>
//         </Box>
//       )}

//       {ocrError && (
//         <Alert severity="error" sx={{ mt: 3 }}>
//           {ocrError}
//         </Alert>
//       )}

//      {ocrResponse && (
//   <Box mt={4} sx={{ backgroundColor: '#263238', p: 3, borderRadius: 2 }}>
//     <Typography variant="h6" color="white"> Réponse IA :</Typography>
//     <Typography
//       sx={{
//         whiteSpace: "pre-line",
//         mt: 1,
//         fontFamily: "Courier New, monospace",
//         color: "white",
//         minHeight: 100,
//       }}
//     >
//       {typedOCR}
//     </Typography>
//   </Box>
// )}





//     </Box>
//   </Box>
// </Box>


//       <Box sx={{ backgroundColor: '#fce4ec', py: 6, px: { xs: 2, md: 6 } }}>
//         <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>Ressources Premium</Typography>
// {quotas && (
// <Box sx={{ mb: 4 }}>
//   <Paper
//     elevation={3}
//     sx={{
//       p: 3,
//       borderRadius: 3,
//       backgroundColor: "#f9fbe7",
//     }}
//   >
//     <Typography variant="h5" fontWeight="bold" mb={3} color="#880e4f">
//       Quotas Restants ce mois-ci
//     </Typography>

//     <Grid container spacing={2}>
//       <Grid item xs={6} sm={3}>
//         <Card sx={{ backgroundColor: "#fce4ec", p: 2 }}>
//           <Typography align="center" fontWeight="bold">Livres</Typography>
//           <Typography variant="h5" align="center">{quotas.booksRemaining}</Typography>
//         </Card>
//       </Grid>

//       <Grid item xs={6} sm={3}>
//         <Card sx={{ backgroundColor: "#fff9c4", p: 2 }}>
//           <Typography align="center" fontWeight="bold">Sujets</Typography>
//           <Typography variant="h5" align="center">{quotas.examsRemaining}</Typography>
//         </Card>
//       </Grid>

//       <Grid item xs={6} sm={3}>
//         <Card sx={{ backgroundColor: "#e1bee7", p: 2 }}>
//           <Typography align="center" fontWeight="bold">Corrections</Typography>
//           <Typography variant="h5" align="center">{quotas.correctionsRemaining}</Typography>
//         </Card>
//       </Grid>

//       <Grid item xs={6} sm={3}>
//         <Card sx={{ backgroundColor: "#e8f5e9", p: 2 }}>
//           <Typography align="center" fontWeight="bold">Questions IA</Typography>
//           <Typography variant="h5" align="center">{quotas.iaTextRemaining}</Typography>
//         </Card>
//       </Grid>

//       <Grid item xs={6} sm={3}>
//         <Card sx={{ backgroundColor: "#ede7f6", p: 2 }}>
//           <Typography align="center" fontWeight="bold">IA Images</Typography>
//           <Typography variant="h5" align="center">{quotas.iaImageRemaining}</Typography>
//         </Card>
//       </Grid>
//     </Grid>
//   </Paper>
// </Box>

// )}

//         <Tabs value={tabIndex} onChange={handleTabChange} centered variant="fullWidth" sx={{ backgroundColor: '#c2185b', borderRadius: 2, mb: 4 }} TabIndicatorProps={{ style: { backgroundColor: '#fff' } }}>
//           <Tab label="LIVRES" sx={{ color: '#fff', fontWeight: 'bold', '&.Mui-selected': { color: '#fff' } }} />
//           <Tab label="SUJETS CORRIGÉS" sx={{ color: '#fff', fontWeight: 'bold', '&.Mui-selected': { color: '#fff' } }} />
//           <Tab label="VIDÉOS" sx={{ color: '#fff', fontWeight: 'bold', '&.Mui-selected': { color: '#fff' } }} />
//         </Tabs>

//         {tabIndex === 0 && (
//           <Grid container spacing={3}>{livres.map((livre, i) => (
//             <Grid item xs={12} sm={6} md={4} key={i}>
//              <BookCard book={livre} isPremiumUser />

//             </Grid>
//           ))}</Grid>
//         )}

//     {tabIndex === 1 && (
//   <Grid container spacing={3}>
//     {exams.map((exam) => (
//       <Grid item xs={12} md={6} lg={4} key={exam._id}>
//         <ExamCard
//           exam={exam}
//           onDownloadSubject={handleDownloadSubject}
//           onDownloadCorrection={handleDownloadCorrection}
//            isPremiumUser={isPremiumUser}
//         />
//       </Grid>
//     ))}
//   </Grid>
// )}

//      {tabIndex === 2 && (
//   <Grid container spacing={3}>
//     {videos.map((video, i) => (
//       <Grid item xs={12} sm={6} md={4} key={i}>
//       <VideoCardPremium video={video} isPremiumUser={isPremiumUser} />

//       </Grid>
//     ))}
//   </Grid>
// )}
//       </Box>


//     </PageLayout>
//   );
// };

// export default PremiumFahimtaPage;






























import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import API from "../api";
import BookCard from "../components/premuim/BookCard";
import ExamCard from "../components/premuim/ExamCard";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import { useNavigate } from "react-router-dom";
import VideoCardPremium from "../components/premuim/VideoCardPremium";
import LockIcon from "@mui/icons-material/Lock";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

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

 
const [ocrImage, setOcrImage] = useState(null);        // image sélectionnée
const [ocrResponse, setOcrResponse] = useState("");    // réponse IA
const [ocrLoading, setOcrLoading] = useState(false);
const [ocrError, setOcrError] = useState("");
const { user } = useContext(AuthContext);
const isPremiumUser = user?.isSubscribed === true;

const [quotas, setQuotas] = useState(null);

const [typedText, setTypedText] = useState("");
const [typedOCR, setTypedOCR] = useState("");
 
useEffect(() => {
  if (!response) return;

  let index = 0;
  const interval = setInterval(() => {
    setTypedText((prev) => prev + response.charAt(index));
    index++;
    if (index >= response.length) clearInterval(interval);
  }, 15); // 15ms par caractère (tu peux ajuster)

  return () => clearInterval(interval);
}, [response]);



useEffect(() => {
  if (!ocrResponse) return;

  let index = 0;
  setTypedOCR(""); // reset avant chaque réponse
  const interval = setInterval(() => {
    setTypedOCR((prev) => prev + ocrResponse.charAt(index));
    index++;
    if (index >= ocrResponse.length) clearInterval(interval);
  }, 15); // Ajuste la vitesse ici

  return () => clearInterval(interval);
}, [ocrResponse]);


  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

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
  
const res = await API.post("/ia/mathpix", formData, {
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


useEffect(() => {
  const fetchAll = async () => {
    try {
      const [booksRes, examsRes, videosRes, quotasRes] = await Promise.all([
        API.get("/premium"),
        API.get("/exams"),
        API.get("/videos"),
        API.get("/usage/me"),
      ]);

      setLivres(booksRes.data);         // ✅ PAS DE FILTRE
      setExams(examsRes.data);          // ✅ PAS DE FILTRE
      setVideos(videosRes.data);        // ✅ PAS DE FILTRE
      setQuotas(quotasRes.data);
    } catch (err) {
      console.error("Erreur lors du chargement des données premium :", err);
    }
  };
  fetchAll();
}, []);




const handleDownloadSubject = async (examId) => {
  try {
    const res = await API.get(`/exams/${examId}/download-subject`);
    const { downloadUrl } = res.data;
    window.open(downloadUrl, "_blank");
  } catch (err) {
    console.error("Erreur téléchargement sujet :", err);
    alert(err.response?.data?.message || "Erreur lors du téléchargement");
  }
};

const handleDownloadCorrection = async (examId) => {
  try {
    const res = await API.get(`/exams/${examId}/download-correction`);
    const { downloadUrl } = res.data;
    window.open(downloadUrl, "_blank");
  } catch (err) {
    console.error("Erreur téléchargement correction :", err);
    alert(err.response?.data?.message || "Erreur lors du téléchargement");
  }
};




  return (
    <PageLayout>
<Box sx={{ py: 6, px: { xs: 2, sm: 4, md: 10 }, mt: 5, background: '#fff5f8', borderRadius: 4, boxShadow: 3, mx: 'auto', maxWidth: '1200px' }}>
  
  <Box
  sx={{
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    justifyContent: "center",
    gap: 3,
   mb:6,
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
    <LockIcon sx={{ fontSize: 60, color: "#000" }} />
    <Typography variant="h6" fontWeight="bold" color="text.primary" mt={1} gutterBottom>
      Posez une question à un enseignant
    </Typography>
    <Typography variant="body1" color="text.primary" mb={2}>
       Un enseignant vous recontactera via la messagerie intégrée pour vous aider.
    </Typography>
    <Button
      variant="contained"
      color="primary"
      onClick={() => navigate("/student/support-request")}
    >
      cliquez sur Soutien+
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
    <SupportAgentIcon sx={{ fontSize: 60, color: "#fff" }} />
    <Typography variant="h6" fontWeight="bold" color="white" mt={1} gutterBottom>
      Accompagnement 24h/24
    </Typography>
    <Typography variant="body1" color="white" mb={2}>
     Échangez avec un enseignant expérimenté,  recevez des explications claires et détaillées sur vos exercices et vos difficultés.
    </Typography>
    <Button
      variant="contained"
      sx={{ backgroundColor: "#1565C0" }}
      onClick={() => navigate("/student/support-request")}
    >
      Cliquez sur Soutien+
    </Button>
  </Box>
</Box>
  
  
  
  
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
  variant="outlined"
  sx={{
    mt: 2,
    backgroundColor: "#f9f9f9",
    borderRadius: 2,
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '& fieldset': {
        borderColor: '#c2185b',
      },
      '&:hover fieldset': {
        borderColor: '#ad1457',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#880e4f',
        borderWidth: 2,
      },
    },
    '& .MuiInputLabel-root': {
      color: '#880e4f',
      fontWeight: 'bold',
    },
    '& .MuiInputBase-input': {
      fontFamily: 'Courier New, Courier, monospace',
    },
  }}
/>


    <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit} disabled={loading}>
      Envoyer
    </Button>

    {loading && <Box mt={3}><CircularProgress /><Typography mt={1}>Analyse en cours...</Typography></Box>}
    {message && <Alert severity="error" sx={{ mt: 3 }}>{message}</Alert>}

{response && (
  <Box mt={4}>
    <Typography variant="h6" gutterBottom>
      Réponse de l'IA :
    </Typography>
    <Box
      sx={{
        mt: 2,
        backgroundColor: "#1e3a8a",
        color: "#fff",
        p: 3,
        borderRadius: 2,
        fontFamily: "Courier New, monospace",
        whiteSpace: "pre-line",
        minHeight: 100,
      }}
    >
      {typedText}
    </Box>
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
  sx={{ mt: 3, mr: 2 }}
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
         <Typography mt={1}>Traitement Mathpix OCR...</Typography>
        </Box>
      )}

      {ocrError && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {ocrError}
        </Alert>
      )}

     {ocrResponse && (
  <Box mt={4} sx={{ backgroundColor: '#263238', p: 3, borderRadius: 2 }}>
    <Typography variant="h6" color="white"> Réponse IA :</Typography>
    <Typography
      sx={{
        whiteSpace: "pre-line",
        mt: 1,
        fontFamily: "Courier New, monospace",
        color: "white",
        minHeight: 100,
      }}
    >
      {typedOCR}
    </Typography>
  </Box>
)}





    </Box>
  </Box>
</Box>


   <Box sx={{ backgroundColor: '#fce4ec', py: 6, px: { xs: 2, md: 6 } }}>
  <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4}>
    Ressources Premium
  </Typography>

  {/* QUOTAS MODERNES */}
  {quotas && (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        mb: 5,
        backgroundColor: "#fff8e1",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h6" fontWeight="bold" color="#c2185b" mb={1}>
        Quotas Restants ce mois-ci
      </Typography>

      <Grid container spacing={2}>
        {[
          { label: "Livres", value: quotas.booksRemaining, color: "#f48fb1" },
          { label: "Sujets", value: quotas.examsRemaining, color: "#fff176" },
          { label: "Corrections", value: quotas.correctionsRemaining, color: "#ce93d8" },
          { label: "Questions IA", value: quotas.iaTextRemaining, color: "#a5d6a7" },
          { label: "IA Images", value: quotas.iaImageRemaining, color: "#b39ddb" },
        ].map((item, index) => (
          <Grid item xs={6} sm={4} md={2.4} key={index}>
            <Card
              sx={{
                background: item.color,
                textAlign: "center",
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography fontWeight="bold">{item.label}</Typography>
              <Typography variant="h5">{item.value}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )}

  {/* ONGLET MODERNISÉ */}
  <Box sx={{ backgroundColor: "#fff", p: 3, borderRadius: 3, boxShadow: 2 }}>
    <Tabs
      value={tabIndex}
      onChange={handleTabChange}
      centered
      variant="fullWidth"
      sx={{
        backgroundColor: "#c2185b",
        borderRadius: 2,
        mb: 4,
      }}
      TabIndicatorProps={{ style: { backgroundColor: "#fff" } }}
    >
      <Tab label="LIVRES" sx={{ color: "#fff", fontWeight: "bold" }} />
      <Tab label="SUJETS CORRIGÉS" sx={{ color: "#fff", fontWeight: "bold" }} />
      <Tab label="VIDÉOS" sx={{ color: "#fff", fontWeight: "bold" }} />
    </Tabs>

    {tabIndex === 0 && (
      <Grid container spacing={3}>
        {livres.map((livre, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <BookCard book={livre} isPremiumUser />
          </Grid>
        ))}
      </Grid>
    )}

    {tabIndex === 1 && (
      <Grid container spacing={3}>
        {exams.map((exam) => (
          <Grid item xs={12} md={6} lg={4} key={exam._id}>
            <ExamCard
              exam={exam}
              onDownloadSubject={handleDownloadSubject}
              onDownloadCorrection={handleDownloadCorrection}
              isPremiumUser={isPremiumUser}
            />
          </Grid>
        ))}
      </Grid>
    )}

    {tabIndex === 2 && (
      <Grid container spacing={3}>
        {videos.map((video, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <VideoCardPremium video={video} isPremiumUser={isPremiumUser} />
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
</Box>

      
    </PageLayout>
  );
};

export default PremiumFahimtaPage;
