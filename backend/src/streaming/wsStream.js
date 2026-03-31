// src/streaming/wsStream.js
// ─────────────────────────────────────────────────────────────────────────────
// WEBSOCKET STREAMING OUTPUT
//
// Responsibility: Broadcast processed coin data to all connected Socket.io
// clients in real time.
//
// Design choices:
//   • io.emit() broadcasts to ALL connected clients simultaneously (O(n) with 
//     Socket.io's internal event loop — very fast for small client counts).
//   • We emit on the 'crypto:update' event channel so the frontend can listen
//     to a specific, named event.
//   • We also attach a server timestamp so the frontend can show "last updated".
//   • The io instance is passed in at initialization (dependency injection),
//     keeping this module decoupled from server setup.
// ─────────────────────────────────────────────────────────────────────────────

let _io = null;

/**
 * Initialize the WebSocket stream with a Socket.io server instance.
 * Must be called before streamToWS().
 *
 * @param {import('socket.io').Server} io
 */
function initWsStream(io) {
    _io = io;
    console.log('🔌 WebSocket Stream initialized');
}

/**
 * Broadcast processed coin data to all connected WebSocket clients.
 *
 * @param {Array} coins - Array of clean coin objects from dataProcessor
 */
function streamToWS(coins) {
    if (!_io) {
        console.warn('⚠️  [WS Stream] Socket.io not initialized yet');
        return;
    }
    if (!coins || coins.length === 0) return;

    const payload = {
        timestamp: new Date().toISOString(),  // Server-side timestamp
        count: coins.length,
        data: coins,
    };

    _io.emit('crypto:update', payload);
    console.log(`📡 [WS Stream] Broadcasted ${coins.length} coins to ${_io.engine.clientsCount} client(s)`);
}

module.exports = { initWsStream, streamToWS };
