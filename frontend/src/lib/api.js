// ═══════════════════════════════════════════════════════
// NuGens API Service
// ═══════════════════════════════════════════════════════

const BASE_URL = import.meta.env.VITE_API_URL || "https://nugens-api.onrender.com";

async function request(path, options = {}) {
  const token = localStorage.getItem("nugens_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({ error: "Invalid server response" }));

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("nugens_token");
      localStorage.removeItem("nugens_user");
      window.dispatchEvent(new Event("auth:logout"));
    }
    throw { status: res.status, message: data.error || data.message || "Request failed", data };
  }

  return data;
}

const get  = (path)        => request(path, { method: "GET" });
const post = (path, body)  => request(path, { method: "POST",  body: JSON.stringify(body) });
const put  = (path, body)  => request(path, { method: "PUT",   body: JSON.stringify(body) });
const del  = (path)        => request(path, { method: "DELETE" });

// ── AUTH ──────────────────────────────────────────────
export const auth = {
  register:   (data)     => post("/api/auth/register", data),
  login:      (data)     => post("/api/auth/login", data),
  googleAuth: (id_token) => post("/api/auth/google", { id_token }),
  logout:     ()         => post("/api/auth/logout"),
  me:         ()         => get("/api/auth/me"),
  onboarding: (data)     => put("/api/auth/onboarding", data),
  loginHistory: ()       => get("/api/auth/login-history"),
};

// ── GEN-E ─────────────────────────────────────────────
export const geneApi = {
  // Chat
  chat:         (messages, session_id) => post("/api/gen-e/chat", { messages, session_id }),
  chatHistory:  ()                      => get("/api/gen-e/chat/history"),
  chatSession:  (id)                    => get(`/api/gen-e/chat/${id}`),

  // Resume
  analyzeResume: (resume_text, target_role, title) =>
    post("/api/gen-e/resume/analyze", { resume_text, target_role, title }),
  getResumes:   () => get("/api/gen-e/resumes"),

  // Jobs
  getJobs:      (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/api/gen-e/jobs${q ? "?" + q : ""}`);
  },
  saveJob:      (job)  => post("/api/gen-e/jobs/save", job),
  unsaveJob:    (id)   => del(`/api/gen-e/jobs/save/${id}`),

  // Applications (existing routes)
  addApplication:    (data)       => post("/api/gen-e/applications", data),
  updateApplication: (id, data)   => request(`/api/gen-e/applications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // Skills + Roadmap
  getSkills:   () => get("/api/gen-e/skills"),
  getRoadmap:  () => get("/api/gen-e/roadmap"),
  getUsage:    () => get("/api/gen-e/usage"),
  getProfile:  () => get("/api/gen-e/profile"),
};

// ── USERS ─────────────────────────────────────────────
export const usersApi = {
  getProfile:    ()     => get("/api/users/profile"),
  updateProfile: (data) => put("/api/users/profile", data),
  getDashboard:  ()     => get("/api/users/dashboard"),
};

// ── TOKEN HELPERS ─────────────────────────────────────
export const tokenStore = {
  set:       (token, user) => {
    localStorage.setItem("nugens_token", token);
    localStorage.setItem("nugens_user", JSON.stringify(user));
  },
  get:       () => localStorage.getItem("nugens_token"),
  getUser:   () => { try { return JSON.parse(localStorage.getItem("nugens_user")); } catch { return null; } },
  clear:     () => { localStorage.removeItem("nugens_token"); localStorage.removeItem("nugens_user"); },
  isLoggedIn:() => !!localStorage.getItem("nugens_token"),
};
