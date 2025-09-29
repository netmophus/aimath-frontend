
import React, { useContext, useMemo, useState } from "react";



import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List,
  ListItem, ListItemButton, ListItemText, Avatar, Tooltip
} from "@mui/material";

import { Link, useNavigate } from "react-router-dom";
import SchoolIcon from "@mui/icons-material/School";
import MenuIcon from "@mui/icons-material/Menu";
import PremiumBadge from "../components/PremiumBadge";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import { AuthContext } from "../context/AuthContext";

// Lien direct vers l'APK


// ✅ Abonnement actif : isSubscribed === true OU subscriptionEnd > maintenant
const hasActiveSub = (u) =>
  !!u && (u.isSubscribed === true || (u?.subscriptionEnd && new Date(u.subscriptionEnd) > new Date()));



const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openDrawer, setOpenDrawer] = useState(false);





  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const premiumActive = useMemo(() => hasActiveSub(user), [user]);

  // ✅ Menu décidé selon rôle + abonnement (robuste)
  const menuItems = useMemo(() => {

    
    if (!user) {
         return [
        { label: "Nos Prix", path: "/pricing" },
       { label: "Inscription", path: "/register" },
        { label: "Connexion", path: "/login" },
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
        { label: "Nos Prix", path: "/pricing" },
      { label: "Déconnexion", action: handleLogout },
    ];
  }, [user, premiumActive]);

  return (
    <>

















<AppBar
   position="fixed"
   sx={{ bgcolor: "#1976D2", boxShadow: "none" }}
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
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    {/* ✅ Petit badge Premium visible en mobile */}
    {user && premiumActive && (
      <Box sx={{ transform: "scale(0.9)", transformOrigin: "right center" }}>
        <PremiumBadge
          subscriptionEnd={user?.subscriptionEnd}
          onClick={() => navigate("/pricing")}
        />
      </Box>
    )}
    <IconButton onClick={() => setOpenDrawer(true)} sx={{ color: "#FFF" }}>
      <MenuIcon />
    </IconButton>
  </Box>
)}


{/* Cartouche utilisateur desktop + badge */}
{/* Cartouche utilisateur desktop + badge */}
{user && !isSmallScreen && (
  <Box
    display="flex"
    alignItems="center"
    gap={1.25}
    sx={{ backgroundColor: "#1565C0", color: "#FFF", px: 2, py: 1, borderRadius: 2, ml: 2 }}
  >
    <Tooltip title="Profil utilisateur">
      <Avatar sx={{ bgcolor: "#FFB300", width: 40, height: 40 }}>
        {user?.fullName ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"}
      </Avatar>
    </Tooltip>

    <Box mr={1}>
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        {user?.fullName}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
        {user?.phone}
      </Typography>
    </Box>

    {/* ✅ Badge Premium desktop */}
    {premiumActive && (
      <PremiumBadge
        subscriptionEnd={user?.subscriptionEnd}
        onClick={() => navigate("/pricing")}
      />
    )}
  </Box>
)}




        </Toolbar>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer anchor="right" open={openDrawer} onClose={() => setOpenDrawer(false)}>
        {/* Header utilisateur (mobile) */}
{user && (
  <Box sx={{ px: 2, pt: 2, pb: 1.5, display: "flex", alignItems: "center", gap: 1.25 }}>
    <Avatar sx={{ bgcolor: "#FFB300" }}>
      {user?.fullName ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"}
    </Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography noWrap sx={{ fontWeight: 700 }}>
        {user?.fullName}
      </Typography>
      <Typography variant="body2" color="text.secondary" noWrap>
        {user?.phone}
      </Typography>
    </Box>

    {/* ✅ Badge Premium mobile */}
    {premiumActive && (
      <Box sx={{ ml: "auto" }}>
        <PremiumBadge
          subscriptionEnd={user?.subscriptionEnd}
          onClick={() => {
            setOpenDrawer(false);
            navigate("/pricing");
          }}
        />
      </Box>
    )}
  </Box>
)}

        
        
        
        
        
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

