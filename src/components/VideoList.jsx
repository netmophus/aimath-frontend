// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   Chip,
//   Button,
//   Box,
// } from "@mui/material";
// import API from "../api";

// const VideoList = () => {
//   const [videos, setVideos] = useState([]);

//   useEffect(() => {
//     const fetchVideos = async () => {
//       try {
//         const res = await API.get("/videos");
//         setVideos(res.data);
//       } catch (err) {
//         console.error("Erreur lors du chargement des vidéos :", err.message);
//       }
//     };
//     fetchVideos();
//   }, []);

//   const handleDelete = async (id) => {
//   if (!window.confirm("Voulez-vous vraiment supprimer cette vidéo ?")) return;

//   try {
//     await API.delete(`/videos/${id}`);
//     setVideos((prev) => prev.filter((v) => v._id !== id));
//   } catch (err) {
//     alert("❌ Erreur lors de la suppression.");
//     console.error(err);
//   }
// };


//   return (
//     <Box mt={5}>
//       <Typography variant="h6" fontWeight="bold" gutterBottom>
//         🎥 Liste des Vidéos de Formation
//       </Typography>

//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Titre</TableCell>
//               <TableCell>Niveau</TableCell>
//               <TableCell>Description</TableCell>
//               <TableCell>Badge</TableCell>
//               <TableCell>Miniature</TableCell>
//               <TableCell>Action</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {videos.map((video) => (
//               <TableRow key={video._id}>
//                 <TableCell>{video.title}</TableCell>
//                 <TableCell>{video.level?.toUpperCase()}</TableCell>
//                 <TableCell>
//                   {video.description.length > 60
//                     ? video.description.substring(0, 60) + "..."
//                     : video.description}
//                 </TableCell>
//                 <TableCell>
//                   <Chip
//                     label={video.badge === "gratuit" ? "Gratuit" : "Prenuim"}
//                     color={video.badge === "gratuit" ? "success" : "warning"}
//                     size="small"
//                   />
//                 </TableCell>
//                 <TableCell>
//                   {video.thumbnail ? (
//                     <img
//                       src={video.thumbnail}
//                       alt="Miniature"
//                       style={{ width: 60, borderRadius: 4 }}
//                     />
//                   ) : (
//                     "-"
//                   )}
//                 </TableCell>




// <TableCell>
//   <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
//     {/* ▶️ Vidéo principale */}
//     <Button
//       variant="outlined"
//       size="small"
//       href={video.videoUrl}
//       target="_blank"
//     >
//       ▶️ Vidéo principale
//     </Button>

//     {/* 📎 Vidéos supplémentaires */}
//     {Array.isArray(video.videosSupplementaires) && video.videosSupplementaires.length > 0 && (
//       <Box
//         sx={{
//           backgroundColor: "#f5f5f5",
//           p: 1,
//           borderRadius: 1,
//           width: "100%",
//           maxWidth: 200,
//         }}
//       >
//         <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
//           📎 Suppléments :
//         </Typography>

//         {video.videosSupplementaires.map((sup, idx) => (
//           <Box
//             key={idx}
//             sx={{
//               mb: 0.5,
//               "& a": {
//                 textDecoration: "none",
//                 color: "#1976d2",
//                 fontSize: "0.85rem",
//                 ":hover": { textDecoration: "underline" },
//               },
//             }}
//           >
//             <a href={sup.videoUrl} target="_blank" rel="noopener noreferrer">
//               🔹 {sup.title?.trim() ? sup.title : `Vidéo ${idx + 1}`}
//             </a>
//           </Box>
//         ))}
//       </Box>
//     )}

//     {/* ✏️ Modifier et 🗑️ Supprimer */}
//     <Box display="flex" gap={1} mt={1}>
//       <Button
//         variant="contained"
//         color="primary"
//         size="small"
//         href={`/admin/videos/edit/${video._id}`}
//       >
//         ✏️ Modifier
//       </Button>
//       <Button
//         variant="contained"
//         color="error"
//         size="small"
//         onClick={() => handleDelete(video._id)}
//       >
//         🗑️ Supprimer
//       </Button>
//     </Box>
//   </Box>
// </TableCell>


//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Box>
//   );
// };

// export default VideoList;




import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Button,
  Box,
  TablePagination,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import API from "../api";

