


// import React from "react";
// import {
//   Typography,
//   Box,
//   Button,
//   Grid,
//   Paper,
//   Container,
// } from "@mui/material";
// import { Link } from "react-router-dom";
// import PageLayout from "../components/PageLayout";
// import fahimtaImg from "../assets/fahimtaallier.jpg"; // ✅ import de l'image
// import fahimtaImg2 from "../assets/fahimtaallier2.jpg";

// import fahimtaImg3 from "../assets/fahimtaallier3.jpg";
// import fahimtaImg4 from "../assets/fahimtaallier4.jpg";


// const HomePage = () => {
//   return (
//     <PageLayout>
//       <Box sx={{ backgroundColor: "#ECEFF1"  }}>

// <Box
//   display="flex"
//   flexDirection={{ xs: "column", md: "row" }}
//   alignItems="center"
//   justifyContent="center"
//   gap={4}
//  mt={8}
//   mb={2}

// >
//   {/* Image 1 */}
//   <Box flex="1" display="flex" justifyContent="center">
//     <img
//       src={fahimtaImg}
//       alt="Fahimta 1"
//       style={{
//         width: "100%",
//         maxWidth: "500px",
//         borderRadius: "10px",
//         boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//       }}
//     />
//   </Box>

//   {/* Image 2 */}
//   <Box flex="1" display="flex" justifyContent="center">
//     <img
//       src={fahimtaImg2}
//       alt="Fahimta 2"
//       style={{
//         width: "100%",
//         maxWidth: "500px",
//         borderRadius: "10px",
//         boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//       }}
//     />
//   </Box>
// </Box>

// {/* ✅ Ligne 2 : 2 images */}
// <Box
//   display="flex"
//   flexDirection={{ xs: "column", md: "row" }}
//   alignItems="center"
//   justifyContent="center"
//   gap={4}
//   mb={6}
// >
//   {/* Image 3 */}
//   <Box flex="1" display="flex" justifyContent="center">
//     <img
//       src={fahimtaImg3}
//       alt="Fahimta 3"
//       style={{
//         width: "100%",
//         maxWidth: "500px",
//         borderRadius: "10px",
//         boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//       }}
//     />
//   </Box>

//   {/* Image 4 */}
//   <Box flex="1" display="flex" justifyContent="center">
//     <img
//       src={fahimtaImg4}
//       alt="Fahimta 4"
//       style={{
//         width: "100%",
//         maxWidth: "500px",
//         borderRadius: "10px",
//         boxShadow: "0 0 10px rgba(0,0,0,0.1)",
//       }}
//     />
//   </Box>
// </Box>



//         {/* ✅ Pourquoi utiliser AI Math */}
// <Grid container spacing={3} justifyContent="center" mt={5}>
//   {[
//     {
//       title: "Résolution IA",
//       description: "Photo de ton exercice, solution immédiate étape par étape.",
//       icon: "⚡️",
//       borderColor: "#1976D2",
//       iconBg: "#1976D2"
//     },
//     {
//       title: "Explications claires",
//       description: "Pose une question, reçois une réponse pédagogique et simple.",
//       icon: "📘",
//       borderColor: "#673ab7",
//       iconBg: "#673ab7"
//     },
//     {
//       title: "Programmes officiels",
//       description: "Du collège à l’université, FAHIMTA suit ton niveau scolaire.",
//       icon: "🎓",
//       borderColor: "#388e3c",
//       iconBg: "#388e3c"
//     },
//     {
//       title: "Guidance personnalisée",
//       description: "Progresser à ton rythme avec des conseils sur mesure.",
//       icon: "💡",
//       borderColor: "#fb8c00",
//       iconBg: "#fb8c00"
//     },
//   ].map((item, index) => (
//     <Grid item xs={12} sm={6} md={6} key={index}  sx={{ mt: index >= 2 ? 8 : 0 }}>
//       <Paper
//         elevation={4}
//         sx={{
//           p: 3,
//           borderRadius: 3,
//           height: "100%",
//           backgroundColor: "#111", // fond sombre
//           color: "white",
//           border: `3px solid ${item.borderColor}`,
//           textAlign: "center",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
         
