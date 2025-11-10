// pages/GratuitFahimtaPage.jsx
import React, { useEffect, useMemo, useState, useCallback, useContext } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  InputAdornment,
  IconButton,
  Skeleton,
  Stack,
  useMediaQuery,
  Divider,
  Chip,
  Tooltip,
  LinearProgress,
  Card,
  Snackbar,
  Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PageLayout from "../components/PageLayout";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import KeyIcon from "@mui/icons-material/Key";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import LanguageIcon from "@mui/icons-material/Language";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DistributeursModal from "../components/DistributeursModal";

import SearchIcon from "@mui/icons-material/Search";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import LockIcon from "@mui/icons-material/Lock";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import BookCardGratuit from "../components/gratuit/BookCardGratuit";
import ExamCardGratuit from "../components/gratuit/ExamCardGratuit";
import VideoCardGratuit from "../components/gratuit/VideoCardGratuit";



import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
// import { jsPDF } from "jspdf";


const extractLevels = (arr) => {
  const set = new Set(
    (arr || [])
      .map(item => String(item?.level || item?.classe || "").trim())
      .filter(Boolean)
  );
  return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b, "fr"))];
};




/* ---------- utils ------------- */
// const timeTypingMs = 15;
 // délai entre deux phrases (en ms)
 const sentenceDelayMs = 550;
const fmtReset = (iso) => (iso ? new Date(iso).toLocaleDateString("fr-FR") : null);



// Debounce maison (pas de dépendance externe)
function useDebouncedValue(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const TabLabel = ({ label, count }) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
    <Chip size="small" label={count} sx={{ fontWeight: 700 }} />
  </Stack>
);

// ✅ Abonnement actif : isSubscribed === true OU subscriptionEnd > maintenant
const hasActiveSub = (u) =>
  !!u && (u.isSubscribed === true || (u?.subscriptionEnd && new Date(u.subscriptionEnd) > new Date()));

const GratuitFahimtaPage = () => {
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user, refreshUser } = useContext(AuthContext);
  const premiumActive = useMemo(() => hasActiveSub(user), [user]);
  
  const [tabIndex, setTabIndex] = useState(0);
  
  // ✅ Sélection de matière (par défaut Maths)
  const [selectedSubject, setSelectedSubject] = useState("maths");
  
  const [livres, setLivres] = useState([]);
  const [exams, setExams] = useState([]);
  const [videos, setVideos] = useState([]);

  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [errBooks, setErrBooks] = useState("");
  const [errExams, setErrExams] = useState("");
  const [errVideos, setErrVideos] = useState("");

  // IA
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typedResponse, setTypedResponse] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState("");

  // Filtre
  const [q, setQ] = useState("");
  const qDebounced = useDebouncedValue(q, 250);

  // Quota (frontend-only)
  const [remaining, setRemaining] = useState(null); // inconnu au départ
  const [maxFree, setMaxFree] = useState(5);
  const [resetAt, setResetAt] = useState(null);
  const [checkingQuota, setCheckingQuota] = useState(false);

  // États pour la référence NITA
  const [showNita, setShowNita] = useState(false);
  const [referenceAchat, setReferenceAchat] = useState(null);
  const [nitaBusy, setNitaBusy] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", sev: "info" });
  
  // État pour le modal distributeurs
  const [openDistributeurs, setOpenDistributeurs] = useState(false);

// --- Speech to Text (dictée) + TTS — version anti-doublons mobile ----------
const [sttSupported, setSttSupported] = useState(false);
const [listening, setListening] = useState(false);
const recognitionRef = React.useRef(null);

// Accumulateurs pour éviter les répétitions
const baseRef = React.useRef("");     // texte présent AVANT de démarrer la dictée
const finalRef = React.useRef("");    // segments finaux validés (isFinal)
const partialRef = React.useRef("");  // segment en cours (interim)
const stopTimerRef = React.useRef(null);

// --- Text to Speech (lecture de la réponse)
const [ttsSupported, setTtsSupported] = useState(false);
const [speaking, setSpeaking] = useState(false);
const utteranceRef = React.useRef(null);


const [selectedLevel, setSelectedLevel] = useState("ALL");

const bookLevels  = useMemo(() => extractLevels(livres), [livres]);
const examLevels  = useMemo(() => extractLevels(exams),  [exams]);
const videoLevels = useMemo(() => extractLevels(videos), [videos]);


// ↓ récupère déjà la dernière réponse IA (tu l'as déjà)
const lastIaText = () => getLastIaText() || "";

