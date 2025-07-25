// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Paper,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   Alert,
// } from "@mui/material";
// import API from "../../api";
// import PageLayout from "../../components/PageLayout";
// import BookList from "../../components/BookList";


// const BookCreatePage = () => {
  
//   const [form, setForm] = useState({
//   title: "",
//   author: "",
//   description: "",
//   level: "",
//   badge: "gratuit",
//   coverImage: "", // ✅ nouveau
//   fileUrl: "",    // ✅ nouveau
// });



//   const [message, setMessage] = useState("");

// const handleChange = (e) => {
//   const { name, value } = e.target;

//   // 🔁 Conversion automatique pour coverImage (image)
//   if (name === "coverImage" && value.includes("drive.google.com/file/d/")) {
//     const match = value.match(/\/d\/([a-zA-Z0-9_-]+)\//);
//     if (match && match[1]) {
//       const directLink = `https://drive.google.com/uc?export=view&id=${match[1]}`;
//       setForm((prev) => ({ ...prev, [name]: directLink }));
//       return;
//     }
//   }

//   // 🔁 Conversion automatique pour fileUrl (PDF)
//   if (name === "fileUrl" && value.includes("drive.google.com/file/d/")) {
//     const match = value.match(/\/d\/([a-zA-Z0-9_-]+)\//);
//     if (match && match[1]) {
//       const directLink = `https://drive.google.com/uc?export=download&id=${match[1]}`;
//       setForm((prev) => ({ ...prev, [name]: directLink }));
//       return;
//     }
//   }

//   // 🔁 Comportement normal
//   setForm((prev) => ({ ...prev, [name]: value }));
// };


//   // const handleFileChange = (e, type) => {
//   //   if (type === "cover") setCover(e.target.files[0]);
//   //   else if (type === "pdf") setPdf(e.target.files[0]);
//   // };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setMessage("");

//   //   if (!cover || !pdf) {
//   //     setMessage("Veuillez fournir la couverture et le fichier PDF.");
//   //     return;
//   //   }

//   //   try {
//   //     const formData = new FormData();
//   //     for (let key in form) formData.append(key, form[key]);
//   //     formData.append("cover", cover);
//   //     formData.append("pdf", pdf);

//   //     await API.post("/admin/books", formData, {
//   //       headers: { "Content-Type": "multipart/form-data" },
//   //     });

//   //     setMessage("✅ Livre ajouté avec succès !");
//   //     setForm({ title: "", author: "", description: "", level: "", badge: "gratuit" });
//   //     setCover(null);
//   //     setPdf(null);
//   //   } catch (err) {
//   //     setMessage(err.response?.data?.message || "❌ Erreur lors de l'ajout.");
//   //   }
//   // };



// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setMessage("");

//   if (!form.coverImage || !form.fileUrl) {
//     setMessage("Veuillez fournir les liens de la couverture et du fichier PDF.");
//     return;
//   }

//   try {
//     await API.post("/admin/books", form);
//     setMessage("✅ Livre ajouté avec succès !");
//     setForm({
//       title: "",
//       author: "",
//       description: "",
//       level: "",
//       badge: "gratuit",
//       coverImage: "",
//       fileUrl: "",
//     });
//   } catch (err) {
//     setMessage(err.response?.data?.message || "❌ Erreur lors de l'ajout.");
//   }
// };





//   return (
//      <PageLayout>
//     <Box maxWidth="600px" mx="auto" mt={10} mb={5}>
//       <Paper elevation={3} sx={{ p: 4 }}>
//         <Typography variant="h5" fontWeight="bold" gutterBottom>
//           📘 Ajouter un nouveau livre
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
//             label="Auteur (facultatif)"
//             name="author"
//             fullWidth
//             value={form.author}
//             onChange={handleChange}
//             margin="normal"
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
//               {["6eme", "5eme", "4eme", "3eme", "seconde", "premiere", "terminale", "universite"].map((niveau) => (
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

     
// <TextField
//   label="Lien de la couverture (Google Drive)"
//   name="coverImage"
//   fullWidth
//   value={form.coverImage}
//   onChange={handleChange}
//   margin="normal"
//   required
// />

