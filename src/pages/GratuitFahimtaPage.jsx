// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Tabs,
//   Tab,
//   Typography,
 
//   Button,
//   TextField,
//   CircularProgress,
//   Alert,
//   Grid,
// } from "@mui/material";
// import PageLayout from "../components/PageLayout";

// import API from "../api"; // Assure-toi que le chemin est correct

// import { useNavigate } from "react-router-dom"; // tout en haut
// import BookCardGratuit from "../components/gratuit/BookCardGratuit";
// import ExamCardGratuit from "../components/gratuit/ExamCardGratuit";
// import VideoCardGratuit from "../components/gratuit/VideoCardGratuit";
// import LockIcon from "@mui/icons-material/Lock";
// import SupportAgentIcon from "@mui/icons-material/SupportAgent";

// const GratuitPage = () => {
//   const [tabIndex, setTabIndex] = useState(0);
// const [livres, setLivres] = useState([]);
// const [exams, setExams] = useState([]);
// const navigate = useNavigate();
// const [videos, setVideos] = useState([]);



//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState("");
//   const [message, setMessage] = useState("");
// const [messages, setMessages] = useState([]);

//   const [typedResponse, setTypedResponse] = useState("");


//  useEffect(() => {
//   const last = messages[messages.length - 1];

//   if (!last || last.role !== "ia") return;

//   let index = 0;
//   setTypedResponse("");

//   const interval = setInterval(() => {
//     setTypedResponse((prev) => prev + last.text.charAt(index));
//     index++;
//     if (index >= last.text.length) clearInterval(interval);
//   }, 15);

//   return () => clearInterval(interval);
// }, [messages]);


//   const handleTabChange = (event, newValue) => {
//     setTabIndex(newValue);
//   };



// useEffect(() => {
//   const fetchLivres = async () => {
//     try {
//       const res = await API.get("/ia/gratuit");
//       setLivres(res.data);
//     } catch (err) {
//       console.error("Erreur lors du chargement des livres :", err.message);
//     }
//   };

//   const fetchExams = async () => {
//     try {
//       const res = await API.get("/exams");
//       setExams(res.data);
//     } catch (err) {
//       console.error("Erreur lors du chargement des sujets :", err.message);
//     }
//   };

//    const fetchVideos = async () => {
//     try {
//       const res = await API.get("/videos");
//       setVideos(res.data);
//     } catch (err) {
//       console.error("Erreur lors du chargement des vidéos :", err.message);
//     }
//   };

//   fetchLivres();
//   fetchExams();
//   fetchVideos();
// }, []);



// const handleSubmit = async () => {
//   if (!input.trim()) return;

//   setMessages((prev) => [...prev, { role: "user", text: input }]);
//   setLoading(true);
//   setMessage("");
//   setResponse("");
//   setInput("");

//   try {
//     const res = await API.post("/ia/gratuit", { input });

//     setMessages((prev) => [...prev, { role: "ia", text: res.data.response }]);
//   } catch (err) {
//     const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
//     setMessage(errorMessage);

//     setMessages((prev) => [
//       ...prev,
//       { role: "ia", text: "❌ Une erreur est survenue. Essaie plus tard." },
//     ]);

//     if (err.response?.data?.redirectTo) {
//       setTimeout(() => {
//         window.location.href = err.response.data.redirectTo;
//       }, 2500);
//     }
//   } finally {
//     setLoading(false);
//   }
// };


//   return (
// <PageLayout>



// <Box
//   sx={{
//     display: "flex",
//     flexDirection: { xs: "column", md: "row" },
//     justifyContent: "center",
//     gap: 3,
//     mt: 11,
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
//     <LockIcon sx={{ fontSize: 50, color: "#000" }} />
//     <Typography variant="h6" fontWeight="bold" color="text.primary" mt={1} gutterBottom>
//       Assistance complète
//     </Typography>
//     <Typography variant="body1" color="text.primary" mb={2}>
//       Soumettez vos exercices, posez vos questions en texte, audio ou visio et recevez une assistance personnalisée.
//     </Typography>
//     <Button
//       variant="contained"
//       color="primary"
//       onClick={() => navigate("/pricing")} // Ou "#pricing" si c'est une ancre dans la même page
//     >
//       Abonnez-vous
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
//     <SupportAgentIcon sx={{ fontSize: 50, color: "#fff" }} />
//     <Typography variant="h6" fontWeight="bold" color="white" mt={1} gutterBottom>
//       Accompagnement 24h/24
//     </Typography>
//     <Typography variant="body1" color="white" mb={2}>
//       Accédez à l’IA et aux enseignants qualifiés à toute heure, pour un soutien continu dans votre apprentissage en mathematiques.
//     </Typography>
//     <Button
//       variant="contained"
//       sx={{ backgroundColor: "#1565C0" }}
//       onClick={() => navigate("/pricing")}
//     >
//       Abonnez-vous
//     </Button>
//   </Box>
// </Box>









