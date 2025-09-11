




// // components/gratuit/ExamCardGratuit.jsx
// import React, { useMemo, useCallback, useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardActions,
//   Typography,
//   Box,
//   Button,
//   Chip,
//   Stack,
//   Divider,
//   Tooltip,
//   IconButton,
// } from "@mui/material";
// import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
// import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
// import LockRoundedIcon from "@mui/icons-material/LockRounded";
// import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
// import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
// import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
// import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
// import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
// import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
// import { useNavigate } from "react-router-dom";
// import API from "../../api";

// /* ---------------- utils ---------------- */
// const SafeText = ({ text = "", max = 300 }) => {
//   const t = String(text || "");
//   return (
//     <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
//       {t.length > max ? `${t.slice(0, max)}…` : t}
//     </Typography>
//   );
// };

// const StatRow = ({ icon, children }) => (
//   <Stack
//     direction="row"
//     alignItems="center"
//     spacing={1}
//     sx={{ color: "text.secondary" }}
//   >
//     {icon}
//     <Typography variant="caption">{children}</Typography>
//   </Stack>
// );

// const pluralize = (n, one, many) => `${n} ${n > 1 ? many : one}`;
// const fmtLevel = (x) =>
//   (String(x || "").trim().toUpperCase() || "NIVEAU N/D");

// const ExamCardGratuit = ({ exam = {} }) => {
//   const navigate = useNavigate();
//   const [copied, setCopied] = useState(false);

//   const isGratuit = useMemo(
//     () => String(exam?.badge || "").toLowerCase() === "gratuit",
//     [exam?.badge]
//   );
//   const levelLabel = fmtLevel(exam?.level);
//   const createdAt = exam?.createdAt
//     ? new Date(exam.createdAt).toLocaleDateString("fr-FR")
//     : "—";
//   const subjectCount = exam?.subjectDownloadCount ?? 0;
//   const correctionCount = exam?.correctionDownloadCount ?? 0;

//   const imgAlt = useMemo(
//     () => (exam?.title ? `Sujet — ${exam.title}` : "Sujet d'examen"),
//     [exam?.title]
//   );

//   const openSubject = useCallback(async () => {
//     if (!isGratuit) return navigate("/pricing");
//     try {
//       const res = await API.get(`/ia/gratuit/${exam._id}/subject`);
//       if (res?.data?.subjectUrl) {
//         window.open(res.data.subjectUrl, "_blank", "noopener,noreferrer");
//       }
//     } catch (err) {
//       alert(
//         err?.response?.data?.message || "Erreur lors de l'ouverture du sujet."
//       );
//     }
//   }, [isGratuit, exam?._id, navigate]);

//   const openCorrection = useCallback(async () => {
//     if (!isGratuit) return navigate("/pricing");
//     try {
//       const res = await API.get(`/ia/gratuit/${exam._id}/correction`);
//       if (res?.data?.correctionUrl) {
//         window.open(res.data.correctionUrl, "_blank", "noopener,noreferrer");
//       }
//     } catch (err) {
//       alert(
//         err?.response?.data?.message ||
//           "Erreur lors de l'ouverture de la correction."
//       );
//     }
//   }, [isGratuit, exam?._id, navigate]);

//   const shareLink = useCallback(async () => {
//     // On essaie d'utiliser directement une des URLs s'il y en a une dans l'objet (sinon fallback page courante)
//     const directUrl =
//       exam?.subjectUrl || exam?.correctionUrl || window.location.href;
//     try {
//       if (navigator.share) {
//         await navigator.share({
//           title: exam?.title || "Sujet d'examen",
//           url: directUrl,
//         });
//       } else {
//         await navigator.clipboard.writeText(directUrl);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 1300);
//       }
//     } catch (_) {
//       // ignore
//     }
//   }, [exam]);

