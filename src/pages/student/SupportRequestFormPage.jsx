
// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   FormControl,
//   InputLabel,
//   Table,
//   TableCell,
//   TableRow,
//   TableHead,
//   Paper,
//   TableBody,
// } from "@mui/material";
// import API from "../../api";
// import { useNavigate } from "react-router-dom";
// import PageLayout from "../../components/PageLayout";
// import { AuthContext } from "../../context/AuthContext";
// import { useContext } from "react";
// import { useTheme } from "@mui/material/styles";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { Card, CardContent } from "@mui/material";

// import Snackbar from "@mui/material/Snackbar";
// import MuiAlert from "@mui/material/Alert";



// const SupportRequestFormPage = () => {
//   const [niveauGeneral, setNiveauGeneral] = useState(""); // collège, lycée, université
//   const [level, setLevel] = useState("");
//   const [serie, setSerie] = useState("");
//   const [niveauUniversitaire, setNiveauUniversitaire] = useState("");
//   const [topic, setTopic] = useState("");
//   const [description, setDescription] = useState("");
//   const [type, setType] = useState("chat");
// const { user } = useContext(AuthContext);

//   const navigate = useNavigate();

//   const [myRequests, setMyRequests] = useState([]);
// const [statusFilter, setStatusFilter] = useState("all");
// const theme = useTheme();
// const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));


// const [snackbarOpen, setSnackbarOpen] = useState(false);
// const [snackbarMessage, setSnackbarMessage] = useState("");
// const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' | 'error' | 'info' | 'warning'

// const handleCloseSnackbar = () => {
//   setSnackbarOpen(false);
// };


//   useEffect(() => {
//   const fetchMySupportRequests = async () => {
//     try {
//       const res = await API.get("/support-requests/my");
//       setMyRequests(res.data);
//     } catch (err) {
//       console.error("Erreur récupération des demandes :", err);
//     }
//   };