const VideoList = () => {
  // -- État pour pagination + UX
  const [allVideos, setAllVideos] = useState([]); // Toutes les vidéos
  const [filteredVideos, setFilteredVideos] = useState([]); // Vidéos filtrées
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Pagination (0-based pour TablePagination)
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // -- État pour les filtres et recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [badgeFilter, setBadgeFilter] = useState("");

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/videos");
      const payload = res.data;

      // ✅ Backend paginé: {items,total,page,pages,limit}
      if (payload && typeof payload === "object" && Array.isArray(payload.items)) {
        setAllVideos(payload.items);
        setFilteredVideos(payload.items);
      }
      // ✅ Ancien backend (tableau brut)
      else if (Array.isArray(payload)) {
        setAllVideos(payload);
        setFilteredVideos(payload);
      } else {
        setAllVideos([]);
        setFilteredVideos([]);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors du chargement des vidéos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Fonction de filtrage
  const applyFilters = useCallback(() => {
    let filtered = [...allVideos];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par niveau
    if (levelFilter) {
      filtered = filtered.filter(video => video.level === levelFilter);
    }

    // Filtre par matière
    if (subjectFilter) {
      filtered = filtered.filter(video => (video.subject || "maths") === subjectFilter);
    }

    // Filtre par badge
    if (badgeFilter) {
      filtered = filtered.filter(video => video.badge === badgeFilter);
    }

    setFilteredVideos(filtered);
    setPage(0); // Reset à la première page quand on filtre
  }, [allVideos, searchTerm, levelFilter, subjectFilter, badgeFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Pagination côté client
  const paginatedVideos = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredVideos.slice(start, start + rowsPerPage);
  }, [filteredVideos, page, rowsPerPage]);

  // Fonction pour réinitialiser les filtres
  const handleResetFilters = () => {
    setSearchTerm("");
    setLevelFilter("");
    setSubjectFilter("");
    setBadgeFilter("");
    setPage(0);
  };

  // Statistiques
  const stats = {
    total: allVideos.length,
    gratuit: allVideos.filter(v => v.badge === "gratuit").length,
    premium: allVideos.filter(v => v.badge === "prenuim").length
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette vidéo ?")) return;
    try {
      await API.delete(`/videos/${id}`);
      // Rechargement des vidéos
      fetchVideos();
    } catch (err) {
      alert("❌ Erreur lors de la suppression.");
      console.error(err);
    }
  };

  return (
    <Box mt={5}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        🎥 Liste des Vidéos de Formation
      </Typography>

      {/* Cartes de statistiques */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.gratuit}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gratuits
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.premium}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Premium
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Barre de recherche et filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          🔍 Recherche et Filtres
        </Typography>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            placeholder="Recherche (titre, description...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Niveau</InputLabel>
            <Select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              label="Niveau"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="6eme">6ème</MenuItem>
              <MenuItem value="5eme">5ème</MenuItem>
              <MenuItem value="4eme">4ème</MenuItem>
              <MenuItem value="3eme">3ème</MenuItem>
              <MenuItem value="seconde">Seconde</MenuItem>
              <MenuItem value="premiere">Première</MenuItem>
              <MenuItem value="terminale">Terminale</MenuItem>
              <MenuItem value="universite">Université</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Matière</InputLabel>
            <Select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              label="Matière"
            >
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="maths">Mathématiques</MenuItem>
              <MenuItem value="physique">Physique</MenuItem>
              <MenuItem value="chimie">Chimie</MenuItem>
              <MenuItem value="svt">SVT</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Badge</InputLabel>
            <Select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              label="Badge"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="gratuit">Gratuit</MenuItem>
              <MenuItem value="prenuim">Premium</MenuItem>
            </Select>
          </FormControl>

          <Button 
            variant="outlined" 
            size="small" 
            onClick={handleResetFilters}
            sx={{
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: '#e3f2fd',
                color: '#1565c0'
              },
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              minWidth: '120px'
            }}
          >
            🔄 Réinitialiser
          </Button>
        </Stack>
      </Paper>

      {loading ? (
        <Stack alignItems="center" my={3}><CircularProgress /></Stack>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Titre</TableCell>
                  <TableCell>Niveau</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Badge</TableCell>
                  <TableCell>Miniature</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredVideos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary">
                        {searchTerm || levelFilter || badgeFilter 
                          ? "Aucune vidéo ne correspond aux filtres." 
                          : "Aucune vidéo."}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedVideos.map((video) => (
                  <TableRow key={video._id}>
                    <TableCell>{video.title}</TableCell>
                    <TableCell>{video.level?.toUpperCase()}</TableCell>
                    <TableCell>
                      {video.description?.length > 60
                        ? video.description.substring(0, 60) + "..."
                        : (video.description || "")}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={video.badge === "gratuit" ? "Gratuit" : "Prenuim"}
                        color={video.badge === "gratuit" ? "success" : "warning"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt="Miniature"
                          style={{ width: 60, borderRadius: 4 }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell>
                      <Box display="flex" flexDirection="column" alignItems="flex-start" gap={1}>
                        {/* ▶️ Vidéo principale */}
                        <Button
                          variant="outlined"
                          size="small"
                          href={video.videoUrl}
                          target="_blank"
                        >
                          ▶️ Vidéo principale
                        </Button>

                        {/* 📎 Vidéos supplémentaires */}
                        {Array.isArray(video.videosSupplementaires) &&
                          video.videosSupplementaires.length > 0 && (
                            <Box
                              sx={{
                                backgroundColor: "#f5f5f5",
                                p: 1,
                                borderRadius: 1,
                                width: "100%",
                                maxWidth: 200,
                              }}
                            >
                              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                📎 Suppléments :
                              </Typography>

                              {video.videosSupplementaires.map((sup, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    mb: 0.5,
                                    "& a": {
                                      textDecoration: "none",
                                      color: "#1976d2",
                                      fontSize: "0.85rem",
                                      ":hover": { textDecoration: "underline" },
                                    },
                                  }}
                                >
                                  <a href={sup.videoUrl} target="_blank" rel="noopener noreferrer">
                                    🔹 {sup.title?.trim() ? sup.title : `Vidéo ${idx + 1}`}
                                  </a>
                                </Box>
                              ))}
                            </Box>
                          )}

                        {/* ✏️ Modifier et 🗑️ Supprimer */}
                        <Box display="flex" gap={1} mt={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            href={`/admin/videos/edit/${video._id}`}
                          >
                            ✏️ Modifier
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(video._id)}
                          >
                            🗑️ Supprimer
                          </Button>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ✅ TablePagination */}
          <TablePagination
            component="div"
            count={filteredVideos.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Lignes par page:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
            }
            sx={{ 
              borderTop: '1px solid #e0e0e0',
              '& .MuiTablePagination-toolbar': {
                paddingLeft: 2,
                paddingRight: 2,
              }
            }}
          />
        </>
      )}
    </Box>
  );
};

export default VideoList;
