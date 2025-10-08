// src/pages/admin/AdminDistributorsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Paper, Typography, Button, Stack, TextField, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Switch, FormControlLabel,
  Snackbar, Alert, Tooltip, Table, TableHead, TableRow, TableCell, TableBody,
  TableContainer, TablePagination, CircularProgress, Checkbox
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import API from "../../api";
import PageLayout from "../../components/PageLayout";

const emptyForm = {
  name: "",
  phone: "",
  contactName: "",
  contactPhone: "",
  region: "",
  city: "",
  address: "",
  latitude: "",
  longitude: "",
  openingHours: "",
  openingHoursType: "text", // ✅ "text" ou "structured"
  structuredHours: {
    monday: { open: "08:00", close: "18:00", closed: false },
    tuesday: { open: "08:00", close: "18:00", closed: false },
    wednesday: { open: "08:00", close: "18:00", closed: false },
    thursday: { open: "08:00", close: "18:00", closed: false },
    friday: { open: "08:00", close: "18:00", closed: false },
    saturday: { open: "08:00", close: "13:00", closed: false },
    sunday: { closed: true },
  },
  notes: "",
  isActive: true,
};

const regions = [
  "Niamey","Agadez","Diffa","Dosso","Maradi","Tahoua","Tillabéri","Zinder"
];

