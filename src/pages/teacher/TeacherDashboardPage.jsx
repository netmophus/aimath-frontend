
// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Grid,
//   Card,
//   CardContent,
//   Avatar,
//   Chip,
// } from "@mui/material";

// import API from "../../api";
// import { useNavigate } from "react-router-dom";
// import PageLayout from "../../components/PageLayout";
// import RequestReceivTeacher from "../../components/teacher/RequestReceivTeacher";




// const TeacherDashboardPage = () => {

  


//     const [teacherData, setTeacherData] = useState(null);

//     const [stats, setStats] = useState(null);

// useEffect(() => {
//   const fetchStats = async () => {
//     try {
//       const res = await API.get("/teacher/support-requests/stats");
//       setStats(res.data);
//     } catch (err) {
//       console.error("Erreur chargement statistiques :", err);
//     }
//   };

//   fetchStats(); // Chargement initial

//   const interval = setInterval(fetchStats, 10000); // Rafraîchit toutes les 10 secondes

//   return () => clearInterval(interval); // Nettoyage
// }, []);


//     useEffect(() => {
//   const fetchProfile = async () => {
//     try {
//       const res = await API.get("/users/profile");

//       setTeacherData(res.data);
//     } catch (err) {
//       console.error("Erreur chargement profil enseignant:", err);
//     }
//   };
//   fetchProfile();
// }, []);

// if (!teacherData) {
//   return (
//     <Box p={4}>
//       <Typography>Chargement des données de l’enseignant...</Typography>
//     </Box>
//   );
// }


//   return (
//      <PageLayout>
//     <Box sx={{ p: 4, backgroundColor: "#f9f9f9", minHeight: "100vh", marginTop:8 }}>
//       <Typography variant="h4" fontWeight="bold" gutterBottom>
//         🎓 Tableau de Bord Enseignant
//       </Typography>

//       {/* Profil Enseignant */}
     
// <Card sx={{ mb: 4, borderRadius: 4, p: 2 }}>
//   <CardContent>
//     <Grid container spacing={3} alignItems="center">
//       {/* 🧑 Avatar + Infos Prof */}
//       <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
//         <Avatar
//           src={teacherData.photo || "https://i.pravatar.cc/150"}
//           alt={teacherData.fullName}
//           sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
//         />
//         <Typography variant="h6">{teacherData.fullName}</Typography>
//         <Typography variant="body2" color="text.secondary">
//           {teacherData.levels?.join(", ") || "-"}<br />
//           Expérience : {teacherData.experience || "-"}<br />
//           📍 {teacherData.city} - {teacherData.schoolName}
//         </Typography>
//         <Box sx={{ mt: 1 }}>
//           {teacherData.subjects?.map((subject, index) => (
//             <Chip key={index} label={subject} sx={{ mr: 0.5, mb: 0.5 }} />
//           ))}
//         </Box>
//       </Grid>

//       {/* 📊 Statistiques regroupées */}
//       <Grid item xs={12} md={8}>
//         <Grid container spacing={2}>
//           <Grid item xs={6} md={3}>
//             <Card sx={{ backgroundColor: "#fffde7", borderLeft: "5px solid #fbc02d", boxShadow: 2 }}>
//               <CardContent>
//                 <Typography variant="subtitle2" gutterBottom>🕓 En attente</Typography>
//                 <Typography variant="h5">{stats?.en_attente || 0}</Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={6} md={3}>
//             <Card sx={{ backgroundColor: "#e8f5e9", borderLeft: "5px solid #388e3c", boxShadow: 2 }}>
//               <CardContent>
//                 <Typography variant="subtitle2" gutterBottom>✅ Acceptées</Typography>
//                 <Typography variant="h5">{stats?.acceptee || 0}</Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={6} md={3}>
//             <Card sx={{ backgroundColor: "#ffebee", borderLeft: "5px solid #d32f2f", boxShadow: 2 }}>
//               <CardContent>
//                 <Typography variant="subtitle2" gutterBottom>❌ Refusées</Typography>
//                 <Typography variant="h5">{stats?.refusee || 0}</Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid item xs={6} md={3}>
//             <Card sx={{ backgroundColor: "#f5f5f5", borderLeft: "5px solid #757575", boxShadow: 2 }}>
//               <CardContent>
//                 <Typography variant="subtitle2" gutterBottom>📁 Terminées</Typography>
//                 <Typography variant="h5">{stats?.terminee || 0}</Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Grid>
//     </Grid>
//   </CardContent>
// </Card>



