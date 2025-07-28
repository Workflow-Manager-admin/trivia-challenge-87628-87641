/**
 * Generic API service for interacting with quiz backend.
 */

const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";
const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";

// PUBLIC_INTERFACE
// Returns list of quiz categories
export async function fetchCategories() {
  const res = await fetch(`${baseUrl}/categories`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

// PUBLIC_INTERFACE
// Returns list of quiz questions for a given category (if in single-player mode)
export async function fetchQuestions(category) {
  const res = await fetch(`${baseUrl}/quiz?category=${encodeURIComponent(category)}`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

// PUBLIC_INTERFACE
// Submits answer for single-player
export async function submitAnswer(questionId, answer) {
  await fetch(`${baseUrl}/answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ question_id: questionId, answer })
  });
  return true;
}

// PUBLIC_INTERFACE
// Initiates multiplayer game (handled mainly over websocket)
// Exported for documentation; actual connect logic in QuizPage/WebSocket handler.
export async function startMultiplayer(category) {
  // Not used in this frontend—joined/managed live via WebSocket
}

// PUBLIC_INTERFACE
export function answerMulti(ws, questionId, answer) {
  if (!ws) return;
  ws.send(JSON.stringify({ type: "ANSWER", question_id: questionId, answer }));
}

// PUBLIC_INTERFACE
export function getWebSocketUrl() {
  return wsUrl;
}
