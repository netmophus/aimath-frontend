// // pages/PremiumFahimtaPage.jsx
// import React, { useState, useEffect, useContext } from "react";
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
//   Stack,
//   Container,
//   Chip,
//   IconButton,
//   Divider,
//   useMediaQuery,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import PageLayout from "../components/PageLayout";
// import API from "../api";
// import BookCard from "../components/premuim/BookCard";
// import ExamCard from "../components/premuim/ExamCard";
// import VideoCardPremium from "../components/premuim/VideoCardPremium";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// /* Icons */
// import LockIcon from "@mui/icons-material/Lock";
// import SupportAgentIcon from "@mui/icons-material/SupportAgent";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// import RestartAltIcon from "@mui/icons-material/RestartAlt";
// import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
// import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
// import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
// import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
// import SendRoundedIcon from "@mui/icons-material/SendRounded";

// /* ---------------- utils ---------------- */
// const typewriter = (text = "", setState, speed = 15) => {
//   setState("");
//   let i = 0;
//   const it = setInterval(() => {
//     setState((p) => p + text.charAt(i));
//     i += 1;
//     if (i >= text.length) clearInterval(it);
//   }, speed);
//   return it;
// };

// const QuotaPill = ({ label, value, bg }) => (
//   <Card
//     sx={{
//       background: bg,
//       textAlign: "center",
//       borderRadius: 2,
//       p: 2,
//       boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
//     }}
//   >
//     <Typography fontWeight={800} sx={{ letterSpacing: 0.3 }}>
//       {label}
//     </Typography>
//     <Typography variant="h5" sx={{ mt: 0.5 }}>
//       {value}
//     </Typography>
//   </Card>
// );

// const TabLabel = ({ text }) => (
//   <Typography sx={{ color: "#fff", fontWeight: 800 }}>{text}</Typography>
// );

// /* ---------------- page ---------------- */
// const PremiumFahimtaPage = () => {
//   const theme = useTheme();
//   const downMd = useMediaQuery(theme.breakpoints.down("md"));
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
//   const isPremiumUser = user?.isSubscribed === true;

//   // onglets ressources
//   const [tabIndex, setTabIndex] = useState(0);

//   // ressources
//   const [livres, setLivres] = useState([]);
//   const [exams, setExams] = useState([]);
//   const [videos, setVideos] = useState([]);

//   // IA (texte)
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState("");
//   const [typedText, setTypedText] = useState("");
//   const [message, setMessage] = useState("");

//   // OCR (image)
//   const [ocrImage, setOcrImage] = useState(null);
//   const [ocrResponse, setOcrResponse] = useState("");
//   const [typedOCR, setTypedOCR] = useState("");
//   const [ocrLoading, setOcrLoading] = useState(false);
//   const [ocrError, setOcrError] = useState("");

//   // quotas
//   const [quotas, setQuotas] = useState(null);

//   /* ---------- effets ---------- */
//   useEffect(() => {
//     if (!response) return;
//     const id = typewriter(response, setTypedText, 15);
//     return () => clearInterval(id);
//   }, [response]);

//   useEffect(() => {
//     if (!ocrResponse) return;
//     const id = typewriter(ocrResponse, setTypedOCR, 15);
//     return () => clearInterval(id);
//   }, [ocrResponse]);

//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [booksRes, examsRes, videosRes, quotasRes] = await Promise.all([
//           API.get("/premium"),
//           API.get("/exams"),
//           API.get("/videos"),
//           API.get("/usage/me"),
//         ]);
//         setLivres(booksRes.data);
//         setExams(examsRes.data);
//         setVideos(videosRes.data);
//         setQuotas(quotasRes.data);
//       } catch (err) {
//         console.error("Erreur chargement Premium :", err?.message);
//       }
//     };
//     fetchAll();
//   }, []);

//   /* ---------- handlers IA texte ---------- */
//   const handleSubmit = async () => {
//     if (!input.trim()) return;
//     setLoading(true);
//     setMessage("");
//     setResponse("");
//     setTypedText("");

