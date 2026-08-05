/**
 * /api/contact
 *
 * POST /api/contact
 *   Body: { name, email, message }
 *
 * For a personal portfolio the simplest production setup is:
 *   - Store the message in the DB (done here)
 *   - Optionally email it to yourself via Resend / SendGrid (stub shown)
 *
 * Schema (PostgreSQL / Supabase):
 *   CREATE TABLE contact_messages (
 *     id         SERIAL PRIMARY KEY,
 *     name       TEXT NOT NULL,
 *     email      TEXT NOT NULL,
 *     message    TEXT NOT NULL,
 *     created_at TIMESTAMPTZ DEFAULT NOW()
 *   );
 */

const router = require('express').Router();
const db     = require('../db/client');
const verifyJWT = require('../middleware/verifyJWT');

// ── GET /api/contact  (admin only)
router.get('/', verifyJWT, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT id, name, email, message, created_at FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}); 

// Delete (admin only)
router.delete('/:id', verifyJWT, async (req, res, next) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email, and message are required.' });
  }
  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  try {
    await db.query(
      'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );

    // ── Optional: send email to yourself ────────────────────────────
    // Uncomment and install `resend` (npm i resend) to get email alerts.
    //
    // const { Resend } = require('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'portfolio@yourdomain.com',
    //   to:   'gwang426@gatech.edu',
    //   subject: `Portfolio contact from ${name}`,
    //   text: `From: ${name} <${email}>\n\n${message}`,
    // });
    // ────────────────────────────────────────────────────────────────

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