//   {/* ➤ Bloc IA en haut */}
// <Box
//   sx={{
//     py: { xs: 6, md: 8 },
//     px: { xs: 2, sm: 4, md: 10 },
//     mt: 5,
//     background: 'linear-gradient(90deg, #e3f2fd 0%, #f8fbff 100%)',
//     borderRadius: 4,
//     boxShadow: 3,
//     mx: 'auto',
//     maxWidth: '1200px',
//   }}
// >
//   <Typography
//     variant="h3"
//     fontWeight="bold"
//     textAlign="center"
//     sx={{ color: '#0f172a' }}
//   >
//     Tester Fahimta AI
//   </Typography>

  

//  <Typography variant="h5" gutterBottom>
//         Vous pouvez poser vos questions en mathematiques 
//       </Typography>


// <TextField
//   label="💬 Pose ta question ici..."
//   fullWidth
//   multiline
//   rows={4}
//   variant="outlined"
//   value={input}
//   onChange={(e) => setInput(e.target.value)}
//   sx={{
//     mt: 3,
//     backgroundColor: "#ffffff",
//     borderRadius: 2,
//     boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
//     '& .MuiOutlinedInput-root': {
//       '& fieldset': {
//         borderColor: "#90caf9",
//         borderWidth: "2px",
//       },
//       '&:hover fieldset': {
//         borderColor: "#1976d2",
//       },
//       '&.Mui-focused fieldset': {
//         borderColor: "#1565c0",
//       },
//     },
//     '& .MuiInputLabel-root': {
//       color: '#1565c0',
//       fontWeight: 'bold',
//     },
//   }}
// />





//       {/* ✅ Exemple en bas, petit et centré */}
// <Typography
//   variant="caption"
//   textAlign="center"
//   display="block" 
//   color="text.secondary"
//   mt={1}
// >
//   Exemple : "Expliquez-moi les limites en Terminale C" ou "C’est quoi une fonction dérivable ?"
// </Typography>

//       <Button
//         variant="contained"
//         sx={{ mt: 2 }}
//         onClick={handleSubmit}
//         disabled={loading}
//       >
//         Envoyer
//       </Button>

//       {loading && (
//         <Box mt={3}>
//           <CircularProgress />
//           <Typography mt={1}>Analyse en cours...</Typography>
//         </Box>
//       )}

//       {message && (
//         <Alert severity="error" sx={{ mt: 3 }}>
//           {message}
//         </Alert>
//       )}

// {messages.length > 0 && (
//   <Box mt={4}>
//     {messages.map((msg, index) => (
//       <Box
//         key={index}
//         sx={{
//           backgroundColor: msg.role === "user" ? "#e3f2fd" : "#0d47a1",
//           color: msg.role === "user" ? "#000" : "#fff",
//           p: 2,
//           borderRadius: 2,
//           mb: 2,
//           fontFamily: "Courier New, monospace",
//           boxShadow: 2,
//           whiteSpace: "pre-line",
//         }}
//       >
//         <Typography variant="subtitle2" gutterBottom>
//           {msg.role === "user" ? "🙋‍♂️ Toi :" : "Fahimta AI :"}
//         </Typography>
//         <Typography>
//   {msg.role === "ia" && index === messages.length - 1
//     ? typedResponse
//     : msg.text}
// </Typography>

//       </Box>
//     ))}
//   </Box>
// )}



// </Box>


//   {/* ➤ Bloc Ressources Mathématiques */}
//   <Box sx={{ backgroundColor: '#f5f7fa', py: 6, px: { xs: 2, md: 6 } }}>
//     <Typography variant="h2" fontWeight="bold" textAlign="center" mb={4}>
//       Ressources Mathématiques
//     </Typography>

