// import React, { useState } from "react";
// import { Tabs, Tab, Box } from "@mui/material";
// import PageLayout from "../../components/PageLayout";
// import RechargeCodeForm from "../../components/RechargeCodeForm"; // ton form existant
// import BookForm from "../../components/BookForm"; // nouveau
// import ChapterForm from "../../components/ChapterForm"; // nouveau

// import QrCodeIcon from "@mui/icons-material/QrCode";
// import MenuBookIcon from "@mui/icons-material/MenuBook";
// import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";

// const AdminDashboardPage = () => {
//   const [tab, setTab] = useState(0);

//   const handleChange = (event, newValue) => {
//     setTab(newValue);
//   };

//   return (
//     <PageLayout>
    
// <Tabs
//   value={tab}
//   onChange={handleChange}
//   centered
//   textColor="inherit"
//   TabIndicatorProps={{
//     style: { backgroundColor: "#1976d2", height: 4, borderRadius: 2 },
//   }}
//   sx={{
//     mb: 3,
//     backgroundColor: "#f5f5f5",
//     borderRadius: 2,
//     px: 2,
//     boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
//   }}
// >
//   <Tab
//     icon={<QrCodeIcon />}
//     label="Codes"
//     iconPosition="start"
//     sx={{
//       color: tab === 0 ? "white" : "#000",
//       backgroundColor: tab === 0 ? "#388e3c" : "transparent", // Vert foncé
//       borderRadius: 2,
//       mx: 1,
//       fontWeight: "bold",
//       transition: "all 0.3s ease",
//       "&:hover": { backgroundColor: "#c8e6c9" },
//     }}
//   />
//   <Tab
//     icon={<MenuBookIcon />}
//     label="Livres"
//     iconPosition="start"
//     sx={{
//       color: tab === 1 ? "white" : "#000",
//       backgroundColor: tab === 1 ? "#0288d1" : "transparent", // Bleu
//       borderRadius: 2,
//       mx: 1,
//       fontWeight: "bold",
//       transition: "all 0.3s ease",
//       "&:hover": { backgroundColor: "#b3e5fc" },
//     }}
//   />
//   <Tab
//     icon={<BookmarkAddIcon />}
//     label="Chapitres"
//     iconPosition="start"
//     sx={{
//       color: tab === 2 ? "white" : "#000",
//       backgroundColor: tab === 2 ? "#f57c00" : "transparent", // Orange
//       borderRadius: 2,
//       mx: 1,
//       fontWeight: "bold",
//       transition: "all 0.3s ease",
//       "&:hover": { backgroundColor: "#ffe0b2" },
//     }}
//   />
// </Tabs>



//       <Box hidden={tab !== 0}><RechargeCodeForm /></Box>
//       <Box hidden={tab !== 1}><BookForm /></Box>
//       <Box hidden={tab !== 2}><ChapterForm /></Box>
//     </PageLayout>
//   );
// };

// export default AdminDashboardPage;



import React from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/PageLayout";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Créer un livre 📘",
      description: "Ajoutez un livre de mathématiques par niveau.",
      buttonLabel: "Créer un livre",
      onClick: () => navigate("/admin/books/create"),
    },
    {
      title: "Créer une vidéo 🎥",
      description: "Ajoutez des vidéos pédagogiques par chapitre.",
      buttonLabel: "Créer une vidéo",
      onClick: () => navigate("/admin/videos/create"),
    },
    {
      title: "Créer un sujet d'examen 📝",
      description: "Ajoutez des sujets d'examens corrigés pour les élèves.",
      buttonLabel: "Créer un sujet",
      onClick: () => navigate("/admin/exams/create"),
    },
  ];

  return (
    <PageLayout>
    <Box p={4} mt={10}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        🎛️ Tableau de bord Admin
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom>
                {card.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {card.description}
              </Typography>
              <Button variant="contained" onClick={card.onClick} fullWidth>
                {card.buttonLabel}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
    </PageLayout>
  );
};

export default AdminDashboardPage;
