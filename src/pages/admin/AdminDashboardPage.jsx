
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


// +++++ imports à AJOUTER en haut +++++
import {
  Drawer,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Toolbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

import { useNavigate } from "react-router-dom";
import PageLayout from "../../components/PageLayout";
import API from "../../api";
import AdminUserTable from "../../components/admin/AdminUserTable";

const AdminDashboardPage = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
const [selectedBatchId, setSelectedBatchId] = useState("");
const [teacherCount, setTeacherCount] = useState(0);


const [payReport, setPayReport] = useState(null);
const [recentPays, setRecentPays] = useState([]);
const [period, setPeriod] = useState("30d");

// ---- NEW: tiroir paiements ----
const [payDrawerOpen, setPayDrawerOpen] = useState(false);
const [payMethodTab, setPayMethodTab] = useState("nita"); // "nita" | "scratch"
const [paySearch, setPaySearch] = useState("");
const [payPage, setPayPage] = useState(0);
const [payRowsPerPage, setPayRowsPerPage] = useState(10);













// ---- Tiroir "utilisateurs sans abonnement" ----
const [noSubOpen, setNoSubOpen] = useState(false);
const [noSubItems, setNoSubItems] = useState([]);
const [noSubTotal, setNoSubTotal] = useState(0);
const [noSubPage, setNoSubPage] = useState(0);            // index UI (0-based)
const [noSubRowsPerPage, setNoSubRowsPerPage] = useState(10);
const [noSubSearch, setNoSubSearch] = useState("");
const [noSubLoading, setNoSubLoading] = useState(false);

const openNoSubDrawer = () => setNoSubOpen(true);
const closeNoSubDrawer = () => setNoSubOpen(false);

const fmtDateOnly = (iso) => (iso ? new Date(iso).toLocaleString("fr-FR") : "—");

const loadNoSubUsers = async () => {
  setNoSubLoading(true);
  try {
    const page = noSubPage + 1; // backend 1-based
    const limit = noSubRowsPerPage;
    const params = { page, limit };
    if (noSubSearch.trim()) params.q = noSubSearch.trim();

    const r = await API.get("/payments/users/without-subscriptions", { params });
    setNoSubItems(r.data.items || []);
    setNoSubTotal(r.data.total || 0);
  } catch (e) {
    console.error("no-sub load error:", e?.message);
  } finally {
    setNoSubLoading(false);
  }
};

// recharge quand le tiroir est ouvert / pagination change
useEffect(() => {
  if (!noSubOpen) return;
  loadNoSubUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [noSubOpen, noSubPage, noSubRowsPerPage]);

// recherche avec petit debounce
useEffect(() => {
  if (!noSubOpen) return;
  const t = setTimeout(() => {
    setNoSubPage(0);
    loadNoSubUsers();
  }, 300);
  return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [noSubSearch]);
















const openPayDrawer = (method) => {
  setPayMethodTab(method);
  setPaySearch("");
  setPayPage(0);
  setPayDrawerOpen(true);
};
const closePayDrawer = () => setPayDrawerOpen(false);

const fmtCFA = (n=0) => (n || 0).toLocaleString("fr-FR") + " FCFA";
const fmtDate = (iso) => new Date(iso).toLocaleString("fr-FR");




useEffect(() => {
  const loadReport = async () => {
    const r = await API.get(`/payments/report`, { params: { period } });
    setPayReport(r.data);
    const last = await API.get(`/payments/recent`, { params: { limit: 30 } });
    setRecentPays(last.data);
  };
  loadReport();
}, [period]);


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

{
  title: "Tutoriels vidéo 🎥",
  description: "Gérer les vidéos tutorielles affichées dans le modal d'aide.",
  buttonLabel: "Gérer les tutoriels",
  onClick: () => navigate("/admin/tutorials"),
},

{
  title: "Bibliothèque pour Étudiants 📚",
  description: "Gérer les livres de la bibliothèque organisés par matière (Médecine, Biologie, Mathématiques, etc.).",
  buttonLabel: "Gérer la bibliothèque",
  onClick: () => navigate("/admin/library"),
},


  
  ];

  return (
    <PageLayout>
    <Box p={4} mt={10}>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        🎛️ Tableau de bord Admin
      </Typography>


{payReport && (
  <Box my={4}>
    <Grid container alignItems="center" spacing={2} mb={2}>
      <Grid item xs>
        <Typography variant="h6">💳 Reporting paiements</Typography>
      </Grid>
      <Grid item>
        <TextField
          select
          label="Période"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="7d">7 derniers jours</MenuItem>
          <MenuItem value="30d">30 jours</MenuItem>
          <MenuItem value="month">Mois en cours</MenuItem>
          <MenuItem value="all">Tout</MenuItem>
        </TextField>
      </Grid>
    </Grid>

    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2">Total paiements</Typography>
          <Typography variant="h6" fontWeight={800}>
            {payReport.totals.count} opérations
          </Typography>
          <Typography color="text.secondary">
            {fmtCFA(payReport.totals.amount)}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2">NITA</Typography>
          <Typography variant="h6" fontWeight={800}>
            {payReport.methods.nita.count} opés
          </Typography>
          <Typography color="text.secondary">
            {fmtCFA(payReport.methods.nita.amount)}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2">Carte à gratter</Typography>
          <Typography variant="h6" fontWeight={800}>
            {payReport.methods.scratch.count} opés
          </Typography>
          <Typography color="text.secondary">
            {fmtCFA(payReport.methods.scratch.amount)}
          </Typography>
        </Paper>
      </Grid>

      {payReport.methods.unknown?.count > 0 && (
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2">Non classés</Typography>
            <Typography variant="h6" fontWeight={800}>
              {payReport.methods.unknown.count} opés
            </Typography>
            <Typography color="text.secondary">
              {fmtCFA(payReport.methods.unknown.amount)}
            </Typography>
          </Paper>
        </Grid>
      )}
    </Grid>



 <Grid container spacing={1} sx={{ mt: 1 }}>
  <Grid item>
    <Button variant="outlined" onClick={() => openPayDrawer("nita")}>
      Voir paiements NITA
    </Button>
  </Grid>
  <Grid item>
    <Button variant="outlined" onClick={() => openPayDrawer("scratch")}>
      Voir paiements Carte
    </Button>
  </Grid>
  {/* <Grid item>
    <Button variant="contained" onClick={openNoSubDrawer}>
      Utilisateurs sans abonnement
    </Button>
  </Grid> */}
</Grid>


  </Box>
)}






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

<Drawer
  anchor="right"
  open={payDrawerOpen}
  onClose={closePayDrawer}
  PaperProps={{ sx: { width: { xs: "100%", sm: 560 } } }}
>
  <Toolbar sx={{ px: 2 }}>
    <Typography variant="h6" sx={{ flex: 1, fontWeight: 800 }}>
      Paiements (30 derniers)
    </Typography>
    <IconButton onClick={closePayDrawer}>
      <CloseIcon />
    </IconButton>
  </Toolbar>

  {/* Onglets NITA / Carte */}
  <Box sx={{ px: 2 }}>
    <Tabs
      value={payMethodTab}
      onChange={(_, v) => { setPayMethodTab(v); setPayPage(0); }}
      sx={{
        "& .MuiTab-root": { textTransform: "none", fontWeight: 800 },
        mb: 1,
      }}
    >
      <Tab value="nita" label="NITA" />
      <Tab value="scratch" label="Carte" />
    </Tabs>

    {/* Recherche */}
    <TextField
      fullWidth
      size="small"
      placeholder="Rechercher (référence ou téléphone)…"
      value={paySearch}
      onChange={(e) => { setPaySearch(e.target.value); setPayPage(0); }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={{ mb: 1 }}
    />
  </Box>

  {/* Tableau paginé */}
  <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", height: "100%" }}>
    {(() => {
      // Filtre méthode
      const byMethod = recentPays.filter(p => p.method === payMethodTab);
      // Filtre recherche
      const q = paySearch.trim().toLowerCase();
      const filtered = !q
        ? byMethod
        : byMethod.filter(p =>
            String(p.reference || "").toLowerCase().includes(q) ||
            String(p.phone || "").toLowerCase().includes(q)
          );

      const paged = filtered.slice(
        payPage * payRowsPerPage,
        payPage * payRowsPerPage + payRowsPerPage
      );

      return (
        <>
          <TableContainer component={Paper} sx={{ flex: 1, overflow: "auto", borderRadius: 2 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Référence</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell align="right">Montant</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map(row => (
                  <TableRow key={row._id} hover>
                    <TableCell>{fmtDate(row.paidAt)}</TableCell>
                    <TableCell>{row.reference}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell align="right">{fmtCFA(row.amount)}</TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        Aucun résultat.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            labelRowsPerPage="Lignes par page"
            rowsPerPageOptions={[5, 10, 20]}
            count={filtered.length}
            page={payPage}
            onPageChange={(_, p) => setPayPage(p)}
            rowsPerPage={payRowsPerPage}
            onRowsPerPageChange={(e) => {
              setPayRowsPerPage(parseInt(e.target.value, 10));
              setPayPage(0);
            }}
          />
        </>
      );
    })()}
  </Box>
</Drawer>


<Drawer
  anchor="right"
  open={noSubOpen}
  onClose={closeNoSubDrawer}
  PaperProps={{ sx: { width: { xs: "100%", sm: 720 } } }}
>
  <Toolbar sx={{ px: 2 }}>
    <Typography variant="h6" sx={{ flex: 1, fontWeight: 800 }}>
      Utilisateurs sans abonnement
    </Typography>
    <IconButton onClick={closeNoSubDrawer}>
      <CloseIcon />
    </IconButton>
  </Toolbar>

  <Box sx={{ px: 2, pb: 2, display: "flex", flexDirection: "column", height: "100%" }}>
    {/* Recherche */}
    <TextField
      fullWidth
      size="small"
      placeholder="Rechercher (nom ou téléphone)…"
      value={noSubSearch}
      onChange={(e) => setNoSubSearch(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={{ mb: 1 }}
    />

    {/* Tableau */}
    <TableContainer component={Paper} sx={{ flex: 1, overflow: "auto", borderRadius: 2 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell>Téléphone</TableCell>
            <TableCell>Rôle</TableCell>
            <TableCell>Créé le</TableCell>
            <TableCell>Dernière connexion</TableCell>
            <TableCell>Fin d’abonnement</TableCell>
            <TableCell>Dernier paiement</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {noSubLoading ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  Chargement…
                </Typography>
              </TableCell>
            </TableRow>
          ) : noSubItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>
                <Typography variant="body2" color="text.secondary">
                  Aucun utilisateur.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            noSubItems.map((u) => (
              <TableRow key={u._id} hover>
                <TableCell>{u.fullName || "—"}</TableCell>
                <TableCell>{u.phone || "—"}</TableCell>
                <TableCell>{u.role || "—"}</TableCell>
                <TableCell>{fmtDateOnly(u.createdAt)}</TableCell>
                <TableCell>{fmtDateOnly(u.lastLoginAt)}</TableCell>
                <TableCell>{fmtDateOnly(u.subscriptionEnd)}</TableCell>
                <TableCell>
                  {u.lastPaymentAt
                    ? `${fmtDateOnly(u.lastPaymentAt)} (${(u.lastPaymentAmount || 0).toLocaleString("fr-FR")} FCFA)`
                    : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>

    <TablePagination
      component="div"
      labelRowsPerPage="Lignes par page"
      rowsPerPageOptions={[5, 10, 20, 50]}
      count={noSubTotal}
      page={noSubPage}
      onPageChange={(_, p) => setNoSubPage(p)}
      rowsPerPage={noSubRowsPerPage}
      onRowsPerPageChange={(e) => {
        setNoSubRowsPerPage(parseInt(e.target.value, 10));
        setNoSubPage(0);
      }}
    />
  </Box>
</Drawer>



  
    </PageLayout>
  );
};

export default AdminDashboardPage;
