const express = require("express");
const pool = require("../config/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// ── GET /api/users/profile ────────────────────────────
router.get("/profile", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.avatar_url, u.created_at,
              p.career_stage, p.current_role, p.target_role, p.years_experience,
              p.field_of_interest, p.skills, p.location, p.salary_min, p.salary_max,
              p.career_goals, p.linkedin_url, p.portfolio_url, p.bio,
              p.profile_complete, p.onboarded,
              s.plan, s.current_period_end
       FROM users u
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Profile not found" });

    // Resume count
    const { rows: resumeCount } = await pool.query(
      "SELECT COUNT(*) FROM resumes WHERE user_id = $1",
      [req.user.id]
    );
    // Saved jobs count
    const { rows: jobCount } = await pool.query(
      "SELECT COUNT(*) FROM saved_jobs WHERE user_id = $1",
      [req.user.id]
    );

    res.json({
      profile: rows[0],
      stats: {
        resumes: parseInt(resumeCount[0].count),
        saved_jobs: parseInt(jobCount[0].count),
      }
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ── PUT /api/users/profile ────────────────────────────
router.put("/profile", authenticate, async (req, res) => {
  try {
    const {
      full_name, avatar_url, career_stage, current_role, target_role,
      years_experience, field_of_interest, skills, location,
      salary_min, salary_max, career_goals, linkedin_url, portfolio_url, bio,
    } = req.body;

    // Update user table
    if (full_name) {
      await pool.query(
        "UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2",
        [full_name, req.user.id]
      );
    }

    // Count filled fields for profile_complete
    const fields = [career_stage, current_role, target_role, skills?.length, location, career_goals];
    const filled = fields.filter(Boolean).length;
    const profileComplete = Math.round((filled / fields.length) * 100);

    // Update profile
    await pool.query(
      `UPDATE user_profiles SET
        career_stage = COALESCE($1, career_stage),
        current_role = COALESCE($2, current_role),
        target_role = COALESCE($3, target_role),
        years_experience = COALESCE($4, years_experience),
        field_of_interest = COALESCE($5, field_of_interest),
        skills = COALESCE($6, skills),
        location = COALESCE($7, location),
        salary_min = COALESCE($8, salary_min),
        salary_max = COALESCE($9, salary_max),
        career_goals = COALESCE($10, career_goals),
        linkedin_url = COALESCE($11, linkedin_url),
        portfolio_url = COALESCE($12, portfolio_url),
        bio = COALESCE($13, bio),
        profile_complete = $14,
        updated_at = NOW()
       WHERE user_id = $15`,
      [career_stage, current_role, target_role, years_experience,
       field_of_interest, skills, location, salary_min, salary_max,
       career_goals, linkedin_url, portfolio_url, bio,
       profileComplete, req.user.id]
    );

    res.json({ message: "Profile updated", profile_complete: profileComplete });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ── GET /api/users/dashboard ──────────────────────────
router.get("/dashboard", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const monthYear = new Date().toISOString().slice(0, 7);

    const [profileRes, resumeRes, jobRes, usageRes, chatRes, roadmapRes] = await Promise.all([
      pool.query("SELECT * FROM user_profiles WHERE user_id = $1", [userId]),
      pool.query("SELECT id, title, overall_score, ats_score, created_at FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 3", [userId]),
      pool.query("SELECT id, job_title, company, match_score, status FROM saved_jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5", [userId]),
      pool.query("SELECT chat_count, analysis_count FROM ai_usage WHERE user_id = $1 AND month_year = $2", [userId, monthYear]),
      pool.query("SELECT COUNT(*) FROM chat_sessions WHERE user_id = $1", [userId]),
      pool.query("SELECT title, goal FROM career_roadmaps WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1", [userId]),
    ]);

    const usage = usageRes.rows[0] || { chat_count: 0, analysis_count: 0 };

    res.json({
      profile: profileRes.rows[0] || {},
      recent_resumes: resumeRes.rows,
      saved_jobs: jobRes.rows,
      usage: { ...usage, total_chats: parseInt(chatRes.rows[0].count) },
      roadmap: roadmapRes.rows[0] || null,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

module.exports = router;
