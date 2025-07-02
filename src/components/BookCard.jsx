
import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  Box,
} from "@mui/material";

const BookCard = ({ book, isPremiumUser = false }) => {
  const isGratuit = book.badge === "gratuit";

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        borderRadius: 3,
        boxShadow: 4,
        overflow: "hidden",
        mb: 3,
      }}
    >
      {/* Couverture */}
      <CardMedia
        component="img"
        image={book.coverImage}
        alt={book.title}
        sx={{
          width: { xs: "100%", sm: 180 },
          height: "auto",
          objectFit: "cover",
        }}
      />

      {/* Détails */}
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <CardContent sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📘 {book.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {book.description}
          </Typography>

          <Typography variant="caption" fontWeight="bold" sx={{ color: "#666" }}>
            🎓 Niveau : {book.level?.toUpperCase()} | 🎖️ {isGratuit ? "Gratuit" : "Prenuim"}
          </Typography>

          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            📅 Publié le : {new Date(book.createdAt).toLocaleDateString("fr-FR")}
          </Typography>
        </CardContent>

        {/* Bouton */}
        {/* <CardActions sx={{ px: 2, pb: 2 }}>
          {isGratuit ? (
            <Button
              href={book.fileUrl}
              target="_blank"
              rel="noopener"
              variant="contained"
              size="small"
              sx={{ textTransform: "none" }}
            >
              📥 Télécharger
            </Button>
          ) : (
           <Button
            variant="outlined"
            size="small"
            color="warning"
            sx={{ textTransform: "none" }}
            href="/pricing"
            >
            🔒 Réservé aux abonnés
            </Button>

          )}
        </CardActions> */}


        <CardActions sx={{ px: 2, pb: 2 }}>
  {(isGratuit || isPremiumUser) ? (
    <Button
      href={book.fileUrl}
      target="_blank"
      rel="noopener"
      variant="contained"
      size="small"
      sx={{ textTransform: "none" }}
    >
      📥 Télécharger
    </Button>
  ) : (
    <Button
      variant="outlined"
      size="small"
      color="warning"
      sx={{ textTransform: "none" }}
      href="/pricing"
    >
      🔒 Réservé aux abonnés
    </Button>
  )}
</CardActions>

      </Box>
    </Card>
  );
};

export default BookCard;
