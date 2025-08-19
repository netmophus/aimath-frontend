
// import React, { useState } from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   Box,
//   Button,
//   Divider,
// } from "@mui/material";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import { useNavigate } from "react-router-dom";
// import API from "../../api";

// // 🔁 Fonction pour convertir l’URL en format iframe embed
// const getEmbedUrl = (url) => {
//   const match = url.match(/(?:youtu\.be\/|v=)([^&?/]+)/);
//   return match ? `https://www.youtube.com/embed/${match[1]}` : null;
// };

// const VideoCardGratuit = ({ video }) => {
//   const navigate = useNavigate();
//   const [showMainIframe, setShowMainIframe] = useState(false);
//   const [shownParts, setShownParts] = useState([]); // tableau d’index des vidéos ouvertes

//   const handleMainToggle = async () => {
//     if (!showMainIframe) {
//       try {
//         await API.get(`/ia/gratuit/${video._id}/video`);
//       } catch (err) {
//         console.error("Erreur de visualisation :", err);
//       }
//     }
//     setShowMainIframe(!showMainIframe);
//   };

//   const handlePartToggle = (index) => {
//     setShownParts((prev) =>
//       prev.includes(index)
//         ? prev.filter((i) => i !== index)
//         : [...prev, index]
//     );
//   };

//   return (
//     <Card
//       sx={{
//         mb: 3,
//         display: "flex",
//         flexDirection: "column",
//         borderRadius: 3,
//         boxShadow: 3,
//       }}
//     >
//       {video.thumbnail && (
//         <img
//           src={video.thumbnail}
//           alt="Miniature"
//           style={{
//             width: "100%",
//             height: 180,
//             objectFit: "cover",
//             borderTopLeftRadius: "12px",
//             borderTopRightRadius: "12px",
//           }}
//         />
//       )}

//       <CardContent>
//         <Typography variant="h6" fontWeight="bold" gutterBottom>
//             {video.title}
//             {showMainIframe && (
//                 <Typography
//                 variant="caption"
//                 color="success.main"
//                 sx={{ ml: 1, fontWeight: "normal" }}
//                 >
//                 🎬 Lecture en cours
//                 </Typography>
//             )}
//             </Typography>


//         <Typography variant="body2" color="text.secondary">
//           Niveau : {video.level?.toUpperCase()}
//         </Typography>

//         <Typography variant="body2" mt={1}>
//           {video.description.length > 200
//             ? video.description.substring(0, 200) + "..."
//             : video.description}
//         </Typography>

//         <Typography variant="caption" display="block" mt={1}>
//           Accès : {video.badge === "gratuit" ? "🎁 Gratuit" : "🔒 Prenuim"}
//         </Typography>

//         <Box display="flex" alignItems="center" mt={1}>
//           <VisibilityIcon sx={{ fontSize: 18, color: "#999", mr: 0.5 }} />
//           <Typography variant="caption" color="text.secondary">
//             {video.viewCount || 0} visualisation{video.viewCount > 1 ? "s" : ""}
//           </Typography>
//         </Box>

//         {/* ✅ Vidéo principale */}
//         <Box mt={2} textAlign="center">
//           {video.badge === "gratuit" ? (
//             <>
//               <Button
//                 variant="contained"
//                 color={showMainIframe ? "error" : "success"}
//                 onClick={handleMainToggle}
//               >
//                 {showMainIframe ? "🔽 Masquer l’introduction" : "▶️ Visualiser l’introduction"}
//               </Button>
//               {showMainIframe && (
//                 <Box mt={2}>
//                   <iframe
//                     width="100%"
//                     height="250"
//                     src={getEmbedUrl(video.videoUrl)}
//                     title={video.title}
//                     frameBorder="0"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                     style={{ borderRadius: "8px" }}
//                   ></iframe>
//                 </Box>
//               )}
//             </>
//           ) : (
//             <>
//               <Typography variant="body2" color="error" gutterBottom>
//                 Cette vidéo est réservée aux membres Prenuim.
//               </Typography>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={() => navigate("/pricing")}
//               >
//                 🔓 Débloquer l'accès
//               </Button>
//             </>
//           )}
//         </Box>

