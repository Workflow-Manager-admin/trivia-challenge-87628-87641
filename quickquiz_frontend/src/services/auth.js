/**
 * Authentication API service: Handles login, registration, session management.
 * Note: Backend API endpoint URLs and authentication mechanisms
 * should be updated according to backend integration needs.
 */

const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000/api";

// PUBLIC_INTERFACE
export async function login(username, password) {
  const res = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Login failed");
  return true;
}

// PUBLIC_INTERFACE
export async function register(username, password) {
  const res = await fetch(`${baseUrl}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) throw new Error("Registration failed");
  return true;
}

// PUBLIC_INTERFACE
export async function getAuthStatus() {
  const res = await fetch(`${baseUrl}/me`, {
    credentials: "include"
  });
  return res.ok;
}

// PUBLIC_INTERFACE
export function logout() {
  // Optionally call logout endpoint if implemented
  fetch(`${baseUrl}/logout`, { method: "POST", credentials: "include" });
  // Then drop any client tokens/cookies if needed (not done here)
}
