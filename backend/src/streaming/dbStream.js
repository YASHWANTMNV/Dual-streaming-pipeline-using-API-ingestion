// src/streaming/dbStream.js
// ─────────────────────────────────────────────────────────────────────────────
// DATABASE STREAMING OUTPUT
//
// Responsibility: Write processed coin records to MySQL using bulk INSERT.
//
// Design choices:
//   • Bulk insert (INSERT ... VALUES (...), (...)) is far more efficient than
//     N individual inserts for a batch of 10 coins.
//   • Each pipeline cycle inserts one batch row per coin.
//   • The pool from db.js ensures concurrent writes don't block each other.
// ─────────────────────────────────────────────────────────────────────────────

const { pool } = require('../config/db');

/**
 * Insert a batch of processed coin records into MySQL.
 * Uses a single bulk INSERT for efficiency.
 *
 * @param {Array} coins - Array of clean coin objects from dataProcessor
 */
async function streamToDB(coins) {
    if (!coins || coins.length === 0) return;

    // Build bulk INSERT: INSERT INTO table (col1, col2, ...) VALUES (?, ?, ...), (?, ?, ...), ...
    const columns = [
        'coin_id', 'coin_name', 'symbol', 'current_price',
        'market_cap', 'total_volume', 'price_change_24h',
        'price_change_pct_24h', 'high_24h', 'low_24h', 'fetched_at'
    ];

    // Flatten values: [[v1,v2,...], [v1,v2,...]] → [v1, v2, ..., v1, v2, ...]
    const placeholderRow = `(${columns.map(() => '?').join(', ')})`;
    const placeholders = coins.map(() => placeholderRow).join(', ');
    const values = coins.flatMap(coin => columns.map(col => coin[col]));

    const sql = `INSERT INTO crypto_prices (${columns.join(', ')}) VALUES ${placeholders}`;

    try {
        const [result] = await pool.execute(sql, values);
        console.log(`💾 [DB Stream] Inserted ${result.affectedRows} rows — insertId: ${result.insertId}`);
    } catch (err) {
        console.error('❌ [DB Stream] Insert failed:', err.message);
        // Don't rethrow — let the pipeline continue even if DB write fails
    }
}

module.exports = { streamToDB };
