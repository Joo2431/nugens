const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const JWT_SECRET = process.env.JWT_SECRET || "nugens-dev-secret-change-in-prod";

// ── Verify token middleware ────────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch fresh user from DB to ensure they still exist
    const { rows } = await pool.query(
      "SELECT id, email, full_name, role FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (!rows.length) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

// ── Optional auth (doesn't fail if no token) ─────────
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const { rows } = await pool.query(
        "SELECT id, email, full_name, role FROM users WHERE id = $1",
        [decoded.userId]
      );
      if (rows.length) req.user = rows[0];
    }
  } catch {}
  next();
};

// ── Sign token ────────────────────────────────────────
const signToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
};

// ── Check AI usage limits ─────────────────────────────
const checkAiLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const monthYear = new Date().toISOString().slice(0, 7); // "2026-03"

    // Get subscription plan
    const { rows: subRows } = await pool.query(
      "SELECT plan FROM subscriptions WHERE user_id = $1 AND status = 'active' LIMIT 1",
      [userId]
    );
    const plan = subRows[0]?.plan || "free";

    // Free plan: 20 chats/month
    if (plan === "free") {
      const { rows } = await pool.query(
        "SELECT chat_count FROM ai_usage WHERE user_id = $1 AND month_year = $2",
        [userId, monthYear]
      );
      const count = rows[0]?.chat_count || 0;
      if (count >= 20) {
        return res.status(429).json({
          error: "Monthly AI limit reached",
          message: "You've used 20 AI chats this month. Upgrade to Premium for unlimited access.",
          plan,
          limit: 20,
          used: count,
        });
      }
    }

    req.plan = plan;
    req.monthYear = monthYear;
    next();
  } catch (err) {
    next(err);
  }
};

// ── Increment AI usage ────────────────────────────────
const incrementAiUsage = async (userId, monthYear, field = "chat_count") => {
  await pool.query(
    `INSERT INTO ai_usage (user_id, month_year, ${field})
     VALUES ($1, $2, 1)
     ON CONFLICT (user_id, month_year)
     DO UPDATE SET ${field} = ai_usage.${field} + 1`,
    [userId, monthYear]
  );
};

module.exports = { authenticate, optionalAuth, signToken, checkAiLimit, incrementAiUsage };
