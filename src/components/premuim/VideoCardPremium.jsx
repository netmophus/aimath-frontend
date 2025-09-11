

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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import { useNavigate } from "react-router-dom";

/* ---------------- utils ---------------- */
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
const fmtLevel = (x) =>
  (String(x || "").trim().toUpperCase() || "NIVEAU N/D");
const SafeText = ({ text = "", max = 260 }) => {
  const t = String(text || "");
  return (
    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
      {t.length > max ? `${t.slice(0, max)}…` : t}
    </Typography>
  );
};

const VideoCardPremium = ({ video = {}, isPremiumUser }) => {
  const navigate = useNavigate();

  // ---------- états ----------
  const [showMain, setShowMain] = useState(false);
  const [openParts, setOpenParts] = useState({});
  const [copied, setCopied] = useState(false);

  // ---------- dérivés ----------
  const isFree = useMemo(
    () => String(video?.badge || "").toLowerCase() === "gratuit",
    [video?.badge]
  );
  const hasAccess = isFree || !!isPremiumUser;
  const levelLabel = fmtLevel(video?.level);
  const embedMain = useMemo(
    () => (hasAccess ? getEmbedUrl(video?.videoUrl) : null),
    [hasAccess, video?.videoUrl]
  );
  const thumbnail = video?.thumbnail || getFallbackThumb(video?.videoUrl);

  // ---------- actions ----------
  const toggleMain = useCallback(() => {
    if (!hasAccess) return navigate("/pricing");
    setShowMain((s) => !s);
  }, [hasAccess, navigate]);

  const togglePart = useCallback(
    (idx) => {
      if (!hasAccess) return navigate("/pricing");
      setOpenParts((prev) => ({ ...prev, [idx]: !prev[idx] }));
    },
    [hasAccess, navigate]
  );

  const openOnYouTube = useCallback(() => {
    if (video?.videoUrl) {
      window.open(video.videoUrl, "_blank", "noopener,noreferrer");
    }
  }, [video?.videoUrl]);

  const shareLink = useCallback(async () => {
    const url = video?.videoUrl || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: video?.title || "Vidéo", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1300);
      }
    } catch (_) {
      // ignore
    }
  }, [video?.videoUrl, video?.title]);

  // ---------- rendu ----------
  return (
    <Card
      elevation={6}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" },
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
        mb: 3,
      }}
    >
      {/* ---- Colonne média ---- */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "#0b1220",
          minHeight: { xs: 200, sm: 240 },
          display: "grid",
          placeItems: "center",
        }}
      >
        {hasAccess && showMain && embedMain ? (
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

            {/* Ruban Premium si non accessible */}
            {!hasAccess && !isFree && (
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
              aria-label={hasAccess ? "Lire l’introduction" : "Contenu réservé aux membres"}
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
                color={hasAccess ? "error" : "primary"}
                badgeContent={hasAccess ? "Intro" : "Lock"}
                overlap="circular"
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    bgcolor: hasAccess ? "#ff1744" : "#1565C0",
                    boxShadow: 4,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {hasAccess ? (
                    <PlayArrowRoundedIcon sx={{ color: "#fff", fontSize: 42 }} />
                  ) : (
                    <LockRoundedIcon sx={{ color: "#fff", fontSize: 30 }} />
                  )}
                </Box>
              </Badge>
            </Box>

            {/* Verrou coin (si non accessible) */}
            {!hasAccess && (
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

      {/* ---- Colonne contenu ---- */}
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
            {hasAccess && showMain && (
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
            {hasAccess ? (
              <Button
                variant="contained"
                color={showMain ? "error" : "success"}
                onClick={toggleMain}
              >
                {showMain ? "Masquer l’introduction" : "Regarder l’introduction"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/pricing")}
              >
                Débloquer l’accès
              </Button>
            )}
          </Stack>

          {/* Parties / chapitres */}
          {Array.isArray(video?.videosSupplementaires) &&
            video.videosSupplementaires.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Divider sx={{ mb: 1.5 }} />
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  📚 Parties du cours
                </Typography>

                {!hasAccess && (
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
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => navigate("/pricing")}
                    >
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
                      expanded={open && hasAccess}
                      onChange={() => togglePart(index)}
                      disableGutters
                      sx={{
                        border: "1px solid #eee",
                        borderRadius: 2,
                        mb: 1.2,
                        "&:before": { display: "none" },
                        opacity: hasAccess ? 1 : 0.6,
                        overflow: "hidden",
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {!hasAccess && <LockRoundedIcon fontSize="small" />}
                          <Chip
                            size="small"
                            label={`Partie ${index + 1}`}
                            sx={{ mr: 0.5 }}
                          />
                          {part?.title || `Chapitre ${index + 1}`}
                        </Typography>
                        {open && hasAccess && (
                          <Chip
                            label="Lecture en cours"
                            size="small"
                            color="success"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </AccordionSummary>
                      <AccordionDetails>
                        {hasAccess ? (
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

        {/* Barre d’info/actions bas */}
        <CardActions
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "rgba(0,0,0,0.02)",
            borderTop: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {video?.auteur || video?.author || "Auteur inconnu"}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {video?.duration && (
              <Chip
                size="small"
                label={video.duration}
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>
        </CardActions>
      </Box>
    </Card>
  );
};

export default VideoCardPremium;
