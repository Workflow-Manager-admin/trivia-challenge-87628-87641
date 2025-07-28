import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCategories } from "../services/api";

// PUBLIC_INTERFACE
/**
 * Page for category and game mode selection.
 */
export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [mode, setMode] = useState("single");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  // PUBLIC_INTERFACE
  const beginQuiz = () => {
    if (!selectedCat) return;
    navigate(`/quiz/${mode}/${encodeURIComponent(selectedCat)}`);
  };

  return (
    <div style={{
      maxWidth: 460,
      margin: "0 auto",
      padding: 32,
      background: "var(--bg-secondary)",
      borderRadius: 12,
      marginTop: 40,
      boxShadow: "0 2px 24px rgba(0,0,0,0.10)"
    }}>
      <h2 style={{marginBottom: 18}}>Start a New Quiz</h2>
      <label style={labelStyle}>Pick a category:</label>
      <select className="input" style={inputStyle} value={selectedCat} onChange={e => setSelectedCat(e.target.value)}>
        <option value="">Select a category</option>
        {categories.map(c =>
          <option key={c} value={c}>{c}</option>
        )}
      </select>

      <label style={labelStyle}>Mode:</label>
      <div>
        <button
          className={`btn ${mode === "single" ? "btn-primary" : ""}`}
          style={modeBtnStyle(mode === "single")}
          onClick={() => setMode("single")}
        >Single Player</button>
        <button
          className={`btn ${mode === "multi" ? "btn-primary" : ""}`}
          style={modeBtnStyle(mode === "multi")}
          onClick={() => setMode("multi")}
        >Multiplayer</button>
      </div>
      <button
        className="btn"
        style={{
          ...buttonStyle,
          marginTop: 26,
          backgroundColor: selectedCat ? "var(--button-bg)" : "#b0b0b0",
          cursor: selectedCat ? "pointer" : "not-allowed"
        }}
        disabled={!selectedCat}
        onClick={beginQuiz}
      >Start Quiz</button>
    </div>
  );
}

const labelStyle = { fontWeight: 600, fontSize: 16, marginTop: 16, marginBottom: 6, display: "block" };
const inputStyle = { fontSize: 16, borderRadius: 8, padding: "8px 12px", width: "100%", marginBottom: 12 };
const buttonStyle = { width: "100%", padding: "10px 0", borderRadius: 8, fontWeight: 600, fontSize: 16, background: "var(--button-bg)", color: "var(--button-text)", border: "none", marginTop: 10 };
const modeBtnStyle = active => ({
  padding: "8px 18px",
  marginRight: 8,
  marginBottom: 10,
  borderRadius: 8,
  border: "none",
  fontWeight: 600,
  fontSize: 16,
  background: active ? "var(--button-bg)" : "#f3f3f3",
  color: active ? "var(--button-text)" : "#191919",
  cursor: "pointer"
});