//     <Tabs
//       value={tabIndex}
//       onChange={handleTabChange}
//       centered
//       variant="fullWidth"
//       sx={{
//         backgroundColor: '#1976D2',
//         borderRadius: 2,
//         mb: 4,
//       }}
//       TabIndicatorProps={{ style: { backgroundColor: '#fff' } }}
//     >
//       <Tab
//         label="LIVRES"
//         sx={{
//           color: '#fff',
//           fontWeight: 'bold',
//           '&.Mui-selected': { color: '#fff' },
//         }}
//       />
//       <Tab
//         label="SUJETS CORRIGÉS"
//         sx={{
//           color: '#fff',
//           fontWeight: 'bold',
//           '&.Mui-selected': { color: '#fff' },
//         }}
//       />
//       <Tab
//         label="VIDÉOS DE FORMATION"
//         sx={{
//           color: '#fff',
//           fontWeight: 'bold',
//           '&.Mui-selected': { color: '#fff' },
//         }}
//       />
//     </Tabs>

//     {/* ➤ Section de contenu dynamique selon l’onglet */}
//   {tabIndex === 0 && (
//   <Grid container spacing={3}>
//     {livres.map((livre, i) => (
//       <Grid item xs={12} sm={6} md={4} key={i}>
//         <BookCardGratuit book={livre} />
//       </Grid>
//     ))}
//   </Grid>
// )}


// {tabIndex === 1 && (
//   <Grid container spacing={3}>
//     {exams.map((exam) => (
//       <Grid item xs={12} sm={6} md={4} key={exam._id}>
//         <ExamCardGratuit exam={exam} />
//       </Grid>
//     ))}
//   </Grid>
// )}

// {tabIndex === 2 && (
//   <Box display="flex" justifyContent="center" px={2}>
//     <Box
//       width="100%"
//       maxWidth="1400px"
//       sx={{
//         px: { xs: 1, sm: 2, md: 4 },
//         mt: 2,
//       }}
//     >
//       <Grid container spacing={{ xs: 2, sm: 3 }}>
//         {videos.map((video, index) => (
//           <Grid
//             item
//             xs={12}         // ✅ 1 carte par ligne sur mobile
//             sm={6}          // ✅ 2 cartes par ligne en small
//             md={4}          // ✅ 3 cartes par ligne en medium+
//             key={index}
//           >
//             <VideoCardGratuit video={video} />
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   </Box>
// )}







//   </Box>
// </PageLayout>


//   );
// };

// export default GratuitPage;



// pages/GratuitPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Skeleton,
  Stack,
  useMediaQuery,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PageLayout from "../components/PageLayout";
import API from "../api";
import { useNavigate } from "react-router-dom";

import SearchIcon from "@mui/icons-material/Search";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LockIcon from "@mui/icons-material/Lock";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import BookCardGratuit from "../components/gratuit/BookCardGratuit";
import ExamCardGratuit from "../components/gratuit/ExamCardGratuit";
import VideoCardGratuit from "../components/gratuit/VideoCardGratuit";

/* ---------- util ---------- */
const timeTypingMs = 15;
const fmtReset = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : null);

const TabLabel = ({ label, count }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
    <Box
      component="span"
      sx={{
        px: 1,
        py: 0.2,
        fontSize: 12,
        lineHeight: 1.2,
        borderRadius: 1,
        bgcolor: "rgba(255,255,255,0.18)",
        color: "#fff",
        fontWeight: 700,
      }}
    >
      {count}
    </Box>
  </Stack>
);

