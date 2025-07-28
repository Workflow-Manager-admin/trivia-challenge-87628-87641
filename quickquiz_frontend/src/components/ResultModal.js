import React from "react";

// PUBLIC_INTERFACE
/**
 * Modal dialog for displaying quiz/game results.
 */
export default function ResultModal({ open, onClose, result }) {
  if (!open) return null;
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Quiz Results</h2>
        <div>
          {result ? (
            <pre style={{ textAlign: "left", whiteSpace: "pre-line" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <div>No results found.</div>
          )}
        </div>
        <button className="btn" style={closeBtnStyle} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", top: 0, left: 0, height: "100%", width: "100%",
  background: "rgba(0,0,0,0.45)", zIndex: 1200, display: "flex", alignItems: "center", justifyContent: "center"
};
const modalStyle = {
  background: "var(--bg-secondary)", padding: 28, borderRadius: 12, boxShadow: "0 3px 20px rgba(0,0,0,0.25)", maxWidth: 400
};
const closeBtnStyle = { marginTop: 16, width: "100%", padding: "10px 0" };
