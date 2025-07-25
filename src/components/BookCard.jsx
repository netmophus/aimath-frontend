

// import React, { useState } from "react";
// import {
//   Card,
//   CardMedia,
//   CardContent,
//   Typography,
//   CardActions,
//   Button,
//   Box,
// } from "@mui/material";
// import API from "../api"; // ou ton chemin vers axios
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
// } from "@mui/material";

// const BookCard = ({ book, isPremiumUser = false }) => {
//   const isGratuit = book.badge === "gratuit";
  
//   const [viewerUrl, setViewerUrl] = useState("");
// const [openViewer, setOpenViewer] = useState(false);



// const handleView = async (bookId) => {
//   try {
//     const res = await API.get(`/books/${bookId}/view`);
//     const { viewUrl } = res.data;

//     setViewerUrl(viewUrl);
//     setOpenViewer(true);
//   } catch (err) {
//     console.error("Erreur affichage livre :", err);
//     alert(err.response?.data?.message || "Erreur lors de l'affichage.");
//   }
// };


//   const handleDownload = async (bookId) => {
//     console.log("📥 Début du téléchargement pour le livre :", bookId);
//     try {
//       const res = await API.get(`/books/${bookId}/download`);
//       const { downloadUrl } = res.data;

//       console.log("📦 Lien Cloudinary reçu :", downloadUrl);
//       window.open(downloadUrl, "_blank"); // ✅ téléchargement sans CORS
//     } catch (err) {
//       console.error("❌ Erreur lors du téléchargement :", err.response?.data?.message || err.message);
//       alert(err.response?.data?.message || "Erreur lors du téléchargement");
//     }
//   };

//   return (
//     <>
//       <Card
//         sx={{
//           display: "flex",
//           flexDirection: { xs: "column", sm: "row" },
//           borderRadius: 3,
//           boxShadow: 4,
//           overflow: "hidden",
//           mb: 3,
//         }}
//       >
//         {/* Couverture */}
//         <CardMedia
//           component="img"
//           image={book.coverImage}
//           alt={book.title}
//           sx={{
//             width: { xs: "100%", sm: 180 },
//             height: "auto",
//             objectFit: "cover",
//           }}
//         />

//         {/* Détails */}
//         <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
//           <CardContent sx={{ p: 2 }}>
//             <Typography variant="h6" fontWeight="bold" gutterBottom>
//               📘 {book.title}
//             </Typography>

//             <Typography
//               variant="body2"
//               color="text.secondary"
//               sx={{
//                 mb: 1,
//                 display: "-webkit-box",
//                 WebkitLineClamp: 3,
//                 WebkitBoxOrient: "vertical",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//               }}
//             >
//               {book.description}
//             </Typography>

//             <Typography variant="caption" fontWeight="bold" sx={{ color: "#666" }}>
//               🎓 Niveau : {book.level?.toUpperCase()} | 🎖️ {isGratuit ? "Gratuit" : "Prenuim"}
//             </Typography>

//             <Typography variant="caption" color="text.secondary" display="block" mt={1}>
//               📅 Publié le : {new Date(book.createdAt).toLocaleDateString("fr-FR")}
//             </Typography>
//           </CardContent>

//           {/* Boutons */}
//           <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
//             {(isGratuit || isPremiumUser) && (
//               <>
//                 <Button onClick={() => handleDownload(book._id)} variant="contained">
//                   📥 Télécharger
//                 </Button>
//                <Button
//   variant="outlined"
//   color="primary"
//   onClick={() => handleView(book._id)}
// >
//   📖 Visualiser
// </Button>

//               </>
//             )}
//           </CardActions>
//         </Box>


//         <Dialog open={openViewer} onClose={() => setOpenViewer(false)} maxWidth="lg" fullWidth>
//   <DialogTitle>📕 Aperçu du livre</DialogTitle>
//   <DialogContent dividers>
//     {viewerUrl ? (
//       <iframe
//         src={viewerUrl}
//         title="Aperçu PDF"
//         width="100%"
//         height="600px"
//         style={{ border: "none" }}
//       />
//     ) : (
//       <Typography>Chargement...</Typography>
//     )}
//   </DialogContent>
// </Dialog>

//       </Card>



//     </>
//   );
// };

// export default BookCard;
