// src/routes/api.js
// ─────────────────────────────────────────────────────────────────────────────
// IMPROVED REST API ROUTES (v2.0)
//
// Features:
//   • Standardized response format with status codes
//   • Input validation & sanitization
//   • Rate limiting & caching
//   • Better error handling & logging
//   • Comprehensive endpoint documentation
//
// Endpoints:
//   GET  /api/latest            — Latest crypto prices per coin
//   GET  /api/history           — Paginated historical records
//   GET  /api/stats             — Aggregate pipeline statistics
//   GET  /api/health            — Server health check
//   GET  /api/csv/sample        — Download sample CSV file
//   GET  /api/csv/demo          — Demo data with analytics (JSON)
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { sendSuccess, sendError, sendPaginated, sendValidationError } = require('../utils/response');
const { validatePagination, validateCoinFilter, validateCSVRowCount, logValidationError } = require('../utils/validators');
const { CacheStore } = require('../middleware');

// Initialize caches
const latestCache = new CacheStore(30000); // 30 second cache
const statsCache = new CacheStore(60000);  // 60 second cache

// ── Global cache for latest data (updated by pipeline) ─────────────────────────
let latestCoinsCache = [];
let pipelineStats = {
    totalUpdates: 0,
    lastUpdate: new Date().toISOString(),
    dataSource: 'pipeline',
};

/**
 * @route   GET /api/latest
 * @desc    Get latest crypto price snapshot for all coins
 * @tags    Crypto Data
 * @returns {Object} Latest coin data with market info
 */
router.get('/latest', (req, res) => {
    try {
        // Check cache first
        const cached = latestCache.get('latest');
        if (cached) {
            console.log('✅ [Cache HIT] /api/latest');
            return sendSuccess(res, cached.data, 'Latest prices retrieved', 200, {
                source: 'cache',
                cached: true,
            });
        }

        // Try database first
        (async () => {
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
                
                // Cache the result
                latestCache.set('latest', {
                    data: rows,
                    source: 'database',
                });

                return sendSuccess(res, rows, 'Latest prices retrieved', 200, {
                    source: 'database',
                    count: rows.length,
                });
            } catch (dbErr) {
                // Fall back to in-memory cache from pipeline
                console.warn('⚠️  Database unavailable, using pipeline cache');
                return sendSuccess(res, latestCoinsCache, 'Latest prices retrieved (from pipeline)', 200, {
                    source: 'pipeline',
                    count: latestCoinsCache.length,
                    dataSource: 'live-streaming',
                });
            }
        })();
    } catch (err) {
        console.error('❌ /api/latest error:', err.message);
        sendError(res, 'Failed to retrieve latest prices', 500, 'FETCH_LATEST_ERROR');
    }
});

/**
 * @route   GET /api/history
 * @desc    Get paginated historical crypto price records
 * @query   {number} limit - Records per page (default: 50, max: 500)
 * @query   {number} offset - Pagination offset (default: 0)
 * @query   {string} coin - Filter by coin ID (optional)
 * @tags    Crypto Data
 * @returns {Object} Paginated historical data
 */
router.get('/history', async (req, res) => {
    try {
        // Validate pagination
        const paginationCheck = validatePagination(req.query.limit, req.query.offset);
        if (!paginationCheck.valid) {
            logValidationError('history-pagination', paginationCheck.error, req.query);
            return sendValidationError(res, paginationCheck.error);
        }

        const limit = paginationCheck.limit;
        const offset = paginationCheck.offset;

        // Validate coin filter
        const coinCheck = validateCoinFilter(req.query.coin);
        if (!coinCheck.valid) {
            logValidationError('history-coin', coinCheck.error, req.query);
            return sendValidationError(res, coinCheck.error);
        }

        let sql = 'SELECT * FROM crypto_prices';
        let countSql = 'SELECT COUNT(*) AS total FROM crypto_prices';
        let params = [];
        let countParams = [];

        // Optional coin filter
        if (coinCheck.value) {
            sql += ' WHERE coin_id = ?';
            countSql += ' WHERE coin_id = ?';
            params.push(coinCheck.value);
            countParams.push(coinCheck.value);
        }

        sql += ' ORDER BY fetched_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [rows] = await pool.execute(sql, params);
        const [[{ total }]] = await pool.execute(countSql, countParams);

        return sendPaginated(res, rows, total, limit, offset, 'Price history retrieved successfully');
    } catch (err) {
        console.error('❌ /api/history error:', err.message);
        sendError(res, 'Failed to retrieve price history', 500, 'FETCH_HISTORY_ERROR');
    }
});