//     try {
//       const res = await API.post("/ia/gtptxtprenuim", { input });
//       setResponse(res.data.response || "");
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
//       setMessage(errorMessage);
//       if (err.response?.data?.redirectTo) {
//         setTimeout(() => (window.location.href = err.response.data.redirectTo), 2500);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetIA = () => {
//     setInput("");
//     setMessage("");
//     setResponse("");
//     setTypedText("");
//   };

//   /* ---------- handlers OCR ---------- */
//   // const handleImageSubmit = async () => {
//   //   if (!ocrImage) return;

//   //   const formData = new FormData();
//   //   formData.append("image", ocrImage);

//   //   setOcrLoading(true);
//   //   setOcrError("");
//   //   setOcrResponse("");
//   //   setTypedOCR("");

//   //   try {
//   //     const res = await API.post("/ia/gpt", formData, {
//   //       headers: { "Content-Type": "multipart/form-data" },
//   //     });
//   //     setOcrResponse(res.data.response || "");
//   //   } catch (err) {
//   //     setOcrError(err.response?.data?.message || "Erreur lors du traitement de l’image");
//   //   } finally {
//   //     setOcrLoading(false);
//   //   }
//   // };




// // --- OCR (image)
// const handleImageSubmit = async () => {
//   if (!ocrImage) return;

//   // 1) Pré-check quotas (même clé que le backend)
//   if (quotas?.iaVisionRemaining === 0) {
//     setOcrError("Vous avez atteint la limite mensuelle d'images.");
//     return;
//   }
//   if (quotas?.iaVisionRemaining > 0 && quotas.iaVisionRemaining <= 3) {
//     setOcrError(`Attention : il ne vous reste plus que ${quotas.iaVisionRemaining} soumission(s) image ce mois-ci.`);
//     // (on continue quand même)
//   }

//   const formData = new FormData();
//   formData.append("image", ocrImage);

//   setOcrLoading(true);
//   setOcrError("");
//   setOcrResponse("");
//   setTypedOCR("");

//   try {
//     // 2) Token (si ton API n'a pas déjà un interceptor qui l'ajoute)
//     const token = localStorage.getItem("token");

//     // 3) Même route que le mobile + NE PAS forcer Content-Type
//     const res = await API.post("/ia/gpt", formData, {
//       headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//       timeout: 30000,
//     });

//     setOcrResponse(res.data.response || "");

//     // 4) Recharge les quotas après consommation
//     const { data: refreshed } = await API.get("/usage/me");
//     setQuotas(refreshed);
//   } catch (err) {
//     setOcrError(err.response?.data?.message || "Erreur lors du traitement de l’image");
//   } finally {
//     setOcrLoading(false);
//   }
// };
















//   const onDropFile = (e) => {
//     e.preventDefault();
//     const file = e.dataTransfer?.files?.[0];
//     if (file) setOcrImage(file);
//   };

//   const prevent = (e) => e.preventDefault();

//   /* ---------- downloads ---------- */
//   const handleDownloadSubject = async (examId) => {
//     try {
//       const res = await API.get(`/exams/${examId}/download-subject`);
//       window.open(res.data.downloadUrl, "_blank");
//     } catch (err) {
//       console.error("Erreur téléchargement sujet :", err?.message);
//       alert(err.response?.data?.message || "Erreur lors du téléchargement");
//     }
//   };

//   const handleDownloadCorrection = async (examId) => {
//     try {
//       const res = await API.get(`/exams/${examId}/download-correction`);
//       window.open(res.data.downloadUrl, "_blank");
//     } catch (err) {
//       console.error("Erreur téléchargement correction :", err?.message);
//       alert(err.response?.data?.message || "Erreur lors du téléchargement");
//     }
//   };

//   /* ---------- render ---------- */
//   return (
//     <PageLayout>
//       {/* HERO modernisé */}
//       <Box
//         sx={{
//           bgcolor: "linear-gradient(135deg, #fff5f8 0%, #f8fbff 100%)",
//           py: { xs: 4, md: 6 },
//           borderBottom: "1px solid rgba(0,0,0,0.06)",
//         }}
//       >
//         <Container maxWidth="lg">
//           <Stack
//             direction={downMd ? "column" : "row"}
//             alignItems="stretch"
//             spacing={3}
//           >
//             {/* Colonne gauche : CTA Premium */}
//             <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 3,
//                   borderRadius: 3,
//                   bgcolor: "#FFF",
//                   border: "1px solid rgba(0,0,0,0.06)",
//                 }}
//               >
//                 <Stack spacing={1} alignItems="flex-start">
//                   <Typography variant={downMd ? "h5" : "h4"} fontWeight={900} color="primary">
//                     Fahimta AI — Premium
//                   </Typography>
//                   <Typography sx={{ color: "text.secondary" }}>
//                     Résous des exercices étape par étape, soumets des photos d’énoncés et échange avec un enseignant.
//                   </Typography>
//                 </Stack>

