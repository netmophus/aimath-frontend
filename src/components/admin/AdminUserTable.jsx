import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  Paper,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Checkbox,
  IconButton,
  Tooltip,
  TableSortLabel,
  LinearProgress,
  Alert,
  Menu,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleIcon from "@mui/icons-material/People";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import SchoolIcon from "@mui/icons-material/School";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import SmsIcon from "@mui/icons-material/Sms";
import CampaignIcon from "@mui/icons-material/Campaign";
import API from "../../api";
import UserDetailDrawer from "./UserDetailDrawer"; // ✅ Import du drawer

// ✅ Debounce hook
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const AdminUserTable = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]); // IDs sélectionnés
  const [anchorEl, setAnchorEl] = useState(null); // Menu actions
  const [stats, setStats] = useState(null);

  // ✅ Filtres
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    subscription: "",
  });

  // ✅ Tri
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // ✅ Snackbar
  const [message, setMessage] = useState({ open: false, text: "", severity: "info" });

  // ✅ Drawer pour détails utilisateur
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // ✅ SMS Modal
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [smsRecipient, setSmsRecipient] = useState(null);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsSending, setSmsSending] = useState(false);

  // ✅ SMS Marketing Modal
  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [marketingMessage, setMarketingMessage] = useState("");
  const [marketingSending, setMarketingSending] = useState(false);
  const [estimatedRecipients, setEstimatedRecipients] = useState(0);

  // ✅ Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: debouncedSearch,
        role: filters.role,
        status: filters.status,
        subscription: filters.subscription,
        sortBy,
        sortOrder,
      };

      const res = await API.get(`/admin/users`, { params });
      setUsers(res.data.users);
      setTotalUsers(res.data.totalUsers);
      setStats(res.data.stats); // ✅ Stats globales
    } catch (err) {
      console.error("❌ Erreur lors du chargement des utilisateurs", err);
      setMessage({ open: true, text: "Erreur de chargement", severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, filters, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Toggle status individuel
  const handleToggleStatus = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/toggle`);
      fetchUsers();
      setMessage({ open: true, text: "Statut modifié !", severity: "success" });
    } catch (err) {
      console.error("❌ Erreur changement de statut", err);
      setMessage({ open: true, text: err.response?.data?.message || "Erreur", severity: "error" });
    }
  };

  // ✅ Sélection multiple
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(users.map((u) => u._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelectOne = (userId) => {
    if (selected.includes(userId)) {
      setSelected(selected.filter((id) => id !== userId));
    } else {
      setSelected([...selected, userId]);
    }
  };

  // ✅ Actions groupées
  const handleBulkAction = async (action) => {
    if (selected.length === 0) {
      setMessage({ open: true, text: "Aucun utilisateur sélectionné", severity: "warning" });
      return;
    }

    try {
      const res = await API.post(`/admin/users/bulk-action`, { userIds: selected, action });
      setMessage({ open: true, text: res.data.message, severity: "success" });
      setSelected([]);
      fetchUsers();
    } catch (err) {
      console.error("❌ Erreur actions groupées", err);
      setMessage({ open: true, text: err.response?.data?.message || "Erreur", severity: "error" });
    }
    setAnchorEl(null);
  };

  // ✅ Export CSV
  const handleExportCSV = async () => {
    try {
      const params = {
        role: filters.role,
        status: filters.status,
        subscription: filters.subscription,
      };
      const res = await API.get(`/admin/users/export`, { params, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `users_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage({ open: true, text: "Export réussi !", severity: "success" });
    } catch (err) {
      console.error("❌ Erreur export CSV", err);
      setMessage({ open: true, text: "Erreur lors de l'export", severity: "error" });
    }
  };

  // ✅ Tri par colonne
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // ✅ Reset filtres
  const handleResetFilters = () => {
    setSearch("");
    setFilters({ role: "", status: "", subscription: "" });
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(0);
  };

  const isAllSelected = users.length > 0 && selected.length === users.length;
  const isSomeSelected = selected.length > 0 && selected.length < users.length;

  // ✅ Ouvrir les détails d'un utilisateur
  const handleViewDetails = (userId) => {
    setSelectedUserId(userId);
    setDrawerOpen(true);
  };

  // ✅ Ouvrir la modal SMS
  const handleOpenSmsModal = (user) => {
    setSmsRecipient(user);
    setSmsMessage("");
    setSmsModalOpen(true);
  };

  // ✅ Envoyer un SMS
  const handleSendSMS = async () => {
    if (!smsMessage.trim()) {
      setMessage({ open: true, text: "Le message ne peut pas être vide", severity: "warning" });
      return;
    }

    try {
      setSmsSending(true);
      const res = await API.post(`/admin/users/${smsRecipient._id}/send-sms`, { 
        message: smsMessage 
      });
      setMessage({ open: true, text: res.data.message, severity: "success" });
      setSmsModalOpen(false);
      setSmsMessage("");
    } catch (err) {
      console.error("❌ Erreur envoi SMS", err);
      setMessage({ 
        open: true, 
        text: err.response?.data?.message || "Erreur lors de l'envoi du SMS", 
        severity: "error" 
      });
    } finally {
      setSmsSending(false);
    }
  };

  // ✅ Envoyer un SMS groupé
  const handleSendBulkSMS = async () => {
    if (selected.length === 0) {
      setMessage({ open: true, text: "Aucun utilisateur sélectionné", severity: "warning" });
      return;
    }

    const message = prompt("Entrez le message à envoyer à tous les utilisateurs sélectionnés:");
    if (!message || !message.trim()) {
      return;
    }

    try {
      const res = await API.post(`/admin/users/send-bulk-sms`, { 
        userIds: selected, 
        message 
      });
      setMessage({ open: true, text: res.data.message, severity: "success" });
      setSelected([]);
    } catch (err) {
      console.error("❌ Erreur envoi SMS groupé", err);
      setMessage({ 
        open: true, 
        text: err.response?.data?.message || "Erreur lors de l'envoi des SMS", 
        severity: "error" 
      });
    }
  };

  // ✅ Ouvrir la modal marketing
  const handleOpenMarketingModal = () => {
    setEstimatedRecipients(totalUsers);
    setMarketingMessage("");
    setMarketingModalOpen(true);
  };

  // ✅ Envoyer un SMS marketing à tous
  const handleSendMarketingSMS = async () => {
    if (!marketingMessage.trim()) {
      setMessage({ open: true, text: "Le message ne peut pas être vide", severity: "warning" });
      return;
    }

    // Confirmation avant envoi
    const confirmed = window.confirm(
      `⚠️ Vous êtes sur le point d'envoyer un SMS à environ ${estimatedRecipients} utilisateurs.\n\nVoulez-vous continuer ?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMarketingSending(true);
      const res = await API.post(`/admin/users/send-marketing-sms`, { 
        message: marketingMessage,
        filters: {
          role: filters.role,
          status: filters.status,
          subscription: filters.subscription,
        }
      });
      setMessage({ open: true, text: res.data.message, severity: "success" });
      setMarketingModalOpen(false);
      setMarketingMessage("");
    } catch (err) {
      console.error("❌ Erreur envoi SMS marketing", err);
      setMessage({ 
        open: true, 
        text: err.response?.data?.message || "Erreur lors de l'envoi de la campagne SMS", 
        severity: "error" 
      });
    } finally {
      setMarketingSending(false);
    }
  };

  return (
    <Box>
      {/* ✅ Statistiques en haut */}
      {stats && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} sm={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h5" fontWeight={800}>{stats.total}</Typography>
                <Typography variant="caption" color="text.secondary">Total</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                <Typography variant="h5" fontWeight={800}>{stats.active}</Typography>
                <Typography variant="caption" color="text.secondary">Actifs</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <SchoolIcon color="info" sx={{ fontSize: 40 }} />
                <Typography variant="h5" fontWeight={800}>{stats.students}</Typography>
                <Typography variant="caption" color="text.secondary">Élèves</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card elevation={2}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <CardMembershipIcon color="warning" sx={{ fontSize: 40 }} />
                <Typography variant="h5" fontWeight={800}>{stats.subscribed}</Typography>
                <Typography variant="caption" color="text.secondary">Abonnés</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={800} gutterBottom>
          📋 Gestion des utilisateurs
        </Typography>

        {/* ✅ Barre de recherche et filtres */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
          <TextField
            label="Recherche (nom, téléphone, email, école)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Rôle</InputLabel>
            <Select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })} label="Rôle">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="student">Élève</MenuItem>
              <MenuItem value="teacher">Enseignant</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Statut</InputLabel>
            <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} label="Statut">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="active">Actif</MenuItem>
              <MenuItem value="inactive">Inactif</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Abonnement</InputLabel>
            <Select value={filters.subscription} onChange={(e) => setFilters({ ...filters, subscription: e.target.value })} label="Abonnement">
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="subscribed">Abonné</MenuItem>
              <MenuItem value="not-subscribed">Non abonné</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* ✅ Actions groupées et export */}
        <Stack direction="row" spacing={2} mb={2} alignItems="center">
          {selected.length > 0 && (
            <>
              <Typography variant="body2" fontWeight={700}>
                {selected.length} sélectionné(s)
              </Typography>
              <Button
                variant="contained"
                color="success"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleBulkAction("activate")}
              >
                Activer
              </Button>
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<CancelIcon />}
                onClick={() => handleBulkAction("deactivate")}
              >
                Désactiver
              </Button>
              <Button
                variant="contained"
                color="info"
                size="small"
                startIcon={<SmsIcon />}
                onClick={handleSendBulkSMS}
              >
                Envoyer SMS
              </Button>
            </>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button 
            variant="contained" 
            size="small" 
            color="warning"
            startIcon={<CampaignIcon />} 
            onClick={handleOpenMarketingModal}
          >
            Campagne SMS
          </Button>
          <Button variant="outlined" size="small" startIcon={<FileDownloadIcon />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="outlined" size="small" onClick={handleResetFilters}>
            Réinitialiser
          </Button>
        </Stack>

        {/* ✅ Message d'alerte */}
        {message.open && (
          <Alert severity={message.severity} onClose={() => setMessage({ ...message, open: false })} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* ✅ Loading bar */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* ✅ Table */}
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={isSomeSelected}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "fullName"}
                    direction={sortBy === "fullName" ? sortOrder : "asc"}
                    onClick={() => handleSort("fullName")}
                  >
                    <strong>Nom</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "phone"}
                    direction={sortBy === "phone" ? sortOrder : "asc"}
                    onClick={() => handleSort("phone")}
                  >
                    <strong>Téléphone</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell><strong>École</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Abonnement</strong></TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "createdAt"}
                    direction={sortBy === "createdAt" ? sortOrder : "asc"}
                    onClick={() => handleSort("createdAt")}
                  >
                    <strong>Inscription</strong>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && users.length === 0 ? (
                // Skeleton loader
                Array.from({ length: rowsPerPage }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton variant="rectangular" height={40} />
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">Aucun utilisateur trouvé</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user._id}
                    hover
                    selected={selected.includes(user._id)}
                    sx={{ "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(user._id)}
                        onChange={() => handleSelectOne(user._id)}
                      />
                    </TableCell>
                    <TableCell>{user.fullName || "—"}</TableCell>
                    <TableCell>{user.phone || "—"}</TableCell>
                    <TableCell>{user.schoolName || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? "Actif" : "Inactif"}
                        color={user.isActive ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isSubscribed ? "Oui" : "Non"}
                        color={user.isSubscribed ? "success" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Voir détails">
                          <IconButton size="small" color="info" onClick={() => handleViewDetails(user._id)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Envoyer un SMS">
                          <IconButton size="small" color="primary" onClick={() => handleOpenSmsModal(user)}>
                            <SmsIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive ? "Désactiver" : "Activer"}>
                          <IconButton
                            size="small"
                            color={user.isActive ? "error" : "success"}
                            onClick={() => handleToggleStatus(user._id)}
                          >
                            {user.isActive ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>

        {/* ✅ Pagination */}
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Lignes par page :"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} sur ${count !== -1 ? count : `plus de ${to}`}`}
        />
      </Paper>

      {/* ✅ Drawer détails utilisateur */}
      <UserDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userId={selectedUserId}
      />

      {/* ✅ Modal envoi SMS */}
      <Dialog 
        open={smsModalOpen} 
        onClose={() => setSmsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          📱 Envoyer un SMS
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {smsRecipient && (
            <Box mb={2} p={2} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="body2" color="text.secondary">
                <strong>Destinataire:</strong> {smsRecipient.fullName || "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Téléphone:</strong> {smsRecipient.phone || "N/A"}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message"
            value={smsMessage}
            onChange={(e) => setSmsMessage(e.target.value)}
            placeholder="Entrez votre message..."
            variant="outlined"
            helperText={`${smsMessage.length} caractères`}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmsModalOpen(false)} disabled={smsSending}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSendSMS} 
            disabled={smsSending || !smsMessage.trim()}
            startIcon={smsSending ? <CircularProgress size={20} /> : <SmsIcon />}
          >
            {smsSending ? "Envoi..." : "Envoyer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Modal campagne SMS marketing */}
      <Dialog 
        open={marketingModalOpen} 
        onClose={() => !marketingSending && setMarketingModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "warning.light", color: "warning.contrastText" }}>
          📢 Campagne SMS Marketing
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={700}>
              ⚠️ Envoi massif de SMS
            </Typography>
            <Typography variant="body2">
              Ce message sera envoyé à environ <strong>{estimatedRecipients} utilisateurs</strong>
              {(filters.role || filters.status || filters.subscription) && " (selon les filtres appliqués)"}.
            </Typography>
          </Alert>

          {(filters.role || filters.status || filters.subscription) && (
            <Box mb={2} p={2} bgcolor="info.lighter" borderRadius={1}>
              <Typography variant="body2" fontWeight={700} mb={1}>
                📊 Filtres actifs:
              </Typography>
              {filters.role && (
                <Chip label={`Rôle: ${filters.role}`} size="small" sx={{ mr: 1, mb: 1 }} />
              )}
              {filters.status && (
                <Chip label={`Statut: ${filters.status}`} size="small" sx={{ mr: 1, mb: 1 }} />
              )}
              {filters.subscription && (
                <Chip label={`Abonnement: ${filters.subscription}`} size="small" sx={{ mr: 1, mb: 1 }} />
              )}
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={6}
            label="Message marketing"
            value={marketingMessage}
            onChange={(e) => setMarketingMessage(e.target.value)}
            placeholder="Ex: 🎉 Promotion spéciale! Bénéficiez de 20% de réduction sur votre abonnement..."
            variant="outlined"
            helperText={`${marketingMessage.length} caractères`}
            disabled={marketingSending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarketingModalOpen(false)} disabled={marketingSending}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            color="warning"
            onClick={handleSendMarketingSMS} 
            disabled={marketingSending || !marketingMessage.trim()}
            startIcon={marketingSending ? <CircularProgress size={20} /> : <CampaignIcon />}
          >
            {marketingSending ? "Envoi en cours..." : `Envoyer à ${estimatedRecipients} utilisateurs`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserTable;