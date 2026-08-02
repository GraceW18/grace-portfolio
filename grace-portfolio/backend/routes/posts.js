/**
 * /api/posts
 *
 * GET  /api/posts      — return all posts, newest first (public)
 * POST /api/posts      — create a new post (admin only, JWT required)
 *
 * Schema (PostgreSQL / Supabase):
 *   CREATE TABLE posts (
 *     id      SERIAL PRIMARY KEY,
 *     title   TEXT NOT NULL,
 *     date    TEXT NOT NULL,          -- e.g. "Jul 2026"
 *     tag     TEXT NOT NULL,          -- ai | policy | research | hardware
 *     excerpt TEXT,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 */

const router    = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const db        = require('../db/client');

// GET /api/posts — public
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, title, date, tag, excerpt FROM posts ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts — admin only
router.post('/', verifyJWT, async (req, res, next) => {
  const { title, date, tag, excerpt } = req.body || {};
  if (!title || !date || !tag) {
    return res.status(400).json({ error: 'title, date, and tag are required.' });
  }
  const VALID_TAGS = ['ai', 'policy', 'research', 'hardware'];
  if (!VALID_TAGS.includes(tag)) {
    return res.status(400).json({ error: `tag must be one of: ${VALID_TAGS.join(', ')}` });
  }
  try {
    const { rows } = await db.query(
      'INSERT INTO posts (title, date, tag, excerpt) VALUES ($1,$2,$3,$4) RETURNING *',
      [title, date, tag, excerpt || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
