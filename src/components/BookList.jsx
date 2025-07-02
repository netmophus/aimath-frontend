import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Typography, Link, Avatar
} from "@mui/material";
import API from "../api"; // ou ton chemin vers axios

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
                <Avatar variant="square" src={book.coverImage} alt="Couverture" sx={{ width: 56, height: 56 }} />
              </TableCell>
              <TableCell>
                <Link href={book.fileUrl} target="_blank" rel="noopener">
                  📄 Télécharger
                </Link>
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
