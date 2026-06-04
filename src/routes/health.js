const express = require('express');
const pool = require('../db/connection');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'database_unavailable' });
  }
});

module.exports = router;