const AdminDistributorsPage = () => {
  // Table server-side
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [page, setPage] = useState(0);           // 0-index
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);

  // Filters
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");

  // Dialog/form
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  // Feedback
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  // ✅ Compteur de distributeurs sans GPS
  const noGpsCount = useMemo(() => {
    return rows.filter(row => {
      const lat = row.location?.coordinates?.[1] ?? row.latitude;
      const lng = row.location?.coordinates?.[0] ?? row.longitude;
      return lat == null || lng == null;
    }).length;
  }, [rows]);

  // -------- data fetch (server pagination) --------
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await API.get("/distributors", {
        params: {
          page: page + 1,           // backend souvent 1-index
          pageSize,
          search: q || undefined,
          region: region || undefined,
        },
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      const total = res.data?.total ?? res.data?.pagination?.total ?? list.length;
      setRows(list);
      setRowCount(total);
    } catch (e) {
      setSnack({ open: true, msg: e?.response?.data?.message || "Erreur chargement", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, [page, pageSize]);

  // Debounce pour la recherche/filtre
  useEffect(() => {
    const id = setTimeout(() => {
      setPage(0); // reset page quand on change le filtre/recherche
      fetchData();
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [q, region]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleOpenCreate = () => { resetForm(); setOpen(true); };
  const handleOpenEdit = (row) => {
    setEditingId(row._id);
    
    // ✅ Détection du type d'heures (texte ou structuré)
    const isStructured = typeof row.openingHours === "object" && row.openingHours !== null;
    
    setForm({
      name: row.name || "",
      phone: row.phone || "",
      contactName: row.contactName || "",
      contactPhone: row.contactPhone || "",
      region: row.region || "",
      city: row.city || "",
      address: row.address || "",
      latitude: row.location?.coordinates?.[1] ?? row.latitude ?? "",
      longitude: row.location?.coordinates?.[0] ?? row.longitude ?? "",
      openingHours: isStructured ? "" : (row.openingHours || ""),
      openingHoursType: isStructured ? "structured" : "text",
      structuredHours: isStructured ? row.openingHours : emptyForm.structuredHours,
      notes: row.notes || "",
      isActive: row.isActive !== false,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    // ✅ Construire le payload avec le bon format d'heures
    const payload = {
      name: form.name,
      contact: form.contactName,
      region: form.region,
      city: form.city,
      address: form.address,
      phone: form.phone,
      whatsapp: form.contactPhone,
      latitude: form.latitude !== "" ? Number(form.latitude) : undefined,
      longitude: form.longitude !== "" ? Number(form.longitude) : undefined,
      hasStock: form.hasStock,
      notes: form.notes,
      isActive: form.isActive,
      // ✅ Heures : envoyer le bon format selon le type
      openingHours: form.openingHoursType === "structured" 
        ? form.structuredHours 
        : (form.openingHours || null),
    };

    try {
      let res;
      if (editingId) {
        res = await API.put(`/distributors/${editingId}`, payload);
        let msg = "Distributeur mis à jour";
        // ✅ Afficher l'avertissement si coordonnées hors Niger
        if (res.data?.warning) {
          msg += ` ⚠️ ${res.data.warning}`;
        }
        setSnack({ open: true, msg, sev: res.data?.warning ? "warning" : "success" });
      } else {
        res = await API.post("/distributors", payload);
        let msg = "Distributeur créé";
        // ✅ Afficher l'avertissement si coordonnées hors Niger
        if (res.data?.warning) {
          msg += ` ⚠️ ${res.data.warning}`;
        }
        // ✅ Avertir si pas de coordonnées GPS
        if (!payload.latitude || !payload.longitude) {
          setSnack({ 
            open: true, 
            msg: "Distributeur créé, mais SANS coordonnées GPS. Il sera invisible pour les clients utilisant la géolocalisation.", 
            sev: "warning" 
          });
        } else {
          setSnack({ open: true, msg, sev: res.data?.warning ? "warning" : "success" });
        }
      }
      setOpen(false);
      resetForm();
      fetchData();
    } catch (e) {
      setSnack({ open: true, msg: e?.response?.data?.message || "Erreur sauvegarde", sev: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce distributeur ?")) return;
    try {
      await API.delete(`/distributors/${id}`);
      setSnack({ open: true, msg: "Distributeur supprimé", sev: "success" });
      // si la dernière ligne d'une page est supprimée, on peut remonter d'1 page
      if (rows.length === 1 && page > 0) setPage((p) => p - 1);
      else fetchData();
    } catch (e) {
      setSnack({ open: true, msg: e?.response?.data?.message || "Erreur suppression", sev: "error" });
    }
  };

  // ✅ Colonnes "virtuelles" pour le rendu avec badge
  const renderGeo = (row) => {
    const lat = row.location?.coordinates?.[1] ?? row.latitude;
    const lng = row.location?.coordinates?.[0] ?? row.longitude;
    if (lat == null || lng == null) {
      return <Chip label="Non géolocalisé" color="warning" size="small" variant="outlined" />;
    }
    const f = (v) => (typeof v === "number" ? v.toFixed(4) : v);
    return `${f(lat)}, ${f(lng)}`;
  };

  return (
    <PageLayout>
      <Box sx={{ p: 3, mt: 9 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Distributeurs Fahimta</Typography>
            {/* ✅ Compteur de distributeurs sans GPS */}
            {noGpsCount > 0 && (
              <Chip 
                label={`⚠️ ${noGpsCount} distributeur${noGpsCount > 1 ? 's' : ''} sans GPS sur cette page`}
                color="warning"
                size="small"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<RefreshRoundedIcon />} onClick={fetchData}>
              Actualiser
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleOpenCreate}>
              Nouveau distributeur
            </Button>
          </Stack>
        </Stack>

        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Rechercher (nom, ville, téléphone)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Région"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">Toutes</MenuItem>
              {regions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Stack>
        </Paper>

        <Paper sx={{ p: 0, borderRadius: 2, position: "relative" }}>
          {/* Overlay de chargement */}
          {loading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(255,255,255,0.6)",
                display: "grid",
                placeItems: "center",
                zIndex: 1,
                borderRadius: 2,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={56}>#</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Téléphone</TableCell>
                  <TableCell>Geo</TableCell>
                  <TableCell>Région</TableCell>
                  <TableCell>Ville</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
                        Aucun distributeur.
                      </Box>
                    </TableCell>
                  </TableRow>
                )}

                {rows.map((row, idx) => (
                  <TableRow key={row._id}>
                    <TableCell>{page * pageSize + idx + 1}</TableCell>
                    <TableCell>{row.name || "—"}</TableCell>
                    <TableCell>{row.phone || "—"}</TableCell>
                    <TableCell>{renderGeo(row)}</TableCell>
                    <TableCell>{row.region || "—"}</TableCell>
                    <TableCell>{row.city || "—"}</TableCell>
                    <TableCell>
                      {row.isActive ? (
                        <Chip label="Actif" color="success" size="small" />
                      ) : (
                        <Chip label="Inactif" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Modifier">
                          <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton size="small" color="error" onClick={() => handleDelete(row._id)}>
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
            count={rowCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      </Box>

      {/* Dialog create/edit */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? "Modifier le distributeur" : "Créer un distributeur"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Nom du point de vente *"
                fullWidth
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <TextField
                label="Téléphone *"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Contact (nom)"
                fullWidth
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
              />
              <TextField
                label="Contact (téléphone)"
                fullWidth
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Région"
                sx={{ minWidth: 220 }}
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              >
                <MenuItem value="">—</MenuItem>
                {regions.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
              <TextField
                label="Ville"
                fullWidth
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Stack>

            <TextField
              label="Adresse"
              fullWidth
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Latitude"
                type="number"
                fullWidth
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="Ex: 13.5116"
              />
              <TextField
                label="Longitude"
                type="number"
                fullWidth
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                placeholder="Ex: 2.1254"
              />
            </Stack>

            {/* ✅ Helper pour obtenir les coordonnées GPS */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: "info.lighter",
                border: "1px solid",
                borderColor: "info.light",
              }}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <HelpOutlineIcon fontSize="small" color="info" />
                  <Typography variant="body2" fontWeight={700} color="info.dark">
                    Comment obtenir les coordonnées GPS ?
                  </Typography>
                </Stack>
                
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  1. Cliquez sur le bouton ci-dessous pour ouvrir Google Maps
                  <br />
                  2. Recherchez l'adresse exacte du point de vente
                  <br />
                  3. Clic droit sur le lieu exact → les coordonnées s'affichent
                  <br />
                  4. Cliquez sur les coordonnées pour les copier automatiquement
                  <br />
                  5. Collez-les dans les champs Latitude et Longitude ci-dessus
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNewIcon />}
                  onClick={() => {
                    const addr = `${form.address || ''} ${form.city || ''} ${form.region || ''} Niger`.trim();
                    const url = addr && addr !== "Niger"
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
                      : "https://www.google.com/maps/@13.5116,2.1254,6z";
                    window.open(url, "_blank");
                  }}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Ouvrir Google Maps
                </Button>
              </Stack>
            </Box>

            {/* ✅ Section Horaires d'ouverture modernisée */}
            <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" fontWeight={700}>
                    Horaires d'ouverture
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="caption" color={form.openingHoursType === "text" ? "primary" : "text.secondary"}>
                      Texte libre
                    </Typography>
                    <Switch
                      checked={form.openingHoursType === "structured"}
                      onChange={(e) => setForm({ ...form, openingHoursType: e.target.checked ? "structured" : "text" })}
                      size="small"
                    />
                    <Typography variant="caption" color={form.openingHoursType === "structured" ? "primary" : "text.secondary"}>
                      Structuré
                    </Typography>
                  </Stack>
                </Stack>

                {form.openingHoursType === "text" ? (
                  <TextField
                    label="Horaires (texte libre)"
                    fullWidth
                    value={form.openingHours}
                    onChange={(e) => setForm({ ...form, openingHours: e.target.value })}
                    placeholder="Ex: Lun-Sam 8h-18h, Dim Fermé"
                    size="small"
                  />
                ) : (
                  <Stack spacing={1}>
                    {Object.keys(form.structuredHours).map((day) => {
                      const dayLabels = {
                        monday: "Lundi",
                        tuesday: "Mardi",
                        wednesday: "Mercredi",
                        thursday: "Jeudi",
                        friday: "Vendredi",
                        saturday: "Samedi",
                        sunday: "Dimanche"
                      };
                      return (
                        <Stack key={day} direction="row" spacing={1} alignItems="center">
                          <Typography sx={{ minWidth: 80, fontSize: 13 }}>{dayLabels[day]}</Typography>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={!form.structuredHours[day].closed}
                                onChange={(e) => setForm({
                                  ...form,
                                  structuredHours: {
                                    ...form.structuredHours,
                                    [day]: { ...form.structuredHours[day], closed: !e.target.checked }
                                  }
                                })}
                                size="small"
                              />
                            }
                            label="Ouvert"
                            sx={{ mr: 1 }}
                          />
                          {!form.structuredHours[day].closed && (
                            <>
                              <TextField
                                type="time"
                                size="small"
                                value={form.structuredHours[day].open}
                                onChange={(e) => setForm({
                                  ...form,
                                  structuredHours: {
                                    ...form.structuredHours,
                                    [day]: { ...form.structuredHours[day], open: e.target.value }
                                  }
                                })}
                                sx={{ width: 120 }}
                              />
                              <Typography variant="caption">à</Typography>
                              <TextField
                                type="time"
                                size="small"
                                value={form.structuredHours[day].close}
                                onChange={(e) => setForm({
                                  ...form,
                                  structuredHours: {
                                    ...form.structuredHours,
                                    [day]: { ...form.structuredHours[day], close: e.target.value }
                                  }
                                })}
                                sx={{ width: 120 }}
                              />
                            </>
                          )}
                        </Stack>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Box>

            <TextField
              label="Notes"
              fullWidth
              multiline
              minRows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(_, c) => setForm({ ...form, isActive: c })}
                />
              }
              label="Actif"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? "Enregistrer" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.sev} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
};

export default AdminDistributorsPage;
