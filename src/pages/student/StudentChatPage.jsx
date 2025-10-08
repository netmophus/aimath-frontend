// import React, { useEffect, useState , useContext, useRef} from "react";
// import {
//   Box,
//   Grid,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   Typography,
//   Divider,
//   TextField,
//   IconButton,
// } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";
// import API from "../../api";
// import { AuthContext } from "../../context/AuthContext";
// import PageLayout from "../../components/PageLayout";
// import AttachFileIcon from "@mui/icons-material/AttachFile";
// import MicIcon from "@mui/icons-material/Mic";
// import Snackbar from "@mui/material/Snackbar";
// import MuiAlert from "@mui/material/Alert";




// const StudentChatPage = () => {

//   const Alert = React.forwardRef(function Alert(props, ref) {
//   return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
// });



//   const [teachers, setTeachers] = useState([]);
//   const [selectedTeacher, setSelectedTeacher] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
 
// const { user } = useContext(AuthContext);

//   const [file, setFile] = useState(null);
// const fileInputRef = useRef();

// const [isRecording, setIsRecording] = useState(false);
// const [mediaRecorder, setMediaRecorder] = useState(null);


// const [audioJustSent, setAudioJustSent] = useState(false);


// const [audioSuccessMessage, setAudioSuccessMessage] = useState("");

// const [errorMessage, setErrorMessage] = useState("");
// const [openError, setOpenError] = useState(false);

// const showError = (message) => {
//   setErrorMessage(message);
//   setOpenError(true);
// };

// const handleCloseError = (event, reason) => {
//   if (reason === "clickaway") return;
//   setOpenError(false);
// };


//   // ✅ Récupérer l’ID de l’utilisateur connecté



//   // ✅ Charger la liste des enseignants
//   useEffect(() => {
//     const fetchTeachers = async () => {
//       try {
//         const res = await API.get("/student/chat-teachers");
//         console.log("✅ Enseignants chargés :", res.data);
//         setTeachers(res.data);
//       } catch (err) {
//         console.error("❌ Erreur chargement enseignants :", err);
//       }
//     };
//     fetchTeachers();
//   }, []);

//   // ✅ Quand un enseignant est sélectionné → charger les messages
//   const handleSelectTeacher = async (teacher) => {
//     setSelectedTeacher(teacher);
//     try {
//       const res = await API.get(`/student/chat/${teacher._id}`);
//       console.log("✅ Messages reçus avec", teacher.fullName, ":", res.data);
//       setMessages(res.data);
//     } catch (err) {
//       console.error("❌ Erreur chargement messages :", err);
//     }
//   };


// const handleSend = async () => {
//   if (!selectedTeacher) {
//     showError("Veuillez sélectionner un enseignant avant d’envoyer un message.");
//     return;
//   }

//  if (!newMsg.trim() && !file) {
//   if (audioJustSent) return; // ⛔ Ignore si on vient d'envoyer un audio
//   showError("Message vide ou aucun fichier sélectionné.");
//   return;
// }


//   try {
//     let messageResponse;

//     if (file) {
//       const formData = new FormData();
//       formData.append("to", selectedTeacher._id);
//       formData.append("file", file);

//       const res = await API.post("/student/chat/upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       messageResponse = res.data;
//       setFile(null);
//     }

//     if (newMsg.trim()) {
//       const res = await API.post("/student/chat/send", {
//         to: selectedTeacher._id,
//         text: newMsg,
//       });
//       messageResponse = res.data;
//       setNewMsg("");
//     }

//     setMessages((prev) => [...prev, messageResponse]);
//   } catch (err) {
//     console.error("❌ Erreur envoi message :", err);
//     showError("Erreur lors de l’envoi du message.");
//   }
// };


//   const handleFileChange = (e) => {
//   setFile(e.target.files[0]);
// };



