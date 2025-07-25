


// // import React, { useState, useEffect } from "react";
// // import {
// //   Box,
// //   Typography,
// //   Grid,
// //   Paper,
// //   List,
// //   ListItem,
// //   ListItemButton,
// //   ListItemText,
// //   Button,
// // } from "@mui/material";
// // import PageLayout from "../../components/PageLayout";
// // import API from "../../api";
// // import { useNavigate } from "react-router-dom";
// // import fahimtaImage from "../../assets/images/fahimta.jpg";
// // import fahimta2Image from "../../assets/images/fahimta2.jpg";



// // // 🔧 Convertit une URL YouTube classique en embed
// // const convertToEmbedUrl = (url) => {
// //   if (!url) return "";
// //   const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/);
// //   const videoId = match ? match[1] : "";
// //   return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
// // };

// // const TerminalDashboard = () => {
// //   const [chapters, setChapters] = useState([]);
// //   const [selectedChapter, setSelectedChapter] = useState(null);
// //   const [livres, setLivres] = useState([]);
// //   const [selectedBook, setSelectedBook] = useState(null);
// // const navigate = useNavigate();





// // const [chaptersD, setChaptersD] = useState([]);
// // const [selectedChapterD, setSelectedChapterD] = useState(null);

// // const [chaptersA, setChaptersA] = useState([]);
// // const [selectedChapterA, setSelectedChapterA] = useState(null);





// // const fetchChaptersD = async () => {
// //   try {
// //     const res = await API.get("/admin/chapters/lycee/Terminale?serie=D");
// //     setChaptersD(res.data.chapters || []);
// //     if (res.data.chapters.length > 0) {
// //       setSelectedChapterD(res.data.chapters[0]);
// //     }
// //   } catch (error) {
// //     console.error("Erreur fetch chapitre D :", error);
// //   }
// // };

// // const fetchChaptersA = async () => {
// //   try {
// //     const res = await API.get("/admin/chapters/lycee/Terminale?serie=A");
// //     setChaptersA(res.data.chapters || []);
// //     if (res.data.chapters.length > 0) {
// //       setSelectedChapterA(res.data.chapters[0]);
// //     }
// //   } catch (error) {
// //     console.error("Erreur fetch chapitre A :", error);
// //   }
// // };

// // fetchChaptersD();
// // fetchChaptersA();


// //   useEffect(() => {
// //     const fetchChapters = async () => {
// //       try {
// //         const res = await API.get("/admin/chapters/lycee/Terminale?serie=C");
// //         setChapters(res.data.chapters || []);
// //         if (res.data.chapters.length > 0) {
// //           setSelectedChapter(res.data.chapters[0]);
// //         }
// //       } catch (error) {
// //         console.error("Erreur fetch chapitre :", error);
// //       }
// //     };

// //     const fetchLivres = async () => {
// //       try {
// //         const res = await API.get("/admin/books/lycee/Terminale?serie=C");
// //         setLivres(res.data || []);
// //         if (res.data.length > 0) {
// //           setSelectedBook(res.data[0]);
// //         }
// //       } catch (error) {
// //         console.error("Erreur fetch livres :", error);
// //       }
// //     };

// //     fetchChapters();
// //     fetchLivres();
// //   }, []);

// //   return (
// //     <PageLayout>
// // <Box
// //   sx={{
// //     mt: 4,
// //     mb: 4,
// //     p: 3,
// //     backgroundColor: "#f3f0ff",
// //     borderLeft: "6px solid #7e57c2",
// //     borderRadius: 2,
// //   }}
// // >

// //   <Box sx={{ textAlign: "center", mb: 2 }}>
// //   <img
// //     src={fahimtaImage}
// //     alt="Fahimta"
// //     style={{
// //       width: "100%",
// //       maxHeight: "380px",
// //       objectFit: "cover",
// //       borderRadius: "10px",
// //       boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
// //     }}
// //   />
// // </Box>


// //   <Typography variant="body1" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
// //     <Box ml={1}>Téléchargez gratuitement des <strong>livres et annales corrigées</strong> pour Terminale C.</Box>
// //   </Typography>

// //   <Typography variant="body1" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
// //     <Box ml={1}>Accédez aux <strong>vidéos explicatives</strong> et exercices de révision classés par chapitre.</Box>
// //   </Typography>

// //   <Typography variant="body1" sx={{ display: "flex", alignItems: "center" }}>
// //     <Box ml={1}><strong>Une IA intégrée</strong> vous aide à résoudre des exercices, répondre à vos questions, ou même analyser un exercice en image, <strong>24h/24</strong>.</Box>
// //   </Typography>
// // </Box>