//   fetchMySupportRequests();
// }, []);


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     let payload = {
//       topic,
//       description,
//       type,
//     };

//     // Ajout dynamique du niveau
//     if (niveauGeneral === "college") {
//       payload.level = level;
//     } else if (niveauGeneral === "lycee") {
//       payload.level = `${serie} - ${level}`;
//     } else if (niveauGeneral === "universite") {
//       payload.level = niveauUniversitaire;
//     }

//    try {
//   await API.post("/support-requests", payload);
//   setSnackbarMessage("Demande de soutien envoyée !");
//   setSnackbarSeverity("success");
//   setSnackbarOpen(true);
//   navigate("/premium/chat");
// } catch (err) {
//   console.error("Erreur envoi demande :", err);
//   if (err.response?.status === 400 && err.response?.data?.message) {
//     setSnackbarMessage(err.response.data.message);
//   } else {
//     setSnackbarMessage("Erreur lors de l’envoi.");
//   }
//   setSnackbarSeverity("error");
//   setSnackbarOpen(true);
// }

//   };


//  const getStatusBadge = (status) => {
//   switch (status) {
//     case "en_attente":
//       return <span style={{ backgroundColor: "#ffeb3b", padding: "4px 8px", borderRadius: "8px" }}>🕓 En attente</span>;
//     case "acceptee":
//       return <span style={{ backgroundColor: "#4caf50", color: "white", padding: "4px 8px", borderRadius: "8px" }}>✅ Acceptée</span>;
//     case "refusee":
//       return <span style={{ backgroundColor: "#f44336", color: "white", padding: "4px 8px", borderRadius: "8px" }}>❌ Refusée</span>;
//     case "terminee":
//       return <span style={{ backgroundColor: "#9e9e9e", color: "white", padding: "4px 8px", borderRadius: "8px" }}>📁 Terminée</span>;
//     default:
//       return status;
//   }
// };



//   return (
//       <PageLayout>
//   <Box sx={{ maxWidth: 600, mx: "auto", p: isSmallScreen ? 2 : 4, mt: isSmallScreen ? 4 : 8 }}>

//     <Card sx={{ mb: 4, boxShadow: 3 }}>
//   <CardContent>
//     <Typography variant="h6" gutterBottom fontWeight="bold">
//       🎓 Nouvelle Demande de Soutien
//     </Typography>

//     <form onSubmit={handleSubmit}>
//       <FormControl fullWidth sx={{ mb: 2 }}>
//         <InputLabel>Niveau général</InputLabel>
//         <Select
//           value={niveauGeneral}
//           onChange={(e) => {
//             setNiveauGeneral(e.target.value);
//             setLevel("");
//             setSerie("");
//             setNiveauUniversitaire("");
//           }}
//           label="Niveau général"
//           required
//         >
//           <MenuItem value="college">Collège</MenuItem>
//           <MenuItem value="lycee">Lycée</MenuItem>
//           <MenuItem value="universite">Université</MenuItem>
//         </Select>
//       </FormControl>

//       {niveauGeneral === "college" && (
//         <FormControl fullWidth sx={{ mb: 2 }}>
//           <InputLabel>Classe</InputLabel>
//           <Select value={level} onChange={(e) => setLevel(e.target.value)} required>
//             <MenuItem value="6e">6e</MenuItem>
//             <MenuItem value="5e">5e</MenuItem>
//             <MenuItem value="4e">4e</MenuItem>
//             <MenuItem value="3e">3e</MenuItem>
//           </Select>
//         </FormControl>
//       )}

//       {niveauGeneral === "lycee" && (
//         <>
//           <FormControl fullWidth sx={{ mb: 2 }}>
//             <InputLabel>Série</InputLabel>
//             <Select value={serie} onChange={(e) => setSerie(e.target.value)} required>
//               <MenuItem value="A">A</MenuItem>
//               <MenuItem value="C">C</MenuItem>
//               <MenuItem value="D">D</MenuItem>
//               <MenuItem value="E">E</MenuItem>
//               <MenuItem value="F">F</MenuItem>
//               <MenuItem value="G">G</MenuItem>
//             </Select>
//           </FormControl>

//           <FormControl fullWidth sx={{ mb: 2 }}>
//             <InputLabel>Classe</InputLabel>
//             <Select value={level} onChange={(e) => setLevel(e.target.value)} required>
//               <MenuItem value="Seconde">Seconde</MenuItem>
//               <MenuItem value="Première">Première</MenuItem>
//               <MenuItem value="Terminale">Terminale</MenuItem>
//             </Select>
//           </FormControl>
//         </>
//       )}

//       {niveauGeneral === "universite" && (
//         <TextField
//           label="Niveau universitaire (ex : L1, L2, Master)"
//           value={niveauUniversitaire}
//           onChange={(e) => setNiveauUniversitaire(e.target.value)}
//           fullWidth
//           required
//           sx={{ mb: 2 }}
//         />
//       )}

//       <TextField
//         label="Sujet / Thème"
//         value={topic}
//         onChange={(e) => setTopic(e.target.value)}
//         fullWidth
//         required
//         sx={{ mb: 2 }}
//       />

//       <TextField
//         label="Description (facultatif)"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         fullWidth
//         multiline
//         rows={3}
//         sx={{ mb: 2 }}
//       />

//       <FormControl fullWidth sx={{ mb: 3 }}>
//         <InputLabel>Type de soutien</InputLabel>
//         <Select value={type} onChange={(e) => setType(e.target.value)}>
//           <MenuItem value="chat">Chat</MenuItem>
//           <MenuItem value="visio">Visio</MenuItem>
//         </Select>
//       </FormControl>

//       <Button variant="contained" type="submit" fullWidth>
//         Envoyer la demande
//       </Button>
//     </form>
//   </CardContent>
// </Card>


// <Box mt={6}>
//   <Typography variant="h6" gutterBottom>
//     📋 Mes demandes précédentes
//   </Typography>

//   {/* ✅ Filtre par statut */}
//   <FormControl sx={{ mb: 2, width: 250 }}>
//     <InputLabel>Filtrer par statut</InputLabel>
 
//  <Select
//   value={statusFilter}
//   onChange={(e) => setStatusFilter(e.target.value)}
//   label="Filtrer par statut"
// >
//   <MenuItem value="all">Tous les statuts</MenuItem>
//   <MenuItem value="en_attente">🕓 En attente</MenuItem>
//   <MenuItem value="acceptee">✅ Acceptée</MenuItem>
//   <MenuItem value="refusee">❌ Refusée</MenuItem>
//   <MenuItem value="terminee">📁 Terminée</MenuItem>
// </Select>

//   </FormControl>

//   {myRequests.length === 0 ? (
//     <Typography>Aucune demande envoyée.</Typography>
//   ) : (
//    <Paper sx={{ overflowX: "auto" }}>
//   <Table size="small">
//     <TableHead>
//       <TableRow>
//         <TableCell>Sujet</TableCell>
//         <TableCell>Niveau</TableCell>
//         <TableCell>Type</TableCell>
//         <TableCell>Statut</TableCell>
//         <TableCell>Date</TableCell>
//       </TableRow>
//     </TableHead>
//     <TableBody>
//       {myRequests
//         .filter((req) => statusFilter === "all" || req.status === statusFilter)
//         .map((req) => (
//           <TableRow key={req._id}>
//             <TableCell>{req.topic}</TableCell>
//             <TableCell>{req.level}</TableCell>
//             <TableCell>{req.type}</TableCell>
//             <TableCell>{getStatusBadge(req.status)}</TableCell>
//             <TableCell>
//               {new Date(req.createdAt).toLocaleDateString()} à{" "}
//               {new Date(req.createdAt).toLocaleTimeString([], {
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })}
//               {req.status === "terminee" && (
//                 <Button
//                   size="small"
//                   variant="outlined"
//                   sx={{ mt: 1 }}
//                   onClick={() =>
//                     navigate(`/student/chat-history?teacher=${req.teacher._id}&student=${user._id}`)
//                   }
//                 >
//                   Voir les échanges
//                 </Button>
//               )}
//             </TableCell>
//           </TableRow>
//         ))}
//     </TableBody>
//   </Table>
// </Paper>

