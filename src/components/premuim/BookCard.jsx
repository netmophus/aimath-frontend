// components/premium/BookCard.jsx
import React, { useState, useContext, useMemo } from "react";
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
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";

const BookCard = ({ book }) => {
  const isGratuit = book?.badge === "gratuit";

  const [viewerUrl, setViewerUrl] = useState("");
  const [openViewer, setOpenViewer] = useState(false);

  const { user } = useContext(AuthContext);
  const isPremiumUser = !!user?.isSubscribed;
const [showMore, setShowMore] = useState(false);

  // ----- Quotas & droits -----
  const limit = useMemo(
    () => (book?.userDownloadLimit ?? book?.downloadLimit ?? null),
    [book]
  );
  const used = useMemo(() => (book?.userDownloadCount ?? 0), [book]);
  const remaining = useMemo(
    () => (limit == null ? Infinity : Math.max((book?.userDownloadsRemaining ?? (limit - used)), 0)),
    [limit, used, book?.userDownloadsRemaining]
  );
  const reachedLimit = limit != null && remaining <= 0;

  const canAccess   = isGratuit || isPremiumUser;
  const canDownload = canAccess && !reachedLimit;
  const canView     = canAccess && !reachedLimit; // ✅ visualisation désactivée à la limite

  // ----- Actions -----
  const handleView = async (bookId) => {
    if (!canView) return; // ⛔ bloqué
    try {
      const res = await API.get(`/premium/books/${bookId}/view`);
      const { viewUrl } = res.data;
      setViewerUrl(viewUrl);
      setOpenViewer(true);
    } catch (err) {
      console.error("Erreur affichage livre :", err);
      alert(err?.response?.data?.message || "Erreur lors de l'affichage.");
    }
  };

  const handleDownload = async (bookId) => {
    if (!canDownload) return; // ⛔ bloqué
    try {
      const res = await API.get(`/premium/books/${bookId}/download`);
      const { downloadUrl } = res.data;
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Erreur lors du téléchargement :", err);
      alert(err?.response?.data?.message || "Erreur lors du téléchargement");
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
        {/* Couverture */}
        <CardMedia
          component="img"
          image={book?.coverImage}
          alt={book?.title}
          sx={{ width: { xs: "100%", sm: 180 }, objectFit: "cover" }}
        />

        {/* Contenu */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📘 {book?.title}
            </Typography>

            {/* <Typography
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
              {book?.description}
            </Typography> */}


            <Typography
  variant="body2"
  color="text.secondary"
  sx={{
    mb: 1,
    ...(showMore
      ? { display: "block", overflow: "visible" }
      : {
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }),
  }}
>
  {book?.description}
</Typography>

{book?.description && book.description.length > 120 && (
  <Button
    size="small"
    onClick={() => setShowMore((v) => !v)}
    sx={{ px: 0, textTransform: "none" }}
  >
    {showMore ? "Voir moins" : "Voir plus"}
  </Button>
)}


            <Typography variant="caption" fontWeight="bold" sx={{ color: "#666" }}>
              🎓 Niveau : {book?.level?.toUpperCase()} | 🎖️ {isGratuit ? "Gratuit" : "Premium"}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              📅 Publié le : {book?.createdAt ? new Date(book.createdAt).toLocaleDateString("fr-FR") : "—"}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              👁️ Visualisations : {book?.viewCount || 0} | 📥 Téléchargements : {book?.downloadCount || 0}
            </Typography>

            {/* Info quota */}
            {limit != null && (
              <Typography
                variant="caption"
                sx={{ mt: 0.5 }}
                color={reachedLimit ? "error.main" : "text.secondary"}
                display="block"
              >
                {reachedLimit
                  ? "Limite de téléchargements atteinte."
                  : `Téléchargements restants : ${remaining}/${limit}`}
              </Typography>
            )}
          </CardContent>

          {/* Actions */}
          <CardActions sx={{ px: 2, pb: 2, gap: 1, flexWrap: "wrap" }}>
            <Button
              onClick={() => handleDownload(book._id)}
              variant="contained"
              disabled={!canDownload}
              title={
                !canDownload
                  ? (canAccess ? "Téléchargement indisponible (limite atteinte)" : "Réservé aux membres Premium")
                  : "Télécharger"
              }
            >
              📥 Télécharger
            </Button>

            {/* <Button
              variant="outlined"
              color="primary"
              onClick={() => handleView(book._id)}
              disabled={!canView} // ✅ désactivé si limite atteinte
              title={
                !canView
                  ? (canAccess ? "Visualisation indisponible (limite atteinte)" : "Réservé aux membres Premium")
                  : "Visualiser"
              }
            >
              📖 Visualiser
            </Button> */}



            <Button
  variant="outlined"
  color="primary"
  disabled
  title="Visualisation désactivée pour le moment"
  sx={{ pointerEvents: "none", opacity: 0.6 }}
>
  📖 Visualiser
</Button>

          </CardActions>
        </Box>

        {/* Aperçu PDF */}
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

export default BookCard;
