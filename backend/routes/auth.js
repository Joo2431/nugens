const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validateRegister, validateLogin } = require('../middleware/validation');

// POST /api/auth/register
router.post('/register', validateRegister, async (req, res) => {
  const {
    email, password, first_name, last_name, phone,
    user_type, career_field, career_stage, career_goal,
    company_name, company_size, industry,
    selected_products = ['gen-e'], plan_type = 'starter'
  } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check existing
    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Create user
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type,
         career_field, career_stage, career_goal, company_name, company_size, industry)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING id, email, first_name, last_name, user_type, created_at`,
      [email, password_hash, first_name, last_name, phone, user_type,
       career_field, career_stage, career_goal, company_name, company_size, industry]
    );
    const user = userResult.rows[0];

    // Create subscriptions for selected products
    const validProducts = ['gen-e','hyperx','digihub','units','nugens'];
    for (const product_id of selected_products) {
      if (validProducts.includes(product_id)) {
        await client.query(
          `INSERT INTO subscriptions (user_id, product_id, plan_type, payment_status)
           VALUES ($1, $2, $3, $4)`,
          [user.id, product_id, plan_type, plan_type === 'starter' ? 'free' : 'pending']
        );
      }
    }

    // Log interaction
    await client.query(
      `INSERT INTO interactions (user_id, product_id, interaction_type)
       VALUES ($1, 'nugens', 'registration')`,
      [user.id]
    );

    await client.query('COMMIT');

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, user_type: user.user_type }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  } finally {
    client.release();
  }
});

// POST /api/auth/login
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      `SELECT u.*, json_agg(json_build_object('product_id', s.product_id, 'plan_type', s.plan_type, 'status', s.status)) AS subscriptions
       FROM users u
       LEFT JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
       WHERE u.email = $1 AND u.is_active = TRUE
       GROUP BY u.id`,
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...safeUser } = user;
    res.json({ success: true, token, user: safeUser });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, user_type: decoded.user_type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, token: newToken });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = router;
