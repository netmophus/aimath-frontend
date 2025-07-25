import React, { useEffect, useState } from "react";
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
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import PageLayout from "../components/PageLayout";

const VideoEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    level: "",
    badge: "gratuit",
    videoUrl: "",
    videosSupplementaires: [],
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await API.get(`/videos/${id}`);
        setForm({
          title: res.data.title,
          description: res.data.description,
          level: res.data.level,
          badge: res.data.badge,
          videoUrl: res.data.videoUrl,
          videosSupplementaires: res.data.videosSupplementaires || [],
        });
      } catch (err) {
        setMessage("❌ Erreur lors du chargement de la vidéo.");
      }
    };
    fetchVideo();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSupplementaireChange = (index, e) => {
    const updated = [...form.videosSupplementaires];
    updated[index][e.target.name] = e.target.value;
    setForm({ ...form, videosSupplementaires: updated });
  };

  const addVideoSupplementaire = () => {
    setForm((prev) => ({
      ...prev,
      videosSupplementaires: [
        ...prev.videosSupplementaires,
        { title: "", videoUrl: "", thumbnail: "" },
      ],
    }));
  };

  const removeVideoSupplementaire = (index) => {
    const updated = [...form.videosSupplementaires];
    updated.splice(index, 1);
    setForm({ ...form, videosSupplementaires: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("level", form.level);
      formData.append("badge", form.badge);
      formData.append("videoUrl", form.videoUrl);
      formData.append("videosSupplementaires", JSON.stringify(form.videosSupplementaires));
      if (thumbnail) formData.append("thumbnail", thumbnail);

      await API.put(`/videos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Vidéo mise à jour avec succès !");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setMessage("❌ Erreur lors de la mise à jour.");
    }
  };

  return (
    <PageLayout>
      <Box maxWidth="600px" mx="auto" mt={10} mb={5}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            ✏️ Modifier la vidéo
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
                {["6eme", "5eme", "4eme", "3eme", "seconde", "premiere", "terminale", "universite"].map(
                  (niveau) => (
                    <MenuItem key={niveau} value={niveau}>
                      {niveau.toUpperCase()}
                    </MenuItem>
                  )
                )}
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

            {/* Vidéos supplémentaires */}
            <Box mt={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                📎 Vidéos Supplémentaires
              </Typography>

              {form.videosSupplementaires.map((video, index) => (
                <Box key={index} display="flex" flexDirection="column" mb={2}>
                  <TextField
                    label={`Titre vidéo #${index + 1}`}
                    name="title"
                    value={video.title}
                    onChange={(e) => handleSupplementaireChange(index, e)}
                    fullWidth
                    margin="dense"
                  />
                  <TextField
                    label="URL vidéo"
                    name="videoUrl"
                    value={video.videoUrl}
                    onChange={(e) => handleSupplementaireChange(index, e)}
                    fullWidth
                    margin="dense"
                    required
                  />
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 1, alignSelf: "flex-end", width: "fit-content" }}
                    onClick={() => removeVideoSupplementaire(index)}
                    disabled={form.videosSupplementaires.length === 1}
                  >
                    Supprimer
                  </Button>
                </Box>
              ))}

              <Button variant="text" onClick={addVideoSupplementaire}>
                ➕ Ajouter une autre vidéo supplémentaire
              </Button>
            </Box>

            <Box mt={2}>
              <Button variant="outlined" component="label">
                📸 Modifier la miniature (optionnel)
                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              {thumbnail && (
                <Typography variant="caption" ml={2}>
                  {thumbnail.name}
                </Typography>
              )}
            </Box>

            <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} type="submit">
              Mettre à jour la vidéo
            </Button>

            {message && (
              <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
                {message}
              </Alert>
            )}
          </form>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default VideoEditPage;
