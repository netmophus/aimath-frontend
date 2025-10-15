




import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import API from "../api";

const niveaux = ["college", "lycee"];

const BookForm = () => {


  const [message, setMessage] = useState("");
  const [books, setBooks] = useState([]);


const [editingBookId, setEditingBookId] = useState(null);






const [form, setForm] = useState({
  title: "",
  description: "",
  imageFile: null,
  bookFile: null,
  imageSupabaseUrl: "",        // ✅ Lien Supabase pour la couverture
  bookSupabaseUrl: "",         // ✅ Lien Supabase pour le PDF
  existingImageName: "",
  level: "",
  classe: "",
  serie: "",
});


const series = ["A", "C", "D", "E", "F", "G"];




  const classesByLevel = {
    college: ["6ème", "5ème", "4ème", "3ème"],
    lycee: ["Seconde", "Première", "Terminale"],
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };






const fetchBooks = async () => {
  try {
    const { level, classe } = form;

    if (!level || !classe) return;

   const res = await API.get(`/admin/books/${level}/${classe}`, {
  params: {
    serie: form.serie, // 🔥 ajout du filtre
  },
});

    console.log("📚 Résultat API par classe :", res.data);
    setBooks(res.data);
  } catch (err) {
    console.error("❌ Erreur lors de fetchBooks :", err);
  }
};


useEffect(() => {
  if (form.level && form.classe) {
    fetchBooks();
  }
}, [form.level, form.classe, form.serie]); // ✅ ajout de form.serie



// useEffect [] juste pour initialiser si besoin
useEffect(() => {
  const savedLevel = localStorage.getItem("level");
  const savedClasse = localStorage.getItem("classe");

  if (savedLevel && savedClasse) {
    setForm((prev) => ({
      ...prev,
      level: savedLevel,
      classe: savedClasse,
    }));
  }
}, []);








  // const handleSubmit = async () => {
  //   try {
  //     const formData = new FormData();
  //     formData.append("title", form.title);
  //     formData.append("description", form.description);
  //     formData.append("level", form.level);
  //     formData.append("classe", form.classe);
  //     formData.append("serie", form.serie); // ✅ ajouter

  //     if (form.imageFile) formData.append("image", form.imageFile);

  //     await API.post("/admin/books", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     setMessage("✅ Livre ajouté avec succès !");
  //     setForm({
  //       title: "",
  //       description: "",
  //       imageFile: null,
  //       level: form.level,
  //       classe: form.classe,
  //     });
  //     fetchBooks();
  //   } catch (err) {
  //     setMessage(
  //       "❌ Erreur : " + (err.response?.data?.message || "Erreur serveur")
  //     );
  //   }
  // };




const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("level", form.level);
    formData.append("classe", form.classe);
    formData.append("serie", form.serie);

    // ✅ Gestion des images : soit upload, soit lien Supabase
    if (form.imageFile) {
      formData.append("cover", form.imageFile);
    } else if (form.imageSupabaseUrl) {
      formData.append("imageSupabaseUrl", form.imageSupabaseUrl);
    }

    // ✅ Gestion des fichiers : soit upload, soit lien Supabase
    if (form.bookFile) {
      formData.append("pdf", form.bookFile);
    } else if (form.bookSupabaseUrl) {
      formData.append("bookSupabaseUrl", form.bookSupabaseUrl);
    }

    await API.post("/admin/books", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMessage("✅ Livre ajouté avec succès !");
    setForm({
      title: "",
      description: "",
      imageFile: null,
      bookFile: null,
      imageSupabaseUrl: "",
      bookSupabaseUrl: "",
      level: form.level,
      classe: form.classe,
      serie: form.serie,
    });
    fetchBooks();
  } catch (err) {
    setMessage(
      "❌ Erreur : " + (err.response?.data?.message || "Erreur serveur")
    );
  }
};






// const handleEditBook = (book) => {
//   const lastPart = book.imageUrl ? book.imageUrl.split("/").pop() : "";
//   setForm({
//   title: book.title,
//   description: book.description,
//   imageFile: null,
//   existingImageName: lastPart,
//   level: book.level || "",
//   classe: book.classe || "",
//   serie: book.serie || "", // ✅
// });

//   setEditingBookId(book._id);
//   setMessage("✏️ Modification en cours");
//   window.scrollTo({ top: 0, behavior: "smooth" });
// };

