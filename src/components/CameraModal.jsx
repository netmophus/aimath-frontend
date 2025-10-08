// src/components/CameraModal.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

const CameraModal = ({ open, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "user" = frontale, "environment" = arrière
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(false);

  // Démarrer la caméra
  useEffect(() => {
    if (!open) {
      // Arrêter le stream quand on ferme
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCaptured(false);
      setError(null);
      return;
    }

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
      } catch (err) {
        console.error("Erreur accès caméra:", err);
        setError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [open, facingMode]);

  // Mettre à jour le stream vidéo
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Basculer entre caméra avant/arrière
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Prendre la photo
  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        setCaptured(true);
        
        // Arrêter le stream
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        
        // Fermer après 300ms
        setTimeout(() => {
          onClose();
          setCaptured(false);
        }, 300);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={800}>
            📸 Prendre une photo
          </Typography>
          <IconButton onClick={toggleCamera} title="Changer de caméra">
            <FlipCameraAndroidIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "#000", position: "relative" }}>
        {error ? (
          <Box sx={{ p: 4, textAlign: "center", color: "#fff" }}>
            <Typography>{error}</Typography>
            <Typography variant="caption" sx={{ mt: 2, display: "block", opacity: 0.7 }}>
              Sur ordinateur : vérifiez que votre navigateur a accès à la webcam.
              <br />
              Sur téléphone : autorisez l'accès à la caméra dans les paramètres.
            </Typography>
          </Box>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                objectFit: "contain",
                display: "block",
              }}
            />

            {/* Bouton de capture au centre */}
            <Box
              sx={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <IconButton
                onClick={capturePhoto}
                disabled={captured}
                sx={{
                  bgcolor: captured ? "success.main" : "#fff",
                  width: 70,
                  height: 70,
                  border: "4px solid",
                  borderColor: captured ? "success.light" : "#ddd",
                  "&:hover": {
                    bgcolor: captured ? "success.main" : "#f5f5f5",
                  },
                }}
              >
                <CameraAltIcon fontSize="large" sx={{ color: captured ? "#fff" : "primary.main" }} />
              </IconButton>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CameraModal;
