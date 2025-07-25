// import React, { useState } from "react";
// import {
//   Box, Typography, TextField, Button, Paper, Alert, CircularProgress
// } from "@mui/material";
// import API from "../../api";
// import PageLayout from "../../components/PageLayout";
// import ReactMarkdown from "react-markdown";
// import remarkMath from "remark-math";
// import rehypeKatex from "rehype-katex";
// import "katex/dist/katex.min.css";


// const IATCPremiumPage = () => {
//   const [inputText, setInputText] = useState("");
//   const [image, setImage] = useState(null);
//   const [response, setResponse] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const [error, setError] = useState("");

//   const handleTextSubmit = async () => {
//     if (!inputText.trim()) return;
//     setLoading(true);
//     setError("");
//     try {
//       const res = await API.post("/ia/solve", { input: inputText });
//       setResponse(res.data.response);
//       setStep(2);
//     } catch (err) {
//       setError(err.response?.data?.message || "Erreur IA");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleImageSubmit = async () => {
//     if (!image) return;
//     const formData = new FormData();
//     formData.append("image", image);

//     setLoading(true);
//     setError("");
//     try {
//       const res = await API.post("/ia/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setResponse(res.data.response);
//       setStep(2);
//     } catch (err) {
//       setError(err.response?.data?.message || "Erreur IA OCR");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <PageLayout>
//       <Box sx={{ mt: 4, mb: 2 }}>
//         <Typography variant="h4" gutterBottom color="primary">
//           🚀 Aide IA Premium - Terminale C
//         </Typography>
//         <Typography>
//           Soumets ton exercice de maths : l'IA te guidera pas à pas. Utilise d’abord les explications, puis demande la solution.
//         </Typography>
//       </Box>

//       {/* Texte manuel */}
//       <Paper sx={{ p: 2, mt: 2 }}>
//         <Typography variant="h6" gutterBottom>✍️ Entrée texte</Typography>
//         <TextField
//           fullWidth
//           label="Écris ici ton exercice..."
//           multiline
//           rows={4}
//           value={inputText}
//           onChange={(e) => setInputText(e.target.value)}
//         />
//         <Button variant="contained" sx={{ mt: 2 }} onClick={handleTextSubmit}>
//           Envoyer le texte à l’IA
//         </Button>
//       </Paper>

//       {/* Image */}
//    <Paper sx={{ p: 2, mt: 3 }}>
//   <Typography variant="h6" gutterBottom>📸 Ou téléverse une image</Typography>
//   <input
//     type="file"
//     accept="image/*"
//     onChange={(e) => setImage(e.target.files[0])}
//   />

//   {image && (
//     <Box mt={2}>
//       <Typography variant="caption">Aperçu de l’image :</Typography>
//       <img
//         src={URL.createObjectURL(image)}
//         alt="Aperçu exercice"
//         style={{ maxWidth: "100%", borderRadius: 8 }}
//       />
//     </Box>
//   )}

//   <Button
//     variant="outlined"
//     color="secondary"
//     sx={{ mt: 2 }}
//     onClick={handleImageSubmit}
//   >
//     Envoyer l’image à l’IA
//   </Button>
// </Paper>


//       {loading && <CircularProgress sx={{ mt: 3 }} />}

//       {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

//       {/* Résultat IA */}
//       {response && (
//         <Paper sx={{ p: 3, mt: 3, backgroundColor: "#f3f4f6" }}>
//           <Typography variant="h6">🧠 Réponse IA</Typography>
//           {/* <Box dangerouslySetInnerHTML={{ __html: response }} /> */}

//           <Box sx={{ mt: 2 }}>
//             <ReactMarkdown
//                 children={response}
//                 remarkPlugins={[remarkMath]}
//                 rehypePlugins={[rehypeKatex]}
//             />
//             </Box>


//           {step === 2 && (
//             <Button
//               variant="contained"
//               color="success"
//               sx={{ mt: 2 }}
//               onClick={() => setStep(3)}
//             >
//               Voir la solution complète
//             </Button>
//           )}
//         </Paper>
//       )}
//     </PageLayout>
//   );
// };

// export default IATCPremiumPage;
