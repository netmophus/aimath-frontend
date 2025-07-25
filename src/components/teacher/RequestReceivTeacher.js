import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Paper,
  Button,
    Card,
  CircularProgress,
  TableContainer,
  TablePagination,

} from "@mui/material";
import API from "../../api";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext"; // adapte ce chemin si besoin


const RequestReceivTeacher = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
const navigate = useNavigate();

const [userId, setUserId] = useState(null);
const { user } = useContext(AuthContext);
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5);

const paginatedRequests = requests.slice(
  page * rowsPerPage,
  page * rowsPerPage + rowsPerPage
);


 useEffect(() => {
  if (requests.length > 0 && user) {
    requests.forEach((req) => {
      console.log("🔍 DEBUG req.teacher:", req.teacher);
      console.log("🔍 DEBUG user._id:", user._id);
    });
  }
}, [requests, user]);


  const fetchRequests = async () => {
  try {
   const [reqRes, userRes] = await Promise.all([
  API.get("/teachers/support-requests"),
  API.get("/teachers/me")
]);

setRequests(reqRes.data);
setUserId(userRes.data._id);
  } catch (err) {
    console.error("Erreur chargement demandes ou utilisateur :", err);
  } finally {
    setLoading(false);
  }
};


  // const handleAction = async (id, newStatus) => {
  //   try {
  //     await API.put(`/teachers/support-requests/${id}`, { status: newStatus });

  //     setRequests((prev) =>
  //       prev.map((r) =>
  //         r._id === id ? { ...r, status: newStatus } : r
  //       )
  //     );      
  //   } catch (err) {
  //     console.error("Erreur mise à jour :", err);
  //   }
  // };


  const handleAction = async (id, newStatus) => {
  try {
    const res = await API.put(`/teachers/support-requests/${id}`, { status: newStatus });

    const updatedRequest = res.data;

    setRequests((prev) =>
      prev.map((r) =>
        r._id === id ? updatedRequest : r
      )
    );
  } catch (err) {
    console.error("Erreur mise à jour :", err);
  }
};


  const traduireStatut = (status) => {
    switch (status) {
      case "en_attente":
        return "Envoyée";
      case "acceptee":
        return "Acceptée";
      case "refusee":
        return "Refusée";
      case "terminee":
        return "Terminée";
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

 return (
  <Box sx={{ mt: 4, px: { xs: 2, md: 4 } }}>
    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        📬 Demandes de soutien reçues
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : requests.length === 0 ? (
        <Typography>Aucune demande reçue.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 500 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <TableCell><strong>Sujet</strong></TableCell>
                <TableCell><strong>Niveau</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Élève</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRequests.map((req) => (
                <TableRow key={req._id}>
                  <TableCell>{req.topic}</TableCell>
                  <TableCell>{req.level}</TableCell>
                  <TableCell>{req.type}</TableCell>
                  <TableCell>{traduireStatut(req.status)}</TableCell>
                  <TableCell>{req.student?.fullName || "—"}</TableCell>
                  <TableCell>
                    {new Date(req.createdAt).toLocaleDateString()}{" "}
                    {new Date(req.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Select
                        value={req.status}
                        onChange={(e) => handleAction(req._id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value="en_attente">Envoyée</MenuItem>
                        <MenuItem value="acceptee">Acceptée</MenuItem>
                        <MenuItem value="refusee">Refusée</MenuItem>
                        <MenuItem value="terminee">Terminée</MenuItem>
                      </Select>

                      {req.status === "acceptee" &&
                        req.sessionStarted &&
                        req.teacher === userId && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              navigate(`/teacher/chat?student=${req.student._id}`)
                            }
                          >
                            Accéder au chat
                          </Button>
                        )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}


      <TablePagination
  component="div"
  count={requests.length}
  page={page}
  onPageChange={(e, newPage) => setPage(newPage)}
  rowsPerPage={rowsPerPage}
  onRowsPerPageChange={(e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }}
  labelRowsPerPage="Lignes par page"
  rowsPerPageOptions={[5, 10, 25]}
/>

    </Card>
  </Box>
);







};

export default RequestReceivTeacher;
