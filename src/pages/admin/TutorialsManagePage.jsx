import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PageLayout from "../../components/PageLayout";
import API from "../../api";

const TutorialsManagePage = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [message, setMessage] = useState({ open: false, text: "", severity: "success" });

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    videoType: "vimeo",
    icon: "HelpOutline",
    color: "#2196F3",
    order: 0,
    isActive: true,
  });

  const iconOptions = [
    { value: "PersonAdd", label: "PersonAdd - Créer compte" },
    { value: "CreditCard", label: "CreditCard - Abonnement" },
    { value: "ChatBubbleOutline", label: "ChatBubbleOutline - IA" },
    { value: "CameraAlt", label: "CameraAlt - Photo" },
    { value: "School", label: "School - Soutien+" },
    { value: "MenuBook", label: "MenuBook - Livres" },
    { value: "PlayCircleOutline", label: "PlayCircleOutline - Vidéos" },
    { value: "Assignment", label: "Assignment - Examens" },
    { value: "HelpOutline", label: "HelpOutline - Aide" },
  ];

  const colorOptions = [
    { value: "#4CAF50", label: "Vert" },
    { value: "#FF9800", label: "Orange" },
    { value: "#2196F3", label: "Bleu" },
    { value: "#9C27B0", label: "Violet" },
    { value: "#F44336", label: "Rouge" },
    { value: "#00BCD4", label: "Cyan" },
    { value: "#E91E63", label: "Rose" },
    { value: "#673AB7", label: "Violet foncé" },
    { value: "#009688", label: "Turquoise" },
  ];

  const videoTypeOptions = [
    { value: "vimeo", label: "Vimeo (ID ou lien)" },
  ];

  // Charger les tutoriels
  const loadTutorials = async () => {
    setLoading(true);
    try {
      const res = await API.get("/tutorials/admin/all");
      setTutorials(res.data.tutorials || []);
    } catch (error) {
      console.error("Erreur chargement tutoriels:", error);
      showMessage("Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTutorials();
  }, []);

  const showMessage = (text, severity = "success") => {
    setMessage({ open: true, text, severity });
    setTimeout(() => setMessage({ open: false, text: "", severity: "success" }), 4000);
  };

  const handleOpenDialog = (tutorial = null) => {
    if (tutorial) {
      setEditMode(true);
      setCurrentTutorial(tutorial);
      setFormData({
        title: tutorial.title,
        description: tutorial.description,
        videoUrl: tutorial.videoUrl,
        videoType: tutorial.videoType || "vimeo",
        icon: tutorial.icon,
        color: tutorial.color,
        order: tutorial.order,
        isActive: tutorial.isActive,
      });
    } else {
      setEditMode(false);
      setCurrentTutorial(null);
      setFormData({
        title: "",
        description: "",
        videoUrl: "",
        videoType: "vimeo",
        icon: "HelpOutline",
        color: "#2196F3",
        order: tutorials.length,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setCurrentTutorial(null);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.description || !formData.videoUrl) {
        showMessage("Tous les champs sont requis", "warning");
        return;
      }

      if (editMode && currentTutorial) {
        await API.put(`/tutorials/${currentTutorial._id}`, formData);
        showMessage("Tutoriel mis à jour avec succès!");
      } else {
        await API.post("/tutorials", formData);
        showMessage("Tutoriel créé avec succès!");
      }

      handleCloseDialog();
      loadTutorials();
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      showMessage(error.response?.data?.message || "Erreur lors de la sauvegarde", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce tutoriel ?")) return;

    try {
      await API.delete(`/tutorials/${id}`);
      showMessage("Tutoriel supprimé avec succès!");
      loadTutorials();
    } catch (error) {
      console.error("Erreur suppression:", error);
      showMessage("Erreur lors de la suppression", "error");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/tutorials/${id}/toggle`);
      showMessage("Statut modifié avec succès!");
      loadTutorials();
    } catch (error) {
      console.error("Erreur toggle:", error);
      showMessage("Erreur lors du changement de statut", "error");
    }
  };

  return (
    <PageLayout>
      <Box p={4} mt={10}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            🎥 Gestion des tutoriels vidéo
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Ajouter un tutoriel
          </Button>
        </Box>

        {message.open && (
          <Alert severity={message.severity} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Ordre</strong></TableCell>
                <TableCell><strong>Titre</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Lien vidéo</strong></TableCell>
                <TableCell><strong>Icône</strong></TableCell>
                <TableCell><strong>Couleur</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tutorials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Aucun tutoriel. Cliquez sur "Ajouter" pour créer le premier.
                  </TableCell>
                </TableRow>
              ) : (
                tutorials.map((tutorial) => (
                  <TableRow key={tutorial._id}>
                    <TableCell>{tutorial.order}</TableCell>
                    <TableCell>{tutorial.title}</TableCell>
                    <TableCell>{tutorial.description.substring(0, 50)}...</TableCell>
                    <TableCell>
                      <Chip 
                        label="Vimeo"
                        size="small"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell>
                      <a
                        href={tutorial.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '12px' }}
                      >
                        {tutorial.videoUrl && tutorial.videoUrl.length > 30 ? tutorial.videoUrl.substring(0, 30) + '...' : tutorial.videoUrl || 'URL non définie'}
                      </a>
                    </TableCell>
                    <TableCell>{tutorial.icon}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: tutorial.color,
                          borderRadius: 1,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={tutorial.isActive ? "Actif" : "Inactif"}
                        color={tutorial.isActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={tutorial.isActive ? "Désactiver" : "Activer"}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(tutorial._id)}
                        >
                          {tutorial.isActive ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(tutorial)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(tutorial._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Dialog Ajout/Modification */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editMode ? "Modifier le tutoriel" : "Ajouter un tutoriel"}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Titre"
                fullWidth
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {/* Type fixé à Vimeo - pas besoin de sélecteur */}
              <TextField
                label="Lien Vimeo"
                fullWidth
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                helperText="Ex: https://vimeo.com/123456789 ou juste 123456789"
              />
              <TextField
                select
                label="Icône"
                fullWidth
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {iconOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Couleur"
                fullWidth
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              >
                {colorOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: option.value,
                          borderRadius: 1,
                        }}
                      />
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Ordre d'affichage"
                type="number"
                fullWidth
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Actif"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button variant="contained" onClick={handleSubmit}>
              {editMode ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </PageLayout>
  );
};

export default TutorialsManagePage;

