/**
 * Grace Wang Portfolio — Express Backend
 *
 * Routes:
 *   POST /api/auth/login     — returns a JWT (admin only)
 *   GET  /api/posts          — list all blog posts (public)
 *   POST /api/posts          — create post (admin)
 *   GET  /api/reviews        — list all library reviews (public)
 *   POST /api/reviews        — create review (admin)
 *   POST /api/contact        — send contact form message
 *
 * Run locally:
 *   npm install
 *   cp .env.example .env    (fill in secrets)
 *   node backend/server.js
 *
 * Deploy: see vercel.json — Vercel treats this file as a serverless function.
 */

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const tags    = require('./routes/tags');

const app = express();

// ── Middleware ───────────────────────────────────────────────────
app.use(express.json());
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no Origin (e.g. Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/posts',   require('./routes/posts'));
app.use('/api/tags',    tags);
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/contact', require('./routes/contact'));

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// ── 404 handler ──────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler ─────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// ── Start (local only — Vercel exports the app instead) ──────────
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app; // required for Vercel serverless
