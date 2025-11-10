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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  MenuBook as MenuBookIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { libraryService } from "../services/libraryService";

const LibraryBooksManagePage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    subject: "",
    level: "universite",
    pages: "",
    year: "",
    coverImageUrl: "",
    summaryUrl: "",
    tags: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les matières depuis l'API
      const subjectsResponse = await libraryService.getAdminSubjects();
      const subjectsData = subjectsResponse.data || subjectsResponse;
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);

      // Charger les livres depuis l'API
      const booksResponse = await libraryService.getAdminBooks();
      const booksData = booksResponse.data || booksResponse;
      setBooks(Array.isArray(booksData) ? booksData : []);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setAlert({
        show: true,
        message: "Erreur lors du chargement des données",
        type: "error"
      });
      // S'assurer que les états sont des tableaux vides en cas d'erreur
      setSubjects([]);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (book = null) => {
    if (book) {
      setEditingBook(book);
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        subject: book.subject?._id || book.subject || "",
        level: book.level,
        pages: book.pages.toString(),
        year: book.year.toString(),
        coverImageUrl: book.coverImageUrl,
        summaryUrl: book.summaryUrl,
        tags: book.tags,
      });
    } else {
      setEditingBook(null);
      setFormData({
        title: "",
        author: "",
        description: "",
        subject: "",
        level: "universite",
        pages: "",
        year: "",
        coverImageUrl: "",
        summaryUrl: "",
        tags: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBook(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingBook) {
        // Mettre à jour le livre
        await libraryService.updateAdminBook(editingBook._id, formData);
        setAlert({
          show: true,
          message: "Livre mis à jour avec succès",
          type: "success"
        });
      } else {
        // Créer un nouveau livre
        await libraryService.createAdminBook(formData);
        setAlert({
          show: true,
          message: "Livre créé avec succès",
          type: "success"
        });
      }
      handleCloseDialog();
      loadData(); // Recharger les données
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

  const handleDelete = async (bookId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce livre ?")) {
      try {
        await libraryService.deleteAdminBook(bookId);
        setAlert({
          show: true,
          message: "Livre supprimé avec succès",
          type: "success"
        });
        loadData(); // Recharger les données
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrer les livres
  const filteredBooks = Array.isArray(books) ? books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !selectedSubject || book.subject?._id === selectedSubject || book.subject?.id === selectedSubject;
    return matchesSearch && matchesSubject;
  }) : [];

  const paginatedBooks = filteredBooks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
            📚 Gestion des Livres
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
          Ajouter un livre
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

      {/* Filtres */}
      <Card sx={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Rechercher un livre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: "rgba(255,255,255,0.6)", mr: 1 }} />
                }}
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: "rgba(255,255,255,0.6)" }}>Matière</InputLabel>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  sx={{
                    color: "#fff",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.23)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
                  }}
                >
                  <MenuItem value="">Toutes les matières</MenuItem>
                  {subjects.map((subject) => (
                    <MenuItem key={subject._id} value={subject._id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''} trouvé{filteredBooks.length > 1 ? 's' : ''}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tableau des livres */}
      <Card sx={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
        <TableContainer component={Paper} sx={{ background: "transparent" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Couverture</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Titre</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Auteur</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Matière</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Pages</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Statut</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBooks.map((book) => (
                <TableRow key={book._id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" } }}>
                  <TableCell>
                    <Box
                      component="img"
                      src={book.coverImageUrl}
                      alt={book.title}
                      sx={{
                        width: 50,
                        height: 70,
                        objectFit: "cover",
                        borderRadius: 1,
                        border: "1px solid rgba(255,255,255,0.2)"
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    <Typography variant="body2" fontWeight={600}>
                      {book.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                      {book.year}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{book.author}</TableCell>
                  <TableCell>
                    <Chip
                      label={book.subject?.name}
                      size="small"
                      sx={{
                        backgroundColor: `${book.subject?.color}20`,
                        color: book.subject?.color,
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{book.pages}</TableCell>
                  <TableCell>
                    <Chip
                      label={book.isAvailable ? "Disponible" : "Indisponible"}
                      size="small"
                      sx={{
                        backgroundColor: book.isAvailable ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
                        color: book.isAvailable ? "#34d399" : "#f87171"
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => window.open(book.coverImageUrl, '_blank')}
                        sx={{ color: "#60a5fa" }}
                        title="Voir la couverture"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(book)}
                        sx={{ color: "#fbbf24" }}
                        title="Modifier"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(book._id)}
                        sx={{ color: "#f87171" }}
                        title="Supprimer"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredBooks.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{
            color: "#fff",
            "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
              color: "#fff"
            }
          }}
        />
      </Card>

      {/* Dialog d'ajout/modification */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
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
          {editingBook ? "Modifier le livre" : "Ajouter un livre"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Titre du livre"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Auteur"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
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
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: "rgba(255,255,255,0.6)" }}>Matière</InputLabel>
                  <Select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    sx={{
                      color: "#fff",
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.23)" },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.5)" },
                    }}
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
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
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Année"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
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
                  label="URL de la couverture"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
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
                  label="URL du sommaire"
                  value={formData.summaryUrl}
                  onChange={(e) => setFormData({ ...formData, summaryUrl: e.target.value })}
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
              {loading ? "Sauvegarde..." : editingBook ? "Modifier" : "Créer"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LibraryBooksManagePage;
