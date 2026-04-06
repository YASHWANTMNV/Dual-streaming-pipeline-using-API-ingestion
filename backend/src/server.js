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
    // Increase ping timeout for slow networks
    pingTimeout: 30000,
    pingInterval: 10000,
});

// ── 4. Middleware ─────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logger (simple, inline)
app.use((req, _res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
});

// ── 5. REST Routes ────────────────────────────────────────────────────────────
app.use('/api', apiRoutes);

// Root ping
app.get('/', (_req, res) => {
    res.json({
        project: 'Dual Streaming Pipeline',
        status: 'running',
        endpoints: ['/api/health', '/api/latest', '/api/history', '/api/stats'],
        websocket: `ws://localhost:${PORT}  → event: crypto:update`,
    });
});

// ── 6. Socket.io Connection Events ───────────────────────────────────────────
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
