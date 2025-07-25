import React, { useEffect, useState , useContext, useRef} from "react";
import {
  Box,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  TextField,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import PageLayout from "../../components/PageLayout";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import MicIcon from "@mui/icons-material/Mic";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";




const StudentChatPage = () => {

  const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});



  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
 
const { user } = useContext(AuthContext);

  const [file, setFile] = useState(null);
const fileInputRef = useRef();

const [isRecording, setIsRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState(null);


const [audioJustSent, setAudioJustSent] = useState(false);


const [audioSuccessMessage, setAudioSuccessMessage] = useState("");

const [errorMessage, setErrorMessage] = useState("");
const [openError, setOpenError] = useState(false);

const showError = (message) => {
  setErrorMessage(message);
  setOpenError(true);
};

const handleCloseError = (event, reason) => {
  if (reason === "clickaway") return;
  setOpenError(false);
};


  // ✅ Récupérer l’ID de l’utilisateur connecté



  // ✅ Charger la liste des enseignants
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await API.get("/student/chat-teachers");
        console.log("✅ Enseignants chargés :", res.data);
        setTeachers(res.data);
      } catch (err) {
        console.error("❌ Erreur chargement enseignants :", err);
      }
    };
    fetchTeachers();
  }, []);

  // ✅ Quand un enseignant est sélectionné → charger les messages
  const handleSelectTeacher = async (teacher) => {
    setSelectedTeacher(teacher);
    try {
      const res = await API.get(`/student/chat/${teacher._id}`);
      console.log("✅ Messages reçus avec", teacher.fullName, ":", res.data);
      setMessages(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement messages :", err);
    }
  };


const handleSend = async () => {
  if (!selectedTeacher) {
    showError("Veuillez sélectionner un enseignant avant d’envoyer un message.");
    return;
  }

 if (!newMsg.trim() && !file) {
  if (audioJustSent) return; // ⛔ Ignore si on vient d'envoyer un audio
  showError("Message vide ou aucun fichier sélectionné.");
  return;
}


  try {
    let messageResponse;

    if (file) {
      const formData = new FormData();
      formData.append("to", selectedTeacher._id);
      formData.append("file", file);

      const res = await API.post("/student/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      messageResponse = res.data;
      setFile(null);
    }

    if (newMsg.trim()) {
      const res = await API.post("/student/chat/send", {
        to: selectedTeacher._id,
        text: newMsg,
      });
      messageResponse = res.data;
      setNewMsg("");
    }

    setMessages((prev) => [...prev, messageResponse]);
  } catch (err) {
    console.error("❌ Erreur envoi message :", err);
    showError("Erreur lors de l’envoi du message.");
  }
};


  const handleFileChange = (e) => {
  setFile(e.target.files[0]);
};



    if (!user?._id) {
  return (
    <PageLayout>
      <Box p={4}>
        <Typography>Chargement de l'utilisateur...</Typography>
      </Box>
    </PageLayout>
  );
}

const handleSendAudio = async (audioBlob) => {
  if (!selectedTeacher) {
    showError("Veuillez sélectionner un enseignant avant d’envoyer un message vocal.");
    return;
  }

  const formData = new FormData();
  formData.append("to", selectedTeacher._id);
  formData.append("file", audioBlob, "audioMessage.webm");

  try {
    const res = await API.post("/student/chat/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("🎤 Message vocal envoyé :", res.data);
    setMessages((prev) => [...prev, res.data]);

    // ✅ Protection contre le faux message d'erreur + message visuel
    setAudioJustSent(true);
    setAudioSuccessMessage("✅ Message vocal envoyé !");
    setTimeout(() => {
      setAudioJustSent(false);
      setAudioSuccessMessage("");
    }, 2000);
  } catch (err) {
    console.error("❌ Erreur envoi message vocal :", err);
    showError("Erreur lors de l’envoi du message vocal.");
  }
};


const handleRecord = async () => {
  if (!selectedTeacher) {
    showError("Veuillez sélectionner un enseignant avant d’enregistrer un message vocal.");
    return;
  }

  if (isRecording) {
    mediaRecorder.stop(); // Le onstop s’exécutera ensuite
    setIsRecording(false);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        chunks.push(e.data);
      }
    };

   recorder.onstop = () => {
  const blob = new Blob(chunks, { type: 'audio/webm' });
  console.log("🎧 audioBlob prêt :", blob);
  handleSendAudio(blob); // envoi direct
};


    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  } catch (err) {
    console.error("🎙️ Accès micro refusé :", err);
    showError("Accès au micro refusé ou indisponible.");
  }
};


  return (

    <PageLayout>
  <Box p={2} sx={{ mt: { xs: 8, md: 10 } }}>
    <Typography variant="h5" fontWeight="bold" gutterBottom>
      🎓 Messagerie Élève (Soutien+)
    </Typography>

    <Grid container spacing={3}>
      {/* ✅ Liste des enseignants */}
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ height: "75vh", p: 2, overflowY: "auto" }}>
          <Typography variant="h6" gutterBottom>
            📚 Enseignants disponibles
          </Typography>
          <List dense>
            {teachers.map((teacher) => (
              <ListItem
                key={teacher._id}
                button
                selected={selectedTeacher?._id === teacher._id}
                onClick={() => handleSelectTeacher(teacher)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: selectedTeacher?._id === teacher._id ? "#e3f2fd" : "#fafafa",
                  border: "1px solid #e0e0e0",
                  transition: "0.3s",
                }}
              >
                <ListItemText
                  primary={<Typography fontWeight="bold">{teacher.fullName}</Typography>}
                  secondary={
                    <>
                      <Typography variant="body2">📍 {teacher.city} • 🏫 {teacher.schoolName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        📘 {teacher.subjects?.join(", ")}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* ✅ Zone de discussion */}
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ height: "75vh", p: 2, display: "flex", flexDirection: "column" }}>
          <Typography variant="h6" gutterBottom>
            💬 Discussion avec : {selectedTeacher?.fullName || "—"}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* ✅ Messages */}
          <Box sx={{ flexGrow: 1, overflowY: "auto", pr: 1 }}>
            {messages.map((msg, idx) => {
              const isMine = msg.from._id === user?._id;

              return (
                <Box
                  key={idx}
                  display="flex"
                  justifyContent={isMine ? "flex-end" : "flex-start"}
                  mb={1}
                >
                  <Box
                    sx={{
                      bgcolor: isMine ? "#d1eaff" : "#f5f5f5",
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      maxWidth: "70%",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text && <Typography variant="body2">{msg.text}</Typography>}

                    {msg.fileUrl && (
                      <Box mt={1}>
                        {msg.fileType === "pdf" && (
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                            📄 Voir le PDF
                          </a>
                        )}
                        {msg.fileType === "video" && (
                          <video
                            src={msg.fileUrl}
                            controls
                            style={{ maxWidth: "100%", borderRadius: 6 }}
                          />
                        )}
                        {msg.fileType?.startsWith("audio") && (
                          <audio controls src={msg.fileUrl} style={{ width: "100%" }} />
                        )}
                        {!["pdf", "video"].includes(msg.fileType) &&
                          !msg.fileType?.startsWith("audio") && (
                            <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                              📎 Voir le fichier
                            </a>
                          )}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* ✅ Zone d'envoi */}
          <Divider sx={{ my: 2 }} />
          <Box display="flex" alignItems="center" gap={1}>
            <input
              type="file"
              accept="image/*,.pdf"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <IconButton onClick={() => fileInputRef.current.click()}>
              <AttachFileIcon />
            </IconButton>

            <IconButton color={isRecording ? "error" : "primary"} onClick={handleRecord}>
              <MicIcon />
            </IconButton>

            <TextField
              variant="outlined"
              placeholder="Écrivez un message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              fullWidth
              size="small"
            />

            <IconButton color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Grid>
    </Grid>

    {/* ✅ Erreurs (Snackbar) */}
    <Snackbar
      open={openError}
      autoHideDuration={4000}
      onClose={handleCloseError}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={handleCloseError} severity="error" sx={{ width: "100%" }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  </Box>
</PageLayout>


  );
};

export default StudentChatPage;
