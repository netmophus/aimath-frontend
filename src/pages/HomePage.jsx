
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import PageLayout from "../components/PageLayout";
import fahimtaImg from "../assets/fahimtaallier.jpg";
import fahimtaImg2 from "../assets/fahimtaallier2.jpg";
import fahimtaImg3 from "../assets/fahimtaallier3.jpg";
import fahimtaImg4 from "../assets/fahimtaallier4.jpg";
import headerImage from "../assets/head.png"; // Ton image IA


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
  
  <Box
  component="img"
  src={headerImage}
  alt="IA background"
  sx={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.1, // ✅ Opacité
    zIndex: 1,
  }}
/>


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
