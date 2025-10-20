import React, { useEffect, useRef, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Dialog, DialogTitle, DialogContent, Typography, Button } from "@mui/material";

const INACTIVITY_LIMIT = 20 * 60 * 1000; // 20 minutes
const COUNTDOWN_DURATION = 60; // 60 seconds

const InactivityHandler = () => {
  const { logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const [showCountdown, setShowCountdown] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_DURATION);
  
  // ✅ Détection de la navigation (retour arrière mobile)
  const lastActivityRef = useRef(Date.now());

  const resetTimer = () => {
    lastActivityRef.current = Date.now(); // ✅ Mettre à jour l'heure de dernière activité
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
    setShowCountdown(false);
    setSecondsLeft(COUNTDOWN_DURATION);

    timerRef.current = setTimeout(() => {
      // ✅ Vérifier que l'utilisateur est vraiment inactif (pas juste en navigation)
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      if (timeSinceLastActivity >= INACTIVITY_LIMIT) {
        setShowCountdown(true);
        startCountdown();
      }
    }, INACTIVITY_LIMIT);
  };

  const startCountdown = () => {
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          logout();
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stayConnected = () => {
    resetTimer(); // relance le timer d'inactivité
  };

 // ✅ Réinitialiser le timer lors de la navigation (retour arrière mobile)
  useEffect(() => {
    if (token) {
      resetTimer(); // ✅ La navigation compte comme activité
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, token]);

  useEffect(() => {
    if (!token) return; // ⛔️ Ne rien faire si l'utilisateur n'est pas connecté

    // ✅ Ajout de "touchstart" et "touchmove" pour mobile
    const events = ["mousemove", "mousedown", "keypress", "scroll", "click", "touchstart", "touchmove"];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);


  return (
    <Dialog open={showCountdown} onClose={stayConnected}>
      <DialogTitle>⏳ Inactivité détectée</DialogTitle>
      <DialogContent>
        <Typography>
          Vous serez déconnecté dans <strong>{secondsLeft}</strong> seconde(s) si aucune action n’est détectée.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={stayConnected}
          sx={{ mt: 2 }}
        >
          Rester connecté
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default InactivityHandler;
