// pages/PremiumFahimtaPage.jsx
import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Stack,
  Container,
  Chip,
  IconButton,
  Divider,
  LinearProgress,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Collapse,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PageLayout from "../components/PageLayout";
import API from "../api";
import BookCard from "../components/premuim/BookCard";
import ExamCard from "../components/premuim/ExamCard";
import VideoCardPremium from "../components/premuim/VideoCardPremium";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import VideoSearchBar from "../components/premuim/VideoSearchBar";
import ContentRequestFAB from "../components/ContentRequestFAB";
/* Icons */
import LockIcon from "@mui/icons-material/Lock";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";


import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";



import { InputAdornment } from "@mui/material";

import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import CameraswitchRoundedIcon from "@mui/icons-material/CameraswitchRounded";
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CropRoundedIcon from "@mui/icons-material/CropRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";
import FlipCameraIosRoundedIcon from "@mui/icons-material/FlipCameraIosRounded";
import FlipCameraAndroidRoundedIcon from "@mui/icons-material/FlipCameraAndroidRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import RotateLeftRoundedIcon from "@mui/icons-material/RotateLeftRounded";

// --- export TXT helpers ---
const saveTextFile = async (text = "", filename = "fahimta.txt") => {
  // Normaliser les sauts de ligne pour mobile (CRLF pour meilleure compatibilité)
  const normalizedText = text
    .replace(/\r\n/g, '\n')  // Uniformiser d'abord en LF
    .replace(/\r/g, '\n')    // Remplacer les CR seuls
    .replace(/\n/g, '\r\n'); // Convertir en CRLF pour compatibilité mobile
  
  // Ajouter BOM UTF-8 pour meilleur support mobile
  const BOM = '\uFEFF';
  const textWithBOM = BOM + normalizedText;
  
  const blob = new Blob([textWithBOM], { type: "text/plain;charset=utf-8" });
  
  // Sur mobile moderne, utiliser l'API Web Share si disponible
  const isMobile = navigator.userAgent.match(/(iPhone|iPad|Android)/i);
  
  if (isMobile && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: "text/plain" });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Réponse Fahimta AI",
          text: "Voici la réponse de l'IA"
        });
        return;
      }
    } catch (err) {
      console.log("Web Share non disponible, fallback au téléchargement classique");
    }
  }
  
  // Méthode classique de téléchargement
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  
  if (isMobile) {
    a.target = "_blank";
  }
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

// plein texte (pas l'animation) pour IA et OCR
const getFullIaText = (typedText, response) => (response || typedText || "").trim();
const getFullOcrText = (typedOCR, ocrResponse) => (ocrResponse || typedOCR || "").trim();

// nom de fichier horodaté
const tsName = (base) =>
  `${base}-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.txt`;




/* ---------------- utils ---------------- */
/* ---------------- utils ---------------- */
// délai par défaut entre phrases
const sentenceDelayMs = 550;

// Révèle un texte phrase par phrase (gère aussi les sauts de ligne)
function revealBySentence(text = "", setState, options = {}) {
  const { base = 350, perChar = 8, maxDelay = 1500, fixedDelay = null } = options;

  setState("");

  // Normalise et découpe en lignes puis en phrases
  const normalized = (text || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n");
  const lines = normalized.split("\n");

  const chunks = [];
  lines.forEach((line, idx) => {
    if (line.trim() === "") {
      chunks.push("\n");
      return;
    }
    const sentences = line.split(/(?<=[\.!?…])\s+/u).filter(Boolean);
    chunks.push(...sentences);
    if (idx < lines.length - 1) chunks.push("\n");
  });

  let i = 0;
  let acc = "";
  let timerId = null;

  const step = () => {
    if (i >= chunks.length) return;

    const next = chunks[i];
    acc += (next === "\n" ? "\n" : (acc.endsWith("\n") || acc === "" ? "" : " ") + next);
    setState(acc);
    i += 1;

    if (i < chunks.length) {
      const delay = fixedDelay != null
        ? fixedDelay
        : Math.min(maxDelay, base + perChar * (chunks[i]?.length || 0));
      timerId = setTimeout(step, delay);
    }
  };

  // première étape
  timerId = setTimeout(step, 0);

  // retourne un cleanup
  return () => {
    if (timerId) clearTimeout(timerId);
  };
}


// ✅ Uniformise les noms qui peuvent varier selon la version backend
const normalizeQuotas = (q = {}) => {
  const iaVisionRemaining =
    q.iaVisionRemaining ??
    q.iaGptVisionRemaining ??
    q.iaImageRemaining ??
    q.visionRemaining ??
    null;

  return { ...q, iaVisionRemaining };
};

const QuotaPill = ({ label, value, bg }) => (
  <Card
    sx={{
      background: bg,
      textAlign: "center",
      borderRadius: 2,
      p: 2,
      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    }}
  >
    <Typography fontWeight={800} sx={{ letterSpacing: 0.3 }}>
      {label}
    </Typography>
    <Typography variant="h5" sx={{ mt: 0.5 }}>
      {value}
    </Typography>
  </Card>
);

const TabLabel = ({ text }) => (
  <Typography sx={{ color: "#fff", fontWeight: 800 }}>{text}</Typography>
);

/* ---------------- page ---------------- */
const PremiumFahimtaPage = () => {
  const theme = useTheme();
  const downMd = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isPremiumUser = user?.isSubscribed === true;


  // Si connecté (route protégée) mais pas abonné → redirige vers /pricing
 useEffect(() => {
  if (user && isPremiumUser === false) {
     navigate("/pricing", { replace: true });
  } }, [user, isPremiumUser, navigate]);

  // onglets ressources
  const [tabIndex, setTabIndex] = useState(0);

  // ✅ Sélection de matière (par défaut Maths)
  const [selectedSubject, setSelectedSubject] = useState("maths");

  // ressources
  const [livres, setLivres] = useState([]);
  const [exams, setExams] = useState([]);
  const [videos, setVideos] = useState([]);

  // IA (texte)
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [typedText, setTypedText] = useState("");
  const [message, setMessage] = useState("");

  // OCR (image)
  const [ocrImage, setOcrImage] = useState(null);
  const [ocrResponse, setOcrResponse] = useState("");
  const [typedOCR, setTypedOCR] = useState("");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState("");

  // Camera capture
  const [cameraSupported, setCameraSupported] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "user" or "environment"
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [photoRotation, setPhotoRotation] = useState(0);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 }); // en pourcentage
  const [brightness, setBrightness] = useState(100); // 0-200
  const [contrast, setContrast] = useState(100); // 0-200
  const [saturation, setSaturation] = useState(100); // 0-200
  const [imageScale, setImageScale] = useState(100); // 50-200 pour zoom
  const [sharpness, setSharpness] = useState(0); // -100 à 100
  const [exposure, setExposure] = useState(0); // -100 à 100
  const [hue, setHue] = useState(0); // -180 à 180
  const [blur, setBlur] = useState(0); // 0-20
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("none"); // "none", "grayscale", "sepia", "vintage", "cool", "warm"
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const cropImageRef = React.useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState(null); // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w', null
  const [cropStartArea, setCropStartArea] = useState(null); // Pour stocker l'état initial lors du redimensionnement

  // quotas
  const [quotas, setQuotas] = useState(null);

  // Détection de la caméra
  useEffect(() => {
    const checkCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          // Juste tester si on peut accéder à une caméra
          const devices = await navigator.mediaDevices.enumerateDevices();
          const hasCamera = devices.some(device => device.kind === 'videoinput');
          setCameraSupported(hasCamera);
        } catch {
          setCameraSupported(false);
        }
      } else {
        setCameraSupported(false);
      }
    };
    checkCamera();
  }, []);








// --- Speech to Text (dictée) + TTS — version anti-doublons améliorée ----------
const [sttSupported, setSttSupported] = useState(false);
const [listening, setListening] = useState(false);
const recognitionRef = React.useRef(null);

// Accumulateurs pour éviter les répétitions
const baseRef = React.useRef("");          // texte présent AVANT de démarrer la dictée
const finalSegmentsRef = React.useRef([]); // ARRAY des segments finaux (pas de join)
const processedIndexesRef = React.useRef(new Set()); // Set des index déjà traités
const partialRef = React.useRef("");       // segment en cours (interim)
const stopTimerRef = React.useRef(null);

// --- Text to Speech (lecture de la réponse)
const [ttsSupported, setTtsSupported] = useState(false);
const [speaking, setSpeaking] = useState(false);
const utteranceRef = React.useRef(null);

// Détection mobile (les moteurs mobiles répètent souvent les interim)
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
    rec.interimResults = !isMobile;   // mobile: pas d'interim => moins de doublons

    rec.onstart = () => {
      baseRef.current = (input && input.trim()) ? input.trim() : "";
      finalSegmentsRef.current = [];
      processedIndexesRef.current = new Set();
      partialRef.current = "";
      setListening(true);
    };

    rec.onresult = (e) => {
      // Parcours TOUS les résultats pour reconstruire les segments finaux
      const newFinalSegments = [];
      
      for (let i = 0; i < e.results.length; i += 1) {
        const res = e.results[i];
        const txt = (res[0]?.transcript || "").replace(/\s+/g, " ").trim();
        if (!txt) continue;

        if (res.isFinal) {
          // Ajoute seulement si cet index n'a PAS déjà été traité
          if (!processedIndexesRef.current.has(i)) {
            newFinalSegments.push(txt);
            processedIndexesRef.current.add(i);
          }
        }
      }

      // Ajoute les nouveaux segments finaux
      if (newFinalSegments.length > 0) {
        finalSegmentsRef.current = [...finalSegmentsRef.current, ...newFinalSegments];
      }

      // Gère l'interim (dernier résultat non-final)
      let currentPartial = "";
      if (!isMobile && e.results.length > 0) {
        const lastResult = e.results[e.results.length - 1];
        if (!lastResult.isFinal) {
          currentPartial = (lastResult[0]?.transcript || "").replace(/\s+/g, " ").trim();
        }
      }
      partialRef.current = currentPartial;

      // Reconstruction du texte complet
      const allParts = [
        baseRef.current,
        ...finalSegmentsRef.current,
        partialRef.current
      ].filter(Boolean);

      const composed = allParts.join(" ").replace(/\s+/g, " ").trim();
      setInput(composed);

      // Auto-stop doux après une petite pause sur mobile
      if (isMobile && newFinalSegments.length > 0) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = setTimeout(() => {
          try { recognitionRef.current?.stop(); } catch {}
        }, 1500);
      }
    };

    rec.onerror = () => {
      setListening(false);
      clearTimeout(stopTimerRef.current);
    };

    rec.onend = () => {
      setListening(false);
      clearTimeout(stopTimerRef.current);
      // Nettoie l'interim et finalise
      partialRef.current = "";
      const allParts = [baseRef.current, ...finalSegmentsRef.current].filter(Boolean);
      const composed = allParts.join(" ").replace(/\s+/g, " ").trim();
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
    setMessage("La dictée vocale n’est pas supportée par ce navigateur.");
    return;
  }
  if (listening) {
    try { recognitionRef.current.stop(); } catch {}
    return;
  }
  setMessage("");
  try {
    recognitionRef.current.start();
  } catch {
    setListening(false);
  }
};

// --- Quelle réponse lire ? (la dernière)
const getLastIaText = () => typedText || response || "";

