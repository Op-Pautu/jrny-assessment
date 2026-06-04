const express = require('express');
const { body, validationResult, param } = require('express-validator');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  body('description')
    .trim()
    .optional()
    .isLength({ max: 10000 }).withMessage('Description must not exceed 10,000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed']).withMessage('Status must be one of: pending, in_progress, completed')
];

const validateUpdateTask = [
  param('id')
    .isInt().withMessage('Invalid task ID'),
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  body('description')
    .trim()
    .optional()
    .isLength({ max: 10000 }).withMessage('Description must not exceed 10,000 characters'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed']).withMessage('Status must be one of: pending, in_progress, completed')
];

const validateDeleteTask = [
  param('id')
    .isInt().withMessage('Invalid task ID')
];

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, validateCreateTask, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { title, description, status } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, title, description, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, validateUpdateTask, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  const { title, description, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, status = $3, updated_at = NOW() WHERE id = $4 AND user_id = $5 RETURNING *',
      [title, description, status, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, validateDeleteTask, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
