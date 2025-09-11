





// // components/gratuit/VideoCardGratuit.jsx
// import React, { useCallback, useMemo, useState } from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Button,
//   Divider,
//   Chip,
//   Stack,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Tooltip,
//   IconButton,
//   CardActions,
//   Badge,
// } from "@mui/material";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import LockRoundedIcon from "@mui/icons-material/LockRounded";
// import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
// import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
// import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
// import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
// import { useNavigate } from "react-router-dom";
// import API from "../../api";

// /* ---------------- utils ---------------- */
// const getYouTubeId = (url = "") => {
//   const r =
//     /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/i;
//   const m = String(url || "").match(r);
//   return m ? m[1] : null;
// };
// const getEmbedUrl = (url) => {
//   const id = getYouTubeId(url);
//   return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
// };
// const getFallbackThumb = (url) => {
//   const id = getYouTubeId(url);
//   return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
// };
// const pluralize = (n, one, many) => `${n} ${n > 1 ? many : one}`;
// const fmtLevel = (x) => (String(x || "").trim().toUpperCase() || "NIVEAU N/D");
// const SafeText = ({ text = "", max = 260 }) => {
//   const t = String(text || "");
//   return (
//     <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
//       {t.length > max ? `${t.slice(0, max)}…` : t}
//     </Typography>
//   );
// };

// const VideoCardGratuit = ({ video = {} }) => {
//   const navigate = useNavigate();

//   // ---------- états ----------
//   const [showMain, setShowMain] = useState(false);
//   const [openParts, setOpenParts] = useState({});
//   const [isTickingView, setIsTickingView] = useState(false);
//   const [copied, setCopied] = useState(false);

//   // ---------- dérivés ----------
//   const isFree = useMemo(
//     () => String(video && video.badge ? video.badge : "").toLowerCase() === "gratuit",
//     [video]
//   );
//   const levelLabel = fmtLevel(video && video.level);
//   const embedMain = useMemo(
//     () => (isFree ? getEmbedUrl(video && video.videoUrl) : null),
//     [isFree, video]
//   );

//   const thumbnail =
//     (video && video.thumbnail) || getFallbackThumb(video && video.videoUrl);

//   // ---------- actions ----------
//   const tickViewOnce = useCallback(
//     async (id) => {
//       if (!id || isTickingView) return;
//       try {
//         setIsTickingView(true);
//         await API.get(`/ia/gratuit/${id}/video`); // tick vue (backend existant)
//       } catch (_) {
//         // silencieux
//       } finally {
//         setIsTickingView(false);
//       }
//     },
//     [isTickingView]
//   );

//   const toggleMain = useCallback(async () => {
//     if (!isFree) return navigate("/pricing");
//     if (!showMain) await tickViewOnce(video && video._id);
//     setShowMain((s) => !s);
//   }, [isFree, navigate, showMain, tickViewOnce, video]);

//   const togglePart = useCallback(
//     (idx) => {
//       if (!isFree) return navigate("/pricing");
//       setOpenParts((prev) => ({ ...prev, [idx]: !prev[idx] }));
//     },
//     [isFree, navigate]
//   );

//   const openOnYouTube = useCallback(() => {
//     if (video && video.videoUrl) {
//       window.open(video.videoUrl, "_blank", "noopener,noreferrer");
//     }
//   }, [video]);

//   const shareLink = useCallback(async () => {
//     const url = (video && video.videoUrl) || window.location.href;
//     try {
//       if (navigator.share) {
//         await navigator.share({ title: video?.title || "Vidéo", url });
//       } else {
//         await navigator.clipboard.writeText(url);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1300);
//       }
//     } catch (_) {
//       // ignore
//     }
//   }, [video]);

