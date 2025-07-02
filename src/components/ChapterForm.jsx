import React, { useState , useEffect} from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import { FormControl, InputLabel, Select} from "@mui/material";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import API from "../api";


const classesByLevel = {
  college: ["6ème", "5ème", "4ème", "3ème"],
  lycee: ["Seconde", "Première", "Terminale"],
};

const ChapterForm = () => {
const [form, setForm] = useState({
  number: "",
  title: "",
  description: "",
  level: "",
  classe: "",
  serie: "", // ✅ ajout ici
  subject: "",
  imageFile: null,
  videos: [{ title: "", description: "", url: "", image: null }],
  pdfs: [{ title: "", description: "", file: null }],
});


  const [message, setMessage] = useState("");


const [selectedLevel, setSelectedLevel] = useState("");
const [selectedClasse, setSelectedClasse] = useState("");


const [chapters, setChapters] = useState([]); // Pour stocker les chapitres récupérés



const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const [editingChapterId, setEditingChapterId] = useState(null);



  const handlePdfChange = (i, field, value) => {
  const pdfs = [...form.pdfs];
  pdfs[i][field] = value;
  setForm({ ...form, pdfs });
};

const handlePdfFileChange = (i, file) => {
  const pdfs = [...form.pdfs];
  pdfs[i].file = file;
  setForm({ ...form, pdfs });
};

const handleRemovePdf = (i) => {
  const pdfs = [...form.pdfs];
  pdfs.splice(i, 1);
  setForm({ ...form, pdfs });
};


const extractYoutubeId = (url) => {
  const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[1].length === 11) ? match[1] : null;
};


  
const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));

  if (name === "level") setSelectedLevel(value);
  if (name === "classe") setSelectedClasse(value);
};


  const handleVideoChange = (i, e) => {
    const videos = [...form.videos];
    videos[i][e.target.name] =
      e.target.name === "image" ? e.target.files[0] : e.target.value;
    setForm({ ...form, videos });
  };

 

  const handleAddVideo = () => {
    setForm({
      ...form,
      videos: [...form.videos, { title: "", description: "", url: "", image: null }],
    });
  };

  const handleRemoveVideo = (i) => {
    const updated = [...form.videos];
    updated.splice(i, 1);
    setForm({ ...form, videos: updated });
  };


const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("chapterNumber", form.number);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("level", form.level);
    formData.append("classe", form.classe);
    formData.append("serie", form.serie); // ✅ à ajouter

    if (form.imageFile) formData.append("imageFile", form.imageFile);

    // ✅ PDF : upload de fichiers + metadata
    form.pdfs.forEach((pdf) => {
      if (pdf.file) formData.append("pdfs", pdf.file);
    });
    formData.append("pdfsMetadata", JSON.stringify(form.pdfs.map(p => ({
      title: p.title,
      description: p.description
    }))));

    // ✅ Vidéos : juste des liens, pas d'images
    formData.append("videos", JSON.stringify(form.videos)); // c’est là que ton erreur se produit si tu oublies JSON.stringify

    await API.post("/admin/chapters", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMessage("✅ Chapitre ajouté avec succès");
  } catch (err) {
    setMessage("❌ Erreur : " + (err.response?.data?.message || "Erreur serveur"));
  }
};


