// // pages/admin/PartnerManagementPage.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box,
//   Grid,
//   Paper,
//   Typography,
//   TextField,
//   Button,
//   MenuItem,
//   Snackbar,
//   Alert,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   CircularProgress,
//   InputAdornment,
// } from "@mui/material";
// import PageLayout from "../../components/PageLayout";
// import API from "../../api";

// const PartnerManagementPage = () => {
//   // --- form state ---
//   const [fullName, setFullName] = useState("");
//   const [phone, setPhone] = useState("");
//   const [password, setPassword] = useState("");
//   const [passwordConfirm, setPasswordConfirm] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [region, setRegion] = useState("");
//   const [commissionDefaultCfa, setCommissionDefaultCfa] = useState(0);

//   const [creating, setCreating] = useState(false);

//   // --- list state ---
//   const [partners, setPartners] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [q, setQ] = useState("");

//   // --- feedback ---
//   const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

//   const regions = ["Niamey", "Dosso", "Maradi", "Zinder", "Tahoua", "Agadez", "Diffa", "Tillabéri"];

//   const fetchPartners = async () => {
//     try {
//       setLoading(true);
//       // ⚠️ backend attendu: GET /admin/partners  → renvoie la liste des users role=partner
//       const res = await API.get("/admin/partners");
//       setPartners(res.data || []);
//     } catch (e) {
//       setSnack({ open: true, type: "error", msg: e?.response?.data?.message || "Erreur de chargement." });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPartners();
//   }, []);

//   const resetForm = () => {
//     setFullName("");
//     setPhone("");
//     setPassword("");
//     setPasswordConfirm("");
//     setCompanyName("");
//     setRegion("");
//     setCommissionDefaultCfa(0);
//   };

//   const canSubmit = useMemo(() => {
//     if (!fullName?.trim()) return false;
//     if (!phone?.trim()) return false;
//     if (!password || password.length < 6) return false;
//     if (password !== passwordConfirm) return false;
//     return true;
//   }, [fullName, phone, password, passwordConfirm]);

//   const handleCreate = async () => {
//     if (!canSubmit) return;
//     setCreating(true);
//     try {
//       // ⚠️ backend attendu: POST /admin/partners (voir route donnée dans le message précédent)
//       await API.post("/admin/partners", {
//         fullName: fullName.trim(),
//         phone: phone.trim(),
//         password,
//         passwordConfirm,
//         companyName: companyName?.trim(),
//         region,
//         commissionDefaultCfa: Number(commissionDefaultCfa || 0),
//       });

//       setSnack({ open: true, type: "success", msg: "Partenaire créé avec succès." });
//       resetForm();
//       await fetchPartners();
//     } catch (e) {
//       setSnack({
//         open: true,
//         type: "error",
//         msg: e?.response?.data?.message || "Erreur lors de la création.",
//       });
//     } finally {
//       setCreating(false);
//     }
//   };

//   const filtered = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return partners;
//     return partners.filter((p) =>
//       [p.fullName, p.phone, p.companyName, p.region]
//         .filter(Boolean)
//         .some((x) => String(x).toLowerCase().includes(s))
//     );
//   }, [partners, q]);

//   return (
//     <PageLayout>
//       <Box p={4} mt={10}>
//         <Typography variant="h4" fontWeight="bold" mb={2}>
//           🤝 Gestion des partenaires
//         </Typography>
//         <Typography variant="body1" color="text.secondary" mb={3}>
//           Créer un partenaire distributeur et consulter la liste existante.
//         </Typography>

//         <Grid container spacing={3}>
//           {/* --- Create form --- */}
//           <Grid item xs={12} md={5}>
//             <Paper sx={{ p: 3, borderRadius: 2 }}>
//               <Typography variant="h6" fontWeight="bold" mb={2}>
//                 Créer un partenaire
//               </Typography>

