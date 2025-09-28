// components/PremiumBadge.jsx
import React, { useMemo } from "react";
import { Chip, Tooltip } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function daysLeft(end) {
  if (!end) return null;
  const d = Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24));
  return d;
}

export default function PremiumBadge({ subscriptionEnd, onClick }) {
  const d = useMemo(() => daysLeft(subscriptionEnd), [subscriptionEnd]);

  if (d === null) return null;

  const label =
    d > 30 ? "Premium" :
    d >= 7 ? `Premium — J-${d}` :
    d >= 1 ? `Premium — J-${d}` :
    d === 0 ? "Premium — expire aujourd’hui" :
    "Premium — expiré";

  const color =
    d > 7 ? "success" :
    d >= 1 ? "warning" :
    d === 0 ? "warning" :
    "default";

  const icon =
    d >= 1 ? <StarRoundedIcon /> : <AccessTimeIcon />;

  return (
    <Tooltip title={`Expiration : ${new Date(subscriptionEnd).toLocaleDateString("fr-FR")}`}>
      <Chip
        icon={icon}
        label={label}
        color={color}
        variant="filled"
        onClick={onClick}
        sx={{
          fontWeight: 700,
          borderRadius: 2,
          cursor: onClick ? "pointer" : "default",
        }}
      />
    </Tooltip>
  );
}