const handleEditBook = (book) => {
  const lastPart = book.imageUrl ? book.imageUrl.split("/").pop() : "";
  setForm({
    title: book.title,
    description: book.description,
    imageFile: null,
    existingImageName: lastPart,
    bookFile: null,
    imageSupabaseUrl: "",
    bookSupabaseUrl: "",
    level: book.level || "",
    classe: book.classe || "",
    serie: book.serie || "",
  });

  setEditingBookId(book._id);
  setMessage("✏️ Modification en cours");
  window.scrollTo({ top: 0, behavior: "smooth" });
};



// const handleUpdateBook = async () => {
//   try {
//     const formData = new FormData();
//     formData.append("title", form.title);
//     formData.append("description", form.description);
//     formData.append("level", form.level);
//     formData.append("classe", form.classe);
//     formData.append("serie", form.serie); // ✅ ajouter

//     if (form.imageFile) formData.append("image", form.imageFile);

//     await API.put(`/admin/books/${editingBookId}`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     setMessage("✅ Livre mis à jour avec succès !");
//     setEditingBookId(null);
//     setForm({
//       title: "",
//       description: "",
//       imageFile: null,
//       level: form.level,
//       classe: form.classe,
//     });
//     fetchBooks();
//   } catch (err) {
//     setMessage("❌ Erreur : " + (err.response?.data?.message || "Erreur serveur"));
//   }
// };