/**
 * @route   GET /api/stats
 * @desc    Get aggregate pipeline and market statistics
 * @tags    Health
 * @returns {Object} Statistics summary
 */
router.get('/stats', (req, res) => {
    // Check cache first
    const cached = statsCache.get('stats');
    if (cached) {
        console.log('✅ [Cache HIT] /api/stats');
        return sendSuccess(res, cached.data, 'Statistics retrieved', 200, {
            source: 'cache',
            cached: true,
        });
    }

    (async () => {
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

            // Cache the result
            statsCache.set('stats', { data: stats, source: 'database' });

            return sendSuccess(res, stats, 'Statistics retrieved', 200, {
                source: 'database',
            });
        } catch (dbErr) {
            console.warn('⚠️  Database unavailable, using pipeline stats');
            return sendSuccess(res, pipelineStats, 'Statistics retrieved (from pipeline)', 200, {
                source: 'pipeline',
            });
        }
    })();
});

/**
 * @route   GET /api/coin/:id/history
 * @desc    Get price history for a specific coin
 * @param   {string} id - Coin ID (e.g., bitcoin)
 * @query   {number} limit - Max records to return (default: 30, max: 100)
 * @tags    Crypto Data
 * @returns {Object} Historical prices for single coin
 */
router.get('/coin/:id/history', async (req, res) => {
    try {
        const coinId = req.params.id;
        const limitNum = Math.min(parseInt(req.query.limit) || 30, 100);

        const [rows] = await pool.execute(
            `SELECT current_price, price_change_pct_24h, fetched_at
             FROM crypto_prices
             WHERE coin_id = ?
             ORDER BY fetched_at DESC
             LIMIT ?`,
            [coinId, limitNum]
        );

        if (rows.length === 0) {
            return sendError(res, `No data found for coin: ${coinId}`, 404, 'COIN_NOT_FOUND');
        }

        return sendSuccess(res, rows.reverse(), `Price history retrieved for ${coinId}`, 200, {
            coin_id: coinId,
            records: rows.length,
        });
    } catch (err) {
        console.error(`❌ /api/coin/${req.params.id}/history error:`, err.message);
        sendError(res, 'Failed to retrieve coin history', 500, 'FETCH_COIN_ERROR');
    }
});

/**
 * @route   GET /api/health
 * @desc    Server health and database connectivity check
 * @tags    Health
 * @returns {Object} Health status
 */
router.get('/health', async (req, res) => {
    try {
        await pool.execute('SELECT 1');
        return sendSuccess(res, {
            status: 'healthy',
            database: 'connected',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        }, 'Server is healthy');
    } catch (err) {
        return sendError(res, 'Database connection failed', 503, 'DB_CONNECTION_ERROR');
    }
});

// ── CSV EXPORT HELPERS ─────────────────────────────────────────────────────────