const GratuitPage = () => {
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [tabIndex, setTabIndex] = useState(0);
  const [livres, setLivres] = useState([]);
  const [exams, setExams] = useState([]);
  const [videos, setVideos] = useState([]);

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [errBooks, setErrBooks] = useState("");
  const [errExams, setErrExams] = useState("");
  const [errVideos, setErrVideos] = useState("");

  // IA
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typedResponse, setTypedResponse] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  // Filtre
  const [q, setQ] = useState("");

  // Quota (frontend-only)
  const [remaining, setRemaining] = useState(null); // inconnu au départ
  const [maxFree, setMaxFree] = useState(5);
  const [resetAt, setResetAt] = useState(null);
  const [checkingQuota, setCheckingQuota] = useState(false);

  useEffect(() => {
    // Optional peek quota; ignore si route absente
    let mounted = true;
    (async () => {
      setCheckingQuota(true);
      try {
        const r = await API.get("/ia/gratuit/quota"); // peut ne pas exister; pas grave
        if (!mounted) return;
        if (r?.data) {
          setRemaining(r.data.remaining);
          setMaxFree(r.data.max ?? 5);
          setResetAt(r.data.resetAt ?? null);
          localStorage.setItem(
            "ia_quota_hint",
            JSON.stringify({
              remaining: r.data.remaining,
              max: r.data.max ?? 5,
              resetAt: r.data.resetAt ?? null,
            })
          );
        }
      } catch {
        // si 404: on tente un hint local
        const cached = localStorage.getItem("ia_quota_hint");
        if (mounted && cached) {
          const hint = JSON.parse(cached);
          setRemaining(hint.remaining ?? null);
          setMaxFree(hint.max ?? 5);
          setResetAt(hint.resetAt ?? null);
        }
      } finally {
        mounted && setCheckingQuota(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const fetchAll = async () => {
      try {
        setLoadingBooks(true);
        const r = await API.get("/ia/gratuit");
        if (active) {
          setLivres(Array.isArray(r.data) ? r.data : []);
          setErrBooks("");
        }
      } catch (e) {
        if (active) setErrBooks("Erreur lors du chargement des livres.");
      } finally {
        if (active) setLoadingBooks(false);
      }

      try {
        setLoadingExams(true);
        const r = await API.get("/exams");
        if (active) {
          setExams(Array.isArray(r.data) ? r.data : []);
          setErrExams("");
        }
      } catch (e) {
        if (active) setErrExams("Erreur lors du chargement des sujets.");
      } finally {
        if (active) setLoadingExams(false);
      }

      try {
        setLoadingVideos(true);
        const r = await API.get("/videos");
        if (active) {
          setVideos(Array.isArray(r.data) ? r.data : []);
          setErrVideos("");
        }
      } catch (e) {
        if (active) setErrVideos("Erreur lors du chargement des vidéos.");
      } finally {
        if (active) setLoadingVideos(false);
      }
    };

    fetchAll();
    return () => {
      active = false;
    };
  }, []);

  // Effet machine à écrire sur le dernier message IA
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "ia") return;

    setTypedResponse("");
    let i = 0;
    const id = setInterval(() => {
      setTypedResponse((prev) => prev + last.text.slice(i, i + 1));
      i += 1;
      if (i >= last.text.length) clearInterval(id);
    }, timeTypingMs);

    return () => clearInterval(id);
  }, [messages]);

  const handleTabChange = (_e, v) => setTabIndex(v);

  const handleSubmitAI = async () => {
    if (!input.trim()) return;

    // Si on sait déjà qu'il n'y a plus de crédits
    if (remaining === 0) {
      setAiError(
        `Limite d’essais gratuits atteinte. ${
          resetAt ? `Réinitialisation le ${fmtReset(resetAt)}.` : ""
        }`
      );
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setLoadingAI(true);
    setAiError("");
    const ask = input;
    setInput("");

    try {
      const r = await API.post("/ia/gratuit/gtp", { input: ask });
      const text = r?.data?.response || "Réponse indisponible.";
      setMessages((prev) => [...prev, { role: "ia", text }]);

      // Met à jour le compteur si le backend le renvoie
      if (typeof r?.data?.remaining !== "undefined") {
        setRemaining(r.data.remaining);
        if (typeof r?.data?.max !== "undefined") setMaxFree(r.data.max);
        if (typeof r?.data?.resetAt !== "undefined") setResetAt(r.data.resetAt);
        localStorage.setItem(
          "ia_quota_hint",
          JSON.stringify({
            remaining: r.data.remaining,
            max: r.data.max ?? 5,
            resetAt: r.data.resetAt ?? null,
          })
        );
      }
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;

      // 429: limite atteinte
      if (status === 429) {
        setRemaining(data?.remaining ?? 0);
        if (typeof data?.max !== "undefined") setMaxFree(data.max);
        if (typeof data?.resetAt !== "undefined") setResetAt(data.resetAt);

        setAiError(
          data?.message ||
            `Limite d’essais gratuits atteinte. ${
              data?.resetAt ? `Réinitialisation le ${fmtReset(data.resetAt)}.` : ""
            }`
        );
        // Option: message IA "verrou"
        setMessages((prev) => [
          ...prev,
          { role: "ia", text: "🔒 Limite gratuite atteinte. Découvre nos offres pour continuer." },
        ]);
      } else {
        const m = data?.message || "Une erreur est survenue.";
        setAiError(m);
        setMessages((prev) => [
          ...prev,
          { role: "ia", text: "❌ Une erreur est survenue. Essaie plus tard." },
        ]);
      }
    } finally {
      setLoadingAI(false);
    }
  };

  // Filtres simples (nom/titre)
  const filterFn = (x) => {
    if (!q.trim()) return true;
    const s = q.toLowerCase();
    const keys = ["title", "name", "nom", "matiere", "classe"];
    return keys.some((k) => String(x?.[k] || "").toLowerCase().includes(s));
  };

  const filteredLivres = useMemo(() => livres.filter(filterFn), [livres, q]);
  const filteredExams = useMemo(() => exams.filter(filterFn), [exams, q]);
  const filteredVideos = useMemo(() => videos.filter(filterFn), [videos, q]);

  const renderSkeletonGrid = (n = 6) => (
    <Grid container spacing={3}>
      {Array.from({ length: n }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Skeleton variant="rectangular" height={140} />
            <Skeleton sx={{ mt: 1 }} width="85%" />
            <Skeleton width="70%" />
            <Skeleton width="60%" />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <PageLayout>
      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "#0b1220",
          color: "#fff",
          py: { xs: 6, md: 8 },
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={downMd ? "column" : "row"}
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant={downMd ? "h4" : "h3"} fontWeight={800}>
                Les maths, c’est facile avec Fahimta
              </Typography>
              <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.85)" }}>
                Pose tes questions à l’IA, explore des livres, sujets corrigés
                et vidéos — tout en libre accès.
              </Typography>

              <Stack
                direction={downMd ? "column" : "row"}
                spacing={2}
                sx={{ mt: 3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={1} alignItems="center" textAlign="center">
                    <LockIcon />
                    <Typography fontWeight={700}>Assistance complète</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Soumets tes exercices, pose des questions en texte, audio
                      ou visio.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/pricing")}
                      sx={{ bgcolor: "#FDC830", color: "#000", fontWeight: 800 }}
                    >
                      S’abonner
                    </Button>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    bgcolor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 2,
                  }}
                >
                  <Stack spacing={1} alignItems="center" textAlign="center">
                    <SupportAgentIcon />
                    <Typography fontWeight={700}>
                      Accompagnement 24h/24
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Accède à l’IA et aux enseignants à toute heure.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/pricing")}
                      sx={{
                        bgcolor: "primary.main",
                        fontWeight: 800,
                      }}
                    >
                      Découvrir les offres
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Box>

            <Box
              sx={{
                flex: 1,
                width: "100%",
                maxWidth: 520,
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 3,
                p: 2,
                border: "1px solid rgba(255,255,255,0.15)",
                backdropFilter: "blur(6px)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <AutoAwesomeIcon />
                <Typography fontWeight={800}>Tester Fahimta AI</Typography>
              </Stack>

              {/* Bandeau quota */}
              {(checkingQuota || remaining !== null) && (
                <Box
                  sx={{
                    mt: 1.5,
                    mb: 1,
                    p: 1.2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: remaining === 0 ? "#FDE68A" : "#CFFAFE",
                    bgcolor:
                      remaining === 0
                        ? "rgba(239,68,68,0.18)"
                        : "rgba(16,185,129,0.18)",
                    border: "1px solid",
                    borderColor:
                      remaining === 0
                        ? "rgba(239,68,68,0.35)"
                        : "rgba(16,185,129,0.35)",
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {checkingQuota
                      ? "Vérification du quota…"
                      : remaining === 0
                      ? `Plus de tests gratuits disponibles. ${
                          resetAt ? `Réinitialisation le ${fmtReset(resetAt)}.` : ""
                        }`
                      : `Il te reste ${remaining}/${maxFree} test${
                          maxFree > 1 ? "s" : ""
                        } gratuit${maxFree > 1 ? "s" : ""} ce mois-ci.`}
                  </Typography>
                  {remaining === 0 && (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => navigate("/pricing")}
                      sx={{ ml: "auto" }}
                    >
                      Voir les offres
                    </Button>
                  )}
                </Box>
              )}

              <TextField
                label="💬 Pose ta question ici..."
                fullWidth
                multiline
                rows={downMd ? 4 : 3}
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                sx={{
                  mt: 1.5,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fff",
                    borderRadius: 2,
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleSubmitAI}
                        disabled={loadingAI || !input.trim() || remaining === 0}
                      >
                        <SendRoundedIcon color="primary" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={remaining === 0}
              />

              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, opacity: 0.85 }}
              >
                Exemple : “Explique les limites en Terminale C” • “C’est quoi
                une fonction dérivable ?”
              </Typography>

              {loadingAI && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                  <CircularProgress size={18} />
                  <Typography>Analyse en cours…</Typography>
                </Stack>
              )}

              {!!aiError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {aiError}
                </Alert>
              )}

              {/* Messages */}
              <Box
                sx={{
                  mt: 2,
                  maxHeight: 260,
                  overflow: "auto",
                  pr: 1,
                }}
              >
                {messages.map((m, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1.2,
                      borderRadius: 2,
                      bgcolor: m.role === "user" ? "#e3f2fd" : "#0d47a1",
                      color: m.role === "user" ? "#000" : "#fff",
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {m.role === "user" ? "🙋‍♂️ Toi" : "Fahimta AI"}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                      {m.role === "ia" && i === messages.length - 1
                        ? typedResponse
                        : m.text}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              {/* Actions IA */}
              {messages.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    startIcon={<RestartAltIcon />}
                    onClick={() => {
                      setMessages([]);
                      setTypedResponse("");
                      setAiError("");
                    }}
                  >
                    Réinitialiser
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* RESSOURCES */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Barre de recherche + Tabs */}
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            borderRadius: 2,
            position: "sticky",
            top: 72,
            zIndex: 2,
            bgcolor: "#fff",
            border: "1px solid rgba(0,0,0,0.06)",
            mb: 3,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Tabs
              value={tabIndex}
              onChange={(_e, v) => setTabIndex(v)}
              TabIndicatorProps={{ style: { background: theme.palette.primary.main } }}
              sx={{
                "& .MuiTab-root": { fontWeight: 700 },
              }}
            >
              <Tab
                label={<TabLabel label="Livres" count={livres.length} />}
                id="tab-0"
                aria-controls="panel-0"
              />
              <Tab
                label={<TabLabel label="Sujets corrigés" count={exams.length} />}
                id="tab-1"
                aria-controls="panel-1"
              />
              <Tab
                label={<TabLabel label="Vidéos" count={videos.length} />}
                id="tab-2"
                aria-controls="panel-2"
              />
            </Tabs>

            <TextField
              placeholder="Rechercher (titre, matière, classe)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small"
              sx={{ minWidth: { xs: "100%", md: 360 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Paper>

        {/* Panel Livres */}
        <Box role="tabpanel" hidden={tabIndex !== 0} id="panel-0" aria-labelledby="tab-0">
          {loadingBooks ? (
            renderSkeletonGrid()
          ) : errBooks ? (
            <Alert severity="error">{errBooks}</Alert>
          ) : filteredLivres.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography>Aucun livre trouvé.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredLivres.map((livre, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <BookCardGratuit book={livre} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Panel Sujets */}
        <Box role="tabpanel" hidden={tabIndex !== 1} id="panel-1" aria-labelledby="tab-1">
          {loadingExams ? (
            renderSkeletonGrid()
          ) : errExams ? (
            <Alert severity="error">{errExams}</Alert>
          ) : filteredExams.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography>Aucun sujet trouvé.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredExams.map((exam) => (
                <Grid item xs={12} sm={6} md={4} key={exam._id}>
                  <ExamCardGratuit exam={exam} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Panel Vidéos */}
        <Box role="tabpanel" hidden={tabIndex !== 2} id="panel-2" aria-labelledby="tab-2">
          {loadingVideos ? (
            renderSkeletonGrid()
          ) : errVideos ? (
            <Alert severity="error">{errVideos}</Alert>
          ) : filteredVideos.length === 0 ? (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography>Aucune vidéo trouvée.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredVideos.map((video) => (
                <Grid item xs={12} sm={6} md={4} key={video._id || video.id}>
                  <VideoCardGratuit video={video} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Bandeau d’appel à l’action */}
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            textAlign: "center",
            bgcolor: "linear-gradient(90deg, #e3f2fd 0%, #f8fbff 100%)",
          }}
          elevation={0}
        >
          <Typography variant={downMd ? "h5" : "h4"} fontWeight={900}>
            Besoin d’aller plus loin ?
          </Typography>
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            Passe à la formule Premium pour bénéficier d’un accompagnement personnalisé en continu.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 2, fontWeight: 800 }}
            onClick={() => navigate("/pricing")}
          >
            Voir les offres
          </Button>
        </Paper>
      </Container>
    </PageLayout>
  );
};

export default GratuitPage;
