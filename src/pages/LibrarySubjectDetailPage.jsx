import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  MenuBook as MenuBookIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import { libraryService } from "../services/libraryService";

const LibrarySubjectDetailPage = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");

  useEffect(() => {
    loadSubjectData();
  }, [subjectId]);

  const loadSubjectData = async () => {
    setLoading(true);
    try {
      console.log("🔄 Chargement des données pour la matière:", subjectId);
      
      // Charger toutes les matières pour trouver celle correspondante
      const subjectsResponse = await libraryService.getSubjects();
      const subjectsData = subjectsResponse.data || subjectsResponse;
      const currentSubject = Array.isArray(subjectsData) ? 
        subjectsData.find(s => s._id === subjectId || s.id === subjectId) : null;
      
      console.log("📚 Matière trouvée:", currentSubject);
      
      if (currentSubject) {
        setSubject({
          ...currentSubject,
          _id: currentSubject._id || currentSubject.id,
          image: currentSubject.image || `https://images.unsplash.com/photo-${1559757148}?w=400&h=300&fit=crop`
        });
        
        // Charger les livres de cette matière
        console.log("🔄 Appel API pour les livres de la matière:", subjectId);
        const booksResponse = await libraryService.getBooksBySubject(subjectId);
        console.log("📡 Réponse API livres:", booksResponse);
        
        const booksData = booksResponse.data || booksResponse;
        const booksArray = Array.isArray(booksData) ? booksData : [];
        
        console.log("📖 Livres trouvés:", booksArray);
        setBooks(booksArray);
      } else {
        console.log("❌ Matière non trouvée");
        setSubject(null);
        setBooks([]);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
      setSubject(null);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewBook = (book) => {
    setSelectedBook(book);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBook(null);
  };

  const handleViewCover = (coverUrl) => {
    window.open(coverUrl, '_blank');
  };

  const handleViewSummary = (summaryUrl) => {
    // Utiliser le panneau coulissant pour TOUTES les URLs de sommaire
    setCurrentPdfUrl(summaryUrl);
    setShowPdfViewer(true);
  };

  const closePdfViewer = () => {
    setShowPdfViewer(false);
    setCurrentPdfUrl("");
  };

  const toggleDescription = (bookId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [bookId]: !prev[bookId]
    }));
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Typography sx={{ color: "#fff" }}>Chargement...</Typography>
      </Box>
    );
  }

  if (!subject) {
    return (
      <Box sx={{ 
        minHeight: "100vh", 
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Typography sx={{ color: "#fff" }}>Matière non trouvée</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      p: 3 
    }}>
      {/* En-tête */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <IconButton
          onClick={() => navigate("/bibliotheque")}
          sx={{ color: "#fff" }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SchoolIcon 
            sx={{ 
              fontSize: "2.5rem", 
              color: "#ef4444",
              filter: "drop-shadow(0 2px 4px rgba(239,68,68,0.3))"
            }} 
          />
          <Typography variant="h4" fontWeight={700} sx={{ color: "#fff" }}>
            {subject.name}
          </Typography>
        </Box>
      </Box>

      {/* Description de la matière */}
      <Card sx={{ 
        background: "rgba(255,255,255,0.1)", 
        backdropFilter: "blur(10px)",
        border: `2px solid ${subject.color}20`,
        mb: 4 
      }}>
        <CardContent>
          <Grid container spacing={{ xs: 2, md: 3 }} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <Box
                sx={{
                  height: { xs: 150, sm: 180, md: 200 },
                  backgroundImage: `url(${subject.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: 2,
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${subject.color}40 0%, ${subject.color}80 100%)`,
                    borderRadius: 2,
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Typography variant="h5" fontWeight={600} sx={{ color: "#fff", mb: 2, fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
                {subject.name}
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                {subject.description}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Chip
                  label={`${books.length} livre${books.length > 1 ? 's' : ''}`}
                  sx={{
                    backgroundColor: `${subject.color}20`,
                    color: subject.color,
                    fontWeight: 600,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" }
                  }}
                />
                <Chip
                  label="Université"
                  sx={{
                    backgroundColor: "rgba(16,185,129,0.2)",
                    color: "#34d399",
                    fontWeight: 600,
                    fontSize: { xs: "0.75rem", sm: "0.875rem" }
                  }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Debug info */}
      <Box sx={{ mb: 2, p: 2, background: "rgba(255,255,255,0.1)", borderRadius: 1 }}>
        <Typography sx={{ color: "#fff", fontSize: "0.875rem" }}>
          Debug: {books.length} livres chargés | Matière: {subject?.name || "Non trouvée"}
        </Typography>
      </Box>

      {/* Barre de recherche */}
      <Box sx={{ mb: 4, px: { xs: 1, sm: 0 } }}>
        <TextField
          fullWidth
          placeholder="Rechercher un livre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: "rgba(255,255,255,0.6)", mr: 1 }} />
          }}
          sx={{
            maxWidth: { xs: "100%", sm: 500 },
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              "& fieldset": { borderColor: "rgba(255,255,255,0.23)" },
              "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
            },
            "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
          }}
        />
      </Box>

      {/* Message informatif */}
      <Box sx={{ 
        mb: 4, 
        p: { xs: 2, sm: 3 }, 
        borderRadius: 2, 
        background: "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.1) 100%)",
        border: "2px solid rgba(59,130,246,0.3)",
        backdropFilter: "blur(10px)",
        maxWidth: { xs: "100%", sm: 800 },
        mx: "auto",
        px: { xs: 1, sm: 0 }
      }}>
        <Typography variant="h6" sx={{ color: "#60a5fa", mb: 2, fontWeight: 700, textAlign: "center", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          📖 Information importante
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 1.6, mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          Regarder le sommaire et si le livre vous intéresse alors on peut vous envoyer la photocopie ou le livre numérique. 
          Vous pouvez faire la demande par WhatsApp.
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
              px: { xs: 2, sm: 3 },
              py: 1,
              borderRadius: 2,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
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

        {/* Liste des livres */}
        <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="center">
          {filteredBooks.map((book) => (
            <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={book._id || book.id}>
              <Card sx={{ 
                background: "rgba(255,255,255,0.1)", 
                backdropFilter: "blur(10px)",
                border: `2px solid ${subject.color}20`,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 25px ${subject.color}40`,
                },
                transition: "all 0.3s ease",
                height: "100%",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                maxWidth: "100%",
                minWidth: "100%"
              }}>
              {/* Image de couverture */}
              <Box
                component="img"
                src={book.coverImageUrl}
                alt={book.title}
                sx={{
                  width: { xs: "100%", md: "300px" },
                  height: { xs: "250px", md: "400px" },
                  objectFit: "contain",
                  cursor: "pointer",
                  borderTopLeftRadius: { xs: 8, md: 8 },
                  borderTopRightRadius: { xs: 8, md: 0 },
                  borderBottomLeftRadius: { xs: 0, md: 8 },
                  borderBottomRightRadius: { xs: 0, md: 0 },
                  backgroundColor: "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
                onClick={() => handleViewCover(book.coverImageUrl)}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x400/1e293b/ffffff?text=Couverture+non+disponible";
                }}
              />
              
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: { xs: 2, sm: 3 }, minWidth: 0 }}>
                {/* Titre */}
                <Typography variant="h6" fontWeight={700} sx={{ color: "#fff", mb: 1, lineHeight: 1.3, fontSize: { xs: "1rem", sm: "1.1rem" } }}>
                  {book.title}
                </Typography>
                
                {/* Auteur */}
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mb: 2, fontWeight: 500, fontSize: { xs: "0.875rem", sm: "0.9rem" } }}>
                  par {book.author}
                </Typography>
                
                {/* Description avec bouton "Voir plus" */}
                <Box sx={{ mb: 3, flexGrow: 1, maxWidth: { xs: "100%", md: "300px" } }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: "rgba(255,255,255,0.8)", 
                      mb: 1,
                      lineHeight: 1.4,
                      ...(expandedDescriptions[book._id || book.id] ? {} : {
                        height: { xs: "auto", md: "60px" },
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: { xs: 2, md: 3 },
                        WebkitBoxOrient: "vertical",
                      }),
                      fontSize: { xs: "0.875rem", sm: "0.9rem" }
                    }}
                  >
                    {book.description}
                  </Typography>
                  
                  {book.description && book.description.length > 80 && (
                    <Button
                      size="small"
                      onClick={() => toggleDescription(book._id || book.id)}
                      sx={{
                        color: subject.color,
                        textTransform: "none",
                        fontWeight: 600,
                        p: 0,
                        minWidth: "auto",
                        fontSize: { xs: "0.75rem", sm: "0.8rem" },
                        "&:hover": {
                          backgroundColor: "transparent",
                          textDecoration: "underline"
                        }
                      }}
                    >
                      {expandedDescriptions[book._id || book.id] ? "Voir moins" : "Voir plus"}
                    </Button>
                  )}
                </Box>
                
                {/* Informations du livre */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}>
                  <Chip
                    label={`${book.pages} pages`}
                    size="small"
                    sx={{
                      backgroundColor: `${subject.color}20`,
                      color: subject.color,
                      fontWeight: 600,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" }
                    }}
                  />
                  <Chip
                    label={`Année: ${book.year}`}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" }
                    }}
                  />
                  <Chip
                    label="Université"
                    size="small"
                    sx={{
                      backgroundColor: "rgba(16,185,129,0.2)",
                      color: "#34d399",
                      fontWeight: 600,
                      fontSize: { xs: "0.7rem", sm: "0.75rem" }
                    }}
                  />
                </Stack>
                
                {/* Bouton pour voir le sommaire */}
                <Button
                  variant="contained"
                  startIcon={<VisibilityIcon />}
                  onClick={() => handleViewSummary(book.summaryUrl)}
                  sx={{
                    background: `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}CC 100%)`,
                    color: "#fff",
                    fontWeight: 700,
                    py: 1.5,
                    px: { xs: 2, sm: 3 },
                    alignSelf: "flex-start",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      background: `linear-gradient(135deg, ${subject.color}CC 0%, ${subject.color} 100%)`,
                      transform: "translateY(-1px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  👁️ Visualiser le sommaire
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredBooks.length === 0 && (
        <Box sx={{ textAlign: "center", py: { xs: 4, sm: 8 }, px: { xs: 2, sm: 0 } }}>
          <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
            🔍 Aucun livre trouvé
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Essayez de modifier votre recherche
          </Typography>
        </Box>
      )}

      {/* Dialog de détail du livre */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "rgba(30,30,30,0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)"
          }
        }}
      >
        {selectedBook && (
          <>
            <DialogTitle sx={{ color: "#fff", fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              {selectedBook.title}
              <IconButton onClick={handleCloseDialog} sx={{ color: "#fff" }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box
                    component="img"
                    src={selectedBook.coverImageUrl}
                    alt={selectedBook.title}
                    sx={{
                      width: "100%",
                      height: 300,
                      objectFit: "cover",
                      borderRadius: 2,
                      cursor: "pointer"
                    }}
                    onClick={() => handleViewCover(selectedBook.coverImageUrl)}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h5" fontWeight={600} sx={{ color: "#fff", mb: 1, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    {selectedBook.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", mb: 2, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                    par {selectedBook.author}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.8)", mb: 3, fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                    {selectedBook.description}
                  </Typography>
                  
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
                    <Chip
                      label={`${selectedBook.pages} pages`}
                      sx={{
                        backgroundColor: `${subject.color}20`,
                        color: subject.color,
                        fontWeight: 600,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" }
                      }}
                    />
                    <Chip
                      label={selectedBook.year}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" }
                      }}
                    />
                    <Chip
                      label={`${selectedBook.downloads} téléchargements`}
                      sx={{
                        backgroundColor: "rgba(16,185,129,0.2)",
                        color: "#34d399",
                        fontWeight: 600,
                        fontSize: { xs: "0.7rem", sm: "0.75rem" }
                      }}
                    />
                  </Stack>
                  
                  <Typography variant="h6" sx={{ color: "#fff", mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    📖 Sommaire
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    {selectedBook.summary.map((chapter, index) => (
                      <Typography key={index} variant="body2" sx={{ color: "rgba(255,255,255,0.8)", mb: 0.5, fontSize: { xs: "0.875rem", sm: "0.9rem" } }}>
                        • {chapter}
                      </Typography>
                    ))}
                  </Box>
                  
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleViewCover(selectedBook.coverImageUrl)}
                      sx={{
                        background: `linear-gradient(135deg, ${subject.color} 0%, ${subject.color}CC 100%)`,
                        color: "#fff",
                        fontWeight: 600,
                        px: { xs: 2, sm: 3 },
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        "&:hover": {
                          background: `linear-gradient(135deg, ${subject.color}CC 0%, ${subject.color} 100%)`,
                          transform: "translateY(-1px)",
                        },
                        transition: "all 0.3s ease",
                        width: { xs: "100%", sm: "auto" }
                      }}
                    >
                      Voir la couverture
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleViewSummary(selectedBook.summaryUrl)}
                      sx={{
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "#fff",
                        px: { xs: 2, sm: 3 },
                        py: 1.5,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.6)",
                          backgroundColor: "rgba(255,255,255,0.1)",
                        },
                        width: { xs: "100%", sm: "auto" }
                      }}
                    >
                      Voir le sommaire
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* PDF Viewer - Panneau coulissant depuis la droite */}
      {showPdfViewer && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            animation: "slideInFromRight 0.3s ease-out",
            "@keyframes slideInFromRight": {
              "0%": {
                transform: "translateX(100%)",
                opacity: 0,
              },
              "100%": {
                transform: "translateX(0)",
                opacity: 1,
              },
            },
          }}
          onClick={closePdfViewer}
        >
          <Box
            sx={{
              width: "90vw",
              height: "90vh",
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              borderRadius: 3,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              border: "2px solid rgba(59,130,246,0.3)",
              animation: "slideInFromRight 0.4s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête du viewer */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                background: "rgba(59,130,246,0.1)",
                borderBottom: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ color: "#60a5fa", fontWeight: 700 }}>
                  📖 Sommaire du livre
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<span>📥</span>}
                  onClick={() => window.open(currentPdfUrl, '_blank')}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    },
                  }}
                >
                  Télécharger
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<span>❌</span>}
                  onClick={closePdfViewer}
                  sx={{
                    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    },
                  }}
                >
                  Fermer
                </Button>
              </Box>
            </Box>

            {/* Contenu PDF */}
            <Box sx={{ height: "calc(100% - 80px)", position: "relative" }}>
              {currentPdfUrl.includes('supabase.co') ? (
                // Pour Supabase, utiliser Google Docs Viewer ou PDF.js
                <Box
                  component="iframe"
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(currentPdfUrl)}&embedded=true`}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "0 0 12px 12px",
                  }}
                  onError={() => {
                    console.error("Erreur de chargement du PDF via Google Viewer");
                    // Fallback: essayer PDF.js
                    const pdfJsUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(currentPdfUrl)}`;
                    window.open(pdfJsUrl, '_blank');
                  }}
                />
              ) : (
                // Pour les autres URLs, utiliser l'iframe standard
                <Box
                  component="iframe"
                  src={currentPdfUrl}
                  sx={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "0 0 12px 12px",
                  }}
                  onError={() => {
                    console.error("Erreur de chargement du PDF");
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default LibrarySubjectDetailPage;
