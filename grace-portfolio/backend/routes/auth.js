/**
 * /api/auth
 *
 * POST /api/auth/login
 */

const router    = require('express').Router();
const jwt       = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminPass) {
    console.error('ADMIN_PASSWORD env var not set');
    return res.status(500).json({ error: 'Server misconfiguration.' });
  }

  // Constant-time comparison to resist timing attacks
  const match = timingSafeEqual(password, adminPass);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token });
});

/**
 * Poor-man's constant-time string comparison.
 * Prevents timing-based enumeration of the correct password.
 */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const buf1 = Buffer.from(a.padEnd(64, '\0').slice(0, 64));
  const buf2 = Buffer.from(b.padEnd(64, '\0').slice(0, 64));
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < buf1.length; i++) diff |= buf1[i] ^ buf2[i];
  return diff === 0;
}

module.exports = router;
