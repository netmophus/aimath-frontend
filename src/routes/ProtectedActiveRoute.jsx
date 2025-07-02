// // ProtectedActiveRoute.jsx
// import React, { useContext } from "react";
// import { Navigate } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";

// const ProtectedActiveRoute = ({ children }) => {
//   const { user } = useContext(AuthContext);

//   if (!user) return <Navigate to="/login" />;
//   if (!user.isActive) return <Navigate to="/mon-compte" />; // 🔒 redirection si inactif

//   return children;
// };

// export default ProtectedActiveRoute;



import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedActiveRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;

  // 🟢 Autoriser l'accès même si inactif pour certaines pages gratuites
  const publicPathsForInactives = [
    "/dashboard",         // autoriser tous les chemins qui commencent par ça
    "/exercice-gratuit",
    "/programme-terminal",
    "/exemples",
  ];

  const isPathAllowedForInactive = publicPathsForInactives.some((path) =>
    location.pathname.startsWith(path)
  );

  if (!user.isActive && !isPathAllowedForInactive) {
    return <Navigate to="/mon-compte" />;
  }

  return children;
};

export default ProtectedActiveRoute;