// //       {/* 📚 LIVRES ET ANNALES */}
// // <Box sx={{ mt: 4 }}>
// //   <Typography variant="h6" gutterBottom sx={{  fontSize:40}}>
// //     Livres et Annales
// //   </Typography>




// //  <Box
// //   sx={{
// //     display: "grid",
// //     gap: 2,
// //     gridTemplateColumns: {
// //       xs: "repeat(1, 1fr)",     // 📱 mobile (≤600px)
// //       sm: "repeat(2, 1fr)",     // 📱 tablette (600px à 900px)
// //       md: "repeat(3, 1fr)",     // 💻 petit écran (≥900px)
// //       lg: "repeat(4, 1fr)",     // 🖥️ grand écran (≥1200px)
// //     },
// //   }}
// // >
// //     {livres?.map((livre) => (
// //       <Paper
// //         key={livre._id}
// //         elevation={3}
// //         sx={{
// //           height: 250, // Hauteur fixe stricte pour toutes les cartes
// //           display: "flex",
// //           flexDirection: "column",
// //           // justifyContent: "space-between",
// //           justifyContent: "flex-start",
// // marginBottom:2,
// //           border: "1px solid #ccc",
// //           overflow: "hidden",
// //           p: 1.5,
// //         }}
// //       >
// //         {/* 📘 Image ou PDF */}
// //         <Box sx={{ textAlign: "center", height: 150, mb: 1 }}>
// //           {livre.imageUrl ? (
// //             <img
// //               src={`http://localhost:5000/${livre.imageUrl}`}
// //               alt={livre.title}
// //               style={{
// //                 width: "100%",
// //                 height: "100%",
// //                 objectFit: "cover",
// //                 borderRadius: 6,
// //               }}
// //             />
// //           ) : livre.fileUrl ? (
// //             <iframe
// //               src={`http://localhost:5000/${livre.fileUrl}`}
// //               title={livre.title}
// //               width="100%"
// //               height="100%"
// //               style={{
// //                 border: "none",
// //                 borderRadius: 6,
// //               }}
// //             />
// //           ) : (
// //             <Box
// //               sx={{
// //                 height: "100%",
// //                 bgcolor: "#eee",
// //                 display: "flex",
// //                 alignItems: "center",
// //                 justifyContent: "center",
// //                 borderRadius: 2,
// //               }}
// //             >
// //               <Typography variant="caption">Pas d’aperçu</Typography>
// //             </Box>
// //           )}
// //         </Box>

// //         {/* 📝 Titre */}
// //         <Typography
// //           variant="subtitle1"
// //           fontWeight="bold"
// //           sx={{
// //             fontSize: "0.95rem",
// //             mb: 0.5,
// //             overflow: "hidden",
// //             whiteSpace: "nowrap",
// //             textOverflow: "ellipsis",
// //           }}
// //         >
// //           {livre.title}
// //         </Typography>

// //         {/* 📝 Description limitée à 2 lignes */}
// //         <Typography
// //           variant="body2"
// //           color="text.secondary"
// //           sx={{
// //             fontSize: "0.65rem",
// //             mb: 1,
// //             lineHeight: "1.2em",
// //             display: "-webkit-box",
// //             WebkitLineClamp: 2,
// //             WebkitBoxOrient: "vertical",
// //             overflow: "hidden",
// //             minHeight: "2.6em",
// //           }}
// //         >
// //           {livre.description}
// //         </Typography>

// //         {/* 📥 Bouton Télécharger aligné en bas */}
// //         <Box sx={{ mt: "auto" }}>
// //           {livre.fileUrl && (
// //             <Button
// //               fullWidth
// //               variant="contained"
// //               color="primary"
// //               href={`http://localhost:5000/${livre.fileUrl}`}
// //               target="_blank"
// //               rel="noopener noreferrer"
// //               sx={{ fontSize: "0.85rem", py: 1 }}
// //             >
// //               📥 Télécharger
// //             </Button>
// //           )}
// //         </Box>
// //       </Paper>
// //     ))}
// //   </Box>
// // </Box>






// //       {/* 📘 CHAPITRES */}

    
// //       <Grid container spacing={3}>
 
// // <Box
// //   sx={{
// //     mb: 2,
// //     p: 2,
// //     backgroundColor: "#e8f5e9",
// //     borderLeft: "6px solid #43a047",
// //     borderRadius: 2,
// //   }}
// // >