/**
 * Generate realistic sample crypto data
 */
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
        const timeOffset = Math.floor(Math.random() * 86400000);
        const timestamp = new Date(now.getTime() - timeOffset).toISOString();
        
        const priceVariation = (Math.random() - 0.5) * 0.2;
        const price = coin.basePrice * (1 + priceVariation);
        const change24h = (Math.random() - 0.5) * 20;
        const volume = Math.floor(Math.random() * 100000000) + 1000000;
        const marketCap = Math.floor(Math.random() * 5000000000) + 100000000;

        data.push({
            coin_id: coin.id,
            coin_name: coin.name,
            symbol: coin.symbol,
            current_price: parseFloat(price.toFixed(2)),
            price_change_pct_24h: parseFloat(change24h.toFixed(2)),
            market_cap: marketCap,
            total_volume: volume,
            fetched_at: timestamp,
        });
    }

    return data;
}

/**
 * Convert data array to RFC 4180 compliant CSV
 */
function arrayToCSV(data) {
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            let value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Process and analyze CSV data
 */
function processCSVData(data) {
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
            };
        }
        coinMap[row.coin_id].prices.push(parseFloat(row.current_price));
        coinMap[row.coin_id].changes.push(parseFloat(row.price_change_pct_24h));
        coinMap[row.coin_id].volumes.push(parseFloat(row.total_volume));
    });

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
        };
    });

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

    const topGainers = [...coinStats].sort((a, b) => parseFloat(b.avg_change_24h) - parseFloat(a.avg_change_24h)).slice(0, 3);
    const topLosers = [...coinStats].sort((a, b) => parseFloat(a.avg_change_24h) - parseFloat(b.avg_change_24h)).slice(0, 3);

    return { coinStats, summaryStats, topGainers, topLosers };
}

/**
 * @route   GET /api/csv/sample
 * @desc    Download sample crypto data as CSV file
 * @query   {number} rows - Number of rows (default: 100, max: 5000)
 * @tags    CSV Export
 * @returns {File} CSV attachment
 */
router.get('/csv/sample', (req, res) => {
    try {
        const rowsCheck = validateCSVRowCount(req.query.rows);
        if (!rowsCheck.valid) {
            logValidationError('csv-rows', rowsCheck.error, req.query);
            return sendValidationError(res, rowsCheck.error);
        }

        const data = generateSampleCryptoData(rowsCheck.rows);
        const csv = arrayToCSV(data);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=crypto-data-${Date.now()}.csv`);
        res.send(csv);

        console.log(`✅ CSV download: ${rowsCheck.rows} rows`);
    } catch (err) {
        console.error('❌ /api/csv/sample error:', err.message);
        sendError(res, 'Failed to generate CSV', 500, 'CSV_GENERATION_ERROR');
    }
});

/**
 * @route   GET /api/csv/demo
 * @desc    Get demo crypto data with analytics
 * @tags    CSV Export
 * @returns {Object} Raw data + processed analytics
 */
router.get('/csv/demo', (req, res) => {
    try {
        const rawData = generateSampleCryptoData(150);
        const { coinStats, summaryStats, topGainers, topLosers } = processCSVData(rawData);

        return sendSuccess(res, {
            raw_records: rawData.length,
            data: rawData,
            analytics: {
                coin_stats: coinStats,
                summary: summaryStats,
                top_gainers: topGainers,
                top_losers: topLosers,
            },
        }, 'Demo data with analytics retrieved', 200, {
            source: 'generated',
            recordsCount: rawData.length,
        });
    } catch (err) {
        console.error('❌ /api/csv/demo error:', err.message);
        sendError(res, 'Failed to generate demo data', 500, 'DEMO_GENERATION_ERROR');
    }
});

// ── EXPORTS FOR PIPELINE UPDATES ───────────────────────────────────────────────

function updateCoinsCache(coins) {
    latestCoinsCache = Array.isArray(coins) ? coins : Object.values(coins || {});
    pipelineStats.lastUpdate = new Date().toISOString();
    pipelineStats.totalUpdates += 1;
    latestCache.clear(); // Invalidate cache
}

function updateStats(stats) {
    Object.assign(pipelineStats, stats);
    statsCache.clear(); // Invalidate cache
}

module.exports = router;
module.exports.updateCoinsCache = updateCoinsCache;
module.exports.updateStats = updateStats;
