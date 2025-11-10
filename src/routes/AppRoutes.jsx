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
import AdminContentRequestsPage from "../pages/admin/AdminContentRequestsPage";
import ProtectedActiveRoute from "./ProtectedActiveRoute";
import ExerciceGratuitPage from "../pages/ExerciceGratuitPage"; // ✅ Ajout

import ExerciceExemplePage from "../pages/ExerciceExemplePage";


import TerminalDashboard from "../pages/terminale/DashboardPage";

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
import ContentRequestPage from "../pages/student/ContentRequestPage";
import MesAchatsCartesPage from "../pages/student/MesAchatsCartesPage";
import PartnerDashboardPage from "../pages/admin/PartnerDashboardPage";


import PartnerManagementPage from "../pages/admin/PartnerManagementPage";


import PartnerCodesPage from "../pages/admin/PartnerCodesPage";


import AdminDistributorsPage from "../pages/admin/AdminDistributorsPage";
import TutorialsManagePage from "../pages/admin/TutorialsManagePage";

// Pages de la bibliothèque
import LibraryBibliothequePage from "../pages/LibraryBibliothequePage";
import LibrarySubjectDetailPage from "../pages/LibrarySubjectDetailPage";
import LibraryManagePage from "../pages/admin/LibraryManagePage";
import LibrarySubjectManagePage from "../pages/admin/LibrarySubjectManagePage";
import LibraryBooksManagePage from "../pages/LibraryBooksManagePage";

const AppRoutes = () => {

  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
       <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
       {/* <Route path="/gratuit" element={<GratuitFahimtaPage />} /> */}

       <Route
  path="/gratuit"
  element={
     <ProtectedRoute>
      <GratuitFahimtaPage />
     </ProtectedRoute>
  }
/>

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
 <Route path="/admin/content-requests" element={<AdminContentRequestsPage />} />
<Route path="/teacher/chat" element={<TeacherChatPage />} />


{user?.role === "eleve" && user?.isSubscribed && (
  <Route path="/premium/chat" element={<StudentChatPage />} />
)}

<Route path="/student/support-request" element={<SupportRequestFormPage />} />
<Route path="/student/chat-history" element={<StudentChatHistory />} />

{/* ✅ Route demandes de contenu (premium uniquement) */}
<Route
  path="/mes-demandes"
  element={
    <ProtectedRoute>
      <ContentRequestPage />
    </ProtectedRoute>
  }
/>

{/* 💳 Route achats de cartes (élèves non abonnés) */}
<Route
  path="/mes-achats-cartes"
  element={
    <ProtectedRoute>
      <MesAchatsCartesPage />
    </ProtectedRoute>
  }
/>





<Route path="/partner/dashboard" element={<PartnerDashboardPage />} />

<Route path="/admin/partners/manage" element={<PartnerManagementPage />} />


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






<Route
  path="/dashboard/terminale"
  element={
    <ProtectedActiveRoute>
      <TerminalDashboard />
    </ProtectedActiveRoute>
  }
/>




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

<Route
  path="/admin/distributors"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDistributorsPage />
    </ProtectedRoute>
  }
/>

<Route path="/admin/partner-codes" element={<PartnerCodesPage />} />

      {/* 🎥 Gestion des tutoriels */}
      <Route
        path="/admin/tutorials"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <TutorialsManagePage />
          </ProtectedRoute>
        }
      />

      {/* 📝 Création Sujet d'Examen */}
      <Route
        path="/admin/exams/create"
        element={
          <ProtectedRoute roles={["admin"]}>
            <ExamCreatePage />
          </ProtectedRoute>
        }
      />

{/* <Route path="/premium" element={<PremiumFahimtaPage />} /> */}

   <Route
     path="/premium"
    element={
      <ProtectedRoute>
        <PremiumFahimtaPage />
      </ProtectedRoute>
     }
  />

        {/* 📚 Routes de la bibliothèque */}
        <Route
          path="/bibliotheque"
          element={
            <ProtectedRoute>
              <LibraryBibliothequePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bibliotheque/:subjectId"
          element={
            <ProtectedRoute>
              <LibrarySubjectDetailPage />
            </ProtectedRoute>
          }
        />

        {/* 📚 Gestion de la bibliothèque (Admin) */}
        <Route
          path="/admin/library"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LibraryManagePage />
            </ProtectedRoute>
          }
        />

        {/* 📚 Gestion des matières (Admin) */}
        <Route
          path="/admin/library/manage-subjects"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LibrarySubjectManagePage />
            </ProtectedRoute>
          }
        />

        {/* 📚 Gestion des livres (Admin) */}
        <Route
          path="/admin/library/books"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <LibraryBooksManagePage />
            </ProtectedRoute>
          }
        />


    </Routes>
  );
};

export default AppRoutes;
