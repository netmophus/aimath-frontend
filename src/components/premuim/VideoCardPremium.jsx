

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

// const getEmbedUrl = (url) => {
//   const match = url.match(/(?:youtu\.be\/|v=)([^&?/]+)/);
//   return match ? `https://www.youtube.com/embed/${match[1]}` : null;
// };

// const VideoCardPremium = ({ video, isPremiumUser }) => {
//   const navigate = useNavigate();
//   const [showMainIframe, setShowMainIframe] = useState(false);
//   const [shownParts, setShownParts] = useState([]);

//   const hasAccess = video.badge === "gratuit" || isPremiumUser;

//   const handleMainToggle = () => {
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
//     <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
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
//           {video.title}
//           {showMainIframe && (
//             <Typography
//               variant="caption"
//               color="success.main"
//               sx={{ ml: 1, fontWeight: "normal" }}
//             >
//               🎬 Lecture en cours
//             </Typography>
//           )}
//         </Typography>

//         <Typography variant="body2" color="text.secondary">
//           Niveau : {video.level?.toUpperCase()}
//         </Typography>

//         <Typography variant="body2" mt={1}>
//           {video.description.length > 200
//             ? video.description.substring(0, 200) + "..."
//             : video.description}
//         </Typography>

//         <Typography variant="caption" display="block" mt={1}>
//           Accès : {video.badge === "gratuit" ? "🎁 Gratuit" : "🔒 Premium"}
//         </Typography>

//         <Box display="flex" alignItems="center" mt={1}>
//           <VisibilityIcon sx={{ fontSize: 18, color: "#999", mr: 0.5 }} />
//           <Typography variant="caption" color="text.secondary">
//             {video.viewCount || 0} visualisation{video.viewCount > 1 ? "s" : ""}
//           </Typography>
//         </Box>

//         {/* ✅ Vidéo principale */}
//         <Box mt={2} textAlign="center">
//           {hasAccess ? (
//             <>
//               <Button
//                 variant="contained"
//                 color={showMainIframe ? "error" : "success"}
//                 onClick={handleMainToggle}
//               >
//                 {showMainIframe
//                   ? "🔽 Masquer l’introduction"
//                   : "▶️ Visualiser l’introduction"}
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
//                 Cette vidéo est réservée aux membres Premium.
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

//         {/* 🔽 Vidéos secondaires */}
//         {Array.isArray(video.videosSupplementaires) &&
//           video.videosSupplementaires.length > 0 && hasAccess && (
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
//                     <Typography variant="body2" fontWeight="bold">
//                       🔹 {part.title || `Partie ${index + 1}`}{" "}
//                       {isOpen && (
//                         <Typography
//                           variant="caption"
//                           component="span"
//                           color="success.main"
//                           sx={{ ml: 1 }}
//                         >
//                           🎬 Lecture en cours
//                         </Typography>
//                       )}
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

// export default VideoCardPremium;




// components/premuim/VideoCardPremium.jsx
import React, { useMemo, useState, useCallback } from "react";
import {
  Card, CardContent, Typography, Box, Button, Divider, Chip, Stack,
  Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useNavigate } from "react-router-dom";

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

