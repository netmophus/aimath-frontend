// import React, { useState } from "react";
// import {
//   Box,
//   TextField,
//   Typography,
//   Paper,
//   Button,
//   Alert,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
// } from "@mui/material";
// import API from "../../api";
// import PageLayout from "../../components/PageLayout";
// import ExamList from "../../components/ExamList"; // tout en haut


// const ExamCreatePage = () => {
//   const [form, setForm] = useState({
//     title: "",
//     level: "",
//     description: "",
//     badge: "gratuit",
//   });


//   const [cover, setCover] = useState(null);
//   const [message, setMessage] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };



// const handleFileChange = (e, type) => {
//   if (type === "cover") setCover(e.target.files[0]);
// };




// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setMessage("");

//   if (!form.subjectUrl) {
//     setMessage("Le lien du sujet est requis.");
//     return;
//   }

//   try {
//     const formData = new FormData();
//     // Ajout des champs texte (y compris les liens Drive)
//     for (let key in form) {
//       formData.append(key, form[key]);
//     }

//     // Ajout du fichier cover uniquement
//     if (cover) {
//       formData.append("cover", cover);
//     }

//     await API.post("/exams", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     setMessage("✅ Sujet ajouté avec succès !");
//     setForm({
//       title: "",
//       level: "",
//       description: "",
//       badge: "gratuit",
//       subjectUrl: "",
//       correctionUrl: "",
//     });
//     setCover(null);
//   } catch (err) {
//     setMessage(err.response?.data?.message || "❌ Erreur lors de l'ajout.");
//   }
// };


//   return (
//       <PageLayout>
//     <Box maxWidth="600px" mx="auto" mt={10} mb={5}>
//       <Paper elevation={3} sx={{ p: 4 }}>
//         <Typography variant="h5" fontWeight="bold" gutterBottom>
//           📝 Ajouter un sujet d’examen
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           <TextField
//             label="Titre"
//             name="title"
//             fullWidth
//             value={form.title}
//             onChange={handleChange}
//             margin="normal"
//             required
//           />

//           <TextField
//             label="Description"
//             name="description"
//             fullWidth
//             multiline
//             rows={3}
//             value={form.description}
//             onChange={handleChange}
//             margin="normal"
//             required
//           />

//           <FormControl fullWidth margin="normal" required>
//             <InputLabel>Niveau</InputLabel>
//             <Select name="level" value={form.level} onChange={handleChange} label="Niveau">
//               {["3eme", "terminale"].map((niveau) => (
//                 <MenuItem key={niveau} value={niveau}>
//                   {niveau.toUpperCase()}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl fullWidth margin="normal" required>
//             <InputLabel>Accès</InputLabel>
//             <Select name="badge" value={form.badge} onChange={handleChange} label="Accès">
//               <MenuItem value="gratuit">Gratuit</MenuItem>
//               <MenuItem value="prenuim">Prenuim</MenuItem>
//             </Select>
//           </FormControl>

//           <Box mt={2}>
//             <Button variant="outlined" component="label">
//               🖼 Charger une image (facultatif)
//               <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, "cover")} />
//             </Button>
//             {cover && <Typography variant="caption" ml={2}>{cover.name}</Typography>}
//           </Box>

//         <TextField
//   label="Lien du sujet (Drive)"
//   name="subjectUrl"
//   fullWidth
//   value={form.subjectUrl || ""}
//   onChange={handleChange}
//   margin="normal"
//   required
// />

// <TextField
//   label="Lien de la correction (Drive, facultatif)"
//   name="correctionUrl"
//   fullWidth
//   value={form.correctionUrl || ""}
//   onChange={handleChange}
//   margin="normal"
// />



//           <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} type="submit">
//             Enregistrer le sujet
//           </Button>

//           {message && (
//             <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
//               {message}
//             </Alert>
//           )}
//         </form>
//       </Paper>
//     </Box>

//     <ExamList />

//      </PageLayout>
//   );
// };

// export default ExamCreatePage;

















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
import ExamList from "../../components/ExamList";

