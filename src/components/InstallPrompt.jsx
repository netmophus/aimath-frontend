import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Slide,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GetAppIcon from "@mui/icons-material/GetApp";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà refusé l'installation
    const dismissed = localStorage.getItem("install-prompt-dismissed");
    if (dismissed) return;

    // Écoute l'événement beforeinstallprompt
    const handler = (e) => {
      // Empêche le mini-infobar de Chrome
      e.preventDefault();
      // Stocke l'événement pour l'utiliser plus tard
      setDeferredPrompt(e);
      // Affiche notre propre invite après 3 secondes
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Affiche l'invite d'installation
    deferredPrompt.prompt();

    // Attend la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Installation: ${outcome}`);

    // Réinitialise l'événement
    setDeferredPrompt(null);
    setShowPrompt(false);

    // Si refusé, ne plus afficher pendant 7 jours
    if (outcome === "dismissed") {
      localStorage.setItem("install-prompt-dismissed", Date.now());
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Ne plus afficher pendant 7 jours
    localStorage.setItem("install-prompt-dismissed", Date.now());
  };

  // Ne rien afficher si pas de prompt ou déjà installé
  if (!showPrompt || !deferredPrompt) return null;

  return (
    <Slide direction="up" in={showPrompt} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: 400,
          width: "90%",
          p: 2,
          zIndex: 9999,
          background: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
          color: "white",
        }}
      >
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "white",
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <GetAppIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Installer Fahimta
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Accédez plus rapidement à l'app !
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleInstallClick}
          sx={{
            bgcolor: "white",
            color: "#0ea5e9",
            fontWeight: "bold",
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.9)",
            },
          }}
        >
          Installer maintenant
        </Button>
      </Paper>
    </Slide>
  );
};

export default InstallPrompt;

