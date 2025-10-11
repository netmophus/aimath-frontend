
import React, { useContext, useMemo, useState } from "react";
// import { Box, Typography, Button, Card, CardContent, Divider } from "@mui/material";
import { Box, Typography, Button, Card, CardContent, Divider, Alert, Stack, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import headerImage from "../assets/head.png";


import AndroidIcon from "@mui/icons-material/Android";


import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import { AuthContext } from "../context/AuthContext";
import DistributeursModal from "../components/DistributeursModal";
import TutorialsModal from "../components/TutorialsModal";




import LanguageIcon from "@mui/icons-material/Language";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import fahimtaMark from "../assets/fahimta.png";

// Nouveaux icônes pour la section Premium
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";



// Toujours la dernière release (asset doit s'appeler exactement "fahimta.apk")
const APK_URL = "https://github.com/netmophus/fahimta-android/releases/latest/download/fahimta.apk";

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
  const [openTutorials, setOpenTutorials] = useState(false);



  const onRegisterClick = () => {
    if (!user) return navigate("/login");
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

// Nouvelle carte pour les fonctionnalités Premium
const PremiumFeatureCard = ({ icon, title, description, isPremium = true }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 3,
      overflow: "hidden",
      background: isPremium 
        ? "linear-gradient(145deg, rgba(255,215,0,0.08) 0%, rgba(255,165,0,0.05) 100%)"
        : "rgba(255,255,255,0.04)",
      border: isPremium 
        ? "2px solid rgba(255,215,0,0.35)"
        : "1px solid rgba(255,255,255,0.12)",
      backdropFilter: "blur(12px)",
      boxShadow: isPremium 
        ? "0 12px 40px rgba(255,215,0,0.15)"
        : "0 8px 24px rgba(0,0,0,0.15)",
      position: "relative",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: isPremium 
          ? "0 16px 50px rgba(255,215,0,0.25)"
          : "0 12px 32px rgba(0,0,0,0.2)",
      }
    }}
  >
    {isPremium && (
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 1,
        }}
      >
        <Chip
          icon={<StarIcon sx={{ fontSize: 16, color: "#FFD700 !important" }} />}
          label="PREMIUM"
          size="small"
          sx={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            color: "#000",
            fontWeight: 900,
            fontSize: 11,
            height: 24,
            "& .MuiChip-icon": { color: "#000" },
          }}
        />
      </Box>
    )}
    
    <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, pt: isPremium ? 4.5 : 2.5 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 1.5,
        }}
      >
        {/* Icône */}
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            background: isPremium
              ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
              : "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
            boxShadow: isPremium
              ? "0 10px 30px rgba(255,215,0,0.4)"
              : "0 8px 24px rgba(59,130,246,0.3)",
          }}
        >
          {icon}
        </Box>

        {/* Titre */}
        <Typography
          variant="h6"
          fontWeight={900}
          sx={{ 
            color: "#fff", 
            letterSpacing: 0.3,
            fontSize: { xs: 17, md: 19 },
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: "rgba(255,255,255,0.9)",
            lineHeight: 1.6,
            fontSize: { xs: 14, md: 15 },
          }}
        >
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
{/* HERO – priorité à la web-app */}
<Box sx={{ position: "relative", mt: 7, overflow: "hidden" }}>
  {/* image d'arrière-plan très légère */}
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
      zIndex: 0,
      filter: "saturate(0.9)",
      pointerEvents: "none",
    }}
  />

  {/* Overlay / contenu */}
  <Box
    sx={{
      position: "relative",
      zIndex: 2,
      
      mx: "auto",
      px: { xs: 2, sm: 3, md: 4 },
      py: { xs: 5, md: 7 },
      width: "100%",
      boxSizing: "border-box",
      background: BRAND_GRADIENT,
      color: "white",
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "1.25fr 1fr" },
      gap: { xs: 3, md: 5 },
      alignItems: "center",
      borderRadius: 2,
    }}
  >
    {/* Colonne texte + CTA */}
    <Box>
   <Stack spacing={0.5} sx={{ mb: 1 }}>
  {/* "My" en style script */}
  <Typography
    variant="h5"
    sx={{
      fontFamily: `'Pacifico', cursive`, // si la police n'est pas dispo, le navigateur utilisera "cursive"
      fontWeight: 700,
      fontSize: { xs: 28, sm: 32, md: 36 },
      lineHeight: 1,
      mb: 0.5,
      textShadow: "0 2px 0 rgba(0,0,0,0.25)",
    }}
  >
    My
  </Typography>

  {/* FAHIMTA look 3D (ombre empilée) */}
  <Typography
    component="h1"
    sx={{
      fontWeight: 900,
      letterSpacing: { xs: 1, md: 2 },
      fontSize: { xs: 40, sm: 56, md: 72 },
      lineHeight: 1,
      color: "#3b82f6",
      textTransform: "uppercase",
      textShadow:
        // couche "3D" (empilement d'ombres pour le relief)
        "0 1px 0 #1e3a8a, 0 2px 0 #1e3a8a, 0 3px 0 #1e3a8a, 0 4px 0 #1e3a8a, " +
        "0 6px 12px rgba(0,0,0,0.35)",
    }}
  >
    FAHIMTA
  </Typography>

  {/* Slogan haoussa */}
  <Typography
    sx={{
      mt: 0.75,
      fontSize: { xs: 16, sm: 18, md: 20 },
      fontWeight: 900,
      color: "rgba(255,255,255,0.95)",
    }}
  >
    Abokin karatun zamani.
  </Typography>
  <Typography
    sx={{
      fontSize: { xs: 16, sm: 18, md: 20 },
      fontWeight: 900,
      color: "rgba(255,255,255,0.95)",
    }}
  >
    Ay zamani cewandika.
  </Typography>
