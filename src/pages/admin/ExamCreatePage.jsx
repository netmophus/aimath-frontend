import React, { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import API from "../../api";
import PageLayout from "../../components/PageLayout";
import ExamList from "../../components/ExamList"; // tout en haut


const ExamCreatePage = () => {
  const [form, setForm] = useState({
    title: "",
    level: "",
    description: "",
    badge: "gratuit",
  });

  const [subject, setSubject] = useState(null);
const [correction, setCorrection] = useState(null);
// ...supprimer const [pdf, setPdf] = useState(null);

  const [cover, setCover] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleFileChange = (e, type) => {
  if (type === "subject") setSubject(e.target.files[0]);
  if (type === "correction") setCorrection(e.target.files[0]);
  if (type === "cover") setCover(e.target.files[0]);
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  if (!subject || !correction) {
    setMessage("Le sujet et la correction sont requis.");
    return;
  }

  try {
    const formData = new FormData();
    for (let key in form) formData.append(key, form[key]);
    formData.append("subject", subject);
    formData.append("correction", correction);
    if (cover) formData.append("cover", cover);

    await API.post("/exams", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMessage("✅ Sujet ajouté avec succès !");
    setForm({ title: "", level: "", description: "", badge: "gratuit" });
    setSubject(null);
    setCorrection(null);
    setCover(null);
  } catch (err) {
    setMessage(err.response?.data?.message || "❌ Erreur lors de l'ajout.");
  }
};


  return (
      <PageLayout>
    <Box maxWidth="600px" mx="auto" mt={10} mb={5}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          📝 Ajouter un sujet d’examen
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
              {["3eme", "seconde", "premiere", "terminale"].map((niveau) => (
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
              🖼 Charger une image (facultatif)
              <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, "cover")} />
            </Button>
            {cover && <Typography variant="caption" ml={2}>{cover.name}</Typography>}
          </Box>

          <Box mt={2}>
  <Button variant="outlined" component="label">
    📄 Charger le sujet (PDF)
    <input type="file" hidden accept="application/pdf" onChange={(e) => handleFileChange(e, "subject")} />
  </Button>
  {subject && <Typography variant="caption" ml={2}>{subject.name}</Typography>}
</Box>

<Box mt={2}>
  <Button variant="outlined" component="label">
    📑 Charger la correction (PDF)
    <input type="file" hidden accept="application/pdf" onChange={(e) => handleFileChange(e, "correction")} />
  </Button>
  {correction && <Typography variant="caption" ml={2}>{correction.name}</Typography>}
</Box>


          <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} type="submit">
            Enregistrer le sujet
          </Button>

          {message && (
            <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
              {message}
            </Alert>
          )}
        </form>
      </Paper>
    </Box>

    <ExamList />

     </PageLayout>
  );
};

export default ExamCreatePage;
