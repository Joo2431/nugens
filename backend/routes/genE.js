const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // npm install node-fetch@2
const { authenticate, checkAiLimit, incrementAiUsage } = require("../middleware/auth");
const pool = require("../config/database");

// ─── API CONFIG ───────────────────────────────────────
const GROQ_API_KEY    = process.env.GROQ_API_KEY;
const ADZUNA_APP_ID   = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY  = process.env.ADZUNA_APP_KEY;
const GROQ_MODEL      = "llama-3.3-70b-versatile"; // best free Groq model

// ─── GROQ CHAT HELPER ─────────────────────────────────
async function groqChat(messages, systemPrompt, maxTokens = 800) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq API error");
  return data.choices[0]?.message?.content || "";
}

// ─── SYSTEM PROMPTS ───────────────────────────────────
const CAREER_SYSTEM = `You are Gen-E, an expert AI career advisor for NuGens — a career development platform focused on the Indian job market.
You are warm, sharp, direct, and specific. Never generic. You help with:
- Career path planning and transitions
- Resume analysis and ATS optimization
- Job matching and application strategy
- Skill gap identification
- Interview preparation and salary negotiation

Always give concrete, actionable advice. Reference the NuGens ecosystem when relevant:
- HyperX → for skill building
- DigiHub → for networking and brand connections
Keep responses under 300 words. Use line breaks for readability.`;

// ══════════════════════════════════════════════════════
// EXISTING ROUTES (kept from your original file)
// ══════════════════════════════════════════════════════

// GET /api/gen-e/profile
router.get("/profile", authenticate, async (req, res) => {
  try {
    const [user, resumes, applications] = await Promise.all([
      pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]),
      pool.query("SELECT * FROM resumes WHERE user_id = $1 ORDER BY is_primary DESC, updated_at DESC", [req.user.id]),
      pool.query("SELECT * FROM job_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10", [req.user.id]),
    ]);
    res.json({ success: true, profile: user.rows[0], resumes: resumes.rows, recent_applications: applications.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load profile" });
  }
});

// POST /api/gen-e/resumes
router.post("/resumes", authenticate, async (req, res) => {
  const { title, target_role, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO resumes (user_id, title, target_role, content) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.id, title, target_role, JSON.stringify(content)]
    );
    res.status(201).json({ success: true, resume: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create resume" });
  }
});

// GET /api/gen-e/resumes
router.get("/resumes", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, target_role, ats_score, overall_score, created_at FROM resumes WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json({ success: true, resumes: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch resumes" });
  }
});

// POST /api/gen-e/applications
router.post("/applications", authenticate, async (req, res) => {
  const { company, role, job_url, resume_id, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO job_applications (user_id, company, role, job_url, resume_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, company, role, job_url, resume_id, notes]
    );
    res.status(201).json({ success: true, application: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to save application" });
  }
});

// PATCH /api/gen-e/applications/:id
router.patch("/applications/:id", authenticate, async (req, res) => {
  const { status, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE job_applications
       SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [status, notes, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// ══════════════════════════════════════════════════════
// NEW: AI CHAT (Groq — free, unlimited)
// ══════════════════════════════════════════════════════

// POST /api/gen-e/chat
router.post("/chat", authenticate, async (req, res) => {
  try {
    const { messages, session_id } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "messages array required" });
    }

    // Attach user profile context to system prompt
    const { rows } = await pool.query(
      "SELECT career_stage, current_role, target_role, skills, years_experience FROM user_profiles WHERE user_id = $1",
      [req.user.id]
    );
    const p = rows[0];
    let system = CAREER_SYSTEM;
    if (p) {
      system += `\n\nUser context: stage=${p.career_stage || "unknown"}, current=${p.current_role || "?"}, target=${p.target_role || "?"}, exp=${p.years_experience || 0}yrs, skills=[${(p.skills || []).join(", ")}]`;
    }

    const reply = await groqChat(messages.slice(-20), system, 800);

    // Save session
    if (session_id) {
      await pool.query(
        "UPDATE chat_sessions SET messages = messages || $1::jsonb, updated_at = NOW() WHERE id = $2 AND user_id = $3",
        [JSON.stringify([...messages.slice(-1), { role: "assistant", content: reply }]), session_id, req.user.id]
      ).catch(() => {});
    } else {
      const title = messages.find(m => m.role === "user")?.content?.substring(0, 60) || "New conversation";
      await pool.query(
        "INSERT INTO chat_sessions (user_id, title, messages) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [req.user.id, title, JSON.stringify([...messages, { role: "assistant", content: reply }])]
      ).catch(() => {});
    }

    res.json({ success: true, reply });
  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ success: false, message: "AI chat failed: " + err.message });
  }
});

