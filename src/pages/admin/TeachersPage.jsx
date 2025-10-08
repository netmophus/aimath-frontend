// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Typography,
//   Paper,
//   Button,
//   TextField,
//   IconButton,
//   Switch,
// } from "@mui/material";
// import { Delete, Edit } from "@mui/icons-material";
// import API from "../../api";
// import PageLayout from "../../components/PageLayout";

// const TeachersPage = () => {
//   const [teachers, setTeachers] = useState([]);





//   const [form, setForm] = useState({
//     fullName: "",
//     phone: "",
//     password: "",
//     schoolName: "",
//     city: "",
//   });

//   const fetchTeachers = async () => {
//    const res = await API.get("/users/teachers");
//     setTeachers(res.data);
//   };

//   useEffect(() => {
//     fetchTeachers();
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     try {
//       await API.post("/auth/register", {
//         ...form,
//         role: "teacher",
//       });
//       setForm({ fullName: "", phone: "", password: "", schoolName: "", city: "" });
//       fetchTeachers();
//     } catch (err) {
//       console.error(err);
//       alert("Erreur lors de la création");
//     }
//   };



//   const toggleActive = async (id, current) => {
//   await API.patch(`/users/teachers/${id}/toggle`);
//   fetchTeachers();
// };

  
// const deleteTeacher = async (id) => {
//   if (window.confirm("Supprimer cet enseignant ?")) {
//     await API.delete(`/users/teachers/${id}`);
//     fetchTeachers();
//   }
// };


//   return (
//     <PageLayout>
//       <Box p={4} mt={10}>
//         <Typography variant="h4" fontWeight="bold" mb={4}>
//           👨‍🏫 Gestion des Enseignants
//         </Typography>

//         {/* Formulaire */}
//         <Paper sx={{ p: 3, mb: 4 }}>
//           <Typography variant="h6" mb={2}>Créer un enseignant</Typography>
//           <Grid container spacing={2}>
//             <Grid item xs={12} md={4}>
//               <TextField fullWidth label="Nom complet" name="fullName" value={form.fullName} onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <TextField fullWidth label="Téléphone" name="phone" value={form.phone} onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <TextField fullWidth label="Mot de passe" name="password" value={form.password} onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <TextField fullWidth label="École" name="schoolName" value={form.schoolName} onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <TextField fullWidth label="Ville" name="city" value={form.city} onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Button variant="contained" onClick={handleSubmit} fullWidth>
//                 Enregistrer
//               </Button>
//             </Grid>
//           </Grid>
//         </Paper>

//         {/* Liste des enseignants */}
//         <Paper sx={{ p: 3 }}>
//           <Typography variant="h6" mb={2}>Liste des enseignants</Typography>
//           <Grid container spacing={1}>
//             {teachers.map((teacher) => (
//               <Grid item xs={12} key={teacher._id}>
//                 <Paper sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <Box>
//                     <Typography><strong>Nom:</strong> {teacher.fullName}</Typography>
//                     <Typography><strong>Téléphone:</strong> {teacher.phone}</Typography>
//                     <Typography><strong>École:</strong> {teacher.schoolName}</Typography>
//                     <Typography><strong>Ville:</strong> {teacher.city}</Typography>
//                   </Box>
//                   <Box display="flex" alignItems="center" gap={1}>
//                     <Switch
//                       checked={teacher.isActive}
//                       onChange={() => toggleActive(teacher._id, teacher.isActive)}
//                       color="success"
//                     />
//                     <IconButton onClick={() => deleteTeacher(teacher._id)} color="error">
//                       <Delete />
//                     </IconButton>
//                   </Box>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </Paper>
//       </Box>
//     </PageLayout>
//   );
// };

// export default TeachersPage;



















// pages/admin/TeachersPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Switch,
  Snackbar,
  Alert,
  InputAdornment,
  CircularProgress,
  TablePagination,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import { Delete, Visibility, VisibilityOff, Refresh } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import API from "../../api";
import PageLayout from "../../components/PageLayout";

const formatPhone227 = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  // Ajoute +227 si l’admin saisit 8 chiffres
  if (digits.length === 8) return `+227${digits}`;
  // Laisse passer +227XXXXXXXX ou 227XXXXXXXX
  if (digits.startsWith("227") && digits.length === 11) return `+${digits}`;
  if (digits.startsWith("227") && digits.length === 12) return digits;
  if (digits.startsWith("+227") && digits.length === 12) return digits;
  // Fallback : tente d’ajouter +227
  return `+227${digits.slice(-8)}`;
};