//   // ---------- rendu ----------
//   return (
//     <Card
//       elevation={6}
//       sx={{
//         display: "grid",
//         gridTemplateColumns: { xs: "1fr", sm: "1.15fr 1fr", md: "1.6fr 1fr" },
//         borderRadius: 3,
//         overflow: "hidden",
//         background:
//           "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.98))",
//         backdropFilter: "blur(6px)",
//         border: "1px solid rgba(0,0,0,0.05)",
//         boxShadow:
//           "0 10px 30px rgba(2,16,40,0.10), 0 2px 6px rgba(2,16,40,0.06)",
//         transition: "transform 220ms ease, box-shadow 220ms ease",
//         "&:hover": {
//           transform: "translateY(-2px)",
//           boxShadow:
//             "0 16px 40px rgba(2,16,40,0.16), 0 4px 12px rgba(2,16,40,0.10)",
//         },
//       }}
//     >
//       {/* Colonne vidéo */}
//       <Box
//         sx={{
//           position: "relative",
//           bgcolor: "#0b1220",
//           minHeight: { xs: 200, sm: 260 },
//           display: "grid",
//           placeItems: "center",
//         }}
//       >
//         {/* Lecture inline */}
//         {isFree && showMain && embedMain ? (
//           <Box
//             sx={{
//               position: "relative",
//               width: "100%",
//               aspectRatio: "16/9",
//               background: "rgba(0,0,0,0.2)",
//             }}
//           >
//             <iframe
//               src={embedMain}
//               title={video?.title || "Lecture vidéo"}
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//               allowFullScreen
//               loading="lazy"
//               referrerPolicy="no-referrer-when-downgrade"
//               style={{ width: "100%", height: "100%" }}
//             />
//           </Box>
//         ) : (
//           <>
//             {thumbnail ? (
//               <img
//                 src={thumbnail}
//                 alt={video?.title || "Miniature vidéo"}
//                 style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                 loading="lazy"
//               />
//             ) : (
//               <Box
//                 sx={{
//                   color: "#cbd5e1",
//                   textAlign: "center",
//                   p: 2,
//                   width: "100%",
//                   height: "100%",
//                   display: "grid",
//                   placeItems: "center",
//                 }}
//               >
//                 <ImageNotSupportedRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
//                 <Typography variant="caption">Aucune miniature</Typography>
//               </Box>
//             )}

//             {/* Ruban Premium */}
//             {!isFree && (
//               <Box
//                 sx={{
//                   position: "absolute",
//                   top: 12,
//                   left: -40,
//                   transform: "rotate(-35deg)",
//                   bgcolor: "#FDC830",
//                   color: "#000",
//                   px: 6,
//                   py: 0.5,
//                   fontWeight: 900,
//                   boxShadow: 2,
//                   textTransform: "uppercase",
//                   letterSpacing: 0.5,
//                 }}
//               >
//                 Premium
//               </Box>
//             )}

//             {/* Overlay Play/Lock */}
//             <Box
//               role="button"
//               aria-label={isFree ? "Lire l’introduction" : "Contenu premium"}
//               tabIndex={0}
//               onClick={toggleMain}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter" || e.key === " ") toggleMain();
//               }}
//               sx={{
//                 position: "absolute",
//                 inset: 0,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 bgcolor: "rgba(0,0,0,0.18)",
//                 cursor: "pointer",
//                 transition: "background 200ms",
//                 "&:hover": { bgcolor: "rgba(0,0,0,0.28)" },
//               }}
//             >
//               <Badge
//                 color={isFree ? "error" : "primary"}
//                 badgeContent={isFree ? "Intro" : "Lock"}
//                 overlap="circular"
//               >
//                 <Box
//                   sx={{
//                     width: 72,
//                     height: 72,
//                     borderRadius: "50%",
//                     bgcolor: isFree ? "#ff1744" : "#1565C0",
//                     boxShadow: 4,
//                     display: "grid",
//                     placeItems: "center",
//                   }}
//                 >
//                   {isFree ? (
//                     <PlayArrowRoundedIcon sx={{ color: "#fff", fontSize: 42 }} />
//                   ) : (
//                     <LockRoundedIcon sx={{ color: "#fff", fontSize: 30 }} />
//                   )}
//                 </Box>
//               </Badge>
//             </Box>

