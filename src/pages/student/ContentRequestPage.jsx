// src/pages/student/ContentRequestPage.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import PageLayout from "../../components/PageLayout";
import API from "../../api";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import OndemandVideoRoundedIcon from "@mui/icons-material/OndemandVideoRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

const ContentRequestPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    contentType: "video",
    subject: "maths",
    level: "",
    chapter: "",
    description: "",
    priority: 3,
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Charger les demandes de l'élève
  const fetchMyRequests = async () => {
    try {
      const res = await API.get("/content-requests/my-requests");
      setMyRequests(res.data || []);
    } catch (error) {
      console.error("Erreur chargement demandes:", error);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.level || !formData.description.trim()) {
      return showSnack("Veuillez remplir tous les champs requis.", "warning");
    }

    setLoading(true);
    try {
      await API.post("/content-requests", formData);
      showSnack("✅ Demande envoyée ! L'admin a reçu un email.", "success");
      
      // Reset form
      setFormData({
        contentType: "video",
        subject: "maths",
        level: "",
        chapter: "",
        description: "",
        priority: 3,
      });

      // Recharger la liste
      fetchMyRequests();
    } catch (error) {
      console.error("Erreur envoi demande:", error);
      showSnack(error.response?.data?.message || "Erreur lors de l'envoi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    en_attente: "warning",
    en_cours: "info",
    terminee: "success",
    annulee: "error",
  };

  const statusLabels = {
    en_attente: "En attente",
    en_cours: "En cours",
    terminee: "Terminée",
    annulee: "Annulée",
  };

  const contentTypeIcons = {
    video: <OndemandVideoRoundedIcon />,
    livre: <MenuBookRoundedIcon />,
    exercices: <AssignmentRoundedIcon />,
    fiche: <DescriptionRoundedIcon />,
    autre: <MoreHorizRoundedIcon />,
  };

  const contentTypeLabels = {
    video: "Cours vidéo",
    livre: "Livre / Manuel",
    exercices: "Exercices corrigés",
    fiche: "Fiche de révision",
    autre: "Autre",
  };

  return (
    <PageLayout>
      <Box sx={{ p: 3, mt: { xs: 8, md: 10 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={900}>
            ✨ Demandes de Contenu
          </Typography>
          <IconButton onClick={fetchMyRequests} title="Actualiser">
            <RefreshRoundedIcon />
          </IconButton>
        </Stack>

        <Grid container spacing={3}>
          {/* Formulaire de nouvelle demande */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                📝 Nouvelle demande
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Décrivez le contenu que vous souhaitez (vidéo, livre, exercices...). L'admin sera notifié par email.
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  {/* Type de contenu */}
                  <TextField
                    select
                    label="Type de contenu *"
                    value={formData.contentType}
                    onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="video">🎥 Cours vidéo</MenuItem>
                    <MenuItem value="livre">📚 Livre / Manuel</MenuItem>
                    <MenuItem value="exercices">📝 Exercices corrigés</MenuItem>
                    <MenuItem value="fiche">📄 Fiche de révision</MenuItem>
                    <MenuItem value="autre">🔖 Autre</MenuItem>
                  </TextField>

                  {/* Matière */}
                  <TextField
                    select
                    label="Matière *"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="maths">Mathématiques</MenuItem>
                    <MenuItem value="physique">Physique</MenuItem>
                    <MenuItem value="chimie">Chimie</MenuItem>
                    <MenuItem value="svt">SVT</MenuItem>
                  </TextField>

                  {/* Niveau */}
                  <TextField
                    select
                    label="Niveau *"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    fullWidth
                  >
                    <MenuItem value="6ème">6ème</MenuItem>
                    <MenuItem value="5ème">5ème</MenuItem>
                    <MenuItem value="4ème">4ème</MenuItem>
                    <MenuItem value="3ème">3ème</MenuItem>
                    <MenuItem value="Seconde">Seconde</MenuItem>
                    <MenuItem value="Première">Première</MenuItem>
                    <MenuItem value="Terminale">Terminale</MenuItem>
                  </TextField>

                  {/* Chapitre */}
                  <TextField
                    label="Chapitre / Thème (optionnel)"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    placeholder="Ex: Fonctions, Dérivées, Probabilités..."
                    fullWidth
                  />

                  {/* Description */}
                  <TextField
                    label="Description détaillée *"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez précisément ce que vous souhaitez..."
                    multiline
                    rows={4}
                    fullWidth
                    required
                  />

                  {/* Priorité */}
                  <TextField
                    select
                    label="Urgence"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    fullWidth
                  >
                    <MenuItem value={1}>1 - Pas urgent</MenuItem>
                    <MenuItem value={2}>2 - Peu urgent</MenuItem>
                    <MenuItem value={3}>3 - Normal</MenuItem>
                    <MenuItem value={4}>4 - Urgent</MenuItem>
                    <MenuItem value={5}>5 - Très urgent</MenuItem>
                  </TextField>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SendRoundedIcon />}
                    disabled={loading}
                    fullWidth
                  >
                    {loading ? "Envoi en cours..." : "Envoyer ma demande"}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid>

          {/* Mes demandes précédentes */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                📋 Mes demandes ({myRequests.length})
              </Typography>

              {myRequests.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                  <Typography variant="body2">
                    Aucune demande pour le moment.
                    <br />
                    Remplissez le formulaire pour en créer une !
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2} sx={{ maxHeight: 600, overflowY: "auto" }}>
                  {myRequests.map((req) => (
                    <Card key={req._id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Stack spacing={1}>
                          <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1} alignItems="center">
                              {contentTypeIcons[req.contentType]}
                              <Typography fontWeight={700}>
                                {contentTypeLabels[req.contentType]}
                              </Typography>
                            </Stack>
                            <Chip
                              label={statusLabels[req.status]}
                              color={statusColors[req.status]}
                              size="small"
                            />
                          </Stack>

                          <Typography variant="body2" color="text.secondary">
                            📚 {req.subject.toUpperCase()} • {req.level}
                            {req.chapter && ` • ${req.chapter}`}
                          </Typography>

                          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                            "{req.description.substring(0, 100)}
                            {req.description.length > 100 && "..."}"
                          </Typography>

                          <Divider sx={{ my: 0.5 }} />

                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                            </Typography>
                            <Chip
                              label={`Priorité ${req.priority}/5`}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnack} severity={snack.sev} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default ContentRequestPage;