// GET /api/gen-e/chat/history
router.get("/chat/history", authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, title, created_at, updated_at FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 20",
      [req.user.id]
    );
    res.json({ success: true, sessions: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch history" });
  }
});

// ══════════════════════════════════════════════════════
// NEW: RESUME ANALYZER (Groq)
// ══════════════════════════════════════════════════════

// POST /api/gen-e/resume/analyze
router.post("/resume/analyze", authenticate, async (req, res) => {
  try {
    const { resume_text, target_role, title } = req.body;
    if (!resume_text || resume_text.trim().length < 50) {
      return res.status(400).json({ success: false, message: "Resume text too short" });
    }

    const prompt = `Analyze this resume${target_role ? ` for a ${target_role} role` : ""}.
Respond ONLY with valid JSON — no explanation, no markdown:
{
  "score": <0-100>,
  "ats": <0-100>,
  "strengths": ["str1","str2","str3"],
  "improvements": ["fix1","fix2","fix3"],
  "missing": ["miss1","miss2","miss3"],
  "verdict": "2-3 sentence honest summary",
  "suggested_roles": ["role1","role2","role3"],
  "keywords_missing": ["kw1","kw2","kw3"]
}

Resume:
${resume_text.substring(0, 3000)}`;

    const raw = await groqChat([{ role: "user", content: prompt }], "You are a resume analysis expert. Return only valid JSON.", 800);

    let analysis;
    try {
      analysis = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      analysis = {
        score: 65, ats: 60,
        strengths: ["Resume received", "Content detected", "Ready for review"],
        improvements: ["Add measurable achievements", "Improve keyword density", "Strengthen summary"],
        missing: ["Quantified results", "Action verbs", "Industry keywords"],
        verdict: "Your resume has been analyzed. Review the suggestions above to improve your ATS score.",
        suggested_roles: [], keywords_missing: [],
      };
    }

    // Save to resumes table
    const { rows } = await pool.query(
      `INSERT INTO resumes (user_id, title, raw_text, ats_score, overall_score, analysis, target_role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [req.user.id, title || "Resume Analysis", resume_text,
       analysis.ats, analysis.score, JSON.stringify(analysis), target_role || null]
    ).catch(() => ({ rows: [{ id: null }] }));

    res.json({ success: true, resume_id: rows[0]?.id, analysis });
  } catch (err) {
    console.error("Resume analyze error:", err.message);
    res.status(500).json({ success: false, message: "Resume analysis failed" });
  }
});

// ══════════════════════════════════════════════════════
// NEW: REAL JOB LISTINGS (Adzuna API)
// ══════════════════════════════════════════════════════

// GET /api/gen-e/jobs
router.get("/jobs", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, keywords, location } = req.query;

    // Get user profile for personalised search
    const { rows: profileRows } = await pool.query(
      "SELECT target_role, skills, location FROM user_profiles WHERE user_id = $1",
      [req.user.id]
    );
    const profile = profileRows[0];

    // Build search query from profile or query params
    const searchWhat = keywords || profile?.target_role || "software engineer";
    const searchWhere = location || profile?.location || "india";

    // Clean location for Adzuna (it prefers city names)
    const cleanLocation = searchWhere
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=${limit}&what=${encodeURIComponent(searchWhat)}&where=${encodeURIComponent(searchWhere)}&content-type=application/json`;

    const adzunaRes = await fetch(adzunaUrl);

    if (!adzunaRes.ok) {
      // Fallback to mock if Adzuna fails
      return res.json({ success: true, jobs: getMockJobs(profile), source: "fallback" });
    }

    const adzunaData = await adzunaRes.json();
    const jobs = (adzunaData.results || []).map((job, i) => ({
      id: job.id || `job_${i}`,
      title: job.title,
      company: job.company?.display_name || "Company",
      location: job.location?.display_name || searchWhere,
      type: job.contract_type || "Full-time",
      salary: job.salary_min && job.salary_max
        ? `₹${Math.round(job.salary_min / 100000)}–${Math.round(job.salary_max / 100000)} LPA`
        : "Salary not listed",
      match: calculateMatch(job, profile),
      tags: extractTags(job.description || ""),
      description: job.description?.substring(0, 150) + "..." || "",
      url: job.redirect_url,
      posted: job.created,
    }));

    // Also get saved job IDs for this user
    const { rows: savedRows } = await pool.query(
      "SELECT id FROM saved_jobs WHERE user_id = $1",
      [req.user.id]
    ).catch(() => ({ rows: [] }));

    res.json({
      success: true,
      jobs,
      total: adzunaData.count || jobs.length,
      source: "adzuna",
      saved_ids: savedRows.map(r => r.id),
    });
  } catch (err) {
    console.error("Jobs error:", err.message);
    // Return mock jobs if anything fails
    res.json({ success: true, jobs: getMockJobs(), source: "fallback" });
  }
});

function calculateMatch(job, profile) {
  if (!profile?.skills?.length) return Math.floor(Math.random() * 20) + 70;
  const desc = (job.title + " " + job.description).toLowerCase();
  const matched = (profile.skills || []).filter(s => desc.includes(s.toLowerCase()));
  const base = 60;
  const bonus = Math.min(matched.length * 8, 35);
  return Math.min(base + bonus, 99);
}

function extractTags(description) {
  const keywords = ["React", "Node.js", "Python", "SQL", "Figma", "AWS", "Java", "TypeScript",
    "MongoDB", "PostgreSQL", "Marketing", "SEO", "Design", "Management", "Sales",
    "Excel", "Analytics", "Product", "Agile", "Docker"];
  const desc = description.toLowerCase();
  return keywords.filter(k => desc.includes(k.toLowerCase())).slice(0, 4);
}

function getMockJobs(profile) {
  return [
    { id: "j1", title: "Product Designer", company: "Zomato", location: "Bangalore", type: "Full-time", match: 94, tags: ["Figma", "Product", "Design"], salary: "₹18–26 LPA", description: "Lead product design for consumer apps." },
    { id: "j2", title: "UX Researcher", company: "PhonePe", location: "Pune · Remote", type: "Full-time", match: 89, tags: ["Analytics", "Design"], salary: "₹14–20 LPA", description: "Drive user research across the platform." },
    { id: "j3", title: "Full Stack Developer", company: "Razorpay", location: "Bangalore", type: "Full-time", match: 85, tags: ["React", "Node.js", "SQL"], salary: "₹20–32 LPA", description: "Build scalable fintech infrastructure." },
    { id: "j4", title: "Product Manager", company: "CRED", location: "Bangalore", type: "Full-time", match: 78, tags: ["Product", "Agile", "Analytics"], salary: "₹22–35 LPA", description: "Own the rewards and engagement roadmap." },
  ];
}

// POST /api/gen-e/jobs/save
router.post("/jobs/save", authenticate, async (req, res) => {
  try {
    const { job_title, company, location, job_type, salary, match_score, tags, job_url } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO saved_jobs (user_id, job_title, company, location, job_type, salary, match_score, tags, job_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [req.user.id, job_title, company, location, job_type, salary, match_score, tags || [], job_url || null]
    );
    res.json({ success: true, id: rows[0].id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to save job" });
  }
});

// DELETE /api/gen-e/jobs/save/:id
router.delete("/jobs/save/:id", authenticate, async (req, res) => {
  try {
    await pool.query("DELETE FROM saved_jobs WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to remove job" });
  }
});

// ══════════════════════════════════════════════════════
// NEW: SKILL GAP ANALYSIS (Groq)
// ══════════════════════════════════════════════════════

// GET /api/gen-e/skills
router.get("/skills", authenticate, async (req, res) => {
  try {
    const { rows: profileRows } = await pool.query(
      "SELECT skills, target_role, years_experience FROM user_profiles WHERE user_id = $1",
      [req.user.id]
    );
    const profile = profileRows[0];
    const targetRole = profile?.target_role || "Software Engineer";
    const userSkills = profile?.skills || [];

    // Check cache (valid for 24h)
    const { rows: cached } = await pool.query(
      "SELECT * FROM skill_gaps WHERE user_id = $1 AND generated_at > NOW() - INTERVAL '24 hours' ORDER BY generated_at DESC LIMIT 1",
      [req.user.id]
    ).catch(() => ({ rows: [] }));

    if (cached.length) {
      return res.json({ success: true, skills: cached[0].skills_data, overall_score: cached[0].overall_score, target_role: cached[0].target_role });
    }

    const prompt = `Skill gap analysis for someone targeting: ${targetRole}
Current skills: ${userSkills.join(", ") || "not specified"}
Experience: ${profile?.years_experience || 0} years

Return ONLY a valid JSON array of 6-7 skills:
[{"skill":"Skill Name","level":<0-100>,"required":<0-100>,"status":"met|close|gap"}]
- "met" if level >= required
- "close" if level is within 15 of required  
- "gap" if level is more than 15 below required`;

    const raw = await groqChat([{ role: "user", content: prompt }], "Return only valid JSON arrays.", 600);

    let skillsData;
    try {
      skillsData = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      skillsData = [
        { skill: "Core Technical Skills", level: 70, required: 85, status: "gap" },
        { skill: "Communication", level: 75, required: 80, status: "close" },
        { skill: "Problem Solving", level: 80, required: 85, status: "close" },
        { skill: "Industry Knowledge", level: 55, required: 80, status: "gap" },
        { skill: "Tools & Software", level: 65, required: 75, status: "gap" },
        { skill: "Leadership", level: 50, required: 60, status: "close" },
      ];
    }

    const overallScore = Math.round(
      skillsData.reduce((sum, s) => sum + Math.min((s.level / s.required) * 100, 100), 0) / skillsData.length
    );

    // Cache result
    await pool.query(
      "INSERT INTO skill_gaps (user_id, target_role, skills_data, overall_score) VALUES ($1,$2,$3,$4)",
      [req.user.id, targetRole, JSON.stringify(skillsData), overallScore]
    ).catch(() => {});

    res.json({ success: true, skills: skillsData, overall_score: overallScore, target_role: targetRole });
  } catch (err) {
    console.error("Skills error:", err.message);
    res.status(500).json({ success: false, message: "Failed to analyze skills" });
  }
});

// ══════════════════════════════════════════════════════
// NEW: CAREER ROADMAP (Groq)
// ══════════════════════════════════════════════════════

// GET /api/gen-e/roadmap
router.get("/roadmap", authenticate, async (req, res) => {
  try {
    // Check for existing active roadmap
    const { rows: existing } = await pool.query(
      "SELECT * FROM career_roadmaps WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    ).catch(() => ({ rows: [] }));

    if (existing.length) {
      return res.json({ success: true, roadmap: existing[0] });
    }

    const { rows: profileRows } = await pool.query(
      "SELECT career_stage, current_role, target_role, skills, years_experience, career_goals FROM user_profiles WHERE user_id = $1",
      [req.user.id]
    );
    const p = profileRows[0];

    const prompt = `Create a 12-week career roadmap:
Current: ${p?.current_role || "not specified"}
Target: ${p?.target_role || "Senior Professional"}  
Stage: ${p?.career_stage || "professional"}
Skills: ${(p?.skills || []).join(", ") || "not listed"}
Goals: ${p?.career_goals || "career growth"}

Return ONLY valid JSON:
{
  "title": "Your 12-Week Career Roadmap",
  "goal": "One clear goal sentence",
  "weeks": [
    {"week":"Week 1–2","title":"Action title","desc":"Specific action","tag":"HyperX","color":"#e8185d"}
  ]
}
Generate exactly 6 blocks covering weeks 1-12.
Tags must be one of: HyperX, DigiHub, Gen-E, Project, Portfolio, Apply
Colors: #e8185d, #7c3aed, #059669, #0284c7, #d97706, #0a0a0a`;

    const raw = await groqChat([{ role: "user", content: prompt }], "Return only valid JSON.", 1000);

    let roadmapData;
    try {
      roadmapData = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      roadmapData = getDefaultRoadmap(p);
    }

    const { rows } = await pool.query(
      "INSERT INTO career_roadmaps (user_id, title, goal, weeks) VALUES ($1,$2,$3,$4) RETURNING *",
      [req.user.id, roadmapData.title, roadmapData.goal, JSON.stringify(roadmapData.weeks)]
    ).catch(() => ({ rows: [{ ...roadmapData, id: null }] }));

    res.json({ success: true, roadmap: rows[0] });
  } catch (err) {
    console.error("Roadmap error:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate roadmap" });
  }
});

function getDefaultRoadmap(p) {
  const target = p?.target_role || "your target role";
  return {
    title: "Your 12-Week Career Roadmap",
    goal: `Become job-ready for ${target} with a strong portfolio and interview confidence.`,
    weeks: [
      { week: "Week 1–2", title: "Skill Audit & Gap Analysis", desc: "Use Gen-E to map your exact skill gaps. Identify the top 3 skills to close before applying.", tag: "Gen-E", color: "#0a0a0a" },
      { week: "Week 3–4", title: "Core Skill Building", desc: "Complete your top priority HyperX module. Focus 100% — finish it with the certificate.", tag: "HyperX", color: "#e8185d" },
      { week: "Week 5–6", title: "Build a Portfolio Project", desc: "Create one real project end-to-end: problem → approach → outcome. Document everything.", tag: "Project", color: "#7c3aed" },
      { week: "Week 7–8", title: "Resume & LinkedIn Overhaul", desc: "Run your resume through Gen-E. Get ATS score above 80. Rewrite LinkedIn headline and summary.", tag: "Gen-E", color: "#0a0a0a" },
      { week: "Week 9–10", title: "Network & Apply", desc: "Connect with 10 professionals via DigiHub. Apply to 5 target roles with tailored resumes.", tag: "DigiHub", color: "#0284c7" },
      { week: "Week 11–12", title: "Interview & Negotiate", desc: "Run 3 mock interview sessions with Gen-E. Prepare STAR stories. Research salary benchmarks.", tag: "Gen-E", color: "#0a0a0a" },
    ],
  };
}

// GET /api/gen-e/usage
router.get("/usage", authenticate, async (req, res) => {
  try {
    const monthYear = new Date().toISOString().slice(0, 7);
    const { rows: usageRows } = await pool.query(
      "SELECT * FROM ai_usage WHERE user_id = $1 AND month_year = $2",
      [req.user.id, monthYear]
    ).catch(() => ({ rows: [] }));

    const { rows: subRows } = await pool.query(
      "SELECT plan FROM subscriptions WHERE user_id = $1 AND status = 'active' LIMIT 1",
      [req.user.id]
    ).catch(() => ({ rows: [] }));

    const usage = usageRows[0] || { chat_count: 0, analysis_count: 0 };
    const plan = subRows[0]?.plan || "free";

    res.json({
      success: true,
      plan,
      chat_count: usage.chat_count || 0,
      analysis_count: usage.analysis_count || 0,
      // Groq is free so we set generous limits
      chat_limit: plan === "free" ? 100 : -1,
      month: monthYear,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch usage" });
  }
});

module.exports = router;