const VideoCardPremium = ({ video, isPremiumUser }) => {
  const navigate = useNavigate();
  const [showMain, setShowMain] = useState(false);
  const [openParts, setOpenParts] = useState({});

  const isFree = useMemo(() => (video?.badge || "").toLowerCase() === "gratuit", [video?.badge]);
  const hasAccess = isFree || !!isPremiumUser;
  const levelLabel = (video?.level || "").toUpperCase() || "NIVEAU N/D";
  const embedMain = useMemo(() => (hasAccess ? getEmbedUrl(video?.videoUrl) : null), [hasAccess, video?.videoUrl]);

  const toggleMain = useCallback(() => {
    if (!hasAccess) {
      navigate("/pricing");
      return;
    }
    setShowMain((s) => !s);
  }, [hasAccess, navigate]);

  const togglePart = useCallback((idx) => {
    if (!hasAccess) {
      navigate("/pricing");
      return;
    }
    setOpenParts((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, [hasAccess, navigate]);

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: 3,
        overflow: "hidden",
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // <= responsive 50/50
      }}
    >
      {/* ---- Zone média (prend + d'espace) ---- */}
      <Box
        sx={{
          position: "relative",
          flex: { xs: "1 1 auto", md: "1 1 55%" },     // ≈ 55% à partir de md
          minHeight: { xs: 200, sm: 220, md: 260 },
          bgcolor: "#0b1220",
        }}
      >
        {/* Iframe si lecture & accès */}
        {showMain && hasAccess && embedMain ? (
          <Box sx={{ position: "absolute", inset: 0 }}>
            <Box sx={{ position: "absolute", inset: 0, aspectRatio: "16/9", maxHeight: "100%" }}>
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
          </Box>
        ) : (
          // Thumbnail + overlay Play/Lock
          <Box sx={{ position: "absolute", inset: 0 }}>
            {video?.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video?.title || "Miniature vidéo"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            ) : (
              <Box
                sx={{
                  position: "absolute", inset: 0, display: "grid",
                  placeItems: "center", color: "#cbd5e1", fontWeight: 700
                }}
              >
                Aucune miniature
              </Box>
            )}

            <Box
              onClick={toggleMain}
              sx={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                bgcolor: "rgba(0,0,0,0.25)", cursor: "pointer",
                transition: "background 200ms",
                "&:hover": { bgcolor: "rgba(0,0,0,0.35)" }
              }}
            >
              <Box
                sx={{
                  width: 72, height: 72, borderRadius: "50%",
                  bgcolor: hasAccess ? "#ff1744" : "#1565C0",
                  boxShadow: 4, display: "grid", placeItems: "center"
                }}
              >
                {hasAccess ? (
                  <PlayArrowRoundedIcon sx={{ color: "#fff", fontSize: 44 }} />
                ) : (
                  <LockRoundedIcon sx={{ color: "#fff", fontSize: 30 }} />
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* ---- Zone texte / actions ---- */}
      <CardContent
        sx={{
          flex: { xs: "1 1 auto", md: "1 1 45%" },     // ≈ 45% à partir de md
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {video?.title || "Sans titre"}
          {showMain && hasAccess && (
            <Chip size="small" label="Lecture en cours" color="success" sx={{ ml: 1 }} />
          )}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 0.5, flexWrap: "wrap" }}>
          <Chip
            size="small"
            label={isFree ? "Gratuit" : "Premium"}
            color={isFree ? "success" : "warning"}
            variant={isFree ? "filled" : "outlined"}
          />
          <Chip size="small" label={levelLabel} variant="outlined" />
        </Stack>

        {!!video?.description && (
          <Typography variant="body2" color="text.secondary">
            {video.description.length > 220 ? `${video.description.slice(0, 220)}…` : video.description}
          </Typography>
        )}

        <Box display="flex" alignItems="center" gap={0.5}>
          <VisibilityIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {pluralize(video?.viewCount || 0, "visualisation", "visualisations")}
          </Typography>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
          {hasAccess ? (
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
          <Box sx={{ mt: 1 }}>
            <Divider sx={{ mb: 1.5 }} />
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              📚 Parties du cours
            </Typography>

            {!hasAccess && (
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
                  expanded={open && hasAccess}
                  onChange={() => togglePart(index)}
                  disableGutters
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: 2,
                    mb: 1.2,
                    "&:before": { display: "none" },
                    opacity: hasAccess ? 1 : 0.6,
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                      {!hasAccess && <LockRoundedIcon fontSize="small" />}
                      {part?.title || `Partie ${index + 1}`}
                    </Typography>
                    {open && hasAccess && (
                      <Chip label="Lecture en cours" size="small" color="success" sx={{ ml: 1 }} />
                    )}
                  </AccordionSummary>
                  <AccordionDetails>
                    {hasAccess ? (
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
    </Card>
  );
};

export default VideoCardPremium;