// //    <Box sx={{ textAlign: "center", mb: 3 }}>
// //   <img
// //     src={fahimta2Image}
// //     alt="Illustration chapitres"
// //     style={{
// //       width: "100%",
// //       maxHeight: 350,
// //       objectFit: "cover",
// //       borderRadius: 12,
// //       boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
// //     }}
// //   />  

// // </Box>





// //   <Typography variant="h6" sx={{ color: "#2e7d32", fontWeight: "bold", mb: 1 }}>
// //     Comprendre et réussir grâce aux chapitres interactifs
// //   </Typography>

// // </Box>



// // <Box sx={{ width: "100%", mt: 6, mb: 2 }}>
// //   <Typography
// //     variant="h5"
// //     sx={{
// //       color: "#2e7d32",
// //       fontWeight: "bold",
// //       textAlign: "left", // Ou "left" si tu préfères aligné à gauche
// //     }}
// //   >
// //     Programme Officiel – Terminale C
// //   </Typography>
// // </Box>




// //         <Grid item xs={12} md={4}>

// //           <Paper sx={{ p: 2, backgroundColor: "#e3f2fd" }}>
// //             <Typography variant="h6" gutterBottom>
// //               🗂️ Chapitres
// //             </Typography>

            
// //             <List>
// //               {chapters.map((chap) => (
// //                 <ListItem disablePadding key={chap._id}>
// //                   <ListItemButton
// //                     selected={selectedChapter?._id === chap._id}
// //                     onClick={() => setSelectedChapter(chap)}
// //                   >
// //                     <ListItemText primary={`Chapitre ${chap.chapterNumber} : ${chap.title}`} />
// //                   </ListItemButton>
// //                 </ListItem>
// //               ))}
// //             </List>
// //           </Paper>
// //         </Grid>

// //         {/* 📄 Contenu du chapitre */}

        
// //         <Grid item xs={12} md={8}>
// //           <Paper sx={{ p: 2, backgroundColor: "#fff3e0" }}>
// //             {selectedChapter ? (
// //               <>
// //                 <Typography variant="subtitle2" color="text.secondary">
// //                   Niveau : {selectedChapter.level} / Classe : {selectedChapter.classe} / Série : {selectedChapter.serie}
// //                 </Typography>

// //                 <Typography variant="h6" mt={1} mb={2}>
// //                   📄 {selectedChapter.title}
// //                 </Typography>
// //                 <Typography mb={2}>{selectedChapter.description}</Typography>

// //                 {selectedChapter.videos.map((vid, i) => (
// //                   <Box key={i} mb={3}>
// //                     <Typography fontWeight="bold">{vid.title}</Typography>
// //                     <Typography>{vid.description}</Typography>
// //                     <Box mt={1}>
// //                       <iframe
// //                         width="100%"
// //                         height="315"
// //                         src={convertToEmbedUrl(vid.url)}
// //                         title={vid.title}
// //                         frameBorder="0"
// //                         allowFullScreen
// //                       ></iframe>
// //                     </Box>
// //                   </Box>
// //                 ))}

// //                 {selectedChapter.pdfs.map((pdf, i) => (
// //                   <Box key={i} mt={2}>
// //                     <Typography fontWeight="bold">{pdf.title}</Typography>
// //                     <Typography>{pdf.description}</Typography>
// //                     <a href={pdf.url} target="_blank" rel="noopener noreferrer">
// //                       📥 Télécharger le PDF
// //                     </a>
// //                   </Box>
// //                 ))}

// //                 <Box mt={3}>
// //                  <Button
// //                   variant="outlined"
// //                   color="success"
// //                   onClick={() => navigate("/terminal-c/ia-gratuit")}
// //                 >
// //                   Interroger l'IA (Version gratuite)
// //                 </Button>

// //                  <Button
// //                   variant="contained"
// //                   color="secondary"
// //                   sx={{ ml: 2 }}
// //                   onClick={() => navigate("/terminal-c/ia-premium")}
// //                 >
// //                   Version Premium IA 🚀
// //                 </Button>

// //                 </Box>
// //               </>
// //             ) : (
// //               <Typography>Aucun chapitre sélectionné</Typography>
// //             )}
// //           </Paper>
// //         </Grid>




// //       </Grid>

// // <Typography variant="h5" mt={6} mb={2}>Programme Officiel – Terminale D</Typography>
// // <Grid container spacing={3}>


