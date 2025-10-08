import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  CircularProgress,
  TablePagination,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Stack,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PageLayout from "../../components/PageLayout";
import API from "../../api";
import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import QRCode from "qrcode";




const AdminAccessCodePage = () => {
  const [allBatches, setAllBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("mensuel");
  const [quantity, setQuantity] = useState(1);

  // ✅ Pagination (0-based pour TablePagination)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ Recherche et filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [batchCodes, setBatchCodes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [price, setPrice] = useState("");

  const [selectedBatch, setSelectedBatch] = useState(null);

const SITE_URL = "https://myfahimta.com";
const PHONE = "+227 80 64 83 83";
// Si ton logo est dans /public/assets/icon.png :
const LOGO_URL = `${window.location.origin}/assets/icon.png`;

// const handlePrintPDF = async () => {
//   const doc = new jsPDF("p", "mm", "a4");
//   const pageWidth = 210;
//   const pageHeight = 297;

//   // ✅ Cartes plus petites (seule modification)
//   const cardWidth = 55;   // avant: 85 mm
//   const cardHeight = 35;  // avant: 54 mm
//   const margin = 8;       // avant: 10 mm
//   const spaceX = 4;       // avant: 5 mm
//   const spaceY = 4;       // avant: 5 mm

//   let x = margin;
//   let y = margin;

//   const lotPrice = selectedBatch?.price || "—";

//   for (let i = 0; i < batchCodes.length; i++) {
//     const code = batchCodes[i];

//     const qrDataUrl = await QRCode.toDataURL(code.code);

//     // ⚠️ On ne change rien ici : même canvas / même mise en page
//     const canvas = document.createElement("canvas");
//     canvas.width = 340;
//     canvas.height = 216;
//     const ctx = canvas.getContext("2d");
//     const cardPrice = code.price || "—";

//     // Carte encadrée
//     ctx.fillStyle = "#ffffff";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.strokeStyle = "#000";
//     ctx.lineWidth = 4;
//     ctx.strokeRect(0, 0, canvas.width, canvas.height);

//     // Texte
//     ctx.fillStyle = "#000";
//     ctx.font = "20px Arial";
//     ctx.fillText("FAHIMTA", 20, 40);

//     ctx.font = "14px Arial";
//     ctx.fillText(`Code : ${code.code}`, 20, 80);
//     ctx.fillText(`Prix : ${cardPrice} FCFA`, 20, 110);

//     const statut =
//       code.status === "used" ? "✅ Utilisé"
//       : code.status === "activated" ? "🔓 Activé"
//       : "🔒 Non activé";
//     ctx.fillText(`Statut : ${statut}`, 20, 140);

//     ctx.fillText("www.fahimta.com", 20, 180);

//     // QR code
//     const qrImg = new Image();
//     qrImg.src = qrDataUrl;
//     await new Promise((resolve) => {
//       qrImg.onload = () => {
//         ctx.drawImage(qrImg, 220, 60, 80, 80);
//         resolve();
//       };
//     });

//     const imgData = canvas.toDataURL("image/png");

//     // 👉 Seul le rendu dans le PDF est réduit (image downscalée)
//     doc.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);

//     x += cardWidth + spaceX;
//     if (x + cardWidth > pageWidth - margin) {
//       x = margin;
//       y += cardHeight + spaceY;
//     }
//     if (y + cardHeight > pageHeight - margin) {
//       doc.addPage();
//       x = margin;
//       y = margin;
//     }
//   }

//   doc.save(`lot-${selectedBatch?.batchId || "fahimta"}.pdf`);
// };



const handlePrintPDF = async () => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = 210;
  const pageHeight = 297;

  // ✅ Dimensions inchangées
  const cardWidth = 55;
  const cardHeight = 35;
  const margin = 8;
  const spaceX = 4;
  const spaceY = 4;

  let x = margin;
  let y = margin;

  const defaultLotPrice = selectedBatch?.price ?? null;

  for (let i = 0; i < batchCodes.length; i++) {
    const code = batchCodes[i];

    // --- N° de série robuste (utilise code.serial si dispo, sinon _id, sinon lot+index) ---
    const serial =
      code.serial ||
      code._id ||
      `${selectedBatch?.batchId || "BATCH"}-${String(i + 1).padStart(4, "0")}`;

    // QR vers le site (exigence)
    const qrDataUrl = await QRCode.toDataURL(SITE_URL);

    // Canvas source haute résolution (puis downscale dans le PDF)
    const canvas = document.createElement("canvas");
    canvas.width = 340;
    canvas.height = 216;
    const ctx = canvas.getContext("2d");

    // Fond + bordure
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    const padding = 14;
    const leftX = padding;
    const rightX = canvas.width - padding;

    // --- En-tête (marque) ---
    const headerY = 34;
    ctx.fillStyle = "#000";
    ctx.font = "bold 22px Arial";
    ctx.fillText("FAHIMTA", leftX, headerY);

    // --- Bloc infos à gauche : Code, Prix, Statut, N° Série ---
    let lineY = headerY + 22;

    // Code (plus lisible pour limiter les problèmes après grattage)
    ctx.font = "bold 18px Arial";
    ctx.fillText("Code :", leftX, lineY);
    ctx.font = "bold 18px Arial";
    ctx.fillText(String(code.code || ""), leftX + 70, lineY);
    lineY += 22;

    // Prix
    const cardPrice = (code.price ?? defaultLotPrice) ?? "—";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Prix :", leftX, lineY);
    ctx.font = "16px Arial";
    ctx.fillText(`${cardPrice} FCFA`, leftX + 70, lineY);
    lineY += 20;

    // Statut
    const statut =
      code.status === "used" ? "✅ Utilisé"
      : code.status === "activated" ? "🔓 Activé"
      : "🔒 Non activé";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Statut :", leftX, lineY);
    ctx.font = "16px Arial";
    ctx.fillText(statut, leftX + 70, lineY);
    lineY += 20;


     // N° Série (clé de secours)
    ctx.font = "bold 16px Arial";
    ctx.fillText("N° Série : ", leftX, lineY);
    ctx.font = "12px Arial";
    ctx.fillText(String(serial), leftX + 70, lineY);
    lineY += 18;

    // --- QR à droite ---
    const qrSize = 88;
    const qrImg = new Image();
    qrImg.src = qrDataUrl;
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.onerror = resolve;
    });
    ctx.drawImage(qrImg, rightX - qrSize, headerY - 4, qrSize, qrSize);

    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Scannez pour visiter", rightX, headerY - 4 + qrSize + 14);
    ctx.textAlign = "left";

    // --- Bas de carte ---
    // // 1) URL du site (au-dessus)
    // ctx.font = "bold 14px Arial";
    // ctx.fillText(SITE_URL.replace(/^https?:\/\//, ""), leftX, canvas.height - padding - 24);

    // 2) ⚠️ Mention légale très petite (juste au-dessus du téléphone)
    ctx.font = "10px Arial";
    ctx.fillText(
      "Les cartes ne sont ni échangées, ni retournées, ni remboursées une fois vendues.",
      leftX,
      canvas.height - padding - 8
    );

    // 3) Téléphone (reste là où il est, tout en bas)
    ctx.font = "bold 14px Arial";
    ctx.fillText(PHONE, leftX, canvas.height - padding - 22);

    // Image -> PDF avec nos dimensions (55x35 mm)
    const imgData = canvas.toDataURL("image/png");
    doc.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);

    // Placement multi-cartes
    x += cardWidth + spaceX;
    if (x + cardWidth > pageWidth - margin) {
      x = margin;
      y += cardHeight + spaceY;
    }
    if (y + cardHeight > pageHeight - margin) {
      doc.addPage();
      x = margin;
      y = margin;
    }
  }

  doc.save(`lot-${selectedBatch?.batchId || "fahimta"}.pdf`);
};




