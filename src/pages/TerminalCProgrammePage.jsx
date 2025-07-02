



// import React, { useEffect, useState } from "react";
// import {
//   Typography,
//   Box,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   List,
//   ListItem,
//   ListItemText,
//   Chip,
//   Divider,
//   CircularProgress,
//   Button,
//   Dialog,
//   Card,
//   CardActions,
//   CardContent,
//   Grid,
//   DialogTitle,
//   DialogContent,
// } from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import PageLayout from "../components/PageLayout";
// import API from "../api";
// import { marked } from "marked";
// import { useNavigate } from "react-router-dom";
// import programmeTerminalC from "../data/terminalCProgrammeData";

// const TerminalCProgrammePage = () => {
//   const [programme, setProgramme] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [aiResponse, setAiResponse] = useState("");
//   const [open, setOpen] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchProgramme = async () => {
//       try {
//         const res = await API.get("/programmes/terminal-c");
//         setProgramme(res.data);
//       } catch (error) {
//         console.error("Erreur lors du chargement du programme:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProgramme();
//   }, []);

//   const handleAskAI = async (chapitre) => {
//     const titre = chapitre.titre;
//     const objectif = chapitre.objectifs?.[0] || "";
//     const prompt = `Explique un exercice typique du chapitre : "${titre}". Objectif : ${objectif}. Donne un exemple clair avec explication.`;

//     try {
//       const res = await API.post("/ia/gratuit", { input: prompt });
//       setAiResponse(res.data.response);
//       setOpen(true);
//     } catch (error) {
//       setAiResponse("❌ Erreur IA. Veuillez réessayer.");
//       setOpen(true);
//     }
//   };

//   if (loading) {
//     return (
//       <PageLayout>
//         <Box mt={4} textAlign="center">
//           <CircularProgress />
//           <Typography mt={2}>Chargement du programme...</Typography>
//         </Box>
//       </PageLayout>
//     );
//   }

//   return (
//     <PageLayout>
//       <Typography variant="h4" gutterBottom mt={2}>
//         📘 Programme Terminale C – Mathématiques
//       </Typography>

//       {programmeTerminalC.map((chapitre) => (
//   <Grid item xs={12} md={6} key={chapitre.code}>
//     <Card>
//       <CardContent>
//         <Typography variant="h6" gutterBottom>
//           {chapitre.code} — {chapitre.titre}
//         </Typography>
//         <List dense>
//           {chapitre.points.map((point, index) => (
//             <ListItem key={index}>
//               <ListItemText primary={`• ${point}`} />
//             </ListItem>
//           ))}
//         </List>
//       </CardContent>
//       <CardActions>
//         <Button
//           variant="outlined"
//           onClick={() => navigate(`/aide-detaillee?chapitre=${chapitre.cle}`)}
//         >
//           Poser une question à l’IA
//         </Button>
//         <Button
//           variant="contained"
//           onClick={() => navigate(`/exemples?sujet=${chapitre.cle}`)}
//         >
//           Voir des exercices
//         </Button>
//       </CardActions>
//     </Card>
//   </Grid>
// ))}


//       {/* 🧠 Fenêtre pour afficher la réponse IA */}
//       <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
//         <DialogTitle>💡 Réponse de l’IA</DialogTitle>
//         {/* <DialogContent>
//           <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
//             {aiResponse}
//           </Typography>
//         </DialogContent> */}

// <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
//   <DialogTitle>💡 Réponse de l’IA</DialogTitle>
//   <DialogContent>
//     <Box
//       sx={{ mt: 2 }}
//       dangerouslySetInnerHTML={{ __html: marked(aiResponse) }}
//     />
//   </DialogContent>
// </Dialog>

//       </Dialog>
//     </PageLayout>
//   );
// };

// export default TerminalCProgrammePage;





import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Card,
  CardActions,
  CardContent,
  Grid,
  List as MuiList
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import API from "../api";
import { marked } from "marked";
import { useNavigate } from "react-router-dom";
import programmeTerminalC from "../data/terminalCProgrammeData";

const TerminalCProgrammePage = () => {
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState("");
  const [open, setOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoLinks, setVideoLinks] = useState([]);
  const [currentChapitre, setCurrentChapitre] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(false); // car tu charges localement le JSON
  }, []);

  const handleAskAI = async (chapitre) => {
    const titre = chapitre.titre;
    const objectif = chapitre.objectifs?.[0] || "";
    const prompt = `Explique un exercice typique du chapitre : "${titre}". Objectif : ${objectif}. Donne un exemple clair avec explication.`;

    try {
      const res = await API.post("/ia/gratuit", { input: prompt });
      setAiResponse(res.data.response);
      setOpen(true);
    } catch (error) {
      setAiResponse("❌ Erreur IA. Veuillez réessayer.");
      setOpen(true);
    }
  };

  const handleOpenVideos = (chapitre) => {
    setCurrentChapitre(chapitre.titre);
    setVideoLinks([
      { title: "Cours complet", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      { title: "Exercice corrigé 1", url: "https://www.youtube.com/watch?v=VideoID2" },
      { title: "Exercice corrigé 2", url: "https://www.youtube.com/watch?v=VideoID3" },
      { title: "Cours simplifié", url: "https://www.youtube.com/watch?v=VideoID4" },
      { title: "Méthode rapide", url: "https://www.youtube.com/watch?v=VideoID5" },
      { title: "Exercice type bac", url: "https://www.youtube.com/watch?v=VideoID6" },
      { title: "QCM interactif", url: "https://www.youtube.com/watch?v=VideoID7" },
      { title: "Conseils de révision", url: "https://www.youtube.com/watch?v=VideoID8" },
      { title: "Vidéo prof particulier", url: "https://www.youtube.com/watch?v=VideoID9" },
      { title: "Exercice détaillé", url: "https://www.youtube.com/watch?v=VideoID10" },
    ]);
    setVideoModalOpen(true);
  };

  if (loading) {
    return (
      <PageLayout>
        <Box mt={4} textAlign="center">
          <CircularProgress />
          <Typography mt={2}>Chargement du programme...</Typography>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Typography variant="h4" gutterBottom mt={2}>
        📘 Programme Terminale C – Mathématiques
      </Typography>

      <Grid container spacing={3} mt={2}>
        {programmeTerminalC.map((chapitre) => (
          <Grid item xs={12} md={6} key={chapitre.code}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {chapitre.code} — {chapitre.titre}
                </Typography>
                <List dense>
                  {chapitre.points.map((point, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`• ${point}`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/aide-detaillee?chapitre=${chapitre.cle}`)}
                >
                  🧠 Poser une question à l’IA
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/exemples?sujet=${chapitre.cle}`)}
                >
                  📘 Voir des exercices
                </Button>
                <Button
                  variant="text"
                  onClick={() => handleOpenVideos(chapitre)}
                >
                  📺 Voir des vidéos
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 🧠 Réponse IA */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>💡 Réponse de l’IA</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }} dangerouslySetInnerHTML={{ __html: marked(aiResponse) }} />
        </DialogContent>
      </Dialog>

      {/* 🎥 Vidéos utiles */}
      <Dialog open={videoModalOpen} onClose={() => setVideoModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>🎥 Vidéos utiles – {currentChapitre}</DialogTitle>
        <DialogContent>
          <MuiList>
            {videoLinks.map((video, index) => (
              <ListItem
                key={index}
                component="a"
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                button
              >
                <ListItemText primary={`▶️ ${video.title}`} />
              </ListItem>
            ))}
          </MuiList>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default TerminalCProgrammePage;
