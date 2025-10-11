import React from "react";
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

const TutorialsModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Tutoriels avec liens YouTube (remplacez par vos vraies URLs)
  const tutorials = [
    {
      id: 1,
      title: "Comment créer un compte",
      description: "Inscription rapide et simple",
      icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
      youtubeId: "0HUzbFN5w9w", // ✅ Vidéo tutoriel Fahimta
      color: "#4CAF50",
    },
    {
      id: 2,
      title: "Comment faire un abonnement",
      description: "Activez Premium facilement",
      icon: <CreditCardIcon sx={{ fontSize: 40 }} />,
      youtubeId: "dQw4w9WgXcQ", // Remplacez
      color: "#FF9800",
    },
    {
      id: 3,
      title: "Comment questionner l'IA",
      description: "Posez vos questions de maths",
      icon: <ChatBubbleOutlineIcon sx={{ fontSize: 40 }} />,
      youtubeId: "dQw4w9WgXcQ", // Remplacez
      color: "#2196F3",
    },
    {
      id: 4,
      title: "Comment prendre une photo",
      description: "Résolvez par photo d'exercice",
      icon: <CameraAltIcon sx={{ fontSize: 40 }} />,
      youtubeId: "dQw4w9WgXcQ", // Remplacez
      color: "#9C27B0",
    },
    {
      id: 5,
      title: "Comment utiliser Soutien+",
      description: "Chattez avec un enseignant",
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      youtubeId: "dQw4w9WgXcQ", // Remplacez
      color: "#F44336",
    },
    {
      id: 6,
      title: "Accéder aux livres",
      description: "Consultez la bibliothèque",
      icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
      youtubeId: "dQw4w9WgXcQ", // Remplacez
      color: "#00BCD4",
    },
    {
      id: 7,
      title: "Accéder aux vidéos",
      description: "Regardez les cours vidéo",
      icon: <PlayCircleOutlineIcon sx={{ fontSize: 40 }} />,
      youtubeId: "dQw4w9WgXcQ", // Remplacez
      color: "#E91E63",
    },
    {
      id: 8,
      title: "Télécharger les examens",
      description: "Accédez aux sujets corrigés",
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      youtubeId: "dQw4w9WgXcQ", // Remplacez
      color: "#673AB7",
    },
    {
      id: 9,
      title: "Guide complet Fahimta",
      description: "Toutes les fonctionnalités",
      icon: <HelpOutlineIcon sx={{ fontSize: 40 }} />,
      youtubeId: "dQw4w9WgXcQ", // Remplacez
      color: "#009688",
    },
  ];

  const [selectedVideo, setSelectedVideo] = React.useState(null);

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
        }}
      >
        {!selectedVideo ? (
          // Liste des tutoriels
          <>
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

            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {tutorials.map((tutorial) => (
                <Grid item xs={12} sm={6} md={4} key={tutorial.id}>
                  <Card
                    onClick={() => handleVideoClick(tutorial)}
                    sx={{
                      height: "100%",
                      minHeight: { xs: 200, sm: 220, md: 240 }, // Hauteur minimale fixe
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
                          {tutorial.icon}
                        </Box>

                        {/* Titre */}
                        <Typography
                          variant="subtitle1"
                          fontWeight={800}
                          sx={{
                            color: "#fff",
                            fontSize: { xs: 14, sm: 15 },
                            lineHeight: 1.3,
                            minHeight: { xs: 36, sm: 40 }, // Hauteur fixe pour aligner les titres
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          {tutorial.title}
                        </Typography>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: { xs: 12, sm: 13 },
                            lineHeight: 1.4,
                            minHeight: { xs: 32, sm: 36 }, // Hauteur fixe pour aligner les descriptions
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
          </>
        ) : (
          // Lecteur vidéo
          <Box>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              fontWeight={800}
              sx={{
                color: "#fff",
                mb: 2,
                fontSize: { xs: 18, sm: 22 },
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
              }}
            >
              {selectedVideo.description}
            </Typography>

            {/* Vidéo YouTube responsive */}
            <Box
              sx={{
                position: "relative",
                paddingBottom: "56.25%", // Ratio 16:9
                height: 0,
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              }}
            >
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
                src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1`}
                title={selectedVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontSize: { xs: 14, sm: 16 },
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