// --- Lecture audio
const handleSpeak = () => {
  if (!ttsSupported) return setMessage("La lecture audio n’est pas supportée par ce navigateur.");
  const text = getLastIaText();
  if (!text) return;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = 1;
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





  












  /* ---------- effets ---------- */
useEffect(() => {
  if (!response) return;
  const cancel = revealBySentence(response, setTypedText, { base: 350, perChar: 8, maxDelay: 1500 });
  return cancel;
}, [response]);

useEffect(() => {
  if (!ocrResponse) return;
  const cancel = revealBySentence(ocrResponse, setTypedOCR, { base: 350, perChar: 8, maxDelay: 1500 });
  return cancel;
}, [ocrResponse]);


  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [booksRes, examsRes, videosRes, quotasRes] = await Promise.all([
          API.get("/premium"),
          API.get("/exams"),
          API.get("/videos"),
          API.get("/usage/me"),
        ]);
        setLivres(booksRes.data);
        setExams(examsRes.data);
        setVideos(videosRes.data);
        setQuotas(normalizeQuotas(quotasRes.data));
      } catch (err) {
        console.error("Erreur chargement Premium :", err?.message);
      }
    };
    fetchAll();
  }, []);

  // ✅ Réinitialiser les filtres et recherches quand on change de matière
  useEffect(() => {
    setVideoQuery("");
    setBookQuery("");
    setExamQuery("");
    setVf({ badge: [], level: [], matiere: [], classe: [], tags: [] });
    setBf({ badge: [], level: [], matiere: [], classe: [], tags: [] });
    setEf({ badge: [], level: [], matiere: [], classe: [], tags: [] });
    setTabIndex(0);
  }, [selectedSubject]);

  /* ---------- handlers IA texte ---------- */
  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setMessage("");
    setResponse("");
    setTypedText("");

    try {
      const res = await API.post("/ia/gtptxtprenuim", { input });
      setResponse(res.data.response || "");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
      setMessage(errorMessage);
      if (err.response?.data?.redirectTo) {
        setTimeout(() => (window.location.href = err.response.data.redirectTo), 2500);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetIA = () => {
    setInput("");
    setMessage("");
    setResponse("");
    setTypedText("");
  };


  const resetOCR = () => {
  setOcrImage(null);
  setOcrResponse("");
  setTypedOCR("");
  setOcrError("");
  setCapturedPhoto(null);
  setPhotoRotation(0);
};

  /* ---------- Gestion caméra ---------- */
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      setCameraOpen(true);
      
      // Attendre le prochain tick pour que le DOM soit à jour
      setTimeout(() => {
        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
          // Forcer le play au cas où
          videoRef.current.play().catch(err => console.log("Play error:", err));
        }
      }, 100);
    } catch (err) {
      console.error("Erreur caméra :", err);
      setOcrError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraOpen(false);
  };

  const switchCamera = () => {
    stopCamera();
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    setTimeout(startCamera, 100);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        setCapturedPhoto(file);
        setPhotoRotation(0);
      }
    }, "image/jpeg", 0.9);
  };

  const rotatePhoto = () => {
    setPhotoRotation(prev => (prev + 90) % 360);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setPhotoRotation(0);
    setCropMode(false);
    setCropArea({ x: 10, y: 10, width: 80, height: 80 });
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setImageScale(100);
    setSharpness(0);
    setExposure(0);
    setHue(0);
    setBlur(0);
    setFlipHorizontal(false);
    setFlipVertical(false);
    setSelectedFilter("none");
    setShowAdvancedControls(false);
    setResizeHandle(null);
  };

  // Rotation précise
  const rotatePhotoPrecise = (degrees) => {
    setPhotoRotation(prev => (prev + degrees) % 360);
  };

  // Appliquer un filtre prédéfini
  const applyFilter = (filterName) => {
    setSelectedFilter(filterName);
    switch(filterName) {
      case "grayscale":
        setSaturation(0);
        setContrast(110);
        break;
      case "sepia":
        setSaturation(50);
        setContrast(90);
        setBrightness(95);
        setHue(30);
        break;
      case "vintage":
        setSaturation(60);
        setContrast(85);
        setBrightness(105);
        setHue(-10);
        break;
      case "cool":
        setHue(-20);
        setSaturation(120);
        setBrightness(105);
        break;
      case "warm":
        setHue(20);
        setSaturation(120);
        setBrightness(105);
        break;
      case "none":
      default:
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setHue(0);
        break;
    }
  };

  const toggleCropMode = () => {
    setCropMode(prev => !prev);
    if (!cropMode) {
      // Réinitialiser la zone de crop
      setCropArea({ x: 10, y: 10, width: 80, height: 80 });
    }
  };

  // Gestion du drag pour déplacer la zone de crop
  // Détecter quel poignet est cliqué (si c'est un poignet)
  const getHandleAtPosition = (x, y, cropArea) => {
    const handleSize = 12; // Taille du poignet en pixels
    const tolerance = 15; // Zone de tolérance autour du poignet
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (!rect) return null;
    
    const imgWidth = rect.width;
    const imgHeight = rect.height;
    
    // Positions des poignets en pixels
    const handles = {
      nw: { x: (cropArea.x / 100) * imgWidth, y: (cropArea.y / 100) * imgHeight },
      ne: { x: ((cropArea.x + cropArea.width) / 100) * imgWidth, y: (cropArea.y / 100) * imgHeight },
      sw: { x: (cropArea.x / 100) * imgWidth, y: ((cropArea.y + cropArea.height) / 100) * imgHeight },
      se: { x: ((cropArea.x + cropArea.width) / 100) * imgWidth, y: ((cropArea.y + cropArea.height) / 100) * imgHeight },
      n: { x: ((cropArea.x + cropArea.width / 2) / 100) * imgWidth, y: (cropArea.y / 100) * imgHeight },
      s: { x: ((cropArea.x + cropArea.width / 2) / 100) * imgWidth, y: ((cropArea.y + cropArea.height) / 100) * imgHeight },
      w: { x: (cropArea.x / 100) * imgWidth, y: ((cropArea.y + cropArea.height / 2) / 100) * imgHeight },
      e: { x: ((cropArea.x + cropArea.width) / 100) * imgWidth, y: ((cropArea.y + cropArea.height / 2) / 100) * imgHeight },
    };
    
    // Vérifier la distance à chaque poignet
    for (const [handle, pos] of Object.entries(handles)) {
      const dx = x - pos.x;
      const dy = y - pos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < tolerance) {
        return handle;
      }
    }
    
    return null;
  };

  const handleCropMouseDown = (e) => {
    if (!cropMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Vérifier si on clique sur un poignet
    const handle = getHandleAtPosition(x, y, cropArea);
    
    if (handle) {
      // Mode redimensionnement
      setResizeHandle(handle);
      setIsDragging(true);
      setCropStartArea({ ...cropArea });
      setDragStart({ x, y });
    } else {
      // Mode déplacement
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      
      // Vérifier si on clique dans la zone de crop
      if (
        xPercent >= cropArea.x &&
        xPercent <= cropArea.x + cropArea.width &&
        yPercent >= cropArea.y &&
        yPercent <= cropArea.y + cropArea.height
      ) {
        setIsDragging(true);
        setResizeHandle(null);
        setDragStart({ x: xPercent - cropArea.x, y: yPercent - cropArea.y });
      }
    }
  };

  const handleCropMouseMove = (e) => {
    if (!isDragging || !cropMode) return;
    e.preventDefault();
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (resizeHandle && cropStartArea) {
      // Mode redimensionnement
      const startX = (dragStart.x / rect.width) * 100;
      const startY = (dragStart.y / rect.height) * 100;
      
      let newArea = { ...cropStartArea };
      const minSize = 5; // Taille minimale en pourcentage
      
      switch (resizeHandle) {
        case 'nw': // Coin nord-ouest
          newArea.width = cropStartArea.width + (cropStartArea.x - x);
          newArea.height = cropStartArea.height + (cropStartArea.y - y);
          newArea.x = Math.max(0, Math.min(x, cropStartArea.x + cropStartArea.width - minSize));
          newArea.y = Math.max(0, Math.min(y, cropStartArea.y + cropStartArea.height - minSize));
          if (newArea.width < minSize) {
            newArea.width = minSize;
            newArea.x = cropStartArea.x + cropStartArea.width - minSize;
          }
          if (newArea.height < minSize) {
            newArea.height = minSize;
            newArea.y = cropStartArea.y + cropStartArea.height - minSize;
          }
          if (newArea.x + newArea.width > 100) {
            newArea.width = 100 - newArea.x;
          }
          if (newArea.y + newArea.height > 100) {
            newArea.height = 100 - newArea.y;
          }
          break;
          
        case 'ne': // Coin nord-est
          newArea.width = x - cropStartArea.x;
          newArea.height = cropStartArea.height + (cropStartArea.y - y);
          newArea.y = Math.max(0, Math.min(y, cropStartArea.y + cropStartArea.height - minSize));
          if (newArea.width < minSize) newArea.width = minSize;
          if (newArea.height < minSize) {
            newArea.height = minSize;
            newArea.y = cropStartArea.y + cropStartArea.height - minSize;
          }
          if (newArea.x + newArea.width > 100) newArea.width = 100 - newArea.x;
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
          
        case 'sw': // Coin sud-ouest
          newArea.width = cropStartArea.width + (cropStartArea.x - x);
          newArea.height = y - cropStartArea.y;
          newArea.x = Math.max(0, Math.min(x, cropStartArea.x + cropStartArea.width - minSize));
          if (newArea.width < minSize) {
            newArea.width = minSize;
            newArea.x = cropStartArea.x + cropStartArea.width - minSize;
          }
          if (newArea.height < minSize) newArea.height = minSize;
          if (newArea.x + newArea.width > 100) {
            newArea.width = 100 - newArea.x;
          }
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
          
        case 'se': // Coin sud-est
          newArea.width = x - cropStartArea.x;
          newArea.height = y - cropStartArea.y;
          if (newArea.width < minSize) newArea.width = minSize;
          if (newArea.height < minSize) newArea.height = minSize;
          if (newArea.x + newArea.width > 100) newArea.width = 100 - newArea.x;
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
          
        case 'n': // Bord nord
          newArea.height = cropStartArea.height + (cropStartArea.y - y);
          newArea.y = Math.max(0, Math.min(y, cropStartArea.y + cropStartArea.height - minSize));
          if (newArea.height < minSize) {
            newArea.height = minSize;
            newArea.y = cropStartArea.y + cropStartArea.height - minSize;
          }
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
          
        case 's': // Bord sud
          newArea.height = y - cropStartArea.y;
          if (newArea.height < minSize) newArea.height = minSize;
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
          
        case 'w': // Bord ouest
          newArea.width = cropStartArea.width + (cropStartArea.x - x);
          newArea.x = Math.max(0, Math.min(x, cropStartArea.x + cropStartArea.width - minSize));
          if (newArea.width < minSize) {
            newArea.width = minSize;
            newArea.x = cropStartArea.x + cropStartArea.width - minSize;
          }
          if (newArea.x + newArea.width > 100) {
            newArea.width = 100 - newArea.x;
          }
          break;
          
        case 'e': // Bord est
          newArea.width = x - cropStartArea.x;
          if (newArea.width < minSize) newArea.width = minSize;
          if (newArea.x + newArea.width > 100) newArea.width = 100 - newArea.x;
          break;
      }
      
      setCropArea(newArea);
    } else {
      // Mode déplacement
      let newX = x - dragStart.x;
      let newY = y - dragStart.y;
      
      // Limites
      newX = Math.max(0, Math.min(100 - cropArea.width, newX));
      newY = Math.max(0, Math.min(100 - cropArea.height, newY));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
  };

  const handleCropMouseUp = () => {
    setIsDragging(false);
    setResizeHandle(null);
    setCropStartArea(null);
  };

  // Support tactile pour mobile
  const handleCropTouchStart = (e) => {
    if (!cropMode || e.touches.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Vérifier si on touche un poignet
    const handle = getHandleAtPosition(x, y, cropArea);
    
    if (handle) {
      // Mode redimensionnement
      setResizeHandle(handle);
      setIsDragging(true);
      setCropStartArea({ ...cropArea });
      setDragStart({ x, y });
    } else {
      // Mode déplacement
      const xPercent = (x / rect.width) * 100;
      const yPercent = (y / rect.height) * 100;
      
      // Vérifier si on touche dans la zone de crop
      if (
        xPercent >= cropArea.x &&
        xPercent <= cropArea.x + cropArea.width &&
        yPercent >= cropArea.y &&
        yPercent <= cropArea.y + cropArea.height
      ) {
        setIsDragging(true);
        setResizeHandle(null);
        setDragStart({ x: xPercent - cropArea.x, y: yPercent - cropArea.y });
      }
    }
  };

  const handleCropTouchMove = (e) => {
    if (!isDragging || !cropMode || e.touches.length === 0) return;
    e.preventDefault();
    
    const rect = cropImageRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    if (resizeHandle && cropStartArea) {
      // Mode redimensionnement (même logique que pour la souris)
      const startX = (dragStart.x / rect.width) * 100;
      const startY = (dragStart.y / rect.height) * 100;
      
      let newArea = { ...cropStartArea };
      const minSize = 5;
      
      switch (resizeHandle) {
        case 'nw':
          newArea.width = cropStartArea.width + (cropStartArea.x - x);
          newArea.height = cropStartArea.height + (cropStartArea.y - y);
          newArea.x = Math.max(0, Math.min(x, cropStartArea.x + cropStartArea.width - minSize));
          newArea.y = Math.max(0, Math.min(y, cropStartArea.y + cropStartArea.height - minSize));
          if (newArea.width < minSize) {
            newArea.width = minSize;
            newArea.x = cropStartArea.x + cropStartArea.width - minSize;
          }
          if (newArea.height < minSize) {
            newArea.height = minSize;
            newArea.y = cropStartArea.y + cropStartArea.height - minSize;
          }
          if (newArea.x + newArea.width > 100) {
            newArea.width = 100 - newArea.x;
          }
          if (newArea.y + newArea.height > 100) {
            newArea.height = 100 - newArea.y;
          }
          break;
        case 'ne':
          newArea.width = x - cropStartArea.x;
          newArea.height = cropStartArea.height + (cropStartArea.y - y);
          newArea.y = Math.max(0, Math.min(y, cropStartArea.y + cropStartArea.height - minSize));
          if (newArea.width < minSize) newArea.width = minSize;
          if (newArea.height < minSize) {
            newArea.height = minSize;
            newArea.y = cropStartArea.y + cropStartArea.height - minSize;
          }
          if (newArea.x + newArea.width > 100) newArea.width = 100 - newArea.x;
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
        case 'sw':
          newArea.width = cropStartArea.width + (cropStartArea.x - x);
          newArea.height = y - cropStartArea.y;
          newArea.x = Math.max(0, Math.min(x, cropStartArea.x + cropStartArea.width - minSize));
          if (newArea.width < minSize) {
            newArea.width = minSize;
            newArea.x = cropStartArea.x + cropStartArea.width - minSize;
          }
          if (newArea.height < minSize) newArea.height = minSize;
          if (newArea.x + newArea.width > 100) {
            newArea.width = 100 - newArea.x;
          }
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
        case 'se':
          newArea.width = x - cropStartArea.x;
          newArea.height = y - cropStartArea.y;
          if (newArea.width < minSize) newArea.width = minSize;
          if (newArea.height < minSize) newArea.height = minSize;
          if (newArea.x + newArea.width > 100) newArea.width = 100 - newArea.x;
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
        case 'n':
          newArea.height = cropStartArea.height + (cropStartArea.y - y);
          newArea.y = Math.max(0, Math.min(y, cropStartArea.y + cropStartArea.height - minSize));
          if (newArea.height < minSize) {
            newArea.height = minSize;
            newArea.y = cropStartArea.y + cropStartArea.height - minSize;
          }
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
        case 's':
          newArea.height = y - cropStartArea.y;
          if (newArea.height < minSize) newArea.height = minSize;
          if (newArea.y + newArea.height > 100) newArea.height = 100 - newArea.y;
          break;
        case 'w':
          newArea.width = cropStartArea.width + (cropStartArea.x - x);
          newArea.x = Math.max(0, Math.min(x, cropStartArea.x + cropStartArea.width - minSize));
          if (newArea.width < minSize) {
            newArea.width = minSize;
            newArea.x = cropStartArea.x + cropStartArea.width - minSize;
          }
          if (newArea.x + newArea.width > 100) {
            newArea.width = 100 - newArea.x;
          }
          break;
        case 'e':
          newArea.width = x - cropStartArea.x;
          if (newArea.width < minSize) newArea.width = minSize;
          if (newArea.x + newArea.width > 100) newArea.width = 100 - newArea.x;
          break;
      }
      
      setCropArea(newArea);
    } else {
      // Mode déplacement
      let newX = x - dragStart.x;
      let newY = y - dragStart.y;
      
      newX = Math.max(0, Math.min(100 - cropArea.width, newX));
      newY = Math.max(0, Math.min(100 - cropArea.height, newY));
      
      setCropArea(prev => ({ ...prev, x: newX, y: newY }));
    }
  };

  const handleCropTouchEnd = () => {
    setIsDragging(false);
    setResizeHandle(null);
    setCropStartArea(null);
  };

  // Fonction pour obtenir le curseur approprié selon le poignet
  const getResizeCursor = (handle) => {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      default:
        return 'move';
    }
  };

  const handleCropResize = (direction) => {
    setCropArea(prev => {
      let { x, y, width, height } = prev;
      
      switch(direction) {
        case 'increase':
          // Augmenter la taille du crop (réduire la zone visible)
          width = Math.min(95, width + 5);
          height = Math.min(95, height + 5);
          // Ajuster la position pour centrer
          x = Math.max(0, Math.min(100 - width, x - 2.5));
          y = Math.max(0, Math.min(100 - height, y - 2.5));
          break;
        case 'decrease':
          // Diminuer la taille du crop (agrandir la zone visible)
          width = Math.max(20, width - 5);
          height = Math.max(20, height - 5);
          // Ajuster la position pour centrer
          x = Math.max(0, Math.min(100 - width, x + 2.5));
          y = Math.max(0, Math.min(100 - height, y + 2.5));
          break;
        default:
          break;
      }
      
      return { x, y, width, height };
    });
  };

  const validatePhoto = () => {
    if (!capturedPhoto) return;

    const canvas = document.createElement("canvas");
    const img = new Image();
    const url = URL.createObjectURL(capturedPhoto);
    
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      
      // Calculer les dimensions après rotation
      let displayWidth = img.width;
      let displayHeight = img.height;
      
      if (photoRotation === 90 || photoRotation === 270) {
        displayWidth = img.height;
        displayHeight = img.width;
      }
      
      // Appliquer le scale (zoom)
      const scaledWidth = (displayWidth * imageScale) / 100;
      const scaledHeight = (displayHeight * imageScale) / 100;
      
      // Dimensions du canvas de travail (image complète après rotation et scale)
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      
      // Sauvegarder l'état du contexte pour les filtres
      ctx.save();
      
      // Calculer la luminosité totale (brightness + exposure)
      const totalBrightness = Math.max(0, Math.min(200, brightness + (exposure * 0.5)));
      
      // Appliquer les filtres de couleur (brightness, contrast, saturation, hue, blur, etc.)
      let filterString = `brightness(${totalBrightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      
      if (hue !== 0) {
        filterString += ` hue-rotate(${hue}deg)`;
      }
      
      if (blur > 0) {
        filterString += ` blur(${blur}px)`;
      }
      
      // Note: sharpness n'est pas supporté directement par CSS filter, on l'appliquera via canvas après
      ctx.filter = filterString;
      
      // Appliquer flip avant rotation
      let scaleX = flipHorizontal ? -1 : 1;
      let scaleY = flipVertical ? -1 : 1;
      
      // Dessiner l'image avec rotation, scale et flip
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((photoRotation * Math.PI) / 180);
      ctx.scale(scaleX, scaleY);
      ctx.drawImage(
        img, 
        -(img.width * imageScale / 100) / 2, 
        -(img.height * imageScale / 100) / 2,
        img.width * imageScale / 100,
        img.height * imageScale / 100
      );
      
      // Appliquer sharpness via convolution (approximation simplifiée pour performance)
      if (Math.abs(sharpness) > 5) {
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const width = canvas.width;
          const height = canvas.height;
          const tempData = new Uint8ClampedArray(data);
          
          // Kernel de sharpening/unsharpening
          const factor = Math.abs(sharpness) / 100;
          const sign = sharpness > 0 ? 1 : -1;
          
          // Pour les performances, on traite seulement un échantillon si l'image est grande
          const step = width > 1000 ? 2 : 1;
          
          for (let y = 1; y < height - 1; y += step) {
            for (let x = 1; x < width - 1; x += step) {
              for (let c = 0; c < 3; c++) { // RGB seulement
                const idx = (y * width + x) * 4 + c;
                const center = tempData[idx];
                
                // Moyenne des voisins
                let neighbors = 0;
                let sum = 0;
                for (let ky = -1; ky <= 1; ky++) {
                  for (let kx = -1; kx <= 1; kx++) {
                    if (kx === 0 && ky === 0) continue;
                    const nIdx = ((y + ky) * width + (x + kx)) * 4 + c;
                    sum += tempData[nIdx];
                    neighbors++;
                  }
                }
                const avg = sum / neighbors;
                
                // Appliquer le sharpening/unsharpening
                const diff = center - avg;
                data[idx] = Math.max(0, Math.min(255, center + diff * factor * sign));
              }
            }
          }
          
          // Si on a utilisé un step > 1, interpoler les pixels manquants
          if (step > 1) {
            for (let y = 1; y < height - 1; y++) {
              for (let x = 1; x < width - 1; x++) {
                if (y % step === 0 && x % step === 0) continue;
                for (let c = 0; c < 3; c++) {
                  const idx = (y * width + x) * 4 + c;
                  // Interpolation simple
                  const y1 = Math.floor(y / step) * step;
                  const y2 = Math.min(height - 1, y1 + step);
                  const x1 = Math.floor(x / step) * step;
                  const x2 = Math.min(width - 1, x1 + step);
                  
                  const v1 = data[(y1 * width + x1) * 4 + c];
                  const v2 = data[(y1 * width + x2) * 4 + c];
                  const v3 = data[(y2 * width + x1) * 4 + c];
                  const v4 = data[(y2 * width + x2) * 4 + c];
                  
                  const fx = (x - x1) / step;
                  const fy = (y - y1) / step;
                  data[idx] = Math.round(
                    v1 * (1 - fx) * (1 - fy) +
                    v2 * fx * (1 - fy) +
                    v3 * (1 - fx) * fy +
                    v4 * fx * fy
                  );
                }
              }
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        } catch (err) {
          console.warn("Erreur lors de l'application de la netteté:", err);
        }
      }
      
      ctx.restore();
      
      // Étape 2: Crop si activé (après rotation et scale)
      if (cropMode) {
        // Calculer les coordonnées de crop sur l'image rotée et scalée
        const cropX = (cropArea.x / 100) * scaledWidth;
        const cropY = (cropArea.y / 100) * scaledHeight;
        const cropWidth = (cropArea.width / 100) * scaledWidth;
        const cropHeight = (cropArea.height / 100) * scaledHeight;
        
        // Extraire la zone croppée
        const imageData = ctx.getImageData(cropX, cropY, cropWidth, cropHeight);
        
        // Redimensionner le canvas à la taille du crop
        canvas.width = cropWidth;
        canvas.height = cropHeight;
        
        // Réinitialiser et dessiner la zone croppée
        ctx.putImageData(imageData, 0, 0);
      }
      
      canvas.toBlob((blob) => {
        if (blob) {
          const processedFile = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
          setOcrImage(processedFile);
          setCapturedPhoto(null);
          setPhotoRotation(0);
          setCropMode(false);
          setCropArea({ x: 10, y: 10, width: 80, height: 80 });
          setBrightness(100);
          setContrast(100);
          setSaturation(100);
          setImageScale(100);
          stopCamera();
        }
      }, "image/jpeg", 0.92);
      
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  // Attacher le stream à la vidéo quand disponible
  useEffect(() => {
    if (cameraStream && videoRef.current && cameraOpen) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(err => console.log("Play error:", err));
    }
  }, [cameraStream, cameraOpen]);

  // Cleanup caméra à la fermeture
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);


  /* ---------- handlers OCR (VISION) ---------- */
  const handleImageSubmit = async () => {
    if (!ocrImage) return;

    const remaining = Number(quotas?.iaVisionRemaining ?? 0);
    if (remaining <= 0) {
      setOcrError("Vous avez atteint la limite mensuelle d'images.");
      return;
    }
    if (remaining > 0 && remaining <= 3) {
      setOcrError(
        `Attention : il ne vous reste plus que ${remaining} soumission(s) image ce mois-ci.`
      );
      // on continue quand même
    }

    const formData = new FormData();
    formData.append("image", ocrImage);

    setOcrLoading(true);
    setOcrError("");
    setOcrResponse("");
    setTypedOCR("");

    try {
      // Si ton API n’ajoute pas le token via un interceptor :
      const token = localStorage.getItem("token");

      const res = await API.post("/ia/gpt", formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        timeout: 30000,
      });

      setOcrResponse(res.data.response || "");

      // Recharger les quotas depuis l'API (et normaliser)
      const { data: refreshed } = await API.get("/usage/me");
      setQuotas(normalizeQuotas(refreshed));
    } catch (err) {
      setOcrError(err.response?.data?.message || "Erreur lors du traitement de l’image");
    } finally {
      setOcrLoading(false);
    }
  };

  const onDropFile = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Ouvrir le modal de manipulation avec le fichier déposé
      setCapturedPhoto(file);
      setCameraOpen(true);
      setPhotoRotation(0);
      setCropMode(false);
      setCropArea({ x: 10, y: 10, width: 80, height: 80 });
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setImageScale(100);
      setSharpness(0);
      setExposure(0);
      setHue(0);
      setBlur(0);
      setFlipHorizontal(false);
      setFlipVertical(false);
      setSelectedFilter("none");
      setShowAdvancedControls(false);
    }
  };

  const prevent = (e) => e.preventDefault();

  /* ---------- downloads ---------- */
  const handleDownloadSubject = async (examId) => {
    try {
      const res = await API.get(`/exams/${examId}/download-subject`);
      window.open(res.data.downloadUrl, "_blank");
    } catch (err) {
      console.error("Erreur téléchargement sujet :", err?.message);
      alert(err.response?.data?.message || "Erreur lors du téléchargement");
    }
  };

  const handleDownloadCorrection = async (examId) => {
    try {
      const res = await API.get(`/exams/${examId}/download-correction`);
      window.open(res.data.downloadUrl, "_blank");
    } catch (err) {
      console.error("Erreur téléchargement correction :", err?.message);
      alert(err.response?.data?.message || "Erreur lors du téléchargement");
    }
  };





// Recherche texte
const [videoQuery, setVideoQuery] = useState("");

// Filtres par badges
const [vf, setVf] = useState({
  badge: [],   // "gratuit" | "prenuim"
  level: [],   // "TERMINALE", "SECONDE", etc (en MAJ)
  matiere: [], // "Maths", "Physique", etc.
  classe: [],  // "Tle A", "2nde", etc.
  tags: [],    // ["suite", "derivée", ...]
});

// Valeurs disponibles (dérivées des vidéos)
const videoFacets = React.useMemo(() => {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  return {
    badge: uniq((videos || []).map((v) => v?.badge?.toLowerCase())),
    level: uniq((videos || []).map((v) => String(v?.level || "").toUpperCase())),
    matiere: uniq((videos || []).map((v) => v?.matiere)),
    classe: uniq((videos || []).map((v) => v?.classe)),
    tags: uniq((videos || []).flatMap((v) => Array.isArray(v?.tags) ? v.tags : [])),
  };
}, [videos]);

// Toggle/suppression filtres
const toggleVf = (key, val) => {
  setVf((prev) => {
    const set = new Set(prev[key]);
    set.has(val) ? set.delete(val) : set.add(val);
    return { ...prev, [key]: [...set] };
  });
};
const clearVf = () =>
  setVf({ badge: [], level: [], matiere: [], classe: [], tags: [] });

// Petit rendu de groupe de chips
const FilterGroup = ({ label, options = [], selected = [], onToggle, limit }) => {
  const opts = typeof limit === "number" ? options.slice(0, limit) : options;
  if (!opts.length) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, mr: 0.5 }}>{label} :</Typography>
      {opts.map((opt) => {
        const active = selected.includes(opt);
        return (
          <Chip
            key={`${label}-${opt}`}
            label={opt}
            clickable
            size="small"
            color={active ? "primary" : "default"}
            variant={active ? "filled" : "outlined"}
            onClick={() => onToggle(opt)}
          />
        );
      })}
    </Box>
  );
};



const filteredVideos = React.useMemo(() => {
  const q = videoQuery.trim().toLowerCase();

  return (videos || []).filter((v) => {
    // 0) ✅ Filtre par matière sélectionnée (subject)
    const videoSubject = v?.subject || "maths";
    if (videoSubject !== selectedSubject) return false;

    // 1) Recherche texte
    if (q) {
      const hay = [
        v?.title, v?.description, v?.matiere, v?.classe, v?.level, v?.badge,
        ...(Array.isArray(v?.tags) ? v.tags : []),
      ].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // 2) Filtres par badges (ET logiques entre groupes, OU logique dans un groupe)
    const badge = (v?.badge || "").toLowerCase();
    const level = String(v?.level || "").toUpperCase();
    const matiere = v?.matiere || "";
    const classe = v?.classe || "";
    const tags = Array.isArray(v?.tags) ? v.tags : [];

    const match = (key, val) => vf[key].length === 0 || vf[key].includes(val);

    if (!match("badge", badge)) return false;
    if (!match("level", level)) return false;
    if (!match("matiere", matiere)) return false;
    if (!match("classe", classe)) return false;

    // Tags : au moins un tag sélectionné présent
    if (vf.tags.length > 0 && !tags.some((t) => vf.tags.includes(t))) return false;

    return true;
  });
}, [videos, videoQuery, vf, selectedSubject]);











// --- Recherche texte (livres)
const [bookQuery, setBookQuery] = useState("");

// --- Filtres (livres)
const [bf, setBf] = useState({
  badge: [],   // "gratuit" | "prenuim"
  level: [],   // "TERMINALE", "SECONDE", ...
  matiere: [], // "Maths", ...
  classe: [],  // "Tle A", ...
  tags: [],    // ["suite", "derivée", ...]
});

// Valeurs disponibles (livres)
const bookFacets = React.useMemo(() => {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  return {
    badge:  uniq((livres || []).map((b) => b?.badge?.toLowerCase())),
    level:  uniq((livres || []).map((b) => String(b?.level || "").toUpperCase())),
    matiere:uniq((livres || []).map((b) => b?.matiere)),
    classe: uniq((livres || []).map((b) => b?.classe)),
    tags:   uniq((livres || []).flatMap((b) => Array.isArray(b?.tags) ? b.tags : [])),
  };
}, [livres]);

// Toggle / reset (livres)
const toggleBf = (key, val) => {
  setBf((prev) => {
    const set = new Set(prev[key]);
    set.has(val) ? set.delete(val) : set.add(val);
    return { ...prev, [key]: [...set] };
  });
};
const clearBf = () => setBf({ badge: [], level: [], matiere: [], classe: [], tags: [] });

// Résultats filtrés (livres)
const filteredBooks = React.useMemo(() => {
  const q = bookQuery.trim().toLowerCase();

  return (livres || []).filter((b) => {
    // 0) ✅ Filtre par matière sélectionnée (subject)
    const bookSubject = b?.subject || "maths";
    if (bookSubject !== selectedSubject) return false;

    // 1) recherche texte
    if (q) {
      const hay = [
        b?.title, b?.description, b?.matiere, b?.classe, b?.level, b?.badge,
        ...(Array.isArray(b?.tags) ? b.tags : []),
      ].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // 2) filtres
    const badge  = (b?.badge || "").toLowerCase();
    const level  = String(b?.level || "").toUpperCase();
    const matiere= b?.matiere || "";
    const classe = b?.classe || "";
    const tags   = Array.isArray(b?.tags) ? b.tags : [];

    const match = (key, val) => bf[key].length === 0 || bf[key].includes(val);

    if (!match("badge", badge)) return false;
    if (!match("level", level)) return false;
    if (!match("matiere", matiere)) return false;
    if (!match("classe", classe)) return false;

    if (bf.tags.length > 0 && !tags.some((t) => bf.tags.includes(t))) return false;

    return true;
  });
}, [livres, bookQuery, bf, selectedSubject]);


// --- Recherche texte (examens)
const [examQuery, setExamQuery] = useState("");

// --- Filtres (examens)
const [ef, setEf] = useState({
  badge: [],   // "gratuit" | "prenuim" (si tu en as sur tes examens)
  level: [],   // "TERMINALE", "SECONDE", ...
  matiere: [], // "Maths", ...
  classe: [],  // "Tle A", ...
  tags: [],    // ["suite", "derivée", ...] si présents
});

// Valeurs disponibles (examens)
const examFacets = React.useMemo(() => {
  const uniq = (arr) => [...new Set(arr.filter(Boolean))];
  return {
    badge:  uniq((exams || []).map((e) => e?.badge?.toLowerCase())),
    level:  uniq((exams || []).map((e) => String(e?.level || "").toUpperCase())),
    matiere:uniq((exams || []).map((e) => e?.matiere)),
    classe: uniq((exams || []).map((e) => e?.classe)),
    tags:   uniq((exams || []).flatMap((e) => Array.isArray(e?.tags) ? e.tags : [])),
  };
}, [exams]);

// Toggle / reset
const toggleEf = (key, val) => {
  setEf((prev) => {
    const set = new Set(prev[key]);
    set.has(val) ? set.delete(val) : set.add(val);
    return { ...prev, [key]: [...set] };
  });
};
const clearEf = () => setEf({ badge: [], level: [], matiere: [], classe: [], tags: [] });

// Résultats filtrés (examens)
const filteredExams = React.useMemo(() => {
  const q = examQuery.trim().toLowerCase();

  return (exams || []).filter((e) => {
    // 0) ✅ Filtre par matière sélectionnée (subject)
    const examSubject = e?.subject || "maths";
    if (examSubject !== selectedSubject) return false;

    // 1) recherche texte
    if (q) {
      const hay = [
        e?.title, e?.description, e?.matiere, e?.classe, e?.level, e?.badge,
        ...(Array.isArray(e?.tags) ? e.tags : []),
      ].filter(Boolean).join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // 2) filtres
    const badge  = (e?.badge || "").toLowerCase();
    const level  = String(e?.level || "").toUpperCase();
    const matiere= e?.matiere || "";
    const classe = e?.classe || "";
    const tags   = Array.isArray(e?.tags) ? e.tags : [];

    const match = (key, val) => ef[key].length === 0 || ef[key].includes(val);

    if (!match("badge", badge)) return false;
    if (!match("level", level)) return false;
    if (!match("matiere", matiere)) return false;
    if (!match("classe", classe)) return false;

    if (ef.tags.length > 0 && !tags.some((t) => ef.tags.includes(t))) return false;

    return true;
  });
}, [exams, examQuery, ef, selectedSubject]);



// Compter les vidéos en incluant les parties complémentaires
const totalVideosCount = React.useMemo(() => {
  let total = 0;
  for (const v of videos || []) {
    // ✅ Filtrer par matière sélectionnée
    const videoSubject = v?.subject || "maths";
    if (videoSubject !== selectedSubject) continue;

    total += 1; // la vidéo principale
    total += Array.isArray(v?.videosSupplementaires)
      ? v.videosSupplementaires.length
      : 0;      // les vidéos complémentaires
  }
  return total;
}, [videos, selectedSubject]);

// ✅ Compteurs filtrés par matière pour les onglets
const countBySubject = React.useMemo(() => {
  const countLivres = (livres || []).filter(b => (b?.subject || "maths") === selectedSubject).length;
  const countExams = (exams || []).filter(e => (e?.subject || "maths") === selectedSubject).length;
  return { livres: countLivres, exams: countExams, videos: totalVideosCount };
}, [livres, exams, selectedSubject, totalVideosCount]);







  /* ---------- render ---------- */
  return (
    <PageLayout>
      {/* HERO modernisé */}
      <Box
        sx={{
          bgcolor: "linear-gradient(135deg, #fff5f8 0%, #f8fbff 100%)",
          py: { xs: 4, md: 6 },
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Container maxWidth="lg">
          <Stack direction={downMd ? "column" : "row"} alignItems="stretch" spacing={3}>
            {/* Colonne gauche : CTA Premium + Quotas */}
            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: "#FFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <Stack spacing={1} alignItems="flex-start">
                  <Typography variant={downMd ? "h5" : "h4"} fontWeight={900} color="primary">
                    Fahimta AI — Premium
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    Résous des exercices étape par étape, soumets des photos d’énoncés et échange avec un enseignant.
                  </Typography>
                </Stack>

                <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <Card
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: "#FFE082",
                        boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                        height: "100%",
                      }}
                    >
                      <Stack spacing={1} alignItems="center" textAlign="center">
                        <LockIcon sx={{ fontSize: 46, color: "#000" }} />
                        <Typography fontWeight={800}>Parler à un enseignant</Typography>
                        <Typography variant="body2" color="text.primary">
                          Un enseignant te recontacte via la messagerie intégrée.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => navigate("/student/support-request")}
                          sx={{ mt: 1 }}
                        >
                          Soutien +
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>

                {/* Quotas */}
               {/* Quotas (version chips compacte) */}
{quotas && (
  <Paper
    elevation={0}
    sx={{
      mt: 2,
      p: 1.25,
      borderRadius: 2,
      bgcolor: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.14)",
      overflowX: "auto",
    }}
  >
    {/* mini composant local */}
    {(() => {
      const QuotaChip = ({ label, remaining, max, color = "primary" }) => {
        const hasMax = typeof max === "number" && max > 0;
        const pct = hasMax
          ? Math.max(0, Math.min(100, Math.round(((max - remaining) / max) * 100)))
          : null;

        return (
          <Paper
            elevation={0}
            sx={{
              px: 1.25,
              py: 0.75,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(0,0,0,0.18)",
              border: "1px solid rgba(255,255,255,0.12)",
              whiteSpace: "nowrap",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#fff" }}>
              {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: "#fff" }}>
              {remaining}
              {hasMax ? `/${max}` : ""}
            </Typography>
            {pct !== null && (
              <Box sx={{ width: 120, ml: 0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  color={color}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.2)",
                  }}
                />
              </Box>
            )}
          </Paper>
        );
      };

      // si ton backend expose aussi les "max", mappe-les ici :
      const maxes = {
        books: quotas?.booksMax,
        exams: quotas?.examsMax,
        corrections: quotas?.correctionsMax,
        iaText: quotas?.iaTextMax,
        iaVision: quotas?.iaVisionMax,
      };

      return (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
        >
          <QuotaChip
            label="Livres"
            remaining={quotas?.booksRemaining ?? 0}
            max={maxes.books}
            color="secondary"
          />
          <QuotaChip
            label="Sujets"
            remaining={quotas?.examsRemaining ?? 0}
            max={maxes.exams}
            color="info"
          />
          <QuotaChip
            label="Corrections"
            remaining={quotas?.correctionsRemaining ?? 0}
            max={maxes.corrections}
            color="secondary"
          />
          <QuotaChip
            label="Questions IA"
            remaining={quotas?.iaTextRemaining ?? 0}
            max={maxes.iaText}
            color="success"
          />
          <QuotaChip
            label="IA (vision)"
            remaining={quotas?.iaVisionRemaining ?? 0}
            max={maxes.iaVision}
            color="warning"
          />
        </Stack>
      );
    })()}
  </Paper>
)}

              </Paper>
            </Stack>

            {/* Colonne droite : IA texte + OCR */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.06)",
                bgcolor: "#fff",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <AutoAwesomeIcon color="primary" />
                <Typography fontWeight={800}>Résoudre avec l’IA</Typography>
              </Stack>

              {/* onglets locaux: Texte / Photo */}
              <Tabs
                value={0}
                onChange={() => {}}
                sx={{
                  "& .MuiTabs-flexContainer": { gap: 1 },
                  "& .MuiTab-root": {
                    bgcolor: "#0b1220",
                    color: "#fff",
                    borderRadius: 2,
                    minHeight: 36,
                    px: 2,
                    textTransform: "none",
                  },
                }}
              >
                <Tab disableRipple label={<TabLabel text="Question texte" />} />
                <Tab disabled disableRipple label={<TabLabel text="Photo (OCR)" />} />
              </Tabs>

              {/* Texte */}
              <Box sx={{ mt: 2 }}>


              <TextField
  label="Décris clairement ton exercice…"
  fullWidth
  multiline
  rows={downMd ? 4 : 3}
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }}
  helperText={
    listening
      ? "🎙️ Dictée en cours… vous pouvez corriger le texte pendant l’enregistrement."
      : "Astuce : appuyez sur le micro pour dicter, puis corrigez si besoin avant d’envoyer."
  }
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <IconButton
          onClick={handleToggleDictation}
          onMouseDown={(e) => e.preventDefault()} // garde le focus dans le champ
          disabled={!sttSupported}
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
          edge="start"
          size="large"
        >
          {listening ? <MicOffRoundedIcon /> : <MicNoneRoundedIcon />}
        </IconButton>
      </InputAdornment>
    ),
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          aria-label="Envoyer"
          title="Envoyer"
          edge="end"
        >
          <SendRoundedIcon color="primary" />
        </IconButton>
      </InputAdornment>
    ),
  }}
  sx={{
    "& .MuiOutlinedInput-root": {
      bgcolor: "#fafafa",
      borderRadius: 2,
    },
  }}
/>


                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Ex.: “Expliquez moi les limites .”
                  </Typography>
                  <Button size="small" startIcon={<RestartAltIcon />} onClick={resetIA} sx={{ ml: "auto" }}>
                    Réinitialiser
                  </Button>
                </Stack>

                {loading && (
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 2 }}>
                    <CircularProgress size={18} />
                    <Typography>Analyse en cours…</Typography>
                  </Stack>
                )}
                {!!message && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {message}
                  </Alert>
                )}

                {response && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={800}>
                      Réponse de l’IA :
                    </Typography>
                    <Box
                      sx={{
                        mt: 1,
                        bgcolor: "#1e3a8a",
                        color: "#fff",
                        p: 2,
                        borderRadius: 2,
                        fontFamily: "Courier New, monospace",
                        whiteSpace: "pre-line",
                        minHeight: 100,
                      }}
                    >
                      {typedText}
                    </Box>
                  </Box>
                )}


{(response || typedText) && (
  <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
    <Button
      size="small"
      startIcon={<VolumeUpRoundedIcon />}
      onClick={handleSpeak}
      disabled={!ttsSupported || !getLastIaText()}
    >
      Écouter
    </Button>
    <Button
      size="small"
      startIcon={<StopRoundedIcon />}
      onClick={handleStopSpeak}
      disabled={!speaking}
    >
      Arrêter l’audio
    </Button>

    <Button
      size="small"
      startIcon={<RestartAltIcon />}
      onClick={() => {
        setInput("");
        setMessage("");
        setResponse("");
        setTypedText("");
        handleStopSpeak();
      }}
      sx={{ ml: "auto" }}
    >
      Réinitialiser
    </Button>
    <Button
      size="small"
      onClick={() => {
        const full = getFullIaText(typedText, response);
        if (!full) return;
        saveTextFile(full, tsName("fahimta-reponse-ia"));
      }}
    >
      Enregistrer en .txt
    </Button>
  </Stack>
)}



              </Box>

              <Divider sx={{ my: 3 }} />

              {/* OCR */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <ImageOutlinedIcon color="action" />
                <Typography fontWeight={800}>Soumettre une photo</Typography>
                <Chip label="Premium" size="small" color="warning" sx={{ ml: 1 }} />
                {quotas?.iaVisionRemaining != null && (
                  <Chip
                    size="small"
                    sx={{ ml: "auto" }}
                    label={`Reste: ${quotas.iaVisionRemaining} / mois`}
                  />
                )}
              </Stack>

              <Box
                onDragOver={prevent}
                onDragEnter={prevent}
                onDrop={onDropFile}
                sx={{
                  p: 2,
                  border: "2px dashed #cbd5e1",
                  borderRadius: 2,
                  textAlign: "center",
                  bgcolor: "#f9fafb",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Glisse-dépose une image ici, ou :
                </Typography>

                <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 1.5, flexWrap: "wrap" }}>
                  {cameraSupported && (
                    <Button 
                      variant="contained" 
                      startIcon={<CameraAltRoundedIcon />} 
                      onClick={startCamera}
                      color="primary"
                    >
                      Prendre une photo
                    </Button>
                  )}
                  <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />}>
                    Choisir un fichier
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Ouvrir la caméra en mode édition avec le fichier sélectionné
                          setCapturedPhoto(file);
                          setCameraOpen(true);
                          setPhotoRotation(0);
                          setCropMode(false);
                          setCropArea({ x: 10, y: 10, width: 80, height: 80 });
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                          setImageScale(100);
                          setSharpness(0);
                          setExposure(0);
                          setHue(0);
                          setBlur(0);
                          setFlipHorizontal(false);
                          setFlipVertical(false);
                          setSelectedFilter("none");
                          setShowAdvancedControls(false);
                        }
                      }}
                    />
                  </Button>
                </Stack>

                {ocrImage && (
                  <Stack
                    direction={downMd ? "column" : "row"}
                    spacing={2}
                    alignItems="center"
                    sx={{ mt: 2 }}
                  >
                    <img
                      src={URL.createObjectURL(ocrImage)}
                      alt="aperçu"
                      style={{
                        maxWidth: downMd ? "100%" : 180,
                        borderRadius: 8,
                        display: "block",
                      }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircleRoundedIcon color="success" />
                      <Typography variant="body2">{ocrImage.name}</Typography>
                    </Stack>
                  </Stack>
                )}

                <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleImageSubmit}
                    disabled={ocrLoading || !ocrImage || Number(quotas?.iaVisionRemaining ?? 0) <= 0}
                  >
                    Envoyer à l’IA
                  </Button>
                  {ocrLoading && <CircularProgress size={20} />}
                </Stack>

                {!!ocrError && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <ErrorOutlineRoundedIcon color="error" />
                    <Typography color="error">{ocrError}</Typography>
                  </Stack>
                )}

                {/* {ocrResponse && (
                  <Box sx={{ mt: 2, bgcolor: "#263238", p: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle1" color="white" fontWeight={800}>
                      Réponse IA :
                    </Typography>
                    <Typography
                      sx={{
                        whiteSpace: "pre-line",
                        mt: 1,
                        fontFamily: "Courier New, monospace",
                        color: "white",
                        minHeight: 100,
                      }}
                    >
                      {typedOCR}
                    </Typography>
                  </Box>
                )} */}


{ocrResponse && (
  <Box sx={{ mt: 2, bgcolor: "#263238", p: 2, borderRadius: 2 }}>
    <Typography variant="subtitle1" color="white" fontWeight={800}>
      Réponse IA :
    </Typography>
    <Typography
      sx={{
        whiteSpace: "pre-line",
        mt: 1,
        fontFamily: "Courier New, monospace",
        color: "white",
        minHeight: 100,
      }}
    >
      {typedOCR}
    </Typography>

    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          const full = getFullOcrText(typedOCR, ocrResponse);
          if (!full) return;
          saveTextFile(full, tsName("fahimta-reponse-ocr"));
        }}
      >
        Enregistrer en .txt
      </Button>
      <Button
        size="small"
        startIcon={<RestartAltIcon />}
        onClick={resetOCR}
        disabled={ocrLoading}
      >
        Réinitialiser
      </Button>
    </Stack>
  </Box>
)}






              </Box>
            </Paper>
          </Stack>
        </Container>
      </Box>

      {/* RESSOURCES Premium */}
  {/* RESSOURCES Premium */}
<Container maxWidth="lg" sx={{ py: 6 }}>
  {/* Tabs “pill” modernes et collants */}
  <Paper
    elevation={0}
    sx={{
      position: "sticky",
      top: 72,
      zIndex: 3,
      p: 1,
      borderRadius: 3,
      backdropFilter: "blur(8px)",
      background: "rgba(255,255,255,0.85)",
      border: "1px solid rgba(2,12,27,0.08)",
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

  {/* Onglets de contenu (Livres/Examens/Vidéos) - visible si du contenu existe pour la matière */}
  {(selectedSubject === "maths" || countBySubject.livres > 0 || countBySubject.exams > 0 || countBySubject.videos > 0) && (
<Tabs
  value={tabIndex}
  onChange={(_, v) => setTabIndex(v)}
  variant={downMd ? "scrollable" : "fullWidth"}
  scrollButtons
  allowScrollButtonsMobile
  sx={{
    minHeight: 48,
    "& .MuiTabs-flexContainer": {
      gap: 8,
      flexWrap: "nowrap",               // pas de wrap
    },
    "& .MuiTabs-scroller": {
      overflowX: "auto !important",     // défilement horizontal
      msOverflowStyle: "none",          // IE/Edge
      scrollbarWidth: "none",           // Firefox
      touchAction: "pan-x",             // glisser au doigt
    },
    "& .MuiTabs-scroller::-webkit-scrollbar": { display: "none" }, // cacher la barre
    "& .MuiTab-root": {
      minHeight: 42,
      minWidth: "auto",                 // évite des tabs trop larges
      textTransform: "none",
      whiteSpace: "nowrap",
      fontWeight: 800,
      borderRadius: 999,
      px: 2,
      color: "rgba(2,12,27,0.65)",
      transition: "all .2s ease",
      "&:hover": { backgroundColor: "rgba(2,12,27,0.06)" },
    },
    "& .Mui-selected": {
      color: "#0b3f8a",
      backgroundColor: "rgba(13,110,253,0.12)",
    },
    "& .MuiTabs-indicator": { display: "none" },
  }}
>

      <Tab
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <MenuBookRoundedIcon fontSize="small" />
            Livres PDF
            <Chip
              size="small"
              label={countBySubject.livres}
              sx={{
                ml: .5,
                height: 18,
                fontSize: 11,
                color: "#0b3f8a",
                bgcolor: "rgba(13,110,253,0.12)",
              }}
            />
          </Box>
        }
      />
      <Tab
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <TaskAltRoundedIcon fontSize="small" />
            Examens corrigés
            <Chip
              size="small"
              label={countBySubject.exams}
              sx={{
                ml: .5,
                height: 18,
                fontSize: 11,
                color: "#0b3f8a",
                bgcolor: "rgba(13,110,253,0.12)",
              }}
            />
          </Box>
        }
      />
      <Tab
        label={
          <Box display="flex" alignItems="center" gap={1}>
            <PlayCircleOutlineRoundedIcon fontSize="small" />
            Cours vidéo
           
 <Chip
   size="small"
   label={countBySubject.videos}
   sx={{
     ml: .5,
     height: 18,
     fontSize: 11,
     color: "#0b3f8a",
     bgcolor: "rgba(13,110,253,0.12)",
   }}
 />





          </Box>
        }
      />
    </Tabs>
  )}
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
  {/* Livres */}
{/* Livres */}
<Box role="tabpanel" hidden={tabIndex !== 0}>
  {tabIndex === 0 && (
    <>
      {/* Barre de filtres + recherche (livres) */}
      <Box sx={{ mb: 2, display: "grid", gap: 1.25 }}>
        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
          <FilterGroup
            label="Badge"
            options={bookFacets.badge}
            selected={bf.badge}
            onToggle={(val) => toggleBf("badge", val)}
          />
          <FilterGroup
            label="Niveau"
            options={bookFacets.level}
            selected={bf.level}
            onToggle={(val) => toggleBf("level", val)}
          />
          <FilterGroup
            label="Matière"
            options={bookFacets.matiere}
            selected={bf.matiere}
            onToggle={(val) => toggleBf("matiere", val)}
          />
          <FilterGroup
            label="Classe"
            options={bookFacets.classe}
            selected={bf.classe}
            onToggle={(val) => toggleBf("classe", val)}
          />
          <FilterGroup
            label="Tags"
            options={bookFacets.tags}
            selected={bf.tags}
            onToggle={(val) => toggleBf("tags", val)}
            limit={10}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {filteredBooks.length} livre(s) trouvé(s)
          </Typography>
          {(bf.badge.length || bf.level.length || bf.matiere.length || bf.classe.length || bf.tags.length) > 0 && (
            <Button size="small" onClick={clearBf}>
              Effacer les filtres
            </Button>
          )}
        </Stack>

        {/* Tu peux réutiliser VideoSearchBar pour le champ texte (il est générique) */}
        <VideoSearchBar
          query={bookQuery}
          onQueryChange={setBookQuery}
          activeCount={filteredBooks.length}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredBooks.map((livre, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <BookCard book={livre} isPremiumUser />
          </Grid>
        ))}
        {filteredBooks.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              {bookQuery ? "Aucun résultat pour votre recherche." : "Aucun livre disponible pour le moment."}
            </Alert>
          </Grid>
        )}
      </Grid>
    </>
  )}
</Box>


  {/* Examens corrigés */}

{/* Examens corrigés */}
<Box role="tabpanel" hidden={tabIndex !== 1}>
  {tabIndex === 1 && (
    <>
      {/* Barre de filtres + recherche (examens) */}
      <Box sx={{ mb: 2, display: "grid", gap: 1.25 }}>
        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
          <FilterGroup
            label="Badge"
            options={examFacets.badge}
            selected={ef.badge}
            onToggle={(val) => toggleEf("badge", val)}
          />
          <FilterGroup
            label="Niveau"
            options={examFacets.level}
            selected={ef.level}
            onToggle={(val) => toggleEf("level", val)}
          />
          <FilterGroup
            label="Matière"
            options={examFacets.matiere}
            selected={ef.matiere}
            onToggle={(val) => toggleEf("matiere", val)}
          />
          <FilterGroup
            label="Classe"
            options={examFacets.classe}
            selected={ef.classe}
            onToggle={(val) => toggleEf("classe", val)}
          />
          <FilterGroup
            label="Tags"
            options={examFacets.tags}
            selected={ef.tags}
            onToggle={(val) => toggleEf("tags", val)}
            limit={10}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            {filteredExams.length} examen(s) trouvé(s)
          </Typography>
          {(ef.badge.length || ef.level.length || ef.matiere.length || ef.classe.length || ef.tags.length) > 0 && (
            <Button size="small" onClick={clearEf}>
              Effacer les filtres
            </Button>
          )}
        </Stack>

        {/* Recherche texte (réutilise VideoSearchBar) */}
        <VideoSearchBar
          query={examQuery}
          onQueryChange={setExamQuery}
          activeCount={filteredExams.length}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredExams.map((exam) => (
          <Grid item xs={12} md={6} lg={4} key={exam._id}>
            <ExamCard
              exam={exam}
              isPremiumUser={isPremiumUser}
            />
          </Grid>
        ))}

        {filteredExams.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              {examQuery
                ? "Aucun résultat pour votre recherche."
                : "Aucun examen corrigé pour l’instant."}
            </Alert>
          </Grid>
        )}
      </Grid>
    </>
  )}
</Box>





{/* Vidéos */}
<Box role="tabpanel" hidden={tabIndex !== 2}>
  {tabIndex === 2 && (
    <>

{/* Barre de filtres + recherche */}
<Box sx={{ mb: 2, display: "grid", gap: 1.25 }}>
  {/* Groupes de badges cliquables */}
  <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
    <FilterGroup
      label="Badge"
      options={videoFacets.badge}
      selected={vf.badge}
      onToggle={(val) => toggleVf("badge", val)}
    />
    <FilterGroup
      label="Niveau"
      options={videoFacets.level}
      selected={vf.level}
      onToggle={(val) => toggleVf("level", val)}
    />
    <FilterGroup
      label="Matière"
      options={videoFacets.matiere}
      selected={vf.matiere}
      onToggle={(val) => toggleVf("matiere", val)}
    />
    <FilterGroup
      label="Classe"
      options={videoFacets.classe}
      selected={vf.classe}
      onToggle={(val) => toggleVf("classe", val)}
    />
    <FilterGroup
      label="Tags"
      options={videoFacets.tags}
      selected={vf.tags}
      onToggle={(val) => toggleVf("tags", val)}
      limit={10} // affiche les 10 premiers tags (ajuste si besoin)
    />
  </Stack>

  {/* Ligne actions + stats + bouton Reset */}
  <Stack direction="row" alignItems="center" spacing={1}>
    <Typography variant="body2" sx={{ opacity: 0.7 }}>
      {filteredVideos.length} chapitre(s) trouvé(s)
    </Typography>
    {(vf.badge.length || vf.level.length || vf.matiere.length || vf.classe.length || vf.tags.length) > 0 && (
      <Button size="small" onClick={clearVf}>
        Effacer les filtres
      </Button>
    )}
  </Stack>

  {/* Recherche texte (on garde ton composant) */}
  <VideoSearchBar
    query={videoQuery}
    onQueryChange={setVideoQuery}
    activeCount={filteredVideos.length}
  />
</Box>







      <Grid container spacing={3}>
        {filteredVideos.map((video, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <VideoCardPremium video={video} isPremiumUser={isPremiumUser} />
          </Grid>
        ))}

        {filteredVideos.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="info">
              {videoQuery
                ? "Aucun résultat pour votre recherche."
                : "Aucune vidéo disponible pour l’instant."}
            </Alert>
          </Grid>
        )}
      </Grid>
    </>
  )}
</Box>
</>
)}

</Container>

      {/* Modal Caméra */}
      <Dialog 
        open={cameraOpen} 
        onClose={stopCamera}
        maxWidth="md"
        fullWidth
        fullScreen={downMd}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={800}>
              {capturedPhoto ? "Ajuster la photo" : "Prendre une photo"}
            </Typography>
            <IconButton onClick={stopCamera} edge="end">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        
        <DialogContent dividers>
          {!capturedPhoto ? (
            // Vue caméra en direct
            <Box sx={{ position: "relative", bgcolor: "#000", borderRadius: 2, overflow: "hidden" }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={(e) => {
                  e.target.play().catch(err => console.log("Auto-play error:", err));
                }}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  maxHeight: "70vh",
                  backgroundColor: "#000",
                }}
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              
              {/* Bouton de capture */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 2,
                }}
              >
                <IconButton
                  onClick={capturePhoto}
                  sx={{
                    bgcolor: "#fff",
                    width: 64,
                    height: 64,
                    "&:hover": { bgcolor: "#f0f0f0" },
                  }}
                >
                  <PhotoCameraRoundedIcon sx={{ fontSize: 32, color: "#000" }} />
                </IconButton>
                
                <IconButton
                  onClick={switchCamera}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.9)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <CameraswitchRoundedIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            // Vue de la photo capturée avec édition
            <Box sx={{ textAlign: "center" }}>
              <Box
                ref={cropImageRef}
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
                onTouchStart={handleCropTouchStart}
                onTouchMove={handleCropTouchMove}
                onTouchEnd={handleCropTouchEnd}
                sx={{
                  position: "relative",
                  display: "inline-block",
                  maxWidth: "100%",
                  bgcolor: "#000",
                  borderRadius: 2,
                  overflow: "hidden",
                  cursor: cropMode ? (resizeHandle ? getResizeCursor(resizeHandle) : "move") : "default",
                  touchAction: cropMode ? "none" : "auto",
                }}
              >
                <img
                  src={URL.createObjectURL(capturedPhoto)}
                  alt="Captured"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    maxHeight: "60vh",
                    transform: `rotate(${photoRotation}deg) scale(${imageScale / 100}) scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1})`,
                    filter: `brightness(${Math.max(0, Math.min(200, brightness + (exposure * 0.5)))}%) contrast(${contrast}%) saturate(${saturation}%) ${hue !== 0 ? `hue-rotate(${hue}deg)` : ''} ${blur > 0 ? `blur(${blur}px)` : ''}`,
                    transition: "transform 0.3s ease, filter 0.3s ease",
                    display: "block",
                  }}
                />
                
                {/* Zone de crop overlay */}
                {cropMode && (
                  <>
                    {/* Overlay sombre autour du crop */}
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.5)",
                        pointerEvents: "none",
                      }}
                    />
                    
                    {/* Zone de sélection */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: `${cropArea.x}%`,
                        top: `${cropArea.y}%`,
                        width: `${cropArea.width}%`,
                        height: `${cropArea.height}%`,
                        border: "3px solid #fff",
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                        cursor: resizeHandle ? getResizeCursor(resizeHandle) : "move",
                        pointerEvents: "auto",
                      }}
                    >
                      {/* Poignets de redimensionnement - Coins */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: -8,
                          left: -8,
                          width: 16,
                          height: 16,
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          border: "2px solid #1976d2",
                          cursor: "nwse-resize",
                          zIndex: 10,
                          "&:hover": { transform: "scale(1.2)", bgcolor: "#1976d2" },
                          transition: "all 0.2s",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeHandle('nw');
                          setIsDragging(true);
                          setCropStartArea({ ...cropArea });
                          const rect = cropImageRef.current?.getBoundingClientRect();
                          if (rect) {
                            setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          width: 16,
                          height: 16,
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          border: "2px solid #1976d2",
                          cursor: "nesw-resize",
                          zIndex: 10,
                          "&:hover": { transform: "scale(1.2)", bgcolor: "#1976d2" },
                          transition: "all 0.2s",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeHandle('ne');
                          setIsDragging(true);
                          setCropStartArea({ ...cropArea });
                          const rect = cropImageRef.current?.getBoundingClientRect();
                          if (rect) {
                            setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -8,
                          left: -8,
                          width: 16,
                          height: 16,
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          border: "2px solid #1976d2",
                          cursor: "nesw-resize",
                          zIndex: 10,
                          "&:hover": { transform: "scale(1.2)", bgcolor: "#1976d2" },
                          transition: "all 0.2s",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeHandle('sw');
                          setIsDragging(true);
                          setCropStartArea({ ...cropArea });
                          const rect = cropImageRef.current?.getBoundingClientRect();
                          if (rect) {
                            setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -8,
                          right: -8,
                          width: 16,
                          height: 16,
                          bgcolor: "#fff",
                          borderRadius: "50%",
                          border: "2px solid #1976d2",
                          cursor: "nwse-resize",
                          zIndex: 10,
                          "&:hover": { transform: "scale(1.2)", bgcolor: "#1976d2" },
                          transition: "all 0.2s",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeHandle('se');
                          setIsDragging(true);
                          setCropStartArea({ ...cropArea });
                          const rect = cropImageRef.current?.getBoundingClientRect();
                          if (rect) {
                            setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                        }}
                      />
                      
                      {/* Poignets de redimensionnement - Bords */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: -6,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 40,
                          height: 12,
                          bgcolor: "#fff",
                          border: "2px solid #1976d2",
                          borderRadius: 1,
                          cursor: "ns-resize",
                          zIndex: 10,
                          "&:hover": { bgcolor: "#1976d2" },
                          transition: "all 0.2s",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeHandle('n');
                          setIsDragging(true);
                          setCropStartArea({ ...cropArea });
                          const rect = cropImageRef.current?.getBoundingClientRect();
                          if (rect) {
                            setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -6,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 40,
                          height: 12,
                          bgcolor: "#fff",
                          border: "2px solid #1976d2",
                          borderRadius: 1,
                          cursor: "ns-resize",
                          zIndex: 10,
                          "&:hover": { bgcolor: "#1976d2" },
                          transition: "all 0.2s",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeHandle('s');
                          setIsDragging(true);
                          setCropStartArea({ ...cropArea });
                          const rect = cropImageRef.current?.getBoundingClientRect();
                          if (rect) {
                            setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          left: -6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 12,
                          height: 40,
                          bgcolor: "#fff",
                          border: "2px solid #1976d2",
                          borderRadius: 1,
                          cursor: "ew-resize",
                          zIndex: 10,
                          "&:hover": { bgcolor: "#1976d2" },
                          transition: "all 0.2s",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeHandle('w');
                          setIsDragging(true);
                          setCropStartArea({ ...cropArea });
                          const rect = cropImageRef.current?.getBoundingClientRect();
                          if (rect) {
                            setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          right: -6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 12,
                          height: 40,
                          bgcolor: "#fff",
                          border: "2px solid #1976d2",
                          borderRadius: 1,
                          cursor: "ew-resize",
                          zIndex: 10,
                          "&:hover": { bgcolor: "#1976d2" },
                          transition: "all 0.2s",
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setResizeHandle('e');
                          setIsDragging(true);
                          setCropStartArea({ ...cropArea });
                          const rect = cropImageRef.current?.getBoundingClientRect();
                          if (rect) {
                            setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                          }
                        }}
                      />
                    </Box>
                  </>
                )}
              </Box>
              
              {/* Contrôles de manipulation */}
              <Box sx={{ mt: 3 }}>
                {/* Boutons principaux */}
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2, flexWrap: "wrap" }}>
                  <Button
                    variant={cropMode ? "contained" : "outlined"}
                    startIcon={<CropRoundedIcon />}
                    onClick={toggleCropMode}
                    color={cropMode ? "primary" : "inherit"}
                    size="small"
                  >
                    Recadrer
                  </Button>
                  
                  {cropMode && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ZoomOutRoundedIcon />}
                        onClick={() => handleCropResize('increase')}
                        title="Agrandir la zone de recadrage"
                      >
                        Agrandir zone
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ZoomInRoundedIcon />}
                        onClick={() => handleCropResize('decrease')}
                        title="Réduire la zone de recadrage"
                      >
                        Réduire zone
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<RotateRightRoundedIcon />}
                    onClick={rotatePhoto}
                    size="small"
                    title="Rotation 90°"
                  >
                    Pivoter 90°
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<RotateLeftRoundedIcon />}
                    onClick={() => rotatePhotoPrecise(-45)}
                    size="small"
                    title="Rotation -45°"
                  >
                    -45°
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<RotateRightRoundedIcon />}
                    onClick={() => rotatePhotoPrecise(45)}
                    size="small"
                    title="Rotation +45°"
                  >
                    +45°
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<FlipCameraIosRoundedIcon />}
                    onClick={() => setFlipHorizontal(!flipHorizontal)}
                    size="small"
                    color={flipHorizontal ? "primary" : "inherit"}
                    title="Retourner horizontalement"
                  >
                    H
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<FlipCameraAndroidRoundedIcon />}
                    onClick={() => setFlipVertical(!flipVertical)}
                    size="small"
                    color={flipVertical ? "primary" : "inherit"}
                    title="Retourner verticalement"
                  >
                    V
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<FilterAltRoundedIcon />}
                    onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                    size="small"
                    color={showAdvancedControls ? "primary" : "inherit"}
                  >
                    Filtres
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={retakePhoto}
                    size="small"
                  >
                    Reprendre
                  </Button>
                </Stack>

                {/* Filtres prédéfinis */}
                {showAdvancedControls && (
                  <Box sx={{ mb: 2, mt: 2 }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, display: "block" }}>
                      Filtres prédéfinis
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" sx={{ flexWrap: "wrap" }}>
                      {[
                        { name: "none", label: "Aucun" },
                        { name: "grayscale", label: "Noir & Blanc" },
                        { name: "sepia", label: "Sépia" },
                        { name: "vintage", label: "Vintage" },
                        { name: "cool", label: "Froid" },
                        { name: "warm", label: "Chaud" },
                      ].map((filter) => (
                        <Button
                          key={filter.name}
                          variant={selectedFilter === filter.name ? "contained" : "outlined"}
                          onClick={() => applyFilter(filter.name)}
                          size="small"
                          sx={{ minWidth: 80 }}
                        >
                          {filter.label}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Contrôles de base (toujours visibles) */}
                <Collapse in={!showAdvancedControls}>
                  <Box sx={{ px: { xs: 1, sm: 3 }, py: 2, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 2, mt: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Ajustements de base
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setShowAdvancedControls(true)}
                        sx={{ p: 0.5 }}
                      >
                        <ExpandMoreIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Luminosité */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Luminosité
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {brightness}%
                        </Typography>
                      </Box>
                      <Slider
                        value={brightness}
                        onChange={(e, newValue) => setBrightness(newValue)}
                        min={0}
                        max={200}
                        step={1}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Contraste */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Contraste
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {contrast}%
                        </Typography>
                      </Box>
                      <Slider
                        value={contrast}
                        onChange={(e, newValue) => setContrast(newValue)}
                        min={0}
                        max={200}
                        step={1}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Saturation */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Saturation
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {saturation}%
                        </Typography>
                      </Box>
                      <Slider
                        value={saturation}
                        onChange={(e, newValue) => setSaturation(newValue)}
                        min={0}
                        max={200}
                        step={1}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Zoom */}
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Zoom
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {imageScale}%
                        </Typography>
                      </Box>
                      <Slider
                        value={imageScale}
                        onChange={(e, newValue) => setImageScale(newValue)}
                        min={50}
                        max={200}
                        step={5}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>
                  </Box>
                </Collapse>

                {/* Contrôles avancés (sliders) */}
                <Collapse in={showAdvancedControls}>
                  <Box sx={{ px: { xs: 1, sm: 3 }, py: 2, bgcolor: "rgba(0,0,0,0.02)", borderRadius: 2 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Ajustements avancés
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setShowAdvancedControls(false)}
                        sx={{ p: 0.5 }}
                      >
                        <ExpandLessIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Luminosité */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Luminosité
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {brightness}%
                        </Typography>
                      </Box>
                      <Slider
                        value={brightness}
                        onChange={(e, newValue) => setBrightness(newValue)}
                        min={0}
                        max={200}
                        step={1}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Contraste */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Contraste
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {contrast}%
                        </Typography>
                      </Box>
                      <Slider
                        value={contrast}
                        onChange={(e, newValue) => setContrast(newValue)}
                        min={0}
                        max={200}
                        step={1}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Saturation */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Saturation
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {saturation}%
                        </Typography>
                      </Box>
                      <Slider
                        value={saturation}
                        onChange={(e, newValue) => setSaturation(newValue)}
                        min={0}
                        max={200}
                        step={1}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Zoom */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Zoom
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {imageScale}%
                        </Typography>
                      </Box>
                      <Slider
                        value={imageScale}
                        onChange={(e, newValue) => setImageScale(newValue)}
                        min={50}
                        max={200}
                        step={5}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Netteté */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Netteté
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {sharpness > 0 ? `+${sharpness}` : sharpness}
                        </Typography>
                      </Box>
                      <Slider
                        value={sharpness}
                        onChange={(e, newValue) => setSharpness(newValue)}
                        min={-100}
                        max={100}
                        step={5}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Exposition */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Exposition
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {exposure > 0 ? `+${exposure}` : exposure}
                        </Typography>
                      </Box>
                      <Slider
                        value={exposure}
                        onChange={(e, newValue) => setExposure(newValue)}
                        min={-100}
                        max={100}
                        step={5}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Teinte */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Teinte
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {hue > 0 ? `+${hue}°` : `${hue}°`}
                        </Typography>
                      </Box>
                      <Slider
                        value={hue}
                        onChange={(e, newValue) => setHue(newValue)}
                        min={-180}
                        max={180}
                        step={5}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Flou */}
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                          Flou
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                          {blur}px
                        </Typography>
                      </Box>
                      <Slider
                        value={blur}
                        onChange={(e, newValue) => setBlur(newValue)}
                        min={0}
                        max={20}
                        step={0.5}
                        size="small"
                        sx={{ color: "#1976D2" }}
                      />
                    </Box>

                    {/* Bouton reset des ajustements */}
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => {
                        setBrightness(100);
                        setContrast(100);
                        setSaturation(100);
                        setImageScale(100);
                        setSharpness(0);
                        setExposure(0);
                        setHue(0);
                        setBlur(0);
                        setFlipHorizontal(false);
                        setFlipVertical(false);
                        setSelectedFilter("none");
                      }}
                      sx={{ mt: 1, fontSize: "0.7rem" }}
                    >
                      Réinitialiser tous les ajustements
                    </Button>
                  </Box>
                </Collapse>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={stopCamera}>Annuler</Button>
          {capturedPhoto && (
            <Button 
              variant="contained" 
              onClick={validatePhoto}
              startIcon={<CheckCircleRoundedIcon />}
            >
              Valider
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* ✅ Bouton FAB pour demander du contenu */}
      <ContentRequestFAB />

    </PageLayout>
  );
};

export default PremiumFahimtaPage;












































// // pages/PremiumFahimtaPage.jsx
// import React, { useState, useEffect, useContext } from "react";
// import {
//   Box,
//   Tabs,
//   Tab,
//   Typography,
//   Card,
//   Paper,
//   Button,
//   TextField,
//   CircularProgress,
//   Alert,
//   Grid,
//   Stack,
//   Container,
//   Chip,
//   IconButton,
//   Divider,
//    LinearProgress,
//   useMediaQuery,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// import PageLayout from "../components/PageLayout";
// import API from "../api";
// import BookCard from "../components/premuim/BookCard";
// import ExamCard from "../components/premuim/ExamCard";
// import VideoCardPremium from "../components/premuim/VideoCardPremium";
// import { AuthContext } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import VideoSearchBar from "../components/premuim/VideoSearchBar";
// /* Icons */
// import LockIcon from "@mui/icons-material/Lock";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// import RestartAltIcon from "@mui/icons-material/RestartAlt";
// import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
// import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
// import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
// import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
// import SendRoundedIcon from "@mui/icons-material/SendRounded";


// import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
// import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
// import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";



// import { InputAdornment } from "@mui/material";

// import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
// import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
// import VolumeUpRoundedIcon from "@mui/icons-material/VolumeUpRounded";
// import StopRoundedIcon from "@mui/icons-material/StopRounded";

// // --- export TXT helpers ---
// const saveTextFile = (text = "", filename = "fahimta.txt") => {
//   const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = filename;
//   a.click();
//   URL.revokeObjectURL(url);
// };

// // plein texte (pas l'animation) pour IA et OCR
// const getFullIaText = (typedText, response) => (response || typedText || "").trim();
// const getFullOcrText = (typedOCR, ocrResponse) => (ocrResponse || typedOCR || "").trim();

// // nom de fichier horodaté
// const tsName = (base) =>
//   `${base}-${new Date().toISOString().slice(0,19).replace(/:/g,"-")}.txt`;




// /* ---------------- utils ---------------- */
// /* ---------------- utils ---------------- */
// // délai par défaut entre phrases
// const sentenceDelayMs = 550;

// // Révèle un texte phrase par phrase (gère aussi les sauts de ligne)
// function revealBySentence(text = "", setState, options = {}) {
//   const { base = 350, perChar = 8, maxDelay = 1500, fixedDelay = null } = options;

//   setState("");

//   // Normalise et découpe en lignes puis en phrases
//   const normalized = (text || "")
//     .replace(/\s+\n/g, "\n")
//     .replace(/\n\s+/g, "\n");
//   const lines = normalized.split("\n");

//   const chunks = [];
//   lines.forEach((line, idx) => {
//     if (line.trim() === "") {
//       chunks.push("\n");
//       return;
//     }
//     const sentences = line.split(/(?<=[\.!?…])\s+/u).filter(Boolean);
//     chunks.push(...sentences);
//     if (idx < lines.length - 1) chunks.push("\n");
//   });

//   let i = 0;
//   let acc = "";
//   let timerId = null;

//   const step = () => {
//     if (i >= chunks.length) return;

//     const next = chunks[i];
//     acc += (next === "\n" ? "\n" : (acc.endsWith("\n") || acc === "" ? "" : " ") + next);
//     setState(acc);
//     i += 1;

//     if (i < chunks.length) {
//       const delay = fixedDelay != null
//         ? fixedDelay
//         : Math.min(maxDelay, base + perChar * (chunks[i]?.length || 0));
//       timerId = setTimeout(step, delay);
//     }
//   };

//   // première étape
//   timerId = setTimeout(step, 0);

//   // retourne un cleanup
//   return () => {
//     if (timerId) clearTimeout(timerId);
//   };
// }


// // ✅ Uniformise les noms qui peuvent varier selon la version backend
// const normalizeQuotas = (q = {}) => {
//   const iaVisionRemaining =
//     q.iaVisionRemaining ??
//     q.iaGptVisionRemaining ??
//     q.iaImageRemaining ??
//     q.visionRemaining ??
//     null;

//   return { ...q, iaVisionRemaining };
// };

// const QuotaPill = ({ label, value, bg }) => (
//   <Card
//     sx={{
//       background: bg,
//       textAlign: "center",
//       borderRadius: 2,
//       p: 2,
//       boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
//     }}
//   >
//     <Typography fontWeight={800} sx={{ letterSpacing: 0.3 }}>
//       {label}
//     </Typography>
//     <Typography variant="h5" sx={{ mt: 0.5 }}>
//       {value}
//     </Typography>
//   </Card>
// );

// const TabLabel = ({ text }) => (
//   <Typography sx={{ color: "#fff", fontWeight: 800 }}>{text}</Typography>
// );

// /* ---------------- page ---------------- */
// const PremiumFahimtaPage = () => {
//   const theme = useTheme();
//   const downMd = useMediaQuery(theme.breakpoints.down("md"));
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
//   const isPremiumUser = user?.isSubscribed === true;


//   // Si connecté (route protégée) mais pas abonné → redirige vers /pricing
//  useEffect(() => {
//   if (user && isPremiumUser === false) {
//      navigate("/pricing", { replace: true });
//   } }, [user, isPremiumUser, navigate]);

//   // onglets ressources
//   const [tabIndex, setTabIndex] = useState(0);

//   // ressources
//   const [livres, setLivres] = useState([]);
//   const [exams, setExams] = useState([]);
//   const [videos, setVideos] = useState([]);

//   // IA (texte)
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [response, setResponse] = useState("");
//   const [typedText, setTypedText] = useState("");
//   const [message, setMessage] = useState("");

//   // OCR (image)
//   const [ocrImage, setOcrImage] = useState(null);
//   const [ocrResponse, setOcrResponse] = useState("");
//   const [typedOCR, setTypedOCR] = useState("");
//   const [ocrLoading, setOcrLoading] = useState(false);
//   const [ocrError, setOcrError] = useState("");

//   // quotas
//   const [quotas, setQuotas] = useState(null);








// // --- Speech to Text (dictée) + TTS — version anti-doublons mobile ----------
// const [sttSupported, setSttSupported] = useState(false);
// const [listening, setListening] = useState(false);
// const recognitionRef = React.useRef(null);

// // Accumulateurs pour éviter les répétitions
// const baseRef = React.useRef("");     // texte présent AVANT de démarrer la dictée
// const finalRef = React.useRef("");    // segments finaux validés (isFinal)
// const partialRef = React.useRef("");  // segment en cours (interim)
// const stopTimerRef = React.useRef(null);

// // --- Text to Speech (lecture de la réponse)
// const [ttsSupported, setTtsSupported] = useState(false);
// const [speaking, setSpeaking] = useState(false);
// const utteranceRef = React.useRef(null);

// // Détection mobile (les moteurs mobiles répètent souvent les interim)
// const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//   typeof navigator !== "undefined" ? navigator.userAgent : ""
// );

// useEffect(() => {
//   const WSR = window.SpeechRecognition || window.webkitSpeechRecognition;
//   if (!WSR) {
//     setSttSupported(false);
//   } else {
//     setSttSupported(true);
//     const rec = new WSR();
//     rec.lang = "fr-FR";
//     rec.maxAlternatives = 1;
//     rec.continuous = !isMobile;       // mobile: sessions plus courtes
//     rec.interimResults = !isMobile;   // mobile: pas d’interim => moins de doublons

//     rec.onstart = () => {
//       baseRef.current = (input && input.trim()) ? input.trim() : "";
//       finalRef.current = "";
//       partialRef.current = "";
//       setListening(true);
//     };

//     rec.onresult = (e) => {
//       for (let i = e.resultIndex; i < e.results.length; i += 1) {
//         const res = e.results[i];
//         const txt = (res[0]?.transcript || "").replace(/\s+/g, " ").trim();
//         if (!txt) continue;

//         if (res.isFinal) {
//           // ajoute le segment final UNE SEULE FOIS
//           if (!finalRef.current.endsWith(txt)) {
//             finalRef.current = [finalRef.current, txt].filter(Boolean).join(" ");
//           }
//           partialRef.current = "";

//           const composed = [baseRef.current, finalRef.current]
//             .filter(Boolean)
//             .join(" ")
//             .replace(/\s+/g, " ")
//             .trim();
//           setInput(composed);

//           // Auto-stop doux après une petite pause sur mobile
//           if (isMobile) {
//             clearTimeout(stopTimerRef.current);
//             stopTimerRef.current = setTimeout(() => {
//               try { recognitionRef.current?.stop(); } catch {}
//             }, 1500);
//           }
//         } else if (!isMobile) {
//           // interim: n’actualise que si ça change réellement
//           if (txt !== partialRef.current) {
//             partialRef.current = txt;
//             const composed = [baseRef.current, finalRef.current, partialRef.current]
//               .filter(Boolean)
//               .join(" ")
//               .replace(/\s+/g, " ")
//               .trim();
//             setInput(composed);
//           }
//         }
//       }
//     };

//     rec.onerror = () => {
//       setListening(false);
//       clearTimeout(stopTimerRef.current);
//     };

//     rec.onend = () => {
//       setListening(false);
//       clearTimeout(stopTimerRef.current);
//       // Nettoie un éventuel interim affiché
//       partialRef.current = "";
//       const composed = [baseRef.current, finalRef.current].filter(Boolean).join(" ").trim();
//       if (composed) setInput(composed);
//     };

//     recognitionRef.current = rec;
//   }

//   // TTS dispo ?
//   setTtsSupported("speechSynthesis" in window);

//   // Cleanup
//   return () => {
//     try { recognitionRef.current?.stop(); } catch {}
//     clearTimeout(stopTimerRef.current);
//     try { window.speechSynthesis?.cancel(); } catch {}
//   };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, []);

// // --- Dictée (toggle)
// const handleToggleDictation = () => {
//   if (!sttSupported || !recognitionRef.current) {
//     setMessage("La dictée vocale n’est pas supportée par ce navigateur.");
//     return;
//   }
//   if (listening) {
//     try { recognitionRef.current.stop(); } catch {}
//     return;
//   }
//   setMessage("");
//   try {
//     recognitionRef.current.start();
//   } catch {
//     setListening(false);
//   }
// };

// // --- Quelle réponse lire ? (la dernière)
// const getLastIaText = () => typedText || response || "";

// // --- Lecture audio
// const handleSpeak = () => {
//   if (!ttsSupported) return setMessage("La lecture audio n’est pas supportée par ce navigateur.");
//   const text = getLastIaText();
//   if (!text) return;

//   window.speechSynthesis.cancel();
//   const u = new SpeechSynthesisUtterance(text);
//   u.lang = "fr-FR";
//   u.rate = 1;
//   u.pitch = 1;
//   u.onstart = () => setSpeaking(true);
//   u.onend = () => setSpeaking(false);
//   u.onerror = () => setSpeaking(false);
//   utteranceRef.current = u;
//   window.speechSynthesis.speak(u);
// };

// const handleStopSpeak = () => {
//   if (!ttsSupported) return;
//   window.speechSynthesis.cancel();
//   setSpeaking(false);
// };





  












//   /* ---------- effets ---------- */
// useEffect(() => {
//   if (!response) return;
//   const cancel = revealBySentence(response, setTypedText, { base: 350, perChar: 8, maxDelay: 1500 });
//   return cancel;
// }, [response]);

// useEffect(() => {
//   if (!ocrResponse) return;
//   const cancel = revealBySentence(ocrResponse, setTypedOCR, { base: 350, perChar: 8, maxDelay: 1500 });
//   return cancel;
// }, [ocrResponse]);


//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [booksRes, examsRes, videosRes, quotasRes] = await Promise.all([
//           API.get("/premium"),
//           API.get("/exams"),
//           API.get("/videos"),
//           API.get("/usage/me"),
//         ]);
//         setLivres(booksRes.data);
//         setExams(examsRes.data);
//         setVideos(videosRes.data);
//         setQuotas(normalizeQuotas(quotasRes.data));
//       } catch (err) {
//         console.error("Erreur chargement Premium :", err?.message);
//       }
//     };
//     fetchAll();
//   }, []);

//   /* ---------- handlers IA texte ---------- */
//   const handleSubmit = async () => {
//     if (!input.trim()) return;
//     setLoading(true);
//     setMessage("");
//     setResponse("");
//     setTypedText("");

//     try {
//       const res = await API.post("/ia/gtptxtprenuim", { input });
//       setResponse(res.data.response || "");
//     } catch (err) {
//       const errorMessage = err.response?.data?.message || "Erreur lors de l'analyse.";
//       setMessage(errorMessage);
//       if (err.response?.data?.redirectTo) {
//         setTimeout(() => (window.location.href = err.response.data.redirectTo), 2500);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetIA = () => {
//     setInput("");
//     setMessage("");
//     setResponse("");
//     setTypedText("");
//   };


//   const resetOCR = () => {
//   setOcrImage(null);
//   setOcrResponse("");
//   setTypedOCR("");
//   setOcrError("");
// };


//   /* ---------- handlers OCR (VISION) ---------- */
//   const handleImageSubmit = async () => {
//     if (!ocrImage) return;

//     const remaining = Number(quotas?.iaVisionRemaining ?? 0);
//     if (remaining <= 0) {
//       setOcrError("Vous avez atteint la limite mensuelle d'images.");
//       return;
//     }
//     if (remaining > 0 && remaining <= 3) {
//       setOcrError(
//         `Attention : il ne vous reste plus que ${remaining} soumission(s) image ce mois-ci.`
//       );
//       // on continue quand même
//     }

//     const formData = new FormData();
//     formData.append("image", ocrImage);

//     setOcrLoading(true);
//     setOcrError("");
//     setOcrResponse("");
//     setTypedOCR("");

//     try {
//       // Si ton API n’ajoute pas le token via un interceptor :
//       const token = localStorage.getItem("token");

//       const res = await API.post("/ia/gpt", formData, {
//         headers: token ? { Authorization: `Bearer ${token}` } : undefined,
//         timeout: 30000,
//       });

//       setOcrResponse(res.data.response || "");

//       // Recharger les quotas depuis l'API (et normaliser)
//       const { data: refreshed } = await API.get("/usage/me");
//       setQuotas(normalizeQuotas(refreshed));
//     } catch (err) {
//       setOcrError(err.response?.data?.message || "Erreur lors du traitement de l’image");
//     } finally {
//       setOcrLoading(false);
//     }
//   };

//   const onDropFile = (e) => {
//     e.preventDefault();
//     const file = e.dataTransfer?.files?.[0];
//     if (file) setOcrImage(file);
//   };

//   const prevent = (e) => e.preventDefault();

//   /* ---------- downloads ---------- */
//   const handleDownloadSubject = async (examId) => {
//     try {
//       const res = await API.get(`/exams/${examId}/download-subject`);
//       window.open(res.data.downloadUrl, "_blank");
//     } catch (err) {
//       console.error("Erreur téléchargement sujet :", err?.message);
//       alert(err.response?.data?.message || "Erreur lors du téléchargement");
//     }
//   };

//   const handleDownloadCorrection = async (examId) => {
//     try {
//       const res = await API.get(`/exams/${examId}/download-correction`);
//       window.open(res.data.downloadUrl, "_blank");
//     } catch (err) {
//       console.error("Erreur téléchargement correction :", err?.message);
//       alert(err.response?.data?.message || "Erreur lors du téléchargement");
//     }
//   };





// // Recherche texte
// const [videoQuery, setVideoQuery] = useState("");

// // Filtres par badges
// const [vf, setVf] = useState({
//   badge: [],   // "gratuit" | "prenuim"
//   level: [],   // "TERMINALE", "SECONDE", etc (en MAJ)
//   matiere: [], // "Maths", "Physique", etc.
//   classe: [],  // "Tle A", "2nde", etc.
//   tags: [],    // ["suite", "derivée", ...]
// });

// // Valeurs disponibles (dérivées des vidéos)
// const videoFacets = React.useMemo(() => {
//   const uniq = (arr) => [...new Set(arr.filter(Boolean))];
//   return {
//     badge: uniq((videos || []).map((v) => v?.badge?.toLowerCase())),
//     level: uniq((videos || []).map((v) => String(v?.level || "").toUpperCase())),
//     matiere: uniq((videos || []).map((v) => v?.matiere)),
//     classe: uniq((videos || []).map((v) => v?.classe)),
//     tags: uniq((videos || []).flatMap((v) => Array.isArray(v?.tags) ? v.tags : [])),
//   };
// }, [videos]);

// // Toggle/suppression filtres
// const toggleVf = (key, val) => {
//   setVf((prev) => {
//     const set = new Set(prev[key]);
//     set.has(val) ? set.delete(val) : set.add(val);
//     return { ...prev, [key]: [...set] };
//   });
// };
// const clearVf = () =>
//   setVf({ badge: [], level: [], matiere: [], classe: [], tags: [] });

// // Petit rendu de groupe de chips
// const FilterGroup = ({ label, options = [], selected = [], onToggle, limit }) => {
//   const opts = typeof limit === "number" ? options.slice(0, limit) : options;
//   if (!opts.length) return null;
//   return (
//     <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
//       <Typography variant="body2" sx={{ fontWeight: 700, mr: 0.5 }}>{label} :</Typography>
//       {opts.map((opt) => {
//         const active = selected.includes(opt);
//         return (
//           <Chip
//             key={`${label}-${opt}`}
//             label={opt}
//             clickable
//             size="small"
//             color={active ? "primary" : "default"}
//             variant={active ? "filled" : "outlined"}
//             onClick={() => onToggle(opt)}
//           />
//         );
//       })}
//     </Box>
//   );
// };



// const filteredVideos = React.useMemo(() => {
//   const q = videoQuery.trim().toLowerCase();

//   return (videos || []).filter((v) => {
//     // 1) Recherche texte
//     if (q) {
//       const hay = [
//         v?.title, v?.description, v?.matiere, v?.classe, v?.level, v?.badge,
//         ...(Array.isArray(v?.tags) ? v.tags : []),
//       ].filter(Boolean).join(" ").toLowerCase();
//       if (!hay.includes(q)) return false;
//     }

//     // 2) Filtres par badges (ET logiques entre groupes, OU logique dans un groupe)
//     const badge = (v?.badge || "").toLowerCase();
//     const level = String(v?.level || "").toUpperCase();
//     const matiere = v?.matiere || "";
//     const classe = v?.classe || "";
//     const tags = Array.isArray(v?.tags) ? v.tags : [];

//     const match = (key, val) => vf[key].length === 0 || vf[key].includes(val);

//     if (!match("badge", badge)) return false;
//     if (!match("level", level)) return false;
//     if (!match("matiere", matiere)) return false;
//     if (!match("classe", classe)) return false;

//     // Tags : au moins un tag sélectionné présent
//     if (vf.tags.length > 0 && !tags.some((t) => vf.tags.includes(t))) return false;

//     return true;
//   });
// }, [videos, videoQuery, vf]);











// // --- Recherche texte (livres)
// const [bookQuery, setBookQuery] = useState("");

// // --- Filtres (livres)
// const [bf, setBf] = useState({
//   badge: [],   // "gratuit" | "prenuim"
//   level: [],   // "TERMINALE", "SECONDE", ...
//   matiere: [], // "Maths", ...
//   classe: [],  // "Tle A", ...
//   tags: [],    // ["suite", "derivée", ...]
// });

// // Valeurs disponibles (livres)
// const bookFacets = React.useMemo(() => {
//   const uniq = (arr) => [...new Set(arr.filter(Boolean))];
//   return {
//     badge:  uniq((livres || []).map((b) => b?.badge?.toLowerCase())),
//     level:  uniq((livres || []).map((b) => String(b?.level || "").toUpperCase())),
//     matiere:uniq((livres || []).map((b) => b?.matiere)),
//     classe: uniq((livres || []).map((b) => b?.classe)),
//     tags:   uniq((livres || []).flatMap((b) => Array.isArray(b?.tags) ? b.tags : [])),
//   };
// }, [livres]);

// // Toggle / reset (livres)
// const toggleBf = (key, val) => {
//   setBf((prev) => {
//     const set = new Set(prev[key]);
//     set.has(val) ? set.delete(val) : set.add(val);
//     return { ...prev, [key]: [...set] };
//   });
// };
// const clearBf = () => setBf({ badge: [], level: [], matiere: [], classe: [], tags: [] });

// // Résultats filtrés (livres)
// const filteredBooks = React.useMemo(() => {
//   const q = bookQuery.trim().toLowerCase();

//   return (livres || []).filter((b) => {
//     // 1) recherche texte
//     if (q) {
//       const hay = [
//         b?.title, b?.description, b?.matiere, b?.classe, b?.level, b?.badge,
//         ...(Array.isArray(b?.tags) ? b.tags : []),
//       ].filter(Boolean).join(" ").toLowerCase();
//       if (!hay.includes(q)) return false;
//     }

//     // 2) filtres
//     const badge  = (b?.badge || "").toLowerCase();
//     const level  = String(b?.level || "").toUpperCase();
//     const matiere= b?.matiere || "";
//     const classe = b?.classe || "";
//     const tags   = Array.isArray(b?.tags) ? b.tags : [];

//     const match = (key, val) => bf[key].length === 0 || bf[key].includes(val);

//     if (!match("badge", badge)) return false;
//     if (!match("level", level)) return false;
//     if (!match("matiere", matiere)) return false;
//     if (!match("classe", classe)) return false;

//     if (bf.tags.length > 0 && !tags.some((t) => bf.tags.includes(t))) return false;

//     return true;
//   });
// }, [livres, bookQuery, bf]);


// // --- Recherche texte (examens)
// const [examQuery, setExamQuery] = useState("");

// // --- Filtres (examens)
// const [ef, setEf] = useState({
//   badge: [],   // "gratuit" | "prenuim" (si tu en as sur tes examens)
//   level: [],   // "TERMINALE", "SECONDE", ...
//   matiere: [], // "Maths", ...
//   classe: [],  // "Tle A", ...
//   tags: [],    // ["suite", "derivée", ...] si présents
// });

// // Valeurs disponibles (examens)
// const examFacets = React.useMemo(() => {
//   const uniq = (arr) => [...new Set(arr.filter(Boolean))];
//   return {
//     badge:  uniq((exams || []).map((e) => e?.badge?.toLowerCase())),
//     level:  uniq((exams || []).map((e) => String(e?.level || "").toUpperCase())),
//     matiere:uniq((exams || []).map((e) => e?.matiere)),
//     classe: uniq((exams || []).map((e) => e?.classe)),
//     tags:   uniq((exams || []).flatMap((e) => Array.isArray(e?.tags) ? e.tags : [])),
//   };
// }, [exams]);

// // Toggle / reset
// const toggleEf = (key, val) => {
//   setEf((prev) => {
//     const set = new Set(prev[key]);
//     set.has(val) ? set.delete(val) : set.add(val);
//     return { ...prev, [key]: [...set] };
//   });
// };
// const clearEf = () => setEf({ badge: [], level: [], matiere: [], classe: [], tags: [] });

// // Résultats filtrés (examens)
// const filteredExams = React.useMemo(() => {
//   const q = examQuery.trim().toLowerCase();

//   return (exams || []).filter((e) => {
//     // 1) recherche texte
//     if (q) {
//       const hay = [
//         e?.title, e?.description, e?.matiere, e?.classe, e?.level, e?.badge,
//         ...(Array.isArray(e?.tags) ? e.tags : []),
//       ].filter(Boolean).join(" ").toLowerCase();
//       if (!hay.includes(q)) return false;
//     }

//     // 2) filtres
//     const badge  = (e?.badge || "").toLowerCase();
//     const level  = String(e?.level || "").toUpperCase();
//     const matiere= e?.matiere || "";
//     const classe = e?.classe || "";
//     const tags   = Array.isArray(e?.tags) ? e.tags : [];

//     const match = (key, val) => ef[key].length === 0 || ef[key].includes(val);

//     if (!match("badge", badge)) return false;
//     if (!match("level", level)) return false;
//     if (!match("matiere", matiere)) return false;
//     if (!match("classe", classe)) return false;

//     if (ef.tags.length > 0 && !tags.some((t) => ef.tags.includes(t))) return false;

//     return true;
//   });
// }, [exams, examQuery, ef]);



// // Compter les vidéos en incluant les parties complémentaires
// const totalVideosCount = React.useMemo(() => {
//   let total = 0;
//   for (const v of videos || []) {
//     total += 1; // la vidéo principale
//     total += Array.isArray(v?.videosSupplementaires)
//       ? v.videosSupplementaires.length
//       : 0;      // les vidéos complémentaires
//   }
//   return total;
// }, [videos]);







//   /* ---------- render ---------- */
//   return (
//     <PageLayout>
//       {/* HERO modernisé */}
//       <Box
//         sx={{
//           bgcolor: "linear-gradient(135deg, #fff5f8 0%, #f8fbff 100%)",
//           py: { xs: 4, md: 6 },
//           borderBottom: "1px solid rgba(0,0,0,0.06)",
//         }}
//       >
//         <Container maxWidth="lg">
//           <Stack direction={downMd ? "column" : "row"} alignItems="stretch" spacing={3}>
//             {/* Colonne gauche : CTA Premium + Quotas */}
//             <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 3,
//                   borderRadius: 3,
//                   bgcolor: "#FFF",
//                   border: "1px solid rgba(0,0,0,0.06)",
//                 }}
//               >
//                 <Stack spacing={1} alignItems="flex-start">
//                   <Typography variant={downMd ? "h5" : "h4"} fontWeight={900} color="primary">
//                     Fahimta AI — Premium
//                   </Typography>
//                   <Typography sx={{ color: "text.secondary" }}>
//                     Résous des exercices étape par étape, soumets des photos d’énoncés et échange avec un enseignant.
//                   </Typography>
//                 </Stack>

//                 <Grid container spacing={2} sx={{ mt: 2, mb: 4 }}>
//                   <Grid item xs={12} sm={6}>
//                     <Card
//                       sx={{
//                         p: 2,
//                         borderRadius: 3,
//                         bgcolor: "#FFE082",
//                         boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
//                         height: "100%",
//                       }}
//                     >
//                       <Stack spacing={1} alignItems="center" textAlign="center">
//                         <LockIcon sx={{ fontSize: 46, color: "#000" }} />
//                         <Typography fontWeight={800}>Parler à un enseignant</Typography>
//                         <Typography variant="body2" color="text.primary">
//                           Un enseignant te recontacte via la messagerie intégrée.
//                         </Typography>
//                         <Button
//                           variant="contained"
//                           color="primary"
//                           onClick={() => navigate("/student/support-request")}
//                           sx={{ mt: 1 }}
//                         >
//                           Soutien +
//                         </Button>
//                       </Stack>
//                     </Card>
//                   </Grid>
//                 </Grid>

//                 {/* Quotas */}
//                {/* Quotas (version chips compacte) */}
// {quotas && (
//   <Paper
//     elevation={0}
//     sx={{
//       mt: 2,
//       p: 1.25,
//       borderRadius: 2,
//       bgcolor: "rgba(255,255,255,0.06)",
//       border: "1px solid rgba(255,255,255,0.14)",
//       overflowX: "auto",
//     }}
//   >
//     {/* mini composant local */}
//     {(() => {
//       const QuotaChip = ({ label, remaining, max, color = "primary" }) => {
//         const hasMax = typeof max === "number" && max > 0;
//         const pct = hasMax
//           ? Math.max(0, Math.min(100, Math.round(((max - remaining) / max) * 100)))
//           : null;

//         return (
//           <Paper
//             elevation={0}
//             sx={{
//               px: 1.25,
//               py: 0.75,
//               borderRadius: 999,
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               bgcolor: "rgba(0,0,0,0.18)",
//               border: "1px solid rgba(255,255,255,0.12)",
//               whiteSpace: "nowrap",
//             }}
//           >
//             <Typography variant="body2" sx={{ fontWeight: 800, color: "#fff" }}>
//               {label}
//             </Typography>
//             <Typography variant="body2" sx={{ fontWeight: 800, color: "#fff" }}>
//               {remaining}
//               {hasMax ? `/${max}` : ""}
//             </Typography>
//             {pct !== null && (
//               <Box sx={{ width: 120, ml: 0.5 }}>
//                 <LinearProgress
//                   variant="determinate"
//                   value={pct}
//                   color={color}
//                   sx={{
//                     height: 6,
//                     borderRadius: 999,
//                     backgroundColor: "rgba(255,255,255,0.2)",
//                   }}
//                 />
//               </Box>
//             )}
//           </Paper>
//         );
//       };

//       // si ton backend expose aussi les "max", mappe-les ici :
//       const maxes = {
//         books: quotas?.booksMax,
//         exams: quotas?.examsMax,
//         corrections: quotas?.correctionsMax,
//         iaText: quotas?.iaTextMax,
//         iaVision: quotas?.iaVisionMax,
//       };

//       return (
//         <Stack
//           direction="row"
//           spacing={1}
//           useFlexGap
//           flexWrap="wrap"
//           alignItems="center"
//         >
//           <QuotaChip
//             label="Livres"
//             remaining={quotas?.booksRemaining ?? 0}
//             max={maxes.books}
//             color="secondary"
//           />
//           <QuotaChip
//             label="Sujets"
//             remaining={quotas?.examsRemaining ?? 0}
//             max={maxes.exams}
//             color="info"
//           />
//           <QuotaChip
//             label="Corrections"
//             remaining={quotas?.correctionsRemaining ?? 0}
//             max={maxes.corrections}
//             color="secondary"
//           />
//           <QuotaChip
//             label="Questions IA"
//             remaining={quotas?.iaTextRemaining ?? 0}
//             max={maxes.iaText}
//             color="success"
//           />
//           <QuotaChip
//             label="IA (vision)"
//             remaining={quotas?.iaVisionRemaining ?? 0}
//             max={maxes.iaVision}
//             color="warning"
//           />
//         </Stack>
//       );
//     })()}
//   </Paper>
// )}

//               </Paper>
//             </Stack>

//             {/* Colonne droite : IA texte + OCR */}
//             <Paper
//               elevation={0}
//               sx={{
//                 flex: 1,
//                 p: 2,
//                 borderRadius: 3,
//                 border: "1px solid rgba(0,0,0,0.06)",
//                 bgcolor: "#fff",
//               }}
//             >
//               <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
//                 <AutoAwesomeIcon color="primary" />
//                 <Typography fontWeight={800}>Résoudre avec l’IA</Typography>
//               </Stack>

//               {/* onglets locaux: Texte / Photo */}
//               <Tabs
//                 value={0}
//                 onChange={() => {}}
//                 sx={{
//                   "& .MuiTabs-flexContainer": { gap: 1 },
//                   "& .MuiTab-root": {
//                     bgcolor: "#0b1220",
//                     color: "#fff",
//                     borderRadius: 2,
//                     minHeight: 36,
//                     px: 2,
//                     textTransform: "none",
//                   },
//                 }}
//               >
//                 <Tab disableRipple label={<TabLabel text="Question texte" />} />
//                 <Tab disabled disableRipple label={<TabLabel text="Photo (OCR)" />} />
//               </Tabs>

//               {/* Texte */}
//               <Box sx={{ mt: 2 }}>


//               <TextField
//   label="Décris clairement ton exercice…"
//   fullWidth
//   multiline
//   rows={downMd ? 4 : 3}
//   value={input}
//   onChange={(e) => setInput(e.target.value)}
//   onKeyDown={(e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit();
//     }
//   }}
//   helperText={
//     listening
//       ? "🎙️ Dictée en cours… vous pouvez corriger le texte pendant l’enregistrement."
//       : "Astuce : appuyez sur le micro pour dicter, puis corrigez si besoin avant d’envoyer."
//   }
//   InputProps={{
//     startAdornment: (
//       <InputAdornment position="start">
//         <IconButton
//           onClick={handleToggleDictation}
//           onMouseDown={(e) => e.preventDefault()} // garde le focus dans le champ
//           disabled={!sttSupported}
//           aria-label="Dicter au micro"
//           aria-pressed={listening}
//           title={
//             !sttSupported
//               ? "Micro non supporté par ce navigateur"
//               : listening
//               ? "Arrêter la dictée"
//               : "Dicter au micro"
//           }
//           color={listening ? "error" : "primary"}
//           edge="start"
//           size="large"
//         >
//           {listening ? <MicOffRoundedIcon /> : <MicNoneRoundedIcon />}
//         </IconButton>
//       </InputAdornment>
//     ),
//     endAdornment: (
//       <InputAdornment position="end">
//         <IconButton
//           onClick={handleSubmit}
//           disabled={loading || !input.trim()}
//           aria-label="Envoyer"
//           title="Envoyer"
//           edge="end"
//         >
//           <SendRoundedIcon color="primary" />
//         </IconButton>
//       </InputAdornment>
//     ),
//   }}
//   sx={{
//     "& .MuiOutlinedInput-root": {
//       bgcolor: "#fafafa",
//       borderRadius: 2,
//     },
//   }}
// />


//                 <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
//                   <Typography variant="caption" color="text.secondary">
//                     Ex.: “Expliquez moi les limites .”
//                   </Typography>
//                   <Button size="small" startIcon={<RestartAltIcon />} onClick={resetIA} sx={{ ml: "auto" }}>
//                     Réinitialiser
//                   </Button>
//                 </Stack>

//                 {loading && (
//                   <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 2 }}>
//                     <CircularProgress size={18} />
//                     <Typography>Analyse en cours…</Typography>
//                   </Stack>
//                 )}
//                 {!!message && (
//                   <Alert severity="error" sx={{ mt: 2 }}>
//                     {message}
//                   </Alert>
//                 )}

//                 {response && (
//                   <Box sx={{ mt: 2 }}>
//                     <Typography variant="subtitle1" fontWeight={800}>
//                       Réponse de l’IA :
//                     </Typography>
//                     <Box
//                       sx={{
//                         mt: 1,
//                         bgcolor: "#1e3a8a",
//                         color: "#fff",
//                         p: 2,
//                         borderRadius: 2,
//                         fontFamily: "Courier New, monospace",
//                         whiteSpace: "pre-line",
//                         minHeight: 100,
//                       }}
//                     >
//                       {typedText}
//                     </Box>
//                   </Box>
//                 )}


// {(response || typedText) && (
//   <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
//     <Button
//       size="small"
//       startIcon={<VolumeUpRoundedIcon />}
//       onClick={handleSpeak}
//       disabled={!ttsSupported || !getLastIaText()}
//     >
//       Écouter
//     </Button>
//     <Button
//       size="small"
//       startIcon={<StopRoundedIcon />}
//       onClick={handleStopSpeak}
//       disabled={!speaking}
//     >
//       Arrêter l’audio
//     </Button>

//     <Button
//       size="small"
//       startIcon={<RestartAltIcon />}
//       onClick={() => {
//         setInput("");
//         setMessage("");
//         setResponse("");
//         setTypedText("");
//         handleStopSpeak();
//       }}
//       sx={{ ml: "auto" }}
//     >
//       Réinitialiser
//     </Button>
//     <Button
//       size="small"
//       onClick={() => {
//         const full = getFullIaText(typedText, response);
//         if (!full) return;
//         saveTextFile(full, tsName("fahimta-reponse-ia"));
//       }}
//     >
//       Enregistrer en .txt
//     </Button>
//   </Stack>
// )}



//               </Box>

//               <Divider sx={{ my: 3 }} />

//               {/* OCR */}
//               <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
//                 <ImageOutlinedIcon color="action" />
//                 <Typography fontWeight={800}>Soumettre une photo</Typography>
//                 <Chip label="Premium" size="small" color="warning" sx={{ ml: 1 }} />
//                 {quotas?.iaVisionRemaining != null && (
//                   <Chip
//                     size="small"
//                     sx={{ ml: "auto" }}
//                     label={`Reste: ${quotas.iaVisionRemaining} / mois`}
//                   />
//                 )}
//               </Stack>

//               <Box
//                 onDragOver={prevent}
//                 onDragEnter={prevent}
//                 onDrop={onDropFile}
//                 sx={{
//                   p: 2,
//                   border: "2px dashed #cbd5e1",
//                   borderRadius: 2,
//                   textAlign: "center",
//                   bgcolor: "#f9fafb",
//                 }}
//               >
//                 <Typography variant="body2" color="text.secondary">
//                   Glisse-dépose une image ici, ou sélectionne un fichier :
//                 </Typography>

//                 <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon />} sx={{ mt: 1.5 }}>
//                   Choisir une image
//                   <input
//                     type="file"
//                     accept="image/*"
//                     hidden
//                     onChange={(e) => setOcrImage(e.target.files?.[0] || null)}
//                   />
//                 </Button>

//                 {ocrImage && (
//                   <Stack
//                     direction={downMd ? "column" : "row"}
//                     spacing={2}
//                     alignItems="center"
//                     sx={{ mt: 2 }}
//                   >
//                     <img
//                       src={URL.createObjectURL(ocrImage)}
//                       alt="aperçu"
//                       style={{
//                         maxWidth: downMd ? "100%" : 180,
//                         borderRadius: 8,
//                         display: "block",
//                       }}
//                     />
//                     <Stack direction="row" spacing={1} alignItems="center">
//                       <CheckCircleRoundedIcon color="success" />
//                       <Typography variant="body2">{ocrImage.name}</Typography>
//                     </Stack>
//                   </Stack>
//                 )}

//                 <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 2 }}>
//                   <Button
//                     variant="contained"
//                     color="secondary"
//                     onClick={handleImageSubmit}
//                     disabled={ocrLoading || !ocrImage || Number(quotas?.iaVisionRemaining ?? 0) <= 0}
//                   >
//                     Envoyer à l’IA
//                   </Button>
//                   {ocrLoading && <CircularProgress size={20} />}
//                 </Stack>

//                 {!!ocrError && (
//                   <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
//                     <ErrorOutlineRoundedIcon color="error" />
//                     <Typography color="error">{ocrError}</Typography>
//                   </Stack>
//                 )}

//                 {/* {ocrResponse && (
//                   <Box sx={{ mt: 2, bgcolor: "#263238", p: 2, borderRadius: 2 }}>
//                     <Typography variant="subtitle1" color="white" fontWeight={800}>
//                       Réponse IA :
//                     </Typography>
//                     <Typography
//                       sx={{
//                         whiteSpace: "pre-line",
//                         mt: 1,
//                         fontFamily: "Courier New, monospace",
//                         color: "white",
//                         minHeight: 100,
//                       }}
//                     >
//                       {typedOCR}
//                     </Typography>
//                   </Box>
//                 )} */}


// {ocrResponse && (
//   <Box sx={{ mt: 2, bgcolor: "#263238", p: 2, borderRadius: 2 }}>
//     <Typography variant="subtitle1" color="white" fontWeight={800}>
//       Réponse IA :
//     </Typography>
//     <Typography
//       sx={{
//         whiteSpace: "pre-line",
//         mt: 1,
//         fontFamily: "Courier New, monospace",
//         color: "white",
//         minHeight: 100,
//       }}
//     >
//       {typedOCR}
//     </Typography>

//     <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
//       <Button
//         size="small"
//         variant="outlined"
//         onClick={() => {
//           const full = getFullOcrText(typedOCR, ocrResponse);
//           if (!full) return;
//           saveTextFile(full, tsName("fahimta-reponse-ocr"));
//         }}
//       >
//         Enregistrer en .txt
//       </Button>
//       <Button
//         size="small"
//         startIcon={<RestartAltIcon />}
//         onClick={resetOCR}
//         disabled={ocrLoading}
//       >
//         Réinitialiser
//       </Button>
//     </Stack>
//   </Box>
// )}






//               </Box>
//             </Paper>
//           </Stack>
//         </Container>
//       </Box>

//       {/* RESSOURCES Premium */}
//   {/* RESSOURCES Premium */}
// <Container maxWidth="lg" sx={{ py: 6 }}>
//   {/* Tabs “pill” modernes et collants */}
//   <Paper
//     elevation={0}
//     sx={{
//       position: "sticky",
//       top: 72,
//       zIndex: 3,
//       p: 1,
//       borderRadius: 3,
//       backdropFilter: "blur(8px)",
//       background: "rgba(255,255,255,0.85)",
//       border: "1px solid rgba(2,12,27,0.08)",
//       mb: 3,
//     }}
//   >

// <Tabs
//   value={tabIndex}
//   onChange={(_, v) => setTabIndex(v)}
//   variant={downMd ? "scrollable" : "fullWidth"}
//   scrollButtons
//   allowScrollButtonsMobile
//   sx={{
//     minHeight: 48,
//     "& .MuiTabs-flexContainer": {
//       gap: 8,
//       flexWrap: "nowrap",               // pas de wrap
//     },
//     "& .MuiTabs-scroller": {
//       overflowX: "auto !important",     // défilement horizontal
//       msOverflowStyle: "none",          // IE/Edge
//       scrollbarWidth: "none",           // Firefox
//       touchAction: "pan-x",             // glisser au doigt
//     },
//     "& .MuiTabs-scroller::-webkit-scrollbar": { display: "none" }, // cacher la barre
//     "& .MuiTab-root": {
//       minHeight: 42,
//       minWidth: "auto",                 // évite des tabs trop larges
//       textTransform: "none",
//       whiteSpace: "nowrap",
//       fontWeight: 800,
//       borderRadius: 999,
//       px: 2,
//       color: "rgba(2,12,27,0.65)",
//       transition: "all .2s ease",
//       "&:hover": { backgroundColor: "rgba(2,12,27,0.06)" },
//     },
//     "& .Mui-selected": {
//       color: "#0b3f8a",
//       backgroundColor: "rgba(13,110,253,0.12)",
//     },
//     "& .MuiTabs-indicator": { display: "none" },
//   }}
// >

//       <Tab
//         label={
//           <Box display="flex" alignItems="center" gap={1}>
//             <MenuBookRoundedIcon fontSize="small" />
//             Livres PDF
//             <Chip
//               size="small"
//               label={livres?.length ?? 0}
//               sx={{
//                 ml: .5,
//                 height: 18,
//                 fontSize: 11,
//                 color: "#0b3f8a",
//                 bgcolor: "rgba(13,110,253,0.12)",
//               }}
//             />
//           </Box>
//         }
//       />
//       <Tab
//         label={
//           <Box display="flex" alignItems="center" gap={1}>
//             <TaskAltRoundedIcon fontSize="small" />
//             Examens corrigés
//             <Chip
//               size="small"
//               label={exams?.length ?? 0}
//               sx={{
//                 ml: .5,
//                 height: 18,
//                 fontSize: 11,
//                 color: "#0b3f8a",
//                 bgcolor: "rgba(13,110,253,0.12)",
//               }}
//             />
//           </Box>
//         }
//       />
//       <Tab
//         label={
//           <Box display="flex" alignItems="center" gap={1}>
//             <PlayCircleOutlineRoundedIcon fontSize="small" />
//             Cours vidéo
           
//  <Chip
//    size="small"
//    label={totalVideosCount}
//    sx={{
//      ml: .5,
//      height: 18,
//      fontSize: 11,
//      color: "#0b3f8a",
//      bgcolor: "rgba(13,110,253,0.12)",
//    }}
//  />





//           </Box>
//         }
//       />
//     </Tabs>
//   </Paper>

//   {/* Livres */}
// {/* Livres */}
// <Box role="tabpanel" hidden={tabIndex !== 0}>
//   {tabIndex === 0 && (
//     <>
//       {/* Barre de filtres + recherche (livres) */}
//       <Box sx={{ mb: 2, display: "grid", gap: 1.25 }}>
//         <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
//           <FilterGroup
//             label="Badge"
//             options={bookFacets.badge}
//             selected={bf.badge}
//             onToggle={(val) => toggleBf("badge", val)}
//           />
//           <FilterGroup
//             label="Niveau"
//             options={bookFacets.level}
//             selected={bf.level}
//             onToggle={(val) => toggleBf("level", val)}
//           />
//           <FilterGroup
//             label="Matière"
//             options={bookFacets.matiere}
//             selected={bf.matiere}
//             onToggle={(val) => toggleBf("matiere", val)}
//           />
//           <FilterGroup
//             label="Classe"
//             options={bookFacets.classe}
//             selected={bf.classe}
//             onToggle={(val) => toggleBf("classe", val)}
//           />
//           <FilterGroup
//             label="Tags"
//             options={bookFacets.tags}
//             selected={bf.tags}
//             onToggle={(val) => toggleBf("tags", val)}
//             limit={10}
//           />
//         </Stack>

//         <Stack direction="row" alignItems="center" spacing={1}>
//           <Typography variant="body2" sx={{ opacity: 0.7 }}>
//             {filteredBooks.length} livre(s) trouvé(s)
//           </Typography>
//           {(bf.badge.length || bf.level.length || bf.matiere.length || bf.classe.length || bf.tags.length) > 0 && (
//             <Button size="small" onClick={clearBf}>
//               Effacer les filtres
//             </Button>
//           )}
//         </Stack>

//         {/* Tu peux réutiliser VideoSearchBar pour le champ texte (il est générique) */}
//         <VideoSearchBar
//           query={bookQuery}
//           onQueryChange={setBookQuery}
//           activeCount={filteredBooks.length}
//         />
//       </Box>

//       <Grid container spacing={3}>
//         {filteredBooks.map((livre, i) => (
//           <Grid item xs={12} sm={6} md={4} key={i}>
//             <BookCard book={livre} isPremiumUser />
//           </Grid>
//         ))}
//         {filteredBooks.length === 0 && (
//           <Grid item xs={12}>
//             <Alert severity="info">
//               {bookQuery ? "Aucun résultat pour votre recherche." : "Aucun livre disponible pour le moment."}
//             </Alert>
//           </Grid>
//         )}
//       </Grid>
//     </>
//   )}
// </Box>


//   {/* Examens corrigés */}

// {/* Examens corrigés */}
// <Box role="tabpanel" hidden={tabIndex !== 1}>
//   {tabIndex === 1 && (
//     <>
//       {/* Barre de filtres + recherche (examens) */}
//       <Box sx={{ mb: 2, display: "grid", gap: 1.25 }}>
//         <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
//           <FilterGroup
//             label="Badge"
//             options={examFacets.badge}
//             selected={ef.badge}
//             onToggle={(val) => toggleEf("badge", val)}
//           />
//           <FilterGroup
//             label="Niveau"
//             options={examFacets.level}
//             selected={ef.level}
//             onToggle={(val) => toggleEf("level", val)}
//           />
//           <FilterGroup
//             label="Matière"
//             options={examFacets.matiere}
//             selected={ef.matiere}
//             onToggle={(val) => toggleEf("matiere", val)}
//           />
//           <FilterGroup
//             label="Classe"
//             options={examFacets.classe}
//             selected={ef.classe}
//             onToggle={(val) => toggleEf("classe", val)}
//           />
//           <FilterGroup
//             label="Tags"
//             options={examFacets.tags}
//             selected={ef.tags}
//             onToggle={(val) => toggleEf("tags", val)}
//             limit={10}
//           />
//         </Stack>

//         <Stack direction="row" alignItems="center" spacing={1}>
//           <Typography variant="body2" sx={{ opacity: 0.7 }}>
//             {filteredExams.length} examen(s) trouvé(s)
//           </Typography>
//           {(ef.badge.length || ef.level.length || ef.matiere.length || ef.classe.length || ef.tags.length) > 0 && (
//             <Button size="small" onClick={clearEf}>
//               Effacer les filtres
//             </Button>
//           )}
//         </Stack>

//         {/* Recherche texte (réutilise VideoSearchBar) */}
//         <VideoSearchBar
//           query={examQuery}
//           onQueryChange={setExamQuery}
//           activeCount={filteredExams.length}
//         />
//       </Box>

//       <Grid container spacing={3}>
//         {filteredExams.map((exam) => (
//           <Grid item xs={12} md={6} lg={4} key={exam._id}>
//             <ExamCard
//               exam={exam}
//               isPremiumUser={isPremiumUser}
//             />
//           </Grid>
//         ))}

//         {filteredExams.length === 0 && (
//           <Grid item xs={12}>
//             <Alert severity="info">
//               {examQuery
//                 ? "Aucun résultat pour votre recherche."
//                 : "Aucun examen corrigé pour l’instant."}
//             </Alert>
//           </Grid>
//         )}
//       </Grid>
//     </>
//   )}
// </Box>





// {/* Vidéos */}
// <Box role="tabpanel" hidden={tabIndex !== 2}>
//   {tabIndex === 2 && (
//     <>

// {/* Barre de filtres + recherche */}
// <Box sx={{ mb: 2, display: "grid", gap: 1.25 }}>
//   {/* Groupes de badges cliquables */}
//   <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
//     <FilterGroup
//       label="Badge"
//       options={videoFacets.badge}
//       selected={vf.badge}
//       onToggle={(val) => toggleVf("badge", val)}
//     />
//     <FilterGroup
//       label="Niveau"
//       options={videoFacets.level}
//       selected={vf.level}
//       onToggle={(val) => toggleVf("level", val)}
//     />
//     <FilterGroup
//       label="Matière"
//       options={videoFacets.matiere}
//       selected={vf.matiere}
//       onToggle={(val) => toggleVf("matiere", val)}
//     />
//     <FilterGroup
//       label="Classe"
//       options={videoFacets.classe}
//       selected={vf.classe}
//       onToggle={(val) => toggleVf("classe", val)}
//     />
//     <FilterGroup
//       label="Tags"
//       options={videoFacets.tags}
//       selected={vf.tags}
//       onToggle={(val) => toggleVf("tags", val)}
//       limit={10} // affiche les 10 premiers tags (ajuste si besoin)
//     />
//   </Stack>

//   {/* Ligne actions + stats + bouton Reset */}
//   <Stack direction="row" alignItems="center" spacing={1}>
//     <Typography variant="body2" sx={{ opacity: 0.7 }}>
//       {filteredVideos.length} chapitre(s) trouvé(s)
//     </Typography>
//     {(vf.badge.length || vf.level.length || vf.matiere.length || vf.classe.length || vf.tags.length) > 0 && (
//       <Button size="small" onClick={clearVf}>
//         Effacer les filtres
//       </Button>
//     )}
//   </Stack>

//   {/* Recherche texte (on garde ton composant) */}
//   <VideoSearchBar
//     query={videoQuery}
//     onQueryChange={setVideoQuery}
//     activeCount={filteredVideos.length}
//   />
// </Box>







//       <Grid container spacing={3}>
//         {filteredVideos.map((video, i) => (
//           <Grid item xs={12} sm={6} md={4} key={i}>
//             <VideoCardPremium video={video} isPremiumUser={isPremiumUser} />
//           </Grid>
//         ))}

//         {filteredVideos.length === 0 && (
//           <Grid item xs={12}>
//             <Alert severity="info">
//               {videoQuery
//                 ? "Aucun résultat pour votre recherche."
//                 : "Aucune vidéo disponible pour l’instant."}
//             </Alert>
//           </Grid>
//         )}
//       </Grid>
//     </>
//   )}
// </Box>

// </Container>

//     </PageLayout>
//   );
// };

// export default PremiumFahimtaPage;
