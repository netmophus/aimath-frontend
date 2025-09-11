


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
    const commissionPerActivation = activated > 0 ? Math.round(commissionTotal / activated) : 0;
    return {
      assigned,
      sold,
      activated,
      remaining,
      activationRate,
      grossSales,
      commissionTotal,
      commissionPerActivation,
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

  // ————— UI Components —————
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
            <Typography variant="body2">{me?.phone || "—"}</Typography>
          </Box>
          <Box className="info">
            <BusinessRoundedIcon fontSize="small" />
            <Typography variant="body2">{me?.companyName || "—"}</Typography>
          </Box>
          <Box className="info">
            <PlaceRoundedIcon fontSize="small" />
            <Typography variant="body2">{me?.region || me?.city || "—"}</Typography>
          </Box>
        </Stack>
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
                    subtitle="Taux d’activation / vendues"
                    paletteKey="success"
                    icon={<RocketLaunchRoundedIcon fontSize="small" />}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Commissions cumulées"
                    value={currency(summary.commissionTotal)}
                    subtitle={`~ ${currency(summary.commissionPerActivation)} / activation`}
                    chip="Cumul"
                    paletteKey="secondary"
                    icon={<SavingsRoundedIcon fontSize="small" />}
                  />
                </Grid>
              </Grid>

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
                  <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={onExportCSV}>
                    Exporter (CSV)
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddShoppingCartRoundedIcon />}
                    onClick={() => alert("Demande de réassort envoyée ✅")}
                  >
                    Demander réassort
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

        {/* FAB "Réassort" – style app mobile */}
        {!loading && !err && (
          <Fab
            color="primary"
            aria-label="réassort"
            onClick={() => alert("Demande de réassort envoyée ✅")}
            sx={{
              position: "fixed",
              bottom: { xs: 20, md: 28 },
              right: { xs: 20, md: 32 },
              boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <AddShoppingCartRoundedIcon />
          </Fab>
        )}
      </Box>
    </PageLayout>
  );
};

export default PartnerDashboardPage;