//   return (
//     <Card
//       elevation={6}
//       sx={{
//         display: "grid",
//         gridTemplateColumns: { xs: "1fr", sm: "260px 1fr" },
//         gap: 0,
//         borderRadius: 3,
//         overflow: "hidden",
//         height: "100%",
//         background:
//           "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.98))",
//         backdropFilter: "blur(6px)",
//         border: "1px solid rgba(0,0,0,0.05)",
//         boxShadow:
//           "0 10px 30px rgba(2,16,40,0.10), 0 2px 6px rgba(2,16,40,0.06)",
//         transition: "transform 220ms ease, box-shadow 220ms ease",
//         "&:hover": {
//           transform: "translateY(-2px)",
//           boxShadow:
//             "0 16px 40px rgba(2,16,40,0.16), 0 4px 12px rgba(2,16,40,0.10)",
//         },
//       }}
//     >
//       {/* Colonne image (gauche) */}
//       <Box
//         sx={{
//           position: "relative",
//           bgcolor: "#0b1220",
//           minHeight: { xs: 180, sm: "100%" },
//           display: "grid",
//           placeItems: "center",
//         }}
//       >
//         {exam?.coverImage ? (
//           <img
//             src={exam.coverImage}
//             alt={imgAlt}
//             loading="lazy"
//             style={{ width: "100%", height: "100%", objectFit: "cover" }}
//           />
//         ) : (
//           <Box
//             sx={{
//               color: "#cbd5e1",
//               textAlign: "center",
//               p: 2,
//               width: "100%",
//               height: "100%",
//               display: "grid",
//               placeItems: "center",
//             }}
//           >
//             <ImageNotSupportedRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
//             <Typography variant="caption">Aucune miniature</Typography>
//           </Box>
//         )}

//         {/* Ruban Premium */}
//         {!isGratuit && (
//           <Box
//             sx={{
//               position: "absolute",
//               top: 12,
//               left: -40,
//               transform: "rotate(-35deg)",
//               bgcolor: "#FDC830",
//               color: "#000",
//               px: 6,
//               py: 0.5,
//               fontWeight: 900,
//               boxShadow: 2,
//               textTransform: "uppercase",
//               letterSpacing: 0.5,
//             }}
//           >
//             Premium
//           </Box>
//         )}

//         {/* Overlay d’actions (Sujet/Correction) */}
//         <Box
//           role="button"
//           aria-label={isGratuit ? "Ouvrir le sujet" : "Contenu premium"}
//           tabIndex={0}
//           onKeyDown={(e) => {
//             if (e.key === "Enter" || e.key === " ") {
//               isGratuit ? openSubject() : navigate("/pricing");
//             }
//           }}
//           sx={{
//             position: "absolute",
//             inset: 0,
//             display: "flex",
//             alignItems: "flex-end",
//             justifyContent: "space-between",
//             p: 1.5,
//             background:
//               "linear-gradient(180deg, rgba(0,0,0,0.00) 40%, rgba(0,0,0,0.45) 100%)",
//           }}
//         >
//           {/* Verrou coin si Premium */}
//           {!isGratuit && (
//             <Tooltip title="Réservé aux membres Premium">
//               <Box
//                 sx={{
//                   position: "absolute",
//                   right: 12,
//                   top: 12,
//                   width: 44,
//                   height: 44,
//                   borderRadius: "50%",
//                   bgcolor: "rgba(0,0,0,0.55)",
//                   display: "grid",
//                   placeItems: "center",
//                   color: "#fff",
//                   backdropFilter: "blur(2px)",
//                 }}
//               >
//                 <LockRoundedIcon />
//               </Box>
//             </Tooltip>
//           )}

//           <Stack direction="row" spacing={1}>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<DescriptionOutlinedIcon />}
//               onClick={isGratuit ? openSubject : () => navigate("/pricing")}
//               sx={{
//                 textTransform: "none",
//                 bgcolor: isGratuit ? "primary.main" : "grey.700",
//               }}
//             >
//               Sujet
//             </Button>
//             <Button
//               variant="contained"
//               size="small"
//               startIcon={<CheckCircleOutlineIcon />}
//               onClick={isGratuit ? openCorrection : () => navigate("/pricing")}
//               sx={{
//                 textTransform: "none",
//                 bgcolor: isGratuit ? "success.main" : "grey.700",
//               }}
//             >
//               Correction
//             </Button>
//           </Stack>
//         </Box>
//       </Box>

//       {/* Colonne contenu (droite) */}
//       <Box sx={{ display: "flex", flexDirection: "column" }}>
//         <CardContent sx={{ flex: 1 }}>
//           {/* Titre + chips */}
//           <Stack
//             direction="row"
//             alignItems={{ xs: "flex-start", sm: "center" }}
//             justifyContent="space-between"
//             spacing={1}
//             sx={{ mb: 1 }}
//           >
//             <Typography
//               variant="h6"
//               fontWeight="bold"
//               sx={{ pr: 1, lineHeight: 1.2 }}
//             >
//               {exam?.title || "Sujet d'examen"}
//             </Typography>

