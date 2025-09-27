
import React, { useContext, useMemo, useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List,
  ListItem, ListItemButton, ListItemText, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import MenuIcon from "@mui/icons-material/Menu";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LoginIcon from "@mui/icons-material/Login";
import AndroidIcon from "@mui/icons-material/Android";


import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";


import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { AuthContext } from "../context/AuthContext";
import DistributeursModal from "../components/DistributeursModal"; // ajuste le chemin si besoin

// Lien direct vers l'APK
const APK_URL =
  "https://github.com/netmophus/fahimta-android/releases/download/v1.0.2/fahimta-v1.0.2.apk";


// ✅ Abonnement actif : isSubscribed === true OU subscriptionEnd > maintenant
const hasActiveSub = (u) =>
  !!u && (u.isSubscribed === true || (u?.subscriptionEnd && new Date(u.subscriptionEnd) > new Date()));



const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openDrawer, setOpenDrawer] = useState(false);

  // Modale "Nos prix / Souscription"
  const [openPricing, setOpenPricing] = useState(false);
  const openPricingModal = () => setOpenPricing(true);
  const closePricingModal = () => setOpenPricing(false);

  // Modale "Inscription"
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const openRegistrationModal = () => setOpenRegisterModal(true);
  const closeRegistrationModal = () => setOpenRegisterModal(false);

  // Modale "Distributeurs"
  const [openDist, setOpenDist] = useState(false);

  const openApkInNewTab = () => {
    window.open(APK_URL, "_blank", "noopener,noreferrer");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const premiumActive = useMemo(() => hasActiveSub(user), [user]);

  // ✅ Menu décidé selon rôle + abonnement (robuste)
  const menuItems = useMemo(() => {
    if (!user) {
      return [
        { label: "Nos Prix", action: openPricingModal },
        {
          label: (
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              px={2}
              py={0.5}
              sx={{
                backgroundColor: "#81c784",
                borderRadius: 2,
                color: "#0d1117",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#66bb6a" },
              }}
            >
              <PersonAddAltIcon sx={{ fontSize: 24 }} /> Inscription
            </Box>
          ),
          action: openRegistrationModal, // ✅ ouvre le modal
        },
        {
          label: (
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              px={2}
              py={0.5}
              sx={{
                backgroundColor: "#90caf9",
                borderRadius: 2,
                color: "#0d1117",
                fontWeight: "bold",
                transition: "all 0.3s ease",
                "&:hover": { backgroundColor: "#64b5f6" },
              }}
            >
              <LoginIcon sx={{ fontSize: 24 }} /> Connexion
            </Box>
          ),
          path: "/login",
        },
      ];
    }

    if (user.role === "admin") {
      return [
        { label: "Tableau de bord", path: "/admin-dashboard" },
        { label: "Déconnexion", action: handleLogout },
      ];
    }
    if (user.role === "teacher") {
      return [
        { label: "Accueil", path: "/" },
        { label: "Tableau de bord", path: "/teacher/dashboard" },
        { label: "Déconnexion", action: handleLogout },
      ];
    }
    if (user.role === "partner") {
      return [
        { label: "Dashboard partenaires", path: "/partner/dashboard" },
        { label: "Déconnexion", action: handleLogout },
      ];
    }

    // 🎯 Élève connecté
    if (premiumActive) {
      // ✅ Abonné (booléen true ou date encore valide)
      return [
        { label: "Premium Fahimta", path: "/premium" },
        { label: "Soutien+", path: "/student/support-request" },
        { label: "Messagerie+", path: "/premium/chat" },
        { label: "Déconnexion", action: handleLogout },
      ];
    }

    // 👤 Élève non abonné
    return [
      { label: "Accueil", path: "/" },
      { label: "Fahimta Gratuit", path: "/gratuit" },
      { label: "Déconnexion", action: handleLogout },
    ];
  }, [user, premiumActive]);

  return (
    <>
      {/* Modal “Souscription via l’app mobile (APK)” */}
     <Dialog
      open={openPricing} 
      onClose={closePricingModal} 
      maxWidth="xs" fullWidth
  sx={{
    // Positionne le conteneur du dialog en haut
    "& .MuiDialog-container": {
      alignItems: "flex-start",
    },
    // Décale légèrement depuis le haut (optionnel)
    "& .MuiPaper-root": {
     mt: { xs: "96px", sm: "104px" },          // try 96–112px if your bar is taller
      maxHeight: "calc(100vh - 112px)",         // 100vh minus that top margin
      overflowY: "auto",
    },
  }}
>


      >
  <DialogTitle sx={{ fontWeight: 800 }}>Souscription</DialogTitle>

  <DialogContent dividers>
    <Typography gutterBottom>
      <strong>Abonnement mensuel : 2 000 FCFA.</strong> Le paiement se fait via
      <strong> NITA</strong> ou <strong>carte à gratter</strong>.
    </Typography>

    <Typography gutterBottom>
      Pour en profiter, <strong>téléchargez l’application mobile FAHIMTA</strong>, installez-la,
      <strong> créez votre compte</strong> puis <strong>faites l’abonnement dans l’app</strong>.
    </Typography>

    <Typography variant="body2" color="text.secondary">
      L’installation se fait via notre <strong>APK officiel</strong>. Si Android affiche un message
      « source inconnue », autorisez l’installation depuis cette source — c’est normal.
    </Typography>
  </DialogContent>

  {/* Ligne du haut : Fermer + Télécharger */}
  <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
    <Button onClick={closePricingModal}>Fermer</Button>

    <Button
      variant="contained"
      color="success"
      startIcon={<AndroidIcon />}
      onClick={() => {
        window.open(APK_URL, "_blank", "noopener,noreferrer");
        closePricingModal();
      }}
      sx={{ fontWeight: 700 }}
    >
      Télécharger l’APK
    </Button>
  </DialogActions>

  {/* En dessous : bouton distributeurs en pleine largeur */}
  <Box sx={{ px: 3, pb: 3 }}>
    <Button
      variant="outlined"
      fullWidth
      startIcon={<StorefrontRoundedIcon />}
      onClick={() => {
        setOpenDist(true);
        closePricingModal();
      }}
      sx={{
        py: 1.1,
        fontWeight: 700,
        borderRadius: 2,
        color: "primary.main",
        borderColor: "rgba(25,118,210,0.4)",
        backgroundColor: "rgba(25,118,210,0.06)",
        "&:hover": {
          borderColor: "primary.main",
          backgroundColor: "rgba(25,118,210,0.12)",
        },
      }}
    >
      Voir nos distributeurs
    </Button>
  </Box>
</Dialog>


      {/* Modal “Inscription depuis l’app mobile (APK)” */}
      

<Dialog 
open={openRegisterModal} 
onClose={closeRegistrationModal} 
maxWidth="xs" fullWidth
  sx={{
    "& .MuiDialog-container": {
      alignItems: "flex-start",                 // stick to the top
    },
    "& .MuiPaper-root": {
      // leave clear space for the AppBar + breathing room
      mt: { xs: "96px", sm: "104px" },          // try 96–112px if your bar is taller
      maxHeight: "calc(100vh - 112px)",         // 100vh minus that top margin
      overflowY: "auto",
      borderRadius: 2,
    },
  }}
>
  <DialogTitle sx={{ fontWeight: 700 }}>Inscription depuis l’app mobile</DialogTitle>

  <DialogContent dividers>
    <Typography gutterBottom>
      Pour créer votre compte, téléchargez l’application <strong>FAHIMTA</strong> (APK),
      puis faites l’inscription directement dans l’app.
    </Typography>
    {/* Lien APK supprimé comme demandé */}
  </DialogContent>

  <DialogActions
    sx={{
      px: 3,
      py: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 1.5,
      flexWrap: { xs: "wrap", sm: "nowrap" },
    }}
  >
    {/* Gauche : Plus tard + Télécharger sur la même ligne */}
    <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
      <Button
        type="button"
        onClick={closeRegistrationModal}
        sx={{
          px: 2.4,
          py: 1.1,
          fontWeight: 700,
          borderRadius: 2,
          bgcolor: "rgba(2,12,27,0.05)",
          color: "text.primary",
          border: "1px solid rgba(2,12,27,0.10)",
          "&:hover": {
            bgcolor: "rgba(2,12,27,0.09)",
            borderColor: "rgba(2,12,27,0.18)",
          },
        }}
      >
        Plus tard
      </Button>

      <Button
        type="button"
        variant="contained"
        startIcon={<AndroidIcon />}
        onClick={() => {
          openApkInNewTab();
          closeRegistrationModal();
        }}
        sx={{
          px: 2.8,
          py: 1.15,
          fontWeight: 800,
          borderRadius: 2,
          letterSpacing: 0.2,
          color: "#fff",
          background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
          boxShadow: "0 10px 24px rgba(33,150,83,0.35)",
          "&:hover": {
            background: "linear-gradient(135deg, #2a6f2d 0%, #174f1b 100%)",
            boxShadow: "0 12px 28px rgba(33,150,83,0.45)",
          },
        }}
      >
        Télécharger
      </Button>
    </Box>

    
  </DialogActions>
</Dialog>



























      {/* Barre de navigation */}
      {/* <AppBar position="fixed" sx={{ bgcolor: "#1976D2", boxShadow: "none", zIndex: 1300 }}> */}


      <AppBar
  position="fixed"
  sx={{
    bgcolor: "#1976D2",
    boxShadow: "none",
    zIndex: (t) => t.zIndex.modal + 2, // <-- au-dessus de tous les overlays
  }}
>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <SchoolIcon sx={{ mr: 1, color: "#FFF" }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ color: "#FFF", textDecoration: "none", fontWeight: "bold" }}
            >
              FAHIMTA
            </Typography>
          </Box>

          {/* Menu desktop */}
          {!isSmallScreen && (
            <Box>
              {menuItems.map((item, idx) =>
                item.path ? (
                  <Button key={idx} sx={{ color: "#FFF" }} component={Link} to={item.path}>
                    {item.label}
                  </Button>
                ) : (
                  <Button key={idx} sx={{ color: "#FFF" }} onClick={item.action}>
                    {item.label}
                  </Button>
                )
              )}
            </Box>
          )}

          {/* Burger mobile */}
          {isSmallScreen && (
            <IconButton onClick={() => setOpenDrawer(true)} sx={{ color: "#FFF" }}>
              <MenuIcon />
            </IconButton>
          )}

          {/* Cartouche utilisateur desktop */}
          {user && !isSmallScreen && (
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ backgroundColor: "#1565C0", color: "#FFF", px: 2, py: 1, borderRadius: 2, ml: 2 }}
            >
              <Tooltip title="Profil utilisateur">
                <Avatar sx={{ bgcolor: "#FFB300", width: 40, height: 40 }}>
                  {user.fullName ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"}
                </Avatar>
              </Tooltip>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                  {user.fullName}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  {user.phone}
                </Typography>
              </Box>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        <List sx={{ width: 250 }}>
          {menuItems.map((item, idx) =>
            item.path ? (
              <ListItem key={idx} disablePadding>
                <ListItemButton component={Link} to={item.path} onClick={() => setOpenDrawer(false)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ) : (
              <ListItem key={idx} disablePadding>
                <ListItemButton
                  onClick={() => {
                    item.action();
                    setOpenDrawer(false);
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )
          )}
        </List>
      </Drawer>

      {/* Modale des distributeurs (affichée depuis les boutons) */}
      <DistributeursModal open={openDist} onClose={() => setOpenDist(false)} />
    </>
  );
};

export default Navbar;
