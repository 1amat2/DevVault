'use strict';

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const rateLimit      = require('express-rate-limit');
const path           = require('path');
require('dotenv').config();

const app = express();

// ─── Security middleware ─────────────────────────────────────
app.use(helmet({
  // Allow inline scripts needed by the frontend
  contentSecurityPolicy: false,
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  credentials: true,
}));

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ─── Global rate limiter ─────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again later.' },
});
app.use('/api', globalLimiter);

// ─── Stricter limit for auth routes ─────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts — try again in 15 minutes.' },
});
app.use('/api/auth', authLimiter);

// ─── Static frontend ─────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'src')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/notes',    require('./routes/notes'));
app.use('/api/github',   require('./routes/github'));
app.use('/api/ai',       require('./routes/ai'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/learning', require('./routes/learning'));

// ─── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Fallback: serve frontend ────────────────────────────────
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'pages', 'login.html'));
});

// ─── Handle /index.html specifically ──────────────────────────
app.get('/index.html', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'pages', 'index.html'));
});

// ─── SPA fallback for unknown routes ──────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'src', 'pages', 'index.html'));
});

// ─── Global error handler ────────────────────────────────────
app.use(require('./middleware/errorHandler'));

// ─── Start server ────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n  ⚡ DevVault running on http://localhost:${PORT}\n`);
});

module.exports = app;