//                 <Grid container spacing={2} sx={{ mt: 2, mb:6 }}>
//                   <Grid item xs={12} sm={6}>
//                     <Card
//                       sx={{
//                         p: 2,
//                         borderRadius: 3,
//                         bgcolor: "#FFE082",
//                         boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
//                         height: "100%",
//                       }}
//                     >
//                       <Stack spacing={1} alignItems="center" textAlign="center">
//                         <LockIcon sx={{ fontSize: 46, color: "#000" }} />
//                         <Typography fontWeight={800}>Parler à un enseignant</Typography>
//                         <Typography variant="body2" color="text.primary">
//                           Un enseignant te recontacte via la messagerie intégrée.
//                         </Typography>
//                         <Button
//                           variant="contained"
//                           color="primary"
//                           onClick={() => navigate("/student/support-request")}
//                           sx={{ mt: 1 }}
//                         >
//                           Soutien +
//                         </Button>
//                       </Stack>
//                     </Card>
//                   </Grid>

//                 </Grid>

//                 {/* Quotas */}
//                 {quotas && (
//                   <Paper
//                     elevation={0}
//                     sx={{
//                       mt: 3,
//                       p: 2,
//                       borderRadius: 2,
//                       bgcolor: "#fff8e1",
//                       border: "1px solid rgba(0,0,0,0.06)",
//                     }}
//                   >
//                     <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>
//                       Quotas restants ce mois-ci
//                     </Typography>
//                     <Grid container spacing={2}>
//                       {[
//                         { label: "Livres", value: quotas.booksRemaining, bg: "#F48FB1" },
//                         { label: "Sujets", value: quotas.examsRemaining, bg: "#FFF176" },
//                         { label: "Corrections", value: quotas.correctionsRemaining, bg: "#CE93D8" },
//                         { label: "Questions IA", value: quotas.iaTextRemaining, bg: "#A5D6A7" },
//                         { label: "IA Images", value: quotas.iaImageRemaining, bg: "#B39DDB" },
//                       ].map((q) => (
//                         <Grid item xs={6} sm={4} md={2.4} key={q.label}>
//                           <QuotaPill {...q} />
//                         </Grid>
//                       ))}
//                     </Grid>
//                   </Paper>
//                 )}
//               </Paper>
//             </Stack>

//             {/* Colonne droite : IA texte + OCR dans un même bloc */}
//             <Paper
//               elevation={0}
//               sx={{
//                 flex: 1,
//                 p: 2,
//                 borderRadius: 3,
//                 border: "1px solid rgba(0,0,0,0.06)",
//                 bgcolor: "#fff",
//               }}
//             >
//               <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
//                 <AutoAwesomeIcon color="primary" />
//                 <Typography fontWeight={800}>Résoudre avec l’IA</Typography>
//               </Stack>

//               {/* onglets locaux: Texte / Photo */}
//               <Tabs
//                 value={0}
//                 onChange={() => {}}
//                 sx={{
//                   "& .MuiTabs-flexContainer": { gap: 1 },
//                   "& .MuiTab-root": {
//                     bgcolor: "#0b1220",
//                     color: "#fff",
//                     borderRadius: 2,
//                     minHeight: 36,
//                     px: 2,
//                     textTransform: "none",
//                   },
//                 }}
//               >
//                 <Tab disableRipple label={<TabLabel text="Question texte" />} />
//                 <Tab disabled disableRipple label={<TabLabel text="Photo (OCR)" />} />
//               </Tabs>

