/**
 * Generic API service for interacting with quiz backend.
 */

const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const wsUrl = process.env.REACT_APP_WS_URL || "ws://localhost:8000/ws";

// PUBLIC_INTERFACE
// Returns list of quiz categories
export async function fetchCategories() {
  // Backend returns [{id, name}], but CategoryPage expects names/strings: map as needed
  const res = await fetch(`${baseUrl}/categories`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(cat => cat.name); // Return names only for compatibility with CategoryPage
}

// PUBLIC_INTERFACE
// Returns list of quiz questions for a given category (in single-player mode)
export async function fetchQuestions(categoryName) {
  // We need to first get the categories to find the id for the given name!
  const catsRes = await fetch(`${baseUrl}/categories`);
  if (!catsRes.ok) return [];
  const cats = await catsRes.json();
  const catEntry = cats.find(c => c.name === categoryName);
  if (!catEntry) return [];
  const catId = catEntry.id;
  const res = await fetch(`${baseUrl}/questions?category_id=${catId}`);
  if (!res.ok) return [];
  const data = await res.json();
  // Remap question structure to {text, options, id, answer}
  return data.map(q => ({
    id: q.id,
    text: q.question,
    options: q.choices,
    answer: undefined // Don't expose answer to frontend
  }));
}

// PUBLIC_INTERFACE
// Submits ALL answers (batch) for single-player round; expects [{question_id, answer}], and category_id!
export async function submitAnswers(answersArr, categoryName) {
  // answersArr: [{question_id, answer}], categoryName: string
  // Get category id
  const catsRes = await fetch(`${baseUrl}/categories`);
  if (!catsRes.ok) throw new Error("Could not get categories");
  const cats = await catsRes.json();
  const catEntry = cats.find(c => c.name === categoryName);
  if (!catEntry) throw new Error("Invalid category");
  const category_id = catEntry.id;
  // Send to /submit endpoint (POST), must be authenticated (Bearer token in header if using OAuth)
  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json" };
  if(token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}/submit?category_id=${category_id}`, {
    method: "POST",
    headers,
    body: JSON.stringify(answersArr)
  });
  if (!res.ok) throw new Error("Failed to submit quiz answers");
  return res.json();
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
