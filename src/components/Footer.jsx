// import React from "react";
// import { Box, Typography, Grid, Link as MuiLink } from "@mui/material";
// import { Link } from "react-router-dom";

// const Footer = () => {
//   return (
//     <Box sx={{ bgcolor: "#1976D2",  pt: 4, pb: 3 }}>
//       <Grid
//         container
//         spacing={4}
//         justifyContent="center"
//         alignItems="center"
//         textAlign="center"
//       >
//         {/* ✅ Texte à la place du logo */}
//         <Grid item xs={12} md={4}>
//           <Typography
//             variant="h4"
//             fontWeight="bold"
//             color="white"
//             gutterBottom
//           >
//             FAHIMTA
//           </Typography>
//           <Typography variant="body2" color="#e0f2f1">
//             L'IA au service des élèves du collège et du lycée.
//           </Typography>
//         </Grid>

//         {/* ✅ Liens utiles */}
//         <Grid item xs={12} md={4}>
//           <Typography variant="h6" gutterBottom sx={{ color: "#e0f2f1" }}>
//             Liens utiles
//           </Typography>
//           <Box>
//             <MuiLink component={Link} to="/" underline="hover" sx={{ color: "#ffffff" }}>
//               Accueil
//             </MuiLink>
//             <br />
//             <MuiLink component={Link} to="/register" underline="hover" sx={{ color: "#ffffff" }}>
//               Inscription
//             </MuiLink>
//             <br />
//             <MuiLink component={Link} to="/login" underline="hover" sx={{ color: "#ffffff" }}>
//               Connexion
//             </MuiLink>
//           </Box>
//         </Grid>

//         {/* ✅ Vision ou slogan */}
//         <Grid item xs={12} md={4}>
//           <Typography variant="h6" gutterBottom sx={{ color: "#e0f2f1" }}>
//             Notre vision
//           </Typography>
//           <Typography variant="body2" color="#e0f2f1">
//             Simplifier l’apprentissage des mathématiques grâce à l’intelligence artificielle.
//           </Typography>
//         </Grid>
//       </Grid>

//       {/* ✅ Copyright */}
//       <Box textAlign="center" mt={4}>
//         <Typography variant="body2" color="#e0f2f1">
//           © {new Date().getFullYear()} FAHIMTA – Tous droits réservés.
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// export default Footer;




import React from "react";
import {
  Box,
  Typography,
  Grid,
  Link as MuiLink,
  IconButton,
  Stack,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#0d47a1",
        color: "#ffffff",
        px: { xs: 3, sm: 6 },
        pt: 6,
        pb: 4,
      }}
    >
      <Grid
        container
        spacing={4}
        justifyContent="center"
        alignItems="flex-start"
      >
        {/* Bloc 1 */}
        <Grid item xs={12} sm={4}>
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              FAHIMTA
            </Typography>
            <Typography variant="body2" sx={{ color: "#bbdefb", maxWidth: 300 }}>
              L’IA éducative pour simplifier les mathématiques du collège à l'université.
            </Typography>
          </Box>
        </Grid>

        {/* Séparateur vertical */}
        {!isMobile && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{ bgcolor: "#ffffff", mx: 2 }}
          />
        )}

        {/* Bloc 2 */}
        <Grid item xs={12} sm={3}>
          <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Navigation
            </Typography>
            <Stack spacing={1}>
              <MuiLink component={Link} to="/" sx={{ color: "#ffffff" }}>
                Accueil
              </MuiLink>
             <MuiLink
  href="https://www.softlink-groupe.com"
  target="_blank"
  rel="noopener noreferrer"
  sx={{ color: "#ffffff" }}
>
  Softlink Tecnologies
</MuiLink>
              <MuiLink component={Link} to="/login" sx={{ color: "#ffffff" }}>
                Connexion
              </MuiLink>
            </Stack>
          </Box>
        </Grid>

        {/* Séparateur vertical */}
        {!isMobile && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{ bgcolor: "#ffffff", mx: 2 }}
          />
        )}

        {/* Bloc 3 */}
      <Grid item xs={12} sm={4}>
  <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Contact
    </Typography>
   <Typography variant="body2" sx={{ color: "#bbdefb", mb: 1 }}>
  📞 +22780648383 
  <br />
  📧 contact@softlink-groupe.com  
  <br />
  📍 Niamey, Niger
</Typography>


    {/* Réseaux sociaux stylisés */}
    <Stack
      direction="row"
      spacing={1.5}
      justifyContent={{ xs: "center", sm: "flex-start" }}
      mt={2}
    >
      <IconButton
        href="https://www.facebook.com/profile.php?id=61581495210190"
        target="_blank"
        sx={{
          color: "#fff",
          backgroundColor: "#FFA000",
          "&:hover": {
            backgroundColor: "#2d4373",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
        }}
      >
        <FacebookIcon />
      </IconButton>

      <IconButton
        href="https://www.youtube.com/@softlink-technologies"
        target="_blank"
        sx={{
          color: "#fff",
          backgroundColor: "#FF0000",
          "&:hover": {
            backgroundColor: "#cc0000",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
        }}
      >
        <YouTubeIcon />
      </IconButton>

      <IconButton
        href="https://x.com/MyFahimta"
        target="_blank"
        sx={{
          color: "#fff",
          backgroundColor: "#1DA1F2",
          "&:hover": {
            backgroundColor: "#0d8ddb",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
        }}
      >
        <TwitterIcon />
      </IconButton>

      <IconButton
        href="https://www.linkedin.com/in/my-fahimta-49500a371/"
        target="_blank"
        sx={{
          color: "#fff",
          backgroundColor: "#0077B5",
          "&:hover": {
            backgroundColor: "#005582",
            transform: "scale(1.1)",
          },
          transition: "all 0.3s ease",
        }}
      >
        <LinkedInIcon />
      </IconButton>
    </Stack>
  </Box>
</Grid>

      </Grid>

      {/* Bandeau final */}
      <Box mt={5} textAlign="center">
        <Typography variant="body2" sx={{ color: "#bbdefb" }}>
          © {new Date().getFullYear()} <strong>FAHIMTA</strong> — Tous droits réservés.
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
