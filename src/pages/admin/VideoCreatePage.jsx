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
import VideoList from "../../components/VideoList";

const VideoCreatePage = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "",
    badge: "gratuit",
    videoUrl: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const formData = new FormData();
      for (let key in form) formData.append(key, form[key]);
      if (thumbnail) formData.append("thumbnail", thumbnail);

      await API.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Vidéo ajoutée avec succès !");
      setForm({
        title: "",
        description: "",
        level: "",
        badge: "gratuit",
        videoUrl: "",
      });
      setThumbnail(null);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Erreur lors de l'ajout.");
    }
  };

  return (
    <PageLayout>
    <Box maxWidth="600px" mx="auto" mt={10} mb={5}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          🎬 Ajouter une nouvelle vidéo
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

          <TextField
            label="Lien de la vidéo"
            name="videoUrl"
            fullWidth
            value={form.videoUrl}
            onChange={handleChange}
            margin="normal"
            required
            placeholder="https://www.youtube.com/..."
          />

          <Box mt={2}>
            <Button variant="outlined" component="label">
              📸 Charger une miniature (optionnel)
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {thumbnail && (
              <Typography variant="caption" ml={2}>
                {thumbnail.name}
              </Typography>
            )}
          </Box>

          <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} type="submit">
            Enregistrer la vidéo
          </Button>

          {message && (
            <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </form>
      </Paper>
      <VideoList />
    </Box>

    </PageLayout>
    
  );
};

export default VideoCreatePage;
