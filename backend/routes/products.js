const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// GET /api/products — list all available products
router.get('/', (req, res) => {
  res.json({
    success: true,
    products: [
      { id: 'gen-e',   name: 'Gen-E',   description: 'AI Career Intelligence' },
      { id: 'hyperx',  name: 'HyperX',  description: 'Experience-Based Learning' },
      { id: 'digihub', name: 'DigiHub', description: 'Marketing & Community' },
      { id: 'units',   name: 'Units',   description: 'Visual Production Studio' },
    ]
  });
});

module.exports = router;