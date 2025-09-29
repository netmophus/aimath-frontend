

// src/pages/PricingPage.jsx
import React, { useEffect, useMemo, useState, useContext } from "react";
import {
  Box, Container, Grid, Paper, Typography, Button, Divider,
  TextField, Stack, Collapse, Alert, Snackbar, LinearProgress, Chip,
  InputAdornment
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import KeyIcon from "@mui/icons-material/Key";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import PageLayout from "../../components/PageLayout";

/* =================== NITA (mets en .env en prod) =================== */
const NITA_BASE_URL = "https://payment.nitapiservices.com";
const NITA_API_KEY  = "jF-GLQtShTidrX6Txx_J4HFJwB3GRk2S7V3OsFlSUSI";
const NITA_USERNAME = "SOFTLINKTEC";
const NITA_PASSWORD = "SOFTLINKTEC@2025";
/* ================================================================== */

// const BACKEND_PUBLIC_URL = "https://0efdda9448e2.ngrok-free.app/api";
const BACKEND_PUBLIC_URL = "https://fahimtabackend-647bfe306335.herokuapp.com/api";

/* Helpers phone */
const phoneToNita = (raw) => {
  let s = String(raw || "").replace(/\s+/g, "");
  if (!s) return "";
  if (s.startsWith("+"))  s = "00" + s.slice(1);
  if (s.startsWith("00")) return s;
  if (s.startsWith("227")) return "00" + s;
  if (/^\d{8}$/.test(s)) return "00227" + s;
  return s;
};
const phoneForCallback = (raw = "") => {
  let s = String(raw).replace(/\s+/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (s.startsWith("00")) s = s.slice(2);
  if (/^0\d{8}$/.test(s)) s = s.slice(1);
  if (/^\d{8}$/.test(s)) s = "227" + s;
  return s; // 227XXXXXXXX
};

const PREFIX = "FAH-";
const MAX_LEN = 8;

export default function PricingPage() {
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);
  const isLoggedIn = !!user;
  const isSubscribed = !!user?.isSubscribed;

  const [busy, setBusy] = useState(false);
  const [showNita, setShowNita] = useState(false);
  const [achatRequestId, setAchatRequestId] = useState(null);
  const [referenceAchat, setReferenceAchat] = useState(null);

  const [codePart, setCodePart] = useState("");
  const fullCode = useMemo(() => `${PREFIX}${codePart}`, [codePart]);

  const [toast, setToast] = useState({ open: false, msg: "", sev: "info" });

  /* ===== Hydrate profil & polling pendant NITA ===== */
  useEffect(() => { refreshUser?.(); }, []);
  useEffect(() => {
    if (!showNita) return;
    const id = setInterval(() => refreshUser?.(), 4000);
    return () => clearInterval(id);
  }, [showNita, refreshUser]);
  useEffect(() => {
    if (showNita && user?.isSubscribed) {
      setToast({ open: true, sev: "success", msg: "✅ Paiement confirmé. Abonnement activé." });
      setShowNita(false);
      setReferenceAchat(null);
      setAchatRequestId(null);
    }
  }, [showNita, user?.isSubscribed]);

  /* ================= NITA ================= */
  const nitaAuthenticate = async () => {
    const res = await fetch(`${NITA_BASE_URL}/api/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-NT-API-KEY": NITA_API_KEY,
        Accept: "application/json",
      },
      body: JSON.stringify({ username: NITA_USERNAME, password: NITA_PASSWORD }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Auth NITA: HTTP ${res.status} → ${text}`);
    let data; try { data = JSON.parse(text); } catch { data = {}; }
    const token = data.token || data.access_token || data.jwt || data?.data?.token;
    if (!token) throw new Error(`Auth NITA: token introuvable → ${text}`);
    return token;
  };

  const nitaCreateAchat = async ({ amount, label }) => {
    const jwt = await nitaAuthenticate();
    const reqId = label?.toLowerCase().includes("mensuel")
      ? `FAH-M-${Date.now()}`
      : `FAH-A-${Date.now()}`;

    const urlCallback =
      `${BACKEND_PUBLIC_URL}/payments/nita/callback` +
      `?phone=${encodeURIComponent(phoneForCallback(user?.phone))}` +
      `&requestId=${encodeURIComponent(reqId)}`;

    const body = {
      descriptionAchat: [label],
      montantTransaction: amount,
      motifTransaction: label,
      requestId: reqId,
      adresseIp: "102.45.67.89",
      phoneClient: phoneToNita(user?.phone),
      urlCallback,
    };

    const res = await fetch(
      `${NITA_BASE_URL}/api/nitaServices/achatEnLigne/saveAchatEnLigne`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-NT-API-KEY": NITA_API_KEY,
          Authorization: `Bearer ${jwt}`,
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const raw = await res.text();
    let data; try { data = JSON.parse(raw); } catch { data = {}; }
    if (Number(data?.code) !== 200) {
      throw new Error(data?.message || "Erreur NITA (code interne).");
    }

    const reference =
      data.referenceAchat || data.codeAchat || data.reference || data.ref ||
      data?.data?.referenceAchat || data?.data?.codeAchat ||
      data?.achat?.referenceAchat || data?.result?.referenceAchat || null;

    if (!reference) throw new Error("Achat NITA: référence introuvable.");
    setAchatRequestId(reqId);
    return { reference, reqId };
  };

  const startNitaFlow = async () => {
    // 🔒 interdit si non connecté
    if (!isLoggedIn) {
      setToast({ open: true, sev: "warning", msg: "Veuillez vous connecter avant de payer." });
      navigate("/login");
      return;
    }
    if (isSubscribed || showNita || busy) return;

    try {
      setBusy(true);
      const amount = 2000;
      const label = "Abonnement Fahimta - Mensuel";
      const { reference } = await nitaCreateAchat({ amount, label });
      setReferenceAchat(reference);
      setShowNita(true);
      setToast({ open: true, sev: "info", msg: "Référence NITA générée." });
    } catch (e) {
      setToast({ open: true, sev: "error", msg: e.message || "Erreur NITA." });
    } finally {
      setBusy(false);
    }
  };

  /* ================= Scratch card ================= */
  const redeemCode = async () => {
    if (!isLoggedIn) {
      setToast({ open: true, sev: "warning", msg: "Connectez-vous pour valider un code." });
      navigate("/login");
      return;
    }
    if (!/^[A-Z0-9]{8}$/.test(codePart)) {
      setToast({ open: true, sev: "warning", msg: "Format attendu : 8 caractères A–Z / 0–9." });
      return;
    }
    try {
      await API.post("/payments/redeem-code", { code: fullCode });
      setToast({ open: true, sev: "success", msg: "✅ Code validé. Abonnement activé." });
      setCodePart("");
      refreshUser?.();
    } catch (e) {
      setToast({
        open: true,
        sev: "error",
        msg: e?.response?.data?.message || "Code invalide.",
      });
    }
  };


  // ✅ Fermer proprement le bloc NITA
const handleCloseNita = () => {
  setShowNita(false);
  setReferenceAchat(null);
  setAchatRequestId(null);
  setBusy(false);
  setToast((t) => ({ ...t, open: false }));
};

// ✅ Copie robuste (HTTPS, WebView, anciens navigateurs)
const copyToClipboard = async (text) => {
  try {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setToast({ open: true, sev: "success", msg: "Référence copiée." });
  } catch {
    setToast({
      open: true,
      sev: "error",
      msg: "Impossible de copier. Appui long pour sélectionner la référence.",
    });
  }
};


  return (
    <PageLayout>
      {/* HERO */}
      <Box
        sx={{
          background: "radial-gradient(1200px 600px at 10% -20%, #E9F2FF 0%, #FFFFFF 60%)",
          borderBottom: "1px solid rgba(25,118,210,0.15)",
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" textAlign="center" sx={{ px: 2 , mt:5 }}>
            <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: 28, md: 36 } }}>
              Passe à Fahimta Premium
            </Typography>
            <Typography sx={{ maxWidth: 780, color: "text.secondary" }}>
              Paiement <strong>NITA</strong> ou <strong>carte à gratter</strong>. Activation automatique après confirmation.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* CARTE UNIQUE : Mensuelle */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Grid container justifyContent="center">
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.25, md: 3.25 },
                borderRadius: 4,
                border: "1px solid rgba(25,118,210,0.25)",
                background:
                  "linear-gradient(180deg, rgba(25,118,210,0.06) 0%, rgba(25,118,210,0.12) 100%)",
              }}
            >
              <Stack spacing={0.5} alignItems="center">
                <Typography variant="h4" fontWeight={900} sx={{ fontSize: { xs: 26, md: 32 } }}>
                  Mensuelle
                </Typography>
                <Typography sx={{ opacity: 0.9, fontWeight: 900, fontSize: { xs: 16, md: 18 } }}>
                  2 000 FCFA / mois
                </Typography>
              </Stack>

              <Divider sx={{ my: { xs: 1.5, md: 2 } }} />

              <Stack spacing={1.25} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <CheckCircleOutlineIcon color="primary" />
                  <Typography>Tous les services Fahimta</Typography>
                </Stack>
              </Stack>

              <Stack spacing={1.5} sx={{ mt: 2 }}>
                <Button
                  size="large"
                  fullWidth
                  variant="contained"
                  color={isLoggedIn ? "error" : "primary"}
                  startIcon={<CreditCardIcon />}
                  onClick={isLoggedIn ? startNitaFlow : () => navigate("/login")}
                  disabled={isSubscribed || showNita || busy}
                  sx={{
                    fontWeight: 900,
                    letterSpacing: 0.4,
                    py: 1.15,
                    borderRadius: 2.5,
                  }}
                >
                  {!isLoggedIn
                    ? "Se connecter pour payer"
                    : isSubscribed
                    ? "Déjà abonné"
                    : "PAYER VIA NITA (MENSUEL)"}
                </Button>

                {/* Code — seulement si connecté et non abonné */}
                {isLoggedIn && !isSubscribed && (
                  <Collapse in>
                    <Box
                      sx={{
                        p: { xs: 1.5, md: 2 },
                        borderRadius: 3,
                        border: "1px dashed rgba(0,0,0,0.25)",
                        bgcolor: "#fff",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <KeyIcon color="action" />
                        <Typography variant="subtitle1" fontWeight={800}>
                          J’ai une carte à gratter
                        </Typography>
                      </Stack>

                      {/* ✅ Champ unique avec préfixe “FAH-” aligné (plus de décalage) */}
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="7416E198"
                        value={codePart}
                        onChange={(e) =>
                          setCodePart(
                            e.target.value.replace(/[^a-zA-Z0-9]/g, "")
                              .toUpperCase()
                              .slice(0, MAX_LEN)
                          )
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box sx={{ fontWeight: 800, color: "text.primary" }}>FAH-</Box>
                            </InputAdornment>
                          ),
                        }}
                        helperText="8 caractères A–Z / 0–9"
                      />

                      <Button
                        onClick={redeemCode}
                        variant="outlined"
                        sx={{ mt: 1.25, fontWeight: 800 }}
                        disabled={codePart.length !== MAX_LEN}
                      >
                        VALIDER {fullCode}
                      </Button>
                    </Box>
                  </Collapse>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Bloc suivi NITA */}
        <Collapse in={showNita}>
          <Paper sx={{ p: { xs: 2, md: 3 }, mt: 3, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={900} gutterBottom>
              Paiement NITA
            </Typography>
            <Typography>
              Donnez cette <strong>référence d’achat</strong> au guichet NITA ou saisissez-la dans MYNITA.
            </Typography>

          <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ mt: 1.25 }}
            >
              <TextField
                value={referenceAchat || ""}
                InputProps={{ readOnly: true }}
                fullWidth
                label="Référence"
              />
              <Button
                type="button"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={() => copyToClipboard(referenceAchat)}
              >
                Copier
              </Button>
            </Stack>


            <Alert severity="info" sx={{ mt: 2 }}>
             Si le paiement est confirmé, votre abonnement sera activé automatiquement, votre statut sera actualisé et vous recevrez un SMS de confirmation.
            </Alert>

            <Box sx={{ mt: 2 }}>
              <LinearProgress />
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>


             <Button type="button" variant="text" onClick={handleCloseNita}>
            Fermer
          </Button>


            </Stack>
          </Paper>
        </Collapse>

        {/* Overlay busy soft */}
        <Collapse in={busy} unmountOnExit>
          <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0,0,0,0.2)" }} />
        </Collapse>

        <Snackbar
          open={toast.open}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          autoHideDuration={3500}
          message={toast.msg}
        />
      </Container>
    </PageLayout>
  );
}
