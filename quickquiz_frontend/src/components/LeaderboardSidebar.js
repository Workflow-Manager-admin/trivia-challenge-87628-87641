import React from "react";

// PUBLIC_INTERFACE
/**
 * Sidebar for displaying leaderboard, real-time results, or chat (minimal, placeholder for now).
 */
export default function LeaderboardSidebar() {
  // For simplicity, only a placeholder; could be extended with props/websocket.
  return (
    <aside className="leaderboard-sidebar" style={{
      width: 270,
      borderLeft: "1px solid var(--border-color)",
      background: "var(--bg-secondary)",
      padding: 20,
      minHeight: "80vh",
      display: window.location.pathname.includes('/quiz/multi') ? "block" : "none"
    }}>
      <h4 style={{ marginBottom: 8 }}>Leaderboard</h4>
      {/* Could render real leaderboard data via websocket */}
      <div style={{ color: "var(--text-secondary)" }}>
        Waiting for real-time scores...
      </div>
    </aside>
  );
}
