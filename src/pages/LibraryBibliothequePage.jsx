import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Chip,
  Button,
} from "@mui/material";
import {
  Search as SearchIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import { libraryService } from "../services/libraryService";
import PageLayout from "../components/PageLayout";

// Icônes dispo par matière (avec émojis)
const availableIcons = [
  { name: "SchoolIcon", label: "École", emoji: "🎓" },
  { name: "ScienceIcon", label: "Sciences", emoji: "🔬" },
  { name: "CalculateIcon", label: "Mathématiques", emoji: "🧮" },
  { name: "LocalHospitalIcon", label: "Médecine", emoji: "🏥" },
  { name: "BiotechIcon", label: "Biologie", emoji: "🧬" },
  { name: "ComputerIcon", label: "Informatique", emoji: "💻" },
  { name: "AccountBalanceIcon", label: "Économie", emoji: "🏛️" },
  { name: "AttachMoneyIcon", label: "Finance", emoji: "💰" },
  { name: "PsychologyIcon", label: "Psychologie", emoji: "🧠" },
  { name: "HistoryEduIcon", label: "Histoire", emoji: "📜" },
  { name: "LanguageIcon", label: "Langues", emoji: "🗣️" },
  { name: "PaletteIcon", label: "Arts", emoji: "🎨" },
  { name: "MusicNoteIcon", label: "Musique", emoji: "🎵" },
  { name: "SportsIcon", label: "Sport", emoji: "⚽" },
  { name: "EngineeringIcon", label: "Ingénierie", emoji: "⚙️" },
  { name: "ArchitectureIcon", label: "Architecture", emoji: "🏗️" },
  { name: "AgricultureIcon", label: "Agriculture", emoji: "🌾" },
  { name: "EnvironmentIcon", label: "Environnement", emoji: "🌍" },
  { name: "SecurityIcon", label: "Sécurité", emoji: "🔒" },
  { name: "PublicIcon", label: "Politique", emoji: "🏛️" },
];

const LibraryBibliothequePage = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const response = await libraryService.getSubjects();
      const subjectsData = response?.data || response || [];
      const subjectsWithImages = Array.isArray(subjectsData)
        ? subjectsData.map((subject, index) => ({
            ...subject,
            _id: subject._id || subject.id,
            bookCount: subject.bookCount || 0,
            color: subject.color || "#3b82f6", // couleur fallback (bleu)
            description: subject.description || "Pas de description.",
            image:
              subject.image ||
              `https://images.unsplash.com/photo-${1559757148 + index}?w=400&h=300&fit=crop`,
          }))
        : [];
      setSubjects(subjectsWithImages);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des matières:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const name = (subject.name || "").toLowerCase();
    const description = (subject.description || "").toLowerCase();
    const term = searchTerm.toLowerCase();
    return name.includes(term) || description.includes(term);
  });

  return (
    <PageLayout>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          p: { xs: 2, sm: 3 },
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 6 } , pt: { xs: 7, sm: 8 }, }}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              color: "#fff",
              mb: 2,
              mt: { xs: 4, sm: 6, md: 7 },
              fontSize: { xs: "1.6rem", sm: "2rem", md: "2.75rem" },
              lineHeight: 1.15,
            }}
          >
            📚 Bibliothèque Universitaire
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 4,
              maxWidth: 700,
              mx: "auto",
              fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.15rem" },
              lineHeight: { xs: 1.4, sm: 1.55 },
              px: { xs: 1, sm: 0 },
            }}
          >
            Découvrez notre collection de livres organisés par matière pour enrichir vos études universitaires
          </Typography>

          {/* Message informatif */}
          <Box
            sx={{
              mb: { xs: 3, sm: 4 },
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.1) 100%)",
              border: "2px solid rgba(59,130,246,0.3)",
              backdropFilter: "blur(10px)",
              maxWidth: 900,
              mx: "auto",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#60a5fa",
                mb: 1.5,
                fontWeight: 700,
                textAlign: "center",
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              }}
            >
              📖 Information importante
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                lineHeight: { xs: 1.45, sm: 1.6 },
                fontSize: { xs: "0.9rem", sm: "1rem" },
                px: { xs: 1, sm: 4 },
              }}
            >
              Nous vous donnons accès au <strong>livre et son sommaire</strong> pour consultation.
              Si le livre vous intéresse, merci de <strong>nous contacter</strong> pour obtenir la
              photocopie ou le livre numérique.
            </Typography>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="contained"
                size="small"
                href="https://wa.me/22780648383"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 2,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #128C7E 0%, #0F6B5C 100%)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                📱 Contacter sur WhatsApp: +227 80 64 83 83
              </Button>
            </Box>
          </Box>

          {/* Barre de recherche */}
          <Box sx={{ maxWidth: 600, mx: "auto", width: "100%", px: { xs: 1, sm: 0 } }}>
            <TextField
              placeholder="Rechercher une matière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{
                      color: "rgba(255,255,255,0.6)",
                      mr: 1,
                      fontSize: { xs: 18, sm: 20 },
                    }}
                  />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.23)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  height: { xs: 40, sm: 44 },
                },
                "& .MuiInputBase-input": { py: { xs: 0.75, sm: 1 } },
              }}
            />
          </Box>
        </Box>

        {/* Statistiques */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#fff",
                  textAlign: "center",
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <CardContent sx={{ "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ fontSize: { xs: "1.4rem", md: "2rem" } }}
                  >
                    {subjects.length}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.9, fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                  >
                    Matières disponibles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  textAlign: "center",
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <CardContent sx={{ "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ fontSize: { xs: "1.4rem", md: "2rem" } }}
                  >
                    {subjects.reduce((t, s) => t + (s.bookCount || 0), 0)}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.9, fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                  >
                    Livres disponibles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Card
                sx={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#fff",
                  textAlign: "center",
                  p: { xs: 1.5, sm: 2 },
                }}
              >
                <CardContent sx={{ "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ fontSize: { xs: "1.4rem", md: "2rem" } }}
                  >
                    Université
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ opacity: 0.9, fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                  >
                    Niveau d'études
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Debug (masqué sur mobile) */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 1,
            display: { xs: "none", sm: "block" },
          }}
        >
          <Typography sx={{ color: "#fff", fontSize: { sm: "0.85rem" } }}>
            Debug: {subjects.length} matières chargées | Loading: {loading ? "Oui" : "Non"}
          </Typography>
        </Box>

        {/* Liste des matières */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography sx={{ color: "#fff" }}>Chargement des matières...</Typography>
          </Box>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} justifyContent="center">
            {filteredSubjects.map((subject) => {
              const color = subject.color || "#3b82f6";
              const emoji =
                availableIcons.find((icon) => icon.name === subject.icon)?.emoji || "🎓";
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={subject._id || subject.id}>
                  <Card
                    sx={{
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                      border: `2px solid ${color}20`,
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: `0 12px 40px ${color}40`,
                        borderColor: `${color}60`,
                      },
                      transition: "all 0.3s ease",
                      height: "100%",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onClick={() =>
                      navigate(`/bibliotheque/${subject._id || subject.id}`)
                    }
                  >
                    {/* Bandeau haut */}
                    <Box
                      sx={{
                        height: { xs: 160, sm: 180, md: 200 },
                        background: `linear-gradient(135deg, ${color}40 0%, ${color}80 100%)`,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* Emoji + titre */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 1,
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: "2.8rem", sm: "3.5rem", md: "4rem" },
                            mb: 1,
                            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                          }}
                        >
                          {emoji}
                        </Typography>
                        <Typography
                          fontWeight={700}
                          sx={{
                            color: "#fff",
                            textAlign: "center",
                            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                            px: 1,
                          }}
                        >
                          {subject.name}
                        </Typography>
                      </Box>

                      {/* Badge nombre de livres */}
                      <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
                        <Chip
                          label={`${subject.bookCount} livre${
                            subject.bookCount > 1 ? "s" : ""
                          }`}
                          sx={{
                            backgroundColor: "rgba(255,255,255,0.9)",
                            color,
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.8rem" },
                            height: { xs: 22, sm: 26 },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Corps */}
                    <CardContent
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <Typography
                        sx={{
                          color: "rgba(255,255,255,0.85)",
                          fontSize: { xs: "0.85rem", sm: "0.95rem" },
                          lineHeight: { xs: 1.35, sm: 1.5 },
                          display: "-webkit-box",
                          WebkitLineClamp: { xs: 2, sm: 3 },
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: { xs: 38, sm: 45 },
                        }}
                      >
                        {subject.description}
                      </Typography>

                      <Button
                        variant="contained"
                        fullWidth
                        sx={{
                          background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
                          fontSize: { xs: "0.8rem", sm: "0.9rem" },
                          py: { xs: 0.75, sm: 1 },
                          "&:hover": {
                            background: `linear-gradient(135deg, ${color}CC 0%, ${color} 100%)`,
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        <MenuBookIcon sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                        Voir les livres
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        {filteredSubjects.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8, px: { xs: 2, sm: 0 } }}>
            <Typography
              variant="h6"
              sx={{
                color: "#fff",
                mb: 1,
                fontSize: { xs: "1rem", sm: "1.1rem" },
                fontWeight: 700,
              }}
            >
              🔍 Aucune matière trouvée
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: "0.9rem" } }}>
              Essayez de modifier votre recherche
            </Typography>
          </Box>
        )}
      </Box>
    </PageLayout>
  );
};

export default LibraryBibliothequePage;