const TeachersPage = () => {
  const [allTeachers, setAllTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // ✅ Pagination (0-based pour TablePagination)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Recherche et filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    schoolName: "",
    city: "",
  });

  const [creating, setCreating] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [errorList, setErrorList] = useState("");

  const [busyToggleId, setBusyToggleId] = useState(null);
  const [busyDeleteId, setBusyDeleteId] = useState(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoadingList(true);
      setErrorList("");
      const res = await API.get("/teachers");
      const data = Array.isArray(res.data) ? res.data : [];
      setAllTeachers(data);
      setFilteredTeachers(data);
    } catch (err) {
      setErrorList(err.response?.data?.message || "Erreur lors du chargement.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Fonction de filtrage
  const applyFilters = useCallback(() => {
    let filtered = [...allTeachers];

    // Filtre par recherche (nom, téléphone, école)
    if (searchTerm) {
      filtered = filtered.filter(teacher =>
        teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (teacher.schoolName && teacher.schoolName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtre par ville
    if (cityFilter) {
      filtered = filtered.filter(teacher => teacher.city === cityFilter);
    }

    // Filtre par statut
    if (statusFilter) {
      if (statusFilter === "active") {
        filtered = filtered.filter(teacher => teacher.isActive);
      } else if (statusFilter === "inactive") {
        filtered = filtered.filter(teacher => !teacher.isActive);
      }
    }

    setFilteredTeachers(filtered);
    setPage(0); // Reset à la première page quand on filtre
  }, [allTeachers, searchTerm, cityFilter, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination côté client
  const paginatedTeachers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTeachers.slice(start, start + rowsPerPage);
  }, [filteredTeachers, page, rowsPerPage]);

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchTerm("");
    setCityFilter("");
    setStatusFilter("");
    setPage(0);
  };

  // Statistiques
  const stats = {
    total: allTeachers.length,
    active: allTeachers.filter(t => t.isActive).length,
    inactive: allTeachers.filter(t => !t.isActive).length,
    cities: [...new Set(allTeachers.map(t => t.city).filter(Boolean))].length
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Téléphone: ne garder que les chiffres (affichage 8 chiffres local)
    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(-8);
      setForm((f) => ({ ...f, phone: digits }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async () => {
    // validations simples
    if (!form.fullName || !form.schoolName || !form.city) {
      setSnack({ open: true, msg: "Nom, école et ville sont requis.", sev: "warning" });
      return;
    }
    if (!form.phone || form.phone.length !== 8) {
      setSnack({ open: true, msg: "Le téléphone doit avoir 8 chiffres.", sev: "warning" });
      return;
    }
    if (!form.password || form.password.length < 6) {
      setSnack({ open: true, msg: "Mot de passe (≥ 6 caractères) requis.", sev: "warning" });
      return;
    }

    try {
      setCreating(true);
      const payload = {
        role: "teacher",
        fullName: form.fullName.trim(),
        phone: formatPhone227(form.phone),
        password: form.password,
        schoolName: form.schoolName.trim(),
        city: form.city.trim(),
      };
      await API.post("/teachers", payload); // POST /api/teachers

      setSnack({ open: true, msg: "Enseignant créé.", sev: "success" });
      setForm({ fullName: "", phone: "", password: "", schoolName: "", city: "" });
      fetchTeachers();
    } catch (err) {
      setSnack({
        open: true,
        msg: err.response?.data?.message || "Erreur lors de la création.",
        sev: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      setBusyToggleId(id);
      await API.patch(`/teachers/${id}/toggle`); // PATCH /api/teachers/:id/toggle
      setSnack({ open: true, msg: "Statut mis à jour.", sev: "success" });
      fetchTeachers();
    } catch (err) {
      setSnack({
        open: true,
        msg: err.response?.data?.message || "Erreur lors de la mise à jour.",
        sev: "error",
      });
    } finally {
      setBusyToggleId(null);
    }
  };

  const deleteTeacher = async (id) => {
    if (!window.confirm("Supprimer cet enseignant ?")) return;
    try {
      setBusyDeleteId(id);
      await API.delete(`/teachers/${id}`); // DELETE /api/teachers/:id
      setSnack({ open: true, msg: "Enseignant supprimé.", sev: "success" });
      fetchTeachers();
    } catch (err) {
      setSnack({
        open: true,
        msg: err.response?.data?.message || "Erreur lors de la suppression.",
        sev: "error",
      });
    } finally {
      setBusyDeleteId(null);
    }
  };

  return (
    <PageLayout>
      <Box p={4} mt={10}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            👨‍🏫 Gestion des Enseignants
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchTeachers}
            disabled={loadingList}
            variant="outlined"
          >
            Actualiser
          </Button>
        </Box>

        {/* Formulaire création */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>
            Créer un enseignant
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Nom complet"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*", maxLength: 8 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">🇳🇪 +227</InputAdornment>,
                }}
                helperText="8 chiffres (ex: 90123456)"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <IconButton onClick={() => setShowPwd((s) => !s)}>
                      {showPwd ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="École"
                name="schoolName"
                value={form.schoolName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Ville" name="city" value={form.city} onChange={handleChange} />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                fullWidth
                disabled={creating}
              >
                {creating ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Enregistrer"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Cartes de statistiques */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Enseignants
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {stats.active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Actifs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {stats.inactive}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Inactifs
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {stats.cities}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Villes
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
              placeholder="Recherche (nom, téléphone, école...)"
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
              <InputLabel>Ville</InputLabel>
              <Select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                label="Ville"
              >
                <MenuItem value="">Toutes</MenuItem>
                {[...new Set(allTeachers.map(t => t.city).filter(Boolean))].map((city) => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="active">Actifs</MenuItem>
                <MenuItem value="inactive">Inactifs</MenuItem>
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

        {/* Liste des enseignants */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Liste des enseignants
          </Typography>

          {errorList && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorList}
            </Alert>
          )}

          {loadingList ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : filteredTeachers.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={3}>
              {searchTerm || cityFilter || statusFilter 
                ? "Aucun enseignant ne correspond aux filtres." 
                : "Aucun enseignant pour le moment."}
            </Typography>
          ) : (
            <>
              <Grid container spacing={1}>
                {paginatedTeachers.map((teacher) => (
              <Grid item xs={12} key={teacher._id}>
                <Paper
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(0,0,0,0.06)",
                  }}
                  variant="outlined"
                >
                  <Box>
                    <Typography>
                      <strong>Nom :</strong> {teacher.fullName}
                    </Typography>
                    <Typography>
                      <strong>Téléphone :</strong> {teacher.phone}
                    </Typography>
                    <Typography>
                      <strong>École :</strong> {teacher.schoolName}
                    </Typography>
                    <Typography>
                      <strong>Ville :</strong> {teacher.city}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Statut : {teacher.isActive ? "Actif" : "Inactif"}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Switch
                      checked={!!teacher.isActive}
                      onChange={() => toggleActive(teacher._id)}
                      color="success"
                      disabled={busyToggleId === teacher._id}
                    />
                    <IconButton
                      onClick={() => deleteTeacher(teacher._id)}
                      color="error"
                      disabled={busyDeleteId === teacher._id}
                    >
                      {busyDeleteId === teacher._id ? <CircularProgress size={20} /> : <Delete />}
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
                ))}
              </Grid>

              {/* ✅ TablePagination */}
              <TablePagination
                component="div"
                count={filteredTeachers.length}
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
                  mt: 2,
                  '& .MuiTablePagination-toolbar': {
                    paddingLeft: 2,
                    paddingRight: 2,
                  }
                }}
              />
            </>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default TeachersPage;