//             {/* Verrou coin (Premium) */}
//             {!isFree && (
//               <Tooltip title="Réservé aux membres Premium">
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     right: 12,
//                     bottom: 12,
//                     width: 44,
//                     height: 44,
//                     borderRadius: "50%",
//                     bgcolor: "rgba(0,0,0,0.55)",
//                     display: "grid",
//                     placeItems: "center",
//                     color: "#fff",
//                     backdropFilter: "blur(2px)",
//                   }}
//                 >
//                   <LockRoundedIcon />
//                 </Box>
//               </Tooltip>
//             )}
//           </>
//         )}
//       </Box>

//       {/* Colonne contenu */}
//       <Box sx={{ display: "flex", flexDirection: "column" }}>
//         <CardContent sx={{ flex: 1 }}>
//           {/* Titre + chips */}
//           <Typography
//             variant="h6"
//             fontWeight="bold"
//             gutterBottom
//             sx={{ display: "flex", flexWrap: "wrap", gap: 1, pr: 6 }}
//           >
//             {video?.title || "Sans titre"}
//             {isFree && showMain && (
//               <Chip size="small" label="Lecture en cours" color="success" />
//             )}
//           </Typography>

//           <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
//             <Chip
//               size="small"
//               label={isFree ? "Gratuit" : "Premium"}
//               color={isFree ? "success" : "warning"}
//               variant={isFree ? "filled" : "outlined"}
//             />
//             <Chip size="small" label={levelLabel} variant="outlined" />
//             {video?.matiere && (
//               <Chip size="small" label={video.matiere} variant="outlined" />
//             )}
//             {video?.classe && (
//               <Chip size="small" label={video.classe} variant="outlined" />
//             )}
//             {Array.isArray(video?.tags) &&
//               video.tags.slice(0, 2).map((t, i) => (
//                 <Chip key={i} size="small" label={`#${t}`} variant="outlined" />
//               ))}
//           </Stack>

//           {!!video?.description && <SafeText text={video.description} />}

//           {/* Vue + actions rapides */}
//           <Stack
//             direction="row"
//             spacing={2}
//             alignItems="center"
//             sx={{ mt: 1.25, flexWrap: "wrap" }}
//           >
//             <Box display="flex" alignItems="center" gap={0.5}>
//               <VisibilityIcon sx={{ fontSize: 18, color: "text.secondary" }} />
//               <Typography variant="caption" color="text.secondary">
//                 {pluralize(video?.viewCount || 0, "visualisation", "visualisations")}
//               </Typography>
//             </Box>

//             <Stack
//               direction="row"
//               spacing={0.5}
//               alignItems="center"
//               sx={{ ml: "auto" }}
//             >
//               <Tooltip title="Ouvrir sur YouTube">
//                 <span>
//                   <IconButton size="small" onClick={openOnYouTube}>
//                     <OpenInNewRoundedIcon fontSize="small" />
//                   </IconButton>
//                 </span>
//               </Tooltip>

//               <Tooltip title={copied ? "Lien copié !" : "Partager / Copier le lien"}>
//                 <span>
//                   <IconButton size="small" onClick={shareLink}>
//                     <ShareRoundedIcon fontSize="small" />
//                   </IconButton>
//                 </span>
//               </Tooltip>

//               <Tooltip title="Ajouter à ma playlist (à venir)">
//                 <span>
//                   <IconButton size="small" disabled>
//                     <PlaylistAddRoundedIcon fontSize="small" />
//                   </IconButton>
//                 </span>
//               </Tooltip>
//             </Stack>
//           </Stack>

//           {/* CTA principal */}
//           <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
//             {isFree ? (
//               <Button
//                 variant="contained"
//                 color={showMain ? "error" : "success"}
//                 onClick={toggleMain}
//               >
//                 {showMain ? "Masquer l’introduction" : "Regarder l’introduction"}
//               </Button>
//             ) : (
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={() => navigate("/pricing")}
//               >
//                 Débloquer l’accès
//               </Button>
//             )}
//           </Stack>