//               <Grid container spacing={2}>
//                 <Grid item xs={12}>
//                   <TextField
//                     label="Nom complet"
//                     fullWidth
//                     value={fullName}
//                     onChange={(e) => setFullName(e.target.value)}
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <TextField
//                     label="Téléphone"
//                     fullWidth
//                     placeholder="ex: 22790000000"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Mot de passe"
//                     type="password"
//                     fullWidth
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     helperText="Min. 6 caractères"
//                   />
//                 </Grid>
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Confirmer mot de passe"
//                     type="password"
//                     fullWidth
//                     value={passwordConfirm}
//                     onChange={(e) => setPasswordConfirm(e.target.value)}
//                     error={!!password && !!passwordConfirm && password !== passwordConfirm}
//                     helperText={password && passwordConfirm && password !== passwordConfirm ? "Ne correspond pas" : " "}
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <TextField
//                     label="Entreprise (optionnel)"
//                     fullWidth
//                     value={companyName}
//                     onChange={(e) => setCompanyName(e.target.value)}
//                   />
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Région"
//                     select
//                     fullWidth
//                     value={region}
//                     onChange={(e) => setRegion(e.target.value)}
//                   >
//                     {regions.map((r) => (
//                       <MenuItem key={r} value={r}>{r}</MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>

//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     label="Commission par activation"
//                     type="number"
//                     fullWidth
//                     value={commissionDefaultCfa}
//                     onChange={(e) => setCommissionDefaultCfa(e.target.value)}
//                     InputProps={{
//                       startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
//                     }}
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Button
//                     variant="contained"
//                     fullWidth
//                     disabled={!canSubmit || creating}
//                     onClick={handleCreate}
//                   >
//                     {creating ? "Création..." : "Créer le partenaire"}
//                   </Button>
//                 </Grid>
//               </Grid>
//             </Paper>
//           </Grid>

//           {/* --- List --- */}
//           <Grid item xs={12} md={7}>
//             <Paper sx={{ p: 3, borderRadius: 2 }}>
//               <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
//                 <Typography variant="h6" fontWeight="bold">Liste des partenaires</Typography>
//                 <TextField
//                   size="small"
//                   placeholder="Rechercher…"
//                   value={q}
//                   onChange={(e) => setQ(e.target.value)}
//                 />
//               </Box>

//               {loading ? (
//                 <Box display="flex" justifyContent="center" py={5}>
//                   <CircularProgress />
//                 </Box>
//               ) : (
//                 <Table size="small">
//                   <TableHead>
//                     <TableRow>
//                       <TableCell>Nom</TableCell>
//                       <TableCell>Téléphone</TableCell>
//                       <TableCell>Entreprise</TableCell>
//                       <TableCell>Région</TableCell>
//                       <TableCell align="right">Commission (FCFA)</TableCell>
//                       <TableCell>Créé le</TableCell>
//                     </TableRow>
//                   </TableHead>
//                   <TableBody>
//                     {filtered.map((p) => (
//                       <TableRow key={p._id}>
//                         <TableCell>{p.fullName}</TableCell>
//                         <TableCell>{p.phone}</TableCell>
//                         <TableCell>{p.companyName || "—"}</TableCell>
//                         <TableCell>{p.region || "—"}</TableCell>
//                         <TableCell align="right">{Number(p.commissionDefaultCfa || 0).toLocaleString("fr-FR")}</TableCell>
//                         <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
//                       </TableRow>
//                     ))}
//                     {filtered.length === 0 && (
//                       <TableRow>
//                         <TableCell colSpan={6}>
//                           <Typography color="text.secondary">Aucun partenaire.</Typography>
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               )}
//             </Paper>
//           </Grid>
//         </Grid>

//         <Snackbar
//           open={snack.open}
//           autoHideDuration={3000}
//           onClose={() => setSnack((s) => ({ ...s, open: false }))}
//           anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//         >
//           <Alert
//             severity={snack.type}
//             onClose={() => setSnack((s) => ({ ...s, open: false }))}
//             variant="filled"
//           >
//             {snack.msg}
//           </Alert>
//         </Snackbar>
//       </Box>
//     </PageLayout>
//   );
// };

// export default PartnerManagementPage;



