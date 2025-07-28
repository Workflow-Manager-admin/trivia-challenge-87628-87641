import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import AuthPage from "./components/AuthPage";
import CategoryPage from "./components/CategoryPage";
import QuizPage from "./components/QuizPage";
import ResultModal from "./components/ResultModal";
import InstructionsModal from "./components/InstructionsModal";
import LeaderboardSidebar from "./components/LeaderboardSidebar";
import { getAuthStatus, logout as apiLogout } from "./services/auth";
import { getWebSocketUrl } from "./services/api";

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [ws, setWs] = useState(null);

  // Theme handling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // On mount, check authentication
  useEffect(() => {
    getAuthStatus().then(setIsAuthenticated);
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // PUBLIC_INTERFACE
  const logout = () => {
    apiLogout();
    setIsAuthenticated(false);
  };

  // PUBLIC_INTERFACE
  const handleFinishQuiz = (result) => {
    setFinalResult(result);
    setShowResult(true);
  };

  // PUBLIC_INTERFACE
  const connectWebSocket = () => {
    const url = getWebSocketUrl();
    const wsInstance = new window.WebSocket(url);
    setWs(wsInstance);
    return wsInstance;
  };

  if (!isAuthenticated) {
    return (
      <div className="App">
        <div className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</div>
        <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header" style={{ borderBottom: "1px solid var(--border-color)", marginBottom: 24 }}>
          <div className="header-wrapper" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%"
          }}>
            <span className="app-logo" style={{ fontWeight: "bold", fontSize: 28, color: "var(--text-secondary)" }}>
              QuickQuiz
            </span>
            <div>
              <button className="btn" onClick={() => setShowInstructions(true)} style={{ marginRight: 12 }}>Instructions</button>
              <button className="btn" onClick={logout}>Log Out</button>
              <button className="theme-toggle" onClick={toggleTheme}>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
            </div>
          </div>
        </header>
        <div style={{ display: "flex", minHeight: "80vh" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Routes>
              <Route path="/categories" element={
                <CategoryPage />
              } />
              <Route path="/quiz/:mode/:category" element={
                <QuizPage ws={ws} connectWebSocket={connectWebSocket} onFinish={handleFinishQuiz} />
              } />
              <Route path="*" element={<Navigate to="/categories" />} />
            </Routes>
            <InstructionsModal open={showInstructions} onClose={() => setShowInstructions(false)} />
            <ResultModal open={showResult} onClose={() => setShowResult(false)} result={finalResult} />
          </div>
          {/* Show sidebar with leaderboard in multiplayer */}
          <LeaderboardSidebar />
        </div>
      </div>
    </Router>
  );
}

export default App;
