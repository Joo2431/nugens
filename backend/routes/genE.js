// routes/genE.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// GET /api/gen-e/profile  — career profile + skill gap
router.get('/profile', authenticate, async (req, res) => {
  try {
    const [user, resumes, applications] = await Promise.all([
      pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]),
      pool.query('SELECT * FROM resumes WHERE user_id = $1 ORDER BY is_primary DESC, updated_at DESC', [req.user.userId]),
      pool.query('SELECT * FROM job_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [req.user.userId])
    ]);
    res.json({ success: true, profile: user.rows[0], resumes: resumes.rows, recent_applications: applications.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
});

// POST /api/gen-e/resumes
router.post('/resumes', authenticate, async (req, res) => {
  const { title, target_role, content } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO resumes (user_id, title, target_role, content) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.userId, title, target_role, JSON.stringify(content)]
    );
    res.status(201).json({ success: true, resume: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create resume' });
  }
});

// GET /api/gen-e/jobs  — job matches
router.get('/jobs', authenticate, async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  try {
    const offset = (page - 1) * limit;
    let q = 'SELECT * FROM job_listings WHERE is_active = TRUE';
    const params = [];
    q += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(q, params);
    res.json({ success: true, jobs: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load jobs' });
  }
});

// POST /api/gen-e/applications
router.post('/applications', authenticate, async (req, res) => {
  const { company, role, job_url, resume_id, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO job_applications (user_id, company, role, job_url, resume_id, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.userId, company, role, job_url, resume_id, notes]
    );
    res.status(201).json({ success: true, application: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save application' });
  }
});

// PATCH /api/gen-e/applications/:id
router.patch('/applications/:id', authenticate, async (req, res) => {
  const { status, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE job_applications SET status = COALESCE($1, status), notes = COALESCE($2, notes), updated_at = NOW()
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [status, notes, req.params.id, req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, application: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

module.exports = router;
