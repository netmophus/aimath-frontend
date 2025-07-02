import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Box,
  Button,
  Chip,
} from "@mui/material";
import API from "../api";

const ExamList = () => {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await API.get("/exams");
        setExams(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des examens :", error);
      }
    };
    fetchExams();
  }, []);

  return (
    <Box mt={5}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        📋 Liste des Sujets d'Examen
      </Typography>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Niveau</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Badge</TableCell>
              <TableCell>Publié le</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam._id}>
                <TableCell>{exam.title}</TableCell>
                <TableCell>{exam.level?.toUpperCase()}</TableCell>
                <TableCell>
                  {exam.description.length > 60
                    ? exam.description.substring(0, 60) + "..."
                    : exam.description}
                </TableCell>
                <TableCell>
                  <Chip
                    label={exam.badge === "gratuit" ? "Gratuit" : "Prenuim"}
                    color={exam.badge === "gratuit" ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(exam.createdAt).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
  <Button
    variant="outlined"
    size="small"
    href={exam.subjectUrl}
    target="_blank"
    sx={{ mr: 1 }}
  >
    📄 Sujet
  </Button>
  <Button
    variant="outlined"
    size="small"
    color="secondary"
    href={exam.correctionUrl}
    target="_blank"
  >
    📝 Correction
  </Button>
</TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ExamList;
