// routes/subscriptions.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json({ success: true, subscriptions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load subscriptions' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { product_id, plan_type } = req.body;
  const valid = ['gen-e','hyperx','digihub','units','nugens'];
  if (!valid.includes(product_id)) return res.status(400).json({ success: false, message: 'Invalid product' });
  try {
    // Upsert subscription
    const result = await pool.query(
      `INSERT INTO subscriptions (user_id, product_id, plan_type)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET plan_type = $3, status = 'active', updated_at = NOW()
       RETURNING *`,
      [req.user.userId, product_id, plan_type || 'starter']
    );
    res.json({ success: true, subscription: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create subscription' });
  }
});

router.patch('/:id/cancel', authenticate, async (req, res) => {
  try {
    await pool.query(
      `UPDATE subscriptions SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );
    res.json({ success: true, message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Cancel failed' });
  }
});

module.exports = router;