//   )}
// </Box>


//     </Box>

//     <Snackbar
//   open={snackbarOpen}
//   autoHideDuration={6000}
//   onClose={handleCloseSnackbar}
//   anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
// >
//   <MuiAlert onClose={handleCloseSnackbar} severity={snackbarSeverity} elevation={6} variant="filled">
//     {snackbarMessage}
//   </MuiAlert>
// </Snackbar>


//     </PageLayout>
//   );
// };

// export default SupportRequestFormPage;
















// pages/student/SupportRequestFormPage.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
  InputLabel,
  Table,
  TableCell,
  TableRow,
  TableHead,
  Paper,
  TableBody,
  Chip,
  Stack,
  Alert as MuiInlineAlert,
} from "@mui/material";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/PageLayout";
import ContentRequestFAB from "../../components/ContentRequestFAB";
import { AuthContext } from "../../context/AuthContext";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Card, CardContent } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

const MONTHLY_SUPPORT_LIMIT = 2;


const normalizeUsage = (u = {}) => {
  const raw =
    u.supportRequestsCreated ??
    u.support_requests_created ??
    u.supportCreated ??
    0;
  return { ...u, supportRequestsCreated: Number(raw || 0) };
};

const isSameMonth = (d, now = new Date()) =>
  d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();

const countMyRequestsThisMonth = (requests = []) =>
  requests.reduce((acc, r) => {
    const d = r?.createdAt ? new Date(r.createdAt) : null;
    return d && isSameMonth(d) ? acc + 1 : acc;
  }, 0);

const ACTIVE_STATUSES = ["en_attente", "acceptee"];
const computeActiveFromList = (list = []) => {
  const r = list.find((x) => ACTIVE_STATUSES.includes(x?.status));
  return r
    ? { active: true, requestId: r._id, teacherId: r.teacher?._id ?? null }
    : { active: false };
};



