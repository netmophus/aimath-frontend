import React, { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import API from "../../api";

const UserDetailDrawer = ({ open, onClose, userId }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && userId) {
      fetchDetails();
    }
  }, [open, userId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/admin/users/${userId}/details`);
      setDetails(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement détails", err);
      setError("Impossible de charger les détails de l'utilisateur");
    } finally {
      setLoading(false);
    }
  };

  const user = details?.user;
  const stats = details?.stats;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 500 } } }}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight={800}>
            Détails utilisateur
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {user && (
          <>
            {/* Avatar + Nom */}
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: 28, fontWeight: 800 }}>
                {user.fullName?.charAt(0)?.toUpperCase() || "?"}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {user.fullName || "Nom non défini"}
                </Typography>
                <Chip
                  label={user.role === "student" ? "Élève" : user.role === "teacher" ? "Enseignant" : "Admin"}
                  color="primary"
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Stack>

            {/* Infos de base */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Informations de contact
                </Typography>
                <List dense>
                  <ListItem>
                    <PhoneIcon sx={{ mr: 2, color: "primary.main" }} />
                    <ListItemText primary="Téléphone" secondary={user.phone || "Non défini"} />
                  </ListItem>
                  <ListItem>
                    <EmailIcon sx={{ mr: 2, color: "primary.main" }} />
                    <ListItemText primary="Email" secondary={user.email || "Non défini"} />
                  </ListItem>
                  <ListItem>
                    <SchoolIcon sx={{ mr: 2, color: "primary.main" }} />
                    <ListItemText primary="École" secondary={user.schoolName || "Non défini"} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Statuts */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Statuts
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {user.isActive ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <CancelIcon color="error" />
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Compte
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {user.isActive ? "Actif" : "Inactif"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={6}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {user.isSubscribed ? (
                        <CardMembershipIcon color="success" />
                      ) : (
                        <CardMembershipIcon color="disabled" />
                      )}
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Abonnement
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {user.isSubscribed ? "Actif" : "Inactif"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Dates importantes */}
            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Historique
                </Typography>
                <List dense>
                  <ListItem>
                    <CalendarTodayIcon sx={{ mr: 2, color: "primary.main" }} />
                    <ListItemText
                      primary="Inscription"
                      secondary={`${new Date(user.createdAt).toLocaleDateString("fr-FR")} (il y a ${stats?.joinedDaysAgo || 0} jours)`}
                    />
                  </ListItem>
                  {user.lastLogin && (
                    <ListItem>
                      <CalendarTodayIcon sx={{ mr: 2, color: "primary.main" }} />
                      <ListItemText
                        primary="Dernière connexion"
                        secondary={`${new Date(user.lastLogin).toLocaleDateString("fr-FR")} (il y a ${stats?.lastLoginDaysAgo || 0} jours)`}
                      />
                    </ListItem>
                  )}
                  {user.subscriptionEnd && (
                    <ListItem>
                      <CardMembershipIcon sx={{ mr: 2, color: "primary.main" }} />
                      <ListItemText
                        primary="Fin d'abonnement"
                        secondary={new Date(user.subscriptionEnd).toLocaleDateString("fr-FR")}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>

            {/* Actions */}
            <Stack spacing={2}>
              <Button variant="outlined" fullWidth onClick={onClose}>
                Fermer
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default UserDetailDrawer;
