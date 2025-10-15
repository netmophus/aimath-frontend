// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   Typography,
//   Paper,
//   Box,
//   Button,
//   Chip,
// } from "@mui/material";
// import API from "../api";

// const ExamList = () => {
//   const [exams, setExams] = useState([]);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const res = await API.get("/exams");
//         setExams(res.data);
//       } catch (error) {
//         console.error("Erreur lors du chargement des examens :", error);
//       }
//     };
//     fetchExams();
//   }, []);

//   return (
//     <Box mt={5}>
//       <Typography variant="h6" fontWeight="bold" gutterBottom>
//         📋 Liste des Sujets d'Examen
//       </Typography>

//       <Paper>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Titre</TableCell>
//               <TableCell>Niveau</TableCell>
//               <TableCell>Description</TableCell>
//               <TableCell>Badge</TableCell>
//               <TableCell>Publié le</TableCell>
//               <TableCell>Action</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {exams.map((exam) => (
//               <TableRow key={exam._id}>
//                 <TableCell>{exam.title}</TableCell>
//                 <TableCell>{exam.level?.toUpperCase()}</TableCell>
//                 <TableCell>
//                   {exam.description.length > 60
//                     ? exam.description.substring(0, 60) + "..."
//                     : exam.description}
//                 </TableCell>
//                 <TableCell>
//                   <Chip
//                     label={exam.badge === "gratuit" ? "Gratuit" : "Prenuim"}
//                     color={exam.badge === "gratuit" ? "success" : "warning"}
//                     size="small"
//                   />
//                 </TableCell>
//                 <TableCell>
//                   {new Date(exam.createdAt).toLocaleDateString("fr-FR")}
//                 </TableCell>
//                 <TableCell>
//   <Button
//     variant="outlined"
//     size="small"
//     href={exam.subjectUrl}
//     target="_blank"
//     sx={{ mr: 1 }}
//   >
//     📄 Sujet
//   </Button>
//   <Button
//     variant="outlined"
//     size="small"
//     color="secondary"
//     href={exam.correctionUrl}
//     target="_blank"
//   >
//     📝 Correction
//   </Button>
// </TableCell>

//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Paper>
//     </Box>
//   );
// };

// export default ExamList;






import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Typography, Paper, Box, Button, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, CircularProgress, Checkbox, FormControlLabel,
  TablePagination, Card, CardContent, Grid, InputAdornment
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  UploadFile as UploadFileIcon,
  Image as ImageIcon
} from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import API from "../api";

const initialForm = {
  title: "",
  level: "",
  subject: "maths",
  description: "",
  badge: "gratuit",
};