const ExamCreatePage = () => {
  const [form, setForm] = useState({
    title: "",
    level: "",
    description: "",
    badge: "gratuit",
    coverSupabaseUrl: "", // 🔗 Lien Supabase de la couverture
    subjectSupabaseUrl: "", // 🔗 Lien Supabase du sujet
    correctionSupabaseUrl: "", // 🔗 Lien Supabase de la correction
  });

  const [cover, setCover] = useState(null);
  const [subjectFile, setSubjectFile] = useState(null);
  const [correctionFile, setCorrectionFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "cover") setCover(file);
    if (type === "subject") setSubjectFile(file);
    if (type === "correction") setCorrectionFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ✅ Vérification : soit upload, soit lien Supabase pour le sujet
    const hasSubject = subjectFile || form.subjectSupabaseUrl;
    
    if (!hasSubject) {
      setMessage("Le fichier du sujet est requis (via upload ou lien Supabase).");
      return;
    }

    try {
      const formData = new FormData();

      // Champs texte
      for (let key in form) {
        if (key !== 'coverSupabaseUrl' && key !== 'subjectSupabaseUrl' && key !== 'correctionSupabaseUrl') {
          formData.append(key, form[key]);
        }
      }

      // ✅ Gestion de la couverture : soit upload, soit lien Supabase
      if (cover) {
        formData.append("cover", cover); // Upload Cloudinary
      } else if (form.coverSupabaseUrl) {
        formData.append("coverSupabaseUrl", form.coverSupabaseUrl); // Lien Supabase
      }

      // ✅ Gestion du sujet : soit upload, soit lien Supabase
      if (subjectFile) {
        formData.append("subject", subjectFile); // Upload Cloudinary
      } else if (form.subjectSupabaseUrl) {
        formData.append("subjectSupabaseUrl", form.subjectSupabaseUrl); // Lien Supabase
      }

      // ✅ Gestion de la correction : soit upload, soit lien Supabase
      if (correctionFile) {
        formData.append("correction", correctionFile); // Upload Cloudinary
      } else if (form.correctionSupabaseUrl) {
        formData.append("correctionSupabaseUrl", form.correctionSupabaseUrl); // Lien Supabase
      }

      await API.post("/exams", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ Sujet ajouté avec succès !");
      setForm({
        title: "",
        level: "",
        description: "",
        badge: "gratuit",
        coverSupabaseUrl: "",
        subjectSupabaseUrl: "",
        correctionSupabaseUrl: "",
      });
      setCover(null);
      setSubjectFile(null);
      setCorrectionFile(null);
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
              <Select
                name="level"
                value={form.level}
                onChange={handleChange}
                label="Niveau"
              >
                {["6eme", "5eme", "4eme", "3eme", "seconde", "premiere", "terminale"].map((niveau) => (
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

            {/* 📸 COUVERTURE */}
            <Box mt={2}>
              <Button variant="outlined" component="label">
                🖼 Charger une image (Cloudinary)
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "cover")}
                />
              </Button>
              {cover && (
                <Typography variant="caption" ml={2}>
                  {cover.name}
                </Typography>
              )}
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'center', my: 1 }}>OU</Typography>

            <TextField
              label="Lien Supabase de la couverture"
              name="coverSupabaseUrl"
              fullWidth
              value={form.coverSupabaseUrl}
              onChange={handleChange}
              margin="normal"
              placeholder="https://[PROJECT_REF].supabase.co/storage/v1/object/public/..."
            />

            {/* 📄 SUJET */}
            <Box mt={2}>
              <Button variant="outlined" component="label">
                📄 Charger le fichier sujet (Cloudinary)
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "subject")}
                />
              </Button>
              {subjectFile && (
                <Typography variant="caption" ml={2}>
                  {subjectFile.name}
                </Typography>
              )}
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'center', my: 1 }}>OU</Typography>

            <TextField
              label="Lien Supabase du fichier sujet"
              name="subjectSupabaseUrl"
              fullWidth
              value={form.subjectSupabaseUrl}
              onChange={handleChange}
              margin="normal"
              placeholder="https://[PROJECT_REF].supabase.co/storage/v1/object/public/..."
            />

            {/* 📘 CORRECTION */}
            <Box mt={2}>
              <Button variant="outlined" component="label">
                📘 Charger le fichier correction (Cloudinary)
                <input
                  type="file"
                  hidden
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, "correction")}
                />
              </Button>
              {correctionFile && (
                <Typography variant="caption" ml={2}>
                  {correctionFile.name}
                </Typography>
              )}
            </Box>

            <Typography variant="body2" sx={{ textAlign: 'center', my: 1 }}>OU</Typography>

            <TextField
              label="Lien Supabase du fichier correction"
              name="correctionSupabaseUrl"
              fullWidth
              value={form.correctionSupabaseUrl}
              onChange={handleChange}
              margin="normal"
              placeholder="https://[PROJECT_REF].supabase.co/storage/v1/object/public/..."
            />

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4 }}
              type="submit"
            >
              Enregistrer le sujet
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
      </Box>

      <ExamList />
    </PageLayout>
  );
};

export default ExamCreatePage;
