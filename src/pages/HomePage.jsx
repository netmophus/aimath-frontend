
import React, { useContext, useMemo, useState } from "react";
// import { Box, Typography, Button, Card, CardContent, Divider } from "@mui/material";
import { Box, Typography, Button, Card, CardContent, Divider, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/PageLayout";
import headerImage from "../assets/head.png";

import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import AndroidIcon from "@mui/icons-material/Android";


import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";

import { AuthContext } from "../context/AuthContext";
import DistributeursModal from "../components/DistributeursModal";




import LanguageIcon from "@mui/icons-material/Language";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";



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


  return (
    <PageLayout>
      {/* Bandeau */}
   

{/* Bandeau */}
{/* HERO – priorité à la web-app */}
<Box sx={{ position: "relative", mt: 7, overflow: "hidden" }}>
  {/* image d’arrière-plan très légère */}
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
      <Typography variant="h3" fontWeight={900} sx={{ lineHeight: 1.1 }}>
       FAHIMTA 
      </Typography>
      <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.9)" }}>
        Plateforme <strong>100% responsive</strong> sur téléphone, tablette et
        ordinateur. Pose tes questions, révise, entraîne-toi, et retrouve ton
        historique n’importe où.
      </Typography>

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

      {/* mini “preuves”/avantages */}
      <Box
        sx={{
          mt: 2.5,
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          color: "rgba(255,255,255,0.9)",
          fontSize: 14,
        }}
      >
        <Box sx={{ px: 1, py: 0.5, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 1 }}>
          📱 Optimisée mobile
        </Box>
        <Box sx={{ px: 1, py: 0.5, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 1 }}>
          ⚡ Démarrage instantané
        </Box>
        <Box sx={{ px: 1, py: 0.5, border: "1px solid rgba(255,255,255,0.25)", borderRadius: 1 }}>
          🔄 Historique synchronisé
        </Box>
      </Box>
    </Box>

    {/* Colonne visuelle (garde la carte “verre” pour le look) */}
    <Card
      elevation={8}
      sx={{
        borderRadius: 2.5,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.22)",
        backdropFilter: "blur(8px)",
        color: "#fff",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <Typography variant="h6" fontWeight={800}>
          Résous, révise, progresse.
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95, mt: 0.5 }}>
          IA de maths, livres et vidéos, sujets corrigés, et soutien+ avec un enseignant.
        </Typography>
      </CardContent>
    </Card>
  </Box>
</Box>





{/* Section téléchargement APK (en bas) */}
{/* Section téléchargement APK — look moderne & compact */}
<Box
  sx={{
    py: { xs: 4, md: 6 },
    background:
      "radial-gradient(900px 400px at 8% -10%, #173066 0%, #0c1431 45%) , linear-gradient(180deg, #0c1431 0%, #0b3f8a 100%)",
    color: "#fff",
  }}
>
  <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3, md: 4 } }}>
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        {/* En-tête */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          color={"white"}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={900}
              sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }}
            >
              Installer l’app Android (APK)
            </Typography>
            <Typography sx={{ mt: 0.5, opacity: 0.9, fontSize: { xs: 13, sm: 14 } }}>
              Téléchargez l’APK ou scannez le QR. Vous pouvez aussi utiliser la version web.
            </Typography>
          </Box>

          {/* CTA principal */}
          <Button
            component="a"
            href={APK_URL}
            download
            startIcon={<AndroidIcon />}
            variant="contained"
            color="success"
            size="medium"
            sx={{
              px: 2.25,
              py: 1,
              fontWeight: 900,
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              borderRadius: 2,
            }}
          >
            Télécharger l’APK
          </Button>
        </Stack>

        {/* Zone contenu : Infos + QR */}
        <Box
          sx={{
            mt: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr auto" },
            gap: 1.75,
            alignItems: "center",
          }}
        >
          {/* Colonne gauche : notice courte & étapes */}
          <Box>
            {/* Notice stylée (remplace l’Alert) */}
            <Box
              sx={{
                p: 1.25,
                borderRadius: 2,
                background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06))",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <Typography sx={{ fontSize: { xs: 12.5, sm: 13.5 }, lineHeight: 1.55 , color:'#fff'}}>
                <strong>À l’installation de l’APK sur votre téléphone Android</strong>, il est possible
                de voir <em>« application potentiellement dangereuse »</em> ou
                <em> « autoriser cette source »</em>. C’est <strong>normal</strong> pour toute application
                installée via un fichier APK (hors boutique officielle). Notre arrivée sur les stores
                publics est <strong>en cours</strong>.
              </Typography>

              <Stack
                component="ol"
                sx={{
                  mt: 1,
                  mb: 0,
                  pl: 2.25,
                  "& li": { mb: 0.25, fontSize: { xs: 12.5, sm: 13.5 } },
                  color:'#fff'
                }}
                spacing={0.25}
              >
                <li>Téléchargez l’APK et ouvrez-le depuis vos <em>Téléchargements</em>.</li>
                <li>Si un avertissement s’affiche : <em>Paramètres</em> → <em>Autoriser cette source</em> (une fois).</li>
                <li>Revenez à l’écran précédent puis touchez <strong>Installer</strong>.</li>
              </Stack>

              <Typography sx={{ mt: 1, fontSize: { xs: 12.5, sm: 13.5 }, color:'#fff' }}>
                Astuce : la <strong>version web</strong> de FAHIMTA est
                entièrement responsive (mobile, tablette, ordinateur).
              </Typography>
            </Box>

            {/* Légende d’installation */}
            <Typography
              variant="caption"
              sx={{ display: "block", mt: 0.75, opacity: 0.9 , color:'#fff'}}
            >
              1ʳᵉ installation : Android peut demander d’« autoriser cette source ».
            </Typography>
          </Box>

          {/* Colonne droite : QR très compact */}
          <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", sm: "center" } }}>
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 2,
                p: 1.1,
                textAlign: "center",
                width: { xs: 138, sm: 150 }, // QR plus petit et responsive
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  APK_URL
                )}`}
                alt="QR de téléchargement de l’APK"
                style={{ width: "100%", height: "auto", borderRadius: 6 }}
              />
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 0.5, opacity: 0.95, fontSize: 11.5 , color:'#fff'}}
              >
                Scannez pour installer
              </Typography>
            </Box>
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
