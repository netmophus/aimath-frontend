// pages/teacher/TeacherProfilePage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Chip,
  Avatar,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Autocomplete } from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import API from "../../api";
import PageLayout from "../../components/PageLayout";

/* ------------------ Constantes ------------------ */
const levelsOptions = [
  "6ème", "5ème", "4ème", "3ème",
  "Seconde A", "Seconde C",
  "Première A", "Première C", "Première D",
  "Terminale A", "Terminale C", "Terminale D",
  "Université",
];

const subjectsOptions = [
  "Mathématiques",
  "Physique - Chimie",
  "SVT",
  "Français",
  "Anglais",
  "Histoire - Géographie",
  "Philosophie",
  "Économie",
  "Informatique",
  "Arabe",
];

/* ------------------ Helpers ------------------ */
const formatPhone227Local = (raw) => String(raw || "").replace(/\D/g, "").slice(-8);
const toE164227 = (local8) => {
  const digits = String(local8 || "").replace(/\D/g, "");
  if (digits.length !== 8) return "";
  return `+227${digits}`;
};
const parseGps = (txt) => {
  if (typeof txt !== "string") return null;
  if (!txt.includes(",")) return null;
  const [lat, lng] = txt.split(",").map((v) => parseFloat(v.trim()));
  if ([lat, lng].some((n) => Number.isNaN(n))) return null;
  return { latitude: lat, longitude: lng };
};

/* ------------------ Styles ------------------ */
const Card = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  border: "1px solid rgba(0,0,0,0.06)",
}));

const DropZone = styled("label")(({ theme }) => ({
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  background: "#f8fafc",
  border: "2px dashed #cbd5e1",
  borderRadius: 12,
  padding: theme.spacing(2),
  cursor: "pointer",
}));

