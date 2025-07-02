// import React, { useContext } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//   Box,
//   Typography,
//   Chip,
//   Grid,
//   Card,
//   CardContent,
//   CardActions,
//   Button
// } from "@mui/material";
// import PageLayout from "../components/PageLayout";
// import { AuthContext } from "../context/AuthContext";

// const StudentDashboard = () => {
//   const { level, classe } = useParams();
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();

//   const encodedClasse = decodeURIComponent(classe);

//   return (
//     <PageLayout>
//       <Box sx={{ mt: 4, px: 2 }}>
//         <Typography variant="h4" gutterBottom>
//           🎓 Tableau de bord — {level.toUpperCase()} / {encodedClasse}
//         </Typography>

//         {/* Infos utilisateur */}
//         <Box mt={2} display="flex" alignItems="center" gap={2} flexWrap="wrap">
//           <Typography variant="body1">
//             Bienvenue <strong>{user?.fullName || user?.phone}</strong>
//           </Typography>

//           {user?.isActive ? (
//             <Chip label="🟢 Compte actif" color="success" />
//           ) : (
//             <Chip label="🔴 Compte inactif" color="error" />
//           )}

//           <Chip
//             label={`⚡ Utilisation IA : ${user?.dailyUsage || 0} / 10`}
//             color={user?.dailyUsage >= 10 ? "error" : "default"}
//           />
//         </Box>

//         {/* Message introductif */}
//         <Typography variant="body1" mt={4} mb={2}>
//           Que souhaites-tu faire aujourd’hui ?
//         </Typography>

//         {/* Grille des actions */}
//         <Grid container spacing={3}>
//           {/* 📘 Exercice gratuit */}
//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   📘 Essayer un exercice
//                 </Typography>
//                 <Typography variant="body2">
//                   Pose une question de maths, l'IA te propose une piste ou un rappel de cours.
//                 </Typography>
//               </CardContent>
//               <CardActions>
//                 <Button variant="outlined" onClick={() => navigate("/exercice-gratuit")}>
//                   Commencer
//                 </Button>
//               </CardActions>
//             </Card>
//           </Grid>

//           {/* 🔐 Aide détaillée */}
//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   🔐 Aide détaillée par l’IA
//                 </Typography>
//                 <Typography variant="body2">
//                   Résolution complète avec explication étape par étape. Nécessite un compte actif.
//                 </Typography>
//               </CardContent>
//               <CardActions>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={() => navigate("/aide-detaillee")}
//                 >
//                   Débloquer
//                 </Button>
//               </CardActions>
//             </Card>
//           </Grid>

//           {/* 📚 Programme Terminale C */}
//           <Grid item xs={12} md={6}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   📚 Programme Terminale C
//                 </Typography>
//                 <Typography variant="body2">
//                   Consulte le programme officiel de mathématiques.
//                 </Typography>
//               </CardContent>
//               <CardActions>
//                 <Button variant="outlined" onClick={() => navigate("/programme-terminal-c")}>
//                   Voir le programme
//                 </Button>
//               </CardActions>
//             </Card>
//           </Grid>
//         </Grid>
//       </Box>
//     </PageLayout>
//   );
// };

// export default StudentDashboard;





import React, { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Link
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import { AuthContext } from "../context/AuthContext";

const StudentDashboard = () => {
  // const { level, classe } = useParams();
  const { classLevel } = useParams();

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

   const readableClass = classLevel.toUpperCase().replace("-", " "); // "terminale-c" => "TERMINALE C"

  // const encodedClasse = decodeURIComponent(classe);

  const videosGratuites = [
    {
      title: "Cours sur les suites numériques – Introduction",
      url: "https://www.youtube.com/watch?v=2dpwE0hYZ9Q"
    },
    {
      title: "Exercice corrigé : suites arithmétiques",
      url: "https://www.youtube.com/watch?v=Yv8loE9C5Hk"
    },
    {
      title: "Méthode de récurrence expliquée",
      url: "https://www.youtube.com/watch?v=Y6K71Qx0yZ4"
    }
  ];

  return (
    <PageLayout>
      <Box sx={{ mt: 4, px: 2 }}>
        <Typography variant="h4" gutterBottom>
          {/* 🎓 Tableau de bord — {level.toUpperCase()} / {encodedClasse} */}
          <Typography variant="h4" gutterBottom>
  🎓 Tableau de bord — {readableClass}
</Typography>


        </Typography>

        {/* Infos utilisateur */}
        <Box mt={2} display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography variant="body1">
            Bienvenue <strong>{user?.fullName || user?.phone}</strong>
          </Typography>
          {user?.isActive ? (
            <Chip label="🟢 Compte actif" color="success" />
          ) : (
            <Chip label="🔴 Compte inactif" color="error" />
          )}
          <Chip
            label={`⚡ Utilisation IA : ${user?.dailyUsage || 0} / 10`}
            color={user?.dailyUsage >= 10 ? "error" : "default"}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* 🟢 Partie gratuite */}
        <Typography variant="h5" gutterBottom>
          🆓 Accès gratuit – Commence dès maintenant
        </Typography>

        <Typography variant="body1" color="text.secondary" mb={3}>
          Profite gratuitement d'un aperçu de nos outils d’apprentissage avec un exercice libre et 3 vidéos pédagogiques. Pour une expérience complète, pense à activer ton compte 👇
        </Typography>

        <Grid container spacing={3}>
          {/* Exercice gratuit */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📘 Essayer un exercice
                </Typography>
                <Typography variant="body2">
                  Pose une question de maths, l'IA te propose une piste ou un rappel de cours.
                </Typography>
              </CardContent>
              <CardActions>
                <Button variant="outlined" onClick={() => navigate("/exercice-gratuit")}>
                  Commencer
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Vidéos gratuites */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎥 Vidéos gratuites – Chapitre 1
                </Typography>
                <ul style={{ paddingLeft: "1rem" }}>
                  {videosGratuites.map((video, index) => (
                    <li key={index}>
                      <Link
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        {video.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* ⚠️ Message incitatif */}
        <Box mt={4}>
          <Typography variant="body2" color="text.secondary">
            🔓 <strong>Débloque l’accès complet</strong> pour bénéficier des résolutions détaillées, du programme officiel Terminale C, et de bien plus !
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* 🔐 Partie complète */}
        <Typography variant="h5" gutterBottom>
          🔐 Accès complet – Pour aller plus loin
        </Typography>

        <Grid container spacing={3}>
          {/* Aide détaillée */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🧠 Aide détaillée par l’IA
                </Typography>
                <Typography variant="body2">
                  Accède à la résolution complète étape par étape avec explications précises.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/aide-detaillee")}
                  disabled={!user?.isActive}
                >
                  Accéder
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Programme Terminale C */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📚 Programme Terminale C
                </Typography>
                <Typography variant="body2">
                  Consulte l’intégralité du programme officiel de mathématiques et accède à des exercices par chapitre.
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  disabled={!user?.isActive}
                  onClick={() => navigate("/programme-terminal-c")}
                >
                  Voir le programme
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default StudentDashboard;
