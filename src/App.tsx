import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { initializeTheme } from "./lib/theme";
import "./App.css";
import "./Card.css";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const JobSearch = lazy(() => import("./pages/JobSearch"));
const ATSScoring = lazy(() => import("./pages/ATSScoring"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Roadmaps = lazy(() => import("./pages/Roadmaps"));
const CoverLetterGenerator = lazy(() => import("./pages/CoverLetterGenerator"));
const InterviewPrep = lazy(() => import("./pages/InterviewPrep"));
const RoadmapGenerator = lazy(() => import("./pages/RoadmapGenerator"));
const ChatbotAssistant = lazy(() => import("./pages/ChatbotAssistant"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Landing = lazy(() => import("./pages/Landing"));

function ProtectedAppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-root">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`app-main ${sidebarOpen ? "sidebar-open" : ""}`}>
          <div className="app-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="loading-shell">
              <div className="loading-spinner"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              element={
                <ProtectedRoute>
                  <ProtectedAppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/jobs" element={<JobSearch />} />
              <Route path="/ats" element={<ATSScoring />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/roadmaps" element={<Roadmaps />} />
              <Route path="/cover-letter" element={<CoverLetterGenerator />} />
              <Route path="/interview-prep" element={<InterviewPrep />} />
              <Route path="/roadmap-generator" element={<RoadmapGenerator />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/ai-assistant" element={<ChatbotAssistant />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
