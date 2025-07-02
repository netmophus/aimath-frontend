// import React, { useContext } from "react";
// import PageLayout from "../components/PageLayout";
// import { Box, Chip } from "@mui/material";
// import { Typography, Grid, Card, CardContent, CardActions, Button } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";


// const DashboardPage = () => {
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
//   return (
//     <PageLayout>
//       <Typography variant="h4" mt={4}>
//         🎓 Tableau de bord élève
//       </Typography>

//       <Box mt={2} display="flex" alignItems="center" gap={2}>
//         <Typography variant="body1">
//           Bienvenue {user?.phone} !
//         </Typography>

//         {/* ✅ Badge actif / inactif */}
//         {user?.isActive ? (
//           <Chip label="🟢 Compte actif" color="success" />
//         ) : (
//           <Chip label="🔴 Compte inactif" color="error" />
//         )}
//       </Box>


//       {user?.role === "eleve" && (
//   <Box mt={2}>
//     <Typography variant="body1" mt={2}>
//       📊 <strong>Requêtes IA aujourd’hui :</strong> {user.dailyUsage || 0} / 10
//     </Typography>
//     {user.dailyUsage >= 10 && (
//       <Chip label="Limite atteinte" color="error" sx={{ mt: 1 }} />
//     )}
//   </Box>
// )}


//       <Typography variant="body1" mt={2} mb={4}>
//         Bienvenue ! Choisissez un mode d’utilisation.
//       </Typography>

//       <Grid container spacing={3}>
//         {/* Carte exercice gratuit */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 📘 Essayer un exercice
//               </Typography>
//               <Typography variant="body2">
//                 Pose une question mathématique, l'IA te propose une piste ou un rappel de cours.
//               </Typography>
//             </CardContent>
//             <CardActions>
//               <Button variant="outlined" onClick={() => navigate("/exercice-gratuit")}>
//                 Commencer
//               </Button>
//             </CardActions>
//           </Card>
//         </Grid>

//         {/* Carte aide détaillée */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6" gutterBottom>
//                 🔐 Aide détaillée par l’IA
//               </Typography>
//               <Typography variant="body2">
//                 Accède à la résolution complète étape par étape avec explications. Nécessite un compte actif.
//               </Typography>
//             </CardContent>
//             <CardActions>
//               <Button variant="contained" color="primary" onClick={() => navigate("/aide-detaillee")}>
//                 Débloquer
//               </Button>
//             </CardActions>
//           </Card>
//         </Grid>



//         {/* Carte programme Terminale C */}
// <Grid item xs={12} md={6}>
//   <Card>
//     <CardContent>
//       <Typography variant="h6" gutterBottom>
//         📚 Programme Terminale C
//       </Typography>
//       <Typography variant="body2">
//         Consulte le programme officiel de mathématiques pour Terminale C.
//       </Typography>
//     </CardContent>
//     <CardActions>
//       <Button variant="outlined" onClick={() => navigate("/programme-terminal-c")}>
//         Voir le programme
//       </Button>
//     </CardActions>
//   </Card>
// </Grid>

//       </Grid>
//     </PageLayout>
//   );
// };

// export default DashboardPage;
