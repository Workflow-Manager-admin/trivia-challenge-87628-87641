import React, { useState } from "react";
import { login, register } from "../services/auth";

// PUBLIC_INTERFACE
/**
 * Authentication page component for login and registration.
 * Displays a minimal authentication form and manages state.
 */
export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // PUBLIC_INTERFACE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err && err.message ? err.message : "Authentication failed");
    }
  };

  return (
    <div className="auth-container" style={{
      maxWidth: 360, margin: "0 auto", padding: 24, background: "var(--bg-secondary)",
      borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.10)", marginTop: 80
    }}>
      <h2 style={{ color: "var(--text-primary)", marginBottom: 20 }}>
        {mode === "login" ? "Sign In" : "Register"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input
          autoFocus
          className="input"
          style={inputStyle}
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          className="input"
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && (
          <div style={{ color: "#e23c3c", marginBottom: 8, fontSize: 14 }}>{error}</div>
        )}
        <button className="btn" type="submit" style={buttonStyle}>
          {mode === "login" ? "Sign In" : "Register"}
        </button>
      </form>
      <div style={{ marginTop: 12, fontSize: 14 }}>
        {mode === "login" ? (
          <>
            New?{" "}
            <button className="link" style={linkStyle} type="button" onClick={() => {
              setMode("register"); setError("");
            }}>Register</button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button className="link" style={linkStyle} type="button" onClick={() => {
              setMode("login"); setError("");
            }}>Sign In</button>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  display: "block", width: "100%", marginBottom: 12, padding: "10px 12px",
  border: "1px solid var(--border-color)", borderRadius: 8, fontSize: 16,
  background: "var(--bg-primary)", color: "var(--text-primary)"
};
const buttonStyle = {
  width: "100%", padding: "10px 0", borderRadius: 8, marginTop: 6,
  fontWeight: 600, fontSize: 16, background: "var(--button-bg)", color: "var(--button-text)", border: "none", cursor: "pointer"
};
const linkStyle = { border: "none", background: "none", color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline", fontWeight: 500 };
