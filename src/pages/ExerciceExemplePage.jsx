// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   CircularProgress
// } from "@mui/material";
// import { useSearchParams } from "react-router-dom";
// import API from "../api";

// const chapitreLabels = {
//   "suites": "Suites numériques",
//   "log-exp": "Fonctions logarithmes et exponentielles",
//   "limites": "Limites et continuité",
//   "derivation": "Dérivation",
//   "integrales": "Primitives et intégration",
//   "diff": "Équations différentielles",
//   "espace": "Géométrie dans l’espace",
//   "coniques": "Coniques",
//   "complexes-formes": "Formes complexes",
//   "complexes-transformations": "Transformations complexes",
//   "probabilites": "Probabilités",
//   "variables-aleatoires": "Variables aléatoires",
//   "statistique": "Statistique inférentielle",
//   "arithmetique": "Arithmétique"
// };

// const ExerciceExemplePage = () => {
//   const [searchParams] = useSearchParams();
//   const sujet = searchParams.get("sujet");

//   const chapitreNom = chapitreLabels[sujet] || sujet;
//   const [question, setQuestion] = useState("");
//   const [reponse, setReponse] = useState("");
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (sujet && chapitreNom) {
//       setQuestion(`Donne-moi un exemple d'exercice corrigé sur le chapitre "${chapitreNom}"`);
//     }
//   }, [sujet]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setReponse("");

//     try {
//       const res = await API.post("/ia/help", { input: question });
//       setReponse(res.data.response);
//     } catch (error) {
//       setReponse("❌ Une erreur est survenue.");
//     }

//     setLoading(false);
//   };

//   return (
//     <Box sx={{ mt: 4, px: 2, maxWidth: 800, mx: "auto" }}>
//       <Typography variant="h4" gutterBottom>
//         🧪 Exemple d'exercice : {chapitreNom}
//       </Typography>

//       <Typography variant="body1" color="text.secondary" mb={3}>
//         Voici un exemple corrigé pour t'aider à mieux comprendre ce chapitre.
//         Tu peux aussi modifier la question si tu veux un autre type d’exercice.
//       </Typography>

//       <form onSubmit={handleSubmit}>
//         <TextField
//           label="Exercice demandé"
//           multiline
//           rows={3}
//           fullWidth
//           value={question}
//           onChange={(e) => setQuestion(e.target.value)}
//           required
//         />

//         <Button
//           variant="contained"
//           type="submit"
//           sx={{ mt: 2 }}
//           disabled={loading}
//         >
//           {loading ? <CircularProgress size={24} color="inherit" /> : "Lancer l'exercice"}
//         </Button>
//       </form>

//       {reponse && (
//         <Box mt={4} p={2} bgcolor="#f5f5f5" borderRadius={2}>
//           <Typography variant="h6">🧠 Correction de l’IA :</Typography>
//           <Typography variant="body1" sx={{ whiteSpace: "pre-line", mt: 1 }}>
//             {reponse}
//           </Typography>
//         </Box>
//       )}
//     </Box>
//   );
// };

// export default ExerciceExemplePage;
