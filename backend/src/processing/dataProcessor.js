// src/processing/dataProcessor.js
// ─────────────────────────────────────────────────────────────────────────────
// DATA PREPARATION LAYER
//
// Responsibility: Clean and transform raw API data before it reaches the
// database or WebSocket clients.
//
// Steps performed on each coin record:
//   1. NULL HANDLING  — Replace null/undefined fields with safe defaults
//   2. FORMATTING     — Round floats, format large numbers, standardize strings
//   3. FIELD MAPPING  — Rename API fields to our internal schema
//   4. TYPE COERCION  — Ensure correct JS types (Number, String, Date)
//   5. ENRICHMENT     — Add a computed `trend` field (up/down/neutral)
//
// Why lightweight? This is a streaming pipeline — heavy analytics would cause
// back-pressure and latency. We only do what's needed for clean storage + display.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Safely parse a float, returning a fallback if the value is null/undefined/NaN.
 */
function safeFloat(val, decimals = 8, fallback = 0) {
    const num = parseFloat(val);
    if (isNaN(num)) return fallback;
    return parseFloat(num.toFixed(decimals));
}

/**
 * Safely parse an integer, returning a fallback if not a valid number.
 */
function safeInt(val, fallback = 0) {
    const num = parseInt(val);
    return isNaN(num) ? fallback : num;
}

/**
 * Safely get a string value, trimming whitespace and falling back gracefully.
 */
function safeString(val, fallback = 'unknown') {
    if (val === null || val === undefined) return fallback;
    return String(val).trim() || fallback;
}

/**
 * Determine market trend from 24h price change percentage.
 * Used as a computed/enriched field for the frontend.
 */
function getTrend(changePct) {
    if (changePct > 0.5) return 'up';
    if (changePct < -0.5) return 'down';
    return 'neutral';
}

/**
 * Transform a single raw CoinGecko coin object into our clean schema.
 *
 * Raw API field        → Our field
 * ─────────────────────────────────
 * id                   → coin_id
 * name                 → coin_name
 * symbol               → symbol (uppercased)
 * current_price        → current_price (float, 8 decimals)
 * market_cap           → market_cap (int)
 * total_volume         → total_volume (int)
 * price_change_24h     → price_change_24h (float, 4 decimals)
 * price_change_%_24h   → price_change_pct_24h (float, 4 decimals)
 * high_24h             → high_24h (float, 8 decimals)
 * low_24h              → low_24h (float, 8 decimals)
 * last_updated         → fetched_at (ISO DateTime string)
 */
function transformCoin(raw) {
    return {
        coin_id: safeString(raw.id),
        coin_name: safeString(raw.name),
        symbol: safeString(raw.symbol, 'N/A').toUpperCase(),
        current_price: safeFloat(raw.current_price, 8),
        market_cap: safeInt(raw.market_cap),
        total_volume: safeInt(raw.total_volume),
        price_change_24h: safeFloat(raw.price_change_24h, 4),
        price_change_pct_24h: safeFloat(raw.price_change_percentage_24h, 4),
        high_24h: safeFloat(raw.high_24h, 8),
        low_24h: safeFloat(raw.low_24h, 8),
        fetched_at: raw.last_updated
            ? new Date(raw.last_updated).toISOString().slice(0, 19).replace('T', ' ')
            : new Date().toISOString().slice(0, 19).replace('T', ' '),
        // Enriched / computed fields (not stored in DB, used on frontend)
        trend: getTrend(safeFloat(raw.price_change_percentage_24h, 4)),
        image: safeString(raw.image, ''),
        market_cap_rank: safeInt(raw.market_cap_rank, 0),
    };
}

/**
 * Process an array of raw coin objects from the API.
 * Filters out any records missing critical fields (coin_id, current_price).
 *
 * @param  {Array}  rawList  - Raw array from CoinGecko API
 * @returns {Array}           - Array of clean, transformed coin objects
 */
function processData(rawList) {
    if (!Array.isArray(rawList) || rawList.length === 0) {
        console.warn('⚠️  Processor received empty or invalid data');
        return [];
    }

    const cleaned = rawList
        .filter(coin => coin && coin.id && coin.current_price != null)  // NULL HANDLING
        .map(transformCoin);                                             // TRANSFORM

    console.log(`⚙️  Processed ${cleaned.length}/${rawList.length} records`);
    return cleaned;
}

module.exports = { processData };
