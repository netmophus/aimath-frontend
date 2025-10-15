import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Box, Paper, Typography, TextField, IconButton, Avatar, Stack, Chip, Button,
  Drawer, List, ListItemButton, ListItemText, Divider, Snackbar, Tooltip
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

  // ✅ Socket.io temps réel
  const {
    isConnected,
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    onMessage,
    onTyping,
  } = useSocket(token);

  // ✅ État "en train d'écrire"
  const [isStudentTyping, setIsStudentTyping] = useState(false);

  // ui
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "info" });
  const showSnack = (msg, sev = "info") => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // scroll
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, student]);

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
      }
  } catch (err) {
      console.error("Send failed", err);
      showSnack("Erreur lors de l'envoi.", "error");
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

  // ✅ Après recadrage, définir le fichier
  const handleCropComplete = (croppedFile) => {
    setFile(croppedFile);
    setImageToCrop(null);
  };

  // --- audio
  const handleSendAudio = async (blob) => {
    if (!student) return showSnack("Aucun élève sélectionné.", "warning");
    
    // ✅ Mettre le flag AVANT l'envoi pour éviter les erreurs de timing
    setAudioJustSent(true);
    
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
      
      // Réinitialiser après un délai
      setTimeout(() => setAudioJustSent(false), 1500);
    } catch (err) {
      console.error("Audio failed", err);
      showSnack("Erreur envoi vocal.", "error");
      setAudioJustSent(false); // ✅ Réinitialiser en cas d'erreur
    }
  };

  const handleRecord = async () => {
    if (!student) return showSnack("Aucun élève sélectionné.", "warning");
  if (isRecording) {
      mediaRecorder?.stop();
    setIsRecording(false);
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
    const chunks = [];
      rec.ondataavailable = (e) => e.data?.size && chunks.push(e.data);
      rec.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
        handleSendAudio(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      setMediaRecorder(rec);
    setIsRecording(true);
  } catch (err) {
      console.error("Mic denied", err);
      showSnack("Accès micro refusé ou indisponible.", "error");
    }
  };

  const Bubble = ({ msg }) => {
    const mine = msg.from._id === user?._id;
    const time = new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return (
      <Stack direction="row" justifyContent={mine ? "flex-end" : "flex-start"} sx={{ mb: 1.25 }}>
        {!mine && (
          <Avatar sx={{ width: 28, height: 28, mr: 1 }}>
            {(student?.fullName || "E")[0]}
          </Avatar>
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

            {file && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip label={file.name} onDelete={() => setFile(null)} />
                {file.type?.startsWith("image/") && (
                  <img src={URL.createObjectURL(file)} alt="aperçu" style={{ height: 56, borderRadius: 8 }} />
                )}
              </Stack>
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

            <Stack direction="row" alignItems="center" spacing={1}>
              {/* ✅ Bouton Pièce jointe (PDF, vidéo, audio) */}
              <Tooltip title="Fichier (PDF, vidéo, audio)">
                <IconButton onClick={() => fileInputRef.current?.click()}>
  <AttachFileIcon />
</IconButton>
              </Tooltip>

              {/* ✅ Bouton Galerie (images existantes) */}
              <Tooltip title="Galerie d'images">
                <IconButton onClick={() => galleryInputRef.current?.click()} color="info">
                  🖼️
                </IconButton>
              </Tooltip>

              {/* ✅ Bouton Caméra (OUVRE LA CAMÉRA) */}
              <Tooltip title="📸 Prendre une photo">
                <IconButton onClick={openCamera} color="secondary">
                  <CameraAltRoundedIcon />
                </IconButton>
              </Tooltip>

              <IconButton color={isRecording ? "error" : "primary"} onClick={handleRecord} title="Message vocal">
    <MicIcon />
  </IconButton>

              <TextField
                variant="outlined"
                placeholder="Écrivez un message…"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                fullWidth
                size="small"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              <IconButton color="primary" onClick={handleSend} title="Envoyer">
                <SendIcon />
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
