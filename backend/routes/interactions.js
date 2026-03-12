const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

// GET /api/interactions — get user's recent interactions
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM interactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.userId]
    );
    res.json({ success: true, interactions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load interactions' });
  }
});

// POST /api/interactions — log an interaction
router.post('/', authenticate, async (req, res) => {
  const { product_id, interaction_type, metadata } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO interactions (user_id, product_id, interaction_type, metadata)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.userId, product_id, interaction_type, JSON.stringify(metadata || {})]
    );
    res.status(201).json({ success: true, interaction: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to log interaction' });
  }
});

module.exports = router;