//     if (!user?._id) {
//   return (
//     <PageLayout>
//       <Box p={4}>
//         <Typography>Chargement de l'utilisateur...</Typography>
//       </Box>
//     </PageLayout>
//   );
// }

// const handleSendAudio = async (audioBlob) => {
//   if (!selectedTeacher) {
//     showError("Veuillez sélectionner un enseignant avant d’envoyer un message vocal.");
//     return;
//   }

//   const formData = new FormData();
//   formData.append("to", selectedTeacher._id);
//   formData.append("file", audioBlob, "audioMessage.webm");

//   try {
//     const res = await API.post("/student/chat/upload", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     console.log("🎤 Message vocal envoyé :", res.data);
//     setMessages((prev) => [...prev, res.data]);

//     // ✅ Protection contre le faux message d'erreur + message visuel
//     setAudioJustSent(true);
//     setAudioSuccessMessage("✅ Message vocal envoyé !");
//     setTimeout(() => {
//       setAudioJustSent(false);
//       setAudioSuccessMessage("");
//     }, 2000);
//   } catch (err) {
//     console.error("❌ Erreur envoi message vocal :", err);
//     showError("Erreur lors de l’envoi du message vocal.");
//   }
// };


// const handleRecord = async () => {
//   if (!selectedTeacher) {
//     showError("Veuillez sélectionner un enseignant avant d’enregistrer un message vocal.");
//     return;
//   }

//   if (isRecording) {
//     mediaRecorder.stop(); // Le onstop s’exécutera ensuite
//     setIsRecording(false);
//     return;
//   }

//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//     const recorder = new MediaRecorder(stream);
//     const chunks = [];

//     recorder.ondataavailable = (e) => {
//       if (e.data && e.data.size > 0) {
//         chunks.push(e.data);
//       }
//     };

//    recorder.onstop = () => {
//   const blob = new Blob(chunks, { type: 'audio/webm' });
//   console.log("🎧 audioBlob prêt :", blob);
//   handleSendAudio(blob); // envoi direct
// };


//     recorder.start();
//     setMediaRecorder(recorder);
//     setIsRecording(true);
//   } catch (err) {
//     console.error("🎙️ Accès micro refusé :", err);
//     showError("Accès au micro refusé ou indisponible.");
//   }
// };


//   return (

//     <PageLayout>
//   <Box p={2} sx={{ mt: { xs: 8, md: 10 } }}>
//     <Typography variant="h5" fontWeight="bold" gutterBottom>
//       🎓 Messagerie Élève (Soutien+)
//     </Typography>

//     <Grid container spacing={3}>
//       {/* ✅ Liste des enseignants */}
//       <Grid item xs={12} md={4}>
//         <Paper elevation={3} sx={{ height: "75vh", p: 2, overflowY: "auto" }}>
//           <Typography variant="h6" gutterBottom>
//             📚 Enseignants disponibles
//           </Typography>
//           <List dense>
//             {teachers.map((teacher) => (
//               <ListItem
//                 key={teacher._id}
//                 button
//                 selected={selectedTeacher?._id === teacher._id}
//                 onClick={() => handleSelectTeacher(teacher)}
//                 sx={{
//                   borderRadius: 2,
//                   mb: 1,
//                   bgcolor: selectedTeacher?._id === teacher._id ? "#e3f2fd" : "#fafafa",
//                   border: "1px solid #e0e0e0",
//                   transition: "0.3s",
//                 }}
//               >
//                 <ListItemText
//                   primary={<Typography fontWeight="bold">{teacher.fullName}</Typography>}
//                   secondary={
//                     <>
//                       <Typography variant="body2">📍 {teacher.city} • 🏫 {teacher.schoolName}</Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         📘 {teacher.subjects?.join(", ")}
//                       </Typography>
//                     </>
//                   }
//                 />
//               </ListItem>
//             ))}
//           </List>
//         </Paper>
//       </Grid>

