import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const ExamCard = ({ exam, isPremiumUser = false }) => {
  const navigate = useNavigate();


const handleOpenSubject = async () => {
  if (!isPremiumUser) return navigate("/pricing");

  try {
    const res = await API.get(`/premium/exams/${exam._id}/download-subject`);
    window.open(res.data.subjectUrl, "_blank");
  } catch (err) {
    alert(err.response?.data?.message || "Erreur lors de l'ouverture du sujet.");
  }
};



const handleOpenCorrection = async () => {
  if (!isPremiumUser) return navigate("/pricing");

  try {
    const res = await API.get(`/premium/exams/${exam._id}/download-correction`);
    window.open(res.data.correctionUrl, "_blank");
  } catch (err) {
    alert(err.response?.data?.message || "Erreur lors de l'ouverture de la correction.");
  }
};



  return (
    <Card
      elevation={3}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          {exam.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Niveau : {exam.level?.toUpperCase()}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {exam.description?.substring(0, 300)}...
        </Typography>

        <Box mt={2}>
          <Typography variant="caption" color="text.secondary" display="block">
            📄 Téléchargements sujet : {exam.subjectDownloadCount || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ✅ Téléchargements correction : {exam.correctionDownloadCount || 0}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2 }}>
        <Button variant="outlined" size="small" onClick={handleOpenSubject}>
          📄 Sujet
        </Button>
        <Button
          variant="contained"
          color="success"
          size="small"
          onClick={handleOpenCorrection}
        >
          ✅ Correction
        </Button>
      </CardActions>
    </Card>
  );
};

export default ExamCard;
