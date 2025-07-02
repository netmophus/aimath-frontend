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
  });

  const [cover, setCover] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    if (type === "cover") setCover(e.target.files[0]);
    else if (type === "pdf") setPdf(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!cover || !pdf) {
      setMessage("Veuillez fournir la couverture et le fichier PDF.");
      return;
    }

    try {
      const formData = new FormData();
      for (let key in form) formData.append(key, form[key]);
      formData.append("cover", cover);
      formData.append("pdf", pdf);

      await API.post("/admin/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Livre ajouté avec succès !");
      setForm({ title: "", author: "", description: "", level: "", badge: "gratuit" });
      setCover(null);
      setPdf(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Erreur lors de l'ajout.");
    }
  };

  return (
     <PageLayout>
    <Box maxWidth="600px" mx="auto" mt={10} mb={5}>
      <Paper elevation={3} sx={{ p: 4 }}>
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
            <Select name="level" value={form.level} onChange={handleChange} label="Niveau">
              {["6eme", "5eme", "4eme", "3eme", "seconde", "premiere", "terminale", "universite"].map((niveau) => (
                <MenuItem key={niveau} value={niveau}>
                  {niveau.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Accès</InputLabel>
            <Select name="badge" value={form.badge} onChange={handleChange} label="Accès">
              <MenuItem value="gratuit">Gratuit</MenuItem>
              <MenuItem value="prenuim">Prenuim</MenuItem>
            </Select>
          </FormControl>

          <Box mt={2}>
            <Button variant="outlined" component="label">
              📷 Charger la couverture
              <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, "cover")} />
            </Button>
            {cover && <Typography variant="caption" ml={2}>{cover.name}</Typography>}
          </Box>

          <Box mt={2}>
            <Button variant="outlined" component="label">
              📄 Charger le fichier PDF
              <input type="file" hidden accept="application/pdf" onChange={(e) => handleFileChange(e, "pdf")} />
            </Button>
            {pdf && <Typography variant="caption" ml={2}>{pdf.name}</Typography>}
          </Box>

          <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} type="submit">
            Enregistrer le livre
          </Button>

          {message && (
            <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
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
