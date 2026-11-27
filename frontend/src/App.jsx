import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomePage from "./pages/HomePage";
import FacultyLogin from "./pages/FacultyLogin";
import UploadPage from "./pages/UploadPage";
import ModelPapersPage from "./pages/ModelPapersPage";
import PYQPage from "./pages/PYQPage";

import Footer from "./components/Footer";

import SyllabusPage from "./pages/SyllabusPage";

import LabsPage from "./pages/LabsPage";

import CalculatorPage from "./pages/CalculatorPage";
import StudyAssistantPage from "./pages/StudyAssistantPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AcademicUpdatesPage from "./pages/AcademicUpdatesPage";
import { Link } from "react-router-dom";

function FacultyProtectedRoute({ children }) {
  const token = localStorage.getItem("facultyToken");
  const role = localStorage.getItem("facultyRole");

  if (!token || role !== "faculty") {
    return <Navigate to="/faculty-login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Link className="ai-float-button" to="/study-assistant" aria-label="Open AI Study Assistant" title="AI Study Assistant"><span aria-hidden="true">🤖</span></Link>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HomePage />
              <Footer />
            </>
          }
        />

        <Route
          path="/model-papers"
          element={
            <>
              <ModelPapersPage />
              <Footer />
            </>
          }
        />

        <Route
          path="/pyqs"
          element={
            <>
              <PYQPage />
              <Footer />
            </>
          }
        />

        <Route
          path="/faculty-login"
          element={
            <>
              <FacultyLogin />
              <Footer />
            </>
          }
        />

        <Route
          path="/upload"
          element={
            <FacultyProtectedRoute>
              <UploadPage />
            </FacultyProtectedRoute>
          }
        />

        <Route
          path="/syllabus"
          element={
            <>
              <SyllabusPage />
              <Footer />
            </>
          }
        />

         <Route
          path="/calculator"
          element={
            <>
              <CalculatorPage />
              <Footer />
            </>
          }
        />

        <Route path="/labs" element={<LabsPage />} />

        <Route path="/study-assistant" element={<StudyAssistantPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/notices" element={<AcademicUpdatesPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
