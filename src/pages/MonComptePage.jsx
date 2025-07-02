// import React, { useContext, useState } from "react";
// import { Box, Typography, TextField, Button, Alert } from "@mui/material";
// import PageLayout from "../components/PageLayout";
// import { AuthContext} from "../context/AuthContext";
// import API from "../api";



// const MonComptePage = () => {

//   const [code, setCode] = useState("");
//   const [message, setMessage] = useState("");
//   const { user, refreshUser } = useContext(AuthContext); // ✅ tout passe par le contexte

//   const handleRecharge = async () => {
//     try {
//       const res = await API.post("/student/recharge", { code });
//       setMessage(res.data.message);
//       // Optionnel : forcer une actualisation du contexte ou reload de l’utilisateur

//       await refreshUser();
//         setMessage("✅ Recharge effectuée avec succès !");

//     } catch (err) {
//       setMessage(err.response?.data?.message || "❌ Code invalide.");
//     }
//   };

//   return (
//     <PageLayout>
//       <Typography variant="h5" mt={4}>
//         💳 Mon compte
//       </Typography>

//       {user && (
//         <Box mt={3}>
//           <Typography variant="body1">
//             ✅ <strong>Statut du compte :</strong> {user.isActive ? "Actif" : "Inactif"}
//           </Typography>
//           <Typography variant="body1" mt={1}>
//             💰 <strong>Solde :</strong> {user.balance} crédits
//           </Typography>
//           {user.subscriptionExpiresAt && (
//             <Typography variant="body1" mt={1}>
//               📅 <strong>Expire le :</strong> {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
//             </Typography>
//           )}
//         </Box>
//       )}

//       <Box mt={4}>
//         <Typography variant="body1" gutterBottom>
//           🔢 Entrez un code de recharge :
//         </Typography>
//         <TextField
//           fullWidth
//           label="Code de recharge"
//           value={code}
//           onChange={(e) => setCode(e.target.value)}
//         />
//         <Button variant="contained" sx={{ mt: 2 }} onClick={handleRecharge}>
//           Valider
//         </Button>
//         {message && (
//           <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mt: 2 }}>
//             {message}
//           </Alert>
//         )}
//       </Box>
//     </PageLayout>
//   );
// };

// export default MonComptePage;





import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import { AuthContext } from "../context/AuthContext";
import API from "../api";
import { useNavigate } from "react-router-dom";

const MonComptePage = () => {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loadingRedirect, setLoadingRedirect] = useState(true);

  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.isActive && user.classLevel) {
        const encoded = encodeURIComponent(user.classLevel);
        setTimeout(() => {
          navigate(`/dashboard/${encoded}`);
        }, 2000); // ⏱️ Attente de 2s
      } else {
        setLoadingRedirect(false); // ❌ Pas de redirection, afficher le contenu
      }
    }
  }, [user, navigate]);

  const handleRecharge = async () => {
    try {
      const res = await API.post("/student/recharge", { code });
      setMessage(res.data.message);
      await refreshUser();
      setMessage("✅ Recharge effectuée avec succès !");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Code invalide.");
    }
  };

  // 🌀 Si on attend la redirection...
  if (loadingRedirect) {
    return (
      <PageLayout>
        <Box mt={6} textAlign="center">
          <Typography variant="h6">
            ✅ Bienvenue Terminale {user?.classLevel?.toUpperCase() || ""}
          </Typography>
          <Typography variant="body1" mt={2}>
            Redirection automatique vers ton tableau de bord...
          </Typography>
          <Box mt={3}>
            <CircularProgress />
          </Box>
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Typography variant="h5" mt={4}>
        💳 Mon compte
      </Typography>

      {user && (
        <Box mt={3}>
          <Typography variant="body1">
            ✅ <strong>Statut du compte :</strong>{" "}
            {user.isActive ? "Actif" : "Inactif"}
          </Typography>
          <Typography variant="body1" mt={1}>
            💰 <strong>Solde :</strong> {user.balance} crédits
          </Typography>
          {user.subscriptionExpiresAt && (
            <Typography variant="body1" mt={1}>
              📅 <strong>Expire le :</strong>{" "}
              {new Date(user.subscriptionExpiresAt).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      )}

      <Box mt={4}>
        <Typography variant="body1" gutterBottom>
          🔢 Entrez un code de recharge :
        </Typography>
        <TextField
          fullWidth
          label="Code de recharge"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button variant="contained" sx={{ mt: 2 }} onClick={handleRecharge}>
          Valider
        </Button>
        {message && (
          <Alert
            severity={message.includes("✅") ? "success" : "error"}
            sx={{ mt: 2 }}
          >
            {message}
          </Alert>
        )}
      </Box>
    </PageLayout>
  );
};

export default MonComptePage;
