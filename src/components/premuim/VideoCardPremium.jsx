

import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const getEmbedUrl = (url) => {
  const match = url.match(/(?:youtu\.be\/|v=)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const VideoCardPremium = ({ video, isPremiumUser }) => {
  const navigate = useNavigate();
  const [showMainIframe, setShowMainIframe] = useState(false);
  const [shownParts, setShownParts] = useState([]);

  const hasAccess = video.badge === "gratuit" || isPremiumUser;

  const handleMainToggle = () => {
    setShowMainIframe(!showMainIframe);
  };

  const handlePartToggle = (index) => {
    setShownParts((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
      {video.thumbnail && (
        <img
          src={video.thumbnail}
          alt="Miniature"
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        />
      )}

      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {video.title}
          {showMainIframe && (
            <Typography
              variant="caption"
              color="success.main"
              sx={{ ml: 1, fontWeight: "normal" }}
            >
              🎬 Lecture en cours
            </Typography>
          )}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Niveau : {video.level?.toUpperCase()}
        </Typography>

        <Typography variant="body2" mt={1}>
          {video.description.length > 200
            ? video.description.substring(0, 200) + "..."
            : video.description}
        </Typography>

        <Typography variant="caption" display="block" mt={1}>
          Accès : {video.badge === "gratuit" ? "🎁 Gratuit" : "🔒 Premium"}
        </Typography>

        <Box display="flex" alignItems="center" mt={1}>
          <VisibilityIcon sx={{ fontSize: 18, color: "#999", mr: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {video.viewCount || 0} visualisation{video.viewCount > 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* ✅ Vidéo principale */}
        <Box mt={2} textAlign="center">
          {hasAccess ? (
            <>
              <Button
                variant="contained"
                color={showMainIframe ? "error" : "success"}
                onClick={handleMainToggle}
              >
                {showMainIframe
                  ? "🔽 Masquer l’introduction"
                  : "▶️ Visualiser l’introduction"}
              </Button>
              {showMainIframe && (
                <Box mt={2}>
                  <iframe
                    width="100%"
                    height="250"
                    src={getEmbedUrl(video.videoUrl)}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: "8px" }}
                  ></iframe>
                </Box>
              )}
            </>
          ) : (
            <>
              <Typography variant="body2" color="error" gutterBottom>
                Cette vidéo est réservée aux membres Premium.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/pricing")}
              >
                🔓 Débloquer l'accès
              </Button>
            </>
          )}
        </Box>

        {/* 🔽 Vidéos secondaires */}
        {Array.isArray(video.videosSupplementaires) &&
          video.videosSupplementaires.length > 0 && hasAccess && (
            <Box mt={4}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                📚 Parties du cours :
              </Typography>

              {video.videosSupplementaires.map((part, index) => {
                const isOpen = shownParts.includes(index);
                return (
                  <Box
                    key={index}
                    sx={{
                      border: "1px solid #ddd",
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                      backgroundColor: "#f9f9f9",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      🔹 {part.title || `Partie ${index + 1}`}{" "}
                      {isOpen && (
                        <Typography
                          variant="caption"
                          component="span"
                          color="success.main"
                          sx={{ ml: 1 }}
                        >
                          🎬 Lecture en cours
                        </Typography>
                      )}
                    </Typography>

                    <Button
                      variant="outlined"
                      color={isOpen ? "error" : "success"}
                      size="small"
                      sx={{ mt: 1 }}
                      onClick={() => handlePartToggle(index)}
                    >
                      {isOpen ? "🔽 Masquer" : "▶️ Visualiser"}
                    </Button>

                    {isOpen && (
                      <Box mt={2}>
                        <iframe
                          width="100%"
                          height="220"
                          src={getEmbedUrl(part.videoUrl)}
                          title={part.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ borderRadius: "8px" }}
                        ></iframe>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}
      </CardContent>
    </Card>
  );
};

export default VideoCardPremium;
