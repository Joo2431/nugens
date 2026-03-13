const express   = require("express");
const bcrypt    = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const pool      = require("../config/database");
const { signToken, authenticate } = require("../middleware/auth");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function getClientInfo(req) {
  return {
    ip: req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown",
    userAgent: req.headers["user-agent"]?.substring(0, 500) || "unknown",
  };
}

async function recordLogin(userId, provider, ip, userAgent, status = "success") {
  try {
    await pool.query(
      `INSERT INTO login_history (user_id, provider, ip_address, user_agent, status) VALUES ($1,$2,$3,$4,$5)`,
      [userId, provider, ip, userAgent, status]
    );
    if (status === "success") {
      await pool.query(
        `UPDATE users SET last_login_at = NOW(), last_login_ip = $1, login_count = COALESCE(login_count,0) + 1 WHERE id = $2`,
        [ip, userId]
      );
    }
  } catch (err) { console.error("recordLogin error:", err.message); }
}

async function buildUserResponse(userId) {
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.full_name, u.role, u.avatar_url, u.google_id, u.last_login_at, u.login_count,
            p.career_stage, p.current_role, p.target_role, p.profile_complete, p.onboarded, p.skills,
            s.plan
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
     WHERE u.id = $1`,
    [userId]
  );
  return rows[0] || null;
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { ip, userAgent } = getClientInfo(req);
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    if (password.length < 8)  return res.status(400).json({ error: "Password must be at least 8 characters" });

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rows.length) return res.status(409).json({ error: "Email already registered" });

    const password_hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, provider) VALUES ($1,$2,$3,'email') RETURNING id, email, full_name, role`,
      [email.toLowerCase(), password_hash, full_name?.trim() || ""]
    );

    const token = signToken(rows[0].id);
    await recordLogin(rows[0].id, "email", ip, userAgent, "success");
    const fullUser = await buildUserResponse(rows[0].id);

    res.status(201).json({ message: "Account created successfully", token, user: fullUser });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { ip, userAgent } = getClientInfo(req);
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const { rows } = await pool.query(
      "SELECT id, email, full_name, role, password_hash FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (!rows.length) return res.status(401).json({ error: "Invalid email or password" });

    const user = rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ error: "This account uses Google sign-in. Please use 'Sign in with Google'." });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await recordLogin(user.id, "email", ip, userAgent, "failed");
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user.id);
    await recordLogin(user.id, "email", ip, userAgent, "success");
    const fullUser = await buildUserResponse(user.id);

    res.json({ token, user: fullUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/google  — verify Google ID token from frontend
router.post("/google", async (req, res) => {
  const { ip, userAgent } = getClientInfo(req);
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ error: "Google ID token required" });

    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = ticket.getPayload();
    if (!email) return res.status(400).json({ error: "Could not get email from Google" });

    let user;
    let is_new_user = false;

    // Try find by google_id first
    const { rows: byGoogle } = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);

    if (byGoogle.length) {
      user = byGoogle[0];
      await pool.query("UPDATE users SET google_picture = $1, avatar_url = $2 WHERE id = $3", [picture, picture, user.id]);
    } else {
      // Try find by email
      const { rows: byEmail } = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);

      if (byEmail.length) {
        // Link Google to existing account
        user = byEmail[0];
        await pool.query(
          `UPDATE users SET google_id=$1, google_email=$2, google_picture=$3, avatar_url=COALESCE(avatar_url,$3) WHERE id=$4`,
          [googleId, email.toLowerCase(), picture, user.id]
        );
      } else {
        // Create brand new user
        is_new_user = true;
        const { rows: newRows } = await pool.query(
          `INSERT INTO users (email, full_name, google_id, google_email, google_picture, avatar_url, provider, is_verified)
           VALUES ($1,$2,$3,$4,$5,$6,'google',true) RETURNING *`,
          [email.toLowerCase(), name || email.split("@")[0], googleId, email.toLowerCase(), picture, picture]
        );
        user = newRows[0];
      }
    }

    const token = signToken(user.id);
    await recordLogin(user.id, "google", ip, userAgent, "success");
    const fullUser = await buildUserResponse(user.id);

    res.json({ token, user: fullUser, is_new_user });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ error: "Google authentication failed: " + err.message });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    const fullUser = await buildUserResponse(req.user.id);
    if (!fullUser) return res.status(404).json({ error: "User not found" });
    res.json({ user: fullUser });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PUT /api/auth/onboarding
router.put("/onboarding", authenticate, async (req, res) => {
  try {
    const { career_stage, current_role, years_experience, field_of_interest,
            target_role, skills, location, salary_min, salary_max, career_goals } = req.body;

    await pool.query(
      `UPDATE user_profiles SET
         career_stage=$1, current_role=$2, years_experience=$3, field_of_interest=$4,
         target_role=$5, skills=$6, location=$7, salary_min=$8, salary_max=$9,
         career_goals=$10, onboarded=true, profile_complete=75, updated_at=NOW()
       WHERE user_id=$11`,
      [career_stage, current_role, years_experience, field_of_interest,
       target_role, skills, location, salary_min, salary_max, career_goals, req.user.id]
    );
    res.json({ message: "Profile saved", onboarded: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// GET /api/auth/login-history
router.get("/login-history", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT provider, ip_address, user_agent, status, created_at FROM login_history WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20",
      [req.user.id]
    );
    res.json({ history: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch login history" });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticate, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = router;
