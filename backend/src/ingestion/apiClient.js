// src/ingestion/apiClient.js
// ─────────────────────────────────────────────────────────────────────────────
// API INGESTION LAYER
//
// Responsibility: Continuously fetch live cryptocurrency market data from the
// free CoinGecko public API (no API key required).
//
// How it works:
//   • On start, fetch() is called immediately, then at every POLL_INTERVAL_MS.
//   • Each successful fetch invokes the registered onData callback with raw data.
//   • Errors are caught and logged without crashing the pipeline.
//
// Why polling? CoinGecko doesn't offer WebSocket; polling every 5s simulates
// a real-time stream while staying within the free-tier rate limit (30 req/min).
// ─────────────────────────────────────────────────────────────────────────────

const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS) || 5000;

// Coins we want to track — top 10 by market cap
const COINS = [
    'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana',
    'ripple', 'usd-coin', 'staked-ether', 'dogecoin', 'cardano'
];

class ApiClient {
    constructor() {
        this._timer = null;
        this._callbacks = [];   // Supports multiple listeners
        this._isRunning = false;
        this._isFetching = false;  // Prevent concurrent requests
    }

    /**
     * Register a callback to receive raw data on every successful fetch.
     * @param {Function} fn  - Receives array of raw coin objects
     */
    onData(fn) {
        this._callbacks.push(fn);
        return this; // Chainable
    }

    /**
     * Perform a single fetch to CoinGecko /coins/markets endpoint.
     * Returns an array of raw coin data objects.
     */
    async _fetch() {
        // Prevent concurrent requests
        if (this._isFetching) {
            return;
        }

        this._isFetching = true;
        try {
            const response = await axios.get(`${BASE_URL}/coins/markets`, {
                params: {
                    vs_currency: 'usd',
                    ids: COINS.join(','),
                    order: 'market_cap_desc',
                    per_page: 10,
                    page: 1,
                    sparkline: false,
                    price_change_percentage: '24h',
                },
                timeout: 8000,  // Abort if no response within 8 seconds
            });

            const rawData = response.data;
            console.log(`[API_FETCH] Fetched ${rawData.length} coins from CoinGecko at ${new Date().toISOString()}`);

            // Notify all registered listeners with raw data
            this._callbacks.forEach(fn => fn(rawData));
            return rawData;
        } catch (err) {
            // Log the error but don't crash — the next poll will retry
            if (err.response) {
                console.error(`[API_ERROR] ${err.response.status}: ${err.response.statusText}`);
                if (err.response.status === 429) {
                    console.warn('[RATE_LIMIT] Rate limited by CoinGecko. Increasing poll interval to 60s...');
                    // Temporarily increase poll interval on 429
                    this.stop();
                    this._timer = setInterval(() => this._fetch(), 60000);
                }
            } else if (err.code === 'ECONNABORTED') {
                console.error('[API_ERROR] Request timed out');
            } else {
                console.error('[API_ERROR] Network error:', err.message);
            }
        } finally {
            this._isFetching = false;
        }
    }

    /**
     * Start the polling loop.
     * Fetches immediately on call, then every POLL_INTERVAL milliseconds.
     */
    start() {
        if (this._isRunning) return;
        this._isRunning = true;
        console.log(`[API_CLIENT] Ingestion started - polling every ${POLL_INTERVAL / 1000}s`);

        // Immediate first fetch
        this._fetch();

        // Then schedule recurring fetches
        this._timer = setInterval(() => this._fetch(), POLL_INTERVAL);
    }

    /**
     * Stop the polling loop gracefully.
     */
    stop() {
        if (this._timer) {
            clearInterval(this._timer);
            this._timer = null;
            this._isRunning = false;
            console.log('[API_CLIENT] Ingestion stopped');
        }
    }
}

module.exports = new ApiClient(); // Export a singleton
