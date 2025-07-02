import React from "react";
import { Box, Typography, Grid, Link as MuiLink } from "@mui/material";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "#1976D2",  pt: 4, pb: 3 }}>
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="center"
        textAlign="center"
      >
        {/* ✅ Texte à la place du logo */}
        <Grid item xs={12} md={4}>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="white"
            gutterBottom
          >
            FAHIMTA
          </Typography>
          <Typography variant="body2" color="#e0f2f1">
            L'IA au service des élèves du collège et du lycée.
          </Typography>
        </Grid>

        {/* ✅ Liens utiles */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom sx={{ color: "#e0f2f1" }}>
            Liens utiles
          </Typography>
          <Box>
            <MuiLink component={Link} to="/" underline="hover" sx={{ color: "#ffffff" }}>
              Accueil
            </MuiLink>
            <br />
            <MuiLink component={Link} to="/register" underline="hover" sx={{ color: "#ffffff" }}>
              Inscription
            </MuiLink>
            <br />
            <MuiLink component={Link} to="/login" underline="hover" sx={{ color: "#ffffff" }}>
              Connexion
            </MuiLink>
          </Box>
        </Grid>

        {/* ✅ Vision ou slogan */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom sx={{ color: "#e0f2f1" }}>
            Notre vision
          </Typography>
          <Typography variant="body2" color="#e0f2f1">
            Simplifier l’apprentissage des mathématiques grâce à l’intelligence artificielle.
          </Typography>
        </Grid>
      </Grid>

      {/* ✅ Copyright */}
      <Box textAlign="center" mt={4}>
        <Typography variant="body2" color="#e0f2f1">
          © {new Date().getFullYear()} FAHIMTA – Tous droits réservés.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
