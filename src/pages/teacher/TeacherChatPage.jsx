import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Box, Paper, Typography, TextField, IconButton, Avatar, Stack, Chip, Button,
  Drawer, List, ListItemButton, ListItemText, Divider, Snackbar, Tooltip, Alert as MuiAlertImport,
  CircularProgress
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSearchParams } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import CircleIcon from "@mui/icons-material/Circle";
import DeleteIcon from "@mui/icons-material/Delete";
import MuiAlert from "@mui/material/Alert";

import API from "../../api";
import PageLayout from "../../components/PageLayout";
import { AuthContext } from "../../context/AuthContext";
import { useSocket } from "../../hooks/useSocket";
import ImageCropModal from "../../components/ImageCropModal";
import CameraModal from "../../components/CameraModal";

const STORAGE_KEY_LAST_STUDENT = "fah:lastStudentId";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});





const TeacherChatPage = () => {
  const { user, token } = useContext(AuthContext);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams] = useSearchParams();

  // --- state
  const [students, setStudents] = useState([]);
  const [student, setStudent] = useState(null); // élève sélectionné/actif
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // files / camera
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();       // Pour PDF, vidéo, audio
  const galleryInputRef = useRef();    // ✅ Pour galerie d'images

  // ✅ Caméra native
  const [cameraModalOpen, setCameraModalOpen] = useState(false);

  // ✅ Recadrage d'image
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  // audio
const [isRecording, setIsRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioJustSent, setAudioJustSent] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null); // ✅ Blob audio enregistré
  const [audioPreviewUrl, setAudioPreviewUrl] = useState(null); // ✅ URL pour preview
  const [recordingTime, setRecordingTime] = useState(0); // ✅ Chronomètre
  const recordingIntervalRef = useRef(null);

  // ✅ Socket.io temps réel
  const {
    isConnected,
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    deleteMessage, // ✅ Pour notifier la suppression
    startTyping,
    stopTyping,
    onMessage,
    onMessageDeleted, // ✅ Pour écouter les suppressions
    onTyping,
  } = useSocket(token);

  // ✅ État "en train d'écrire"
  const [isStudentTyping, setIsStudentTyping] = useState(false);

  // ui
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "info" });
  const showSnack = (msg, sev = "info") => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));
  
  // ✅ Spinner de chargement pour l'envoi
  const [isSending, setIsSending] = useState(false);

  // scroll
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, student]);

  // ✅ Cleanup : arrêter le chronomètre et nettoyer l'URL audio au démontage
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  // --- helpers
  const pickStudent = (list, preferredId) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const byPreferred = preferredId ? list.find((s) => s._id === preferredId) : null;
    return byPreferred || list[0];
  };

  // --- bootstrap : load students + select last used or first
  useEffect(() => {
    if (!user?._id) return;

    (async () => {
      try {
        const listRes = await API.get("/teacher/chat-students");
        const list = listRes.data || [];
        setStudents(list);

        // ✅ Priorité 1 : paramètre URL ?student=...
        const urlStudentId = searchParams.get("student");
        let chosen = null;

        if (urlStudentId) {
          chosen = pickStudent(list, urlStudentId);
          console.log(`🔍 Élève depuis URL : ${urlStudentId}`, chosen);
        }

        // ✅ Priorité 2 : dernier élève utilisé (localStorage)
        if (!chosen) {
          const lastId = localStorage.getItem(STORAGE_KEY_LAST_STUDENT);
          chosen = pickStudent(list, lastId);
        }

        // ✅ Priorité 3 : premier élève de la liste
        if (!chosen) {
          chosen = pickStudent(list);
        }

        if (chosen) {
          setStudent(chosen);
          localStorage.setItem(STORAGE_KEY_LAST_STUDENT, chosen._id);
          // load messages
          try {
            const m = await API.get(`/teacher/chat/${chosen._id}`);
            setMessages(m.data || []);
          } catch (e) {
            console.warn("Load messages failed", e);
          }
        } else {
          console.warn("❌ Aucun élève disponible ou trouvé");
        }
      } catch (err) {
        console.error("Bootstrap chat failed", err);
        showSnack("Impossible de charger les élèves.", "error");
      }
    })();
  }, [user?._id, searchParams]);

  // ✅ Socket.io: Rejoindre/quitter room quand on change d'élève
  useEffect(() => {
    if (!student?._id) return;
    
    joinChat(student._id);
    console.log(`🔌 Rejoint la room avec ${student.fullName}`);
    
    return () => {
      leaveChat(student._id);
    };
  }, [student?._id, joinChat, leaveChat]);

  // ✅ Socket.io: Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!student?._id) return;

    const unsubscribe = onMessage((message) => {
      // Vérifier que c'est bien pour cette conversation
      if (message.from._id === student._id || message.to._id === student._id) {
        setMessages((prev) => {
          // Éviter les doublons
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    return unsubscribe;
  }, [student?._id, onMessage]);

  // ✅ Socket.io: Écouter les suppressions de messages en temps réel
  useEffect(() => {
    if (!student?._id) return;

    const unsubscribe = onMessageDeleted(({ messageId }) => {
      console.log(`🗑️ Message ${messageId} supprimé (notification Socket.io)`);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });

    return unsubscribe;
  }, [student?._id, onMessageDeleted]);

  // ✅ Socket.io: Écouter l'indicateur "en train d'écrire"
  useEffect(() => {
    if (!student?._id) return;

    const unsubscribe = onTyping((data) => {
      if (data.from === student._id) {
        setIsStudentTyping(data.type !== "inactive");
      }
    });

    return unsubscribe;
  }, [student?._id, onTyping]);

  // ✅ Socket.io: Envoyer indicateur "en train d'écrire"
  const typingTimeoutRef = useRef(null);
  useEffect(() => {
    if (!student?._id) return;

    if (newMsg.length > 0) {
      startTyping(student._id);
      
      // Auto-stop après 3 secondes d'inactivité
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(student._id);
      }, 3000);
    } else {
      stopTyping(student._id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [newMsg, student?._id, startTyping, stopTyping]);

  const switchStudent = async (s) => {
    setDrawerOpen(false);
    if (!s || s._id === student?._id) return;
    setStudent(s);
    localStorage.setItem(STORAGE_KEY_LAST_STUDENT, s._id);
    try {
      const m = await API.get(`/teacher/chat/${s._id}`);
      setMessages(m.data || []);
    } catch (e) {
      console.warn("Load messages failed", e);
      setMessages([]);
    }
  };

  // --- send text/file
  const handleSend = async () => {
    if (!student) return showSnack("Aucun élève sélectionné.", "warning");
    
    // ✅ Ignorer silencieusement si un audio vient d'être envoyé
    if (audioJustSent) return;
    
    if (!newMsg.trim() && !file) {
      return showSnack("Message vide ou aucun fichier.", "warning");
    }

    // ✅ Arrêter l'indicateur "en train d'écrire"
    stopTyping(student._id);

    // ✅ Activer le spinner de chargement
    setIsSending(true);

    try {
      let created;
      if (file) {
        const form = new FormData();
        form.append("to", student._id);
        form.append("file", file);
        const up = await API.post("/teacher/chat/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        created = up.data;
        setFile(null);
      }
      if (newMsg.trim()) {
        const res = await API.post("/teacher/chat/send", { to: student._id, text: newMsg });
        created = res.data;
    setNewMsg("");
      }
      if (created) {
        setMessages((p) => [...p, created]);
        // ✅ Envoyer via Socket.io pour livraison instantanée
        sendMessage(student._id, created);
        
        // ✅ Nettoyer l'aperçu après envoi réussi
        if (file) {
          setFile(null);
          showSnack("✅ Message envoyé avec succès !", "success");
        }
      }
  } catch (err) {
      console.error("Send failed", err);
      showSnack("Erreur lors de l'envoi.", "error");
    } finally {
      // ✅ Désactiver le spinner de chargement
      setIsSending(false);
    }
  };

  // --- fichiers (PDF, vidéo, audio - PAS d'images)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  // ✅ Galerie d'images → recadrage
  const handleGallerySelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (selectedFile.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(selectedFile);
      setImageToCrop(imageUrl);
      setCropModalOpen(true);
    }
  };
  
  // ✅ Caméra → ouvrir le modal caméra
  const openCamera = () => {
    setCameraModalOpen(true);
  };
  
  // ✅ Photo capturée → recadrage
  const handlePhotoCapture = (photoFile) => {
    const imageUrl = URL.createObjectURL(photoFile);
    setImageToCrop(imageUrl);
    setCropModalOpen(true);
  };

  // ✅ Après recadrage, définir le fichier et l'afficher directement
  const handleCropComplete = (croppedFile) => {
    setFile(croppedFile);
    setImageToCrop(null);
    setCropModalOpen(false);
    
    // ✅ Créer un aperçu de l'image validée
    const imageUrl = URL.createObjectURL(croppedFile);
    
    // ✅ Afficher un message de succès
    showSnack("✅ Photo validée ! Cliquez sur Envoyer pour l'envoyer dans le chat.", "success");
  };

  // --- audio
  const handleSendAudio = async (blob) => {
    if (!student) return showSnack("Aucun élève sélectionné.", "warning");
    
    // ✅ Mettre le flag AVANT l'envoi pour éviter les erreurs de timing
    setAudioJustSent(true);
    
    // ✅ Activer le spinner pendant l'envoi de l'audio
    setIsSending(true);
    
    const form = new FormData();
    form.append("to", student._id);
    form.append("file", blob, "audioMessage.webm");
    try {
      const res = await API.post("/teacher/chat/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((p) => [...p, res.data]);
      
      // ✅ Envoyer via Socket.io pour livraison instantanée
      sendMessage(student._id, res.data);
      
      showSnack("✅ Audio envoyé avec succès !", "success");
      
      // Réinitialiser après un délai
      setTimeout(() => setAudioJustSent(false), 1500);
    } catch (err) {
      console.error("Audio failed", err);
      showSnack("Erreur envoi vocal.", "error");
      setAudioJustSent(false); // ✅ Réinitialiser en cas d'erreur
    } finally {
      // ✅ Désactiver le spinner
      setIsSending(false);
    }
  };

  const handleRecord = async () => {
    if (!student) return showSnack("Aucun élève sélectionné.", "warning");
  if (isRecording) {
      // ✅ Arrêter l'enregistrement (ne pas envoyer automatiquement)
      mediaRecorder?.stop();
    setIsRecording(false);
      clearInterval(recordingIntervalRef.current);
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
    const chunks = [];
      rec.ondataavailable = (e) => e.data?.size && chunks.push(e.data);
      rec.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
        // ✅ Stocker pour preview au lieu d'envoyer directement
        setRecordedAudio(blob);
        setAudioPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      setMediaRecorder(rec);
    setIsRecording(true);
      setRecordingTime(0);
      // ✅ Démarrer le chronomètre
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
  } catch (err) {
      console.error("Mic denied", err);
      showSnack("Accès micro refusé ou indisponible.", "error");
    }
  };

  // ✅ Envoyer l'audio enregistré
  const handleConfirmSendAudio = () => {
    if (recordedAudio) {
      handleSendAudio(recordedAudio);
      // Nettoyer
      setRecordedAudio(null);
      setAudioPreviewUrl(null);
      setRecordingTime(0);
    }
  };

  // ✅ Annuler l'enregistrement
  const handleCancelAudio = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setRecordedAudio(null);
    setAudioPreviewUrl(null);
    setRecordingTime(0);
  };

  // ✅ Supprimer un message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("❌ Voulez-vous vraiment supprimer ce message ?\n\n⚠️ Cette action est irréversible.")) {
      return;
    }

    try {
      const res = await API.delete(`/teacher/chat/message/${messageId}`);
      
      if (res.data.success) {
        // Supprimer localement
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        
        // Notifier via Socket.io
        deleteMessage(student._id, messageId);
        
        showSnack("✅ Message supprimé avec succès.", "success");
      }
    } catch (err) {
      console.error("Erreur suppression message:", err);
      showSnack(err.response?.data?.message || "Erreur lors de la suppression.", "error");
    }
  };

  const Bubble = ({ msg }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const mine = msg.from._id === user?._id;
    const time = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      <Stack 
        direction="row" 
        justifyContent={mine ? "flex-end" : "flex-start"} 
        sx={{ mb: 1.25, position: "relative" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!mine && (
          <Avatar sx={{ width: 28, height: 28, mr: 1 }}>
            {(student?.fullName || "E")[0]}
          </Avatar>
        )}
        
        {/* ✅ Bouton de suppression (visible au survol, seulement pour les messages envoyés par moi) */}
        {mine && isHovered && (
          <Tooltip title="Supprimer ce message">
            <IconButton
              size="small"
              onClick={() => handleDeleteMessage(msg._id)}
              sx={{
                position: "absolute",
                top: -8,
                right: -8,
                bgcolor: "error.main",
                color: "#fff",
                width: 24,
                height: 24,
                "&:hover": {
                  bgcolor: "error.dark",
                },
                boxShadow: 2,
                zIndex: 10,
              }}
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}

        <Box
          sx={{
            maxWidth: "78%",
            px: 1.5, py: 1,
            borderRadius: 2,
            bgcolor: mine ? "primary.main" : "#f1f5f9",
            color: mine ? "#fff" : "inherit",
            boxShadow: 1,
          }}
        >
          {msg.text && <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{msg.text}</Typography>}
          {msg.fileUrl && (
            <Box mt={0.5}>
              {/* 🔍 Debug log pour voir le type de fichier reçu */}
              {console.log("🔍 Message avec fichier reçu:", { fileType: msg.fileType, fileUrl: msg.fileUrl })}
              
              {/* ✅ Images en priorité */}
              {msg.fileType === "image" && (
                <img src={msg.fileUrl} alt="photo" style={{ maxWidth: "100%", borderRadius: 8 }} />
              )}
              
              {/* ✅ Vidéos */}
              {msg.fileType === "video" && (
                <video src={msg.fileUrl} controls style={{ maxWidth: "100%", borderRadius: 6 }} />
              )}
              
              {/* ✅ Audio */}
              {(msg.fileType === "audio" || msg.fileType?.startsWith("audio")) && (
                <audio controls src={msg.fileUrl} style={{ width: "100%" }} />
              )}
              
              {/* ✅ PDF */}
              {msg.fileType === "pdf" && (
                <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: mine ? "#fff" : undefined }}>
                  📄 Ouvrir le PDF
                </a>
              )}
              
              {/* ✅ Fallback pour tout le reste */}
              {!["image", "video", "audio", "pdf"].includes(msg.fileType) && (
                <img src={msg.fileUrl} alt="pièce jointe" style={{ maxWidth: "100%", borderRadius: 8 }} />
              )}
            </Box>
          )}
          <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.25, textAlign: "right" }}>
            {time}
          </Typography>
        </Box>
      </Stack>
    );
  };

  if (!user?._id) {
  return (
    <PageLayout>
        <Box p={4}><Typography>Chargement de l'utilisateur…</Typography></Box>
    </PageLayout>
  );
}


  return (
     <PageLayout>
      <Box sx={{ mt: { xs: 7, md: 9 }, px: 2, pb: 2 }}>
        <Paper
          elevation={3}
                      sx={{
            height: { xs: "calc(100vh - 120px)", md: "75vh" },
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            overflow: "hidden",
            borderRadius: 3,
          }}
        >
          {/* Header sticky */}
          <Box sx={{ p: 1.5, borderBottom: "1px solid #eee", bgcolor: "#fff", display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ bgcolor: "#2e7d32" }}>
              {(student?.fullName || "E")[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={800} noWrap>
                {student?.fullName || "Élève"}
              </Typography>
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {/* ✅ Statut en ligne dynamique */}
                {isConnected && onlineUsers.has(student?._id) ? (
                  <>
                    <CircleIcon fontSize="inherit" color="success" /> En ligne
                  </>
                ) : (
                  <>
                    <CircleIcon fontSize="inherit" sx={{ color: "grey.400" }} /> Hors ligne
                  </>
                )}
              </Typography>
              {/* ✅ Indicateur "en train d'écrire" */}
              {isStudentTyping && (
                <Typography variant="caption" color="primary" sx={{ fontStyle: "italic" }}>
                  En train d'écrire...
                </Typography>
              )}
            </Box>
            <Box sx={{ ml: "auto" }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SwapHorizRoundedIcon />}
                onClick={() => setDrawerOpen(true)}
              >
                Changer d'élève
              </Button>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ p: 2, overflowY: "auto", bgcolor: "#fafafa" }}>
            {messages.length === 0 && (
              <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">
                  Dites bonjour à {student?.fullName || "votre élève"} 👋
                </Typography>
              </Box>
            )}
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}

            {/* ✅ Aperçu de la photo validée avec possibilité de suppression */}
            {file && (
              <Box sx={{ mb: 2, p: 2, bgcolor: "#e8f5e8", borderRadius: 2, border: "2px solid #4caf50" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ 
                      bgcolor: "#4caf50", 
                      color: "#fff", 
                      borderRadius: "50%", 
                      width: 24, 
                      height: 24, 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      fontSize: "12px"
                    }}>
                      ✅
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600} color="success.dark">
                        Photo validée et prête à envoyer
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {file.name} • {(file.size / 1024 / 1024).toFixed(1)} MB
                      </Typography>
                    </Box>
                  </Stack>
                  
                  {/* ✅ Aperçu de l'image */}
                  {file.type?.startsWith("image/") && (
                    <Box sx={{ position: "relative" }}>
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Aperçu validé" 
                        style={{ 
                          height: 60, 
                          width: 60,
                          borderRadius: 8, 
                          objectFit: "cover",
                          border: "2px solid #4caf50"
                        }} 
                      />
                      
                      {/* ✅ Bouton supprimer */}
                      <IconButton
                        size="small"
                        onClick={() => setFile(null)}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: "error.main",
                          color: "#fff",
                          width: 20,
                          height: 20,
                          "&:hover": {
                            bgcolor: "error.dark",
                          },
                          boxShadow: 2,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                  )}
                  
                  {/* ✅ Bouton supprimer principal */}
                  <IconButton
                    color="error"
                    onClick={() => setFile(null)}
                    title="Supprimer cette photo"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
                
                {/* ✅ Message d'instruction */}
                <Typography variant="caption" color="success.dark" sx={{ mt: 1, display: "block", fontStyle: "italic" }}>
                  💡 Cliquez sur "Envoyer" pour envoyer cette photo dans le chat
                </Typography>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          {/* Composer */}
          <Box sx={{ p: 1.25, borderTop: "1px solid #eee", bgcolor: "#fff" }}>
            {/* ✅ inputs cachés - séparés par fonction */}
            
            {/* Pièce jointe (PDF, vidéo, audio - PAS d'images) */}
<input
  type="file"
              accept=".pdf,video/*,audio/*"
  ref={fileInputRef}
  onChange={handleFileChange}
  style={{ display: "none" }}
/>
            
            {/* Galerie d'images (choisir image existante) */}
            <input
              type="file"
              accept="image/*"
              ref={galleryInputRef}
              onChange={handleGallerySelect}
              style={{ display: "none" }}
            />

            {/* ✅ Indicateur d'enregistrement en cours */}
            {isRecording && (
              <Box sx={{ mb: 1.5, p: 1.5, bgcolor: "#ffebee", borderRadius: 2, border: "2px solid #ef5350" }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: "#ef5350",
                        borderRadius: "50%",
                        animation: "pulse 1.5s ease-in-out infinite",
                        "@keyframes pulse": {
                          "0%, 100%": { opacity: 1 },
                          "50%": { opacity: 0.4 },
                        },
                      }}
                    />
                    <Typography variant="body2" fontWeight={600} color="error">
                      Enregistrement en cours...
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700} color="error">
                    {Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")}
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={handleRecord}
                    sx={{ ml: "auto" }}
                  >
                    ⏸️ Arrêter
                  </Button>
                </Stack>
              </Box>
            )}

            {/* ✅ Aperçu audio après enregistrement */}
            {recordedAudio && !isRecording && (
              <Box sx={{ mb: 1.5, p: 1.5, bgcolor: "#e3f2fd", borderRadius: 2, border: "2px solid #2196f3" }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={600} color="primary">
                      🎤 Message vocal enregistré ({Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")})
                    </Typography>
                  </Stack>
                  
                  {/* Player audio pour réécouter */}
                  {audioPreviewUrl && (
                    <audio controls src={audioPreviewUrl} style={{ width: "100%", height: 40 }} />
                  )}
                  
                  {/* Boutons d'action */}
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={isSending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                      onClick={handleConfirmSendAudio}
                      disabled={isSending}
                      fullWidth
                    >
                      {isSending ? "Envoi..." : "✅ Envoyer"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={handleCancelAudio}
                      disabled={isSending}
                      fullWidth
                    >
                      ❌ Annuler
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}

            <Stack direction="row" alignItems="center" spacing={1}>
              {/* ✅ Bouton Pièce jointe (PDF, vidéo, audio) */}
              <Tooltip title="Fichier (PDF, vidéo, audio)">
                <IconButton onClick={() => fileInputRef.current?.click()} disabled={isSending}>
  <AttachFileIcon />
</IconButton>
              </Tooltip>

              {/* ✅ Bouton Galerie (images existantes) */}
              <Tooltip title="Galerie d'images">
                <IconButton onClick={() => galleryInputRef.current?.click()} color="info" disabled={isSending}>
                  🖼️
                </IconButton>
              </Tooltip>

              {/* ✅ Bouton Caméra (OUVRE LA CAMÉRA) */}
              <Tooltip title="📸 Prendre une photo">
                <IconButton onClick={openCamera} color="secondary" disabled={isSending}>
                  <CameraAltRoundedIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title={isRecording ? "⏸️ Arrêter l'enregistrement" : recordedAudio ? "En attente d'envoi..." : "🎤 Message vocal"}>
                <span>
                  <IconButton 
                    color={isRecording ? "error" : "primary"} 
                    onClick={handleRecord} 
                    disabled={(recordedAudio && !isRecording) || isSending}
                  >
                    <MicIcon />
                  </IconButton>
                </span>
              </Tooltip>

              <TextField
                variant="outlined"
                placeholder={isSending ? "Envoi en cours..." : "Écrivez un message…"}
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                fullWidth
                size="small"
                disabled={isSending} // ✅ Désactiver pendant l'envoi
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <IconButton 
                color="primary" 
                onClick={handleSend} 
                title="Envoyer"
                disabled={isSending} // ✅ Désactiver pendant l'envoi
                sx={{
                  // ✅ Bouton plus visible quand il y a une photo prête
                  ...(file && {
                    bgcolor: "primary.main",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                    boxShadow: 2,
                    transform: "scale(1.1)",
                    transition: "all 0.2s ease",
                  })
                }}
              >
                {isSending ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Stack>
            </Box>
          </Paper>
      </Box>

      {/* Drawer pour changer d'élève */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>Choisir un élève</Typography>
          <Divider sx={{ mb: 1 }} />
          {students.length === 0 && <Typography variant="body2">Aucun élève disponible.</Typography>}
          <List dense>
            {students.map((s) => (
              <ListItemButton
                key={s._id}
                selected={s._id === student?._id}
                onClick={() => switchStudent(s)}
              >
                <ListItemText
                  primary={s.fullName}
                  secondary={`${s.city || ""} ${s.schoolName ? "• " + s.schoolName : ""}`}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* ✅ Modal caméra (prendre photo) */}
      <CameraModal
        open={cameraModalOpen}
        onClose={() => setCameraModalOpen(false)}
        onCapture={handlePhotoCapture}
      />

      {/* ✅ Modal de recadrage d'image */}
      <ImageCropModal
        open={cropModalOpen}
        image={imageToCrop}
        onClose={() => {
          setCropModalOpen(false);
          setImageToCrop(null);
        }}
        onCropComplete={handleCropComplete}
      />

      <Snackbar
        open={snack.open}
  autoHideDuration={4000}
        onClose={closeSnack}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
        <Alert onClose={closeSnack} severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
  </Alert>
</Snackbar>
    </PageLayout>
  );
};

export default TeacherChatPage;
