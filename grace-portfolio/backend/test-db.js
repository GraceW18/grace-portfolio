const path = require('path');

require('dotenv').config({
  path: path.resolve(__dirname, '../.env'),
});

const { Client } = require('pg');
console.log(process.env.DATABASE_URL);

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log("✅ Connected!");
    const result = await client.query("SELECT NOW()");
    console.log(result.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
})();