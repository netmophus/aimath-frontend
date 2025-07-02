// import React, { useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Box,
//   Select,
//   MenuItem,
//   InputLabel,
//   FormControl,
//   Grid,
//   useMediaQuery,
//   Paper
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import { useNavigate } from "react-router-dom";
// import API from "../api";
// import fahimtaImg from "../assets/logo.png";

// const RegisterForm = () => {
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [classLevel, setClassLevel] = useState("");
//   const [message, setMessage] = useState("");

//   const navigate = useNavigate();
//   const theme = useTheme();
//   const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     try {
//       await API.post("/auth/register", { phone, password, classLevel });
//       setMessage("✅ Inscription réussie. Un code vous a été envoyé par SMS.");

//       setTimeout(() => {
//         navigate("/verify", { state: { phone } });
//       }, 1000);
//     } catch (err) {
//       setMessage(err.response?.data?.message || "❌ Erreur lors de l'inscription.");
//     }
//   };

//   return (
//     <Grid
//       container
//       justifyContent="center"
//       alignItems="center"
//       spacing={4}
//       sx={{ minHeight: "85vh", mt: 2 }}
//     >
//       {/* 📷 Logo à gauche ou au-dessus */}
//       <Grid item xs={12} md={4} textAlign="center">
//         <img src={fahimtaImg} alt="Fahimta" style={{ width: isSmallScreen ? 100 : 160 }} />
//       </Grid>

//       {/* 📝 Formulaire encadré */}
//       <Grid item xs={12} md={5}>
//         <Paper elevation={4} sx={{ borderRadius: 3, p: 4, backgroundColor: "#f9f9f9" }}>
//           <Box component="form" onSubmit={handleRegister}>
//             <Typography variant="h5" mb={2} fontWeight="bold" textAlign="center">
//               📝 Inscription
//             </Typography>

//             <TextField
//               fullWidth
//               label="Téléphone"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value)}
//               margin="normal"
//               required
//             />

//             <TextField
//               fullWidth
//               label="Mot de passe"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               margin="normal"
//               required
//             />

//             <FormControl fullWidth margin="normal" required>
//               <InputLabel>Niveau scolaire</InputLabel>
//               <Select
//                 value={classLevel}
//                 label="Niveau scolaire"
//                 onChange={(e) => setClassLevel(e.target.value)}
//               >
//                 {[
//                   "6eme", "5eme", "4eme", "3eme",
//                   "seconde-a", "seconde-c",
//                   "premiere-a", "premiere-c", "premiere-d",
//                   "terminale-a", "terminale-c", "terminale-d",
//                 ].map((niveau) => (
//                   <MenuItem key={niveau} value={niveau}>
//                     {niveau.toUpperCase().replace("-", " ")}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             <Button variant="contained" type="submit" sx={{ mt: 2 }} fullWidth>
//               S'inscrire
//             </Button>

//             {message && (
//               <Typography color="secondary" sx={{ mt: 2 }} textAlign="center">
//                 {message}
//               </Typography>
//             )}
//           </Box>
//         </Paper>
//       </Grid>
//     </Grid>
//   );
// };

// export default RegisterForm;



import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import API from "../api";
import fahimtaImg from "../assets/logocc.jpg";

const RegisterForm = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

const [fullName, setFullName] = useState("");
const [schoolName, setSchoolName] = useState("");
const [city, setCity] = useState("");



  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await API.post("/auth/register", {
        phone,
        password,
        fullName,
        schoolName,
        city,
      });

      setMessage("✅ Inscription réussie. Un code vous a été envoyé par SMS.");

      setTimeout(() => {
        navigate("/verify", { state: { phone } });
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Erreur lors de l'inscription.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 128px)", // Hauteur entre navbar et footer
     
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "4fr 6fr" },
        padding: 0,
        margin: 0,
      }}
    >
      {/* Partie gauche : logo + texte */}
      <Box
        sx={{
          px: 4,
          py: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
                 backgroundColor: "#ECEFF1",
        }}
      >
        <img
          src={fahimtaImg}
          alt="Logo Fahimta"
          style={{ width: 220, height: "auto", marginBottom: 16 }}
        />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
         Les maths simplifiées 
        </Typography>
        <Typography variant="body1" color="text.secondary" maxWidth={300}>
        Votre alliée numérique pour briller en mathématiques, du collège à l’université.
        </Typography>
      </Box>

      {/* Partie droite : formulaire */}
    <Box
  sx={{
    px: 2,
    py: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D27C19",
  }}
>
  <Paper elevation={4} sx={{ borderRadius: 3, p: 4, width: "100%", maxWidth: 600 }}>
    <Box component="form" onSubmit={handleRegister}>
      <Typography variant="h5" mb={2} fontWeight="bold" textAlign="center">
        📝 Inscription
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          label="Téléphone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          margin="normal"
          required
          fullWidth
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          fullWidth
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
        />

        <TextField
          label="Nom complet"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          margin="normal"
          required
          fullWidth
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
        />
        <TextField
          label="École"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          margin="normal"
          required
          fullWidth
          sx={{ flex: { xs: "1 1 100%", sm: "1 1 48%" } }}
        />

        <TextField
          label="Ville"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          margin="normal"
          required
          fullWidth
          sx={{ flex: "1 1 100%" }}
        />
      </Box>

      <Button variant="contained" type="submit" sx={{ mt: 3 }} fullWidth>
        S'inscrire
      </Button>

      {message && (
        <Typography color="secondary" sx={{ mt: 2 }} textAlign="center">
          {message}
        </Typography>
      )}
    </Box>
  </Paper>
</Box>

    </Box>
  );
};

export default RegisterForm;
