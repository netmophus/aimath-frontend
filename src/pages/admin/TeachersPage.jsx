import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  TextField,
  IconButton,
  Switch,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import API from "../../api";
import PageLayout from "../../components/PageLayout";

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);





  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    password: "",
    schoolName: "",
    city: "",
  });

  const fetchTeachers = async () => {
   const res = await API.get("/users/teachers");
    setTeachers(res.data);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await API.post("/auth/register", {
        ...form,
        role: "teacher",
      });
      setForm({ fullName: "", phone: "", password: "", schoolName: "", city: "" });
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création");
    }
  };



  const toggleActive = async (id, current) => {
  await API.patch(`/users/teachers/${id}/toggle`);
  fetchTeachers();
};

  
const deleteTeacher = async (id) => {
  if (window.confirm("Supprimer cet enseignant ?")) {
    await API.delete(`/users/teachers/${id}`);
    fetchTeachers();
  }
};


  return (
    <PageLayout>
      <Box p={4} mt={10}>
        <Typography variant="h4" fontWeight="bold" mb={4}>
          👨‍🏫 Gestion des Enseignants
        </Typography>

        {/* Formulaire */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" mb={2}>Créer un enseignant</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Nom complet" name="fullName" value={form.fullName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Téléphone" name="phone" value={form.phone} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Mot de passe" name="password" value={form.password} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="École" name="schoolName" value={form.schoolName} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Ville" name="city" value={form.city} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button variant="contained" onClick={handleSubmit} fullWidth>
                Enregistrer
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Liste des enseignants */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>Liste des enseignants</Typography>
          <Grid container spacing={1}>
            {teachers.map((teacher) => (
              <Grid item xs={12} key={teacher._id}>
                <Paper sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography><strong>Nom:</strong> {teacher.fullName}</Typography>
                    <Typography><strong>Téléphone:</strong> {teacher.phone}</Typography>
                    <Typography><strong>École:</strong> {teacher.schoolName}</Typography>
                    <Typography><strong>Ville:</strong> {teacher.city}</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Switch
                      checked={teacher.isActive}
                      onChange={() => toggleActive(teacher._id, teacher.isActive)}
                      color="success"
                    />
                    <IconButton onClick={() => deleteTeacher(teacher._id)} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default TeachersPage;
