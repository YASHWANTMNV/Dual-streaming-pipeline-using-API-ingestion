// src/routes/api.js
// ─────────────────────────────────────────────────────────────────────────────
// REST API ROUTES
//
// These endpoints let the frontend:
//   GET /api/history        — Fetch paginated historical records from DB
//   GET /api/latest         — Fetch the most recent snapshot per coin
//   GET /api/stats          — Aggregate stats (total records, coins, time range)
//   GET /api/health         — Server + pipeline health check
//
// These are complementary to the WebSocket stream:
//   • WebSocket = live push (new data every poll cycle)
//   • REST       = pull on-demand (initial load, history browsing)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// ── GET /api/history ──────────────────────────────────────────────────────────
// Returns paginated historical records, newest first.
// Query params: ?limit=50&offset=0&coin=bitcoin
router.get('/history', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 200); // Cap at 200
        const offset = parseInt(req.query.offset) || 0;
        const coin = req.query.coin;  // Optional filter by coin_id

        let sql = 'SELECT * FROM crypto_prices';
        let params = [];

        if (coin) {
            sql += ' WHERE coin_id = ?';
            params.push(coin);
        }

        sql += ' ORDER BY fetched_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.execute(sql, params);

        // Total count for pagination
        let countSql = 'SELECT COUNT(*) AS total FROM crypto_prices';
        let countParams = [];
        if (coin) { countSql += ' WHERE coin_id = ?'; countParams.push(coin); }
        const [[{ total }]] = await pool.execute(countSql, countParams);

        res.json({ success: true, total, limit, offset, data: rows });
    } catch (err) {
        console.error('❌ /api/history error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/latest ──────────────────────────────────────────────────────────
// Returns the single most recent record per coin.
// Used by the frontend on initial load before WebSocket data arrives.
router.get('/latest', async (req, res) => {
    try {
        const sql = `
      SELECT cp.*
      FROM crypto_prices cp
      INNER JOIN (
        SELECT coin_id, MAX(id) AS max_id
        FROM crypto_prices
        GROUP BY coin_id
      ) AS latest ON cp.id = latest.max_id
      ORDER BY cp.market_cap DESC
    `;
        const [rows] = await pool.execute(sql);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) {
        console.error('❌ /api/latest error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/stats ────────────────────────────────────────────────────────────
// Aggregate pipeline statistics.
router.get('/stats', async (req, res) => {
    try {
        const [[stats]] = await pool.execute(`
      SELECT
        COUNT(*)                          AS total_records,
        COUNT(DISTINCT coin_id)           AS unique_coins,
        MIN(fetched_at)                   AS first_record,
        MAX(fetched_at)                   AS last_record,
        ROUND(AVG(current_price), 4)      AS avg_price_usd,
        SUM(total_volume)                 AS total_volume_usd
      FROM crypto_prices
    `);
        res.json({ success: true, data: stats });
    } catch (err) {
        console.error('❌ /api/stats error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/coin/:id/history ────────────────────────────────────────────────
// Price history for a single coin (last N records for chart sparkline).
router.get('/coin/:id/history', async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 30, 100);
        const [rows] = await pool.execute(
            `SELECT current_price, price_change_pct_24h, fetched_at
       FROM crypto_prices
       WHERE coin_id = ?
       ORDER BY fetched_at DESC
       LIMIT ?`,
            [req.params.id, limit]
        );
        res.json({ success: true, coin_id: req.params.id, data: rows.reverse() });
    } catch (err) {
        console.error(`❌ /api/coin/${req.params.id}/history error:`, err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/health ───────────────────────────────────────────────────────────
// Health check — verifies DB connectivity.
router.get('/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        res.json({
            success: true,
            status: 'healthy',
            db: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        res.status(503).json({
            success: false,
            status: 'unhealthy',
            db: 'disconnected',
            error: err.message,
        });
    }
});

module.exports = router;