//       {/* ✅ Zone de discussion */}
//       <Grid item xs={12} md={8}>
//         <Paper elevation={3} sx={{ height: "75vh", p: 2, display: "flex", flexDirection: "column" }}>
//           <Typography variant="h6" gutterBottom>
//             💬 Discussion avec : {selectedTeacher?.fullName || "—"}
//           </Typography>
//           <Divider sx={{ mb: 2 }} />

//           {/* ✅ Messages */}
//           <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
//             {messages.map((msg, idx) => {
//               const isMine = msg.from._id === user?._id;

//               return (
//                 <Box
//                   key={idx}
//                   display="flex"
//                   justifyContent={isMine ? "flex-end" : "flex-start"}
//                   mb={1}
//                 >
//                   <Box
//                     sx={{
//                       bgcolor: isMine ? "#d1eaff" : "#f5f5f5",
//                       px: 2,
//                       py: 1,
//                       borderRadius: 3,
//                       maxWidth: "70%",
//                       wordBreak: "break-word",
//                     }}
//                   >
//                     {msg.text && <Typography variant="body2">{msg.text}</Typography>}

//                     {msg.fileUrl && (
//                       <Box mt={1}>
//                         {msg.fileType === "pdf" && (
//                           <a href={msg.fileUrl} target="_blank" rel="noreferrer">
//                             📄 Voir le PDF
//                           </a>
//                         )}
//                         {msg.fileType === "video" && (
//                           <video
//                             src={msg.fileUrl}
//                             controls
//                             style={{ maxWidth: "100%", borderRadius: 6 }}
//                           />
//                         )}
//                         {msg.fileType?.startsWith("audio") && (
//                           <audio controls src={msg.fileUrl} style={{ width: "100%" }} />
//                         )}
//                         {!["pdf", "video"].includes(msg.fileType) &&
//                           !msg.fileType?.startsWith("audio") && (
//                             <a href={msg.fileUrl} target="_blank" rel="noreferrer">
//                               📎 Voir le fichier
//                             </a>
//                           )}
//                       </Box>
//                     )}
//                   </Box>
//                 </Box>
//               );
//             })}
//           </Box>

//           {/* ✅ Zone d'envoi */}
//           <Divider sx={{ my: 2 }} />
//           <Box display="flex" alignItems="center" gap={1}>
//             <input
//               type="file"
//               accept="image/*,.pdf"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               style={{ display: "none" }}
//             />
//             <IconButton onClick={() => fileInputRef.current.click()}>
//               <AttachFileIcon />
//             </IconButton>

//             <IconButton color={isRecording ? "error" : "primary"} onClick={handleRecord}>
//               <MicIcon />
//             </IconButton>

//             <TextField
//               variant="outlined"
//               placeholder="Écrivez un message..."
//               value={newMsg}
//               onChange={(e) => setNewMsg(e.target.value)}
//               fullWidth
//               size="small"
//             />

//             <IconButton color="primary" onClick={handleSend}>
//               <SendIcon />
//             </IconButton>
//           </Box>
//         </Paper>
//       </Grid>
//     </Grid>

//     {/* ✅ Erreurs (Snackbar) */}
//     <Snackbar
//       open={openError}
//       autoHideDuration={4000}
//       onClose={handleCloseError}
//       anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//     >
//       <Alert onClose={handleCloseError} severity="error" sx={{ width: "100%" }}>
//         {errorMessage}
//       </Alert>
//     </Snackbar>
//   </Box>
// </PageLayout>


//   );
// };

// export default StudentChatPage;




// pages/student/StudentChatPage.jsx
import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Box, Paper, Typography, TextField, IconButton, Avatar, Stack, Chip, Button,
  Drawer, List, ListItemButton, ListItemText, Divider, Snackbar, Tooltip
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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
import ContentRequestFAB from "../../components/ContentRequestFAB";