// <TextField
//   label="Lien du fichier PDF (Google Drive)"
//   name="fileUrl"
//   fullWidth
//   value={form.fileUrl}
//   onChange={handleChange}
//   margin="normal"
//   required
// />







//           <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} type="submit">
//             Enregistrer le livre
//           </Button>

//           {message && (
//             <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
//               {message}
//             </Alert>
//           )}
//         </form>


//       </Paper>

//           {/* 🔽 Liste des livres après le formulaire */}
//       <BookList />


//     </Box>
//     </PageLayout>
//   );
// };

// export default BookCreatePage;
















// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Paper,
//   MenuItem,
//   Select,
//   InputLabel,
//   FormControl,
//   Alert,
// } from "@mui/material";
// import API from "../../api";
// import PageLayout from "../../components/PageLayout";
// import BookList from "../../components/BookList";


// const BookCreatePage = () => {
  
//   const [form, setForm] = useState({
//   title: "",
//   author: "",
//   description: "",
//   level: "",
//   badge: "gratuit",
//   fileUrl: "",    // ✅ nouveau
// });



//   const [message, setMessage] = useState("");
//   const [cover, setCover] = useState(null);
// const [pdf, setPdf] = useState(null);




// const handleChange = (e) => {
//   const { name, value } = e.target;
//   setForm((prev) => ({ ...prev, [name]: value }));
// };




// const handleSubmit = async (e) => {
//   e.preventDefault();
//   setMessage("");

//   if (!cover || !pdf) {
//   setMessage("Veuillez charger une couverture et un fichier PDF.");
//   return;
// }


//   try {
//    const formData = new FormData();
//     formData.append("title", form.title);
//     formData.append("author", form.author);
//     formData.append("description", form.description);
//     formData.append("level", form.level);
//     formData.append("badge", form.badge);
//     formData.append("cover", cover); // image
//     formData.append("pdf", pdf);     // fichier PDF


//     await API.post("/admin/books", formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     setMessage("✅ Livre ajouté avec succès !");
//     setForm({
//       title: "",
//       author: "",
//       description: "",
//       level: "",
//       badge: "gratuit",
//     });
//     setCover(null);
//   } catch (err) {
//     setMessage(err.response?.data?.message || "❌ Erreur lors de l'ajout.");
//   }
// };





//   return (
//      <PageLayout>
//     <Box maxWidth="600px" mx="auto" mt={10} mb={5}>
//       <Paper elevation={3} sx={{ p: 4 }}>
//         <Typography variant="h5" fontWeight="bold" gutterBottom>
//           📘 Ajouter un nouveau livre
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
//             label="Auteur (facultatif)"
//             name="author"
//             fullWidth
//             value={form.author}
//             onChange={handleChange}
//             margin="normal"
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
//               {["6eme", "5eme", "4eme", "3eme", "seconde", "premiere", "terminale", "universite"].map((niveau) => (
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

     
// <Button variant="outlined" component="label" sx={{ mt: 2 }}>
//   📷 Charger la couverture
//   <input
//     type="file"
//     hidden
//     accept="image/*"
//     onChange={(e) => setCover(e.target.files[0])}
//   />
// </Button>
// {cover && (
//   <Typography variant="caption" ml={2}>
//     {cover.name}
//   </Typography>
// )}


// <TextField
//   label="Lien du fichier PDF (Google Drive)"
//   name="fileUrl"
//   fullWidth
//   value={form.fileUrl}
//   onChange={handleChange}
//   margin="normal"
//   required
// />







//           <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} type="submit">
//             Enregistrer le livre
//           </Button>

//           {message && (
//             <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
//               {message}
//             </Alert>
//           )}
//         </form>


//       </Paper>

//           {/* 🔽 Liste des livres après le formulaire */}
//       <BookList />


//     </Box>
//     </PageLayout>
//   );
// };

// export default BookCreatePage;









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
              sx={{ mt: 4 }}
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
