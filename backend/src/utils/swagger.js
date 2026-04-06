// src/utils/swagger.js
// ─────────────────────────────────────────────────────────────────────────────
// Swagger/OpenAPI Documentation
// Auto-generated API documentation served at /api-docs
// ─────────────────────────────────────────────────────────────────────────────

const swaggerjsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Dual Streaming Pipeline API',
            version: '1.0.0',
            description: 'Real-time cryptocurrency data streaming API with REST endpoints and WebSocket updates',
            contact: {
                name: 'Development Team',
                url: 'https://github.com/yourusername/dual-streaming',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
            {
                url: 'https://api.example.com',
                description: 'Production server',
            },
        ],
        components: {
            schemas: {
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        status: { type: 'string', example: 'success' },
                        statusCode: { type: 'integer', example: 200 },
                        message: { type: 'string', example: 'Success' },
                        timestamp: { type: 'string', format: 'date-time' },
                        data: { type: 'object' },
                    },
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        status: { type: 'string', example: 'error' },
                        statusCode: { type: 'integer', example: 500 },
                        code: { type: 'string', example: 'INTERNAL_ERROR' },
                        message: { type: 'string', example: 'Internal server error' },
                        timestamp: { type: 'string', format: 'date-time' },
                    },
                },
                CoinData: {
                    type: 'object',
                    properties: {
                        coin_id: { type: 'string', example: 'bitcoin' },
                        coin_name: { type: 'string', example: 'Bitcoin' },
                        symbol: { type: 'string', example: 'BTC' },
                        current_price: { type: 'number', example: 45000.50 },
                        market_cap: { type: 'number', example: 900000000000 },
                        total_volume: { type: 'number', example: 50000000000 },
                        price_change_pct_24h: { type: 'number', example: 2.5 },
                        high_24h: { type: 'number', example: 46000 },
                        low_24h: { type: 'number', example: 44000 },
                        fetched_at: { type: 'string', format: 'date-time' },
                    },
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        total: { type: 'integer', example: 1000 },
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 50 },
                        offset: { type: 'integer', example: 0 },
                        totalPages: { type: 'integer', example: 20 },
                        hasNext: { type: 'boolean', example: true },
                        hasPrev: { type: 'boolean', example: false },
                    },
                },
            },
        },
        tags: [
            { name: 'Crypto Data', description: 'Latest and historical crypto prices' },
            { name: 'CSV Export', description: 'Download and analyze crypto data' },
            { name: 'Health', description: 'Server health and stats' },
        ],
    },
    apis: ['./src/routes/*.js'],
};

const specs = swaggerjsdoc(options);

module.exports = specs;
