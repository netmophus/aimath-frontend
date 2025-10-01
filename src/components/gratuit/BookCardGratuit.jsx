

// components/gratuit/BookCardGratuit.jsx
import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const BookCardGratuit = ({ book }) => {
  const navigate = useNavigate();
  const isGratuit = String(book?.badge || "").toLowerCase() === "gratuit";

  const [viewerUrl, setViewerUrl] = useState("");
  const [openViewer, setOpenViewer] = useState(false);

  const goPricing = () => navigate("/pricing");

  const handleView = async () => {
    if (!isGratuit) return goPricing();
    try {
      const res = await API.get(`/ia/gratuit/${book._id}/view`);
      setViewerUrl(res.data.viewUrl);
      setOpenViewer(true);
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'affichage.");
    }
  };

  const handleDownload = async () => {
    if (!isGratuit) return goPricing();
    try {
      const res = await API.get(`/ia/gratuit/${book._id}/download`);
      window.open(res.data.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors du téléchargement.");
    }
  };

  return (
    <>
      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          borderRadius: 3,
          boxShadow: 4,
          overflow: "hidden",
          mb: 3,
        }}
      >
        <CardMedia
          component="img"
          image={book.coverImage}
          alt={book.title}
          sx={{ width: { xs: "100%", sm: 180 }, objectFit: "cover" }}
        />

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📘 {book.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {book.description}
            </Typography>

            <Typography variant="caption" fontWeight="bold" sx={{ color: "#666" }}>
              🎓 Niveau : {book.level?.toUpperCase()} | 🎖️ {isGratuit ? "Gratuit" : "Premium"}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              📅 Publié le : {new Date(book.createdAt).toLocaleDateString("fr-FR")}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              👁️ Visualisations : {book.viewCount || 0} | 📥 Téléchargements : {book.downloadCount || 0}
            </Typography>
          </CardContent>

          <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
            <Button onClick={handleDownload} variant="contained">
              📥 Télécharger
            </Button>
            <Button onClick={handleView} variant="outlined" color="primary">
              📖 Visualiser
            </Button>
          </CardActions>
        </Box>

        {/* Aperçu PDF (uniquement pour Gratuit) */}
        <Dialog open={openViewer} onClose={() => setOpenViewer(false)} maxWidth="lg" fullWidth>
          <DialogTitle>📕 Aperçu du livre</DialogTitle>
          <DialogContent dividers>
            {viewerUrl ? (
              <iframe
                src={viewerUrl}
                title="Aperçu PDF"
                width="100%"
                height="600px"
                style={{ border: "none" }}
              />
            ) : (
              <Typography>Chargement...</Typography>
            )}
          </DialogContent>
        </Dialog>
      </Card>
    </>
  );
};

export default BookCardGratuit;