//           {/* Parties / chapitres */}
//           {Array.isArray(video?.videosSupplementaires) &&
//             video.videosSupplementaires.length > 0 && (
//               <Box sx={{ mt: 3 }}>
//                 <Divider sx={{ mb: 2 }} />
//                 <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//                   📚 Parties du cours
//                 </Typography>

//                 {!isFree && (
//                   <Box
//                     sx={{
//                       p: 2,
//                       border: "1px dashed #e0e0e0",
//                       borderRadius: 2,
//                       mb: 1,
//                       bgcolor: "#fafafa",
//                     }}
//                   >
//                     <Typography variant="body2" sx={{ mb: 1 }}>
//                       Cette section est réservée aux membres Premium.
//                     </Typography>
//                     <Button
//                       size="small"
//                       variant="contained"
//                       onClick={() => navigate("/pricing")}
//                     >
//                       Débloquer l’accès
//                     </Button>
//                   </Box>
//                 )}

//                 {video.videosSupplementaires.map((part, index) => {
//                   const open = !!openParts[index];
//                   const embed = getEmbedUrl(part?.videoUrl);
//                   return (
//                     <Accordion
//                       key={index}
//                       expanded={open && isFree}
//                       onChange={() => togglePart(index)}
//                       disableGutters
//                       sx={{
//                         border: "1px solid #eee",
//                         borderRadius: 2,
//                         mb: 1.5,
//                         "&:before": { display: "none" },
//                         opacity: isFree ? 1 : 0.6,
//                         overflow: "hidden",
//                       }}
//                     >
//                       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
//                         <Typography
//                           variant="body2"
//                           fontWeight={700}
//                           sx={{ display: "flex", alignItems: "center", gap: 1 }}
//                         >
//                           {!isFree && <LockRoundedIcon fontSize="small" />}
//                           <Chip
//                             size="small"
//                             label={`Partie ${index + 1}`}
//                             sx={{ mr: 0.5 }}
//                           />
//                           {part?.title || `Chapitre ${index + 1}`}
//                         </Typography>
//                         {open && isFree && (
//                           <Chip
//                             label="Lecture en cours"
//                             size="small"
//                             color="success"
//                             sx={{ ml: 1 }}
//                           />
//                         )}
//                       </AccordionSummary>
//                       <AccordionDetails>
//                         {isFree ? (
//                           embed ? (
//                             <Box
//                               sx={{
//                                 position: "relative",
//                                 width: "100%",
//                                 aspectRatio: "16/9",
//                                 borderRadius: 1,
//                                 overflow: "hidden",
//                               }}
//                             >
//                               <iframe
//                                 src={embed}
//                                 title={part?.title || `Partie ${index + 1}`}
//                                 frameBorder="0"
//                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
//                                 allowFullScreen
//                                 loading="lazy"
//                                 referrerPolicy="no-referrer-when-downgrade"
//                                 style={{ width: "100%", height: "100%" }}
//                               />
//                             </Box>
//                           ) : (
//                             <Typography variant="body2" color="text.secondary">
//                               Vidéo non disponible.
//                             </Typography>
//                           )
//                         ) : (
//                           <Typography variant="body2" color="text.secondary">
//                             Contenu verrouillé.
//                           </Typography>
//                         )}
//                       </AccordionDetails>
//                     </Accordion>
//                   );
//                 })}
//               </Box>
//             )}
//         </CardContent>

