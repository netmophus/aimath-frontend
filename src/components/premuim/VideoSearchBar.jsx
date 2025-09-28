// src/components/premium/VideoSearchBar.jsx
import React from "react";
import { Box, TextField, Stack, Chip } from "@mui/material";

export default function VideoSearchBar({
  query,
  onQueryChange,
  activeCount = 0,
}) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.08)",
        background:
          "linear-gradient(180deg, rgba(25,118,210,0.03) 0%, rgba(25,118,210,0.06) 100%)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.2}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <TextField
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          fullWidth
          size="medium"
          label="Rechercher une vidéo (titre, matière, classe, tags…)"
          placeholder="Ex: dérivées terminale, fonctions, probabilités…"
        />
        {activeCount > 0 && (
          <Chip
            color="primary"
            label={`${activeCount} résultat${activeCount > 1 ? "s" : ""}`}
            sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
          />
        )}
      </Stack>
    </Box>
  );
}