//           transition: "transform 0.3s ease, box-shadow 0.3s ease",
//           "&:hover": {
//             transform: "translateY(-6px)",
//             boxShadow: 6,
//           },
//         }}
//       >
//         <Box
//           sx={{
//             width: 50,
//             height: 50,
//             borderRadius: "50%",
//             backgroundColor: item.iconBg,
//             color: "white",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: "1.5rem",
//             mx: "auto",
           
//           }}
//         >
//           {item.icon}
//         </Box>

//         <Typography variant="h6" fontWeight="bold" mb={1}>
//           {item.title}
//         </Typography>

//         <Typography variant="body2" mb={3}>
//           {item.description}
//         </Typography>

//         <Button
//           variant="contained"
//           size="small"
//           sx={{
//             backgroundColor: item.iconBg,
//             color: "#fff",
//             borderRadius: 10,
//             px: 4,
//             "&:hover": {
//               backgroundColor: item.iconBg,
//               opacity: 0.9,
//             },
//           }}
//         >
//           Découvrir
//         </Button>
//       </Paper>
//     </Grid>
//   ))}
// </Grid>





     
//     <Box
//   mt={15}
  
//  padding={3}
//  paddingLeft={2}
//   sx={{
//     width: "80%",
//     backgroundColor: "#e3f2fd",
//     borderRadius: 3,
//     border: "2px solid #1976d2",
//     textAlign: "center",
//   }}
// >
//   <Typography variant="h5" fontWeight="bold" gutterBottom>
//     🎓 Allez-vous inscrire et profitez de tous les avantages de <span style={{ color: "#1976d2" }}>FAHIMTA</span> !
//   </Typography>

//   <Typography variant="h6" fontWeight="bold" mb={2}>
//     🔍 Consultez les offres, découvrez nos prix, et commencez dès maintenant.
//   </Typography>

//   <Box mt={3} display="flex" justifyContent="center" gap={2} flexWrap="wrap">
//     <Button variant="contained" size="large">
//       Voir les tarifs
//     </Button>
//     <Button variant="outlined" size="large">
//       S'inscrire maintenant
//     </Button>
//   </Box>
// </Box>


//       </Box>
//     </PageLayout>
//   );
// };

// export default HomePage;





import React from "react";
import { Box, Typography, Button } from "@mui/material";
import PageLayout from "../components/PageLayout";
import fahimtaImg from "../assets/fahimtaallier.jpg";
import fahimtaImg2 from "../assets/fahimtaallier2.jpg";
import fahimtaImg3 from "../assets/fahimtaallier3.jpg";
import fahimtaImg4 from "../assets/fahimtaallier4.jpg";
import aiBackground from "../assets/video.mp4"; // ✅ Ta vidéo IA ici

const HomePage = () => {
  const images = [
    { src: fahimtaImg, alt: "Fahimta 1" },
    { src: fahimtaImg2, alt: "Fahimta 2" },
    { src: fahimtaImg3, alt: "Fahimta 3" },
    { src: fahimtaImg4, alt: "Fahimta 4" },
  ];

  return (
    <PageLayout>
      {/* ✅ Bannière vidéo IA */}
    <Box
  sx={{
    position: "relative",
    height: { xs: "auto", md: "auto" }, // auto pour laisser la place aux cartes
    overflow: "hidden",
  }}
>
  {/* 🎥 Vidéo en fond */}
  <video
    autoPlay
    loop
    muted
    playsInline
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1,
    }}
  >
    <source src={aiBackground} type="video/mp4" />
    Votre navigateur ne supporte pas la lecture vidéo.
  </video>

  {/* 🧾 Overlay + contenu + cartes */}
  <Box
    sx={{
      position: "relative",
      zIndex: 2,
      width: "100%",
      backgroundColor: "rgba(0,0,0,0.6)",
      color: "white",
      display: "flex",
      mt:5,
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      textAlign: "center",
      px: 2,
      py: 6,
    }}
  >