//               {/* Texte */}
//               <Box sx={{ mt: 2 }}>
//                 <TextField
//                   label="Décris clairement ton exercice…"
//                   fullWidth
//                   multiline
//                   rows={downMd ? 4 : 3}
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   InputProps={{
//                     endAdornment: (
//                       <IconButton
//                         onClick={handleSubmit}
//                         disabled={loading || !input.trim()}
//                         edge="end"
//                       >
//                         <SendRoundedIcon color="primary" />
//                       </IconButton>
//                     ),
//                   }}
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       bgcolor: "#fafafa",
//                       borderRadius: 2,
//                     },
//                   }}
//                 />

//                 <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
//                   <Typography variant="caption" color="text.secondary">
//                     Ex.: “Résous pas à pas (2x - 5)/3 = 7” • “Comment factoriser x² - 5x + 6 ?”
//                   </Typography>
//                   <Button
//                     size="small"
//                     startIcon={<RestartAltIcon />}
//                     onClick={resetIA}
//                     sx={{ ml: "auto" }}
//                   >
//                     Réinitialiser
//                   </Button>
//                 </Stack>

//                 {loading && (
//                   <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 2 }}>
//                     <CircularProgress size={18} />
//                     <Typography>Analyse en cours…</Typography>
//                   </Stack>
//                 )}
//                 {!!message && (
//                   <Alert severity="error" sx={{ mt: 2 }}>
//                     {message}
//                   </Alert>
//                 )}

//                 {response && (
//                   <Box sx={{ mt: 2 }}>
//                     <Typography variant="subtitle1" fontWeight={800}>
//                       Réponse de l’IA :
//                     </Typography>
//                     <Box
//                       sx={{
//                         mt: 1,
//                         bgcolor: "#1e3a8a",
//                         color: "#fff",
//                         p: 2,
//                         borderRadius: 2,
//                         fontFamily: "Courier New, monospace",
//                         whiteSpace: "pre-line",
//                         minHeight: 100,
//                       }}
//                     >
//                       {typedText}
//                     </Box>
//                   </Box>
//                 )}
//               </Box>

//               <Divider sx={{ my: 3 }} />

//               {/* OCR */}
//               <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
//                 <ImageOutlinedIcon color="action" />
//                 <Typography fontWeight={800}>Soumettre une photo</Typography>
//                 <Chip label="Premium" size="small" color="warning" sx={{ ml: 1 }} />
//               </Stack>

//               <Box
//                 onDragOver={prevent}
//                 onDragEnter={prevent}
//                 onDrop={onDropFile}
//                 sx={{
//                   p: 2,
//                   border: "2px dashed #cbd5e1",
//                   borderRadius: 2,
//                   textAlign: "center",
//                   bgcolor: "#f9fafb",
//                 }}
//               >
//                 <Typography variant="body2" color="text.secondary">
//                   Glisse-dépose une image ici, ou sélectionne un fichier :
//                 </Typography>

//                 <Button
//                   component="label"
//                   variant="outlined"
//                   startIcon={<UploadRoundedIcon />}
//                   sx={{ mt: 1.5 }}
//                 >
//                   Choisir une image
//                   <input
//                     type="file"
//                     accept="image/*"
//                     hidden
//                     onChange={(e) => setOcrImage(e.target.files?.[0] || null)}
//                   />
//                 </Button>

//                 {ocrImage && (
//                   <Stack
//                     direction={downMd ? "column" : "row"}
//                     spacing={2}
//                     alignItems="center"
//                     sx={{ mt: 2 }}
//                   >
//                     <img
//                       src={URL.createObjectURL(ocrImage)}
//                       alt="aperçu"
//                       style={{
//                         maxWidth: downMd ? "100%" : 180,
//                         borderRadius: 8,
//                         display: "block",
//                       }}
//                     />
//                     <Stack direction="row" spacing={1} alignItems="center">
//                       <CheckCircleRoundedIcon color="success" />
//                       <Typography variant="body2">{ocrImage.name}</Typography>
//                     </Stack>
//                   </Stack>
//                 )}

//                 <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 2 }}>
//                   <Button
//                     variant="contained"
//                     color="secondary"
//                     onClick={handleImageSubmit}
//                     disabled={ocrLoading || !ocrImage}
//                   >
//                     Envoyer à l’IA
//                   </Button>
//                   {ocrLoading && <CircularProgress size={20} />}
//                 </Stack>

//                 {!!ocrError && (
//                   <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
//                     <ErrorOutlineRoundedIcon color="error" />
//                     <Typography color="error">{ocrError}</Typography>
//                   </Stack>
//                 )}

//                 {ocrResponse && (
//                   <Box sx={{ mt: 2, bgcolor: "#263238", p: 2, borderRadius: 2 }}>
//                     <Typography variant="subtitle1" color="white" fontWeight={800}>
//                       Réponse IA :
//                     </Typography>
//                     <Typography
//                       sx={{
//                         whiteSpace: "pre-line",
//                         mt: 1,
//                         fontFamily: "Courier New, monospace",
//                         color: "white",
//                         minHeight: 100,
//                       }}
//                     >
//                       {typedOCR}
//                     </Typography>
//                   </Box>
//                 )}
//               </Box>
//             </Paper>
//           </Stack>
//         </Container>
//       </Box>

//       {/* RESSOURCES Premium */}
//       <Container maxWidth="lg" sx={{ py: 6 }}>
//         <Paper
//           sx={{
//             p: 1.5,
//             borderRadius: 2,
//             position: "sticky",
//             top: 72,
//             zIndex: 2,
//             bgcolor: "#fff",
//             border: "1px solid rgba(0,0,0,0.06)",
//             mb: 3,
//           }}
//           elevation={0}
//         >
//           <Tabs
//             value={tabIndex}
//             onChange={(_, v) => setTabIndex(v)}
//             centered
//             variant="fullWidth"
//             sx={{
//               backgroundColor: "#c2185b",
//               borderRadius: 2,
//               "& .MuiTab-root": { color: "#fff", fontWeight: 800, textTransform: "none" },
//             }}
//             TabIndicatorProps={{ style: { backgroundColor: "#fff" } }}
//           >
//             <Tab label="Livres" />
//             <Tab label="Sujets corrigés" />
//             <Tab label="Vidéos" />
//           </Tabs>
//         </Paper>

//         {/* Livres */}
//         <Box role="tabpanel" hidden={tabIndex !== 0}>
//           <Grid container spacing={3}>
//             {livres.map((livre, i) => (
//               <Grid item xs={12} sm={6} md={4} key={i}>
//                 <BookCard book={livre} isPremiumUser />
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Sujets */}
//         <Box role="tabpanel" hidden={tabIndex !== 1}>
//           <Grid container spacing={3}>
//             {exams.map((exam) => (
//               <Grid item xs={12} md={6} lg={4} key={exam._id}>
//                 <ExamCard
//                   exam={exam}
//                   onDownloadSubject={handleDownloadSubject}
//                   onDownloadCorrection={handleDownloadCorrection}
//                   isPremiumUser={isPremiumUser}
//                 />
//               </Grid>
//             ))}
//           </Grid>
//         </Box>

//         {/* Vidéos */}
//         <Box role="tabpanel" hidden={tabIndex !== 2}>
//           <Grid container spacing={3}>
//             {videos.map((video, i) => (
//               <Grid item xs={12} sm={6} md={4} key={i}>
//                 <VideoCardPremium video={video} isPremiumUser={isPremiumUser} />
//               </Grid>
//             ))}
//           </Grid>
//         </Box>
//       </Container>
//     </PageLayout>
//   );
// };

// export default PremiumFahimtaPage;






// pages/PremiumFahimtaPage.jsx
import React, { useState, useEffect, useContext } from "react";
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
  Stack,
  Container,
  Chip,
  IconButton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PageLayout from "../components/PageLayout";
import API from "../api";
import BookCard from "../components/premuim/BookCard";
import ExamCard from "../components/premuim/ExamCard";
import VideoCardPremium from "../components/premuim/VideoCardPremium";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

/* Icons */
import LockIcon from "@mui/icons-material/Lock";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

/* ---------------- utils ---------------- */
const typewriter = (text = "", setState, speed = 15) => {
  setState("");
  let i = 0;
  const it = setInterval(() => {
    setState((p) => p + text.charAt(i));
    i += 1;
    if (i >= text.length) clearInterval(it);
  }, speed);
  return it;
};

// ✅ Uniformise les noms qui peuvent varier selon la version backend
const normalizeQuotas = (q = {}) => {
  const iaVisionRemaining =
    q.iaVisionRemaining ??
    q.iaGptVisionRemaining ??
    q.iaImageRemaining ??
    q.visionRemaining ??
    null;

  return { ...q, iaVisionRemaining };
};

const QuotaPill = ({ label, value, bg }) => (
  <Card
    sx={{
      background: bg,
      textAlign: "center",
      borderRadius: 2,
      p: 2,
      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    }}
  >
    <Typography fontWeight={800} sx={{ letterSpacing: 0.3 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ mt: 0.5 }}>
      {value}
    </Typography>
  </Card>
);

const TabLabel = ({ text }) => (
  <Typography sx={{ color: "#fff", fontWeight: 800 }}>{text}</Typography>
);

/* ---------------- page ---------------- */
const PremiumFahimtaPage = () => {
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isPremiumUser = user?.isSubscribed === true;

  // onglets ressources
  const [tabIndex, setTabIndex] = useState(0);

  // ressources
  const [livres, setLivres] = useState([]);
  const [exams, setExams] = useState([]);
  const [videos, setVideos] = useState([]);

  // IA (texte)
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [typedText, setTypedText] = useState("");
  const [message, setMessage] = useState("");

  // OCR (image)
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrResponse, setOcrResponse] = useState("");
  const [typedOCR, setTypedOCR] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");

  // quotas
  const [quotas, setQuotas] = useState(null);

  /* ---------- effets ---------- */
  useEffect(() => {
    if (!response) return;
    const id = typewriter(response, setTypedText, 15);
    return () => clearInterval(id);
  }, [response]);

  useEffect(() => {
    if (!ocrResponse) return;
    const id = typewriter(ocrResponse, setTypedOCR, 15);
    return () => clearInterval(id);
  }, [ocrResponse]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [booksRes, examsRes, videosRes, quotasRes] = await Promise.all([
          API.get("/premium"),
          API.get("/exams"),
          API.get("/videos"),
          API.get("/usage/me"),
        ]);
        setLivres(booksRes.data);
        setExams(examsRes.data);
        setVideos(videosRes.data);
        setQuotas(normalizeQuotas(quotasRes.data));
      } catch (err) {
        console.error("Erreur chargement Premium :", err?.message);
      }
    };
    fetchAll();
  }, []);

  /* ---------- handlers IA texte ---------- */
  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessage("");
    setResponse("");
    setTypedText("");

    try {
      const res = await API.post("/ia/gtptxtprenuim", { input });
      setResponse(res.data.response || "");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
      setMessage(errorMessage);
      if (err.response?.data?.redirectTo) {
        setTimeout(() => (window.location.href = err.response.data.redirectTo), 2500);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetIA = () => {
    setInput("");
    setMessage("");
    setResponse("");
    setTypedText("");
  };

  /* ---------- handlers OCR (VISION) ---------- */
  const handleImageSubmit = async () => {
    if (!ocrImage) return;

    const remaining = Number(quotas?.iaVisionRemaining ?? 0);
    if (remaining <= 0) {
      setOcrError("Vous avez atteint la limite mensuelle d'images.");
      return;
    }
    if (remaining > 0 && remaining <= 3) {
      setOcrError(
        `Attention : il ne vous reste plus que ${remaining} soumission(s) image ce mois-ci.`
      );
      // on continue quand même
    }

    const formData = new FormData();
    formData.append("image", ocrImage);

    setOcrLoading(true);
    setOcrError("");
    setOcrResponse("");
    setTypedOCR("");

    try {
      // Si ton API n’ajoute pas le token via un interceptor :
      const token = localStorage.getItem("token");

      const res = await API.post("/ia/gpt", formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        timeout: 30000,
      });

      setOcrResponse(res.data.response || "");

      // Recharger les quotas depuis l'API (et normaliser)
      const { data: refreshed } = await API.get("/usage/me");
      setQuotas(normalizeQuotas(refreshed));
    } catch (err) {
      setOcrError(err.response?.data?.message || "Erreur lors du traitement de l’image");
    } finally {
      setOcrLoading(false);
    }
  };

  const onDropFile = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) setOcrImage(file);
  };

  const prevent = (e) => e.preventDefault();

  /* ---------- downloads ---------- */
  const handleDownloadSubject = async (examId) => {
    try {
      const res = await API.get(`/exams/${examId}/download-subject`);
      window.open(res.data.downloadUrl, "_blank");
    } catch (err) {
      console.error("Erreur téléchargement sujet :", err?.message);
      alert(err.response?.data?.message || "Erreur lors du téléchargement");
    }
  };

  const handleDownloadCorrection = async (examId) => {
    try {
      const res = await API.get(`/exams/${examId}/download-correction`);
      window.open(res.data.downloadUrl, "_blank");
    } catch (err) {
      console.error("Erreur téléchargement correction :", err?.message);
      alert(err.response?.data?.message || "Erreur lors du téléchargement");
    }
  };

  /* ---------- render ---------- */
  return (
    <PageLayout>
      {/* HERO modernisé */}
      <Box
        sx={{
          bgcolor: "linear-gradient(135deg, #fff5f8 0%, #f8fbff 100%)",
          py: { xs: 4, md: 6 },
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Container maxWidth="lg">
          <Stack direction={downMd ? "column" : "row"} alignItems="stretch" spacing={3}>
            {/* Colonne gauche : CTA Premium + Quotas */}
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#FFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Stack spacing={1} alignItems="flex-start">
                  <Typography variant={downMd ? "h5" : "h4"} fontWeight={900} color="primary">
                    Fahimta AI — Premium
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    Résous des exercices étape par étape, soumets des photos d’énoncés et échange avec un enseignant.
                  </Typography>
                </Stack>

                <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "#FFE082",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                        height: "100%",
                      }}
                    >
                      <Stack spacing={1} alignItems="center" textAlign="center">
                        <LockIcon sx={{ fontSize: 46, color: "#000" }} />
                        <Typography fontWeight={800}>Parler à un enseignant</Typography>
                        <Typography variant="body2" color="text.primary">
                          Un enseignant te recontacte via la messagerie intégrée.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => navigate("/student/support-request")}
                          sx={{ mt: 1 }}
                        >
                          Soutien +
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>

                {/* Quotas */}
                {quotas && (
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 3,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#fff8e1",
                      border: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>
                      Quotas restants ce mois-ci
                    </Typography>
                    <Grid container spacing={2}>
                      {[
                        { label: "Livres", value: quotas.booksRemaining, bg: "#F48FB1" },
                        { label: "Sujets", value: quotas.examsRemaining, bg: "#FFF176" },
                        { label: "Corrections", value: quotas.correctionsRemaining, bg: "#CE93D8" },
                        { label: "Questions IA", value: quotas.iaTextRemaining, bg: "#A5D6A7" },
                        // 👇 clé vision uniformisée
                        { label: "IA (vision)", value: quotas.iaVisionRemaining, bg: "#B39DDB" },
                      ].map((q) => (
                        <Grid item xs={6} sm={4} md={2.4} key={q.label}>
                          <QuotaPill {...q} />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                )}
              </Paper>
            </Stack>

            {/* Colonne droite : IA texte + OCR */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.06)",
                bgcolor: "#fff",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <AutoAwesomeIcon color="primary" />
                <Typography fontWeight={800}>Résoudre avec l’IA</Typography>
              </Stack>

              {/* onglets locaux: Texte / Photo */}
              <Tabs
                value={0}
                onChange={() => {}}
                sx={{
                  "& .MuiTabs-flexContainer": { gap: 1 },
                  "& .MuiTab-root": {
                    bgcolor: "#0b1220",
                    color: "#fff",
                    borderRadius: 2,
                    minHeight: 36,
                    px: 2,
                    textTransform: "none",
                  },
                }}
              >
                <Tab disableRipple label={<TabLabel text="Question texte" />} />
                <Tab disabled disableRipple label={<TabLabel text="Photo (OCR)" />} />
              </Tabs>

              {/* Texte */}
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Décris clairement ton exercice…"
                  fullWidth
                  multiline
                  rows={downMd ? 4 : 3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={handleSubmit} disabled={loading || !input.trim()} edge="end">
                        <SendRoundedIcon color="primary" />
                      </IconButton>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "#fafafa",
                      borderRadius: 2,
                    },
                  }}
                />

                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ex.: “Résous pas à pas (2x - 5)/3 = 7” • “Comment factoriser x² - 5x + 6 ?”
                  </Typography>
                  <Button size="small" startIcon={<RestartAltIcon />} onClick={resetIA} sx={{ ml: "auto" }}>
                    Réinitialiser
                  </Button>
                </Stack>

                {loading && (
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 2 }}>
                    <CircularProgress size={18} />
                    <Typography>Analyse en cours…</Typography>
                  </Stack>
                )}
                {!!message && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {message}
                  </Alert>
                )}

                {response && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      Réponse de l’IA :
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        bgcolor: "#1e3a8a",
                        color: "#fff",
                        p: 2,
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

              <Divider sx={{ my: 3 }} />

              {/* OCR */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <ImageOutlinedIcon color="action" />
                <Typography fontWeight={800}>Soumettre une photo</Typography>
                <Chip label="Premium" size="small" color="warning" sx={{ ml: 1 }} />
                {quotas?.iaVisionRemaining != null && (
                  <Chip
                    size="small"
                    sx={{ ml: "auto" }}
                    label={`Reste: ${quotas.iaVisionRemaining} / mois`}
                  />
                )}
              </Stack>

              <Box
                onDragOver={prevent}
                onDragEnter={prevent}
                onDrop={onDropFile}
                sx={{
                  p: 2,
                  border: "2px dashed #cbd5e1",
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: "#f9fafb",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Glisse-dépose une image ici, ou sélectionne un fichier :
                </Typography>

                <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />} sx={{ mt: 1.5 }}>
                  Choisir une image
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setOcrImage(e.target.files?.[0] || null)}
                  />
                </Button>

                {ocrImage && (
                  <Stack
                    direction={downMd ? "column" : "row"}
                    spacing={2}
                    alignItems="center"
                    sx={{ mt: 2 }}
                  >
                    <img
                      src={URL.createObjectURL(ocrImage)}
                      alt="aperçu"
                      style={{
                        maxWidth: downMd ? "100%" : 180,
                        borderRadius: 8,
                        display: "block",
                      }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleRoundedIcon color="success" />
                      <Typography variant="body2">{ocrImage.name}</Typography>
                    </Stack>
                  </Stack>
                )}

                <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleImageSubmit}
                    disabled={ocrLoading || !ocrImage || Number(quotas?.iaVisionRemaining ?? 0) <= 0}
                  >
                    Envoyer à l’IA
                  </Button>
                  {ocrLoading && <CircularProgress size={20} />}
                </Stack>

                {!!ocrError && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <ErrorOutlineRoundedIcon color="error" />
                    <Typography color="error">{ocrError}</Typography>
                  </Stack>
                )}

                {ocrResponse && (
                  <Box sx={{ mt: 2, bgcolor: "#263238", p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" color="white" fontWeight={800}>
                      Réponse IA :
                    </Typography>
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
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* RESSOURCES Premium */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper
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
          elevation={0}
        >
          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            centered
            variant="fullWidth"
            sx={{
              backgroundColor: "#c2185b",
              borderRadius: 2,
              "& .MuiTab-root": { color: "#fff", fontWeight: 800, textTransform: "none" },
            }}
            TabIndicatorProps={{ style: { backgroundColor: "#fff" } }}
          >
            <Tab label="Livres" />
            <Tab label="Sujets corrigés" />
            <Tab label="Vidéos" />
          </Tabs>
        </Paper>

        {/* Livres */}
        <Box role="tabpanel" hidden={tabIndex !== 0}>
          <Grid container spacing={3}>
            {livres.map((livre, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <BookCard book={livre} isPremiumUser />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Sujets */}
        <Box role="tabpanel" hidden={tabIndex !== 1}>
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
        </Box>

        {/* Vidéos */}
        <Box role="tabpanel" hidden={tabIndex !== 2}>
          <Grid container spacing={3}>
            {videos.map((video, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <VideoCardPremium video={video} isPremiumUser={isPremiumUser} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default PremiumFahimtaPage;
