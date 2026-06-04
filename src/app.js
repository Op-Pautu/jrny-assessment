const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const config = require('./config');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const healthRoutes = require('./routes/health');

const app = express();

app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/health', healthRoutes);

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  // Only expose stack trace in development
  if (config.nodeEnv === 'development') {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }

  res.status(500).json({ error: 'Internal server error' });
});

const PORT = config.port || 3000;

const server = app.listen(PORT, () => {
  console.log('TaskFlow server running on port ' + PORT);
});

// Graceful shutdown handling
const shutdown = () => {
  console.log('Received shutdown signal, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    const pool = require('./db/connection');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;
