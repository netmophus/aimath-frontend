
import React, { useContext, useMemo, useState, useCallback } from "react";



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




// ✅ Abonnement actif : isSubscribed === true OU subscriptionEnd > maintenant
const hasActiveSub = (u) =>
  !!u && (u.isSubscribed === true || (u?.subscriptionEnd && new Date(u.subscriptionEnd) > new Date()));



const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const [openDrawer, setOpenDrawer] = useState(false);





  const handleLogout = useCallback(() => {
    // Confirmation avant déconnexion pour éviter les déconnexions accidentelles
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  }, [logout, navigate]);

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
        { label: "📚 Bibliothèque", path: "/bibliotheque" },
        { label: "Premium Fahimta", path: "/premium" },
        { label: "Soutien+", path: "/student/support-request" },
        { label: "Messagerie+", path: "/premium/chat" },
        { label: "Déconnexion", action: handleLogout },
      ];
    }

    // 👤 Élève non abonné
    return [
      { label: "📚 Bibliothèque", path: "/bibliotheque" },
      { label: "Gratuit", path: "/gratuit" },
      { label: "💳 Mes cartes", path: "/mes-achats-cartes" },
      { label: "Prix", path: "/pricing" },
      { label: "Déconnexion", action: handleLogout },
    ];
  }, [user, premiumActive, handleLogout]);

  return (
    <>

















<AppBar
   position="fixed"
   sx={{ bgcolor: "#1976D2", boxShadow: "none" }}
>
        <Toolbar sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: { xs: 56, sm: 64, md: 64 }
        }}>
          <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1 }}>
            <SchoolIcon sx={{ 
              mr: { xs: 0.5, sm: 1 }, 
              color: "#FFF",
              fontSize: { xs: 24, sm: 28, md: 32 }
            }} />
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{ 
                color: "#FFF", 
                textDecoration: "none", 
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                letterSpacing: { xs: "0.5px", sm: "1px", md: "1.5px" }
              }}
            >
              FAHIMTA
            </Typography>
          </Box>

          {/* Menu desktop */}
          {!isSmallScreen && (
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 } }}>
              {menuItems.map((item, idx) =>
                item.path ? (
                  <Button 
                    key={idx} 
                    sx={{ 
                      color: "#FFF", 
                      fontSize: { xs: "0.75rem", sm: "0.875rem", md: "0.875rem" },
                      minWidth: "auto",
                      px: { xs: 1, sm: 1.5, md: 2 },
                      textTransform: "uppercase",
                      fontWeight: 600
                    }} 
                    component={Link} 
                    to={item.path}
                  >
                    {item.label}
                  </Button>
                ) : (
                  <Button 
                    key={idx} 
                    sx={{ 
                      color: "#FFF", 
                      fontSize: { xs: "0.75rem", sm: "0.875rem", md: "0.875rem" },
                      minWidth: "auto",
                      px: { xs: 1, sm: 1.5, md: 2 },
                      textTransform: "uppercase",
                      fontWeight: 600
                    }} 
                    onClick={item.action}
                  >
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
    gap={{ xs: 0.75, sm: 1, md: 1.25 }}
    sx={{ 
      backgroundColor: "#1565C0", 
      color: "#FFF", 
      px: { xs: 1, sm: 1.5, md: 2 }, 
      py: 1, 
      borderRadius: 2, 
      ml: { xs: 1, sm: 1.5, md: 2 },
      minWidth: "fit-content"
    }}
  >
    <Tooltip title="Profil utilisateur">
      <Avatar sx={{ 
        bgcolor: "#FFB300", 
        width: { xs: 32, sm: 36, md: 40 }, 
        height: { xs: 32, sm: 36, md: 40 },
        fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" }
      }}>
        {user?.fullName ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase() : "U"}
      </Avatar>
    </Tooltip>

    <Box sx={{ 
      mr: { xs: 0.5, sm: 0.75, md: 1 },
      display: { xs: "none", sm: "block" } // Cache sur très petits écrans
    }}>
      <Typography 
        variant="body1" 
        sx={{ 
          fontWeight: "bold",
          fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
          lineHeight: 1.2
        }}
      >
        {user?.fullName}
      </Typography>
      <Typography 
        variant="body2" 
        sx={{ 
          fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.85rem" },
          lineHeight: 1.2
        }}
      >
        {user?.phone}
      </Typography>
    </Box>

    {/* ✅ Badge Premium desktop */}
    {premiumActive && (
      <Box sx={{ display: { xs: "none", sm: "block" } }}>
        <PremiumBadge
          subscriptionEnd={user?.subscriptionEnd}
          onClick={() => navigate("/pricing")}
        />
      </Box>
    )}
  </Box>
)}




        </Toolbar>
      </AppBar>

      {/* Drawer mobile */}
      <Drawer 
        anchor="right" 
        open={openDrawer} 
        onClose={() => setOpenDrawer(false)}
        // Empêcher la fermeture accidentelle avec le bouton retour
        disableEscapeKeyDown={false}
        ModalProps={{
          keepMounted: true, // Améliore les performances sur mobile
        }}
      >
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

