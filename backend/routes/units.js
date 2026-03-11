// routes/units.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { pool } = require('../config/database');

const SERVICES = {
  photography: { name: 'Photography', base_price: 299, duration_hrs: 4 },
  videography: { name: 'Videography', base_price: 499, duration_hrs: 6 },
  video_editing: { name: 'Video Editing', base_price: 199, duration_hrs: null },
  brand_shoot: { name: 'Brand Shoot', base_price: 799, duration_hrs: 8 },
  product_shoot: { name: 'Product Shoot', base_price: 399, duration_hrs: 4 },
  event_coverage: { name: 'Event Coverage', base_price: 899, duration_hrs: 8 },
  wedding: { name: 'Wedding Coverage', base_price: 1499, duration_hrs: 12 },
};

// GET /api/units/services
router.get('/services', authenticate, (req, res) => {
  res.json({ success: true, services: SERVICES });
});

// GET /api/units/bookings
router.get('/bookings', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY scheduled_date DESC',
      [req.user.userId]
    );
    res.json({ success: true, bookings: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
});

// POST /api/units/bookings
router.post('/bookings', authenticate, async (req, res) => {
  const { service_type, scheduled_date, time_slot, location, notes, duration_hrs } = req.body;
  if (!SERVICES[service_type]) return res.status(400).json({ success: false, message: 'Invalid service type' });
  const service = SERVICES[service_type];
  try {
    const result = await pool.query(
      `INSERT INTO bookings (user_id, service_type, scheduled_date, time_slot, location, notes, duration_hrs, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.userId, service_type, scheduled_date, time_slot, location, notes, duration_hrs || service.duration_hrs, service.base_price]
    );
    await pool.query(
      `INSERT INTO interactions (user_id, product_id, interaction_type, metadata) VALUES ($1,'units','booking_created',$2)`,
      [req.user.userId, JSON.stringify({ service_type, scheduled_date })]
    );
    res.status(201).json({ success: true, booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// PATCH /api/units/bookings/:id
router.patch('/bookings/:id', authenticate, async (req, res) => {
  const { status, notes } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bookings SET status = COALESCE($1,status), notes = COALESCE($2,notes), updated_at = NOW()
       WHERE id = $3 AND user_id = $4 RETURNING *`,
      [status, notes, req.params.id, req.user.userId]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Update failed' });
  }
});

// GET /api/units/availability?date=YYYY-MM-DD
router.get('/availability', authenticate, async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ success: false, message: 'Date required' });
  try {
    const booked = await pool.query(
      `SELECT time_slot FROM bookings WHERE scheduled_date = $1 AND status NOT IN ('cancelled')`,
      [date]
    );
    const bookedSlots = booked.rows.map(r => r.time_slot);
    const allSlots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
    const available = allSlots.filter(s => !bookedSlots.includes(s));
    res.json({ success: true, date, available_slots: available, booked_slots: bookedSlots });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to check availability' });
  }
});

module.exports = router;
