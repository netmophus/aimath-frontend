


// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   TextField,
//   CircularProgress,
//   Alert,
// } from "@mui/material";
// import PageLayout from "../components/PageLayout";
// import API from "../api";
// import QuestionBox from "../components/QuestionBox";
// import { marked } from "marked";
// // import Latex from "react-latex-next";

// const AideDetailleePage = () => {
//   const [image, setImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [response, setResponse] = useState("");
//   const [message, setMessage] = useState("");
//   const [loading, setLoading] = useState(false);
// //   const [voiceInput, setVoiceInput] = useState("");

//   // ✅ Lorsqu’un fichier est sélectionné
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setImage(file);
//     setResponse("");
//     setMessage("");

//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     } else {
//       setImagePreview(null);
//     }
//   };

//   // ✅ Envoi de l’image à l’IA
//   const handleUpload = async () => {
//     if (!image) {
//       setMessage("Veuillez sélectionner une image.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("image", image);

//     setLoading(true);
//     setMessage("");
//     setResponse("");

//     try {
//       const res = await API.post("/ia/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setResponse(res.data.response);
//     } catch (err) {
//       setMessage(err.response?.data?.message || "Erreur lors de l’analyse.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <PageLayout>
//       <Typography variant="h5" gutterBottom>
//         📷 Scanner un exercice de maths
//       </Typography>

//       {/* ✅ Zone de saisie manuelle */}
//       <QuestionBox />

//       {/* ✅ Upload d’image */}
//       <Box mt={4}>
//         <input type="file" accept="image/*" onChange={handleImageChange} />
//         <Button
//           variant="contained"
//           sx={{ mt: 2 }}
//           onClick={handleUpload}
//           disabled={loading}
//         >
//           Envoyer l'image
//         </Button>
//       </Box>

//       {/* ✅ Aperçu de l’image */}
//       {imagePreview && (
//         <Box mt={2}>
//           <Typography variant="subtitle2" color="text.secondary">
//             Aperçu de l’image sélectionnée :
//           </Typography>
//           <Box
//             component="img"
//             src={imagePreview}
//             alt="Exercice scanné"
//             sx={{ maxWidth: "100%", maxHeight: 400, mt: 1, borderRadius: 2 }}
//           />
//         </Box>
//       )}

//       {/* ✅ Message d’erreur ou chargement */}
//       {loading && (
//         <Box mt={3}>
//           <CircularProgress />
//           <Typography mt={1}>Analyse en cours...</Typography>
//         </Box>
//       )}

//       {message && (
//         <Alert severity="error" sx={{ mt: 3 }}>
//           {message}
//         </Alert>
//       )}

//       {/* ✅ Affichage de la réponse IA */}
//       {/* {response && (
//         <Box mt={4}>
//           <Typography variant="h6">📚 Explication de l'IA</Typography>
//           <Typography mt={2} sx={{ whiteSpace: "pre-line" }}>
//             {response}
//           </Typography>
//         </Box>
//       )} */}


// {response && (
//   <Box mt={4}>
//     <Typography variant="h6">📚 Explication de l'IA</Typography>
//     <Typography
//       mt={2}
//       sx={{ whiteSpace: "pre-line" }}
//       dangerouslySetInnerHTML={{ __html: marked(response)}}
//     />
//   </Box>
// )}

//     </PageLayout>
//   );
// };

// export default AideDetailleePage;




import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import { useSearchParams } from "react-router-dom";
import API from "../api";

const chapitreLabels = {
  "suites": "Suites numériques",
  "log-exp": "Fonctions logarithmes et exponentielles",
  "limites": "Limites et continuité",
  "derivation": "Dérivation",
  "integrales": "Primitives et intégration",
  "diff": "Équations différentielles",
  "espace": "Géométrie dans l’espace",
  "coniques": "Coniques",
  "complexes-formes": "Formes des nombres complexes",
  "complexes-transformations": "Transformations complexes",
  "probabilites": "Probabilités",
  "variables-aleatoires": "Variables aléatoires",
  "statistique": "Statistique inférentielle",
  "arithmetique": "Arithmétique"
};

const AideDetailleePage = () => {
  const [searchParams] = useSearchParams();
  const chapitre = searchParams.get("chapitre");

  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (chapitre && chapitreLabels[chapitre]) {
      setQuestion(`Explique-moi le chapitre "${chapitreLabels[chapitre]}" du programme de Terminale C.`);
    }
  }, [chapitre]);

  const handleSubmitText = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    setMessage("");

    try {
      const res = await API.post("/ia/help", { input: question });
      setResponse(res.data.response);
    } catch (error) {
      setMessage("❌ Erreur IA.");
    }

    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setMessage("");
    setResponse("");

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleUploadImage = async () => {
    if (!image) {
      setMessage("Veuillez sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setLoading(true);
    setResponse("");
    setMessage("");

    try {
      const res = await API.post("/ia/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResponse(res.data.response);
    } catch (error) {
      setMessage("❌ Erreur lors de l'analyse de l'image.");
    }

    setLoading(false);
  };

  return (
    <Box sx={{ mt: 4, px: 2, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        🤖 Aide détaillée par l’IA
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={3}>
        Tu peux soit poser une question en texte, soit envoyer une image de ton exercice à l’IA.
      </Typography>

      {/* 🔤 Zone texte */}
      <form onSubmit={handleSubmitText}>
        <TextField
          label="Pose ta question (ex : explique le chapitre...)"
          multiline
          rows={4}
          fullWidth
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <Button
          variant="contained"
          type="submit"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Envoyer la question"}
        </Button>
      </form>

      {/* 🖼️ Upload image */}
      <Box mt={5}>
        <Typography variant="h6">📷 Ou envoie une image de ton exercice</Typography>

        <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginTop: 8 }} />
        <Button
          variant="outlined"
          onClick={handleUploadImage}
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Analyser l’image"}
        </Button>

        {imagePreview && (
          <Box mt={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Aperçu de l’image :
            </Typography>
            <Box
              component="img"
              src={imagePreview}
              alt="Exercice scanné"
              sx={{ maxWidth: "100%", maxHeight: 400, mt: 1, borderRadius: 2 }}
            />
          </Box>
        )}
      </Box>

      {/* 🧠 Réponse */}
      {loading && (
        <Typography mt={3}>
          <CircularProgress size={24} /> Analyse en cours...
        </Typography>
      )}

      {message && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {message}
        </Alert>
      )}

      {response && (
        <Box mt={4} p={2} bgcolor="#f5f5f5" borderRadius={2}>
          <Typography variant="h6">📚 Réponse de l’IA :</Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-line", mt: 1 }}>
            {response}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AideDetailleePage;
