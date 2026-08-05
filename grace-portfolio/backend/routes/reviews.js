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
    const { rows } = await db.query(`
      SELECT
        r.id, r.title, r.author, r.type, r.accent, r.genre, r.rating, r.status, r.review,
        COALESCE(
          jsonb_agg(
            jsonb_build_object('name', t.name, 'color', t.color, 'icon', t.icon)
            ORDER BY t.name
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::jsonb
        ) AS tags
      FROM reviews r
      LEFT JOIN review_tags rt ON r.id = rt.review_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/reviews — admin only
router.post('/', verifyJWT, async (req, res, next) => {
  const { title, author, type, accent, genre, rating, status, review, tags = [] } = req.body || {};
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
    const reviewId = rows[0].id;
    if (tags.length) {
      const { rows: tagRows } = await db.query(
        `SELECT id FROM tags WHERE name = ANY($1::text[])`, [tags]
      );
      for (const t of tagRows) {
        await db.query(
          'INSERT INTO review_tags (review_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [reviewId, t.id]
        );
      }
    }
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// editing reviews
router.put('/:id', verifyJWT, async (req, res, next) => {
  const { id } = req.params;
  const { title, author, type, accent, genre, rating, status, review, tags = [] } = req.body || {};
  const VALID_ACCENTS = ['indigo', 'teal', 'amber'];
  const safeAccent = VALID_ACCENTS.includes(accent) ? accent : 'indigo';
  try {
    const { rows } = await db.query(
      `UPDATE reviews SET title=$1, author=$2, type=$3, accent=$4, genre=$5,
       rating=$6, status=$7, review=$8 WHERE id=$9 RETURNING *`,
      [title, author || '', type, safeAccent, genre || '', rating || '', status || '', review || '', id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Review not found.' });

    await db.query('DELETE FROM review_tags WHERE review_id = $1', [id]);
    if (tags.length) {
      const { rows: tagRows } = await db.query(
        `SELECT id FROM tags WHERE name = ANY($1::text[])`, [tags]
      );
      for (const t of tagRows) {
        await db.query(
          'INSERT INTO review_tags (review_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, t.id]
        );
      }
    }
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
