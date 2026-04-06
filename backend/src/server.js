// src/server.js
// ─────────────────────────────────────────────────────────────────────────────
// MAIN APPLICATION ENTRY POINT
//
// Startup sequence:
//   1. Load env vars
//   2. Create Express app + HTTP server
//   3. Initialize Socket.io on top of HTTP server
//   4. Register middleware (CORS, JSON parsing)
//   5. Mount REST API routes
//   6. Initialize DB (create DB + table if missing)
//   7. Wire Socket.io into wsStream (so it can broadcast)
//   8. Start the dual streaming pipeline
//   9. Listen on PORT
//
// Graceful shutdown: catches SIGTERM/SIGINT to stop the pipeline cleanly.
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { initDB } = require('./config/db');
const { initWsStream } = require('./streaming/wsStream');
const { startPipeline, stopPipeline } = require('./pipeline/pipeline');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

// ── New middleware imports ────────────────────────────────────────────────────
const { requestLogger, RateLimiter, errorHandler, CacheStore } = require('./middleware');
const { sendSuccess, sendError } = require('./utils/response');

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── 1. Express App ────────────────────────────────────────────────────────────
const app = express();

// ── 2. HTTP Server (needed for Socket.io to share the same port) ──────────────
const httpServer = http.createServer(app);

// ── 3. Socket.io Server ───────────────────────────────────────────────────────
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
    pingTimeout: 30000,
    pingInterval: 10000,
});

// ── 4. Middleware Stack ───────────────────────────────────────────────────────
// CORS Configuration
app.use(cors({ 
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 3600,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Request logging
app.use(requestLogger);

// Rate limiting (100 requests per minute per IP)
const rateLimiter = new RateLimiter(60000, 100);
app.use('/api', rateLimiter.middleware());

// ── 5. REST Routes ────────────────────────────────────────────────────────────
// Authentication routes (no rate limiting)
app.use('/auth', authRoutes);

// API routes (with rate limiting)
app.use('/api', apiRoutes);

// Root ping
app.get('/', (_req, res) => {
    sendSuccess(res, {
        project: 'Dual Streaming Pipeline',
        status: 'running',
        version: '2.0.0',
        features: [
            'Real-time WebSocket streaming',
            'REST API with validation',
            'CSV data export',
            'Rate limiting & caching',
            'Request logging',
        ],
        endpoints: {
            health: '/api/health',
            latest: '/api/latest',
            history: '/api/history',
            stats: '/api/stats',
            csvSample: '/api/csv/sample',
            csvDemo: '/api/csv/demo',
            docs: '/api-docs',
        },
        websocket: `ws://localhost:${PORT}  → event: crypto:update`,
    }, 'Server is running');
});

// Health status with detailed info
app.get('/health', (_req, res) => {
    sendSuccess(res, {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
    }, 'Server is healthy');
});

// ── 6. Error Handling Middleware (must be last) ──────────────────────────────
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    sendError(res, `Route not found: ${req.method} ${req.path}`, 404, 'NOT_FOUND');
});

// ── 7. Socket.io Connection Events ───────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`🔌 [WS] Client connected    — id: ${socket.id}  total: ${io.engine.clientsCount}`);

    // Emit a welcome ping so the client knows it's live
    socket.emit('connected', {
        message: '✅ Connected to Dual Streaming Pipeline',
        server_time: new Date().toISOString(),
    });

    socket.on('disconnect', (reason) => {
        console.log(`🔌 [WS] Client disconnected — id: ${socket.id}  reason: ${reason}  remaining: ${io.engine.clientsCount}`);
    });
});

// ── 7. Bootstrap: DB → WsStream → Pipeline ────────────────────────────────────
async function bootstrap() {
    try {
        // Step A: Initialize database (optional - continue if fails)
        try {
            await initDB();
            console.log('✅ Database successfully initialized');
        } catch (dbErr) {
            console.warn('⚠️  Database unavailable:', dbErr.message);
            console.warn('⚠️  Running in demo mode (no DB streaming, CSV endpoints work)');
        }

        // Step B: Wire Socket.io into the WebSocket stream module
        initWsStream(io, apiRoutes.updateCoinsCache);

        // Step C: Start the dual streaming pipeline
        startPipeline();

        // Step D: Start listening
        httpServer.listen(PORT, () => {
            console.log('');
            console.log('╔══════════════════════════════════════════════════════╗');
            console.log('║     🚀  Dual Streaming Pipeline — RUNNING            ║');
            console.log(`║     HTTP  →  http://localhost:${PORT}                  ║`);
            console.log(`║     WS    →  ws://localhost:${PORT}                    ║`);
            console.log('╚══════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (err) {
        console.error('❌ Bootstrap failed:', err.message);
        process.exit(1);
    }
}

bootstrap();

// ── 8. Graceful Shutdown ──────────────────────────────────────────────────────
function shutdown(signal) {
    console.log(`\n⚠️  Received ${signal} — shutting down gracefully...`);
    stopPipeline();
    httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