const ExamList = () => {
  const [allExams, setAllExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination (0-based pour TablePagination)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Recherche et filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [badgeFilter, setBadgeFilter] = useState("");

  // Edition
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [form, setForm] = useState(initialForm);

  // Fichiers (nouveaux, optionnels)
  const [subjectFile, setSubjectFile] = useState(null);
  const [correctionFile, setCorrectionFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // Suppressions de fichiers existants
  const [removeCorrection, setRemoveCorrection] = useState(false);
  const [removeCover, setRemoveCover] = useState(false);

  // Suppression
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Feedback
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });
  const showSnack = (type, msg) => setSnack({ open: true, type, msg });

  // Helper pour extraire le nom de fichier depuis une URL Cloudinary
  const getFileNameFromUrl = (url) => {
    if (!url) return null;
    try {
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      // Decode URL-encoded characters
      return decodeURIComponent(lastPart);
    } catch {
      return null;
    }
  };

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/exams");
      const data = res.data || [];
      setAllExams(data);
      setFilteredExams(data);
    } catch (error) {
      console.error("Erreur lors du chargement des examens :", error);
      showSnack("error", "Erreur lors du chargement des sujets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  // Fonction de filtrage
  const applyFilters = useCallback(() => {
    let filtered = [...allExams];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par niveau
    if (levelFilter) {
      filtered = filtered.filter(exam => exam.level === levelFilter);
    }

    // Filtre par matière
    if (subjectFilter) {
      filtered = filtered.filter(exam => (exam.subject || "maths") === subjectFilter);
    }

    // Filtre par badge
    if (badgeFilter) {
      filtered = filtered.filter(exam => exam.badge === badgeFilter);
    }

    setFilteredExams(filtered);
    setPage(0); // Reset à la première page quand on filtre
  }, [allExams, searchTerm, levelFilter, subjectFilter, badgeFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination côté client
  const paginatedExams = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredExams.slice(start, start + rowsPerPage);
  }, [filteredExams, page, rowsPerPage]);

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchTerm("");
    setLevelFilter("");
    setSubjectFilter("");
    setBadgeFilter("");
    setPage(0);
  };

  // Statistiques
  const stats = {
    total: allExams.length,
    gratuit: allExams.filter(e => e.badge === "gratuit").length,
    premium: allExams.filter(e => e.badge === "prenuim").length
  };

  /* ---------- Edition ---------- */
  const handleOpenEdit = (exam) => {
    setCurrentExam(exam);
    setForm({
      title: exam.title || "",
      level: exam.level || "",
      subject: exam.subject || "maths",
      description: exam.description || "",
      badge: exam.badge || "gratuit",
    });
    // reset fichiers/toggles
    setSubjectFile(null);
    setCorrectionFile(null);
    setCoverFile(null);
    setRemoveCorrection(false);
    setRemoveCover(false);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setCurrentExam(null);
    setForm(initialForm);
    setSubjectFile(null);
    setCorrectionFile(null);
    setCoverFile(null);
    setRemoveCorrection(false);
    setRemoveCover(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmitEdit = async () => {
    if (!currentExam?._id) return;

    // champs requis côté backend : title, level, subject, description, badge
    if (!form.title || !form.level || !form.subject || !form.description || !form.badge) {
      showSnack("warning", "Tous les champs sont requis.");
      return;
    }

    try {
      setEditLoading(true);

      const fd = new FormData();
      // champs texte
      fd.append("title", form.title);
      fd.append("level", form.level);
      fd.append("subject", form.subject);
      fd.append("description", form.description);
      fd.append("badge", form.badge);

      // remplacements optionnels
      if (subjectFile) fd.append("subject", subjectFile);
      if (correctionFile) fd.append("correction", correctionFile);
      if (coverFile) fd.append("cover", coverFile);

      // suppressions optionnelles
      if (removeCorrection) fd.append("removeCorrection", "true");
      if (removeCover) fd.append("removeCover", "true");

      await API.put(`/exams/${currentExam._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSnack("success", "Sujet mis à jour avec succès.");
      setEditOpen(false);
      setCurrentExam(null);
      setForm(initialForm);
      await fetchExams(); // refetch car le contrôleur ne renvoie pas l'objet à jour
    } catch (error) {
      console.error("Erreur mise à jour :", error);
      showSnack("error", "Erreur lors de la mise à jour du sujet.");
    } finally {
      setEditLoading(false);
    }
  };

  /* ---------- Suppression ---------- */
  const handleAskDelete = (exam) => {
    setCurrentExam(exam);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setCurrentExam(null);
  };

  const handleConfirmDelete = async () => {
    if (!currentExam?._id) return;
    try {
      setDeletingId(currentExam._id);
      await API.delete(`/exams/${currentExam._id}`);
      showSnack("success", "Sujet supprimé.");
      // Recharger les examens après suppression
      fetchExams();
      setConfirmOpen(false);
      setCurrentExam(null);
    } catch (error) {
      console.error("Erreur suppression :", error);
      showSnack("error", "Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box mt={5}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        📋 Liste des Sujets d'Examen
      </Typography>

      {/* Cartes de statistiques */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.gratuit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gratuits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.premium}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Premium
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de recherche et filtres */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          🔍 Recherche et Filtres
        </Typography>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Recherche (titre, description...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Niveau</InputLabel>
            <Select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              label="Niveau"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="6eme">6ème</MenuItem>
              <MenuItem value="5eme">5ème</MenuItem>
              <MenuItem value="4eme">4ème</MenuItem>
              <MenuItem value="3eme">3ème</MenuItem>
              <MenuItem value="seconde">Seconde</MenuItem>
              <MenuItem value="premiere">Première</MenuItem>
              <MenuItem value="terminale">Terminale</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Matière</InputLabel>
            <Select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              label="Matière"
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="maths">Mathématiques</MenuItem>
              <MenuItem value="physique">Physique</MenuItem>
              <MenuItem value="chimie">Chimie</MenuItem>
              <MenuItem value="svt">SVT</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Badge</InputLabel>
            <Select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              label="Badge"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="gratuit">Gratuit</MenuItem>
              <MenuItem value="prenuim">Premium</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleResetFilters}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: '#e3f2fd',
                color: '#1565c0'
              },
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              minWidth: '120px'
            }}
          >
            🔄 Réinitialiser
          </Button>
        </Stack>
      </Paper>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Badge</TableCell>
              <TableCell>Publié le</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box display="flex" alignItems="center" justifyContent="center" py={3} gap={1}>
                    <CircularProgress size={20} />
                    <Typography>Chargement…</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">
                    {searchTerm || levelFilter || badgeFilter 
                      ? "Aucun sujet ne correspond aux filtres." 
                      : "Aucun sujet pour le moment."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedExams.map((exam) => (
                <TableRow key={exam._id} hover>
                  <TableCell>{exam.title}</TableCell>
                  <TableCell>{exam.level?.toUpperCase()}</TableCell>
                  <TableCell sx={{ maxWidth: 380 }}>
                    {exam.description?.length > 60
                      ? exam.description.substring(0, 60) + "…"
                      : exam.description}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={exam.badge === "gratuit" ? "Gratuit" : "Prenuim"}
                      color={exam.badge === "gratuit" ? "success" : "warning"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {exam.createdAt ? new Date(exam.createdAt).toLocaleDateString("fr-FR") : "—"}
                  </TableCell>

                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                      <Button
                        variant="outlined"
                        size="small"
                        href={exam.subjectUrl}
                        target="_blank"
                        startIcon={<DownloadIcon />}
                        sx={{ mr: 0.5 }}
                      >
                        Sujet
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="secondary"
                        href={exam.correctionUrl || undefined}
                        target="_blank"
                        disabled={!exam.correctionUrl}
                        startIcon={<DownloadIcon />}
                        sx={{ mr: 0.5 }}
                      >
                        Correction
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEdit(exam)}
                        startIcon={<EditIcon />}
                        sx={{ mr: 0.5 }}
                      >
                        Modifier
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => handleAskDelete(exam)}
                        startIcon={<DeleteIcon />}
                        disabled={deletingId === exam._id}
                      >
                        {deletingId === exam._id ? "Suppression…" : "Supprimer"}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* ✅ TablePagination */}
        <TablePagination
          component="div"
          count={filteredExams.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
          }
          sx={{ 
            borderTop: '1px solid #e0e0e0',
            '& .MuiTablePagination-toolbar': {
              paddingLeft: 2,
              paddingRight: 2,
            }
          }}
        />
      </Paper>

      {/* ----- Dialog Edition ----- */}
      <Dialog open={editOpen} onClose={editLoading ? undefined : handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Modifier le sujet</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField label="Titre" name="title" value={form.title} onChange={handleFormChange} fullWidth required />
            <TextField label="Niveau (ex: 3eme, terminale)" name="level" value={form.level} onChange={handleFormChange} fullWidth required />
            <FormControl fullWidth>
              <InputLabel id="subject-label">Matière</InputLabel>
              <Select labelId="subject-label" label="Matière" name="subject" value={form.subject} onChange={handleFormChange}>
                <MenuItem value="maths">Mathématiques</MenuItem>
                <MenuItem value="physique">Physique</MenuItem>
                <MenuItem value="chimie">Chimie</MenuItem>
                <MenuItem value="svt">SVT</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth multiline minRows={3} required />
            <FormControl fullWidth>
              <InputLabel id="badge-label">Badge</InputLabel>
              <Select labelId="badge-label" label="Badge" name="badge" value={form.badge} onChange={handleFormChange}>
                <MenuItem value="gratuit">Gratuit</MenuItem>
                <MenuItem value="prenuim">Prenuim</MenuItem>
              </Select>
            </FormControl>

            {/* Fichiers (optionnels) */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                Remplacer PDF Sujet
                <input type="file" accept="application/pdf" hidden onChange={(e) => setSubjectFile(e.target.files?.[0] || null)} />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {subjectFile?.name || getFileNameFromUrl(currentExam?.subjectUrl) || "Aucun fichier"}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button component="label" variant="outlined" color="secondary" startIcon={<UploadFileIcon />}>
                Remplacer PDF Correction
                <input type="file" accept="application/pdf" hidden onChange={(e) => setCorrectionFile(e.target.files?.[0] || null)} />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {correctionFile?.name || getFileNameFromUrl(currentExam?.correctionUrl) || "Pas de correction"}
              </Typography>
            </Stack>

            {currentExam?.correctionUrl && !correctionFile && (
              <FormControlLabel
                control={<Checkbox checked={removeCorrection} onChange={(e) => setRemoveCorrection(e.target.checked)} />}
                label="Supprimer la correction existante"
              />
            )}

            <Stack direction="row" spacing={1} alignItems="center">
              <Button component="label" variant="outlined" startIcon={<ImageIcon />}>
                Remplacer l'image de couverture
                <input type="file" accept="image/*" hidden onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {coverFile?.name || getFileNameFromUrl(currentExam?.coverImage) || "Pas d'image"}
              </Typography>
            </Stack>

            {currentExam?.coverImage && !coverFile && (
              <FormControlLabel
                control={<Checkbox checked={removeCover} onChange={(e) => setRemoveCover(e.target.checked)} />}
                label="Supprimer la couverture existante"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={editLoading}>Annuler</Button>
          <Button onClick={handleSubmitEdit} variant="contained" disabled={editLoading}>
            {editLoading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----- Dialog Confirmation Suppression ----- */}
      <Dialog open={confirmOpen} onClose={deletingId ? undefined : handleCloseConfirm}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent dividers>
          <Typography>Voulez-vous vraiment supprimer le sujet <strong>{currentExam?.title}</strong> ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} disabled={!!deletingId}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={!!deletingId} startIcon={<DeleteIcon />}>
            {deletingId ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnack((s) => ({ ...s, open: false }))} severity={snack.type} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExamList;
