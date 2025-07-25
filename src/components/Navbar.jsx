
import React, { useContext, useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../context/AuthContext";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt"; // Pour inscription
import LoginIcon from "@mui/icons-material/Login"; // Pour connexion
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";



const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  console.log("🔍 user dans Navbar :", user);

  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(false);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };



let menuItems = [];

if (!user) {
  // 🔓 Visiteur non connecté
  menuItems = [
    { label: "Nos Prix", path: "/pricing" },
    // { label: "Inscription", path: "/register" },
    // { label: "Connexion", path: "/login" },

  {
  label: (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={2}
      py={0.5}
      sx={{
        backgroundColor: "#81c784", // vert clair professionnel
        borderRadius: 2,
        color: "#0d1117",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "#66bb6a", // effet au survol
        },
      }}
    >
      <PersonAddAltIcon sx={{ fontSize: 24 }} />
      Inscription
    </Box>
  ),
  path: "/register",
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
        backgroundColor: "#90caf9", // bleu clair pro
        borderRadius: 2,
        color: "#0d1117",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: "#64b5f6", // plus foncé au survol
        },
      }}
    >
      <LoginIcon sx={{ fontSize: 24 }} />
      Connexion
    </Box>
  ),
  path: "/login",
}

  ];
} else if (user.role === "admin") {
  // 🛠️ Admin connecté
  menuItems = [
    { label: "Tableau de bord", path: "/admin-dashboard" },
    { label: "Déconnexion", action: handleLogout },
  ];
} else if (user.role === "teacher") {
  // 👨‍🏫 Enseignant connecté
  menuItems = [
    { label: "Accueil", path: "/" },
    { label: "Tableau de bord", path: "/teacher/dashboard" },
    { label: "Nos Prix", path: "/pricing" },
    { label: "Fahimta Gratuit", path: "/gratuit" },
    { label: "Déconnexion", action: handleLogout },
  ];
} else if (!user.isSubscribed) {
  // 👤 Connecté mais non abonné
  menuItems = [
    { label: "Accueil", path: "/" },
    { label: "Nos Prix", path: "/pricing" },
    { label: "Fahimta Gratuit", path: "/gratuit" },
    { label: "Déconnexion", action: handleLogout },
  ];
} else if (user.isSubscribed) {
  // 🌟 Abonné premium
  menuItems = [
    { label: "Premium Fahimta", path: "/premium" },
    { label: "Soutien+", path: "/student/support-request" },
    { label: "Messagerie+", path: "/premium/chat" },
    { label: "Déconnexion", action: handleLogout },
  ];
}



const getSubscriptionLabel = () => {
  if (!user?.subscriptionStart || !user?.subscriptionEnd) return "";

  const start = new Date(user.subscriptionStart);
  const end = new Date(user.subscriptionEnd);
  const diff = end.getTime() - start.getTime();
  const days = diff / (1000 * 60 * 60 * 24);

  if (days < 40) return "Mensuel";
  if (days > 300) return "Annuel";
  return "Formule spéciale";
};

  return (
    <>
<AppBar
  position="fixed"
  sx={{
    bgcolor: "#1976D2", // 💙 même couleur que le footer
    boxShadow: "none",
    zIndex: 1300,
  }}
>
  <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>

<Box display="flex" alignItems="center" gap={1}>
  <SchoolIcon sx={{ mr: 1, color: "#FFF" }} />
  <Typography
    variant="h6"
    component={Link}
    to="/"
    sx={{
      color: "#FFF",
      textDecoration: "none",
      fontWeight: "bold",
    }}
  >
    FAHIMTA
  </Typography>

  {/* ✅ Badge Premium */}
{user?.isSubscribed && (
  <Box
    sx={{
      bgcolor: "#FFD700",
      color: "#000",
      px: 1,
      py: 0.2,
      borderRadius: "8px",
      fontSize: "0.75rem",
      fontWeight: "bold",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    }}
  >
    <Typography fontSize="0.75rem" fontWeight="bold">
      PREMIUM ({getSubscriptionLabel()})
    </Typography>
    <Typography fontSize="0.65rem">
      Expire le {new Date(user.subscriptionEnd).toLocaleDateString()}
    </Typography>
  </Box>
)}

</Box>


    {/* 🌐 Menu pour grands écrans */}
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

    {/* 🍔 Menu pour petits écrans */}
    {isSmallScreen && (
      <IconButton onClick={() => setOpenDrawer(true)} sx={{ color: "#FFF" }}>
        <MenuIcon />
      </IconButton>
    )}


{user && !isSmallScreen && (
  <Box
    display="flex"
    alignItems="center"
    gap={1}
    sx={{
      backgroundColor: "#1565C0",
      color: "#FFF",
      px: 2,
      py: 1,
      borderRadius: 2,
      mr: 2,
    }}
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


      {/* 🧭 Drawer pour petits écrans */}
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
