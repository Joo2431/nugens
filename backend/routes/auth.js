const express = require("express");
const bcrypt = require("bcryptjs");
const pool = require("../config/database");
const { signToken, authenticate } = require("../middleware/auth");

const router = express.Router();

// ── POST /api/auth/register ───────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, role, created_at`,
      [email.toLowerCase(), password_hash, full_name || ""]
    );

    const user = rows[0];
    const token = signToken(user.id);

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ── POST /api/auth/login ──────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const { rows } = await pool.query(
      "SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: "Please sign in with Google" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user.id);

    // Get profile completion & plan
    const [profileRes, subRes] = await Promise.all([
      pool.query("SELECT profile_complete, onboarded FROM user_profiles WHERE user_id = $1", [user.id]),
      pool.query("SELECT plan FROM subscriptions WHERE user_id = $1 AND status = 'active' LIMIT 1", [user.id]),
    ]);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        profile_complete: profileRes.rows[0]?.profile_complete || 0,
        onboarded: profileRes.rows[0]?.onboarded || false,
        plan: subRes.rows[0]?.plan || "free",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── GET /api/auth/me ──────────────────────────────────
router.get("/me", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.avatar_url,
              p.career_stage, p.current_role, p.target_role, p.skills,
              p.profile_complete, p.onboarded, p.location,
              s.plan
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ user: rows[0] });
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ── PUT /api/auth/onboarding ──────────────────────────
router.put("/onboarding", authenticate, async (req, res) => {
  try {
    const {
      career_stage, current_role, years_experience, field_of_interest,
      target_role, skills, location, salary_min, salary_max, career_goals,
    } = req.body;

    await pool.query(
      `UPDATE user_profiles SET
        career_stage = $1, current_role = $2, years_experience = $3,
        field_of_interest = $4, target_role = $5, skills = $6,
        location = $7, salary_min = $8, salary_max = $9,
        career_goals = $10, onboarded = true, profile_complete = 75,
        updated_at = NOW()
       WHERE user_id = $11`,
      [career_stage, current_role, years_experience || 0, field_of_interest,
       target_role, skills || [], location, salary_min, salary_max,
       career_goals, req.user.id]
    );

    res.json({ message: "Profile updated", onboarded: true });
  } catch (err) {
    console.error("Onboarding error:", err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// ── POST /api/auth/logout ─────────────────────────────
router.post("/logout", authenticate, (req, res) => {
  // JWT is stateless — client deletes token
  res.json({ message: "Logged out" });
});

module.exports = router;