const SupportRequestFormPage = () => {
  const [niveauGeneral, setNiveauGeneral] = useState(""); // collège, lycée, université
  const [level, setLevel] = useState("");
  const [serie, setSerie] = useState("");
  const [niveauUniversitaire, setNiveauUniversitaire] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("chat");

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [myRequests, setMyRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // Quotas & demande active
  const [supportCreatedThisMonth, setSupportCreatedThisMonth] = useState(0);
  const [activeSupport, setActiveSupport] = useState(null); // { active, teacherId, requestId } | null

  const used = Number(supportCreatedThisMonth || 0); // utilisées
  const remaining = Math.max(MONTHLY_SUPPORT_LIMIT - used, 0); // restantes
  const isActive = Boolean(activeSupport?.active);

  // Rafraîchit (1) mes demandes, (2) les usages/quotas, (3) l'état “active”
const refreshUsageAndActive = async () => {
  try {
    const [mineRes, usageRes, actRes] = await Promise.all([
      API.get("/support-requests/my"),
      API.get("/usage/me"),
      API.get("/student/support/active").catch(() => ({ data: { active: false } })),
    ]);

    const mine = mineRes?.data || [];
    setMyRequests(mine);

    const usage = normalizeUsage(usageRes?.data || {});
    const usedFromList = countMyRequestsThisMonth(mine);
    setSupportCreatedThisMonth(Math.max(usage.supportRequestsCreated, usedFromList));

    const fromList = computeActiveFromList(mine);
    const fromEndpoint = actRes?.data?.active
      ? { active: true, teacherId: actRes.data.teacherId || null, requestId: actRes.data.requestId || null }
      : { active: false };

    // ✅ La liste PRIME: si la liste dit “pas actif”, on affiche pas “en cours”
    const finalActive = fromList.active ? fromList : fromEndpoint;
    setActiveSupport(finalActive);
  } catch (e) {
    console.warn("Refresh usage/active failed", e);
    // Fallback: on se base au moins sur la liste
    try {
      const mineRes = await API.get("/support-requests/my");
      const mine = mineRes?.data || [];
      setMyRequests(mine);
      setSupportCreatedThisMonth(countMyRequestsThisMonth(mine));
      setActiveSupport(computeActiveFromList(mine));
    } catch {}
  }
};


  // Chargement initial
useEffect(() => {
  (async () => {
    try {
      const [mineRes, usageRes] = await Promise.all([
        API.get("/support-requests/my"),
        API.get("/usage/me"),
      ]);
      const mine = mineRes?.data || [];
      setMyRequests(mine);

      const usage = normalizeUsage(usageRes?.data || {});
      const usedFromList = countMyRequestsThisMonth(mine);
      setSupportCreatedThisMonth(Math.max(usage.supportRequestsCreated, usedFromList));

      let endpointActive = { active: false };
      try {
        const { data } = await API.get("/student/support/active");
        endpointActive = data?.active
          ? { active: true, teacherId: data.teacherId || null, requestId: data.requestId || null }
          : { active: false };
      } catch {}

      const fromList = computeActiveFromList(mine);
      setActiveSupport(fromList.active ? fromList : endpointActive);
    } catch (err) {
      console.error("Erreur chargement initial quotas/listes :", err);
      // Fallback : liste seule
      try {
        const mineRes = await API.get("/support-requests/my");
        const mine = mineRes?.data || [];
        setMyRequests(mine);
        setSupportCreatedThisMonth(countMyRequestsThisMonth(mine));
        setActiveSupport(computeActiveFromList(mine));
      } catch {}
    }
  })();
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Gardes UX côté front
    if (isActive) {
      setSnackbarMessage("Une demande est déjà en cours. Terminez-la avant d’en créer une nouvelle.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    if (remaining <= 0) {
      setSnackbarMessage("Vous avez atteint la limite mensuelle de 2 demandes.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    // Payload
    const payload = { topic, description, type };
    if (niveauGeneral === "college") {
      payload.level = level;
    } else if (niveauGeneral === "lycee") {
      payload.level = `${serie} - ${level}`;
    } else if (niveauGeneral === "universite") {
      payload.level = niveauUniversitaire;
    }

   try {
  await API.post("/support-requests", payload);

  try {
    await refreshUsageAndActive();
  } catch {
    // Optimiste UNIQUEMENT en cas d’échec du refresh immédiat
    setSupportCreatedThisMonth((n) => Number(n || 0) + 1);
    setActiveSupport({ active: true });
  }

  setSnackbarMessage("Demande de soutien envoyée !");
  setSnackbarSeverity("success");
  setSnackbarOpen(true);
  navigate("/premium/chat");
} catch (err) {
      console.error("Erreur envoi demande :", err);
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403 ? "Action interdite (403)." : "Erreur lors de l’envoi.");
      setSnackbarMessage(msg);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "en_attente":
        return (
          <span style={{ backgroundColor: "#ffeb3b", padding: "4px 8px", borderRadius: "8px" }}>
            🕓 En attente
          </span>
        );
      case "acceptee":
        return (
          <span style={{ backgroundColor: "#4caf50", color: "white", padding: "4px 8px", borderRadius: "8px" }}>
            ✅ Acceptée
          </span>
        );
      case "refusee":
        return (
          <span style={{ backgroundColor: "#f44336", color: "white", padding: "4px 8px", borderRadius: "8px" }}>
            ❌ Refusée
          </span>
        );
      case "terminee":
        return (
          <span style={{ backgroundColor: "#9e9e9e", color: "white", padding: "4px 8px", borderRadius: "8px" }}>
            📁 Terminée
          </span>
        );
      default:
        return status;
    }
  };

  const submitDisabled = isActive || remaining <= 0 || !niveauGeneral || !topic.trim();

  return (
    <PageLayout>
      <Box sx={{ maxWidth: 600, mx: "auto", p: isSmallScreen ? 2 : 4, mt: isSmallScreen ? 8 : 8 }}>
        {/* Bandeau compteur + état */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1, flexWrap: "wrap" }}>
          <Chip
            label={`Utilisées : ${used}/${MONTHLY_SUPPORT_LIMIT}`}
            color="default"
            size="small"
            sx={{ fontWeight: 700 }}
          />
          <Chip
            label={`Restantes : ${remaining}/${MONTHLY_SUPPORT_LIMIT}`}
            color={remaining > 0 ? "success" : "error"}
            size="small"
            sx={{ fontWeight: 700 }}
          />
          {isActive && (
            <Chip
              icon={<LockRoundedIcon />}
              label="Demande en cours"
              color="warning"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>

        {isActive && (
          <MuiInlineAlert severity="warning" sx={{ mb: 2 }}>
            Vous avez déjà une demande en cours. Merci de la terminer avant d’en créer une nouvelle.
          </MuiInlineAlert>
        )}

        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              🎓 Nouvelle Demande de Soutien
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Niveau général</InputLabel>
                <Select
                  value={niveauGeneral}
                  onChange={(e) => {
                    setNiveauGeneral(e.target.value);
                    setLevel("");
                    setSerie("");
                    setNiveauUniversitaire("");
                  }}
                  label="Niveau général"
                  required
                  disabled={isActive || remaining <= 0}
                >
                  <MenuItem value="college">Collège</MenuItem>
                  <MenuItem value="lycee">Lycée</MenuItem>
                  <MenuItem value="universite">Université</MenuItem>
                </Select>
              </FormControl>

              {niveauGeneral === "college" && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Classe</InputLabel>
                  <Select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    required
                    disabled={isActive || remaining <= 0}
                  >
                    <MenuItem value="6e">6e</MenuItem>
                    <MenuItem value="5e">5e</MenuItem>
                    <MenuItem value="4e">4e</MenuItem>
                    <MenuItem value="3e">3e</MenuItem>
                  </Select>
                </FormControl>
              )}

              {niveauGeneral === "lycee" && (
                <>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Série</InputLabel>
                    <Select
                      value={serie}
                      onChange={(e) => setSerie(e.target.value)}
                      required
                      disabled={isActive || remaining <= 0}
                    >
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                      <MenuItem value="E">E</MenuItem>
                      <MenuItem value="F">F</MenuItem>
                      <MenuItem value="G">G</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Classe</InputLabel>
                    <Select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      required
                      disabled={isActive || remaining <= 0}
                    >
                      <MenuItem value="Seconde">Seconde</MenuItem>
                      <MenuItem value="Première">Première</MenuItem>
                      <MenuItem value="Terminale">Terminale</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}

              {niveauGeneral === "universite" && (
                <TextField
                  label="Niveau universitaire (ex : L1, L2, Master)"
                  value={niveauUniversitaire}
                  onChange={(e) => setNiveauUniversitaire(e.target.value)}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  disabled={isActive || remaining <= 0}
                />
              )}

              <TextField
                label="Sujet / Thème"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                fullWidth
                required
                sx={{ mb: 2 }}
                disabled={isActive || remaining <= 0}
              />

              <TextField
                label="Description (facultatif)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
                sx={{ mb: 2 }}
                disabled={isActive || remaining <= 0}
              />

              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Type de soutien</InputLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  disabled={isActive || remaining <= 0}
                >
                  <MenuItem value="chat">Chat</MenuItem>
                  <MenuItem value="visio">Visio</MenuItem>
                </Select>
              </FormControl>

              <Button variant="contained" type="submit" fullWidth disabled={submitDisabled}>
                Envoyer la demande
              </Button>

              {submitDisabled && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  {isActive
                    ? "Une demande est en cours — veuillez la terminer dans la messagerie."
                    : remaining <= 0
                    ? "Quota mensuel atteint (2/2)."
                    : "Renseignez les champs obligatoires pour envoyer."}
                </Typography>
              )}
            </form>
          </CardContent>
        </Card>

        <Box mt={6}>
          <Typography variant="h6" gutterBottom>
            📋 Mes demandes précédentes
          </Typography>

          <FormControl sx={{ mb: 2, width: 250 }}>
            <InputLabel>Filtrer par statut</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Filtrer par statut"
            >
              <MenuItem value="all">Tous les statuts</MenuItem>
              <MenuItem value="en_attente">🕓 En attente</MenuItem>
              <MenuItem value="acceptee">✅ Acceptée</MenuItem>
              <MenuItem value="refusee">❌ Refusée</MenuItem>
              <MenuItem value="terminee">📁 Terminée</MenuItem>
            </Select>
          </FormControl>

          {myRequests.length === 0 ? (
            <Typography>Aucune demande envoyée.</Typography>
          ) : (
            <Paper sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sujet</TableCell>
                    <TableCell>Niveau</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myRequests
                    .filter((req) => statusFilter === "all" || req.status === statusFilter)
                    .map((req) => (
                      <TableRow key={req._id}>
                        <TableCell>{req.topic}</TableCell>
                        <TableCell>{req.level}</TableCell>
                        <TableCell>{req.type}</TableCell>
                        <TableCell>{/* getStatusBadge est défini ci-dessous */ getStatusBadge(req.status)}</TableCell>
                        <TableCell>
                          {new Date(req.createdAt).toLocaleDateString()} à{" "}
                          {new Date(req.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {req.status === "terminee" && req.teacher && (
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ mt: 1 }}
                              onClick={() =>
                                navigate(
                                  `/student/chat-history?teacher=${req.teacher._id}&student=${user._id}`
                                )
                              }
                            >
                              Voir les échanges
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          elevation={6}
          variant="filled"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* ✅ Bouton FAB pour demander du contenu */}
      <ContentRequestFAB />
    </PageLayout>
  );
};

export default SupportRequestFormPage;
