import React from "react";

// PUBLIC_INTERFACE
/**
 * Minimal instructions modal.
 */
export default function InstructionsModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>How to Play</h2>
        <ol style={{ textAlign: "left", marginBottom: 8 }}>
          <li>Pick a category and mode (single or multiplayer)</li>
          <li>Answer each question before the timer runs out!</li>
          <li>In multiplayer, compete for speed and accuracy in real time</li>
          <li>See your score and leaderboard at the end!</li>
        </ol>
        <button className="btn" style={{marginTop: 12}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
const overlayStyle = {
  position: "fixed", top: 0, left: 0, height: "100%", width: "100%",
  background: "rgba(0,0,0,0.45)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center"
};
const modalStyle = {
  background: "var(--bg-secondary)", padding: 24, borderRadius: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.20)", maxWidth: 400
};
