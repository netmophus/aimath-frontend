// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardActions,
//   Button,
//   Typography,
//   Box,
//   CardMedia,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import API from "../../api";

// const ExamCardGratuit = ({ exam }) => {
//   const navigate = useNavigate();
//   const isGratuit = exam.badge === "gratuit";

//   const handleOpenSubject = async () => {
//     if (!isGratuit) return navigate("/pricing");

//     try {
//       const res = await API.get(`/ia/gratuit/${exam._id}/subject`);
//       window.open(res.data.subjectUrl, "_blank");
//     } catch (err) {
//       alert(err.response?.data?.message || "Erreur lors de l'ouverture du sujet.");
//     }
//   };

//   const handleOpenCorrection = async () => {
//     if (!isGratuit) return navigate("/pricing");

//     try {
//       const res = await API.get(`/ia/gratuit/${exam._id}/correction`);
//       window.open(res.data.correctionUrl, "_blank");
//     } catch (err) {
//       alert(err.response?.data?.message || "Erreur lors de l'ouverture de la correction.");
//     }
//   };

//   return (
//     <Card elevation={3} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
//       {exam.coverImage && (
//         <CardMedia
//           component="img"
//           height="180"
//           image={exam.coverImage}
//           alt="Miniature"
//         />
//       )}

//       <CardContent sx={{ flexGrow: 1 }}>
//         <Typography variant="h6" fontWeight="bold" gutterBottom>
//           {exam.title}
//         </Typography>
//         <Typography variant="body2" color="text.secondary">
//           Niveau : {exam.level.toUpperCase()}
//         </Typography>
//         <Typography variant="body2" sx={{ mt: 1 }}>
//           {exam.description.length > 400
//             ? exam.description.substring(0, 400) + "..."
//             : exam.description}
//         </Typography>
//         <Box mt={1}>
//           <Typography variant="caption" color="text.secondary">
//             📅 Publié le : {new Date(exam.createdAt).toLocaleDateString("fr-FR")}
//           </Typography>
//           <br />
//           <Typography variant="caption" color="text.secondary">
//             🏷️ Accès :{" "}
//             <span style={{ color: isGratuit ? "green" : "orange", fontWeight: "bold" }}>
//               {isGratuit ? "Gratuit" : "Prenuim"}
//             </span>
//           </Typography>
//           <br />
//   <Typography variant="caption" color="text.secondary">
//     📥 Sujet téléchargé : {exam.subjectDownloadCount} fois
//   </Typography>
//   <br />
//   <Typography variant="caption" color="text.secondary">
//     ✅ Correction téléchargée : {exam.correctionDownloadCount} fois
//   </Typography>
//         </Box>
//       </CardContent>

//       <CardActions sx={{ px: 2 , mb:2}}>
//         <Button variant="contained" size="small" onClick={handleOpenSubject}>
//           📄 Sujet
//         </Button>
//         <Button variant="contained" color="success" size="small" onClick={handleOpenCorrection}>
//           ✅ Correction
//         </Button>
//       </CardActions>
//     </Card>
//   );
// };

// export default ExamCardGratuit;







// components/gratuit/ExamCardGratuit.jsx
import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import { useNavigate } from "react-router-dom";
import API from "../../api";

const SafeText = ({ text = "", max = 300 }) => {
  const t = String(text || "");
  return (
    <Typography variant="body2" sx={{ mt: 1 }}>
      {t.length > max ? `${t.slice(0, max)}…` : t}
    </Typography>
  );
};

const StatRow = ({ icon, children }) => (
  <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "text.secondary" }}>
    {icon}
    <Typography variant="caption">{children}</Typography>
  </Stack>
);

