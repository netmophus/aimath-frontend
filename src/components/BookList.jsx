import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Link, Stack
} from "@mui/material";
import API from "../api"; // ou ton chemin vers axios
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";



const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await API.get("/admin/books");
        setBooks(res.data);
      } catch (err) {
        console.error("❌ Erreur lors du chargement des livres :", err);
      }
    };
    fetchBooks();
  }, []);

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ p: 2 }}>📚 Liste des Livres</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Titre</TableCell>
            <TableCell>Auteur</TableCell>
            <TableCell>Niveau</TableCell>
            <TableCell>Badge</TableCell>
            <TableCell>Couverture</TableCell>
            <TableCell>Fichier</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book._id}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.level}</TableCell>
              <TableCell>{book.badge}</TableCell>
              <TableCell>
<img
  src={book.coverImage}
  alt="Couverture"
  style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 4 }}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = "https://via.placeholder.com/56x56?text=N/A"; // fallback en cas d'erreur
  }}
/>




              </TableCell>
             
<TableCell>
  <Stack direction="column" spacing={0.5}>
    <Link
      href={book.fileUrl}
      target="_blank"
      rel="noopener"
      underline="hover"
      color="primary"
      display="flex"
      alignItems="center"
      gap={0.5}
    >
      <VisibilityIcon fontSize="small" />
      Lire en ligne
    </Link>
    <Link
      href={book.fileUrl}
      target="_blank"
      rel="noopener"
      underline="hover"
      color="secondary"
      display="flex"
      alignItems="center"
      gap={0.5}
    >
      <DownloadIcon fontSize="small" />
      Télécharger
    </Link>
  </Stack>
</TableCell>

              <TableCell>{new Date(book.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BookList;
