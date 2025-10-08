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

    if (!cover || !form.fileUrl || !form.fileUrl.startsWith("https://res.cloudinary.com")) {
      setMessage("❌ Veuillez charger une couverture et fournir un lien PDF valide (Cloudinary).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("description", form.description);
      formData.append("level", form.level);
      formData.append("badge", form.badge);
      formData.append("fileUrl", form.fileUrl); // ✅ lien PDF Cloudinary
      formData.append("cover", cover); // ✅ upload image

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
              📷 Charger la couverture
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

            <TextField
              label="Lien Cloudinary du fichier PDF"
              name="fileUrl"
              fullWidth
              value={form.fileUrl}
              onChange={handleChange}
              margin="normal"
              required
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
