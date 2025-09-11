

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/PageLayout";
import API from "../../api";
import AdminUserTable from "../../components/admin/AdminUserTable";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
const [selectedBatchId, setSelectedBatchId] = useState("");
const [teacherCount, setTeacherCount] = useState(0);

// useEffect(() => {
//   const fetchStats = async () => {
//     const res = await API.get("/payments/stats");
//     setStats(res.data);
//   };
//   fetchStats();
// }, []);



useEffect(() => {
  const fetchStats = async () => {
    const res = await API.get("/payments/stats");
    setStats(res.data);

    // Nouveau : récupérer le nombre d'enseignants
    const teacherRes = await API.get("/admin/stats");
    setTeacherCount(teacherRes.data.totalTeachers);
  };
  fetchStats();
}, []);

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

{
  title: "Générer des codes d’accès 🔐",
  description: "Générez des cartes d'abonnement à gratter ou à vendre.",
  buttonLabel: "Générer des codes",
  onClick: () => navigate("/admin/codes"), // ✅ route corrigée
},


{
  title: "Créer un enseignant 👨‍🏫",
  description: "Ajoutez un enseignant et gérez ses informations.",
  buttonLabel: "Gérer les enseignants",
  onClick: () => navigate("/admin/teachers"),
},





 {
  title: "Partenaires distributeurs 🤝",
  description:
    "Créez des partenaires/vendeurs, assignez des lots de cartes et suivez activations & commissions.",
  buttonLabel: "Gérer les partenaires",
  onClick: () => navigate("/admin/partners/manage"),
},

{
  title: "Distributeurs Fahimta 💳",
  description: "Créer & gérer les distributeurs de cartes (édition, suppression).",
  buttonLabel: "Gérer les distributeurs",
  onClick: () => navigate("/admin/distributors"),
},

  
  ];

  return (
    <PageLayout>
    <Box p={4} mt={10}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        🎛️ Tableau de bord Admin
      </Typography>

      {stats && (
  <Grid container spacing={3} mb={4}>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6">👥 Élèves connectés</Typography>
        <Typography variant="h5" fontWeight="bold">{stats.connectedUsers}</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6">❌ Sans abonnement</Typography>
        <Typography variant="h5" fontWeight="bold">{stats.registeredWithoutSubscription}</Typography>
      </Paper>
    </Grid>
    <Grid item xs={12} md={4}>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6">✅ Abonnés</Typography>
        <Typography variant="h5" fontWeight="bold">{stats.registeredWithSubscription}</Typography>
      </Paper>
    </Grid>


    <Grid item xs={12} md={4}>
  <Paper sx={{ p: 3, borderRadius: 2 }}>
    <Typography variant="h6">👨‍🏫 Enseignants inscrits</Typography>
    <Typography variant="h5" fontWeight="bold">{teacherCount}</Typography>
  </Paper>
</Grid>

  </Grid>
)}


{stats && (
  <Box my={4}>
    <Typography variant="h6" mb={2}>📦 Statistiques par lot</Typography>

    <TextField
      select
      label="Choisir un lot"
      value={selectedBatchId}
      onChange={(e) => setSelectedBatchId(e.target.value)}
      sx={{ width: 300, mb: 2 }}
    >
      {stats.batches.map((batch) => (
        <MenuItem key={batch.batchId} value={batch.batchId}>
          {batch.batchId}
        </MenuItem>
      ))}
    </TextField>

    {selectedBatchId && (
      <Grid container spacing={2}>
        {(() => {
          const selected = stats.batches.find(b => b.batchId === selectedBatchId);
          return (
            <>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2">Total cartes</Typography>
                  <Typography variant="h6">{selected.totalCards}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2">Montant total</Typography>
                  <Typography variant="h6">{selected.totalAmount} FCFA</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2">Cartes utilisées</Typography>
                  <Typography variant="h6">{selected.usedCards} ({selected.totalUsedAmount} FCFA)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="body2">Cartes non utilisées</Typography>
                  <Typography variant="h6">{selected.unusedCards} ({selected.totalUnusedAmount} FCFA)</Typography>
                </Paper>
              </Grid>
            </>
          );
        })()}
      </Grid>
    )}
  </Box>
)}



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
        <Grid item xs={12}>
  <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
  
    <Typography variant="body2" color="text.secondary" mb={2}>
      Recherchez, activez ou désactivez les comptes d’élèves ou d’enseignants.
    </Typography>
    
    {/* 👇 Table des utilisateurs */}
    <AdminUserTable />
  </Paper>
</Grid>

    </Box>

  
    </PageLayout>
  );
};

export default AdminDashboardPage;