const loadBatchCodes = async (batchId) => {
  try {
    const res = await API.get(`/payments/codes/by-batch/${batchId}`);
    setBatchCodes(res.data.codes);
    setSelectedBatchId(batchId);
    setModalOpen(true);
  } catch (error) {
    console.error("Erreur chargement lot :", error);
    alert("Erreur lors du chargement des codes de ce lot.");
  }
};


  const fetchCodes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/payments/codes");
      const data = res.data || [];
      setAllBatches(data);
      setFilteredBatches(data);
    } catch (err) {
      console.error("Erreur lors du chargement des lots", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  // Fonction de filtrage
  const applyFilters = useCallback(() => {
    let filtered = [...allBatches];

    // Filtre par recherche (batchId)
    if (searchTerm) {
      filtered = filtered.filter(batch =>
        batch.batchId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par type
    if (typeFilter) {
      filtered = filtered.filter(batch => batch.type === typeFilter);
    }

    // Filtre par statut (basé sur les codes utilisés)
    if (statusFilter) {
      if (statusFilter === "used") {
        filtered = filtered.filter(batch => 
          batch.codes && batch.codes.some(c => c.used)
        );
      } else if (statusFilter === "unused") {
        filtered = filtered.filter(batch => 
          batch.codes && batch.codes.every(c => !c.used)
        );
      }
    }

    setFilteredBatches(filtered);
    setPage(0); // Reset à la première page quand on filtre
  }, [allBatches, searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination côté client
  const paginatedBatches = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredBatches.slice(start, start + rowsPerPage);
  }, [filteredBatches, page, rowsPerPage]);

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setPage(0);
  };

  // Statistiques
  const stats = {
    totalLots: allBatches.length,
    mensuel: allBatches.filter(b => b.type === "mensuel").length,
    annuel: allBatches.filter(b => b.type === "annuel").length,
    totalCodes: allBatches.reduce((sum, b) => sum + (b.totalCodes || 0), 0),
    usedCodes: allBatches.reduce((sum, b) => 
      sum + (b.codes?.filter(c => c.used).length || 0), 0
    )
  };

  const generateCodes = async () => {
    if (quantity < 1) return;
    try {
      await API.post("/payments/generate-codes", { type, quantity,  price,  });
      await fetchCodes();
    } catch (err) {
      alert("Erreur lors de la génération : " + (err.response?.data?.message || ""));
    }
  };


  const handleActivateAll = async () => {
  try {
    await API.post("/payments/activate-batch", { batchId: selectedBatchId });
    await loadBatchCodes(selectedBatchId); // recharge les codes
    alert("Tous les codes ont été activés.");
  } catch (error) {
    console.error("Erreur activation groupée :", error);
    alert("Erreur lors de l’activation des codes.");
  }
};


  return (
    <PageLayout>
      <Box p={4} mt={10}>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          🎫 Gestion des cartes d’abonnement
        </Typography>

        {/* Génération */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>Générer de nouvelles cartes</Typography>
          <Box display="flex" gap={2}>
            <TextField
              label="Type"
              select
              value={type}
              onChange={(e) => setType(e.target.value)}
              sx={{ width: 150 }}
            >
              <MenuItem value="mensuel">Mensuel</MenuItem>
              <MenuItem value="annuel">Annuel</MenuItem>
            </TextField>


<TextField
  label="Prix (FCFA)"
  type="number"
  value={price}
  onChange={(e) => setPrice(Number(e.target.value))}
  sx={{ width: 150 }}
/>




           <TextField
  label="Quantité"
  type="number"
  value={quantity === 0 ? '' : quantity}
  onChange={(e) => {
    const value = e.target.value.replace(/^0+/, ''); // Enlève les zéros en tête
    setQuantity(value === '' ? 0 : Number(value));
  }}
  sx={{ width: 150 }}
  inputProps={{ min: 1 }}
/>


            <Button variant="contained" onClick={generateCodes}>
              Générer
            </Button>
          </Box>
        </Paper>

        {/* Cartes de statistiques */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stats.totalLots}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Lots
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {stats.mensuel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lots Mensuels
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {stats.annuel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lots Annuels
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {stats.totalCodes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Codes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h4" color="error.main" fontWeight="bold">
                  {stats.usedCodes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Codes Utilisés
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Barre de recherche et filtres */}
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            🔍 Recherche et Filtres
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              placeholder="Recherche par lot (batchId)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="mensuel">Mensuel</MenuItem>
                <MenuItem value="annuel">Annuel</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="used">Avec codes utilisés</MenuItem>
                <MenuItem value="unused">Tous non utilisés</MenuItem>
              </Select>
            </FormControl>

            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleResetFilters}
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#e3f2fd',
                  color: '#1565c0'
                },
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                minWidth: '120px'
              }}
            >
              🔄 Réinitialiser
            </Button>
          </Stack>
        </Paper>

        {/* Liste des lots */}
        <Paper>
          <Typography variant="h6" p={2}>Lots générés</Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Lot</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Prix</TableCell>

                    <TableCell>Total</TableCell>
                    <TableCell>Utilisés</TableCell>
                    <TableCell>Généré par</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          {searchTerm || typeFilter || statusFilter 
                            ? "Aucun lot ne correspond aux filtres." 
                            : "Aucun lot pour le moment."}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBatches.map((batch) => (
                      <TableRow key={batch._id} onClick={() => loadBatchCodes(batch.batchId)} style={{ cursor: 'pointer' }} hover>

                        <TableCell>{batch.batchId}</TableCell>
                        <TableCell>{batch.type}</TableCell>
                        <TableCell>{batch.price ? `${batch.price} FCFA` : "—"}</TableCell>

                        <TableCell>{batch.totalCodes}</TableCell>
                        <TableCell>{batch.codes.filter(c => c.used).length}</TableCell>
                        <TableCell>{batch.generatedBy?.fullName || "—"}</TableCell>
                        
                        <TableCell>{new Date(batch.createdAt).toLocaleDateString()}</TableCell>
                        
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* ✅ TablePagination */}
              <TablePagination
                component="div"
                count={filteredBatches.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Lignes par page:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                }
                sx={{ 
                  borderTop: '1px solid #e0e0e0',
                  '& .MuiTablePagination-toolbar': {
                    paddingLeft: 2,
                    paddingRight: 2,
                  }
                }}
              />
            </>
          )}
        </Paper>


<>



        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
  <DialogTitle>🧾 Codes du lot {selectedBatchId}</DialogTitle>
  <DialogContent dividers>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Code</TableCell>
          <TableCell>Statut</TableCell>
           <TableCell>Prix</TableCell> {/* 👉 Ajouté ici */}
          <TableCell>Utilisé par</TableCell>
          <TableCell>Créé le</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {batchCodes.map(code => (
          <TableRow key={code._id}>
            <TableCell>{code.code}</TableCell>
           {/* <TableCell>
  {code.status === "used"
    ? "✅ Utilisé"
    : code.status === "activated"
    ? "🔓 Activé"
    : "🔒 Non activé"}
</TableCell> */}


<TableCell>
  {code.status === "used"
    ? "✅ Utilisé"
    : code.status === "activated"
    ? "🔓 Activé"
    : "🔒 Non activé"}
</TableCell>



<TableCell>
  {code.price ? `${code.price} FCFA` : "— FCFA"}
</TableCell>


<TableCell>
  {code.usedBy
    ? `${code.usedBy.fullName} (${code.usedBy.phone}) - ${code.usedBy.schoolName}, ${code.usedBy.city}`
    : "—"}
</TableCell>

            <TableCell>{new Date(code.createdAt).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Boutons d’action */}
    <Box mt={3} display="flex" justifyContent="space-between">
     <Button variant="outlined" onClick={handlePrintPDF}>
  🖨️ Imprimer les cartes (PDF)
</Button>

      {/* <Button
        variant="contained"
        color="primary"
        onClick={handleActivateAll}
        disabled={batchCodes.filter(c => !c.activated && !c.used).length === 0}
      >
        ✅ Activer tous les codes non activés
      </Button> */}




      <Button
      variant="contained"
      color="primary"
      onClick={handleActivateAll}
      disabled={!batchCodes.some(c => c.status === "generated")}
    >
      ✅ Activer tous les codes non activés
    </Button>



    </Box>
  </DialogContent>
</Dialog>

</>


      </Box>
    </PageLayout>
  );
};

export default AdminAccessCodePage;