//       <Grid container spacing={3}>





//         {/* Demandes de soutien */}
//    {/* Demandes de soutien */}
// <Grid item xs={12} md={6}>
//   <Card sx={{ borderRadius: 3 }}>
//     <CardContent>
//       <RequestReceivTeacher />
//     </CardContent>
//   </Card>
// </Grid>



      
//       </Grid>
//     </Box>

//     </PageLayout>
//   );
// };

// export default TeacherDashboardPage;












// pages/teacher/TeacherDashboardPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Skeleton,
  Divider,
  Alert,
  Switch,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import API from "../../api";
import PageLayout from "../../components/PageLayout";
import RequestReceivTeacher from "../../components/teacher/RequestReceivTeacher";
import { useNavigate } from "react-router-dom";

/* ---------- UI helpers ---------- */
const KpiCard = ({ icon, label, value, border, bg }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      borderLeft: `5px solid ${border}`,
      bgcolor: bg || "#fff",
    }}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon}
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800 }}>
        {value ?? 0}
      </Typography>
    </CardContent>
  </Card>
);

const Cover = styled("div")(({ theme }) => ({
  position: "relative",
  height: 120,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  background:
    "linear-gradient(135deg, rgba(33,150,243,0.15) 0%, rgba(236,72,153,0.15) 100%)",
}));