<Typography
  variant="h2"
  fontWeight="bold"
  mb={2}
  sx={{
    fontSize: { xs: "1.4rem", md: "2rem" },
    textAlign: "center",
  }}
>
  Offre Spéciale pour les Nouveaux Inscrits
</Typography>

<Typography
  variant="h2"
  mb={3}
  sx={{
    fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.2rem" },
    fontWeight: 500,
    textAlign: "center",
    maxWidth: 800,
  }}
>
  Téléchargez gratuitement des livres et des annales en mathématiques.
</Typography>

<Button
  variant="contained"
  size="large"
  color="warning"
  href="/register"
  sx={{
    mb: 4,
    fontSize: { xs: "0.9rem", md: "1rem" },
    px: 4,
    py: 1.2,
  }}
>
  S’inscrire maintenant
</Button>


    {/* ✅ Cartes colorées */}
   
<Box
  sx={{
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
    justifyContent: "center",
    gap: 2,
    width: "100%",
    maxWidth: 900,
    px: 2,
  }}
>


  
  <Box
    sx={{
      backgroundColor: "#42A5F5",
      color: "white",
      borderRadius: 2,
      p: 2,
      boxShadow: 3,
      mx: "auto",
      width: "100%",
      maxWidth: 350, // ✅ largeur max de chaque carte
    }}
  >
    <Typography variant="h6" fontWeight="bold">📘 Livres</Typography>
    <Typography variant="body2">Accédez à des manuels numériques gratuitement.</Typography>
  </Box>

  <Box
    sx={{
      backgroundColor: "#66BB6A",
      color: "white",
      borderRadius: 2,
      p: 2,
      boxShadow: 3,
      mx: "auto",
      width: "100%",
      maxWidth: 350,
    }}
  >
    <Typography variant="h6" fontWeight="bold">📄 Annales</Typography>
    <Typography variant="body2">Sujets d'examen corrigés des années passées.</Typography>
  </Box>

  <Box
    sx={{
      backgroundColor: "#FFB74D",
      color: "#000",
      borderRadius: 2,
      p: 2,
      boxShadow: 3,
      mx: "auto",
      width: "100%",
      maxWidth: 350,
    }}
  >
    <Typography variant="h6" fontWeight="bold">🎓 Cours ciblés</Typography>
    <Typography variant="body2">Contenus pédagogiques adaptés à votre niveau.</Typography>
  </Box>

  <Box
    sx={{
      backgroundColor: "#AB47BC",
      color: "white",
      borderRadius: 2,
      p: 2,
      boxShadow: 3,
      mx: "auto",
      width: "100%",
      maxWidth: 350,
    }}
  >
    <Typography variant="h6" fontWeight="bold">🤖 IA personnalisée</Typography>
    <Typography variant="body2">Un accompagnement intelligent pour réussir.</Typography>
  </Box>
</Box>



  </Box>
</Box>


      {/* ✅ Section images */}
      <Box sx={{ backgroundColor: "#ECEFF1", py: 8 }}>
        {[0, 2].map((startIndex) => (
          <Box
            key={startIndex}
            display="flex"
            flexDirection={{ xs: "column", md: "row" }}
            justifyContent="center"
            alignItems="center"
            gap={3}
            mb={6}
            px={2}
            mt={4}
          >
            {[0, 1].map((offset) => {
              const img = images[startIndex + offset];
              return (
                <Box
                  key={img.alt}
                  flex="1"
                  display="flex"
                  justifyContent="center"
                  maxWidth={{ xs: "100%", md: "50%" }}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    style={{
                      width: "100%",
                      maxWidth: "500px",
                      borderRadius: "10px",
                      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </PageLayout>
  );
};

export default HomePage;
