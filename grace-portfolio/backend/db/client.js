/**
 * db/client.js
 *
 * A singleton pg Pool that reads the DATABASE_URL environment variable.
 * Works with any Postgres-compatible provider: Supabase, Neon, Railway,
 * Render, or a self-hosted instance.
 *
 * Usage:
 *   const db = require('../db/client');
 *   const { rows } = await db.query('SELECT * FROM posts');
 *
 * Supabase connection string format:
 *   postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
 *
 * Add to .env:
 *   DATABASE_URL=postgresql://...
 */

const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  const url = new URL(connectionString);
  pool = new Pool({
    user: url.username,
    password: url.password,
    host: url.hostname,
    port: Number(url.port),
    database: url.pathname.slice(1),
    ssl: {
      rejectUnauthorized: false,
    },
  });
  pool.on('error', (err) => {
    console.error('Unexpected pg pool error:', err);
  });
  return pool;
}

module.exports = new Proxy({}, {
  get(_target, prop) {
    const p = getPool();
    const value = p[prop];
    return typeof value === 'function' ? value.bind(p) : value;
  },
});
