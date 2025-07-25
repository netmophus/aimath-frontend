import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
} from "@mui/material";
import API from "../../api";
import PageLayout from "../../components/PageLayout";

const levelsOptions = [
  "6ème", "5ème", "4ème", "3ème",
  "Seconde A", "Seconde C",
  "Première A", "Première C", "Première D",
  "Terminale A", "Terminale C", "Terminale D",
  "Université"
];

const subjectsOptions = [
  "Mathématiques",
  "Physique - Chimie",
  "SVT",
  "Français",
  "Anglais",
  "Histoire - Géographie",
  "Philosophie",
  "Économie",
  "Informatique",
  "Arabe"
];


const TeacherProfilePage = () => {

const [form, setForm] = useState({
  fullName: "",
  schoolName: "",
  city: "",
  phone: "",
  email: "",
  subjects: [],
  levels: [],
  gpsLocation: "",
  level: "",        // ✅ niveau d’étude
  experience: "",   // ✅ expérience
});





  const [message, setMessage] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await API.get("/users/profile");
      const teacher = res.data;

setForm({
  fullName: teacher.fullName || "",
  schoolName: teacher.schoolName || "",
  city: teacher.city || "",
  phone: teacher.phone || "",
  email: teacher.email || "",
  subjects: Array.isArray(teacher.subjects) ? teacher.subjects : [],
  levels: Array.isArray(teacher.levels) ? teacher.levels : [],
  gpsLocation: teacher.gpsLocation || "",
  level: teacher.level || "",
  experience: teacher.experience || "",
});





    } catch (error) {
      console.error("Erreur récupération profil :", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLevelsChange = (e) => {
    setForm({ ...form, levels: e.target.value });
  };


const handleSubjectsChange = (e) => {
  setForm({ ...form, subjects: e.target.value });
};



  // const handleSubmit = async () => {
  //   try {
  //     await API.put("/users/profile", form);
  //     setMessage("✅ Profil mis à jour avec succès.");
  //   } catch (err) {
  //     console.error(err);
  //     setMessage("❌ Erreur lors de la mise à jour.");
  //   }
  // };

const handleSubmit = async () => {
  try {
    const formToSend = { ...form };

    // 🔍 Vérifier si gpsLocation est une chaîne de texte (ex: "13.51,2.12")
    if (typeof form.gpsLocation === "string" && form.gpsLocation.includes(",")) {
      const [lat, lng] = form.gpsLocation.split(",").map((val) => parseFloat(val.trim()));

      // ✅ Si les valeurs sont valides, on les ajoute
      if (!isNaN(lat) && !isNaN(lng)) {
        formToSend.gpsLocation = {
          latitude: lat,
          longitude: lng,
        };
      } else {
        // ❌ Si c'est mal formaté, on ignore le champ
        delete formToSend.gpsLocation;
      }
    } else {
      // 🛑 Si non défini ou mal formaté, on supprime pour éviter erreur backend
      delete formToSend.gpsLocation;
    }

    await API.put("/users/profile", formToSend);
    setMessage("✅ Profil mis à jour avec succès.");
  } catch (err) {
    console.error(err);
    setMessage("❌ Erreur lors de la mise à jour.");
  }
};

  const handlePhotoUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "preset_fahimta"); // Cloudinary preset

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/ton_cloud_name/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setForm((prev) => ({ ...prev, photo: data.secure_url }));
  } catch (err) {
    console.error("Erreur upload photo :", err);
  }
};


  return (
    <PageLayout>
      <Box p={4} mt={10}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          👨‍🏫 Complétez votre profil enseignant
        </Typography>

        {message && (
          <Typography color="primary" mb={2}>
            {message}
          </Typography>
        )}

        <Paper sx={{ p: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>

<TextField
  fullWidth
  type="file"
  inputProps={{ accept: "image/*" }}
  onChange={(e) => handlePhotoUpload(e.target.files[0])}
/>



<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Nom complet"
    name="fullName"
    value={form.fullName}
    onChange={handleChange}
  />
</Grid>


<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Niveau d’étude"
    name="level"
    value={form.level}
    onChange={handleChange}
  />
</Grid>

<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Expérience (ex: 5 ans)"
    name="experience"
    value={form.experience}
    onChange={handleChange}
  />
</Grid>


<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="École"
    name="schoolName"
    value={form.schoolName}
    onChange={handleChange}
  />
</Grid>

<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Ville"
    name="city"
    value={form.city}
    onChange={handleChange}
  />
</Grid>

<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Téléphone"
    name="phone"
    value={form.phone}
    onChange={handleChange}
  />
</Grid>

<Grid item xs={12} md={6}>
  <TextField
    fullWidth
    label="Email"
    name="email"
    value={form.email}
    onChange={handleChange}
  />
</Grid>


<Grid item xs={12} md={6}>
  <TextField
    select
    fullWidth
    label="Matières"
    name="subjects"
    value={form.subjects}
    onChange={handleSubjectsChange}
    SelectProps={{ multiple: true }}
  >
    {subjectsOptions.map((subject) => (
      <MenuItem key={subject} value={subject}>
        {subject}
      </MenuItem>
    ))}
  </TextField>
</Grid>








            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Niveaux"
                name="levels"
                value={form.levels}
                onChange={handleLevelsChange}
                SelectProps={{ multiple: true }}
              >
                {levelsOptions.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Localisation GPS (facultatif)"
                name="gpsLocation"
                value={form.gpsLocation}
                onChange={handleChange}
                placeholder="Ex: 13.5116,2.1254"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSubmit}
              >
                Enregistrer
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default TeacherProfilePage;