const ExamCardGratuit = ({ exam = {} }) => {
  const navigate = useNavigate();
  const isGratuit = (exam.badge || "").toLowerCase() === "gratuit";
  const levelLabel = (exam.level || "").toUpperCase() || "NIVEAU N/D";
  const createdAt = exam.createdAt ? new Date(exam.createdAt).toLocaleDateString("fr-FR") : "—";
  const subjectCount = exam.subjectDownloadCount ?? 0;
  const correctionCount = exam.correctionDownloadCount ?? 0;

  const imgAlt = useMemo(
    () => exam.title ? `Sujet — ${exam.title}` : "Sujet d'examen",
    [exam.title]
  );

  const openSubject = async () => {
    if (!isGratuit) return navigate("/pricing");
    try {
      const res = await API.get(`/ia/gratuit/${exam._id}/subject`);
      if (res?.data?.subjectUrl) window.open(res.data.subjectUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ouverture du sujet.");
    }
  };

  const openCorrection = async () => {
    if (!isGratuit) return navigate("/pricing");
    try {
      const res = await API.get(`/ia/gratuit/${exam._id}/correction`);
      if (res?.data?.correctionUrl) window.open(res.data.correctionUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'ouverture de la correction.");
    }
  };

  return (
    <Card
      elevation={4}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "240px 1fr" },
        gap: 0,
        borderRadius: 3,
        overflow: "hidden",
        height: "100%",
      }}
    >
      {/* Colonne image (gauche) */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "#0b1220",
          minHeight: { xs: 180, sm: "100%" },
          display: "grid",
          placeItems: "center",
        }}
      >
        {exam.coverImage ? (
          <img
            src={exam.coverImage}
            alt={imgAlt}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box sx={{ color: "#cbd5e1", textAlign: "center", p: 2 }}>
            <ImageNotSupportedRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="caption">Aucune miniature</Typography>
          </Box>
        )}

        {/* Ruban Premium */}
        {!isGratuit && (
          <Box
            sx={{
              position: "absolute",
              top: 12,
              left: -40,
              transform: "rotate(-35deg)",
              bgcolor: "#ffb300",
              color: "#000",
              px: 6,
              py: 0.5,
              fontWeight: 800,
              boxShadow: 2,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Premium
          </Box>
        )}

        {/* Verrou si Premium */}
        {!isGratuit && (
          <Tooltip title="Réservé aux membres Premium">
            <Box
              sx={{
                position: "absolute",
                right: 12,
                bottom: 12,
                width: 44,
                height: 44,
                borderRadius: "50%",
                bgcolor: "rgba(0,0,0,0.55)",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                backdropFilter: "blur(2px)",
              }}
            >
              <LockRoundedIcon />
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* Colonne contenu (droite) */}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ flex: 1 }}>
          <Stack
            direction="row"
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ pr: 1, lineHeight: 1.2 }}
            >
              {exam.title || "Sujet d'examen"}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
              <Chip
                size="small"
                label={isGratuit ? "Gratuit" : "Premium"}
                color={isGratuit ? "success" : "warning"}
                variant={isGratuit ? "filled" : "outlined"}
              />
              <Chip size="small" variant="outlined" label={levelLabel} />
            </Stack>
          </Stack>

          <SafeText text={exam.description} max={320} />

          <Divider sx={{ my: 1.5 }} />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1, md: 3 }}
            useFlexGap
            flexWrap="wrap"
            sx={{ mb: 0.5 }}
          >
            <StatRow icon={<CalendarMonthIcon fontSize="small" />}>
              Publié le : {createdAt}
            </StatRow>

            <StatRow icon={<GetAppRoundedIcon fontSize="small" />}>
              Sujet téléchargé : {subjectCount} fois
            </StatRow>

            <StatRow icon={<GetAppRoundedIcon fontSize="small" />}>
              Correction téléchargée : {correctionCount} fois
            </StatRow>
          </Stack>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<DescriptionOutlinedIcon />}
            onClick={openSubject}
            disabled={!isGratuit}
            sx={{ textTransform: "none" }}
          >
            Sujet
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CheckCircleOutlineIcon />}
            onClick={openCorrection}
            disabled={!isGratuit}
            sx={{ textTransform: "none" }}
          >
            Correction
          </Button>

          {!isGratuit && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => navigate("/pricing")}
              sx={{ ml: "auto", textTransform: "none" }}
            >
              Débloquer l’accès
            </Button>
          )}
        </CardActions>
      </Box>
    </Card>
  );
};

export default ExamCardGratuit;