// //   <Grid item xs={12} md={4}>
// //     <Paper sx={{ p: 2, backgroundColor: "#e3f2fd" }}>
// //       <Typography variant="h6" gutterBottom>🗂️ Chapitres</Typography>
// //       <List>
// //         {chaptersD.map((chap) => (
// //           <ListItem disablePadding key={chap._id}>
// //             <ListItemButton
// //               selected={selectedChapterD?._id === chap._id}
// //               onClick={() => setSelectedChapterD(chap)}
// //             >
// //               <ListItemText primary={`Chapitre ${chap.chapterNumber} : ${chap.title}`} />
// //             </ListItemButton>
// //           </ListItem>
// //         ))}
// //       </List>
// //     </Paper>
// //   </Grid>





// //   <Grid item xs={12} md={8}>
// //     <Paper sx={{ p: 2, backgroundColor: "#fff3e0" }}>
// //       {selectedChapterD ? (
// //         <>
// //           <Typography variant="subtitle2" color="text.secondary">
// //             Niveau : {selectedChapterD.level} / Classe : {selectedChapterD.classe} / Série : {selectedChapterD.serie}
// //           </Typography>
// //           <Typography variant="h6" mt={1} mb={2}>📄 {selectedChapterD.title}</Typography>
// //           <Typography mb={2}>{selectedChapterD.description}</Typography>

// //           {selectedChapterD.videos.map((vid, i) => (
// //             <Box key={i} mb={3}>
// //               <Typography fontWeight="bold">{vid.title}</Typography>
// //               <Typography>{vid.description}</Typography>
// //               <Box mt={1}>
// //                 <iframe
// //                   width="100%"
// //                   height="315"
// //                   src={convertToEmbedUrl(vid.url)}
// //                   title={vid.title}
// //                   frameBorder="0"
// //                   allowFullScreen
// //                 ></iframe>
// //               </Box>
// //             </Box>
// //           ))}

// //           {selectedChapterD.pdfs.map((pdf, i) => (
// //             <Box key={i} mt={2}>
// //               <Typography fontWeight="bold">{pdf.title}</Typography>
// //               <Typography>{pdf.description}</Typography>
// //               <a href={pdf.url} target="_blank" rel="noopener noreferrer">
// //                 📥 Télécharger le PDF
// //               </a>
// //             </Box>
// //           ))}
// //         </>
// //       ) : (
// //         <Typography>Aucun chapitre sélectionné</Typography>
// //       )}
// //     </Paper>
// //   </Grid>






// // </Grid>



// // <Typography variant="h5" mt={6} mb={2}>
// //   Programme Officiel – Terminale A
// // </Typography>

// // <Grid container spacing={3}>
// //   <Grid item xs={12} md={4}>
// //     <Paper sx={{ p: 2, backgroundColor: "#e3f2fd" }}>
// //       <Typography variant="h6" gutterBottom>🗂️ Chapitres</Typography>
// //       <List>
// //         {chaptersA.map((chap) => (
// //           <ListItem disablePadding key={chap._id}>
// //             <ListItemButton
// //               selected={selectedChapterA?._id === chap._id}
// //               onClick={() => setSelectedChapterA(chap)}
// //             >
// //               <ListItemText primary={`Chapitre ${chap.chapterNumber} : ${chap.title}`} />
// //             </ListItemButton>
// //           </ListItem>
// //         ))}
// //       </List>
// //     </Paper>
// //   </Grid>

// //   <Grid item xs={12} md={8}>
// //     <Paper sx={{ p: 2, backgroundColor: "#fff3e0" }}>
// //       {selectedChapterA ? (
// //         <>
// //           <Typography variant="subtitle2" color="text.secondary">
// //             Niveau : {selectedChapterA.level} / Classe : {selectedChapterA.classe} / Série : {selectedChapterA.serie}
// //           </Typography>
// //           <Typography variant="h6" mt={1} mb={2}>📄 {selectedChapterA.title}</Typography>
// //           <Typography mb={2}>{selectedChapterA.description}</Typography>

// //           {selectedChapterA.videos.map((vid, i) => (
// //             <Box key={i} mb={3}>
// //               <Typography fontWeight="bold">{vid.title}</Typography>
// //               <Typography>{vid.description}</Typography>
// //               <Box mt={1}>
// //                 <iframe
// //                   width="100%"
// //                   height="315"
// //                   src={convertToEmbedUrl(vid.url)}
// //                   title={vid.title}
// //                   frameBorder="0"
// //                   allowFullScreen
// //                 ></iframe>
// //               </Box>
// //             </Box>
// //           ))}

