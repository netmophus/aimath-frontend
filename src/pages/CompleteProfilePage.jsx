


// // import React, { useState, useContext } from "react";
// // import {
// //   TextField,
// //   Typography,
// //   Button,
// //   Box,
// //   MenuItem,
// //   FormControl,
// //   InputLabel,
// //   Select,
// // } from "@mui/material";
// // import PageLayout from "../components/PageLayout";
// // import API from "../api";
// // import { useNavigate } from "react-router-dom";
// // import { AuthContext } from "../context/AuthContext";

// // const levels = ["college", "lycee"];

// // const classesByLevel = {
// //   college: ["6ème", "5ème", "4ème", "3ème"],
// //   lycee: ["Seconde", "Première", "Terminale"],
// // };

// // const CompleteProfilePage = () => {
// //   const [fullName, setFullName] = useState("");
// //   const [level, setLevel] = useState("");
// //   const [classe, setClasse] = useState("");
// //   const [message, setMessage] = useState("");

// //   const navigate = useNavigate();
// //   const { user } = useContext(AuthContext);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     try {
// //       await API.post("/student/profile", {
// //         fullName,
// //         level,
// //         classe,
// //       });

// //       setMessage("✅ Profil complété avec succès !");
// //      setTimeout(() => {
// //   const encoded = encodeURIComponent(user.classLevel);
// //   navigate(`/dashboard/${encoded}`);
// // }, 1000);

// //     } catch (err) {
// //       setMessage(err.response?.data?.message || "❌ Erreur lors de la soumission.");
// //     }
// //   };

// //   return (
// //     <PageLayout>
// //       <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
// //         <Typography variant="h5" mb={2}>
// //           🧑‍🎓 Complétez votre profil
// //         </Typography>

// //         <TextField
// //           fullWidth
// //           label="Nom complet"
// //           value={fullName}
// //           onChange={(e) => setFullName(e.target.value)}
// //           margin="normal"
// //           required
// //         />

// //         {/* ✅ Afficher seulement si c’est un élève */}
// //         {user?.role === "eleve" && (
// //           <>
// //             <FormControl fullWidth sx={{ mt: 2 }}>
// //               <InputLabel>Niveau</InputLabel>
// //               <Select
// //                 value={level}
// //                 onChange={(e) => {
// //                   setLevel(e.target.value);
// //                   setClasse("");
// //                 }}
// //                 label="Niveau"
// //               >
// //                 <MenuItem value="college">Collège</MenuItem>
// //                 <MenuItem value="lycee">Lycée</MenuItem>
// //               </Select>
// //             </FormControl>

// //             {level && (
// //               <FormControl fullWidth sx={{ mt: 2 }}>
// //                 <InputLabel>Classe</InputLabel>
// //                 <Select
// //                   value={classe}
// //                   onChange={(e) => setClasse(e.target.value)}
// //                   label="Classe"
// //                 >
// //                   {classesByLevel[level].map((cl) => (
// //                     <MenuItem key={cl} value={cl}>
// //                       {cl}
// //                     </MenuItem>
// //                   ))}
// //                 </Select>
// //               </FormControl>
// //             )}
// //           </>
// //         )}

// //         <Button variant="contained" type="submit" sx={{ mt: 3 }}>
// //           Valider mon profil
// //         </Button>

// //         {message && (
// //           <Typography color="secondary" sx={{ mt: 2 }}>
// //             {message}
// //           </Typography>
// //         )}
// //       </Box>
// //     </PageLayout>
// //   );
// // };

// // export default CompleteProfilePage;


// import React, { useState, useContext, useEffect } from "react";
// import {
//   TextField,
//   Typography,
//   Button,
//   Box,
// } from "@mui/material";
// import PageLayout from "../components/PageLayout";
// import API from "../api";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// // 🔁 Mapping automatique
// const mapClassLevelToDetails = (classLevel) => {
//   const mapping = {
//     "6eme":       { level: "college", classe: "6ème" },
//     "5eme":       { level: "college", classe: "5ème" },
//     "4eme":       { level: "college", classe: "4ème" },
//     "3eme":       { level: "college", classe: "3ème" },
//     "seconde-a":  { level: "lycee", classe: "Seconde" },
//     "seconde-c":  { level: "lycee", classe: "Seconde" },
//     "premiere-a": { level: "lycee", classe: "Première" },
//     "premiere-c": { level: "lycee", classe: "Première" },
//     "premiere-d": { level: "lycee", classe: "Première" },
//     "terminale-a": { level: "lycee", classe: "Terminale" },
//     "terminale-c": { level: "lycee", classe: "Terminale" },
//     "terminale-d": { level: "lycee", classe: "Terminale" },
//   };
//   return mapping[classLevel] || {};
// };

// const CompleteProfilePage = () => {
//   const [fullName, setFullName] = useState("");
//   const [message, setMessage] = useState("");

//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);

//   const { level, classe } = mapClassLevelToDetails(user?.classLevel);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       await API.post("/student/profile", {
//         fullName,
//         level,
//         classe,
//       });

//       setMessage("✅ Profil complété avec succès !");

//       setTimeout(() => {
//         const encoded = encodeURIComponent(user.classLevel);
//         navigate(`/dashboard/${encoded}`);
//       }, 1000);
//     } catch (err) {
//       setMessage(err.response?.data?.message || "❌ Erreur lors de la soumission.");
//     }
//   };

//   return (
//     <PageLayout>
//       <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
//         <Typography variant="h5" mb={2}>
//           🧑‍🎓 Complétez votre profil
//         </Typography>

//         <TextField
//           fullWidth
//           label="Nom complet"
//           value={fullName}
//           onChange={(e) => setFullName(e.target.value)}
//           margin="normal"
//           required
//         />

//         <Typography variant="body1" mt={2}>
//           🎓 Niveau : <strong>{level === "college" ? "Collège" : "Lycée"}</strong>
//         </Typography>

//         <Typography variant="body1" mt={1}>
//           📚 Classe : <strong>{classe}</strong>
//         </Typography>

//         <Button variant="contained" type="submit" sx={{ mt: 3 }}>
//           Valider mon profil
//         </Button>

//         {message && (
//           <Typography color="secondary" sx={{ mt: 2 }}>
//             {message}
//           </Typography>
//         )}
//       </Box>
//     </PageLayout>
//   );
// };

// export default CompleteProfilePage;

