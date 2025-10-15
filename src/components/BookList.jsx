import React, { useEffect, useState, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Link, Stack, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, CircularProgress, IconButton,
  TablePagination, TableSortLabel, InputAdornment,
  Chip, Card, CardContent, Grid, Skeleton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageIcon from "@mui/icons-material/Image";
import SearchIcon from "@mui/icons-material/Search";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import API from "../api";

const initialForm = {
  title: "",
  author: "",
  description: "",
  level: "",
  subject: "maths",
  badge: "gratuit",
};

// ✅ Hook debounce
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // ✅ Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // ✅ Recherche et filtres
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [filterLevel, setFilterLevel] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterBadge, setFilterBadge] = useState("");
  
  // ✅ Tri
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Edition
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);

  // Suppression
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Snackbar
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });
  const showSnack = (type, msg) => setSnack({ open: true, type, msg });

  // ✅ Fetch avec tous les filtres
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/books");
      setBooks(res.data || []);
    } catch (err) {
      console.error("❌ Erreur lors du chargement des livres :", err);
      showSnack("error", "Erreur lors du chargement des livres.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // ✅ Filtrage et tri côté client
  const filteredBooks = React.useMemo(() => {
    let result = [...books];

    // Recherche
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(searchLower) ||
          b.author?.toLowerCase().includes(searchLower) ||
          b.level?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre niveau
    if (filterLevel) {
      result = result.filter((b) => b.level === filterLevel);
    }

    // Filtre matière
    if (filterSubject) {
      result = result.filter((b) => (b.subject || "maths") === filterSubject);
    }

    // Filtre badge
    if (filterBadge) {
      result = result.filter((b) => b.badge === filterBadge);
    }

    // Tri
    result.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return result;
  }, [books, debouncedSearch, filterLevel, filterSubject, filterBadge, sortBy, sortOrder]);

  // ✅ Pagination côté client
  const paginatedBooks = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filteredBooks.slice(start, start + rowsPerPage);
  }, [filteredBooks, page, rowsPerPage]);

  // ✅ Stats
  const stats = React.useMemo(() => {
    return {
      total: books.length,
      gratuit: books.filter((b) => b.badge === "gratuit").length,
      premium: books.filter((b) => b.badge === "prenuim").length,
    };
  }, [books]);

  // ✅ Tri par colonne
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // ✅ Reset filtres
  const handleResetFilters = () => {
    setSearch("");
    setFilterLevel("");
    setFilterSubject("");
    setFilterBadge("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(0);
  };

  /* ---------- Edition ---------- */
  const handleOpenEdit = (book) => {
    setCurrentBook(book);
    setForm({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      level: book.level || "",
      subject: book.subject || "maths",
      badge: book.badge || "gratuit",
    });
    setCoverFile(null);
    setPdfFile(null);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setCurrentBook(null);
    setForm(initialForm);
    setCoverFile(null);
    setPdfFile(null);
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmitEdit = async () => {
    if (!currentBook?._id) return;

    if (!form.title || !form.author || !form.description || !form.level || !form.subject || !form.badge) {
      showSnack("warning", "Tous les champs texte sont requis.");
      return;
    }

    try {
      setEditLoading(true);
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("author", form.author);
      fd.append("description", form.description);
      fd.append("level", form.level);
      fd.append("subject", form.subject);
      fd.append("badge", form.badge);
      if (coverFile) fd.append("cover", coverFile);
      if (pdfFile) fd.append("pdf", pdfFile);

      await API.put(`/admin/books/${currentBook._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      showSnack("success", "Livre mis à jour avec succès.");
      setEditOpen(false);
      setCurrentBook(null);
      setForm(initialForm);
      await fetchBooks();
    } catch (err) {
      console.error("❌ Erreur mise à jour :", err);
      showSnack("error", "Erreur lors de la mise à jour du livre.");
    } finally {
      setEditLoading(false);
    }
  };

  /* ---------- Suppression ---------- */
  const askDelete = (book) => {
    setCurrentBook(book);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setCurrentBook(null);
  };

  const confirmDelete = async () => {
    if (!currentBook?._id) return;
    try {
      setDeletingId(currentBook._id);
      await API.delete(`/admin/books/${currentBook._id}`);
      showSnack("success", "Livre supprimé.");
      setBooks((prev) => prev.filter((b) => b._id !== currentBook._id));
      setConfirmOpen(false);
      setCurrentBook(null);
    } catch (err) {
      console.error("❌ Erreur suppression :", err);
      showSnack("error", "Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      {/* ✅ Statistiques en haut */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <MenuBookIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h5" fontWeight={800}>{stats.total}</Typography>
              <Typography variant="caption" color="text.secondary">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <LockOpenIcon color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h5" fontWeight={800}>{stats.gratuit}</Typography>
              <Typography variant="caption" color="text.secondary">Gratuits</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <LockIcon color="warning" sx={{ fontSize: 40 }} />
              <Typography variant="h5" fontWeight={800}>{stats.premium}</Typography>
              <Typography variant="caption" color="text.secondary">Premium</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={800} gutterBottom>
            📚 Liste des Livres
          </Typography>

          {/* ✅ Recherche et filtres */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
            <TextField
              label="Recherche (titre, auteur, niveau)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Niveau</InputLabel>
              <Select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} label="Niveau">
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="6eme">6ème</MenuItem>
                <MenuItem value="5eme">5ème</MenuItem>
                <MenuItem value="4eme">4ème</MenuItem>
                <MenuItem value="3eme">3ème</MenuItem>
                <MenuItem value="seconde">Seconde</MenuItem>
                <MenuItem value="premiere">Première</MenuItem>
                <MenuItem value="terminale">Terminale</MenuItem>
                <MenuItem value="universite">Université</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Matière</InputLabel>
              <Select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} label="Matière">
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="maths">Mathématiques</MenuItem>
                <MenuItem value="physique">Physique</MenuItem>
                <MenuItem value="chimie">Chimie</MenuItem>
                <MenuItem value="svt">SVT</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Badge</InputLabel>
              <Select value={filterBadge} onChange={(e) => setFilterBadge(e.target.value)} label="Badge">
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

          {/* ✅ Loading bar */}
          {loading && <CircularProgress sx={{ display: "block", mx: "auto", mb: 2 }} />}

          {/* ✅ Table */}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "title"}
                    direction={sortBy === "title" ? sortOrder : "asc"}
                    onClick={() => handleSort("title")}
                  >
                    <strong>Titre</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "author"}
                    direction={sortBy === "author" ? sortOrder : "asc"}
                    onClick={() => handleSort("author")}
                  >
                    <strong>Auteur</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell><strong>Niveau</strong></TableCell>
                <TableCell><strong>Badge</strong></TableCell>
                <TableCell><strong>Couverture</strong></TableCell>
                <TableCell><strong>Fichier</strong></TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "createdAt"}
                    direction={sortBy === "createdAt" ? sortOrder : "asc"}
                    onClick={() => handleSort("createdAt")}
                  >
                    <strong>Date</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton variant="rectangular" height={40} />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">Aucun livre trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBooks.map((book) => (
                  <TableRow key={book._id} hover>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>
                      <Chip label={book.level?.toUpperCase()} size="small" color="info" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={book.badge === "gratuit" ? "Gratuit" : "Premium"}
                        size="small"
                        color={book.badge === "gratuit" ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell>
                      <img
                        src={book.coverImage}
                        alt="Couverture"
                        style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4 }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://via.placeholder.com/56x56?text=N/A";
                        }}
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="column" spacing={0.5}>
                        <Link
                          href={book.fileUrl}
                          target="_blank"
                          rel="noopener"
                          underline="hover"
                          color="primary"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          sx={{ fontSize: 12 }}
                        >
                          <VisibilityIcon fontSize="small" />
                          Lire
                        </Link>
                        <Link
                          href={book.fileUrl}
                          target="_blank"
                          rel="noopener"
                          underline="hover"
                          color="secondary"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                          download
                          sx={{ fontSize: 12 }}
                        >
                          <DownloadIcon fontSize="small" />
                          Télécharger
                        </Link>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {book.createdAt ? new Date(book.createdAt).toLocaleDateString("fr-FR") : "—"}
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenEdit(book)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => askDelete(book)}
                          disabled={deletingId === book._id}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* ✅ Pagination */}
          <TablePagination
            component="div"
            count={filteredBooks.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage="Lignes par page :"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count}`}
          />
        </Box>
      </TableContainer>

      {/* -------- Dialog Edition -------- */}
      <Dialog open={editOpen} onClose={editLoading ? undefined : handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Modifier le livre</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField label="Titre" name="title" value={form.title} onChange={onFormChange} fullWidth required />
            <TextField label="Auteur" name="author" value={form.author} onChange={onFormChange} fullWidth required />
            <TextField label="Description" name="description" value={form.description} onChange={onFormChange} fullWidth multiline minRows={3} required />
            <TextField label="Niveau" name="level" value={form.level} onChange={onFormChange} fullWidth required />

            <FormControl fullWidth>
              <InputLabel id="subject-label">Matière</InputLabel>
              <Select labelId="subject-label" label="Matière" name="subject" value={form.subject} onChange={onFormChange}>
                <MenuItem value="maths">Mathématiques</MenuItem>
                <MenuItem value="physique">Physique</MenuItem>
                <MenuItem value="chimie">Chimie</MenuItem>
                <MenuItem value="svt">SVT</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="badge-label">Badge</InputLabel>
              <Select labelId="badge-label" label="Badge" name="badge" value={form.badge} onChange={onFormChange}>
                <MenuItem value="gratuit">Gratuit</MenuItem>
                <MenuItem value="prenuim">Prenuim</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button component="label" variant="outlined" startIcon={<ImageIcon />}>
                Remplacer couverture
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {coverFile?.name || (currentBook?.coverImage ? "Couverture actuelle conservée" : "Pas de couverture")}
              </Typography>
              {currentBook?.coverImage && (
                <IconButton href={currentBook.coverImage} target="_blank" rel="noopener" size="small">
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
                Remplacer PDF
                <input
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {pdfFile?.name || (currentBook?.fileUrl ? "PDF actuel conservé" : "Pas de PDF")}
              </Typography>
              {currentBook?.fileUrl && (
                <>
                  <IconButton href={currentBook.fileUrl} target="_blank" rel="noopener" size="small">
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton href={currentBook.fileUrl} target="_blank" rel="noopener" size="small">
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={editLoading}>Annuler</Button>
          <Button onClick={handleSubmitEdit} variant="contained" disabled={editLoading}>
            {editLoading ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- Dialog Confirmation Suppression -------- */}
      <Dialog open={confirmOpen} onClose={deletingId ? undefined : closeConfirm}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent dividers>
          <Typography>Supprimer le livre <strong>{currentBook?.title}</strong> ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm} disabled={!!deletingId}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" startIcon={<DeleteIcon />} disabled={!!deletingId}>
            {deletingId ? "Suppression…" : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* -------- Snackbar -------- */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookList;