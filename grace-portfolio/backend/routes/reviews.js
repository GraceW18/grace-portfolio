/**
 * /api/reviews
 *
 * GET  /api/reviews    — return all library reviews, newest first (public)
 * POST /api/reviews    — create a new review (admin only, JWT required)
 *
 * Schema (PostgreSQL / Supabase):
 *   CREATE TABLE reviews (
 *     id      SERIAL PRIMARY KEY,
 *     title   TEXT NOT NULL,
 *     author  TEXT,
 *     type    TEXT NOT NULL,          -- book | paper | article
 *     accent  TEXT DEFAULT 'indigo',  -- indigo | teal | amber
 *     genre   TEXT,                   -- comma-separated, e.g. "AI, Nonfiction"
 *     rating  TEXT,                   -- e.g. "★★★★★"
 *     status  TEXT,                   -- e.g. "Rereading"
 *     review  TEXT,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 */

const router    = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const db        = require('../db/client');

// GET /api/reviews — public
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, author, type, accent, genre, rating, status, review FROM reviews ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/reviews — admin only
router.post('/', verifyJWT, async (req, res, next) => {
  const { title, author, type, accent, genre, rating, status, review } = req.body || {};
  if (!title || !type) {
    return res.status(400).json({ error: 'title and type are required.' });
  }
  const VALID_TYPES   = ['book', 'paper', 'article'];
  const VALID_ACCENTS = ['indigo', 'teal', 'amber'];
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(', ')}` });
  }
  const safeAccent = VALID_ACCENTS.includes(accent) ? accent : 'indigo';
  try {
    const { rows } = await db.query(
      `INSERT INTO reviews (title, author, type, accent, genre, rating, status, review)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, author || '', type, safeAccent, genre || '', rating || '', status || '', review || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