const handleUpdateChapter = async () => {
  try {
    const formData = new FormData();
    formData.append("chapterNumber", form.number);
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("level", form.level);
    formData.append("classe", form.classe);
    formData.append("serie", form.serie); // ✅ à ajouter

    if (form.imageFile) formData.append("imageFile", form.imageFile);

    form.pdfs.forEach((pdf) => {
      if (pdf.file) formData.append("pdfs", pdf.file);
    });
    formData.append("pdfsMetadata", JSON.stringify(form.pdfs.map(p => ({
      title: p.title,
      description: p.description
    }))));

    formData.append("videos", JSON.stringify(form.videos));

    await API.put(`/admin/chapters/${editingChapterId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMessage("✅ Chapitre mis à jour avec succès");
    setEditingChapterId(null); // 🔄 Réinitialiser le mode édition
    setForm({
      number: "",
      title: "",
      description: "",
      level: "",
      classe: "",
      subject: "",
      imageFile: null,
      videos: [{ title: "", description: "", url: "", image: null }],
      pdfs: [{ title: "", description: "", file: null }],
    });
    fetchChapters(); // recharge la liste
  } catch (err) {
    setMessage("❌ Erreur : " + (err.response?.data?.message || "Erreur serveur"));
  }
};


const fetchChapters = async () => {
  try {
    const res = await API.get(`/admin/chapters/${selectedLevel}/${selectedClasse}`, {
  params: {
    page: currentPage,
    limit: 5,
    serie: form.serie, // 🔥 important
  },
});

    setChapters(res.data.chapters);
    setTotalPages(res.data.totalPages);
  } catch (err) {
    console.error("❌ Erreur lors du fetch des chapitres :", err);
  }
};





useEffect(() => {
  if (selectedLevel && selectedClasse) {
    fetchChapters();
  }
}, [selectedLevel, selectedClasse, currentPage, form.serie]); // ✅ ici


const handleEditChapter = (chapter) => {
  setForm({
    number: chapter.chapterNumber || "",
    title: chapter.title || "",
    description: chapter.description || "",
    level: chapter.level || "",
    classe: chapter.classe || "",
    subject: chapter.subject || "",
    imageFile: null,
    videos: chapter.videos || [],
    pdfs: chapter.pdfs.map(p => ({
      title: p.title,
      description: p.description,
      file: null
    }))
  });

  setSelectedLevel(chapter.level);
  setSelectedClasse(chapter.classe);
  setEditingChapterId(chapter._id); // 🟡 On stocke l'id à modifier
  window.scrollTo({ top: 0, behavior: "smooth" });
};


const handleDeleteChapter = async (id) => {
  if (!window.confirm("Voulez-vous vraiment supprimer ce chapitre ?")) return;

  try {
    await API.delete(`/admin/chapters/${id}`);
    setMessage("✅ Chapitre supprimé avec succès");
    fetchChapters(); // Recharge les chapitres après suppression
  } catch (err) {
    setMessage("❌ Erreur lors de la suppression");
  }
};




  return (
    <Paper elevation={4} sx={{ p: 4, borderRadius: 4, backgroundColor: "#fff" }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        📘 Création d'un Chapitre
      </Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="N° du chapitre" name="number" value={form.number} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Titre" name="title" value={form.title} onChange={handleChange} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Description" name="description" value={form.description} onChange={handleChange} />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }}>
        <Typography variant="subtitle1">🖼️ Image principale</Typography>
      </Divider>
      <input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })} />

      <Divider sx={{ my: 3 }}>
        <Typography variant="subtitle1">🎥 Vidéos</Typography>
      </Divider>
      {form.videos.map((v, i) => (
        <Paper key={i} sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9", borderLeft: "4px solid #1976d2" }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Titre" name="title" value={v.title} onChange={(e) => handleVideoChange(i, e)} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Description" name="description" value={v.description} onChange={(e) => handleVideoChange(i, e)} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField fullWidth label="URL YouTube" name="url" value={v.url} onChange={(e) => handleVideoChange(i, e)} />
            </Grid>
            <Grid item xs={12} sm={1}>
              <input type="file" name="image" accept="image/*" onChange={(e) => handleVideoChange(i, e)} />
              <IconButton color="error" onClick={() => handleRemoveVideo(i)}><DeleteIcon /></IconButton>
            </Grid>
          </Grid>
        </Paper>
      ))}
      <Button startIcon={<AddCircleIcon />} onClick={handleAddVideo} sx={{ mb: 2 }}>Ajouter une vidéo</Button>

     
    <Divider sx={{ my: 3 }}>
  <Typography variant="subtitle1">📄 PDFs</Typography>
</Divider>

{form.pdfs.map((pdf, i) => (
  <Paper key={i} sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9", borderLeft: "4px solid #9c27b0" }}>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Titre PDF"
          value={pdf.title}
          onChange={(e) => handlePdfChange(i, "title", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <TextField
          fullWidth
          label="Description PDF"
          value={pdf.description}
          onChange={(e) => handlePdfChange(i, "description", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        <Button component="label" fullWidth variant="outlined">
          Uploader PDF
          <input hidden type="file" accept="application/pdf" onChange={(e) => handlePdfFileChange(i, e.target.files[0])} />
        </Button>
        {pdf.file && <Typography variant="caption">{pdf.file.name}</Typography>}
      </Grid>
      <Grid item xs={12} sm={1} display="flex" alignItems="center" justifyContent="center">
  <IconButton color="error" onClick={() => handleRemovePdf(i)}>
    <DeleteIcon />
  </IconButton>
</Grid>

    </Grid>
  </Paper>
  
))}

<Button
  startIcon={<AddCircleIcon />}
  onClick={() =>
    setForm({
      ...form,
      pdfs: [...form.pdfs, { title: "", description: "", file: null }],
    })
  }
  sx={{ mb: 2 }}
>
  Ajouter un PDF
</Button>


<Grid container spacing={2} mt={4}>
  <Grid item xs={12} sm={6}>
    <FormControl fullWidth size="large">
      <InputLabel id="niveau-label">Niveau</InputLabel>
      <Select
        labelId="niveau-label"
        id="niveau-select"
        name="level"
        value={form.level}
        displayEmpty
        onChange={(e) => {
          handleChange(e);
          setForm((prev) => ({ ...prev, classe: "" }));
        }}
        renderValue={(selected) => {
          if (!selected) return <span style={{ color: "#888" }}>Sélectionnez un niveau</span>;
          return selected === "college" ? "Collège" : "Lycée";
        }}
      >
        <MenuItem value=""><em>Aucun</em></MenuItem>
        <MenuItem value="college">Collège</MenuItem>
        <MenuItem value="lycee">Lycée</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  <Grid item xs={12} sm={6}>
    {form.level && (
      <FormControl fullWidth size="large">
        <InputLabel id="classe-label">Classe</InputLabel>
        <Select
          labelId="classe-label"
          id="classe-select"
          name="classe"
          value={form.classe}
          displayEmpty
          onChange={handleChange}
          renderValue={(selected) => {
            if (!selected) return <span style={{ color: "#888" }}>Sélectionnez une classe</span>;
            return selected;
          }}
        >
          <MenuItem value=""><em>Aucun</em></MenuItem>
          {classesByLevel[form.level].map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </Select>
      </FormControl>
    )}


    {form.level === "lycee" && (
  <Grid item xs={12} sm={6}>
    <FormControl fullWidth>
      <InputLabel id="serie-label">Série</InputLabel>
      <Select
        labelId="serie-label"
        id="serie"
        name="serie"
        value={form.serie}
        onChange={handleChange}
        displayEmpty
        renderValue={(selected) =>
          selected ? selected : <span style={{ color: "#888" }}>Sélectionnez une série</span>
        }
      >
        <MenuItem value=""><em>Aucun</em></MenuItem>
        <MenuItem value="A">A</MenuItem>
        <MenuItem value="C">C</MenuItem>
        <MenuItem value="D">D</MenuItem>
        <MenuItem value="E">E</MenuItem>
        <MenuItem value="F">F</MenuItem>
        <MenuItem value="G">G</MenuItem>
      </Select>
    </FormControl>
  </Grid>
)}

  </Grid>
</Grid>




   <Button
  variant="contained"
  size="large"
  sx={{ mt: 4 }}
  onClick={editingChapterId ? handleUpdateChapter : handleSubmit}
>
  {editingChapterId ? "✅ Mettre à jour le chapitre" : "✅ Enregistrer le chapitre"}
</Button>





{chapters.map((ch) => (
  <Paper key={ch._id} sx={{ p: 2, mb: 2 }}>
    <Typography variant="h6">{ch.title}</Typography>
    <Typography>{ch.description}</Typography>

    {ch.videos.map((v, i) => (
      <Box key={i} mt={1}>
        <Typography fontWeight="bold">{v.title}</Typography>
        <Typography>{v.description}</Typography>
        {v.url.includes("youtube.com") || v.url.includes("youtu.be") ? (
          <Box sx={{ mt: 1 }}>
            <iframe
              width="50%"
              height="315"
              src={`https://www.youtube.com/embed/${extractYoutubeId(v.url)}`}
              title="Vidéo YouTube"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </Box>
        ) : (
          <a href={v.url} target="_blank" rel="noopener noreferrer">Voir la vidéo</a>
        )}
      </Box>
    ))}

    {ch.pdfs.map((p, i) => (
      <Box key={i} mt={1}>
        <Typography fontWeight="bold">{p.title}</Typography>
        <Typography>{p.description}</Typography>
        <a href={p.url} target="_blank" rel="noopener noreferrer">Télécharger le PDF</a>
      </Box>
    ))}

    {/* 👉 Boutons Modifier et Supprimer */}
    <Box mt={2} display="flex" gap={2}>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => handleEditChapter(ch)}
      >
        ✏️ Modifier
      </Button>
      <Button
        variant="outlined"
        color="error"
        onClick={() => handleDeleteChapter(ch._id)}
      >
        🗑️ Supprimer
      </Button>
    </Box>
  </Paper>
))}
   

      {message && <Alert sx={{ mt: 2 }} severity={message.startsWith("✅") ? "success" : "error"}>{message}</Alert>}

      <Box display="flex" justifyContent="center" mt={3}>
  <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Précédent</Button>
  <Typography mx={2}>Page {currentPage} sur {totalPages}</Typography>
  <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Suivant</Button>
</Box>

    </Paper>
  );
};

export default ChapterForm;
