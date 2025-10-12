import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
} from "@mui/material";
import PageLayout from "../../components/PageLayout";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
  QrCode as QrCodeIcon,
} from "@mui/icons-material";

const MesAchatsCartesPage = () => {
  const { user } = React.useContext(AuthContext);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [qrDialog, setQrDialog] = useState({ open: false, card: null });
  const [userCards, setUserCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charger les cartes de l'élève
  const loadUserCards = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setLoading(true);
      setError("");
      
      const response = await API.get(`/users/${user._id}/cards`);
      setUserCards(response.data.cards || []);
    } catch (err) {
      console.error("Erreur chargement cartes:", err);
      setError("Erreur lors du chargement de vos cartes");
      setUserCards([]); // Pas de données statiques, juste un tableau vide
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserCards();
  }, [loadUserCards]);

  const getStatusColor = (status) => {
    switch (status) {
      case "utilisé":
      case "used":
        return { color: "success", icon: CheckCircleIcon };
      case "en_attente":
      case "pending":
        return { color: "warning", icon: ScheduleIcon };
      case "annulé":
      case "cancelled":
        return { color: "error", icon: CancelIcon };
      default:
        return { color: "default", icon: CheckCircleIcon };
    }
  };

  const handleCopyCode = (code) => {
    // Extraire seulement la partie après "FAH-"
    const codeToCopy = code.includes('FAH-') ? code.split('FAH-')[1] : code;
    navigator.clipboard.writeText(codeToCopy);
    setSnackbar({
      open: true,
      message: `Code ${codeToCopy} copié dans le presse-papiers!`,
    });
  };

  const handleShowQR = (card) => {
    setQrDialog({ open: true, card });
  };

  const handleCloseQR = () => {
    setQrDialog({ open: false, card: null });
  };

  const CardItem = ({ card }) => {
    const statusInfo = getStatusColor(card.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Box
        sx={{
          maxWidth: 400,
          p: 3,
          backgroundColor: "#FFFFFF",
          border: "2px solid #000",
          borderRadius: 1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          position: "relative",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          },
        }}
      >
        {/* En-tête FAHIMTA */}
        <Typography
          variant="h4"
          fontWeight={900}
          textAlign="center"
          sx={{
            color: "#000",
            mb: 2,
            letterSpacing: "2px",
          }}
        >
          FAHIMTA
        </Typography>

        {/* Informations de la carte */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  Code :
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: "monospace",
                      backgroundColor: "#f5f5f5",
                      px: 1,
                      py: 0.5,
                      borderRadius: 0.5,
                      fontWeight: 600,
                      color: "#1976D2",
                    }}
                  >
                    {card.code} {/* Code toujours démasqué pour les élèves */}
                  </Typography>
                  <Tooltip title="Copier le code">
                    <IconButton 
                      size="small" 
                      onClick={() => handleCopyCode(card.code)}
                      sx={{ p: 0.5 }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  Prix :
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {card.price} FCFA
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  Statut :
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <StatusIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: `${statusInfo.color}.main` 
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: `${statusInfo.color}.main`,
                      fontWeight: 600,
                      textTransform: "capitalize"
                    }}
                  >
                    {card.status}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  N° Série :
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: "monospace", 
                    fontSize: "0.75rem",
                    backgroundColor: "#f5f5f5",
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {card.serialNumber}
                </Typography>
              </Box>

              {card.purchaseDate && (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                    Acheté le :
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(card.purchaseDate).toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              )}

              {card.partnerName && (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                    Partenaire :
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>
                    {card.partnerName}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* QR Code */}
          <Grid item xs={4}>
            <Box
              sx={{
                width: 80,
                height: 80,
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                }
              }}
              onClick={() => handleShowQR(card)}
            >
              <QrCodeIcon sx={{ fontSize: 40, color: "text.secondary" }} />
            </Box>
            <Typography variant="caption" textAlign="center" display="block" color="text.secondary">
              Cliquez pour voir le QR
            </Typography>
          </Grid>
        </Grid>

        {/* Numéro de téléphone */}
        <Typography
          variant="body2"
          fontWeight={700}
          textAlign="center"
          sx={{ mb: 1 }}
        >
          +227 80 64 83 83
        </Typography>

        {/* Disclaimer */}
        <Typography
          variant="caption"
          textAlign="center"
          display="block"
          color="text.secondary"
          sx={{ fontSize: "0.7rem" }}
        >
          Les cartes ne sont ni échangées, ni retournées, ni remboursées une fois
        </Typography>
      </Box>
    );
  };

  return (
    <PageLayout>
      <Box p={4} mt={10}>
        {/* En-tête */}
        <Box mb={4}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <ShoppingCartIcon sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="h4" fontWeight="bold">
              💳 Mes achats de cartes
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary">
            Gérez vos cartes d'abonnement achetées.
          </Typography>
        </Box>

        {/* Section mes cartes achetées */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <ReceiptIcon sx={{ fontSize: 32, color: "secondary.main" }} />
            <Typography variant="h5" fontWeight={800}>
              Mes cartes achetées
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Loading */}
          {loading && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <CircularProgress size={60} />
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Chargement de vos cartes...
              </Typography>
            </Box>
          )}

          {/* Erreur */}
          {error && !loading && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Liste des cartes */}
          {!loading && userCards.length > 0 && (
            <Grid container spacing={3} justifyContent="center">
              {userCards.map((card) => (
                <Grid item key={card.id}>
                  <CardItem card={card} />
                </Grid>
              ))}
            </Grid>
          )}

          {/* Message si aucune carte */}
          {!loading && !error && userCards.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <ReceiptIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" mb={1}>
                Vous n'avez pas encore de cartes
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Achetez votre première carte auprès d'un partenaire distributeur
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Modal QR Code */}
      <Dialog
        open={qrDialog.open}
        onClose={handleCloseQR}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          QR Code - {qrDialog.card?.code}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Box
              sx={{
                width: 200,
                height: 200,
                backgroundColor: "#f5f5f5",
                border: "2px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                QR Code
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Scannez ce code pour accéder à votre carte
            </Typography>
            {qrDialog.card && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={700}>
                  Informations de la carte:
                </Typography>
                <Typography variant="body2">
                  Code: {qrDialog.card.code}
                </Typography>
                <Typography variant="body2">
                  Prix: {qrDialog.card.price} FCFA
                </Typography>
                <Typography variant="body2">
                  Statut: {qrDialog.card.status}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQR}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default MesAchatsCartesPage;

