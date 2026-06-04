// Application configuration
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '24h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
};

// Validate required environment variables
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required');
}

module.exports = config;
