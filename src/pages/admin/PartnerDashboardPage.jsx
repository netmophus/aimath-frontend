


// pages/admin/PartnerDashboardPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Stack,
  CircularProgress,
  useMediaQuery,
  Fab,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  TextField,
  Alert,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import PageLayout from "../../components/PageLayout";
import API from "../../api";
import { useNavigate } from "react-router-dom";

// Icons (MUI)
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import PhoneIphoneRoundedIcon from "@mui/icons-material/PhoneIphoneRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import SavingsRoundedIcon from "@mui/icons-material/SavingsRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ViewKanbanRoundedIcon from "@mui/icons-material/ViewKanbanRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
  QrCode as QrCodeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Sell as SellIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";

const currency = (n) => `${Number(n || 0).toLocaleString("fr-FR")} FCFA`;
const fmtDateTime = (d) => {
  if (!d) return "—";
  const x = new Date(d);
  return Number.isNaN(x.getTime()) ? "—" : x.toLocaleString("fr-FR");
};
const maskCode = (s) => (s ? String(s).replace(/.(?=.{4})/g, "•") : "—");

const toneBg = (theme, paletteKey) =>
  alpha(theme.palette[paletteKey].main, theme.palette.mode === "dark" ? 0.18 : 0.10);
const toneBorder = (theme, paletteKey) =>
  alpha(theme.palette[paletteKey].main, theme.palette.mode === "dark" ? 0.36 : 0.22);