// //           {selectedChapterA.pdfs.map((pdf, i) => (
// //             <Box key={i} mt={2}>
// //               <Typography fontWeight="bold">{pdf.title}</Typography>
// //               <Typography>{pdf.description}</Typography>
// //               <a href={pdf.url} target="_blank" rel="noopener noreferrer">
// //                 📥 Télécharger le PDF
// //               </a>
// //             </Box>
// //           ))}
// //         </>
// //       ) : (
// //         <Typography>Aucun chapitre sélectionné</Typography>
// //       )}
// //     </Paper>
// //   </Grid>
// // </Grid>



// //     </PageLayout>
// //   );
// // };

// // export default TerminalDashboard;











// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Paper,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemText,
//   Button,
// } from "@mui/material";
// import PageLayout from "../../components/PageLayout";
// import API from "../../api";
// import { useNavigate } from "react-router-dom";
// import fahimtaImage from "../../assets/images/fahimta.jpg";




// // 🔧 Convertit une URL YouTube classique en embed
// const convertToEmbedUrl = (url) => {
//   if (!url) return "";
//   const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/);
//   const videoId = match ? match[1] : "";
//   return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
// };

// const TerminalDashboard = () => {
//   const [chapters, setChapters] = useState([]);
//   const [selectedChapter, setSelectedChapter] = useState(null);
//   const [livres, setLivres] = useState([]);
//   const [selectedBook, setSelectedBook] = useState(null);
// const navigate = useNavigate();





// const [chaptersD, setChaptersD] = useState([]);
// const [selectedChapterD, setSelectedChapterD] = useState(null);

// const [chaptersA, setChaptersA] = useState([]);
// const [selectedChapterA, setSelectedChapterA] = useState(null);





// const fetchChaptersD = async () => {
//   try {
//     const res = await API.get("/admin/chapters/lycee/Terminale?serie=D");
//     setChaptersD(res.data.chapters || []);
//     if (res.data.chapters.length > 0) {
//       setSelectedChapterD(res.data.chapters[0]);
//     }
//   } catch (error) {
//     console.error("Erreur fetch chapitre D :", error);
//   }
// };

// const fetchChaptersA = async () => {
//   try {
//     const res = await API.get("/admin/chapters/lycee/Terminale?serie=A");
//     setChaptersA(res.data.chapters || []);
//     if (res.data.chapters.length > 0) {
//       setSelectedChapterA(res.data.chapters[0]);
//     }
//   } catch (error) {
//     console.error("Erreur fetch chapitre A :", error);
//   }
// };

// fetchChaptersD();
// fetchChaptersA();


//   useEffect(() => {
//     const fetchChapters = async () => {
//       try {
//         const res = await API.get("/admin/chapters/lycee/Terminale?serie=C");
//         setChapters(res.data.chapters || []);
//         if (res.data.chapters.length > 0) {
//           setSelectedChapter(res.data.chapters[0]);
//         }
//       } catch (error) {
//         console.error("Erreur fetch chapitre :", error);
//       }
//     };

//     const fetchLivres = async () => {
//       try {
//         const res = await API.get("/admin/books/lycee/Terminale?serie=C");
//         setLivres(res.data || []);
//         if (res.data.length > 0) {
//           setSelectedBook(res.data[0]);
//         }
//       } catch (error) {
//         console.error("Erreur fetch livres :", error);
//       }
//     };

//     fetchChapters();
//     fetchLivres();
//   }, []);

//   return (
//     <PageLayout>
// <Box
//   sx={{
//     mt: 10,
//     mb: 4,
//     p: 3,
//     backgroundColor: "#f3f0ff",
//     borderLeft: "6px solid #7e57c2",
//     borderRadius: 2,
//   }}
// >

//   <Box sx={{ textAlign: "center", mb: 3 }}>
//   <img
//     src={fahimtaImage}
//     alt="Fahimta"
//     style={{
//       width: "100%",
//       maxHeight: "380px",
//       objectFit: "cover",
//       borderRadius: "10px",
//       boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
//     }}
//   />
// </Box>


//   <Typography variant="body1" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//     <Box ml={1}>Téléchargez gratuitement des <strong>livres et annales corrigées</strong> pour Terminale C.</Box>
//   </Typography>

//   <Typography variant="body1" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
//     <Box ml={1}>Accédez aux <strong>vidéos explicatives</strong> et exercices de révision classés par chapitre.</Box>
//   </Typography>

