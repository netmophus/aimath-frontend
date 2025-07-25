import React, { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Link,
} from "@mui/material";
import API from "../../api";
import { AuthContext } from "../../context/AuthContext";
import PageLayout from "../../components/PageLayout";

const StudentChatHistory = () => {
  const [searchParams] = useSearchParams();
  const teacherId = searchParams.get("teacher");
  const studentId = searchParams.get("student");
const requestId = searchParams.get("request"); // 👈 AJOUTE CECI
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await API.get(
  `/student/messages/history?teacher=${teacherId}&student=${studentId}&request=${requestId || "null"}`
);

      setMessages(res.data);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des messages :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId && studentId && user) {
      fetchMessages();
    }
  }, [teacherId, studentId, user]);

  const renderAttachment = (msg) => {
    if (!msg.fileUrl) return null;

    switch (msg.fileType) {
      case "image":
        return (
          <Box mt={1}>
            <img
              src={msg.fileUrl}
              alt="Image"
              style={{ maxWidth: "100%", borderRadius: 8 }}
            />
          </Box>
        );
      case "video":
        return (
          <Box mt={1}>
            <video controls style={{ maxWidth: "100%" }}>
              <source src={msg.fileUrl} />
              Votre navigateur ne supporte pas la vidéo.
            </video>
          </Box>
        );
      case "pdf":
        return (
          <Box mt={1}>
            <Link href={msg.fileUrl} target="_blank" rel="noopener">
              📄 Voir le PDF
            </Link>
          </Box>
        );
      case "audio":
        return (
          <Box mt={1}>
            <audio controls>
              <source src={msg.fileUrl} />
              Votre navigateur ne supporte pas l’audio.
            </audio>
          </Box>
        );
      default:
        return (
          <Box mt={1}>
            <Link href={msg.fileUrl} target="_blank" rel="noopener">
              📎 Fichier joint
            </Link>
          </Box>
        );
    }
  };

  return (
     <PageLayout>
    <Paper sx={{ p: 3, mt: 9 }}>
      <Typography variant="h6" gutterBottom>
        🕘 Historique du chat
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {loading ? (
        <CircularProgress />
      ) : messages.length === 0 ? (
        <Typography>Aucun message échangé.</Typography>
      ) : (
        <Box sx={{ maxHeight: "500px", overflowY: "auto" }}>
          {messages.map((msg) => (
            <Box
              key={msg._id}
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: msg.from === user._id ? "primary.light" : "grey.200",
                alignSelf: msg.from === user._id ? "flex-end" : "flex-start",
                maxWidth: "70%",
              }}
            >
              <Typography variant="body2">{msg.text}</Typography>
              {renderAttachment(msg)}
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 1, textAlign: "right" }}
              >
                {new Date(msg.createdAt).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
        💬 Ce chat est terminé. Vous ne pouvez plus envoyer de messages.
      </Typography>
    </Paper>
    </PageLayout>
  );
};

export default StudentChatHistory;
