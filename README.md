# TaskFlow — Project Management API

A secure, containerized REST API for task management with user authentication. Built with Node.js/Express, PostgreSQL, and Docker.

## Overview

TaskFlow is a full-featured task management API with:
- User authentication with bcrypt password hashing and JWT tokens
- Task CRUD operations with validation
- Security hardening (helmet, rate limiting, input validation, parameterized queries)
- Docker containerization with multi-stage builds
- CI/CD pipeline with GitHub Actions
- Health check endpoint with database verification

## Issues Found & Fixed

### Critical Security Issues (10 fixed)
- ✅ SQL injection vulnerabilities (login, delete endpoints) → Parameterized queries
- ✅ Plain text passwords → Bcrypt hashing (10 salt rounds)
- ✅ Hardcoded secrets → Environment variables
- ✅ Stack trace exposure → Hidden in production
- ✅ CORS misconfiguration → Restricted to FRONTEND_URL
- ✅ Missing input validation → Express-validator added
- ✅ No security headers → Helmet middleware
- ✅ No rate limiting → Express-rate-limit on auth endpoints
- ✅ XSS vulnerability in frontend → HTML entities, textContent instead of innerHTML
- ✅ Missing Content-Security-Policy → CSP meta tag added

### High Priority Bugs (12 fixed)
- ✅ Missing morgan dependency → Installed
- ✅ Missing nodemon dependency → Installed as dev dependency
- ✅ Wrong start script → Updated to `node src/app.js`
- ✅ SQL injection in login → Parameterized query + bcrypt.compare()
- ✅ SQL injection in delete → Parameterized query
- ✅ Missing error handling in POST /tasks → Try-catch added
- ✅ Missing error handling in DELETE /tasks → Check rowCount, return 404
- ✅ Missing error handling in login → Try-catch with proper response codes
- ✅ Incorrect HTTP status codes → 201 for POST /tasks
- ✅ Async error handling gaps → Wrapped in try-catch
- ✅ Duplicate JWT_SECRET definition → Moved to config.js
- ✅ Hardcoded database credentials → Using environment variables

### Code Quality Improvements
- ✅ Commented-out code removed
- ✅ Unused formatTask() function removed
- ✅ Debug console.log statements removed (security risk - logged emails)
- ✅ Replaced deprecated body-parser with express.json()
- ✅ Added graceful shutdown handling (SIGTERM/SIGINT)
- ✅ Improved error responses
- ✅ .gitignore comprehensive

### Frontend Fixes
- ✅ **XSS vulnerability fixed**: Replaced `innerHTML` with `textContent` for task display
- ✅ **Auth state management**: Tasks section now hidden when logged out (security + UX)
- ✅ **Removed inline event handlers**: Replaced `onclick` attributes with `.addEventListener()` (CSP compliant)
- ✅ **Content-Security-Policy added**: Prevents script injection attacks
- ✅ **CSS class-based visibility**: Removed inline `style="display:none"` (CSP compliant)
- ✅ **Form cleanup on success**: Clears input fields and validation messages after successful actions
- ✅ **Input validation feedback**: Shows clear error messages for invalid input (empty title, username format, etc)

## Security Improvements

### Authentication & Password Security
- Bcrypt password hashing with 10 salt rounds
- Passwords never stored in plain text
- JWT tokens for session management (24h expiration)
- Password validation: 8-128 characters
- Duplicate user detection (409 Conflict response)

### Input Validation
- Email: Format validation + normalization
- Username: 3-30 chars, alphanumeric + dashes/underscores only
- Password: 8-128 characters
- Task title: Required, max 255 characters
- Task description: Max 10,000 characters (prevents DoS)
- Task status: Only allows 'pending', 'in_progress', 'completed'
- Task ID: Validated as integer

### Security Headers & Middleware
- Helmet.js for security headers (HSTS, X-Frame-Options, etc)
- Rate limiting on auth endpoints:
  - Login: 5 attempts per 15 minutes
  - Register: 3 attempts per hour
- CORS restricted to configured origin
- Content-Security-Policy header
- All parameterized queries (prevents SQL injection)

### Data Protection
- Environment variables for all secrets
- Health check verifies database connection
- Graceful error handling (no internal details exposed)
- .gitignore prevents credential leaks

### Frontend Security
- **XSS Prevention**: Task titles displayed as text content, not HTML
- **CSP Headers**: `script-src 'self' 'unsafe-inline'` allows only trusted scripts
- **Auth-based UI**: Sensitive sections (tasks, logout) hidden until authenticated
- **Event Listeners**: No inline `onclick` handlers (CSP-compliant)

## Local Development Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Installation & Running

**Option 1: With Docker Compose (Recommended)**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values (or use defaults)
# For development, defaults are fine

# Start services
docker-compose up

# Access at http://localhost:3000
```

**Option 2: Without Docker**
```bash
# Install dependencies
npm install

# Create PostgreSQL database locally
createdb taskflow

# Run schema
psql taskflow < src/db/schema.sql

# Create .env file
cp .env.example .env

# Update DATABASE_URL if needed:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/taskflow

# Start server
npm start

