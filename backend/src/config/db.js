// src/config/db.js
// ─────────────────────────────────────────────────────────────────────────────
// Database configuration and connection pool using mysql2/promise.
// We use a connection pool (not a single connection) for efficient handling of
// multiple simultaneous writes from the streaming pipeline.
// ─────────────────────────────────────────────────────────────────────────────

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dual_streaming_db',
  waitForConnections: true,
  connectionLimit: 10,       // Max concurrent connections in pool
  queueLimit: 0,             // Unlimited queue (prevents rejection)
});

/**
 * Initialize the database:
 * 1. Create the database if it doesn't exist
 * 2. Create the crypto_prices table if it doesn't exist
 */
async function initDB() {
  // Step 1: Create DB without using the pool (pool already targets the DB)
  const tempConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  await tempConn.execute(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'dual_streaming_db'}\``
  );
  await tempConn.end();

  // Step 2: Create table using pool
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS crypto_prices (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      coin_id       VARCHAR(50)    NOT NULL,
      coin_name     VARCHAR(100)   NOT NULL,
      symbol        VARCHAR(20)    NOT NULL,
      current_price DECIMAL(20,8)  NOT NULL,
      market_cap    BIGINT,
      total_volume  BIGINT,
      price_change_24h      DECIMAL(10,4),
      price_change_pct_24h  DECIMAL(10,4),
      high_24h      DECIMAL(20,8),
      low_24h       DECIMAL(20,8),
      fetched_at    DATETIME       NOT NULL,
      created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_coin_id   (coin_id),
      INDEX idx_fetched_at (fetched_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('✅ Database & Table initialized');
}

module.exports = { pool, initDB };
