const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected PG pool error:", err);
});

pool.query("SELECT NOW()").then(() => {
  console.log("✓ Supabase PostgreSQL connected");
}).catch((err) => {
  console.error("✗ Database connection failed:", err.message);
});

module.exports = pool;