const PartnerDashboardPage = () => {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState(null);
  const [codes, setCodes] = useState([]);
  const [me, setMe] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [qrDialog, setQrDialog] = useState({ open: false, card: null });
  const [sellDialog, setSellDialog] = useState({ open: false, card: null });
  const [sellForm, setSellForm] = useState({
    studentName: "",
    studentPhone: "+227",
    paymentMethod: "cash",
    notes: "",
  });
  const [selling, setSelling] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");

        const meRes = await API.get("/auth/me");
        if (!alive) return;
        setMe(meRes.data);

        const s = await API.get("/payments/partners/my-stats");
        if (!alive) return;
        setStats(s.data);

        const c = await API.get("/payments/partners/my-codes?status=all");
        if (!alive) return;
        setCodes(Array.isArray(c.data?.items) ? c.data.items : []);
      } catch (e) {
        if (!alive) return;
        console.error("Partner dashboard fetch error:", e?.response?.data || e?.message);
        setErr(e?.response?.data?.message || "Erreur de chargement.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // valeur faciale majoritaire
  const faceValue = useMemo(() => {
    if (!codes.length) return 0;
    const freq = new Map();
    for (const c of codes) {
      const v = Number(c.faceValueCfa || 0);
      if (v) freq.set(v, (freq.get(v) || 0) + 1);
    }
    if (!freq.size) return 0;
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }, [codes]);

  const summary = useMemo(() => {
    const assigned = Number(stats?.assigned || 0);
    const sold = Number(stats?.sold || 0);
    const activated = Number(stats?.used || 0);
    const remaining = Math.max(0, assigned - sold);
    const activationRate = sold > 0 ? (activated / sold) * 100 : 0;
    const grossSales = sold * faceValue;
    const commissionTotal = Number(stats?.commissionCfa || 0);
    // La commission est par carte vendue, pas par activation
    const commissionPerSale = sold > 0 ? Math.round(commissionTotal / sold) : 0;
    return {
      assigned,
      sold,
      activated,
      remaining,
      activationRate,
      grossSales,
      commissionTotal,
      commissionPerSale,
      faceValue,
    };
  }, [stats, faceValue]);

  const recentActivations = useMemo(
    () =>
      codes
        .filter((c) => c.status === "used")
        .sort((a, b) => new Date(b.usedAt || 0) - new Date(a.usedAt || 0))
        .slice(0, 10)
        .map((c) => ({
          codeMasked: c.codeMasked ?? maskCode(c.code),
          student: "—",
          date: fmtDateTime(c.usedAt),
          amount: c.faceValueCfa || faceValue,
          status: "Activée",
        })),
    [codes, faceValue]
  );

  const batches = useMemo(() => {
    const map = new Map();
    for (const c of codes) {
      const key = c.batchId || "—";
      if (!map.has(key))
        map.set(key, { batchId: key, total: 0, used: 0, faceValue: c.faceValueCfa || faceValue });
      const b = map.get(key);
      b.total += 1;
      if (c.status === "used") b.used += 1;
      if (!b.faceValue && c.faceValueCfa) b.faceValue = c.faceValueCfa;
    }
    return [...map.values()].sort((a, b) => String(a.batchId).localeCompare(String(b.batchId)));
  }, [codes, faceValue]);

  const onExportCSV = useCallback(() => {
    const header = [
      "batchId",
      "code",
      "status",
      "faceValueCfa",
      "assignedAt",
      "activatedAt",
      "soldAt",
      "commissionCfa",
      "usedAt",
    ];
    const rows = codes.map((c) =>
      [
        c.batchId,
        c.code,
        c.status,
        c.faceValueCfa || "",
        c.assignedAt || "",
        c.activatedAt || "",
        c.soldAt || "",
        c.commissionCfa || 0,
        c.usedAt || "",
      ]
        .map((x) => `"${String(x || "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mes-codes-partenaire.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [codes]);

  // Fonctions pour gérer l'affichage des cartes
  const handleCopyCode = useCallback((code) => {
    // Extraire seulement la partie après "FAH-"
    const codeToCopy = code.includes('FAH-') ? code.split('FAH-')[1] : code;
    navigator.clipboard.writeText(codeToCopy);
    setSnackbar({
      open: true,
      message: `Code ${codeToCopy} copié dans le presse-papiers!`,
    });
  }, []);

  const handleShowQR = useCallback((card) => {
    setQrDialog({ open: true, card });
  }, []);

  const handleCloseQR = useCallback(() => {
    setQrDialog({ open: false, card: null });
  }, []);

  // Fonctions pour gérer la vente
  const handleSellCard = useCallback((card) => {
    setSellDialog({ open: true, card });
    setSellForm({
      studentName: "",
      studentPhone: "",
      paymentMethod: "cash",
      notes: "",
    });
  }, []);

  const handleCloseSellDialog = useCallback(() => {
    setSellDialog({ open: false, card: null });
    setSellForm({
      studentName: "",
      studentPhone: "+227",
      paymentMethod: "cash",
      notes: "",
    });
    setSelling(false);
    setStudentInfo(null);
    setLoadingStudent(false);
  }, []);

  const handleSellFormChange = useCallback((field, value) => {
    setSellForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Fonction pour rechercher l'élève par téléphone
  const searchStudentByPhone = useCallback(async (phone) => {
    if (!phone || phone.length < 8) {
      setStudentInfo(null);
      return;
    }

    setLoadingStudent(true);
    try {
      const response = await API.get(`/users/by-phone/${phone.trim()}`);
      const student = response.data;
      
      if (student && student.isActive) {
        setStudentInfo(student);
        setSellForm(prev => ({ 
          ...prev, 
          studentName: student.fullName || "",
          studentPhone: phone.trim()
        }));
        setSnackbar({
          open: true,
          message: `✅ Élève trouvé: ${student.fullName}`,
        });
      } else {
        setStudentInfo(null);
        setSellForm(prev => ({ ...prev, studentName: "" }));
        setSnackbar({
          open: true,
          message: `❌ Aucun élève actif trouvé pour ce numéro`,
        });
      }
    } catch (error) {
      console.error("Erreur recherche élève:", error);
      setStudentInfo(null);
      setSellForm(prev => ({ ...prev, studentName: "" }));
      setSnackbar({
        open: true,
        message: `❌ Aucun compte trouvé pour ${phone}. L'élève doit s'inscrire d'abord.`,
      });
    } finally {
      setLoadingStudent(false);
    }
  }, []);

  const handleConfirmSale = useCallback(async () => {
    if (!sellDialog.card || !studentInfo || !sellForm.studentName.trim() || !sellForm.studentPhone.trim()) {
      setSnackbar({
        open: true,
        message: "Veuillez d'abord rechercher et valider l'élève",
      });
      return;
    }

    setSelling(true);
    try {
      // L'élève est déjà validé par la recherche
      const student = studentInfo;

      // 2. Vendre la carte (marquer comme vendue)
      const saleData = {
        cardId: sellDialog.card.code, // Utiliser le code de la carte comme identifiant
        studentId: student._id,
        studentName: sellForm.studentName,
        studentPhone: sellForm.studentPhone,
        paymentMethod: sellForm.paymentMethod,
        notes: sellForm.notes,
        partnerId: me._id,
        saleAmount: sellDialog.card.price,
      };

      const saleResult = await API.post("/payments/partners/sell-card", saleData);

      // 3. Créer la carte dans l'interface de l'élève
      const studentCardData = {
        code: sellDialog.card.code,
        price: sellDialog.card.price,
        status: "en_attente", // L'élève doit activer
        serialNumber: sellDialog.card.serialNumber,
        batchId: sellDialog.card.batchId,
        purchaseDate: new Date().toISOString(),
        partnerName: me.fullName,
        partnerPhone: me.phone,
        saleId: saleResult.data.saleId,
      };

      await API.post(`/users/${student._id}/cards`, studentCardData);

      // 4. Envoyer SMS à l'élève
      const smsMessage = `Votre carte Fahimta a ete envoyee. Code: ${sellDialog.card.code}`;

      await API.post(`/payments/partners/send-sms-to-student`, {
        studentId: student._id,
        message: smsMessage,
      });

      setSnackbar({
        open: true,
        message: `✅ Carte vendue! SMS envoyé à ${sellForm.studentName} (${sellForm.studentPhone})`,
      });

      handleCloseSellDialog();
      
      // Recharger les données du partenaire
      window.location.reload();
      
    } catch (error) {
      console.error("Erreur vente:", error);
      setSnackbar({
        open: true,
        message: `❌ Erreur lors de la vente: ${error.response?.data?.message || error.message}`,
      });
    } finally {
      setSelling(false);
    }
  }, [sellDialog.card, sellForm, handleCloseSellDialog, me]);

  // Cartes disponibles (non vendues)
  const availableCardsTotal = useMemo(() => {
    return codes.filter(c => c.status !== "sold" && c.status !== "used").length;
  }, [codes]);

  const availableCards = useMemo(() => {
    return codes
      .filter(c => c.status !== "sold" && c.status !== "used")
      .slice(0, 6) // Afficher seulement 6 cartes pour éviter l'encombrement
      .map(c => ({
        id: c._id || c.id,
        code: c.code,
        codeMasked: c.codeMasked ?? maskCode(c.code),
        price: c.faceValueCfa || faceValue,
        status: c.status === "assigned" ? "disponible" : c.status,
        serialNumber: c._id || c.id,
        batchId: c.batchId,
        assignedDate: c.assignedAt,
      }));
  }, [codes, faceValue]);

  const getStatusColor = (status) => {
    switch (status) {
      case "disponible":
      case "available":
        return { color: "success", icon: CheckCircleIcon };
      case "assigned":
        return { color: "info", icon: ScheduleIcon };
      case "sold":
        return { color: "warning", icon: ShoppingCartRoundedIcon };
      case "used":
        return { color: "success", icon: CheckCircleIcon };
      default:
        return { color: "default", icon: CheckCircleIcon };
    }
  };

  // ————— UI Components —————
  
  // Composant pour afficher une carte individuelle
  const PartnerCardItem = ({ card }) => {
    const statusInfo = getStatusColor(card.status);
    const StatusIcon = statusInfo.icon;

    return (
      <Box
        sx={{
          maxWidth: 400,
          p: 3,
          backgroundColor: "#FFFFFF",
          border: "2px solid #000",
          borderRadius: 1,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          position: "relative",
          transition: "transform 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          },
        }}
      >
        {/* En-tête FAHIMTA */}
        <Typography
          variant="h4"
          fontWeight={900}
          textAlign="center"
          sx={{
            color: "#000",
            mb: 2,
            letterSpacing: "2px",
          }}
        >
          FAHIMTA
        </Typography>

        {/* Informations de la carte */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  Code :
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: "monospace",
                    backgroundColor: "#f5f5f5",
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {card.codeMasked}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  Prix :
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {currency(card.price)}
                </Typography>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  Statut :
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <StatusIcon 
                    sx={{ 
                      fontSize: 16, 
                      color: `${statusInfo.color}.main` 
                    }} 
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: `${statusInfo.color}.main`,
                      fontWeight: 600,
                      textTransform: "capitalize"
                    }}
                  >
                    {card.status}
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                  Lot :
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: "monospace", 
                    fontSize: "0.75rem",
                    backgroundColor: "#f5f5f5",
                    px: 1,
                    py: 0.5,
                    borderRadius: 0.5,
                  }}
                >
                  {card.batchId}
                </Typography>
              </Box>

              {card.assignedDate && (
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 60 }}>
                    Affecté le :
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {fmtDateTime(card.assignedDate)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* QR Code */}
          <Grid item xs={4}>
            <Box
              sx={{
                width: 80,
                height: 80,
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
                cursor: "pointer",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                }
              }}
              onClick={() => handleShowQR(card)}
            >
              <QrCodeIcon sx={{ fontSize: 40, color: "text.secondary" }} />
            </Box>
            <Typography variant="caption" textAlign="center" display="block" color="text.secondary">
              Cliquez pour voir le QR
            </Typography>
          </Grid>
        </Grid>

        {/* Numéro de téléphone */}
        <Typography
          variant="body2"
          fontWeight={700}
          textAlign="center"
          sx={{ mb: 1 }}
        >
          +227 80 64 83 83
        </Typography>

        {/* Disclaimer */}
        <Typography
          variant="caption"
          textAlign="center"
          display="block"
          color="text.secondary"
          sx={{ fontSize: "0.7rem" }}
        >
          Les cartes ne sont ni échangées, ni retournées, ni remboursées une fois
        </Typography>

        {/* Bouton Vendre */}
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SellIcon />}
            onClick={() => handleSellCard(card)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
            }}
          >
            Vendre à un élève
          </Button>
        </Box>
      </Box>
    );
  };

  const Hero = () => {
    const firstName = (me?.fullName || "Partenaire").split(" ")[0];
    return (
      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.86
          )} 0%, ${alpha(theme.palette.secondary.main, 0.86)} 100%)`,
          color: "#fff",
          boxShadow: `0 6px 24px ${alpha(theme.palette.primary.dark, 0.25)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
          <BadgeRoundedIcon />
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, fontSize: { xs: "clamp(18px,5.5vw,24px)", md: 24 } }}
          >
            Bonjour, {firstName}
          </Typography>
          <Chip
            size="small"
            label={me?.isActive ? "Actif" : "Inactif"}
            sx={{
              ml: "auto",
              bgcolor: me?.isActive ? alpha("#fff", 0.2) : alpha("#000", 0.1),
              color: "#fff",
              borderColor: alpha("#fff", 0.6),
            }}
            variant="outlined"
          />
        </Stack>

        <Typography sx={{ opacity: 0.9 }}>
          Suivi de vos cartes, activations et commissions.
        </Typography>

        {/* Bandeau infos partenaire – style "app mobile" */}
        <Stack
          direction="row"
          spacing={1}
          mt={2}
          flexWrap="wrap"
          useFlexGap
          sx={{
            "& .info": {
              bgcolor: alpha("#fff", 0.15),
              border: `1px solid ${alpha("#fff", 0.35)}`,
              borderRadius: 2,
              px: 1.25,
              py: 0.75,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              color: "#fff",
            },
          }}
        >
          <Box className="info">
            <PhoneIphoneRoundedIcon fontSize="small" />
            <Typography variant="body2">{me?.phone || "Non renseigné"}</Typography>
          </Box>
          <Box className="info">
            <BusinessRoundedIcon fontSize="small" />
            <Typography variant="body2">{me?.companyName || "Entreprise non renseignée"}</Typography>
          </Box>
          <Box className="info">
            <PlaceRoundedIcon fontSize="small" />
            <Typography variant="body2">{me?.region || me?.city || "Localisation non renseignée"}</Typography>
          </Box>
        </Stack>

        {/* Section Commissions */}
        <Box sx={{ mt: 2, p: 2, bgcolor: alpha("#fff", 0.1), borderRadius: 2, border: `1px solid ${alpha("#fff", 0.2)}` }}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, fontSize: "1.1rem" }}>
            💰 Commissions
          </Typography>
          
          {(!me?.commissionDefaultCfa || me.commissionDefaultCfa === 0) && (
            <Alert severity="warning" sx={{ mb: 2, bgcolor: alpha("#FF9800", 0.1), color: "#fff" }}>
              ⚠️ Aucune commission configurée. Contactez l'administrateur pour définir votre commission par carte.
            </Alert>
          )}
          
          {me?.commissionDefaultCfa > 0 && summary.commissionTotal === 0 && summary.sold > 0 && (
            <Alert severity="info" sx={{ mb: 2, bgcolor: alpha("#2196F3", 0.1), color: "#fff" }}>
              💡 Vous avez des cartes vendues mais sans commission. 
              <Button 
                size="small" 
                variant="contained" 
                onClick={async () => {
                  try {
                    const response = await API.post("/payments/partners/recalculate-commissions");
                    setSnackbar({
                      open: true,
                      message: `✅ ${response.data.message} - ${response.data.totalCommission} FCFA ajoutés`,
                    });
                    // Recharger les données
                    window.location.reload();
                  } catch (error) {
                    setSnackbar({
                      open: true,
                      message: `❌ Erreur: ${error.response?.data?.message || error.message}`,
                    });
                  }
                }}
                sx={{ ml: 1, fontSize: "0.75rem" }}
              >
                Recalculer
              </Button>
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#4CAF50" }}>
                  {currency(summary.commissionTotal)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Commissions cumulées
                </Typography>
                {me?.commissionDefaultCfa > 0 && (
                  <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mt: 0.5 }}>
                    ({currency(me.commissionDefaultCfa)} / carte)
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#2196F3" }}>
                  {summary.activated}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Cartes activées
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#FF9800" }}>
                  {summary.sold}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Cartes vendues
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#9C27B0" }}>
                  {summary.remaining}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Cartes restantes
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="caption" sx={{ mt: 1.25, display: "block", opacity: 0.9 }}>
          Créé le {fmtDateTime(me?.createdAt)} · Dernière connexion {fmtDateTime(me?.lastLoginAt)}
        </Typography>
      </Paper>
    );
  };

  const StatCard = ({ title, value, subtitle, chip, paletteKey = "primary", icon }) => (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.75, sm: 2.25 },
        borderRadius: 3,
        height: "100%",
        bgcolor: toneBg(theme, paletteKey),
        borderColor: toneBorder(theme, paletteKey),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.25} mb={0.25}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 2,
            bgcolor: alpha(theme.palette[paletteKey].main, 0.18),
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 13 } }}>
          {title}
        </Typography>
        {chip && <Chip size="small" label={chip} sx={{ ml: "auto" }} color="default" />}
      </Stack>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: "clamp(18px, 4.2vw, 22px)", md: 22 },
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mt={0.5} sx={{ fontSize: { xs: 12, sm: 13 } }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  const LotsResponsive = () => {
    // Carrousel horizontal en XS/SM
    if (isSmDown) {
      return (
        <Box sx={{ overflowX: "auto", pb: 1, mx: -1, px: 1 }}>
          <Stack direction="row" spacing={1.25} sx={{ minWidth: "100%", pr: 1 }}>
            {batches.map((b) => {
              const unused = Math.max(0, b.total - b.used);
              return (
                <Paper
                  key={b.batchId}
                  variant="outlined"
                  sx={{
                    minWidth: 240,
                    p: 2,
                    borderRadius: 3,
                    flex: "0 0 auto",
                    bgcolor: toneBg(theme, "info"),
                    borderColor: toneBorder(theme, "info"),
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.info.main, 0.18),
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Inventory2RoundedIcon fontSize="small" />
                    </Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lot {b.batchId}
                    </Typography>
                  </Stack>
                  <Grid container spacing={1} mt={0.25}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {b.total}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Activées
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {b.used}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Restantes
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {unused}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Valeur faciale
                      </Typography>
                      <Typography variant="body1" fontWeight={700}>
                        {currency(b.faceValue)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              );
            })}
            {!batches.length && (
              <Paper sx={{ p: 2, borderRadius: 3 }} variant="outlined">
                <Typography color="text.secondary">Aucun lot pour le moment.</Typography>
              </Paper>
            )}
          </Stack>
        </Box>
      );
    }

    // Grille MD+
    return (
      <Grid container spacing={2}>
        {batches.map((b) => {
          const unused = Math.max(0, b.total - b.used);
          return (
            <Grid item xs={12} md={4} key={b.batchId}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: toneBg(theme, "info"),
                  borderColor: toneBorder(theme, "info"),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.info.main, 0.18),
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Inventory2RoundedIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lot {b.batchId}
                  </Typography>
                </Stack>
                <Grid container spacing={1} mt={0.25}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {b.total}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Activées
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {b.used}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Restantes
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {unused}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Valeur faciale
                    </Typography>
                    <Typography variant="body1" fontWeight={700}>
                      {currency(b.faceValue)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          );
        })}
        {!batches.length && (
          <Grid item xs={12}>
            <Typography color="text.secondary">Aucun lot pour le moment.</Typography>
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <PageLayout>
      {/* Fond doux type app */}
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mt: { xs: 2, sm: 6, md: 10 },
          
          background:
            theme.palette.mode === "dark"
              ? `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 1)} 0%, ${alpha(
                  theme.palette.background.default,
                  1
                )} 100%)`
              : `linear-gradient(180deg, #f9fafb 0%, #ffffff 100%)`,
          minHeight: "100dvh",
        }}
      >
        <Stack spacing={2}>
          {/* HERO */}
          {!loading && !err && <Hero />}

          {/* Loading / Error */}
          {loading && (
            <Box py={6} display="flex" alignItems="center" justifyContent="center">
              <CircularProgress />
            </Box>
          )}
          {!loading && err && (
            <Paper sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }} variant="outlined">
              <Typography color="error">{err}</Typography>
            </Paper>
          )}

          {!loading && !err && (
            <>
              {/* KPIs colorés */}
              
             <Grid
  container
  spacing={2}
  sx={{
    "&::after": {
      content: '""',
      display: "block",
      height: { xs: 16, sm: 24, md: 32 }, // = 2/3/4 * 8px
      width: "100%",
    },
  }}
>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Cartes affectées"
                    value={summary.assigned}
                    subtitle="Nombre total reçu"
                    paletteKey="primary"
                    icon={<CreditCardRoundedIcon fontSize="small" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Cartes vendues"
                    value={summary.sold}
                    subtitle={`Restant: ${summary.remaining}`}
                    paletteKey="warning"
                    icon={<ShoppingCartRoundedIcon fontSize="small" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Activations"
                    value={summary.activated}
                    chip={`${summary.activationRate.toFixed(0)}%`}
                    paletteKey="success"
                    icon={<RocketLaunchRoundedIcon fontSize="small" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Commissions cumulées"
                    value={currency(summary.commissionTotal)}
                    paletteKey="secondary"
                    icon={<SavingsRoundedIcon fontSize="small" />}
                  />
                </Grid>
              </Grid>

              {/* Section Cartes affectées */}
              {availableCards.length > 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: toneBg(theme, "primary"),
                    borderColor: toneBorder(theme, "primary"),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <CreditCardRoundedIcon />
                    <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: 16, sm: 18 } }}>
                      Mes cartes affectées
                    </Typography>
                    <Chip 
                      size="small" 
                      label={`${availableCardsTotal} disponibles`} 
                      color="primary" 
                      sx={{ ml: "auto" }}
                    />
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  
                  {/* Liste des cartes */}
                  <Grid container spacing={3} justifyContent="center">
                    {availableCards.map((card) => (
                      <Grid item key={card.id}>
                        <PartnerCardItem card={card} />
                      </Grid>
                    ))}
                  </Grid>
                  
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      💡 Cliquez sur l'icône 👁️ pour afficher/masquer les codes complets
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Progression activations – bloc coloré */}
              <Paper
                variant="outlined"
                sx={{
                  mt: { xs: 2, sm: 3, md: 4 },
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  
                  bgcolor: toneBg(theme, "success"),
                  borderColor: toneBorder(theme, "success"),
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" >
                  Progression des activations
                </Typography>
                <Box mt={1}>
                  <LinearProgress
                    variant="determinate"
                    value={summary.activationRate}
                    sx={{ height: { xs: 8, sm: 10 }, borderRadius: 10 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {summary.activated} activations sur {summary.sold} cartes vendues
                </Typography>
              </Paper>

              {/* Actions – style mobile */}
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 3,
                  bgcolor: toneBg(theme, "primary"),
                  borderColor: toneBorder(theme, "primary"),
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.25}
                  useFlexGap
                  sx={{ "& .MuiButton-root": { width: { xs: "100%", sm: "auto" } } }}
                >
                  <Button
                    variant="contained"
                    startIcon={<ViewKanbanRoundedIcon />}
                    onClick={() => navigate("/admin/partner-codes")}
                  >
                    Voir mes cartes
                  </Button>
                </Stack>
              </Paper>

              {/* Lots – carrousel tactile / grille */}
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  bgcolor: toneBg(theme, "info"),
                  borderColor: toneBorder(theme, "info"),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <Inventory2RoundedIcon />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: 16, sm: 18 } }}>
                    Lots de cartes
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <LotsResponsive />
              </Paper>

              {/* Activations récentes – liste moderne */}
              <Paper
                variant="outlined"
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  bgcolor: toneBg(theme, "secondary"),
                  borderColor: toneBorder(theme, "secondary"),
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <RocketLaunchRoundedIcon />
                  <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: 16, sm: 18 } }}>
                    Activations récentes
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 1.5 }} />
                {recentActivations.length === 0 ? (
                  <Typography color="text.secondary">Aucune activation récente.</Typography>
                ) : (
                  <Stack divider={<Divider flexItem sx={{ my: 1.25 }} />} spacing={1}>
                    {recentActivations.map((a, idx) => (
                      <Grid container spacing={1.25} alignItems="center" key={`act-${idx}`}>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Code
                          </Typography>
                          <Typography variant="body1" fontWeight={700} sx={{ wordBreak: "break-all" }}>
                            {a.codeMasked}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Élève
                          </Typography>
                          <Typography variant="body1">{a.student}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Montant
                          </Typography>
                          <Typography variant="body1">{currency(a.amount)}</Typography>
                        </Grid>
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Statut
                          </Typography>
                          <Chip size="small" label={a.status} color="success" />
                        </Grid>
                        <Grid item xs={12} sm={12} md={2}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Date
                          </Typography>
                          <Typography variant="body2">{a.date}</Typography>
                        </Grid>
                      </Grid>
                    ))}
                  </Stack>
                )}
              </Paper>
            </>
          )}
        </Stack>

      </Box>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Modal QR Code */}
      <Dialog
        open={qrDialog.open}
        onClose={handleCloseQR}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          QR Code - {qrDialog.card?.code || "Carte"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Box
              sx={{
                width: 200,
                height: 200,
                backgroundColor: "#f5f5f5",
                border: "2px solid #ddd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                QR Code
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Scannez ce code pour accéder à votre carte
            </Typography>
            {qrDialog.card && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="body2" fontWeight={700}>
                  Informations de la carte:
                </Typography>
                <Typography variant="body2">
                  Code: {qrDialog.card.codeMasked}
                </Typography>
                <Typography variant="body2">
                  Prix: {currency(qrDialog.card.price)}
                </Typography>
                <Typography variant="body2">
                  Statut: {qrDialog.card.status}
                </Typography>
                <Typography variant="body2">
                  Lot: {qrDialog.card.batchId}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQR}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Vendre une carte */}
      <Dialog
        open={sellDialog.open}
        onClose={handleCloseSellDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <SellIcon color="primary" />
            Vendre une carte
          </Box>
        </DialogTitle>
        <DialogContent>
          {sellDialog.card && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Carte:</strong> {sellDialog.card.codeMasked}
                </Typography>
                <Typography variant="body2">
                  <strong>Prix:</strong> {currency(sellDialog.card.price)}
                </Typography>
              </Alert>
            </Box>
          )}

          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Numéro de téléphone de l'élève"
              value={sellForm.studentPhone.replace("+227", "")}
              onChange={(e) => {
                let input = e.target.value.replace(/\D/g, ""); // Garder seulement les chiffres
                if (input.length > 8) input = input.slice(0, 8); // Max 8 chiffres
                const phone = "+227" + input;
                handleSellFormChange("studentPhone", phone);
              }}
              onBlur={(e) => {
                const phone = sellForm.studentPhone;
                if (phone.length >= 12) { // +227 + 8 chiffres = 12
                  searchStudentByPhone(phone);
                }
              }}
              fullWidth
              required
              placeholder="90 12 34 56"
              InputProps={{
                startAdornment: (
                  <Typography variant="body1" sx={{ mr: 1, color: "text.secondary" }}>
                    +227
                  </Typography>
                ),
                endAdornment: loadingStudent ? <CircularProgress size={20} /> : null,
              }}
              helperText="Saisissez les 8 chiffres du numéro (le préfixe +227 est automatique)"
            />

            {/* Bouton de recherche manuel */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => searchStudentByPhone(sellForm.studentPhone)}
                disabled={!sellForm.studentPhone || sellForm.studentPhone.length < 12 || loadingStudent}
                startIcon={<PersonAddIcon />}
              >
                {loadingStudent ? "Recherche..." : "Rechercher l'élève"}
              </Button>
              {studentInfo && (
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setStudentInfo(null);
                    setSellForm(prev => ({ ...prev, studentName: "" }));
                  }}
                  color="error"
                >
                  Effacer
                </Button>
              )}
            </Box>

            {/* Affichage des informations de l'élève trouvé */}
            {studentInfo && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  ✅ Élève trouvé et validé
                </Typography>
                <Typography variant="body2">
                  <strong>Nom:</strong> {studentInfo.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Téléphone:</strong> {studentInfo.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {studentInfo.email || "Non renseigné"}
                </Typography>
                <Typography variant="body2">
                  <strong>Statut:</strong> {studentInfo.isActive ? "Actif" : "Inactif"}
                </Typography>
              </Alert>
            )}

            <TextField
              label="Nom complet de l'élève"
              value={sellForm.studentName}
              onChange={(e) => handleSellFormChange("studentName", e.target.value)}
              fullWidth
              required
              placeholder="Sera rempli automatiquement"
              disabled={!!studentInfo}
              helperText={studentInfo ? "Nom récupéré automatiquement" : "Saisissez le nom si l'élève n'est pas trouvé"}
            />

            <TextField
              label="Méthode de paiement"
              value={sellForm.paymentMethod}
              onChange={(e) => handleSellFormChange("paymentMethod", e.target.value)}
              fullWidth
              select
              SelectProps={{
                native: true,
              }}
            >
              <option value="cash">💵 Espèces</option>
              <option value="mobile_money">📱 Mobile Money</option>
              <option value="bank_transfer">🏦 Virement bancaire</option>
            </TextField>

            <TextField
              label="Notes (optionnel)"
              value={sellForm.notes}
              onChange={(e) => handleSellFormChange("notes", e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Informations supplémentaires sur la vente..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSellDialog} disabled={selling}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirmSale} 
            variant="contained" 
            disabled={selling}
            startIcon={selling ? <CircularProgress size={16} /> : <SellIcon />}
          >
            {selling ? "Vente en cours..." : "Confirmer la vente"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default PartnerDashboardPage;
