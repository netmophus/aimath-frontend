import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  MenuBook as MenuBookIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { libraryService } from "../services/libraryService";
import PageLayout from "../components/PageLayout";

// Liste des icônes disponibles pour les matières
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
      console.log("🔄 Chargement des matières...");
      // Charger les matières depuis l'API
      const response = await libraryService.getSubjects();
      console.log("📡 Réponse API:", response);
      
      const subjectsData = response.data || response;
      console.log("📚 Données matières:", subjectsData);
      
      // Ajouter des images par défaut et compter les livres
      const subjectsWithImages = Array.isArray(subjectsData) ? subjectsData.map((subject, index) => ({
        ...subject,
        _id: subject._id || subject.id,
        bookCount: subject.bookCount || 0,
        image: subject.image || `https://images.unsplash.com/photo-${1559757148 + index}?w=400&h=300&fit=crop`
      })) : [];
      
      console.log("🎯 Matières finales:", subjectsWithImages);
      setSubjects(subjectsWithImages);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des matières:", error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout>
      <Box sx={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        p: 3 
      }}>
        {/* En-tête */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography variant="h3" fontWeight={700} sx={{ color: "#fff", mb: 2, mt: 7 }}>
            📚 Bibliothèque Universitaire
          </Typography>
        <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)", mb: 4, maxWidth: 600, mx: "auto" }}>
          Découvrez notre collection de livres organisés par matière pour enrichir vos études universitaires
        </Typography>
        
        {/* Message informatif */}
        <Box sx={{ 
          mb: 4, 
          p: 3, 
          borderRadius: 2, 
          background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.1) 100%)",
          border: "2px solid rgba(59,130,246,0.3)",
          backdropFilter: "blur(10px)",
          maxWidth: 800,
          mx: "auto"
        }}>
          <Typography variant="h6" sx={{ color: "#60a5fa", mb: 2, fontWeight: 700, textAlign: "center" }}>
            📖 Information importante
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 1.6 }}>
            Nous vous donnons accès au <strong>livre et son sommaire</strong> pour consultation. 
            Si le livre vous intéresse, merci de <strong>nous contacter</strong> pour obtenir la photocopie ou le livre numérique.
          </Typography>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<span>📱</span>}
              href="https://wa.me/22780648383"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                color: "#fff",
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 2,
                "&:hover": {
                  background: "linear-gradient(135deg, #128C7E 0%, #0F6B5C 100%)",
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
        <TextField
          placeholder="Rechercher une matière..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "rgba(255,255,255,0.6)", mr: 1 }} />
          }}
          sx={{
            maxWidth: 500,
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": { borderColor: "rgba(255,255,255,0.23)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
            },
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
          }}
        />
      </Box>

      {/* Statistiques */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
              color: "#fff",
              textAlign: "center",
              p: 2 
            }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {subjects.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Matières disponibles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
              color: "#fff",
              textAlign: "center",
              p: 2 
            }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  {subjects.reduce((total, subject) => total + subject.bookCount, 0)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Livres disponibles
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ 
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
              color: "#fff",
              textAlign: "center",
              p: 2 
            }}>
              <CardContent>
                <Typography variant="h4" fontWeight={700}>
                  Université
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Niveau d'études
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Debug info */}
      <Box sx={{ mb: 2, p: 2, background: "rgba(255,255,255,0.1)", borderRadius: 1 }}>
        <Typography sx={{ color: "#fff", fontSize: "0.875rem" }}>
          Debug: {subjects.length} matières chargées | Loading: {loading ? "Oui" : "Non"}
        </Typography>
      </Box>

      {/* Liste des matières */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography sx={{ color: "#fff" }}>Chargement des matières...</Typography>
        </Box>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {filteredSubjects.map((subject) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={subject._id || subject.id}>
              <Card 
                sx={{ 
                  background: "rgba(255,255,255,0.1)", 
                  backdropFilter: "blur(10px)",
                  border: `2px solid ${subject.color}20`,
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 40px ${subject.color}40`,
                    borderColor: `${subject.color}60`,
                  },
                  transition: "all 0.3s ease",
                  height: "100%",
                  width: "100%",
                  maxWidth: "400px",
                  minWidth: "350px",
                  display: "flex",
                  flexDirection: "column"
                }}
                onClick={() => navigate(`/bibliotheque/${subject._id || subject.id}`)}
              >
                <Box
                  sx={{
                    height: 200,
                    background: `linear-gradient(135deg, ${subject.color}40 0%, ${subject.color}80 100%)`,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Icône de la matière au centre */}
                  <Box sx={{ 
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1
                  }}>
                    <Typography sx={{ 
                      fontSize: "4rem", 
                      mb: 1,
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))"
                    }}>
                      {availableIcons.find(icon => icon.name === subject.icon)?.emoji || "🎓"}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ 
                      color: "#fff", 
                      textAlign: "center",
                      textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                    }}>
                      {subject.name}
                    </Typography>
                  </Box>

                  {/* Badge nombre de livres */}
                  <Box sx={{ 
                    position: "absolute", 
                    top: 16, 
                    right: 16,
                    zIndex: 2
                  }}>
                    <Chip
                      label={`${subject.bookCount} livre${subject.bookCount > 1 ? 's' : ''}`}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.9)",
                        color: subject.color,
                        fontWeight: 600,
                        fontSize: "0.875rem"
                      }}
                    />
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "rgba(255,255,255,0.8)", 
                      mb: 3,
                      height: "60px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.4
                    }}
                  >
                    {subject.description}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      background: `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}CC 100%)`,
                      "&:hover": {
                        background: `linear-gradient(135deg, ${subject.color}CC 0%, ${subject.color} 100%)`,
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <MenuBookIcon sx={{ mr: 1 }} />
                    Voir les livres
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {filteredSubjects.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
            🔍 Aucune matière trouvée
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
            Essayez de modifier votre recherche
          </Typography>
        </Box>
      )}
      </Box>
    </PageLayout>
  );
};

export default LibraryBibliothequePage;