// pages/admin/PartnerManagementPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from "@mui/material";
import PageLayout from "../../components/PageLayout";
import API from "../../api";

const currency = (n) => Number(n || 0).toLocaleString("fr-FR");
const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");

const PartnerManagementPage = () => {
  // --- form state (création) ---
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [region, setRegion] = useState("");
  const [commissionDefaultCfa, setCommissionDefaultCfa] = useState(0);
  const [creating, setCreating] = useState(false);

  // --- list state (partenaires) ---
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // --- lots pour assignation ---
  const [batchOptions, setBatchOptions] = useState([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignPartner, setAssignPartner] = useState(null);
  const [assignBatchId, setAssignBatchId] = useState("");
  const [assignCount, setAssignCount] = useState(1);
  const [assignLoading, setAssignLoading] = useState(false);

  // --- modal "voir cartes" ---
  const [viewOpen, setViewOpen] = useState(false);
  const [viewPartner, setViewPartner] = useState(null);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codesItems, setCodesItems] = useState([]);
  const [codesStatus, setCodesStatus] = useState("all"); // all | activated | used
  const [codesQuery, setCodesQuery] = useState("");

  // --- feedback ---
  const [snack, setSnack] = useState({ open: false, type: "success", msg: "" });

  const regions = ["Niamey", "Dosso", "Maradi", "Zinder", "Tahoua", "Agadez", "Diffa", "Tillabéri"];

  // ===== fetchers
  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/partners");
      setPartners(res.data || []);
    } catch (e) {
      setSnack({ open: true, type: "error", msg: e?.response?.data?.message || "Erreur de chargement." });
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchOptions = async () => {
    try {
      // Liste des lots (admin)
      const res = await API.get("/payments/codes");
      const opts = (res.data || []).map((b) => {
        // Éligibles = cartes activées, non utilisées et non encore assignées
        const eligible = (b.codes || []).filter(
          (c) => !c.used && !c.partner && c.status === "activated"
        ).length;
        return {
          batchId: b.batchId,
          type: b.type,
          price: b.price,
          eligible,
          createdAt: b.createdAt,
        };
      });
      setBatchOptions(opts);
    } catch (e) {
      setSnack({ open: true, type: "error", msg: "Impossible de charger les lots." });
    }
  };

  useEffect(() => {
    fetchPartners();
    fetchBatchOptions();
  }, []);

  // ===== création partenaire
  const resetForm = () => {
    setFullName("");
    setPhone("");
    setPassword("");
    setPasswordConfirm("");
    setCompanyName("");
    setRegion("");
    setCommissionDefaultCfa(0);
  };

  const canSubmit = useMemo(() => {
    if (!fullName?.trim()) return false;
    if (!phone?.trim()) return false;
    if (!password || password.length < 6) return false;
    if (password !== passwordConfirm) return false;
    return true;
  }, [fullName, phone, password, passwordConfirm]);

  const handleCreate = async () => {
    if (!canSubmit) return;
    setCreating(true);
    try {
      await API.post("/admin/partners", {
        fullName: fullName.trim(),
        phone: phone.trim(),
        password,
        passwordConfirm,
        companyName: companyName?.trim(),
        region,
        commissionDefaultCfa: Number(commissionDefaultCfa || 0),
      });
      setSnack({ open: true, type: "success", msg: "Partenaire créé avec succès." });
      resetForm();
      await fetchPartners();
    } catch (e) {
      setSnack({
        open: true,
        type: "error",
        msg: e?.response?.data?.message || "Erreur lors de la création.",
      });
    } finally {
      setCreating(false);
    }
  };

  // ===== filtre tableau partenaires
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return partners;
    return partners.filter((p) =>
      [p.fullName, p.phone, p.companyName, p.region]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(s))
    );
  }, [partners, q]);

  // ===== assignation
  const handleOpenAssign = (partner) => {
    setAssignPartner(partner);
    setAssignBatchId("");
    setAssignCount(1);
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!assignPartner?._id || !assignBatchId || assignCount <= 0) return;
    setAssignLoading(true);
    try {
      await API.post("/payments/assign-codes", {
        batchId: assignBatchId,
        partnerId: assignPartner._id,
        count: Number(assignCount),
      });
      setSnack({ open: true, type: "success", msg: "Cartes assignées avec succès." });
      setAssignOpen(false);
      await fetchBatchOptions();
      await fetchPartners();
      // enchaîne: ouvre la vue pour montrer le résultat
      handleOpenView(assignPartner);
    } catch (e) {
      setSnack({
        open: true,
        type: "error",
        msg: e?.response?.data?.message || "Erreur lors de l’assignation.",
      });
    } finally {
      setAssignLoading(false);
    }
  };

  const selectedBatch = batchOptions.find((b) => b.batchId === assignBatchId);
  const maxEligible = selectedBatch?.eligible || 0;

  // ===== voir cartes (modal)
  const fetchPartnerCodes = async (partnerId, status = "all") => {
    setCodesLoading(true);
    try {
      // Endpoint admin pour consulter les cartes d’un partenaire :
      // GET /api/admin/partners/:partnerId/codes?status=all|activated|used
      const res = await API.get(`/admin/partners/${partnerId}/codes`, {
        params: { status },
      });
      setCodesItems(res.data?.items || []);
    } catch (e) {
      setSnack({
        open: true,
        type: "error",
        msg: e?.response?.data?.message || "Erreur lors du chargement des cartes.",
      });
      setCodesItems([]);
    } finally {
      setCodesLoading(false);
    }
  };

  const handleOpenView = (partner) => {
    setViewPartner(partner);
    setViewOpen(true);
    setCodesStatus("all");
    setCodesQuery("");
    fetchPartnerCodes(partner._id, "all");
  };

  const visibleCodes = useMemo(() => {
    const s = codesQuery.trim().toLowerCase();
    if (!s) return codesItems;
    return codesItems.filter((c) =>
      [c.code, c.batchId, c.type].filter(Boolean).some((x) => String(x).toLowerCase().includes(s))
    );
  }, [codesItems, codesQuery]);

  return (
    <PageLayout>
      <Box p={4} mt={10}>
        <Typography variant="h4" fontWeight="bold" mb={2}>
          🤝 Gestion des partenaires
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Créer un partenaire distributeur et consulter la liste existante. Vous pouvez aussi <b>assigner</b> et <b>visualiser</b> les cartes.
        </Typography>

        <Grid container spacing={3}>
          {/* --- Create form --- */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                Créer un partenaire
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Nom complet"
                    fullWidth
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Téléphone"
                    fullWidth
                    placeholder="ex: 22790000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Mot de passe"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="Min. 6 caractères"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Confirmer mot de passe"
                    type="password"
                    fullWidth
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    error={!!password && !!passwordConfirm && password !== passwordConfirm}
                    helperText={
                      password && passwordConfirm && password !== passwordConfirm ? "Ne correspond pas" : " "
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Entreprise (optionnel)"
                    fullWidth
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Région"
                    select
                    fullWidth
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    {regions.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Commission par activation"
                    type="number"
                    fullWidth
                    value={commissionDefaultCfa}
                    onChange={(e) => setCommissionDefaultCfa(e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">FCFA</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!canSubmit || creating}
                    onClick={handleCreate}
                  >
                    {creating ? "Création..." : "Créer le partenaire"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* --- List --- */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6" fontWeight="bold">Liste des partenaires</Typography>
                <Box display="flex" gap={1}>
                  <TextField
                    size="small"
                    placeholder="Rechercher…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <Button size="small" onClick={fetchPartners}>Rafraîchir</Button>
                </Box>
              </Box>

              {loading ? (
                <Box display="flex" justifyContent="center" py={5}>
                  <CircularProgress />
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell>Téléphone</TableCell>
                      <TableCell>Entreprise</TableCell>
                      <TableCell>Région</TableCell>
                      <TableCell align="right">Commission (FCFA)</TableCell>
                      <TableCell>Créé le</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell>{p.fullName}</TableCell>
                        <TableCell>{p.phone}</TableCell>
                        <TableCell>{p.companyName || "—"}</TableCell>
                        <TableCell>{p.region || "—"}</TableCell>
                        <TableCell align="right">{currency(p.commissionDefaultCfa)}</TableCell>
                        <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenAssign(p)}
                            sx={{ mr: 1 }}
                          >
                            Assigner des cartes
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOpenView(p)}
                          >
                            Voir cartes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography color="text.secondary">Aucun partenaire.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Dialog assignation */}
        <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>
            Assigner des cartes à {assignPartner?.fullName || "—"}
          </DialogTitle>
          <DialogContent dividers>
            <Box mt={1} display="grid" gap={2}>
              <TextField
                select
                label="Lot (batchId)"
                value={assignBatchId}
                onChange={(e) => setAssignBatchId(e.target.value)}
                fullWidth
              >
                {batchOptions.map((b) => (
                  <MenuItem key={b.batchId} value={b.batchId}>
                    {b.batchId} — {b.type} — {currency(b.price)} FCFA · éligibles: {b.eligible}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="number"
                label="Quantité"
                value={assignCount}
                onChange={(e) => setAssignCount(Number(e.target.value))}
                inputProps={{ min: 1, max: Math.max(1, maxEligible) }}
                fullWidth
              />

              <Typography variant="body2" color="text.secondary">
                <b>Éligibles</b> = cartes <b>activées</b>, non utilisées et non encore assignées.
                <br />
                Si un lot n’a aucune carte éligible, active d’abord le lot depuis la page des codes.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignOpen(false)}>Annuler</Button>
            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={!assignBatchId || !assignPartner || assignCount <= 0 || assignLoading}
            >
              {assignLoading ? "Assignation..." : "Assigner"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog voir cartes */}
        <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>
            Cartes de {viewPartner?.fullName || "—"}
          </DialogTitle>
          <DialogContent dividers>
            <Box display="flex" gap={2} mb={2} flexWrap="wrap">
              <TextField
                select
                size="small"
                label="Statut"
                value={codesStatus}
                onChange={async (e) => {
                  const v = e.target.value;
                  setCodesStatus(v);
                  if (viewPartner?._id) await fetchPartnerCodes(viewPartner._id, v);
                }}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="activated">Activés (commercialement)</MenuItem>
                <MenuItem value="used">Utilisés (par un élève)</MenuItem>
              </TextField>

              <TextField
                size="small"
                placeholder="Filtrer par code / lot / type…"
                value={codesQuery}
                onChange={(e) => setCodesQuery(e.target.value)}
                sx={{ flex: 1, minWidth: 240 }}
              />
              <Button onClick={() => viewPartner && fetchPartnerCodes(viewPartner._id, codesStatus)}>
                Rafraîchir
              </Button>
            </Box>

            {codesLoading ? (
              <Box display="flex" justifyContent="center" py={5}>
                <CircularProgress />
              </Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Lot</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Valeur (FCFA)</TableCell>
                    <TableCell>Assigné</TableCell>
                    <TableCell>Activé</TableCell>
                    <TableCell>Vendu</TableCell>
                    <TableCell>Utilisé</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleCodes.map((c) => (
                    <TableRow key={c.code}>
                      <TableCell>{c.code}</TableCell>
                      <TableCell>{c.batchId}</TableCell>
                      <TableCell>{c.type}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={c.status}
                          color={c.status === "used" ? "success" : c.status === "activated" ? "info" : "default"}
                        />
                      </TableCell>
                      <TableCell align="right">{currency(c.faceValueCfa)}</TableCell>
                      <TableCell>{fmtDate(c.assignedAt)}</TableCell>
                      <TableCell>{fmtDate(c.activatedAt)}</TableCell>
                      <TableCell>{fmtDate(c.soldAt)}</TableCell>
                      <TableCell>{fmtDate(c.usedAt)}</TableCell>
                    </TableRow>
                  ))}
                  {visibleCodes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Typography color="text.secondary">Aucune carte trouvée.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snack.type}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
            variant="filled"
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </PageLayout>
  );
};

export default PartnerManagementPage;