//             <Stack direction="row" spacing={1} sx={{ minWidth: 0, flexWrap: "wrap" }}>
//               <Chip
//                 size="small"
//                 label={isGratuit ? "Gratuit" : "Premium"}
//                 color={isGratuit ? "success" : "warning"}
//                 variant={isGratuit ? "filled" : "outlined"}
//               />
//               <Chip size="small" variant="outlined" label={levelLabel} />
//             </Stack>
//           </Stack>

//           {/* Tags/infos rapides */}
//           <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 0.5 }}>
//             {exam?.matiere && (
//               <Chip size="small" variant="outlined" label={exam.matiere} />
//             )}
//             {exam?.classe && (
//               <Chip size="small" variant="outlined" label={exam.classe} />
//             )}
//             {exam?.session && (
//               <Chip
//                 size="small"
//                 variant="outlined"
//                 icon={<LocalOfferRoundedIcon sx={{ fontSize: 16 }} />}
//                 label={exam.session}
//               />
//             )}
//             {Array.isArray(exam?.tags) &&
//               exam.tags.slice(0, 2).map((t, i) => (
//                 <Chip key={i} size="small" variant="outlined" label={`#${t}`} />
//               ))}
//           </Stack>

//           <SafeText text={exam?.description} max={320} />

//           <Divider sx={{ my: 1.5 }} />

//           {/* Statistiques */}
//           <Stack
//             direction={{ xs: "column", md: "row" }}
//             spacing={{ xs: 1, md: 3 }}
//             useFlexGap
//             flexWrap="wrap"
//             sx={{ mb: 0.5 }}
//           >
//             <StatRow icon={<CalendarMonthIcon fontSize="small" />}>
//               Publié le : {createdAt}
//             </StatRow>

//             <StatRow icon={<GetAppRoundedIcon fontSize="small" />}>
//               {pluralize(subjectCount, "téléchargement du sujet", "téléchargements du sujet")}
//             </StatRow>

//             <StatRow icon={<GetAppRoundedIcon fontSize="small" />}>
//               {pluralize(correctionCount, "téléchargement de la correction", "téléchargements de la correction")}
//             </StatRow>
//           </Stack>
//         </CardContent>

//         {/* Barre d’actions bas */}
//         <CardActions
//           sx={{
//             px: 2,
//             py: 1.5,
//             bgcolor: "rgba(0,0,0,0.02)",
//             borderTop: "1px solid rgba(0,0,0,0.06)",
//             display: "flex",
//             gap: 1,
//           }}
//         >
//           <Button
//             variant="contained"
//             size="small"
//             startIcon={<DescriptionOutlinedIcon />}
//             onClick={openSubject}
//             disabled={!isGratuit}
//             sx={{ textTransform: "none" }}
//           >
//             Sujet
//           </Button>
//           <Button
//             variant="contained"
//             color="success"
//             size="small"
//             startIcon={<CheckCircleOutlineIcon />}
//             onClick={openCorrection}
//             disabled={!isGratuit}
//             sx={{ textTransform: "none" }}
//           >
//             Correction
//           </Button>

//           {!isGratuit && (
//             <Button
//               variant="outlined"
//               size="small"
//               onClick={() => navigate("/pricing")}
//               sx={{ ml: "auto", textTransform: "none" }}
//             >
//               Débloquer l’accès
//             </Button>
//           )}

//           {/* Actions rapides à droite */}
//           <Box sx={{ ml: "auto" }} />

//           <Tooltip title="Ouvrir la page de l'examen (si disponible)">
//             <span>
//               <IconButton
//                 size="small"
//                 onClick={() => {
//                   if (exam?.sourceUrl) {
//                     window.open(exam.sourceUrl, "_blank", "noopener,noreferrer");
//                   }
//                 }}
//                 disabled={!exam?.sourceUrl}
//               >
//                 <OpenInNewRoundedIcon fontSize="small" />
//               </IconButton>
//             </span>
//           </Tooltip>

//           <Tooltip title={copied ? "Lien copié !" : "Partager / Copier le lien"}>
//             <span>
//               <IconButton size="small" onClick={shareLink}>
//                 <ShareRoundedIcon fontSize="small" />
//               </IconButton>
//             </span>
//           </Tooltip>
//         </CardActions>
//       </Box>
//     </Card>
//   );
// };

