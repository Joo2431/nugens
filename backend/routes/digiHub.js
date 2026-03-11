// routes/digiHub.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// GET /api/digihub/jobs
router.get('/jobs', authenticate, async (req, res) => {
  const { type, remote, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let q = 'SELECT jl.*, u.first_name, u.last_name, u.company_name FROM job_listings jl JOIN users u ON u.id = jl.posted_by WHERE jl.is_active = TRUE';
    const params = [];
    let i = 1;
    if (type) { q += ` AND jl.job_type = $${i++}`; params.push(type); }
    if (remote === 'true') { q += ` AND jl.is_remote = TRUE`; }
    q += ` ORDER BY jl.created_at DESC LIMIT $${i++} OFFSET $${i}`;
    params.push(limit, offset);
    const result = await pool.query(q, params);
    res.json({ success: true, jobs: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load jobs' });
  }
});

// POST /api/digihub/jobs  — post a job (business users)
router.post('/jobs', authenticate, async (req, res) => {
  const { title, company, description, requirements, salary_min, salary_max, job_type, location, is_remote, tags } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO job_listings (posted_by, title, company, description, requirements, salary_min, salary_max, job_type, location, is_remote, tags)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.user.userId, title, company, description, JSON.stringify(requirements || []), salary_min, salary_max, job_type, location, is_remote, JSON.stringify(tags || [])]
    );
    res.status(201).json({ success: true, job: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to post job' });
  }
});

// GET /api/digihub/community
router.get('/community', authenticate, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const result = await pool.query(
      `SELECT cp.*, u.first_name, u.last_name, u.avatar_url FROM community_posts cp
       JOIN users u ON u.id = cp.user_id WHERE cp.is_visible = TRUE
       ORDER BY cp.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load posts' });
  }
});

// POST /api/digihub/community
router.post('/community', authenticate, async (req, res) => {
  const { content, media_urls } = req.body;
  if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content required' });
  try {
    const result = await pool.query(
      `INSERT INTO community_posts (user_id, content, media_urls) VALUES ($1,$2,$3) RETURNING *`,
      [req.user.userId, content, JSON.stringify(media_urls || [])]
    );
    res.status(201).json({ success: true, post: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create post' });
  }
});

// POST /api/digihub/ai-tools  — AI marketing tool usage
router.post('/ai-tools', authenticate, async (req, res) => {
  const { tool_type, prompt } = req.body;
  try {
    // Log usage
    await pool.query(
      `INSERT INTO ai_tool_usage (user_id, tool_type, prompt) VALUES ($1,$2,$3)`,
      [req.user.userId, tool_type, prompt]
    );
    // Actual AI call should go through /api/ai/chat with product_id='digihub'
    res.json({ success: true, message: 'Tool usage logged. Use /api/ai/chat for AI generation.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Tool error' });
  }
});

module.exports = router;
