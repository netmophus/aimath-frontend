// import React, { useEffect, useState } from "react";
// import {
//   Table, TableBody, TableCell, TableContainer,
//   TableHead, TableRow, Paper, Typography, Link, Stack
// } from "@mui/material";
// import API from "../api"; // ou ton chemin vers axios
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import DownloadIcon from "@mui/icons-material/Download";



// const BookList = () => {
//   const [books, setBooks] = useState([]);

//   useEffect(() => {
//     const fetchBooks = async () => {
//       try {
//         const res = await API.get("/admin/books");
//         setBooks(res.data);
//       } catch (err) {
//         console.error("❌ Erreur lors du chargement des livres :", err);
//       }
//     };
//     fetchBooks();
//   }, []);

//   return (
//     <TableContainer component={Paper} sx={{ mt: 2 }}>
//       <Typography variant="h6" sx={{ p: 2 }}>📚 Liste des Livres</Typography>
//       <Table>
//         <TableHead>
//           <TableRow>
//             <TableCell>Titre</TableCell>
//             <TableCell>Auteur</TableCell>
//             <TableCell>Niveau</TableCell>
//             <TableCell>Badge</TableCell>
//             <TableCell>Couverture</TableCell>
//             <TableCell>Fichier</TableCell>
//             <TableCell>Date</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {books.map((book) => (
//             <TableRow key={book._id}>
//               <TableCell>{book.title}</TableCell>
//               <TableCell>{book.author}</TableCell>
//               <TableCell>{book.level}</TableCell>
//               <TableCell>{book.badge}</TableCell>
//               <TableCell>
// <img
//   src={book.coverImage}
//   alt="Couverture"
//   style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4 }}
//   onError={(e) => {
//     e.target.onerror = null;
//     e.target.src = "https://via.placeholder.com/56x56?text=N/A"; // fallback en cas d'erreur
//   }}
// />




//               </TableCell>
             
// <TableCell>
//   <Stack direction="column" spacing={0.5}>
//     <Link
//       href={book.fileUrl}
//       target="_blank"
//       rel="noopener"
//       underline="hover"
//       color="primary"
//       display="flex"
//       alignItems="center"
//       gap={0.5}
//     >
//       <VisibilityIcon fontSize="small" />
//       Lire en ligne
//     </Link>
//     <Link
//       href={book.fileUrl}
//       target="_blank"
//       rel="noopener"
//       underline="hover"
//       color="secondary"
//       display="flex"
//       alignItems="center"
//       gap={0.5}
//     >
//       <DownloadIcon fontSize="small" />
//       Télécharger
//     </Link>
//   </Stack>
// </TableCell>

//               <TableCell>{new Date(book.createdAt).toLocaleDateString()}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// export default BookList;



import React, { useEffect, useState, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Link, Stack, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Snackbar, Alert, CircularProgress, IconButton
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageIcon from "@mui/icons-material/Image";
import API from "../api"; // ton instance axios (baseURL=/api)

const initialForm = {
  title: "",
  author: "",
  description: "",
  level: "",
  badge: "gratuit", // "gratuit" | "prenuim"
};

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  /* ---------- Edition ---------- */
  const handleOpenEdit = (book) => {
    setCurrentBook(book);
    setForm({
      title: book.title || "",
      author: book.author || "",
      description: book.description || "",
      level: book.level || "",
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

    // champs requis (selon ton contrôleur)
    if (!form.title || !form.author || !form.description || !form.level || !form.badge) {
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
      fd.append("badge", form.badge);
      if (coverFile) fd.append("cover", coverFile); // pris par uploadBook
      if (pdfFile) fd.append("pdf", pdfFile);       // pris par uploadBook

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
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>📚 Liste des Livres</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Titre</TableCell>
            <TableCell>Auteur</TableCell>
            <TableCell>Niveau</TableCell>
            <TableCell>Badge</TableCell>
            <TableCell>Couverture</TableCell>
            <TableCell>Fichier</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Box display="flex" gap={1} alignItems="center" justifyContent="center" py={3}>
                  <CircularProgress size={20} />
                  <Typography>Chargement…</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : books.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography color="text.secondary">Aucun livre pour le moment.</Typography>
              </TableCell>
            </TableRow>
          ) : (
            books.map((book) => (
              <TableRow key={book._id} hover>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.level}</TableCell>
                <TableCell>{book.badge}</TableCell>
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
                    >
                      <VisibilityIcon fontSize="small" />
                      Lire en ligne
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
                  <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
                    <Button
                      variant="contained"
                      size="small"
                      color="primary"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEdit(book)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => askDelete(book)}
                      disabled={deletingId === book._id}
                    >
                      {deletingId === book._id ? "Suppression…" : "Supprimer"}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
              <InputLabel id="badge-label">Badge</InputLabel>
              <Select labelId="badge-label" label="Badge" name="badge" value={form.badge} onChange={onFormChange}>
                <MenuItem value="gratuit">Gratuit</MenuItem>
                <MenuItem value="prenuim">Prenuim</MenuItem>
              </Select>
            </FormControl>

            {/* Fichiers optionnels */}
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
    </TableContainer>
  );
};

export default BookList;
