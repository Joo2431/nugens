require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

// ── Security & Parsing ────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// ── CORS ──────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://nugens.in.net",
  "https://nugens-cat.pages.dev",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────
const globalLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const authLimit   = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: "Too many auth attempts" } });
const aiLimit     = rateLimit({ windowMs: 60 * 1000, max: 30, message: { error: "Too many AI requests" } });

app.use(globalLimit);

// ── Health Check ──────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "NuGens API", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────
app.use("/api/auth",  authLimit, require("./routes/auth"));
app.use("/api/gene",  aiLimit,   require("./routes/genE"));
app.use("/api/users",            require("./routes/users"));

// ── 404 ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 NuGens API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

module.exports = app;