//         {/* 🔽 Vidéos supplémentaires */}
//         {Array.isArray(video.videosSupplementaires) &&
//           video.videosSupplementaires.length > 0 && (
//             <Box mt={4}>
//               <Divider sx={{ mb: 2 }} />
//               <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//                 📚 Parties du cours :
//               </Typography>

//               {video.videosSupplementaires.map((part, index) => {
//                 const isOpen = shownParts.includes(index);
//                 return (
//                   <Box
//                     key={index}
//                     sx={{
//                       border: "1px solid #ddd",
//                       borderRadius: 2,
//                       p: 2,
//                       mb: 2,
//                       backgroundColor: "#f9f9f9",
//                     }}
//                   >
//                    <Typography variant="body2" fontWeight="bold">
//                     🔹 {part.title || `Partie ${index + 1}`}{" "}
//                     {shownParts.includes(index) && (
//                         <Typography
//                         variant="caption"
//                         component="span"
//                         color="success.main"
//                         sx={{ ml: 1, fontWeight: "normal" }}
//                         >
//                         🎬 Lecture en cours
//                         </Typography>
//                     )}
//                     </Typography>


//                     <Button
//                       variant="outlined"
//                       color={isOpen ? "error" : "success"}
//                       size="small"
//                       sx={{ mt: 1 }}
//                       onClick={() => handlePartToggle(index)}
//                     >
//                       {isOpen ? "🔽 Masquer" : "▶️ Visualiser"}
//                     </Button>

//                     {isOpen && (
//                       <Box mt={2}>
//                         <iframe
//                           width="100%"
//                           height="220"
//                           src={getEmbedUrl(part.videoUrl)}
//                           title={part.title}
//                           frameBorder="0"
//                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                           allowFullScreen
//                           style={{ borderRadius: "8px" }}
//                         ></iframe>
//                       </Box>
//                     )}
//                   </Box>
//                 );
//               })}
//             </Box>
//           )}
//       </CardContent>
//     </Card>
//   );
// };

// export default VideoCardGratuit;



// components/gratuit/VideoCardGratuit.jsx
import React, { useCallback, useMemo, useState } from "react";
import {
  Card, CardContent, Typography, Box, Button, Divider, Chip, Stack,
  Accordion, AccordionSummary, AccordionDetails, Tooltip
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import { useNavigate } from "react-router-dom";
import API from "../../api";

/* -------- utils -------- */
const getYouTubeId = (url = "") => {
  const r = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/))([A-Za-z0-9_-]{6,})/i;
  const m = url.match(r);
  return m ? m[1] : null;
};
const getEmbedUrl = (url) => {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
};
const pluralize = (n, one, many) => `${n} ${n > 1 ? many : one}`;

const SafeText = ({ text = "", max = 260 }) => {
  const t = String(text || "");
  return (
    <Typography variant="body2" sx={{ mt: 1 }}>
      {t.length > max ? `${t.slice(0, max)}…` : t}
    </Typography>
  );
};