/* ---------- Page ---------- */
const TeacherDashboardPage = () => {
  const navigate = useNavigate();

  // data
  const [teacher, setTeacher] = useState(null);
  const [stats, setStats] = useState(null);

  // loading / errors
  const [loadingTeacher, setLoadingTeacher] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorTeacher, setErrorTeacher] = useState("");
  const [errorStats, setErrorStats] = useState("");

  // refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const timerRef = useRef(null);
  const INTERVAL_MS = 10000;

  const fetchProfile = async () => {
    try {
      setLoadingTeacher(true);
      setErrorTeacher("");
      const res = await API.get("/users/profile"); // garde ta route actuelle
      setTeacher(res.data);
    } catch (err) {
      setErrorTeacher("Erreur lors du chargement du profil enseignant.");
    } finally {
      setLoadingTeacher(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      setErrorStats("");
      const res = await API.get("/teacher/support-requests/stats");
      setStats(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      setErrorStats("Erreur lors du chargement des statistiques.");
    } finally {
      setLoadingStats(false);
    }
  };

  const refreshAll = () => {
    fetchProfile();
    fetchStats();
  };

  // initial fetch
  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // auto refresh propre (pause si onglet caché)
  useEffect(() => {
    const setup = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoRefresh) {
        timerRef.current = setInterval(() => {
          if (document.visibilityState === "visible") fetchStats();
        }, INTERVAL_MS);
      }
    };
    setup();
    return () => timerRef.current && clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  const subjects = useMemo(
    () => (Array.isArray(teacher?.subjects) ? teacher.subjects : []),
    [teacher]
  );
  const levels = useMemo(
    () => (Array.isArray(teacher?.levels) ? teacher.levels : []),
    [teacher]
  );

  return (
    <PageLayout>
      <Box sx={{ px: { xs: 2, md: 4 }, py: 4, mt: 8, bgcolor: "#f7f8fa", minHeight: "100vh" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h4" fontWeight={900}>
              🎓 Tableau de bord enseignant
            </Typography>
            <Typography color="text.secondary">
              Suivez vos demandes de soutien et gérez votre profil.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Dernière mise à jour : {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <Tooltip title="Rafraîchir maintenant">
              <IconButton onClick={refreshAll}>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Auto
              </Typography>
              <Switch
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                color="primary"
              />
            </Stack>
          </Stack>
        </Stack>

        {/* Profil + KPIs */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid rgba(0,0,0,0.06)" }}>
              <Cover />
              <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={3} alignItems="center">
                  {/* Profil */}
                  <Grid item xs={12} md={4}>
                    <Stack alignItems={{ xs: "center", md: "flex-start" }} spacing={1.2}>
                      {loadingTeacher ? (
                        <>
                          <Skeleton variant="circular" width={96} height={96} />
                          <Skeleton variant="text" width={220} />
                          <Skeleton variant="text" width={180} />
                        </>
                      ) : errorTeacher ? (
                        <Alert severity="error" sx={{ width: "100%" }}>
                          {errorTeacher}
                        </Alert>
                      ) : (
                        <>
                          <Avatar
                            src={teacher?.photo || ""}
                            alt={teacher?.fullName || "Photo"}
                            sx={{
                              width: 96,
                              height: 96,
                              mt: -8,
                              border: "3px solid #fff",
                              boxShadow: 2,
                            }}
                          />
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ flexWrap: "wrap" }}
                          >
                            <Typography variant="h6" fontWeight={800}>
                              {teacher?.fullName || "—"}
                            </Typography>
                            <Tooltip title="Modifier mon profil">
                              <IconButton size="small" onClick={() => navigate("/teacher/profile")}>
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <SchoolOutlinedIcon fontSize="small" color="action" />
                            <Typography color="text.secondary">
                              {teacher?.schoolName || "—"}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <LocationOnOutlinedIcon fontSize="small" color="action" />
                            <Typography color="text.secondary">
                              {teacher?.city || "—"}
                            </Typography>
                          </Stack>

                          {(teacher?.experience || teacher?.level) && (
                            <Typography variant="body2" color="text.secondary">
                              {teacher?.level ? `${teacher.level}` : ""}{" "}
                              {teacher?.experience ? `• Exp. ${teacher.experience}` : ""}
                            </Typography>
                          )}

                          {/* Tags matières */}
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {subjects.length > 0
                              ? subjects.map((s, idx) => <Chip key={idx} label={s} size="small" />)
                              : <Chip label="Matières non renseignées" size="small" variant="outlined" />}
                          </Stack>

                          {/* Niveaux */}
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {levels.length > 0
                              ? levels.map((l, idx) => (
                                  <Chip key={idx} label={l} size="small" color="primary" variant="outlined" />
                                ))
                              : <Chip label="Niveaux non renseignés" size="small" variant="outlined" />}
                          </Stack>
                        </>
                      )}
                    </Stack>
                  </Grid>

                  {/* KPIs */}
                  <Grid item xs={12} md={8}>
                    {loadingStats ? (
                      <Grid container spacing={2}>
                        {Array.from({ length: 4 }).map((_, i) => (
                          <Grid item xs={6} md={3} key={i}>
                            <Skeleton variant="rounded" height={96} />
                          </Grid>
                        ))}
                      </Grid>
                    ) : errorStats ? (
                      <Alert severity="error">{errorStats}</Alert>
                    ) : (
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <KpiCard
                            icon={<PendingActionsRoundedIcon color="warning" />}
                            label="En attente"
                            value={stats?.en_attente}
                            border="#fbc02d"
                            bg="#fffde7"
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <KpiCard
                            icon={<CheckCircleRoundedIcon color="success" />}
                            label="Acceptées"
                            value={stats?.acceptee}
                            border="#2e7d32"
                            bg="#e8f5e9"
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <KpiCard
                            icon={<CancelRoundedIcon color="error" />}
                            label="Refusées"
                            value={stats?.refusee}
                            border="#d32f2f"
                            bg="#ffebee"
                          />
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <KpiCard
                            icon={<TaskAltRoundedIcon color="action" />}
                            label="Terminées"
                            value={stats?.terminee}
                            border="#616161"
                            bg="#f5f5f5"
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Demandes de soutien */}
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.2} sx={{ p: 2 }}>
                <TimelineOutlinedIcon color="primary" />
                <Typography variant="h6" fontWeight={800}>
                  Demandes de soutien reçues
                </Typography>
                <Box sx={{ ml: "auto" }}>
                  <Button
                    size="small"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={fetchStats}
                  >
                    Actualiser stats
                  </Button>
                </Box>
              </Stack>
              <Divider />
              <Box sx={{ p: { xs: 1, md: 2 } }}>
                <RequestReceivTeacher />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </PageLayout>
  );
};

export default TeacherDashboardPage;