</Stack>

      <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.9)" }}>
        Plateforme <strong>100% responsive</strong> sur téléphone, tablette et
        ordinateur. Un accélérateur de réussite en maths.
      </Typography>

      <Typography sx={{  fontSize: { xs: 16, sm: 18, md: 20 },  color: "rgba(255,255,255,0.9)" }}>
        <strong> votre accélérateur de réussite en maths.</strong>
     </Typography>

      {/* 🎥 BOUTON TUTORIELS - TRÈS VISIBLE */}
      <Box
        sx={{
          mt: 2,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          background: "linear-gradient(135deg, rgba(255,215,0,0.25) 0%, rgba(255,165,0,0.2) 100%)",
          border: "3px solid rgba(255,215,0,0.6)",
          boxShadow: "0 8px 32px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2)",
          animation: "pulse 2s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": {
              boxShadow: "0 8px 32px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2)",
            },
            "50%": {
              boxShadow: "0 8px 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.4)",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, mb: 1 }}>
          <PlayCircleOutlineIcon sx={{ fontSize: { xs: 28, sm: 32 }, color: "#FFD700" }} />
          <Typography
            sx={{
              fontSize: { xs: 16, sm: 18 },
              fontWeight: 900,
              color: "#FFD700",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            NOUVEAU : Tutoriels vidéo disponibles !
          </Typography>
        </Box>
        <Button
          onClick={() => setOpenTutorials(true)}
          variant="contained"
          size="large"
          startIcon={<PlayCircleOutlineIcon sx={{ fontSize: 24 }} />}
          sx={{
            width: "100%",
            px: 3,
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: 16, sm: 18 },
            fontWeight: 900,
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            color: "#000",
            borderRadius: 2,
            boxShadow: "0 6px 24px rgba(255,215,0,0.5)",
            "&:hover": {
              background: "linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)",
              boxShadow: "0 8px 32px rgba(255,215,0,0.7)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          🎥 comment utiliser Fahimta
        </Button>
      </Box>

      {/* boutons principaux */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, mt: 2.5 }}>
        <Button
          startIcon={<LanguageIcon />}
          variant="contained"
          color="primary"
          size="large"
          onClick={onRegisterClick} // login si pas connecté, sinon /gratuit ou /premium
          sx={{
            px: 3,
            py: 1.4,
            fontWeight: 900,
            bgcolor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.35)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
          }}
        >
          Utiliser la web-app
        </Button>

        <Button
          startIcon={<PlayCircleOutlineIcon />}
          variant="contained"
          color="secondary"
          size="large"
          onClick={() => navigate("/gratuit")}
          sx={{ px: 3, py: 1.4, fontWeight: 900 }}
        >
          Essayer gratuitement
        </Button>

        {!premiumActive && (
          <>
            <Button
              startIcon={<LoginIcon />}
              onClick={() => navigate("/login")}
              sx={{
                px: 2.5,
                py: 1.2,
                fontWeight: 800,
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.5)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
              }}
            >
              Se connecter
            </Button>
            <Button
              startIcon={<PersonAddAlt1Icon />}
              onClick={() => navigate("/register")}
              sx={{
                px: 2.5,
                py: 1.2,
                fontWeight: 800,
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.5)",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
              }}
            >
              Créer un compte
            </Button>
          </>
        )}
      </Box>

      {/* mini "preuves"/avantages */}
      <Box
        sx={{
          mt: 2.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          color: "rgba(255,255,255,0.9)",
          fontSize: { xs: 13, sm: 14 },
        }}
      >
        <Box sx={{ px: { xs: 1, sm: 1.5 }, py: { xs: 0.6, sm: 0.75 }, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 1 }}>
          📱 Optimisée mobile
        </Box>
        <Box sx={{ px: { xs: 1, sm: 1.5 }, py: { xs: 0.6, sm: 0.75 }, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 1 }}>
          ⚡ Démarrage instantané
        </Box>
        <Box sx={{ px: { xs: 1, sm: 1.5 }, py: { xs: 0.6, sm: 0.75 }, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 1 }}>
          🔄 Historique synchronisé
        </Box>
        <Box 
          onClick={() => setOpenDist(true)}
          sx={{ 
            px: { xs: 1, sm: 1.5 }, 
            py: { xs: 0.6, sm: 0.75 }, 
            border: "1px solid rgba(255,255,255,0.35)", 
            borderRadius: 1,
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.15)",
              borderColor: "rgba(255,255,255,0.5)",
              transform: "translateY(-1px)"
            }
          }}
        >
          📍 Trouver un distributeur
        </Box>
      </Box>
    </Box>

  {/* Colonne visuelle – version enrichie + image */}
