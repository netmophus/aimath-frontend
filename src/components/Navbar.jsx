
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

 const getDashboardLink = () => {
  if (!user) return "/";
  if (user.role === "admin") return "/admin-dashboard";
  if (user.role === "eleve") {
    const level = user.classLevel?.toLowerCase();
    if (level?.includes("terminale")) return "/dashboard/terminale";
    if (level?.includes("premiere")) return "/dashboard/premiere";
    if (level?.includes("seconde")) return "/dashboard/seconde";
    if (level?.includes("troisieme")) return "/dashboard/troisieme";
    return "/mon-compte";
  }
  return "/mon-compte";
};

  // 👉 Menu items
let menuItems = [];

if (!user) {
  // 🔓 Visiteur non connecté
  menuItems = [
    { label: "Nos Prix", path: "/pricing" },
    { label: "Inscription", path: "/register" },
    { label: "Connexion", path: "/login" },
  ];
} else if (user && !user.isSubscribed) {
  // 👤 Connecté mais non abonné
  menuItems = [
    { label: "Accueil", path: "/" },
    { label: "Nos Prix", path: "/pricing" },
    { label: "Fahimta Gratuit", path: "/gratuit" },
    { label: "Déconnexion", action: handleLogout },
  ];
} else if (user && user.isSubscribed) {
  // 🌟 Connecté + Abonné premium
  menuItems = [
    { label: "Premium Fahimta", path: "/premium" },
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