# Access at http://localhost:3000
```

## Docker Setup

### What Docker Compose Does
1. Starts PostgreSQL 15 Alpine with persistent volume
2. Auto-runs schema.sql on first start
3. Builds and starts Node.js app (Node 20 Alpine)
4. Sets up networking between services
5. Configures health checks (30s interval)
6. Maps ports: 3000 (app), 5432 (database)

### Key Files
- **Dockerfile**: Multi-stage build, non-root user, health check
- **.dockerignore**: Excludes node_modules, .env, .git, etc
- **docker-compose.yml**: Defines app + db services with volumes

### Accessing Services
- Frontend: http://localhost:3000
- Health Check: http://localhost:3000/health (returns `{"status":"ok"}`)
- Database: localhost:5432 (use psql or tools)

## CI/CD Pipeline

### GitHub Actions Workflow

**File**: `.github/workflows/build.yml`

**Triggers**: Push to `main` branch

**What it does**:
1. **Checkout**: Clones repository code
2. **Setup Node.js**: Installs Node 20
3. **Install Dependencies**: Runs `npm ci` for clean install
4. **Run Linting**: Checks code quality (if configured)
5. **Run Tests**: Executes test suite (`npm test`)
6. **Login to GHCR**: Uses GITHUB_TOKEN (automatic)
7. **Extract Metadata**: Generates image tags and labels
8. **Build & Push**: Builds Docker image and pushes to GitHub Container Registry

### Image Tagging
- `main-{git-sha}`: Unique SHA-based tag for each commit
- `latest`: Points to most recent build on main branch

### Required Secrets
- **GITHUB_TOKEN**: Automatically provided (no setup needed)
- All other secrets come from environment variables in .env

### Viewing Workflow Runs
1. Go to your GitHub repository
2. Click "Actions" tab
3. Select "Build and Push Docker Image" workflow
4. Click on a run to see logs for each step

## Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| DATABASE_URL | PostgreSQL connection string | `postgresql://taskflow:password@db:5432/taskflow` | Yes |
| JWT_SECRET | Secret key for JWT signing | Generate with: `openssl rand -base64 32` | Yes |
| NODE_ENV | Environment mode | `development` or `production` | No (default: development) |
| PORT | Application port | `3000` | No (default: 3000) |
| FRONTEND_URL | Frontend URL for CORS | `http://localhost:3000` | No |
| DB_USER | Database user (docker-compose) | `taskflow` | No (default: taskflow) |
| DB_PASSWORD | Database password (docker-compose) | `password` | No (default: password) |
| DB_NAME | Database name (docker-compose) | `taskflow` | No (default: taskflow) |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user
  ```json
  { "username": "user", "email": "user@example.com", "password": "password123" }
  ```
- `POST /api/auth/login` - Login and get JWT token
  ```json
  { "email": "user@example.com", "password": "password123" }
  ```

### Tasks (Requires Authentication Header)
- `GET /api/tasks` - Get all user's tasks
- `POST /api/tasks` - Create new task
  ```json
  { "title": "Task title", "description": "Optional description", "status": "pending" }
  ```
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Health Check
- `GET /health` - Check service and database health
  ```json
  { "status": "ok" }
  ```

## Architecture

**Frontend**: Vanilla JavaScript SPA (`public/`)
**Backend**: Node.js/Express REST API (`src/`)
**Database**: PostgreSQL 15 with connection pooling
**Authentication**: JWT with bcrypt password hashing
**Deployment**: Docker containers orchestrated by docker-compose

### Project Structure
```
taskflow/
├── .github/
│   └── workflows/
│       └── build.yml              # GitHub Actions CI/CD
├── public/                         # Frontend (SPA)
│   ├── index.html                 # Main HTML
│   ├── app.js                     # Frontend logic
│   └── style.css                  # Styling
├── src/
│   ├── app.js                     # Express app setup
│   ├── config.js                  # Configuration from env
│   ├── db/
│   │   ├── connection.js          # Database connection pool
│   │   └── schema.sql             # Database schema
│   ├── middleware/
│   │   └── auth.js                # JWT authentication middleware
│   └── routes/
│       ├── auth.js                # Register/login endpoints
│       ├── tasks.js               # Task CRUD endpoints
│       └── health.js              # Health check endpoint
├── .dockerignore                   # Exclude files from Docker build
├── .env.example                    # Environment template
├── .gitignore                      # Git ignore rules
├── docker-compose.yml              # Local development stack
├── Dockerfile                      # Multi-stage Docker build
├── package.json                    # Dependencies
└── README.md                       # This file
```

## Assumptions & Trade-offs

### Assumptions
- PostgreSQL 15+ available in Docker
- Docker used for deployment
- Single schema.sql runs once on database init
- JWT tokens stored in localStorage (acceptable for demo, known XSS risk)
- No user email verification required
- No password reset functionality
- No multi-user task assignment

### Trade-offs
- Chose bcrypt over argon2 (wider adoption, easier to debug)
- Used express-rate-limit (simple, effective for demo)
- No ORM (direct SQL for transparency)
- No TypeScript (assignment didn't require it)
- Minimal tests (echo statement) - would add comprehensive suite in production

## Development Commands

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Tests
npm test

# Linting (if configured)
npm run lint

# Docker build
docker build -t taskflow .

# Docker Compose
docker-compose up          # Start services
docker-compose down        # Stop services
docker-compose logs app    # View app logs
```

## Security Checklist

- ✅ All SQL injections fixed (parameterized queries)
- ✅ Passwords hashed with bcrypt
- ✅ All secrets in environment variables
- ✅ Input validation on all endpoints
- ✅ Rate limiting on auth endpoints
- ✅ Security headers with helmet
- ✅ CORS restricted
- ✅ XSS vulnerability fixed
- ✅ Stack traces hidden in production
- ✅ .gitignore prevents secret leaks
- ✅ Non-root Docker user
- ✅ Health check with database verification

## Future Improvements

- Database migrations tool (node-pg-migrate)
- Refresh token mechanism
- Email verification on signup
- Password reset flow
- User roles and permissions
- Task assignment to other users
- Task due dates and priorities
- Real-time updates (WebSockets)
- Comprehensive test suite (Jest/Mocha)
- API documentation (Swagger/OpenAPI)
- Monitoring and logging (Prometheus, Grafana)

## License

ISC
