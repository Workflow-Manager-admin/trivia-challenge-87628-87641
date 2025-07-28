/**
 * Authentication API service: Handles login, registration, session management.
 *
 * IMPORTANT for 'failed to fetch' errors:
 * - Set REACT_APP_BACKEND_URL in your .env file to the backend API root.
 * - See .env.example and README.md in the project root for configuration instructions.
 */

const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// PUBLIC_INTERFACE
export async function login(username, password) {
  // Backend expects x-www-form-urlencoded and returns {access_token, token_type} for /token endpoint (OAuth2)
  const params = new URLSearchParams();
  params.append("username", username);
  params.append("password", password);
  params.append("grant_type", "password");
  // Call /token, NOT /login
  const res = await fetch(`${baseUrl}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  if (!res.ok) {
    throw new Error("Login failed");
  }
  const data = await res.json();
  // Store token in localStorage for auth, since backend uses Authorization: Bearer
  localStorage.setItem("access_token", data.access_token);
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

/**
 * Returns true if there's a valid token, false otherwise. Optionally can ping protected endpoint, but not required for static apps.
 */
// PUBLIC_INTERFACE
export async function getAuthStatus() {
  // We'll optimistically check token existence in localStorage
  const token = localStorage.getItem("access_token");
  return !!token;
}

// PUBLIC_INTERFACE
export function logout() {
  // Remove stored token.
  localStorage.removeItem("access_token");
}