const handleUpdateBook = async () => {
  try {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("level", form.level);
    formData.append("classe", form.classe);
    formData.append("serie", form.serie);

    // ✅ Gestion des images : soit upload, soit lien Supabase
    if (form.imageFile) {
      formData.append("cover", form.imageFile);
    } else if (form.imageSupabaseUrl) {
      formData.append("imageSupabaseUrl", form.imageSupabaseUrl);
    }

    // ✅ Gestion des fichiers : soit upload, soit lien Supabase
    if (form.bookFile) {
      formData.append("pdf", form.bookFile);
    } else if (form.bookSupabaseUrl) {
      formData.append("bookSupabaseUrl", form.bookSupabaseUrl);
    }

    await API.put(`/admin/books/${editingBookId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setMessage("✅ Livre mis à jour avec succès !");
    setEditingBookId(null);
    setForm({
      title: "",
      description: "",
      imageFile: null,
      bookFile: null,
      imageSupabaseUrl: "",
      bookSupabaseUrl: "",
      level: form.level,
      classe: form.classe,
      serie: form.serie,
    });
    fetchBooks();
  } catch (err) {
    setMessage("❌ Erreur : " + (err.response?.data?.message || "Erreur serveur"));
  }
};


const handleDeleteBook = async (id) => {
  if (!window.confirm("Voulez-vous supprimer ce livre ?")) return;
  try {
    await API.delete(`/admin/books/${id}`);
    setMessage("✅ Livre supprimé");
    fetchBooks();
  } catch (err) {
    setMessage("❌ Erreur lors de la suppression");
  }
};


  return (
    <Box>
      <Typography variant="h6" mb={2}>
        📚 Ajouter un livre
      </Typography>

      <TextField
        fullWidth
        label="Titre"
        name="title"
        value={form.title}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        sx={{ mb: 2 }}
      />

      <Button component="label" variant="outlined" fullWidth sx={{ mb: 2 }}>
        Uploader une image (Cloudinary)
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            setForm({ ...form, imageFile: e.target.files[0] })
          }
        />
      </Button>

      <Typography variant="body2" sx={{ textAlign: 'center', my: 1 }}>OU</Typography>

      <TextField
        fullWidth
        label="Lien Supabase de la couverture"
        name="imageSupabaseUrl"
        value={form.imageSupabaseUrl}
        onChange={handleChange}
        placeholder="https://[PROJECT_REF].supabase.co/storage/v1/object/public/..."
        sx={{ mb: 2 }}
      />

     {form.imageFile ? (
  <Box
    mt={1}
    p={1}
    border="1px dashed #ccc"
    borderRadius={2}
    display="flex"
    alignItems="center"
    gap={2}
  >
    <img
      src={URL.createObjectURL(form.imageFile)}
      alt="aperçu"
      style={{
        width: 60,
        height: 60,
        objectFit: "cover",
        borderRadius: 8,
      }}
    />
    <Typography variant="body2">{form.imageFile.name}</Typography>
  </Box>




) : form.existingImageName ? (
  <Box
    mt={1}
    p={1}
    border="1px dashed #ccc"
    borderRadius={2}
    display="flex"
    alignItems="center"
    gap={2}
  >
   <Box
  mt={1}
  p={1}
  border="1px dashed #ccc"
  borderRadius={2}
  display="flex"
  alignItems="center"
  gap={2}
>
  <img
    src={`http://localhost:5000/uploads/books/${form.existingImageName}`}
    alt="aperçu"
    style={{
      width: 60,
      height: 60,
      objectFit: "cover",
      borderRadius: 8,
    }}
  />
  <Typography variant="body2" color="text.secondary">
    📎 Image actuelle : <strong>{form.existingImageName}</strong>
  </Typography>
</Box>

  </Box>
) : null}


{/* 📄 Upload du fichier du livre (PDF) */}
<Button component="label" variant="outlined" fullWidth sx={{ mb: 2 }}>
  Uploader le fichier du livre (PDF - Cloudinary)
  <input
    type="file"
    accept=".pdf"
    hidden
    onChange={(e) =>
      setForm({ ...form, bookFile: e.target.files[0] })
    }
  />
</Button>

{form.bookFile && (
  <Box
    mt={1}
    p={1}
    border="1px dashed #ccc"
    borderRadius={2}
    display="flex"
    alignItems="center"
    gap={2}
  >
    <Typography variant="body2">📄 {form.bookFile.name}</Typography>
  </Box>
)}

<Typography variant="body2" sx={{ textAlign: 'center', my: 1 }}>OU</Typography>

<TextField
  fullWidth
  label="Lien Supabase du fichier PDF"
  name="bookSupabaseUrl"
  value={form.bookSupabaseUrl}
  onChange={handleChange}
  placeholder="https://[PROJECT_REF].supabase.co/storage/v1/object/public/..."
  sx={{ mb: 2 }}
/>



     
     <TextField
  select
  fullWidth
  label="Niveau"
  name="level"
  value={form.level}
  onChange={(e) => {
    handleChange(e);
    setForm((prev) => ({ ...prev, classe: "" }));
  }}
  sx={{ mb: 2 }}
>
  <MenuItem value="">-- Choisir un niveau --</MenuItem>
  {niveaux.map((n) => (
    <MenuItem key={n} value={n}>
      {n === "college" ? "Collège" : "Lycée"}
    </MenuItem>
  ))}
</TextField>


    {form.level && (
  <TextField
    select
    fullWidth
    label="Classe"
    name="classe"
    value={form.classe}
    onChange={handleChange}
    sx={{ mb: 2 }}
  >
    <MenuItem value="">-- Choisir une classe --</MenuItem>
    {classesByLevel[form.level].map((c) => (
      <MenuItem key={c} value={c}>{c}</MenuItem>
    ))}
  </TextField>
)}


{form.level === "lycee" && (
  <TextField
    select
    fullWidth
    label="Série"
    name="serie"
    value={form.serie}
    onChange={handleChange}
    sx={{ mb: 2 }}
  >
    <MenuItem value="">-- Choisir une série --</MenuItem>
    {series.map((s) => (
      <MenuItem key={s} value={s}>
        Série {s}
      </MenuItem>
    ))}
  </TextField>
)}



      <Button
      variant="contained"
      onClick={editingBookId ? handleUpdateBook : handleSubmit}
    >
      {editingBookId ? "✅ Mettre à jour" : "Ajouter"}
    </Button>


      {message && (
        <Alert
          severity={message.startsWith("✅") ? "success" : "error"}
          sx={{ mt: 2 }}
        >
          {message}
        </Alert>
      )}

      {books.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom>
            📖 Livres ajoutés
          </Typography>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              mt: 2,
            }}
          >
           <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8 }}>Titre</th>
            <th style={{ textAlign: "left", padding: 8 }}>Description</th>
            <th style={{ textAlign: "left", padding: 8 }}>Image</th>
            <th style={{ textAlign: "left", padding: 8 }}>Actions</th> {/* ✅ Nouvelle colonne */}
          </tr>
        </thead>

            <tbody>
              {books.map((book) => (
              
<tr key={book._id}>
  <td style={{ padding: 8 }}>{book.title}</td>
  <td style={{ padding: 8 }}>{book.description}</td>
  <td style={{ padding: 8 }}>
    {book.imageUrl ? (
      <img
        src={`http://localhost:5000/${book.imageUrl}`}
        alt={book.title}
        style={{
          width: 80,
          height: 80,
          objectFit: "cover",
          borderRadius: 6,
        }}
      />
    ) : (
      "Pas d'image"
    )}
  </td>
  <td style={{ padding: 8 }}>
    <Button size="small" onClick={() => handleEditBook(book)}>✏️</Button>
    <Button size="small" color="error" onClick={() => handleDeleteBook(book._id)}>🗑️</Button>
  </td>
</tr>



              ))}
            </tbody>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BookForm;
