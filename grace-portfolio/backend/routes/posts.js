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
    const { rows } = await db.query(`
    SELECT

        p.id,
        p.title,
        p.date,
        p.excerpt,
        p.content,

        COALESCE(

            array_agg(t.name ORDER BY t.name)
            FILTER (WHERE t.id IS NOT NULL),

            '{}'

        ) AS tags

    FROM posts p

    LEFT JOIN post_tags pt
    ON p.id = pt.post_id

    LEFT JOIN tags t
    ON pt.tag_id = t.id

    GROUP BY p.id

    ORDER BY p.created_at DESC;
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts — admin only
router.post('/', verifyJWT, async (req, res, next) => {
  const { title, date, tag, excerpt, content} = req.body || {};
  if (!title || !date || !tag) {
    return res.status(400).json({ error: 'title, date, and tag are required.' });
  }
  // Check if the tag exists in the tags table
  const { rows } = await db.query(
  `
  SELECT id
  FROM tags
  WHERE name = $1;
  `,
  [tag]
  );

  if (rows.length === 0) {
    return res.status(400).json({
      error: "Invalid tag."
    });
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO posts (title, date, tag, excerpt, content) VALUES ($1,$2,$3,$4) RETURNING *',
      [title, date, tag, excerpt || '', content || '']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/posts/:id — admin only
router.put('/:id', verifyJWT, async (req, res, next) => {
    const { id } = req.params;
    const { title, date, tag, excerpt, content } = req.body;
    try {
        const { rows } = await db.query(
            `
            UPDATE posts
            SET
                title = $1,
                date = $2,
                tag = $3,
                excerpt = $4,
                content = $5
            WHERE id = $6
            RETURNING *;
            `,
            [title, date, tag, excerpt, content, id]
        );
        if (!rows.length) {
            return res.status(404).json({
                error: "Post not found."
            });
        }
        res.json(rows[0]);
    }
    catch (err) {
        next(err);
    }
});

// DELETE /api/posts/:id — admin only
router.delete('/:id', verifyJWT, async (req, res, next) => {
    try {
        const { rows } = await db.query(
            `
            DELETE FROM posts
            WHERE id = $1
            RETURNING *;
            `,
            [req.params.id]
        );
        if (!rows.length) {
            return res.status(404).json({
                error: "Post not found."
            });
        }
        res.json({
            success: true
        });
    }
    catch (err) {
        next(err);
    }
});

module.exports = router;
