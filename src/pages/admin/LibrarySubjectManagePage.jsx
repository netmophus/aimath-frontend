import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { libraryService } from "../../services/libraryService";

const LibrarySubjectManagePage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "SchoolIcon",
    color: "#3b82f6"
  });

  // Couleurs prédéfinies
  const predefinedColors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", 
    "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"
  ];

  // Liste des icônes disponibles pour les matières
  const availableIcons = [
    { name: "SchoolIcon", label: "École", emoji: "🎓" },
    { name: "ScienceIcon", label: "Sciences", emoji: "🔬" },
    { name: "CalculateIcon", label: "Mathématiques", emoji: "🧮" },
    { name: "LocalHospitalIcon", label: "Médecine", emoji: "🏥" },
    { name: "BiotechIcon", label: "Biologie", emoji: "🧬" },
    { name: "ComputerIcon", label: "Informatique", emoji: "💻" },
    { name: "AccountBalanceIcon", label: "Économie", emoji: "🏛️" },
    { name: "AttachMoneyIcon", label: "Finance", emoji: "💰" },
    { name: "PsychologyIcon", label: "Psychologie", emoji: "🧠" },
    { name: "HistoryEduIcon", label: "Histoire", emoji: "📜" },
    { name: "LanguageIcon", label: "Langues", emoji: "🗣️" },
    { name: "PaletteIcon", label: "Arts", emoji: "🎨" },
    { name: "MusicNoteIcon", label: "Musique", emoji: "🎵" },
    { name: "SportsIcon", label: "Sport", emoji: "⚽" },
    { name: "EngineeringIcon", label: "Ingénierie", emoji: "⚙️" },
    { name: "ArchitectureIcon", label: "Architecture", emoji: "🏗️" },
    { name: "AgricultureIcon", label: "Agriculture", emoji: "🌾" },
    { name: "EnvironmentIcon", label: "Environnement", emoji: "🌍" },
    { name: "SecurityIcon", label: "Sécurité", emoji: "🔒" },
    { name: "PublicIcon", label: "Politique", emoji: "🏛️" },
  ];

  // Icônes prédéfinies
  const predefinedIcons = [
    "SchoolIcon", "MenuBookIcon", "ScienceIcon", "CalculateIcon",
    "ComputerIcon", "AccountBalanceIcon", "TrendingUpIcon", "HealthAndSafetyIcon"
  ];

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await libraryService.getAdminSubjects();
      setSubjects(response.data || response);
    } catch (error) {
      console.error("Erreur lors du chargement des matières:", error);
      setAlert({
        show: true,
        message: "Erreur lors du chargement des matières",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (subject = null) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        description: subject.description,
        icon: subject.icon,
        color: subject.color
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: "",
        description: "",
        icon: "SchoolIcon",
        color: "#3b82f6"
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubject(null);
    setFormData({
      name: "",
      description: "",
      icon: "SchoolIcon",
      color: "#3b82f6"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingSubject) {
        // Mettre à jour la matière
        await libraryService.updateAdminSubject(editingSubject._id, formData);
        setAlert({
          show: true,
          message: "Matière mise à jour avec succès",
          type: "success"
        });
      } else {
        // Créer une nouvelle matière
        await libraryService.createAdminSubject(formData);
        setAlert({
          show: true,
          message: "Matière créée avec succès",
          type: "success"
        });
      }
      handleCloseDialog();
      loadSubjects(); // Recharger la liste
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      setAlert({
        show: true,
        message: "Erreur lors de la sauvegarde",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) {
      try {
        await libraryService.deleteAdminSubject(subjectId);
        setAlert({
          show: true,
          message: "Matière supprimée avec succès",
          type: "success"
        });
        loadSubjects(); // Recharger la liste
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        setAlert({
          show: true,
          message: "Erreur lors de la suppression",
          type: "error"
        });
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      p: 3 
    }}>
      {/* En-tête */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate("/admin/library")}
            sx={{ color: "#fff" }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight={700} sx={{ color: "#fff" }}>
            🎯 Gestion des Matières
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            },
          }}
        >
          Ajouter une matière
        </Button>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert
          severity={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Liste des matières */}
      <Grid container spacing={2}>
        {subjects.map((subject) => (
          <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={subject.id}>
            <Card sx={{ 
              background: "rgba(255,255,255,0.1)", 
              backdropFilter: "blur(10px)",
              border: `2px solid ${subject.color}20`,
              height: "100%",
              width: "100%",
              maxWidth: "300px",
              minWidth: "280px",
              display: "flex",
              flexDirection: "column",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 8px 25px ${subject.color}40`,
              },
              transition: "all 0.3s ease"
            }}>
              <CardContent sx={{ 
                display: "flex", 
                flexDirection: "column", 
                height: "100%",
                flex: 1
              }}>
                {/* En-tête avec titre et actions */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: subject.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "20px"
                  }}
                >
                  {availableIcons.find(icon => icon.name === subject.icon)?.emoji || "🎯"}
                </Box>
                <Typography variant="h6" fontWeight={600} sx={{ color: "#fff" }}>
                  {subject.name}
                </Typography>
              </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(subject)}
                      sx={{ color: "#60a5fa" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(subject._id)}
                      sx={{ color: "#f87171" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
                
            {/* Description - hauteur fixe */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: "rgba(255,255,255,0.8)", 
                  mb: 2,
                  height: "80px", // Hauteur fixe pour la description
                  display: "flex",
                  alignItems: "flex-start",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                  lineHeight: 1.4
                }}
              >
                {subject.description || "Aucune description disponible"}
              </Typography>
            </Box>
                
                {/* Pied de carte avec statistiques et actions */}
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  mt: "auto" // Pousse vers le bas
                }}>
                  <Chip
                    label={`${subject.bookCount || 0} livre${(subject.bookCount || 0) > 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      backgroundColor: `${subject.color}20`,
                      color: subject.color,
                      fontWeight: 600
                    }}
                  />
                  <Button
                    size="small"
                    onClick={() => navigate(`/admin/library?subject=${subject._id}`)}
                    sx={{
                      color: subject.color,
                      "&:hover": {
                        backgroundColor: `${subject.color}20`
                      }
                    }}
                  >
                    Voir les livres
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog d'ajout/modification */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(30,30,30,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          }
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontWeight: 600 }}>
          {editingSubject ? "Modifier la matière" : "Ajouter une matière"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom de la matière"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.23)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                    },
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#fff",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.23)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                    },
                    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: "#fff", mb: 1 }}>
                  Icône
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", maxHeight: "200px", overflowY: "auto" }}>
                  {availableIcons.map((icon) => (
                    <Box
                      key={icon.name}
                      onClick={() => setFormData({ ...formData, icon: icon.name })}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        p: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: formData.icon === icon.name ? "2px solid #3b82f6" : "2px solid transparent",
                        backgroundColor: formData.icon === icon.name ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.1)",
                        "&:hover": {
                          backgroundColor: "rgba(59,130,246,0.1)",
                          transform: "scale(1.05)"
                        },
                        transition: "all 0.2s ease",
                        minWidth: "80px"
                      }}
                    >
                      <Typography sx={{ fontSize: "24px", mb: 0.5 }}>
                        {icon.emoji}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#fff", textAlign: "center", fontSize: "10px" }}>
                        {icon.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: "#fff", mb: 1 }}>
                  Couleur
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {predefinedColors.map((color) => (
                    <Box
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor: color,
                        cursor: "pointer",
                        border: formData.color === color ? "3px solid #fff" : "none",
                        "&:hover": {
                          transform: "scale(1.1)"
                        }
                      }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ color: "#fff" }}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                },
              }}
            >
              {loading ? "Sauvegarde..." : editingSubject ? "Modifier" : "Créer"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LibrarySubjectManagePage;