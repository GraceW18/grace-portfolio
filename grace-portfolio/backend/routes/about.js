/**
 * /api/about
 *
 * GET  /api/about   — return the about page data (public)
 * PUT  /api/about   — overwrite the about page data (admin)
 *
 * Schema (run once in Supabase SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS about_page (
 *     id         INTEGER PRIMARY KEY DEFAULT 1,
 *     data       JSONB NOT NULL DEFAULT '{}',
 *     updated_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 *
 *   -- Seed with one row so GET always returns something
 *   INSERT INTO about_page (id, data) VALUES (1, '{}') ON CONFLICT DO NOTHING;
 */

const router    = require('express').Router();
const verifyJWT = require('../middleware/verifyJWT');
const db        = require('../db/client');

// GET /api/about — public
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await db.query('SELECT data FROM about_page WHERE id = 1');
    res.json(rows[0]?.data || {});
  } catch (err) {
    next(err);
  }
});

// PUT /api/about — admin only
router.put('/', verifyJWT, async (req, res, next) => {
  const { bio, skills, currently, experience, hobbies } = req.body || {};
  const data = { bio, skills, currently, experience, hobbies };
  try {
    await db.query(
      `INSERT INTO about_page (id, data, updated_at)
       VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
      [JSON.stringify(data)]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;