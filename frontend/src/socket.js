// src/socket.js
// ─────────────────────────────────────────────────────────────────────────────
// Socket.io CLIENT — Singleton
//
// Why singleton? We create the socket ONCE and export it. If every component
// created its own socket, we'd have multiple connections to the server.
// ─────────────────────────────────────────────────────────────────────────────

import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const socket = io(BACKEND_URL, {
    autoConnect: true,          // Connect immediately on import
    reconnection: true,         // Auto-reconnect on disconnect
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,    // Wait 2s before each retry
    transports: ['websocket'],  // Force WebSocket (skip long-polling)
});

export default socket;