//   <Typography variant="body1" sx={{ display: "flex", alignItems: "center" }}>
//     <Box ml={1}><strong>Une IA intégrée</strong> vous aide à résoudre des exercices, répondre à vos questions, ou même analyser un exercice en image, <strong>24h/24</strong>.</Box>
//   </Typography>
// </Box>


//       {/* 📚 LIVRES ET ANNALES */}
// <Box sx={{ mt: 4 }}>
//   <Typography variant="h6" gutterBottom sx={{  fontSize:40}}>
//     Livres et Annales
//   </Typography>




//  <Box
//   sx={{
//     display: "grid",
//     gap: 2,
//     gridTemplateColumns: {
//       xs: "repeat(1, 1fr)",     // 📱 mobile (≤600px)
//       sm: "repeat(2, 1fr)",     // 📱 tablette (600px à 900px)
//       md: "repeat(3, 1fr)",     // 💻 petit écran (≥900px)
//       lg: "repeat(4, 1fr)",     // 🖥️ grand écran (≥1200px)
//     },
//   }}
// >
//     {livres?.map((livre) => (
//       <Paper
//         key={livre._id}
//         elevation={3}
//         sx={{
//           height: 250, // Hauteur fixe stricte pour toutes les cartes
//           display: "flex",
//           flexDirection: "column",
//           // justifyContent: "space-between",
//           justifyContent: "flex-start",
// marginBottom:2,
//           border: "1px solid #ccc",
//           overflow: "hidden",
//           p: 1.5,
//         }}
//       >
//         {/* 📘 Image ou PDF */}
//         <Box sx={{ textAlign: "center", height: 150, mb: 1 }}>
//           {livre.imageUrl ? (
//             <img
//               src={`http://localhost:5000/${livre.imageUrl}`}
//               alt={livre.title}
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover",
//                 borderRadius: 6,
//               }}
//             />
//           ) : livre.fileUrl ? (
//             <iframe
//               src={`http://localhost:5000/${livre.fileUrl}`}
//               title={livre.title}
//               width="100%"
//               height="100%"
//               style={{
//                 border: "none",
//                 borderRadius: 6,
//               }}
//             />
//           ) : (
//             <Box
//               sx={{
//                 height: "100%",
//                 bgcolor: "#eee",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 borderRadius: 2,
//               }}
//             >
//               <Typography variant="caption">Pas d’aperçu</Typography>
//             </Box>
//           )}
//         </Box>

//         {/* 📝 Titre */}
//         <Typography
//           variant="subtitle1"
//           fontWeight="bold"
//           sx={{
//             fontSize: "0.95rem",
//             mb: 0.5,
//             overflow: "hidden",
//             whiteSpace: "nowrap",
//             textOverflow: "ellipsis",
//           }}
//         >
//           {livre.title}
//         </Typography>

