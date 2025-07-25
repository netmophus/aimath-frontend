import React from "react";
import { Routes, Route } from "react-router-dom";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";

import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import HomePage from "../pages/HomePage"; // à créer
import DashboardPage from "../pages/DashboardPage"; // protégé
import ProtectedRoute from "./ProtectedRoute";
import CompleteProfilePage from "../pages/CompleteProfilePage";
import VerifyOtpPage from "../pages/VerifyOtpPage";
import AideDetailleePage from "../pages/AideDetailleePage";
import MonComptePage from "../pages/MonComptePage";

import AdminRegisterPage from "../pages/AdminRegisterPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminAccessCodePage from "../pages/admin/AdminAccessCodePage";
import ProtectedActiveRoute from "./ProtectedActiveRoute";
import ExerciceGratuitPage from "../pages/ExerciceGratuitPage"; // ✅ Ajout

import ExerciceExemplePage from "../pages/ExerciceExemplePage";


import TerminalDashboard from "../pages/terminale/DashboardPage";
// import TerminalCProgrammePage from "../pages/terminale/ProgrammePage";


// import TerminalDDashboard from "../pages/terminale-d/DashboardPage";
// import TerminalADashboard from "../pages/terminale-a/DashboardPage";
import FreeAIAssistantTCPage from "../pages/terminale/FreeAIAssistantTCPage";

import IATCPremiumPage from '../pages/terminale/IATCPremiumPage';
import PricingPage from "../pages/terminale/PricingPage";
import GratuitFahimtaPage from "../pages/GratuitFahimtaPage";
import  VerifyPage from "../components/VerifyPage";
import BookCreatePage from "../pages/admin/BookCreatePage";
import VideoCreatePage from "../pages/admin/VideoCreatePage"; // 👈 importe la page
import VideoEditPage from "../components/VideoEditPage";
import TeachersPage from '../pages/admin/TeachersPage';
import ExamCreatePage from "../pages/admin/ExamCreatePage";
import PremiumFahimtaPage from "../pages/PremiumFahimtaPage"; // adapte le chemin si nécessaire
import TeacherProfilePage from "../pages/teacher/TeacherProfilePage";
import TeacherDashboardPage from "../pages/teacher/TeacherDashboardPage";
import TeacherChatPage from "../pages/teacher/TeacherChatPage";
import StudentChatPage from "../pages/student/StudentChatPage";
import SupportRequestFormPage from "../pages/student/SupportRequestFormPage";
import StudentChatHistory from "../components/student/StudentChatHistory";





const AppRoutes = () => {

  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
       <Route path="/gratuit" element={<GratuitFahimtaPage />} />

    <Route path="/verify" element={<VerifyPage />} />
<Route path="/teacher/profile" element={<TeacherProfilePage />} />
<Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />



      <Route
  path="/dashboard/:classLevel"
  element={
    <ProtectedActiveRoute>
      <DashboardPage />
    </ProtectedActiveRoute>
  }
/> 



<Route
  path="/aide-detaillee"
  element={
    <ProtectedActiveRoute>
      <AideDetailleePage />
    </ProtectedActiveRoute>
  }
/>


<Route path="/complete-profile" element={<CompleteProfilePage />} />
<Route path="/verify" element={<VerifyOtpPage />} />



<Route path="/mon-compte" element={<MonComptePage />} />

<Route path="/admin-register" element={<AdminRegisterPage />} />



<Route path="/admin-dashboard" element={<AdminDashboardPage />} />
 <Route path="/admin/codes" element={<AdminAccessCodePage />} />
 <Route path="/admin/teachers" element={<TeachersPage />} />
<Route path="/teacher/chat" element={<TeacherChatPage />} />


{user?.role === "eleve" && user?.isSubscribed && (
  <Route path="/premium/chat" element={<StudentChatPage />} />
)}

<Route path="/student/support-request" element={<SupportRequestFormPage />} />
<Route path="/student/chat-history" element={<StudentChatHistory />} />


<Route path="/exercice-gratuit" element={<ProtectedRoute><ExerciceGratuitPage /></ProtectedRoute>} />

{/* <Route path="/programme-terminal-c" element={<ProtectedRoute><TerminalCProgrammePage /></ProtectedRoute>} />
 */}





<Route
  path="/exemples"
  element={
    <ProtectedRoute>
      <ExerciceExemplePage />
    </ProtectedRoute>
  }
/>



{/* 
<Route
  path="/dashboard/terminale-c"
  element={
    <ProtectedActiveRoute>
      <TerminalCDashboard />
    </ProtectedActiveRoute>
  }
/> */}


<Route
  path="/dashboard/terminale"
  element={
    <ProtectedActiveRoute>
      <TerminalDashboard />
    </ProtectedActiveRoute>
  }
/>


{/* <Route
  path="/programme/terminale-c"
  element={
    <ProtectedActiveRoute>
      <TerminalCProgrammePage />
    </ProtectedActiveRoute>
  }
/> */}

 {/* 🤖 Assistant IA gratuit Terminale C */}
      <Route path="/terminal-c/ia-gratuit" element={<FreeAIAssistantTCPage />} />


<Route path="/terminal-c/ia-premium" element={<IATCPremiumPage />} />

<Route path="/pricing" element={<PricingPage />} />

<Route path="/admin/books/create" element={<BookCreatePage />} />


<Route
        path="/admin/videos/create"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <VideoCreatePage />
          </ProtectedRoute>
        }
      />


<Route
  path="/admin/videos/edit/:id"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <VideoEditPage />
    </ProtectedRoute>
  }
/>





      {/* 📝 Création Sujet d’Examen */}
      <Route
        path="/admin/exams/create"
        element={
          <ProtectedRoute roles={["admin"]}>
            <ExamCreatePage />
          </ProtectedRoute>
        }
      />

<Route path="/premium" element={<PremiumFahimtaPage />} />

{/* <Route
  path="/dashboard/terminale-d"
  element={
    <ProtectedActiveRoute>
      <TerminalDDashboard />
    </ProtectedActiveRoute>
  }
/> */}



{/* <Route
  path="/dashboard/terminale-a"
  element={
    <ProtectedActiveRoute>
      <TerminalADashboard />
    </ProtectedActiveRoute>
  }
/> */}


    </Routes>
  );
};

export default AppRoutes;
