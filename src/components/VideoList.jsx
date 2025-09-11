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




import React, { useEffect, useState, useCallback } from "react";
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
  Pagination,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";
import API from "../api";

const VideoList = () => {
  // -- État pour pagination + UX
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(8);         // ajuste si besoin
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination côté client si le backend renvoie un tableau brut
  const paginateClient = (arr, p, l) => {
    const total = arr.length;
    const nbPages = Math.max(Math.ceil(total / l), 1);
    const safe = Math.min(Math.max(p, 1), nbPages);
    const start = (safe - 1) * l;
    return { items: arr.slice(start, start + l), pages: nbPages, page: safe };
  };

  const fetchVideos = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/videos", { params: { page: p, limit } });
      const payload = res.data;

      // ✅ Backend paginé: {items,total,page,pages,limit}
      if (payload && typeof payload === "object" && Array.isArray(payload.items)) {
        setVideos(payload.items);
        setPages(payload.pages ?? 1);
      }
      // ✅ Ancien backend (tableau brut)
      else if (Array.isArray(payload)) {
        const { items, pages: nbPages } = paginateClient(payload, p, limit);
        setVideos(items);
        setPages(nbPages);
      } else {
        setVideos([]);
        setPages(1);
      }
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors du chargement des vidéos.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchVideos(page);
  }, [page, fetchVideos]);

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette vidéo ?")) return;
    try {
      await API.delete(`/videos/${id}`);
      // Rechargement de la page courante pour rester cohérent (serveur ou client)
      fetchVideos(page);
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
                {videos.map((video) => (
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Stack alignItems="center" mt={3}>
            <Pagination
              count={pages}
              page={page}
              onChange={(_, p) => setPage(p)}
              shape="rounded"
            />
          </Stack>
        </>
      )}
    </Box>
  );
};

export default VideoList;
