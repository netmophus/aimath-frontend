
import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/PageLayout";
import { AuthContext } from "../../context/AuthContext";
import { useContext } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Card, CardContent } from "@mui/material";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";



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
const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' | 'error' | 'info' | 'warning'

const handleCloseSnackbar = () => {
  setSnackbarOpen(false);
};


  useEffect(() => {
  const fetchMySupportRequests = async () => {
    try {
      const res = await API.get("/support-requests/my");
      setMyRequests(res.data);
    } catch (err) {
      console.error("Erreur récupération des demandes :", err);
    }
  };

  fetchMySupportRequests();
}, []);


  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {
      topic,
      description,
      type,
    };

    // Ajout dynamique du niveau
    if (niveauGeneral === "college") {
      payload.level = level;
    } else if (niveauGeneral === "lycee") {
      payload.level = `${serie} - ${level}`;
    } else if (niveauGeneral === "universite") {
      payload.level = niveauUniversitaire;
    }

   try {
  await API.post("/support-requests", payload);
  setSnackbarMessage("Demande de soutien envoyée !");
  setSnackbarSeverity("success");
  setSnackbarOpen(true);
  navigate("/premium/chat");
} catch (err) {
  console.error("Erreur envoi demande :", err);
  if (err.response?.status === 400 && err.response?.data?.message) {
    setSnackbarMessage(err.response.data.message);
  } else {
    setSnackbarMessage("Erreur lors de l’envoi.");
  }
  setSnackbarSeverity("error");
  setSnackbarOpen(true);
}

  };


 const getStatusBadge = (status) => {
  switch (status) {
    case "en_attente":
      return <span style={{ backgroundColor: "#ffeb3b", padding: "4px 8px", borderRadius: "8px" }}>🕓 En attente</span>;
    case "acceptee":
      return <span style={{ backgroundColor: "#4caf50", color: "white", padding: "4px 8px", borderRadius: "8px" }}>✅ Acceptée</span>;
    case "refusee":
      return <span style={{ backgroundColor: "#f44336", color: "white", padding: "4px 8px", borderRadius: "8px" }}>❌ Refusée</span>;
    case "terminee":
      return <span style={{ backgroundColor: "#9e9e9e", color: "white", padding: "4px 8px", borderRadius: "8px" }}>📁 Terminée</span>;
    default:
      return status;
  }
};



  return (
      <PageLayout>
  <Box sx={{ maxWidth: 600, mx: "auto", p: isSmallScreen ? 2 : 4, mt: isSmallScreen ? 4 : 8 }}>

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
        >
          <MenuItem value="college">Collège</MenuItem>
          <MenuItem value="lycee">Lycée</MenuItem>
          <MenuItem value="universite">Université</MenuItem>
        </Select>
      </FormControl>

      {niveauGeneral === "college" && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Classe</InputLabel>
          <Select value={level} onChange={(e) => setLevel(e.target.value)} required>
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
            <Select value={serie} onChange={(e) => setSerie(e.target.value)} required>
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
            <Select value={level} onChange={(e) => setLevel(e.target.value)} required>
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
        />
      )}

      <TextField
        label="Sujet / Thème"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        fullWidth
        required
        sx={{ mb: 2 }}
      />

      <TextField
        label="Description (facultatif)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={3}
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Type de soutien</InputLabel>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <MenuItem value="chat">Chat</MenuItem>
          <MenuItem value="visio">Visio</MenuItem>
        </Select>
      </FormControl>

      <Button variant="contained" type="submit" fullWidth>
        Envoyer la demande
      </Button>
    </form>
  </CardContent>
</Card>


<Box mt={6}>
  <Typography variant="h6" gutterBottom>
    📋 Mes demandes précédentes
  </Typography>

  {/* ✅ Filtre par statut */}
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
            <TableCell>{getStatusBadge(req.status)}</TableCell>
            <TableCell>
              {new Date(req.createdAt).toLocaleDateString()} à{" "}
              {new Date(req.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {req.status === "terminee" && (
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() =>
                    navigate(`/student/chat-history?teacher=${req.teacher._id}&student=${user._id}`)
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
  <MuiAlert onClose={handleCloseSnackbar} severity={snackbarSeverity} elevation={6} variant="filled">
    {snackbarMessage}
  </MuiAlert>
</Snackbar>


    </PageLayout>
  );
};

export default SupportRequestFormPage;