//         {/* 📝 Description limitée à 2 lignes */}
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{
//             fontSize: "0.65rem",
//             mb: 1,
//             lineHeight: "1.2em",
//             display: "-webkit-box",
//             WebkitLineClamp: 2,
//             WebkitBoxOrient: "vertical",
//             overflow: "hidden",
//             minHeight: "2.6em",
//           }}
//         >
//           {livre.description}
//         </Typography>

//         {/* 📥 Bouton Télécharger aligné en bas */}
//         <Box sx={{ mt: "auto" }}>
//           {livre.fileUrl && (
//             <Button
//               fullWidth
//               variant="contained"
//               color="primary"
//               href={`http://localhost:5000/${livre.fileUrl}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               sx={{ fontSize: "0.85rem", py: 1 }}
//             >
//               📥 Télécharger
//             </Button>
//           )}
//         </Box>
//       </Paper>
//     ))}
//   </Box>
// </Box>






//       {/* 📘 CHAPITRES */}

    
//    <Box sx={{ width: "100%", mt: 8, mb: 4 }}>
//   <Typography variant="h5" mb={2} fontWeight="bold" color="#2e7d32">
//     Programme Officiel – Terminale C
//   </Typography>

//   <Grid container spacing={3}>
//     <Grid item xs={12} md={4}>
//       <Paper sx={{ p: 2, backgroundColor: "#e3f2fd", width: "95%" }}>
//         <Typography variant="h6" gutterBottom>🗂️ Chapitres</Typography>
//         <List>
//           {chapters.map((chap) => (
//             <ListItem disablePadding key={chap._id}>
//               <ListItemButton
//                 selected={selectedChapter?._id === chap._id}
//                 onClick={() => setSelectedChapter(chap)}
//               >
//                 <ListItemText primary={`Chapitre ${chap.chapterNumber} : ${chap.title}`} />
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//       </Paper>
//     </Grid>

//     <Grid item xs={12} md={8}>
//       <Paper sx={{ p: 2, backgroundColor: "#fff3e0", width: "100%" }}>
//         {selectedChapter ? (
//           <>
//             <Typography variant="subtitle2" color="text.secondary">
//               Niveau : {selectedChapter.level} / Classe : {selectedChapter.classe} / Série : {selectedChapter.serie}
//             </Typography>
//             <Typography variant="h6" mt={1} mb={2}>📄 {selectedChapter.title}</Typography>
//             <Typography mb={2}>{selectedChapter.description}</Typography>

//             {selectedChapter.videos.map((vid, i) => (
//               <Box key={i} mb={3}>
//                 <Typography fontWeight="bold">{vid.title}</Typography>
//                 <Typography>{vid.description}</Typography>
//                 <Box mt={1}>
//                   <iframe
//                     width="100%"
//                     height="315"
//                     src={convertToEmbedUrl(vid.url)}
//                     title={vid.title}
//                     frameBorder="0"
//                     allowFullScreen
//                   ></iframe>
//                 </Box>
//               </Box>
//             ))}

//             {selectedChapter.pdfs.map((pdf, i) => (
//               <Box key={i} mt={2}>
//                 <Typography fontWeight="bold">{pdf.title}</Typography>
//                 <Typography>{pdf.description}</Typography>
//                 <a href={pdf.url} target="_blank" rel="noopener noreferrer">
//                   📥 Télécharger le PDF
//                 </a>
//               </Box>
//             ))}

//             {/* Boutons IA */}
//             <Box mt={3}>
//               <Button
//                 variant="outlined"
//                 color="success"
//                 onClick={() => navigate("/terminal-c/ia-gratuit")}
//               >
//                 Interroger l'IA (Version gratuite)
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 sx={{ ml: 2 }}
//                 onClick={() => navigate("/terminal-c/ia-premium")}
//               >
//                 Version Premium IA 🚀
//               </Button>
//             </Box>
//           </>
//         ) : (
//           <Typography>Aucun chapitre sélectionné</Typography>
//         )}
//       </Paper>
//     </Grid>
//   </Grid>
// </Box>

























// <Box sx={{ width: "100%", mt: 8, mb: 4 }}>
//   <Typography variant="h5" mb={2} fontWeight="bold" color="#2e7d32">
//     Programme Officiel – Terminale D
//   </Typography>

//   <Grid container spacing={3}>
//     {/* 📚 Liste des chapitres */}
//     <Grid item xs={12} md={4}>
//       <Paper sx={{ p: 2, backgroundColor: "#e3f2fd", width: "95%" }}>
//         <Typography variant="h6" gutterBottom>🗂️ Chapitres</Typography>
//         <List>
//           {chaptersD.map((chap) => (
//             <ListItem disablePadding key={chap._id}>
//               <ListItemButton
//                 selected={selectedChapterD?._id === chap._id}
//                 onClick={() => setSelectedChapterD(chap)}
//               >
//                 <ListItemText primary={`Chapitre ${chap.chapterNumber} : ${chap.title}`} />
//               </ListItemButton>
//             </ListItem>
//           ))}
//         </List>
//       </Paper>
//     </Grid>

//     {/* 📄 Contenu du chapitre */}
//     <Grid item xs={12} md={8}>
//       <Paper sx={{ p: 2, backgroundColor: "#fff3e0", width: "100%" }}>
//         {selectedChapterD ? (
//           <>
//             <Typography variant="subtitle2" color="text.secondary">
//               Niveau : {selectedChapterD.level} / Classe : {selectedChapterD.classe} / Série : {selectedChapterD.serie}
//             </Typography>
//             <Typography variant="h6" mt={1} mb={2}>📄 {selectedChapterD.title}</Typography>
//             <Typography mb={2}>{selectedChapterD.description}</Typography>

//             {selectedChapterD.videos.map((vid, i) => (
//               <Box key={i} mb={3}>
//                 <Typography fontWeight="bold">{vid.title}</Typography>
//                 <Typography>{vid.description}</Typography>
//                 <Box mt={1}>
//                   <iframe
//                     width="100%"
//                     height="315"
//                     src={convertToEmbedUrl(vid.url)}
//                     title={vid.title}
//                     frameBorder="0"
//                     allowFullScreen
//                   ></iframe>
//                 </Box>
//               </Box>
//             ))}

//             {selectedChapterD.pdfs.map((pdf, i) => (
//               <Box key={i} mt={2}>
//                 <Typography fontWeight="bold">{pdf.title}</Typography>
//                 <Typography>{pdf.description}</Typography>
//                 <a href={pdf.url} target="_blank" rel="noopener noreferrer">
//                   📥 Télécharger le PDF
//                 </a>
//               </Box>
//             ))}

//             {/* Boutons IA */}
//             <Box mt={3}>
//               <Button
//                 variant="outlined"
//                 color="success"
//                 onClick={() => navigate("/terminal-d/ia-gratuit")}
//               >
//                 Interroger l'IA (Version gratuite)
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 sx={{ ml: 2 }}
//                 onClick={() => navigate("/terminal-d/ia-premium")}
//               >
//                 Version Premium IA 🚀
//               </Button>
//             </Box>
//           </>
//         ) : (
//           <Typography>Aucun chapitre sélectionné</Typography>
//         )}
//       </Paper>
//     </Grid>
//   </Grid>
// </Box>



// <Box sx={{ width: "100%", mt: 8, mb: 4 }}>
//   <Typography variant="h5" mb={2} fontWeight="bold" color="#2e7d32">
//     Programme Officiel – Terminale A
//   </Typography>

//   <Grid container spacing={3}>
//     {/* 📚 Liste des chapitres */}
//    <Grid item xs={12} md={4}>
//   <Paper
//     sx={{
//       p: 2,
//       backgroundColor: "#e3f2fd",
//       width: "95%",
     
//     }}
//   >
//     <Typography variant="h6" gutterBottom>🗂️ Chapitres</Typography>
//     <List>
//       {chaptersA.map((chap) => (
//         <ListItem disablePadding key={chap._id}>
//           <ListItemButton
//             selected={selectedChapterA?._id === chap._id}
//             onClick={() => setSelectedChapterA(chap)}
//           >
//             <ListItemText primary={`Chapitre ${chap.chapterNumber} : ${chap.title}`} />
//           </ListItemButton>
//         </ListItem>
//       ))}
//     </List>
//   </Paper>
// </Grid>


//     {/* 📄 Contenu du chapitre */}
//     <Grid item xs={12} md={8}>
//       <Paper sx={{ p: 2, backgroundColor: "#fff3e0", width: "100%" }}>
//         {selectedChapterA ? (
//           <>
//             <Typography variant="subtitle2" color="text.secondary">
//               Niveau : {selectedChapterA.level} / Classe : {selectedChapterA.classe} / Série : {selectedChapterA.serie}
//             </Typography>
//             <Typography variant="h6" mt={1} mb={2}>📄 {selectedChapterA.title}</Typography>
//             <Typography mb={2}>{selectedChapterA.description}</Typography>

//             {selectedChapterA.videos.map((vid, i) => (
//               <Box key={i} mb={3}>
//                 <Typography fontWeight="bold">{vid.title}</Typography>
//                 <Typography>{vid.description}</Typography>
//                 <Box mt={1}>
//                   <iframe
//                     width="100%"
//                     height="315"
//                     src={convertToEmbedUrl(vid.url)}
//                     title={vid.title}
//                     frameBorder="0"
//                     allowFullScreen
//                   ></iframe>
//                 </Box>
//               </Box>
//             ))}

//             {selectedChapterA.pdfs.map((pdf, i) => (
//               <Box key={i} mt={2}>
//                 <Typography fontWeight="bold">{pdf.title}</Typography>
//                 <Typography>{pdf.description}</Typography>
//                 <a href={pdf.url} target="_blank" rel="noopener noreferrer">
//                   📥 Télécharger le PDF
//                 </a>
//               </Box>
//             ))}

//             {/* Boutons IA */}
//             <Box mt={3}>
//               <Button
//                 variant="outlined"
//                 color="success"
//                 onClick={() => navigate("/terminal-a/ia-gratuit")}
//               >
//                 Interroger l'IA (Version gratuite)
//               </Button>
//               <Button
//                 variant="contained"
//                 color="secondary"
//                 sx={{ ml: 2 }}
//                 onClick={() => navigate("/terminal-a/ia-premium")}
//               >
//                 Version Premium IA 🚀
//               </Button>
//             </Box>
//           </>
//         ) : (
//           <Typography>Aucun chapitre sélectionné</Typography>
//         )}
//       </Paper>
//     </Grid>
//   </Grid>
// </Box>










//     </PageLayout>
//   );
// };

// export default TerminalDashboard;



