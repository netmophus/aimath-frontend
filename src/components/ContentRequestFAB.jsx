// src/components/ContentRequestFAB.jsx
import React from "react";
import { Fab, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const ContentRequestFAB = () => {
  const navigate = useNavigate();

  return (
    <Tooltip title="✨ Demander du contenu" placement="left">
      <Fab
        color="secondary"
        onClick={() => navigate("/mes-demandes")}
        sx={{
          position: "fixed",
          bottom: { xs: 80, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: 1000,
          background: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
          "&:hover": {
            background: "linear-gradient(135deg, #7b1fa2, #6a1b9a)",
            transform: "scale(1.05)",
          },
          transition: "all 0.2s",
          boxShadow: "0 8px 24px rgba(156, 39, 176, 0.4)",
        }}
      >
        <AutoAwesomeIcon />
      </Fab>
    </Tooltip>
  );
};

export default ContentRequestFAB;
