import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import JobSearch from './pages/JobSearch';
import ATSScoring from './pages/ATSScoring';
import Portfolio from './pages/Portfolio';
import Roadmaps from './pages/Roadmaps';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import InterviewPrep from './pages/InterviewPrep';
import RoadmapGenerator from './pages/RoadmapGenerator';
import ChatbotAssistant from './pages/ChatbotAssistant';
import ResumeBuilder from './pages/ResumeBuilder';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';
import './Card.css';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-shell">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`app-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="app-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
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
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
