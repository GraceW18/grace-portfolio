/**
 * verifyJWT.js
 * Express middleware that validates a Bearer JWT on protected routes.
 *
 * Usage:
 *   const verifyJWT = require('../middleware/verifyJWT');
 *   router.post('/', verifyJWT, handlerFn);
 */

const jwt = require('jsonwebtoken');

module.exports = function verifyJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  const token = authHeader.slice(7); // strip "Bearer "
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { role: 'admin', iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
