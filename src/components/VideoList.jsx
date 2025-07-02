import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import API from "../api";

const VideoList = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await API.get("/videos");
        setVideos(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des vidéos :", err.message);
      }
    };
    fetchVideos();
  }, []);

  return (
    <Box mt={5}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        🎥 Liste des Vidéos de Formation
      </Typography>

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
                  {video.description.length > 60
                    ? video.description.substring(0, 60) + "..."
                    : video.description}
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
                  <Button
                    variant="outlined"
                    size="small"
                    href={video.videoUrl}
                    target="_blank"
                  >
                    ▶️ Regarder
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default VideoList;
