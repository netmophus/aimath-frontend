import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Alert,
} from "@mui/material";
import API from "../../api";
import PageLayout from "../../components/PageLayout";
import BookList from "../../components/BookList";

const BookCreatePage = () => {
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    level: "",
    badge: "gratuit",
    fileUrl: "", // 🔗 Lien Cloudinary du PDF
    imageSupabaseUrl: "", // 🔗 Lien Supabase de la couverture
    bookSupabaseUrl: "", // 🔗 Lien Supabase du PDF
  });

  const [message, setMessage] = useState("");
  const [cover, setCover] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ✅ Vérification : soit upload, soit lien Supabase pour la couverture
    const hasCoverImage = cover || form.imageSupabaseUrl;
    // ✅ Vérification : soit upload, soit lien Supabase pour le PDF
    const hasBookFile = form.fileUrl || form.bookSupabaseUrl;

    if (!hasCoverImage || !hasBookFile) {
      setMessage("❌ Veuillez charger une couverture ET fournir un fichier PDF (via upload ou lien).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("description", form.description);
      formData.append("level", form.level);
      formData.append("badge", form.badge);

      // ✅ Gestion de l'image : soit upload, soit lien Supabase
      if (cover) {
        formData.append("cover", cover); // Upload Cloudinary
      } else if (form.imageSupabaseUrl) {
        formData.append("imageSupabaseUrl", form.imageSupabaseUrl); // Lien Supabase
      }

      // ✅ Gestion du fichier : soit upload, soit lien Supabase
      if (form.fileUrl) {
        formData.append("fileUrl", form.fileUrl); // Lien Cloudinary
      } else if (form.bookSupabaseUrl) {
        formData.append("bookSupabaseUrl", form.bookSupabaseUrl); // Lien Supabase
      }

      await API.post("/admin/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Livre ajouté avec succès !");
      setForm({
        title: "",
        author: "",
        description: "",
        level: "",
        badge: "gratuit",
        fileUrl: "",
        imageSupabaseUrl: "",
        bookSupabaseUrl: "",
      });
      setCover(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Erreur lors de l'ajout.");
    }
  };

  return (
    <PageLayout>
      <Box maxWidth="600px" mx="auto" mt={10} mb={5}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📘 Ajouter un nouveau livre
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Titre"
              name="title"
              fullWidth
              value={form.title}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              label="Auteur (facultatif)"
              name="author"
              fullWidth
              value={form.author}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              label="Description"
              name="description"
              fullWidth
              multiline
              rows={3}
              value={form.description}
              onChange={handleChange}
              margin="normal"
              required
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Niveau</InputLabel>
              <Select
                name="level"
                value={form.level}
                onChange={handleChange}
                label="Niveau"
              >
                {[
                  "6eme",
                  "5eme",
                  "4eme",
                  "3eme",
                  "seconde",
                  "premiere",
                  "terminale",
                  "universite",
                ].map((niveau) => (
                  <MenuItem key={niveau} value={niveau}>
                    {niveau.toUpperCase()}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Accès</InputLabel>
              <Select
                name="badge"
                value={form.badge}
                onChange={handleChange}
                label="Accès"
              >
                <MenuItem value="gratuit">Gratuit</MenuItem>
                <MenuItem value="prenuim">Prenuim</MenuItem>
              </Select>
            </FormControl>

            <Button variant="outlined" component="label" sx={{ mt: 2 }}>
              📷 Charger la couverture (Cloudinary)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setCover(e.target.files[0])}
              />
            </Button>
            {cover && (
              <Typography variant="caption" ml={2}>
                {cover.name}
              </Typography>
            )}

            <Typography variant="body2" sx={{ textAlign: 'center', my: 1 }}>OU</Typography>

            <TextField
              label="Lien Supabase de la couverture"
              name="imageSupabaseUrl"
              fullWidth
              value={form.imageSupabaseUrl}
              onChange={handleChange}
              margin="normal"
              placeholder="https://[PROJECT_REF].supabase.co/storage/v1/object/public/..."
            />

            <TextField
              label="Lien Cloudinary du fichier PDF"
              name="fileUrl"
              fullWidth
              value={form.fileUrl}
              onChange={handleChange}
              margin="normal"
            />

            <Typography variant="body2" sx={{ textAlign: 'center', my: 1 }}>OU</Typography>

            <TextField
              label="Lien Supabase du fichier PDF"
              name="bookSupabaseUrl"
              fullWidth
              value={form.bookSupabaseUrl}
              onChange={handleChange}
              margin="normal"
              placeholder="https://[PROJECT_REF].supabase.co/storage/v1/object/public/..."
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4  }}
              type="submit"
            >
              Enregistrer le livre
            </Button>

            {message && (
              <Alert
                severity={message.includes("✅") ? "success" : "error"}
                sx={{ mt: 2 }}
              >
                {message}
              </Alert>
            )}
          </form>
        </Paper>

        {/* 🔽 Liste des livres après le formulaire */}
        <BookList />
      </Box>
    </PageLayout>
  );
};

export default BookCreatePage;