const VideoCardGratuit = ({ video = {} }) => {
  const navigate = useNavigate();
  const [showMain, setShowMain] = useState(false);
  const [openParts, setOpenParts] = useState({});
  const [isTickingView, setIsTickingView] = useState(false);

  const isFree = useMemo(() => (video?.badge || "").toLowerCase() === "gratuit", [video?.badge]);
  const levelLabel = (video?.level || "").toUpperCase() || "NIVEAU N/D";
  const embedMain = useMemo(() => (isFree ? getEmbedUrl(video?.videoUrl) : null), [isFree, video?.videoUrl]);

  const toggleMain = useCallback(async () => {
    if (!isFree) return navigate("/pricing");
    if (!showMain && !isTickingView) {
      try {
        setIsTickingView(true);
        await API.get(`/ia/gratuit/${video._id}/video`);
      } catch (_) {} finally { setIsTickingView(false); }
    }
    setShowMain((s) => !s);
  }, [isFree, showMain, isTickingView, video?._id, navigate]);

  const togglePart = useCallback((idx) => {
    if (!isFree) return navigate("/pricing");
    setOpenParts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, [isFree, navigate]);

  return (
    <Card
      elevation={4}
      sx={{
        display: "grid",
        // 📐 La vidéo prend plus de place : ≥ 50% (même 60% en md)
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1.2fr 1fr",  // ≈ 55% / 45%
          md: "1.6fr 1fr",  // ≈ 62% / 38%
        },
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* Colonne vidéo (gauche) */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "#0b1220",
          minHeight: { xs: 200, sm: 260 }, // assure une belle hauteur
          display: "grid",
          placeItems: "center",
        }}
      >
        {/* Si lecture → iframe ; sinon miniature */}
        {isFree && showMain && embedMain ? (
          <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
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
            {video?.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video?.title || "Miniature vidéo"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            ) : (
              <Box sx={{ color: "#cbd5e1", textAlign: "center", p: 2 }}>
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
                  bgcolor: "#ffb300",
                  color: "#000",
                  px: 6,
                  py: 0.5,
                  fontWeight: 800,
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
              onClick={toggleMain}
              sx={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.18)", cursor: "pointer", transition: "background 200ms",
                "&:hover": { bgcolor: "rgba(0,0,0,0.28)" }
              }}
            >
              <Box
                sx={{
                  width: 72, height: 72, borderRadius: "50%",
                  bgcolor: isFree ? "#ff1744" : "#1565C0",
                  boxShadow: 4, display: "grid", placeItems: "center"
                }}
              >
                {isFree ? (
                  <PlayArrowRoundedIcon sx={{ color: "#fff", fontSize: 42 }} />
                ) : (
                  <LockRoundedIcon sx={{ color: "#fff", fontSize: 30 }} />
                )}
              </Box>
            </Box>

            {/* Verrou coin pour Premium */}
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

      {/* Colonne contenu (droite) */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {video?.title || "Sans titre"}
            {isFree && showMain && <Chip size="small" label="Lecture en cours" color="success" sx={{ ml: 1 }} />}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
            <Chip
              size="small"
              label={isFree ? "Gratuit" : "Premium"}
              color={isFree ? "success" : "warning"}
              variant={isFree ? "filled" : "outlined"}
            />
            <Chip size="small" label={levelLabel} variant="outlined" />
          </Stack>

          {!!video?.description && <SafeText text={video.description} />}

          <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 1 }}>
            <VisibilityIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {pluralize(video?.viewCount || 0, "visualisation", "visualisations")}
            </Typography>
          </Box>

          {/* Actions (sans bouton Détails) */}
          <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
            {isFree ? (
              <Button variant="contained" color={showMain ? "error" : "success"} onClick={toggleMain}>
                {showMain ? "Masquer l’introduction" : "Regarder l’introduction"}
              </Button>
            ) : (
              <Button variant="contained" color="primary" onClick={() => navigate("/pricing")}>
                Débloquer l’accès
              </Button>
            )}
          </Stack>

          {/* Parties supplémentaires */}
          {Array.isArray(video?.videosSupplementaires) && video.videosSupplementaires.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                📚 Parties du cours
              </Typography>

              {!isFree && (
                <Box sx={{ p: 2, border: "1px dashed #e0e0e0", borderRadius: 2, mb: 1, bgcolor: "#fafafa" }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Cette section est réservée aux membres Premium.
                  </Typography>
                  <Button size="small" variant="contained" onClick={() => navigate("/pricing")}>
                    Débloquer l’accès
                  </Button>
                </Box>
              )}

              {video.videosSupplementaires.map((part, index) => {
                const open = !!openParts[index];
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
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {!isFree && <LockRoundedIcon fontSize="small" />} {part?.title || `Partie ${index + 1}`}
                      </Typography>
                      {open && isFree && <Chip label="Lecture en cours" size="small" color="success" sx={{ ml: 1 }} />}
                    </AccordionSummary>
                    <AccordionDetails>
                      {isFree ? (
                        <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 1, overflow: "hidden" }}>
                          <iframe
                            src={getEmbedUrl(part?.videoUrl)}
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
      </Box>
    </Card>
  );
};

export default VideoCardGratuit;
