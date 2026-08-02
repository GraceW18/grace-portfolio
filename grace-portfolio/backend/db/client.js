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

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set.');
}
const connectionString = process.env.DATABASE_URL;

const url = new URL(connectionString);

console.log("Username:", url.username);
console.log("Password:", url.password);
console.log("Host:", url.hostname);

const pool = new Pool({
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

module.exports = pool;