// export default ExamCardGratuit;





// components/gratuit/ExamCardGratuit.jsx
import React, { useMemo, useCallback, useState } from "react";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GetAppRoundedIcon from "@mui/icons-material/GetAppRounded";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
// import { useNavigate } from "react-router-dom";
import API from "../../api";

/* ---------------- utils ---------------- */
const PLAY_STORE_URL = "https://play.google.com/store/search?q=Fahimta&c=apps";

const SafeText = ({ text = "", max = 300 }) => {
  const t = String(text || "");
  return (
    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
      {t.length > max ? `${t.slice(0, max)}…` : t}
    </Typography>
  );
};

const StatRow = ({ icon, children }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={1}
    sx={{ color: "text.secondary" }}
  >
    {icon}
    <Typography variant="caption">{children}</Typography>
  </Stack>
);

const pluralize = (n, one, many) => `${n} ${n > 1 ? many : one}`;
const fmtLevel = (x) =>
  (String(x || "").trim().toUpperCase() || "NIVEAU N/D");

const ExamCardGratuit = ({ exam = {} }) => {
  // const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [openPricing, setOpenPricing] = useState(false);
  const openPricingModal = () => setOpenPricing(true);
  const closePricingModal = () => setOpenPricing(false);

  const isGratuit = useMemo(
    () => String(exam?.badge || "").toLowerCase() === "gratuit",
    [exam?.badge]
  );
  const levelLabel = fmtLevel(exam?.level);
  const createdAt = exam?.createdAt
    ? new Date(exam.createdAt).toLocaleDateString("fr-FR")
    : "—";
  const subjectCount = exam?.subjectDownloadCount ?? 0;
  const correctionCount = exam?.correctionDownloadCount ?? 0;

  const imgAlt = useMemo(
    () => (exam?.title ? `Sujet — ${exam.title}` : "Sujet d'examen"),
    [exam?.title]
  );

  const openSubject = useCallback(async () => {
    if (!isGratuit) {
      openPricingModal();
      return;
    }
    try {
      const res = await API.get(`/ia/gratuit/${exam._id}/subject`);
      if (res?.data?.subjectUrl) {
        window.open(res.data.subjectUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      alert(
        err?.response?.data?.message || "Erreur lors de l'ouverture du sujet."
      );
    }
  }, [isGratuit, exam?._id]);

  const openCorrection = useCallback(async () => {
    if (!isGratuit) {
      openPricingModal();
      return;
    }
    try {
      const res = await API.get(`/ia/gratuit/${exam._id}/correction`);
      if (res?.data?.correctionUrl) {
        window.open(res.data.correctionUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Erreur lors de l'ouverture de la correction."
      );
    }
  }, [isGratuit, exam?._id]);

  const shareLink = useCallback(async () => {
    const directUrl =
      exam?.subjectUrl || exam?.correctionUrl || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: exam?.title || "Sujet d'examen",
          url: directUrl,
        });
      } else {
        await navigator.clipboard.writeText(directUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1300);
      }
    } catch {
      /* ignore */
    }
  }, [exam]);

  return (
    <>
      {/* Modal “Souscription via l’app mobile” */}
      <Dialog open={openPricing} onClose={closePricingModal} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Souscription</DialogTitle>
        <DialogContent dividers>
          <Typography>
            Connectez-vous à votre <strong>application mobile Fahimta</strong> pour vous
            souscrire à votre abonnement.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            L’application mobile Fahimta est <strong>téléchargeable sur le Play Store</strong>.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closePricingModal}>Fermer</Button>
          <Button
            variant="contained"
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener"
            onClick={closePricingModal}
          >
            Ouvrir le Play Store
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        elevation={6}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "260px 1fr" },
          gap: 0,
          borderRadius: 3,
          overflow: "hidden",
          height: "100%",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.98))",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow:
            "0 10px 30px rgba(2,16,40,0.10), 0 2px 6px rgba(2,16,40,0.06)",
          transition: "transform 220ms ease, box-shadow 220ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              "0 16px 40px rgba(2,16,40,0.16), 0 4px 12px rgba(2,16,40,0.10)",
          },
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
          {exam?.coverImage ? (
            <img
              src={exam.coverImage}
              alt={imgAlt}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Box
              sx={{
                color: "#cbd5e1",
                textAlign: "center",
                p: 2,
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
              }}
            >
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
                bgcolor: "#FDC830",
                color: "#000",
                px: 6,
                py: 0.5,
                fontWeight: 900,
                boxShadow: 2,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Premium
            </Box>
          )}

          {/* Overlay d’actions (Sujet/Correction) */}
          <Box
            role="button"
            aria-label={isGratuit ? "Ouvrir le sujet" : "Contenu premium"}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                isGratuit ? openSubject() : openPricingModal();
              }
            }}
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              p: 1.5,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.00) 40%, rgba(0,0,0,0.45) 100%)",
            }}
          >
            {/* Verrou coin si Premium */}
            {!isGratuit && (
              <Tooltip title="Réservé aux membres Premium">
                <Box
                  sx={{
                    position: "absolute",
                    right: 12,
                    top: 12,
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

            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<DescriptionOutlinedIcon />}
                onClick={isGratuit ? openSubject : openPricingModal}
                sx={{
                  textTransform: "none",
                  bgcolor: isGratuit ? "primary.main" : "grey.700",
                }}
              >
                Sujet
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<CheckCircleOutlineIcon />}
                onClick={isGratuit ? openCorrection : openPricingModal}
                sx={{
                  textTransform: "none",
                  bgcolor: isGratuit ? "success.main" : "grey.700",
                }}
              >
                Correction
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Colonne contenu (droite) */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <CardContent sx={{ flex: 1 }}>
            {/* Titre + chips */}
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
                {exam?.title || "Sujet d'examen"}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ minWidth: 0, flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  label={isGratuit ? "Gratuit" : "Premium"}
                  color={isGratuit ? "success" : "warning"}
                  variant={isGratuit ? "filled" : "outlined"}
                />
                <Chip size="small" variant="outlined" label={levelLabel} />
              </Stack>
            </Stack>

            {/* Tags/infos rapides */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 0.5 }}>
              {exam?.matiere && (
                <Chip size="small" variant="outlined" label={exam.matiere} />
              )}
              {exam?.classe && (
                <Chip size="small" variant="outlined" label={exam.classe} />
              )}
              {exam?.session && (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<LocalOfferRoundedIcon sx={{ fontSize: 16 }} />}
                  label={exam.session}
                />
              )}
              {Array.isArray(exam?.tags) &&
                exam.tags.slice(0, 2).map((t, i) => (
                  <Chip key={i} size="small" variant="outlined" label={`#${t}`} />
                ))}
            </Stack>

            <SafeText text={exam?.description} max={320} />

            <Divider sx={{ my: 1.5 }} />

            {/* Statistiques */}
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
                {pluralize(subjectCount, "téléchargement du sujet", "téléchargements du sujet")}
              </StatRow>

              <StatRow icon={<GetAppRoundedIcon fontSize="small" />}>
                {pluralize(correctionCount, "téléchargement de la correction", "téléchargements de la correction")}
              </StatRow>
            </Stack>
          </CardContent>

          {/* Barre d’actions bas */}
          <CardActions
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "rgba(0,0,0,0.02)",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              display: "flex",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<DescriptionOutlinedIcon />}
              onClick={openSubject} // plus de disabled : ouvre la modale si premium
              sx={{ textTransform: "none" }}
            >
              Sujet
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<CheckCircleOutlineIcon />}
              onClick={openCorrection} // idem
              sx={{ textTransform: "none" }}
            >
              Correction
            </Button>

            {!isGratuit && (
              <Button
                variant="outlined"
                size="small"
                onClick={openPricingModal}
                sx={{ ml: "auto", textTransform: "none" }}
              >
                Débloquer l’accès
              </Button>
            )}

            {/* Actions rapides à droite */}
            <Box sx={{ ml: "auto" }} />

            <Tooltip title="Ouvrir la page de l'examen (si disponible)">
              <span>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (exam?.sourceUrl) {
                      window.open(exam.sourceUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  disabled={!exam?.sourceUrl}
                >
                  <OpenInNewRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={copied ? "Lien copié !" : "Partager / Copier le lien"}>
              <span>
                <IconButton size="small" onClick={shareLink}>
                  <ShareRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </CardActions>
        </Box>
      </Card>
    </>
  );
};

export default ExamCardGratuit;
