// routes/users.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.user_type,
              u.career_field, u.career_stage, u.career_goal, u.company_name,
              u.company_size, u.industry, u.avatar_url, u.onboarding_done, u.created_at,
              COALESCE(json_agg(json_build_object('product_id',s.product_id,'plan_type',s.plan_type,'status',s.status)) FILTER (WHERE s.id IS NOT NULL), '[]') AS subscriptions
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load profile' });
  }
});

router.patch('/me', authenticate, async (req, res) => {
  const { first_name, last_name, phone, career_field, career_stage, career_goal, company_name, company_size, industry } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
         first_name = COALESCE($1, first_name), last_name = COALESCE($2, last_name),
         phone = COALESCE($3, phone), career_field = COALESCE($4, career_field),
         career_stage = COALESCE($5, career_stage), career_goal = COALESCE($6, career_goal),
         company_name = COALESCE($7, company_name), company_size = COALESCE($8, company_size),
         industry = COALESCE($9, industry), updated_at = NOW()
       WHERE id = $10 RETURNING id, email, first_name, last_name, phone, user_type, career_field, career_stage`,
      [first_name, last_name, phone, career_field, career_stage, career_goal, company_name, company_size, industry, req.user.userId]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

module.exports = router;
