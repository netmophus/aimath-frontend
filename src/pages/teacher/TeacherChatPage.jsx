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
  Snackbar,

} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import API from "../../api";
import PageLayout from "../../components/PageLayout";
import MicIcon from "@mui/icons-material/Mic";
import AttachFileIcon from "@mui/icons-material/AttachFile"; // à ajouter en haut


import { AuthContext } from "../../context/AuthContext";

import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});





const TeacherChatPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
const { user } = useContext(AuthContext);
const [selectedFile, setSelectedFile] = useState(null);

const [isRecording, setIsRecording] = useState(false);
const [mediaRecorder, setMediaRecorder] = useState(null);


const fileInputRef = useRef();


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



const handleFileChange = (e) => {
  setSelectedFile(e.target.files[0]);
};

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await API.get("/teacher/chat-students");
        setStudents(res.data);
      } catch (err) {
        console.error("Erreur chargement élèves :", err);
      }
    };
    fetchStudents();
  }, []);

  const handleSelectStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await API.get(`/teacher/chat/${student._id}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Erreur chargement messages :", err);
    }
  };


// const handleSend = async () => {
//   if ((!newMsg.trim() && !selectedFile) || !selectedStudent) return;

//   try {
//     let newMessage;

//     if (selectedFile) {
//       const formData = new FormData();
//       formData.append("file", selectedFile);
//       formData.append("to", selectedStudent._id);

//       const res = await API.post("/teacher/chat/upload", formData);
//       newMessage = res.data;
//       setSelectedFile(null);
//     } else {
//       const res = await API.post("/teacher/chat/send", {
//         to: selectedStudent._id,
//         text: newMsg,
//       });
//       newMessage = res.data;
//     }

//     setMessages((prev) => [...prev, newMessage]);
//     setNewMsg("");
//   } catch (err) {
//     console.error("Erreur envoi message :", err);
//   }
// };

// const handleSend = async () => {
//   if (!selectedStudent) {
//     alert("Veuillez sélectionner un élève avant d’envoyer un message.");
//     return;
//   }

//   if (!newMsg.trim() && !selectedFile) return;

//   try {
//     let newMessage;

//     if (selectedFile) {
//       const formData = new FormData();
//       formData.append("file", selectedFile);
//       formData.append("to", selectedStudent._id);

//       const res = await API.post("/teacher/chat/upload", formData);
//       newMessage = res.data;
//       setSelectedFile(null);
//     }

//     if (newMsg.trim()) {
//       const res = await API.post("/teacher/chat/send", {
//         to: selectedStudent._id,
//         text: newMsg,
//       });
//       newMessage = res.data;
//     }

//     if (newMessage) {
//       setMessages((prev) => [...prev, newMessage]);
//     }

//     setNewMsg("");
//   } catch (err) {
//     console.error("Erreur envoi message :", err);
//   }
// };


const handleSend = async () => {
  if (!selectedStudent) {
    showError("Veuillez sélectionner un élève avant d’envoyer un message.");
    return;
  }

  if (!newMsg.trim() && !selectedFile) return;

  try {
    let newMessage;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("to", selectedStudent._id);

      const res = await API.post("/teacher/chat/upload", formData);
      newMessage = res.data;
      setSelectedFile(null);
    }

    if (newMsg.trim()) {
      const res = await API.post("/teacher/chat/send", {
        to: selectedStudent._id,
        text: newMsg,
      });
      newMessage = res.data;
    }

    if (newMessage) {
      setMessages((prev) => [...prev, newMessage]);
    }

    setNewMsg("");
  } catch (err) {
    console.error("Erreur envoi message :", err);
    showError("Une erreur s’est produite lors de l’envoi du message.");
  }
};

const handleRecordAudio = async () => {
  if (!selectedStudent) {
    showError("Veuillez sélectionner un élève avant d’enregistrer un message vocal.");
    return;
  }

  if (isRecording) {
    mediaRecorder.stop();
    setIsRecording(false);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];

    recorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "audio/webm" });

      const formData = new FormData();
      formData.append("file", blob, "audioMessage.webm");
      formData.append("to", selectedStudent._id);

      try {
        const res = await API.post("/teacher/chat/upload", formData);
        setMessages((prev) => [...prev, res.data]);
      } catch (err) {
        console.error("Erreur envoi audio :", err);
        showError("Erreur lors de l’envoi du message vocal.");
      }
    };

    recorder.start();
    setMediaRecorder(recorder);
    setIsRecording(true);
  } catch (err) {
    console.error("Accès micro refusé :", err);
    showError("Accès au micro refusé ou indisponible.");
  }
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


  return (
     <PageLayout>
   <Box p={4} sx={{ position: "relative", overflow: "visible" }}>


      <Typography variant="h5" fontWeight="bold" marginTop={5} gutterBottom>
        💬 Messagerie Enseignant
      </Typography>

    


      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: "70vh", overflowY: "auto", p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Élèves disponibles
            </Typography>
            <List>
              {students.map((student) => (
                <ListItem
                  button
                  key={student._id}
                  selected={selectedStudent?._id === student._id}
                  onClick={() => handleSelectStudent(student)}
                >
                  <ListItemText
                    primary={student.fullName}
                    secondary={
                      <>
                        📍 {student.city} • 🏫 {student.schoolName} <br />
                        🧩 {student.classLevel || "Niveau inconnu"}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ height: "70vh", display: "flex", flexDirection: "column", p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Discussion avec : {selectedStudent?.fullName || "—"}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
              {messages.map((msg, idx) => {
                const fromId = typeof msg.from === "string" ? msg.from : msg.from?._id;
                const isMe = fromId?.toString() === user?._id?.toString();
                const senderName = typeof msg.from === "object" ? msg.from.fullName : "";


  console.log(`🟦 Message #${idx}`);
  console.log("fromId =", fromId);
  console.log("currentUserId =", user?._id);
  console.log("isMe =", isMe);
  console.log("senderName =", senderName);





                return (
                  <Box key={idx} textAlign={isMe ? "right" : "left"} mb={1}>
                 
                    <Typography
                      variant="body2"
                      sx={{
                        display: "inline-block",
                        px: 2,
                        py: 1,
                        backgroundColor: isMe ? "#1976d2" : "#f1f1f1",
                        color: isMe ? "#fff" : "#000",
                        borderRadius: 2,
                        maxWidth: "70%",
                      }}
                    >
                      {/* {msg.text} */}




{msg.text && (
  <span>{msg.text}</span>
)}

{msg.fileUrl && msg.fileType?.startsWith("audio") && (
  <audio controls src={msg.fileUrl} style={{ display: "block", marginTop: 5, width: "100%" }} />
)}

{msg.fileUrl && msg.fileType === "pdf" && (
  <a
    href={msg.fileUrl}
    target="_blank"
    rel="noopener noreferrer"
    style={{ display: "block", marginTop: 5, textDecoration: "underline" }}
  >
    📄 Voir le PDF
  </a>
)}

{msg.fileUrl && msg.fileType === "video" && (
  <video controls src={msg.fileUrl} style={{ display: "block", marginTop: 5, maxWidth: "300px" }} />
)}


{msg.fileUrl && ["pdf", "image", "video"].includes(msg.fileType) && (
  <a
    href={msg.fileUrl}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-block",
      marginTop: 5,
      textDecoration: "underline",
      color: isMe ? "#fff" : "#1976d2",
    }}
  >
    📎 Ouvrir le fichier joint
  </a>
)}

                   </Typography>
                  </Box>
                );
              })}
            </Box>
            <Box display="flex">





{/* 📎 Bouton pièce jointe */}
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



  {/* 🎤 Microphone */}
  <IconButton color={isRecording ? "error" : "primary"} onClick={handleRecordAudio}>
    <MicIcon />
  </IconButton>

{isRecording && (
  <Typography
    variant="caption"
    color="error"
    sx={{ fontStyle: "italic", ml: 1 }}
  >
    Enregistrement en cours...
  </Typography>
)}


              <TextField
                fullWidth
                variant="outlined"
                placeholder="Écrivez un message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
              />




              
              <IconButton color="primary" onClick={handleSend}>
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </Grid>
      </Grid>


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

export default TeacherChatPage;
