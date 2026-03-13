// ═══════════════════════════════════════════════════════
// NuGens API Service — centralised fetch wrapper
// All components import from this file, not fetch directly
// ═══════════════════════════════════════════════════════

const BASE_URL = import.meta.env.VITE_API_URL || "https://nugens-api.onrender.com";

// ── Core fetch with auth ──────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem("nugens_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({ error: "Invalid server response" }));

  if (!res.ok) {
    // Token expired → clear auth and redirect to login
    if (res.status === 401) {
      localStorage.removeItem("nugens_token");
      localStorage.removeItem("nugens_user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    throw { status: res.status, message: data.error || data.message || "Request failed", data };
  }

  return data;
}

const get  = (path) => request(path, { method: "GET" });
const post = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
const put  = (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) });
const del  = (path) => request(path, { method: "DELETE" });

// ══════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════
export const auth = {
  register:   (data) => post("/api/auth/register", data),
  login:      (data) => post("/api/auth/login", data),
  logout:     ()     => post("/api/auth/logout"),
  me:         ()     => get("/api/auth/me"),
  onboarding: (data) => put("/api/auth/onboarding", data),
};

// ══════════════════════════════════════════════════════
// GEN-E
// ══════════════════════════════════════════════════════
export const geneApi = {
  // AI Chat
  chat:         (messages, session_id) => post("/api/gene/chat", { messages, session_id }),
  chatHistory:  ()                      => get("/api/gene/chat/history"),
  chatSession:  (sessionId)             => get(`/api/gene/chat/${sessionId}`),

  // Resume
  analyzeResume: (resume_text, target_role, title) =>
    post("/api/gene/resume/analyze", { resume_text, target_role, title }),
  getResumes:   () => get("/api/gene/resume"),

  // Jobs
  getJobs:      ()     => get("/api/gene/jobs"),
  saveJob:      (job)  => post("/api/gene/jobs/save", job),
  unsaveJob:    (id)   => del(`/api/gene/jobs/save/${id}`),

  // Skills
  getSkills:    ()     => get("/api/gene/skills"),

  // Roadmap
  getRoadmap:   ()     => get("/api/gene/roadmap"),

  // Usage
  getUsage:     ()     => get("/api/gene/usage"),
};

// ══════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════
export const usersApi = {
  getProfile:    ()     => get("/api/users/profile"),
  updateProfile: (data) => put("/api/users/profile", data),
  getDashboard:  ()     => get("/api/users/dashboard"),
};

// ══════════════════════════════════════════════════════
// LOCAL STORAGE HELPERS
// ══════════════════════════════════════════════════════
export const tokenStore = {
  set: (token, user) => {
    localStorage.setItem("nugens_token", token);
    localStorage.setItem("nugens_user", JSON.stringify(user));
  },
  get: () => localStorage.getItem("nugens_token"),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem("nugens_user")); }
    catch { return null; }
  },
  clear: () => {
    localStorage.removeItem("nugens_token");
    localStorage.removeItem("nugens_user");
  },
  isLoggedIn: () => !!localStorage.getItem("nugens_token"),
};