//         {/* Action bar bas (fixe + clair) */}
//         <CardActions
//           sx={{
//             px: 2,
//             py: 1.5,
//             bgcolor: "rgba(0,0,0,0.02)",
//             borderTop: "1px solid rgba(0,0,0,0.06)",
//             display: "flex",
//             justifyContent: "space-between",
//           }}
//         >
//           <Typography variant="caption" color="text.secondary">
//             {video?.auteur || video?.author || "Auteur inconnu"}
//           </Typography>
//           {video?.duration && (
//             <Chip
//               size="small"
//               label={video.duration}
//               variant="outlined"
//               sx={{ fontWeight: 600 }}
//             />
//           )}
//         </CardActions>
//       </Box>
//     </Card>
//   );
// };

// export default VideoCardGratuit;






// components/gratuit/VideoCardGratuit.jsx
import React, { useCallback, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  CardActions,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
// import { useNavigate } from "react-router-dom";
import API from "../../api";

/* ---------------- utils ---------------- */
const PLAY_STORE_URL = "https://play.google.com/store/search?q=Fahimta&c=apps";

const getYouTubeId = (url = "") => {
  const r =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/i;
  const m = String(url || "").match(r);
  return m ? m[1] : null;
};
const getEmbedUrl = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
};
const getFallbackThumb = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
};
const pluralize = (n, one, many) => `${n} ${n > 1 ? many : one}`;
const fmtLevel = (x) => (String(x || "").trim().toUpperCase() || "NIVEAU N/D");
const SafeText = ({ text = "", max = 260 }) => {
  const t = String(text || "");
  return (
    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
      {t.length > max ? `${t.slice(0, max)}…` : t}
    </Typography>
  );
};

