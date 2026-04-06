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

// ── Helper: Generate Random Crypto Data ────────────────────────────────────────
// Creates realistic sample crypto data for demos
function generateSampleCryptoData(rows = 100) {
    const coins = [
        { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', basePrice: 45000 },
        { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', basePrice: 2500 },
        { id: 'cardano', name: 'Cardano', symbol: 'ADA', basePrice: 0.95 },
        { id: 'solana', name: 'Solana', symbol: 'SOL', basePrice: 180 },
        { id: 'ripple', name: 'Ripple', symbol: 'XRP', basePrice: 2.15 },
        { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', basePrice: 28 },
        { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', basePrice: 185 },
        { id: 'chainlink', name: 'Chain Link', symbol: 'LINK', basePrice: 32 },
    ];

    const data = [];
    const now = new Date();

    for (let i = 0; i < rows; i++) {
        const coin = coins[Math.floor(Math.random() * coins.length)];
        const timeOffset = Math.floor(Math.random() * 86400000); // Random time today
        const timestamp = new Date(now.getTime() - timeOffset).toISOString();
        
        // Random price variation (±10%)
        const priceVariation = (Math.random() - 0.5) * 0.2;
        const price = coin.basePrice * (1 + priceVariation);
        
        // Random 24h change
        const change24h = (Math.random() - 0.5) * 20;
        
        // Random volume
        const volume = Math.floor(Math.random() * 100000000) + 1000000;
        
        // Random market cap
        const marketCap = Math.floor(Math.random() * 5000000000) + 100000000;

        data.push({
            coin_id: coin.id,
            coin_name: coin.name,
            symbol: coin.symbol,
            current_price: price.toFixed(2),
            price_change_pct_24h: change24h.toFixed(2),
            market_cap: marketCap.toFixed(0),
            total_volume: volume.toFixed(0),
            fetched_at: timestamp,
        });
    }

    return data;
}

// ── Helper: Convert data array to CSV string ────────────────────────────────────
function arrayToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
}

// ── GET /api/csv/sample ────────────────────────────────────────────────────────
// Download sample crypto data as CSV
// Query: ?rows=100 (default 100, max 1000)
router.get('/csv/sample', (req, res) => {
    try {
        const rows = Math.min(parseInt(req.query.rows) || 100, 1000);
        const data = generateSampleCryptoData(rows);
        const csv = arrayToCSV(data);

        res.setHeader('Content-Type', 'text/csv;charset=utf-8;');
        res.setHeader('Content-Disposition', `attachment;filename=crypto-data-${Date.now()}.csv`);
        res.send(csv);
    } catch (err) {
        console.error('❌ /api/csv/sample error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── GET /api/csv/demo ──────────────────────────────────────────────────────────
// Get demo data WITH processed analytics (for frontend display)
router.get('/csv/demo', (req, res) => {
    try {
        const rows = 150;
        const rawData = generateSampleCryptoData(rows);

        // Process analytics
        const { coinStats, summaryStats, topGainers, topLosers } = processcsvData(rawData);

        res.json({
            success: true,
            raw_records: rawData.length,
            data: rawData,
            analytics: {
                coin_stats: coinStats,
                summary: summaryStats,
                top_gainers: topGainers,
                top_losers: topLosers,
            },
        });
    } catch (err) {
        console.error('❌ /api/csv/demo error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Helper: Process CSV data with analytics ────────────────────────────────────
function processcsvData(data) {
    // Group by coin
    const coinMap = {};
    data.forEach(row => {
        if (!coinMap[row.coin_id]) {
            coinMap[row.coin_id] = {
                coin_id: row.coin_id,
                coin_name: row.coin_name,
                symbol: row.symbol,
                prices: [],
                changes: [],
                volumes: [],
                market_caps: [],
            };
        }
        coinMap[row.coin_id].prices.push(parseFloat(row.current_price));
        coinMap[row.coin_id].changes.push(parseFloat(row.price_change_pct_24h));
        coinMap[row.coin_id].volumes.push(parseFloat(row.total_volume));
        coinMap[row.coin_id].market_caps.push(parseFloat(row.market_cap));
    });

    // Calculate stats per coin
    const coinStats = Object.values(coinMap).map(coin => {
        const prices = coin.prices;
        const changes = coin.changes;
        const volumes = coin.volumes;

        return {
            coin_id: coin.coin_id,
            coin_name: coin.coin_name,
            symbol: coin.symbol,
            records_count: prices.length,
            avg_price: (prices.reduce((a, b) => a + b) / prices.length).toFixed(2),
            min_price: Math.min(...prices).toFixed(2),
            max_price: Math.max(...prices).toFixed(2),
            price_volatility: ((Math.max(...prices) - Math.min(...prices)) / Math.min(...prices) * 100).toFixed(2),
            avg_change_24h: (changes.reduce((a, b) => a + b) / changes.length).toFixed(2),
            total_volume: volumes.reduce((a, b) => a + b).toFixed(0),
            avg_volume: (volumes.reduce((a, b) => a + b) / volumes.length).toFixed(0),
        };
    });

    // Summary stats
    const allPrices = data.map(r => parseFloat(r.current_price));
    const allChanges = data.map(r => parseFloat(r.price_change_pct_24h));
    const allVolumes = data.map(r => parseFloat(r.total_volume));

    const summaryStats = {
        total_records: data.length,
        unique_coins: Object.keys(coinMap).length,
        overall_avg_price: (allPrices.reduce((a, b) => a + b) / allPrices.length).toFixed(2),
        global_market_avg_change: (allChanges.reduce((a, b) => a + b) / allChanges.length).toFixed(2),
        total_trading_volume: allVolumes.reduce((a, b) => a + b).toFixed(0),
    };

    // Top gainers and losers
    const topGainers = [...coinStats].sort((a, b) => parseFloat(b.avg_change_24h) - parseFloat(a.avg_change_24h)).slice(0, 3);
    const topLosers = [...coinStats].sort((a, b) => parseFloat(a.avg_change_24h) - parseFloat(b.avg_change_24h)).slice(0, 3);

    return { coinStats, summaryStats, topGainers, topLosers };
}

module.exports = router;
