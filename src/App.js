import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import './App.css'; // ✅ Ajout de App.css
import InactivityHandler from "./components/InactivityHandler"; // adapte le chemin
import InstallPrompt from "./components/InstallPrompt"; // ✅ PWA Install Prompt


function App() {
  return (
 
    <GoogleOAuthProvider clientId="335532031909-9fe6a4cm2dnk1n811jv45e55m47pmuuh.apps.googleusercontent.com">
  <Router>
     <InactivityHandler />
    <AppRoutes />
    <InstallPrompt />
  </Router>
</GoogleOAuthProvider>

  );
}

export default App;

