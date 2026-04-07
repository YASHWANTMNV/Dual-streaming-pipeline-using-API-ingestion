// src/middleware/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Custom Middleware Stack
// Provides request validation, rate limiting, logging, and caching.
// ─────────────────────────────────────────────────────────────────────────────

const { sendValidationError, sendError } = require('../utils/response');

// ── REQUEST VALIDATION MIDDLEWARE ────────────────────────────────────────────
/**
 * Validate query parameters match expected types and ranges
 * @param {Object} rules - Validation rules { param: { type, min, max, required } }
 */
function validateQuery(rules) {
    return (req, res, next) => {
        const errors = [];

        for (const [param, rule] of Object.entries(rules)) {
            const value = req.query[param];

            // Check required
            if (rule.required && !value) {
                errors.push(`Missing required parameter: ${param}`);
                continue;
            }

            if (!value) continue; // Optional param not provided, skip

            // Type validation
            if (rule.type === 'integer') {
                if (!/^\d+$/.test(value)) {
                    errors.push(`${param} must be an integer`);
                }
                const num = parseInt(value);
                if (rule.min !== undefined && num < rule.min) {
                    errors.push(`${param} must be >= ${rule.min}`);
                }
                if (rule.max !== undefined && num > rule.max) {
                    errors.push(`${param} must be <= ${rule.max}`);
                }
            }

            if (rule.type === 'string') {
                if (rule.pattern && !rule.pattern.test(value)) {
                    errors.push(`${param} format is invalid`);
                }
                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push(`${param} max length is ${rule.maxLength}`);
                }
            }
        }

        if (errors.length > 0) {
            return sendValidationError(res, errors);
        }

        next();
    };
}

// ── RATE LIMITING MIDDLEWARE ────────────────────────────────────────────────
class RateLimiter {
    constructor(windowMs = 60000, maxRequests = 100) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
        this.clients = new Map();
        this.cleanup();
    }

    middleware() {
        return (req, res, next) => {
            const clientId = req.ip || req.connection.remoteAddress;
            const now = Date.now();

            if (!this.clients.has(clientId)) {
                this.clients.set(clientId, []);
            }

            const requests = this.clients.get(clientId);
            const recentRequests = requests.filter(time => now - time < this.windowMs);

            if (recentRequests.length >= this.maxRequests) {
                const retryAfter = Math.ceil((recentRequests[0] + this.windowMs - now) / 1000);
                res.set('Retry-After', retryAfter);
                return sendError(
                    res,
                    `Rate limit exceeded. Retry after ${retryAfter}s`,
                    429,
                    'RATE_LIMIT_EXCEEDED'
                );
            }

            recentRequests.push(now);
            this.clients.set(clientId, recentRequests);

            // Add rate limit headers
            res.set('X-RateLimit-Limit', this.maxRequests);
            res.set('X-RateLimit-Remaining', this.maxRequests - recentRequests.length);
            res.set('X-RateLimit-Reset', new Date(recentRequests[0] + this.windowMs).toISOString());

            next();
        };
    }

    cleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [clientId, requests] of this.clients.entries()) {
                const active = requests.filter(time => now - time < this.windowMs);
                if (active.length === 0) {
                    this.clients.delete(clientId);
                } else {
                    this.clients.set(clientId, active);
                }
            }
        }, this.windowMs);
    }
}

// ── REQUEST LOGGING MIDDLEWARE ──────────────────────────────────────────────
function requestLogger(req, res, next) {
    const startTime = Date.now();
    const method = req.method;
    const path = req.path;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Override res.json to log response
    const originalJson = res.json;
    res.json = function (data) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const status = statusCode >= 400 ? 'FAIL' : 'OK';

        console.log(
            `[${status}] [${duration}ms] ${method} ${path} ${statusCode} | IP: ${clientIp}`
        );

        // Log errors in detail
        if (statusCode >= 400 && data.error) {
            console.error(`   Error: ${data.error}`);
        }

        return originalJson.call(this, data);
    };

    next();
}

// ── CACHE MIDDLEWARE ────────────────────────────────────────────────────────
class CacheStore {
    constructor(ttlMs = 60000) {
        this.ttlMs = ttlMs;
        this.cache = new Map();
    }

    middleware(keyFn) {
        return (req, res, next) => {
            const key = typeof keyFn === 'function' ? keyFn(req) : keyFn;
            const cached = this.cache.get(key);

            if (cached && cached.expiry > Date.now()) {
                res.set('X-Cache', 'HIT');
                return res.json(cached.data);
            }

            // Override res.json to cache response
            const originalJson = res.json;
            res.json = function (data) {
                if (res.statusCode === 200) {
                    this.cache.set(key, {
                        data,
                        expiry: Date.now() + this.ttlMs,
                    });
                    res.set('X-Cache', 'MISS');
                }
                return originalJson.call(this, data);
            }.bind(this);

            next();
        };
    }

    set(key, value) {
        this.cache.set(key, {
            data: value,
            expiry: Date.now() + this.ttlMs,
        });
    }

    get(key) {
        const cached = this.cache.get(key);
        if (cached && cached.expiry > Date.now()) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }

    clear() {
        this.cache.clear();
    }
}

// ── ERROR HANDLING MIDDLEWARE ───────────────────────────────────────────────
function errorHandler(err, req, res, next) {
    console.error('🔥 Unhandled Error:', err.message);

    // Validation errors
    if (err.name === 'ValidationError') {
        return sendError(res, err.message, 400, 'VALIDATION_ERROR');
    }

    // Database errors
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return sendError(res, 'Referenced record not found', 404, 'NOT_FOUND');
    }

    if (err.code === 'ER_DUP_ENTRY') {
        return sendError(res, 'Duplicate entry', 409, 'CONFLICT');
    }

    // Default error
    sendError(res, 'Internal server error', 500, 'INTERNAL_ERROR');
}

module.exports = {
    validateQuery,
    RateLimiter,
    requestLogger,
    CacheStore,
    errorHandler,
};