/* ------------------ Page ------------------ */
const TeacherProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [snack, setSnack] = useState({ open: false, sev: "success", msg: "" });

  const [form, setForm] = useState({
    fullName: "",
    schoolName: "",
    city: "",
    phone: "",
    email: "",
    subjects: [],
    levels: [],
    gpsLocation: "",
    level: "",
    experience: "",
    photo: "",
  });

  const [preview, setPreview] = useState("");

  /* ------------ Fetch profil (teacher d’abord, fallback user) ------------ */
  const fetchProfile = async () => {
    try {
      setLoading(true);
      let teacher;
      try {
        const r = await API.get("/teachers/me");
        teacher = r.data;
      } catch {
        const r = await API.get("/users/profile");
        teacher = r.data;
      }

      setForm({
        fullName: teacher?.fullName || "",
        schoolName: teacher?.schoolName || "",
        city: teacher?.city || "",
        phone: formatPhone227Local(teacher?.phone), // affichage 8 chiffres
        email: teacher?.email || "",
        subjects: Array.isArray(teacher?.subjects) ? teacher.subjects : [],
        levels: Array.isArray(teacher?.levels) ? teacher.levels : [],
        gpsLocation:
          teacher?.gpsLocation?.latitude && teacher?.gpsLocation?.longitude
            ? `${teacher.gpsLocation.latitude},${teacher.gpsLocation.longitude}`
            : (teacher?.gpsLocation || ""),
        level: teacher?.level || "",
        experience: teacher?.experience || "",
        photo: teacher?.photo || "",
      });
      setPreview(teacher?.photo || "");
    } catch (err) {
      setSnack({ open: true, sev: "error", msg: "Erreur récupération profil." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ------------------ Handlers ------------------ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setForm((f) => ({ ...f, phone: formatPhone227Local(value) }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubjectsChange = (_, value) =>
    setForm((f) => ({ ...f, subjects: value }));
  const handleLevelsChange = (_, value) =>
    setForm((f) => ({ ...f, levels: value }));

  const resetForm = () => fetchProfile();

  const handleSubmit = async () => {
    // validations simples
    if (!form.fullName || !form.schoolName || !form.city) {
      setSnack({ open: true, sev: "warning", msg: "Nom, école et ville sont requis." });
      return;
    }
    if (!form.phone || form.phone.length !== 8) {
      setSnack({ open: true, sev: "warning", msg: "Téléphone : 8 chiffres requis." });
      return;
    }

    const payload = {
      ...form,
      phone: toE164227(form.phone),
    };

    // GPS vers {latitude, longitude}
    const parsed = parseGps(form.gpsLocation);
    if (parsed) payload.gpsLocation = parsed;
    else delete payload.gpsLocation;

    try {
      setSaving(true);
      // teacher route prioritaire
      try {
        await API.put("/teachers/update-profile", payload);
      } catch {
        await API.put("/users/profile", payload);
      }
      setSnack({ open: true, sev: "success", msg: "Profil mis à jour ✅" });
      fetchProfile();
    } catch (err) {
      setSnack({
        open: true,
        sev: "error",
        msg: err.response?.data?.message || "Erreur lors de la mise à jour.",
      });
    } finally {
      setSaving(false);
    }
  };

  const onPickPhoto = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("photo", file); // champ attendu par le backend (uploadProfil)

    try {
      setPhotoUploading(true);
      await API.put("/teachers/update-photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSnack({ open: true, sev: "success", msg: "Photo mise à jour ✅" });
      fetchProfile();
    } catch (err) {
      setSnack({
        open: true,
        sev: "error",
        msg: err.response?.data?.message || "Échec envoi photo.",
      });
    } finally {
      setPhotoUploading(false);
    }
  };

  const profileCompleted = useMemo(() => {
    const required = ["fullName", "schoolName", "city", "phone"];
    return required.every((k) => String(form[k] || "").trim().length > 0);
  }, [form]);

  /* ------------------ Render ------------------ */
  return (
    <PageLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 4, mt: 8 }}>
        <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
          👨‍🏫 Mon profil enseignant
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Complétez vos informations pour que les élèves puissent mieux vous trouver.
        </Typography>

        <Grid container spacing={3}>
          {/* Colonne gauche : Carte identité + photo */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3 }}>
              <Stack alignItems="center" spacing={2}>
                <Avatar
                  src={preview || form.photo || ""}
                  alt={form.fullName || "Photo de profil"}
                  sx={{ width: 112, height: 112, boxShadow: 2 }}
                />
                <DropZone htmlFor="file-input">
                  <Stack spacing={0.5} alignItems="center">
                    <PhotoCameraRoundedIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Déposer une image ou cliquer pour choisir
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PNG/JPG (max 5 Mo)
                    </Typography>
                  </Stack>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => onPickPhoto(e.target.files?.[0])}
                  />
                </DropZone>
                {photoUploading && <CircularProgress size={20} />}
                <Chip
                  label={profileCompleted ? "Profil : Complet" : "Profil : Incomplet"}
                  color={profileCompleted ? "success" : "warning"}
                  size="small"
                />
              </Stack>
            </Card>
          </Grid>

          {/* Colonne droite : Formulaire */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Informations générales
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nom complet"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 8 }}
                    helperText="8 chiffres — le préfixe +227 sera appliqué automatiquement"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">🇳🇪 +227</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Ville"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Établissement"
                    name="schoolName"
                    value={form.schoolName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Niveau d’étude (ex. Master Maths)"
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Expérience (ex. 5 ans)"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Matières
                  </Typography>
                  <Autocomplete
                    multiple
                    options={subjectsOptions}
                    value={form.subjects}
                    onChange={handleSubjectsChange}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip {...getTagProps({ index })} key={option} label={option} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Sélectionner des matières" />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Niveaux
                  </Typography>
                  <Autocomplete
                    multiple
                    options={levelsOptions}
                    value={form.levels}
                    onChange={handleLevelsChange}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip {...getTagProps({ index })} key={option} label={option} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Sélectionner des niveaux" />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Localisation GPS (facultatif)"
                    name="gpsLocation"
                    value={form.gpsLocation}
                    onChange={handleChange}
                    placeholder="Ex: 13.5116,2.1254"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <RoomOutlinedIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveRoundedIcon />}
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? "Enregistrement..." : "Enregistrer"}
                </Button>
                <Button
                  variant="text"
                  startIcon={<RestartAltIcon />}
                  onClick={resetForm}
                  disabled={loading || saving}
                >
                  Réinitialiser
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {loading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(255,255,255,0.65)",
            display: "grid",
            placeItems: "center",
            zIndex: 1200,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </PageLayout>
  );
};

export default TeacherProfilePage;