const VideoCardGratuit = ({ video = {} }) => {
  // const navigate = useNavigate();

  // ---------- états ----------
  const [showMain, setShowMain] = useState(false);
  const [openParts, setOpenParts] = useState({});
  const [isTickingView, setIsTickingView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openPricing, setOpenPricing] = useState(false);

  const openPricingModal = () => setOpenPricing(true);
  const closePricingModal = () => setOpenPricing(false);

  // ---------- dérivés ----------
  const isFree = useMemo(
    () => String(video && video.badge ? video.badge : "").toLowerCase() === "gratuit",
    [video]
  );
  const levelLabel = fmtLevel(video && video.level);
  const embedMain = useMemo(
    () => (isFree ? getEmbedUrl(video && video.videoUrl) : null),
    [isFree, video]
  );

  const thumbnail =
    (video && video.thumbnail) || getFallbackThumb(video && video.videoUrl);

  // ---------- actions ----------
  const tickViewOnce = useCallback(
    async (id) => {
      if (!id || isTickingView) return;
      try {
        setIsTickingView(true);
        await API.get(`/ia/gratuit/${id}/video`); // tick vue (backend existant)
      } catch {
        /* silencieux */
      } finally {
        setIsTickingView(false);
      }
    },
    [isTickingView]
  );

  const toggleMain = useCallback(async () => {
    if (!isFree) {
      openPricingModal();
      return;
    }
    if (!showMain) await tickViewOnce(video && video._id);
    setShowMain((s) => !s);
  }, [isFree, showMain, tickViewOnce, video]);

  const togglePart = useCallback(
    (idx) => {
      if (!isFree) {
        openPricingModal();
        return;
      }
      setOpenParts((prev) => ({ ...prev, [idx]: !prev[idx] }));
    },
    [isFree]
  );

  const openOnYouTube = useCallback(() => {
    if (video && video.videoUrl) {
      window.open(video.videoUrl, "_blank", "noopener,noreferrer");
    }
  }, [video]);

  const shareLink = useCallback(async () => {
    const url = (video && video.videoUrl) || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: video?.title || "Vidéo", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1300);
      }
    } catch {
      /* ignore */
    }
  }, [video]);

  // ---------- rendu ----------
  return (
    <>
      {/* Modal “Souscription via l’app mobile” */}
      <Dialog open={openPricing} onClose={closePricingModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Souscription</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Connectez-vous à votre <strong>application mobile Fahimta</strong> pour vous
            souscrire à votre abonnement.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            L’application mobile Fahimta est <strong>téléchargeable sur le Play Store</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closePricingModal}>Fermer</Button>
          <Button
            variant="contained"
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener"
            onClick={closePricingModal}
          >
            Ouvrir le Play Store
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        elevation={6}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1.15fr 1fr", md: "1.6fr 1fr" },
          borderRadius: 3,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.98))",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow:
            "0 10px 30px rgba(2,16,40,0.10), 0 2px 6px rgba(2,16,40,0.06)",
          transition: "transform 220ms ease, box-shadow 220ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              "0 16px 40px rgba(2,16,40,0.16), 0 4px 12px rgba(2,16,40,0.10)",
          },
        }}
      >
        {/* Colonne vidéo */}
        <Box
          sx={{
            position: "relative",
            bgcolor: "#0b1220",
            minHeight: { xs: 200, sm: 260 },
            display: "grid",
            placeItems: "center",
          }}
        >
          {/* Lecture inline */}
          {isFree && showMain && embedMain ? (
            <Box
              sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <iframe
                src={embedMain}
                title={video?.title || "Lecture vidéo"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ width: "100%", height: "100%" }}
              />
            </Box>
          ) : (
            <>
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={video?.title || "Miniature vidéo"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  loading="lazy"
                />
              ) : (
                <Box
                  sx={{
                    color: "#cbd5e1",
                    textAlign: "center",
                    p: 2,
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ImageNotSupportedRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="caption">Aucune miniature</Typography>
                </Box>
              )}

              {/* Ruban Premium */}
              {!isFree && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: -40,
                    transform: "rotate(-35deg)",
                    bgcolor: "#FDC830",
                    color: "#000",
                    px: 6,
                    py: 0.5,
                    fontWeight: 900,
                    boxShadow: 2,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Premium
                </Box>
              )}

              {/* Overlay Play/Lock */}
              <Box
                role="button"
                aria-label={isFree ? "Lire l’introduction" : "Contenu premium"}
                tabIndex={0}
                onClick={toggleMain}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleMain();
                }}
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(0,0,0,0.18)",
                  cursor: "pointer",
                  transition: "background 200ms",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.28)" },
                }}
              >
                <Badge
                  color={isFree ? "error" : "primary"}
                  badgeContent={isFree ? "Intro" : "Lock"}
                  overlap="circular"
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      bgcolor: isFree ? "#ff1744" : "#1565C0",
                      boxShadow: 4,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {isFree ? (
                      <PlayArrowRoundedIcon sx={{ color: "#fff", fontSize: 42 }} />
                    ) : (
                      <LockRoundedIcon sx={{ color: "#fff", fontSize: 30 }} />
                    )}
                  </Box>
                </Badge>
              </Box>

              {/* Verrou coin (Premium) */}
              {!isFree && (
                <Tooltip title="Réservé aux membres Premium">
                  <Box
                    sx={{
                      position: "absolute",
                      right: 12,
                      bottom: 12,
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      bgcolor: "rgba(0,0,0,0.55)",
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      backdropFilter: "blur(2px)",
                    }}
                  >
                    <LockRoundedIcon />
                  </Box>
                </Tooltip>
              )}
            </>
          )}
        </Box>

        {/* Colonne contenu */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: 1 }}>
            {/* Titre + chips */}
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ display: "flex", flexWrap: "wrap", gap: 1, pr: 6 }}
            >
              {video?.title || "Sans titre"}
              {isFree && showMain && (
                <Chip size="small" label="Lecture en cours" color="success" />
              )}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={isFree ? "Gratuit" : "Premium"}
                color={isFree ? "success" : "warning"}
                variant={isFree ? "filled" : "outlined"}
              />
              <Chip size="small" label={levelLabel} variant="outlined" />
              {video?.matiere && (
                <Chip size="small" label={video.matiere} variant="outlined" />
              )}
              {video?.classe && (
                <Chip size="small" label={video.classe} variant="outlined" />
              )}
              {Array.isArray(video?.tags) &&
                video.tags.slice(0, 2).map((t, i) => (
                  <Chip key={i} size="small" label={`#${t}`} variant="outlined" />
                ))}
            </Stack>

            {!!video?.description && <SafeText text={video.description} />}

            {/* Vue + actions rapides */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mt: 1.25, flexWrap: "wrap" }}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <VisibilityIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {pluralize(video?.viewCount || 0, "visualisation", "visualisations")}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ ml: "auto" }}
              >
                <Tooltip title="Ouvrir sur YouTube">
                  <span>
                    <IconButton size="small" onClick={openOnYouTube}>
                      <OpenInNewRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title={copied ? "Lien copié !" : "Partager / Copier le lien"}>
                  <span>
                    <IconButton size="small" onClick={shareLink}>
                      <ShareRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Ajouter à ma playlist (à venir)">
                  <span>
                    <IconButton size="small" disabled>
                      <PlaylistAddRoundedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>

            {/* CTA principal */}
            <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
              {isFree ? (
                <Button
                  variant="contained"
                  color={showMain ? "error" : "success"}
                  onClick={toggleMain}
                >
                  {showMain ? "Masquer l’introduction" : "Regarder l’introduction"}
                </Button>
              ) : (
                <Button variant="contained" color="primary" onClick={openPricingModal}>
                  Débloquer l’accès
                </Button>
              )}
            </Stack>

            {/* Parties / chapitres */}
            {Array.isArray(video?.videosSupplementaires) &&
              video.videosSupplementaires.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📚 Parties du cours
                  </Typography>

                  {!isFree && (
                    <Box
                      sx={{
                        p: 2,
                        border: "1px dashed #e0e0e0",
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Cette section est réservée aux membres Premium.
                      </Typography>
                      <Button size="small" variant="contained" onClick={openPricingModal}>
                        Débloquer l’accès
                      </Button>
                    </Box>
                  )}

                  {video.videosSupplementaires.map((part, index) => {
                    const open = !!openParts[index];
                    const embed = getEmbedUrl(part?.videoUrl);
                    return (
                      <Accordion
                        key={index}
                        expanded={open && isFree}
                        onChange={() => togglePart(index)}
                        disableGutters
                        sx={{
                          border: "1px solid #eee",
                          borderRadius: 2,
                          mb: 1.5,
                          "&:before": { display: "none" },
                          opacity: isFree ? 1 : 0.6,
                          overflow: "hidden",
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ display: "flex", alignItems: "center", gap: 1 }}
                          >
                            {!isFree && <LockRoundedIcon fontSize="small" />}
                            <Chip
                              size="small"
                              label={`Partie ${index + 1}`}
                              sx={{ mr: 0.5 }}
                            />
                            {part?.title || `Chapitre ${index + 1}`}
                          </Typography>
                          {open && isFree && (
                            <Chip
                              label="Lecture en cours"
                              size="small"
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </AccordionSummary>
                        <AccordionDetails>
                          {isFree ? (
                            embed ? (
                              <Box
                                sx={{
                                  position: "relative",
                                  width: "100%",
                                  aspectRatio: "16/9",
                                  borderRadius: 1,
                                  overflow: "hidden",
                                }}
                              >
                                <iframe
                                  src={embed}
                                  title={part?.title || `Partie ${index + 1}`}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                  allowFullScreen
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                  style={{ width: "100%", height: "100%" }}
                                />
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Vidéo non disponible.
                              </Typography>
                            )
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Contenu verrouillé.
                            </Typography>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    );
                  })}
                </Box>
              )}
          </CardContent>

          {/* Action bar bas (fixe + clair) */}
          <CardActions
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "rgba(0,0,0,0.02)",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {video?.auteur || video?.author || "Auteur inconnu"}
            </Typography>
            {video?.duration && (
              <Chip
                size="small"
                label={video.duration}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </CardActions>
        </Box>
      </Card>
    </>
  );
};

export default VideoCardGratuit;

