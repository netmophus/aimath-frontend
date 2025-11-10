import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Stack,
} from "@mui/material";
import {
  Add as AddIcon,
  MenuBook as MenuBookIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  LibraryBooks as LibraryBooksIcon,
} from "@mui/icons-material";

const LibraryManagePage = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "success" });

  // Charger les données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Ici vous pouvez ajouter des appels API pour charger les livres et matières
      // Pour l'instant, on utilise des données vides
      setBooks([]);
      setSubjects([]);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      setAlert({
        show: true,
        message: "Erreur lors du chargement des données",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      p: 3 
    }}>
      {/* En-tête */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: "#fff" }}>
          📚 Gestion de la Bibliothèque
        </Typography>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert
          severity={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          sx={{ mb: 3 }}
        >
          {alert.message}
        </Alert>
      )}

      {/* Section d'information */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", 
            color: "#fff",
            p: 2 
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                📚 Livres
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {books.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Livres dans la bibliothèque
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", 
            color: "#fff",
            p: 2 
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                🎯 Matières
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {subjects.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Matières disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", 
            color: "#fff",
            p: 2 
          }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                📖 Disponibles
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {books.filter(book => book.isAvailable).length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Livres accessibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions rapides */}
      <Card sx={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ color: "#fff", mb: 2 }}>
            🚀 Actions rapides
          </Typography>
          {/* Message d'instruction */}
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            borderRadius: 2, 
            background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.1) 100%)",
            border: "2px solid rgba(59,130,246,0.3)",
            backdropFilter: "blur(10px)",
          }}>
            <Typography variant="h6" sx={{ color: "#60a5fa", mb: 1, fontWeight: 700 }}>
              📋 Instructions
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>
              <strong>Étape 1 :</strong> Commencez par créer et gérer les matières (Médecine, Mathématiques, etc.)<br/>
              <strong>Étape 2 :</strong> Ensuite, ajoutez les livres en les classant par matière
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<SchoolIcon />}
                onClick={() => navigate("/admin/library/manage-subjects")}
                sx={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#fff",
                  py: 2,
                  fontWeight: 700,
                  "&:hover": {
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                🎯 1. Gérer les matières
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MenuBookIcon />}
                onClick={() => navigate("/admin/library/books")}
                sx={{
                  borderColor: "rgba(16,185,129,0.5)",
                  color: "#34d399",
                  py: 2,
                  "&:hover": {
                    borderColor: "#34d399",
                    backgroundColor: "rgba(16,185,129,0.1)",
                  },
                }}
              >
                📚 2. Gérer les livres
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => navigate("/bibliotheque")}
                sx={{
                  borderColor: "rgba(245,158,11,0.5)",
                  color: "#fbbf24",
                  py: 2,
                  "&:hover": {
                    borderColor: "#fbbf24",
                    backgroundColor: "rgba(245,158,11,0.1)",
                  },
                }}
              >
                👀 Voir la bibliothèque
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LibraryBooksIcon />}
                onClick={() => navigate("/admin/library/import")}
                sx={{
                  borderColor: "rgba(139,92,246,0.5)",
                  color: "#a78bfa",
                  py: 2,
                  "&:hover": {
                    borderColor: "#a78bfa",
                    backgroundColor: "rgba(139,92,246,0.1)",
                  },
                }}
              >
                📤 Importer des livres
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Section principale */}
      <Card sx={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} sx={{ color: "#fff", mb: 2 }}>
            📚 Gestion de la bibliothèque
          </Typography>
          
          {loading ? (
            <Typography sx={{ color: "#fff" }}>Chargement...</Typography>
          ) : books.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
                📚 Bienvenue dans la gestion de votre bibliothèque
              </Typography>
              <Typography sx={{ color: "#fff", mb: 3, opacity: 0.8 }}>
                Commencez par créer des matières, puis ajoutez des livres pour organiser votre bibliothèque étudiante.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  startIcon={<SchoolIcon />}
                  onClick={() => navigate("/admin/library/manage-subjects")}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    },
                  }}
                >
                  🎯 Créer des matières
                </Button>
                <Button
                  variant="contained"
                  startIcon={<MenuBookIcon />}
                  onClick={() => navigate("/admin/library/books")}
                  sx={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    },
                  }}
                >
                  📚 Gérer les livres
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography sx={{ color: "#fff" }}>
              Ici vous verrez la liste de vos livres une fois qu'ils seront ajoutés.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LibraryManagePage;