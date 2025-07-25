
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
} from "@mui/material";

import API from "../../api";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/PageLayout";
import RequestReceivTeacher from "../../components/teacher/RequestReceivTeacher";




const TeacherDashboardPage = () => {

  


    const [teacherData, setTeacherData] = useState(null);

    const [stats, setStats] = useState(null);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await API.get("/teacher/support-requests/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Erreur chargement statistiques :", err);
    }
  };

  fetchStats(); // Chargement initial

  const interval = setInterval(fetchStats, 10000); // Rafraîchit toutes les 10 secondes

  return () => clearInterval(interval); // Nettoyage
}, []);


    useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/profile");

      setTeacherData(res.data);
    } catch (err) {
      console.error("Erreur chargement profil enseignant:", err);
    }
  };
  fetchProfile();
}, []);

if (!teacherData) {
  return (
    <Box p={4}>
      <Typography>Chargement des données de l’enseignant...</Typography>
    </Box>
  );
}


  return (
     <PageLayout>
    <Box sx={{ p: 4, backgroundColor: "#f9f9f9", minHeight: "100vh", marginTop:8 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        🎓 Tableau de Bord Enseignant
      </Typography>

      {/* Profil Enseignant */}
     
<Card sx={{ mb: 4, borderRadius: 4, p: 2 }}>
  <CardContent>
    <Grid container spacing={3} alignItems="center">
      {/* 🧑 Avatar + Infos Prof */}
      <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
        <Avatar
          src={teacherData.photo || "https://i.pravatar.cc/150"}
          alt={teacherData.fullName}
          sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
        />
        <Typography variant="h6">{teacherData.fullName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {teacherData.levels?.join(", ") || "-"}<br />
          Expérience : {teacherData.experience || "-"}<br />
          📍 {teacherData.city} - {teacherData.schoolName}
        </Typography>
        <Box sx={{ mt: 1 }}>
          {teacherData.subjects?.map((subject, index) => (
            <Chip key={index} label={subject} sx={{ mr: 0.5, mb: 0.5 }} />
          ))}
        </Box>
      </Grid>

      {/* 📊 Statistiques regroupées */}
      <Grid item xs={12} md={8}>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Card sx={{ backgroundColor: "#fffde7", borderLeft: "5px solid #fbc02d", boxShadow: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>🕓 En attente</Typography>
                <Typography variant="h5">{stats?.en_attente || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ backgroundColor: "#e8f5e9", borderLeft: "5px solid #388e3c", boxShadow: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>✅ Acceptées</Typography>
                <Typography variant="h5">{stats?.acceptee || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ backgroundColor: "#ffebee", borderLeft: "5px solid #d32f2f", boxShadow: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>❌ Refusées</Typography>
                <Typography variant="h5">{stats?.refusee || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ backgroundColor: "#f5f5f5", borderLeft: "5px solid #757575", boxShadow: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>📁 Terminées</Typography>
                <Typography variant="h5">{stats?.terminee || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </CardContent>
</Card>



      <Grid container spacing={3}>





        {/* Demandes de soutien */}
   {/* Demandes de soutien */}
<Grid item xs={12} md={6}>
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <RequestReceivTeacher />
    </CardContent>
  </Card>
</Grid>



      
      </Grid>
    </Box>

    </PageLayout>
  );
};

export default TeacherDashboardPage;
