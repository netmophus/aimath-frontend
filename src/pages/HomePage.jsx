
import React, { useContext, useMemo, useState } from "react";
// import { Box, Typography, Button, Card, CardContent, Divider } from "@mui/material";
import { Box, Typography, Button, Card, CardContent, Divider, Alert, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import fahimtaImg from "../assets/fahimtaallier.jpg";
import fahimtaImg2 from "../assets/fahimtaallier2.jpg";
import fahimtaImg3 from "../assets/fahimtaallier3.jpg";
import fahimtaImg4 from "../assets/fahimtaallier4.jpg";
import headerImage from "../assets/head.png";

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AndroidIcon from "@mui/icons-material/Android";


import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import { AuthContext } from "../context/AuthContext";
import DistributeursModal from "../components/DistributeursModal";

// 👉 remplace par ton lien d’APK
const APK_URL = "https://github.com/netmophus/fahimta-android/releases/download/v1.0.2/fahimta-v1.0.2.apk";

// Abonnement actif: booléen true OU date de fin future
const hasActiveSub = (u) =>
  !!u && (u.isSubscribed === true || (u?.subscriptionEnd && new Date(u.subscriptionEnd) > new Date()));

// en haut du fichier, ajoute une constante pour le dégradé
const BRAND_GRADIENT =
  "linear-gradient(145deg, #0b3f8a 0%, #0f66c7 55%, #18a4e0 100%)";

const HomePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const premiumActive = useMemo(() => hasActiveSub(user), [user]);
  const [openDist, setOpenDist] = useState(false);

  const images = [
    { src: fahimtaImg, alt: "Fahimta 1" },
    { src: fahimtaImg2, alt: "Fahimta 2" },
    { src: fahimtaImg3, alt: "Fahimta 3" },
    { src: fahimtaImg4, alt: "Fahimta 4" },
  ];

  const onRegisterClick = () => {
    if (!user) return navigate("/register");
    return navigate(premiumActive ? "/premium" : "/gratuit");
  };



// Remplace ta définition actuelle de FeatureCard par celle-ci
const FeatureCard = ({ icon, title, description, accent = ["#22d3ee", "#3b82f6"] }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 2,
      overflow: "hidden",
      background: "rgba(255,255,255,0.06)",          // verre
      border: "1px solid rgba(255,255,255,0.18)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 10px 30px rgba(2,15,46,0.25)",
    }}
  >
    <CardContent
      sx={{
        p: { xs: 2.5, md: 3 },
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
      }}
    >
      <Box
        sx={{
          p: 1.2,
          borderRadius: 2,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`,
          boxShadow: `0 8px 24px ${accent[1]}40`,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography
          variant="subtitle1"
          fontWeight={800}
          sx={{ color: "#fff", mb: 0.5, letterSpacing: 0.2 }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
          {description}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);


  return (
    <PageLayout>
      {/* Bandeau */}
   

{/* Bandeau */}
<Box sx={{ position: "relative", height: "auto", mt:3, overflow: "hidden" }}>
  {/* fond image très léger */}
  {/* <Box
    component="img"
    src={headerImage}
    alt="IA background"
    sx={{
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      opacity: 0.06,            // un peu plus discret
      zIndex: 1,
      filter: "saturate(0.9)",
    }}


  /> */}


  <Box
  component="img"
  src={headerImage}
  alt="IA background"
  sx={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.06,
    zIndex: 0,              // <-- bien en dessous
    filter: "saturate(0.9)",
    pointerEvents: "none",  // <-- ne capte aucun clic
  }}
/>

  {/* Overlay thématisé (remplace le fond noir) */}
  <Box
    sx={{
    position: "relative",
    zIndex: 2,
    // <<< anti-overflow + centrage >>>
    maxWidth: 1200,
    mx: "auto",
    px: { xs: 2, sm: 3, md: 4 },
    py: { xs: 4, md: 6 },
    width: "100%",
    boxSizing: "border-box",

     background: BRAND_GRADIENT,
    color: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  }}
  >
    <Card
      elevation={8}
      sx={{
        width: "100%",
        maxWidth: 980,
        borderRadius: 2.5,
        overflow: "hidden",
        // “glass”
        backgroundColor: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(8px)",
        color: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Typography variant="h5" fontWeight={800} sx={{ mb: 1, textAlign: "left", letterSpacing: 0.3 }}>
          Télécharger l’application Android (APK)
        </Typography>

        <Typography variant="body2" sx={{ opacity: 0.95, mb: 2, textAlign: "left" }}>
          Installez FAHIMTA rapidement : téléchargez l’APK ou scannez le QR avec votre téléphone Android.
        </Typography>

        {/* Avertissement */}
        <Alert
          severity="info"
          icon={false}
          sx={{
            textAlign: "left",
            mb: 2,
            bgcolor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.22)",
            color: "#fff",
          }}
        >
          <strong>À savoir :</strong> comme l’APK ne vient pas d’une boutique officielle, Android peut afficher un
          message « <em>application potentiellement dangereuse</em> » / « <em>autoriser cette source</em> ».  
          C’est <strong>normal</strong>. Autorisez <em>l’installation depuis cette source</em> puis appuyez sur
          <strong> Installer</strong>.
        </Alert>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.18)", my: 2 }} />

        {/* grille boutons + QR */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr" },
            gap: 2.5,
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "stretch", sm: "flex-start" }, gap: 1.5 }}>
            <Button
              component="a"
              href={APK_URL}
              download
              startIcon={<AndroidIcon />}
              variant="contained"
              color="success"
              size="large"
              sx={{
                px: 3,
                py: 1.4,
                fontWeight: 800,
                alignSelf: { xs: "stretch", sm: "flex-start" },
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              }}
            >
              Télécharger l’APK
            </Button>

            {!premiumActive && (
              <Button
                variant="contained"
                onClick={onRegisterClick}
                sx={{
                  px: 3,
                  py: 1.2,
                  fontWeight: 700,
                  alignSelf: { xs: "stretch", sm: "flex-start" },
                  bgcolor: "#ff9800",
                  "&:hover": { bgcolor: "#fb8c00" },
                }}
              >
                S’inscrire maintenant
              </Button>
            )}

            <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.95, textAlign: "left" }}>
              1ʳᵉ installation : si Android le demande, autoriser l’« installation depuis cette source ».
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.20)",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                width: 260,
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(APK_URL)}`}
                alt="QR de téléchargement"
                style={{ width: "100%", height: "auto", borderRadius: 8 }}
              />
              <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.95 }}>
                Scannez avec l’appareil photo pour installer
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>

    {/* Bouton distributeurs */}
    <Box sx={{ mt: 2.5 }}>
      <Button
        variant="outlined"
        size="large"
        startIcon={<StorefrontRoundedIcon />}
        onClick={() => setOpenDist(true)}
        sx={{
          borderColor: "rgba(255,255,255,0.7)",
          color: "#fff",
          px: 3,
          py: 1.2,
          "&:hover": {
            borderColor: "#fff",
            backgroundColor: "rgba(255,255,255,0.12)",
          },
        }}
      >
        Voir la liste des distributeurs
      </Button>
    </Box>
  </Box>