<Card
  elevation={8}
  sx={{
    alignSelf: { md: "start" },            // la carte remonte légèrement
    mt: { xs: 0, md: -1 },
    borderRadius: 3,
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
    border: "1px solid rgba(255,255,255,0.22)",
    backdropFilter: "blur(8px)",
    color: "#fff",
    boxShadow: "0 14px 34px rgba(0,0,0,0.28)",
  }}
>
  <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
    <Stack spacing={1.25}>
      {/* Logo / visuel */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          mb: 0.5,
        }}
      >
        <Box
          component="img"
          alt="Fahimta"
          src={fahimtaMark}
          sx={{
            width: { xs: 120, sm: 140, md: 160 },
            height: "auto",
            filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.35))",
            borderRadius: 1.5,
          }}
        />
      </Box>

      {/* Accroche principale */}
      <Typography
        variant="h6"
        fontWeight={900}
        sx={{
          lineHeight: 1.15,
          fontSize: { xs: 18, sm: 20, md: 22 },
          textShadow: "0 2px 10px rgba(0,0,0,0.25)",
        }}
      >
       Révèle ton potentiel en maths, maintenant.
      </Typography>

      <Typography variant="body2" sx={{ opacity: 0.95 }}>
       Fahimta réunit IA de maths, vidéos claires, livres et rappels de cours,  sujets type BEPC ou BAC corrigés. Encore bloqué ? Passe en Soutien+ : un enseignant en ligne répond à toutes tes questions et te guide pas à pas. Résultat : moins de stress, plus de déclics, de meilleures notes.
      </Typography>

      {/* Message marketing ajouté */}
      <Box
        sx={{
          mt: 0.5,
          p: 1,
          borderRadius: 2,
          background: "rgba(59,130,246,0.12)",
          border: "1px solid rgba(59,130,246,0.28)",
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: 13.5, sm: 16 },
            fontWeight: 700,
            color: "#E6F0FF",
          }}
        >
          Avec Fahimta, vous n'avez plus d'excuse&nbsp;: les mathématiques n'ont plus
          de secret pour vous.
        </Typography>
      </Box>

      {/* Roadmap courte */}
      <Typography
        variant="caption"
        sx={{ mt: 0.25, opacity: 0.9, display: "block" }}
      >
        Bientôt&nbsp;: Physique, Chimie et SVT.
      </Typography>
    </Stack>
  </CardContent>
