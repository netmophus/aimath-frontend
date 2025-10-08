// src/components/ImageCropModal.jsx
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

/**
 * Fonction utilitaire pour créer l'image recadrée
 */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      "image/jpeg",
      0.9 // qualité 90%
    );
  });
};

/**
 * Modal de recadrage d'image
 */
const ImageCropModal = ({ open, image, onClose, onCropComplete }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => setCrop(crop);
  const onZoomChange = (zoom) => setZoom(zoom);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels, rotation);
      const file = new File([croppedBlob], `photo-exercice-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      onCropComplete(file);
      onClose();
    } catch (e) {
      console.error("Erreur recadrage:", e);
    }
  };

  const handleRotateLeft = () => setRotation((r) => r - 90);
  const handleRotateRight = () => setRotation((r) => r + 90);

  if (!image) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={800}>
            📸 Recadrer la photo de l'exercice
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Rotation gauche">
              <IconButton size="small" onClick={handleRotateLeft}>
                <RotateLeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Rotation droite">
              <IconButton size="small" onClick={handleRotateRight}>
                <RotateRightIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ position: "relative", height: 500, bgcolor: "#000" }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={3 / 4} // Format portrait (adapté aux exercices)
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropCompleteCallback}
          style={{
            containerStyle: {
              backgroundColor: "#000",
            },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ flexDirection: "column", gap: 2, p: 2 }}>
        {/* Zoom */}
        <Box sx={{ width: "100%" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <ZoomOutIcon color="action" />
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(e, zoom) => setZoom(zoom)}
              sx={{ flex: 1 }}
            />
            <ZoomInIcon color="action" />
          </Stack>
          <Typography variant="caption" color="text.secondary" align="center" sx={{ display: "block", mt: 0.5 }}>
            Pincez pour zoomer ou utilisez le curseur
          </Typography>
        </Box>

        {/* Boutons action */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ width: "100%" }}>
          <Button onClick={onClose} variant="outlined">
            Annuler
          </Button>
          <Button onClick={handleSaveCrop} variant="contained" color="primary">
            Valider et envoyer
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropModal;
