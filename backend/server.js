require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ── MIDDLEWARE ──
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://nugens.pages.dev',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// ── ROUTES ──
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/products',      require('./routes/products'));
app.use('/api/interactions',  require('./routes/interactions'));
app.use('/api/gen-e',         require('./routes/genE'));
app.use('/api/hyperx',        require('./routes/hyperX'));
app.use('/api/digihub',       require('./routes/digiHub'));
app.use('/api/units',         require('./routes/units'));
app.use('/api/ai',            require('./routes/ai'));

// ── HEALTH CHECK ──
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

// ── ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 NuGens API running on port ${PORT}`);
});

module.exports = app;
