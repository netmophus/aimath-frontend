import React, { useContext, useMemo, useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List,
  ListItem, ListItemButton, ListItemText, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../context/AuthContext";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LoginIcon from "@mui/icons-material/Login";

const PLAY_STORE_URL = "https://play.google.com/store/search?q=Fahimta&c=apps";

// ✅ Abonnement actif : isSubscribed === true OU subscriptionEnd > maintenant
const hasActiveSub = (u) =>
  !!u && (u.isSubscribed === true || (u?.subscriptionEnd && new Date(u.subscriptionEnd) > new Date()));

const getSubscriptionLabel = (u) => {
  if (!u?.subscriptionStart || !u?.subscriptionEnd) return "";
  const start = new Date(u.subscriptionStart);
  const end = new Date(u.subscriptionEnd);
  const days = (end - start) / (1000 * 60 * 60 * 24);
  if (days < 40) return "Mensuel";
  if (days > 300) return "Annuel";
  return "Formule spéciale";
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openDrawer, setOpenDrawer] = useState(false);
  const [openPricing, setOpenPricing] = useState(false);
  const openPricingModal = () => setOpenPricing(true);
  const closePricingModal = () => setOpenPricing(false);

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
            <Box display="flex" alignItems="center" gap={1} px={2} py={0.5}
              sx={{ backgroundColor: "#81c784", borderRadius: 2, color: "#0d1117", fontWeight: "bold",
                    transition: "all 0.3s ease", "&:hover": { backgroundColor: "#66bb6a" } }}>
              <PersonAddAltIcon sx={{ fontSize: 24 }} /> Inscription
            </Box>
          ),
          path: "/register",
        },
        {
          label: (
            <Box display="flex" alignItems="center" gap={1} px={2} py={0.5}
              sx={{ backgroundColor: "#90caf9", borderRadius: 2, color: "#0d1117", fontWeight: "bold",
                    transition: "all 0.3s ease", "&:hover": { backgroundColor: "#64b5f6" } }}>
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
      {/* Modal “Souscription via l’app mobile” */}
      <Dialog open={openPricing} onClose={closePricingModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Souscription</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Connectez-vous à votre <strong>application mobile Fahimta</strong> pour vous
            souscrire à votre abonnement.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            L’application mobile Fahimta est <strong>téléchargeable sur le Play Store</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closePricingModal}>Fermer</Button>
          <Button
            variant="contained"
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener"
            onClick={closePricingModal}
          >
            Ouvrir le Play Store
          </Button>
        </DialogActions>
      </Dialog>

      <AppBar position="fixed" sx={{ bgcolor: "#1976D2", boxShadow: "none", zIndex: 1300 }}>
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
    </>
  );
};

export default Navbar;