const STORAGE_KEY_LAST_TEACHER = "fah:lastTeacherId";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const StudentChatPage = () => {
  const { user, token } = useContext(AuthContext);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  // --- state
  const [teachers, setTeachers] = useState([]);
  const [teacher, setTeacher] = useState(null); // enseignant sélectionné/actif
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
  const [isTeacherTyping, setIsTeacherTyping] = useState(false);

  // ui
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "info" });
  const showSnack = (msg, sev = "info") => setSnack({ open: true, msg, sev });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // scroll
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, teacher]);

  // --- helpers
  const pickTeacher = (list, preferredId) => {
    if (!Array.isArray(list) || list.length === 0) return null;
    const byPreferred = preferredId ? list.find((t) => t._id === preferredId) : null;
    return byPreferred || list[0];
  };

  // --- bootstrap : load active teacher (si dispo), sinon dernier utilisé, sinon 1er de la liste
  useEffect(() => {
    if (!user?._id) return;

    (async () => {
      try {
        const [actRes, listRes] = await Promise.all([
          API.get("/student/support/active").catch(() => ({ data: { active: false } })),
          API.get("/student/chat-teachers"),
        ]);

        const list = listRes.data || [];
        setTeachers(list);

        let chosen = null;
        if (actRes?.data?.active && actRes.data.teacherId) {
          chosen = pickTeacher(list, actRes.data.teacherId);
        }
        if (!chosen) {
          const lastId = localStorage.getItem(STORAGE_KEY_LAST_TEACHER);
          chosen = pickTeacher(list, lastId);
        }
        if (!chosen) chosen = pickTeacher(list);

        if (chosen) {
          setTeacher(chosen);
          localStorage.setItem(STORAGE_KEY_LAST_TEACHER, chosen._id);
          // load messages
          try {
            const m = await API.get(`/student/chat/${chosen._id}`);
            setMessages(m.data || []);
          } catch (e) {
            console.warn("Load messages failed", e);
          }
        }
      } catch (err) {
        console.error("Bootstrap chat failed", err);
        showSnack("Impossible de charger les enseignants.", "error");
      }
    })();
  }, [user?._id]);

  // ✅ Socket.io: Rejoindre/quitter room quand on change d'enseignant
  useEffect(() => {
    if (!teacher?._id) return;
    
    joinChat(teacher._id);
    console.log(`🔌 Rejoint la room avec ${teacher.fullName}`);
    
    return () => {
      leaveChat(teacher._id);
    };
  }, [teacher?._id, joinChat, leaveChat]);

  // ✅ Socket.io: Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!teacher?._id) return;

    const unsubscribe = onMessage((message) => {
      // Vérifier que c'est bien pour cette conversation
      if (message.from._id === teacher._id || message.to._id === teacher._id) {
        setMessages((prev) => {
          // Éviter les doublons
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    return unsubscribe;
  }, [teacher?._id, onMessage]);

  // ✅ Socket.io: Écouter l'indicateur "en train d'écrire"
  useEffect(() => {
    if (!teacher?._id) return;

    const unsubscribe = onTyping((data) => {
      if (data.from === teacher._id) {
        setIsTeacherTyping(data.type !== "inactive");
      }
    });

    return unsubscribe;
  }, [teacher?._id, onTyping]);

  // ✅ Socket.io: Envoyer indicateur "en train d'écrire"
  const typingTimeoutRef = useRef(null);
  useEffect(() => {
    if (!teacher?._id) return;

    if (newMsg.length > 0) {
      startTyping(teacher._id);
      
      // Auto-stop après 3 secondes d'inactivité
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(teacher._id);
      }, 3000);
    } else {
      stopTyping(teacher._id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [newMsg, teacher?._id, startTyping, stopTyping]);

  const switchTeacher = async (t) => {
    setDrawerOpen(false);
    if (!t || t._id === teacher?._id) return;
    setTeacher(t);
    localStorage.setItem(STORAGE_KEY_LAST_TEACHER, t._id);
    try {
      const m = await API.get(`/student/chat/${t._id}`);
      setMessages(m.data || []);
    } catch (e) {
      console.warn("Load messages failed", e);
      setMessages([]);
    }
  };

  // --- send text/file
  const handleSend = async () => {
    if (!teacher) return showSnack("Aucun enseignant sélectionné.", "warning");
    if (!newMsg.trim() && !file) {
      if (audioJustSent) return;
      return showSnack("Message vide ou aucun fichier.", "warning");
    }

    // ✅ Arrêter l'indicateur "en train d'écrire"
    stopTyping(teacher._id);

    try {
      let created;
      if (file) {
        const form = new FormData();
        form.append("to", teacher._id);
        form.append("file", file);
        const up = await API.post("/student/chat/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        created = up.data;
        setFile(null);
      }
      if (newMsg.trim()) {
        const res = await API.post("/student/chat/send", { to: teacher._id, text: newMsg });
        created = res.data;
        setNewMsg("");
      }
      if (created) {
        setMessages((p) => [...p, created]);
        // ✅ Envoyer via Socket.io pour livraison instantanée
        sendMessage(teacher._id, created);
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
    if (!teacher) return showSnack("Aucun enseignant sélectionné.", "warning");
    const form = new FormData();
    form.append("to", teacher._id);
    form.append("file", blob, "audioMessage.webm");
    try {
      const res = await API.post("/student/chat/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((p) => [...p, res.data]);
      setAudioJustSent(true);
      setTimeout(() => setAudioJustSent(false), 1200);
    } catch (err) {
      console.error("Audio failed", err);
      showSnack("Erreur envoi vocal.", "error");
    }
  };

  const handleRecord = async () => {
    if (!teacher) return showSnack("Aucun enseignant sélectionné.", "warning");
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
            {(teacher?.fullName || "T")[0]}
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
              {msg.fileType === "video" && (
                <video src={msg.fileUrl} controls style={{ maxWidth: "100%", borderRadius: 6 }} />
              )}
              {msg.fileType?.startsWith("audio") && <audio controls src={msg.fileUrl} style={{ width: "100%" }} />}
              {msg.fileType === "pdf" && (
                <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: mine ? "#fff" : undefined }}>
                  📄 Ouvrir le PDF
                </a>
              )}
              {!["pdf", "video"].includes(msg.fileType) && !msg.fileType?.startsWith("audio") && (
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
        <Box p={4}><Typography>Chargement de l’utilisateur…</Typography></Box>
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
            <Avatar sx={{ bgcolor: "#1565C0" }}>
              {(teacher?.fullName || "T")[0]}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={800} noWrap>
                {teacher?.fullName || "Enseignant"}
              </Typography>
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {/* ✅ Statut en ligne dynamique */}
                {isConnected && onlineUsers.has(teacher?._id) ? (
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
              {isTeacherTyping && (
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
                Changer d’enseignant
              </Button>
            </Box>
          </Box>

          {/* Messages */}
          <Box sx={{ p: 2, overflowY: "auto", bgcolor: "#fafafa" }}>
            {messages.length === 0 && (
              <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2">
                  Dites bonjour à {teacher?.fullName || "votre enseignant"} 👋
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

      {/* Drawer pour changer d’enseignant (optionnel) */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Typography fontWeight={800} sx={{ mb: 1 }}>Choisir un enseignant</Typography>
          <Divider sx={{ mb: 1 }} />
          {teachers.length === 0 && <Typography Avariant="body2">Aucun enseignant disponible.</Typography>}
          <List dense>
            {teachers.map((t) => (
              <ListItemButton
                key={t._id}
                selected={t._id === teacher?._id}
                onClick={() => switchTeacher(t)}
              >
                <ListItemText
                  primary={t.fullName}
                  secondary={`${t.city || ""} ${t.schoolName ? "• " + t.schoolName : ""}`}
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

      {/* ✅ Bouton FAB pour demander du contenu */}
      <ContentRequestFAB />

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

export default StudentChatPage;