// Export .txt
const exportIaTxt = () => {
  const text = lastIaText();
  if (!text) return;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const ts = new Date().toISOString().slice(0,19).replace(/:/g,"-");
  a.href = url;
  a.download = `fahimta-reponse-${ts}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};








const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
  typeof navigator !== "undefined" ? navigator.userAgent : ""
);

useEffect(() => {
  const WSR = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!WSR) {
    setSttSupported(false);
  } else {
    setSttSupported(true);

    const rec = new WSR();
    rec.lang = "fr-FR";
    rec.maxAlternatives = 1;
    rec.continuous = !isMobile;       // mobile: sessions plus courtes
    rec.interimResults = !isMobile;   // mobile: pas d’interim => moins de doublons

    rec.onstart = () => {
      baseRef.current = (input && input.trim()) ? input.trim() : "";
      finalRef.current = "";
      partialRef.current = "";
      setListening(true);
    };

    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const res = e.results[i];
        const txt = (res[0]?.transcript || "").replace(/\s+/g, " ").trim();
        if (!txt) continue;

        if (res.isFinal) {
          // ajoute le segment final UNE SEULE FOIS
          if (!finalRef.current.endsWith(txt)) {
            finalRef.current = [finalRef.current, txt].filter(Boolean).join(" ");
          }
          partialRef.current = "";

          const composed = [baseRef.current, finalRef.current]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          setInput(composed);

          // Auto-stop doux après une petite pause sur mobile
          if (isMobile) {
            clearTimeout(stopTimerRef.current);
            stopTimerRef.current = setTimeout(() => {
              try { recognitionRef.current?.stop(); } catch {}
            }, 1500);
          }
        } else if (!isMobile) {
          // interim: n’actualise que si ça change réellement
          if (txt !== partialRef.current) {
            partialRef.current = txt;
            const composed = [baseRef.current, finalRef.current, partialRef.current]
              .filter(Boolean)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();
            setInput(composed);
          }
        }
      }
    };

    rec.onerror = () => {
      setListening(false);
      clearTimeout(stopTimerRef.current);
    };

    rec.onend = () => {
      setListening(false);
      clearTimeout(stopTimerRef.current);
      // Nettoie un éventuel interim affiché
      partialRef.current = "";
      const composed = [baseRef.current, finalRef.current].filter(Boolean).join(" ").trim();
      if (composed) setInput(composed);
    };

    recognitionRef.current = rec;
  }

  // TTS dispo ?
  setTtsSupported("speechSynthesis" in window);

  // Cleanup
  return () => {
    try { recognitionRef.current?.stop(); } catch {}
    clearTimeout(stopTimerRef.current);
    try { window.speechSynthesis?.cancel(); } catch {}
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// --- Dictée (toggle)
const handleToggleDictation = () => {
  if (!sttSupported || !recognitionRef.current) {
    setAiError("La dictée vocale n’est pas supportée par ce navigateur.");
    return;
  }
  if (listening) {
    try { recognitionRef.current.stop(); } catch {}
    return;
  }
  setAiError("");
  try {
    recognitionRef.current.start();
  } catch {
    setListening(false);
  }
};




// Remet à zéro la dictée et le champ
const handleResetDictationInput = () => {
  try { recognitionRef.current?.stop(); } catch {}
  setListening(false);
  baseRef.current = "";
  finalRef.current = "";
  partialRef.current = "";
  setInput("");
  setAiError("");
};



















// --- Lecture de la dernière réponse IA
const getLastIaText = () => {
  const last = [...messages].reverse().find(m => m.role === "ia");
  if (!last) return null;
  // si c’est la toute dernière en cours d’animation, prends typedResponse
  const isLast = messages.length > 0 && messages[messages.length - 1] === last;
  return isLast ? (typedResponse || last.text) : last.text;
};

const handleSpeak = () => {
  if (!ttsSupported) return setAiError("La lecture audio n’est pas supportée par ce navigateur.");
  const text = getLastIaText();
  if (!text) return;

  // stop avant de (re)lire
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = 1;     // 0.8 ~ 1.2 si tu veux
  u.pitch = 1;
  u.onstart = () => setSpeaking(true);
  u.onend = () => setSpeaking(false);
  u.onerror = () => setSpeaking(false);

  utteranceRef.current = u;
  window.speechSynthesis.speak(u);
};

const handleStopSpeak = () => {
  if (!ttsSupported) return;
  window.speechSynthesis.cancel();
  setSpeaking(false);
};


  useEffect(() => {
    // Optional peek quota; ignore si route absente
    let mounted = true;
    (async () => {
      setCheckingQuota(true);
      try {
        const r = await API.get("/ia/gratuit/quota"); // peut ne pas exister
        if (!mounted) return;
        if (r?.data) {
          setRemaining(r.data.remaining);
          setMaxFree(r.data.max ?? 5);
          setResetAt(r.data.resetAt ?? null);
          localStorage.setItem(
            "ia_quota_hint",
            JSON.stringify({
              remaining: r.data.remaining,
              max: r.data.max ?? 5,
              resetAt: r.data.resetAt ?? null,
            })
          );
        }
      } catch {
        // si 404: on tente un hint local
        const cached = localStorage.getItem("ia_quota_hint");
        if (mounted && cached) {
          const hint = JSON.parse(cached);
          setRemaining(hint.remaining ?? null);
          setMaxFree(hint.max ?? 5);
          setResetAt(hint.resetAt ?? null);
        }
      } finally {
        mounted && setCheckingQuota(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch parallélisés
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingBooks(true);
        setLoadingExams(true);
        setLoadingVideos(true);

        const [rBooks, rExams, rVideos] = await Promise.allSettled([
          API.get("/ia/gratuit"),
          API.get("/exams"),
          API.get("/videos"),
        ]);

        if (!active) return;

        if (rBooks.status === "fulfilled") {
          setLivres(Array.isArray(rBooks.value.data) ? rBooks.value.data : []);
          setErrBooks("");
        } else setErrBooks("Erreur lors du chargement des livres.");

        if (rExams.status === "fulfilled") {
          setExams(Array.isArray(rExams.value.data) ? rExams.value.data : []);
          setErrExams("");
        } else setErrExams("Erreur lors du chargement des sujets.");

        if (rVideos.status === "fulfilled") {
          setVideos(Array.isArray(rVideos.value.data) ? rVideos.value.data : []);
          setErrVideos("");
        } else setErrVideos("Erreur lors du chargement des vidéos.");
      } finally {
        if (active) {
          setLoadingBooks(false);
          setLoadingExams(false);
          setLoadingVideos(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // ✅ Réinitialiser les filtres quand on change de matière
  useEffect(() => {
    setSelectedLevel("ALL");
    setQ("");
    setTabIndex(0);
  }, [selectedSubject]);


// Effet "révélation" phrase par phrase sur le dernier message IA
useEffect(() => {
  const last = messages[messages.length - 1];
  if (!last || last.role !== "ia") return;

  // Réinitialise le rendu progressif
  setTypedResponse("");

  // On découpe le texte en phrases (en gardant les sauts de ligne intacts)
  // Exemple de séparateurs: '.', '?', '!', '…'
  const raw = last.text || "";
  const normalized = raw.replace(/\s+\n/g, "\n").replace(/\n\s+/g, "\n");
  const byLines = normalized.split("\n");

  // reconstitue une liste de "chunks" qui sont soit des phrases, soit des sauts de ligne
  const chunks = [];
  byLines.forEach((line, idx) => {
    if (line.trim() === "") {
      // ligne vide -> on garde un saut de ligne
      chunks.push("\n");
      return;
    }
    // split en phrases, on garde la ponctuation à la fin
    const sentences = line.split(/(?<=[\.!?…])\s+/u).filter(Boolean);
    chunks.push(...sentences);
    // si ce n'est pas la dernière ligne, on garde le saut de ligne
    if (idx < byLines.length - 1) chunks.push("\n");
  });

  let i = 0;
  let acc = "";
  let timerId = null;

  const step = () => {
    if (i >= chunks.length) return;

    // ajoute la prochaine "phrase" (ou saut de ligne)
    const next = chunks[i];
    acc += (next === "\n" ? "\n" : (acc.endsWith("\n") || acc === "" ? "" : " ") + next);
    setTypedResponse(acc);
    i += 1;

    if (i < chunks.length) {
      // délai constant entre phrases (tu peux aussi adapter sur la longueur)
      timerId = setTimeout(step, sentenceDelayMs);
    }
  };

  // Lance la première révélation
  timerId = setTimeout(step, 0);

  return () => {
    if (timerId) clearTimeout(timerId);
  };
}, [messages, sentenceDelayMs]);



  const handleSubmitAI = async () => {
    if (!input.trim()) return;

    // Si on sait déjà qu'il n'y a plus de crédits
    if (remaining === 0) {
      setAiError(
        `Limite d’essais gratuits atteinte. ${
          resetAt ? `Réinitialisation le ${fmtReset(resetAt)}.` : ""
        }`
      );
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: input }]);
    setLoadingAI(true);
    setAiError("");
    const ask = input;
    setInput("");

    try {
      // NOTE: le chemin "/ia/gratuit/gtp" est conservé tel quel (backend existant)
      const r = await API.post("/ia/gratuit/gtp", { input: ask });
      const text = r?.data?.response || "Réponse indisponible.";
      setMessages((prev) => [...prev, { role: "ia", text }]);

      // Met à jour le compteur si le backend le renvoie
      if (typeof r?.data?.remaining !== "undefined") {
        setRemaining(r.data.remaining);
        if (typeof r?.data?.max !== "undefined") setMaxFree(r.data.max);
        if (typeof r?.data?.resetAt !== "undefined") setResetAt(r.data.resetAt);
        localStorage.setItem(
          "ia_quota_hint",
          JSON.stringify({
            remaining: r.data.remaining,
            max: r.data.max ?? 5,
            resetAt: r.data.resetAt ?? null,
          })
        );
      }
    } catch (e) {
      const status = e?.response?.status;
      const data = e?.response?.data;

      // 429: limite atteinte
      if (status === 429) {
        setRemaining(data?.remaining ?? 0);
        if (typeof data?.max !== "undefined") setMaxFree(data.max);
        if (typeof data?.resetAt !== "undefined") setResetAt(data.resetAt);

        setAiError(
          data?.message ||
            `Limite d’essais gratuits atteinte. ${
              data?.resetAt ? `Réinitialisation le ${fmtReset(data.resetAt)}.` : ""
            }`
        );
        // Option: message IA "verrou"
        setMessages((prev) => [
          ...prev,
          { role: "ia", text: "🔒 Limite gratuite atteinte. Découvre nos offres pour continuer." },
        ]);
      } else {
        const m = data?.message || "Une erreur est survenue.";
        setAiError(m);
        setMessages((prev) => [
          ...prev,
          { role: "ia", text: "❌ Une erreur est survenue. Essaie plus tard." },
        ]);
      }
    } finally {
      setLoadingAI(false);
    }
  };

  // Filtres simples (nom/titre) avec debounce + filtrage par matière
 const filterFn = useCallback(
  (x) => {
    // ✅ Filtre par matière (subject)
    const itemSubject = x?.subject || "maths";
    const okSubject = itemSubject === selectedSubject;

    // filtre texte
    const s = (qDebounced || "").toLowerCase().trim();
    const okText = !s
      ? true
      : ["title", "name", "nom", "matiere", "classe", "level"]
          .some(k => String(x?.[k] || "").toLowerCase().includes(s));

    // filtre niveau commun (level OU classe)
    const lv = String(x?.level || x?.classe || "").toLowerCase().trim();
    const okLevel = selectedLevel === "ALL"
      ? true
      : lv === selectedLevel.toLowerCase();

    return okSubject && okText && okLevel;
  },
  [qDebounced, selectedLevel, selectedSubject]
);

  const filteredLivres = useMemo(() => livres.filter(filterFn), [livres, filterFn]);
  const filteredExams = useMemo(() => exams.filter(filterFn), [exams, filterFn]);
  const filteredVideos = useMemo(() => videos.filter(filterFn), [videos, filterFn]);

  const renderSkeletonGrid = (n = 6) => (
    <Grid container spacing={3}>
      {Array.from({ length: n }).map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Skeleton variant="rectangular" height={160} animation="wave" />
            <Skeleton sx={{ mt: 1 }} width="85%" animation="wave" />
            <Skeleton width="70%" animation="wave" />
            <Skeleton width="60%" animation="wave" />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  // Progression quota (utilisée si remaining !== null)
  const pct =
    remaining !== null && maxFree > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(((maxFree - remaining) / maxFree) * 100)
          )
        )
      : null;




  // Compter les vidéos en incluant les parties complémentaires
const totalVideosCount = useMemo(() => {
  // filtre par matière sélectionnée ET par niveau
  const matchesLevel = (item) => {
    if (selectedLevel === "ALL") return true;
    const lv = String(item?.level || item?.classe || "").toLowerCase().trim();
    return lv === selectedLevel.toLowerCase();
  };

  let total = 0;
  for (const v of videos || []) {
    // ✅ Filtrer par matière sélectionnée
    const videoSubject = v?.subject || "maths";
    if (videoSubject !== selectedSubject) continue;
    
    if (!matchesLevel(v)) continue;              // respecte le filtre de niveau
    total += 1;                                   // la vidéo principale
    total += Array.isArray(v?.videosSupplementaires) 
      ? v.videosSupplementaires.length 
      : 0;                                       // les parties
  }
  return total;
}, [videos, selectedLevel, selectedSubject]);

// ✅ Compteurs filtrés par matière pour les onglets
const countBySubject = useMemo(() => {
  const countLivres = (livres || []).filter(b => (b?.subject || "maths") === selectedSubject).length;
  const countExams = (exams || []).filter(e => (e?.subject || "maths") === selectedSubject).length;
  return { livres: countLivres, exams: countExams, videos: totalVideosCount };
}, [livres, exams, selectedSubject, totalVideosCount]);

  // ✅ useEffect pour rafraîchir l'utilisateur pendant le paiement NITA
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
    }
  }, [showNita, user?.isSubscribed]);

  // ✅ Fonctions pour la génération de référence NITA
  const nitaCreateAchat = async ({ amount, label }) => {
    const r = await API.post("/payments/nita/create", { amount, label });
    const { reference, reqId } = r.data || {};
    if (!reference) throw new Error("Référence NITA introuvable.");
    return { reference, reqId };
  };

  const startNitaFlow = async () => {
    if (!user) {
      setToast({ open: true, sev: "warning", msg: "Veuillez vous connecter avant de payer." });
      navigate("/login");
      return;
    }
    if (premiumActive || showNita || nitaBusy) return;

    try {
      setNitaBusy(true);
      const amount = 2000;
      const label = "Abonnement Fahimta - Mensuel";
      const { reference } = await nitaCreateAchat({ amount, label });
      setReferenceAchat(reference);
      setShowNita(true);
      setToast({ open: true, sev: "info", msg: "Référence NITA générée." });
    } catch (e) {
      setToast({ open: true, sev: "error", msg: e?.response?.data?.message || e.message || "Erreur NITA." });
    } finally {
      setNitaBusy(false);
    }
  };

  const handleCloseNita = () => {
    setShowNita(false);
    setReferenceAchat(null);
    setNitaBusy(false);
  };

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
      {/* Section d'alerte pour utilisateurs connectés sans abonnement */}
      {user && !premiumActive && (
        <Box
          sx={{
            mt: 7,
            mb: 3,
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1200,
          }}
        >
          <Alert
            severity="info"
            icon={<PaymentIcon />}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.1) 100%)",
              border: "2px solid rgba(255,215,0,0.4)",
              boxShadow: "0 8px 32px rgba(255,215,0,0.2)",
              "& .MuiAlert-icon": {
                color: "#FFD700",
                fontSize: 32,
              },
            }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={900}
                sx={{
                  mb: 2,
                  color: "#FFD700",
                  fontSize: { xs: 18, sm: 20, md: 22 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <StarIcon sx={{ fontSize: 24 }} />
                Comment s'abonner à Premium ?
              </Typography>
              
              <Typography
                sx={{
                  mb: 3,
                  color: "rgba(0,0,0,0.85)",
                  fontSize: { xs: 14, md: 16 },
                  fontWeight: 600,
                }}
              >
                Bonjour <strong>{user.name || user.email}</strong> ! Pour débloquer toutes les fonctionnalités Premium, 
                vous avez <strong>2 options simples</strong> :
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                  mb: 3,
                }}
              >
                {/* Option 1 : Paiement NITA */}
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.05) 100%)",
                    border: "2px solid rgba(59,130,246,0.3)",
                    boxShadow: "0 4px 16px rgba(59,130,246,0.15)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <CreditCardIcon sx={{ fontSize: 32, color: "#3b82f6" }} />
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{ color: "#3b82f6", fontSize: { xs: 16, md: 18 } }}
                    >
                      Option 1 : Paiement NITA
                    </Typography>
                  </Box>
                  
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#3b82f6", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Cliquez sur le bouton ci-dessous pour générer votre référence de paiement
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#3b82f6", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Allez au guichet NITA ou utilisez l'application MYNITA
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#3b82f6", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Payez 2 000 FCFA avec votre référence
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#3b82f6", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Votre abonnement sera activé automatiquement
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    startIcon={<CreditCardIcon />}
                    endIcon={<ArrowForwardIcon />}
                    onClick={startNitaFlow}
                    disabled={nitaBusy || showNita || premiumActive}
                    sx={{
                      width: "100%",
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      color: "#fff",
                      fontWeight: 900,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                        boxShadow: "0 6px 20px rgba(59,130,246,0.4)",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        background: "rgba(59,130,246,0.5)",
                        color: "rgba(255,255,255,0.7)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {nitaBusy ? "Génération en cours..." : premiumActive ? "Déjà abonné" : "Payer via NITA (2 000 FCFA)"}
                  </Button>
                </Card>

                {/* Option 2 : Carte d'abonnement */}
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,165,0,0.05) 100%)",
                    border: "2px solid rgba(255,215,0,0.3)",
                    boxShadow: "0 4px 16px rgba(255,215,0,0.15)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <KeyIcon sx={{ fontSize: 32, color: "#FFD700" }} />
                    <Typography
                      variant="h6"
                      fontWeight={800}
                      sx={{ color: "#FFD700", fontSize: { xs: 16, md: 18 } }}
                    >
                      Option 2 : Carte d'abonnement
                    </Typography>
                  </Box>
                  
                  <Stack spacing={1.5} sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Donnez votre numéro de téléphone au distributeur
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Vous recevrez une <strong>notification SMS avec le numéro de la carte</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Cliquez sur dans votre menu <strong>"Mes cartes"</strong> pour voir la carte
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Le code est visible directement sur la carte (format : <strong>FAH-XXXXXXXX</strong>)
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Copier le code et coller le dans le champs <strong>"J'ai une carte à gratter"</strong> dans le menu <strong>Prix</strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Votre abonnement sera activé instantanément
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: "#FFD700", mt: 0.2 }} />
                      <Typography sx={{ fontSize: 13, color: "rgba(0,0,0,0.8)" }}>
                        Vous pouvez aussi appeler <strong>+22780648383</strong> pour toutes sollicitations
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    startIcon={<KeyIcon />}
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => setOpenDistributeurs(true)}
                    sx={{
                      width: "100%",
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      color: "#000",
                      fontWeight: 900,
                      py: 1.5,
                      borderRadius: 2,
                      boxShadow: "0 4px 16px rgba(255,215,0,0.3)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)",
                        boxShadow: "0 6px 20px rgba(255,215,0,0.4)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Rechercher un distributeur Proche
                  </Button>
                </Card>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <LanguageIcon sx={{ fontSize: 18, color: "#3b82f6" }} />
                  <strong>Besoin d'aide ?</strong> Vous pouvez envoyez un whatsapp ou appeller au + 22780648383
                </Typography>
              </Box>
            </Box>
          </Alert>
        </Box>
      )}

      {/* Bloc suivi NITA */}
      {user && !premiumActive && (
        <Collapse in={showNita}>
          <Box
            sx={{
              mt: 3,
              mb: 3,
              mx: "auto",
              px: { xs: 2, sm: 3, md: 4 },
              maxWidth: 1200,
            }}
          >
            <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, background: "rgba(255,255,255,0.95)" }}>
              <Typography variant="h6" fontWeight={900} gutterBottom>
                Paiement NITA
              </Typography>
              <Typography sx={{ mb: 2, color: "rgba(0,0,0,0.7)" }}>
                Donnez cette <strong>référence d'achat</strong> au guichet NITA ou saisissez-la dans MYNITA.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ mb: 2 }}
              >
                <TextField
                  value={referenceAchat || ""}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  label="Référence"
                  sx={{ flex: 1 }}
                />
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copyToClipboard(referenceAchat)}
                  sx={{ minWidth: { xs: "100%", sm: "120px" } }}
                >
                  Copier
                </Button>
              </Stack>

              <Alert severity="info" sx={{ mb: 2 }}>
                Si le paiement est confirmé, votre abonnement sera activé automatiquement, votre statut sera actualisé et vous recevrez un SMS de confirmation.
              </Alert>

              <Box sx={{ mb: 2 }}>
                <LinearProgress />
              </Box>

              <Button type="button" variant="text" onClick={handleCloseNita} fullWidth>
                Fermer
              </Button>
            </Paper>
          </Box>
        </Collapse>
      )}

      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          color: "#fff",
          py: { xs: 6, md: 8 },
          overflow: "hidden",
          background: "linear-gradient(135deg, #0B1220 0%, #0E1A35 60%, #102245 100%)",
          mt: user && !premiumActive ? 0 : 7,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={downMd ? "column" : "row"}
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
          >
            <Box sx={{ flex: 1}}>
              <Typography variant={downMd ? "h4" : "h3"} fontWeight={800} sx={{mt:5}}>
                Les maths, c’est facile avec Fahimta
              </Typography>
              <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.85)" }}>
                Pose tes questions à l’IA, explore des livres, sujets corrigés
                et vidéos — tout en libre accès.
              </Typography>

              <Stack
                direction={downMd ? "column" : "row"}
                spacing={2}
                sx={{ mt: 3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 2,
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <Stack spacing={1} alignItems="center" textAlign="center">
                    <LockIcon sx={{  color:'white'}}/>
                    <Typography fontWeight={700} sx={{  color:'white'}}>Assistance complète</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 , color:'white'}}>
                      Soumets tes exercices, pose des questions en texte, audio
                      ou visio.
                    </Typography>
                    <Button
                      variant="contained"
                      color="warning"
                      disableElevation
                     onClick={() => navigate("/pricing")}
                      sx={{ fontWeight: 800, px: 2.5, borderRadius: 2 }}
                    >
                      S’abonner
                    </Button>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    flex: 1,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 2,
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <Stack spacing={1} alignItems="center" textAlign="center">
                    <SupportAgentIcon sx={{  color:'white'}} />
                    <Typography fontWeight={700} sx={{  color:'white'}}>
                      Accompagnement 24h/24
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 , color:'white'}}>
                      Accède à l’IA et aux enseignants à toute heure.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      disableElevation
                    onClick={() => navigate("/pricing")}
                      sx={{ fontWeight: 800, px: 2.5, borderRadius: 2 }}
                    >
                      Découvrir les offres
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Box>

            <Box
              sx={{
                flex: 1,
                width: "100%",
                maxWidth: 520,
                borderRadius: 3,
                p: 2,
                backdropFilter: "blur(8px)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <AutoAwesomeIcon />
                <Typography fontWeight={800}>Tester Fahimta AI</Typography>
              </Stack>

              {/* Bandeau quota */}
              {(checkingQuota || remaining !== null) && (
                <Box
                  sx={{
                    mt: 1.5,
                    mb: 1,
                    p: 1.2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: remaining === 0 ? "#FDE68A" : "#CFFAFE",
                    background:
                      remaining === 0
                        ? "rgba(239,68,68,0.18)"
                        : "rgba(16,185,129,0.18)",
                    border: "1px solid",
                    borderColor:
                      remaining === 0
                        ? "rgba(239,68,68,0.35)"
                        : "rgba(16,185,129,0.35)",
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {checkingQuota
                      ? "Vérification du quota…"
                      : remaining === 0
                      ? `Plus de tests gratuits disponibles. ${
                          resetAt ? `Réinitialisation le ${fmtReset(resetAt)}.` : ""
                        }`
                      : `Il te reste ${remaining}/${maxFree} test${
                          maxFree > 1 ? "s" : ""
                        } gratuit${maxFree > 1 ? "s" : ""} ce mois-ci.`}
                  </Typography>

                  {typeof pct === "number" && (
                    <Box sx={{ flex: 1, ml: 1 }}>
                      <LinearProgress variant="determinate" value={pct} />
                    </Box>
                  )}

                  {remaining === 0 && (
                    <Button
                      size="small"
                      variant="contained"
                     onClick={() => navigate("/pricing")}
                      sx={{ ml: "auto" }}
                    >
                      Voir les offres
                    </Button>
                  )}
                </Box>
              )}

             
<TextField
  label="💬 Pose ta question ici..."
  fullWidth
  multiline
  rows={downMd ? 4 : 3}
  variant="outlined"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitAI();
    }
  }}
  disabled={remaining === 0}
  sx={{
    mt: 1.5,
    "& .MuiOutlinedInput-root": {
      bgcolor: "#fff",
      borderRadius: 2,
    },
    // couleur du helperText (Astuce) en blanc
    "& .MuiFormHelperText-root": {
      color: "#fff",
      opacity: 0.9,
    },
  }}
  // (optionnel) même chose ici si tu préfères
  // FormHelperTextProps={{ sx: { color: "#fff", opacity: 0.9 } }}
  helperText={
    listening
      ? "🎙️ Dictée en cours… vous pouvez corriger le texte pendant l’enregistrement."
      : "Astuce : appuyez sur le micro pour dicter, puis corrigez si besoin avant d’envoyer."
  }
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        {/* Micro ON/OFF */}
        <IconButton
          onClick={handleToggleDictation}
          onMouseDown={(e) => e.preventDefault()}
          disabled={!sttSupported || remaining === 0}
          aria-label="Dicter au micro"
          aria-pressed={listening}
          title={
            !sttSupported
              ? "Micro non supporté par ce navigateur"
              : listening
              ? "Arrêter la dictée"
              : "Dicter au micro"
          }
          color={listening ? "error" : "primary"}
          size="large"
          edge="start"
          sx={{ mr: 0.25 }}
        >
          {listening ? <MicOffRoundedIcon /> : <MicNoneRoundedIcon />}
        </IconButton>

        {/* 🔄 Réinitialiser (à côté du micro) */}
        <IconButton
          onClick={handleResetDictationInput}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Réinitialiser la dictée"
          title="Réinitialiser la dictée"
          size="large"
          edge="start"
          sx={{ ml: 0.25 }}
        >
          <RestartAltIcon />
        </IconButton>
      </InputAdornment>
    ),
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={handleSubmitAI}
          disabled={loadingAI || !input.trim() || remaining === 0}
          aria-label="Envoyer"
          title="Envoyer"
          edge="end"
        >
          <SendRoundedIcon color="primary" />
        </IconButton>
      </InputAdornment>
    ),
  }}
/>

              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, opacity: 0.85 }}
              >
                Exemple : “Explique les limites en Terminale C” • “C’est quoi
                une fonction dérivable ?”
              </Typography>

              {loadingAI && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                  <CircularProgress size={18} />
                  <Typography>Analyse en cours…</Typography>
                </Stack>
              )}

              {!!aiError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {aiError}
                </Alert>
              )}

              {/* Messages */}
              <Box
                sx={{
                  mt: 2,
                  maxHeight: downMd ? 220 : 340,
                  overflow: "auto",
                  pr: 1,
                }}
              >
                {messages.map((m, i) => (
                  <Paper
                    key={i}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      mb: 1.2,
                      borderRadius: 2,
                      bgcolor: m.role === "user" ? "#F4F7FB" : "rgba(25,118,210,0.95)",
                      color: m.role === "user" ? "text.primary" : "#fff",
                      border: m.role === "user" ? "1px solid rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {m.role === "user" ? "🙋‍♂️ Toi" : "Fahimta AI"}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                      {m.role === "ia" && i === messages.length - 1
                        ? typedResponse
                        : m.text}
                    </Typography>

                    {m.role === "ia" && (
                      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => navigator.clipboard.writeText(m.text)}
                        >
                          Copier
                        </Button>
                      </Stack>
                    )}
                  </Paper>
                ))}
              </Box>

              {/* Actions IA */}



{messages.length > 0 && (
  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
    <Button size="small" startIcon={<VolumeUpRoundedIcon />} onClick={handleSpeak} disabled={!ttsSupported || !getLastIaText()}>
      Écouter
    </Button>
    <Button size="small" startIcon={<StopRoundedIcon />} onClick={handleStopSpeak} disabled={!speaking}>
      Arrêter l’audio
    </Button>
    <Button size="small" startIcon={<RestartAltIcon />} onClick={() => { setMessages([]); setTypedResponse(""); setAiError(""); handleStopSpeak(); }}>
      Réinitialiser
    </Button>

    {/* ↓↓↓ AJOUT ICI ↓↓↓ */}
    <Button
      size="small"
      onClick={exportIaTxt}
      disabled={!getLastIaText()}
    >
      Enregistrer .TXT
    </Button>
 
  </Stack>
)}





            </Box>
          </Stack>
        </Container>
      </Box>

      {/* RESSOURCES */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Barre de recherche + Tabs */}
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            borderRadius: 2,
            position: "sticky",
            top: (th) =>
              `calc(${(th.mixins && th.mixins.toolbar && th.mixins.toolbar.minHeight ? th.mixins.toolbar.minHeight : 64)}px + 8px)`,
            zIndex: 2,
            bgcolor: "#fff",
            border: "1px solid rgba(0,0,0,0.06)",
            mb: 3,
          }}
        >
          {/* ✅ Onglets de sélection de matière */}
          <Tabs
            value={selectedSubject}
            onChange={(_e, v) => setSelectedSubject(v)}
            variant={downMd ? "scrollable" : "standard"}
            centered={!downMd}
            sx={{
              mb: 2,
              borderBottom: "1px solid rgba(0,0,0,0.08)",
              "& .MuiTab-root": { 
                fontWeight: 800, 
                textTransform: "none", 
                fontSize: { xs: 14, md: 15 },
                minHeight: 48
              },
            }}
          >
            <Tab label="📐 Mathématiques" value="maths" />
            <Tab 
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ fontWeight: 800 }}>⚛️ Physique</Typography>
                  <Chip label="Bientôt" size="small" color="info" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                </Stack>
              } 
              value="physique" 
            />
            <Tab 
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ fontWeight: 800 }}>🧪 Chimie</Typography>
                  <Chip label="Bientôt" size="small" color="info" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                </Stack>
              } 
              value="chimie" 
            />
            <Tab 
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography sx={{ fontWeight: 800 }}>🌱 SVT</Typography>
                  <Chip label="Bientôt" size="small" color="info" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
                </Stack>
              } 
              value="svt" 
            />
          </Tabs>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
           
           {/* Onglets de contenu (Livres/Examens/Vidéos) - visible si du contenu existe pour la matière */}
           {(selectedSubject === "maths" || countBySubject.livres > 0 || countBySubject.exams > 0 || countBySubject.videos > 0) && (
           <Tabs
  value={tabIndex}
  onChange={(_e, v) => setTabIndex(v)}
  variant={downMd ? "scrollable" : "fullWidth"}
  scrollButtons="auto"
  allowScrollButtonsMobile
  TabIndicatorProps={{ style: { background: theme.palette.primary.main } }}
  sx={{
    "& .MuiTabs-flexContainer": {
      gap: 8,
      flexWrap: "nowrap",
    },
    "& .MuiTabs-scroller": {
      overflowX: "auto !important",
      msOverflowStyle: "none",
      scrollbarWidth: "none",
      touchAction: "pan-x",
    },
    "& .MuiTabs-scroller::-webkit-scrollbar": { display: "none" },
    "& .MuiTabScrollButton-root": {
      display: "flex !important",
      width: 34,
      height: 34,
      alignSelf: "center",
      borderRadius: 999,
      mx: 0.5,
      bgcolor: "rgba(13,110,253,0.08)",
      "&:hover": { bgcolor: "rgba(13,110,253,0.16)" },
    },
    "& .MuiTabs-scrollButtons.Mui-disabled": { opacity: 0.3 },
    "& .MuiTab-root": { fontWeight: 700, textTransform: "none", whiteSpace: "nowrap" },
  }}
>
  <Tab label={<TabLabel label="Livres" count={countBySubject.livres} />} id="tab-0" aria-controls="panel-0" />
  <Tab label={<TabLabel label="Sujets corrigés" count={countBySubject.exams} />} id="tab-1" aria-controls="panel-1" />
 <Tab label={<TabLabel label="Vidéos" count={countBySubject.videos} />} id="tab-2" aria-controls="panel-2" />

</Tabs>
           )}

             
            {/* Barre de recherche - visible si du contenu existe pour la matière */}
            {(selectedSubject === "maths" || countBySubject.livres > 0 || countBySubject.exams > 0 || countBySubject.videos > 0) && (
            <TextField
              placeholder="Rechercher (titre, matière, classe)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              size="small"
              sx={{ minWidth: { xs: "100%", md: 360 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            )}
          </Stack>
        </Paper>

        {/* ✅ Message "Bientôt disponible" SEULEMENT si aucun contenu pour cette matière */}
        {selectedSubject !== "maths" && countBySubject.livres === 0 && countBySubject.exams === 0 && countBySubject.videos === 0 && (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Box
              sx={{
                display: "inline-block",
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
              }}
            >
              <Typography variant="h4" fontWeight={800} gutterBottom>
                {selectedSubject === "physique" && "⚛️ Physique"}
                {selectedSubject === "chimie" && "🧪 Chimie"}
                {selectedSubject === "svt" && "🌱 SVT"}
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, opacity: 0.95 }}>
                Bientôt disponible ! 🚀
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                Vidéos, livres et examens corrigés disponibles prochainement.
              </Typography>
              <Chip
                label="En préparation"
                sx={{
                  mt: 3,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 700,
                }}
              />
            </Box>
          </Box>
        )}

        {/* Contenu (Livres/Examens/Vidéos) - affichage pour toutes les matières SI du contenu existe */}
        {(selectedSubject === "maths" || countBySubject.livres > 0 || countBySubject.exams > 0 || countBySubject.videos > 0) && (
        <>

     {/* Panel Livres */}
<Box role="tabpanel" hidden={tabIndex !== 0} id="panel-0" aria-labelledby="tab-0">
  {loadingBooks ? (
    renderSkeletonGrid()
  ) : errBooks ? (
    <Alert severity="error">{errBooks}</Alert>
  ) : (
    <>
      {/* Filtres de levels (Livres) */}
      {bookLevels.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
          {bookLevels.map((lv) => (
            <Chip
              key={lv}
              label={lv}
              clickable
              variant={selectedLevel === lv ? "filled" : "outlined"}
              color={selectedLevel === lv ? "primary" : "default"}
              onClick={() => setSelectedLevel(lv)}
            />
          ))}
        </Stack>
      )}

      {filteredLivres.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography fontWeight={700}>Aucun résultat</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Essaie un autre mot-clé ou enlève des filtres.
          </Typography>
          <Button sx={{ mt: 1.5 }} onClick={() => setQ("")}>
            Réinitialiser la recherche
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredLivres.map((livre, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <BookCardGratuit book={livre} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )}
</Box>

{/* Panel Sujets */}
<Box role="tabpanel" hidden={tabIndex !== 1} id="panel-1" aria-labelledby="tab-1">
  {loadingExams ? (
    renderSkeletonGrid()
  ) : errExams ? (
    <Alert severity="error">{errExams}</Alert>
  ) : (
    <>
      {/* Filtres de levels (Sujets corrigés) */}
      {examLevels.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
          {examLevels.map((lv) => (
            <Chip
              key={lv}
              label={lv}
              clickable
              variant={selectedLevel === lv ? "filled" : "outlined"}
              color={selectedLevel === lv ? "primary" : "default"}
              onClick={() => setSelectedLevel(lv)}
            />
          ))}
        </Stack>
      )}

      {filteredExams.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography fontWeight={700}>Aucun résultat</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Essaie un autre mot-clé ou enlève des filtres.
          </Typography>
          <Button sx={{ mt: 1.5 }} onClick={() => setQ("")}>
            Réinitialiser la recherche
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredExams.map((exam) => (
            <Grid item xs={12} sm={6} md={4} key={exam._id}>
              <ExamCardGratuit exam={exam} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )}
</Box>

{/* Panel Vidéos */}
<Box role="tabpanel" hidden={tabIndex !== 2} id="panel-2" aria-labelledby="tab-2">
  {loadingVideos ? (
    renderSkeletonGrid()
  ) : errVideos ? (
    <Alert severity="error">{errVideos}</Alert>
  ) : (
    <>
      {/* Filtres de levels (Vidéos) */}
      {videoLevels.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
          {videoLevels.map((lv) => (
            <Chip
              key={lv}
              label={lv}
              clickable
              variant={selectedLevel === lv ? "filled" : "outlined"}
              color={selectedLevel === lv ? "primary" : "default"}
              onClick={() => setSelectedLevel(lv)}
            />
          ))}
        </Stack>
      )}

      {filteredVideos.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography fontWeight={700}>Aucun résultat</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
            Essaie un autre mot-clé ou enlève des filtres.
          </Typography>
          <Button sx={{ mt: 1.5 }} onClick={() => setQ("")}>
            Réinitialiser la recherche
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredVideos.map((video) => (
            <Grid item xs={12} sm={6} md={4} key={video._id || video.id}>
              <VideoCardGratuit video={video} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  )}
</Box>


        <Divider sx={{ my: 6 }} />

        {/* Bandeau d’appel à l’action */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            textAlign: "center",
            background: "linear-gradient(90deg, #EAF3FF 0%, #F8FBFF 100%)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Typography variant={downMd ? "h5" : "h4"} fontWeight={900}>
            Besoin d'aller plus loin ?
          </Typography>
          <Typography sx={{ mt: 1, color: "text.secondary" }}>
            Passe à la formule Premium pour bénéficier d'un accompagnement personnalisé en continu.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ mt: 2, fontWeight: 800 }}
           onClick={() => navigate("/pricing")}
          >
            Voir les offres
          </Button>
        </Paper>
        </>
        )}
      </Container>

      {/* Snackbar pour les notifications - doit être à la fin */}
      <Snackbar
        open={toast.open}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        autoHideDuration={3500}
        message={toast.msg}
      />

      {/* Modal distributeurs */}
      <DistributeursModal open={openDistributeurs} onClose={() => setOpenDistributeurs(false)} />
    </PageLayout>
  );
};

export default GratuitFahimtaPage;

