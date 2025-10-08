// src/pages/admin/AdminContentRequestsPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import PageLayout from "../../components/PageLayout";
import API from "../../api";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";

const AdminContentRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filtres
  const [statusFilter, setStatusFilter] = useState("");

  // Dialog détail
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  // Snackbar
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const showSnack = (msg, sev = "success") => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // Charger les demandes
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await API.get("/content-requests/all", {
        params: {
          status: statusFilter || undefined,
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setRequests(res.data.requests || []);
      setTotal(res.data.pagination?.total || 0);
    } catch (error) {
      console.error("Erreur chargement demandes:", error);
      showSnack("Erreur chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, rowsPerPage, statusFilter]);

  const handleOpenDetail = (req) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setAdminNotes(req.adminNotes || "");
    setDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest) return;

    try {
      await API.patch(`/content-requests/${selectedRequest._id}`, {
        status: newStatus,
        adminNotes,
      });
      showSnack("✅ Demande mise à jour");
      setDialogOpen(false);
      fetchRequests();
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      showSnack("Erreur mise à jour", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette demande ?")) return;

    try {
      await API.delete(`/content-requests/${id}`);
      showSnack("✅ Demande supprimée");
      fetchRequests();
    } catch (error) {
      console.error("Erreur suppression:", error);
      showSnack("Erreur suppression", "error");
    }
  };

  const statusColors = {
    en_attente: "warning",
    en_cours: "info",
    terminee: "success",
    annulee: "error",
  };

  const statusLabels = {
    en_attente: "En attente",
    en_cours: "En cours",
    terminee: "Terminée",
    annulee: "Annulée",
  };

  const contentTypeLabels = {
    video: "Cours vidéo",
    livre: "Livre",
    exercices: "Exercices",
    fiche: "Fiche",
    autre: "Autre",
  };

  const subjectLabels = {
    maths: "Maths",
    physique: "Physique",
    chimie: "Chimie",
    svt: "SVT",
  };

  return (
    <PageLayout>
      <Box sx={{ p: 3, mt: 9 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={900}>
            ✨ Demandes de Contenu ({total})
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={fetchRequests} title="Actualiser">
              <RefreshRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Filtres */}
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <FilterListRoundedIcon color="action" />
            <TextField
              select
              label="Statut"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="en_attente">En attente</MenuItem>
              <MenuItem value="en_cours">En cours</MenuItem>
              <MenuItem value="terminee">Terminée</MenuItem>
              <MenuItem value="annulee">Annulée</MenuItem>
            </TextField>
          </Stack>
        </Paper>

        {/* Table */}
        <Paper sx={{ borderRadius: 2, position: "relative" }}>
          {loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(255,255,255,0.7)",
                display: "grid",
                placeItems: "center",
                zIndex: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Élève</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Matière</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Priorité</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Box sx={{ py: 3, color: "text.secondary" }}>
                        Aucune demande.
                      </Box>
                    </TableCell>
                  </TableRow>
                )}

                {requests.map((req) => (
                  <TableRow key={req._id} hover>
                    <TableCell>
                      <Typography fontWeight={700} variant="body2">
                        {req.student?.fullName || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.student?.phone || ""}
                      </Typography>
                    </TableCell>
                    <TableCell>{contentTypeLabels[req.contentType]}</TableCell>
                    <TableCell>{subjectLabels[req.subject]}</TableCell>
                    <TableCell>{req.level}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {req.description.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${req.priority}/5`} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusLabels[req.status]}
                        color={statusColors[req.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Voir détails">
                          <IconButton size="small" onClick={() => handleOpenDetail(req)}>
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(req._id)}
                          >
                            <DeleteRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page"
          />
        </Paper>
      </Box>

      {/* Dialog détails et modification */}
      {selectedRequest && (
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Typography variant="h6" fontWeight={800}>
              Demande de {selectedRequest.student?.fullName}
            </Typography>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Alert severity="info">
                📞 <strong>{selectedRequest.student?.phone || "Pas de téléphone"}</strong>
                <br />
                🏫 {selectedRequest.student?.schoolName || "—"} • 📍{" "}
                {selectedRequest.student?.city || "—"}
              </Alert>

              <Divider />

              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  Type de contenu :
                </Typography>
                <Typography>{contentTypeLabels[selectedRequest.contentType]}</Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Matière :
                  </Typography>
                  <Typography>{subjectLabels[selectedRequest.subject]}</Typography>
                </Box>
                <Box flex={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Niveau :
                  </Typography>
                  <Typography>{selectedRequest.level}</Typography>
                </Box>
              </Stack>

              {selectedRequest.chapter && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Chapitre / Thème :
                  </Typography>
                  <Typography>{selectedRequest.chapter}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Description complète :
                </Typography>
                <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedRequest.description}
                  </Typography>
                </Paper>
              </Box>

              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Priorité :
                  </Typography>
                  <Chip label={`${selectedRequest.priority}/5`} color="warning" />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Date :
                  </Typography>
                  <Typography>
                    {new Date(selectedRequest.createdAt).toLocaleString("fr-FR")}
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              {/* Modification statut */}
              <TextField
                select
                label="Statut"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                fullWidth
              >
                <MenuItem value="en_attente">En attente</MenuItem>
                <MenuItem value="en_cours">En cours</MenuItem>
                <MenuItem value="terminee">Terminée</MenuItem>
                <MenuItem value="annulee">Annulée</MenuItem>
              </TextField>

              <TextField
                label="Notes admin (privées)"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Ajoutez des notes internes..."
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button variant="contained" onClick={handleUpdateStatus}>
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={closeSnack} severity={snack.sev} variant="filled">
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default AdminContentRequestsPage;