</Box>










{/* Section pourquoi / 2x2 cartes (flex, sans Grid) en thème moderne */}
<Box
  sx={{
    // Dégradé moderne sombre
    background:
      "radial-gradient(1200px 600px at 10% -20%, #1b3b7a 0%, #0e1f47 40%), linear-gradient(180deg, #0c1431 0%, #090d1f 100%)",
    py: { xs: 6, md: 8 },
  }}
>
  <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
    <Typography
      variant="h6"
      fontWeight={800}
      sx={{
        mb: 3,
        color: "#fff",
        letterSpacing: 0.3,
        textShadow: "0 2px 18px rgba(0,0,0,0.4)",
      }}
    >
      Pourquoi FAHIMTA ?
    </Typography>

    {/* conteneur en flex-wrap 2×2 */}
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        alignItems: "stretch",
      }}
    >
      {/* 1/4 */}
      <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
        <FeatureCard
          accent={["#22d3ee", "#3b82f6"]}  // cyan → blue
          icon={<AutoAwesomeIcon fontSize="medium" />}
          title="Utilisez Fahimta AI - Notre intelligence artificielle"
          description="Pose une question de maths, demande un rappel de cours, ou prends en photo ton exercice : l’IA analyse et résout étape par étape, avec des explications claires et adaptées à ton niveau."
        />
      </Box>

      {/* 2/4 */}
      <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
        <FeatureCard
          accent={["#a78bfa", "#6366f1"]}  // violet
          icon={<ChatBubbleOutlineIcon fontSize="medium" />}
          title="Livres et vidéos classés par niveau"
description="Accède à une bibliothèque de livres et de vidéos du collège à l’université, organisées par niveau et par chapitre pour anticiper, réviser et mieux comprendre tes cours en mathématiques."
        />
      </Box>

      {/* 3/4 */}
      <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
        <FeatureCard
          accent={["#34d399", "#10b981"]}  // vert
          icon={<SchoolRoundedIcon fontSize="medium" />}
          title="Sujets d’examens avec corrections"
          description="Des sujets type et exercices de classe d’examen, corrigés pas à pas, à télécharger pour t’entraîner, prendre de l’avance et monter en puissance en maths."

        />
      </Box>

      {/* 4/4 */}
      <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
        <FeatureCard
          accent={["#f59e0b", "#ef4444"]}  // amber → red
          icon={<SecurityIcon fontSize="medium" />}
         title="Soutien+ : un prof en ligne"
        description="Pose ton problème et échange en direct, comme sur WhatsApp, avec un enseignant disponible. L’historique des échanges et solutions est sauvegardé dans ton profil pour y revenir à tout moment."

        />
      </Box>
    </Box>
  </Box>
</Box>



      {/* --- Section visuels optimisée --- */}


      {/* Modal distributeurs */}
      <DistributeursModal open={openDist} onClose={() => setOpenDist(false)} />
    </PageLayout>
  );
};

export default HomePage;
