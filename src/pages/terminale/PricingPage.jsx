import React, {useState,  useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from "@mui/material";

import { Box,  Grid, Paper } from "@mui/material";
import PageLayout from "../../components/PageLayout";
import { Link, useNavigate } from "react-router-dom";

import API from "../../api";

import { AuthContext } from "../../context/AuthContext"; // adapte le chemin

const PricingPage = () => {

    const { user, refreshUser } = useContext(AuthContext); // 👈 ajoute refreshUser ici
    const [openModal, setOpenModal] = useState(false);
    const navigate = useNavigate();

    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("nita"); // "nita" ou "visa"
    const [nitaNumber, setNitaNumber] = useState("");

  return (
     <PageLayout>
   <Box p={4} mt={8}  sx={{ backgroundColor: "#ECEFF1" }}>
      <Typography
      variant="h1"
      fontWeight="bold"
      textAlign="center"
      mb={6}
      sx={{ color: "#D27C19" }}
    >
      Explorez vos options
    </Typography>


<Box
  mt={4}
  mb={6}
  px={3}
  py={4}
  sx={{
    maxWidth: "800px",
    mx: "auto",
    backgroundColor: "#0d1117", // fond sombre stylisé
    border: "4px solid #1976D2",
    borderRadius: 4,
    textAlign: "center",
    boxShadow: 3,
    color: "#fff", // texte blanc
  }}
>
  <Typography variant="h6" fontWeight="bold" mb={2}>
    Merci de faire un dépôt via <strong style={{ color: "#90caf9" }}>NITA</strong>.
  </Typography>
  <Typography mb={2}>
     Numéro de dépôt : <strong style={{ color: "#90caf9" }}>+227 123456</strong><br />
     Support : <strong style={{ color: "#90caf9" }}>+227 80 64 83 83</strong>
  </Typography>
  <Typography fontWeight="bold">
    Votre code d’activation vous sera envoyé <strong style={{ color: "#90caf9" }}>instantanément</strong> après le paiement.
  </Typography>
</Box>



<Grid container spacing={3} justifyContent="center" sx={{ mt: 5 }}>
  {/* Offre Gratuite */}
  <Grid item xs={12} sm={6} md={4}>
    <Paper
      sx={{
        border: "4px solid #00bfff",
        borderRadius: 4,
        p: 3,
        textAlign: "center",
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Basic
      </Typography>
      <Typography variant="h6" gutterBottom>$0 FCFA</Typography>
      <ul style={{ listStyle: "none", padding: 0, textAlign: "left", color: "#ccc" }}>
        <li style={{ color: "#fff" }}>✔️ Explications simples</li>
        <li style={{ textDecoration: "line-through" }}>Aides visuelles</li>
        <li style={{ textDecoration: "line-through" }}>Conseils supplémentaires</li>
      </ul>
      <Button variant="contained" sx={{ mt: 2, borderRadius: 5 }} onClick={() => navigate(user ? "/gratuit" : "/register")}>
        Accéder
      </Button>
    </Paper>
  </Grid>

  {/* Offre Annuelle */}
  <Grid item xs={12} sm={6} md={4}>
    <Paper
      sx={{
        border: "4px solid #c62828",
        borderRadius: 4,
        p: 3,
        textAlign: "center",
        backgroundColor: "#000",
        color: "#fff",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -20,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#c62828",
          color: "#fff",
          px: 2,
          py: 0.5,
          borderRadius: 3,
          fontSize: "0.8rem",
        }}
      >
        MEILLEUR CHOIX
      </Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Annuelle
      </Typography>
      <Typography variant="h6" gutterBottom>20 000 FCFA / an</Typography>
      <ul style={{ listStyle: "none", padding: 0, textAlign: "left", color: "#ccc" }}>
        <li style={{ color: "#fff" }}>✔️ Explications simples</li>
        <li style={{ color: "#fff" }}>✔️ Aides visuelles</li>
        <li style={{ color: "#fff" }}>✔️ Conseils supplémentaires</li>
      </ul>
      <Button
        variant="contained"
        color="error"
        sx={{ mt: 2, borderRadius: 5 }}
        onClick={() => (user ? setOpenPaymentModal(true) : setOpenModal(true))}
      >
        S’abonner
      </Button>
    </Paper>
  </Grid>

  {/* Offre Mensuelle */}
  <Grid item xs={12} sm={6} md={4}>
    <Paper
      sx={{
        border: "4px solid #f57c00",
        borderRadius: 4,
        p: 3,
        textAlign: "center",
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Mensuelle
      </Typography>
      <Typography variant="h6" gutterBottom>2 000 FCFA / mois</Typography>
      <ul style={{ listStyle: "none", padding: 0, textAlign: "left", color: "#ccc" }}>
        <li style={{ color: "#fff" }}>✔️ Explications simples</li>
        <li style={{ color: "#fff" }}>✔️ Aides visuelles</li>
        <li style={{ color: "#fff" }}>✔️ Conseils supplémentaires</li>
      </ul>
      <Button
        variant="contained"
        sx={{ mt: 2, borderRadius: 5 }}
        onClick={() => (user ? setOpenPaymentModal(true) : setOpenModal(true))}
      >
        S’abonner
      </Button>
    </Paper>
  </Grid>
</Grid>


<Dialog open={openModal} onClose={() => setOpenModal(false)}>
  <DialogTitle>Connexion requise</DialogTitle>
  <DialogContent>
    <Typography>
      Veuillez vous inscrire ou vous connecter avant de pouvoir vous abonner à l’offre Premium.
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenModal(false)}>Fermer</Button>
    <Button component={Link} to="/register" onClick={() => setOpenModal(false)}>
      S'inscrire
    </Button>
    <Button component={Link} to="/login" onClick={() => setOpenModal(false)}>
      Se connecter
    </Button>
  </DialogActions>
</Dialog>




<Dialog open={openPaymentModal} onClose={() => setOpenPaymentModal(false)} maxWidth="xs" fullWidth>
  <DialogTitle>Paiement de l’abonnement</DialogTitle>
  <DialogContent>
    <Box display="flex" justifyContent="center" gap={2} mb={2}>
      <Button
        variant={paymentMethod === "visa" ? "contained" : "outlined"}
        onClick={() => setPaymentMethod("visa")}
      >
        💳 Visa
      </Button>
      <Button
        variant={paymentMethod === "nita" ? "contained" : "outlined"}
        onClick={() => setPaymentMethod("nita")}
      >
        📱 NITA
      </Button>
    </Box>

    {paymentMethod === "nita" && (
      <Box mt={2}>
        <Typography mb={1}>Entrez le numéro de transaction NITA :</Typography>
        <input
          type="text"
          value={nitaNumber}
          onChange={(e) => setNitaNumber(e.target.value)}
          placeholder="+227 123456"
          style={{ width: "100%", padding: "8px", fontSize: "16px" }}
        />
      </Box>
    )}

    {paymentMethod === "visa" && (
      <Box mt={2}>
        <Typography>🔒 Paiement sécurisé par carte bancaire (Visa)...</Typography>
        <Button variant="contained" fullWidth sx={{ mt: 2 }}>
          Payer avec Visa
        </Button>
      </Box>
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setOpenPaymentModal(false)}>Annuler</Button>
    <Button
      variant="contained"
      disabled={paymentMethod === "nita" && nitaNumber.trim() === ""}
      onClick={async () => {
        if (paymentMethod === "nita") {
          try {
            const res = await API.post("/payments/simulate", {
              phone: user.phone,
              amount: nitaNumber === "2000" ? 2000 : 15000,
              reference: nitaNumber === "2000" ? "fahimta-mois" : "fahimta-annee"
            });

            alert("✅ Abonnement activé avec succès !");
            await refreshUser(); // 👈 recharge les vraies données depuis le backend
            navigate("/premium");
          } catch (error) {
            alert("❌ Échec de l'activation : " + (error.response?.data?.message || "Erreur inconnue."));
          }
        } else {
          alert("Paiement Visa non encore disponible.");
        }

        setOpenPaymentModal(false);
      }}
    >
      Valider
    </Button>
  </DialogActions>
</Dialog>




    </Box>

     </PageLayout>
  );
 
};

export default PricingPage;
