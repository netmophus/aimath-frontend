import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  CardMedia,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const ExamCardGratuit = ({ exam }) => {
  const navigate = useNavigate();
  const isGratuit = exam.badge === "gratuit";

  const handleOpenSubject = async () => {
    if (!isGratuit) return navigate("/pricing");

    try {
      const res = await API.get(`/ia/gratuit/${exam._id}/subject`);
      window.open(res.data.subjectUrl, "_blank");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ouverture du sujet.");
    }
  };

  const handleOpenCorrection = async () => {
    if (!isGratuit) return navigate("/pricing");

    try {
      const res = await API.get(`/ia/gratuit/${exam._id}/correction`);
      window.open(res.data.correctionUrl, "_blank");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ouverture de la correction.");
    }
  };

  return (
    <Card elevation={3} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {exam.coverImage && (
        <CardMedia
          component="img"
          height="180"
          image={exam.coverImage}
          alt="Miniature"
        />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {exam.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Niveau : {exam.level.toUpperCase()}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {exam.description.length > 400
            ? exam.description.substring(0, 400) + "..."
            : exam.description}
        </Typography>
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            📅 Publié le : {new Date(exam.createdAt).toLocaleDateString("fr-FR")}
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            🏷️ Accès :{" "}
            <span style={{ color: isGratuit ? "green" : "orange", fontWeight: "bold" }}>
              {isGratuit ? "Gratuit" : "Prenuim"}
            </span>
          </Typography>
          <br />
  <Typography variant="caption" color="text.secondary">
    📥 Sujet téléchargé : {exam.subjectDownloadCount} fois
  </Typography>
  <br />
  <Typography variant="caption" color="text.secondary">
    ✅ Correction téléchargée : {exam.correctionDownloadCount} fois
  </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2 , mb:2}}>
        <Button variant="contained" size="small" onClick={handleOpenSubject}>
          📄 Sujet
        </Button>
        <Button variant="contained" color="success" size="small" onClick={handleOpenCorrection}>
          ✅ Correction
        </Button>
      </CardActions>
    </Card>
  );
};

export default ExamCardGratuit;
