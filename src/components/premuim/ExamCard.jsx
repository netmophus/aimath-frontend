// import React from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   CardActions,
//   Button,
//   Box,
// } from "@mui/material";
// import API from "../../api";
// import { useNavigate } from "react-router-dom";

// const ExamCard = ({ exam, isPremiumUser = false }) => {
//   const navigate = useNavigate();


// const handleOpenSubject = async () => {
//   if (!isPremiumUser) return navigate("/pricing");

//   try {
//     const res = await API.get(`/premium/exams/${exam._id}/download-subject`);
//     window.open(res.data.subjectUrl, "_blank");
//   } catch (err) {
//     alert(err.response?.data?.message || "Erreur lors de l'ouverture du sujet.");
//   }
// };



// const handleOpenCorrection = async () => {
//   if (!isPremiumUser) return navigate("/pricing");

//   try {
//     const res = await API.get(`/premium/exams/${exam._id}/download-correction`);
//     window.open(res.data.correctionUrl, "_blank");
//   } catch (err) {
//     alert(err.response?.data?.message || "Erreur lors de l'ouverture de la correction.");
//   }
// };



//   return (
//     <Card
//       elevation={3}
//       sx={{ height: "100%", display: "flex", flexDirection: "column" }}
//     >
//       <CardContent sx={{ flexGrow: 1 }}>
//         <Typography variant="h6" fontWeight="bold">
//           {exam.title}
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Niveau : {exam.level?.toUpperCase()}
//         </Typography>
//         <Typography variant="body2" sx={{ mt: 1 }}>
//           {exam.description?.substring(0, 300)}...
//         </Typography>

//         <Box mt={2}>
//           <Typography variant="caption" color="text.secondary" display="block">
//             📄 Téléchargements sujet : {exam.subjectDownloadCount || 0}
//           </Typography>
//           <Typography variant="caption" color="text.secondary" display="block">
//             ✅ Téléchargements correction : {exam.correctionDownloadCount || 0}
//           </Typography>
//         </Box>
//       </CardContent>

//       <CardActions sx={{ px: 2, pb: 2 }}>
//         <Button variant="outlined" size="small" onClick={handleOpenSubject}>
//           📄 Sujet
//         </Button>
//         <Button
//           variant="contained"
//           color="success"
//           size="small"
//           onClick={handleOpenCorrection}
//         >
//           ✅ Correction
//         </Button>
//       </CardActions>
//     </Card>
//   );
// };

// export default ExamCard;




// components/premuim/ExamCard.jsx
import React, { useMemo } from "react";
import {
  Card, CardContent, Typography, Button, Box, Chip, Stack, Divider,
} from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const ExamCard = ({ exam, isPremiumUser = false }) => {
  const navigate = useNavigate();

  const levelLabel = useMemo(
    () => (exam?.level ? String(exam.level).toUpperCase() : "NIVEAU N/D"),
    [exam?.level]
  );

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
      elevation={4}
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // 🧩 image gauche / texte droite en md+
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      {/* ---- Media (gauche) ---- */}
      <Box
        sx={{
          position: "relative",
          flex: { xs: "1 1 auto", md: "1 1 45%" },  // ~45%
          minHeight: 220,
          bgcolor: "#0b1220",
        }}
      >
        {exam?.coverImage ? (
          <img
            src={exam.coverImage}
            alt={exam?.title || "Examen"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <Box
            sx={{
              position: "absolute", inset: 0, display: "grid", placeItems: "center",
              color: "#cbd5e1", gap: 1
            }}
          >
            <DescriptionRoundedIcon sx={{ fontSize: 56 }} />
            <Typography variant="caption">Aucune image</Typography>
          </Box>
        )}

        {/* Overlay si non Premium */}
        {!isPremiumUser && (
          <Box
            onClick={() => navigate("/pricing")}
            sx={{
              position: "absolute", inset: 0,
              bgcolor: "rgba(0,0,0,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "background 200ms",
              "&:hover": { bgcolor: "rgba(0,0,0,0.48)" },
            }}
          >
            <Box
              sx={{
                px: 2.5, py: 1.2, borderRadius: 2, bgcolor: "#1565C0",
                color: "#fff", boxShadow: 3, display: "flex", alignItems: "center", gap: 1
              }}
            >
              <LockRoundedIcon sx={{ fontSize: 20 }} />
              <Typography fontWeight={800}>Accès Premium</Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ---- Contenu (droite) ---- */}
      <CardContent
        sx={{
          flex: { xs: "1 1 auto", md: "1 1 55%" },   // ~55%
          display: "flex", flexDirection: "column", gap: 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {exam?.title || "Sans titre"}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <Chip
            size="small"
            label="Premium"
            color="warning"
            variant="filled"
            icon={<VerifiedRoundedIcon />}
          />
          <Chip size="small" label={levelLabel} variant="outlined" />
        </Stack>

        {!!exam?.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {exam.description.length > 300
              ? `${exam.description.slice(0, 300)}…`
              : exam.description}
          </Typography>
        )}

        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            📄 Téléchargements sujet : {exam?.subjectDownloadCount || 0}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            ✅ Téléchargements correction : {exam?.correctionDownloadCount || 0}
          </Typography>
          {!!exam?.createdAt && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              📅 Publié le : {new Date(exam.createdAt).toLocaleDateString("fr-FR")}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Actions */}
        {isPremiumUser ? (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" size="small" onClick={handleOpenSubject}>
              📄 Sujet
            </Button>
            <Button variant="contained" color="success" size="small" onClick={handleOpenCorrection}>
              ✅ Correction
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            onClick={() => navigate("/pricing")}
            sx={{ alignSelf: "flex-start", fontWeight: 800 }}
          >
            Débloquer l’accès
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamCard;