</Card>

  </Box>
</Box>





{/* ========================================
    NOUVELLE SECTION : DÉBLOQUEZ LE PREMIUM
    ======================================== */}
<Box
  sx={{
    py: { xs: 7, md: 10 },
    background: "linear-gradient(180deg, #0a0e1a 0%, #1a1f35 50%, #0a0e1a 100%)",
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* Effet de lumière dorée en arrière-plan */}
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "800px",
      height: "800px",
      background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)",
      pointerEvents: "none",
      zIndex: 0,
    }}
  />

  <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, position: "relative", zIndex: 1 }}>
    
    {/* En-tête de la section */}
    <Box sx={{ textAlign: "center", mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
        <RocketLaunchIcon sx={{ fontSize: 40, color: "#FFD700" }} />
        <Typography
          variant="h3"
          fontWeight={900}
          sx={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: { xs: 28, sm: 36, md: 44 },
            letterSpacing: 1,
            textShadow: "0 4px 20px rgba(255,215,0,0.3)",
          }}
        >
          Passez à PREMIUM
        </Typography>
      </Box>
      
      <Typography
        variant="h6"
        sx={{
          color: "rgba(255,255,255,0.95)",
          fontWeight: 600,
          fontSize: { xs: 16, md: 18 },
          mb: 1,
        }}
      >
        Débloquez <strong>TOUTES</strong> les fonctionnalités et propulsez votre réussite en maths
      </Typography>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.75)",
          fontSize: { xs: 14, md: 16 },
          maxWidth: 700,
          mx: "auto",
        }}
      >
        Avec le Premium, vous accédez à des outils exclusifs qui transforment votre façon d'apprendre
      </Typography>
    </Box>

    {/* Grille des fonctionnalités Premium */}
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { 
          xs: "1fr", 
          sm: "repeat(2, 1fr)", 
          md: "repeat(4, 1fr)" 
        },
        gap: 3,
        mb: 5,
      }}
    >
      {/* Fonctionnalité 1 : Photo d'exercice */}
      <PremiumFeatureCard
        icon={<CameraAltIcon sx={{ fontSize: 40 }} />}
        title="Photo d'exercice"
        description="Prenez simplement une photo de votre exercice et l'IA le résout instantanément avec explications détaillées, étape par étape."
      />

      {/* Fonctionnalité 2 : Soutien+ */}
      <PremiumFeatureCard
        icon={<HeadsetMicIcon sx={{ fontSize: 40 }} />}
        title="Soutien+ Premium"
        description="Accédez au Soutien+ : discutez avec un enseignant qualifié qui répond à vos questions et vous guide personnellement dans votre apprentissage."
      />

      {/* Fonctionnalité 3 : Cours sur demande */}
      <PremiumFeatureCard
        icon={<MenuBookIcon sx={{ fontSize: 40 }} />}
        title="Cours sur mesure"
        description="Demandez un cours ou une ressource sur un chapitre précis. L'équipe Fahimta vous répond sous 24h en vous fournissant le contenu adapté à votre besoin."
      />

      {/* Fonctionnalité 4 : Accès étendu */}
      <PremiumFeatureCard
        icon={<AllInclusiveIcon sx={{ fontSize: 40 }} />}
        title="Accès complet"
        description="Profitez pleinement de l'IA, de tous les livres, vidéos et examens. Toutes les ressources à portée de main pour accélérer votre réussite en maths."
      />
    </Box>

    {/* Section comparative Gratuit vs Premium */}
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,215,0,0.25)",
        backdropFilter: "blur(12px)",
        mb: 5,
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ 
            color: "#fff", 
            mb: 3, 
            textAlign: "center",
            fontSize: { xs: 20, md: 24 },
          }}
        >
          Ce que vous gagnez avec Premium
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
          }}
        >
          {/* Colonne Gratuit */}
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ 
                color: "rgba(255,255,255,0.6)", 
                mb: 2,
                fontSize: { xs: 16, md: 18 },
              }}
            >
              Version Gratuite
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.5)", mt: 0.2 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                  Questions texte limitées (5/mois)
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.5)", mt: 0.2 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                  Accès restreint aux contenus
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.5)", mt: 0.2 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                  Pas de photo d'exercice
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: "rgba(255,255,255,0.5)", mt: 0.2 }} />
                <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                  Pas de Soutien+ avec prof
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Colonne Premium */}
          <Box
            sx={{
              p: 3,
              borderRadius: 2,
              background: "linear-gradient(145deg, rgba(255,215,0,0.12) 0%, rgba(255,165,0,0.08) 100%)",
              border: "2px solid rgba(255,215,0,0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <StarIcon sx={{ fontSize: 24, color: "#FFD700" }} />
              <Typography
                variant="subtitle1"
                fontWeight={900}
                sx={{ 
                  color: "#FFD700",
                  fontSize: { xs: 16, md: 18 },
                }}
              >
                Version PREMIUM
              </Typography>
            </Box>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <FlashOnIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                  <strong>Questions multipliées</strong> par texte et par photo
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <FlashOnIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                  <strong>PHOTO d'exercice</strong> avec résolution IA
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <FlashOnIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                  <strong>Soutien+ Premium</strong> avec enseignants qualifiés
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <FlashOnIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                  Tous les livres, vidéos, examens <strong>ACCESSIBLES</strong>
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <FlashOnIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                  <strong>Cours personnalisés</strong> sur demande
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                <FlashOnIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                <Typography sx={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
                  Historique complet sauvegardé
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </CardContent>
    </Card>

    {/* Call to Action final */}
    <Box
      sx={{
        textAlign: "center",
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%)",
        border: "2px solid rgba(255,215,0,0.3)",
        boxShadow: "0 12px 40px rgba(255,215,0,0.15)",
      }}
    >
      <Typography
        variant="h4"
        fontWeight={900}
        sx={{
          color: "#fff",
          mb: 2,
          fontSize: { xs: 22, md: 28 },
        }}
      >
        Ne laissez plus les maths vous freiner !
      </Typography>
      
      <Typography
        sx={{
          color: "rgba(255,255,255,0.85)",
          mb: 3,
          fontSize: { xs: 15, md: 17 },
          maxWidth: 600,
          mx: "auto",
        }}
      >
        Rejoignez les milliers d'élèves qui ont transformé leurs résultats en maths grâce à Fahimta Premium
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate(user ? "/premium" : "/login")}
        startIcon={<RocketLaunchIcon />}
        sx={{
          px: 5,
          py: 2,
          fontSize: { xs: 16, md: 18 },
          fontWeight: 900,
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          color: "#000",
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(255,215,0,0.4)",
          "&:hover": {
            background: "linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)",
            boxShadow: "0 12px 40px rgba(255,215,0,0.6)",
            transform: "translateY(-2px)",
          },
          transition: "all 0.3s ease",
        }}
      >
        {user ? "Activer Premium maintenant" : "S'inscrire et passer Premium"}
      </Button>

      <Typography
        sx={{
          mt: 2,
          color: "rgba(255,255,255,0.6)",
          fontSize: 13,
        }}
      >
        🔒 Paiement sécurisé • ⚡ Activation instantanée • 💯 Satisfaction garantie
      </Typography>
    </Box>
  </Box>
</Box>





{/* ========================================
    SECTION : APPLICATION MOBILE ANDROID
    ======================================== */}
<Box
  sx={{
    py: { xs: 5, md: 7 },
    background: "linear-gradient(180deg, #0a0e1a 0%, #152238 100%)",
    position: "relative",
    overflow: "hidden",
  }}
>
  {/* Effet de fond subtil */}
  <Box
    sx={{
      position: "absolute",
      top: 0,
      right: 0,
      width: "600px",
      height: "600px",
      background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
      pointerEvents: "none",
    }}
  />

  <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, position: "relative", zIndex: 1 }}>
    
    {/* En-tête de section */}
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
        <AndroidIcon sx={{ fontSize: 32, color: "#4CAF50" }} />
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{
            color: "#fff",
            fontSize: { xs: 24, sm: 28, md: 32 },
          }}
        >
          Téléchargez l'app mobile
        </Typography>
      </Stack>
      <Typography
        sx={{
          color: "rgba(255,255,255,0.75)",
          fontSize: { xs: 14, md: 16 },
          maxWidth: 600,
          mx: "auto",
        }}
      >
        Installez Fahimta sur votre téléphone Android pour apprendre partout, même hors connexion
      </Typography>
    </Box>

    {/* Carte principale */}
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 4,
            alignItems: "center",
          }}
        >
          {/* Colonne gauche : Infos et CTA */}
          <Box>
            {/* Bouton de téléchargement principal */}
            <Button
              component="a"
              href={APK_URL}
              download
              startIcon={<AndroidIcon sx={{ fontSize: 24 }} />}
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.75,
                fontSize: { xs: 16, md: 18 },
                fontWeight: 900,
                background: "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)",
                color: "#fff",
                borderRadius: 3,
                boxShadow: "0 8px 24px rgba(76,175,80,0.35)",
                mb: 3,
                "&:hover": {
                  background: "linear-gradient(135deg, #45a049 0%, #3d8b40 100%)",
                  boxShadow: "0 12px 32px rgba(76,175,80,0.5)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Télécharger l'APK Android
            </Button>

            {/* Instructions d'installation */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 2,
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                mb: 2,
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ color: "#fff", mb: 1.5, fontSize: { xs: 15, md: 16 } }}
              >
                📱 Installation en 3 étapes simples :
              </Typography>
              
              <Stack spacing={1.25}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 13,
                      color: "#fff",
                    }}
                  >
                    1
                  </Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: { xs: 13.5, md: 14.5 }, flex: 1 }}>
                    Téléchargez le fichier APK et ouvrez-le depuis vos <strong>Téléchargements</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 13,
                      color: "#fff",
                    }}
                  >
                    2
                  </Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: { xs: 13.5, md: 14.5 }, flex: 1 }}>
                    Si un avertissement apparaît : allez dans <strong>Paramètres</strong> → <strong>Autoriser cette source</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Box
                    sx={{
                      minWidth: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 13,
                      color: "#fff",
                    }}
                  >
                    3
                  </Box>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)", fontSize: { xs: 13.5, md: 14.5 }, flex: 1 }}>
                    Revenez en arrière et appuyez sur <strong>Installer</strong>. C'est terminé !
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Note d'information */}
            <Box
              sx={{
                p: 1.75,
                borderRadius: 2,
                background: "rgba(255,193,7,0.08)",
                border: "1px solid rgba(255,193,7,0.2)",
              }}
            >
              <Typography sx={{ color: "rgba(255,255,255,0.85)", fontSize: { xs: 12.5, md: 13.5 }, lineHeight: 1.6 }}>
                ℹ️ <strong>Pourquoi un avertissement ?</strong> C'est normal pour toute app installée hors Google Play Store. 
                Fahimta est <strong>100% sécurisée</strong>. Nous arrivons bientôt sur les stores officiels !
              </Typography>
            </Box>

            {/* Alternative web */}
            <Typography
              sx={{
                mt: 2,
                color: "rgba(255,255,255,0.65)",
                fontSize: { xs: 12, md: 13 },
                fontStyle: "italic",
              }}
            >
              💡 <strong>Astuce :</strong> Vous préférez le web ? Notre plateforme est entièrement responsive sur mobile, tablette et ordinateur !
            </Typography>
          </Box>

          {/* Colonne droite : QR Code */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: "#fff",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                textAlign: "center",
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(APK_URL)}`}
                alt="QR Code pour télécharger l'APK"
                style={{
                  width: "100%",
                  maxWidth: "180px",
                  height: "auto",
                  borderRadius: 8,
                }}
              />
              <Typography
                sx={{
                  mt: 1.5,
                  color: "#1a1a1a",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                📲 Scannez pour télécharger
              </Typography>
            </Box>
            
            <Typography
              sx={{
                mt: 2,
                color: "rgba(255,255,255,0.7)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Utilisez l'appareil photo de votre téléphone
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
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
          description="Pose une question de maths, demande un rappel de cours, ou prends en photo ton exercice : l'IA analyse et résout étape par étape, avec des explications claires et adaptées à ton niveau."
        />
      </Box>

      {/* 2/4 */}
      <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
        <FeatureCard
          accent={["#a78bfa", "#6366f1"]}  // violet
          icon={<ChatBubbleOutlineIcon fontSize="medium" />}
          title="Livres et vidéos classés par niveau"
description="Accède à une bibliothèque de livres et de vidéos du collège à l'université, organisées par niveau et par chapitre pour anticiper, réviser et mieux comprendre tes cours en mathématiques."
        />
      </Box>

      {/* 3/4 */}
      <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
        <FeatureCard
          accent={["#34d399", "#10b981"]}  // vert
          icon={<SchoolRoundedIcon fontSize="medium" />}
          title="Sujets d'examens avec corrections"
          description="Des sujets type et exercices de classe d'examen, corrigés pas à pas, à télécharger pour t'entraîner, prendre de l'avance et monter en puissance en maths."

        />
      </Box>

      {/* 4/4 */}
      <Box sx={{ width: { xs: "100%", md: "calc(50% - 12px)" } }}>
        <FeatureCard
          accent={["#f59e0b", "#ef4444"]}  // amber → red
          icon={<SecurityIcon fontSize="medium" />}
         title="Soutien+ : un prof en ligne"
        description="Pose ton problème et échange en direct, comme sur WhatsApp, avec un enseignant disponible. L'historique des échanges et solutions est sauvegardé dans ton profil pour y revenir à tout moment."

        />
      </Box>
    </Box>
  </Box>
</Box>



      {/* --- Section visuels optimisée --- */}


      {/* Modal distributeurs */}
      <DistributeursModal open={openDist} onClose={() => setOpenDist(false)} />
      
      {/* Modal tutoriels */}
      <TutorialsModal open={openTutorials} onClose={() => setOpenTutorials(false)} />
    </PageLayout>
  );
};

export default HomePage;
