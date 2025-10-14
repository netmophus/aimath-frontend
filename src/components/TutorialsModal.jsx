import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import SchoolIcon from "@mui/icons-material/School";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import API from "../api";

const TutorialsModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(false);

  // Charger les tutoriels depuis l'API
  useEffect(() => {
    if (open) {
      loadTutorials();
    }
  }, [open]);

  const loadTutorials = async () => {
    setLoading(true);
    try {
      const res = await API.get("/tutorials");
      setTutorials(res.data.tutorials || []);
    } catch (error) {
      console.error("Erreur chargement tutoriels:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour extraire l'ID Vimeo depuis différents formats
  const extractVimeoId = (vimeoUrlOrId) => {
    if (!vimeoUrlOrId) return "";
    
    // Si c'est déjà un ID simple (que des chiffres)
    if (/^\d+$/.test(vimeoUrlOrId)) {
      return vimeoUrlOrId;
    }
    
    // Extraire l'ID depuis différents formats de liens Vimeo
    const patterns = [
      /vimeo\.com\/(\d+)/,              // https://vimeo.com/123456789
      /vimeo\.com\/video\/(\d+)/,       // https://vimeo.com/video/123456789
      /player\.vimeo\.com\/video\/(\d+)/, // https://player.vimeo.com/video/123456789
    ];
    
    for (const pattern of patterns) {
      const match = vimeoUrlOrId.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // Si aucun pattern ne correspond, retourner tel quel
    return vimeoUrlOrId;
  };

  // Mapper les icônes
  const getIcon = (iconName) => {
    const icons = {
      PersonAdd: <PersonAddIcon sx={{ fontSize: 40 }} />,
      CreditCard: <CreditCardIcon sx={{ fontSize: 40 }} />,
      ChatBubbleOutline: <ChatBubbleOutlineIcon sx={{ fontSize: 40 }} />,
      CameraAlt: <CameraAltIcon sx={{ fontSize: 40 }} />,
      School: <SchoolIcon sx={{ fontSize: 40 }} />,
      MenuBook: <MenuBookIcon sx={{ fontSize: 40 }} />,
      PlayCircleOutline: <PlayCircleOutlineIcon sx={{ fontSize: 40 }} />,
      Assignment: <AssignmentIcon sx={{ fontSize: 40 }} />,
      HelpOutline: <HelpOutlineIcon sx={{ fontSize: 40 }} />,
    };
    return icons[iconName] || icons.HelpOutline;
  };

  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleVideoClick = (tutorial) => {
    setSelectedVideo(tutorial);
  };

  const handleBackToList = () => {
    setSelectedVideo(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: "linear-gradient(180deg, #0a0e1a 0%, #1a1f35 100%)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #0b3f8a 0%, #0f66c7 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <PlayCircleOutlineIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
          <Box>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={900}
              sx={{ lineHeight: 1.2 }}
            >
              🎥 Tutoriels Fahimta
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.8)", display: { xs: "none", sm: "block" } }}
            >
              Apprenez à utiliser toutes les fonctionnalités
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={selectedVideo ? handleBackToList : onClose}
          sx={{
            color: "#fff",
            "&:hover": { background: "rgba(255,255,255,0.1)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: { xs: "auto", sm: 500 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {!selectedVideo ? (
          // Liste des tutoriels
          <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.8)",
                mb: 3,
                textAlign: "center",
                fontSize: { xs: 14, sm: 16 },
              }}
            >
              Sélectionnez un tutoriel pour commencer
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: "#FFD700" }} />
              </Box>
            ) : tutorials.length === 0 ? (
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  textAlign: "center",
                  py: 8,
                }}
              >
                Aucun tutoriel disponible pour le moment
              </Typography>
            ) : (
              <Grid 
                container 
                spacing={{ xs: 2, sm: 2.5, md: 3 }}
                justifyContent="center"
                alignItems="stretch"
              >
                {tutorials.map((tutorial) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={tutorial.id}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Card
                    onClick={() => handleVideoClick(tutorial)}
                    sx={{
                      width: "100%",
                      maxWidth: { xs: "100%", sm: 320, md: 360 }, // Largeur maximale pour uniformité
                      height: { xs: 220, sm: 240, md: 260 }, // Hauteur FIXE pour toutes les cartes
                      borderRadius: 2,
                      cursor: "pointer",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 8px 24px ${tutorial.color}40`,
                        border: `1px solid ${tutorial.color}60`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 2, sm: 2.5 },
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 1.5,
                        flex: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5, flex: 1 }}>
                        {/* Icône */}
                        <Box
                          sx={{
                            width: { xs: 60, sm: 70 },
                            height: { xs: 60, sm: 70 },
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `linear-gradient(135deg, ${tutorial.color}30, ${tutorial.color}15)`,
                            color: tutorial.color,
                            border: `2px solid ${tutorial.color}50`,
                          }}
                        >
                          {getIcon(tutorial.icon)}
                        </Box>

                        {/* Titre */}
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          sx={{
                            color: "#fff",
                            fontSize: { xs: 13.5, sm: 14.5 },
                            lineHeight: 1.25,
                            height: { xs: 34, sm: 38 }, // Hauteur FIXE
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {tutorial.title}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: { xs: 11.5, sm: 12.5 },
                            lineHeight: 1.35,
                            height: { xs: 32, sm: 34 }, // Hauteur FIXE
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {tutorial.description}
                        </Typography>
                      </Box>

                      {/* Bouton play */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          color: tutorial.color,
                          fontWeight: 700,
                          fontSize: { xs: 13, sm: 14 },
                        }}
                      >
                        <PlayCircleOutlineIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                        Regarder
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                ))}
              </Grid>
            )}
          </Box>
        ) : (
          // Lecteur vidéo
          <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={800}
              sx={{
                color: "#fff",
                mb: 2,
                fontSize: { xs: 18, sm: 22 },
                textAlign: "center",
              }}
            >
              {selectedVideo.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "rgba(255,255,255,0.7)",
                mb: 3,
                fontSize: { xs: 13, sm: 14 },
                textAlign: "center",
              }}
            >
              {selectedVideo.description}
            </Typography>

            {/* Lecteur vidéo Vimeo */}
            <Box
              sx={{
                position: "relative",
                paddingBottom: "56.25%", // Ratio 16:9
                height: 0,
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                mx: "auto",
              }}
            >
              {/* Vidéo Vimeo uniquement */}
              <iframe
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                }}
                src={`https://player.vimeo.com/video/${extractVimeoId(selectedVideo.videoUrl)}?autoplay=1&title=0&byline=0&portrait=0`}
                title={selectedVideo.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </Box>

            {/* Bouton retour */}
            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box
                onClick={handleBackToList}
                sx={{
                  px: { xs: 2.5, sm: 3 },
                  py: 1.5,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontSize: { xs: 14, sm: 16 },
                  textAlign: "center",
                  "&:hover": {
                    background: "rgba(255,255,255,0.15)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                ← Retour aux tutoriels
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TutorialsModal;

