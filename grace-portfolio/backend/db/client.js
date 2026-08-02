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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase & most managed providers require SSL in production
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,               // max pool connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected pg pool error:', err);
});

module.exports = pool;
